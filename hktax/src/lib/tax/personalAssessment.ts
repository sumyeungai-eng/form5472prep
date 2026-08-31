import { computeProfitsTax, type BusinessInput } from './profits';
import { computePropertyTax, type PropertyInput } from './property';
import {
  computeSalariesTax,
  type DomesticRentDeductionInput,
  type HomeLoanInterestDeductionInput,
  type ParentAllowanceInput,
  type SalariesInput,
  type SharedAllowanceInput,
} from './salaries';
import type { Computation, ComputationLine, TaxBand, TaxYearParams } from './types';

export interface PAEligibilityInput {
  ageDuringYear?: number;
  bothParentsDeceased?: boolean;
  isHongKongPermanentResident?: boolean;
  ordinarilyResidentInHongKong?: boolean;
  presentInHongKongMoreThan180Days?: boolean;
  presentInHongKongMoreThan300DaysAcrossTwoYears?: boolean;
}

export interface PAPersonInput extends PAEligibilityInput {
  personId?: string;
  salaries?: SalariesInput;
  properties?: PropertyInput[];
  businesses?: BusinessInput[];
  letPropertyMortgageInterest?: { propertyId: string; interest: number }[];
  /**
   * Personal Assessment has its own aggregate loss pool carried from PA years.
   * Do not use BusinessInput.lossBroughtForward here; that field belongs to the
   * standalone profits-tax loss pool for that specific business, and the two
   * pools can diverge when PA is elected in some years but not others.
   */
  paLossBroughtForward?: number;
  deductions?: SalariesInput['deductions'];
  allowances?: SalariesInput['allowances'];
}

export interface PAEligibilityResult {
  eligible: boolean;
  reasonsZh: string[];
  reasonsEn: string[];
}

export interface JointPAComputation extends Computation {
  combinedNetAssessableIncome: number;
  perSpouse: {
    a: { netAssessableIncome: number; shareOfCombinedNai: number; shareOfTax: number };
    b: { netAssessableIncome: number; shareOfCombinedNai: number; shareOfTax: number };
  };
}

export const MARRIED_PA_ELECTION_RULE = {
  effectiveFromYear: '2018/19',
  labelZh: '由2018/19課稅年度起，已婚人士可個別選擇個人入息課稅，亦可在雙方同意下共同選擇。',
  labelEn: 'From YA 2018/19, married persons may elect Personal Assessment individually, or jointly if both spouses agree.',
} as const;

// Married-couple PA election rule: under the Inland Revenue (Amendment) (No.4)
// Ordinance 2018, effective from YA 2018/19, a married person may elect PA
// individually regardless of whether the spouse has chargeable salaries,
// property, or profits income. Joint PA remains available where both spouses
// agree to elect jointly. optimizer.ts owns scenario availability/enforcement;
// this module exposes the eligibility-shaped helpers it needs.

interface IncomePipelineResult {
  lines: ComputationLine[];
  salariesAssessableIncome: number;
  propertyNav: number;
  businessAggregateBeforeLoss: number;
  aggregateIncome: number;
  letPropertyMortgageInterestDeducted: number;
  currentYearBusinessLossDeducted: number;
  paLossBroughtForwardDeducted: number;
  residualPaLoss: number;
  netAssessableIncomeBeforeConcessionaryDeductions: number;
  netAssessableIncomeBeforeFloor: number;
  netAssessableIncome: number;
}

interface ConcessionaryDeductionResult {
  netAssessableIncomeBeforeFloor: number;
  netAssessableIncome: number;
}

interface AllowanceResult {
  lines: ComputationLine[];
  total: number;
}

interface TaxFigureResult {
  lines: ComputationLine[];
  taxAtProgressive: number;
  taxAtStandard: number;
  basisUsed: Computation['basisUsed'];
  taxBeforeReduction: number;
  reduction: number;
  finalTax: number;
}

const MINIMUM_QUALIFYING_DONATION = 100;
const CHILD_ALLOWANCE_MAX_COUNT = 9;

