import type { StoredWizardResult } from "@/components/wizard/resultsStorage";
import type { BusinessInput } from "@/lib/tax/profits";
import type { PropertyInput } from "@/lib/tax/property";
import type { AccommodationType, SalariesInput } from "@/lib/tax/salaries";
import type { TaxYearParams, YearOfAssessment } from "@/lib/tax/types";
import type { WizardPersonId, WizardPersonState, WizardState } from "@/lib/wizard/wizardState";

import {
  BIR60_STRUCTURE,
  type Bir60BoxKind,
  type Bir60BoxSource,
  type Bir60BoxTemplate,
  type Bir60Part,
} from "./structure";

export interface Bir60Particulars {
  taxpayerName?: string;
  taxpayerHkid?: string;
  spouseName?: string;
  spouseHkid?: string;
  employerName?: string;
  employerFileNo?: string;
  businessName?: string;
  businessBrNo?: string;
  propertyAddresses?: string[];
  childrenNames?: string[];
}

export interface FilledBir60Box {
  id: string;
  boxNo?: string;
  labelZh: string;
  labelEn: string;
  kind: Bir60BoxKind;
  source: Bir60BoxSource;
  value: string | number | boolean | null;
  noteZh?: string;
  noteEn?: string;
}

export interface FilledBir60Section {
  id: string;
  titleZh: string;
  titleEn: string;
  boxes: FilledBir60Box[];
}

export interface FilledBir60Part {
  id: string;
  partNo: string;
  titleZh: string;
  titleEn: string;
  sections: FilledBir60Section[];
}

export interface FilledBir60 {
  personId: WizardPersonId;
  year: YearOfAssessment;
  parts: FilledBir60Part[];
}

type DeductionInput = NonNullable<SalariesInput["deductions"]>;
type HousingDeduction = number | { amount: number; eligibleForElevatedCap?: boolean };

const PA_SCENARIO_IDS = new Set(["pa", "paIndividualA", "paIndividualB", "paIndividualBoth", "paJoint"]);

const RECOMMENDATION_NOTE = {
  noteZh: "此草稿反映本計算器的建議；是否作出該選擇仍由納稅人自行決定。",
  noteEn: "This draft reflects this calculator's recommendation; making the election remains the taxpayer's own choice.",
};

const NON_PA_NOTE = {
  noteZh: "此建議方案不涉及個人入息課稅選擇。",
  noteEn: "The recommended scenario does not involve electing Personal Assessment.",
};

const CLAIMED_BY_SPOUSE_NOTE = {
  noteZh: "由配偶的報稅表申報。",
  noteEn: "Claimed on your spouse's return.",
};

const PROPERTY_ATTRIBUTION_NOTE = {
  noteZh: "計算器只記錄一個合計金額；如需分配至此物業，請自行填寫。",
  noteEn: "The calculator tracks only one aggregate figure; enter manually if attribution to this property is needed.",
};

const RENTAL_VALUE_RATES: Record<AccommodationType, number> = {
  residence: 0.10,
  twoRoomHotel: 0.08,
  oneRoomHotel: 0.04,
};

export function fillBir60(
  personId: WizardPersonId,
  wizard: WizardState,
  results: StoredWizardResult,
  particulars: Bir60Particulars,
  params: TaxYearParams,
): FilledBir60 | null {
  if (results.optimizerResult.scenarios.length === 0) {
    return null;
  }

  const personInput = personId === "A" ? results.familyScenarioInput.personA : results.familyScenarioInput.personB;
  if (!personInput || (personId === "B" && wizard.maritalStatus !== "married")) {
    return null;
  }

  const wizardPerson = personId === "A" ? wizard.personA : wizard.personB;
  const parts = instantiateParts(wizardPerson, particulars);
  const draft: FilledBir60 = { personId, year: params.year, parts };
  const bestScenario = results.optimizerResult.scenarios.find((scenario) => scenario.id === results.optimizerResult.best);
  const deductions = getDeductions(personInput);

  fillParticulars(draft, personId, particulars);
  fillPropertyTax(draft, personInput.properties ?? [], particulars);
  fillSalaries(draft, personInput.salaries, deductions, particulars);
  fillProfits(draft, wizardPerson, personInput.businesses ?? [], particulars);
  fillPaElection(draft, personId, bestScenario?.id ?? results.optimizerResult.best);
  fillHousingDeductions(draft, wizardPerson, personInput, deductions, particulars, params);
  fillOtherDeductions(draft, deductions);
  fillAllowances(draft, personId, wizard, results, particulars);

  return draft;
}

