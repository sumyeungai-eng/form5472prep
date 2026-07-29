import { z } from "zod";

// EIN must be 9 digits, optionally formatted XX-XXXXXXX
export const einSchema = z
  .string()
  .trim()
  .regex(/^\d{2}-?\d{7}$/, "EIN must be 9 digits (XX-XXXXXXX)")
  .transform((s) => (s.includes("-") ? s : `${s.slice(0, 2)}-${s.slice(2)}`));

export const entitySchema = z.object({
  llcName: z.string().trim().min(2, "Required"),
  llcEin: einSchema,
  llcAddress: z.string().trim().min(3, "Required"),
  llcCity: z.string().trim().min(1, "Required"),
  llcState: z.string().trim().length(2, "2-letter state code"),
  llcZip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP"),
  llcDateIncorporated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  llcBusinessActivity: z.string().trim().min(2, "Required"),
  llcBusinessCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "6-digit NAICS code"),
});

// Raw object schema — used as the base for derived form schemas (e.g. the
// wizard's OwnerStep splits ownerName into first/middle/last). Kept separate
// from the refined `ownerSchema` because `.omit()` / `.extend()` can't be
// called on a ZodEffects (the result of `.superRefine()`).
export const ownerBaseSchema = z.object({
  ownerName: z.string().trim().min(2, "Required"),
  ownerAddress: z.string().trim().min(3, "Required"),
  ownerCountryCitizenship: z.string().trim().min(2, "Required"),
  ownerCountryTaxResidence: z.string().trim().min(2, "Required"),
  ownerCountryBusiness: z.string().trim().min(2, "Required"),
  ownerFtin: z.string().trim().min(2, "Required"),
  ownerItin: z.string().trim().optional().or(z.literal("")),
  // IRS Instructions for Form 5472: the reference ID must be alphanumeric with
  // no special characters or spaces, 50 chars or less. Reject hyphens etc. so
  // a manually-entered ID like "SMITH-J-A7B2" can't reach the PDF.
  ownerReferenceId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{1,50}$/, "Letters and numbers only, no spaces or symbols (max 50)")
    .optional()
    .or(z.literal("")),
});

// Per IRS Form 5472 line 4b: must have either US ITIN OR a reference ID.
// Exported as a plain refiner callback so derived schemas in the wizard can
// reuse the same rule (they can't import a refined schema and then call
// `.omit()` on it — `.omit()` is only defined on ZodObject, not ZodEffects).
export function refineUsIdOrReferenceId(
  val: { ownerItin?: string; ownerReferenceId?: string },
  ctx: z.RefinementCtx,
) {
  const hasItin = !!val.ownerItin && val.ownerItin.length > 0;
  const hasRef = !!val.ownerReferenceId && val.ownerReferenceId.length > 0;
  if (!hasItin && !hasRef) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Required if you don't have a US ITIN",
      path: ["ownerReferenceId"],
    });
  }
}

export const ownerSchema = ownerBaseSchema.superRefine(refineUsIdOrReferenceId);

// The last COMPLETED tax year — a filing can't be for a year that hasn't
// ended yet. Bounds both the wizard picker and the server-side validation.
export const lastCompletedTaxYear = new Date().getUTCFullYear() - 1;

// The calendar year still in progress. Reporting it is normally invalid, with
// exactly ONE exception: a FINAL short-year return. When the LLC is dissolved
// or closed mid-year its tax year ends on that date, so the return becomes due
// (and filable) before the calendar year is over. Every other filer must wait
// for the year to finish, otherwise they'd be reporting figures that don't
// exist yet.
export const currentTaxYear = new Date().getUTCFullYear();

// Single source of truth for the upper bound. Callers pass the filing's
// final-return flag; only a final return unlocks the in-progress year.
//
// STALENESS: reads the clock on every call rather than the module-level
// constants above. A long-lived server process started in December would
// otherwise keep enforcing last year's bound after New Year, rejecting the
// year that just became filable. The constants stay for display callers that
// render once per request anyway.
export function maxSelectableTaxYear(isFinalReturn: boolean): number {
  const nowYear = new Date().getUTCFullYear();
  return isFinalReturn ? nowYear : nowYear - 1;
}

