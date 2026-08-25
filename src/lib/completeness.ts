import {
  entitySchema,
  ownerBaseSchema,
  refineUsIdOrReferenceId,
  makeYearScopeSchema,
  isYearDelinquent,
  type ExtensionFacts,
} from "@/lib/schemas";

// The single definition of "this filing is complete enough to pay for".
// Extracted from /api/checkout so the admin drafts view marks exactly the
// drafts checkout would accept — two definitions of "complete" WILL drift.

const ownerCompletionSchema = ownerBaseSchema.superRefine(refineUsIdOrReferenceId);

/**
 * The subset of a Filing the completeness checks actually read. Structurally
 * satisfied by a Prisma `Filing` row (checkout) and by an admin list row.
 * `llcDateIncorporated` accepts a Prisma `Date` or an already-ISO string —
 * the massage to YYYY-MM-DD happens inside the helper so both pass straight
 * through.
 */
export type CompletionInput = {
  llcName: string | null;
  llcEin: string | null;
  llcAddress: string | null;
  llcCity: string | null;
  llcState: string | null;
  llcZip: string | null;
  llcDateIncorporated: Date | string | null;
  llcBusinessActivity: string | null;
  llcBusinessCode: string | null;
  ownerName: string | null;
  ownerAddress: string | null;
  ownerCountryCitizenship: string | null;
  ownerCountryTaxResidence: string | null;
  ownerCountryBusiness: string | null;
  ownerFtin: string | null;
  ownerItin: string | null;
  ownerReferenceId: string | null;
  taxYears: number[];
  isFinalReturn: boolean;
  dissolvedAt: Date | null;
  isDiirsp: boolean;
  reasonableCauseNarrative: string | null;
  // Form 7004 extension facts. Only the two the delinquency test reads are
  // required here — extensionMethod/Destination/ProofKey are review metadata
  // for the accountant and don't move the completeness verdict, so demanding
  // them would only add obligations on callers for nothing.
  extensionFiled: string | null;
  extensionTransmittedAt: Date | string | null;
};

/**
 * Whether this filing needs a reasonable-cause (DIIRSP) narrative, decided
 * from TODAY's clock and the filing's own extension answers.
 *
 * Deliberately NOT `filing.isDiirsp`: that column is written whenever the
 * wizard last touched the years or the extension step, and a draft can sit
 * across a deadline afterwards (or be resumed months later) — the stored value
 * then says "timely" for a return that is now late, and checkout would take
 * the money without the statement that carries the $25,000 penalty protection.
 *
 * A Form 7004 covers ONE tax year, so the extension facts are applied ONLY to
 * the latest year; every earlier year in a catch-up is judged unextended.
 * "Not sure" counts as NOT delinquent — an unknown must not become a
 * delinquency admission on the customer's forms; the accountant confirms it by
 * email before the package is faxed.
 */
export function requiresReasonableCause(
  filing: Pick<
    CompletionInput,
    "taxYears" | "isFinalReturn" | "dissolvedAt" | "extensionFiled" | "extensionTransmittedAt"
  >,
): boolean {
  if (filing.taxYears.length === 0) return false;
  // Only a final return carries a dissolution date, and only that date
  // shortens the year — everything else keeps the ordinary deadline.
  const finalDissolved = filing.isFinalReturn ? filing.dissolvedAt : null;
  const extFacts: ExtensionFacts = {
    filed: filing.extensionFiled,
    transmittedAt: filing.extensionTransmittedAt,
  };
  // NOTE: the "not sure" deferral lives INSIDE isYearDelinquent (per-year),
  // so an unclear latest-year extension never strips the reasonable-cause
  // protection from unambiguously-late earlier years in the same bundle.
  const maxYear = Math.max(...filing.taxYears);
  return filing.taxYears.some((y) =>
    isYearDelinquent(y, finalDissolved, y === maxYear ? extFacts : null),
  );
}

/**
 * Every reason this filing is not yet payable, as dotted field paths
 * ("llcEin", "yearData.2025", "dissolvedAt"). Empty array = complete.
 *
 * @param yearDataYears the taxYear of every FilingYearData row that exists.
 */
export function filingCompletionIssues(filing: CompletionInput, yearDataYears: number[]): string[] {
  // Validate against the same schemas the wizard enforces.
  const validationFiling = {
    ...filing,
    llcDateIncorporated:
      filing.llcDateIncorporated instanceof Date
        ? filing.llcDateIncorporated.toISOString().slice(0, 10)
        : filing.llcDateIncorporated,
  };
  const completionChecks = [
    entitySchema.safeParse(validationFiling),
    ownerCompletionSchema.safeParse(filing),
    // Bound the year range by the filing's own final-return flag — a dissolved
    // LLC legitimately reports the in-progress year, and the fixed bound would
    // otherwise flag that filing as incomplete and block it from paying.
    makeYearScopeSchema(filing.isFinalReturn).safeParse(filing),
  ];
  const completionIssues: string[] = [];
  for (const result of completionChecks) {
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || issue.message;
        if (completionIssues.indexOf(field) === -1) completionIssues.push(field);
      }
    }
  }
  for (const taxYear of filing.taxYears) {
    if (!yearDataYears.find((year) => year === taxYear)) {
      const field = `yearData.${taxYear}`;
      if (completionIssues.indexOf(field) === -1) completionIssues.push(field);
    }
  }
  // A final return covers a short tax year (Jan 1 → dissolution date). Without
  // the date the forms would claim a full 01/01–12/31 year while item E says
  // "final" — so refuse to charge until the customer supplies it.
  if (filing.isFinalReturn && !filing.dissolvedAt) {
    if (completionIssues.indexOf("dissolvedAt") === -1) completionIssues.push("dissolvedAt");
  }
  // Live recompute rather than the stored filing.isDiirsp — see
  // requiresReasonableCause above. The admin drafts "ready" badge inherits
  // this automatically: it calls this same helper, so a draft that quietly
  // went delinquent stops showing as payable there too.
  const requiresRcs = requiresReasonableCause(filing);
  if (requiresRcs && (!filing.reasonableCauseNarrative || !filing.reasonableCauseNarrative.trim())) {
    if (completionIssues.indexOf("reasonableCauseNarrative") === -1)
      completionIssues.push("reasonableCauseNarrative");
  }
  return completionIssues;
}
