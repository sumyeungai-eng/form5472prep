import { NextResponse } from "next/server";
import { clearPartnerCookie } from "@/lib/partner/auth";

export const runtime = "nodejs";

export async function POST() {
  clearPartnerCookie();
  return NextResponse.json({ ok: true });
}
