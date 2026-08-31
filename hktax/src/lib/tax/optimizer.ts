import {
  checkPAEligibility,
  computeJointPA,
  computePA,
  hasChargeableIncomeForMarriedPA,
  type PAPersonInput,
} from './personalAssessment';
import { computeProfitsTax } from './profits';
import { computePropertyTax } from './property';
import { computeJointAssessment, computeSalariesTax, type SharedAllowanceInput } from './salaries';
import type { TaxYearParams } from './types';

export interface FamilyScenarioInput {
  married: boolean;
  personA: PAPersonInput;
  personB?: PAPersonInput;
}

export interface OptimizerPersonResult {
  personId?: string;
  salariesTax: number;
  propertyTax: number;
  profitsTax: number;
  separateHeadsTax: number;
  finalTax: number;
  paTax?: number;
  jointSalariesTax?: number;
  jointPATax?: number;
}

export interface OptimizerScenario {
  id: string;
  labelZh: string;
  labelEn: string;
  available: boolean;
  reasonUnavailableZh?: string;
  reasonUnavailableEn?: string;
  totalTax: number;
  perPerson: {
    a: OptimizerPersonResult;
    b?: OptimizerPersonResult;
  };
}

export interface OptimizerResult {
  scenarios: OptimizerScenario[];
  best: string;
  saving: number;
  explanationZh: string;
  explanationEn: string;
}

interface SeparateHeadsResult {
  salariesTax: number;
  propertyTax: number;
  profitsTax: number;
  totalTax: number;
}

type ScenarioKind = 'separate' | 'jointSalaries' | 'individualPA' | 'jointPA';

const SCENARIO_KIND_BY_ID: Record<string, ScenarioKind> = {
  separate: 'separate',
  jointSalaries: 'jointSalaries',
  paIndividualA: 'individualPA',
  paIndividualB: 'individualPA',
  paIndividualBoth: 'individualPA',
  pa: 'individualPA',
  paJoint: 'jointPA',
};

const TIE_BREAK_RANK_BY_ID: Record<string, number> = {
  separate: 0,
  jointSalaries: 1,
  pa: 2,
  paIndividualA: 2,
  paIndividualB: 3,
  paIndividualBoth: 4,
  paJoint: 5,
};

const PA_INDIVIDUAL_A_UNAVAILABLE = {
  zh: '配偶甲不符合個人入息課稅資格。',
  en: 'Spouse A is not eligible for Personal Assessment.',
};

const PA_INDIVIDUAL_B_UNAVAILABLE = {
  zh: '配偶乙不符合個人入息課稅資格。',
  en: 'Spouse B is not eligible for Personal Assessment.',
};

const JOINT_SALARIES_UNAVAILABLE = {
  zh: '薪俸稅合併評稅只適用於夫婦雙方均有薪俸收入的情況。',
  en: 'Joint salaries assessment requires both spouses to have salaries income.',
};

export function optimize(family: FamilyScenarioInput, params: TaxYearParams): OptimizerResult {
  if (!family.married) {
    const scenarios = buildSingleScenarios(family.personA, params);
    return buildOptimizerResult(family, scenarios, params);
  }

  if (!family.personB) {
    throw new Error('Married optimizer input must include personB.');
  }

  assertNotBothSpousesClaimMarriedAllowance(family.personA, family.personB);

  const scenarios = buildCoupleScenarios(family.personA, family.personB, params);
  return buildOptimizerResult(family, scenarios, params);
}

function buildOptimizerResult(
  family: FamilyScenarioInput,
  scenarios: OptimizerScenario[],
  params: TaxYearParams,
): OptimizerResult {
  const best = pickBestScenario(scenarios);
  const baseline = scenarios.find((item) => item.id === 'separate');

  if (!best || !baseline || !baseline.available) {
    throw new Error('Optimizer failed to build required available separate-heads scenario.');
  }

  const saving = Math.max(0, baseline.totalTax - best.totalTax);
  const explanation = explainBestScenario(best, family, saving, params);

  return {
    scenarios,
    best: best.id,
    saving,
    explanationZh: explanation.zh,
    explanationEn: explanation.en,
  };
}

