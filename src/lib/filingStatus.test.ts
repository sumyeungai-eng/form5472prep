import { describe, expect, it } from "vitest";
import { filingCompletionIssues, hasCompleteReasonableCause, requiresReasonableCause, type CompletionInput } from "./completeness";
import {
  effectiveDueDateUtc,
  extensionUnclear,
  formatDueDate,
  isExtensionValid,
  isYearDelinquent,
  type ExtensionFacts,
} from "./schemas";

function filing(overrides: {
  taxYears: number[];
  isFinalReturn?: boolean;
  dissolvedAt?: Date | string | null;
  extensionFiled?: string | null;
  extensionTransmittedAt?: Date | string | null;
}) {
  return {
    taxYears: overrides.taxYears,
    isFinalReturn: overrides.isFinalReturn ?? false,
    dissolvedAt: overrides.dissolvedAt ?? null,
    extensionFiled: overrides.extensionFiled ?? null,
    extensionTransmittedAt: overrides.extensionTransmittedAt ?? null,
  };
}

describe("filing status rule 5.6", () => {
  it("T1: tax year 2025, no extension, on 2026-09-21 is late", () => {
    const now = new Date(Date.UTC(2026, 8, 21));
    expect(isYearDelinquent(2025, null, null, now)).toBe(true);
    expect(requiresReasonableCause(filing({ taxYears: [2025] }), now)).toBe(true);
  });

  it("T2: tax year 2025, extension yes with no transmittedAt, on 2026-09-21 is on time", () => {
    const now = new Date(Date.UTC(2026, 8, 21));
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: null };

    expect(isExtensionValid(2025, null, extension)).toBe(true);
    expect(isYearDelinquent(2025, null, extension, now)).toBe(false);
    expect(
      requiresReasonableCause(
        filing({ taxYears: [2025], extensionFiled: "yes", extensionTransmittedAt: null }),
        now,
      ),
    ).toBe(false);
    expect(formatDueDate(effectiveDueDateUtc(2025, null, extension))).toBe("October 15, 2026");
  });

  it("T3: same as T2, on 2026-10-16 is late", () => {
    const now = new Date(Date.UTC(2026, 9, 16));
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: null };

    expect(isYearDelinquent(2025, null, extension, now)).toBe(true);
    expect(
      requiresReasonableCause(
        filing({ taxYears: [2025], extensionFiled: "yes", extensionTransmittedAt: null }),
        now,
      ),
    ).toBe(true);
  });

  it("T4: extension not_sure is deferred rather than classified late or timely", () => {
    const now = new Date(Date.UTC(2026, 9, 16));
    const extension: ExtensionFacts = { filed: "not_sure", transmittedAt: null };

    expect(extensionUnclear(extension)).toBe(true);
    expect(isYearDelinquent(2025, null, extension, now)).toBe(false);
    expect(
      requiresReasonableCause(
        filing({ taxYears: [2025], extensionFiled: "not_sure", extensionTransmittedAt: null }),
        now,
      ),
    ).toBe(false);
  });

  it("T5: final year dissolved 2026-07-14 with no extension is due 2026-11-16", () => {
    expect(formatDueDate(effectiveDueDateUtc(2026, "2026-07-14", null))).toBe(
      "November 16, 2026",
    );
  });

  it("T6: final year dissolved 2026-07-14 with a valid extension is due 2027-05-17", () => {
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: null };
    expect(formatDueDate(effectiveDueDateUtc(2026, "2026-07-14", extension))).toBe(
      "May 17, 2027",
    );
  });

  it("T7: extension yes with transmittedAt after 2026-04-15 is invalid and late", () => {
    const now = new Date(Date.UTC(2026, 8, 21));
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: "2026-04-16" };

    expect(isExtensionValid(2025, null, extension)).toBe(false);
    expect(isYearDelinquent(2025, null, extension, now)).toBe(true);
    expect(
      requiresReasonableCause(
        filing({ taxYears: [2025], extensionFiled: "yes", extensionTransmittedAt: "2026-04-16" }),
        now,
      ),
    ).toBe(true);
  });

  it("routes the pre-2026 June 30 final-year extension edge case to review", () => {
    const now = new Date(Date.UTC(2026, 0, 16));
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: null };

    expect(extensionUnclear(extension, 2025, "2025-06-30")).toBe(true);
    expect(isYearDelinquent(2025, "2025-06-30", extension, now)).toBe(false);
    expect(
      requiresReasonableCause(
        filing({
          taxYears: [2025],
          isFinalReturn: true,
          dissolvedAt: "2025-06-30",
          extensionFiled: "yes",
          extensionTransmittedAt: null,
        }),
        now,
      ),
    ).toBe(false);
  });
});

