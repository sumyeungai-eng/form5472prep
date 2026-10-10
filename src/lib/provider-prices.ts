// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER PRICES — data behind /compare/form-5472-filing-services.
//
// Evidence: docs/seo/form5472-price-survey-2026-10-05.md. Every competitor
// figure and quote below was copied from that survey, which records the exact
// wording on each provider's OWN page on PRICES_CHECKED_ON. Rules:
//   - Only numbers from the survey's main table / evidence quotes. No review
//     blogs, search snippets or other providers' comparison tables.
//   - `sourceQuote` is verbatim from the survey (≤ 25 words); the test checks
//     it is a substring of the survey file.
//   - Our own row is built from src/lib/pricing.ts. Never hardcode our prices.
//   - Say "not published" where a page is silent. Never say a provider "does
//     not offer" something unless its page says so.
//   - Snapfile is excluded on purpose (possible affiliation, unconfirmed).
// To refresh: re-run the survey, write a new dated survey file, update the
// rows and PRICES_CHECKED_ON in the same commit.
// ─────────────────────────────────────────────────────────────────────────────
import {
  EXPRESS_TURNAROUND,
  MULTI_YEAR_ADDON_CENTS,
  STANDARD_TURNAROUND,
  TIERS,
} from "@/lib/pricing";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const PRICES_CHECKED_ON = "2026-10-05";
export const PRICES_CHECKED_ON_LABEL = "5 October 2026";
export const PRICE_SURVEY_FILE = "docs/seo/form5472-price-survey-2026-10-05.md";

/** How each provider describes itself (per the survey), not our judgement. */
export type ProviderKind =
  | "software you complete yourself"
  | "done-for-you filing service"
  | "CPA firm"
  | "formation-provider annual bundle"
  // Used only where a formation product's published inclusions do not list
  // Form 5472 at all (Stripe Atlas).
  | "formation provider";

export type LateYearPricing = {
  /** Published price of the first late year. */
  firstYearUsd: number;
  /** Published price of each further late year. */
  eachAdditionalUsd: number;
  /** What the per-year figure covers for late years, per the provider's page. */
  note: string;
};

export type ProviderPrice = {
  id: string;
  name: string;
  siteUrl: string;
  isOurs: boolean;
  kind: ProviderKind;
  /** Who prepares or reviews, as the provider's own page states it. */
  reviewNote: string;
  /** Operator, only where the provider's own page names it. */
  operatorNote?: string;
  /** Headline one-year price (USD) used for sorting; null = not published. */
  oneYearPriceUsd: number | null;
  priceNote: string;
  billing: string;
  extraYearNote: string;
  filingMethodNote: string;
  turnaroundNote: string;
  /** Per-year prices for late years, only where the provider publishes them. */
  lateYears?: LateYearPricing;
  sourceUrl: string;
  sourceQuote: string;
  checkedOn: string;
};

/** "$49.99", "$149", "$1,500". */
export function usd(amount: number): string {
  const cents = Math.round(amount * 100);
  const whole = cents % 100 === 0;
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
}

function ourFeature(pattern: RegExp): string {
  const found = TIERS.standard.features.find((f) => pattern.test(f));
  if (!found) {
    throw new Error(`provider-prices: no TIERS.standard feature matches ${pattern} (src/lib/pricing.ts changed?)`);
  }
  return found;
}

const OUR_STANDARD_USD = TIERS.standard.priceCents / 100;
const OUR_EXPRESS_USD = TIERS.express.priceCents / 100;
const OUR_EXTRA_YEAR_USD = MULTI_YEAR_ADDON_CENTS / 100;

const OURS: ProviderPrice = {
  id: "form5472prep",
  name: SITE_NAME,
  siteUrl: SITE_URL,
  isOurs: true,
  kind: "done-for-you filing service",
  reviewNote: ourFeature(/^Reviewed by/i),
  oneYearPriceUsd: OUR_STANDARD_USD,
  priceNote: `${usd(OUR_STANDARD_USD)} Standard / ${usd(OUR_EXPRESS_USD)} Express`,
  billing: "One-off",
  extraYearNote: `+${usd(OUR_EXTRA_YEAR_USD)} per additional past year, either tier`,
  filingMethodNote: `${ourFeature(/fax delivery/i)} (included)`,
  turnaroundNote: `Standard ${STANDARD_TURNAROUND}; Express within ${EXPRESS_TURNAROUND}`,
  lateYears: {
    firstYearUsd: OUR_STANDARD_USD,
    eachAdditionalUsd: OUR_EXTRA_YEAR_USD,
    note: `${ourFeature(/reasonable-cause/i)} included`,
  },
  sourceUrl: `${SITE_URL}/pricing`,
  sourceQuote: `${TIERS.standard.label} ${usd(OUR_STANDARD_USD)}, ${TIERS.express.label} ${usd(OUR_EXPRESS_USD)}`,
  checkedOn: PRICES_CHECKED_ON,
};

