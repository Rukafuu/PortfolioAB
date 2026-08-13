import { NextRequest, NextResponse } from "next/server";
import { GuestbookStatus } from "@/lib/guestbook";
import { getGuestbookAdmin, getGuestbookD1, publicGuestbookId } from "@/lib/guestbook-server";

type AdminRow = {
  id: number;
  name: string;
  message: string;
  url: string | null;
  status: GuestbookStatus;
  created_at: number;
};

const STATUSES = new Set<GuestbookStatus>(["pending", "approved", "rejected"]);

export async function GET(request: NextRequest) {
  const admin = await getGuestbookAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Unauthorized." }, { status: admin.status });

  const requested = request.nextUrl.searchParams.get("status") ?? "pending";
  const status = STATUSES.has(requested as GuestbookStatus) ? requested as GuestbookStatus : "pending";
  const db = await getGuestbookD1();
  const result = await db.prepare(`SELECT id, name, message, url, status, created_at
    FROM guestbook_entries WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT 100`)
    .bind(status)
    .all<AdminRow>();

  return NextResponse.json({
    entries: (result.results ?? []).map((entry: AdminRow) => ({
      id: entry.id,
      publicId: publicGuestbookId(entry.id),
      name: entry.name,
      message: entry.message,
      url: entry.url,
      status: entry.status,
      createdAt: new Date(entry.created_at).toISOString(),
    })),
  }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
