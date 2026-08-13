import { NextRequest, NextResponse } from "next/server";
import {
  GUESTBOOK_PAGE_SIZE,
  isGuestbookRateLimited,
  validateGuestbookSubmission,
  verifyTurnstileToken,
} from "@/lib/guestbook";
import {
  getClientIp,
  getGuestbookD1,
  getGuestbookEnv,
  hashGuestbookVisitor,
  logGuestbookEvent,
  publicGuestbookId,
} from "@/lib/guestbook-server";

const MAX_REQUEST_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

type GuestbookRow = {
  id: number;
  name: string;
  message: string;
  url: string | null;
  created_at: number;
};

type Cursor = { createdAt: number; id: number };

function encodeCursor(cursor: Cursor) {
  return btoa(`${cursor.createdAt}:${cursor.id}`)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function decodeCursor(value: string | null): Cursor | null {
  if (!value || !/^[a-zA-Z0-9_-]{4,80}$/u.test(value)) return null;
  try {
    const decoded = atob(value.replaceAll("-", "+").replaceAll("_", "/"));
    const match = decoded.match(/^(\d+):(\d+)$/u);
    if (!match) return null;
    const createdAt = Number(match[1]);
    const id = Number(match[2]);
    return Number.isSafeInteger(createdAt) && Number.isSafeInteger(id) ? { createdAt, id } : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getGuestbookD1();
    const cursor = decodeCursor(request.nextUrl.searchParams.get("cursor"));
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit"));
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), GUESTBOOK_PAGE_SIZE)
      : GUESTBOOK_PAGE_SIZE;

    const statement = cursor
      ? db.prepare(`SELECT id, name, message, url, created_at
          FROM guestbook_entries
          WHERE status = 'approved'
            AND (created_at < ? OR (created_at = ? AND id < ?))
          ORDER BY created_at DESC, id DESC
          LIMIT ?`).bind(cursor.createdAt, cursor.createdAt, cursor.id, limit + 1)
      : db.prepare(`SELECT id, name, message, url, created_at
          FROM guestbook_entries
          WHERE status = 'approved'
          ORDER BY created_at DESC, id DESC
          LIMIT ?`).bind(limit + 1);

    const result = await statement.all<GuestbookRow>();
    const rows = result.results ?? [];
    const hasMore = rows.length > limit;
    const visibleRows = rows.slice(0, limit);
    const last = visibleRows.at(-1);

    return NextResponse.json({
      entries: visibleRows.map((entry: GuestbookRow) => ({
        publicId: publicGuestbookId(entry.id),
        name: entry.name,
        message: entry.message,
        url: entry.url,
        createdAt: new Date(entry.created_at).toISOString(),
      })),
      nextCursor: hasMore && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
    }, {
      headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "The guestbook is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BYTES) {
    logGuestbookEvent("guestbook_submission_rejected", { reason: "payload_too_large" });
    return NextResponse.json({ error: "That trace is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) throw new Error("payload_too_large");
    body = JSON.parse(raw);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "payload_too_large";
    return NextResponse.json(
      { error: tooLarge ? "That trace is too large." : "Invalid guestbook request." },
      { status: tooLarge ? 413 : 400 },
    );
  }

  const validation = validateGuestbookSubmission(body);
  if (!validation.ok) {
    logGuestbookEvent("guestbook_submission_rejected", { reason: "validation" });
    return NextResponse.json({ error: validation.error, fields: validation.fields }, { status: 400 });
  }

  if (validation.value.company) {
    logGuestbookEvent("guestbook_submission_rejected", { reason: "honeypot" });
    return NextResponse.json({ status: "pending" }, { status: 202 });
  }

  const env = await getGuestbookEnv();
  if (!env.TURNSTILE_SECRET_KEY || !env.GUESTBOOK_HASH_SECRET) {
    return NextResponse.json({ error: "Guestbook protection is not configured." }, { status: 503 });
  }

  const clientIp = getClientIp(request);
  const turnstileValid = await verifyTurnstileToken(
    validation.value.turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    clientIp === "unknown" ? undefined : clientIp,
  );
  if (!turnstileValid) {
    logGuestbookEvent("guestbook_submission_rejected", { reason: "turnstile" });
    return NextResponse.json({ error: "Please complete the verification and try again." }, { status: 400 });
  }

  try {
    const db = await getGuestbookD1();
    const ipHash = await hashGuestbookVisitor(clientIp, env.GUESTBOOK_HASH_SECRET);
    const userAgentHash = await hashGuestbookVisitor(
      request.headers.get("user-agent") ?? "unknown",
      env.GUESTBOOK_HASH_SECRET,
    );
    const since = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recent = await db.prepare(
      "SELECT COUNT(*) AS total FROM guestbook_entries WHERE ip_hash = ? AND created_at >= ?",
    ).bind(ipHash, since).first<{ total: number }>();

    if (isGuestbookRateLimited(Number(recent?.total ?? 0))) {
      logGuestbookEvent("guestbook_rate_limited");
      return NextResponse.json({ error: "Too many traces from this connection. Try again later." }, { status: 429 });
    }

    await db.prepare(`INSERT INTO guestbook_entries
      (name, message, url, status, created_at, ip_hash, user_agent_hash)
      VALUES (?, ?, ?, 'pending', ?, ?, ?)`)
      .bind(
        validation.value.name,
        validation.value.message,
        validation.value.url,
        Date.now(),
        ipHash,
        userAgentHash,
      )
      .run();

    logGuestbookEvent("guestbook_submission_created");
    return NextResponse.json({ status: "pending" }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Your trace didn't make it into the log." }, { status: 503 });
  }
}