const COMPETITORS: ProviderPrice[] = [
  {
    id: "edetax",
    name: "Edetax",
    siteUrl: "https://edetax.com",
    isOurs: false,
    kind: "software you complete yourself",
    reviewNote: 'Describes itself as "filing software, not a CPA firm or tax advisory"',
    oneYearPriceUsd: 49.99,
    priceNote: "$49.99 per filing",
    billing: "One-off, per filing",
    extraYearNote: "$49.99 per past year (tax years from 2017); penalty waiver statement included",
    filingMethodNote: "Direct fax to the IRS with confirmation (included)",
    turnaroundNote: "Not published (about 10 minutes of your time)",
    lateYears: { firstYearUsd: 49.99, eachAdditionalUsd: 49.99, note: "Penalty waiver statement included" },
    sourceUrl: "https://edetax.com/pricing",
    sourceQuote: "Form 5472 + 1120 $49.99 / filing",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "form5472-io",
    name: "form5472.io",
    siteUrl: "https://form5472.io",
    isOurs: false,
    kind: "software you complete yourself",
    reviewNote: 'Describes itself as a "Document preparation tool, not a CPA or tax advisory service"',
    oneYearPriceUsd: 147,
    priceNote: "$147 Starter plan (1 company)",
    billing: "One-off",
    extraYearNote: "Not published (late filing listed as supported)",
    filingMethodNote:
      'Starter lists "IRS-ready PDFs to download"; "We fax it straight to the IRS" is listed under the $197 Business plan',
    turnaroundNote: "Not published (about 15 minutes of your time)",
    sourceUrl: "https://form5472.io/pricing",
    sourceQuote: "Starter For solo founders running one US LLC $ 147 one-time payment",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "5472direct",
    name: "5472Direct",
    siteUrl: "https://www.5472direct.com",
    isOurs: false,
    kind: "software you complete yourself",
    reviewNote: 'Describes itself as "a document preparation tool, not a CPA or tax advisory service"',
    oneYearPriceUsd: 199,
    priceNote: "$199 flat (tax year 2025); IRS fax delivery is an optional +$49",
    billing: "One-off",
    extraYearNote: 'Not published; prior years (2024 and earlier) are handled individually: "Contact us"',
    filingMethodNote: "PDFs; optional +$49 IRS Direct Delivery (fax) with delivery receipt",
    turnaroundNote: "PDFs in minutes; same-day transmission with Direct Delivery",
    sourceUrl: "https://www.5472direct.com/pricing",
    sourceQuote: "Standard LLC Filing $199 Flat fee, tax year 2025 filings",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "form5472-tax",
    name: "form5472.tax",
    siteUrl: "https://form5472.tax",
    isOurs: false,
    kind: "done-for-you filing service",
    reviewNote: 'Describes the filing as "CPA-reviewed"',
    oneYearPriceUsd: 299,
    priceNote: "$299 flat",
    billing: "One-off",
    extraYearNote: "$299 per unfiled year",
    filingMethodNote: "By fax or certified mail, with written confirmation",
    turnaroundNote: '"Filed in 7 days"',
    lateYears: {
      firstYearUsd: 299,
      eachAdditionalUsd: 299,
      note: 'Provider states "Three missed years cost $897"',
    },
    sourceUrl: "https://form5472.tax/pricing/",
    sourceQuote: "Form 5472 filing costs a flat $299 at form5472.tax",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "form5472-ai",
    name: "Form5472.ai",
    siteUrl: "https://form5472.ai",
    isOurs: false,
    kind: "done-for-you filing service",
    reviewNote: "States that a named licensed CPA reviews the filing",
    operatorNote: 'Site states it is "operated by Tax USA Inc."',
    oneYearPriceUsd: 299,
    priceNote:
      '$299 for an "eligible straightforward" single-member LLC; "$399+" for reportable transactions, multi-member LLCs, C corporations and late filings',
    billing: "One-off",
    extraYearNote: 'Not published (late filings start at "$399+")',
    filingMethodNote: '"IRS submission with written transmission confirmation"; method not stated',
    turnaroundNote: "Not published",
    sourceUrl: "https://form5472.ai/pricing",
    sourceQuote: "Form 5472 cost is $299 for an eligible straightforward foreign-owned single-member LLC filing.",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "laramie-ledger",
    name: "Laramie Ledger Tax",
    siteUrl: "https://laramieledgertax.com",
    isOurs: false,
    kind: "done-for-you filing service",
    reviewNote: 'Prepared and signed by "a professional tax preparer"',
    oneYearPriceUsd: 349,
    priceNote: "$349 per return",
    billing: "One-off",
    extraYearNote: "$449 per past-due tax year, reasonable-cause statement included",
    filingMethodNote: "By mail or fax to the IRS in Ogden, Utah",
    turnaroundNote: "Within 5 business days of complete documents; 48-hour express +$149",
    lateYears: { firstYearUsd: 449, eachAdditionalUsd: 449, note: "Reasonable-cause statement included" },
    sourceUrl: "https://laramieledgertax.com/pricing/",
    sourceQuote:
      "Form 5472 + 1120 Annual information return, prepared and signed by a professional tax preparer, filed by mail/fax ... $349",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "form5472-online",
    name: "Form5472.online",
    siteUrl: "https://www.form5472.online",
    isOurs: false,
    kind: "done-for-you filing service",
    reviewNote: 'Includes "licensed CPA preparation and signature"',
    operatorNote: 'Site states it is "operated by Tax USA Inc."',
    oneYearPriceUsd: 399,
    priceNote:
      "$399 + $49 IRS fax add-on = $448 (no income or expenses); $547 if the LLC had income or expenses",
    billing: "One-off",
    extraYearNote:
      "Late year: $947 (no activity) or $1,046 (active) per year, including a $499 penalty-removal letter and the $49 fax",
    filingMethodNote: "IRS fax is a +$49 add-on; without it you submit the return yourself",
    turnaroundNote: "10 business days (pricing page; the product page says 15); 3-day +$199; 24-hour +$299",
    lateYears: {
      firstYearUsd: 947,
      eachAdditionalUsd: 947,
      note: "$399 filing + $499 penalty-removal letter + $49 fax, per year (LLC with no activity)",
    },
    sourceUrl: "https://www.form5472.online/pricing",
    sourceQuote:
      "$448 all-in for a non-active company: $399 preparation plus $49 IRS fax submission with proof of filing.",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "taxhub",
    name: "Taxhub",
    siteUrl: "https://gettaxhub.com",
    isOurs: false,
    kind: "done-for-you filing service",
    reviewNote: 'States "A CPA prepares Form 5472 and the pro-forma Form 1120"',
    oneYearPriceUsd: 469,
    priceNote: "$469 flat",
    billing: "One-year retainer (includes CPA consultation and state reporting if required)",
    extraYearNote: "Not published",
    filingMethodNote: 'Not stated: "method depends on entity type"',
    turnaroundNote: '"Fast turnaround" (no number published)',
    sourceUrl: "https://gettaxhub.com/form-5472-global-tax-filing/",
    sourceQuote: "We handle it end-to-end for $469 — from anywhere in the world.",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "tax-usa-net",
    name: "tax-usa.net",
    siteUrl: "https://www.tax-usa.net",
    isOurs: false,
    kind: "done-for-you filing service",
    reviewNote: 'States "A licensed CPA signs"',
    oneYearPriceUsd: 599,
    priceNote: "$599 per year (company with no income or expenses)",
    billing: "Per year",
    extraYearNote: "Not published as a filing price; penalty removal +$499 per year",
    filingMethodNote: '"We file with the IRS"; method not stated',
    turnaroundNote: "10 business days; 3 business days +$199",
    sourceUrl: "https://www.tax-usa.net/tax-filing-non-us-residents",
    sourceQuote: "SINGLE MEMBER LLC Form 5472 + Form 1120 ... $599 per year",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "hiltzik-cpa",
    name: "Hiltzik CPA",
    siteUrl: "https://hiltzikcpa.com",
    isOurs: false,
    kind: "CPA firm",
    reviewNote: 'Includes "CPA review of the filing package"',
    oneYearPriceUsd: 599,
    priceNote: "$599 current-year filing",
    billing: "One-off per filing year (fee fixed after a 30-minute call)",
    extraYearNote: "$700 per delinquent year",
    filingMethodNote: "Not published",
    turnaroundNote: "Not published",
    lateYears: { firstYearUsd: 700, eachAdditionalUsd: 700, note: "Whether a reasonable-cause statement is included: not stated" },
    sourceUrl: "https://hiltzikcpa.com/form-5472-filing-service/",
    sourceQuote:
      "Current-year filing $599. Preparation of one Form 5472 and the pro forma Form 1120, filed on time or on a timely extension.",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "firstbase",
    name: "Firstbase",
    siteUrl: "https://www.firstbase.io",
    isOurs: false,
    kind: "formation-provider annual bundle",
    reviewNote: '"Full-service process by dedicated tax experts"',
    oneYearPriceUsd: 899,
    priceNote:
      "$899 a year: Tax Filing package for a non-US-owned single-member LLC (lists Forms 5472, pro forma Form 1120, 1099s and an extension)",
    billing: "Annual package",
    extraYearNote: "Not published",
    filingMethodNote: "Not published",
    turnaroundNote: "Not published",
    sourceUrl: "https://www.firstbase.io/tax-software",
    sourceQuote: "For Single-Member LLC owned by a non-US citizen or resident ... $899.00 Annually · Per package",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "doola",
    name: "doola",
    siteUrl: "https://www.doola.com",
    isOurs: false,
    kind: "formation-provider annual bundle",
    reviewNote: 'Pricing page: "our in-house tax and CPA teams"',
    oneYearPriceUsd: 1500,
    priceNote:
      "$1,500 a year for the standalone Tax Filing-only service (help center); the Tax and Compliance plan is $1,999 a year plus state fees (pricing page)",
    billing: "Annual",
    extraYearNote: "Not published",
    filingMethodNote: "Help center: these forms are submitted by mail or fax",
    turnaroundNote: "Not published",
    sourceUrl:
      "https://ask.doola.com/article/8a192242-doola-standalone-tax-filing-only-service-pricing-and-service-details.md",
    sourceQuote:
      "doola's standalone Tax Filing-only service costs $1,500 per year and covers your federal tax filings, including Form 5472 and the accompanying pro forma Form 1120",
    checkedOn: PRICES_CHECKED_ON,
  },
  // ── No published Form 5472 price (shown in the "not published" list) ──
  {
    id: "clemta",
    name: "Clemta",
    siteUrl: "https://clemta.com",
    isOurs: false,
    kind: "formation-provider annual bundle",
    reviewNote: 'Describes itself as "a software-enabled document filing and compliance support service"',
    oneYearPriceUsd: null,
    priceNote:
      'No Form 5472 price published. The Pro plan ($1,068 a year, billed annually, plus state fee) includes "Federal Tax Filing"; Form 5472 is not named on its pricing or federal tax filing pages.',
    billing: "Annual plan",
    extraYearNote: "Not published",
    filingMethodNote: "Not published",
    turnaroundNote: "Not published",
    sourceUrl: "https://clemta.com/pricing",
    sourceQuote: "Yearly state reports and IRS federal tax filings for business",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "startglobal",
    name: "StartGlobal",
    siteUrl: "https://startglobal.co",
    isOurs: false,
    kind: "formation-provider annual bundle",
    reviewNote: "Not published",
    oneYearPriceUsd: null,
    priceNote:
      'No Form 5472 price published. Federal tax filing is "priced by your revenue" and included in the $149/month Managed LLC plan; its federal tax filing page names Form 1065 and K-1s, not Form 5472.',
    billing: "Per service or monthly plan",
    extraYearNote: "Not published",
    filingMethodNote: "Not published",
    turnaroundNote: "Not published",
    sourceUrl: "https://startglobal.co/pricing/",
    sourceQuote: "Annual federal tax filing, priced by your revenue.",
    checkedOn: PRICES_CHECKED_ON,
  },
  {
    id: "stripe-atlas",
    name: "Stripe Atlas",
    siteUrl: "https://stripe.com/atlas",
    isOurs: false,
    kind: "formation provider",
    reviewNote: "Not applicable",
    oneYearPriceUsd: null,
    priceNote:
      "Not listed. Atlas's published inclusions for its $500 one-time setup do not list Form 5472 preparation or filing.",
    billing: "$500 one-time setup; registered agent $100 a year after the first year",
    extraYearNote: "Not applicable",
    filingMethodNote: "Not applicable",
    turnaroundNote: "Not applicable",
    sourceUrl: "https://stripe.com/atlas",
    sourceQuote:
      "Company incorporation in Delaware ... Company tax ID / Founder equity issuance and share purchase / 83(b) election filing / Document templates",
    checkedOn: PRICES_CHECKED_ON,
  },
];

