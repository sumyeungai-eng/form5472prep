import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPartner } from "@/lib/partner/auth";

export const runtime = "nodejs";

// Partner-side archive/unarchive for a DRAFT filing (mirrors the admin
// `adminHidden` pattern). Hides a mistaken/abandoned draft from the partner
// dashboard's default view without deleting the row. Reversible, and only
// ever allowed on DRAFT filings — a paid filing can never be archived.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const partner = await getCurrentPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { archived } = await req.json().catch(() => ({}));
  if (typeof archived !== "boolean") {
    return NextResponse.json({ error: "archived (boolean) required" }, { status: 400 });
  }

  const filing = await prisma.filing.findUnique({ where: { id: params.id } });
  if (!filing || filing.partnerId !== partner.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (filing.status !== "DRAFT") {
    return NextResponse.json({ error: "Only drafts can be archived" }, { status: 409 });
  }

  await prisma.filing.update({
    where: { id: filing.id },
    data: { partnerHidden: archived },
  });

  return NextResponse.json({ ok: true });
}
