// Form 5472 statistics and key figures, rendered on /form-5472-statistics.
//
// YMYL data file. Every figure below was read directly from the official
// source in `sourceUrl` on STATS_LAST_REVIEWED; the quoted source sentence for
// each one is in docs/seo/stats-sources-2026-10-05.md. Rules for editors:
//   - Only official sources (see OFFICIAL_SOURCE_DOMAINS). No blog numbers.
//   - State figures exactly as the source does. No rounding, no estimates of
//     our own, no "approximately" the source does not use.
//   - Re-check every fact against its source before bumping
//     STATS_LAST_REVIEWED, and update the evidence file in the same commit.
//   - No prices here; prices only come from src/lib/pricing.ts.

export const STATS_LAST_REVIEWED = "2026-10-05";
export const STATS_LAST_REVIEWED_LABEL = "5 October 2026";

/** Hosts a sourceUrl may point at (the host itself or a subdomain of it). */
export const OFFICIAL_SOURCE_DOMAINS = [
  "irs.gov",
  "ecfr.gov",
  "law.cornell.edu",
  "federalregister.gov",
  "congress.gov",
  "govinfo.gov",
  "gao.gov",
  "tigta.gov",
] as const;

export type StatCategory =
  | "penalties"
  | "enforcement"
  | "who-files"
  | "deadlines"
  | "records"
  | "irs-data";

export type Form5472Stat = {
  id: string;
  /** The stat stated plainly, 20 words or fewer. */
  headline: string;
  /** One or two sentences of context. */
  detail: string;
  /** The figure itself, as displayed in the stat card. */
  figure: string;
  sourceLabel: string;
  sourceUrl: string;
  /** Year / period / version the figure covers. */
  period: string;
  category: StatCategory;
  editorsPick?: boolean;
};

export const STAT_CATEGORIES: Array<{ id: StatCategory; question: string; intro: string }> = [
  {
    id: "penalties",
    question: "How much is the Form 5472 penalty?",
    intro: "The penalty amounts are set by statute in Internal Revenue Code section 6038A(d).",
  },
  {
    id: "enforcement",
    question: "How does the IRS enforce Form 5472 penalties?",
    intro: "How penalties are assessed, how often they are abated, and how long the IRS can assess tax.",
  },
  {
    id: "who-files",
    question: "Who has to file Form 5472?",
    intro: "Ownership thresholds and the 2016 rule that brought foreign-owned single-member LLCs in.",
  },
  {
    id: "deadlines",
    question: "When is Form 5472 due?",
    intro: "Form 5472 is attached to a (pro forma) Form 1120 and follows that return's due date.",
  },
  {
    id: "records",
    question: "How much recordkeeping does Form 5472 involve?",
    intro: "IRS time estimates and the regulation deadlines for producing records.",
  },
  {
    id: "irs-data",
    question: "What does IRS data show about Form 5472 filers?",
    intro:
      "IRS Statistics of Income (SOI) publishes Form 5472 data only for foreign-owned domestic corporations with total receipts of $500 million or more. It does not cover small LLCs.",
  },
];

const I5472 = "https://www.irs.gov/instructions/i5472";
const IRC_6038A = "https://www.law.cornell.edu/uscode/text/26/6038A";
const INTL_PENALTIES = "https://www.irs.gov/payments/international-information-reporting-penalties";
const IRM_20_1_9 = "https://www.irs.gov/irm/part20/irm_20-001-009";
const IRM_21_8_2 = "https://www.irs.gov/irm/part21/irm_21-008-002r";
const TAS_ARC_2020 =
  "https://www.taxpayeradvocate.irs.gov/wp-content/uploads/2021/01/ARC20_MSP_08_International.pdf";
const IRC_6501 = "https://www.law.cornell.edu/uscode/text/26/6501";
const TD_9796 =
  "https://www.federalregister.gov/documents/2016/12/13/2016-29641/treatment-of-certain-domestic-entities-disregarded-as-separate-from-their-owners-as-corporations-for";
