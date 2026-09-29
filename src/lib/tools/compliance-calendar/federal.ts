// Federal deadlines for a foreign-owned single-member LLC (a "foreign-owned
// U.S. DE"): Form 5472 attached to a pro forma Form 1120, and the optional
// Form 7004 extension. Pure functions only — no clock reads; callers pass
// "today". Sources and verbatim quotes: docs/research/compliance-calendar.md.
//
// Rules implemented (all retrieved 2026-09-29):
// - Due date = due date of Form 1120: "the 15th day of the 4th month after the
//   end of its tax year" (Form 1120 instructions, When To File), and a new
//   entity's short first year is due "by the 15th day of the 4th month after
//   the short period ends".
// - June 30 fiscal years beginning before 1 January 2026: "the 15th day of the
//   3rd month" (Form 1120 instructions) and a 7-month Form 7004 extension
//   (Form 7004 instructions); Pub. L. 114-41 §2006(a)(3)(B) ends that special
//   rule for taxable years beginning after 31 December 2025.
// - Form 7004: "The automatic extension period for time to file is generally 6
//   months" (Form 7004 instructions; Treas. Reg. §1.6081-3(a)), and the DE
//   "must file Form 7004 by the regular due date of the return" (Form 5472
//   instructions).
// - Weekend / holiday roll: IRC §7503 — next day that is not a Saturday,
//   Sunday or District of Columbia legal holiday. Reuses the site's existing
//   holiday table (src/lib/federalHolidays.ts) so this tool and the Form 5472
//   deadline calculator can never disagree.

import { nextBusinessDay } from "@/lib/federalHolidays";
import {
  type IsoDate,
  addDays,
  compareIso,
  isoFromUtcMs,
  lastDayOfMonth,
  monthsAfter,
  parseIsoDate,
  utcMs,
} from "@/lib/tools/state-fees/dates";

export const FEDERAL_SOURCES = {
  i5472: {
    url: "https://www.irs.gov/instructions/i5472",
    label: "IRS — Instructions for Form 5472 (Rev. December 2024)",
  },
  i1120: {
    url: "https://www.irs.gov/instructions/i1120",
    label: "IRS — Instructions for Form 1120 (2025), When To File",
  },
  i7004: {
    url: "https://www.irs.gov/instructions/i7004",
    label: "IRS — Instructions for Form 7004 (Rev. December 2025)",
  },
  irc7503: {
    url: "https://www.law.cornell.edu/uscode/text/26/7503",
    label: "26 U.S.C. § 7503 — weekend and legal-holiday rule",
  },
  june30Rule: {
    url: "https://www.govinfo.gov/content/pkg/PLAW-114publ41/html/PLAW-114publ41.htm",
    label: "Pub. L. 114-41 § 2006(a)(3)(B) — June 30 fiscal-year transition",
  },
  boi: {
    url: "https://www.fincen.gov/boi",
    label: "FinCEN — Beneficial Ownership Information Reporting",
  },
} as const;

// The June 30 special rule applies only to tax years that begin before this date.
export const JUNE_30_RULE_ENDS_FOR_YEARS_BEGINNING = "2026-01-01";

export type TaxYear = {
  start: IsoDate;
  end: IsoDate;
  // True for the first (short) year that starts on the formation date.
  first: boolean;
};

export type FederalDue = {
  taxYear: TaxYear;
  june30Transition: boolean;
  originalStatutory: IsoDate;
  originalDue: IsoDate;
  extensionMonths: 6 | 7;
  extendedStatutory: IsoDate;
  extendedDue: IsoDate;
};

export function isValidFyeMonth(month: number): boolean {
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

// IRC §7503 roll to the next day that is not a Saturday, Sunday or DC legal holiday.
export function rollToBusinessDay(date: IsoDate): IsoDate {
  return isoFromUtcMs(nextBusinessDay(new Date(utcMs(date))).getTime());
}

// Tax years of the LLC from formation until the last one ending on or before
// `lastEnd`. The first year is short: it starts on the formation date and ends
// on the first fiscal-year end on or after it.
export function taxYearsFrom(formed: IsoDate, fyeMonth: number, lastEnd: IsoDate): TaxYear[] {
  const f = parseIsoDate(formed);
  if (!f || !isValidFyeMonth(fyeMonth)) return [];
  const years: TaxYear[] = [];
  let endYear = f.y;
  if (compareIso(lastDayOfMonth(f.y, fyeMonth), formed) < 0) endYear += 1;
  let start = formed;
  // Hard cap keeps a bad input from looping; 250 years is far beyond any real LLC.
  for (let i = 0; i < 250; i += 1) {
    const end = lastDayOfMonth(endYear, fyeMonth);
    if (compareIso(end, lastEnd) > 0) break;
    years.push({ start, end, first: i === 0 });
    start = addDays(end, 1);
    endYear += 1;
  }
  return years;
}

export function federalDueFor(taxYear: TaxYear): FederalDue {
  const end = parseIsoDate(taxYear.end);
  if (!end) throw new Error(`Invalid tax year end: ${taxYear.end}`);
  const june30Transition =
    end.m === 6 && compareIso(taxYear.start, JUNE_30_RULE_ENDS_FOR_YEARS_BEGINNING) < 0;
  const monthsAfterEnd = june30Transition ? 3 : 4;
  const extensionMonths: 6 | 7 = june30Transition ? 7 : 6;
  const originalStatutory = monthsAfter(end.y, end.m, monthsAfterEnd, 15);
  const o = parseIsoDate(originalStatutory)!;
  // The extension runs from the statutory (unrolled) date; the roll is applied
  // to whichever date actually governs — same order as effectiveDueDateUtc().
  const extendedStatutory = monthsAfter(o.y, o.m, extensionMonths, 15);
  return {
    taxYear,
    june30Transition,
    originalStatutory,
    originalDue: rollToBusinessDay(originalStatutory),
    extensionMonths,
    extendedStatutory,
    extendedDue: rollToBusinessDay(extendedStatutory),
  };
}

export function federalDueDates(formed: IsoDate, fyeMonth: number, lastEnd: IsoDate): FederalDue[] {
  return taxYearsFrom(formed, fyeMonth, lastEnd).map(federalDueFor);
}
