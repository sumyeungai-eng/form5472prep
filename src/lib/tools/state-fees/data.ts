// Recurring state fees, taxes and reports for a DOMESTIC LLC in the ten states
// foreign owners use most. Every figure comes from the state's own site or
// statute — URLs and verbatim quotes are in docs/research/state-fees.md
// (retrieved 2026-09-29). If a rule could not be verified from a primary
// source, the obligation is marked verified: false / inCalendar: false and the
// page says "verify with the state" instead of guessing.
//
// Update checklist when a state changes a fee: amount + amountUsd +
// minYearlyUsd + headline strings + the research note + LAST_REVIEWED.

import type { StateCode, StateFees } from "./types";

export const LAST_REVIEWED = "2026-09-29";
export const LAST_REVIEWED_LABEL = "29 September 2026";

// Kept together so a URL change is one edit.
const SRC = {
  deTax: {
    url: "https://corp.delaware.gov/alt-entitytaxinstructions/",
    label: "Delaware Division of Corporations — LLC, LP and GP tax instructions",
  },
  deHb400: {
    url: "https://legis.delaware.gov/BillDetail/143069",
    label: "Delaware House Bill 400 (LLC tax $300 → $400 from 1 January 2026)",
  },
  wyFees: {
    url: "https://sos.wyo.gov/Business/Docs/BusinessFees.pdf",
    label: "Wyoming Secretary of State — Business fee schedule",
  },
  wyStatute: {
    url: "https://wyoleg.gov/statutes/compress/title17.pdf",
    label: "Wyoming Statutes § 17-29-209 — Annual report",
  },
  nmStatute: {
    url: "https://nmonesource.com/nmos/nmsa/en/4400/1/document.do",
    label: "New Mexico Statutes § 53-19-63 — LLC fee schedule (official NMSA)",
  },
  flAnnualReport: {
    url: "https://dos.fl.gov/sunbiz/manage-business/efile/annual-report/",
    label: "Florida Division of Corporations (Sunbiz) — Annual report",
  },
  flStatute: {
    url: "https://www.flsenate.gov/Laws/Statutes/2025/605.0212",
    label: "Florida Statutes § 605.0212 — Annual report",
  },
  nvList: {
    url: "https://www.leg.state.nv.us/NRS/NRS-086.html",
    label: "Nevada Revised Statutes § 86.263 — Annual list",
  },
  nvLicense: {
    url: "https://www.leg.state.nv.us/NRS/NRS-076.html",
    label: "Nevada Revised Statutes § 76.130 — State business license",
  },
  txFranchise: {
    url: "https://comptroller.texas.gov/taxes/franchise/",
    label: "Texas Comptroller — Franchise tax",
  },
  nyBiennial: {
    url: "https://dos.ny.gov/biennial-statements-business-corporations-and-limited-liability-companies",
    label: "New York Department of State — Biennial statements",
  },
  nyPublication: {
    url: "https://www.nysenate.gov/legislation/laws/LLC/206",
    label: "New York LLC Law § 206 — Publication",
  },
  nyFilingFee: {
    url: "https://www.tax.ny.gov/pdf/current_forms/it/it204lli.pdf",
    label: "NY Department of Taxation — Form IT-204-LL instructions",
  },
  caLlc: {
    url: "https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html",
    label: "California Franchise Tax Board — Limited liability company",
  },
  caDueDates: {
    url: "https://www.ftb.ca.gov/file/when-to-file/due-dates-business.html",
    label: "California Franchise Tax Board — Business due dates",
  },
  caSoi: {
    url: "https://www.sos.ca.gov/business-programs/business-entities/forms/limited-liability-companies-statement-information",
    label: "California Secretary of State — LLC Statement of Information",
  },
  coFees: {
    url: "https://www.sos.state.co.us/pubs/info_center/fees/business.html",
    label: "Colorado Secretary of State — Business fees",
  },
  coReports: {
    url: "https://www.sos.state.co.us/pubs/business/FAQs/reports.html",
    label: "Colorado Secretary of State — Periodic reports FAQ",
  },
  mtFees: {
    url: "https://sosmt.gov/business/fees/",
    label: "Montana Secretary of State — Business fees",
  },
  mtStatute: {
    url: "https://mca.legmt.gov/bills/mca/title_0350/chapter_0080/part_0020/section_0080/0350-0080-0020-0080.html",
    label: "Montana Code Annotated § 35-8-208 — Annual report",
  },
} as const;

