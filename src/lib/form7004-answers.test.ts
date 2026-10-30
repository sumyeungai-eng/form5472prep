import { describe, expect, it } from "vitest";
import { FORM_7004_ANSWERS } from "./form7004-answers";
import { EXTENSION_PRICE_CENTS } from "./pricing";
import { formatPrice } from "./utils";

const wordCount = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

describe("Form 7004 answer capsules", () => {
  it("asks the four plan questions, in order", () => {
    expect(FORM_7004_ANSWERS.map((x) => x.q)).toEqual([
      "Can someone file Form 7004 for my foreign-owned LLC?",
      "When is Form 7004 due for a foreign-owned LLC?",
      "How much does Form5472 Prep charge to file Form 7004?",
      "Does Form 7004 extend the time to pay?",
    ]);
  });

  for (const { q, a, sources } of FORM_7004_ANSWERS) {
    it(`${q} — ≤60 words, brand at most once, irs.gov sources`, () => {
      expect(wordCount(a)).toBeLessThanOrEqual(60);
      expect((a.match(/Form5472 Prep/g) ?? []).length).toBeLessThanOrEqual(1);
      expect(sources.length).toBeGreaterThan(0);
      for (const s of sources) expect(s.url).toMatch(/^https:\/\/www\.irs\.gov\/[a-z0-9\-/_.]+$/);
      expect(a).not.toMatch(/\bCPA\b|licensed|IRS[- ]approved|guarantee/i);
    });
  }

  it("quotes only the Form 7004 price from pricing.ts", () => {
    const prices = FORM_7004_ANSWERS.flatMap((x) => x.a.match(/\$\d+(?:\.\d+)?/g) ?? []);
    expect(prices).toEqual([formatPrice(EXTENSION_PRICE_CENTS)]);
  });

  it("says Form 7004 extends the time to file, not to pay", () => {
    expect(FORM_7004_ANSWERS[3].a).toMatch(/^No\. Form 7004 extends the time to file, not the time to pay/);
  });
});
