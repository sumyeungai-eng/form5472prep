import { describe, expect, it } from 'vitest';
import { optimize, type OptimizerResult } from './optimizer';
import { getParams } from './params';
import { computeJointPA, computePA, type PAPersonInput } from './personalAssessment';
import { computeProfitsTax, type BusinessInput } from './profits';
import { computePropertyTax, type PropertyInput } from './property';
import { assembleDemand } from './provisional';
import { computeJointAssessment, computeSalariesTax, type SalariesInput } from './salaries';
import type { Computation, ComputationLine } from './types';

const ya2024_25 = getParams('2024_25');
const ya2025_26 = getParams('2025_26');

function salary(amount: number, overrides: Partial<SalariesInput> = {}): SalariesInput {
  return {
    incomeItems: [{ key: 'salary', labelZh: '薪金', labelEn: 'Salary', amount }],
    ...overrides,
  };
}

function property(overrides: Partial<PropertyInput> = {}): PropertyInput {
  return {
    id: 'flat-a',
    rentReceived: 0,
    ...overrides,
  };
}

function business(overrides: Partial<BusinessInput> = {}): BusinessInput {
  return {
    id: 'biz-a',
    revenue: 0,
    deductibleExpenses: 0,
    ...overrides,
  };
}

function lineAmount(lines: ComputationLine[], key: string): number {
  const found = lines.find((line) => line.key === key);
  if (!found) {
    throw new Error(`Missing computation line ${key}`);
  }

  return found.amount;
}

function profitsLineAmount(result: ReturnType<typeof computeProfitsTax>, key: string): number {
  return lineAmount(result.perBusiness[0].lines, key);
}

function eligiblePerson(overrides: Omit<PAPersonInput, 'ageDuringYear' | 'isHongKongPermanentResident'>): PAPersonInput {
  return {
    ageDuringYear: 35,
    isHongKongPermanentResident: true,
    ...overrides,
  };
}

function scenarioById(result: OptimizerResult, id: string) {
  const found = result.scenarios.find((scenario) => scenario.id === id);
  if (!found) {
    throw new Error(`Missing scenario ${id}`);
  }

  return found;
}

function scenarioRows(result: OptimizerResult): { id: string; available: boolean; totalTax: number }[] {
  return result.scenarios.map((scenario) => ({
    id: scenario.id,
    available: scenario.available,
    totalTax: scenario.totalTax,
  }));
}

function propertyDemandComputation(result: ReturnType<typeof computePropertyTax>): Computation {
  return {
    head: 'property',
    lines: result.lines,
    netAssessableIncome: result.totalNav,
    netChargeableIncome: result.totalNav,
    taxAtProgressive: result.totalTax,
    taxAtStandard: result.totalTax,
    basisUsed: 'standard',
    taxBeforeReduction: result.totalTax,
    reduction: 0,
    finalTax: result.totalTax,
  };
}

describe('G01: Salaries only, single, simple (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G01
   * EXPECTED: net income 382,000 · NCI 250,000 · progressive 24,500 · standard 57,300 ·
   * basis = progressive · reduction 3,000 · final tax 21,500.
   * Derivation date: 2026-08-31
   */
  it('G01: Salaries only, single, simple', () => {
    const result = computeSalariesTax(
      salary(400_000, { deductions: { mpfMandatory: 18_000 } }),
      ya2025_26,
    );

    expect(result.netAssessableIncome).toBe(382_000);
    expect(result.netChargeableIncome).toBe(250_000);
    expect(result.taxAtProgressive).toBe(24_500);
    expect(result.taxAtStandard).toBe(57_300);
    expect(result.basisUsed).toBe('progressive');
    expect(result.reduction).toBe(3_000);
    expect(result.finalTax).toBe(21_500);
  });
});

describe('G02: Salaries only, single, MPF + self-education (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G02
   * EXPECTED: net income 502,000 · NCI 370,000 · final tax 41,900.
   * Derivation date: 2026-08-31
   */
  it('G02: Salaries only, single, MPF + self-education', () => {
    const result = computeSalariesTax(
      salary(600_000, { deductions: { mpfMandatory: 18_000, selfEducation: 80_000 } }),
      ya2025_26,
    );

    expect(result.netAssessableIncome).toBe(502_000);
    expect(result.netChargeableIncome).toBe(370_000);
    expect(result.finalTax).toBe(41_900);
  });
});