const TEXAS: StateFees = {
  code: "TX",
  name: "Texas",
  feeName: "Franchise tax report + Public Information Report",
  headlineAmount: "$0 tax if revenue ≤ $2.65M",
  minYearlyUsd: 0,
  headlineDue: "15 May each year",
  annualReport: "yes",
  reportName: "Public Information Report (Form 05-102), filed with the Comptroller",
  authority: "Texas Comptroller of Public Accounts",
  primarySource: SRC.txFranchise,
  obligations: [
    {
      id: "tx-franchise",
      name: "Franchise tax report + Public Information Report",
      amount: "$0 tax at or below $2.65M revenue",
      amountUsd: 0,
      frequency: "annual",
      due: "Due 15 May each year, from the year after the LLC registers with the Secretary of State. If 15 May falls on a weekend or holiday, it is due the next business day.",
      rule: { kind: "fixed-date", month: 5, day: 15, firstYearOffset: 1 },
      inCalendar: true,
      appliesTo:
        "Below the no-tax-due threshold no franchise tax report is required from the 2024 report year, but the Public Information Report still is.",
      late: "$50 for each report filed late, even if no tax is due",
      source: SRC.txFranchise,
      verified: true,
    },
  ],
  notes: [
    "Reports due in 2026 and 2027 use a $2,650,000 no-tax-due revenue threshold (it was $2,470,000 for 2024–2025).",
    "Texas LLCs file annually with the Comptroller, not with the Secretary of State.",
    "Missing the Public Information Report can cost the LLC its right to do business in Texas.",
  ],
};

const NEW_YORK: StateFees = {
  code: "NY",
  name: "New York",
  feeName: "Biennial statement",
  headlineAmount: "$9 every 2 years",
  minYearlyUsd: 4.5,
  headlineDue: "Every 2 years, in the month the LLC was formed",
  annualReport: "biennial",
  reportName: "Biennial statement (Department of State)",
  authority: "New York Department of State",
  primarySource: SRC.nyBiennial,
  obligations: [
    {
      id: "ny-biennial",
      name: "Biennial statement",
      amount: "$9",
      amountUsd: 9,
      frequency: "biennial",
      due: "Every two years, during the calendar month the articles of organization were filed (shown here as the last day of that month).",
      rule: { kind: "anniversary-month", day: "last", everyYears: 2, firstYearOffset: 2 },
      inCalendar: true,
      late: "state records show the LLC as past due until it files",
      source: SRC.nyBiennial,
      verified: true,
    },
    {
      id: "ny-publication",
      name: "Publication requirement (one time)",
      amount: "Newspaper costs + $50 certificate fee",
      amountUsd: 50,
      frequency: "one-time",
      due: "Within 120 days after formation: publish a notice once a week for six weeks in two newspapers of the county, and file the Certificate of Publication with the Department of State.",
      rule: { kind: "days-after-formation", days: 120 },
      inCalendar: true,
      late: "the LLC's authority to do business in New York is suspended until it complies",
      source: SRC.nyPublication,
      verified: true,
    },
    {
      id: "ny-filing-fee",
      name: "LLC filing fee (Form IT-204-LL)",
      amount: "$25 for a single-member LLC",
      amountUsd: 25,
      frequency: "annual",
      due: "15th day of the 3rd month after the tax year ends.",
      rule: { kind: "after-tax-year-end", monthsAfter: 3, day: 15 },
      inCalendar: false,
      appliesTo: "Only if the LLC has income, gain, loss or deduction from New York sources.",
      source: SRC.nyFilingFee,
      verified: true,
    },
  ],
  notes: [
    "The one-time publication requirement is often the largest New York cost; newspaper charges vary by county.",
    "The $25 filing fee applies only to LLCs with New York-source income, gain, loss or deduction.",
  ],
};

