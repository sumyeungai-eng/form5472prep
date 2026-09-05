import { getParams } from "../tax/params";
import { computeSalariesTax } from "../tax/salaries";
import type { Computation, TaxYearParams, YearOfAssessment } from "../tax/types";
import { mapWizardStateToFamilyScenarioInput } from "./mapping";
import type { WizardPersonId, WizardPersonState, WizardState } from "./wizardState";

export type WizardHintStep = "sourceDetails" | "family" | "deductions" | "review";
export type WizardHintKind = "opportunity" | "warning" | "info";

export interface WizardHint {
  id: string;
  step: WizardHintStep;
  kind: WizardHintKind;
  titleZh: string;
  titleEn: string;
  bodyZh: string;
  bodyEn: string;
  estimatedSavingHKD?: number;
}

type PersonHintBuilder = (person: WizardPersonState, state: WizardState, params: TaxYearParams) => WizardHint | null;

export function deriveHints(state: WizardState, params: TaxYearParams): WizardHint[] {
  const resolvedParams = resolveParams(state.year, params);
  if (resolvedParams === null) {
    return [];
  }

  const hints: WizardHint[] = [];

  addRuleHints(hints, () => perPersonHints(state, resolvedParams, mpfUnfilledHint));
  addRuleHints(hints, () => perPersonHints(state, resolvedParams, housingElevatedCapHint));
  addRuleHints(hints, () => perPersonHints(state, resolvedParams, housingChoiceHint));
  addRuleHints(hints, () => marriedAllowanceUnclaimedHint(state, resolvedParams));
  addRuleHints(hints, () => familyAllowancesWastedHint(state));
  addRuleHints(hints, () => perPersonHints(state, resolvedParams, donationHeadroomHint));
  addRuleHints(hints, () => perPersonHints(state, resolvedParams, annuityTvcHeadroomHint));
  addRuleHints(hints, () => parentsReminderHint(state, resolvedParams));
  addRuleHints(hints, () => paLossNoteHint(state));
  addRuleHints(hints, () => perPersonHints(state, resolvedParams, paMortgageNoteHint));
  addRuleHints(hints, () => perPersonHints(state, resolvedParams, twoTierUnelectedHint));
  addRuleHints(hints, () => perPersonHints(state, resolvedParams, vhisCountMissingHint));

  return hints;
}

export function estimateMarginalRate(state: WizardState, params: TaxYearParams): number | null {
  try {
    const resolvedParams = resolveParams(state.year, params);
    if (resolvedParams === null) {
      return null;
    }

    const input = mapWizardStateToFamilyScenarioInput(state);
    const people = input.married && input.personB ? [input.personA, input.personB] : [input.personA];
    const person = people.find((item) => Array.isArray(item.salaries?.incomeItems) && item.salaries.incomeItems.length > 0);

    if (!person?.salaries) {
      return null;
    }

    const computation = computeSalariesTax(person.salaries, resolvedParams);
    if (!isPositiveFinite(computation.netChargeableIncome)) {
      return null;
    }

    if (computation.basisUsed === "standard") {
      // Rough deduction-saving approximation: use the first standard-rate tier
      // as the marginal rate for taxpayers already assessed on standard rates.
      const rate = resolvedParams.standardRateTiers[0]?.rate;
      return isPositiveFinite(rate) ? rate : null;
    }

    return progressiveMarginalRate(computation, resolvedParams);
  } catch {
    return null;
  }
}

function resolveParams(year: YearOfAssessment, params: TaxYearParams | undefined): TaxYearParams | null {
  try {
    return params ?? getParams(year);
  } catch {
    return null;
  }
}

function addRuleHints(hints: WizardHint[], build: () => WizardHint | WizardHint[] | null): void {
  try {
    const result = build();
    if (Array.isArray(result)) {
      hints.push(...result);
    } else if (result) {
      hints.push(result);
    }
  } catch {
    // Hints are advisory. A malformed draft input should suppress only the
    // affected rule, not the rest of the review prompts.
  }
}