function instantiateParts(wizardPerson: WizardPersonState, particulars: Bir60Particulars): FilledBir60Part[] {
  return BIR60_STRUCTURE.map((part) => ({
    id: part.id,
    partNo: part.partNo,
    titleZh: part.titleZh,
    titleEn: part.titleEn,
    sections: part.sections.map((section) => ({
      id: section.id,
      titleZh: section.titleZh,
      titleEn: section.titleEn,
      boxes: section.id === "part3.properties"
        ? instantiatePart3Properties(section.boxes, wizardPerson.properties, particulars)
        : section.boxes.map((box) => filledFromTemplate(box)),
    })),
  }));
}

function instantiatePart3Properties(
  templates: Bir60BoxTemplate[],
  properties: PropertyInput[],
  particulars: Bir60Particulars,
): FilledBir60Box[] {
  const soleProperties = properties.filter(isSolelyOwned).slice(0, 2);
  if (soleProperties.length === 0) {
    return templates.map((box) => filledFromTemplate(box));
  }

  return soleProperties.flatMap((property, index) =>
    templates.map((template) => {
      const suffix = String(index + 1);
      const box = filledFromTemplate(template, suffix, `${template.labelZh} ${suffix}`, `${template.labelEn} ${suffix}`);
      if (template.id.endsWith(".location")) {
        box.value = particulars.propertyAddresses?.[index] ?? null;
      }
      if (template.id.endsWith(".grossRentalIncome")) {
        box.value = property.rentReceived + leasePremiumForYear(property) + (property.irrecoverableRentRecovered ?? 0);
      }
      if (template.id.endsWith(".ratesAndIrrecoverableRent")) {
        box.value = ratesAndIrrecoverableRent(property);
      }
      if (template.id.endsWith(".netBeforeAllowance")) {
        box.value = part3NetBeforeAllowance(property);
      }
      if (template.id === "part3.hasSoleProperties") {
        box.value = soleProperties.length > 0;
      }
      return box;
    }),
  );
}

function filledFromTemplate(
  box: Bir60BoxTemplate,
  suffix?: string,
  labelZh = box.labelZh,
  labelEn = box.labelEn,
): FilledBir60Box {
  return {
    id: suffix ? `${box.id}.${suffix}` : box.id,
    boxNo: box.boxNo,
    labelZh,
    labelEn,
    kind: box.kind,
    source: box.source,
    value: box.kind === "tick" ? false : null,
    noteZh: box.noteZh,
    noteEn: box.noteEn,
  };
}

function fillParticulars(
  draft: FilledBir60,
  personId: WizardPersonId,
  particulars: Bir60Particulars,
): void {
  // BIR60 is filed by one individual. On Person B's own draft, Person B becomes
  // "self" and Person A is rendered in the spouse boxes.
  const selfName = personId === "A" ? particulars.taxpayerName : particulars.spouseName;
  const selfHkid = personId === "A" ? particulars.taxpayerHkid : particulars.spouseHkid;
  const spouseName = personId === "A" ? particulars.spouseName : particulars.taxpayerName;
  const spouseHkid = personId === "A" ? particulars.spouseHkid : particulars.taxpayerHkid;

  setBox(draft, "part1.selfName", { value: selfName ?? null });
  setBox(draft, "part1.selfHkid", { value: selfHkid ?? null });
  setBox(draft, "part1.spouseName", { value: spouseName ?? null });
  setBox(draft, "part1.spouseHkid", { value: spouseHkid ?? null });
  setBox(draft, "part4.employerName", { value: particulars.employerName ?? null });
  setBox(draft, "part4.employerFileNo", { value: particulars.employerFileNo ?? null });
  setBox(draft, "part5.business1.name", { value: particulars.businessName ?? null });
  setBox(draft, "part5.business1.brNumber", { value: particulars.businessBrNo ?? null });
}