function buildSingleScenarios(person: PAPersonInput, params: TaxYearParams): OptimizerScenario[] {
  const separate = computeSeparateHeads(person, params);
  const eligibility = checkPAEligibility(person);
  const pa = eligibility.eligible ? computePA(person, params) : undefined;

  return [
    scenario({
      id: 'separate',
      labelZh: '分開按各稅項評稅',
      labelEn: 'Separate assessment by tax head',
      available: true,
      totalTax: separate.totalTax,
      perPerson: { a: separatePersonResult(person, separate) },
    }),
    scenario({
      id: 'pa',
      labelZh: '個人入息課稅',
      labelEn: 'Personal Assessment',
      available: eligibility.eligible,
      totalTax: pa?.finalTax ?? Number.POSITIVE_INFINITY,
      perPerson: {
        a: paPersonResult(person, separate, pa?.finalTax),
      },
      unavailableReason: eligibility.eligible
        ? undefined
        : { zh: eligibility.reasonsZh.join(' '), en: eligibility.reasonsEn.join(' ') },
    }),
  ];
}

export function buildCoupleScenarios(a: PAPersonInput, b: PAPersonInput, params: TaxYearParams): OptimizerScenario[] {
  const separateA = computeSeparateHeads(a, params);
  const separateB = computeSeparateHeads(b, params);
  const separateTotal = separateA.totalTax + separateB.totalTax;
  const sharedAllowances = deriveSharedAllowances(a, b);
  const eligibilityA = checkPAEligibility(a);
  const eligibilityB = checkPAEligibility(b);

  const jointSalaries = hasSalariesIncome(a) && hasSalariesIncome(b)
    ? computeJointAssessment(a.salaries!, b.salaries!, sharedAllowances, params)
    : undefined;
  const jointSalariesTotal = jointSalaries
    ? jointSalaries.finalTax + separateA.propertyTax + separateA.profitsTax + separateB.propertyTax + separateB.profitsTax
    : Number.POSITIVE_INFINITY;

  const individualAAvailability = individualPAAvailability(eligibilityA, b, params, PA_INDIVIDUAL_A_UNAVAILABLE);
  const individualBAvailability = individualPAAvailability(eligibilityB, a, params, PA_INDIVIDUAL_B_UNAVAILABLE);
  const paBothAvailability = individualBothPAAvailability(individualAAvailability, individualBAvailability);
  const jointPA = eligibilityA.eligible && eligibilityB.eligible ? computeJointPA(a, b, sharedAllowances, params) : undefined;
  // IRO s.29(1), as amended: in individual-PA branches, MPA is unavailable
  // where the spouse elects PA separately, and this branch also applies the
  // broader PA income-head test used by hasChargeableIncomeForMarriedPA. That
  // is deliberately narrower in scope than docs/golden-scenarios.md section
  // 0.4's general salaries-tax-only MPA note; keep this local to these three
  // individual-election scenarios.
  const paIndividualAInputA = personForIndividualPAScenario(a, b, false, params);
  const paIndividualAInputB = personForIndividualPAScenario(b, a, true, params);
  const paIndividualBInputA = personForIndividualPAScenario(a, b, true, params);
  const paIndividualBInputB = personForIndividualPAScenario(b, a, false, params);
  const paIndividualBothInputA = personForIndividualPAScenario(a, b, true, params);
  const paIndividualBothInputB = personForIndividualPAScenario(b, a, true, params);
  const paIndividualASeparateA = computeSeparateHeads(paIndividualAInputA, params);
  const paIndividualASeparateB = computeSeparateHeads(paIndividualAInputB, params);
  const paIndividualBSeparateA = computeSeparateHeads(paIndividualBInputA, params);
  const paIndividualBSeparateB = computeSeparateHeads(paIndividualBInputB, params);
  const paIndividualBothSeparateA = computeSeparateHeads(paIndividualBothInputA, params);
  const paIndividualBothSeparateB = computeSeparateHeads(paIndividualBothInputB, params);
  const paIndividualAForA = individualAAvailability.available ? computePA(paIndividualAInputA, params) : undefined;
  const paIndividualBForB = individualBAvailability.available ? computePA(paIndividualBInputB, params) : undefined;
  const paIndividualBothForA = paBothAvailability.available ? computePA(paIndividualBothInputA, params) : undefined;
  const paIndividualBothForB = paBothAvailability.available ? computePA(paIndividualBothInputB, params) : undefined;

  return [
    scenario({
      id: 'separate',
      labelZh: '夫婦分開按各稅項評稅',
      labelEn: 'Separate assessment for each spouse by tax head',
      available: true,
      totalTax: separateTotal,
      perPerson: {
        a: separatePersonResult(a, separateA),
        b: separatePersonResult(b, separateB),
      },
    }),
    scenario({
      id: 'jointSalaries',
      labelZh: '薪俸稅合併評稅',
      labelEn: 'Joint salaries assessment',
      available: Boolean(jointSalaries),
      totalTax: jointSalariesTotal,
      perPerson: {
        a: jointSalariesPersonResult(a, separateA, jointSalaries?.perSpouse.a.shareOfTax),
        b: jointSalariesPersonResult(b, separateB, jointSalaries?.perSpouse.b.shareOfTax),
      },
      unavailableReason: jointSalaries ? undefined : JOINT_SALARIES_UNAVAILABLE,
    }),
    scenario({
      id: 'paIndividualA',
      labelZh: '配偶甲個別選擇個人入息課稅',
      labelEn: 'Spouse A elects Personal Assessment individually',
      available: individualAAvailability.available,
      totalTax: paIndividualAForA
        ? paIndividualAForA.finalTax + paIndividualASeparateB.totalTax
        : Number.POSITIVE_INFINITY,
      perPerson: {
        a: paPersonResult(paIndividualAInputA, paIndividualASeparateA, paIndividualAForA?.finalTax),
        b: separatePersonResult(paIndividualAInputB, paIndividualASeparateB),
      },
      unavailableReason: individualAAvailability.available ? undefined : individualAAvailability.reason,
    }),
    scenario({
      id: 'paIndividualB',
      labelZh: '配偶乙個別選擇個人入息課稅',
      labelEn: 'Spouse B elects Personal Assessment individually',
      available: individualBAvailability.available,
      totalTax: paIndividualBForB
        ? paIndividualBSeparateA.totalTax + paIndividualBForB.finalTax
        : Number.POSITIVE_INFINITY,
      perPerson: {
        a: separatePersonResult(paIndividualBInputA, paIndividualBSeparateA),
        b: paPersonResult(paIndividualBInputB, paIndividualBSeparateB, paIndividualBForB?.finalTax),
      },
      unavailableReason: individualBAvailability.available ? undefined : individualBAvailability.reason,
    }),
    scenario({
      id: 'paIndividualBoth',
      labelZh: '夫婦各自選擇個人入息課稅',
      labelEn: 'Both spouses elect Personal Assessment individually',
      available: paBothAvailability.available,
      totalTax: paIndividualBothForA && paIndividualBothForB
        ? paIndividualBothForA.finalTax + paIndividualBothForB.finalTax
        : Number.POSITIVE_INFINITY,
      perPerson: {
        a: paPersonResult(paIndividualBothInputA, paIndividualBothSeparateA, paIndividualBothForA?.finalTax),
        b: paPersonResult(paIndividualBothInputB, paIndividualBothSeparateB, paIndividualBothForB?.finalTax),
      },
      unavailableReason: paBothAvailability.available ? undefined : paBothAvailability.reason,
    }),
    scenario({
      id: 'paJoint',
      labelZh: '夫婦共同選擇個人入息課稅',
      labelEn: 'Joint Personal Assessment',
      available: Boolean(jointPA),
      totalTax: jointPA?.finalTax ?? Number.POSITIVE_INFINITY,
      perPerson: {
        a: jointPAPersonResult(a, separateA, jointPA?.perSpouse.a.shareOfTax),
        b: jointPAPersonResult(b, separateB, jointPA?.perSpouse.b.shareOfTax),
      },
      unavailableReason: jointPA
        ? undefined
        : combinedEligibilityReason(eligibilityA, eligibilityB),
    }),
  ];
}

