// Primary sources behind every rule the Form 5472 penalty calculator applies.
// Research notes with the exact quotes: docs/research/penalty-calculator.md.
// The arithmetic itself lives in src/lib/penalty.ts; this file only names the
// sources the page cites. Only irs.gov, eCFR and Cornell LII URLs belong here.

export type SourceId =
  | "irc6038a"
  | "reg6038a4"
  | "i5472"
  | "intlPenalties"
  | "irm20_1_9"
  | "cp215"
  | "adminRelief"
  | "diirsp"
  | "irc6501";

export type Source = { id: SourceId; label: string; url: string };

export const SOURCES: Record<SourceId, Source> = {
  irc6038a: {
    id: "irc6038a",
    label: "26 U.S.C. §6038A(d) — penalty for failure to furnish information",
    url: "https://www.law.cornell.edu/uscode/text/26/6038A",
  },
  reg6038a4: {
    id: "reg6038a4",
    label: "Treas. Reg. §1.6038A-4 — penalty and reasonable cause (eCFR)",
    url: "https://www.ecfr.gov/current/title-26/section-1.6038A-4",
  },
  i5472: {
    id: "i5472",
    label: "IRS — Instructions for Form 5472 (Rev. 12/2024), Penalties",
    url: "https://www.irs.gov/instructions/i5472",
  },
  intlPenalties: {
    id: "intlPenalties",
    label: "IRS — International information reporting penalties",
    url: "https://www.irs.gov/payments/international-information-reporting-penalties",
  },
  irm20_1_9: {
    id: "irm20_1_9",
    label: "IRM 20.1.9.5 — Form 5472 penalties (notices, assertion, computation)",
    url: "https://www.irs.gov/irm/part20/irm_20-001-009",
  },
  cp215: {
    id: "cp215",
    label: "IRS — Understanding your CP215 notice",
    url: "https://www.irs.gov/individuals/understanding-your-cp215-notice",
  },
  adminRelief: {
    id: "adminRelief",
    label: "IRS — Administrative penalty relief (First Time Abate)",
    url: "https://www.irs.gov/payments/administrative-penalty-relief",
  },
  diirsp: {
    id: "diirsp",
    label: "IRS — Delinquent international information return submission procedures",
    url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures",
  },
  irc6501: {
    id: "irc6501",
    label: "26 U.S.C. §6501(c)(8) — assessment period for unreported information",
    url: "https://www.law.cornell.edu/uscode/text/26/6501",
  },
};

// The date the rules above were last checked against their sources.
export const LAST_REVIEWED_ISO = "2026-09-29";
export const LAST_REVIEWED_LABEL = "29 September 2026";