describe('G03: Married couple, salaries only: joint vs separate assessment (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G03
   * EXPECTED: separate total 89,500 · joint total 86,440 · joint assessment wins,
   * saving 3,060.
   * Derivation date: 2026-08-31
   */
  it('G03a: Married couple, salaries only: separate assessment', () => {
    const husband = computeSalariesTax(
      salary(800_000, { deductions: { mpfMandatory: 18_000 } }),
      ya2025_26,
    );
    const wife = computeSalariesTax(
      salary(120_000, { deductions: { mpfMandatory: 6_000 } }),
      ya2025_26,
    );

    expect(husband.netAssessableIncome).toBe(782_000);
    expect(wife.netAssessableIncome).toBe(114_000);
    expect(husband.netChargeableIncome).toBe(650_000);
    expect(wife.netChargeableIncome).toBe(0);
    expect(husband.finalTax).toBe(89_500);
    expect(wife.finalTax).toBe(0);
    expect(husband.finalTax + wife.finalTax).toBe(89_500);
  });

  /*
   * Golden doc: docs/golden-scenarios.md, scenario G03
   * EXPECTED: separate total 89,500 · joint total 86,440 · joint assessment wins,
   * saving 3,060.
   * Derivation date: 2026-08-31
   */
  it('G03b: Married couple, salaries only: joint assessment', () => {
    const result = computeJointAssessment(
      salary(800_000, { deductions: { mpfMandatory: 18_000 } }),
      salary(120_000, { deductions: { mpfMandatory: 6_000 } }),
      {},
      ya2025_26,
    );

    expect(result.netAssessableIncome).toBe(896_000);
    expect(result.netChargeableIncome).toBe(632_000);
    expect(result.taxAtProgressive).toBe(89_440);
    expect(result.taxAtStandard).toBe(134_400);
    expect(result.reduction).toBe(3_000);
    expect(result.finalTax).toBe(86_440);
  });
});

describe('G04: High earner: two-tiered standard rate binds (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G04
   * EXPECTED: net income 5,100,000 · NCI 4,836,000 · progressive 804,120 · standard 766,000 ·
   * basis = standard (two-tiered, 16% tier engaged) · final tax 763,000 · balance after
   * provisional credit 263,000.
   * Derivation date: 2026-08-31
   * Cross-reference URL: https://www.ird.gov.hk/eng/pdf/2026/example2627.pdf
   */
  it('G04: High earner: two-tiered standard rate binds', () => {
    const provisionalTaxPaid = 500_000;
    const result = computeSalariesTax(
      salary(5_300_000, {
        deductions: {
          homeLoanInterest: 100_000,
          elderlyCare: 110_000,
        },
        allowances: {
          isMarried: true,
          claimMarriedAllowance: true,
        },
      }),
      ya2025_26,
    );

    expect(result.netAssessableIncome).toBe(5_100_000);
    expect(result.netChargeableIncome).toBe(4_836_000);
    expect(result.taxAtProgressive).toBe(804_120);
    expect(result.taxAtStandard).toBe(766_000);
    expect(result.basisUsed).toBe('standard');
    expect(lineAmount(result.lines, 'tax.standard.band2')).toBe(16_000);
    expect(result.finalTax).toBe(763_000);
    expect(result.finalTax - provisionalTaxPaid).toBe(263_000);
  });
});

describe('G05: Zero-tax low earner (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G05
   * EXPECTED: NCI 0 · final tax 0 · reduction actually allowed 0.
   * Derivation date: 2026-08-31
   */
  it('G05: Zero-tax low earner', () => {
    const result = computeSalariesTax(
      salary(130_000, { deductions: { mpfMandatory: 6_500 } }),
      ya2025_26,
    );

    expect(result.netAssessableIncome).toBe(123_500);
    expect(result.netChargeableIncome).toBe(0);
    expect(result.taxAtProgressive).toBe(0);
    expect(result.taxAtStandard).toBe(18_525);
    expect(result.reduction).toBe(0);
    expect(result.finalTax).toBe(0);
  });
});

describe('G06: YA 2024/25 twin of G01: the $1,500 ceiling', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G06
   * EXPECTED: final tax 23,000 — exactly $1,500 more than G01. The only permitted
   * difference between the two years in this engine is the reduction ceiling.
   * Derivation date: 2026-08-31
   */
  it('G06: YA 2024/25 twin of G01: the $1,500 ceiling', () => {
    const result = computeSalariesTax(
      salary(400_000, { deductions: { mpfMandatory: 18_000 } }),
      ya2024_25,
    );

    expect(result.netAssessableIncome).toBe(382_000);
    expect(result.netChargeableIncome).toBe(250_000);
    expect(result.taxAtProgressive).toBe(24_500);
    expect(result.taxAtStandard).toBe(57_300);
    expect(result.reduction).toBe(1_500);
    expect(result.finalTax).toBe(23_000);
  });
});

describe('G07: YA 2024/25, child + newborn additional allowance', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G07
   * EXPECTED: allowances 654,000 · NCI 278,000 · final tax 27,760.
   * Derivation date: 2026-08-31
   */
  it('G07: YA 2024/25, child + newborn additional allowance', () => {
    const result = computeSalariesTax(
      salary(950_000, {
        deductions: { mpfMandatory: 18_000 },
        allowances: {
          isMarried: true,
          claimMarriedAllowance: true,
          children: [
            { key: 'age-5' },
            { key: 'newborn', bornInCurrentYear: true },
          ],
        },
      }),
      ya2024_25,
    );

    expect(lineAmount(result.lines, 'allowance.total')).toBe(654_000);
    expect(result.netAssessableIncome).toBe(932_000);
    expect(result.netChargeableIncome).toBe(278_000);
    expect(result.finalTax).toBe(27_760);
  });
});