function computeSeparateHeads(person: PAPersonInput, params: TaxYearParams): SeparateHeadsResult {
  const salariesTax = person.salaries ? computeSalariesTax(person.salaries, params).finalTax : 0;
  const propertyTax = computePropertyTax(person.properties ?? [], params).totalTax;
  const profitsTax = person.businesses?.length ? computeProfitsTax(person.businesses, params).finalTax : 0;

  return {
    salariesTax,
    propertyTax,
    profitsTax,
    totalTax: salariesTax + propertyTax + profitsTax,
  };
}

function personForIndividualPAScenario(
  person: PAPersonInput,
  spouse: PAPersonInput,
  spouseElectsPAIndividually: boolean,
  params: TaxYearParams,
): PAPersonInput {
  const spouseHasChargeableIncome = hasChargeableIncomeForMarriedPA(spouse, params);
  const mayKeepMarriedAllowance = !spouseElectsPAIndividually && !spouseHasChargeableIncome;

  return mayKeepMarriedAllowance ? person : stripMarriedAllowanceClaim(person);
}

function stripMarriedAllowanceClaim(person: PAPersonInput): PAPersonInput {
  const allowances = {
    ...effectiveAllowanceInput(person),
    claimMarriedAllowance: false,
  };

  return {
    ...person,
    allowances,
    salaries: person.salaries
      ? {
        ...person.salaries,
        allowances,
      }
      : person.salaries,
  };
}

