import { describe, expect, it } from 'vitest';
import { ALL_YEARS, DEFAULT_YEAR, getParams } from './index';

describe('tax year params', () => {
  it('defines tax reduction caps and applicable heads by year', () => {
    expect(getParams('2024_25').taxReduction.cap).toBe(1500);
    expect(getParams('2025_26').taxReduction.cap).toBe(3000);

    for (const year of ALL_YEARS) {
      expect(getParams(year).taxReduction.appliesTo).toEqual(['salaries', 'profits', 'pa']);
      expect(getParams(year).taxReduction.appliesTo).not.toContain('property');
    }
  });

  it('defines progressive bands for both years', () => {
    for (const year of ALL_YEARS) {
      expect(getParams(year).progressiveBands).toEqual([
        { width: 50000, rate: 0.02 },
        { width: 50000, rate: 0.06 },
        { width: 50000, rate: 0.10 },
        { width: 50000, rate: 0.14 },
        { width: null, rate: 0.17 },
      ]);
    }
  });

  it('defines standard rate tiers for both years', () => {
    for (const year of ALL_YEARS) {
      expect(getParams(year).standardRateTiers).toEqual([
        { width: 5000000, rate: 0.15 },
        { width: null, rate: 0.16 },
      ]);
    }
  });

  it('matches spot-checked statutory values', () => {
    const params = getParams('2025_26');

    expect(params.allowances.basic).toBe(132000);
    expect(params.allowances.married).toBe(264000);
    expect(params.allowances.child).toBe(130000);
    expect(params.allowances.parentAged60).toBe(50000);
    expect(params.allowances.sibling).toBe(37500);
    expect(params.deductionCaps.mpfMandatory).toBe(18000);
    expect(params.deductionCaps.donationsPercent).toBe(0.35);
    expect(params.deductionCaps.homeLoanInterestYears).toBe(20);
    expect(params.propertyTax.rate).toBe(0.15);
    expect(params.propertyTax.repairsAllowancePercent).toBe(0.20);
    expect(params.profitsTax.tierOneRate).toBe(0.075);
    expect(params.profitsTax.tierOneCap).toBe(2000000);
    expect(params.mpf.employeeRate).toBe(0.05);
    expect(params.mpf.monthlyCap).toBe(1500);
    expect(params.mpf.minRelevantIncomeMonthly).toBe(7100);
    expect(params.mpf.maxRelevantIncomeMonthly).toBe(30000);
  });

  it('exports year lookup helpers', () => {
    expect(getParams('2024_25').year).toBe('2024_25');
    expect(getParams('2025_26').year).toBe('2025_26');
    expect(ALL_YEARS).toEqual(['2024_25', '2025_26']);
    expect(DEFAULT_YEAR).toBe('2025_26');
  });
});