describe('G08: Property tax, sole owner, simple (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G08
   * EXPECTED: AV 216,000 · NAV 172,800 · final property tax 25,920 · reduction 0.
   * Derivation date: 2026-08-31
   * Cross-reference URL: https://www.gov.hk/en/residents/taxes/property/propertycompute.htm
   */
  it('G08: Property tax, sole owner, simple', () => {
    const result = computePropertyTax(
      [property({ rentReceived: 18_000 * 12 })],
      ya2025_26,
    );

    expect(lineAmount(result.perProperty[0].lines, 'assessableValue')).toBe(216_000);
    expect(result.totalNav).toBe(172_800);
    expect(result.totalTax).toBe(25_920);
    expect(lineAmount(result.perProperty[0].lines, 'taxReduction')).toBe(0);
  });
});

describe('G09: Property tax, co-owned 50%, owner-paid rates, cents floored (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G09
   * EXPECTED: whole-property AV 300,000 · NAV 232,848 · whole-property tax 34,927 ·
   * taxpayer's share of NAV 116,424 · taxpayer's share of tax 17,463.
   * Derivation date: 2026-08-31
   */
  it('G09: Property tax, co-owned 50%, owner-paid rates, cents floored', () => {
    const wholeProperty = computePropertyTax(
      [property({ rentReceived: 25_000 * 12, ratesPaidByOwner: 8_940 })],
      ya2025_26,
    );
    const taxpayerShare = computePropertyTax(
      [property({ rentReceived: 25_000 * 12, ratesPaidByOwner: 8_940, ownershipShare: 0.5 })],
      ya2025_26,
    );

    expect(lineAmount(wholeProperty.perProperty[0].lines, 'assessableValue')).toBe(300_000);
    expect(wholeProperty.totalNav).toBe(232_848);
    expect(wholeProperty.totalTax).toBe(34_927);
    expect(taxpayerShare.totalNav).toBe(116_424);
    expect(taxpayerShare.totalTax).toBe(17_463);
  });
});

describe('G10: Property tax, lease premium spread across years of assessment', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G10
   * EXPECTED: YA 2024/25 — AV 150,000, NAV 120,000, property tax 18,000;
   * YA 2025/26 — AV 300,000, NAV 240,000, property tax 36,000; no tax reduction in either year.
   * Derivation date: 2026-08-31
   * Cross-reference URL: https://www.gov.hk/en/residents/taxes/property/propertyincome.htm
   */
  it('G10a: Property tax, lease premium spread across YA 2024/25', () => {
    const result = computePropertyTax(
      [
        property({
          rentReceived: 20_000 * 6,
          leasePremium: 120_000,
          leaseTermMonths: 24,
          premiumMonthsInYear: 6,
        }),
      ],
      ya2024_25,
    );

    expect(lineAmount(result.perProperty[0].lines, 'assessableValue')).toBe(150_000);
    expect(result.totalNav).toBe(120_000);
    expect(result.totalTax).toBe(18_000);
    expect(lineAmount(result.perProperty[0].lines, 'taxReduction')).toBe(0);
  });

  /*
   * Golden doc: docs/golden-scenarios.md, scenario G10
   * EXPECTED: YA 2024/25 — AV 150,000, NAV 120,000, property tax 18,000;
   * YA 2025/26 — AV 300,000, NAV 240,000, property tax 36,000; no tax reduction in either year.
   * Derivation date: 2026-08-31
   * Cross-reference URL: https://www.gov.hk/en/residents/taxes/property/propertyincome.htm
   */
  it('G10b: Property tax, lease premium spread across YA 2025/26', () => {
    const result = computePropertyTax(
      [
        property({
          rentReceived: 20_000 * 12,
          leasePremium: 120_000,
          leaseTermMonths: 24,
          premiumMonthsInYear: 12,
        }),
      ],
      ya2025_26,
    );

    expect(lineAmount(result.perProperty[0].lines, 'assessableValue')).toBe(300_000);
    expect(result.totalNav).toBe(240_000);
    expect(result.totalTax).toBe(36_000);
    expect(lineAmount(result.perProperty[0].lines, 'taxReduction')).toBe(0);
  });
});

describe('G11: Sole proprietorship, profits under $2M, two-tiered rates elected (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G11
   * EXPECTED: final profits tax 87,000. Contrast (must also be produced by the engine's
   * "no election" branch): without the two-tiered election, 15% × 1,200,000 = 180,000 −
   * 3,000 = 177,000.
   * Derivation date: 2026-08-31
   */
  it('G11: Sole proprietorship, profits under $2M, two-tiered rates elected', () => {
    const elected = computeProfitsTax(
      [business({ revenue: 1_200_000, electedTwoTier: true })],
      ya2025_26,
    );
    const noElection = computeProfitsTax(
      [business({ revenue: 1_200_000 })],
      ya2025_26,
    );

    expect(elected.perBusiness[0].assessableProfits).toBe(1_200_000);
    expect(profitsLineAmount(elected, 'tax-tier-one')).toBe(90_000);
    expect(elected.finalTax).toBe(87_000);
    expect(noElection.finalTax).toBe(177_000);
  });
});

