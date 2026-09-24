import { describe, expect, it } from "vitest";
import {
  LEARNED_SOURCE_OPTIONS,
  WHY_MISSED_OPTIONS,
  composeWhenLearned,
  composeWhyMissed,
  parseWhenLearned,
  parseWhyMissed,
  validateSelections,
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

describe("when-learned dropdown", () => {
  it("writes source and month as prose", () => {
    expect(composeWhenLearned({ source: "bank", month: "2026-03", detail: "" })).toBe(
      "The Owner learned of the requirement when the Company's bank or payment provider requested tax information in March 2026.",
    );
  });

  it("needs a month for preset sources", () => {
    expect(composeWhenLearned({ source: "online", month: "", detail: "" })).toBe("");
  });

  it("other works with or without a month", () => {
    expect(composeWhenLearned({ source: "other", month: "", detail: "a friend told me" })).toBe(
      "A friend told me.",
    );
    expect(composeWhenLearned({ source: "other", month: "2025-11", detail: "a friend told me" })).toBe(
      "The Owner learned of the requirement in November 2025. A friend told me.",
    );
  });

  it("round-trips every source", () => {
    for (const option of LEARNED_SOURCE_OPTIONS) {
      const sel = { source: option.key, month: "2026-01", detail: "more detail" };
      const parsed = parseWhenLearned(composeWhenLearned(sel));
      expect(parsed.source).toBe(option.key);
      expect(parsed.month).toBe("2026-01");
      expect(composeWhenLearned(parsed)).toBe(composeWhenLearned(sel));
    }
  });

  it("loads legacy free text as Other", () => {
    expect(parseWhenLearned("I learned in 2026.")).toEqual({
      source: "other",
      month: "",
      detail: "I learned in 2026.",
    });
  });
});

describe("validateSelections", () => {
  const now = new Date("2026-09-24T12:00:00Z");

  it("requires a choice for both questions", () => {
    const errors = validateSelections(2024, { key: "", detail: "" }, { source: "", month: "", detail: "" }, now);
    expect(errors).toHaveProperty("2024.rcsWhyMissed");
    expect(errors).toHaveProperty("2024.rcsWhenLearned");
  });

  it("requires own words for Other and hardship", () => {
    expect(validateSelections(2024, { key: "other", detail: " " }, { source: "online", month: "2026-01", detail: "" }, now))
      .toHaveProperty("2024.rcsWhyMissed");
    expect(validateSelections(2024, { key: "hardship", detail: "" }, { source: "online", month: "2026-01", detail: "" }, now))
      .toHaveProperty("2024.rcsWhyMissed");
  });

  it("requires a month for preset sources and rejects future months", () => {
    expect(validateSelections(2024, { key: "not_aware", detail: "" }, { source: "online", month: "", detail: "" }, now))
      .toHaveProperty("2024.rcsWhenLearned");
    expect(validateSelections(2024, { key: "not_aware", detail: "" }, { source: "online", month: "2026-10", detail: "" }, now))
      .toHaveProperty("2024.rcsWhenLearned");
  });

  it("accepts a complete answer", () => {
    expect(
      validateSelections(2024, { key: "not_aware", detail: "" }, { source: "online", month: "2026-09", detail: "" }, now),
    ).toEqual({});
    expect(
      validateSelections(2024, { key: "other", detail: "x" }, { source: "other", month: "", detail: "y" }, now),
    ).toEqual({});
  });
});
