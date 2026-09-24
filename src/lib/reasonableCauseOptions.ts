// Dropdown choices for the reasonable-cause step. The customer picks a reason
// (or "Other" and writes their own); we store a finished third-person sentence
// in the existing rcsWhyMissed / rcsWhenLearned fields, so the PDF generator,
// API and admin editor keep working on plain text. Pure module: safe to import
// from client components.

export type WhyMissedKey =
  | "not_aware"
  | "no_activity"
  | "no_us_tax"
  | "agent_not_told"
  | "advisor_missed"
  | "thought_filed"
  | "hardship"
  | "other";

export type LearnedSourceKey =
  | "online"
  | "filing_service"
  | "bank"
  | "advisor"
  | "agent"
  | "other";

type WhyOption = {
  key: WhyMissedKey;
  label: string;
  /** Sentence written into the statement; empty for "other". */
  sentence: string;
  /** Whether the customer must add their own words. */
  detailRequired: boolean;
};

export const WHY_MISSED_OPTIONS: readonly WhyOption[] = [
  {
    key: "not_aware",
    label: "I didn't know a foreign-owned LLC had to file Form 5472",
    sentence:
      "The Owner was not aware that a foreign-owned single-member LLC must file Form 5472 with a pro forma Form 1120, even when no U.S. tax is owed.",
    detailRequired: false,
  },
  {
    key: "no_activity",
    label: "The LLC had little or no activity, so I thought nothing was due",
    sentence:
      "Because the Company had little or no activity during the year, the Owner believed that no U.S. filing was required.",
    detailRequired: false,
  },
  {
    key: "no_us_tax",
    label: "No U.S. tax was owed, so I thought no return was needed",
    sentence:
      "Because no U.S. income tax was owed, the Owner believed that no U.S. return or information return was required.",
    detailRequired: false,
  },
  {
    key: "agent_not_told",
    label: "My formation service or registered agent didn't tell me",
    sentence:
      "The service that formed the Company and acts as its registered agent did not inform the Owner of the Form 5472 filing requirement.",
    detailRequired: false,
  },
  {
    key: "advisor_missed",
    label: "My accountant or tax advisor didn't tell me",
    sentence:
      "The Owner relied on an accountant or tax advisor who did not advise the Owner of the Form 5472 filing requirement.",
    detailRequired: false,
  },
  {
    key: "thought_filed",
    label: "I thought someone else had already filed it",
    sentence:
      "The Owner believed the return had been filed on the Company's behalf by another party and later learned that it had not been.",
    detailRequired: false,
  },
  {
    key: "hardship",
    label: "Illness, family emergency or other hardship",
    sentence: "The Owner was unable to meet the filing deadline because of personal hardship:",
    detailRequired: true,
  },
  {
    key: "other",
    label: "Other (write your own)",
    sentence: "",
    detailRequired: true,
  },
];

type LearnedOption = {
  key: LearnedSourceKey;
  label: string;
  /** Phrase after "The Owner learned of the requirement "; empty for "other". */
  phrase: string;
};

