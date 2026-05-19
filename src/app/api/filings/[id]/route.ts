import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tierForYearCount, TIERS } from "@/lib/pricing";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const owned = await getOwnedFiling(params.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { yearData: true },
  });
  return NextResponse.json(filing);
}

// PATCH accepts a partial set of fields and persists them.
// Wizard steps call this incrementally as the user advances.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (filing.status !== "DRAFT")
    return NextResponse.json({ error: "Filing is locked" }, { status: 409 });

  const body = await req.json();

  // If an email was provided at the Review step, upsert the user and bind
  // this filing to them. Idempotent.
  if (typeof body.email === "string" && body.email.includes("@")) {
    await bindFilingToEmail(filing.id, body.email);
  }

  // Whitelist editable fields.
  const data: Record<string, unknown> = {};
  const stringFields = [
    "llcName",
    "llcEin",
    "llcAddress",
    "llcCity",
    "llcState",
    "llcZip",
    "llcCountry",
    "llcBusinessActivity",
    "llcBusinessCode",
    "ownerName",
    "ownerAddress",
    "ownerCountryCitizenship",
    "ownerCountryTaxResidence",
    "ownerCountryBusiness",
    "ownerFtin",
    "ownerItin",
    "ownerReferenceId",
    "reasonableCauseNarrative",
  ] as const;
  for (const k of stringFields) if (body[k] !== undefined) data[k] = body[k];

  if (body.llcDateIncorporated) data.llcDateIncorporated = new Date(body.llcDateIncorporated);

  if (Array.isArray(body.taxYears)) {
    const years = (body.taxYears as number[]).slice().sort((a, b) => a - b);
    data.taxYears = years;
    const tier = tierForYearCount(years.length);
    data.tier = tier;
    data.amountPaid = TIERS[tier].priceCents;
    data.isDiirsp = years.length > 1 || (years[0] !== undefined && years[0] < new Date().getFullYear());
  }

  const updated = await prisma.filing.update({ where: { id: filing.id }, data });

  // If yearData payload included, upsert each year.
  if (Array.isArray(body.yearData)) {
    for (const y of body.yearData) {
      await prisma.filingYearData.upsert({
        where: { filingId_taxYear: { filingId: filing.id, taxYear: y.taxYear } },
        update: {
          totalAssetsYearEnd: y.totalAssetsYearEnd ?? 0,
          contributions: y.contributions ?? 0,
          distributions: y.distributions ?? 0,
        },
        create: {
          filingId: filing.id,
          taxYear: y.taxYear,
          totalAssetsYearEnd: y.totalAssetsYearEnd ?? 0,
          contributions: y.contributions ?? 0,
          distributions: y.distributions ?? 0,
        },
      });
    }
  }

  return NextResponse.json(updated);
}
