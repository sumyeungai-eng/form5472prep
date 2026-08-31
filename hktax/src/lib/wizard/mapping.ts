import type { FamilyScenarioInput } from "../tax/optimizer";
import type { PAPersonInput } from "../tax/personalAssessment";
import type { BusinessInput } from "../tax/profits";
import type { PropertyInput } from "../tax/property";
import type { SalariesInput } from "../tax/salaries";
import type { TaxYearParams, YearOfAssessment } from "../tax/types";
import type {
  WizardDeductions,
  WizardFamilyState,
  WizardParent,
  WizardPersonId,
  WizardPersonState,
  WizardState,
} from "./wizardState";

export function mapWizardStateToFamilyScenarioInput(state: WizardState): FamilyScenarioInput {
  const married = state.maritalStatus === "married";
  const familyAllowanceOwner: WizardPersonId = married ? state.claimingSpouseForFamilyAllowances : "A";
  const familyCareHomeExpenses = sumCareHomeExpenses(state.family);

  const personA = mapPerson(state.personA, state, {
    includeFamilyAllowances: familyAllowanceOwner === "A",
    extraElderlyCare: familyAllowanceOwner === "A" ? familyCareHomeExpenses : 0,
    married,
  });

  if (!married) {
    return {
      married: false,
      personA,
    };
  }

  return {
    married: true,
    personA,
    personB: mapPerson(state.personB, state, {
      includeFamilyAllowances: familyAllowanceOwner === "B",
      extraElderlyCare: familyAllowanceOwner === "B" ? familyCareHomeExpenses : 0,
      married,
    }),
  };
}

export const mapWizardStateToFamilyScenario = mapWizardStateToFamilyScenarioInput;

export function calculateMpfAutoFill(monthlyRelevantIncome: number, params: TaxYearParams): number {
  const clampedMonthlyIncome = Math.min(
    Math.max(monthlyRelevantIncome, params.mpf.minRelevantIncomeMonthly),
    params.mpf.maxRelevantIncomeMonthly,
  );
  const annualContribution = clampedMonthlyIncome * params.mpf.employeeRate * 12;

  return Math.min(annualContribution, params.deductionCaps.mpfMandatory);
}

function mapPerson(
  person: WizardPersonState,
  state: WizardState,
  options: {
    includeFamilyAllowances: boolean;
    extraElderlyCare: number;
    married: boolean;
  },
): PAPersonInput {
  const deductions = mapDeductions(person.deductions, options.extraElderlyCare);
  const allowances = mapAllowances(person, state.family, state, options);
  const result: PAPersonInput = {
    personId: person.personId,
    ...person.paEligibility,
  };

  if (person.incomeSources.hasSalary) {
    result.salaries = mapSalaries(person, deductions, allowances);
  } else {
    if (hasDeductions(deductions)) {
      result.deductions = deductions;
    }
    if (hasAllowances(allowances)) {
      result.allowances = allowances;
    }
  }

  if (person.incomeSources.hasProperty) {
    result.properties = mapProperties(person.properties);

    const letPropertyMortgageInterest = mapLetPropertyMortgageInterest(person.properties);
    if (letPropertyMortgageInterest.length > 0) {
      result.letPropertyMortgageInterest = letPropertyMortgageInterest;
    }
  }

  if (person.incomeSources.hasBusiness) {
    result.businesses = mapBusinesses(person);
  }

  if (person.paLossBroughtForward !== undefined && person.paLossBroughtForward > 0) {
    result.paLossBroughtForward = person.paLossBroughtForward;
  }

  return result;
}

function mapSalaries(
  person: WizardPersonState,
  deductions: SalariesInput["deductions"],
  allowances: SalariesInput["allowances"],
): SalariesInput {
  const salaries: SalariesInput = {
    incomeItems: person.salary.incomeItems.map((item) => ({
      key: item.key,
      labelZh: item.labelZh,
      labelEn: item.labelEn,
      amount: item.amount,
      ...(item.relateBack ? { relateBack: item.relateBack } : {}),
    })),
  };

  if (person.salary.outgoingsAndExpenses.length > 0) {
    salaries.outgoingsAndExpenses = person.salary.outgoingsAndExpenses.map((item) => ({ ...item }));
  }
  if (person.salary.depreciationAllowances.length > 0) {
    salaries.depreciationAllowances = person.salary.depreciationAllowances.map((item) => ({ ...item }));
  }
  if (person.salary.employerAccommodation.length > 0) {
    salaries.employerAccommodation = person.salary.employerAccommodation.map((item) => ({
      key: item.key,
      labelZh: item.labelZh,
      labelEn: item.labelEn,
      type: item.type,
      employerAssessableIncomeBeforeAccommodation: item.employerAssessableIncomeBeforeAccommodation,
      ...(item.employerOutgoingsAndExpenses !== undefined
        ? { employerOutgoingsAndExpenses: item.employerOutgoingsAndExpenses }
        : {}),
      ...(item.rateableValueElection !== undefined ? { rateableValueElection: item.rateableValueElection } : {}),
    }));
  }
  if (hasDeductions(deductions)) {
    salaries.deductions = deductions;
  }
  if (hasAllowances(allowances)) {
    salaries.allowances = allowances;
  }

  return salaries;
}

