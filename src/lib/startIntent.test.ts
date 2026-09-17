import { describe, expect, it } from "vitest";
import { decideStartOutcome } from "./startIntent";

describe("decideStartOutcome", () => {
  it("reuses the existing draft when one exists, regardless of filing count", () => {
    expect(decideStartOutcome({ hasDraft: true, filingCount: 0 })).toEqual({
      action: "open-draft",
      reason: "existing-draft",
    });
    expect(decideStartOutcome({ hasDraft: true, filingCount: 5 })).toEqual({
      action: "open-draft",
      reason: "existing-draft",
    });
  });

  it("creates a draft for a brand-new customer (no draft, zero filings)", () => {
    expect(decideStartOutcome({ hasDraft: false, filingCount: 0 })).toEqual({
      action: "create-draft",
      reason: "new-customer",
    });
  });

  it("sends a returning customer to their filings instead of creating a new draft", () => {
    expect(decideStartOutcome({ hasDraft: false, filingCount: 1 })).toEqual({
      action: "go-to-filings",
      reason: "returning-customer",
    });
  });

  it("still goes to filings for higher filing counts with no draft", () => {
    expect(decideStartOutcome({ hasDraft: false, filingCount: 12 })).toEqual({
      action: "go-to-filings",
      reason: "returning-customer",
    });
  });
});
