export type Tier = "single_year" | "two_year_diirsp" | "multi_year_diirsp";

export const TIERS: Record<Tier, { label: string; priceCents: number; description: string }> = {
  single_year: {
    label: "Single year",
    priceCents: 16900,
    description:
      "Filled Form 5472 + pro forma Form 1120 with supporting statement. Standard or DIIRSP. Fax delivery to the IRS Ogden PIN Unit added at checkout.",
  },
  two_year_diirsp: {
    label: "Two-year DIIRSP catch-up",
    priceCents: 29900,
    description:
      "Two delinquent tax years with reasonable cause statement, full package included. Per-year cheaper than filing separately.",
  },
  multi_year_diirsp: {
    label: "Three-year DIIRSP catch-up",
    priceCents: 39900,
    description:
      "Three delinquent tax years with reasonable cause statement, full package included. Best per-year price for catch-up.",
  },
};

// Flat add-on charged on the final review step: covers fax transmission to the
// IRS Ogden PIN Unit and submission tracking.
export const FAX_FEE_CENTS = 2900;
export const FAX_FEE_LABEL = "IRS fax delivery & submission";

export function tierForYearCount(count: number): Tier {
  if (count <= 1) return "single_year";
  if (count === 2) return "two_year_diirsp";
  return "multi_year_diirsp";
}