function mapProperties(properties: WizardPersonState["properties"]): PropertyInput[] {
  return properties.map((property) => ({
    id: property.id,
    rentReceived: property.rentReceived,
    ...(property.leasePremium !== undefined ? { leasePremium: property.leasePremium } : {}),
    ...(property.leaseTermMonths !== undefined ? { leaseTermMonths: property.leaseTermMonths } : {}),
    ...(property.premiumMonthsInYear !== undefined ? { premiumMonthsInYear: property.premiumMonthsInYear } : {}),
    ...(property.irrecoverableRent !== undefined ? { irrecoverableRent: property.irrecoverableRent } : {}),
    ...(property.irrecoverableRentRecovered !== undefined
      ? { irrecoverableRentRecovered: property.irrecoverableRentRecovered }
      : {}),
    ...(property.ratesPaidByOwner !== undefined ? { ratesPaidByOwner: property.ratesPaidByOwner } : {}),
    ...(property.ownershipShare !== undefined ? { ownershipShare: property.ownershipShare } : {}),
  }));
}

function mapLetPropertyMortgageInterest(
  properties: WizardPersonState["properties"],
): NonNullable<PAPersonInput["letPropertyMortgageInterest"]> {
  return properties
    .filter((property) => (property.letPropertyMortgageInterestForPA ?? 0) > 0)
    .map((property) => ({
      propertyId: property.id,
      interest: property.letPropertyMortgageInterestForPA ?? 0,
    }));
}

function mapBusinesses(person: WizardPersonState): BusinessInput[] {
  let electedCount = 0;
  const businesses = person.businesses.map((business) => {
    const electedTwoTier = person.electedTwoTierBusinessId === business.id;
    if (electedTwoTier) {
      electedCount += 1;
    }

    return {
      id: business.id,
      ...(business.name ? { name: business.name } : {}),
      revenue: business.revenue,
      deductibleExpenses: business.deductibleExpenses,
      ...(hasAddBacks(business.addBacks) ? { addBacks: business.addBacks } : {}),
      ...(hasCapitalAllowances(business.capitalAllowances)
        ? { capitalAllowances: business.capitalAllowances }
        : {}),
      ...(business.lossBroughtForward !== undefined && business.lossBroughtForward > 0
        ? { lossBroughtForward: business.lossBroughtForward }
        : {}),
      ...(electedTwoTier ? { electedTwoTier: true } : {}),
    };
  });

  if (electedCount > 1) {
    throw new Error(`At most one business can elect two-tier rates for person ${person.personId}.`);
  }

  return businesses;
}

function mapDeductions(
  deductions: WizardDeductions,
  extraElderlyCare: number,
): SalariesInput["deductions"] {
  const mapped: NonNullable<SalariesInput["deductions"]> = {};
  addPositive(mapped, "selfEducation", deductions.selfEducation);
  addPositive(mapped, "charitableDonations", deductions.charitableDonations);
  addPositive(mapped, "elderlyCare", (deductions.elderlyCare ?? 0) + extraElderlyCare);
  addPositive(mapped, "mpfMandatory", deductions.mpfMandatory);
  addPositive(mapped, "annuityAndTvc", deductions.annuityAndTvc);
  addPositive(mapped, "vhisPremiums", deductions.vhisPremiums);
  addPositive(mapped, "vhisInsuredPersons", deductions.vhisInsuredPersons);
  addPositive(mapped, "assistedReproduction", deductions.assistedReproduction);

  const housingAmount = deductions.housing.amount;
  if (housingAmount > 0 && deductions.housing.kind !== "none") {
    const housingInput = deductions.housing.eligibleForElevatedCap === true
      ? { amount: housingAmount, eligibleForElevatedCap: true }
      : housingAmount;

    if (deductions.housing.kind === "homeLoanInterest") {
      mapped.homeLoanInterest = housingInput;
    } else {
      mapped.domesticRent = housingInput;
    }
  }

  return mapped;
}

