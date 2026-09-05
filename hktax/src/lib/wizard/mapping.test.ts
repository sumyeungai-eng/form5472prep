import { describe, expect, it } from "vitest";
import { getParams } from "../tax/params";
import type { FamilyScenarioInput } from "../tax/optimizer";
import type { TaxYearParams } from "../tax/types";
import {
  calculateMpfAutoFill,
  mapWizardStateToFamilyScenarioInput,
} from "./mapping";
import { defaultMoneyItem } from "./defaultItems";
import { createDefaultWizardState, type WizardState } from "./wizardState";
import { wizardStateSchema } from "./wizardSchemas";

function baseState(): WizardState {
  return {
    ...createDefaultWizardState(),
    personA: {
      ...createDefaultWizardState().personA,
      paEligibility: {
        ageDuringYear: 35,
        isHongKongPermanentResident: true,
      },
    },
    personB: {
      ...createDefaultWizardState().personB,
      paEligibility: {
        ageDuringYear: 34,
        isHongKongPermanentResident: true,
      },
    },
  };
}

function salaryStateWithChild(child: WizardState["family"]["children"][number]): WizardState {
  const state = baseState();
  state.personA.incomeSources.hasSalary = true;
  state.personA.salary.incomeItems = [
    { key: "salary", labelZh: "薪金", labelEn: "Salary", amount: 300_000 },
  ];
  state.family.children = [child];

  return state;
}

function mappedChildBornInCurrentYear(state: WizardState): boolean | undefined {
  return mapWizardStateToFamilyScenarioInput(state).personA.salaries?.allowances?.children?.[0]?.bornInCurrentYear;
}

