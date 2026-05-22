import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { totalPriceCents, isTier } from "@/lib/pricing";

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
    "ownerAddressStreet",
    "ownerAddressCity",
    "ownerAddressState",
    "ownerAddressPostal",
    "ownerAddressCountry",
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

  // Allow updating tier directly (the /pricing CTA + /start?tier= flow sets it).
  if (typeof body.tier === "string" && isTier(body.tier)) {
    data.tier = body.tier;
  }
  if (Array.isArray(body.taxYears)) {
    const years = (body.taxYears as number[]).slice().sort((a, b) => a - b);
    data.taxYears = years;
    // Tier is independent of year count in the new pricing model. Year count
    // drives a flat per-extra-year add-on layered on the chosen tier base.
    const tierValue = (data.tier as string) ?? filing.tier;
    data.amountPaid = totalPriceCents(tierValue, years.length);
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
          otherTransactionsNote: typeof y.otherTransactionsNote === "string" ? y.otherTransactionsNote : undefined,
          reportableTransactions: Array.isArray(y.reportableTransactions)
            ? y.reportableTransactions
            : undefined,
        },
        create: {
          filingId: filing.id,
          taxYear: y.taxYear,
          totalAssetsYearEnd: y.totalAssetsYearEnd ?? 0,
          contributions: y.contributions ?? 0,
          distributions: y.distributions ?? 0,
          otherTransactionsNote: typeof y.otherTransactionsNote === "string" ? y.otherTransactionsNote : null,
          reportableTransactions: Array.isArray(y.reportableTransactions) ? y.reportableTransactions : [],
        },
      });
    }
  }

  return NextResponse.json(updated);
}

// Allow deleting a DRAFT filing only. Paid filings have downstream artifacts
// (Stripe charges, generated PDFs, fax jobs) that shouldn't disappear silently.
// Message rows are protected from DELETE by a Postgres trigger
// (see migration 20260521041330_protect_messages_from_delete). The cascade
// from Filing → Message would otherwise be blocked, so we opt in for this
// transaction only via a session-local config flag.
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (filing.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only draft filings can be deleted." },
      { status: 400 },
    );
  }
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL form5472.allow_message_delete = 'true'`);
    await tx.filing.delete({ where: { id: filing.id } });
  });
  return NextResponse.json({ ok: true });
}