function mapAllowances(
  person: WizardPersonState,
  family: WizardFamilyState,
  state: WizardState,
  options: {
    includeFamilyAllowances: boolean;
    married: boolean;
  },
): SalariesInput["allowances"] {
  const allowances: NonNullable<SalariesInput["allowances"]> = {};

  // salaries.ts only grants the married person allowance for individual salaries/PA
  // computations when both flags are true: `isMarried && claimMarriedAllowance`.
  // Joint salaries and joint PA force the married allowance through their shared input.
  if (options.married) {
    allowances.isMarried = true;
    allowances.claimMarriedAllowance = state.claimMarriedAllowanceBy === person.personId;
  }

  if (options.includeFamilyAllowances) {
    if (family.children.length > 0) {
      allowances.children = family.children.map((child) => ({
        ...(child.key ? { key: child.key } : {}),
        bornInCurrentYear: isChildBornInCurrentYear(child.birthYear, state.year),
      }));
    }

    const parentAllowances = family.parents
      .filter((parent) => parent.inCareHome !== true)
      .map((parent, index) => ({
        ...(parent.key ? { key: parent.key } : { key: `parent-${index + 1}` }),
        age: parentAge(parent, state.year),
        ...(parent.residedWithTaxpayer !== undefined
          ? { residedWithTaxpayer: parent.residedWithTaxpayer }
          : {}),
      }));
    if (parentAllowances.length > 0) {
      allowances.parents = parentAllowances;
    }

    if (family.siblingCount > 0) {
      allowances.siblingCount = family.siblingCount;
    }
    if (family.singleParent) {
      allowances.singleParent = true;
    }
    if (family.disabledDependantCount > 0) {
      allowances.disabledDependantCount = family.disabledDependantCount;
    }
  }

  if (family.personalDisability[person.personId]) {
    allowances.personalDisability = true;
  }

  return allowances;
}

function sumCareHomeExpenses(family: WizardFamilyState): number {
  return family.parents
    .filter((parent) => parent.inCareHome === true)
    .reduce((sum, parent) => sum + (parent.careHomeExpenses ?? 0), 0);
}

function parentAge(parent: WizardParent, year: YearOfAssessment): number {
  if (parent.ageDuringYear !== undefined) {
    return parent.ageDuringYear;
  }

  return yearOfAssessmentEndYear(year) - (parent.birthYear ?? yearOfAssessmentEndYear(year));
}

function isChildBornInCurrentYear(birthYear: number, year: YearOfAssessment): boolean {
  // Wizard state stores only a birth year, not a full date. For YA 2025/26
  // (1 Apr 2025 to 31 Mar 2026), we flag `bornInCurrentYear` only when the
  // birth year equals the ending calendar year (2026), matching the Step 9
  // instruction to compare against the assessment year's ending calendar year.
  return birthYear === yearOfAssessmentEndYear(year);
}

function yearOfAssessmentEndYear(year: YearOfAssessment): number {
  return year === "2024_25" ? 2025 : 2026;
}

function addPositive<K extends keyof NonNullable<SalariesInput["deductions"]>>(
  target: NonNullable<SalariesInput["deductions"]>,
  key: K,
  value: NonNullable<SalariesInput["deductions"]>[K] | undefined,
): void {
  if (typeof value === "number" && value > 0) {
    target[key] = value;
  }
}

function hasDeductions(deductions: SalariesInput["deductions"]): boolean {
  return Object.keys(deductions ?? {}).length > 0;
}

function hasAllowances(allowances: SalariesInput["allowances"]): boolean {
  return Object.keys(allowances ?? {}).length > 0;
}

function hasAddBacks(addBacks: WizardPersonState["businesses"][number]["addBacks"]): boolean {
  return addBacks !== undefined && Object.values(addBacks).some((value) => value !== undefined && value > 0);
}

function hasCapitalAllowances(capitalAllowances: WizardPersonState["businesses"][number]["capitalAllowances"]): boolean {
  if (!capitalAllowances) {
    return false;
  }

  return Boolean(
    (capitalAllowances.pmInitialAdditions ?? 0) > 0
    || (capitalAllowances.buildingAllowance ?? 0) > 0
    || (capitalAllowances.pools ?? []).length > 0,
  );
}
