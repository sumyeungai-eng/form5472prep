import { computeProfitsTax, type ProfitsComputation } from "../tax/profits";
import { computePropertyTax, type PropertyComputation } from "../tax/property";
import { computeSalariesTax, type SalariesInput } from "../tax/salaries";
import type { Computation, TaxYearParams, YearOfAssessment } from "../tax/types";
import { createDefaultWizardState, type WizardState } from "../wizard/wizardState";

export type HousingDeductionKind = "none" | "domesticRent" | "homeLoanInterest";
export type SalariesAllowanceKind = "basic" | "married";

export type QuickSalariesInput = {
  annualIncome: number;
  mpfMandatory: number;
  allowanceKind: SalariesAllowanceKind;
  children: number;
  housingKind: HousingDeductionKind;
  housingAmount: number;
};

export type QuickPropertyInput = {
  monthlyRent: number;
  monthsRented: number;
  ratesPaidByOwner: boolean;
  ratesAmount: number;
  ownershipSharePercent: number;
};

export type QuickProfitsInput = {
  revenue: number;
  deductibleExpenses: number;
  electedTwoTier: boolean;
};

export type QuickProfitsResult = ProfitsComputation & {
  tierOneProfits: number;
  tierOneTax: number;
  standardRemainderProfits: number;
  standardRemainderTax: number;
};

export function computeQuickSalaries(
  input: QuickSalariesInput,
  params: TaxYearParams,
): Computation {
  return computeSalariesTax(mapQuickSalariesToEngineInput(input), params);
}

export function computeQuickProperty(
  input: QuickPropertyInput,
  params: TaxYearParams,
): PropertyComputation {
  return computePropertyTax([mapQuickPropertyToEngineInput(input)], params);
}

export function computeQuickProfits(
  input: QuickProfitsInput,
  params: TaxYearParams,
): QuickProfitsResult {
  const business = mapQuickProfitsToEngineInput(input);
  const result = computeProfitsTax([business], params);
  const assessableProfits = Math.max(0, result.perBusiness[0]?.assessableProfits ?? 0);
  const tierOneProfits = business.electedTwoTier
    ? Math.min(assessableProfits, params.profitsTax.tierOneCap)
    : 0;
  const standardRemainderProfits = business.electedTwoTier
    ? Math.max(assessableProfits - params.profitsTax.tierOneCap, 0)
    : assessableProfits;

  return {
    ...result,
    tierOneProfits,
    tierOneTax: amountForLine(result.perBusiness[0]?.lines ?? [], "tax-tier-one"),
    standardRemainderProfits,
    standardRemainderTax:
      amountForLine(result.perBusiness[0]?.lines ?? [], "tax-standard-remainder")
      || amountForLine(result.perBusiness[0]?.lines ?? [], "tax-standard"),
  };
}

export function calculateQuickAnnualMpf(
  annualIncome: number,
  params: TaxYearParams,
): number {
  const monthlyIncome = sanitizeMoney(annualIncome) / 12;

  if (monthlyIncome < params.mpf.minRelevantIncomeMonthly) {
    return 0;
  }

  const relevantIncome = Math.min(monthlyIncome, params.mpf.maxRelevantIncomeMonthly);
  const monthlyMpf = Math.min(relevantIncome * params.mpf.employeeRate, params.mpf.monthlyCap);

  return Math.max(0, Math.round(monthlyMpf * 12));
}

export function buildSalariesWizardState(
  input: QuickSalariesInput,
  year: YearOfAssessment,
): WizardState {
  const state = createDefaultWizardState();
  const salaryInput = mapQuickSalariesToEngineInput(input);
  const children = Array.from({ length: sanitizeCount(input.children) }, (_item, index) => ({
    key: `quick-child-${index + 1}`,
    birthYear: nonNewbornBirthYear(year),
  }));

  state.year = year;
  state.maritalStatus = input.allowanceKind === "married" ? "married" : "single";
  state.claimMarriedAllowanceBy = input.allowanceKind === "married" ? "A" : "none";
  state.personA.incomeSources.hasSalary = true;
  state.personA.salary.incomeItems = salaryInput.incomeItems;
  state.personA.deductions = {
    ...state.personA.deductions,
    housing: {
      kind: input.housingKind,
      amount: sanitizeMoney(input.housingAmount),
      eligibleForElevatedCap: null,
    },
    mpfMandatory: sanitizeMoney(input.mpfMandatory),
  };
  state.family.children = children;

  return state;
}

