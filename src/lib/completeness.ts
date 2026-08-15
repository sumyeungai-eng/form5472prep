import { entitySchema, ownerBaseSchema, refineUsIdOrReferenceId, makeYearScopeSchema } from "@/lib/schemas";

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
};

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
  if (filing.isDiirsp && (!filing.reasonableCauseNarrative || !filing.reasonableCauseNarrative.trim())) {
    if (completionIssues.indexOf("reasonableCauseNarrative") === -1)
      completionIssues.push("reasonableCauseNarrative");
  }
  return completionIssues;
}