// IRD Personal Assessment guide / IRO Part VII s.41: an elector must be at least 18,
// unless both parents are dead, and must meet permanent/temporary resident status.
export function checkPAEligibility(input: PAEligibilityInput): PAEligibilityResult {
  const reasonsZh: string[] = [];
  const reasonsEn: string[] = [];
  const meetsAgeOrOrphanRule = (input.ageDuringYear ?? 0) >= 18 || input.bothParentsDeceased === true;
  const meetsResidenceRule = input.isHongKongPermanentResident === true
    || input.ordinarilyResidentInHongKong === true
    || input.presentInHongKongMoreThan180Days === true
    || input.presentInHongKongMoreThan300DaysAcrossTwoYears === true;

  if (!meetsAgeOrOrphanRule) {
    reasonsZh.push('申請人須在該課稅年度年滿18歲，或父母均已去世。');
    reasonsEn.push('The elector must be aged 18 or above during the year of assessment, unless both parents are deceased.');
  }

  if (!meetsResidenceRule) {
    reasonsZh.push('申請人須為香港永久性居民，或符合個人入息課稅下的臨時居民居港日數／通常居住條件。');
    reasonsEn.push('The elector must be a Hong Kong permanent resident or meet the ordinary-residence or temporary-resident presence test for Personal Assessment.');
  }

  return { eligible: reasonsZh.length === 0, reasonsZh, reasonsEn };
}

export function hasSalariesAssessableIncomeForMarriedPA(person: PAPersonInput, params: TaxYearParams): boolean {
  // IRO s.29(1)(b)(i)(A) disqualifies MPA only when the spouse has
  // Salaries Tax assessable income; see docs/mpa-joint-setoff-verification.md.
  const salariesAssessableIncome = getSalariesAssessableIncome(person.salaries, params);

  return salariesAssessableIncome > 0;
}


export function canElectIndividualPA(
  _spouse: PAPersonInput | undefined,
  _params: TaxYearParams,
): { available: boolean; reasonUnavailableZh?: string; reasonUnavailableEn?: string } {
  return { available: true };
}

export function computePA(person: PAPersonInput, params: TaxYearParams): Computation {
  const income = computeIncomePipeline(person, params, 'person');
  const allowances = computeAllowances(effectiveAllowanceInput(person), params, false);
  const netChargeableIncome = Math.max(0, income.netAssessableIncome - allowances.total);
  const tax = computeTaxFigures(netChargeableIncome, income.netAssessableIncome, params, 'pa');

  return {
    head: 'personalAssessment',
    lines: [
      ...income.lines,
      ...allowances.lines,
      line('netChargeableIncome', '應課稅入息實額', 'Net chargeable income', netChargeableIncome, 'subtotal'),
      ...tax.lines,
    ],
    netAssessableIncome: income.netAssessableIncome,
    netChargeableIncome,
    taxAtProgressive: tax.taxAtProgressive,
    taxAtStandard: tax.taxAtStandard,
    basisUsed: tax.basisUsed,
    taxBeforeReduction: tax.taxBeforeReduction,
    reduction: tax.reduction,
    finalTax: tax.finalTax,
  };
}

function effectiveAllowanceInput(person: PAPersonInput): NonNullable<PAPersonInput['allowances']> {
  return {
    ...(person.allowances ?? {}),
    ...(person.salaries?.allowances ?? {}),
  };
}

