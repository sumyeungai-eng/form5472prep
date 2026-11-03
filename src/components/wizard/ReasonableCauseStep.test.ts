import { describe, expect, it } from "vitest";
import { applyWhySelection, initialWhySelection, validateReasonableCauseYears } from "./ReasonableCauseStep";

describe("validateReasonableCauseYears", () => {
  it("rejects an answer over the 20,000-character server cap before saving", () => {
    const row = { taxYear: 2025, rcsWhyMissed: "x".repeat(20001), rcsWhenLearned: "", rcsNoIrsNoticeConfirmed: true };
    expect(validateReasonableCauseYears([row])).toEqual({
      "2025.rcsWhyMissed": "Keep this to 20,000 characters or fewer (it is 20,001).",
    });
    expect(validateReasonableCauseYears([{ ...row, rcsWhyMissed: "x".repeat(20000) }])).toEqual({});
  });
  it("requires a reason and the no-notice confirmation for each late year", () => {
    expect(
      validateReasonableCauseYears([
        {
          taxYear: 2024,
          rcsWhyMissed: "",
          rcsWhenLearned: "I learned in 2026.",
          rcsNoIrsNoticeConfirmed: true,
        },
      ]),
    ).toHaveProperty("2024.rcsWhyMissed");

    expect(
      validateReasonableCauseYears([
        {
          taxYear: 2024,
          rcsWhyMissed: "I did not know the form was required.",
          rcsWhenLearned: "",
          rcsNoIrsNoticeConfirmed: true,
        },
      ]),
    ).toEqual({});

    expect(
      validateReasonableCauseYears([
        {
          taxYear: 2024,
          rcsWhyMissed: "I did not know the form was required.",
          rcsWhenLearned: "I learned in 2026.",
          rcsNoIrsNoticeConfirmed: false,
        },
      ]),
    ).toHaveProperty("2024.rcsNoIrsNoticeConfirmed");

    expect(
      validateReasonableCauseYears([
        {
          taxYear: 2024,
          rcsWhyMissed: "I did not know the form was required.",
          rcsWhenLearned: "I learned in 2026.",
          rcsNoIrsNoticeConfirmed: true,
        },
      ]),
    ).toEqual({});
  });
});

describe("P0-3 raw capture", () => {
  const row = { taxYear: 2024, rcsWhyMissed: "", rcsWhenLearned: "", rcsNoIrsNoticeConfirmed: true };
  const typed = "I moved countries in 2024.\n\nMy mail was not forwarded,\nso I missed the letter.";

  it("keeps the textarea value untouched beside the normalised sentence", () => {
    const next = applyWhySelection(row, { key: "other", detail: typed });
    expect(next.rcsWhyMissedRaw).toBe(typed);
    expect(next.rcsWhyMissed).toBe("I moved countries in 2024. My mail was not forwarded, so I missed the letter.");
  });

  it("reopens the step from the raw text, line breaks included", () => {
    const saved = applyWhySelection(row, { key: "other", detail: typed });
    expect(initialWhySelection(saved)).toEqual({ key: "other", detail: typed });
    // Orders captured before raw capture reopen from the normalised text.
    expect(initialWhySelection({ ...saved, rcsWhyMissedRaw: undefined }).detail).toBe(saved.rcsWhyMissed);
  });
});
