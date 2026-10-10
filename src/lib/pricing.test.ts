import { describe, expect, it } from "vitest";
import { getTiersForSource, isTier, resolveTier, TIER_ORDER, tierLabel, totalPriceCents } from "./pricing";

describe("plans after the 24-Hour option was withdrawn (2026-10-10)", () => {
  it("offers only Standard and Express", () => {
    expect(TIER_ORDER).toEqual(["standard", "express"]);
    expect(isTier("priority")).toBe(false);
  });

  it("prices and labels a leftover 24-Hour draft as a retired plan at the Standard price", () => {
    expect(resolveTier("priority")).toMatchObject({ tier: "standard", isLegacy: true });
    expect(tierLabel("priority")).toBe("24-Hour filing (retired plan)");
    expect(totalPriceCents("priority", 1)).toBe(totalPriceCents("standard", 1));
  });

  it("labels Express orders properly in display lookups", () => {
    const lookup = getTiersForSource(null);
    expect(lookup.express.label).toBe("Express filing");
    expect(lookup.priority.label).toBe("24-Hour filing (retired plan)");
  });
});