export function computeJointPA(
  a: PAPersonInput,
  b: PAPersonInput,
  shared: SharedAllowanceInput,
  params: TaxYearParams,
): JointPAComputation {
  const spouseA = computeIncomePipeline(a, params, 'spouseA');
  const spouseB = computeIncomePipeline(b, params, 'spouseB');
  const combinedNetAssessableIncome = Math.max(
    0,
    spouseA.netAssessableIncomeBeforeFloor + spouseB.netAssessableIncomeBeforeFloor,
  );
  const allowances = computeAllowances(shared, params, true);
  const netChargeableIncome = Math.max(0, combinedNetAssessableIncome - allowances.total);
  const tax = computeTaxFigures(netChargeableIncome, combinedNetAssessableIncome, params, 'jointPa');
  // IRO s.42 apportionment: this engine allocates final joint PA tax by each spouse's
  // positive post-deduction, pre-allowance income divided by the combined positive amount.
  const perSpouse = apportionJointTax(spouseA.netAssessableIncome, spouseB.netAssessableIncome, tax.finalTax);

  return {
    head: 'personalAssessment',
    lines: [
      ...prefixLines(spouseA.lines, 'spouseA', '配偶甲', 'Spouse A'),
      line('spouseA.nai', '配偶甲入息實額', 'Spouse A net assessable income', spouseA.netAssessableIncome, 'subtotal'),
      ...prefixLines(spouseB.lines, 'spouseB', '配偶乙', 'Spouse B'),
      line('spouseB.nai', '配偶乙入息實額', 'Spouse B net assessable income', spouseB.netAssessableIncome, 'subtotal'),
      line('jointPa.combinedNai', '合併入息實額', 'Combined net assessable income', combinedNetAssessableIncome, 'subtotal'),
      ...allowances.lines,
      line('jointPa.netChargeableIncome', '合併應課稅入息實額', 'Combined net chargeable income', netChargeableIncome, 'subtotal'),
      ...tax.lines,
      line('jointPa.apportionment.a', '配偶甲分攤稅款', 'Spouse A apportioned tax', perSpouse.a.shareOfTax, 'tax'),
      line('jointPa.apportionment.b', '配偶乙分攤稅款', 'Spouse B apportioned tax', perSpouse.b.shareOfTax, 'tax'),
    ],
    netAssessableIncome: combinedNetAssessableIncome,
    combinedNetAssessableIncome,
    netChargeableIncome,
    taxAtProgressive: tax.taxAtProgressive,
    taxAtStandard: tax.taxAtStandard,
    basisUsed: tax.basisUsed,
    taxBeforeReduction: tax.taxBeforeReduction,
    reduction: tax.reduction,
    finalTax: tax.finalTax,
    perSpouse,
  };
}

