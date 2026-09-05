import { describe, expect, it } from 'vitest';
import { getParams } from './params';
import {
  checkPAEligibility,
  computeJointPA,
  computePA,
  hasSalariesAssessableIncomeForMarriedPA,
  type PAPersonInput,
} from './personalAssessment';
import type { BusinessInput } from './profits';
import type { PropertyInput } from './property';
import type { SalariesInput } from './salaries';
import type { Computation, ComputationLine, TaxBand, TaxYearParams } from './types';

const ya2024_25 = getParams('2024_25');
const ya2025_26 = getParams('2025_26');

function salary(amount: number): SalariesInput {
  return {
    incomeItems: [{ key: 'salary', labelZh: '薪金', labelEn: 'Salary', amount }],
  };
}

function property(overrides: Partial<PropertyInput> = {}): PropertyInput {
  return {
    id: 'flat-a',
    rentReceived: 300_000,
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

function lineFor(result: Computation, key: string): ComputationLine {
  const found = result.lines.find((item) => item.key === key);
  if (!found) {
    throw new Error(`Missing computation line ${key}`);
  }
  return found;
}

function taxAtBands(amount: number, bands: TaxBand[]): number {
  let remaining = Math.max(0, amount);
  let tax = 0;

  for (const band of bands) {
    if (remaining <= 0) {
      break;
    }

    const taxable = band.width === null ? remaining : Math.min(remaining, band.width);
    tax += taxable * band.rate;
    remaining -= taxable;
  }

  return tax;
}

function expectedTax(netAssessableIncome: number, allowance: number, params: TaxYearParams): {
  netChargeableIncome: number;
  taxAtProgressive: number;
  taxAtStandard: number;
  taxBeforeReduction: number;
  reduction: number;
  finalTax: number;
} {
  const netChargeableIncome = Math.max(0, netAssessableIncome - allowance);
  const taxAtProgressive = taxAtBands(netChargeableIncome, params.progressiveBands);
  const taxAtStandard = taxAtBands(netAssessableIncome, params.standardRateTiers);
  const taxBeforeReduction = Math.min(taxAtProgressive, taxAtStandard);
  const reduction = params.taxReduction.appliesTo.includes('pa')
    ? Math.min(taxBeforeReduction * params.taxReduction.percent, params.taxReduction.cap)
    : 0;

  return {
    netChargeableIncome,
    taxAtProgressive,
    taxAtStandard,
    taxBeforeReduction,
    reduction,
    finalTax: Math.max(Math.floor(taxBeforeReduction - reduction), 0),
  };
}

function apportionedTax(aNai: number, bNai: number, finalTax: number): { a: number; b: number } {
  const combined = Math.max(0, aNai + bNai);
  if (combined <= 0 || finalTax <= 0) {
    return { a: 0, b: 0 };
  }

  const aShare = Math.max(0, aNai) / combined;
  const bShare = Math.max(0, bNai) / combined;
  let aTax = Math.floor(finalTax * aShare);
  let bTax = Math.floor(finalTax * bShare);
  const remainder = finalTax - aTax - bTax;

  if (aShare >= bShare) {
    aTax += remainder;
  } else {
    bTax += remainder;
  }

  return { a: aTax, b: bTax };
}

describe('Personal Assessment', () => {
  it('computes salary plus rental-property PA with a hand-verified pipeline', () => {
    // YA 2024/25 hand computation:
    // Salaries assessable income:                 600,000
    // Property NAV: rent 300,000 - rates 20,000 = 280,000;
    //   statutory repairs allowance 20% = 56,000; NAV = 224,000
    // Aggregate PA income:                        824,000
    // Less let-property mortgage interest:         80,000
    // Income before concessionary deductions:     744,000
    // Less self-education:                         20,000
    // Less approved donations:                     40,000
    //   cap = 35% x 744,000 = 260,400, so full 40,000 allowed
    // Less mandatory MPF:                          18,000
    // Net Assessable Income:                      666,000
    // Less basic allowance:                       132,000
    // Net Chargeable Income:                      534,000
    // Progressive tax: 50,000 x 2% + 50,000 x 6% + 50,000 x 10%
    //   + 50,000 x 14% + 334,000 x 17% = 72,780
    // Standard-rate tax: 666,000 x 15% = 99,900
    // Lower tax before reduction:                  72,780
    // YA 2024/25 reduction: min(100% x 72,780, 1,500 cap) = 1,500
    // Final PA tax: floor(72,780 - 1,500) = 71,280
    const salaryIncome = 600_000;
    const rentReceived = 300_000;
    const ratesPaidByOwner = 20_000;
    const letPropertyInterest = 80_000;
    const selfEducation = 20_000;
    const donations = 40_000;
    const mpfMandatory = ya2024_25.deductionCaps.mpfMandatory;
    const propertyNav = (rentReceived - ratesPaidByOwner) * (1 - ya2024_25.propertyTax.repairsAllowancePercent);
    const expectedNai = salaryIncome + propertyNav - letPropertyInterest - selfEducation - donations - mpfMandatory;
    const expected = expectedTax(expectedNai, ya2024_25.allowances.basic, ya2024_25);
    const result = computePA({
      salaries: {
        ...salary(salaryIncome),
        deductions: {
          selfEducation,
          charitableDonations: donations,
          mpfMandatory,
        },
      },
      properties: [property({ rentReceived, ratesPaidByOwner })],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest: letPropertyInterest }],
    }, ya2024_25);

    expect(lineFor(result, 'person.salariesAssessableIncome').amount).toBe(salaryIncome);
    expect(lineFor(result, 'person.propertyNav').amount).toBe(propertyNav);
    expect(lineFor(result, 'person.aggregateIncome').amount).toBe(salaryIncome + propertyNav);
    expect(lineFor(result, 'person.letPropertyMortgageInterest.flat-a').amount).toBe(letPropertyInterest);
    expect(lineFor(result, 'person.beforeConcessionaryDeductions').amount).toBe(salaryIncome + propertyNav - letPropertyInterest);
    expect(lineFor(result, 'person.deduction.selfEducation').amount).toBe(selfEducation);
    expect(lineFor(result, 'person.deduction.charitableDonations').amount).toBe(donations);
    expect(lineFor(result, 'person.deduction.mpfMandatory').amount).toBe(mpfMandatory);
    expect(result.netAssessableIncome).toBe(expectedNai);
    expect(result.netChargeableIncome).toBe(expected.netChargeableIncome);
    expect(result.taxAtProgressive).toBe(expected.taxAtProgressive);
    expect(result.taxAtStandard).toBe(expected.taxAtStandard);
    expect(result.basisUsed).toBe('progressive');
    expect(result.reduction).toBe(ya2024_25.taxReduction.cap);
    expect(result.finalTax).toBe(expected.finalTax);
  });

  it('caps let-property mortgage interest at that property NAV and reports disallowed excess', () => {
    const salaryIncome = 500_000;
    const baseProperty = property();
    const nav = baseProperty.rentReceived * (1 - ya2025_26.propertyTax.repairsAllowancePercent);
    const interest = nav + 60_000;
    const result = computePA({
      salaries: salary(salaryIncome),
      properties: [baseProperty],
      letPropertyMortgageInterest: [{ propertyId: 'flat-a', interest }],
    }, ya2025_26);

    expect(lineFor(result, 'person.letPropertyMortgageInterest.flat-a').amount).toBe(nav);
    expect(lineFor(result, 'person.letPropertyMortgageInterest.flat-a.excess').amount).toBe(interest - nav);
    expect(result.netAssessableIncome).toBe(salaryIncome);
  });

  it('caps aggregated mortgage interest once per let property when multiple entries use the same property id', () => {
    const salaryIncome = 500_000;
    const baseProperty = property({ rentReceived: 300_000 });
    const nav = 240_000;
    const result = computePA({
      salaries: salary(salaryIncome),
      properties: [baseProperty],
      letPropertyMortgageInterest: [
        { propertyId: 'flat-a', interest: nav },
        { propertyId: 'flat-a', interest: nav },
      ],
    }, ya2025_26);
    const interestLines = result.lines.filter((item) => item.key === 'person.letPropertyMortgageInterest.flat-a');

    expect(lineFor(result, 'person.propertyNav').amount).toBe(nav);
    expect(interestLines).toHaveLength(1);
    expect(interestLines[0].amount).toBe(nav);
    expect(lineFor(result, 'person.letPropertyMortgageInterest.flat-a.excess').amount).toBe(nav);
    expect(lineFor(result, 'person.afterLetPropertyInterest').amount).toBe(salaryIncome);
    expect(result.netAssessableIncome).toBe(salaryIncome);
  });

  it('offsets current-year business losses against other PA income', () => {
    const salaryIncome = 500_000;
    const rentReceived = 125_000;
    const revenue = 100_000;
    const deductibleExpenses = 250_000;
    const propertyNav = rentReceived * (1 - ya2025_26.propertyTax.repairsAllowancePercent);
    const currentYearLoss = deductibleExpenses - revenue;
    const result = computePA({
      salaries: salary(salaryIncome),
      properties: [property({ rentReceived })],
      businesses: [business({ revenue, deductibleExpenses })],
    }, ya2025_26);

    expect(lineFor(result, 'person.propertyNav').amount).toBe(propertyNav);
    expect(lineFor(result, 'person.currentYearBusinessLoss').amount).toBe(currentYearLoss);
    expect(result.netAssessableIncome).toBe(salaryIncome + propertyNav - currentYearLoss);
  });

  it('deducts PA loss brought forward separately from per-business profits-tax losses', () => {
    const basePerson: PAPersonInput = {
      salaries: salary(300_000),
      businesses: [
        business({
          revenue: 300_000,
          deductibleExpenses: 0,
          lossBroughtForward: 999_000,
        }),
      ],
      paLossBroughtForward: 120_000,
    };
    const changedBusinessLoss = computePA({
      ...basePerson,
      businesses: [business({ revenue: 300_000, deductibleExpenses: 0, lossBroughtForward: 1 })],
    }, ya2025_26);
    const changedPaLoss = computePA({
      ...basePerson,
      paLossBroughtForward: 40_000,
    }, ya2025_26);
    const result = computePA(basePerson, ya2025_26);

    expect(lineFor(result, 'person.businessAssessableProfitsBeforeLoss').amount).toBe(300_000);
    expect(lineFor(result, 'person.paLossBroughtForward').amount).toBe(120_000);
    expect(result.lines.find((item) => item.key === 'person.businessLossBroughtForward')).toBeUndefined();
    expect(result.netAssessableIncome).toBe(
      basePerson.salaries!.incomeItems[0].amount + basePerson.businesses![0].revenue - basePerson.paLossBroughtForward!,
    );
    expect(changedBusinessLoss.netAssessableIncome).toBe(result.netAssessableIncome);
    expect(changedPaLoss.netAssessableIncome).toBe(
      basePerson.salaries!.incomeItems[0].amount + basePerson.businesses![0].revenue - 40_000,
    );
  });

  it('reports eligibility failures and eligible contrast cases', () => {
    const under18WithLivingParents = checkPAEligibility({
      ageDuringYear: 17,
      isHongKongPermanentResident: true,
    });
    const noResidenceStatus = checkPAEligibility({
      ageDuringYear: 18,
      isHongKongPermanentResident: false,
      ordinarilyResidentInHongKong: false,
      presentInHongKongMoreThan180Days: false,
      presentInHongKongMoreThan300DaysAcrossTwoYears: false,
    });
    const eligibleAdult = checkPAEligibility({
      ageDuringYear: 18,
      ordinarilyResidentInHongKong: true,
    });
    const eligibleUnder18Orphan = checkPAEligibility({
      ageDuringYear: 17,
      bothParentsDeceased: true,
      presentInHongKongMoreThan180Days: true,
    });

    expect(under18WithLivingParents.eligible).toBe(false);
    expect(under18WithLivingParents.reasonsZh).not.toHaveLength(0);
    expect(under18WithLivingParents.reasonsEn).not.toHaveLength(0);
    expect(noResidenceStatus.eligible).toBe(false);
    expect(noResidenceStatus.reasonsZh).not.toHaveLength(0);
    expect(noResidenceStatus.reasonsEn).not.toHaveLength(0);
    expect(eligibleAdult.eligible).toBe(true);
    expect(eligibleAdult.reasonsZh).toHaveLength(0);
    expect(eligibleUnder18Orphan.eligible).toBe(true);
  });

  it('tests only salaries assessable income for the s.29 MPA spouse-income condition', () => {
    expect(hasSalariesAssessableIncomeForMarriedPA({
      properties: [property({ rentReceived: 300_000 })],
      businesses: [business({ revenue: 300_000 })],
    }, ya2025_26)).toBe(false);

    expect(hasSalariesAssessableIncomeForMarriedPA({
      salaries: salary(1),
    }, ya2025_26)).toBe(true);
  });

  it('applies the YA 2024/25 PA tax reduction cap', () => {
    const result = computePA({ salaries: salary(1_000_000) }, ya2024_25);
    const expected = expectedTax(1_000_000, ya2024_25.allowances.basic, ya2024_25);

    expect(expected.taxBeforeReduction).toBeGreaterThan(ya2024_25.taxReduction.cap);
    expect(lineFor(result, 'pa.tax.reduction').amount).toBe(ya2024_25.taxReduction.cap);
    expect(result.reduction).toBe(ya2024_25.taxReduction.cap);
    expect(result.finalTax).toBe(expected.finalTax);
  });

  it('applies the YA 2025/26 PA tax reduction cap', () => {
    const result = computePA({ salaries: salary(1_000_000) }, ya2025_26);
    const expected = expectedTax(1_000_000, ya2025_26.allowances.basic, ya2025_26);

    expect(expected.taxBeforeReduction).toBeGreaterThan(ya2025_26.taxReduction.cap);
    expect(lineFor(result, 'pa.tax.reduction').amount).toBe(ya2025_26.taxReduction.cap);
    expect(result.reduction).toBe(ya2025_26.taxReduction.cap);
    expect(result.finalTax).toBe(expected.finalTax);
  });

  it('apportions joint PA final tax by each spouse share after applying shared allowances once', () => {
    const result = computeJointPA(
      { salaries: salary(600_000) },
      { salaries: salary(300_000) },
      {},
      ya2025_26,
    );

    expect(lineFor(result, 'allowance.married').amount).toBe(ya2025_26.allowances.married);
    const aNai = 600_000;
    const bNai = 300_000;
    const combinedNai = aNai + bNai;
    const expected = expectedTax(combinedNai, ya2025_26.allowances.married, ya2025_26);
    const apportionment = apportionedTax(aNai, bNai, expected.finalTax);

    expect(result.combinedNetAssessableIncome).toBe(combinedNai);
    expect(result.netChargeableIncome).toBe(expected.netChargeableIncome);
    expect(result.finalTax).toBe(expected.finalTax);
    expect(result.perSpouse.a.shareOfTax + result.perSpouse.b.shareOfTax).toBe(result.finalTax);
    expect(result.perSpouse.a.shareOfCombinedNai).toBeCloseTo(aNai / combinedNai);
    expect(result.perSpouse.b.shareOfCombinedNai).toBeCloseTo(bNai / combinedNai);
    expect(result.perSpouse.a.shareOfTax).toBe(apportionment.a);
    expect(result.perSpouse.b.shareOfTax).toBe(apportionment.b);
  });

  it('offsets one spouse excess business loss before joint PA aggregation is floored', () => {
    const result = computeJointPA(
      { salaries: salary(500_000) },
      {
        businesses: [{
          id: 'b1',
          name: 'Business',
          revenue: 0,
          deductibleExpenses: 200_000,
        }],
      },
      {},
      ya2025_26,
    );

    expect(result.combinedNetAssessableIncome).toBe(300_000);
    expect(result.netChargeableIncome).toBe(36_000);
    expect(result.finalTax).toBe(0);
  });

  it('rejects simultaneous home-loan-interest and domestic-rent deductions inside PA', () => {
    expect(() => computePA({
      salaries: {
        ...salary(500_000),
        deductions: {
          homeLoanInterest: 1,
          domesticRent: 1,
        },
      },
    }, ya2025_26)).toThrow('mutually exclusive');
  });
});
