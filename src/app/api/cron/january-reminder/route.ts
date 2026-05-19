import { NextResponse } from "next/server";
import { runCampaign } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — enough for hundreds of sends

// Triggered by Vercel Cron once a year in early January.
// Vercel Cron requests include `Authorization: Bearer <CRON_SECRET>` when
// CRON_SECRET is set in the project env — verify it.
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runCampaign({ campaign: "january" });
  return NextResponse.json(result);
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Dev fallback: when CRON_SECRET isn't set, allow the request through so
    // local testing works. Production should always have CRON_SECRET set.
    return true;
  }
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}
