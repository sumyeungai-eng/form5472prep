import { describe, expect, it } from "vitest";
import { validateReasonableCauseYears } from "./ReasonableCauseStep";

describe("validateReasonableCauseYears", () => {
  it("rejects an answer over the 2,000-character server cap before saving", () => {
    const row = { taxYear: 2025, rcsWhyMissed: "x".repeat(2001), rcsWhenLearned: "", rcsNoIrsNoticeConfirmed: true };
    expect(validateReasonableCauseYears([row])).toEqual({
      "2025.rcsWhyMissed": "Keep this to 2,000 characters or fewer (it is 2,001).",
    });
    expect(validateReasonableCauseYears([{ ...row, rcsWhyMissed: "x".repeat(2000) }])).toEqual({});
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
