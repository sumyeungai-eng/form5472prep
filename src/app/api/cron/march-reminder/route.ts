import { NextResponse } from "next/server";
import { runCampaign } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Triggered by Vercel Cron in mid-March — second touch before the
// April 15 filing deadline. Uses the same CRON_SECRET guard.
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runCampaign({ campaign: "march" });
  return NextResponse.json(result);
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}
