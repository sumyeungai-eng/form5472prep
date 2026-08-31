import { describe, expect, it } from 'vitest';
import { type PAPersonInput } from './personalAssessment';
import type { PropertyInput } from './property';
import type { SalariesInput } from './salaries';
import { buildCoupleScenarios, optimize, type OptimizerResult } from './optimizer';
import { ya2025_26 as params } from './params/ya2025_26';

function eligiblePerson(overrides: Omit<PAPersonInput, 'ageDuringYear' | 'isHongKongPermanentResident'>): PAPersonInput {
  return {
    ageDuringYear: 35,
    isHongKongPermanentResident: true,
    ...overrides,
  };
}

function salary(amount: number, deductions: SalariesInput['deductions'] = {}): SalariesInput {
  return {
    incomeItems: [{ key: 'salary', labelZh: '薪金', labelEn: 'Salary', amount }],
    deductions,
  };
}

function property(rentReceived: number, id = 'flat-a'): PropertyInput {
  return { id, rentReceived };
}

function scenarioRows(result: OptimizerResult): { id: string; available: boolean; totalTax: number }[] {
  return result.scenarios.map((scenario) => ({
    id: scenario.id,
    available: scenario.available,
    totalTax: scenario.totalTax,
  }));
}

function scenarioById(result: OptimizerResult, id: string) {
  const found = result.scenarios.find((scenario) => scenario.id === id);
  if (!found) {
    throw new Error(`Missing scenario ${id}`);
  }
  return found;
}

