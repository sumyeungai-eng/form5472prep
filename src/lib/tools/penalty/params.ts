// Shareable-URL state for /form-5472-penalty-calculator:
//   ?llcs=2&years=3&notice=2026-03-02
// - llcs:   number of LLCs (1-10), omitted when 1
// - years:  unfiled tax years per LLC (1-6), omitted when 1
// - notice: date of the IRS notice (YYYY-MM-DD, not after today), omitted when none
// Parsing is forgiving: anything outside the form's own choices falls back to
// the default, so a tampered link can't produce an estimate the form itself
// could not. A shared link with a notice date is re-estimated as of the
// viewer's today, because continuation periods keep accruing.

export const FORM_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const YEAR_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

export const PENALTY_PARAMS = ["llcs", "years", "notice"] as const;

export type PenaltyInput = {
  formCount: number;
  yearCount: number;
  /** YYYY-MM-DD, or null when no IRS notice has been received. */
  noticeDate: string | null;
};

export const DEFAULT_PENALTY_INPUT: PenaltyInput = { formCount: 1, yearCount: 1, noticeDate: null };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar date written as YYYY-MM-DD (rejects 2026-02-30 and friends). */
export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function parseChoice(value: string | null, choices: readonly number[], fallback: number): number {
  if (value === null || !/^\d{1,2}$/.test(value.trim())) return fallback;
  const parsed = Number(value.trim());
  return choices.includes(parsed) ? parsed : fallback;
}

/** `today` is the viewer's local date (YYYY-MM-DD), the same bound as the date input's max. */
export function parsePenaltyParams(search: string | URLSearchParams, today: string): PenaltyInput {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const rawNotice = params.get("notice")?.trim() ?? "";
  return {
    formCount: parseChoice(params.get("llcs"), FORM_COUNT_OPTIONS, DEFAULT_PENALTY_INPUT.formCount),
    yearCount: parseChoice(params.get("years"), YEAR_COUNT_OPTIONS, DEFAULT_PENALTY_INPUT.yearCount),
    noticeDate: isIsoDate(rawNotice) && rawNotice <= today ? rawNotice : null,
  };
}

/**
 * Write the inputs into `existing` (other params such as utm_* are kept) and
 * return the query string without a leading "?". Defaults are left out, so
 * the untouched calculator keeps its plain URL.
 */
export function penaltyQuery(input: PenaltyInput, existing?: string | URLSearchParams): string {
  const params = new URLSearchParams(existing ?? "");
  for (const key of PENALTY_PARAMS) params.delete(key);
  if (input.formCount !== DEFAULT_PENALTY_INPUT.formCount) params.set("llcs", String(input.formCount));
  if (input.yearCount !== DEFAULT_PENALTY_INPUT.yearCount) params.set("years", String(input.yearCount));
  if (input.noticeDate && isIsoDate(input.noticeDate)) params.set("notice", input.noticeDate);
  return params.toString();
}