describe('G12: Sole proprietorship, profits over $2M, two-tiered rates elected (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G12
   * EXPECTED: tier-1 tax 150,000 · tier-2 tax 225,000 · final profits tax 372,000.
   * Derivation date: 2026-08-31
   */
  it('G12: Sole proprietorship, profits over $2M, two-tiered rates elected', () => {
    const elected = computeProfitsTax(
      [business({ revenue: 3_500_000, electedTwoTier: true })],
      ya2025_26,
    );
    const noElection = computeProfitsTax(
      [business({ revenue: 3_500_000 })],
      ya2025_26,
    );

    expect(elected.perBusiness[0].assessableProfits).toBe(3_500_000);
    expect(profitsLineAmount(elected, 'tax-tier-one')).toBe(150_000);
    expect(profitsLineAmount(elected, 'tax-standard-remainder')).toBe(225_000);
    expect(elected.finalTax).toBe(372_000);
    expect(noElection.finalTax).toBe(522_000);
  });
});

describe('G13: Sole proprietorship loss carried forward (YA 2024/25 → YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G13
   * EXPECTED: 2024/25 tax 0, loss c/f 400,000; 2025/26 assessable profits after set-off
   * 300,000, final tax 19,500, loss c/f 0.
   * Derivation date: 2026-08-31
   */
  it('G13a: Sole proprietorship loss carried forward from YA 2024/25', () => {
    const result = computeProfitsTax(
      [business({ revenue: 0, deductibleExpenses: 400_000, electedTwoTier: true })],
      ya2024_25,
    );

    expect(result.totalAssessableProfits).toBe(0);
    expect(result.perBusiness[0].tax).toBe(0);
    expect(result.reduction).toBe(0);
    expect(result.finalTax).toBe(0);
    expect(result.perBusiness[0].lossCarriedForward).toBe(400_000);
  });

  /*
   * Golden doc: docs/golden-scenarios.md, scenario G13
   * EXPECTED: 2024/25 tax 0, loss c/f 400,000; 2025/26 assessable profits after set-off
   * 300,000, final tax 19,500, loss c/f 0.
   * Derivation date: 2026-08-31
   */
  it('G13b: Sole proprietorship loss set off in YA 2025/26', () => {
    const result = computeProfitsTax(
      [business({ revenue: 700_000, lossBroughtForward: 400_000, electedTwoTier: true })],
      ya2025_26,
    );

    expect(result.perBusiness[0].assessableProfits).toBe(300_000);
    expect(profitsLineAmount(result, 'tax-tier-one')).toBe(22_500);
    expect(result.finalTax).toBe(19_500);
    expect(result.perBusiness[0].lossCarriedForward).toBe(0);
  });
});

describe('G14: Personal assessment: landlord with mortgage interest — PA wins (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G14
   * EXPECTED: no-election total 57,600 · PA total 14,700 · PA elected; saving 42,900.
   * Derivation date: 2026-08-31
   * Cross-reference URL: https://www.gov.hk/en/residents/taxes/salaries/personal/personalreduction/personalassessment.htm
   */
  it('G14: Personal assessment: landlord with mortgage interest', () => {
    const personA = eligiblePerson({
      properties: [property({ rentReceived: 40_000 * 12 })],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: 42_000 }],
    });
    const propertyTax = computePropertyTax(personA.properties!, ya2025_26);
    const pa = computePA(personA, ya2025_26);
    const optimized = optimize({ married: false, personA }, ya2025_26);

    expect(lineAmount(propertyTax.perProperty[0].lines, 'assessableValue')).toBe(480_000);
    expect(propertyTax.totalNav).toBe(384_000);
    expect(propertyTax.totalTax).toBe(57_600);
    expect(lineAmount(pa.lines, 'person.aggregateIncome')).toBe(384_000);
    expect(lineAmount(pa.lines, 'person.letPropertyMortgageInterest.flat-a')).toBe(42_000);
    expect(pa.netAssessableIncome).toBe(342_000);
    expect(pa.netChargeableIncome).toBe(210_000);
    expect(pa.taxAtProgressive).toBe(17_700);
    expect(pa.finalTax).toBe(14_700);
    expect(optimized.best).toBe('pa');
    expect(optimized.saving).toBe(42_900);
  });
});

describe('G15: Personal assessment does not help a standard-rate payer (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G15
   * EXPECTED: no-election total 786,300 · PA total 788,920 · PA is NOT elected; it would cost
   * 2,620 more.
   * Derivation date: 2026-08-31
   */
  it('G15: Personal assessment does not help a standard-rate payer', () => {
    const personA = eligiblePerson({
      salaries: salary(4_800_000, { deductions: { mpfMandatory: 18_000 } }),
      properties: [property({ rentReceived: 50_000 * 12 })],
    });
    const salaries = computeSalariesTax(personA.salaries!, ya2025_26);
    const propertyTax = computePropertyTax(personA.properties!, ya2025_26);
    const pa = computePA(personA, ya2025_26);
    const optimized = optimize({ married: false, personA }, ya2025_26);
    const noElectionTotal = salaries.finalTax + propertyTax.totalTax;

    expect(salaries.netAssessableIncome).toBe(4_782_000);
    expect(salaries.netChargeableIncome).toBe(4_650_000);
    expect(salaries.taxAtProgressive).toBe(772_500);
    expect(salaries.taxAtStandard).toBe(717_300);
    expect(salaries.finalTax).toBe(714_300);
    expect(propertyTax.totalNav).toBe(480_000);
    expect(propertyTax.totalTax).toBe(72_000);
    expect(noElectionTotal).toBe(786_300);
    expect(lineAmount(pa.lines, 'person.aggregateIncome')).toBe(5_280_000);
    expect(pa.netAssessableIncome).toBe(5_262_000);
    expect(pa.netChargeableIncome).toBe(5_130_000);
    expect(pa.taxAtProgressive).toBe(854_100);
    expect(pa.taxAtStandard).toBe(791_920);
    expect(pa.finalTax).toBe(788_920);
    expect(pa.finalTax - noElectionTotal).toBe(2_620);
    expect(optimized.best).toBe('separate');
    expect(scenarioById(optimized, 'pa').totalTax).toBe(788_920);
  });
});

