export type YearOfAssessment = '2024_25' | '2025_26';

export interface TaxBand { width: number | null; rate: number } // width null = remainder

export interface TaxYearParams {
  year: YearOfAssessment;
  progressiveBands: TaxBand[];                 // 4x50000 @ .02/.06/.10/.14, null @ .17
  standardRateTiers: TaxBand[];                // 5_000_000 @ .15, null @ .16
  taxReduction: { percent: number; cap: number; appliesTo: ('salaries'|'profits'|'pa')[] };
  allowances: { basic: number; married: number; child: number; childNewbornExtra: number;
    parentAged60: number; parentAged55: number; parentResidingExtra60: number; parentResidingExtra55: number;
    sibling: number; singleParent: number; disabledDependant: number; personalDisability: number };
  deductionCaps: { selfEducation: number; donationsPercent: number; mpfMandatory: number;
    homeLoanInterest: number; homeLoanInterestElevated: number; homeLoanInterestYears: number;
    domesticRent: number; domesticRentElevated: number; elderlyCare: number;
    annuityAndTvc: number; vhisPerPerson: number; assistedReproduction: number };
  propertyTax: { rate: number; repairsAllowancePercent: number };
  profitsTax: { tierOneRate: number; tierOneCap: number; standardRate: number };
  mpf: { employeeRate: number; monthlyCap: number; minRelevantIncomeMonthly: number; maxRelevantIncomeMonthly: number };
}

export interface ComputationLine { key: string; labelZh: string; labelEn: string; amount: number;
  kind: 'income'|'deduction'|'allowance'|'subtotal'|'tax'|'info' }

export interface Computation {
  head: 'salaries'|'property'|'profits'|'personalAssessment';
  lines: ComputationLine[];
  netAssessableIncome: number;   // after deductions, before allowances (NAI)
  netChargeableIncome: number;   // after allowances (NCI), floor 0
  taxAtProgressive: number; taxAtStandard: number; basisUsed: 'progressive'|'standard';
  taxBeforeReduction: number; reduction: number; finalTax: number;
}
