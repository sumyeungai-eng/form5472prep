import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MULTI_YEAR_ADDON_CENTS, TIERS } from "./pricing";
import { formatPrice } from "./utils";
import { LANDING_PAGES } from "./landing-pages";

// Our own prices in landing-pages.ts must be derived from pricing.ts (template
// strings), never typed as literals, so a price change can't leave stale copy.
// Competitor prices that happen to share a number stay literal and are
// recognised by their own wording ("per month", "Annual State Filing").
const COMPETITOR_LINE = /per[ -]month|Annual State Filing/;

const std = TIERS.standard.priceCents;
const exp = TIERS.express.priceCents;
const add = MULTI_YEAR_ADDON_CENTS;
const OUR_PRICES = [std, exp, add, add * 2, std + add, exp + add, std + add * 2, exp + add * 2, std * 3].map(
  formatPrice,
);

describe("landing page prices", () => {
  const source = readFileSync(join(__dirname, "landing-pages.ts"), "utf8").split("\n");

  it.each(OUR_PRICES)("never hard-codes our price %s", (price) => {
    const literal = new RegExp(`\\${price}(?![\\d,])`);
    const offenders = source
      .map((line, i) => ({ line, n: i + 1 }))
      .filter(({ line }) => !line.trimStart().startsWith("//") && literal.test(line) && !COMPETITOR_LINE.test(line))
      .map(({ n }) => n);
    expect(offenders, `landing-pages.ts lines quoting ${price} literally`).toEqual([]);
  });

  it("still renders the current Standard and Express prices", () => {
    const text = JSON.stringify(LANDING_PAGES);
    expect(text).toContain(`${formatPrice(std)} Standard`);
    expect(text).toContain(`${formatPrice(exp)} Express`);
  });
});
