import { assembleDemand, type DemandNote } from "@/lib/tax/provisional";
import { computeProfitsTax } from "@/lib/tax/profits";
import { computePropertyTax } from "@/lib/tax/property";
import {
  computeJointAssessment,
  computeSalariesTax,
  type SharedAllowanceInput,
} from "@/lib/tax/salaries";
import {
  computeJointPA,
  computePA,
  type PAPersonInput,
} from "@/lib/tax/personalAssessment";
import { personForIndividualPAScenario } from "@/lib/tax/optimizer";
import type { FamilyScenarioInput, OptimizerScenario } from "@/lib/tax/optimizer";
import type { Computation, ComputationLine, TaxYearParams } from "@/lib/tax/types";
import type { Bir60MappingFlag } from "./bir60Mapping";

export type DemandHead = "salaries" | "property" | "profits" | "pa";
export type ResultPersonId = "A" | "B" | "joint";

export type ResultComputation = {
  id: string;
  scenarioId: ResultScenarioId;
  personId: ResultPersonId;
  demandHead: DemandHead;
  titleZh: string;
  titleEn: string;
  computation: Computation;
};

type ResultScenarioId =
  | "separate"
  | "jointSalaries"
  | "pa"
  | "paIndividualA"
  | "paIndividualB"
  | "paIndividualBoth"
  | "paJoint";

export type ScenarioBreakdown = {
  scenario: OptimizerScenario;
  computations: ResultComputation[];
  bir60Flags: Bir60MappingFlag[];
};

export type DemandItem = ResultComputation & {
  demand: DemandNote;
};

export function buildScenarioBreakdown(
  family: FamilyScenarioInput,
  scenario: OptimizerScenario,
  params: TaxYearParams,
): ScenarioBreakdown {
  const computations = computationsForScenario(family, scenario, params);

  return {
    scenario,
    computations,
    bir60Flags: bir60FlagsForScenario(family, scenario, computations),
  };
}

export function buildDemandItems(breakdown: ScenarioBreakdown, params: TaxYearParams): DemandItem[] {
  return breakdown.computations
    .map((item) => ({
      ...item,
      demand: assembleDemand(item.demandHead, item.computation, params),
    }));
}

export function selectMarginalComputation(breakdown: ScenarioBreakdown): ResultComputation | undefined {
  const preferredHeads: DemandHead[] = ["pa", "salaries", "profits", "property"];

  for (const head of preferredHeads) {
    const candidates = breakdown.computations
      .filter((item) => item.demandHead === head)
      .sort((left, right) => right.computation.netChargeableIncome - left.computation.netChargeableIncome);

    if (candidates[0]) {
      return candidates[0];
    }
  }

  return undefined;
}

function computationsForScenario(
  family: FamilyScenarioInput,
  scenario: OptimizerScenario,
  params: TaxYearParams,
): ResultComputation[] {
  const scenarioId = scenario.id as ResultScenarioId;

  switch (scenarioId) {
    case "jointSalaries":
      return jointSalariesComputations(family, scenario, params);
    case "pa":
      return [paComputation("A", family.personA, scenario, params)];
    case "paIndividualA": {
      const personA = personForIndividualPAScenario(family.personA, family.personB, false, params);
      const personB = family.personB
        ? personForIndividualPAScenario(family.personB, family.personA, true, params)
        : undefined;

      return [
        paComputation("A", personA, scenario, params),
        ...separatePersonComputations("B", personB, scenario, params),
      ];
    }
    case "paIndividualB": {
      const personA = family.personB
        ? personForIndividualPAScenario(family.personA, family.personB, true, params)
        : family.personA;
      const personB = family.personB
        ? personForIndividualPAScenario(family.personB, family.personA, false, params)
        : undefined;

      return [
        ...separatePersonComputations("A", personA, scenario, params),
        ...separatePersonComputations("B", personB, scenario, params, { personalAssessment: true }),
      ];
    }
    case "paIndividualBoth": {
      const personB = family.personB;

      if (!personB) {
        return [paComputation("A", family.personA, scenario, params)];
      }

      return [
        paComputation(
          "A",
          personForIndividualPAScenario(family.personA, personB, true, params),
          scenario,
          params,
        ),
        paComputation(
          "B",
          personForIndividualPAScenario(personB, family.personA, true, params),
          scenario,
          params,
        ),
      ];
    }
    case "paJoint":
      return jointPAComputations(family, scenario, params);
    case "separate":
      return [
        ...separatePersonComputations("A", family.personA, scenario, params),
        ...separatePersonComputations("B", family.personB, scenario, params),
      ];
    default: {
      const _exhaustive: never = scenarioId;
      throw new Error(`Unsupported optimizer scenario id: ${_exhaustive}`);
    }
  }
}

