import { NextResponse } from "next/server";
import { z } from "zod";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { totalPriceCents, isTier } from "@/lib/pricing";
import { entitySchema, ownerBaseSchema, yearDataSchema } from "@/lib/schemas";

// Server-side backstop for the incremental wizard PATCH. Reuses the SAME field
// rules the wizard enforces client-side (entitySchema + ownerBaseSchema) so
// anything the browser form accepts, the server accepts — but a direct API call
// or a future step that forgets its zodResolver can't write malformed data
// (bad EIN/ZIP/NAICS/state/reference-ID, or a non-string) into the record used
// to generate the actual IRS PDF. `.partial()` because each step sends only a
// subset of fields. Fields with no client rule get lenient string+length caps.
const patchFieldSchema = z
  .object({
    ...entitySchema.shape,
    ...ownerBaseSchema.shape,
    llcCountry: z.string().trim().min(1).max(60),
    ownerAddressStreet: z.string().trim().max(200),
    ownerAddressCity: z.string().trim().max(120),
    ownerAddressState: z.string().trim().max(120),
    ownerAddressPostal: z.string().trim().max(40),
    ownerAddressCountry: z.string().trim().max(60),
    reasonableCauseNarrative: z.string().max(20000),
  })
  .partial();

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

  // Validate the whitelisted fields that are present against the shared wizard
  // rules before persisting. Only keys actually in the body are checked, so
  // incremental step saves still work; malformed values get a 400 instead of
  // silently reaching the PDF generator.
  const fieldSubset: Record<string, unknown> = {};
  for (const k of [...stringFields, "llcDateIncorporated"] as const) {
    if (body[k] !== undefined) fieldSubset[k] = body[k];
  }
  const parsed = patchFieldSchema.safeParse(fieldSubset);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }
  const clean = parsed.data as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  for (const k of stringFields) if (clean[k] !== undefined) data[k] = clean[k];

  if (clean.llcDateIncorporated) data.llcDateIncorporated = new Date(clean.llcDateIncorporated as string);

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
      // Validate the reported financial figures (these become the actual
      // Part IV/V dollar amounts on the IRS forms). Reject bad taxYear or
      // negative/non-numeric amounts instead of coercing garbage to 0.
      const yv = yearDataSchema.safeParse({
        taxYear: y?.taxYear,
        totalAssetsYearEnd: y?.totalAssetsYearEnd ?? 0,
        contributions: y?.contributions ?? 0,
        distributions: y?.distributions ?? 0,
      });
      if (!yv.success) {
        return NextResponse.json(
          {
            error: "Invalid year data",
            issues: yv.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
          },
          { status: 400 },
        );
      }
      await prisma.filingYearData.upsert({
        where: { filingId_taxYear: { filingId: filing.id, taxYear: y.taxYear } },
        update: {
          totalAssetsYearEnd: y.totalAssetsYearEnd ?? 0,
          contributions: y.contributions ?? 0,
          distributions: y.distributions ?? 0,
          otherTransactionsNote: typeof y.otherTransactionsNote === "string" ? y.otherTransactionsNote : undefined,
          // SECURITY/DATA-LOSS GUARD: the TransactionsReview wizard step
          // initializes its in-memory transaction list to [] and does NOT
          // rehydrate previously-uploaded/parsed rows. So a returning user who
          // re-submits this step would otherwise wipe the stored detailed rows
          // with an empty array (while keeping only the contribution/
          // distribution totals). Only overwrite reportableTransactions when
          // the incoming list is non-empty; an empty list leaves existing
          // detail untouched. (A genuine "clear all" would need an explicit
          // signal — not the absence of rehydrated state.)
          reportableTransactions:
            Array.isArray(y.reportableTransactions) && y.reportableTransactions.length > 0
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
