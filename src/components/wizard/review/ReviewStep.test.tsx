import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MULTI_YEAR_ADDON_CENTS,
  PROMO_SOURCES,
  TIERS,
  TIER_ORDER,
  isTestTier,
  multiYearAddonCents,
  promoDiscountCents,
  promoTotalCents,
  tierInfo,
  totalPriceCents,
} from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
import { ReviewStep, type ReviewStepFiling } from "./ReviewStep";
import { sharedTierFeatures, tierOnlyFeatures } from "./tierFeatures";

const baseFiling: ReviewStepFiling = {
  id: "filing_test",
  email: "owner@example.com",
  llcName: "Harbour Light Trading LLC",
  llcEin: "12-3456789",
  llcAddress: "1 Main St",
  llcCity: "Sheridan",
  llcState: "WY",
  llcZip: "82801",
  ownerName: "Jane Owner",
  ownerFtin: "AB1234567",
  taxYears: [2025],
  isDiirsp: false,
  extensionFiled: null,
  reasonableCauseNarrative: null,
  tier: "standard",
  funnelSource: null,
};

function render(filing: ReviewStepFiling): string {
  return renderToStaticMarkup(
    <ReviewStep
      filing={filing}
      onBack={() => {}}
      onPay={async () => {}}
      onSelectTier={async () => {}}
      saving={false}
    />,
  );
}

// What /api/checkout charges, restated from the route's own arithmetic:
// tier base + multi-year add-on, minus the server-side promo discount. The
// admin test tier never reaches Stripe (the route short-circuits it to a $0
// paid order), so nothing is charged for it.
function checkoutChargeCents(filing: ReviewStepFiling): number {
  if (isTestTier(filing.tier)) return 0;
  const yearCount = filing.taxYears.length || 1;
  const expectedTotalCents = tierInfo(filing.tier).priceCents + multiYearAddonCents(yearCount);
  return expectedTotalCents - promoDiscountCents(filing.funnelSource, expectedTotalCents);
}

// What FilingWizard reports to ad platforms as the checkout value.
function analyticsAmountCents(filing: ReviewStepFiling): number {
  return promoTotalCents(filing.funnelSource, totalPriceCents(filing.tier, filing.taxYears.length || 1));
}

describe("ReviewStep pay button quotes exactly what checkout charges", () => {
  const cases: { name: string; tier: string | null; taxYears: number[] }[] = [
    { name: "standard, 1 year", tier: "standard", taxYears: [2025] },
    { name: "standard, 3 years", tier: "standard", taxYears: [2023, 2024, 2025] },
    { name: "express, 1 year", tier: "express", taxYears: [2025] },
    { name: "express, 2 years", tier: "express", taxYears: [2024, 2025] },
    { name: "legacy rush tier, 2 years", tier: "rush", taxYears: [2024, 2025] },
    { name: "no tier stored, no years yet", tier: null, taxYears: [] },
    { name: "admin $0 test tier, 3 years", tier: "test", taxYears: [2023, 2024, 2025] },
  ];

  for (const c of cases) {
    it(c.name, () => {
      const filing = { ...baseFiling, tier: c.tier, taxYears: c.taxYears };
      const charged = checkoutChargeCents(filing);
      expect(analyticsAmountCents(filing)).toBe(charged);
      const html = render(filing);
      expect(html).toContain(`Pay ${formatUsd(charged)} securely`);
      // Fax is bundled on every tier: shown as an included line, never priced.
      expect(html).toContain("IRS fax delivery");
      expect(html).toContain("Included");
      const extraYears = Math.max(0, (c.taxYears.length || 1) - 1);
      if (extraYears > 0 && c.tier !== "test") {
        expect(html).toContain(`${extraYears} × ${formatUsd(MULTI_YEAR_ADDON_CENTS)}`);
      }
    });
  }

  describe("with a promotion source active", () => {
    const promoSource = "__review_step_test_promo__";
    afterEach(() => {
      (PROMO_SOURCES as Set<string>).delete(promoSource);
    });

    it("strikes the list total and charges the discounted amount", () => {
      (PROMO_SOURCES as Set<string>).add(promoSource);
      const filing = { ...baseFiling, tier: "express", taxYears: [2024, 2025], funnelSource: promoSource };
      const listTotal = totalPriceCents("express", 2);
      const charged = checkoutChargeCents(filing);
      expect(charged).toBeLessThan(listTotal);
      expect(analyticsAmountCents(filing)).toBe(charged);
      const html = render(filing);
      expect(html).toContain(`Pay ${formatUsd(charged)} securely`);
      expect(html).toContain(formatUsd(listTotal));
    });
  });

  it("hides the tier chooser on an admin test filing", () => {
    expect(render({ ...baseFiling, tier: "test" })).not.toContain('role="radiogroup"');
    expect(render(baseFiling)).toContain('role="radiogroup"');
  });
});

describe("tier feature split", () => {
  it("shows every listed feature exactly once and invents none", () => {
    const shared = sharedTierFeatures();
    expect(shared.length).toBeGreaterThan(0);
    for (const key of TIER_ORDER) {
      const own = tierOnlyFeatures(key);
      expect(new Set([...shared, ...own])).toEqual(new Set(TIERS[key].features));
      expect(own.some((f) => shared.includes(f))).toBe(false);
    }
  });
});

describe("ReviewStep reasonable-cause row", () => {
  it("shows per-year answers instead of 'missing' for a late filing", () => {
    const html = render({
      ...baseFiling,
      taxYears: [2024, 2025],
      isDiirsp: true,
      yearData: [
        { taxYear: 2025, rcsWhyMissed: "The Owner was not aware of the requirement." },
        { taxYear: 2024, rcsWhyMissed: "The Owner was not aware of the requirement." },
      ],
    });
    expect(html).toContain("Answered for 2024, 2025");
    expect(html).not.toContain(">missing<");
  });

  it("still flags a late filing with no answers at all", () => {
    const html = render({ ...baseFiling, isDiirsp: true, yearData: [] });
    expect(html).toContain("missing");
  });
});
