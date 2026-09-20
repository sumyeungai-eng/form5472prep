import { describe, expect, it } from "vitest";
import type { Filing } from "@prisma/client";
import { isUntouchedDraft } from "./findOrCreateDraft";

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
