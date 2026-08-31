import type { FamilyScenarioInput, OptimizerPersonResult, OptimizerResult } from "@/lib/tax/optimizer";
import { ALL_YEARS, DEFAULT_YEAR, getParams } from "@/lib/tax/params";
import { computeProfitsTax } from "@/lib/tax/profits";
import { computePropertyTax } from "@/lib/tax/property";
import { computeSalariesTax } from "@/lib/tax/salaries";
import type { PAPersonInput } from "@/lib/tax/personalAssessment";
import type { TaxYearParams, YearOfAssessment } from "@/lib/tax/types";

export type ResolvedResultYear = {
  year: YearOfAssessment;
  params: TaxYearParams;
  exactMatch: boolean;
};

type SeparateTotals = Pick<OptimizerPersonResult, "salariesTax" | "propertyTax" | "profitsTax">;

export function resolveResultYear(
  family: FamilyScenarioInput,
  optimizerResult: OptimizerResult,
): ResolvedResultYear {
  const separateScenario = optimizerResult.scenarios.find((scenario) => scenario.id === "separate");

  if (!separateScenario) {
    return fallbackYear();
  }

  for (const year of ALL_YEARS) {
    const params = getParams(year);

    try {
      const personAMatches = personTotalsMatch(
        recomputeSeparateTotals(family.personA, params),
        separateScenario.perPerson.a,
      );
      const personBMatches = family.personB && separateScenario.perPerson.b
        ? personTotalsMatch(recomputeSeparateTotals(family.personB, params), separateScenario.perPerson.b)
        : family.personB === undefined && separateScenario.perPerson.b === undefined;

      if (personAMatches && personBMatches) {
        return { year, params, exactMatch: true };
      }
    } catch {
      // Try the next year. Invalid stored data should not make the result page unusable.
    }
  }

  return fallbackYear();
}

function fallbackYear(): ResolvedResultYear {
  const params = getParams(DEFAULT_YEAR);
  return { year: DEFAULT_YEAR, params, exactMatch: false };
}

function recomputeSeparateTotals(person: PAPersonInput, params: TaxYearParams): SeparateTotals {
  return {
    salariesTax: person.salaries ? computeSalariesTax(person.salaries, params).finalTax : 0,
    propertyTax: computePropertyTax(person.properties ?? [], params).totalTax,
    profitsTax: person.businesses?.length ? computeProfitsTax(person.businesses, params).finalTax : 0,
  };
}

function personTotalsMatch(recomputed: SeparateTotals, stored: SeparateTotals): boolean {
  return recomputed.salariesTax === stored.salariesTax
    && recomputed.propertyTax === stored.propertyTax
    && recomputed.profitsTax === stored.profitsTax;
}