const REG_6038A_1 = "https://www.ecfr.gov/current/title-26/section-1.6038A-1";
const REG_6038A_3 = "https://www.ecfr.gov/current/title-26/section-1.6038A-3";
const I1120 = "https://www.irs.gov/instructions/i1120";
const I7004 = "https://www.irs.gov/instructions/i7004";
const SOI_FODC =
  "https://www.irs.gov/statistics/soi-tax-stats-transactions-of-foreign-owned-domestic-corporations";

export const FORM5472_STATS: Form5472Stat[] = [
  // ---- Penalties -----------------------------------------------------------
  {
    id: "initial-penalty",
    headline: "The penalty for not filing Form 5472 is $25,000 per tax year.",
    detail:
      "IRC section 6038A(d)(1) sets a $25,000 penalty for each taxable year in which a reporting corporation fails to furnish the required information or maintain the required records.",
    figure: "$25,000",
    sourceLabel: "26 U.S.C. §6038A(d)(1) (Cornell LII)",
    sourceUrl: IRC_6038A,
    period: "Current statute (amount set by Pub. L. 115-97, 2017)",
    category: "penalties",
    editorsPick: true,
  },
  {
    id: "continuation-penalty",
    headline: "Another $25,000 accrues for each 30-day period a failure continues beyond 90 days after IRS notice.",
    detail:
      "If the failure continues for more than 90 days after the IRS mails a notice, section 6038A(d)(2) adds $25,000 for each 30-day period (or fraction of one) that it continues.",
    figure: "+$25,000 / 30 days",
    sourceLabel: "26 U.S.C. §6038A(d)(2) (Cornell LII)",
    sourceUrl: IRC_6038A,
    period: "Current statute",
    category: "penalties",
  },
  {
    id: "no-maximum",
    headline: "There is no maximum on the Form 5472 continuation penalty.",
    detail:
      "The IRS international information reporting penalties page states, for Form 5472: “There is no maximum penalty amount.”",
    figure: "No cap",
    sourceLabel: "IRS: International information reporting penalties",
    sourceUrl: INTL_PENALTIES,
    period: "IRS page last reviewed 20 August 2026",
    category: "penalties",
    editorsPick: true,
  },
  {
    id: "penalty-increase-2018",
    headline: "The initial penalty rose from $10,000 to $25,000 for tax years beginning on or after January 1, 2018.",
    detail:
      "The Internal Revenue Manual gives the initial penalty as $25,000, or $10,000 for tax years beginning before January 1, 2018.",
    figure: "$10,000 → $25,000",
    sourceLabel: "IRM 20.1.9.5.4, Penalty Computation",
    sourceUrl: IRM_20_1_9,
    period: "Tax years beginning on or after 1 January 2018",
    category: "penalties",
  },
  {
    id: "form-5471-comparison",
    headline: "The comparable Form 5471 penalty is $10,000, with continuation penalties capped at $50,000.",
    detail:
      "The IRS lists $10,000 per failure for Form 5471 with a maximum continuation penalty of $50,000. For Form 5472 the amounts are $25,000 and there is no maximum.",
    figure: "$10,000 / $50,000 cap",
    sourceLabel: "IRS: International information reporting penalties",
    sourceUrl: INTL_PENALTIES,
    period: "IRS page last reviewed 20 August 2026",
    category: "penalties",
  },
  {
    id: "per-related-party",
    headline: "A separate Form 5472 is required for each related party with a reportable transaction.",
    detail:
      "The instructions say to file a separate Form 5472 for each foreign or U.S. related party, and the continuation penalty applies with respect to each related party for which a failure occurs.",
    figure: "1 form per related party",
    sourceLabel: "IRS Instructions for Form 5472 (Rev. 12/2024)",
    sourceUrl: I5472,
    period: "Instructions revised December 2024",
    category: "penalties",
  },

  // ---- Enforcement ---------------------------------------------------------
  {
    id: "systemic-since-2013",
    headline: "Since 2013 the IRS has automatically assessed Form 5472 penalties on late-filed Form 1120 returns.",
    detail:
      "Per the Internal Revenue Manual, beginning in 2013 the IRS Master File systemically assesses the initial section 6038A penalty on each Form 5472 attached to a late-filed Form 1120 series return, followed by a CP 215 notice.",
    figure: "2013",
    sourceLabel: "IRM 21.8.2.21.2 (10-01-2024)",
    sourceUrl: IRM_21_8_2,
    period: "Since calendar year 2013",
    category: "enforcement",
  },
  {
    id: "systemic-assessments-2018",
    headline: "In 2018 the IRS systemically assessed 9,889 Form 5471/5472 penalties totalling $253,087,500.",
    detail:
      "The National Taxpayer Advocate's 2020 report to Congress gives these figures for systemic assessments of section 6038 (Form 5471) and 6038A (Form 5472) penalties combined; the report does not split them by form.",
    figure: "9,889",
    sourceLabel: "National Taxpayer Advocate, 2020 Annual Report to Congress, MSP #8, Figure 1.8.1",
    sourceUrl: TAS_ARC_2020,
    period: "Calendar year 2018",
    category: "enforcement",
  },
  {
    id: "abatement-rate-2018",
    headline: "55% of 2018 systemic Form 5471/5472 penalties were abated, or 71% by dollar value.",
    detail:
      "Of the systemic section 6038 and 6038A penalties assessed in 2018, 5,468 were abated ($179,532,000), per the National Taxpayer Advocate. The figures combine Forms 5471 and 5472.",
    figure: "55% / 71%",
    sourceLabel: "National Taxpayer Advocate, 2020 Annual Report to Congress, MSP #8, Figure 1.8.1",
    sourceUrl: TAS_ARC_2020,
    period: "Calendar year 2018",
    category: "enforcement",
    editorsPick: true,
  },
  {
    id: "assessment-period-3-years",
    headline: "The IRS assessment period cannot close until at least 3 years after missing Form 5472 information is furnished.",
    detail:
      "Under IRC section 6501(c)(8), for information required under section 6038A the time to assess tax for the related return does not expire before 3 years after the information is furnished.",
    figure: "3 years",
    sourceLabel: "26 U.S.C. §6501(c)(8) (Cornell LII)",
    sourceUrl: IRC_6501,
    period: "Current statute",
    category: "enforcement",
  },

  // ---- Who files -----------------------------------------------------------
  {
    id: "threshold-25-percent",
    headline: "A US corporation is 25-percent foreign-owned when one foreign person owns at least 25% of votes or value.",
    detail:
      "Section 6038A(c)(1) measures 25% of total voting power or total value of all classes of stock, owned at any time during the tax year by one foreign person.",
    figure: "25%",
    sourceLabel: "26 U.S.C. §6038A(c)(1) (Cornell LII)",
    sourceUrl: IRC_6038A,
    period: "Current statute",
    category: "who-files",
  },
  {
    id: "td-9796-applicability",
    headline: "Foreign-owned single-member LLCs have filed Form 5472 for tax years beginning on or after January 1, 2017.",
    detail:
      "T.D. 9796, effective December 13, 2016, treats a US disregarded entity wholly owned by a foreign person as a corporation for section 6038A, for tax years beginning on or after January 1, 2017 and ending on or after December 13, 2017.",
    figure: "1 Jan 2017",
    sourceLabel: "T.D. 9796, 81 FR 89849 (Federal Register, 13 Dec 2016)",
    sourceUrl: TD_9796,
    period: "Tax years beginning on or after 1 January 2017",
    category: "who-files",
    editorsPick: true,
  },
  {
    id: "td-9796-comments",
    headline: "The IRS received no written comments on the proposed rule that brought foreign-owned LLCs into Form 5472.",
    detail:
      "The T.D. 9796 preamble states that no written comments on the May 10, 2016 proposed regulations were received and no public hearing was requested or held.",
    figure: "0 comments",
    sourceLabel: "T.D. 9796, 81 FR 89849 (Federal Register, 13 Dec 2016)",
    sourceUrl: TD_9796,
    period: "Proposed rule published 10 May 2016",
    category: "who-files",
  },
  {
    id: "small-corp-exception",
    headline: "The under-$10,000,000 small corporation exception does not apply to foreign-owned disregarded entities.",
    detail:
      "Treas. Reg. section 1.6038A-1(h) relieves reporting corporations with less than $10,000,000 of US gross receipts from certain record rules, but excludes entities treated as corporations under the disregarded-entity rule.",
    figure: "$10,000,000",
    sourceLabel: "26 CFR §1.6038A-1(h) (eCFR)",
    sourceUrl: REG_6038A_1,
    period: "Current regulation",
    category: "who-files",
  },
  {
    id: "de-minimis-exception",
    headline: "The $5,000,000 de minimis records safe harbor also excludes foreign-owned disregarded entities.",
    detail:
      "Treas. Reg. section 1.6038A-1(i) covers related-party payments of not more than $5,000,000 and under 10 percent of US gross income, but not entities treated as corporations under the disregarded-entity rule.",
    figure: "$5,000,000",
    sourceLabel: "26 CFR §1.6038A-1(i) (eCFR)",
    sourceUrl: REG_6038A_1,
    period: "Current regulation",
    category: "who-files",
  },

  // ---- Deadlines -----------------------------------------------------------
  {
    id: "due-date",
    headline: "Form 1120 with Form 5472 attached is generally due the 15th day of the 4th month after year end.",
    detail:
      "The Form 1120 instructions set this due date for corporations, and Form 5472 instructions say to file Form 5472 with the return by its due date (including extensions). Fiscal years ending June 30 differ.",
    figure: "15th day, 4th month",
    sourceLabel: "IRS Instructions for Form 1120 (2025), When To File",
    sourceUrl: I1120,
    period: "2025 instructions",
    category: "deadlines",
  },
  {
    id: "extension-6-months",
    headline: "Form 7004 gives an automatic extension of time to file that is generally 6 months.",
    detail:
      "Form 7004 must be filed by the return's regular due date. A foreign-owned disregarded entity writes “Foreign-owned U.S. DE” across the top and faxes or mails it to the address in the Form 5472 instructions.",
    figure: "6 months",
    sourceLabel: "IRS Instructions for Form 7004 (Rev. 12/2025)",
    sourceUrl: I7004,
    period: "Instructions revised December 2025",
    category: "deadlines",
  },
  {
    id: "pro-forma-fields",
    headline: "A pro forma Form 1120 for a foreign-owned LLC requires only the name, address, and items B and E.",
    detail:
      "The Form 5472 instructions say the only information required on the pro forma Form 1120 is the entity's name and address and items B and E on the first page.",
    figure: "Items B and E",
    sourceLabel: "IRS Instructions for Form 5472 (Rev. 12/2024)",
    sourceUrl: I5472,
    period: "Instructions revised December 2024",
    category: "deadlines",
  },
  {
    id: "fax-300-dpi",
    headline: "Foreign-owned LLCs can fax Form 5472 to the IRS, at a resolution of 300 DPI or higher.",
    detail:
      "Foreign-owned US disregarded entities use a dedicated fax number or mailing address (IRS Ogden PIN Unit) listed in the Form 5472 instructions, not the regular Form 1120 addresses.",
    figure: "300 DPI",
    sourceLabel: "IRS Instructions for Form 5472 (Rev. 12/2024)",
    sourceUrl: I5472,
    period: "Instructions revised December 2024",
    category: "deadlines",
  },

  // ---- Records -------------------------------------------------------------
  {
    id: "burden-recordkeeping",
    headline: "The IRS estimates 17 hours 42 minutes of recordkeeping per Form 5472 for non-business filers.",
    detail:
      "The same IRS estimate adds 3 hours 4 minutes for learning about the law or the form and 3 hours 30 minutes for preparing and sending it. Business taxpayers' burden is reported under OMB number 1545-0123 instead.",
    figure: "17 hr 42 min",
    sourceLabel: "IRS Instructions for Form 5472 (Rev. 12/2024), Paperwork Reduction Act notice",
    sourceUrl: I5472,
    period: "Instructions revised December 2024",
    category: "records",
  },
  {
    id: "td-9796-burden",
    headline: "Treasury estimated an average annual recordkeeping burden of 10 hours per foreign-owned disregarded entity.",
    detail:
      "The Paperwork Reduction Act section of T.D. 9796 gives an estimated average annual recordkeeping burden per recordkeeper of 10 hours.",
    figure: "10 hours",
    sourceLabel: "T.D. 9796, 81 FR 89849 (Federal Register, 13 Dec 2016)",
    sourceUrl: TD_9796,
    period: "Estimate published 13 December 2016",
    category: "records",
  },
  {
    id: "records-60-days",
    headline: "Records kept outside the US must be delivered or moved to the US within 60 days of an IRS request.",
    detail:
      "Treas. Reg. section 1.6038A-3(f) also requires translations of specific documents within 30 days of a request for translation.",
    figure: "60 days",
    sourceLabel: "26 CFR §1.6038A-3(f) (eCFR)",
    sourceUrl: REG_6038A_3,
    period: "Current regulation",
    category: "records",
  },

  // ---- IRS SOI data --------------------------------------------------------
  {
    id: "soi-returns-2021",
    headline: "1,529 foreign-owned US corporations with $500 million or more in receipts filed Forms 5472 for tax year 2021.",
    detail:
      "IRS Statistics of Income Table 1 for tax year 2021 counts 1,529 returns of foreign-owned domestic corporations (parents) with total receipts of $500 million or more and Forms 5472.",
    figure: "1,529",
    sourceLabel: "IRS SOI, Transactions of foreign-owned domestic corporations, Table 1 (TY 2021)",
    sourceUrl: SOI_FODC,
    period: "Tax year 2021 (released September 2024)",
    category: "irs-data",
    editorsPick: true,
  },
  {
    id: "soi-related-persons-2021",
    headline: "Those 1,529 corporations reported 31,111 related foreign persons on their Forms 5472.",
    detail:
      "Table 1 of the SOI foreign-owned domestic corporations study counts 31,111 related foreign persons across all industries for tax year 2021.",
    figure: "31,111",
    sourceLabel: "IRS SOI, Transactions of foreign-owned domestic corporations, Table 1 (TY 2021)",
    sourceUrl: SOI_FODC,
    period: "Tax year 2021 (released September 2024)",
    category: "irs-data",
  },
  {
    id: "soi-paid-2021",
    headline: "They paid more than $1.78 trillion to related foreign persons in tax year 2021, excluding loan balances.",
    detail:
      "SOI Table 1 reports amounts paid to related foreign persons of $1,783,209,153 thousand and amounts received from them of $1,265,170,341 thousand, excluding loan balances.",
    figure: "$1.78 trillion+",
    sourceLabel: "IRS SOI, Transactions of foreign-owned domestic corporations, Table 1 (TY 2021)",
    sourceUrl: SOI_FODC,
    period: "Tax year 2021 (released September 2024)",
    category: "irs-data",
  },
];

/** Unique source URLs, in first-appearance order (for JSON-LD `citation`). */
export function statSourceUrls(stats: Form5472Stat[] = FORM5472_STATS): string[] {
  return Array.from(new Set(stats.map((s) => s.sourceUrl)));
}

export function isOfficialSourceUrl(url: string): boolean {
  let host: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    host = parsed.hostname.toLowerCase();
  } catch {
    return false;
  }
  return OFFICIAL_SOURCE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}