const CALIFORNIA: StateFees = {
  code: "CA",
  name: "California",
  feeName: "Annual LLC tax (FTB 3522)",
  headlineAmount: "$800 + fee if income ≥ $250k",
  minYearlyUsd: 810,
  headlineDue: "15th day of the 4th month of the tax year (15 April for a calendar year)",
  annualReport: "biennial",
  reportName: "Statement of Information (LLC-12), every 2 years",
  authority: "California Franchise Tax Board and Secretary of State",
  primarySource: SRC.caLlc,
  obligations: [
    {
      id: "ca-annual-tax",
      name: "Annual LLC tax (FTB 3522)",
      amount: "$800",
      amountUsd: 800,
      frequency: "annual",
      due: "15th day of the 4th month of each tax year — 15 April for a calendar-year LLC. The first payment is due the 15th day of the 4th month after the LLC files with the Secretary of State.",
      rule: { kind: "tax-year-month", monthOfTaxYear: 4, day: 15 },
      inCalendar: true,
      appliesTo: "Due every year until the LLC is cancelled, even if it does no business.",
      source: SRC.caLlc,
      verified: true,
    },
    {
      id: "ca-568",
      name: "Form 568 (LLC return)",
      amount: "No fee — return only",
      amountUsd: 0,
      frequency: "annual",
      due: "15th day of the 4th month after the tax year ends, for a single-member LLC owned by an individual (extended due date: 15th day of the 10th month).",
      rule: { kind: "after-tax-year-end", monthsAfter: 4, day: 15 },
      inCalendar: true,
      source: SRC.caDueDates,
      verified: true,
    },
    {
      id: "ca-soi-initial",
      name: "Initial Statement of Information (LLC-12)",
      amount: "$20",
      amountUsd: 20,
      frequency: "one-time",
      due: "Within 90 days of registering with the Secretary of State.",
      rule: { kind: "days-after-formation", days: 90 },
      inCalendar: true,
      source: SRC.caSoi,
      verified: true,
    },
    {
      id: "ca-soi",
      name: "Statement of Information (LLC-12)",
      amount: "$20",
      amountUsd: 20,
      frequency: "biennial",
      due: "Every two years, during the formation month or the five months before it (shown here as the last day of the formation month).",
      rule: { kind: "anniversary-month", day: "last", everyYears: 2, firstYearOffset: 2 },
      inCalendar: true,
      late: "$250 penalty if still not filed 60 days after the state's delinquency notice",
      source: SRC.caSoi,
      verified: true,
    },
    {
      id: "ca-llc-fee",
      name: "LLC fee (FTB 3536)",
      amount: "$900–$11,790",
      amountUsd: 900,
      frequency: "annual",
      due: "Estimate due by the 15th day of the 6th month of the tax year.",
      rule: { kind: "tax-year-month", monthOfTaxYear: 6, day: 15 },
      inCalendar: false,
      appliesTo: "Only if the LLC's total California income is $250,000 or more.",
      source: SRC.caLlc,
      verified: true,
    },
  ],
  notes: [
    "The first-year exemption from the $800 tax covered only tax years beginning 2021 to 2023; LLCs formed since then pay it in their first year.",
    "No tax or fee is due for a first tax year of 15 days or fewer in which the LLC did no business in California.",
    "The LLC fee (FTB 3536) is on top of the $800 and applies only from $250,000 of California income.",
  ],
};

