import { describe, expect, it } from "vitest";
import { isValidPbaCode } from "@/lib/irsCodes";
import { BUSINESS_ACTIVITIES } from "./FilingWizard";

describe("BUSINESS_ACTIVITIES", () => {
  it("uses IRS Form 1120 principal business activity codes for every supported year", () => {
    for (const preset of BUSINESS_ACTIVITIES) {
      for (const year of [2023, 2024, 2025] as const) {
        expect(
          isValidPbaCode(preset.code, year),
          `${preset.activity} (${preset.code}) should be valid for ${year}`,
        ).toBe(true);
      }
    }
  });
});