function assertNotBothSpousesClaimMarriedAllowance(a: PAPersonInput, b: PAPersonInput): void {
  if (claimsMarriedAllowance(a) && claimsMarriedAllowance(b)) {
    throw new Error(
      "Both spouses cannot claim the married person's allowance simultaneously. / 夫婦雙方不可同時申索已婚人士免稅額。",
    );
  }
}

function claimsMarriedAllowance(person: PAPersonInput): boolean {
  const allowances = effectiveAllowanceInput(person);

  return Boolean(allowances.isMarried && allowances.claimMarriedAllowance);
}

function effectiveAllowanceInput(person: PAPersonInput): NonNullable<PAPersonInput['allowances']> {
  return person.allowances ?? person.salaries?.allowances ?? {};
}

function individualPAAvailability(
  electorEligibility: ReturnType<typeof checkPAEligibility>,
  _spouse: PAPersonInput,
  _params: TaxYearParams,
  fallbackReason: { zh: string; en: string },
): { available: true; reason?: undefined } | { available: false; reason: { zh: string; en: string } } {
  if (!electorEligibility.eligible) {
    return {
      available: false,
      reason: {
        zh: electorEligibility.reasonsZh.join(' ') || fallbackReason.zh,
        en: electorEligibility.reasonsEn.join(' ') || fallbackReason.en,
      },
    };
  }

  return { available: true };
}

function individualBothPAAvailability(
  availabilityA: ReturnType<typeof individualPAAvailability>,
  availabilityB: ReturnType<typeof individualPAAvailability>,
): { available: true; reason?: undefined } | { available: false; reason: { zh: string; en: string } } {
  if (availabilityA.available && availabilityB.available) {
    return { available: true };
  }

  const zh = [
    availabilityA.available ? undefined : `配偶甲：${availabilityA.reason.zh}`,
    availabilityB.available ? undefined : `配偶乙：${availabilityB.reason.zh}`,
  ].filter((reason): reason is string => Boolean(reason));
  const en = [
    availabilityA.available ? undefined : `Spouse A: ${availabilityA.reason.en}`,
    availabilityB.available ? undefined : `Spouse B: ${availabilityB.reason.en}`,
  ].filter((reason): reason is string => Boolean(reason));

  return {
    available: false,
    reason: {
      zh: zh.join(' ') || '夫婦雙方均須符合個人入息課稅資格。',
      en: en.join(' ') || 'Both spouses must be eligible for Personal Assessment.',
    },
  };
}

function combinedEligibilityReason(
  eligibilityA: ReturnType<typeof checkPAEligibility>,
  eligibilityB: ReturnType<typeof checkPAEligibility>,
): { zh: string; en: string } {
  const zh = [
    ...prefixReasons('配偶甲：', eligibilityA.reasonsZh),
    ...prefixReasons('配偶乙：', eligibilityB.reasonsZh),
  ];
  const en = [
    ...prefixReasons('Spouse A: ', eligibilityA.reasonsEn),
    ...prefixReasons('Spouse B: ', eligibilityB.reasonsEn),
  ];

  return {
    zh: zh.join(' ') || '夫婦雙方均須符合個人入息課稅資格。',
    en: en.join(' ') || 'Both spouses must be eligible for Personal Assessment.',
  };
}

function prefixReasons(prefix: string, reasons: string[]): string[] {
  return reasons.map((reason) => `${prefix}${reason}`);
}

function separatePersonResult(person: PAPersonInput, separate: SeparateHeadsResult): OptimizerPersonResult {
  return {
    personId: person.personId,
    salariesTax: separate.salariesTax,
    propertyTax: separate.propertyTax,
    profitsTax: separate.profitsTax,
    separateHeadsTax: separate.totalTax,
    finalTax: separate.totalTax,
  };
}