export const PROVIDER_PRICES: readonly ProviderPrice[] = [OURS, ...COMPETITORS];

/**
 * Providers we tried to check but could not read, so nothing about them is
 * stated beyond that. Kept out of PROVIDER_PRICES because there is no quote.
 */
export const UNVERIFIED_PROVIDERS = [
  {
    name: "Northwest Registered Agent",
    siteUrl: "https://www.northwestregisteredagent.com",
    note: "Its Form 5472 page could not be loaded for this check (the site returned a bot-check page), so no price or scope is listed.",
    checkedOn: PRICES_CHECKED_ON,
  },
] as const;

/** Ascending by one-year price, nulls last; ties keep their data order. */
export function sortByOneYearPrice<T extends Pick<ProviderPrice, "oneYearPriceUsd">>(list: readonly T[]): T[] {
  return list
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const x = a.p.oneYearPriceUsd;
      const y = b.p.oneYearPriceUsd;
      if (x === null && y === null) return a.i - b.i;
      if (x === null) return 1;
      if (y === null) return -1;
      return x - y || a.i - b.i;
    })
    .map(({ p }) => p);
}

const isBundle = (p: ProviderPrice) => p.kind === "formation-provider annual bundle";

/** Rows with a published one-year price, cheapest first (the main table). */
export function pricedProviders(): ProviderPrice[] {
  return sortByOneYearPrice(PROVIDER_PRICES.filter((p) => p.oneYearPriceUsd !== null));
}

