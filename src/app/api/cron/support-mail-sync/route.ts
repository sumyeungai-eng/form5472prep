import { NextResponse } from "next/server";
import { recentSince, runSupportMailSync } from "@/lib/supportMail/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Hourly (vercel.json): read the last few days of the support@ mailbox and
// attach email answers / follow-ups to /admin/questions. Hourly, not more
// often: every run wakes the scale-to-zero database. The admin page has a
// "Check mailbox now" button for anything more urgent.
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await runSupportMailSync("cron", recentSince());
  return NextResponse.json(result, { status: result.configured && !result.ok ? 500 : 200 });
}

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}
