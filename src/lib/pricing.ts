// ─────────────────────────────────────────────────────────────────────────────
// PRICING — source of truth for every customer-facing price on the site.
//
// Model (2026):
//   TWO tiers that differ ONLY by turnaround — the filing itself, the
//   accountant review and everything in the package are identical:
//     standard $149 — ready in 5-7 business days
//     express  $199 — ready within 3 business days
//   The ranges deliberately don't overlap, so the upgrade buys a real,
//   stateable difference rather than a vague "faster".
//   Fax delivery is INCLUDED on both (no separate add-on).
//   Customers can file multiple past tax years — each additional year past
//   the first adds a flat $99, on either tier.
//
// Legacy data: Filing.tier rows created before this held "rush" / "premium"
//   or the older "single_year" / "two_year_diirsp" / "multi_year_diirsp"
//   slugs. We keep these in the DB and map them on display via resolveTier()
//   — old filings show their original plan label tagged "(legacy plan)" and
//   their real charged amount (Filing.amountPaid), while any new price math
//   falls back to a live tier so nothing crashes.
// ─────────────────────────────────────────────────────────────────────────────

export type Tier = "standard" | "express";
export type LegacyTier = "rush" | "premium" | "single_year" | "two_year_diirsp" | "multi_year_diirsp";
export type AnyTierValue = Tier | LegacyTier | string;

export type TierInfo = {
  label: string;
  subtitle: string;
  priceCents: number;
  features: string[];
  highlight?: boolean;
  ctaLabel: string;
};

// The one thing that differs between tiers. Kept as constants so the wizard,
// the pricing page, the landing pages and the confirmation email all quote an
// identical promise — a turnaround stated three different ways is how a
// service-level complaint starts.
export const STANDARD_TURNAROUND = "5-7 business days";
export const EXPRESS_TURNAROUND = "3 business days";

const SHARED_FEATURES = [
  "Reviewed by a qualified tax accountant before submission",
  "Form 5472 + pro forma 1120 prepared",
  "IRS Ogden fax delivery + timestamped receipt",
  "Filing confirmation",
  "Reasonable-cause letter for late / DIIRSP filings",
  "Next-year filing reminder (March email)",
];

export const TIERS: Record<Tier, TierInfo> = {
  standard: {
    label: "Standard filing",
    subtitle: `Ready in ${STANDARD_TURNAROUND}`,
    priceCents: 14900,
    ctaLabel: "Start your filing",
    features: [`Prepared and filed in ${STANDARD_TURNAROUND}`, ...SHARED_FEATURES, "Email support"],
  },
  express: {
    label: "Express filing",
    subtitle: `Ready within ${EXPRESS_TURNAROUND}`,
    priceCents: 19900,
    // No tier carries `highlight` (the "Most popular" badge + emphasised
    // border). Nudging customers toward the dearer plan isn't the pitch here,
    // and we have no order data that would make a "most popular" claim true.
    ctaLabel: "Start express filing",
    features: [
      `Prepared and filed within ${EXPRESS_TURNAROUND}`,
      ...SHARED_FEATURES,
      "Priority email support",
    ],
  },
};

export const TIER_ORDER: Tier[] = ["standard", "express"];

// Flat add-on for every tax year past the first, on either tier. Deliberately
// below the base fee — an extra year that costs as much as the whole first
// filing reads wrong on a multi-year DIIRSP catch-up, which is exactly the
// customer we most want to say yes.
export const MULTI_YEAR_ADDON_CENTS = 9900;
export const MULTI_YEAR_ADDON_LABEL = "Additional past tax year";

export const DEFAULT_TIER: Tier = "standard";

// Admin-only test tier. Not in TIERS so it never appears on /pricing or
// landing pages. Created via /api/admin/test-filing (admin-auth gated).
// /api/checkout detects this value and bypasses Stripe entirely so we can
// exercise the full post-payment flow (PDF gen, AI validation, signing,
// fax, emails) without burning real money.
export const TEST_TIER_VALUE = "test";
export const TEST_TIER_INFO: TierInfo = {
  label: "TEST — $0",
  subtitle: "Internal test order (admin-created, bypasses Stripe)",
  priceCents: 0,
  ctaLabel: "Continue",
  features: [],
};
export function isTestTier(value: string | null | undefined): boolean {
  return value === TEST_TIER_VALUE;
}

// Stripe / display strings for the "fax is included" message. Kept as 0 so
// any legacy callsite that still does `+ FAX_FEE_CENTS` produces the right
// total — the old fax add-on no longer exists as a line item.
export const FAX_FEE_CENTS = 0;
export const FAX_FEE_LABEL = "IRS fax delivery (included)";

// ─────────────────────────────────────────────────────────────────────────────
// LAUNCH PROMOTION (Google Ads channel only)
//
// A flat $50 off the BASE filing fee — not a percentage, and never off the
// multi-year add-on. A percentage would cut deepest on multi-year DIIRSP
// catch-ups, which are the most labour-intensive orders we take; a fixed
// amount keeps the discount where it actually wins the sale.
//
//   Standard 1 year   $149        → $99
//   Standard 2 years  $149+$99    → $198
//   Standard 3 years  $149+$198   → $297
//   Express  1 year   $199        → $149
//
// List prices in TIERS are untouched — this is a discount off list, not a
// second price list, so /pricing, the homepage and the blog keep quoting the
// real price and the promo ends the moment the ads are paused.
//
// THE INVARIANT: promoTotalCents() is the single source of truth for the
// discounted figure. The wizard renders it, /api/checkout derives the Stripe
// coupon from it, and the webhook writes Stripe's real amount_total back onto
// the Filing — so shown == charged == stored.
// ─────────────────────────────────────────────────────────────────────────────

