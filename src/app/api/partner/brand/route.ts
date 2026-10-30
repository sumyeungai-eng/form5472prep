import { NextResponse } from "next/server";
import { getCurrentPartner } from "@/lib/partner/auth";
import { prisma } from "@/lib/prisma";
import { partnerDisplayName } from "@/lib/partner/displayName";

// A partner sets the name their clients see (portal header, wizard, fax
// receipt). Blank clears it, falling back to the company or contact name.
export async function PATCH(req: Request) {
  const partner = await getCurrentPartner();
  if (!partner) return NextResponse.json({ error: "Sign in again" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { brandName?: unknown } | null;
  if (typeof body?.brandName !== "string") return NextResponse.json({ error: "Name required" }, { status: 400 });
  const brandName = body.brandName.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  if (brandName.length > 120) return NextResponse.json({ error: "Keep it under 120 characters" }, { status: 400 });

  const updated = await prisma.partner.update({
    where: { id: partner.id },
    data: { brandName: brandName || null },
    select: { brandName: true, company: true, name: true },
  });
  return NextResponse.json({ displayName: partnerDisplayName(updated) });
}
