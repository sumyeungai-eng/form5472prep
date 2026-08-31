import { describe, expect, it } from 'vitest';
import { getParams } from './params';
import { assembleDemand, checkHoldoverEligibility, HOLDOVER_GROUNDS } from './provisional';
import { computeSalariesTax } from './salaries';
import type { Computation } from './types';

const params = getParams('2025_26');

function computation(overrides: Partial<Computation> = {}): Computation {
  return {
    head: 'salaries',
    lines: [],
    netAssessableIncome: 0,
    netChargeableIncome: 0,
    taxAtProgressive: 0,
    taxAtStandard: 0,
    basisUsed: 'progressive',
    taxBeforeReduction: 0,
    reduction: 0,
    finalTax: 0,
    ...overrides,
  };
}

describe('assembleDemand', () => {
  it('uses salaries tax before reduction as provisional tax when final tax was reduced', () => {
    const demand = assembleDemand('salaries', computation({
      taxBeforeReduction: 58_500,
      reduction: 3_000,
      finalTax: 55_500,
    }), params);

    expect(demand.finalTax).toBe(55_500);
    expect(demand.provisionalTax).toBe(58_500);
    expect(demand.totalDemand).toBe(114_000);
  });

  it('doubles property final tax when no reduction applies', () => {
    const demand = assembleDemand('property', computation({
      head: 'property',
      taxBeforeReduction: 28_800,
      reduction: 0,
      finalTax: 28_800,
    }), params);

    expect(demand.provisionalTax).toBe(28_800);
    expect(demand.totalDemand).toBe(57_600);
    expect(demand.totalDemand).toBe(2 * demand.finalTax);
  });

  it('accepts pa demand head for a Personal Assessment computation', () => {
    const demand = assembleDemand('pa', computation({
      head: 'personalAssessment',
      taxBeforeReduction: 72_780,
      reduction: 3_000,
      finalTax: 69_780,
    }), params);

    expect(demand.finalTax).toBe(69_780);
    expect(demand.provisionalTax).toBe(72_780);
    expect(demand.lines.find((line) => line.key === 'demand.provisionalTax')?.amount).toBe(72_780);
  });

  it('assembles a profits tax demand from pre-reduction profits tax', () => {
    const demand = assembleDemand('profits', computation({
      head: 'profits',
      taxBeforeReduction: 180_000,
      reduction: 3_000,
      finalTax: 177_000,
    }), params);

    expect(demand.finalTax).toBe(177_000);
    expect(demand.provisionalTax).toBe(180_000);
    expect(demand.totalDemand).toBe(357_000);
  });

  it('keeps installment split arithmetic exact after rounding', () => {
    const finalTax = 10_000;
    const provisionalTax = 10_002;
    const demand = assembleDemand('salaries', computation({
      taxBeforeReduction: provisionalTax,
      finalTax,
    }), params);

    expect(demand.installments.secondAmount).toBe(Math.round(provisionalTax * 0.25));
    expect(demand.installments.firstAmount + demand.installments.secondAmount).toBe(finalTax + provisionalTax);
    expect(demand.installments.firstAmount - finalTax + demand.installments.secondAmount).toBe(provisionalTax);
  });

  it('floors provisional salaries tax to whole dollars before splitting installments', () => {
    const salaries = computeSalariesTax({
      incomeItems: [{ key: 'salary', labelZh: '薪金', labelEn: 'Salary', amount: 332_001 }],
    }, params);
    const demand = assembleDemand('salaries', salaries, params);

    expect(salaries.taxBeforeReduction).toBe(16_000.17);
    expect(demand.finalTax).toBe(13_000);
    expect(demand.provisionalTax).toBe(16_000);
    expect(demand.totalDemand).toBe(29_000);
    expect(demand.installments.firstAmount).toBe(25_000);
    expect(demand.installments.secondAmount).toBe(4_000);
    expect(Number.isInteger(demand.finalTax)).toBe(true);
    expect(Number.isInteger(demand.provisionalTax)).toBe(true);
    expect(Number.isInteger(demand.installments.firstAmount)).toBe(true);
    expect(Number.isInteger(demand.installments.secondAmount)).toBe(true);
    expect(Number.isInteger(demand.totalDemand)).toBe(true);
    expect(demand.installments.firstAmount + demand.installments.secondAmount).toBe(demand.totalDemand);
    expect(demand.installments.firstAmount - demand.finalTax + demand.installments.secondAmount).toBe(demand.provisionalTax);
  });

  it('throws when the requested demand head does not match the computation head', () => {
    expect(() => assembleDemand('profits', computation({ head: 'salaries' }), params)).toThrow(
      'Demand head profits does not match computation head salaries',
    );
  });
});

describe('checkHoldoverEligibility', () => {
  it('returns eligible with matched grounds in checklist order', () => {
    const result = checkHoldoverEligibility({
      'prior-year-objection': true,
      '90-percent-drop': true,
      'personal-assessment-election': false,
    });

    expect(result.eligible).toBe(true);
    expect(result.matchedGrounds.map((ground) => ground.id)).toEqual([
      '90-percent-drop',
      'prior-year-objection',
    ]);
  });

  it('ignores unknown answer ids', () => {
    const result = checkHoldoverEligibility({
      'not-a-ground': true,
      'ceased-source': true,
    });

    expect(result.eligible).toBe(true);
    expect(result.matchedGrounds).toEqual([
      HOLDOVER_GROUNDS.find((ground) => ground.id === 'ceased-source'),
    ]);
  });

  it('returns not eligible when all answers are false', () => {
    const result = checkHoldoverEligibility({
      '90-percent-drop': false,
      'increased-allowances-deductions': false,
      'personal-assessment-election': false,
      'ceased-source': false,
      'prior-year-objection': false,
    });

    expect(result.eligible).toBe(false);
    expect(result.matchedGrounds).toEqual([]);
  });

  it('returns not eligible when answers are empty', () => {
    const result = checkHoldoverEligibility({});

    expect(result.eligible).toBe(false);
    expect(result.matchedGrounds).toEqual([]);
  });
});
