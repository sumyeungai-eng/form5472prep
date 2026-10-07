import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { FULL_SYNC_SINCE, recentSince, runSupportMailSync } from "@/lib/supportMail/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Admin "Check mailbox now" (last 7 days) and "Import past emails" (full:
// everything since the question box launched). Safe to repeat: imports are
// keyed by Message-ID.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { full?: unknown } | null;
  const full = body?.full === true;
  const result = await runSupportMailSync(full ? "admin-full" : "admin", full ? FULL_SYNC_SINCE : recentSince());
  if (!result.configured) {
    return NextResponse.json(
      { error: "The support@ mailbox is not connected yet. Add SUPPORT_IMAP_PASSWORD in Vercel, then redeploy." },
      { status: 409 },
    );
  }
  if (!result.ok) return NextResponse.json({ error: `Mailbox check failed: ${result.error}` }, { status: 502 });
  return NextResponse.json(result);
}
