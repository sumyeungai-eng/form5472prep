import { TIERS, TIER_ORDER, type Tier } from "@/lib/pricing";

// The Review step shows each tier's feature list split in two: the features
// every plan shares (rendered once, as "Included with both plans") and the
// ones that are specific to a single tier (rendered on that tier's card).
// Both halves are DERIVED from TIERS in pricing.ts — nothing is restated
// here, so the checklist can never promise something the plan doesn't list.

/** Features listed on every tier, in the order the first tier lists them. */
export function sharedTierFeatures(): string[] {
  const [first, ...rest] = TIER_ORDER;
  if (!first) return [];
  return TIERS[first].features.filter((feature) =>
    rest.every((key) => TIERS[key].features.includes(feature)),
  );
}

/** Features listed on this tier but not on every tier (e.g. its turnaround). */
export function tierOnlyFeatures(tier: Tier): string[] {
  const shared = new Set(sharedTierFeatures());
  return TIERS[tier].features.filter((feature) => !shared.has(feature));
}
