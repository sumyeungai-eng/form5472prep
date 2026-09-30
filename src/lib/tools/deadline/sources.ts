// Primary sources behind every rule the Form 5472 deadline calculator applies.
// Research notes with the exact quotes: docs/research/deadline-calculator.md.
// The date math itself lives in src/lib/schemas.ts (filingDueDateUtc /
// effectiveDueDateUtc), which applies the shared Form 1120 rule in
// src/lib/form1120DueDate.ts, and src/lib/federalHolidays.ts; this file only
// names the sources the page cites. Only irs.gov, Cornell LII and govinfo.gov
// (the official text of a public law) URLs belong here.

export type SourceId =
  | "i1120"
  | "irc6072"
  | "irc7503"
  | "p509"
  | "i7004"
  | "i5472"
  | "plaw11441"
  | "diirsp";

export type Source = { id: SourceId; label: string; url: string };

export const SOURCES: Record<SourceId, Source> = {
  i1120: {
    id: "i1120",
    label: "IRS — Instructions for Form 1120, When To File",
    url: "https://www.irs.gov/instructions/i1120",
  },
  irc6072: {
    id: "irc6072",
    label: "26 U.S.C. §6072(a) — due date of income tax returns",
    url: "https://www.law.cornell.edu/uscode/text/26/6072",
  },
  irc7503: {
    id: "irc7503",
    label: "26 U.S.C. §7503 — deadline on a Saturday, Sunday or legal holiday",
    url: "https://www.law.cornell.edu/uscode/text/26/7503",
  },
  p509: {
    id: "p509",
    label: "IRS — Publication 509 (2026), Tax Calendars: legal holidays",
    url: "https://www.irs.gov/publications/p509",
  },
  i7004: {
    id: "i7004",
    label: "IRS — Instructions for Form 7004 (automatic extension)",
    url: "https://www.irs.gov/instructions/i7004",
  },
  i5472: {
    id: "i5472",
    label: "IRS — Instructions for Form 5472 (Rev. 12/2024), foreign-owned U.S. DEs",
    url: "https://www.irs.gov/instructions/i5472",
  },
  plaw11441: {
    id: "plaw11441",
    label: "Pub. L. 114-41 §2006(a)(3)(B) and (c) — June 30 year-ends beginning before 2026",
    url: "https://www.govinfo.gov/content/pkg/PLAW-114publ41/html/PLAW-114publ41.htm",
  },
  diirsp: {
    id: "diirsp",
    label: "IRS — Delinquent international information return submission procedures",
    url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures",
  },
};

// The date the rules above were last checked against their sources.
export const LAST_REVIEWED_ISO = "2026-09-30";
export const LAST_REVIEWED_LABEL = "30 September 2026";