function perPersonHints(
  state: WizardState,
  params: TaxYearParams,
  build: PersonHintBuilder,
): WizardHint[] {
  const built = activeWizardPeople(state)
    .map((person) => ({ personId: person.personId, hint: build(person, state, params) }))
    .filter((item): item is { personId: WizardPersonId; hint: WizardHint } => item.hint !== null);

  if (built.length <= 1) {
    return built.map((item) => item.hint);
  }

  return built.map((item) => ({
    ...item.hint,
    id: `${item.hint.id}-${item.personId}`,
  }));
}

function activeWizardPeople(state: WizardState): WizardPersonState[] {
  return state.maritalStatus === "married" ? [state.personA, state.personB] : [state.personA];
}

function mpfUnfilledHint(person: WizardPersonState, _state: WizardState, params: TaxYearParams): WizardHint | null {
  if (!hasSalarySource(person) || (person.deductions.mpfMandatory ?? 0) > 0) {
    return null;
  }

  const cap = formatHKD(params.deductionCaps.mpfMandatory);
  return {
    id: "mpf-unfilled",
    step: "deductions",
    kind: "opportunity",
    titleZh: "可檢查強制性強積金供款扣除",
    titleEn: "Check mandatory MPF deduction",
    bodyZh: `如你年內有受僱收入，僱員強制性強積金供款通常可扣除，上限為 ${cap}。請按糧單、僱主報稅表或強積金周年權益報表補上實際金額。`,
    bodyEn: `If you had employment income, employee mandatory MPF contributions are usually deductible, capped at ${cap}. Enter the actual amount from your payslips, employer's return, or MPF annual statement.`,
  };
}

function housingElevatedCapHint(person: WizardPersonState, state: WizardState, params: TaxYearParams): WizardHint | null {
  const { housing } = person.deductions;
  if (
    (housing.kind !== "homeLoanInterest" && housing.kind !== "domesticRent")
    || housing.eligibleForElevatedCap === true
    || !hasPotentialNewbornChild(state)
  ) {
    return null;
  }

  const cap = housing.kind === "domesticRent"
    ? params.deductionCaps.domesticRentElevated
    : params.deductionCaps.homeLoanInterestElevated;
  return {
    id: "housing-elevated-cap",
    step: "deductions",
    kind: "opportunity",
    titleZh: "可能適用住屋扣除較高上限",
    titleEn: "Possible elevated housing cap",
    bodyZh: `你已選擇住屋相關扣除，而家庭資料顯示可能有合資格新生子女。請檢查較高上限資格問題；如符合條件，本年度上限可為 ${formatHKD(cap)}。`,
    bodyEn: `You selected a housing-related deduction and the family details suggest a possible qualifying newborn child. Check the elevated-cap eligibility question; if eligible, this year's cap may be ${formatHKD(cap)}.`,
  };
}

function housingChoiceHint(person: WizardPersonState, _state: WizardState, params: TaxYearParams): WizardHint | null {
  if (person.deductions.housing.kind !== "none" || !hasSalarySource(person)) {
    return null;
  }

  return {
    id: "housing-choice",
    step: "deductions",
    kind: "info",
    titleZh: "住屋扣除每年只可二選一",
    titleEn: "Choose one housing deduction for the year",
    bodyZh: `住宅租金扣除與居所貸款利息同一課稅年度不可同時申索。基本上限分別為住宅租金 ${formatHKD(params.deductionCaps.domesticRent)}、居所貸款利息 ${formatHKD(params.deductionCaps.homeLoanInterest)}；如兩者都適用，請申索對你較有利的一項。`,
    bodyEn: `Domestic rent and home loan interest cannot both be claimed in the same year of assessment. The base caps are ${formatHKD(params.deductionCaps.domesticRent)} for domestic rent and ${formatHKD(params.deductionCaps.homeLoanInterest)} for home loan interest; if both are relevant, claim the one that is more beneficial.`,
  };
}

