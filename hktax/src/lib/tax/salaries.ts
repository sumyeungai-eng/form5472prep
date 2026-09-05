import type { Computation, ComputationLine, TaxBand, TaxYearParams } from './types';

export interface MoneyItem {
  key: string;
  labelZh: string;
  labelEn: string;
  amount: number;
}

export interface LumpSumRelateBackElection {
  elected: boolean;
  months: number;
  currentYearMonths: number;
}

export interface IncomeItem extends MoneyItem {
  relateBack?: LumpSumRelateBackElection;
}

export type AccommodationType = 'residence' | 'twoRoomHotel' | 'oneRoomHotel';

export interface EmployerAccommodationInput {
  key: string;
  labelZh: string;
  labelEn: string;
  type: AccommodationType;
  employerAssessableIncomeBeforeAccommodation: number;
  employerOutgoingsAndExpenses?: number;
  rateableValueElection?: number;
}

export interface ChildAllowanceInput {
  key?: string;
  bornInCurrentYear?: boolean;
}

export interface ParentAllowanceInput {
  key?: string;
  age: number;
  residedWithTaxpayer?: boolean;
}

export interface HomeLoanInterestDeductionInput {
  amount: number;
  eligibleForElevatedCap?: boolean;
}

export interface DomesticRentDeductionInput {
  amount: number;
  eligibleForElevatedCap?: boolean;
}

export interface SalariesInput {
  incomeItems: IncomeItem[];
  outgoingsAndExpenses?: MoneyItem[];
  depreciationAllowances?: MoneyItem[];
  employerAccommodation?: EmployerAccommodationInput[];
  deductions?: {
    selfEducation?: number;
    charitableDonations?: number;
    elderlyCare?: number;
    homeLoanInterest?: number | HomeLoanInterestDeductionInput;
    domesticRent?: number | DomesticRentDeductionInput;
    mpfMandatory?: number;
    annuityAndTvc?: number;
    vhisPremiums?: number;
    vhisInsuredPersons?: number;
    assistedReproduction?: number;
  };
  allowances?: {
    isMarried?: boolean;
    claimMarriedAllowance?: boolean;
    children?: ChildAllowanceInput[];
    parents?: ParentAllowanceInput[];
    siblingCount?: number;
    singleParent?: boolean;
    disabledDependantCount?: number;
    personalDisability?: boolean;
  };
}

export interface SharedAllowanceInput {
  children?: ChildAllowanceInput[];
  parents?: ParentAllowanceInput[];
  siblingCount?: number;
  singleParent?: boolean;
  disabledDependantCount?: number;
  personalDisabilityCount?: number;
}

export interface JointComputation extends Computation {
  combinedNetAssessableIncome: number;
  perSpouse: {
    a: { netAssessableIncome: number; shareOfCombinedNai: number; shareOfTax: number };
    b: { netAssessableIncome: number; shareOfCombinedNai: number; shareOfTax: number };
  };
}

interface IncomeAndDeductionResult {
  lines: ComputationLine[];
  assessableIncome: number;
  netAssessableIncomeBeforeFloor: number;
  netAssessableIncome: number;
}

interface AllowanceResult {
  lines: ComputationLine[];
  total: number;
}

const RENTAL_VALUE_RATES: Record<AccommodationType, number> = {
  residence: 0.10,
  twoRoomHotel: 0.08,
  oneRoomHotel: 0.04,
};

const MAX_RELATE_BACK_MONTHS = 36;
const MINIMUM_QUALIFYING_DONATION = 100;
const CHILD_ALLOWANCE_MAX_COUNT = 9;

