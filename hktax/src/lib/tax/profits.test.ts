import { describe, expect, it } from 'vitest';
import { ya2024_25 } from './params/ya2024_25';
import { ya2025_26 } from './params/ya2025_26';
import { computeProfitsTax } from './profits';
import type { BusinessInput } from './profits';

function singleBusiness(overrides: Partial<BusinessInput> = {}): BusinessInput {
  return {
    id: 'biz-1',
    revenue: 0,
    deductibleExpenses: 0,
    ...overrides,
  };
}

function amountFor(result: ReturnType<typeof computeProfitsTax>, key: string): number {
  const found = result.perBusiness[0].lines.find((line) => line.key === key);
  if (!found) {
    throw new Error(`Missing line ${key}`);
  }
  return found.amount;
}

describe('computeProfitsTax', () => {
  it('taxes profits under the first-tier cap at the tier-one rate when elected', () => {
    const result = computeProfitsTax(
      [singleBusiness({ revenue: 1_500_000, deductibleExpenses: 500_000, electedTwoTier: true })],
      ya2025_26,
    );

    expect(result.perBusiness[0].assessableProfits).toBe(1_000_000);
    expect(result.perBusiness[0].tax).toBe(75_000);
    expect(amountFor(result, 'tax-tier-one')).toBe(75_000);
    expect(result.finalTax).toBe(72_000);
  });

  /*
   * Hand-verified worked example:
   * revenue = 3,000,000
   * deductibleExpenses = 800,000
   * adjustedProfit = 3,000,000 - 800,000 = 2,200,000
   * assessableProfits = 2,200,000
   * tax = 2,000,000 * 0.075 + 200,000 * 0.15
   *     = 150,000 + 30,000
   *     = 180,000
   * YA 2025/26 reduction = min(1 * 180,000, 3,000) = 3,000
   * finalTax = 180,000 - 3,000 = 177,000
   */
  it('splits profits over the first-tier cap when two-tier rates are elected', () => {
    const result = computeProfitsTax(
      [singleBusiness({ revenue: 3_000_000, deductibleExpenses: 800_000, electedTwoTier: true })],
      ya2025_26,
    );

    expect(result.perBusiness[0].assessableProfits).toBe(2_200_000);
    expect(amountFor(result, 'tax-tier-one')).toBe(150_000);
    expect(amountFor(result, 'tax-standard-remainder')).toBe(30_000);
    expect(result.perBusiness[0].tax).toBe(180_000);
    expect(result.reduction).toBe(3_000);
    expect(result.finalTax).toBe(177_000);
  });

  it('uses the flat standard rate when no two-tier election is made', () => {
    const result = computeProfitsTax(
      [singleBusiness({ revenue: 1_500_000, deductibleExpenses: 500_000 })],
      ya2025_26,
    );

    expect(result.perBusiness[0].assessableProfits).toBe(1_000_000);
    expect(amountFor(result, 'tax-standard')).toBe(150_000);
    expect(result.perBusiness[0].tax).toBe(150_000);
  });

  it('throws when more than one business elects two-tier rates', () => {
    expect(() =>
      computeProfitsTax(
        [
          singleBusiness({ id: 'biz-1', revenue: 1, electedTwoTier: true }),
          singleBusiness({ id: 'biz-2', revenue: 1, electedTwoTier: true }),
        ],
        ya2025_26,
      ),
    ).toThrow('Only one business may elect');
  });

  it('reports a current-year loss as negative assessable profits and carries it forward', () => {
    const result = computeProfitsTax(
      [singleBusiness({ revenue: 100_000, deductibleExpenses: 350_000 })],
      ya2025_26,
    );

    expect(result.perBusiness[0].assessableProfits).toBe(-250_000);
    expect(result.perBusiness[0].lossCarriedForward).toBe(250_000);
    expect(result.perBusiness[0].tax).toBe(0);
    expect(result.totalAssessableProfits).toBe(0);
  });

  it('partially offsets positive assessable profits with brought-forward loss', () => {
    const result = computeProfitsTax(
      [singleBusiness({ revenue: 1_000_000, deductibleExpenses: 200_000, lossBroughtForward: 300_000 })],
      ya2025_26,
    );

    expect(amountFor(result, 'loss-brought-forward-applied')).toBe(-300_000);
    expect(result.perBusiness[0].assessableProfits).toBe(500_000);
    expect(result.perBusiness[0].lossCarriedForward).toBe(0);
    expect(result.perBusiness[0].tax).toBe(75_000);
  });

  it('fully offsets assessable profits with brought-forward loss and carries forward the remainder', () => {
    const result = computeProfitsTax(
      [singleBusiness({ revenue: 700_000, deductibleExpenses: 200_000, lossBroughtForward: 650_000 })],
      ya2025_26,
    );

    expect(result.perBusiness[0].assessableProfits).toBe(0);
    expect(result.perBusiness[0].lossCarriedForward).toBe(150_000);
    expect(result.perBusiness[0].tax).toBe(0);
  });

  it('deducts P&M initial allowance and simplified pool annual allowance', () => {
    const result = computeProfitsTax(
      [
        singleBusiness({
          revenue: 1_000_000,
          deductibleExpenses: 200_000,
          capitalAllowances: {
            pmInitialAdditions: 100_000,
            pools: [{ rate: 0.2, broughtForward: 50_000, additions: 100_000 }],
          },
        }),
      ],
      ya2025_26,
    );

    // 60% initial allowance = 100,000 * 0.60 = 60,000.
    // Pool annual allowance = 20% * (50,000 b/f + 100,000 additions * 0.40) = 18,000.
    // Assessable profits = 1,000,000 - 200,000 - 60,000 - 18,000 = 722,000.
    expect(amountFor(result, 'pm-initial-allowance')).toBe(-60_000);
    expect(amountFor(result, 'pm-pool-1-annual-allowance')).toBe(-18_000);
    expect(amountFor(result, 'pm-pool-1-carried-forward')).toBe(72_000);
    expect(result.perBusiness[0].assessableProfits).toBe(722_000);
  });

  it('deducts a direct building allowance from assessable profits', () => {
    const result = computeProfitsTax(
      [
        singleBusiness({
          revenue: 900_000,
          deductibleExpenses: 200_000,
          capitalAllowances: { buildingAllowance: 125_000 },
        }),
      ],
      ya2025_26,
    );

    expect(amountFor(result, 'building-allowance')).toBe(-125_000);
    expect(result.perBusiness[0].assessableProfits).toBe(575_000);
  });

  it('uses year-specific aggregate reduction caps for the same profits', () => {
    const businesses = [singleBusiness({ revenue: 1_500_000, deductibleExpenses: 500_000, electedTwoTier: true })];

    const ya2024Result = computeProfitsTax(businesses, ya2024_25);
    const ya2025Result = computeProfitsTax(businesses, ya2025_26);

    expect(ya2024Result.totalTax).toBe(75_000);
    expect(ya2024Result.reduction).toBe(1_500);
    expect(ya2024Result.finalTax).toBe(73_500);
    expect(ya2025Result.totalTax).toBe(75_000);
    expect(ya2025Result.reduction).toBe(3_000);
    expect(ya2025Result.finalTax).toBe(72_000);
  });

  it('adds back non-deductible business expenses before tax', () => {
    const baseline = computeProfitsTax(
      [singleBusiness({ revenue: 800_000, deductibleExpenses: 300_000 })],
      ya2025_26,
    );
    const withAddBacks = computeProfitsTax(
      [
        singleBusiness({
          revenue: 800_000,
          deductibleExpenses: 300_000,
          addBacks: {
            privatePortion: 40_000,
            capitalExpenditure: 60_000,
            proprietorSalaries: 75_000,
            nonDeductibleDonations: 25_000,
          },
        }),
      ],
      ya2025_26,
    );

    expect(amountFor(withAddBacks, 'add-back-private-portion')).toBe(40_000);
    expect(amountFor(withAddBacks, 'add-back-capital-expenditure')).toBe(60_000);
    expect(amountFor(withAddBacks, 'add-back-proprietor-salaries')).toBe(75_000);
    expect(amountFor(withAddBacks, 'add-back-non-deductible-donations')).toBe(25_000);
    expect(withAddBacks.perBusiness[0].assessableProfits - baseline.perBusiness[0].assessableProfits).toBe(200_000);
  });

  it('aggregates only positive assessable profits across multiple businesses', () => {
    const result = computeProfitsTax(
      [
        singleBusiness({ id: 'profit', revenue: 1_000_000, deductibleExpenses: 400_000 }),
        singleBusiness({ id: 'loss', revenue: 100_000, deductibleExpenses: 250_000 }),
      ],
      ya2025_26,
    );

    expect(result.perBusiness[0].assessableProfits).toBe(600_000);
    expect(result.perBusiness[1].assessableProfits).toBe(-150_000);
    expect(result.totalAssessableProfits).toBe(600_000);
    expect(result.totalTax).toBe(90_000);
  });
});