function fillPropertyTax(draft: FilledBir60, properties: PropertyInput[], particulars: Bir60Particulars): void {
  const soleProperties = properties.filter(isSolelyOwned);
  const excludedCount = properties.length - soleProperties.length;
  const shownCount = Math.min(soleProperties.length, 2);
  const overflowCount = Math.max(0, soleProperties.length - 2);

  setBox(draft, "part3.totalPropertiesLet", {
    value: soleProperties.length,
    noteZh: overflowCount > 0 ? `另有 ${overflowCount} 個獨資出租物業須使用附頁。` : undefined,
    noteEn: overflowCount > 0 ? `${overflowCount} additional solely-owned let property/properties require a separate sheet.` : undefined,
  });
  setBox(draft, "part3.totalRatesAndIrrecoverableRent", {
    value: soleProperties.reduce((sum, property) => sum + ratesAndIrrecoverableRent(property), 0),
  });
  setBox(draft, "part3.totalNetBeforeAllowance", {
    value: soleProperties.reduce((sum, property) => sum + part3NetBeforeAllowance(property), 0),
  });
  setBox(draft, "part3.jointOwnershipExclusion", {
    value: null,
    noteZh: excludedCount > 0
      ? `已排除 ${excludedCount} 個共同擁有物業；該等物業通常由稅務局另發物業稅報稅表。`
      : "沒有共同擁有物業需要從第3部排除。",
    noteEn: excludedCount > 0
      ? `${excludedCount} jointly-owned property/properties excluded; those are usually handled on separate IRD Property Tax returns.`
      : "No jointly-owned properties were excluded from Part 3.",
  });

  for (let index = 0; index < shownCount; index += 1) {
    setBox(draft, `part3.property.location.${index + 1}`, { value: particulars.propertyAddresses?.[index] ?? null });
  }
}

function fillSalaries(
  draft: FilledBir60,
  salaries: SalariesInput | undefined,
  deductions: DeductionInput,
  particulars: Bir60Particulars,
): void {
  const incomeItems = salaries?.incomeItems ?? [];
  setBox(draft, "part4.hasSalariesIncome", { value: incomeItems.some((item) => item.amount > 0) });
  setBox(draft, "part4.employerName", { value: particulars.employerName ?? null });
  setBox(draft, "part4.employerFileNo", { value: particulars.employerFileNo ?? null });
  setBox(draft, "part4.grandTotalIncome", { value: sumAmounts(incomeItems) });
  setBox(draft, "part4.shareOptionGain", { value: sumIncomeByKeyword(incomeItems, ["share option", "股份認購權"]) });
  setBox(draft, "part4.lumpSumPayments", { value: sumIncomeByKeyword(incomeItems, ["lump", "terminal", "termination", "retirement", "arrears", "整筆", "約滿", "退休", "終止", "補發"]) });
  setBox(draft, "part4.commissionIncome", { value: sumIncomeByKeyword(incomeItems, ["commission", "佣金"]) });
  setBox(draft, "part4.excludedAmount", { value: excludedRelateBackAmount(incomeItems) });
  setBox(draft, "part4.placeOfResidenceValue", { value: computeAccommodationValue(salaries?.employerAccommodation ?? []) });
  setBox(draft, "part4.outgoingsAndExpenses", {
    value: sumAmounts(salaries?.outgoingsAndExpenses ?? []),
    noteZh: (salaries?.depreciationAllowances?.length ?? 0) > 0
      ? "折舊免稅額未有獨立方格；請於開支詳情自行核對。"
      : undefined,
    noteEn: (salaries?.depreciationAllowances?.length ?? 0) > 0
      ? "Depreciation allowances do not have a separate box here; review the expense particulars manually."
      : undefined,
  });
  setBox(draft, "part4.selfEducation", { value: deductions.selfEducation ?? 0 });
  setBox(draft, "part4.charitableDonations", { value: deductions.charitableDonations ?? 0 });
  setBox(draft, "part4.mpfMandatory", { value: deductions.mpfMandatory ?? 0 });
}

