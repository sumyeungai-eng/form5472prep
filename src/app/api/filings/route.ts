import { NextResponse } from "next/server";
import { FilingStatus } from "@prisma/client";
import { getOrCreateSessionId, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TIER, isTier, type Tier } from "@/lib/pricing";
import { findOrCreateDraftFiling } from "@/lib/findOrCreateDraft";

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

export async function POST(req: Request) {
  const sessionId = getOrCreateSessionId();
  const user = await getCurrentUser();

  // Optional body params from the /file funnel: tier pre-selection + source tag.
  const body = await req.json().catch(() => ({}));
  const requestedTier = body?.tier as string | undefined;
  const marketingConsent = body?.marketingConsent === true;
  // Sanitize funnelSource — user-controllable (set client-side from ?src=
  // on /start). Cap length and restrict to slug-safe chars so a tampered
  // request body can't store huge or weird strings in the DB / admin UI.
  const rawSource = typeof body?.funnelSource === "string" ? body.funnelSource : null;
  const funnelSource = rawSource
    ? rawSource.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 80) || null
    : null;
  // Service tier ("standard" | "rush" | "premium") is selected at /pricing
  // before the customer reaches /start. Default to Standard if the param is
  // missing or unrecognised so we never crash on an empty body.
  const tier: Tier = isTier(requestedTier) ? requestedTier : DEFAULT_TIER;

  // For returning customers, copy LLC + owner details from their most recent
  // paid filing so they don't re-type EIN, address, owner FTIN, etc. Year-
  // specific fields (taxYears, amounts) and submission state stay empty.
  let prefill: Record<string, unknown> = {};
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

  // Reuse an existing untouched DRAFT if the user/session already has one.
  // This is the only thing standing between repeat /start submissions or
  // back-and-forth navigation and a dashboard full of empty "Unnamed filing"
  // rows. If the user has prefill data from a previous paid filing, we still
  // reuse the empty row but write the prefill onto it.
  const { filing, reused } = await findOrCreateDraftFiling({
    sessionId,
    userId: user?.id ?? null,
    tier,
    funnelSource,
    marketingConsent,
    prefill: Object.keys(prefill).length > 0 ? (prefill as never) : undefined,
  });

  // If we reused an existing row and have new prefill, layer it on top — but
  // only on fields that are currently empty (don't clobber customer-entered data).
  if (reused && Object.keys(prefill).length > 0) {
    const overlay: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(prefill)) {
      // @ts-expect-error dynamic key into Prisma filing row
      if (v != null && (filing[k] == null || filing[k] === "")) overlay[k] = v;
    }
    if (Object.keys(overlay).length > 0) {
      await prisma.filing.update({ where: { id: filing.id }, data: overlay });
    }
  }

  // The visitor may grant consent after an untouched draft was created.
  // Consent is monotonic on the filing; declining still stops future browser
  // Pixel events through the saved browser preference.
  if (reused && marketingConsent && !filing.marketingConsent) {
    await prisma.filing.update({
      where: { id: filing.id },
      data: { marketingConsent: true },
    });
  }

  return NextResponse.json({
    id: filing.id,
    prefilled: Object.keys(prefill).length > 0,
    reused,
  });
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