export function computeSalariesTax(input: SalariesInput, params: TaxYearParams): Computation {
  assertFiniteSalariesInput(input);

  const incomeAndDeductions = computeIncomeAndDeductions(input, params);
  const allowances = computeAllowances(input.allowances ?? {}, params, false);
  const netChargeableIncome = Math.max(0, incomeAndDeductions.netAssessableIncome - allowances.total);
  const tax = computeTaxFigures(netChargeableIncome, incomeAndDeductions.netAssessableIncome, params);

  return {
    head: 'salaries',
    lines: [
      ...incomeAndDeductions.lines,
      ...allowances.lines,
      line('netChargeableIncome', '應課稅入息實額', 'Net chargeable income', netChargeableIncome, 'subtotal'),
      ...tax.lines,
    ],
    netAssessableIncome: incomeAndDeductions.netAssessableIncome,
    netChargeableIncome,
    taxAtProgressive: tax.taxAtProgressive,
    taxAtStandard: tax.taxAtStandard,
    basisUsed: tax.basisUsed,
    taxBeforeReduction: tax.taxBeforeReduction,
    reduction: tax.reduction,
    finalTax: tax.finalTax,
  };
}

export function computeJointAssessment(
  a: SalariesInput,
  b: SalariesInput,
  shared: SharedAllowanceInput,
  params: TaxYearParams,
): JointComputation {
  assertFiniteSalariesInput(a, 'a');
  assertFiniteSalariesInput(b, 'b');
  assertFiniteSharedAllowances(shared, 'shared');

  const spouseA = computeIncomeAndDeductions(a, params);
  const spouseB = computeIncomeAndDeductions(b, params);
  const combinedNetAssessableIncome = Math.max(
    0,
    spouseA.netAssessableIncomeBeforeFloor + spouseB.netAssessableIncomeBeforeFloor,
  );
  const allowances = computeAllowances(shared, params, true);
  const netChargeableIncome = Math.max(0, combinedNetAssessableIncome - allowances.total);
  const tax = computeTaxFigures(netChargeableIncome, combinedNetAssessableIncome, params);
  const perSpouse = apportionJointTax(spouseA.netAssessableIncome, spouseB.netAssessableIncome, tax.finalTax);

  return {
    head: 'salaries',
    lines: [
      ...prefixLines(spouseA.lines, 'spouseA', '配偶甲', 'Spouse A'),
      line('spouseA.nai', '配偶甲入息實額', 'Spouse A net assessable income', spouseA.netAssessableIncome, 'subtotal'),
      ...prefixLines(spouseB.lines, 'spouseB', '配偶乙', 'Spouse B'),
      line('spouseB.nai', '配偶乙入息實額', 'Spouse B net assessable income', spouseB.netAssessableIncome, 'subtotal'),
      line('joint.combinedNai', '合併入息實額', 'Combined net assessable income', combinedNetAssessableIncome, 'subtotal'),
      ...allowances.lines,
      line('joint.netChargeableIncome', '合併應課稅入息實額', 'Combined net chargeable income', netChargeableIncome, 'subtotal'),
      ...tax.lines,
      line('joint.apportionment.a', '配偶甲分攤稅款', 'Spouse A apportioned tax', perSpouse.a.shareOfTax, 'tax'),
      line('joint.apportionment.b', '配偶乙分攤稅款', 'Spouse B apportioned tax', perSpouse.b.shareOfTax, 'tax'),
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

function computeIncomeAndDeductions(
  input: SalariesInput,
  params: TaxYearParams,
): IncomeAndDeductionResult {
  assertHousingDeductionChoice(input);

  const lines: ComputationLine[] = [];
  let incomeTotal = 0;

  for (const item of input.incomeItems) {
    const amount = includedIncomeAmount(item);
    incomeTotal += amount;
    lines.push(line(`income.${item.key}`, item.labelZh, item.labelEn, amount, 'income'));

    if (item.relateBack?.elected) {
      const relatedBack = Math.max(0, item.amount - amount);
      lines.push(line(
        `income.${item.key}.relateBack`,
        `${item.labelZh}按有關期間撥回`,
        `${item.labelEn} related back to prior years`,
        relatedBack,
        'info',
      ));
      lines.push(line(
        `income.${item.key}.relateBackNote`,
        '以不超過三十六個月平均攤分；過往課稅年度須另行重新評稅',
        'Spread evenly over the elected period; prior years are reassessed separately outside this engine',
        relatedBack,
        'info',
      ));
    }
  }

  const outgoings = sumMoneyItems(input.outgoingsAndExpenses ?? [], lines, 'outgoings');
  const depreciation = sumMoneyItems(input.depreciationAllowances ?? [], lines, 'depreciation');
  const assessableBeforeAccommodation = incomeTotal - outgoings - depreciation;
  const rentalValue = computeRentalValue(input.employerAccommodation ?? [], lines);
  const assessableIncome = assessableBeforeAccommodation + rentalValue;

  lines.push(line('assessableIncome', '應評稅入息', 'Assessable income', assessableIncome, 'subtotal'));

  let netIncome = assessableIncome;
  netIncome -= applyCappedDeduction(
    lines,
    'selfEducation',
    '個人進修開支',
    'Self-education expenses',
    input.deductions?.selfEducation ?? 0,
    params.deductionCaps.selfEducation,
  );

  const donationBase = Math.max(0, assessableIncome);
  netIncome -= applyDonationDeduction(lines, input.deductions?.charitableDonations ?? 0, donationBase, params);
  netIncome -= applyCappedDeduction(
    lines,
    'elderlyCare',
    '長者住宿照顧開支',
    'Elderly residential care expenses',
    input.deductions?.elderlyCare ?? 0,
    params.deductionCaps.elderlyCare,
  );
  netIncome -= applyHousingDeduction(lines, input, params);
  netIncome -= applyCappedDeduction(
    lines,
    'mpfMandatory',
    '強制性強積金供款',
    'Mandatory MPF contributions',
    input.deductions?.mpfMandatory ?? 0,
    params.deductionCaps.mpfMandatory,
  );
  netIncome -= applyCappedDeduction(
    lines,
    'annuityAndTvc',
    '合資格延期年金保費及可扣稅強積金自願性供款',
    'Qualifying annuity premiums and tax-deductible MPF voluntary contributions',
    input.deductions?.annuityAndTvc ?? 0,
    params.deductionCaps.annuityAndTvc,
  );
  netIncome -= applyCappedDeduction(
    lines,
    'vhis',
    '自願醫保計劃保費',
    'VHIS premiums',
    input.deductions?.vhisPremiums ?? 0,
    params.deductionCaps.vhisPerPerson * getVhisInsuredPersons(input.deductions?.vhisPremiums, input.deductions?.vhisInsuredPersons),
  );
  netIncome -= applyCappedDeduction(
    lines,
    'assistedReproduction',
    '輔助生育服務開支',
    'Assisted reproduction expenses',
    input.deductions?.assistedReproduction ?? 0,
    params.deductionCaps.assistedReproduction,
  );

  const netAssessableIncomeBeforeFloor = netIncome;
  const netAssessableIncome = Math.max(0, netIncome);
  lines.push(line('netAssessableIncome', '入息實額', 'Net assessable income', netAssessableIncome, 'subtotal'));

  return { lines, assessableIncome, netAssessableIncomeBeforeFloor, netAssessableIncome };
}

function includedIncomeAmount(item: IncomeItem): number {
  if (!item.relateBack?.elected) {
    return item.amount;
  }

  const { months, currentYearMonths } = item.relateBack;
  if (months < 1 || months > MAX_RELATE_BACK_MONTHS) {
    throw new Error(`Lump-sum relate-back period must be between 1 and ${MAX_RELATE_BACK_MONTHS} months.`);
  }
  if (currentYearMonths < 0 || currentYearMonths > months) {
    throw new Error('Current-year months for lump-sum relate-back must be between 0 and the total months.');
  }

  return item.amount * (currentYearMonths / months);
}

function sumMoneyItems(items: MoneyItem[], lines: ComputationLine[], keyPrefix: string): number {
  let total = 0;
  for (const item of items) {
    total += item.amount;
    lines.push(line(`${keyPrefix}.${item.key}`, item.labelZh, item.labelEn, item.amount, 'deduction'));
  }
  return total;
}

function computeRentalValue(items: EmployerAccommodationInput[], lines: ComputationLine[]): number {
  let total = 0;

  for (const item of items) {
    const base = Math.max(0, item.employerAssessableIncomeBeforeAccommodation - (item.employerOutgoingsAndExpenses ?? 0));
    const computedRentalValue = multiplyByRate(base, RENTAL_VALUE_RATES[item.type]);
    // IRD employer-provided accommodation rental value rules under the s.9(1)(b)/(c) framework:
    // residence/flat uses 10%, two-room hotel etc. 8%, one-room hotel etc. 4%; only a residence may elect lower rateable value.
    const electedRentalValue = item.type === 'residence' && item.rateableValueElection !== undefined
      ? Math.min(computedRentalValue, item.rateableValueElection)
      : computedRentalValue;

    total += electedRentalValue;
    lines.push(line(`rentalValue.${item.key}`, item.labelZh, item.labelEn, electedRentalValue, 'income'));

    if (item.type !== 'residence' && item.rateableValueElection !== undefined) {
      lines.push(line(
        `rentalValue.${item.key}.electionIgnored`,
        '酒店、旅舍或寄宿舍不可選用應課差餉租值',
        'Rateable-value election is not available for hotel, hostel, or boarding house accommodation',
        item.rateableValueElection,
        'info',
      ));
    }
  }

  return total;
}

function applyCappedDeduction(
  lines: ComputationLine[],
  key: string,
  labelZh: string,
  labelEn: string,
  amount: number,
  cap: number,
): number {
  const requested = Math.max(0, amount);
  const deducted = Math.min(requested, cap);

  if (deducted > 0) {
    lines.push(line(`deduction.${key}`, labelZh, labelEn, deducted, 'deduction'));
  }
  if (requested > cap) {
    lines.push(line(
      `deduction.${key}.excess`,
      `${labelZh}超出可扣除上限`,
      `${labelEn} excess disallowed`,
      requested - cap,
      'info',
    ));
  }

  return deducted;
}

function applyDonationDeduction(
  lines: ComputationLine[],
  amount: number,
  donationBase: number,
  params: TaxYearParams,
): number {
  const requested = Math.max(0, amount);
  if (requested > 0 && requested < MINIMUM_QUALIFYING_DONATION) {
    lines.push(line(
      'deduction.charitableDonations.minimum',
      '認可慈善捐款少於最低合資格金額，不可扣除',
      'Approved charitable donations below the minimum qualifying amount are not deductible',
      requested,
      'info',
    ));
    return 0;
  }

  const cap = multiplyByRate(donationBase, params.deductionCaps.donationsPercent);
  return applyCappedDeduction(
    lines,
    'charitableDonations',
    '認可慈善捐款',
    'Approved charitable donations',
    requested,
    cap,
  );
}

function applyHousingDeduction(
  lines: ComputationLine[],
  input: SalariesInput,
  params: TaxYearParams,
): number {
  const homeLoanInterest = deductionAmount(input.deductions?.homeLoanInterest);
  const domesticRent = deductionAmount(input.deductions?.domesticRent);

  if (homeLoanInterest > 0) {
    // Elevated cap applies when the taxpayer resides with their first child, and that first child was born
    // on or after 25 Oct 2023. The interview UI determines eligibility; this engine trusts the input flag.
    const cap = deductionEligibleForElevatedCap(input.deductions?.homeLoanInterest)
      ? params.deductionCaps.homeLoanInterestElevated
      : params.deductionCaps.homeLoanInterest;

    return applyCappedDeduction(
      lines,
      'homeLoanInterest',
      '居所貸款利息',
      'Home loan interest',
      homeLoanInterest,
      cap,
    );
  }

  // Elevated cap applies when the taxpayer resides with their first child, and that first child was born
  // on or after 25 Oct 2023. The interview UI determines eligibility; this engine trusts the input flag.
  const domesticRentCap = deductionEligibleForElevatedCap(input.deductions?.domesticRent)
    ? params.deductionCaps.domesticRentElevated
    : params.deductionCaps.domesticRent;

  return applyCappedDeduction(
    lines,
    'domesticRent',
    '住宅租金',
    'Domestic rent',
    domesticRent,
    domesticRentCap,
  );
}

function assertHousingDeductionChoice(input: SalariesInput): void {
  if (deductionAmount(input.deductions?.homeLoanInterest) > 0 && deductionAmount(input.deductions?.domesticRent) > 0) {
    throw new Error('Home loan interest and domestic rent are mutually exclusive deductions for the same year.');
  }
}

function deductionAmount(input: number | HomeLoanInterestDeductionInput | DomesticRentDeductionInput | undefined): number {
  return typeof input === 'number' ? input : input?.amount ?? 0;
}

function deductionEligibleForElevatedCap(
  input: number | HomeLoanInterestDeductionInput | DomesticRentDeductionInput | undefined,
): boolean {
  return typeof input === 'number' ? false : Boolean(input?.eligibleForElevatedCap);
}

function getVhisInsuredPersons(premiums: number | undefined, insuredPersons: number | undefined): number {
  return Math.max(0, insuredPersons ?? (premiums !== undefined && premiums > 0 ? 1 : 0));
}

function computeAllowances(
  allowanceInput: SalariesInput['allowances'] | SharedAllowanceInput,
  params: TaxYearParams,
  forceMarriedAllowance: boolean,
): AllowanceResult {
  const lines: ComputationLine[] = [];
  let total = 0;
  const allowances = allowanceInput ?? {};
  const individualAllowanceInput = allowances as SalariesInput['allowances'];
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
  const newbornAllowance = qualifyingChildren.filter((child) => child.bornInCurrentYear).length
    * params.allowances.childNewbornExtra;
  if (childAllowance > 0) {
    total += childAllowance;
    lines.push(line('allowance.child', '子女免稅額', 'Child allowance', childAllowance, 'allowance'));
  }
  if (newbornAllowance > 0) {
    total += newbornAllowance;
    lines.push(line(
      'allowance.childNewbornExtra',
      '子女出生年度額外免稅額',
      'Child allowance extra amount for year of birth',
      newbornAllowance,
      'allowance',
    ));
  }
  if (children.length > CHILD_ALLOWANCE_MAX_COUNT) {
    lines.push(line(
      'allowance.child.excessCount',
      '超出可申索子女人數上限',
      'Children above the statutory claim count are not allowed',
      children.length - CHILD_ALLOWANCE_MAX_COUNT,
      'info',
    ));
  }

  (allowances.parents ?? []).forEach((parent, index) => {
    const parentAllowance = parentAllowanceAmount(parent, params);
    if (parentAllowance <= 0) {
      return;
    }

    total += parentAllowance;
    lines.push(line(
      `allowance.parent.${parent.key ?? index}`,
      '供養父母或祖父母免稅額',
      'Dependent parent or grandparent allowance',
      parentAllowance,
      'allowance',
    ));
  });

  const siblingCount = Math.max(0, allowances.siblingCount ?? 0);
  const siblingAllowance = siblingCount * params.allowances.sibling;
  if (siblingAllowance > 0) {
    total += siblingAllowance;
    lines.push(line('allowance.sibling', '供養兄弟姊妹免稅額', 'Dependent sibling allowance', siblingAllowance, 'allowance'));
  }

  if (!claimsMarriedAllowance && allowances.singleParent && childAllowance > 0) {
    total += params.allowances.singleParent;
    lines.push(line('allowance.singleParent', '單親免稅額', 'Single parent allowance', params.allowances.singleParent, 'allowance'));
  }

  const disabledDependantCount = Math.max(0, allowances.disabledDependantCount ?? 0);
  const disabledDependantAllowance = disabledDependantCount * params.allowances.disabledDependant;
  if (disabledDependantAllowance > 0) {
    total += disabledDependantAllowance;
    lines.push(line(
      'allowance.disabledDependant',
      '傷殘受養人免稅額',
      'Disabled dependant allowance',
      disabledDependantAllowance,
      'allowance',
    ));
  }

  const sharedAllowanceInput = allowances as SharedAllowanceInput;
  const personalDisabilityCount = forceMarriedAllowance
    ? Math.max(0, sharedAllowanceInput.personalDisabilityCount ?? 0)
    : (individualAllowanceInput?.personalDisability ? 1 : 0);
  const personalDisabilityAllowance = personalDisabilityCount * params.allowances.personalDisability;
  if (personalDisabilityAllowance > 0) {
    total += personalDisabilityAllowance;
    lines.push(line(
      'allowance.personalDisability',
      '個人傷殘免稅額',
      'Personal disability allowance',
      personalDisabilityAllowance,
      'allowance',
    ));
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

function computeTaxFigures(netChargeableIncome: number, netAssessableIncome: number, params: TaxYearParams) {
  const progressive = applyBands(netChargeableIncome, params.progressiveBands, 'progressive', '累進稅率', 'Progressive tax');
  const standard = applyBands(netAssessableIncome, params.standardRateTiers, 'standard', '標準稅率', 'Standard rate tax');
  const basisUsed: Computation['basisUsed'] = progressive.tax <= standard.tax ? 'progressive' : 'standard';
  const taxBeforeReduction = basisUsed === 'progressive' ? progressive.tax : standard.tax;
  const reduction = params.taxReduction.appliesTo.includes('salaries')
    ? Math.min(multiplyByRate(taxBeforeReduction, params.taxReduction.percent), params.taxReduction.cap)
    : 0;
  const finalTax = Math.floor(taxBeforeReduction - reduction);

  return {
    lines: [
      ...progressive.lines,
      line('tax.progressive.total', '按累進稅率計算的稅款', 'Tax at progressive rates', progressive.tax, 'tax'),
      ...standard.lines,
      line('tax.standard.total', '按標準稅率計算的稅款', 'Tax at standard rates', standard.tax, 'tax'),
      line(
        'tax.basisUsed',
        basisUsed === 'progressive' ? '採用累進稅率' : '採用標準稅率',
        basisUsed === 'progressive' ? 'Progressive basis used' : 'Standard rate basis used',
        taxBeforeReduction,
        'info',
      ),
      line('tax.reduction', '稅款寬減', 'Tax reduction', reduction, 'tax'),
      line('tax.final', '應繳稅款', 'Final tax', finalTax, 'tax'),
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
    lines.push(line(
      `tax.${keyPrefix}.band${index + 1}`,
      `${labelPrefixZh}第${index + 1}級`,
      `${labelPrefixEn} band ${index + 1}`,
      taxAtBand,
      'tax',
    ));
  });

  return { tax, lines };
}

function apportionJointTax(aNai: number, bNai: number, finalTax: number): JointComputation['perSpouse'] {
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

function assertFiniteSalariesInput(input: SalariesInput, prefix = 'input'): void {
  input.incomeItems.forEach((item, index) => {
    assertFiniteNumber(item.amount, `${prefix}.incomeItems[${index}].amount`);
    if (item.relateBack !== undefined) {
      assertFiniteNumber(item.relateBack.months, `${prefix}.incomeItems[${index}].relateBack.months`);
      assertFiniteNumber(item.relateBack.currentYearMonths, `${prefix}.incomeItems[${index}].relateBack.currentYearMonths`);
    }
  });

  input.outgoingsAndExpenses?.forEach((item, index) => {
    assertFiniteNumber(item.amount, `${prefix}.outgoingsAndExpenses[${index}].amount`);
  });
  input.depreciationAllowances?.forEach((item, index) => {
    assertFiniteNumber(item.amount, `${prefix}.depreciationAllowances[${index}].amount`);
  });
  input.employerAccommodation?.forEach((item, index) => {
    assertFiniteNumber(
      item.employerAssessableIncomeBeforeAccommodation,
      `${prefix}.employerAccommodation[${index}].employerAssessableIncomeBeforeAccommodation`,
    );
    assertFiniteOptionalNumber(
      item.employerOutgoingsAndExpenses,
      `${prefix}.employerAccommodation[${index}].employerOutgoingsAndExpenses`,
    );
    assertFiniteOptionalNumber(item.rateableValueElection, `${prefix}.employerAccommodation[${index}].rateableValueElection`);
  });

  const deductions = input.deductions;
  if (deductions !== undefined) {
    assertFiniteOptionalNumber(deductions.selfEducation, `${prefix}.deductions.selfEducation`);
    assertFiniteOptionalNumber(deductions.charitableDonations, `${prefix}.deductions.charitableDonations`);
    assertFiniteOptionalNumber(deductions.elderlyCare, `${prefix}.deductions.elderlyCare`);
    assertFiniteDeductionInput(deductions.homeLoanInterest, `${prefix}.deductions.homeLoanInterest`);
    assertFiniteDeductionInput(deductions.domesticRent, `${prefix}.deductions.domesticRent`);
    assertFiniteOptionalNumber(deductions.mpfMandatory, `${prefix}.deductions.mpfMandatory`);
    assertFiniteOptionalNumber(deductions.annuityAndTvc, `${prefix}.deductions.annuityAndTvc`);
    assertFiniteOptionalNumber(deductions.vhisPremiums, `${prefix}.deductions.vhisPremiums`);
    assertFiniteOptionalNumber(deductions.vhisInsuredPersons, `${prefix}.deductions.vhisInsuredPersons`);
    assertFiniteOptionalNumber(deductions.assistedReproduction, `${prefix}.deductions.assistedReproduction`);
  }

  assertFiniteAllowanceInput(input.allowances, `${prefix}.allowances`);
}

function assertFiniteSharedAllowances(shared: SharedAllowanceInput, prefix: string): void {
  assertFiniteAllowanceInput(shared, prefix);
  assertFiniteOptionalNumber(shared.personalDisabilityCount, `${prefix}.personalDisabilityCount`);
}

function assertFiniteAllowanceInput(
  allowances: SalariesInput['allowances'] | SharedAllowanceInput | undefined,
  prefix: string,
): void {
  if (allowances === undefined) {
    return;
  }

  allowances.parents?.forEach((parent, index) => {
    assertFiniteNumber(parent.age, `${prefix}.parents[${index}].age`);
  });
  assertFiniteOptionalNumber(allowances.siblingCount, `${prefix}.siblingCount`);
  assertFiniteOptionalNumber(allowances.disabledDependantCount, `${prefix}.disabledDependantCount`);
}

function assertFiniteDeductionInput(
  input: number | HomeLoanInterestDeductionInput | DomesticRentDeductionInput | undefined,
  field: string,
): void {
  if (input === undefined) {
    return;
  }
  if (typeof input === 'number') {
    assertFiniteNumber(input, field);
    return;
  }
  assertFiniteNumber(input.amount, `${field}.amount`);
}

function assertFiniteOptionalNumber(value: number | undefined, field: string): void {
  if (value !== undefined) {
    assertFiniteNumber(value, field);
  }
}

function assertFiniteNumber(value: number, field: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
}
