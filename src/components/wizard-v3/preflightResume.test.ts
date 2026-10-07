import { describe, expect, it } from "vitest";
import { initialPreflightAnswers } from "./FilingWizardV3";
import { preflightBlocked, preflightStatus } from "./PreflightStep";

type F = Parameters<typeof initialPreflightAnswers>[0];

// Synthetic drafts. Anything not listed is "not filled in yet".
function draft(overrides: Record<string, unknown>): F {
  return new Proxy({ taxYears: [], yearData: [], isFinalReturn: false, ...overrides } as Record<string, unknown>, {
    get: (target, key: string) => (key in target ? target[key] : null),
  }) as unknown as F;
}

describe("pre-flight status after Save and exit (customer report 2026-10-08)", () => {
  it("stays complete once the draft has saved data", () => {
    const answers = initialPreflightAnswers(draft({ llcMemberCount: 1, llcName: "Synthetic Test LLC", llcEin: "12-3456789" }));
    expect(preflightStatus(answers)).toBe("complete");
    expect(preflightBlocked(answers).blocked).toBe(false);
  });

  it("is complete even if the member count was never saved", () => {
    expect(preflightStatus(initialPreflightAnswers(draft({ llcName: "Synthetic Test LLC" })))).toBe("complete");
  });

  it("starts blank on a brand-new draft", () => {
    expect(preflightStatus(initialPreflightAnswers(draft({})))).toBe("untouched");
    expect(initialPreflightAnswers(draft({ llcMemberCount: 1 }))).toEqual({
      isForeignOwnedSmllc: null,
      isMultiMember: false,
      hasEin: null,
    });
  });

  it("still flags a saved multi-member LLC", () => {
    const answers = initialPreflightAnswers(draft({ llcMemberCount: 2, llcName: "Synthetic Test LLC" }));
    expect(preflightBlocked(answers).code).toBe("multi-member");
  });
});
