// Primary sources behind every rule the "Do I need to file Form 5472?" checker
// applies. Research notes with the exact quotes: docs/research/filing-checker.md.
// Only irs.gov, eCFR and Cornell LII (statute / CFR mirror) URLs belong here.

export type SourceId =
  | "i5472"
  | "i1120"
  | "i1065"
  | "irc6038a"
  | "reg6038a1"
  | "reg6038a2"
  | "reg7701_2"
  | "reg7701_3";

export type Source = { id: SourceId; label: string; url: string };

export const SOURCES: Record<SourceId, Source> = {
  i5472: {
    id: "i5472",
    label: "IRS — Instructions for Form 5472 (Rev. 12/2024)",
    url: "https://www.irs.gov/instructions/i5472",
  },
  i1120: {
    id: "i1120",
    label: "IRS — Instructions for Form 1120, When To File",
    url: "https://www.irs.gov/instructions/i1120",
  },
  i1065: {
    id: "i1065",
    label: "IRS — Instructions for Form 1065, Who Must File",
    url: "https://www.irs.gov/instructions/i1065",
  },
  irc6038a: {
    id: "irc6038a",
    label: "26 U.S.C. §6038A — information returns of 25% foreign-owned corporations",
    url: "https://www.law.cornell.edu/uscode/text/26/6038A",
  },
  reg6038a1: {
    id: "reg6038a1",
    label: "Treas. Reg. §1.6038A-1 — reporting corporation (eCFR)",
    url: "https://www.ecfr.gov/current/title-26/section-1.6038A-1",
  },
  reg6038a2: {
    id: "reg6038a2",
    label: "Treas. Reg. §1.6038A-2 — reportable transactions (eCFR)",
    url: "https://www.ecfr.gov/current/title-26/section-1.6038A-2",
  },
  reg7701_2: {
    id: "reg7701_2",
    label: "Treas. Reg. §301.7701-2(c)(2)(vi) — foreign-owned disregarded entity (eCFR)",
    url: "https://www.ecfr.gov/current/title-26/section-301.7701-2",
  },
  reg7701_3: {
    id: "reg7701_3",
    label: "Treas. Reg. §301.7701-3(b)(1) — default classification of an LLC (eCFR)",
    url: "https://www.ecfr.gov/current/title-26/section-301.7701-3",
  },
};

// The date the rules above were last checked against their sources.
export const LAST_REVIEWED_ISO = "2026-09-29";
export const LAST_REVIEWED_LABEL = "29 September 2026";
