import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { runCampaign, type Campaign } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const campaign = body?.campaign as Campaign | undefined;
  const taxYear = typeof body?.taxYear === "number" ? body.taxYear : undefined;
  const dryRun = !!body?.dryRun;

  if (campaign !== "january" && campaign !== "march") {
    return NextResponse.json({ error: "invalid campaign" }, { status: 400 });
  }

  const result = await runCampaign({ campaign, taxYear, dryRun });
  return NextResponse.json(result);
}
