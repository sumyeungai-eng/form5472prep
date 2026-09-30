// Shareable-URL state for /form-5472-deadline-calculator:
//   ?year=2025&dissolved=2025-06-30&ext=1
// - year:      the tax year (must be one of the years the calculator offers)
// - dissolved: the dissolution date, only for a final short year (must fall in `year`)
// - ext:       "1" when a timely Form 7004 was filed
// Parsing is forgiving: a bad or out-of-range value falls back to the default
// (and a dissolution date outside the chosen year is dropped) so a tampered
// link can never produce a date the form itself would not allow. Serialising
// is canonical so the same inputs always give the same URL.

export type DeadlineInput = {
  taxYear: number;
  /** YYYY-MM-DD inside `taxYear`, or null when the LLC did not dissolve. */
  dissolvedAt: string | null;
  extension: boolean;
};

export const DEADLINE_PARAMS = ["year", "dissolved", "ext"] as const;

/** The seven tax years the calculator offers: this UTC year and the six before it. */
export function taxYearOptions(currentUtcYear: number): number[] {
  return Array.from({ length: 7 }, (_, index) => currentUtcYear - index);
}

/** The last completed tax year when it is offered, else the newest option. */
export function defaultTaxYear(options: readonly number[], lastCompleted: number): number {
  return options.includes(lastCompleted) ? lastCompleted : options[0];
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar date written as YYYY-MM-DD (rejects 2025-02-30 and friends). */
export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Same bounds as the form's date input (min Jan 1, max Dec 31 of the tax year). */
export function isDissolutionInYear(value: string, taxYear: number): boolean {
  return isIsoDate(value) && value >= `${taxYear}-01-01` && value <= `${taxYear}-12-31`;
}

export function parseDeadlineParams(
  search: string | URLSearchParams,
  options: { years: readonly number[]; defaultYear: number },
): DeadlineInput {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;

  const rawYear = params.get("year")?.trim() ?? "";
  const parsedYear = /^\d{4}$/.test(rawYear) ? Number(rawYear) : NaN;
  const taxYear = options.years.includes(parsedYear) ? parsedYear : options.defaultYear;

  const rawDissolved = params.get("dissolved")?.trim() ?? "";
  const dissolvedAt = isDissolutionInYear(rawDissolved, taxYear) ? rawDissolved : null;

  return { taxYear, dissolvedAt, extension: params.get("ext") === "1" };
}

/** True when the query carries any of the calculator's own keys. */
export function hasDeadlineParams(search: string | URLSearchParams): boolean {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return DEADLINE_PARAMS.some((key) => params.has(key));
}

/**
 * Write the inputs into `existing` (other params such as utm_* are kept) and
 * return the query string without a leading "?". `year` is always written
 * because the default year moves every January; the other keys only when set.
 */
export function deadlineQuery(input: DeadlineInput, existing?: string | URLSearchParams): string {
  const params = new URLSearchParams(existing ?? "");
  for (const key of DEADLINE_PARAMS) params.delete(key);
  params.set("year", String(input.taxYear));
  if (input.dissolvedAt && isDissolutionInYear(input.dissolvedAt, input.taxYear)) {
    params.set("dissolved", input.dissolvedAt);
  }
  if (input.extension) params.set("ext", "1");
  return params.toString();
}