export function buildPropertyWizardState(
  input: QuickPropertyInput,
  year: YearOfAssessment,
): WizardState {
  const state = createDefaultWizardState();

  state.year = year;
  state.personA.incomeSources.hasProperty = true;
  state.personA.properties = [mapQuickPropertyToEngineInput(input)];

  return state;
}

export function buildProfitsWizardState(
  input: QuickProfitsInput,
  year: YearOfAssessment,
): WizardState {
  const state = createDefaultWizardState();
  const business = mapQuickProfitsToEngineInput(input);

  state.year = year;
  state.personA.incomeSources.hasBusiness = true;
  state.personA.businesses = [{
    id: business.id,
    name: business.name,
    revenue: business.revenue,
    deductibleExpenses: business.deductibleExpenses,
  }];
  state.personA.electedTwoTierBusinessId = business.electedTwoTier ? business.id : null;

  return state;
}

function mapQuickSalariesToEngineInput(input: QuickSalariesInput): SalariesInput {
  const deductions: NonNullable<SalariesInput["deductions"]> = {};
  const mpfMandatory = sanitizeMoney(input.mpfMandatory);
  const housingAmount = sanitizeMoney(input.housingAmount);

  if (mpfMandatory > 0) {
    deductions.mpfMandatory = mpfMandatory;
  }
  if (housingAmount > 0 && input.housingKind === "domesticRent") {
    deductions.domesticRent = housingAmount;
  }
  if (housingAmount > 0 && input.housingKind === "homeLoanInterest") {
    deductions.homeLoanInterest = housingAmount;
  }

  return {
    incomeItems: [{
      key: "quick-salary",
      labelZh: "薪金入息",
      labelEn: "Salary income",
      amount: sanitizeMoney(input.annualIncome),
    }],
    ...(Object.keys(deductions).length > 0 ? { deductions } : {}),
    allowances: {
      isMarried: input.allowanceKind === "married",
      claimMarriedAllowance: input.allowanceKind === "married",
      children: Array.from({ length: sanitizeCount(input.children) }, (_item, index) => ({
        key: `quick-child-${index + 1}`,
        bornInCurrentYear: false,
      })),
    },
  };
}

function mapQuickPropertyToEngineInput(input: QuickPropertyInput) {
  const rentReceived = sanitizeMoney(input.monthlyRent) * clamp(sanitizeCount(input.monthsRented), 0, 12);
  const ownershipShare = clamp(sanitizeMoney(input.ownershipSharePercent), 0, 100) / 100;

  return {
    id: "quick-property-1",
    rentReceived,
    ...(input.ratesPaidByOwner ? { ratesPaidByOwner: sanitizeMoney(input.ratesAmount) } : {}),
    ownershipShare,
  };
}

function mapQuickProfitsToEngineInput(input: QuickProfitsInput) {
  return {
    id: "quick-business-1",
    name: "Quick profits calculator",
    revenue: sanitizeMoney(input.revenue),
    deductibleExpenses: sanitizeMoney(input.deductibleExpenses),
    electedTwoTier: input.electedTwoTier,
  };
}

function amountForLine(lines: { key: string; amount: number }[], key: string): number {
  return lines.find((line) => line.key === key)?.amount ?? 0;
}

function sanitizeMoney(value: number): number {
  return Number.isFinite(value) ? Math.round(Math.max(0, value)) : 0;
}

function sanitizeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function nonNewbornBirthYear(year: YearOfAssessment): number {
  return year === "2024_25" ? 2024 : 2025;
}