function fillProfits(
  draft: FilledBir60,
  wizardPerson: WizardPersonState,
  businesses: BusinessInput[],
  particulars: Bir60Particulars,
): void {
  setBox(draft, "part5.hasBusinesses", { value: businesses.length > 0 });

  businesses.slice(0, 2).forEach((business, index) => {
    const column = index + 1;
    const profitBeforeTaxAdjustments = business.revenue - business.deductibleExpenses;
    const assessableBeforeLoss = business.revenue - business.deductibleExpenses + sumAddBacks(business) - sumCapitalAllowances(business);

    setBox(draft, `part5.business${column}.name`, {
      value: column === 1 ? particulars.businessName ?? null : business.name ?? null,
      source: column === 1 ? "particulars" : "entered",
    });
    setBox(draft, `part5.business${column}.brNumber`, { value: column === 1 ? particulars.businessBrNo ?? null : null });
    setBox(draft, `part5.business${column}.grossIncome`, { value: business.revenue });
    setBox(draft, `part5.business${column}.turnover`, { value: business.revenue });
    setBox(draft, `part5.business${column}.grossProfit`, { value: profitBeforeTaxAdjustments });
    setBox(draft, `part5.business${column}.netProfitPerAccounts`, { value: profitBeforeTaxAdjustments });
    setBox(draft, `part5.business${column}.assessableProfits`, { value: assessableBeforeLoss });
    setBox(draft, `part5.business${column}.twoTierRatesElection`, {
      value: wizardPerson.electedTwoTierBusinessId === business.id,
    });
  });

  const electedIndex = businesses.findIndex((business) => wizardPerson.electedTwoTierBusinessId === business.id);
  if (electedIndex >= 2) {
    setBox(draft, "part5.moreBusinesses", {
      value: null,
      noteZh: "兩級制選擇屬於第3項或以後的業務；該業務須使用附頁並自行標示選擇。",
      noteEn: "The two-tier election belongs to the third or later business; use a separate sheet and mark the election manually there.",
    });
  } else if (businesses.length > 2) {
    setBox(draft, "part5.moreBusinesses", {
      value: null,
      noteZh: `另有 ${businesses.length - 2} 項業務須使用附頁。`,
      noteEn: `${businesses.length - 2} additional business(es) require a separate sheet.`,
    });
  }
}

function fillPaElection(draft: FilledBir60, personId: WizardPersonId, bestScenarioId: string): void {
  const isPaScenario = PA_SCENARIO_IDS.has(bestScenarioId);
  const tickSeparate = bestScenarioId === "paIndividualBoth"
    || (bestScenarioId === "paIndividualA" && personId === "A")
    || (bestScenarioId === "paIndividualB" && personId === "B")
    || (bestScenarioId === "pa" && personId === "A");
  const tickJoint = bestScenarioId === "paJoint";

  setBox(draft, "part7.paSeparateElection", {
    value: isPaScenario ? tickSeparate : false,
    ...(isPaScenario ? RECOMMENDATION_NOTE : NON_PA_NOTE),
  });
  setBox(draft, "part7.paJointElection", {
    value: isPaScenario ? tickJoint : false,
    ...(isPaScenario ? RECOMMENDATION_NOTE : NON_PA_NOTE),
  });
  setBox(draft, "part4.jointAssessmentElection", {
    value: bestScenarioId === "jointSalaries",
    noteZh: bestScenarioId === "jointSalaries"
      ? RECOMMENDATION_NOTE.noteZh
      : "此建議方案不涉及薪俸稅合併評稅選擇。",
    noteEn: bestScenarioId === "jointSalaries"
      ? RECOMMENDATION_NOTE.noteEn
      : "The recommended scenario does not involve electing joint Salaries Tax assessment.",
  });
}

