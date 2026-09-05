# hktax engine type contract (architect-owned, v1)

All engine code is pure TypeScript under `hktax/src/lib/tax/`, no React, no I/O.
All money values are integer HKD (round at the statutorily correct points only:
final tax is rounded down to the dollar; intermediate lines kept exact integers).

## Shared (`types.ts`)

```ts
export type YearOfAssessment = '2024_25' | '2025_26';

export interface TaxBand { width: number | null; rate: number } // width null = remainder

export interface TaxYearParams {
  year: YearOfAssessment;
  progressiveBands: TaxBand[];                 // 4x50000 @ .02/.06/.10/.14, null @ .17
  standardRateTiers: TaxBand[];                // 5_000_000 @ .15, null @ .16
  taxReduction: { percent: number; cap: number; appliesTo: ('salaries'|'profits'|'pa'|'propertyNone')[] };
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
```

## Per-head inputs (summary — implementer defines full input types in each module)

- `salaries.ts`: `computeSalariesTax(input: SalariesInput, params: TaxYearParams): Computation`
  plus `computeJointAssessment(a: SalariesInput, b: SalariesInput, shared: FamilyInput, params): JointComputation`
- `property.ts`: `computePropertyTax(props: PropertyInput[], params): PropertyComputation` (per-property breakdown + aggregate)
- `profits.ts`: `computeProfitsTax(biz: BusinessInput[], params): ProfitsComputation` (per-business + aggregate, loss c/f)
- `personalAssessment.ts`: `computePA(person: PersonInput, params): Computation` and joint variant
- `optimizer.ts`: `optimize(family: FamilyScenarioInput, params): OptimizerResult` where
  `OptimizerResult = { scenarios: {id, labelZh, labelEn, available, reasonUnavailableZh?, reasonUnavailableEn?, totalTax, perPerson: …}[], best: id, saving: number, explanationZh, explanationEn }`
- `provisional.ts`: `assembleDemand(finalComp: …, params): { finalTax, provisionalTax, totalDemand, lines }`

FamilyInput/PersonInput carry: marital status, dependants (children w/ birth years,
parents w/ age bands + co-residence, siblings, disabilities), deduction inputs.

Rules of construction:
- Every statutory number comes from `params` — grep for hardcoded amounts must find none.
- Every computation step emits a ComputationLine (bilingual labels) so the UI renders IRD-style breakdowns.
- Allowance/deduction eligibility logic lives in engine, caps applied in engine, with per-line "capped" info lines.