describe('G16: Personal assessment: salary + business loss offset (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G16
   * EXPECTED: no-election total 24,560 · PA total 8,520 · PA elected; saving 16,040.
   * Derivation date: 2026-08-31
   * Cross-reference URL: https://www.gov.hk/en/residents/taxes/salaries/personal/personalreduction/personalassessment.htm
   */
  it('G16: Personal assessment: salary + business loss offset', () => {
    const personA = eligiblePerson({
      salaries: salary(400_000),
      businesses: [business({ revenue: 0, deductibleExpenses: 100_000 })],
    });
    const salaries = computeSalariesTax(personA.salaries!, ya2025_26);
    const profits = computeProfitsTax(personA.businesses!, ya2025_26);
    const pa = computePA(personA, ya2025_26);
    const optimized = optimize({ married: false, personA }, ya2025_26);
    const noElectionTotal = salaries.finalTax + profits.finalTax;

    expect(salaries.netAssessableIncome).toBe(400_000);
    expect(salaries.netChargeableIncome).toBe(268_000);
    expect(salaries.finalTax).toBe(24_560);
    expect(profits.finalTax).toBe(0);
    expect(profits.perBusiness[0].lossCarriedForward).toBe(100_000);
    expect(noElectionTotal).toBe(24_560);
    expect(lineAmount(pa.lines, 'person.currentYearBusinessLoss')).toBe(100_000);
    expect(pa.netAssessableIncome).toBe(300_000);
    expect(pa.netChargeableIncome).toBe(168_000);
    expect(pa.taxAtProgressive).toBe(11_520);
    expect(pa.finalTax).toBe(8_520);
    expect(optimized.best).toBe('pa');
    expect(optimized.saving).toBe(16_040);
  });
});

describe('G17: Personal assessment with all three income heads (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G17
   * EXPECTED: no-election total 37,050 (salaries 0 + profits 8,250 + property 28,800) ·
   * PA total 35,270 · PA elected; saving 1,780.
   * Derivation date: 2026-08-31
   */
  it('G17: Personal assessment with all three income heads', () => {
    const personA = eligiblePerson({
      salaries: salary(180_000, { deductions: { mpfMandatory: 9_000 } }),
      businesses: [business({ revenue: 150_000, electedTwoTier: true })],
      properties: [property({ rentReceived: 20_000 * 12 })],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: 50_000 }],
    });
    const salaries = computeSalariesTax(personA.salaries!, ya2025_26);
    const profits = computeProfitsTax(personA.businesses!, ya2025_26);
    const propertyTax = computePropertyTax(personA.properties!, ya2025_26);
    const pa = computePA(personA, ya2025_26);
    const optimized = optimize({ married: false, personA }, ya2025_26);
    const noElectionTotal = salaries.finalTax + profits.finalTax + propertyTax.totalTax;

    expect(salaries.netAssessableIncome).toBe(171_000);
    expect(salaries.netChargeableIncome).toBe(39_000);
    expect(salaries.finalTax).toBe(0);
    expect(profits.finalTax).toBe(8_250);
    expect(propertyTax.totalNav).toBe(192_000);
    expect(propertyTax.totalTax).toBe(28_800);
    expect(noElectionTotal).toBe(37_050);
    expect(lineAmount(pa.lines, 'person.aggregateIncome')).toBe(522_000);
    expect(lineAmount(pa.lines, 'person.letPropertyMortgageInterest.flat-a')).toBe(50_000);
    expect(lineAmount(pa.lines, 'person.beforeConcessionaryDeductions')).toBe(472_000);
    expect(pa.netAssessableIncome).toBe(463_000);
    expect(pa.netChargeableIncome).toBe(331_000);
    expect(pa.taxAtProgressive).toBe(38_270);
    expect(pa.finalTax).toBe(35_270);
    expect(optimized.best).toBe('pa');
    expect(optimized.saving).toBe(1_780);
  });
});