function paPersonResult(
  person: PAPersonInput,
  separate: SeparateHeadsResult,
  paTax: number | undefined,
): OptimizerPersonResult {
  return {
    personId: person.personId,
    salariesTax: 0,
    propertyTax: 0,
    profitsTax: 0,
    separateHeadsTax: separate.totalTax,
    finalTax: paTax ?? Number.POSITIVE_INFINITY,
    paTax,
  };
}

function jointSalariesPersonResult(
  person: PAPersonInput,
  separate: SeparateHeadsResult,
  jointSalariesTax: number | undefined,
): OptimizerPersonResult {
  const finalTax = jointSalariesTax === undefined
    ? Number.POSITIVE_INFINITY
    : jointSalariesTax + separate.propertyTax + separate.profitsTax;

  return {
    personId: person.personId,
    salariesTax: 0,
    propertyTax: separate.propertyTax,
    profitsTax: separate.profitsTax,
    separateHeadsTax: separate.totalTax,
    finalTax,
    jointSalariesTax,
  };
}

function jointPAPersonResult(
  person: PAPersonInput,
  separate: SeparateHeadsResult,
  jointPATax: number | undefined,
): OptimizerPersonResult {
  return {
    personId: person.personId,
    salariesTax: 0,
    propertyTax: 0,
    profitsTax: 0,
    separateHeadsTax: separate.totalTax,
    finalTax: jointPATax ?? Number.POSITIVE_INFINITY,
    jointPATax,
  };
}

function scenario(input: {
  id: string;
  labelZh: string;
  labelEn: string;
  available: boolean;
  totalTax: number;
  perPerson: OptimizerScenario['perPerson'];
  unavailableReason?: { zh: string; en: string };
}): OptimizerScenario {
  return {
    id: input.id,
    labelZh: input.labelZh,
    labelEn: input.labelEn,
    available: input.available,
    reasonUnavailableZh: input.unavailableReason?.zh,
    reasonUnavailableEn: input.unavailableReason?.en,
    // Unavailable scenarios intentionally use Infinity so numeric ranking naturally
    // excludes them while preserving a complete scenario table for the results UI.
    totalTax: input.available ? input.totalTax : Number.POSITIVE_INFINITY,
    perPerson: input.perPerson,
  };
}

function pickBestScenario(scenarios: OptimizerScenario[]): OptimizerScenario | undefined {
  return [...scenarios]
    .filter((item) => item.available)
    .sort((left, right) => left.totalTax - right.totalTax || tieBreakRank(left.id) - tieBreakRank(right.id))[0];
}

function tieBreakRank(id: string): number {
  return TIE_BREAK_RANK_BY_ID[id] ?? TIE_BREAK_RANK_BY_ID.paJoint;
}

function hasSalariesIncome(person: PAPersonInput): person is PAPersonInput & {
  salaries: NonNullable<PAPersonInput['salaries']>;
} {
  return Boolean(person.salaries && person.salaries.incomeItems.length > 0);
}

function deriveSharedAllowances(a: PAPersonInput, b: PAPersonInput): SharedAllowanceInput {
  const allowanceA = a.allowances ?? a.salaries?.allowances ?? {};
  const allowanceB = b.allowances ?? b.salaries?.allowances ?? {};

  // Until the interview layer has a distinct family-allowance model, shared allowances are
  // merged field-by-field, preferring person A when both spouses provided a non-empty value.
  return {
    children: nonEmptyArray(allowanceA.children) ?? nonEmptyArray(allowanceB.children),
    parents: nonEmptyArray(allowanceA.parents) ?? nonEmptyArray(allowanceB.parents),
    siblingCount: positiveNumber(allowanceA.siblingCount) ?? positiveNumber(allowanceB.siblingCount),
    singleParent: allowanceA.singleParent === true ? true : allowanceB.singleParent === true ? true : undefined,
    disabledDependantCount: positiveNumber(allowanceA.disabledDependantCount)
      ?? positiveNumber(allowanceB.disabledDependantCount),
    personalDisabilityCount: (allowanceA.personalDisability ? 1 : 0) + (allowanceB.personalDisability ? 1 : 0),
  };
}

function nonEmptyArray<T>(items: T[] | undefined): T[] | undefined {
  return items && items.length > 0 ? items : undefined;
}

