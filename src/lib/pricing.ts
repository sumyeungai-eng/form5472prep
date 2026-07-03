// ─────────────────────────────────────────────────────────────────────────────
// PRICING — source of truth for every customer-facing price on the site.
//
// Model (May 2026 rewrite):
//   Three service tiers (Standard / Rush / Premium) charged as a flat fee.
//   Fax delivery is INCLUDED on every tier (no separate $19 add-on).
//   Customers can file multiple past tax years on any tier — each additional
//   year past the first adds a flat $149.
//
// Legacy data: Filing.tier rows created before this rewrite hold
//   "single_year" / "two_year_diirsp" / "multi_year_diirsp". We keep these in
//   the DB and map them on display via resolveTier() — old filings show their
//   original plan label tagged "(legacy plan)", and any new code that needs a
//   real Tier value gets "standard" back so price math doesn't crash.
// ─────────────────────────────────────────────────────────────────────────────

export type Tier = "standard" | "rush" | "premium";
export type LegacyTier = "single_year" | "two_year_diirsp" | "multi_year_diirsp";
export type AnyTierValue = Tier | LegacyTier | string;

export type TierInfo = {
  label: string;
  subtitle: string;
  priceCents: number;
  features: string[];
  highlight?: boolean;
  ctaLabel: string;
};

export const TIERS: Record<Tier, TierInfo> = {
  standard: {
    label: "Standard",
    subtitle: "Prepared in 3-5 business days",
    priceCents: 19900,
    ctaLabel: "Choose Standard",
    features: [
      "Reviewed by a qualified tax accountant before submission",
      "Form 5472 + pro forma 1120 prepared",
      "Fax filing to IRS Ogden included",
      "Filing confirmation",
      "Reasonable-cause letter (for late filings)",
      "Email support",
    ],
  },
  rush: {
    label: "Rush",
    subtitle: "Prepared in 24 hours",
    priceCents: 27900,
    highlight: true,
    ctaLabel: "Choose Rush",
    features: [
      "Everything in Standard",
      "24-hour turnaround",
      "Priority email support",
      "Next-year filing reminder (March email)",
    ],
  },
  premium: {
    label: "Premium",
    subtitle: "Same-day, full support",
    priceCents: 44900,
    ctaLabel: "Choose Premium",
    features: [
      "Everything in Rush",
      "Same-day turnaround (12 hours)",
      "IRS letter handling (1 year)",
      "BOI filing review",
    ],
  },
};

export const TIER_ORDER: Tier[] = ["standard", "rush", "premium"];

// Flat add-on for every tax year past the first. Applies to all three tiers.
export const MULTI_YEAR_ADDON_CENTS = 14900;
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

// ─────────────────────────────────────────────────────────────────────────────
// Legacy compatibility shims.
// The previous pricing model exported these — kept here so any unmigrated
// call sites still compile. New code should use TIERS / resolveTier /
// totalPriceCents directly.
// ─────────────────────────────────────────────────────────────────────────────

export function tierForYearCount(_count: number): Tier {
  // Tier and year-count are independent in the new model; default to Standard.
  return DEFAULT_TIER;
}

export function isPremiumSource(_funnelSource: string | null | undefined): boolean {
  return false;
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
    rush: TIERS.rush,
    premium: TIERS.premium,
    single_year: { ...TIERS.standard, label: "Single year (legacy plan)" },
    two_year_diirsp: { ...TIERS.standard, label: "Two-year DIIRSP (legacy plan)" },
    multi_year_diirsp: { ...TIERS.standard, label: "Three-year DIIRSP (legacy plan)" },
  };
}