function fillHousingDeductions(
  draft: FilledBir60,
  wizardPerson: WizardPersonState,
  personInput: { letPropertyMortgageInterest?: { propertyId: string; interest: number }[] },
  deductions: DeductionInput,
  particulars: Bir60Particulars,
  params: TaxYearParams,
): void {
  wizardPerson.properties.slice(0, 3).forEach((property, index) => {
    const column = index + 1;
    const rentalInterest = personInput.letPropertyMortgageInterest?.find((item) => item.propertyId === property.id)?.interest ?? 0;
    setBox(draft, `part8.property${column}.location`, { value: particulars.propertyAddresses?.[index] ?? null });
    setBox(draft, `part8.property${column}.ownershipShare`, { value: (property.ownershipShare ?? 1) * 100 });
    setBox(draft, `part8.property${column}.rentalInterest`, { value: rentalInterest });
  });

  const homeLoanInterest = deductionAmount(deductions.homeLoanInterest);
  const domesticRent = deductionAmount(deductions.domesticRent);
  const hliCap = deductionEligibleForElevatedCap(deductions.homeLoanInterest)
    ? params.deductionCaps.homeLoanInterestElevated
    : params.deductionCaps.homeLoanInterest;
  const rentCap = deductionEligibleForElevatedCap(deductions.domesticRent)
    ? params.deductionCaps.domesticRentElevated
    : params.deductionCaps.domesticRent;

  setBox(draft, "part8.property1.homeLoanInterest", {
    value: homeLoanInterest,
    noteZh: capNoteZh(homeLoanInterest, hliCap),
    noteEn: capNoteEn(homeLoanInterest, hliCap),
  });
  setBox(draft, "part8.property1.domesticRent", {
    value: domesticRent,
    noteZh: capNoteZh(domesticRent, rentCap),
    noteEn: capNoteEn(domesticRent, rentCap),
  });

  for (const column of [2, 3]) {
    if (homeLoanInterest > 0) {
      setBox(draft, `part8.property${column}.homeLoanInterest`, {
        value: null,
        source: "manual",
        ...PROPERTY_ATTRIBUTION_NOTE,
      });
    }
    if (domesticRent > 0) {
      setBox(draft, `part8.property${column}.domesticRent`, {
        value: null,
        source: "manual",
        ...PROPERTY_ATTRIBUTION_NOTE,
      });
    }
  }
}

function fillOtherDeductions(draft: FilledBir60, deductions: DeductionInput): void {
  const vhisPremiums = deductions.vhisPremiums ?? 0;
  const vhisInsuredPersons = deductions.vhisInsuredPersons ?? 0;
  setBox(draft, "part9.selfPremium", {
    value: vhisInsuredPersons <= 1 ? vhisPremiums : null,
    noteZh: vhisInsuredPersons > 1 ? "自願醫保資料只記錄合計金額及人數，請按保單自行分配至本人及親屬欄。" : undefined,
    noteEn: vhisInsuredPersons > 1 ? "VHIS data stores only an aggregate amount and person count; allocate across self and relatives manually." : undefined,
  });
  setBox(draft, "part10.assistedReproduction", { value: deductions.assistedReproduction ?? 0 });
  setBox(draft, "part11.tvcContribution", {
    value: deductions.annuityAndTvc ?? 0,
    noteZh: deductions.annuityAndTvc ? "計算器只記錄年金/TVC合計金額；請自行核對應填方格140、141或142。" : undefined,
    noteEn: deductions.annuityAndTvc ? "The calculator stores one annuity/TVC aggregate; verify the split across boxes 140, 141, and 142 manually." : undefined,
  });
}