function jointSalariesComputations(
  family: FamilyScenarioInput,
  scenario: OptimizerScenario,
  params: TaxYearParams,
): ResultComputation[] {
  if (!family.personB?.salaries || !family.personA.salaries) {
    return [
      ...separatePersonComputations("A", family.personA, scenario, params),
      ...separatePersonComputations("B", family.personB, scenario, params),
    ];
  }

  return [
    {
      id: `${scenario.id}.joint.salaries`,
      scenarioId: scenario.id as ResultScenarioId,
      personId: "joint",
      demandHead: "salaries",
      titleZh: "夫婦合併薪俸稅",
      titleEn: "Joint salaries tax",
      computation: computeJointAssessment(
        family.personA.salaries,
        family.personB.salaries,
        deriveSharedAllowances(family.personA, family.personB),
        params,
      ),
    },
    ...separatePersonComputations("A", family.personA, scenario, params, { omitSalaries: true }),
    ...separatePersonComputations("B", family.personB, scenario, params, { omitSalaries: true }),
  ];
}

function jointPAComputations(
  family: FamilyScenarioInput,
  scenario: OptimizerScenario,
  params: TaxYearParams,
): ResultComputation[] {
  if (!family.personB) {
    return [paComputation("A", family.personA, scenario, params)];
  }

  return [
    {
      id: `${scenario.id}.joint.pa`,
      scenarioId: scenario.id as ResultScenarioId,
      personId: "joint",
      demandHead: "pa",
      titleZh: "夫婦共同個人入息課稅",
      titleEn: "Joint Personal Assessment",
      computation: computeJointPA(
        family.personA,
        family.personB,
        deriveSharedAllowances(family.personA, family.personB),
        params,
      ),
    },
  ];
}

function separatePersonComputations(
  personId: "A" | "B",
  person: PAPersonInput | undefined,
  scenario: OptimizerScenario,
  params: TaxYearParams,
  options: { omitSalaries?: boolean; personalAssessment?: boolean } = {},
): ResultComputation[] {
  if (!person) {
    return [];
  }

  if (options.personalAssessment) {
    return [paComputation(personId, person, scenario, params)];
  }

  const personLabelZh = personId === "A" ? "納稅人甲" : "納稅人乙";
  const personLabelEn = personId === "A" ? "Person A" : "Person B";
  const computations: ResultComputation[] = [];

  if (!options.omitSalaries && person.salaries) {
    computations.push({
      id: `${scenario.id}.${personId}.salaries`,
      scenarioId: scenario.id as ResultScenarioId,
      personId,
      demandHead: "salaries",
      titleZh: `${personLabelZh}：薪俸稅`,
      titleEn: `${personLabelEn}: Salaries tax`,
      computation: computeSalariesTax(person.salaries, params),
    });
  }

  if (person.properties?.length) {
    computations.push({
      id: `${scenario.id}.${personId}.property`,
      scenarioId: scenario.id as ResultScenarioId,
      personId,
      demandHead: "property",
      titleZh: `${personLabelZh}：物業稅`,
      titleEn: `${personLabelEn}: Property tax`,
      computation: propertyComputation(person.properties, params),
    });
  }

  if (person.businesses?.length) {
    computations.push({
      id: `${scenario.id}.${personId}.profits`,
      scenarioId: scenario.id as ResultScenarioId,
      personId,
      demandHead: "profits",
      titleZh: `${personLabelZh}：利得稅`,
      titleEn: `${personLabelEn}: Profits tax`,
      computation: profitsComputation(person.businesses, params),
    });
  }

  return computations;
}