describe("mapWizardStateToFamilyScenarioInput", () => {
  it("maps a single employee salary-only wizard state to a single-person family input", () => {
    const state = baseState();
    state.personA.incomeSources.hasSalary = true;
    state.personA.salary.incomeItems = [
      { key: "salary", labelZh: "薪金", labelEn: "Salary", amount: 300_000 },
    ];

    const expected: FamilyScenarioInput = {
      married: false,
      personA: {
        personId: "A",
        ageDuringYear: 35,
        isHongKongPermanentResident: true,
        salaries: {
          incomeItems: [
            { key: "salary", labelZh: "薪金", labelEn: "Salary", amount: 300_000 },
          ],
        },
      },
    };

    expect(mapWizardStateToFamilyScenarioInput(state)).toEqual(expected);
  });

  it("nominates married salary, children, and elevated domestic rent to the selected spouse only", () => {
    const state = baseState();
    state.maritalStatus = "married";
    state.claimingSpouseForFamilyAllowances = "B";
    state.personA.incomeSources.hasSalary = true;
    state.personB.incomeSources.hasSalary = true;
    state.personA.salary.incomeItems = [
      { key: "salary-a", labelZh: "甲薪金", labelEn: "Salary A", amount: 600_000 },
    ];
    state.personB.salary.incomeItems = [
      { key: "salary-b", labelZh: "乙薪金", labelEn: "Salary B", amount: 420_000 },
    ];
    state.personB.deductions.housing = {
      kind: "domesticRent",
      amount: 110_000,
      eligibleForElevatedCap: true,
    };
    state.family.children = [
      { key: "older-child", birthYear: 2020 },
      { key: "newborn", birthYear: 2026 },
    ];

    const expected: FamilyScenarioInput = {
      married: true,
      personA: {
        personId: "A",
        ageDuringYear: 35,
        isHongKongPermanentResident: true,
        salaries: {
          incomeItems: [
            { key: "salary-a", labelZh: "甲薪金", labelEn: "Salary A", amount: 600_000 },
          ],
          allowances: {
            isMarried: true,
            claimMarriedAllowance: false,
          },
        },
      },
      personB: {
        personId: "B",
        ageDuringYear: 34,
        isHongKongPermanentResident: true,
        salaries: {
          incomeItems: [
            { key: "salary-b", labelZh: "乙薪金", labelEn: "Salary B", amount: 420_000 },
          ],
          deductions: {
            domesticRent: { amount: 110_000, eligibleForElevatedCap: true },
          },
          allowances: {
            isMarried: true,
            claimMarriedAllowance: false,
            children: [
              { key: "older-child", bornInCurrentYear: false },
              { key: "newborn", bornInCurrentYear: true },
            ],
          },
        },
      },
    };

    expect(mapWizardStateToFamilyScenarioInput(state)).toEqual(expected);
  });

  it("uses an explicit born-during-assessment-year true flag even when the birth-year heuristic is false", () => {
    const state = salaryStateWithChild({
      key: "apr-dec-newborn",
      birthYear: 2025,
      bornDuringYearOfAssessment: true,
    });

    expect(mappedChildBornInCurrentYear(state)).toBe(true);
  });

  it("uses an explicit born-during-assessment-year false flag even when the birth-year heuristic is true", () => {
    const state = salaryStateWithChild({
      key: "jan-mar-not-current-ya",
      birthYear: 2026,
      bornDuringYearOfAssessment: false,
    });

    expect(mappedChildBornInCurrentYear(state)).toBe(false);
  });

  it("preserves the legacy child birth-year heuristic when the explicit flag is absent and heuristic is true", () => {
    const state = salaryStateWithChild({
      key: "legacy-newborn",
      birthYear: 2026,
    });

    expect(mappedChildBornInCurrentYear(state)).toBe(true);
  });

  it("preserves the legacy child birth-year heuristic when the explicit flag is absent and heuristic is false", () => {
    const state = salaryStateWithChild({
      key: "legacy-older-child",
      birthYear: 2025,
    });

    expect(mappedChildBornInCurrentYear(state)).toBe(false);
  });

  it("parses legacy stored wizard state without child born-during-assessment-year flags", () => {
    const storedState = {
      ...createDefaultWizardState(),
      family: {
        ...createDefaultWizardState().family,
        children: [
          { key: "legacy-child", birthYear: 2020 },
        ],
      },
    };

    const result = wizardStateSchema.safeParse(storedState);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.family.children).toEqual([
        { key: "legacy-child", birthYear: 2020 },
      ]);
    }
  });

  it("maps salary, rental property, sole-proprietor business, PA mortgage interest, and a dependent parent allowance", () => {
    const state = baseState();
    state.personA.incomeSources = { hasSalary: true, hasProperty: true, hasBusiness: true };
    state.personA.salary.incomeItems = [
      { key: "salary", labelZh: "薪金", labelEn: "Salary", amount: 500_000 },
    ];
    state.personA.properties = [
      {
        id: "flat-a",
        rentReceived: 240_000,
        ratesPaidByOwner: 12_000,
        ownershipShare: 0.5,
        letPropertyMortgageInterestForPA: 40_000,
      },
    ];
    state.personA.businesses = [
      {
        id: "biz-a",
        name: "Consulting",
        revenue: 800_000,
        deductibleExpenses: 300_000,
      },
    ];
    state.family.parents = [
      {
        key: "mother",
        ageDuringYear: 66,
        residedWithTaxpayer: true,
      },
    ];

    const expected: FamilyScenarioInput = {
      married: false,
      personA: {
        personId: "A",
        ageDuringYear: 35,
        isHongKongPermanentResident: true,
        salaries: {
          incomeItems: [
            { key: "salary", labelZh: "薪金", labelEn: "Salary", amount: 500_000 },
          ],
          allowances: {
            parents: [
              { key: "mother", age: 66, residedWithTaxpayer: true },
            ],
          },
        },
        properties: [
          {
            id: "flat-a",
            rentReceived: 240_000,
            ratesPaidByOwner: 12_000,
            ownershipShare: 0.5,
          },
        ],
        letPropertyMortgageInterest: [
          { propertyId: "flat-a", interest: 40_000 },
        ],
        businesses: [
          {
            id: "biz-a",
            name: "Consulting",
            revenue: 800_000,
            deductibleExpenses: 300_000,
          },
        ],
      },
    };

    expect(mapWizardStateToFamilyScenarioInput(state)).toEqual(expected);
  });

  it("maps a care-home parent to elderly-care deductions instead of parent allowances", () => {
    const state = baseState();
    state.personA.incomeSources.hasSalary = true;
    state.personA.salary.incomeItems = [
      { key: "salary", labelZh: "薪金", labelEn: "Salary", amount: 500_000 },
    ];
    state.family.parents = [
      {
        key: "father",
        ageDuringYear: 78,
        residedWithTaxpayer: false,
        inCareHome: true,
        careHomeExpenses: 80_000,
      },
    ];

    const expected: FamilyScenarioInput = {
      married: false,
      personA: {
        personId: "A",
        ageDuringYear: 35,
        isHongKongPermanentResident: true,
        salaries: {
          incomeItems: [
            { key: "salary", labelZh: "薪金", labelEn: "Salary", amount: 500_000 },
          ],
          deductions: {
            elderlyCare: 80_000,
          },
        },
      },
    };

    expect(mapWizardStateToFamilyScenarioInput(state)).toEqual(expected);
  });

  it("maps a single selected two-tier business election and leaves other businesses unelected", () => {
    const state = baseState();
    state.personA.incomeSources.hasBusiness = true;
    state.personA.electedTwoTierBusinessId = "biz-b";
    state.personA.businesses = [
      {
        id: "biz-a",
        revenue: 1_000_000,
        deductibleExpenses: 300_000,
      },
      {
        id: "biz-b",
        revenue: 3_000_000,
        deductibleExpenses: 800_000,
      },
    ];

    const expected: FamilyScenarioInput = {
      married: false,
      personA: {
        personId: "A",
        ageDuringYear: 35,
        isHongKongPermanentResident: true,
        businesses: [
          {
            id: "biz-a",
            revenue: 1_000_000,
            deductibleExpenses: 300_000,
          },
          {
            id: "biz-b",
            revenue: 3_000_000,
            deductibleExpenses: 800_000,
            electedTwoTier: true,
          },
        ],
      },
    };

    expect(mapWizardStateToFamilyScenarioInput(state)).toEqual(expected);
  });

  it("throws if duplicated business IDs would violate the single two-tier election invariant", () => {
    const state = baseState();
    state.personA.incomeSources.hasBusiness = true;
    state.personA.electedTwoTierBusinessId = "biz-a";
    state.personA.businesses = [
      { id: "biz-a", revenue: 1, deductibleExpenses: 0 },
      { id: "biz-a", revenue: 2, deductibleExpenses: 0 },
    ];

    expect(() => mapWizardStateToFamilyScenarioInput(state)).toThrow("At most one business");
  });
});

