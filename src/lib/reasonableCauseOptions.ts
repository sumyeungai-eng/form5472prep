// Dropdown choices for the reasonable-cause step. The customer picks a reason
// (or "Other" and writes their own); we store a finished third-person sentence
// in the existing rcsWhyMissed field, so the PDF generator, API and admin
// editor keep working on plain text. Pure module: safe to import from client
// components.

export type WhyMissedKey =
  | "not_aware"
  | "no_activity"
  | "no_us_tax"
  | "agent_not_told"
  | "advisor_missed"
  | "thought_filed"
  | "hardship"
  | "other";

type WhyOption = {
  key: WhyMissedKey;
  label: string;
  /** Sentence written into the statement; empty for "other". */
  sentence: string;
  /** Whether the customer must add their own words. */
  detailRequired: boolean;
  /** Earlier wordings of `sentence`, so answers saved with them reopen on this option. */
  previousSentences?: readonly string[];
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
    // Avoid "no U.S. income" / "no tax owed": pre-flight A26 flags those phrases
    // when the filing reports U.S.-source income.
    sentence:
      "Because the Company did not owe any U.S. income tax, the Owner believed that no U.S. return or information return was required.",
    detailRequired: false,
    previousSentences: [
      "Because no U.S. income tax was owed, the Owner believed that no U.S. return or information return was required.",
    ],
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

export type WhyMissedSelection = { key: WhyMissedKey | ""; detail: string };

function tidy(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function asSentence(value: string): string {
  const t = tidy(value);
  if (!t) return "";
  const capitalized = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
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
    const prefix = [option.sentence, ...(option.previousSentences ?? [])].find(
      (sentence) => sentence && text.startsWith(sentence),
    );
    if (!prefix) continue;
    let detail = text.slice(prefix.length).trim();
    if (option.key === "hardship") detail = detail.replace(/\.$/, "");
    return { key: option.key, detail };
  }
  return { key: "other", detail: text };
}

/** Selection-level problem for one year, keyed like validateReasonableCauseYears ("2024.rcsWhyMissed"). */
export function validateWhySelection(taxYear: number, why: WhyMissedSelection): Record<string, string> {
  const option = WHY_MISSED_OPTIONS.find((o) => o.key === why.key);
  if (!option) return { [`${taxYear}.rcsWhyMissed`]: `Choose why the filing for ${taxYear} was missed.` };
  if (option.detailRequired && !tidy(why.detail)) {
    return {
      [`${taxYear}.rcsWhyMissed`]:
        option.key === "other" ? "Write a short explanation." : "Add a few words about what happened.",
    };
  }
  return {};
}
