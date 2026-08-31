import type { AccommodationType } from "../tax/salaries";
import type { YearOfAssessment } from "../tax/types";

export const WIZARD_STATE_VERSION = 1;

export type WizardPersonId = "A" | "B";
export type WizardMaritalStatus = "single" | "married";
export type WizardHousingDeductionKind = "none" | "homeLoanInterest" | "domesticRent";

export interface WizardBilingualLabel {
  labelZh: string;
  labelEn: string;
}

export interface WizardMoneyItem extends WizardBilingualLabel {
  key: string;
  amount: number;
}

export interface WizardIncomeItem extends WizardMoneyItem {
  relateBack?: {
    elected: boolean;
    months: number;
    currentYearMonths: number;
  };
}

export interface WizardEmployerAccommodation extends WizardBilingualLabel {
  key: string;
  type: AccommodationType;
  employerAssessableIncomeBeforeAccommodation: number;
  employerOutgoingsAndExpenses?: number;
  rateableValueElection?: number;
}

export interface WizardProperty {
  id: string;
  rentReceived: number;
  leasePremium?: number;
  leaseTermMonths?: number;
  premiumMonthsInYear?: number;
  irrecoverableRent?: number;
  irrecoverableRentRecovered?: number;
  ratesPaidByOwner?: number;
  ownershipShare?: number;
  letPropertyMortgageInterestForPA?: number;
}

export interface WizardCapitalAllowancePool {
  rate: 0.1 | 0.2 | 0.3;
  broughtForward: number;
  additions: number;
}

export interface WizardBusiness {
  id: string;
  name?: string;
  revenue: number;
  deductibleExpenses: number;
  addBacks?: {
    privatePortion?: number;
    capitalExpenditure?: number;
    proprietorSalaries?: number;
    nonDeductibleDonations?: number;
  };
  capitalAllowances?: {
    pmInitialAdditions?: number;
    pools?: WizardCapitalAllowancePool[];
    buildingAllowance?: number;
  };
  lossBroughtForward?: number;
}

export interface WizardHousingDeduction {
  kind: WizardHousingDeductionKind;
  amount: number;
  eligibleForElevatedCap?: boolean | null;
}

export interface WizardDeductions {
  selfEducation?: number;
  charitableDonations?: number;
  elderlyCare?: number;
  housing: WizardHousingDeduction;
  mpfMandatory?: number;
  annuityAndTvc?: number;
  vhisPremiums?: number;
  vhisInsuredPersons?: number;
  assistedReproduction?: number;
}

export interface WizardPAEligibility {
  ageDuringYear?: number;
  bothParentsDeceased?: boolean;
  isHongKongPermanentResident?: boolean;
  ordinarilyResidentInHongKong?: boolean;
  presentInHongKongMoreThan180Days?: boolean;
  presentInHongKongMoreThan300DaysAcrossTwoYears?: boolean;
}

export interface WizardIncomeSources {
  hasSalary: boolean;
  hasProperty: boolean;
  hasBusiness: boolean;
}

export interface WizardSalaryDetail {
  incomeItems: WizardIncomeItem[];
  outgoingsAndExpenses: WizardMoneyItem[];
  depreciationAllowances: WizardMoneyItem[];
  employerAccommodation: WizardEmployerAccommodation[];
}

export interface WizardPersonState {
  personId: WizardPersonId;
  paEligibility: WizardPAEligibility;
  incomeSources: WizardIncomeSources;
  salary: WizardSalaryDetail;
  properties: WizardProperty[];
  businesses: WizardBusiness[];
  electedTwoTierBusinessId: string | null;
  paLossBroughtForward?: number;
  deductions: WizardDeductions;
}

export interface WizardChild {
  key?: string;
  birthYear: number;
  bornDuringYearOfAssessment?: boolean;
}

export interface WizardParent {
  key?: string;
  birthYear?: number;
  ageDuringYear?: number;
  residedWithTaxpayer?: boolean;
  inCareHome?: boolean;
  careHomeExpenses?: number;
}

export interface WizardFamilyState {
  children: WizardChild[];
  parents: WizardParent[];
  siblingCount: number;
  singleParent: boolean;
  disabledDependantCount: number;
  personalDisability: Record<WizardPersonId, boolean>;
}

export interface WizardState {
  version: number;
  year: YearOfAssessment;
  maritalStatus: WizardMaritalStatus;
  personA: WizardPersonState;
  personB: WizardPersonState;
  claimingSpouseForFamilyAllowances: WizardPersonId;
  claimMarriedAllowanceBy: WizardPersonId | "none";
  family: WizardFamilyState;
}

export function createDefaultWizardPerson(personId: WizardPersonId): WizardPersonState {
  return {
    personId,
    paEligibility: {},
    incomeSources: {
      hasSalary: false,
      hasProperty: false,
      hasBusiness: false,
    },
    salary: {
      incomeItems: [],
      outgoingsAndExpenses: [],
      depreciationAllowances: [],
      employerAccommodation: [],
    },
    properties: [],
    businesses: [],
    electedTwoTierBusinessId: null,
    deductions: {
      housing: {
        kind: "none",
        amount: 0,
        eligibleForElevatedCap: null,
      },
    },
  };
}

export function createDefaultWizardState(): WizardState {
  return {
    version: WIZARD_STATE_VERSION,
    year: "2025_26",
    maritalStatus: "single",
    personA: createDefaultWizardPerson("A"),
    personB: createDefaultWizardPerson("B"),
    claimingSpouseForFamilyAllowances: "A",
    claimMarriedAllowanceBy: "none",
    family: {
      children: [],
      parents: [],
      siblingCount: 0,
      singleParent: false,
      disabledDependantCount: 0,
      personalDisability: {
        A: false,
        B: false,
      },
    },
  };
}