function paComputation(
  personId: "A" | "B",
  person: PAPersonInput,
  scenario: OptimizerScenario,
  params: TaxYearParams,
): ResultComputation {
  const personLabelZh = personId === "A" ? "納稅人甲" : "納稅人乙";
  const personLabelEn = personId === "A" ? "Person A" : "Person B";

  return {
    id: `${scenario.id}.${personId}.pa`,
    scenarioId: scenario.id as ResultScenarioId,
    personId,
    demandHead: "pa",
    titleZh: `${personLabelZh}：個人入息課稅`,
    titleEn: `${personLabelEn}: Personal Assessment`,
    computation: computePA(person, params),
  };
}

function propertyComputation(properties: NonNullable<PAPersonInput["properties"]>, params: TaxYearParams): Computation {
  const property = computePropertyTax(properties, params);

  return {
    head: "property",
    lines: property.lines,
    netAssessableIncome: property.totalNav,
    netChargeableIncome: property.totalNav,
    taxAtProgressive: property.totalTax,
    taxAtStandard: property.totalTax,
    basisUsed: "standard",
    taxBeforeReduction: property.totalTax,
    reduction: 0,
    finalTax: property.totalTax,
  };
}

function profitsComputation(businesses: NonNullable<PAPersonInput["businesses"]>, params: TaxYearParams): Computation {
  const profits = computeProfitsTax(businesses, params);
  const detailLines = profits.perBusiness.flatMap((business) =>
    prefixLines(business.lines, business.id, business.id, business.id),
  );

  return {
    head: "profits",
    lines: [...detailLines, ...profits.lines],
    netAssessableIncome: profits.totalAssessableProfits,
    netChargeableIncome: profits.totalAssessableProfits,
    taxAtProgressive: profits.totalTax,
    taxAtStandard: profits.totalTax,
    basisUsed: "standard",
    taxBeforeReduction: profits.totalTax,
    reduction: profits.reduction,
    finalTax: profits.finalTax,
  };
}

function prefixLines(
  lines: ComputationLine[],
  prefix: string,
  labelPrefixZh: string,
  labelPrefixEn: string,
): ComputationLine[] {
  return lines.map((line) => ({
    ...line,
    key: `${prefix}.${line.key}`,
    labelZh: `${labelPrefixZh}：${line.labelZh}`,
    labelEn: `${labelPrefixEn}: ${line.labelEn}`,
  }));
}

function deriveSharedAllowances(a: PAPersonInput, b: PAPersonInput): SharedAllowanceInput {
  const allowanceA = a.allowances ?? a.salaries?.allowances ?? {};
  const allowanceB = b.allowances ?? b.salaries?.allowances ?? {};

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

function bir60FlagsForScenario(
  family: FamilyScenarioInput,
  scenario: OptimizerScenario,
  computations: ResultComputation[],
): Bir60MappingFlag[] {
  const people = [family.personA, family.personB].filter((person): person is PAPersonInput => Boolean(person));
  const flags = new Set<Bir60MappingFlag>();

  if (people.some((person) => person.properties?.length)) {
    flags.add("propertyIncome");
  }
  if (people.some((person) => person.salaries)) {
    flags.add("salariesIncome");
  }
  if (people.some((person) => person.businesses?.length)) {
    flags.add("profitsIncome");
  }
  if (
    scenario.id === "pa"
    || scenario.id === "paIndividualA"
    || scenario.id === "paIndividualB"
    || scenario.id === "paIndividualBoth"
    || scenario.id === "paJoint"
  ) {
    flags.add("personalAssessmentElection");
  }
  if (scenario.id === "jointSalaries") {
    flags.add("jointSalariesElection");
  }
  if (scenario.id === "paJoint") {
    flags.add("jointPersonalAssessmentElection");
  }
  const personalComputations = computations.filter(
    (item) => item.demandHead === "salaries" || item.demandHead === "pa",
  );

  if (personalComputations.some((item) => item.computation.lines.some(
    (line) => line.kind === "deduction" && line.amount !== 0,
  ))) {
    flags.add("deductions");
  }
  if (personalComputations.some((item) => item.computation.lines.some(
    (line) => line.kind === "allowance" && line.key.startsWith("allowance.") && line.amount !== 0,
  ))) {
    flags.add("allowances");
  }

  return Array.from(flags);
}