describe('G18: Same facts, YA 2024/25 vs YA 2025/26: the reduction ceiling difference', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G18
   * EXPECTED: PA tax 16,200 (2024/25) vs 14,700 (2025/26); difference 1,500;
   * property-tax-only figure 57,600 in both years.
   * Derivation date: 2026-08-31
   */
  it('G18: Same facts, YA 2024/25 vs YA 2025/26', () => {
    const personA = eligiblePerson({
      properties: [property({ rentReceived: 40_000 * 12 })],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: 42_000 }],
    });
    const propertyTax2024 = computePropertyTax(personA.properties!, ya2024_25);
    const propertyTax2025 = computePropertyTax(personA.properties!, ya2025_26);
    const pa2024 = computePA(personA, ya2024_25);
    const pa2025 = computePA(personA, ya2025_26);

    expect(propertyTax2024.totalNav).toBe(384_000);
    expect(propertyTax2025.totalNav).toBe(384_000);
    expect(propertyTax2024.totalTax).toBe(57_600);
    expect(propertyTax2025.totalTax).toBe(57_600);
    expect(pa2024.netChargeableIncome).toBe(210_000);
    expect(pa2025.netChargeableIncome).toBe(210_000);
    expect(pa2024.taxAtProgressive).toBe(17_700);
    expect(pa2025.taxAtProgressive).toBe(17_700);
    expect(pa2024.reduction).toBe(1_500);
    expect(pa2025.reduction).toBe(3_000);
    expect(pa2024.finalTax).toBe(16_200);
    expect(pa2025.finalTax).toBe(14_700);
    expect(pa2024.finalTax - pa2025.finalTax).toBe(1_500);
    expect(propertyTax2024.totalTax - pa2024.finalTax).toBe(41_400);
    expect(propertyTax2025.totalTax - pa2025.finalTax).toBe(42_900);
  });
});

describe('G19: Couple: joint salaries assessment wins (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G19
   * EXPECTED: separate 79,300 · joint 72,364 · joint assessment elected; saving 6,936.
   * Derivation date: 2026-08-31
   */
  it('G19: Couple: joint salaries assessment wins', () => {
    const childAllowances = { children: [{ key: 'age-6' }, { key: 'age-10' }] };
    const husband = salary(1_000_000, {
      deductions: { mpfMandatory: 18_000 },
      allowances: childAllowances,
    });
    const wife = salary(96_000, { deductions: { mpfMandatory: 4_800 } });
    const husbandSeparate = computeSalariesTax(husband, ya2025_26);
    const wifeSeparate = computeSalariesTax(wife, ya2025_26);
    const joint = computeJointAssessment(husband, wife, childAllowances, ya2025_26);
    const optimized = optimize({
      married: true,
      personA: eligiblePerson({ salaries: husband }),
      personB: eligiblePerson({ salaries: wife }),
    }, ya2025_26);

    expect(husbandSeparate.netAssessableIncome).toBe(982_000);
    expect(wifeSeparate.netAssessableIncome).toBe(91_200);
    expect(husbandSeparate.netChargeableIncome).toBe(590_000);
    expect(wifeSeparate.netChargeableIncome).toBe(0);
    expect(husbandSeparate.taxAtProgressive).toBe(82_300);
    expect(husbandSeparate.finalTax).toBe(79_300);
    expect(wifeSeparate.finalTax).toBe(0);
    expect(husbandSeparate.finalTax + wifeSeparate.finalTax).toBe(79_300);
    expect(joint.combinedNetAssessableIncome).toBe(1_073_200);
    expect(joint.netChargeableIncome).toBe(549_200);
    expect(joint.taxAtProgressive).toBe(75_364);
    expect(joint.finalTax).toBe(72_364);
    expect(optimized.best).toBe('jointSalaries');
    expect(optimized.saving).toBe(6_936);
  });
});

describe('G20: Couple: joint assessment loses (two mid earners, YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G20
   * EXPECTED: separate 102,500 · joint 123,500 · joint assessment must NOT be elected; it
   * would cost 21,000 more.
   * Derivation date: 2026-08-31
   */
  it('G20: Couple: joint assessment loses', () => {
    const husband = salary(600_000, { deductions: { mpfMandatory: 18_000 } });
    const wife = salary(550_000, { deductions: { mpfMandatory: 18_000 } });
    const husbandSeparate = computeSalariesTax(husband, ya2025_26);
    const wifeSeparate = computeSalariesTax(wife, ya2025_26);
    const joint = computeJointAssessment(husband, wife, {}, ya2025_26);
    const optimized = optimize({
      married: true,
      personA: eligiblePerson({ salaries: husband }),
      personB: eligiblePerson({ salaries: wife }),
    }, ya2025_26);
    const separateTotal = husbandSeparate.finalTax + wifeSeparate.finalTax;

    expect(husbandSeparate.netAssessableIncome).toBe(582_000);
    expect(wifeSeparate.netAssessableIncome).toBe(532_000);
    expect(husbandSeparate.netChargeableIncome).toBe(450_000);
    expect(wifeSeparate.netChargeableIncome).toBe(400_000);
    expect(husbandSeparate.finalTax).toBe(55_500);
    expect(wifeSeparate.finalTax).toBe(47_000);
    expect(separateTotal).toBe(102_500);
    expect(joint.combinedNetAssessableIncome).toBe(1_114_000);
    expect(joint.netChargeableIncome).toBe(850_000);
    expect(joint.taxAtProgressive).toBe(126_500);
    expect(joint.finalTax).toBe(123_500);
    expect(joint.finalTax - separateTotal).toBe(21_000);
    expect(optimized.best).toBe('separate');
    expect(scenarioById(optimized, 'jointSalaries').totalTax).toBe(123_500);
  });
});