// Funnel sources that receive the launch promotion. Keyed off funnelSource so
// the discount is decided server-side from the landing page the customer
// actually arrived through — never from anything the client can set.
//
// "promo50" is the canonical tag every CTA on /form-5472-50-off emits (via
// `startSrc` in src/lib/landing-pages.ts). That page's own slug is registered
// too as a fail-safe: [seoSlug]/page.tsx derives ?src= from the slug by
// default, so if the startSrc override is ever dropped the visitor still gets
// the price the page advertised instead of being silently billed full list.
export const PROMO_SOURCES: ReadonlySet<string> = new Set([
  "promo50",
  "form-5472-50-off",
]);

// $50 off the base filing fee, so the ad's headline price is $99 on standard
// ($149 − $50) and $149 on express. Additional past tax years are NOT
// discounted — the saving is a fixed amount off the filing, not a percentage
// of the order, so a multi-year catch-up can't be bought at half price.
export const PROMO_DISCOUNT_CENTS = 5000;
export const PROMO_LABEL = "$50 launch promotion";

export function isPromoSource(funnelSource: string | null | undefined): boolean {
  return !!funnelSource && PROMO_SOURCES.has(funnelSource);
}

// Returns the discounted total, rounded down to whole dollars. Non-promo
// sources return fullTotal unchanged.
//
// The admin $0 test tier (isTestTier) can never be discounted — its total is
// already 0, and the <= 0 guard below keeps the arithmetic a no-op regardless.
export function promoTotalCents(
  funnelSource: string | null | undefined,
  fullTotalCents: number,
): number {
  if (!isPromoSource(funnelSource)) return fullTotalCents;
  if (fullTotalCents <= 0) return fullTotalCents;
  // Never let the discount exceed the order (a $0 or negative charge would be
  // rejected by Stripe and is nonsense on a paid service).
  return Math.max(0, fullTotalCents - PROMO_DISCOUNT_CENTS);
}

// Convenience: the amount taken off (fullTotal - promoTotal), 0 when no promo.
export function promoDiscountCents(
  funnelSource: string | null | undefined,
  fullTotalCents: number,
): number {
  return fullTotalCents - promoTotalCents(funnelSource, fullTotalCents);
}

const NEW_TIER_SET = new Set<string>(TIER_ORDER);

export function isTier(value: string | null | undefined): value is Tier {
  return !!value && NEW_TIER_SET.has(value);
}

export type ResolvedTier = {
  tier: Tier;
  isLegacy: boolean;
  legacyLabel?: string;
  legacyYearCount?: number;
};

// Map any historical or current tier string to a usable Tier value for price
// math + label rendering. Unknown / null values fall back to the default
// tier so callers never have to null-check before doing TIERS[resolved.tier].
export function resolveTier(value: string | null | undefined): ResolvedTier {
  if (isTier(value)) return { tier: value, isLegacy: false };
  switch (value) {
    // Retired tiers. Old Rush/Premium orders keep their label + real
    // amountPaid; price math falls back to the single current plan.
    case "rush":
      return { tier: "standard", isLegacy: true, legacyLabel: "Rush (legacy plan)" };
    case "premium":
      return { tier: "standard", isLegacy: true, legacyLabel: "Premium (legacy plan)" };
    case "single_year":
      return { tier: "standard", isLegacy: true, legacyLabel: "Single year (legacy plan)", legacyYearCount: 1 };
    case "two_year_diirsp":
      return { tier: "standard", isLegacy: true, legacyLabel: "Two-year DIIRSP (legacy plan)", legacyYearCount: 2 };
    case "multi_year_diirsp":
      return { tier: "standard", isLegacy: true, legacyLabel: "Three-year DIIRSP (legacy plan)", legacyYearCount: 3 };
    default:
      return { tier: DEFAULT_TIER, isLegacy: false };
  }
}

export function tierLabel(value: string | null | undefined): string {
  const resolved = resolveTier(value);
  if (resolved.isLegacy && resolved.legacyLabel) return resolved.legacyLabel;
  return TIERS[resolved.tier].label;
}

export function tierInfo(value: string | null | undefined): TierInfo {
  if (isTestTier(value)) return TEST_TIER_INFO;
  return TIERS[resolveTier(value).tier];
}

export function multiYearAddonCents(yearCount: number): number {
  if (yearCount <= 1) return 0;
  return (yearCount - 1) * MULTI_YEAR_ADDON_CENTS;
}

export function totalPriceCents(
  tierValue: string | null | undefined,
  yearCount: number,
): number {
  // Test tier is always $0 — multi-year add-on doesn't apply either, so the
  // admin sees the "Pay $0" button matching what Stripe would have charged.
  if (isTestTier(tierValue)) return 0;
  return tierInfo(tierValue).priceCents + multiYearAddonCents(yearCount);
}

// Returns a lookup table keyed by every tier value the DB may hold (new tiers
// + legacy tier slugs). Used by display code that does
// `getTiersForSource(src)[filing.tier]` — old filings still get a label back
// and the new shared price (since legacy plans no longer exist as a product).
// Enumeration code should iterate over TIERS directly, not this map.
export function getTiersForSource(
  _funnelSource: string | null | undefined,
): Record<string, TierInfo> {
  return {
    standard: TIERS.standard,
    rush: { ...TIERS.standard, label: "Rush (legacy plan)" },
    premium: { ...TIERS.standard, label: "Premium (legacy plan)" },
    single_year: { ...TIERS.standard, label: "Single year (legacy plan)" },
    two_year_diirsp: { ...TIERS.standard, label: "Two-year DIIRSP (legacy plan)" },
    multi_year_diirsp: { ...TIERS.standard, label: "Three-year DIIRSP (legacy plan)" },
  };
}