function fillAllowances(
  draft: FilledBir60,
  personId: WizardPersonId,
  wizard: WizardState,
  results: StoredWizardResult,
  particulars: Bir60Particulars,
): void {
  const married = wizard.maritalStatus === "married";
  const familyClaimant: WizardPersonId = married ? wizard.claimingSpouseForFamilyAllowances : "A";
  const isFamilyClaimant = personId === familyClaimant;
  const spouseInput = personId === "A" ? results.familyScenarioInput.personB : results.familyScenarioInput.personA;
  const spouseHasSalariesIncome = married && Boolean(spouseInput?.salaries?.incomeItems.some((item) => item.amount > 0));
  const claimsMarriedAllowance = married && wizard.claimMarriedAllowanceBy === personId;

  setBox(draft, "part12.spouseHadIncome", {
    value: married ? spouseHasSalariesIncome : null,
    source: "computed",
    noteZh: claimsMarriedAllowance && !spouseHasSalariesIncome ? "如申索已婚人士免稅額，按表格說明在此方格選「否」。" : undefined,
    noteEn: claimsMarriedAllowance && !spouseHasSalariesIncome ? "To claim Married Person's Allowance, follow the return instruction to tick 'No' in this box." : undefined,
  });
  setBox(draft, "part12.personalDisability", {
    value: wizard.family.personalDisability[personId],
  });

  if (!isFamilyClaimant && married) {
    markFamilySectionsClaimedBySpouse(draft);
    return;
  }

  wizard.family.children.slice(0, 3).forEach((child, index) => {
    const column = index + 1;
    setBox(draft, `part12.child${column}.name`, { value: particulars.childrenNames?.[index] ?? null });
    setBox(draft, `part12.child${column}.relationshipCode`, { value: "1" });
    setBox(draft, `part12.child${column}.dob`, {
      value: String(child.birthYear),
      noteZh: "計算器只記錄年份，月／日請自行核對。",
      noteEn: "Year only from the calculator; verify month/day yourself.",
    });
    setBox(draft, `part12.child${column}.ageBandCode`, {
      value: null,
      noteZh: "如受養人年滿18歲，請按方格定義自行選擇代號1或2。",
      noteEn: "If the dependant is aged 18 or above, choose code 1 or 2 per the box definition.",
    });
  });
  if (wizard.family.children.length > 3 || wizard.family.siblingCount > 3) {
    setBox(draft, "part12.childOverflow", {
      value: null,
      noteZh: "有超過三名子女／兄弟姊妹受養人，使用附頁。",
      noteEn: "There are more than three child/brother/sister dependants; use a separate sheet.",
    });
  }

  setBox(draft, "part12.singleParent", {
    value: wizard.family.singleParent ? "1" : null,
    noteZh: wizard.family.singleParent ? "計算器未記錄是否全年；如非全年請改填2。" : undefined,
    noteEn: wizard.family.singleParent ? "The calculator does not track full-year status; enter 2 instead if not full year." : undefined,
  });

  wizard.family.parents.slice(0, 3).forEach((parent, index) => {
    const column = index + 1;
    setBox(draft, `part12.parent${column}.dobMonthYear`, {
      value: parent.birthYear ? String(parent.birthYear) : null,
      noteZh: parent.birthYear ? "計算器只記錄年份，月份請自行核對。" : undefined,
      noteEn: parent.birthYear ? "Year only from the calculator; verify month yourself." : undefined,
    });
    setBox(draft, `part12.parent${column}.residedWithMeCode`, {
      value: parent.residedWithTaxpayer ? "2" : null,
      noteZh: parent.residedWithTaxpayer ? "計算器只記錄有同住，未記錄全年或連續六個月；請自行核對代號。" : undefined,
      noteEn: parent.residedWithTaxpayer ? "The calculator records residence but not whether it was full year or six continuous months; verify the code." : undefined,
    });
    setBox(draft, `part12.parent${column}.elderlyResidentialCareExpenses`, {
      value: parent.inCareHome ? parent.careHomeExpenses ?? 0 : null,
    });
    if (parent.ageDuringYear !== undefined && !parent.birthYear) {
      setBox(draft, `part12.parent${column}.dobMonthYear`, {
        value: null,
        noteZh: `計算器記錄受養人年齡為 ${parent.ageDuringYear} 歲，但未記錄出生月份及年份。`,
        noteEn: `The calculator records the dependant's age as ${parent.ageDuringYear}, but not their birth month/year.`,
      });
    }
  });
  if (wizard.family.parents.length > 3) {
    setBox(draft, "part12.parentOverflow", {
      value: null,
      noteZh: "有超過三名供養父母／祖父母，使用附頁。",
      noteEn: "There are more than three parent/grandparent dependants; use a separate sheet.",
    });
  }
}

function markFamilySectionsClaimedBySpouse(draft: FilledBir60): void {
  for (const id of [
    "part12.child1.name",
    "part12.child1.relationshipCode",
    "part12.child1.dob",
    "part12.child2.name",
    "part12.child2.relationshipCode",
    "part12.child2.dob",
    "part12.child3.name",
    "part12.child3.relationshipCode",
    "part12.child3.dob",
    "part12.singleParent",
    "part12.parent1.name",
    "part12.parent1.dobMonthYear",
    "part12.parent1.residedWithMeCode",
    "part12.parent1.elderlyResidentialCareExpenses",
    "part12.parent2.name",
    "part12.parent2.dobMonthYear",
    "part12.parent2.residedWithMeCode",
    "part12.parent2.elderlyResidentialCareExpenses",
    "part12.parent3.name",
    "part12.parent3.dobMonthYear",
    "part12.parent3.residedWithMeCode",
    "part12.parent3.elderlyResidentialCareExpenses",
  ]) {
    setBox(draft, id, { value: null, ...CLAIMED_BY_SPOUSE_NOTE });
  }
}

function setBox(
  draft: FilledBir60,
  id: string,
  patch: Partial<Omit<FilledBir60Box, "id" | "boxNo" | "labelZh" | "labelEn" | "kind">>,
): void {
  const box = findBox(draft, id);
  if (!box) {
    return;
  }

  Object.assign(box, withoutUndefined(patch));
}

