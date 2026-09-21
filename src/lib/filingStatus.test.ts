import { describe, expect, it } from "vitest";
import { requiresReasonableCause } from "./completeness";
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
