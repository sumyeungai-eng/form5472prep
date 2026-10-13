import { describe, expect, it } from "vitest";
import { hasAdminReasonableCauseForFax } from "@/lib/completeness";

// Synthetic two-year late catch-up: 2024 and 2025, checked on 13 Oct 2026.
const NOW = new Date("2026-10-13T12:00:00.000Z");
const base = {
  taxYears: [2024, 2025],
  isFinalReturn: false,
  dissolvedAt: null,
  extensionFiled: "no",
  extensionTransmittedAt: null,
};

describe("hasAdminReasonableCauseForFax (staff fax gate, generator 2.3.0)", () => {
  it("passes when every late year has an admin narrative", () => {
    expect(
      hasAdminReasonableCauseForFax(
        base,
        [
          { taxYear: 2024, rcsAdminNarrative: "I did not know about the requirement." },
          { taxYear: 2025, rcsAdminNarrative: "I remained unaware of the requirement." },
        ],
        NOW,
      ),
    ).toBe(true);
  });

  it("never accepts the customer's own explanation in place of the admin narrative", () => {
    expect(
      hasAdminReasonableCauseForFax(
        base,
        [
          { taxYear: 2024, rcsWhyMissed: "customer text", rcsNoIrsNoticeConfirmed: true },
          { taxYear: 2025, rcsWhyMissed: "customer text", rcsNoIrsNoticeConfirmed: true },
        ],
        NOW,
      ),
    ).toBe(false);
  });

  it("requires the narrative for a 'not sure' extension year (package lateness)", () => {
    const notSure = { ...base, extensionFiled: "not_sure" };
    expect(
      hasAdminReasonableCauseForFax(notSure, [{ taxYear: 2024, rcsAdminNarrative: "x" }], NOW),
    ).toBe(false);
  });

  it("does not require a narrative for a timely extended year", () => {
    const extended = {
      ...base,
      extensionFiled: "yes",
      extensionTransmittedAt: new Date("2026-04-10T12:00:00.000Z"),
    };
    expect(
      hasAdminReasonableCauseForFax(extended, [{ taxYear: 2024, rcsAdminNarrative: "x" }], NOW),
    ).toBe(true);
  });

  it("passes when no year is late", () => {
    expect(
      hasAdminReasonableCauseForFax(
        { ...base, taxYears: [2026] },
        [],
        NOW,
      ),
    ).toBe(true);
  });
});