describe("calculateMpfAutoFill", () => {
  const params = getParams("2025_26");

  it("calculates annual mandatory MPF for monthly income inside the relevant-income band", () => {
    expect(calculateMpfAutoFill(20_000, params)).toBe(12_000);
  });

  it("clamps monthly relevant income at the MPF floor", () => {
    expect(calculateMpfAutoFill(1_000, params)).toBe(4_260);
  });

  it("clamps monthly relevant income at the MPF ceiling", () => {
    const uncappedParams: TaxYearParams = {
      ...params,
      deductionCaps: {
        ...params.deductionCaps,
        mpfMandatory: 999_999,
      },
    };

    expect(calculateMpfAutoFill(50_000, uncappedParams)).toBe(18_000);
  });

  it("caps the annual MPF deduction after applying the monthly clamp", () => {
    const highRateParams: TaxYearParams = {
      ...params,
      mpf: {
        ...params.mpf,
        employeeRate: 0.1,
      },
    };

    expect(calculateMpfAutoFill(30_000, highRateParams)).toBe(params.deductionCaps.mpfMandatory);
  });
});

describe("defaultMoneyItem", () => {
  it("uses human-readable labels for income items", () => {
    expect(defaultMoneyItem("income", 1)).toEqual({
      key: "income-1",
      labelZh: "薪金",
      labelEn: "Salary",
      amount: 0,
    });
    expect(defaultMoneyItem("income", 2)).toEqual({
      key: "income-2",
      labelZh: "收入項目 2",
      labelEn: "Income item 2",
      amount: 0,
    });
  });
});
