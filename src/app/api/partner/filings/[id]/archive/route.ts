import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPartner } from "@/lib/partner/auth";

export const runtime = "nodejs";

function decidePartnerArchiveAction(input: { archived: boolean; status: string }): { allowed: boolean } {
  if (!input.archived) return { allowed: true };
  return { allowed: input.status === "DRAFT" };
}

// Partner-side archive/unarchive for a filing (mirrors the admin
// `adminHidden` pattern). Hides a mistaken/abandoned draft from the partner
// dashboard's default view without deleting the row. Reversible, with new
// archives only ever allowed on DRAFT filings.
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

  if (!archived) {
    await prisma.filing.update({
      where: { id: filing.id },
      data: { partnerHidden: false },
    });
    return NextResponse.json({ ok: true });
  }

  if (!decidePartnerArchiveAction({ archived, status: filing.status }).allowed) {
    return NextResponse.json({ error: "Only drafts can be archived" }, { status: 409 });
  }

  const updated = await prisma.filing.updateMany({
    where: { id: filing.id, partnerId: partner.id, status: "DRAFT" },
    data: { partnerHidden: true },
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Only drafts can be archived" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
