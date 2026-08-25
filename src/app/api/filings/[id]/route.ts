import { NextResponse } from "next/server";
import { z } from "zod";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { totalPriceCents, isTier } from "@/lib/pricing";
import {
  entitySchema,
  ownerBaseSchema,
  currentTaxYear,
  makeYearDataSchema,
  makeYearScopeSchema,
  reportableTransactionsSchema,
  validateDissolvedAt,
  isYearDelinquent,
  type ExtensionFacts,
} from "@/lib/schemas";

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

// ─── Form 7004 extension gate — accepted answers ───
// Kept as plain literal tuples rather than folded into patchFieldSchema: those
// fields are validated as a GROUP (the date is conditionally required on
// "yes", and a non-"yes" answer clears the other three), which a `.partial()`
// object schema can't express without changing how every other field is
// checked.
const EXTENSION_ANSWERS = ["yes", "no", "not_sure"] as const;
const EXTENSION_METHODS = ["fax", "certified_mail", "mail", "not_sure"] as const;
const EXTENSION_DESTINATIONS = ["ogden", "standard", "not_sure"] as const;
// Date-only, same convention as llcDateIncorporated/dissolvedAt: a YYYY-MM-DD
// string parses as UTC midnight, so the stored instant round-trips to the
// calendar day the customer picked.
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

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

  // Final short-year return: the LLC was dissolved/closed mid-year, so its tax
  // year has already ended even though the calendar year hasn't. This is the
  // ONLY case in which a filer may report the current year — resolve the flag
  // before the year validation below so this request is judged against the
  // value it is establishing, not the stale stored one.
  const isFinalReturnUpdate =
    typeof body.isFinalReturn === "boolean" ? (body.isFinalReturn as boolean) : undefined;
  const effectiveFinal = isFinalReturnUpdate ?? filing.isFinalReturn;
  if (isFinalReturnUpdate !== undefined) data.isFinalReturn = isFinalReturnUpdate;

  // The dissolution date this PATCH will persist, as a raw YYYY-MM-DD string (or
  // null). A final short year's IRS deadline is keyed to the dissolution month,
  // so the per-year delinquency test below needs it; the same value is validated
  // and converted to a Date in the dissolvedAt block further down. Only a final
  // return carries one — null otherwise so ordinary years use the April-15 rule.
  const dissolvedAtProvided = Object.prototype.hasOwnProperty.call(body, "dissolvedAt");
  const effectiveDissolvedAt: string | null = effectiveFinal
    ? dissolvedAtProvided
      ? (body.dissolvedAt as string | null)
      : filing.dissolvedAt?.toISOString().slice(0, 10) ?? null
    : null;

  // Turning the flag OFF re-imposes the "no unfinished year" cap. Refuse the
  // whole PATCH if the current year would survive it — silently keeping a year
  // the filing may no longer report would leave an invalid record that only
  // blows up later at checkout / PDF generation.
  if (isFinalReturnUpdate === false) {
    const yearsAfterPatch: unknown[] = Array.isArray(body.taxYears) ? body.taxYears : filing.taxYears;
    if (yearsAfterPatch.some((y) => y === currentTaxYear)) {
      return NextResponse.json(
        { error: "Remove the current tax year before unmarking this as a final return" },
        { status: 400 },
      );
    }
  }

  // The LLC's formation date after this patch — the entity step may be setting
  // it in this very request. Both the "no tax year before the LLC existed" check
  // and the dissolution-date ordering check below are keyed to it.
  const effectiveFormedAt: Date | null = clean.llcDateIncorporated
    ? new Date(clean.llcDateIncorporated as string)
    : filing.llcDateIncorporated;
  const formationYear =
    effectiveFormedAt && !Number.isNaN(effectiveFormedAt.getTime())
      ? effectiveFormedAt.getUTCFullYear()
      : null;

  // ─── Form 7004 extension gate ───
  // Whether a return is late is a LEGAL CHARACTERISATION, and this route used
  // to infer it from the calendar alone — which misclassified every validly
  // extended filer as delinquent (live incident 2026-08-25). These four
  // answers are the customer-supplied fact that overrides the inference; we
  // persist the raw INPUTS and re-derive the verdict through the shared
  // helpers, so the record shows what the customer told us and when.
  const hasKey = (k: string) => Object.prototype.hasOwnProperty.call(body, k);
  const extensionTouched =
    hasKey("extensionFiled") ||
    hasKey("extensionTransmittedAt") ||
    hasKey("extensionMethod") ||
    hasKey("extensionDestination");

  // Effective facts = this request's values where it supplied them, the stored
  // ones otherwise. Both the validation below and the isDiirsp recompute judge
  // the state the filing will be in AFTER this patch, never the stale one.
  const effectiveExtensionFiled: string | null = hasKey("extensionFiled")
    ? ((body.extensionFiled as string | null | undefined) ?? null)
    : filing.extensionFiled;
  const effectiveExtensionTransmittedAt: Date | string | null = hasKey("extensionTransmittedAt")
    ? ((body.extensionTransmittedAt as string | null | undefined) ?? null)
    : filing.extensionTransmittedAt;

  if (extensionTouched) {
    // Enum answers. null/absent is always fine — the question simply hasn't
    // been answered yet.
    const enumIssue = (
      field: "extensionFiled" | "extensionMethod" | "extensionDestination",
      allowed: readonly string[],
      message: string,
    ) => {
      if (!hasKey(field)) return null;
      const value = (body as Record<string, unknown>)[field];
      if (value === null || value === undefined) return null;
      if (typeof value === "string" && allowed.includes(value)) return null;
      return { field, message };
    };
    const enumProblem =
      enumIssue("extensionFiled", EXTENSION_ANSWERS, "Answer yes, no, or not sure") ??
      enumIssue("extensionMethod", EXTENSION_METHODS, "Choose how the Form 7004 was sent") ??
      enumIssue("extensionDestination", EXTENSION_DESTINATIONS, "Choose where the Form 7004 was sent");
    if (enumProblem) {
      return NextResponse.json(
        { error: enumProblem.message, issues: [enumProblem] },
        { status: 400 },
      );
    }

    if (hasKey("extensionTransmittedAt")) {
      const value = body.extensionTransmittedAt;
      const wellFormed =
        value === null ||
        value === undefined ||
        (typeof value === "string" && DATE_ONLY_RE.test(value) && !Number.isNaN(Date.parse(value)));
      if (!wellFormed) {
        const message = "Enter the date you sent Form 7004 as YYYY-MM-DD";
        return NextResponse.json(
          { error: message, issues: [{ field: "extensionTransmittedAt", message }] },
          { status: 400 },
        );
      }
    }

    // "Yes" without a date is the one hard error: isExtensionValid compares the
    // transmission date against the original due date, so a dateless "yes"
    // could never rescue the return — and silently storing it would look like
    // an answered question that changes nothing.
    //
    // NOTE the deliberate asymmetry: a date AFTER the original due date is NOT
    // rejected. A late-sent 7004 is a true fact worth recording (the
    // accountant sees it, and the customer isn't dead-ended by a form that
    // won't accept their real answer); it simply fails isExtensionValid and so
    // doesn't make the return timely.
    if (effectiveExtensionFiled === "yes" && !effectiveExtensionTransmittedAt) {
      const message = "Enter the date you sent Form 7004";
      return NextResponse.json(
        { error: message, issues: [{ field: "extensionTransmittedAt", message }] },
        { status: 400 },
      );
    }

    if (effectiveExtensionFiled === "yes") {
      data.extensionFiled = "yes";
      if (hasKey("extensionTransmittedAt"))
        data.extensionTransmittedAt = new Date(body.extensionTransmittedAt as string);
      if (hasKey("extensionMethod"))
        data.extensionMethod = (body.extensionMethod as string | null | undefined) ?? null;
      if (hasKey("extensionDestination"))
        data.extensionDestination = (body.extensionDestination as string | null | undefined) ?? null;
    } else {
      // null / "no" / "not_sure": the supporting details describe an extension
      // that (as far as this filing now records) doesn't exist. Cleared in the
      // SAME update so a customer who answers "yes", fills in a date, then
      // changes to "no" can't leave a stale 7004 date behind for the
      // accountant — or for effectiveDueDateUtc — to trip over.
      data.extensionFiled = effectiveExtensionFiled;
      data.extensionTransmittedAt = null;
      data.extensionMethod = null;
      data.extensionDestination = null;
    }
  }

  // The facts the delinquency test will use. transmittedAt is only meaningful
  // alongside a "yes", matching what the update above persists.
  const extFacts: ExtensionFacts = {
    filed: effectiveExtensionFiled,
    transmittedAt: effectiveExtensionFiled === "yes" ? effectiveExtensionTransmittedAt : null,
  };

  // A Form 7004 covers ONE tax year, so on a multi-year catch-up the extension
  // facts apply ONLY to the latest year — every earlier year is judged with no
  // extension at all.
  //
  // "Not sure" collapses to NOT delinquent: defaulting an unknown to "late"
  // would print a delinquency admission on the customer's forms that no fact
  // supports. The order is instead flagged for the accountant (derivable from
  // the stored extensionFiled — deliberately no extra derived column), who
  // already reviews every package before fax.
  const recomputeIsDiirsp = (years: number[]): boolean => {
    if (years.length === 0) return false;
    // NOTE: the "not sure" deferral lives INSIDE isYearDelinquent (per-year),
    // so an unclear latest-year extension never strips the reasonable-cause
    // protection from unambiguously-late earlier years in the same bundle.
    const maxYear = Math.max(...years);
    return years.some((y) =>
      isYearDelinquent(y, effectiveDissolvedAt, y === maxYear ? extFacts : null),
    );
  };

  if (Array.isArray(body.taxYears)) {
    // An LLC can't have a tax year before it existed: there is no period to
    // report, no 5472 obligation, and the IRS would reject a return for a year
    // the EIN didn't cover. Caught here rather than at PDF generation because
    // each extra year is billed — refusing now stops the customer paying for a
    // form we can't legitimately produce.
    if (formationYear !== null) {
      const tooEarly = (body.taxYears as unknown[]).filter(
        (y) => typeof y === "number" && y < formationYear,
      );
      if (tooEarly.length > 0) {
        const message = `You can't file a tax year before the LLC existed — it was formed in ${formationYear}`;
        return NextResponse.json(
          { error: message, issues: [{ field: "taxYears", message }] },
          { status: 400 },
        );
      }
    }
    // Validate + dedupe: reject empty, duplicate, or out-of-range years (which
    // would otherwise charge a fee but produce no/duplicate/wrong-revision forms).
    const parsedYears = makeYearScopeSchema(effectiveFinal).safeParse({
      taxYears: Array.from(new Set(body.taxYears)),
    });
    if (!parsedYears.success) {
      return NextResponse.json(
        {
          error: "Invalid tax years",
          issues: parsedYears.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        },
        { status: 400 },
      );
    }
    const years = parsedYears.data.taxYears.slice().sort((a, b) => a - b);
    data.taxYears = years;
    // Tier is independent of year count in the new pricing model. Year count
    // drives a flat per-extra-year add-on layered on the chosen tier base.
    const tierValue = (data.tier as string) ?? filing.tier;
    data.amountPaid = totalPriceCents(tierValue, years.length);
    // Per-year delinquency drives DIIRSP. A FINAL short year's deadline is NOT
    // the following April 15 — it's the 15th day of the 4th month after the
    // dissolution month (IRC §6072 applied to the short period), so a final
    // return dissolved early enough in the year can already be late while a
    // full-year return for the same calendar year would still be timely. The
    // shared isYearDelinquent encodes both rules; feed it the dissolution date
    // (null for non-final filings, so those keep the April-15 deadline).
    data.isDiirsp = recomputeIsDiirsp(years);
  }

  // An extension answer ALONE has to be able to flip the classification: the
  // wizard's extension step saves without resending taxYears, and the stored
  // isDiirsp would otherwise keep the pre-extension (delinquent) verdict all
  // the way to the PDF. Equivalent to recomputing against
  // `body.taxYears ?? filing.taxYears` — the array case was just handled above.
  if (extensionTouched && data.isDiirsp === undefined) {
    data.isDiirsp = recomputeIsDiirsp(filing.taxYears);
  }

  // Dissolution date — the short year this final return actually covers runs
  // Jan 1 → this date, so the flag is meaningless without it (and a stale date
  // left behind on a filing that is no longer final would shorten the period
  // printed on the forms). Validated against the years AFTER this patch, since
  // the wizard saves the year selection and the date in the same request.
  if (effectiveFinal) {
    // Only judge the pairing when this request actually touches it; an
    // unrelated step save (entity, owner…) must not be rejected for a field
    // it never sent.
    if (dissolvedAtProvided || isFinalReturnUpdate !== undefined || Array.isArray(body.taxYears)) {
      const yearsAfterPatch = (data.taxYears as number[] | undefined) ?? filing.taxYears;
      // Same value the delinquency test above used; validate it and store the
      // parsed Date.
      const rawDissolvedAt = effectiveDissolvedAt;
      // Pass the formation date so a dissolution that precedes it is rejected
      // (transposed dates / mis-keyed year would otherwise print a
      // negative-length short period on the forms).
      const dissolvedAtError = validateDissolvedAt(
        rawDissolvedAt,
        yearsAfterPatch,
        effectiveFormedAt,
      );
      if (dissolvedAtError) {
        return NextResponse.json(
          {
            error: dissolvedAtError,
            issues: [{ field: "dissolvedAt", message: dissolvedAtError }],
          },
          { status: 400 },
        );
      }
      // Same convention as llcDateIncorporated: a YYYY-MM-DD string parses as
      // UTC midnight, so the stored instant round-trips to the same calendar
      // day the customer picked.
      data.dissolvedAt = new Date(rawDissolvedAt as string);
    }
  } else {
    // Not (or no longer) a final return: only a final return carries a
    // dissolution date. Clearing it here keeps unticking the box a single
    // atomic update instead of leaving an orphaned short-year date behind.
    data.dissolvedAt = null;
  }

  const resolvedYearData: Array<{
    taxYear: number;
    totalAssetsYearEnd: number;
    contributions: number;
    distributions: number;
    otherTransactionsNote: unknown;
    noReportableTransactions: boolean;
    cleanTransactions: z.infer<typeof reportableTransactionsSchema> | undefined;
  }> = [];
  if (Array.isArray(body.yearData)) {
    for (const y of body.yearData) {
      // Validate the reported financial figures (these become the actual
      // Part IV/V dollar amounts on the IRS forms). Reject bad taxYear or
      // negative/non-numeric amounts instead of coercing garbage to 0.
      const yv = makeYearDataSchema(effectiveFinal).safeParse({
        taxYear: y?.taxYear,
        totalAssetsYearEnd: y?.totalAssetsYearEnd ?? 0,
        contributions: y?.contributions ?? 0,
        distributions: y?.distributions ?? 0,
        noReportableTransactions: y?.noReportableTransactions,
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
      // Validate the detailed reportable-transaction rows (Part IV/V). A direct
      // PATCH could otherwise store amountCents:"abc" → $NaN on the form.
      let cleanTransactions: z.infer<typeof reportableTransactionsSchema> | undefined;
      if (Array.isArray(y.reportableTransactions) && y.reportableTransactions.length > 0) {
        const tv = reportableTransactionsSchema.safeParse(y.reportableTransactions);
        if (!tv.success) {
          return NextResponse.json(
            {
              error: "Invalid reportable transactions",
              issues: tv.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
            },
            { status: 400 },
          );
        }
        cleanTransactions = tv.data;
      }
      const noneReported = yv.data.noReportableTransactions === true;
      resolvedYearData.push({
        taxYear: yv.data.taxYear,
        totalAssetsYearEnd: yv.data.totalAssetsYearEnd,
        contributions: yv.data.contributions,
        distributions: yv.data.distributions,
        otherTransactionsNote: y?.otherTransactionsNote,
        noReportableTransactions: noneReported,
        cleanTransactions,
      });
    }
  }

  // If an email was provided at the Review step, upsert the user and bind
  // this filing to them. Idempotent.
  if (typeof body.email === "string" && body.email.includes("@")) {
    await bindFilingToEmail(filing.id, body.email);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedFiling = await tx.filing.update({ where: { id: filing.id }, data });

    // If yearData payload included, upsert each year.
    if (Array.isArray(body.yearData)) {
      for (const y of resolvedYearData) {
        await tx.filingYearData.upsert({
          where: { filingId_taxYear: { filingId: filing.id, taxYear: y.taxYear } },
          update: {
            totalAssetsYearEnd: y.totalAssetsYearEnd,
            contributions: y.noReportableTransactions ? 0 : y.contributions,
            distributions: y.noReportableTransactions ? 0 : y.distributions,
            otherTransactionsNote: y.noReportableTransactions
              ? ""
              : typeof y.otherTransactionsNote === "string" ? y.otherTransactionsNote : undefined,
            noReportableTransactions: y.noReportableTransactions,
            // SECURITY/DATA-LOSS GUARD: the TransactionsReview wizard step
            // initializes its in-memory transaction list to [] and does NOT
            // rehydrate previously-uploaded/parsed rows. So a returning user who
            // re-submits this step would otherwise wipe the stored detailed rows
            // with an empty array (while keeping only the contribution/
            // distribution totals). Only overwrite reportableTransactions when
            // the incoming list is non-empty; an empty list leaves existing
            // detail untouched except for the explicit no-reportable-transactions
            // attestation below.
            // Explicit attestation bypasses the guard because the user is
            // intentionally clearing stored transaction detail, not submitting
            // an empty, non-rehydrated client state.
            // undefined when the incoming list is empty/absent → leaves stored
            // detail untouched (the anti-data-loss guard above).
            reportableTransactions: y.noReportableTransactions ? [] : y.cleanTransactions ?? undefined,
          },
          create: {
            filingId: filing.id,
            taxYear: y.taxYear,
            totalAssetsYearEnd: y.totalAssetsYearEnd,
            contributions: y.noReportableTransactions ? 0 : y.contributions,
            distributions: y.noReportableTransactions ? 0 : y.distributions,
            otherTransactionsNote: y.noReportableTransactions
              ? ""
              : typeof y.otherTransactionsNote === "string" ? y.otherTransactionsNote : null,
            noReportableTransactions: y.noReportableTransactions,
            reportableTransactions: y.noReportableTransactions ? [] : y.cleanTransactions ?? [],
          },
        });
      }
    }

    return updatedFiling;
  });

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
