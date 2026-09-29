// Types for the state LLC fee table and the compliance calendar's state
// deadlines. Data lives in ./data.ts; the date engine in ./rules.ts.

export const STATE_CODES = ["DE", "WY", "NM", "FL", "TX", "NV", "NY", "CA", "CO", "MT"] as const;
export type StateCode = (typeof STATE_CODES)[number];

export function isStateCode(value: string | null | undefined): value is StateCode {
  return !!value && (STATE_CODES as readonly string[]).includes(value);
}

export type SourceRef = {
  url: string;
  label: string; // e.g. "Delaware Division of Corporations — LLC tax instructions"
};

// How a recurring (or one-time) state deadline is computed. Months are 1-12.
export type DueRule =
  // Nothing recurring to file (e.g. New Mexico LLCs).
  | { kind: "none" }
  // Same calendar date every year, the first one in the year after formation
  // (e.g. Delaware June 1, Florida May 1, Texas May 15, Montana April 15).
  | { kind: "fixed-date"; month: number; day: number; firstYearOffset: number }
  // A day in the LLC's anniversary month (the month it was formed), every
  // `everyYears` years, the first one `firstYearOffset` years after formation.
  | { kind: "anniversary-month"; day: "first" | "last"; everyYears: 1 | 2; firstYearOffset: number }
  // The last day of the month that is `monthsAfter` months after the LLC's
  // anniversary month (its formation month), every year from
  // `firstYearOffset` years after formation. Colorado: "no later than the last
  // day of the second calendar month following the first anniversary of the
  // calendar month" of formation, then annually (C.R.S. § 7-90-501(4)(c)(I)).
  | { kind: "months-after-anniversary"; monthsAfter: number; firstYearOffset: number }
  // The `day` of the `monthOfTaxYear`-th month of each taxable year, counting
  // the month the taxable year begins as month 1 (California's annual LLC tax:
  // "15th day of the 4th month" of the taxable year). The first taxable year
  // begins on the formation date.
  | { kind: "tax-year-month"; monthOfTaxYear: number; day: number }
  // The `day` of the month that is `monthsAfter` months after each tax-year
  // end (e.g. a state return "due the 15th day of the 4th month after the close
  // of your tax year"), from the first (short) year after formation.
  | { kind: "after-tax-year-end"; monthsAfter: number; day: number }
  // One-time: a number of days after formation (e.g. a first report).
  | { kind: "days-after-formation"; days: number };

export type StateObligation = {
  id: string; // stable slug, used in .ics UIDs: "de-annual-tax"
  name: string; // "Annual LLC tax"
  amount: string; // display: "$400", "$60 minimum", "$0"
  // Lowest amount in USD for one occurrence, used for sorting; null = varies/unknown.
  amountUsd: number | null;
  frequency: "annual" | "biennial" | "one-time";
  due: string; // human-readable due-date rule
  rule: DueRule;
  // Whether the calendar should list it (conditional or unverifiable items are table-only).
  inCalendar: boolean;
  appliesTo?: string; // condition, e.g. "Only if total revenue exceeds …"
  late?: string; // late penalty, only when the source states it
  source: SourceRef; // the page that shows the amount
  // Further official pages, e.g. the statute that sets the due-date rule.
  moreSources?: SourceRef[];
  verified: boolean;
};

export type StateFees = {
  code: StateCode;
  name: string;
  // Headline for the comparison table.
  feeName: string;
  headlineAmount: string;
  // Minimum recurring cost per year in USD for sorting (biennial fees halved).
  minYearlyUsd: number;
  headlineDue: string;
  annualReport: "yes" | "no" | "biennial";
  reportName: string | null;
  authority: string;
  // Official pages backing the headline row of the comparison table.
  primarySource: SourceRef;
  moreRowSources?: SourceRef[];
  obligations: StateObligation[];
  notes: string[];
};
