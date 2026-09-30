// The Form 1120 due-date rule, in one place. A foreign-owned U.S. DE files its
// pro forma Form 1120 with Form 5472 attached "by the due date (including
// extensions) of that Form 1120" (Form 5472 instructions), so this is also the
// Form 5472 due-date rule. Shared by:
// - src/lib/schemas.ts filingDueDateUtc / effectiveDueDateUtc (the filing
//   workflow, emails, admin, PDF generator and the Form 5472 deadline
//   calculator), and
// - src/lib/tools/compliance-calendar/federal.ts federalDueFor (fiscal years).
// Pure: no clock, no time zone, no weekend roll (callers roll with
// nextBusinessDay() from src/lib/federalHolidays.ts, after picking the date
// that governs). Verbatim sources: docs/research/deadline-calculator.md and
// docs/research/compliance-calendar.md.
//
// General rule: "the 15th day of the 4th month after the end of its tax year"
// (Form 1120 instructions, When To File; IRC §6072(a)), and Form 7004 gives an
// automatic extension that "is generally 6 months" (Form 7004 instructions).
//
// June rule: "a corporation with a fiscal tax year ending June 30 must file by
// the 15th day of the 3rd month after the end of its tax year. A corporation
// with a short tax year ending anytime in June will be treated as if the short
// year ended on June 30" (Form 1120 instructions), and "C corporations with tax
// years ending June 30 and beginning before January 1, 2026, are eligible for
// an automatic 7-month extension" (Form 7004 instructions). Statute: Pub. L.
// 114-41 §2006(a)(3)(B) (the 4th-month due date applies to June 30 years only
// for "taxable years beginning after December 31, 2025") and §2006(c)(1)(B)
// (IRC §6081(b): "7 months" for a year that "ends on June 30 and begins before
// January 1, 2026"). The day inside June never matters: the due date is always
// the 15th of a month counted from the month the year ends in.

/** The June rule applies only to tax years that begin before this date. */
export const JUNE_30_RULE_ENDS_FOR_YEARS_BEGINNING = "2026-01-01";

export type Form1120DueRule = {
  /** True when the pre-2026 June 30 rule applies (3rd month, 7-month extension). */
  june30Transition: boolean;
  /** The due date is the 15th day of this many months after the end month. */
  monthsAfterEnd: 3 | 4;
  /** Length of the automatic Form 7004 extension, counted from the unrolled due date. */
  extensionMonths: 6 | 7;
};

export type Form1120StatutoryDue = Form1120DueRule & {
  /** UTC midnight of the original due date, before any §7503 roll. */
  originalStatutoryUtc: number;
  /** UTC midnight of the extended due date (original + extension, day 15), before any roll. */
  extendedStatutoryUtc: number;
};

/**
 * Which due-date rule governs a tax year.
 * @param taxYearStart first day of the tax year, "YYYY-MM-DD" (compared as a string)
 * @param endMonth month the tax year ends in, 1-12 (a short year ending anytime
 *   in June counts as ending June 30)
 */
export function form1120DueRule(taxYearStart: string, endMonth: number): Form1120DueRule {
  const june30Transition = endMonth === 6 && taxYearStart < JUNE_30_RULE_ENDS_FOR_YEARS_BEGINNING;
  return june30Transition
    ? { june30Transition, monthsAfterEnd: 3, extensionMonths: 7 }
    : { june30Transition, monthsAfterEnd: 4, extensionMonths: 6 };
}

/**
 * The statutory (unrolled) original and extended due dates of a tax year.
 * Month overflow is normalised by Date.UTC (December + 4 → April of next year).
 * @param taxYearStart first day of the tax year, "YYYY-MM-DD"
 * @param endYear year the tax year ends in
 * @param endMonth month the tax year ends in, 1-12
 */
export function form1120StatutoryDue(
  taxYearStart: string,
  endYear: number,
  endMonth: number,
): Form1120StatutoryDue {
  const rule = form1120DueRule(taxYearStart, endMonth);
  const originalMonthIndex = endMonth - 1 + rule.monthsAfterEnd;
  return {
    ...rule,
    originalStatutoryUtc: Date.UTC(endYear, originalMonthIndex, 15),
    extendedStatutoryUtc: Date.UTC(endYear, originalMonthIndex + rule.extensionMonths, 15),
  };
}
