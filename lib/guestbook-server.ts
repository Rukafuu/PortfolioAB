import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getD1 } from "@/db";

export type GuestbookRuntimeEnv = {
  DB?: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  GUESTBOOK_HASH_SECRET?: string;
  GUESTBOOK_ADMIN_EMAIL?: string;
  ENVIRONMENT?: string;
};

export async function getGuestbookEnv(): Promise<GuestbookRuntimeEnv> {
  const runtime = await import("cloudflare:workers");
  return runtime.env as unknown as GuestbookRuntimeEnv;
}

export async function ensureGuestbookStorage(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS guestbook_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      url TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at INTEGER NOT NULL,
      ip_hash TEXT NOT NULL,
      user_agent_hash TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS guestbook_entries_status_created_idx ON guestbook_entries(status, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS guestbook_entries_ip_created_idx ON guestbook_entries(ip_hash, created_at)"),
  ]);
}

export async function getGuestbookD1() {
  const db = await getD1();
  await ensureGuestbookStorage(db);
  return db;
}

export function getClientIp(request: Request) {
  return request.headers.get("cf-connecting-ip")?.trim() || "unknown";
}

export async function hashGuestbookVisitor(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function guestbookAdminEmails(env: GuestbookRuntimeEnv) {
  return (env.GUESTBOOK_ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isGuestbookAdminEmail(email: string, env: GuestbookRuntimeEnv) {
  return guestbookAdminEmails(env).includes(email.toLowerCase());
}

export async function getGuestbookAdmin() {
  const [user, env] = await Promise.all([getChatGPTUser(), getGuestbookEnv()]);
  if (!user) return { ok: false as const, status: 401, env };
  if (!isGuestbookAdminEmail(user.email, env)) return { ok: false as const, status: 403, env };
  return { ok: true as const, user, env };
}

export function publicGuestbookId(id: number) {
  return `visitor_${String(id).padStart(4, "0")}`;
}

export function logGuestbookEvent(event: string, details: Record<string, string | number | boolean> = {}) {
  console.info(JSON.stringify({ event, ...details }));
}