function computeIncomePipeline(person: PAPersonInput, params: TaxYearParams, keyPrefix: string): IncomePipelineResult {
  const lines: ComputationLine[] = [];
  const salariesAssessableIncome = getSalariesAssessableIncome(person.salaries, params);
  const propertyResult = computePropertyTax(person.properties ?? [], params);
  const propertyNavById = new Map(propertyResult.perProperty.map((property) => [property.id, property.nav]));
  const propertyNav = propertyResult.totalNav;
  const businessAggregateBeforeLoss = getBusinessAggregateBeforeLoss(person.businesses ?? [], params);
  const aggregateIncome = salariesAssessableIncome + propertyNav + Math.max(0, businessAggregateBeforeLoss);

  lines.push(line(`${keyPrefix}.salariesAssessableIncome`, '薪俸應評稅入息', 'Salaries assessable income', salariesAssessableIncome, 'income'));
  lines.push(line(`${keyPrefix}.propertyNav`, '物業應評稅淨值', 'Property net assessable value', propertyNav, 'income'));
  // IRO s.42: PA starts from total income including assessable profits. ProfitsComputation
  // exposes post-loss assessableProfits, so PA intentionally reads each business line
  // `assessable-profits-before-loss` to use the current-year figure after capital
  // allowances but before brought-forward losses are applied at profits-tax level.
  lines.push(line(`${keyPrefix}.businessAssessableProfitsBeforeLoss`, '扣除承前虧損前的應評稅利潤', 'Assessable profits before brought-forward loss', Math.max(0, businessAggregateBeforeLoss), 'income'));
  lines.push(line(`${keyPrefix}.aggregateIncome`, '個人入息課稅入息總額', 'Personal Assessment aggregate income', aggregateIncome, 'subtotal'));

  // IRD PA deductions / IRO s.42: interest payable on money borrowed to produce rental
  // income is deductible, capped separately by that let property's NAV.
  const letPropertyMortgageInterestDeducted = applyLetPropertyMortgageInterest(
    lines,
    keyPrefix,
    person.letPropertyMortgageInterest ?? [],
    propertyNavById,
  );

  let reducedIncome = Math.max(0, aggregateIncome - letPropertyMortgageInterestDeducted);
  lines.push(line(`${keyPrefix}.afterLetPropertyInterest`, '扣除出租物業按揭利息後入息', 'Income after let-property mortgage interest', reducedIncome, 'subtotal'));

  // PA brought-forward loss is a separate taxpayer-level pool accumulated only
  // through Personal Assessment years. BusinessInput.lossBroughtForward is a
  // per-business profits-tax pool and must not be consumed by PA.
  const currentYearBusinessLoss = Math.max(0, -businessAggregateBeforeLoss);
  const paLossBroughtForward = Math.max(0, person.paLossBroughtForward ?? 0);
  const currentYearBusinessLossDeducted = Math.min(reducedIncome, currentYearBusinessLoss);
  reducedIncome -= currentYearBusinessLossDeducted;
  const paLossBroughtForwardDeducted = Math.min(reducedIncome, paLossBroughtForward);
  reducedIncome -= paLossBroughtForwardDeducted;
  const residualPaLoss = currentYearBusinessLoss + paLossBroughtForward - currentYearBusinessLossDeducted - paLossBroughtForwardDeducted;

  if (currentYearBusinessLossDeducted > 0) {
    lines.push(line(`${keyPrefix}.currentYearBusinessLoss`, '本年度業務虧損', 'Current-year business loss', currentYearBusinessLossDeducted, 'deduction'));
  }
  if (paLossBroughtForwardDeducted > 0) {
    lines.push(line(`${keyPrefix}.paLossBroughtForward`, '個人入息課稅承前虧損', 'Personal Assessment loss brought forward', paLossBroughtForwardDeducted, 'deduction'));
  }
  if (residualPaLoss > 0) {
    lines.push(line(`${keyPrefix}.residualPaLoss`, '未吸收並假設可結轉的個人入息課稅虧損', 'Unabsorbed Personal Assessment loss assumed carried forward', residualPaLoss, 'info'));
  }
  lines.push(line(`${keyPrefix}.beforeConcessionaryDeductions`, '扣除業務虧損後入息', 'Income after business losses', reducedIncome, 'subtotal'));

  const netAssessableIncomeBeforeConcessionaryDeductions = reducedIncome;
  const concessionaryDeductions = applyConcessionaryDeductions(
    lines,
    keyPrefix,
    reducedIncome,
    getDeductions(person),
    params,
  );
  const netAssessableIncomeBeforeFloor = concessionaryDeductions.netAssessableIncomeBeforeFloor - residualPaLoss;

  return {
    lines,
    salariesAssessableIncome,
    propertyNav,
    businessAggregateBeforeLoss,
    aggregateIncome,
    letPropertyMortgageInterestDeducted,
    currentYearBusinessLossDeducted,
    paLossBroughtForwardDeducted,
    residualPaLoss,
    netAssessableIncomeBeforeConcessionaryDeductions,
    netAssessableIncomeBeforeFloor,
    netAssessableIncome: concessionaryDeductions.netAssessableIncome,
  };
}

function getDeductions(person: PAPersonInput): SalariesInput['deductions'] {
  return person.deductions ?? person.salaries?.deductions ?? {};
}

function getSalariesAssessableIncome(input: SalariesInput | undefined, params: TaxYearParams): number {
  if (!input) {
    return 0;
  }

  const salaries = computeSalariesTax(input, params);
  return amountFromLines(salaries.lines, 'assessableIncome');
}

function getBusinessAggregateBeforeLoss(businesses: BusinessInput[], params: TaxYearParams): number {
  if (businesses.length === 0) {
    return 0;
  }

  const profits = computeProfitsTax(businesses, params);
  return profits.perBusiness.reduce((sum, business) => sum + amountFromLines(business.lines, 'assessable-profits-before-loss'), 0);
}

function amountFromLines(lines: ComputationLine[], key: string): number {
  const found = lines.find((item) => item.key === key);
  if (!found) {
    throw new Error(`Missing computation line ${key}`);
  }
  return found.amount;
}

