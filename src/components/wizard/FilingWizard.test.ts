import { describe, expect, it } from "vitest";
import { isValidPbaCode } from "@/lib/irsCodes";
import { BUSINESS_ACTIVITIES, ownerStepFormToPatch } from "./FilingWizard";

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

describe("ownerStepFormToPatch", () => {
  const base = {
    ownerFirstName: "New",
    ownerMiddleName: "",
    ownerLastName: "Name",
    ownerAddressStreet: "1 Example Street",
    ownerAddressCity: "Toronto",
    ownerAddressState: "Ontario",
    ownerAddressPostal: "M5H 2N2",
    ownerAddressCountry: "Canada",
    ownerCountryCitizenship: "Canada",
    ownerCountryTaxResidence: "Canada",
    ownerCountryBusiness: "Canada",
    ownerHasFtin: false,
    ownerNoPostalCode: false,
    ownerFtin: "",
    ownerItin: "",
    ownerReferenceId: "",
  };

  it("reuses an existing ownerReferenceId when the owner name still matches", () => {
    const patched = ownerStepFormToPatch(
      base,
      "STABLE123",
      " new name ",
    );

    expect(patched.ownerReferenceId).toBe("STABLE123");
  });

  it("does not reuse an existing ownerReferenceId when the owner name changes", () => {
    const patched = ownerStepFormToPatch(base, "STABLE123", "Prior Owner");

    expect(patched.ownerReferenceId).not.toBe("STABLE123");
    expect(patched.ownerReferenceId).toMatch(/^NAMEN[A-Z2-9]{4}$/);
  });
});
