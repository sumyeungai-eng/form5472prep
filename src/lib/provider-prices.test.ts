import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MULTI_YEAR_ADDON_CENTS, TIERS } from "@/lib/pricing";
import {
  PRICES_CHECKED_ON,
  PRICE_SURVEY_FILE,
  PROVIDER_PRICES,
  UNVERIFIED_PROVIDERS,
  bundleRange,
  lateYearProviders,
  perFilingRange,
  pricedProviders,
  providerSourceUrls,
  sortByOneYearPrice,
  threeLateYearsUsd,
  unpricedProviders,
  usd,
  type ProviderPrice,
} from "@/lib/provider-prices";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const survey = norm(readFileSync(path.resolve(__dirname, "../..", PRICE_SURVEY_FILE), "utf8"));

/** Registrable-ish host of a site URL: "https://www.doola.com" -> "doola.com". */
function siteHost(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

function onOwnDomain(p: { siteUrl: string; sourceUrl?: string }, url: string): boolean {
  const host = new URL(url).hostname;
  const site = siteHost(p.siteUrl);
  return host === site || host.endsWith(`.${site}`);
}

/** Every string field we wrote ourselves (sourceQuote is verbatim, so excluded). */
function ownProse(p: ProviderPrice): string {
  const { sourceQuote: _quote, sourceUrl: _src, siteUrl: _site, ...rest } = p;
  return JSON.stringify(rest);
}

const competitors = PROVIDER_PRICES.filter((p) => !p.isOurs);
const ours = PROVIDER_PRICES.filter((p) => p.isOurs);

describe("provider-prices data", () => {
  it("has exactly one row for us, built from pricing.ts", () => {
    expect(ours).toHaveLength(1);
    expect(ours[0].oneYearPriceUsd).toBe(TIERS.standard.priceCents / 100);
    expect(ours[0].priceNote).toContain(usd(TIERS.express.priceCents / 100));
    expect(ours[0].extraYearNote).toContain(usd(MULTI_YEAR_ADDON_CENTS / 100));
    expect(ours[0].checkedOn).toBe(PRICES_CHECKED_ON);
  });

  it("has unique ids and names", () => {
    expect(new Set(PROVIDER_PRICES.map((p) => p.id)).size).toBe(PROVIDER_PRICES.length);
    expect(new Set(PROVIDER_PRICES.map((p) => p.name)).size).toBe(PROVIDER_PRICES.length);
  });

  it.each(competitors.map((p) => [p.name, p] as const))(
    "%s cites an https page on its own domain with a verbatim quote",
    (_name, p) => {
      expect(p.sourceUrl.startsWith("https://")).toBe(true);
      expect(p.siteUrl.startsWith("https://")).toBe(true);
      expect(onOwnDomain(p, p.sourceUrl)).toBe(true);
      expect(p.sourceQuote.trim().length).toBeGreaterThan(0);
      expect(p.sourceQuote.trim().split(/\s+/).length).toBeLessThanOrEqual(25);
      expect(survey).toContain(norm(p.sourceQuote));
      expect(p.checkedOn).toBe(PRICES_CHECKED_ON);
    },
  );

  it("unverified providers point at their own https site and carry the check date", () => {
    for (const u of UNVERIFIED_PROVIDERS) {
      expect(u.siteUrl.startsWith("https://")).toBe(true);
      expect(u.checkedOn).toBe(PRICES_CHECKED_ON);
    }
  });

  it("never lists Snapfile", () => {
    const all = JSON.stringify([PROVIDER_PRICES, UNVERIFIED_PROVIDERS]);
    expect(all).not.toMatch(/snapfile/i);
  });

  it("has no superlatives in any prose we wrote", () => {
    for (const p of PROVIDER_PRICES) {
      expect(ownProse(p)).not.toMatch(/\bbest\b|#1|cheapest/i);
    }
  });

  it("never calls us a CPA, licensed or IRS-approved, and promises no outcome", () => {
    const text = JSON.stringify(ours);
    expect(text).not.toMatch(/\bCPA\b|licensed|IRS-approved|guarantee/i);
  });

  it("uses an ISO check date", () => {
    expect(PRICES_CHECKED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("provider-prices helpers", () => {
  it("sorts by one-year price ascending with nulls last", () => {
    const sorted = sortByOneYearPrice([
      { oneYearPriceUsd: null },
      { oneYearPriceUsd: 300 },
      { oneYearPriceUsd: 49.99 },
      { oneYearPriceUsd: null },
      { oneYearPriceUsd: 149 },
    ]);
    expect(sorted.map((p) => p.oneYearPriceUsd)).toEqual([49.99, 149, 300, null, null]);
  });

  it("the main table holds only priced rows, ascending", () => {
    const rows = pricedProviders();
    const prices = rows.map((p) => p.oneYearPriceUsd as number);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(rows.length + unpricedProviders().length).toBe(PROVIDER_PRICES.length);
  });

  it("computes the survey's ranges", () => {
    expect(perFilingRange()).toMatchObject({ min: 49.99, max: 599 });
    expect(bundleRange()).toMatchObject({ min: 899, max: 1500 });
  });

  it("reproduces the survey's three-late-year arithmetic", () => {
    const byId = Object.fromEntries(lateYearProviders().map((p) => [p.id, threeLateYearsUsd(p)]));
    expect(byId).toEqual({
      edetax: 149.97,
      form5472prep: TIERS.standard.priceCents / 100 + (2 * MULTI_YEAR_ADDON_CENTS) / 100,
      "form5472-tax": 897,
      "laramie-ledger": 1347,
      "hiltzik-cpa": 2100,
      "form5472-online": 2841,
    });
  });

  it("formats dollars", () => {
    expect(usd(49.99)).toBe("$49.99");
    expect(usd(149)).toBe("$149");
    expect(usd(1500)).toBe("$1,500");
    expect(usd(149.97)).toBe("$149.97");
  });

  it("dedupes competitor source urls for citation", () => {
    const urls = providerSourceUrls();
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((u) => u.startsWith("https://"))).toBe(true);
    expect(urls.length).toBe(competitors.length);
  });
});
