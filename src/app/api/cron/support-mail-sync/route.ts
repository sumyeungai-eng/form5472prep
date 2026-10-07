import { NextResponse } from "next/server";
import { runSupportMailSyncIfNewMail } from "@/lib/supportMail/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Every 10 minutes (vercel.json): if the support@ mailbox has new mail, read
// the last few days and attach email answers / customer follow-ups to
// /admin/questions. A quiet mailbox is checked over IMAP only, without waking
// the scale-to-zero database. Opening the Questions pages also triggers a check.
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await runSupportMailSyncIfNewMail();
  return NextResponse.json(result, { status: result.configured && !result.ok ? 500 : 200 });
}

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}