/** Rows with no published Form 5472 price. */
export function unpricedProviders(): ProviderPrice[] {
  return PROVIDER_PRICES.filter((p) => p.oneYearPriceUsd === null);
}

export type PriceRange = { min: number; max: number; count: number };

function rangeOf(list: readonly ProviderPrice[]): PriceRange {
  const prices = list.map((p) => p.oneYearPriceUsd).filter((n): n is number => n !== null);
  if (prices.length === 0) throw new Error("provider-prices: empty price range");
  return { min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
}

/** One-off / per-filing services (everything priced that is not an annual bundle). */
export function perFilingRange(): PriceRange {
  return rangeOf(pricedProviders().filter((p) => !isBundle(p)));
}

/** Formation providers' annual tax-filing packages. */
export function bundleRange(): PriceRange {
  return rangeOf(pricedProviders().filter(isBundle));
}

/** Per-filing range for a set of kinds (e.g. software only). */
export function rangeForKinds(kinds: readonly ProviderKind[]): PriceRange {
  return rangeOf(pricedProviders().filter((p) => kinds.includes(p.kind)));
}

/** Our arithmetic: three late years filed together from published per-year prices. */
export function threeLateYearsUsd(p: ProviderPrice): number | null {
  if (!p.lateYears) return null;
  const cents = Math.round(p.lateYears.firstYearUsd * 100) + 2 * Math.round(p.lateYears.eachAdditionalUsd * 100);
  return cents / 100;
}

/** How the three-year figure was derived, e.g. "3 × $49.99" or "$149 + 2 × $99". */
export function threeLateYearsFormula(p: ProviderPrice): string | null {
  if (!p.lateYears) return null;
  const { firstYearUsd, eachAdditionalUsd } = p.lateYears;
  return firstYearUsd === eachAdditionalUsd
    ? `3 × ${usd(firstYearUsd)}`
    : `${usd(firstYearUsd)} + 2 × ${usd(eachAdditionalUsd)}`;
}

/** Rows with published late-year prices, cheapest three-year total first. */
export function lateYearProviders(): ProviderPrice[] {
  return PROVIDER_PRICES.filter((p) => p.lateYears).sort(
    (a, b) => (threeLateYearsUsd(a) ?? 0) - (threeLateYearsUsd(b) ?? 0),
  );
}

/** Competitor source pages, deduped, for Article.citation. */
export function providerSourceUrls(): string[] {
  return Array.from(new Set(PROVIDER_PRICES.filter((p) => !p.isOurs).map((p) => p.sourceUrl)));
}