// ─── Dissolution date (final short-year returns) ─────────────────────────────
// A final return does NOT cover 01/01–12/31: the tax year ends the day the LLC
// was dissolved, so the forms must show Jan 1 → that date. The date is
// therefore mandatory whenever isFinalReturn is set, and must sit inside the
// year being filed (a date in another year would describe a period the return
// doesn't cover) and in the past (an LLC can't already be dissolved on a day
// that hasn't happened).
// Shared by the wizard and the PATCH route so the browser and the server
// reject the same values with the same wording.
export const DISSOLVED_AT_REQUIRED = "Enter the date the LLC was dissolved";
export const DISSOLVED_AT_FORMAT = "Use YYYY-MM-DD";
export const DISSOLVED_AT_OUT_OF_RANGE =
  "The dissolution date must fall within the tax year being filed";
export const DISSOLVED_AT_FUTURE = "The dissolution date cannot be in the future";
// An LLC cannot be dissolved before it existed. Catches the transposed-date
// typo (formation and dissolution swapped) and a mis-keyed year, either of
// which would otherwise print a negative-length tax period on the forms.
export const DISSOLVED_AT_BEFORE_FORMATION =
  "The dissolution date cannot be before the LLC was formed";

/**
 * Validates a `YYYY-MM-DD` dissolution date against the years being filed.
 * Returns the error message, or null when the value is acceptable.
 *
 * `taxYears` is the full selection; the short year always belongs to the
 * LATEST year in the package — earlier years in a DIIRSP catch-up are ordinary
 * full years. An empty selection skips the range check (the year-scope schema
 * reports the missing years separately).
 *
 * `formedAt` is the LLC's formation date (`llcDateIncorporated`). When both
 * dates are known the dissolution must be on or after it — a first-and-final
 * filer's short year runs formation → dissolution, so a dissolution that
 * precedes formation describes an impossible period. Skipped when the
 * formation date isn't on file yet (the entity step may not have run).
 */
export function validateDissolvedAt(
  value: string | null | undefined,
  taxYears: number[],
  formedAt?: Date | string | null,
): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return DISSOLVED_AT_REQUIRED;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return DISSOLVED_AT_FORMAT;

  const [year, month, day] = raw.split("-").map(Number);
  const asUtc = Date.UTC(year, month - 1, day);
  const parsed = new Date(asUtc);
  // Reject impossible calendar dates ("2026-02-31" would otherwise roll over
  // into March and silently shorten the period to the wrong day).
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return DISSOLVED_AT_FORMAT;
  }

  if (taxYears.length > 0 && year !== Math.max(...taxYears)) {
    return DISSOLVED_AT_OUT_OF_RANGE;
  }

  // Compare date-to-date in UTC so "dissolved today" stays valid regardless of
  // the time of day the request arrives.
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (asUtc > todayUtc) return DISSOLVED_AT_FUTURE;

  // Compare on the calendar day in UTC — both values are date-only instants
  // (UTC midnight), so same-day formation-and-dissolution stays valid.
  if (formedAt != null) {
    const formed = formedAt instanceof Date ? formedAt : new Date(formedAt);
    if (!Number.isNaN(formed.getTime())) {
      const formedUtc = Date.UTC(
        formed.getUTCFullYear(),
        formed.getUTCMonth(),
        formed.getUTCDate(),
      );
      if (asUtc < formedUtc) return DISSOLVED_AT_BEFORE_FORMATION;
    }
  }

  return null;
}

// ─── Filing deadline / delinquency (single source of truth) ──────────────────
// IRS due date for the Form 5472 / pro forma 1120 package covering `taxYear`.
// Normal calendar year: 15th day of the 4th month after year end = April 15,
// taxYear+1. Final SHORT year (dissolvedAt inside taxYear): the tax year ends
// on the dissolution date, so the deadline is the 15th day of the 4th month
// after the month the short year ends (IRC §6072 timing applied to the short
// period) — NOT the following April 15. A return dissolved early in the year is
// therefore already due (and can be delinquent) months before a full-year
// return would be. JS Date.UTC month overflow handles December correctly
// (m=11 → month 15 → April 15 of the next year).
//
// Weekend roll (IRC §7503): a deadline falling on a Saturday or Sunday moves to
// the next business day, so April 15 2028 (Sat) is really due Mon April 17.
// Federal HOLIDAYS are deliberately NOT rolled here. §7503 rolls those too, but
// modelling them needs the DC-Emancipation-Day rule plus the observed-holiday
// shifts, and getting one wrong in the other direction would mark a still-timely
// return delinquent. Omitting them can only make us treat a return as due
// EARLIER than the IRS does — i.e. we might show DIIRSP wording on a package
// that was technically still on time, which is the safe failure direction (a
// reasonable cause statement on a timely filing is harmless; a missing one on a
// late filing is not).
export function filingDueDateUtc(
  taxYear: number,
  dissolvedAt?: Date | string | null,
): number {
  const raw = rawFilingDueDateUtc(taxYear, dissolvedAt);
  return rollWeekendToMonday(raw);
}

