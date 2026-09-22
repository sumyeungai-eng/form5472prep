import { describe, expect, it } from "vitest";
import type { Filing } from "@prisma/client";
import {
  isUntouchedDraft,
  ownerNamesMatchForReferenceId,
  selectOwnerReferenceIdForOwnerName,
} from "./findOrCreateDraft";

function draft(overrides: Partial<Filing> = {}): Filing {
  return {
    status: "DRAFT",
    taxYears: [],
    llcName: null,
    llcEin: null,
    llcAddress: null,
    llcCity: null,
    llcZip: null,
    llcBusinessActivity: null,
    ownerName: null,
    ownerAddress: null,
    ...overrides,
  } as unknown as Filing;
}

describe("isUntouchedDraft", () => {
  it("reuses a draft with nothing typed into it", () => {
    expect(isUntouchedDraft(draft())).toBe(true);
  });

  it("never reuses a draft that already names a company", () => {
    // The wizard asks for the LLC before the tax years, so a draft for company
    // A has an llcName and no taxYears. Reusing it for company B would drop the
    // customer back into company A's filing.
    expect(isUntouchedDraft(draft({ llcName: "Acme Holdings LLC" }))).toBe(false);
  });

  it("never reuses a draft carrying any other entered field", () => {
    expect(isUntouchedDraft(draft({ ownerName: "Maria Alvarez" }))).toBe(false);
    expect(isUntouchedDraft(draft({ llcEin: "12-3456789" }))).toBe(false);
    expect(isUntouchedDraft(draft({ llcCity: "Sheridan" }))).toBe(false);
    expect(isUntouchedDraft(draft({ llcBusinessActivity: "Retail" }))).toBe(false);
  });

  it("treats an empty string like an empty field", () => {
    expect(isUntouchedDraft(draft({ llcName: "" }))).toBe(true);
  });

  it("never reuses a draft with tax years, or one that is not a draft", () => {
    expect(isUntouchedDraft(draft({ taxYears: [2025] }))).toBe(false);
    expect(isUntouchedDraft(draft({ status: "PAID" }))).toBe(false);
  });
});

describe("owner reference ID owner-name matching", () => {
  it("matches owner names case-insensitively after trimming and normalizing spaces", () => {
    expect(ownerNamesMatchForReferenceId("  Jane   Example ", "jane example")).toBe(true);
    expect(ownerNamesMatchForReferenceId("Jane Example", "Janet Example")).toBe(false);
  });

  it("reuses the most recent paid-family reference ID for the same owner name and FTIN", () => {
    const rows = [
      { ownerName: "Different Owner", ownerReferenceId: "DIFFERENT123", ownerFtin: "HK-DIFF" },
      { ownerName: " Jane   Example ", ownerReferenceId: "SAME123", ownerFtin: "HK-123" },
      { ownerName: "Jane Example", ownerReferenceId: "OLDER456", ownerFtin: "HK-OLD" },
    ];

    expect(selectOwnerReferenceIdForOwnerName(rows, "jane example", { ownerFtin: "HK-123" })).toBe("SAME123");
    expect(selectOwnerReferenceIdForOwnerName(rows, "Another Owner", { ownerFtin: "HK-123" })).toBeNull();
  });

  it("does not reuse a reference ID when the same owner name has a different FTIN", () => {
    const rows = [
      { ownerName: "Jane Example", ownerReferenceId: "SAME123", ownerFtin: "HK-123" },
    ];

    expect(selectOwnerReferenceIdForOwnerName(rows, "Jane Example", { ownerFtin: "HK-999" })).toBeNull();
  });

  it("does not reuse a reference ID for same-name owners with no FTIN and different addresses", () => {
    const rows = [
      {
        ownerName: "Jane Example",
        ownerReferenceId: "SAME123",
        ownerFtin: null,
        ownerAddressStreet: "1 Queen Road",
        ownerAddressPostal: "1000",
      },
    ];

    expect(selectOwnerReferenceIdForOwnerName(rows, "Jane Example", {
      ownerFtin: null,
      ownerAddressStreet: "99 Market Street",
      ownerAddressPostal: "2000",
    })).toBeNull();
  });

  it("reuses a reference ID for same-name owners with no FTIN and matching street plus postal code", () => {
    const rows = [
      {
        ownerName: "Jane Example",
        ownerReferenceId: "SAME123",
        ownerFtin: null,
        ownerAddressStreet: "1 Queen Road",
        ownerAddressPostal: "1000",
      },
    ];

    expect(selectOwnerReferenceIdForOwnerName(rows, "Jane Example", {
      ownerFtin: null,
      ownerAddressStreet: " 1 queen road ",
      ownerAddressPostal: "1000",
    })).toBe("SAME123");
  });
});
