import { describe, expect, it, vi } from "vitest";
import { getMarketingTranslator, type MarketingTranslator } from "@/i18n/marketing";
import { catalogText } from "./translation";

describe("catalogText recovery", () => {
  it("uses the live English source when both catalogs cannot render their facts", () => {
    const t = getMarketingTranslator("de");
    const key = "shared.tiers.standard.subtitle";
    const source = "Ready when reviewed"; // No days1: neither catalog can format it.
    expect(t.has(key)).toBe(true);
    expect(t(key)).toBe(key);
    expect(catalogText("de", t, key, source)).toBe(source);
  });
  it("recovers a missing key and a throwing translator without throwing at render", () => {
    expect(catalogText("de", getMarketingTranslator("de"), "missing.key", "Source")).toBe("Source");
    const t = Object.assign(vi.fn(() => { throw new Error("Bad ICU"); }), { has: () => true }) as unknown as MarketingTranslator;
    expect(catalogText("de", t, "broken.key", "Source")).toBe("Source");
  });
});
