import { NextResponse } from "next/server";
import { FilingStatus } from "@prisma/client";
import { getOrCreateSessionId, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TIERS } from "@/lib/pricing";

// Statuses that mean "this customer actually filed before" — we only copy
// data forward from real submitted filings, not other abandoned drafts.
const PAID_STATUSES: FilingStatus[] = [
  FilingStatus.PAID,
  FilingStatus.PDF_GENERATED,
  FilingStatus.SIGNATURE_PENDING,
  FilingStatus.SIGNED_UPLOADED,
  FilingStatus.FAXED,
  FilingStatus.CONFIRMED,
  FilingStatus.FAILED,
];

export async function POST() {
  const sessionId = getOrCreateSessionId();
  const user = await getCurrentUser();

  // For returning customers, copy LLC + owner details from their most recent
  // paid filing so they don't re-type EIN, address, owner FTIN, etc. Year-
  // specific fields (taxYears, amounts) and submission state stay empty.
  let prefill = {};
  if (user) {
    const previous = await prisma.filing.findFirst({
      where: { userId: user.id, status: { in: PAID_STATUSES } },
      orderBy: { updatedAt: "desc" },
    });
    if (previous) {
      prefill = {
        llcName: previous.llcName,
        llcEin: previous.llcEin,
        llcAddress: previous.llcAddress,
        llcCity: previous.llcCity,
        llcState: previous.llcState,
        llcZip: previous.llcZip,
        llcCountry: previous.llcCountry,
        llcDateIncorporated: previous.llcDateIncorporated,
        llcBusinessActivity: previous.llcBusinessActivity,
        llcBusinessCode: previous.llcBusinessCode,
        ownerName: previous.ownerName,
        ownerAddress: previous.ownerAddress,
        ownerCountryCitizenship: previous.ownerCountryCitizenship,
        ownerCountryTaxResidence: previous.ownerCountryTaxResidence,
        ownerCountryBusiness: previous.ownerCountryBusiness,
        ownerFtin: previous.ownerFtin,
        ownerItin: previous.ownerItin,
        ownerReferenceId: previous.ownerReferenceId,
      };
    }
  }

  const filing = await prisma.filing.create({
    data: {
      sessionId,
      userId: user?.id ?? null,
      status: "DRAFT",
      tier: "single_year",
      amountPaid: TIERS.single_year.priceCents,
      taxYears: [],
      ...prefill,
    },
  });
  return NextResponse.json({ id: filing.id, prefilled: Object.keys(prefill).length > 0 });
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