function findBox(draft: FilledBir60, id: string): FilledBir60Box | undefined {
  for (const part of draft.parts) {
    for (const section of part.sections) {
      const box = section.boxes.find((item) => item.id === id);
      if (box) {
        return box;
      }
    }
  }

  return undefined;
}

function withoutUndefined<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function getDeductions(person: { deductions?: SalariesInput["deductions"]; salaries?: SalariesInput }): DeductionInput {
  return person.deductions ?? person.salaries?.deductions ?? {};
}

function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

function sumIncomeByKeyword(items: SalariesInput["incomeItems"], keywords: string[]): number {
  return items.reduce((sum, item) => {
    const haystack = `${item.key} ${item.labelZh} ${item.labelEn}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword.toLowerCase())) ? sum + item.amount : sum;
  }, 0);
}

function excludedRelateBackAmount(items: SalariesInput["incomeItems"]): number {
  return items.reduce((sum, item) => {
    if (!item.relateBack?.elected) {
      return sum;
    }

    const currentYearAmount = item.amount * (item.relateBack.currentYearMonths / item.relateBack.months);
    return sum + Math.max(0, item.amount - currentYearAmount);
  }, 0);
}

function computeAccommodationValue(items: NonNullable<SalariesInput["employerAccommodation"]>): number {
  return items.reduce((sum, item) => {
    const base = Math.max(0, item.employerAssessableIncomeBeforeAccommodation - (item.employerOutgoingsAndExpenses ?? 0));
    const computed = base * RENTAL_VALUE_RATES[item.type];
    const value = item.type === "residence" && item.rateableValueElection !== undefined
      ? Math.min(computed, item.rateableValueElection)
      : computed;
    return sum + value;
  }, 0);
}

function isSolelyOwned(property: PropertyInput): boolean {
  return property.ownershipShare === undefined || property.ownershipShare === 1;
}

function leasePremiumForYear(property: PropertyInput): number {
  const premium = property.leasePremium ?? 0;
  const leaseTermMonths = property.leaseTermMonths ?? 0;
  if (premium <= 0 || leaseTermMonths <= 0) {
    return 0;
  }

  return (premium / Math.min(leaseTermMonths, 36)) * (property.premiumMonthsInYear ?? 0);
}

function ratesAndIrrecoverableRent(property: PropertyInput): number {
  return (property.ratesPaidByOwner ?? 0) + (property.irrecoverableRent ?? 0);
}

function part3NetBeforeAllowance(property: PropertyInput): number {
  return Math.max(
    0,
    property.rentReceived
      + leasePremiumForYear(property)
      + (property.irrecoverableRentRecovered ?? 0)
      - ratesAndIrrecoverableRent(property),
  );
}

function sumAddBacks(business: BusinessInput): number {
  const addBacks = business.addBacks ?? {};
  return (addBacks.privatePortion ?? 0)
    + (addBacks.capitalExpenditure ?? 0)
    + (addBacks.proprietorSalaries ?? 0)
    + (addBacks.nonDeductibleDonations ?? 0);
}

function sumCapitalAllowances(business: BusinessInput): number {
  const capitalAllowances = business.capitalAllowances;
  if (!capitalAllowances) {
    return 0;
  }

  const pmInitialAllowance = (capitalAllowances.pmInitialAdditions ?? 0) * 0.6;
  const poolAllowances = (capitalAllowances.pools ?? []).reduce((sum, pool) => {
    const poolBase = pool.broughtForward + pool.additions * 0.4;
    return sum + poolBase * pool.rate;
  }, 0);

  return pmInitialAllowance + poolAllowances + (capitalAllowances.buildingAllowance ?? 0);
}

function deductionAmount(input: HousingDeduction | undefined): number {
  return typeof input === "number" ? input : input?.amount ?? 0;
}

function deductionEligibleForElevatedCap(input: HousingDeduction | undefined): boolean {
  return typeof input === "number" ? false : Boolean(input?.eligibleForElevatedCap);
}

function capNoteZh(amount: number, cap: number): string | undefined {
  return amount > cap ? `上限 HK$${cap.toLocaleString("en-US")} 將由稅務局套用。` : undefined;
}

function capNoteEn(amount: number, cap: number): string | undefined {
  return amount > cap ? `The HK$${cap.toLocaleString("en-US")} cap will be applied by the IRD.` : undefined;
}