export const LEARNED_SOURCE_OPTIONS: readonly LearnedOption[] = [
  { key: "online", label: "Researching U.S. filing rules online", phrase: "while researching U.S. filing requirements online" },
  { key: "filing_service", label: "From a filing or compliance service", phrase: "from a U.S. filing and compliance service" },
  { key: "bank", label: "My bank or payment provider asked for tax information", phrase: "when the Company's bank or payment provider requested tax information" },
  { key: "advisor", label: "From an accountant or tax advisor", phrase: "from an accountant or tax advisor" },
  { key: "agent", label: "From my registered agent or formation service", phrase: "from the Company's registered agent or formation service" },
  { key: "other", label: "Other (write your own)", phrase: "" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type WhyMissedSelection = { key: WhyMissedKey | ""; detail: string };
export type WhenLearnedSelection = {
  source: LearnedSourceKey | "";
  /** "YYYY-MM" as produced by <input type="month">, or "". */
  month: string;
  detail: string;
};

function tidy(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function asSentence(value: string): string {
  const t = tidy(value);
  if (!t) return "";
  const capitalized = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function monthToProse(month: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) return "";
  const idx = Number(m[2]) - 1;
  if (idx < 0 || idx > 11) return "";
  return `${MONTHS[idx]} ${m[1]}`;
}

function proseToMonth(prose: string): string {
  const m = /^([A-Z][a-z]+) (\d{4})$/.exec(prose);
  if (!m) return "";
  const idx = MONTHS.indexOf(m[1]);
  return idx < 0 ? "" : `${m[2]}-${String(idx + 1).padStart(2, "0")}`;
}

export function composeWhyMissed(sel: WhyMissedSelection): string {
  const option = WHY_MISSED_OPTIONS.find((o) => o.key === sel.key);
  if (!option) return "";
  const detail = tidy(sel.detail);
  if (option.key === "other") return asSentence(detail);
  if (option.key === "hardship") return detail ? asSentence(`${option.sentence} ${detail}`) : "";
  return detail ? `${option.sentence} ${asSentence(detail)}` : option.sentence;
}

export function parseWhyMissed(stored: string | null | undefined): WhyMissedSelection {
  const text = tidy(stored ?? "");
  if (!text) return { key: "", detail: "" };
  for (const option of WHY_MISSED_OPTIONS) {
    if (!option.sentence || !text.startsWith(option.sentence)) continue;
    let detail = text.slice(option.sentence.length).trim();
    if (option.key === "hardship") detail = detail.replace(/\.$/, "");
    return { key: option.key, detail };
  }
  return { key: "other", detail: text };
}

export function composeWhenLearned(sel: WhenLearnedSelection): string {
  const option = LEARNED_SOURCE_OPTIONS.find((o) => o.key === sel.source);
  if (!option) return "";
  const when = monthToProse(sel.month);
  const detail = asSentence(sel.detail);
  if (option.key === "other") {
    const lead = when ? `The Owner learned of the requirement in ${when}.` : "";
    return [lead, detail].filter(Boolean).join(" ");
  }
  if (!when) return "";
  const lead = `The Owner learned of the requirement ${option.phrase} in ${when}.`;
  return detail ? `${lead} ${detail}` : lead;
}

export function parseWhenLearned(stored: string | null | undefined): WhenLearnedSelection {
  const text = tidy(stored ?? "");
  if (!text) return { source: "", month: "", detail: "" };
  const prefix = "The Owner learned of the requirement ";
  if (text.startsWith(prefix)) {
    const rest = text.slice(prefix.length);
    for (const option of LEARNED_SOURCE_OPTIONS) {
      const head = option.phrase ? `${option.phrase} in ` : "in ";
      if (!rest.startsWith(head)) continue;
      const m = /^([A-Z][a-z]+ \d{4})\.\s*(.*)$/.exec(rest.slice(head.length));
      const month = m ? proseToMonth(m[1]) : "";
      if (!month) continue;
      return { source: option.key, month, detail: m![2] };
    }
  }
  return { source: "other", month: "", detail: text };
}

/** Selection-level problems, keyed like validateReasonableCauseYears ("2024.rcsWhyMissed"). */
export function validateSelections(
  taxYear: number,
  why: WhyMissedSelection,
  when: WhenLearnedSelection,
  now: Date = new Date(),
): Record<string, string> {
  const errors: Record<string, string> = {};
  const whyOption = WHY_MISSED_OPTIONS.find((o) => o.key === why.key);
  if (!whyOption) {
    errors[`${taxYear}.rcsWhyMissed`] = `Choose why the filing for ${taxYear} was missed.`;
  } else if (whyOption.detailRequired && !tidy(why.detail)) {
    errors[`${taxYear}.rcsWhyMissed`] =
      whyOption.key === "other" ? "Write a short explanation." : "Add a few words about what happened.";
  }

  const whenOption = LEARNED_SOURCE_OPTIONS.find((o) => o.key === when.source);
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  if (!whenOption) {
    errors[`${taxYear}.rcsWhenLearned`] = "Choose how you found out about this form.";
  } else if (whenOption.key === "other" && !tidy(when.detail)) {
    errors[`${taxYear}.rcsWhenLearned`] = "Write how and when you found out.";
  } else if (whenOption.key !== "other" && !monthToProse(when.month)) {
    errors[`${taxYear}.rcsWhenLearned`] = "Pick the month you found out.";
  } else if (when.month && when.month > currentMonth) {
    errors[`${taxYear}.rcsWhenLearned`] = "That month is in the future.";
  }
  return errors;
}