const COLORADO: StateFees = {
  code: "CO",
  name: "Colorado",
  feeName: "Periodic report",
  headlineAmount: "$25",
  minYearlyUsd: 25,
  headlineDue: "Around your LLC's Periodic Report Month — verify with the state",
  annualReport: "yes",
  reportName: "Periodic report (Secretary of State)",
  authority: "Colorado Secretary of State",
  primarySource: SRC.coFees,
  obligations: [
    {
      id: "co-periodic",
      name: "Periodic report",
      amount: "$25",
      amountUsd: 25,
      frequency: "annual",
      due: "File from two months before to two months after the LLC's Periodic Report Month without penalty. The month is shown on the LLC's Colorado Secretary of State summary page — verify it with the state.",
      rule: { kind: "none" },
      inCalendar: false,
      late: "$50 late filing penalty",
      source: SRC.coReports,
      verified: true,
    },
  ],
  notes: [
    "The periodic report fee rose from $10 to $25 on 1 July 2024 and is filed online only.",
    "We could not confirm from an official source how the Periodic Report Month is assigned, so the calendar does not date this report.",
  ],
};

const MONTANA: StateFees = {
  code: "MT",
  name: "Montana",
  feeName: "Annual report",
  headlineAmount: "$20 (waived if on time in 2026–2027)",
  minYearlyUsd: 20,
  headlineDue: "1 January – 15 April each year",
  annualReport: "yes",
  reportName: "Annual report (Secretary of State)",
  authority: "Montana Secretary of State",
  primarySource: SRC.mtFees,
  obligations: [
    {
      id: "mt-annual-report",
      name: "Annual report",
      amount: "$20 ($0 on time in 2026 and 2027)",
      amountUsd: 20,
      frequency: "annual",
      due: "Between 1 January and 15 April each year, starting the year after the LLC is formed.",
      rule: { kind: "fixed-date", month: 4, day: 15, firstYearOffset: 1 },
      inCalendar: true,
      late: "$35 fee instead of $20 after 15 April",
      source: SRC.mtStatute,
      verified: true,
    },
  ],
  notes: [
    "The Secretary of State waived the on-time annual report fee for 2026 and has announced the waiver again for 2027; the $35 late fee still applies.",
  ],
};

const DELAWARE: StateFees = {
  code: "DE",
  name: "Delaware",
  feeName: "Annual LLC tax",
  headlineAmount: "$400",
  minYearlyUsd: 400,
  headlineDue: "1 June each year, for the previous year",
  annualReport: "no",
  reportName: null,
  authority: "Delaware Division of Corporations",
  primarySource: SRC.deTax,
  obligations: [
    {
      id: "de-annual-tax",
      name: "Annual LLC tax",
      amount: "$400",
      amountUsd: 400,
      frequency: "annual",
      due: "On or before 1 June each year, for the previous calendar year; the year of formation is taxed in full, with no proration. The first $400 payment (tax year 2026) is due 1 June 2027 — the 1 June 2026 payment for 2025 was $300.",
      rule: { kind: "fixed-date", month: 6, day: 1, firstYearOffset: 1 },
      inCalendar: true,
      late: "$200 penalty plus 1.5% interest per month on the tax and penalty",
      source: SRC.deTax,
      verified: true,
    },
  ],
  notes: [
    "House Bill 400 raised the LLC tax from $300 to $400 with effect from 1 January 2026.",
    "Delaware LLCs do not file an annual report — the tax is the only recurring state filing.",
    "If the tax goes unpaid for three years, the LLC's certificate of formation is cancelled.",
  ],
};

const WYOMING: StateFees = {
  code: "WY",
  name: "Wyoming",
  feeName: "Annual report + license tax",
  headlineAmount: "$60 minimum",
  minYearlyUsd: 60,
  headlineDue: "1st day of the anniversary month",
  annualReport: "yes",
  reportName: "Annual report (Secretary of State)",
  authority: "Wyoming Secretary of State",
  primarySource: SRC.wyFees,
  obligations: [
    {
      id: "wy-annual-report",
      name: "Annual report + license tax",
      amount: "$60, or $0.0002 per $1 of Wyoming assets if greater",
      amountUsd: 60,
      frequency: "annual",
      due: "On or before the first day of the month the LLC was formed, every year — the first one in the year after formation.",
      rule: { kind: "anniversary-month", day: "first", everyYears: 1, firstYearOffset: 1 },
      inCalendar: true,
      late: "the LLC can be administratively dissolved if the report is not filed within 60 days",
      source: SRC.wyStatute,
      verified: true,
    },
  ],
  notes: [
    "The asset-based tax only exceeds $60 once assets located and employed in Wyoming pass $300,000.",
  ],
};