function applyLetPropertyMortgageInterest(
  lines: ComputationLine[],
  keyPrefix: string,
  inputs: { propertyId: string; interest: number }[],
  propertyNavById: Map<string, number>,
): number {
  const requestedByPropertyId = new Map<string, number>();

  for (const item of inputs) {
    const requested = Math.max(0, item.interest);
    requestedByPropertyId.set(item.propertyId, (requestedByPropertyId.get(item.propertyId) ?? 0) + requested);
  }

  let totalDeducted = 0;

  requestedByPropertyId.forEach((requested, propertyId) => {
    const propertyNav = Math.max(0, propertyNavById.get(propertyId) ?? 0);
    const deducted = Math.min(requested, propertyNav);

    if (deducted > 0) {
      lines.push(line(`${keyPrefix}.letPropertyMortgageInterest.${propertyId}`, '出租物業按揭利息', 'Let-property mortgage interest', deducted, 'deduction'));
    }
    if (requested > propertyNav) {
      lines.push(line(
        `${keyPrefix}.letPropertyMortgageInterest.${propertyId}.excess`,
        '出租物業按揭利息超出該物業應評稅淨值',
        'Let-property mortgage interest exceeds that property net assessable value',
        requested - propertyNav,
        'info',
      ));
    }

    totalDeducted += deducted;
  });

  return totalDeducted;
}

function applyConcessionaryDeductions(
  lines: ComputationLine[],
  keyPrefix: string,
  income: number,
  deductions: SalariesInput['deductions'],
  params: TaxYearParams,
): ConcessionaryDeductionResult {
  let netIncome = income;

  netIncome -= applyCappedDeduction(lines, keyPrefix, 'selfEducation', '個人進修開支', 'Self-education expenses', deductions?.selfEducation ?? 0, params.deductionCaps.selfEducation);
  const donationBase = Math.max(0, income);
  netIncome -= applyDonationDeduction(lines, keyPrefix, deductions?.charitableDonations ?? 0, donationBase, params);
  netIncome -= applyCappedDeduction(lines, keyPrefix, 'elderlyCare', '長者住宿照顧開支', 'Elderly residential care expenses', deductions?.elderlyCare ?? 0, params.deductionCaps.elderlyCare);
  netIncome -= applyHousingDeduction(lines, keyPrefix, deductions, params);
  netIncome -= applyCappedDeduction(lines, keyPrefix, 'mpfMandatory', '強制性強積金供款', 'Mandatory MPF contributions', deductions?.mpfMandatory ?? 0, params.deductionCaps.mpfMandatory);
  netIncome -= applyCappedDeduction(lines, keyPrefix, 'annuityAndTvc', '合資格延期年金保費及可扣稅強積金自願性供款', 'Qualifying annuity premiums and tax deductible voluntary contributions', deductions?.annuityAndTvc ?? 0, params.deductionCaps.annuityAndTvc);
  netIncome -= applyCappedDeduction(lines, keyPrefix, 'vhis', '自願醫保計劃保費', 'VHIS premiums', deductions?.vhisPremiums ?? 0, params.deductionCaps.vhisPerPerson * Math.max(0, deductions?.vhisInsuredPersons ?? 0));
  netIncome -= applyCappedDeduction(lines, keyPrefix, 'assistedReproduction', '輔助生育服務開支', 'Assisted reproduction expenses', deductions?.assistedReproduction ?? 0, params.deductionCaps.assistedReproduction);

  const netAssessableIncomeBeforeFloor = netIncome;
  const netAssessableIncome = Math.max(0, netIncome);
  lines.push(line(`${keyPrefix}.netAssessableIncome`, '入息實額', 'Net assessable income', netAssessableIncome, 'subtotal'));
  return { netAssessableIncomeBeforeFloor, netAssessableIncome };
}

function applyCappedDeduction(
  lines: ComputationLine[],
  keyPrefix: string,
  key: string,
  labelZh: string,
  labelEn: string,
  amount: number,
  cap: number,
): number {
  const requested = Math.max(0, amount);
  const deducted = Math.min(requested, cap);

  if (deducted > 0) {
    lines.push(line(`${keyPrefix}.deduction.${key}`, labelZh, labelEn, deducted, 'deduction'));
  }
  if (requested > cap) {
    lines.push(line(`${keyPrefix}.deduction.${key}.excess`, `${labelZh}超出可扣除上限`, `${labelEn} excess disallowed`, requested - cap, 'info'));
  }

  return deducted;
}

