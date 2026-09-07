import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminCounters } from "@/lib/admin/counters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  return NextResponse.json(await getAdminCounters(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
