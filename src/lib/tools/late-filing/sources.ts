// Primary sources behind every rule the late-filing checker states.
// Research notes with the exact quotes: docs/research/late-filing.md.
// Only irs.gov, eCFR and Cornell LII (statute / CFR mirror) URLs belong here.

export type SourceId =
  | "diirsp"
  | "i5472"
  | "irc6038a"
  | "reg6038a4"
  | "adminRelief"
  | "irm20_1_1"
  | "irm20_1_9"
  | "intlPenalties"
  | "streamlined"
  | "vdp";

export type Source = { id: SourceId; label: string; url: string };

export const SOURCES: Record<SourceId, Source> = {
  diirsp: {
    id: "diirsp",
    label: "IRS — Delinquent international information return submission procedures",
    url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures",
  },
  i5472: {
    id: "i5472",
    label: "IRS — Instructions for Form 5472 (Rev. 12/2024)",
    url: "https://www.irs.gov/instructions/i5472",
  },
  irc6038a: {
    id: "irc6038a",
    label: "26 U.S.C. §6038A(d) — penalty for failure to furnish information",
    url: "https://www.law.cornell.edu/uscode/text/26/6038A",
  },
  reg6038a4: {
    id: "reg6038a4",
    label: "Treas. Reg. §1.6038A-4(b) — reasonable cause (eCFR)",
    url: "https://www.ecfr.gov/current/title-26/section-1.6038A-4",
  },
  adminRelief: {
    id: "adminRelief",
    label: "IRS — Administrative penalty relief (First Time Abate)",
    url: "https://www.irs.gov/payments/administrative-penalty-relief",
  },
  irm20_1_1: {
    id: "irm20_1_1",
    label: "IRM 20.1.1.3.3.2.1 — First Time Abate exclusions",
    url: "https://www.irs.gov/irm/part20/irm_20-001-001r",
  },
  irm20_1_9: {
    id: "irm20_1_9",
    label: "IRM 20.1.9.5.5 — Form 5472 penalty relief",
    url: "https://www.irs.gov/irm/part20/irm_20-001-009",
  },
  intlPenalties: {
    id: "intlPenalties",
    label: "IRS — International information reporting penalties",
    url: "https://www.irs.gov/payments/international-information-reporting-penalties",
  },
  streamlined: {
    id: "streamlined",
    label: "IRS — Streamlined filing compliance procedures",
    url: "https://www.irs.gov/individuals/international-taxpayers/streamlined-filing-compliance-procedures",
  },
  vdp: {
    id: "vdp",
    label: "IRS — Criminal Investigation Voluntary Disclosure Practice",
    url: "https://www.irs.gov/compliance/criminal-investigation/irs-criminal-investigation-voluntary-disclosure-practice",
  },
};

// The date the rules above were last checked against their sources.
export const LAST_REVIEWED_ISO = "2026-09-29";
export const LAST_REVIEWED_LABEL = "29 September 2026";