function rawFilingDueDateUtc(taxYear: number, dissolvedAt?: Date | string | null): number {
  if (dissolvedAt != null) {
    const d = dissolvedAt instanceof Date ? dissolvedAt : new Date(dissolvedAt);
    // Only a dissolution that actually falls in `taxYear` shortens it. An
    // invalid date, or one in another year, falls through to the normal rule.
    if (!Number.isNaN(d.getTime()) && d.getUTCFullYear() === taxYear) {
      return Date.UTC(taxYear, d.getUTCMonth() + 4, 15);
    }
  }
  return Date.UTC(taxYear + 1, 3, 15);
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Saturday → Monday (+2 days), Sunday → Monday (+1 day), everything else
// unchanged. Read in UTC because the deadline is a date-only instant.
function rollWeekendToMonday(utcMs: number): number {
  const dayOfWeek = new Date(utcMs).getUTCDay(); // 0 = Sunday … 6 = Saturday
  if (dayOfWeek === 6) return utcMs + 2 * ONE_DAY_MS;
  if (dayOfWeek === 0) return utcMs + ONE_DAY_MS;
  return utcMs;
}

// Human-readable deadline for display ("November 16, 2026"). Rendered in UTC so
// the printed day matches the instant filingDueDateUtc() returns regardless of
// the server's or the reader's timezone.
export function formatDueDate(utcMs: number): string {
  return new Date(utcMs).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// A year is delinquent once its filing deadline has passed. Callers pass the
// dissolution date ONLY for a final return (null otherwise) so the short-year
// deadline is applied to the exact year that was cut short and nothing else.
export function isYearDelinquent(
  taxYear: number,
  dissolvedAt?: Date | string | null,
): boolean {
  return Date.now() > filingDueDateUtc(taxYear, dissolvedAt);
}

// Both factories build a NEW schema on every call and read the upper bound from
// maxSelectableTaxYear() at that moment (which reads the clock — see its note).
// Nothing here closes over the module-level lastCompletedTaxYear/currentTaxYear
// constants: a server process alive across New Year's Eve would otherwise keep
// rejecting the year that just became filable until it restarted.
export function makeYearScopeSchema(isFinalReturn: boolean) {
  return z.object({
    taxYears: z
      .array(z.number().int().min(2018).max(maxSelectableTaxYear(isFinalReturn)))
      .min(1, "Select at least one year"),
  });
}

export function makeYearDataSchema(isFinalReturn: boolean) {
  return z.object({
    taxYear: z.number().int().min(2018).max(maxSelectableTaxYear(isFinalReturn)),
    totalAssetsYearEnd: z.coerce.number().min(0),
    contributions: z.coerce.number().min(0),
    distributions: z.coerce.number().min(0),
    noReportableTransactions: z.boolean().optional(),
  });
}

// Ordinary (non-final-return) bounds. Kept as standalone exports because most
// call sites have no final-return context and must stay capped at the last
// completed year; the factories above are the opt-in for the exception.
// NOTE: these are built ONCE at module load, so their upper bound freezes at
// the year the process started. Validation paths must call the factories (which
// re-read the clock); these constants exist for the derived types below and for
// one-shot/per-request use.
export const yearScopeSchema = makeYearScopeSchema(false);

export const yearDataSchema = makeYearDataSchema(false);

export const yearDataListSchema = z.object({
  years: z.array(yearDataSchema).min(1),
});

// A single Part IV/V reportable transaction. These amounts become the actual
// dollar figures on the IRS forms, so validate strictly: amountCents must be a
// finite integer (no NaN/"abc"), and the descriptive fields must be non-empty.
export const reportableTransactionSchema = z.object({
  date: z.string().trim().min(1),
  description: z.string().trim().min(1),
  counterparty: z.string().trim().optional(),
  amountCents: z.number().int().finite(),
  category: z.string().trim().min(1),
});
export const reportableTransactionsSchema = z.array(reportableTransactionSchema);

export type EntityForm = z.infer<typeof entitySchema>;
export type OwnerForm = z.infer<typeof ownerSchema>;
export type YearScopeForm = z.infer<typeof yearScopeSchema>;
export type YearDataForm = z.infer<typeof yearDataSchema>;