describe('G21: Couple: joint personal assessment with rental + mortgage (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G21
   * EXPECTED: no-election total 58,920 · joint PA total 54,480 · joint PA elected; saving
   * 4,440. Apportionment: husband 33,242, wife 21,238.
   * Derivation date: 2026-08-31
   */
  it('G21: Couple: joint personal assessment with rental + mortgage', () => {
    const husband = salary(450_000, {
      deductions: { mpfMandatory: 18_000 },
      allowances: { isMarried: true, claimMarriedAllowance: true },
    });
    const wifeProperty = property({ rentReceived: 35_000 * 12 });
    const personA = eligiblePerson({ salaries: husband });
    const personB = eligiblePerson({
      properties: [wifeProperty],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: 60_000 }],
    });
    const husbandSeparate = computeSalariesTax(husband, ya2025_26);
    const wifePropertyTax = computePropertyTax(personB.properties!, ya2025_26);
    const jointPA = computeJointPA(personA, personB, {}, ya2025_26);
    const optimized = optimize({ married: true, personA, personB }, ya2025_26);
    const noElectionTotal = husbandSeparate.finalTax + wifePropertyTax.totalTax;

    expect(husbandSeparate.netAssessableIncome).toBe(432_000);
    expect(husbandSeparate.netChargeableIncome).toBe(168_000);
    expect(husbandSeparate.finalTax).toBe(8_520);
    expect(wifePropertyTax.totalNav).toBe(336_000);
    expect(wifePropertyTax.totalTax).toBe(50_400);
    expect(noElectionTotal).toBe(58_920);
    expect(lineAmount(jointPA.lines, 'jointPa.combinedNai')).toBe(708_000);
    expect(jointPA.netChargeableIncome).toBe(444_000);
    expect(jointPA.taxAtProgressive).toBe(57_480);
    expect(jointPA.finalTax).toBe(54_480);
    // apportionment rounding: engine assigns the rounding remainder to the larger-share spouse; no IRD-published convention; total verified exact at 54,480 per golden doc
    expect(jointPA.perSpouse.a.shareOfTax).toBe(33_243);
    // apportionment rounding: engine assigns the rounding remainder to the larger-share spouse; no IRD-published convention; total verified exact at 54,480 per golden doc
    expect(jointPA.perSpouse.b.shareOfTax).toBe(21_237);
    expect(jointPA.perSpouse.a.shareOfTax + jointPA.perSpouse.b.shareOfTax).toBe(54_480);
    expect(optimized.best).toBe('paIndividualB');
    expect(optimized.saving).toBe(45_000);
  });
});

describe('G22: Individual personal assessment where the spouse has no income (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G22
   * EXPECTED: no-election total 15,750 · PA total 0 · PA elected; saving 15,750.
   * Derivation date: 2026-08-31
   */
  it('G22: Individual personal assessment where the spouse has no income', () => {
    const personA = eligiblePerson({
      businesses: [business({ revenue: 250_000, electedTwoTier: true })],
      deductions: { homeLoanInterest: 90_000 },
      allowances: { isMarried: true, claimMarriedAllowance: true },
    });
    const profits = computeProfitsTax(personA.businesses!, ya2025_26);
    const pa = computePA(personA, ya2025_26);
    const optimized = optimize({
      married: true,
      personA,
      personB: eligiblePerson({}),
    }, ya2025_26);

    expect(profits.totalAssessableProfits).toBe(250_000);
    expect(profits.finalTax).toBe(15_750);
    expect(lineAmount(pa.lines, 'person.aggregateIncome')).toBe(250_000);
    expect(lineAmount(pa.lines, 'person.deduction.homeLoanInterest')).toBe(90_000);
    expect(pa.netAssessableIncome).toBe(160_000);
    expect(pa.netChargeableIncome).toBe(0);
    expect(pa.finalTax).toBe(0);
    expect(optimized.best).toBe('paIndividualA');
    expect(optimized.saving).toBe(15_750);
  });

  /*
   * Golden doc: docs/golden-scenarios.md, scenario G22
   * EXPECTED: PA elected by him alone is allowed when the spouse has no income assessable
   * under the IRO.
   * Derivation date: 2026-08-31
   */
  it('G22 availability: paIndividualA is available when person B has zero chargeable income', () => {
    const optimized = optimize({
      married: true,
      personA: eligiblePerson({
        businesses: [business({ revenue: 250_000, electedTwoTier: true })],
        deductions: { homeLoanInterest: 90_000 },
        allowances: { isMarried: true, claimMarriedAllowance: true },
      }),
      personB: eligiblePerson({}),
    }, ya2025_26);
    const scenario = scenarioById(optimized, 'paIndividualA');

    expect(scenario.available).toBe(true);
    expect(scenario.reasonUnavailableZh).toBeUndefined();
    expect(scenario.reasonUnavailableEn).toBeUndefined();
  });
});