function marriedAllowanceUnclaimedHint(state: WizardState, params: TaxYearParams): WizardHint | null {
  if (state.maritalStatus !== "married" || state.claimMarriedAllowanceBy !== "none") {
    return null;
  }

  const aHasIncome = hasIncomeForMarriedAllowanceCheck(state.personA);
  const bHasIncome = hasIncomeForMarriedAllowanceCheck(state.personB);
  if (aHasIncome === bHasIncome) {
    return null;
  }

  const marginalRate = estimateMarginalRate(state, params);
  const estimatedSavingHKD = marginalRate === null
    ? undefined
    : Math.round((params.allowances.married - params.allowances.basic) * marginalRate);

  return {
    id: "mpa-unclaimed",
    step: "family",
    kind: "warning",
    titleZh: "請即檢查已婚人士免稅額",
    titleEn: "Review married person's allowance now",
    bodyZh: "你填報為已婚，但似乎只有一方有收入，而尚未申索已婚人士免稅額。這種情況可能令你多繳薪俸稅；請在家庭資料中立即檢查評稅選擇。",
    bodyEn: "You are filing as married, but only one spouse appears to have income and married person's allowance has not been selected. This can lead to overpayment; review the assessment choice in the family section.",
    ...(estimatedSavingHKD !== undefined ? { estimatedSavingHKD } : {}),
  };
}

function familyAllowancesWastedHint(state: WizardState): WizardHint | null {
  if (state.maritalStatus !== "married") {
    return null;
  }

  const claimant = state.claimingSpouseForFamilyAllowances === "A" ? state.personA : state.personB;
  const other = state.claimingSpouseForFamilyAllowances === "A" ? state.personB : state.personA;
  if (hasAnyActiveIncome(claimant) || !hasAnyActiveIncome(other)) {
    return null;
  }

  return {
    id: "family-allowances-wasted",
    step: "family",
    kind: "warning",
    titleZh: "家庭免稅額可能分配給沒有收入的一方",
    titleEn: "Family allowances may be allocated to the spouse with no income",
    bodyZh: "目前子女或受養人免稅額由看來沒有收入的一方申索，可能無法實際減少稅款。請檢查應由哪位配偶申索家庭免稅額。",
    bodyEn: "Child or dependant allowances are currently allocated to the spouse who appears to have no income, so they may not reduce tax in practice. Review which spouse should claim the family allowances.",
  };
}

function donationHeadroomHint(person: WizardPersonState, _state: WizardState, params: TaxYearParams): WizardHint | null {
  if ((person.deductions.charitableDonations ?? 0) <= 0) {
    return null;
  }

  const percent = formatPercent(params.deductionCaps.donationsPercent);
  return {
    id: "donation-headroom",
    step: "deductions",
    kind: "info",
    titleZh: "認可慈善捐款有入息比例上限",
    titleEn: "Donation deduction is capped by income",
    bodyZh: `認可慈善捐款一般以應評稅入息的 ${percent} 為上限。此提示不會重算完整的入息基數；請在核對頁查看實際可扣除金額及任何超額部分。`,
    bodyEn: `Approved charitable donations are generally capped at ${percent} of assessable income. This hint layer does not recompute the full income base; check the review page for the actual deductible amount and any excess.`,
  };
}