describe('optimize', () => {
  it('chooses individual PA for a single salary and rental-property filer when let-property mortgage interest lowers tax', () => {
    const personA = eligiblePerson({
      salaries: salary(500_000),
      properties: [property(300_000)],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: 100_000 }],
    });

    const result = optimize({ married: false, personA }, params);

    expect(result.best).toBe('pa');
    expect(result.saving).toBeGreaterThan(0);
    expect(scenarioById(result, 'pa')).toMatchObject({
      available: true,
      totalTax: 65_360,
      perPerson: {
        a: expect.objectContaining({ paTax: 65_360, finalTax: 65_360 }),
      },
    });
    expect(result.explanationEn).toContain('let-property mortgage interest');
  });

  it('keeps separate heads for a high-income salary-only single filer when PA ties', () => {
    const personA = eligiblePerson({ salaries: salary(6_000_000) });

    const result = optimize({ married: false, personA }, params);

    expect(scenarioRows(result)).toEqual([
      { id: 'separate', available: true, totalTax: 907_000 },
      { id: 'pa', available: true, totalTax: 907_000 },
    ]);
    expect(result.best).toBe('separate');
    expect(result.saving).toBe(0);
    expect(result.explanationEn).toContain('tie-break');
  });

  it('chooses joint salaries assessment for a couple where unused spouse allowance headroom lowers salaries tax', () => {
    const personA = eligiblePerson({
      salaries: salary(600_000, { mpfMandatory: params.deductionCaps.mpfMandatory }),
    });
    const personB = eligiblePerson({ salaries: salary(100_000) });

    const result = optimize({ married: true, personA, personB }, params);

    expect(result.best).toBe('jointSalaries');
    expect(scenarioById(result, 'separate').totalTax).toBe(55_500);
    expect(scenarioById(result, 'jointSalaries')).toMatchObject({
      available: true,
      totalTax: 50_060,
      perPerson: {
        a: expect.objectContaining({ jointSalariesTax: 42_720, finalTax: 42_720 }),
        b: expect.objectContaining({ jointSalariesTax: 7_340, finalTax: 7_340 }),
      },
    });
    expect(result.saving).toBe(5_440);
    expect(result.explanationEn).toContain('unused spouse allowance headroom');
  });

  it('makes individual PA scenarios available when both spouses have chargeable income', () => {
    const personA = eligiblePerson({ salaries: salary(500_000) });
    const personB = eligiblePerson({ properties: [property(300_000)] });

    const result = optimize({ married: true, personA, personB }, params);

    expect(scenarioById(result, 'paIndividualA')).toMatchObject({
      available: true,
      totalTax: 77_560,
      reasonUnavailableZh: undefined,
      reasonUnavailableEn: undefined,
    });
    expect(scenarioById(result, 'paIndividualB')).toMatchObject({
      available: true,
      totalTax: 43_360,
      reasonUnavailableZh: undefined,
      reasonUnavailableEn: undefined,
    });
    expect(scenarioById(result, 'paIndividualBoth')).toMatchObject({
      available: true,
      totalTax: 43_360,
      reasonUnavailableZh: undefined,
      reasonUnavailableEn: undefined,
    });
  });

  it('chooses spouse B individual PA for a couple where rental-property mortgage interest beats separate heads and joint salaries', () => {
    const personA = eligiblePerson({ salaries: salary(500_000) });
    const personB = eligiblePerson({
      properties: [property(300_000)],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: 100_000 }],
    });

    const result = optimize({ married: true, personA, personB }, params);

    expect(result.best).toBe('paIndividualB');
    expect(result.saving).toBe(36_000);
    expect(scenarioById(result, 'paIndividualB')).toMatchObject({
      available: true,
      totalTax: 41_560,
      perPerson: {
        a: expect.objectContaining({ finalTax: 41_560 }),
        b: expect.objectContaining({ paTax: 0, finalTax: 0 }),
      },
    });
    expect(scenarioById(result, 'paJoint')).toMatchObject({
      available: true,
      totalTax: 42_920,
      perPerson: {
        a: expect.objectContaining({ jointPATax: 33_532, finalTax: 33_532 }),
        b: expect.objectContaining({ jointPATax: 9_388, finalTax: 9_388 }),
      },
    });
    expect(scenarioById(result, 'jointSalaries')).toMatchObject({
      available: false,
      totalTax: Number.POSITIVE_INFINITY,
    });
    expect(result.explanationEn).toContain('let-property mortgage interest');
  });

  it('returns the full exact scenario table for a couple where individual PA wins from rental mortgage interest', () => {
    const personA = eligiblePerson({ salaries: salary(500_000) });
    const personB = eligiblePerson({
      properties: [property(300_000)],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: 100_000 }],
    });

    const result = optimize({ married: true, personA, personB }, params);

    expect(scenarioRows(result)).toEqual([
      { id: 'separate', available: true, totalTax: 77_560 },
      { id: 'jointSalaries', available: false, totalTax: Number.POSITIVE_INFINITY },
      { id: 'paIndividualA', available: true, totalTax: 77_560 },
      { id: 'paIndividualB', available: true, totalTax: 41_560 },
      { id: 'paIndividualBoth', available: true, totalTax: 41_560 },
      { id: 'paJoint', available: true, totalTax: 42_920 },
    ]);
  });

  it('rejects bilateral raw MPA claims and strips MPA from both spouses in paIndividualBoth', () => {
    const personA = eligiblePerson({
      salaries: {
        ...salary(450_000, { mpfMandatory: 18_000 }),
        allowances: { isMarried: true, claimMarriedAllowance: true },
      },
    });
    const personB = eligiblePerson({
      salaries: {
        ...salary(450_000, { mpfMandatory: 18_000 }),
        allowances: { isMarried: true, claimMarriedAllowance: true },
      },
    });

    expect(() => optimize({ married: true, personA, personB }, params)).toThrow(
      "Both spouses cannot claim the married person's allowance simultaneously. / 夫婦雙方不可同時申索已婚人士免稅額。",
    );

    const scenario = buildCoupleScenarios(personA, personB, params)
      .find((item) => item.id === 'paIndividualBoth');

    // Both spouses elect PA separately, so s.29(1) strips MPA from both.
    // Per spouse: NAI 450,000 - 18,000 MPF = 432,000; basic NCI = 432,000 -
    // 132,000 = 300,000. Progressive tax = 1,000 + 3,000 + 5,000 + 7,000 +
    // 100,000 * 17% = 33,000; 2025/26 reduction = 3,000; final = 30,000.
    expect(scenario).toMatchObject({
      available: true,
      totalTax: 60_000,
      perPerson: {
        a: expect.objectContaining({ paTax: 30_000, finalTax: 30_000 }),
        b: expect.objectContaining({ paTax: 30_000, finalTax: 30_000 }),
      },
    });
  });
});
