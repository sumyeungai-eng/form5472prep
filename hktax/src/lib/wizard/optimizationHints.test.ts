import { describe, expect, it } from "vitest";
import { getParams } from "../tax/params";
import { deriveHints, estimateMarginalRate } from "./optimizationHints";
import { createDefaultWizardState, type WizardPersonState, type WizardState } from "./wizardState";

const params = getParams("2025_26");

function baseState(): WizardState {
  return createDefaultWizardState();
}

function addSalary(person: WizardPersonState, amount: number): void {
  person.incomeSources.hasSalary = true;
  person.salary.incomeItems = [
    { key: `salary-${person.personId}`, labelZh: "薪金", labelEn: "Salary", amount },
  ];
}

function hintIds(state: WizardState): string[] {
  return deriveHints(state, params).map((hint) => hint.id);
}

describe("estimateMarginalRate", () => {
  it("returns the progressive marginal rate for a single salary in the top progressive band", () => {
    const state = baseState();
    addSalary(state.personA, 600_000);

    expect(estimateMarginalRate(state, params)).toBe(0.17);
  });

  it("returns null when there is no salary income", () => {
    expect(estimateMarginalRate(baseState(), params)).toBeNull();
  });
});

describe("deriveHints", () => {
  it("fires rule A when salary is present and mandatory MPF is unset", () => {
    const state = baseState();
    addSalary(state.personA, 300_000);

    expect(hintIds(state)).toContain("mpf-unfilled");
  });

  it("does not fire rule A when mandatory MPF is entered", () => {
    const state = baseState();
    addSalary(state.personA, 300_000);
    state.personA.deductions.mpfMandatory = 18_000;

    expect(hintIds(state)).not.toContain("mpf-unfilled");
  });

  it("fires rule B1 when a housing deduction is chosen and there may be a newborn child", () => {
    const state = baseState();
    addSalary(state.personA, 300_000);
    state.personA.deductions.housing = {
      kind: "domesticRent",
      amount: 80_000,
      eligibleForElevatedCap: false,
    };
    state.family.children = [{ key: "child-1", birthYear: 2026, bornDuringYearOfAssessment: true }];

    expect(hintIds(state)).toContain("housing-elevated-cap");
  });

  it("does not fire rule B1 when elevated-cap eligibility is already true", () => {
    const state = baseState();
    addSalary(state.personA, 300_000);
    state.personA.deductions.housing = {
      kind: "homeLoanInterest",
      amount: 80_000,
      eligibleForElevatedCap: true,
    };
    state.family.children = [{ key: "child-1", birthYear: 2026, bornDuringYearOfAssessment: true }];

    expect(hintIds(state)).not.toContain("housing-elevated-cap");
  });

  it("fires rule C with the expected estimated saving in a known marginal band", () => {
    const state = baseState();
    state.maritalStatus = "married";
    state.claimMarriedAllowanceBy = "none";
    addSalary(state.personA, 600_000);

    const hint = deriveHints(state, params).find((item) => item.id === "mpa-unclaimed");

    expect(hint?.estimatedSavingHKD).toBe((params.allowances.married - params.allowances.basic) * 0.17);
  });

  it("does not fire rule C when both spouses have income", () => {
    const state = baseState();
    state.maritalStatus = "married";
    state.claimMarriedAllowanceBy = "none";
    addSalary(state.personA, 600_000);
    addSalary(state.personB, 100_000);

    expect(hintIds(state)).not.toContain("mpa-unclaimed");
  });

  it("fires rule D when family allowances are allocated to a spouse with no income", () => {
    const state = baseState();
    state.maritalStatus = "married";
    state.claimingSpouseForFamilyAllowances = "B";
    addSalary(state.personA, 300_000);
    state.family.children = [{ key: "child-1", birthYear: 2020 }];

    expect(hintIds(state)).toContain("family-allowances-wasted");
  });

  it("does not fire rule D when the selected family-allowance claimant has income", () => {
    const state = baseState();
    state.maritalStatus = "married";
    state.claimingSpouseForFamilyAllowances = "B";
    addSalary(state.personA, 300_000);
    addSalary(state.personB, 100_000);
    state.family.children = [{ key: "child-1", birthYear: 2020 }];

    expect(hintIds(state)).not.toContain("family-allowances-wasted");
  });

  it("fires rule F with the expected estimated saving in a known marginal band", () => {
    const state = baseState();
    addSalary(state.personA, 600_000);
    state.personA.deductions.annuityAndTvc = 10_000;

    const hint = deriveHints(state, params).find((item) => item.id === "annuity-tvc-headroom");

    expect(hint?.estimatedSavingHKD).toBe((params.deductionCaps.annuityAndTvc - 10_000) * 0.17);
  });

  it("does not fire rule F when annuity and TVC is already at the cap", () => {
    const state = baseState();
    addSalary(state.personA, 600_000);
    state.personA.deductions.annuityAndTvc = params.deductionCaps.annuityAndTvc;

    expect(hintIds(state)).not.toContain("annuity-tvc-headroom");
  });

  it("fires rule K when VHIS premiums are entered without an insured-person count", () => {
    const state = baseState();
    addSalary(state.personA, 300_000);
    state.personA.deductions.vhisPremiums = 12_000;

    expect(hintIds(state)).toContain("vhis-count-missing");
  });

  it("does not fire rule K when the VHIS insured-person count is entered", () => {
    const state = baseState();
    addSalary(state.personA, 300_000);
    state.personA.deductions.vhisPremiums = 12_000;
    state.personA.deductions.vhisInsuredPersons = 2;

    expect(hintIds(state)).not.toContain("vhis-count-missing");
  });

  it("fires rule J when multiple businesses exist and no two-tier election has been made", () => {
    const state = baseState();
    state.personA.incomeSources.hasBusiness = true;
    state.personA.businesses = [
      { id: "biz-a", revenue: 500_000, deductibleExpenses: 100_000 },
      { id: "biz-b", revenue: 900_000, deductibleExpenses: 200_000 },
    ];

    expect(hintIds(state)).toContain("two-tier-unelected");
  });

  it("does not fire rule J when a two-tier business has already been elected", () => {
    const state = baseState();
    state.personA.incomeSources.hasBusiness = true;
    state.personA.electedTwoTierBusinessId = "biz-b";
    state.personA.businesses = [
      { id: "biz-a", revenue: 500_000, deductibleExpenses: 100_000 },
      { id: "biz-b", revenue: 900_000, deductibleExpenses: 200_000 },
    ];

    expect(hintIds(state)).not.toContain("two-tier-unelected");
  });
});
