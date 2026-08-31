import { describe, expect, it } from 'vitest';
import { getParams } from './params';
import { computeJointAssessment, computeSalariesTax, type SalariesInput } from './salaries';

function salary(amount: number): SalariesInput {
  return {
    incomeItems: [{ key: 'salary', labelZh: '薪金', labelEn: 'Salary', amount }],
  };
}

function amountFor(input: SalariesInput, key: string): number {
  const params = getParams('2024_25');
  const found = computeSalariesTax(input, params).lines.find((item) => item.key === key);
  if (!found) {
    throw new Error(`Missing computation line ${key}`);
  }
  return found.amount;
}

describe('computeSalariesTax', () => {
  it('computes a single earner with no deductions as a sanity baseline', () => {
    const computation = computeSalariesTax(salary(300000), getParams('2024_25'));

    expect(computation.netAssessableIncome).toBe(300000);
    expect(computation.netChargeableIncome).toBe(168000);
    expect(computation.taxAtProgressive).toBe(11520);
    expect(computation.taxAtStandard).toBe(45000);
    expect(computation.basisUsed).toBe('progressive');
    expect(computation.finalTax).toBe(10020);
  });

  it('uses the standard-rate second tier for a high earner when standard rate wins', () => {
    const computation = computeSalariesTax(salary(6000000), getParams('2024_25'));

    expect(computation.taxAtProgressive).toBe(979560);
    expect(computation.taxAtStandard).toBe(910000);
    expect(computation.lines.find((item) => item.key === 'tax.standard.band2')?.amount).toBe(160000);
    expect(computation.basisUsed).toBe('standard');
    expect(computation.finalTax).toBe(908500);
  });

  it('uses lower rateable value for a 10% residence rental-value election', () => {
    const computation = computeSalariesTax({
      ...salary(500000),
      employerAccommodation: [{
        key: 'flat',
        labelZh: '僱主提供住宅租值',
        labelEn: 'Employer-provided flat rental value',
        type: 'residence',
        employerAssessableIncomeBeforeAccommodation: 500000,
        rateableValueElection: 40000,
      }],
    }, getParams('2024_25'));

    expect(computation.lines.find((item) => item.key === 'rentalValue.flat')?.amount).toBe(40000);
    expect(computation.netAssessableIncome).toBe(540000);
  });

  it('uses fixed 8% rental value for two-room hotel accommodation and ignores a lower rateable value', () => {
    const computation = computeSalariesTax({
      ...salary(500000),
      employerAccommodation: [{
        key: 'hotel',
        labelZh: '兩房酒店住宿租值',
        labelEn: 'Two-room hotel accommodation rental value',
        type: 'twoRoomHotel',
        employerAssessableIncomeBeforeAccommodation: 500000,
        rateableValueElection: 10000,
      }],
    }, getParams('2024_25'));

    expect(computation.lines.find((item) => item.key === 'rentalValue.hotel')?.amount).toBe(40000);
    expect(computation.lines.find((item) => item.key === 'rentalValue.hotel.electionIgnored')).toBeDefined();
    expect(computation.netAssessableIncome).toBe(540000);
  });

  it('relates back a lump sum and includes only the current-year portion', () => {
    const computation = computeSalariesTax({
      incomeItems: [
        { key: 'salary', labelZh: '薪金', labelEn: 'Salary', amount: 300000 },
        {
          key: 'terminalAward',
          labelZh: '約滿酬金',
          labelEn: 'Terminal award',
          amount: 360000,
          relateBack: { elected: true, months: 36, currentYearMonths: 12 },
        },
      ],
    }, getParams('2024_25'));

    expect(computation.lines.find((item) => item.key === 'income.terminalAward')?.amount).toBe(120000);
    expect(computation.netAssessableIncome).toBe(420000);
    expect(computation.lines.find((item) => item.key === 'income.terminalAward.relateBackNote')?.labelEn)
      .toContain('prior years are reassessed separately');
  });

  it('caps charitable donations at 35% of the pre-donation income base and emits an excess line', () => {
    const computation = computeSalariesTax({
      ...salary(200000),
      deductions: { charitableDonations: 100000 },
    }, getParams('2024_25'));

    expect(computation.lines.find((item) => item.key === 'deduction.charitableDonations')?.amount).toBe(70000);
    expect(computation.lines.find((item) => item.key === 'deduction.charitableDonations.excess')?.amount).toBe(30000);
    expect(computation.netAssessableIncome).toBe(130000);
  });

  it('rejects simultaneous home-loan-interest and domestic-rent deductions', () => {
    expect(() => computeSalariesTax({
      ...salary(500000),
      deductions: { homeLoanInterest: 1, domesticRent: 1 },
    }, getParams('2024_25'))).toThrow('mutually exclusive');
  });

  it('uses the elevated newborn-rule cap for home loan interest when eligible', () => {
    expect(amountFor({
      ...salary(500000),
      deductions: { homeLoanInterest: { amount: 130000, eligibleForElevatedCap: true } },
    }, 'deduction.homeLoanInterest')).toBe(120000);
  });

  it('uses the elevated newborn-rule cap for domestic rent when eligible', () => {
    expect(amountFor({
      ...salary(500000),
      deductions: { domesticRent: { amount: 110000, eligibleForElevatedCap: true } },
    }, 'deduction.domesticRent')).toBe(Math.min(110000, getParams('2024_25').deductionCaps.domesticRentElevated));
  });

  it('uses the base cap for domestic rent when newborn-rule eligibility is not flagged', () => {
    expect(amountFor({
      ...salary(500000),
      deductions: { domesticRent: 110000 },
    }, 'deduction.domesticRent')).toBe(getParams('2024_25').deductionCaps.domesticRent);
  });

  it('makes joint assessment better than separate assessment for a one-earner married couple', () => {
    const params = getParams('2025_26');
    const spouseA: SalariesInput = { ...salary(600000), deductions: { mpfMandatory: 18000 } };
    const spouseB = salary(0);
    const separate = computeSalariesTax(spouseA, params).finalTax + computeSalariesTax(spouseB, params).finalTax;
    const joint = computeJointAssessment(spouseA, spouseB, {}, params);

    expect(separate).toBe(55500);
    expect(joint.finalTax).toBe(33060);
    expect(joint.finalTax).toBeLessThan(separate);
    expect(joint.perSpouse.a.shareOfTax + joint.perSpouse.b.shareOfTax).toBe(joint.finalTax);
  });

  it('does not make joint assessment better than separate assessment for two high standard-rate earners', () => {
    const params = getParams('2025_26');
    const spouseA = salary(10000000);
    const spouseB = salary(10000000);
    const separate = computeSalariesTax(spouseA, params).finalTax + computeSalariesTax(spouseB, params).finalTax;
    const joint = computeJointAssessment(spouseA, spouseB, {}, params);

    expect(separate).toBe(3094000);
    expect(joint.finalTax).toBe(3147000);
    expect(joint.finalTax).toBeGreaterThanOrEqual(separate);
    expect(joint.basisUsed).toBe('standard');
  });

  it('applies the different 2024/25 and 2025/26 salaries tax reduction caps to the same input', () => {
    const input: SalariesInput = { ...salary(600000), deductions: { mpfMandatory: 18000 } };
    const ya2024 = computeSalariesTax(input, getParams('2024_25'));
    const ya2025 = computeSalariesTax(input, getParams('2025_26'));

    expect(ya2024.reduction).toBe(1500);
    expect(ya2024.finalTax).toBe(57000);
    expect(ya2025.reduction).toBe(3000);
    expect(ya2025.finalTax).toBe(55500);
  });

  it('floors very low net assessable income to zero tax', () => {
    const computation = computeSalariesTax({
      ...salary(100000),
      outgoingsAndExpenses: [{ key: 'expenses', labelZh: '開支', labelEn: 'Expenses', amount: 200000 }],
    }, getParams('2024_25'));

    expect(computation.netAssessableIncome).toBe(0);
    expect(computation.netChargeableIncome).toBe(0);
    expect(computation.taxAtProgressive).toBe(0);
    expect(computation.taxAtStandard).toBe(0);
    expect(computation.finalTax).toBe(0);
  });

  it('applies child allowance plus newborn-year extra only for a child born in the current year', () => {
    const computation = computeSalariesTax({
      ...salary(800000),
      allowances: {
        children: [
          { key: 'newborn', bornInCurrentYear: true },
          { key: 'olderChild', bornInCurrentYear: false },
        ],
      },
    }, getParams('2024_25'));

    expect(computation.lines.find((item) => item.key === 'allowance.child')?.amount).toBe(260000);
    expect(computation.lines.find((item) => item.key === 'allowance.childNewbornExtra')?.amount).toBe(130000);
    expect(computation.netChargeableIncome).toBe(278000);
  });

  it('matches a hand-verified IRD-style salaries tax computation', () => {
    // Hand-verified against IRD published Salaries Tax computation method:
    // Assessable income:                    600,000
    // Less: mandatory MPF contribution:      18,000 (capped, params.deductionCaps.mpfMandatory)
    // Net Assessable Income (NAI):          582,000
    // Less: basic allowance:                132,000
    // Net Chargeable Income (NCI):          450,000
    // Progressive tax on NCI 450,000:
    //   50,000 x 2%  =  1,000
    //   50,000 x 6%  =  3,000
    //   50,000 x 10% =  5,000
    //   50,000 x 14% =  7,000
    //   250,000 x 17% (remainder) = 42,500
    //   Total progressive           = 58,500
    // Standard rate on NAI 582,000 x 15% = 87,300
    // min(58,500, 87,300) = 58,500 -> progressive basis wins
    // Tax reduction (2024/25): min(58,500 x 100%, 1,500 cap) = 1,500
    // Final tax = 58,500 - 1,500 = 57,000
    const computation = computeSalariesTax({
      ...salary(600000),
      deductions: { mpfMandatory: 18000 },
    }, getParams('2024_25'));

    expect(computation.netAssessableIncome).toBe(582000);
    expect(computation.netChargeableIncome).toBe(450000);
    expect(computation.taxAtProgressive).toBe(58500);
    expect(computation.taxAtStandard).toBe(87300);
    expect(computation.basisUsed).toBe('progressive');
    expect(computation.reduction).toBe(1500);
    expect(computation.finalTax).toBe(57000);
  });

  it('uses the remaining capped deductions and dependant allowances from params', () => {
    const computation = computeSalariesTax({
      ...salary(1000000),
      deductions: {
        selfEducation: 120000,
        elderlyCare: 120000,
        homeLoanInterest: 120000,
        annuityAndTvc: 80000,
        vhisPremiums: 20000,
        vhisInsuredPersons: 2,
        assistedReproduction: 120000,
      },
      allowances: {
        parents: [{ age: 60, residedWithTaxpayer: true }],
        siblingCount: 1,
        disabledDependantCount: 1,
        personalDisability: true,
      },
    }, getParams('2024_25'));

    expect(amountFor({
      ...salary(1000000),
      deductions: { selfEducation: 120000 },
    }, 'deduction.selfEducation')).toBe(100000);
    expect(computation.lines.find((item) => item.key === 'deduction.elderlyCare')?.amount).toBe(100000);
    expect(computation.lines.find((item) => item.key === 'deduction.homeLoanInterest')?.amount).toBe(100000);
    expect(computation.lines.find((item) => item.key === 'deduction.annuityAndTvc')?.amount).toBe(60000);
    expect(computation.lines.find((item) => item.key === 'deduction.vhis')?.amount).toBe(16000);
    expect(computation.lines.find((item) => item.key === 'deduction.assistedReproduction')?.amount).toBe(100000);
    expect(computation.lines.find((item) => item.key === 'allowance.parent.0')?.amount).toBe(100000);
    expect(computation.lines.find((item) => item.key === 'allowance.sibling')?.amount).toBe(37500);
    expect(computation.lines.find((item) => item.key === 'allowance.disabledDependant')?.amount).toBe(75000);
    expect(computation.lines.find((item) => item.key === 'allowance.personalDisability')?.amount).toBe(75000);
  });
});