function annuityTvcHeadroomHint(person: WizardPersonState, state: WizardState, params: TaxYearParams): WizardHint | null {
  if (!hasAnyActiveIncome(person)) {
    return null;
  }

  const claimed = person.deductions.annuityAndTvc ?? 0;
  const headroom = params.deductionCaps.annuityAndTvc - claimed;
  const marginalRate = estimateMarginalRate(state, params);
  if (headroom <= 0 || marginalRate === null || marginalRate <= 0) {
    return null;
  }

  const estimatedSavingHKD = Math.round(headroom * marginalRate);
  return {
    id: "annuity-tvc-headroom",
    step: "deductions",
    kind: "opportunity",
    titleZh: "年金及可扣稅自願性供款仍有扣除空間",
    titleEn: "Annuity and TVC deduction headroom remains",
    bodyZh: `合資格延期年金保費及強積金可扣稅自願性供款共用 ${formatHKD(params.deductionCaps.annuityAndTvc)} 上限。按今年已填資料粗略估算，如你已有供款或持有合資格保單而尚未全數填報，餘下 ${formatHKD(headroom)} 扣除空間約可節省 ${formatHKD(estimatedSavingHKD)} 稅款。`,
    bodyEn: `Qualifying deferred annuity premiums and MPF TVC share a ${formatHKD(params.deductionCaps.annuityAndTvc)} cap. Based on this year's inputs, if you already contribute or hold a qualifying policy and have not entered the full amount, the remaining ${formatHKD(headroom)} headroom could save about ${formatHKD(estimatedSavingHKD)} in tax.`,
    estimatedSavingHKD,
  };
}

function parentsReminderHint(state: WizardState, params: TaxYearParams): WizardHint | null {
  if (state.family.parents.length > 0) {
    return null;
  }

  return {
    id: "parents-reminder",
    step: "family",
    kind: "info",
    titleZh: "如有供養父母或祖父母，可檢查免稅額",
    titleEn: "Check parent or grandparent allowance if applicable",
    bodyZh: `如你有供養 55 歲或以上父母、祖父母或外祖父母，可能可申索免稅額。55 至 59 歲基本額為 ${formatHKD(params.allowances.parentAged55)}，60 歲或以上為 ${formatHKD(params.allowances.parentAged60)}；如全年同住，額外免稅額分別為 ${formatHKD(params.allowances.parentResidingExtra55)} 及 ${formatHKD(params.allowances.parentResidingExtra60)}。`,
    bodyEn: `If applicable, maintaining a parent or grandparent aged 55 or above may qualify for an allowance. The basic amounts are ${formatHKD(params.allowances.parentAged55)} for ages 55 to 59 and ${formatHKD(params.allowances.parentAged60)} for age 60 or above; the extra allowances for full-year co-residence are ${formatHKD(params.allowances.parentResidingExtra55)} and ${formatHKD(params.allowances.parentResidingExtra60)} respectively.`,
  };
}

function paLossNoteHint(state: WizardState): WizardHint | null {
  const people = activeWizardPeople(state);
  const hasBusinessLoss = people.some((person) =>
    person.businesses.some((business) => business.revenue < business.deductibleExpenses)
  );
  const hasSalarySomewhere = people.some(hasSalarySource);

  if (!hasBusinessLoss || !hasSalarySomewhere) {
    return null;
  }

  return {
    id: "pa-loss-note",
    step: "review",
    kind: "info",
    titleZh: "個人入息課稅或可抵銷業務虧損",
    titleEn: "Personal Assessment may set off business losses",
    bodyZh: "你填報的業務資料呈現虧損，同時家庭內有薪俸收入。個人入息課稅可能容許以業務虧損抵銷其他入息；結果比較頁會判斷個人入息課稅是否真的較有利。",
    bodyEn: "One business shows an assessable-loss pattern while there is salary income in the family. Personal Assessment may set a business loss against other income; the results comparison will decide whether PA is actually beneficial.",
  };
}

