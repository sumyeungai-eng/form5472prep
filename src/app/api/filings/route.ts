import { NextResponse } from "next/server";
import { getOrCreateSessionId, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TIERS } from "@/lib/pricing";

export async function POST() {
  const sessionId = getOrCreateSessionId();
  const user = await getCurrentUser();
  const filing = await prisma.filing.create({
    data: {
      sessionId,
      userId: user?.id ?? null,
      status: "DRAFT",
      tier: "single_year",
      amountPaid: TIERS.single_year.priceCents,
      taxYears: [],
    },
  });
  return NextResponse.json({ id: filing.id });
}

// Only useful for signed-in users — lists all filings tied to their email.
// Anonymous browsers don't get a list (they only know about the filing in their cookie).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json([]);
  const filings = await prisma.filing.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { yearData: true },
  });
  return NextResponse.json(filings);
}