const completeFiling: CompletionInput = {
  llcName: "Example LLC",
  llcEin: "12-3456789",
  llcAddress: "123 Main St",
  llcCity: "Miami",
  llcState: "FL",
  llcZip: "33101",
  llcDateIncorporated: "2020-01-01",
  llcBusinessActivity: "Investment holding",
  llcBusinessCode: "523900",
  ownerName: "Example Owner",
  ownerAddress: "1 Example Street, Toronto, Ontario M5H 2N2, Canada",
  ownerCountryCitizenship: "Canada",
  ownerCountryTaxResidence: "Canada",
  ownerCountryBusiness: "Canada",
  ownerFtin: "CA12345",
  ownerItin: "",
  ownerReferenceId: "EXAMPLE123",
  taxYears: [2025],
  isFinalReturn: false,
  dissolvedAt: null,
  isDiirsp: true,
  reasonableCauseNarrative: null,
  extensionFiled: "no",
  extensionTransmittedAt: null,
};

describe("reasonable-cause completeness", () => {
  const now = new Date(Date.UTC(2026, 8, 21));

  it("accepts per-year answers for every late year", () => {
    expect(
      hasCompleteReasonableCause(
        { ...completeFiling, taxYears: [2024, 2025] },
        [
          {
            taxYear: 2024,
            rcsWhyMissed: "I did not know the form was required.",
            rcsWhenLearned: "I learned in 2026.",
            rcsNoIrsNoticeConfirmed: true,
          },
          {
            taxYear: 2025,
            rcsWhyMissed: "I missed the reminder.",
            rcsWhenLearned: "I learned in 2026.",
            rcsNoIrsNoticeConfirmed: true,
          },
        ],
        now,
      ),
    ).toBe(true);
  });

  it("uses filing.yearData when a caller passes only the present tax years", () => {
    const issues = filingCompletionIssues(
      {
        ...completeFiling,
        yearData: [
          {
            taxYear: 2025,
            rcsWhyMissed: "I did not know the form was required.",
            rcsWhenLearned: "I learned in 2026.",
            rcsNoIrsNoticeConfirmed: true,
          },
        ],
      },
      [2025],
      now,
    );

    expect(issues).not.toContain("reasonableCauseNarrative");
  });

  it("accepts a legacy narrative for older orders", () => {
    expect(
      hasCompleteReasonableCause(
        { ...completeFiling, reasonableCauseNarrative: "Legacy reasonable cause narrative." },
        [],
        now,
      ),
    ).toBe(true);
  });

  it("rejects a late filing when a late year is missing one per-year answer and no legacy narrative exists", () => {
    const issues = filingCompletionIssues(
      completeFiling,
      [
        {
          taxYear: 2025,
          rcsWhyMissed: "I did not know the form was required.",
          rcsWhenLearned: "",
          rcsNoIrsNoticeConfirmed: true,
        },
      ],
      now,
    );

    expect(issues).toContain("reasonableCauseNarrative");
  });

  it("treats no-FTIN owner data as complete when ownerHasFtin is false", () => {
    const issues = filingCompletionIssues(
      { ...completeFiling, ownerHasFtin: false, ownerFtin: "", reasonableCauseNarrative: "Legacy narrative." },
      [{ taxYear: 2025 }],
      now,
    );

    expect(issues).not.toContain("ownerFtin");
  });
});