function paMortgageNoteHint(person: WizardPersonState): WizardHint | null {
  const hasLetPropertyWithoutInterest = person.properties.some((property) =>
    property.rentReceived > 0 && (property.letPropertyMortgageInterestForPA ?? 0) <= 0
  );
  if (!hasLetPropertyWithoutInterest) {
    return null;
  }

  return {
    id: "pa-mortgage-note",
    step: "sourceDetails",
    kind: "info",
    titleZh: "出租物業按揭利息只在個人入息課稅下扣除",
    titleEn: "Let-property mortgage interest is PA-only",
    bodyZh: "出租物業的按揭利息不會在物業稅本身扣除，只可在個人入息課稅下考慮，並以該物業的應評稅淨值為上限。此提示不估算應評稅淨值，請在結果比較中查看影響。",
    bodyEn: "Mortgage interest on a let property is not deducted under Property Tax itself. It is considered only under Personal Assessment and is capped at that property's net assessable value. This hint does not estimate the NAV; check the comparison results for the effect.",
  };
}

function twoTierUnelectedHint(person: WizardPersonState): WizardHint | null {
  if (person.businesses.length < 2 || person.electedTwoTierBusinessId !== null) {
    return null;
  }

  return {
    id: "two-tier-unelected",
    step: "sourceDetails",
    kind: "opportunity",
    titleZh: "可選一項業務使用兩級制利得稅率",
    titleEn: "One business may elect two-tier profits tax rates",
    bodyZh: "你有多於一項業務但尚未選擇兩級制利得稅率。通常只有一項業務可作出選擇，而利潤較高的業務（收入減可扣除開支）通常得益較大。",
    bodyEn: "You have more than one business but have not selected the two-tier profits tax election. Usually exactly one business may elect it, and the business with the largest profit (revenue less deductible expenses) usually benefits most.",
  };
}

function vhisCountMissingHint(person: WizardPersonState, _state: WizardState, params: TaxYearParams): WizardHint | null {
  if ((person.deductions.vhisPremiums ?? 0) <= 0 || (person.deductions.vhisInsuredPersons ?? 0) > 0) {
    return null;
  }

  return {
    id: "vhis-count-missing",
    step: "deductions",
    kind: "warning",
    titleZh: "請填寫自願醫保受保人人數",
    titleEn: "Enter the number of VHIS insured persons",
    bodyZh: `你已填寫自願醫保保費，但未填受保人人數。系統會暫按 1 名受保人處理；實際上限按每名受保人 ${formatHKD(params.deductionCaps.vhisPerPerson)} 計算，請輸入正確人數。`,
    bodyEn: `You entered VHIS premiums but no insured-person count. The engine temporarily assumes 1 insured person; the cap applies at ${formatHKD(params.deductionCaps.vhisPerPerson)} per insured person, so enter the actual count.`,
  };
}

function progressiveMarginalRate(computation: Computation, params: TaxYearParams): number | null {
  const amount = computation.netChargeableIncome;
  let upper = 0;

  for (const band of params.progressiveBands) {
    if (!isPositiveFinite(band.rate)) {
      return null;
    }
    if (band.width === null) {
      return band.rate;
    }
    if (!isPositiveFinite(band.width)) {
      return null;
    }

    upper += band.width;
    if (amount <= upper) {
      return band.rate;
    }
  }

  return null;
}

function hasPotentialNewbornChild(state: WizardState): boolean {
  return state.family.children.some((child) => child.bornDuringYearOfAssessment === true || child.birthYear >= 2023);
}

function hasSalarySource(person: WizardPersonState): boolean {
  return person.incomeSources.hasSalary || person.salary.incomeItems.length > 0;
}

function hasIncomeForMarriedAllowanceCheck(person: WizardPersonState): boolean {
  return (
    person.salary.incomeItems.length > 0
    || (person.incomeSources.hasProperty && person.properties.length > 0)
    || (person.incomeSources.hasBusiness && person.businesses.length > 0)
  );
}

function hasAnyActiveIncome(person: WizardPersonState): boolean {
  return (
    hasSalarySource(person)
    || person.incomeSources.hasProperty
    || person.properties.length > 0
    || person.incomeSources.hasBusiness
    || person.businesses.length > 0
  );
}

function isPositiveFinite(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function formatHKD(amount: number): string {
  return `HK$${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