function applyDonationDeduction(
  lines: ComputationLine[],
  keyPrefix: string,
  amount: number,
  donationBase: number,
  params: TaxYearParams,
): number {
  const requested = Math.max(0, amount);
  if (requested > 0 && requested < MINIMUM_QUALIFYING_DONATION) {
    lines.push(line(`${keyPrefix}.deduction.charitableDonations.minimum`, '認可慈善捐款少於最低合資格金額', 'Approved charitable donations below the minimum qualifying amount are not deductible', requested, 'info'));
    return 0;
  }

  return applyCappedDeduction(
    lines,
    keyPrefix,
    'charitableDonations',
    '認可慈善捐款',
    'Approved charitable donations',
    requested,
    multiplyByRate(donationBase, params.deductionCaps.donationsPercent),
  );
}

function applyHousingDeduction(
  lines: ComputationLine[],
  keyPrefix: string,
  deductions: SalariesInput['deductions'],
  params: TaxYearParams,
): number {
  const homeLoanInterest = deductionAmount(deductions?.homeLoanInterest);
  const domesticRent = deductionAmount(deductions?.domesticRent);

  if (homeLoanInterest > 0 && domesticRent > 0) {
    throw new Error('Home loan interest and domestic rent are mutually exclusive deductions for the same year.');
  }

  if (homeLoanInterest > 0) {
    const cap = deductionEligibleForElevatedCap(deductions?.homeLoanInterest)
      ? params.deductionCaps.homeLoanInterestElevated
      : params.deductionCaps.homeLoanInterest;
    return applyCappedDeduction(lines, keyPrefix, 'homeLoanInterest', '居所貸款利息', 'Home loan interest', homeLoanInterest, cap);
  }

  const cap = deductionEligibleForElevatedCap(deductions?.domesticRent)
    ? params.deductionCaps.domesticRentElevated
    : params.deductionCaps.domesticRent;
  return applyCappedDeduction(lines, keyPrefix, 'domesticRent', '住宅租金', 'Domestic rent', domesticRent, cap);
}

function deductionAmount(input: HousingDeductionInput): number {
  return typeof input === 'number' ? input : input?.amount ?? 0;
}

function deductionEligibleForElevatedCap(input: HousingDeductionInput): boolean {
  return typeof input === 'number' ? false : Boolean(input?.eligibleForElevatedCap);
}

type HousingDeductionInput =
  | number
  | HomeLoanInterestDeductionInput
  | DomesticRentDeductionInput
  | undefined;