const NEW_MEXICO: StateFees = {
  code: "NM",
  name: "New Mexico",
  feeName: "None",
  headlineAmount: "$0",
  minYearlyUsd: 0,
  headlineDue: "No recurring state filing",
  annualReport: "no",
  reportName: null,
  authority: "New Mexico Secretary of State",
  primarySource: SRC.nmStatute,
  obligations: [],
  notes: [
    "New Mexico's LLC Act fee schedule (NMSA § 53-19-63) lists formation, amendment and certificate fees but no annual report or annual fee.",
  ],
};

const FLORIDA: StateFees = {
  code: "FL",
  name: "Florida",
  feeName: "Annual report",
  headlineAmount: "$138.75",
  minYearlyUsd: 138.75,
  headlineDue: "1 January – 1 May each year",
  annualReport: "yes",
  reportName: "Annual report (Division of Corporations)",
  authority: "Florida Department of State, Division of Corporations",
  primarySource: SRC.flAnnualReport,
  obligations: [
    {
      id: "fl-annual-report",
      name: "Annual report",
      amount: "$138.75",
      amountUsd: 138.75,
      frequency: "annual",
      due: "Between 1 January and 1 May each year, starting the year after the articles of organization take effect.",
      rule: { kind: "fixed-date", month: 5, day: 1, firstYearOffset: 1 },
      inCalendar: true,
      late: "$400 late fee after 1 May",
      source: SRC.flStatute,
      verified: true,
    },
  ],
  notes: [
    "$138.75 is the $50 annual report fee plus the $88.75 supplemental fee (Fla. Stat. §§ 605.0213 and 607.193).",
    "LLCs that still have not filed are administratively dissolved in late September (Fla. Stat. § 605.0714).",
  ],
};

const NEVADA: StateFees = {
  code: "NV",
  name: "Nevada",
  feeName: "Annual list + state business license",
  headlineAmount: "$350 ($150 + $200)",
  minYearlyUsd: 350,
  headlineDue: "Last day of the anniversary month",
  annualReport: "yes",
  reportName: "Annual list of managers or managing members",
  authority: "Nevada Secretary of State",
  primarySource: SRC.nvList,
  obligations: [
    {
      id: "nv-annual-list",
      name: "Annual list",
      amount: "$150",
      amountUsd: 150,
      frequency: "annual",
      due: "On or before the last day of the month the LLC was formed, every year after the initial list filed at formation.",
      rule: { kind: "anniversary-month", day: "last", everyYears: 1, firstYearOffset: 1 },
      inCalendar: true,
      late: "$75 penalty",
      source: SRC.nvList,
      verified: true,
    },
    {
      id: "nv-business-license",
      name: "State business license",
      amount: "$200",
      amountUsd: 200,
      frequency: "annual",
      due: "Paid with the annual list, on or before the last day of the anniversary month.",
      rule: { kind: "anniversary-month", day: "last", everyYears: 1, firstYearOffset: 1 },
      inCalendar: true,
      late: "$100 penalty",
      source: SRC.nvLicense,
      verified: true,
    },
  ],
  notes: [
    "The initial list and first business license are due when the articles of organization are filed.",
    "Nevada lets an LLC choose a different annual due date (NRS 86.263); if yours has one, use that month instead.",
  ],
};


export const STATE_FEES: StateFees[] = [
  DELAWARE,
  WYOMING,
  NEW_MEXICO,
  FLORIDA,
  TEXAS,
  NEVADA,
  NEW_YORK,
  CALIFORNIA,
  COLORADO,
  MONTANA,
];

export function getStateFees(code: StateCode): StateFees {
  const found = STATE_FEES.find((s) => s.code === code);
  if (!found) throw new Error(`Unknown state: ${code}`);
  return found;
}