function positiveNumber(value: number | undefined): number | undefined {
  return value !== undefined && value > 0 ? value : undefined;
}

function explainBestScenario(
  best: OptimizerScenario,
  family: FamilyScenarioInput,
  saving: number,
  params: TaxYearParams,
): { zh: string; en: string } {
  if (best.id === 'separate') {
    const tied = saving === 0;
    return tied
      ? {
        zh: `${best.labelZh}勝出，因為它與最低稅款方案相同，並按排序規則保留較簡單的預設評稅方式。`,
        en: `${best.labelEn} wins because it ties the lowest tax and the tie-break keeps the simpler default assessment.`,
      }
      : {
        zh: `${best.labelZh}勝出，因為個人入息課稅或合併評稅未能降低整體稅款。`,
        en: `${best.labelEn} wins because Personal Assessment or joint assessment does not reduce the total tax.`,
      };
  }

  if (best.id === 'jointSalaries') {
    return {
      zh: `${best.labelZh}勝出，因為薪俸入息合併後可使用已婚人士免稅額及配偶未用盡的免稅額空間，較預設方案節省${saving}。`,
      en: `${best.labelEn} wins because salaries income is pooled against the married allowance and unused spouse allowance headroom, saving ${saving} versus the default.`,
    };
  }

  if (SCENARIO_KIND_BY_ID[best.id] === 'jointPA' || SCENARIO_KIND_BY_ID[best.id] === 'individualPA') {
    return explainPAWin(best, family, saving, params);
  }

  return {
    zh: `${best.labelZh}勝出，較預設方案節省${saving}。`,
    en: `${best.labelEn} wins, saving ${saving} versus the default.`,
  };
}

function explainPAWin(
  best: OptimizerScenario,
  family: FamilyScenarioInput,
  saving: number,
  params: TaxYearParams,
): { zh: string; en: string } {
  if (hasAppliedPALine(best.id, family, params, 'letPropertyMortgageInterest')) {
    return {
      zh: `${best.labelZh}勝出，因為出租物業按揭利息可在個人入息課稅下扣除，較預設方案節省${saving}。`,
      en: `${best.labelEn} wins because let-property mortgage interest is deductible under Personal Assessment, saving ${saving} versus the default.`,
    };
  }

  if (hasAppliedPALine(best.id, family, params, 'BusinessLoss')) {
    return {
      zh: `${best.labelZh}勝出，因為業務虧損可在個人入息課稅下抵銷其他入息，較預設方案節省${saving}。`,
      en: `${best.labelEn} wins because business losses can offset other income under Personal Assessment, saving ${saving} versus the default.`,
    };
  }

  if (best.id === 'paJoint') {
    return {
      zh: `${best.labelZh}勝出，因為夫婦合併入息後可一併運用免稅額、扣除及累進稅率，較預設方案節省${saving}。`,
      en: `${best.labelEn} wins because the couple can combine income, allowances, deductions, and progressive rates under Personal Assessment, saving ${saving} versus the default.`,
    };
  }

  return {
    zh: `${best.labelZh}勝出；由2018/19課稅年度起已婚人士可個別選擇個人入息課稅，本方案的扣除、免稅額及稅率計算較預設方案有利，節省${saving}。`,
    en: `${best.labelEn} wins; since YA 2018/19 married persons may elect Personal Assessment individually, and this scenario applies a more favorable mix of deductions, allowances, and rates, saving ${saving} versus the default.`,
  };
}

function hasAppliedPALine(
  scenarioId: string,
  family: FamilyScenarioInput,
  params: TaxYearParams,
  marker: string,
): boolean {
  const lines = scenarioId === 'paJoint' && family.personB
    ? computeJointPA(family.personA, family.personB, deriveSharedAllowances(family.personA, family.personB), params).lines
    : peopleRelevantToScenario(scenarioId, family).flatMap((person) => computePA(person, params).lines);

  return lines.some((item) =>
    item.kind === 'deduction'
    && item.amount > 0
    && item.key.includes(marker));
}

function peopleRelevantToScenario(id: string, family: FamilyScenarioInput): PAPersonInput[] {
  if (id === 'paIndividualA') {
    return [family.personA];
  }
  if (id === 'paIndividualB') {
    return family.personB ? [family.personB] : [];
  }
  return family.personB ? [family.personA, family.personB] : [family.personA];
}