function computeAllowances(
  allowanceInput: SalariesInput['allowances'] | SharedAllowanceInput,
  params: TaxYearParams,
  forceMarriedAllowance: boolean,
): AllowanceResult {
  const lines: ComputationLine[] = [];
  let total = 0;
  const allowances = allowanceInput ?? {};
  const individualAllowanceInput = allowances as SalariesInput['allowances'];
  // IRO s.29(1), as amended, also denies MPA where the person's spouse has
  // elected PA separately. buildCoupleScenarios in optimizer.ts enforces that
  // cross-spouse election rule; this allowance layer only renders the
  // claimMarriedAllowance flag supplied by the active scenario.
  const claimsMarriedAllowance = forceMarriedAllowance
    || Boolean(individualAllowanceInput?.isMarried && individualAllowanceInput.claimMarriedAllowance);

  if (claimsMarriedAllowance) {
    total += params.allowances.married;
    lines.push(line('allowance.married', '已婚人士免稅額', 'Married person allowance', params.allowances.married, 'allowance'));
  } else {
    total += params.allowances.basic;
    lines.push(line('allowance.basic', '基本免稅額', 'Basic allowance', params.allowances.basic, 'allowance'));
  }

  const children = allowances.children ?? [];
  const qualifyingChildren = children.slice(0, CHILD_ALLOWANCE_MAX_COUNT);
  const childAllowance = qualifyingChildren.length * params.allowances.child;
  const newbornAllowance = qualifyingChildren.filter((child) => child.bornInCurrentYear).length * params.allowances.childNewbornExtra;
  if (childAllowance > 0) {
    total += childAllowance;
    lines.push(line('allowance.child', '子女免稅額', 'Child allowance', childAllowance, 'allowance'));
  }
  if (newbornAllowance > 0) {
    total += newbornAllowance;
    lines.push(line('allowance.childNewbornExtra', '子女出生年度額外免稅額', 'Child allowance extra amount for year of birth', newbornAllowance, 'allowance'));
  }
  if (children.length > CHILD_ALLOWANCE_MAX_COUNT) {
    lines.push(line('allowance.child.excessCount', '超出可申索子女人數上限', 'Children above the statutory claim count are not allowed', children.length - CHILD_ALLOWANCE_MAX_COUNT, 'info'));
  }

  (allowances.parents ?? []).forEach((parent, index) => {
    const parentAllowance = parentAllowanceAmount(parent, params);
    if (parentAllowance <= 0) {
      return;
    }

    total += parentAllowance;
    lines.push(line(`allowance.parent.${parent.key ?? index}`, '供養父母或祖父母免稅額', 'Dependent parent or grandparent allowance', parentAllowance, 'allowance'));
  });

  const siblingAllowance = Math.max(0, allowances.siblingCount ?? 0) * params.allowances.sibling;
  if (siblingAllowance > 0) {
    total += siblingAllowance;
    lines.push(line('allowance.sibling', '供養兄弟姊妹免稅額', 'Dependent sibling allowance', siblingAllowance, 'allowance'));
  }

  if (!claimsMarriedAllowance && allowances.singleParent) {
    total += params.allowances.singleParent;
    lines.push(line('allowance.singleParent', '單親免稅額', 'Single parent allowance', params.allowances.singleParent, 'allowance'));
  }

  const disabledDependantAllowance = Math.max(0, allowances.disabledDependantCount ?? 0) * params.allowances.disabledDependant;
  if (disabledDependantAllowance > 0) {
    total += disabledDependantAllowance;
    lines.push(line('allowance.disabledDependant', '傷殘受養人免稅額', 'Disabled dependant allowance', disabledDependantAllowance, 'allowance'));
  }

  const sharedAllowanceInput = allowances as SharedAllowanceInput;
  const personalDisabilityCount = forceMarriedAllowance
    ? Math.max(0, sharedAllowanceInput.personalDisabilityCount ?? 0)
    : (individualAllowanceInput?.personalDisability ? 1 : 0);
  const personalDisabilityAllowance = personalDisabilityCount * params.allowances.personalDisability;
  if (personalDisabilityAllowance > 0) {
    total += personalDisabilityAllowance;
    lines.push(line('allowance.personalDisability', '個人傷殘免稅額', 'Personal disability allowance', personalDisabilityAllowance, 'allowance'));
  }

  lines.push(line('allowance.total', '免稅額總額', 'Total allowances', total, 'subtotal'));
  return { lines, total };
}

function parentAllowanceAmount(parent: ParentAllowanceInput, params: TaxYearParams): number {
  if (parent.age >= 60) {
    return params.allowances.parentAged60 + (parent.residedWithTaxpayer ? params.allowances.parentResidingExtra60 : 0);
  }
  if (parent.age >= 55) {
    return params.allowances.parentAged55 + (parent.residedWithTaxpayer ? params.allowances.parentResidingExtra55 : 0);
  }
  return 0;
}

