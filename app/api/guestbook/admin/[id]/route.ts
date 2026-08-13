import { NextRequest, NextResponse } from "next/server";
import { GuestbookStatus } from "@/lib/guestbook";
import { getGuestbookAdmin, getGuestbookD1, logGuestbookEvent } from "@/lib/guestbook-server";

type RouteContext = { params: Promise<{ id: string }> };
const MODERATION_STATUSES = new Set<GuestbookStatus>(["approved", "rejected"]);

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getGuestbookAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Unauthorized." }, { status: admin.status });

  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid entry." }, { status: 400 });

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.status !== "string" || !MODERATION_STATUSES.has(body.status as GuestbookStatus)) {
    return NextResponse.json({ error: "Status must be approved or rejected." }, { status: 400 });
  }

  const db = await getGuestbookD1();
  const result = await db.prepare("UPDATE guestbook_entries SET status = ? WHERE id = ?")
    .bind(body.status, id)
    .run();
  if (!result.meta.changes) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

  logGuestbookEvent(body.status === "approved" ? "guestbook_submission_approved" : "guestbook_submission_rejected", { id });
  return NextResponse.json({ id, status: body.status }, {
    headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const admin = await getGuestbookAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Unauthorized." }, { status: admin.status });

  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid entry." }, { status: 400 });

  const db = await getGuestbookD1();
  const result = await db.prepare("DELETE FROM guestbook_entries WHERE id = ?").bind(id).run();
  if (!result.meta.changes) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

  logGuestbookEvent("guestbook_submission_deleted", { id });
  return NextResponse.json({ id, deleted: true }, {
    headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
