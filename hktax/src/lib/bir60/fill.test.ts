import { describe, expect, it } from "vitest";

import type { StoredWizardResult } from "../../components/wizard/resultsStorage";
import { getParams } from "../tax/params";
import type { YearOfAssessment } from "../tax/types";
import { optimize } from "../tax/optimizer";
import { mapWizardStateToFamilyScenarioInput } from "../wizard/mapping";
import { createDefaultWizardState, type WizardPersonId, type WizardPersonState, type WizardState } from "../wizard/wizardState";

import { fillBir60, type FilledBir60, type FilledBir60Box } from "./fill";

function addSalary(person: WizardPersonState, amount: number): void {
  person.incomeSources.hasSalary = true;
  person.salary.incomeItems = [{ key: "salary", labelZh: "薪金", labelEn: "Salary", amount }];
}

function makeEligible(person: WizardPersonState): void {
  person.paEligibility = {
    ageDuringYear: 35,
    isHongKongPermanentResident: true,
  };
}

function storedFromWizard(wizard: WizardState): { results: StoredWizardResult; params: ReturnType<typeof getParams> } {
  const params = getParams(wizard.year);
  const familyScenarioInput = mapWizardStateToFamilyScenarioInput(wizard);
  return {
    params,
    results: {
      familyScenarioInput,
      optimizerResult: optimize(familyScenarioInput, params),
      storedAt: "2026-09-01T00:00:00.000Z",
    },
  };
}

function filled(wizard: WizardState, personId: WizardPersonId = "A"): FilledBir60 {
  const { results, params } = storedFromWizard(wizard);
  const draft = fillBir60(personId, wizard, results, {}, params);
  if (!draft) {
    throw new Error("Expected BIR60 draft");
  }
  return draft;
}

function box(draft: FilledBir60, id: string): FilledBir60Box {
  const found = draft.parts.flatMap((part) => part.sections).flatMap((section) => section.boxes)
    .find((item) => item.id === id);
  if (!found) {
    throw new Error(`Missing box ${id}`);
  }
  return found;
}