function computeTaxFigures(
  netChargeableIncome: number,
  netAssessableIncome: number,
  params: TaxYearParams,
  keyPrefix: string,
): TaxFigureResult {
  const progressive = applyBands(netChargeableIncome, params.progressiveBands, `${keyPrefix}.progressive`, '累進稅率', 'Progressive tax');
  const standard = applyBands(netAssessableIncome, params.standardRateTiers, `${keyPrefix}.standard`, '標準稅率', 'Standard rate tax');
  const basisUsed: Computation['basisUsed'] = progressive.tax <= standard.tax ? 'progressive' : 'standard';
  const taxBeforeReduction = basisUsed === 'progressive' ? progressive.tax : standard.tax;
  const reduction = params.taxReduction.appliesTo.includes('pa')
    ? Math.min(multiplyByRate(taxBeforeReduction, params.taxReduction.percent), params.taxReduction.cap)
    : 0;
  const finalTax = Math.max(Math.floor(taxBeforeReduction - reduction), 0);

  return {
    lines: [
      ...progressive.lines,
      line(`${keyPrefix}.tax.progressive.total`, '按累進稅率計算的稅款', 'Tax at progressive rates', progressive.tax, 'tax'),
      ...standard.lines,
      line(`${keyPrefix}.tax.standard.total`, '按標準稅率計算的稅款', 'Tax at standard rates', standard.tax, 'tax'),
      line(
        `${keyPrefix}.tax.basisUsed`,
        basisUsed === 'progressive' ? '採用累進稅率' : '採用標準稅率',
        basisUsed === 'progressive' ? 'Progressive basis used' : 'Standard rate basis used',
        taxBeforeReduction,
        'info',
      ),
      line(`${keyPrefix}.tax.reduction`, '稅款寬減', 'Tax reduction', reduction, 'tax'),
      line(`${keyPrefix}.tax.final`, '應繳稅款', 'Final tax', finalTax, 'tax'),
    ],
    taxAtProgressive: progressive.tax,
    taxAtStandard: standard.tax,
    basisUsed,
    taxBeforeReduction,
    reduction,
    finalTax,
  };
}

function applyBands(
  amount: number,
  bands: TaxBand[],
  keyPrefix: string,
  labelPrefixZh: string,
  labelPrefixEn: string,
): { tax: number; lines: ComputationLine[] } {
  const lines: ComputationLine[] = [];
  let remaining = Math.max(0, amount);
  let tax = 0;

  bands.forEach((band, index) => {
    if (remaining <= 0) {
      return;
    }

    const taxableAtBand = band.width === null ? remaining : Math.min(remaining, band.width);
    const taxAtBand = multiplyByRate(taxableAtBand, band.rate);
    tax += taxAtBand;
    remaining -= taxableAtBand;
    lines.push(line(`tax.${keyPrefix}.band${index + 1}`, `${labelPrefixZh}第${index + 1}級`, `${labelPrefixEn} band ${index + 1}`, taxAtBand, 'tax'));
  });

  return { tax, lines };
}

function apportionJointTax(aNai: number, bNai: number, finalTax: number): JointPAComputation['perSpouse'] {
  const combined = Math.max(0, aNai + bNai);
  if (combined <= 0 || finalTax <= 0) {
    return {
      a: { netAssessableIncome: aNai, shareOfCombinedNai: 0, shareOfTax: 0 },
      b: { netAssessableIncome: bNai, shareOfCombinedNai: 0, shareOfTax: 0 },
    };
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

  return {
    a: { netAssessableIncome: aNai, shareOfCombinedNai: aShare, shareOfTax: aTax },
    b: { netAssessableIncome: bNai, shareOfCombinedNai: bShare, shareOfTax: bTax },
  };
}

function prefixLines(lines: ComputationLine[], prefix: string, labelPrefixZh: string, labelPrefixEn: string): ComputationLine[] {
  return lines.map((item) => ({
    ...item,
    key: `${prefix}.${item.key}`,
    labelZh: `${labelPrefixZh}：${item.labelZh}`,
    labelEn: `${labelPrefixEn}: ${item.labelEn}`,
  }));
}

function line(
  key: string,
  labelZh: string,
  labelEn: string,
  amount: number,
  kind: ComputationLine['kind'],
): ComputationLine {
  return { key, labelZh, labelEn, amount, kind };
}

function multiplyByRate(amount: number, rate: number): number {
  const text = rate.toString();
  if (!text.includes('.')) {
    return amount * rate;
  }

  const decimals = text.split('.')[1]?.length ?? 0;
  const denominator = 10 ** decimals;
  const numerator = Number(text.replace('.', ''));
  return (amount * numerator) / denominator;
}
