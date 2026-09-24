import { describe, expect, it } from "vitest";
import {
  WHY_MISSED_OPTIONS,
  composeWhyMissed,
  parseWhyMissed,
  validateWhySelection,
} from "./reasonableCauseOptions";

describe("why-missed dropdown", () => {
  it("writes the stock sentence for a preset reason", () => {
    expect(composeWhyMissed({ key: "not_aware", detail: "" })).toBe(WHY_MISSED_OPTIONS[0].sentence);
  });

  it("appends optional details as a sentence", () => {
    expect(composeWhyMissed({ key: "advisor_missed", detail: "  they only did my home taxes " })).toMatch(
      /tax advisor who did not advise the Owner of the Form 5472 filing requirement\. They only did my home taxes\.$/,
    );
  });

  it("hardship needs details and folds them into one sentence", () => {
    expect(composeWhyMissed({ key: "hardship", detail: "" })).toBe("");
    expect(composeWhyMissed({ key: "hardship", detail: "surgery in 2024" })).toBe(
      "The Owner was unable to meet the filing deadline because of personal hardship: surgery in 2024.",
    );
  });

  it("other stores the customer's own words", () => {
    expect(composeWhyMissed({ key: "other", detail: "my mail was not forwarded" })).toBe(
      "My mail was not forwarded.",
    );
  });

  it("round-trips every option", () => {
    for (const option of WHY_MISSED_OPTIONS) {
      const sel = { key: option.key, detail: "extra context here" };
      const parsed = parseWhyMissed(composeWhyMissed(sel));
      expect(parsed.key).toBe(option.key);
      expect(composeWhyMissed(parsed)).toBe(composeWhyMissed(sel));
    }
  });

  it("loads legacy free text as Other", () => {
    expect(parseWhyMissed("I did not know the form was required.")).toEqual({
      key: "other",
      detail: "I did not know the form was required.",
    });
    expect(parseWhyMissed(null)).toEqual({ key: "", detail: "" });
  });
});

describe("wording safety", () => {
  it("no preset sentence trips the pre-flight A26 wording checks", () => {
    // Same patterns as checkA26 in src/lib/pdf/preflight.ts.
    const unsupportedOps = /\b(dormant|no customers|no vendors|did not operate with customers or vendors|customer payments|vendor invoices)\b/i;
    const contradictsUsIncome = /\b(no U\.S\. income(?! tax return)|no tax owed)\b/i;
    for (const option of WHY_MISSED_OPTIONS) {
      expect(option.sentence).not.toMatch(unsupportedOps);
      expect(option.sentence).not.toMatch(contradictsUsIncome);
    }
  });

  it("answers saved with an earlier wording reopen on the same option", () => {
    const earlier =
      "Because no U.S. income tax was owed, the Owner believed that no U.S. return or information return was required.";
    expect(parseWhyMissed(earlier)).toEqual({ key: "no_us_tax", detail: "" });
  });
});

describe("validateWhySelection", () => {
  it("requires a choice", () => {
    expect(validateWhySelection(2024, { key: "", detail: "" })).toHaveProperty("2024.rcsWhyMissed");
  });

  it("requires own words for Other and hardship", () => {
    expect(validateWhySelection(2024, { key: "other", detail: " " })).toHaveProperty("2024.rcsWhyMissed");
    expect(validateWhySelection(2024, { key: "hardship", detail: "" })).toHaveProperty("2024.rcsWhyMissed");
  });

  it("accepts a preset without details", () => {
    expect(validateWhySelection(2024, { key: "not_aware", detail: "" })).toEqual({});
    expect(validateWhySelection(2024, { key: "other", detail: "x" })).toEqual({});
  });
});