describe("fillBir60", () => {
  it("fills salary-only single filer income and leaves PA election unticked when separate wins", () => {
    const wizard = createDefaultWizardState();
    addSalary(wizard.personA, 600_000);

    const { results, params } = storedFromWizard(wizard);
    expect(results.optimizerResult.best).toBe("separate");

    const draft = fillBir60("A", wizard, results, {}, params);
    expect(draft).not.toBeNull();
    expect(box(draft!, "part4.grandTotalIncome").value).toBe(600_000);
    expect(box(draft!, "part7.paSeparateElection").value).toBe(false);
    expect(box(draft!, "part12.child1.dob").value).toBeNull();
  });

  it("keeps entered domestic rent above the cap and fills child allowance rows for the claiming spouse", () => {
    const wizard = createDefaultWizardState();
    wizard.maritalStatus = "married";
    wizard.claimingSpouseForFamilyAllowances = "A";
    wizard.claimMarriedAllowanceBy = "A";
    addSalary(wizard.personA, 600_000);
    wizard.personA.deductions.housing = {
      kind: "domesticRent",
      amount: 130_000,
      eligibleForElevatedCap: false,
    };
    wizard.family.children = [{ birthYear: 2018 }, { birthYear: 2024 }];

    const draft = filled(wizard, "A");

    expect(box(draft, "part8.property1.domesticRent")).toMatchObject({
      boxNo: "84",
      value: 130_000,
      noteEn: expect.stringContaining("HK$100,000 cap"),
    });
    expect(box(draft, "part12.child1.dob")).toMatchObject({
      boxNo: "148",
      value: "2018",
    });
    expect(box(draft, "part12.child2.dob")).toMatchObject({
      boxNo: "152",
      value: "2024",
    });
    expect(box(draft, "part12.spouseHadIncome")).toMatchObject({
      boxNo: "143",
      value: false,
      noteEn: expect.stringContaining("Married Person's Allowance"),
    });
  });

  it("ticks the second business two-tier election box only", () => {
    const wizard = createDefaultWizardState();
    wizard.personA.incomeSources.hasBusiness = true;
    wizard.personA.businesses = [
      { id: "biz-1", revenue: 500_000, deductibleExpenses: 100_000 },
      { id: "biz-2", revenue: 800_000, deductibleExpenses: 150_000 },
    ];
    wizard.personA.electedTwoTierBusinessId = "biz-2";

    const draft = filled(wizard, "A");

    expect(box(draft, "part5.business1.twoTierRatesElection")).toMatchObject({
      boxNo: "51",
      value: false,
      noteEn: undefined,
    });
    expect(box(draft, "part5.business2.twoTierRatesElection")).toMatchObject({
      boxNo: "63",
      value: true,
    });
  });

  it("aggregates only solely-owned properties in Part 3 and keeps box 10 pre-allowance", () => {
    const wizard = createDefaultWizardState();
    wizard.personA.incomeSources.hasProperty = true;
    wizard.personA.properties = [
      {
        id: "sole-flat",
        rentReceived: 240_000,
        leasePremium: 120_000,
        leaseTermMonths: 24,
        premiumMonthsInYear: 12,
        ratesPaidByOwner: 12_000,
        irrecoverableRent: 30_000,
      },
      {
        id: "joint-flat",
        rentReceived: 100_000,
        ratesPaidByOwner: 5_000,
        ownershipShare: 0.5,
      },
    ];

    const draft = filled(wizard, "A");

    expect(box(draft, "part3.totalPropertiesLet").value).toBe(1);
    expect(box(draft, "part3.totalRatesAndIrrecoverableRent").value).toBe(42_000);
    expect(box(draft, "part3.totalNetBeforeAllowance").value).toBe(258_000);
    expect(box(draft, "part3.totalNetBeforeAllowance").noteEn).toContain("before the 20%");
    expect(box(draft, "part3.jointOwnershipExclusion").noteEn).toContain("1 jointly-owned");
  });

  it("ticks box 68 only on Person A when the winning scenario is paIndividualA", () => {
    const wizard = createDefaultWizardState();
    wizard.maritalStatus = "married";
    makeEligible(wizard.personA);
    makeEligible(wizard.personB);
    wizard.personA.incomeSources.hasProperty = true;
    wizard.personA.properties = [{ id: "flat-a", rentReceived: 300_000, letPropertyMortgageInterestForPA: 100_000 }];
    addSalary(wizard.personB, 500_000);

    const { results, params } = storedFromWizard(wizard);
    expect(results.optimizerResult.best).toBe("paIndividualA");

    const draftA = fillBir60("A", wizard, results, {}, params);
    const draftB = fillBir60("B", wizard, results, {}, params);

    expect(box(draftA!, "part7.paSeparateElection")).toMatchObject({
      boxNo: "68",
      value: true,
      noteEn: expect.stringContaining("recommendation"),
    });
    expect(box(draftB!, "part7.paSeparateElection")).toMatchObject({
      boxNo: "68",
      value: false,
    });
  });

  it("passes particulars through and swaps self/spouse identity boxes for Person B", () => {
    const wizard = createDefaultWizardState();
    wizard.maritalStatus = "married";
    addSalary(wizard.personA, 400_000);
    addSalary(wizard.personB, 300_000);
    const { results, params } = storedFromWizard(wizard);
    const particulars = {
      taxpayerName: "CHAN Tai Man",
      taxpayerHkid: "A123456(7)",
      spouseName: "LEE Siu Mei",
      spouseHkid: "B765432(1)",
      employerName: "Example Employer Limited",
      employerFileNo: "6-12345678",
      businessName: "Example Shop",
      businessBrNo: "12345678-000",
      propertyAddresses: ["Flat A"],
      childrenNames: ["Child One"],
    };

    const draftA = fillBir60("A", wizard, results, particulars, params);
    const draftB = fillBir60("B", wizard, results, particulars, params);

    expect(box(draftA!, "part1.selfName").value).toBe("CHAN Tai Man");
    expect(box(draftA!, "part1.selfHkid").value).toBe("A123456(7)");
    expect(box(draftB!, "part1.selfName").value).toBe("LEE Siu Mei");
    expect(box(draftB!, "part1.selfHkid").value).toBe("B765432(1)");
    expect(box(draftB!, "part1.spouseName").value).toBe("CHAN Tai Man");
    expect(box(draftB!, "part1.spouseHkid").value).toBe("A123456(7)");
  });

  it("returns null for empty optimizer results", () => {
    const wizard = createDefaultWizardState();
    const params = getParams("2025_26");
    const emptyResults: StoredWizardResult = {
      familyScenarioInput: { married: false, personA: {} },
      optimizerResult: {
        scenarios: [],
        best: "",
        saving: 0,
        explanationZh: "",
        explanationEn: "",
      },
      storedAt: "",
    };

    expect(fillBir60("A", wizard, emptyResults, {}, params)).toBeNull();
  });

  it("returns null for Person B on a single-filer wizard", () => {
    const wizard = createDefaultWizardState();
    addSalary(wizard.personA, 600_000);
    const { results, params } = storedFromWizard(wizard);

    expect(fillBir60("B", wizard, results, {}, params)).toBeNull();
  });

  it("uses the supplied tax year params on the filled draft", () => {
    const wizard = createDefaultWizardState();
    wizard.year = "2024_25" as YearOfAssessment;
    addSalary(wizard.personA, 300_000);
    const { results, params } = storedFromWizard(wizard);

    expect(fillBir60("A", wizard, results, {}, params)?.year).toBe("2024_25");
  });
});