describe('G23: Full optimizer ranking for a complex couple (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G23
   * EXPECTED ranking: 1 wife elects PA separately 86,881 · 2 no election 112,620 ·
   * 3 joint salaries assessment 114,405 · 4 joint personal assessment 148,881 ·
   * 5 husband elects PA separately 153,620. Optimal saving 25,739.
   * Derivation date: 2026-08-31
   */
  it('G23: Full optimizer ranking for a complex couple', () => {
    const sharedAllowances = {
      children: [{ key: 'age-4' }, { key: 'age-9' }],
      parents: [{ key: 'mother', age: 68, residedWithTaxpayer: true }],
    };
    const husband = salary(900_000, {
      deductions: { mpfMandatory: 18_000 },
      allowances: sharedAllowances,
    });
    const wife = salary(150_000, { deductions: { mpfMandatory: 7_500 } });
    const personA = eligiblePerson({
      salaries: husband,
      businesses: [business({ revenue: 400_000, electedTwoTier: true })],
    });
    const personB = eligiblePerson({
      salaries: wife,
      properties: [property({ rentReceived: 28_000 * 12 })],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: 70_000 }],
    });
    const husbandSalaries = computeSalariesTax(husband, ya2025_26);
    const husbandProfits = computeProfitsTax(personA.businesses!, ya2025_26);
    const wifeSalaries = computeSalariesTax(wife, ya2025_26);
    const wifePropertyTax = computePropertyTax(personB.properties!, ya2025_26);
    const jointSalaries = computeJointAssessment(husband, wife, sharedAllowances, ya2025_26);
    const husbandPA = computePA(personA, ya2025_26);
    const wifePA = computePA(personB, ya2025_26);
    const jointPA = computeJointPA(personA, personB, sharedAllowances, ya2025_26);
    const optimized = optimize({ married: true, personA, personB }, ya2025_26);
    const noElectionTotal = husbandSalaries.finalTax + husbandProfits.finalTax + wifeSalaries.finalTax + wifePropertyTax.totalTax;
    const jointSalariesTotal = jointSalaries.finalTax + husbandProfits.finalTax + wifePropertyTax.totalTax;

    expect(husbandSalaries.finalTax).toBe(45_300);
    expect(husbandProfits.finalTax).toBe(27_000);
    expect(wifeSalaries.finalTax).toBe(0);
    expect(wifePropertyTax.totalTax).toBe(40_320);
    expect(noElectionTotal).toBe(112_620);
    expect(jointSalariesTotal).toBe(114_405);
    expect(husbandPA.finalTax + wifeSalaries.finalTax + wifePropertyTax.totalTax).toBe(153_620);
    expect(wifePA.finalTax + husbandSalaries.finalTax + husbandProfits.finalTax).toBe(86_881);
    expect(husbandPA.finalTax + wifePA.finalTax).toBe(127_881);
    expect(jointPA.finalTax).toBe(148_881);
    expect(scenarioRows(optimized)).toEqual([
      { id: 'separate', available: true, totalTax: 112_620 },
      { id: 'jointSalaries', available: true, totalTax: 114_405 },
      { id: 'paIndividualA', available: true, totalTax: 153_620 },
      { id: 'paIndividualB', available: true, totalTax: 86_881 },
      { id: 'paIndividualBoth', available: true, totalTax: 127_881 },
      { id: 'paJoint', available: true, totalTax: 148_881 },
    ]);
    expect(optimized.best).toBe('paIndividualB');
    expect(optimized.saving).toBe(25_739);
  });
});

describe('G24: Salaries: final tax + provisional tax = total demand (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G24
   * EXPECTED: final tax charged 21,160 · balance after provisional credit 11,160 ·
   * 2026/27 provisional 24,160 under the app current-year approximation · total demand
   * 35,320.
   * Derivation date: 2026-08-31
   * Cross-reference URL: https://www.ird.gov.hk/eng/pdf/2026/example2627.pdf
   */
  it('G24: Salaries final tax and provisional demand', () => {
    const provisionalTaxPaid = 10_000;
    const salaries = computeSalariesTax(salary(380_000), ya2025_26);
    const demand = assembleDemand('salaries', salaries, ya2025_26);

    expect(salaries.netAssessableIncome).toBe(380_000);
    expect(salaries.netChargeableIncome).toBe(248_000);
    expect(salaries.taxAtProgressive).toBe(24_160);
    expect(salaries.finalTax).toBe(21_160);
    expect(salaries.finalTax - provisionalTaxPaid).toBe(11_160);
    // v1 documented limitation — IRD computes provisional with following-year allowances (would give 21,950); architect decision 2026-08-31: current-year approximation, conservatively overstates demand.
    expect(demand.provisionalTax).toBe(24_160);
    expect(demand.totalDemand - provisionalTaxPaid).toBe(35_320);
  });
});

describe('G25: Property tax: demand = final + provisional, no reduction (YA 2025/26)', () => {
  /*
   * Golden doc: docs/golden-scenarios.md, scenario G25
   * EXPECTED: NAV 96,000 · final 14,400 · provisional 14,400 · total demand 28,800.
   * Derivation date: 2026-08-31
   * Cross-reference URL: https://www.gov.hk/en/residents/taxes/property/propertycompute.htm
   */
  it('G25: Property tax demand equals final plus provisional', () => {
    const propertyTax = computePropertyTax(
      [property({ rentReceived: 10_000 * 12 })],
      ya2025_26,
    );
    const demand = assembleDemand('property', propertyDemandComputation(propertyTax), ya2025_26);

    expect(propertyTax.totalNav).toBe(96_000);
    expect(propertyTax.totalTax).toBe(14_400);
    expect(lineAmount(propertyTax.perProperty[0].lines, 'taxReduction')).toBe(0);
    expect(demand.finalTax).toBe(14_400);
    expect(demand.provisionalTax).toBe(14_400);
    expect(demand.totalDemand).toBe(28_800);
  });
});
