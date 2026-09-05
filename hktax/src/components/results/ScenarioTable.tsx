import { formatHKD } from "@/components/wizard/FormFields";
import type { OptimizerResult, OptimizerScenario } from "@/lib/tax/optimizer";
import type { ResultsLanguage } from "@/lib/results/resultsDictionary";
import { resultsDictionary, resultsT } from "@/lib/results/resultsDictionary";

type ScenarioTableProps = {
  optimizerResult: OptimizerResult;
  lang: ResultsLanguage;
};

export function ScenarioTable({ optimizerResult, lang }: ScenarioTableProps) {
  const bestScenario = optimizerResult.scenarios.find((scenario) => scenario.id === optimizerResult.best);
  const tableHeadingTracking = lang === "en" ? "tracking-[0.12em] uppercase" : "";

  return (
    <section className="card p-5 sm:p-8">
      <h2 className="display-subsection">
        {resultsT(resultsDictionary.scenarioComparison, lang)}
      </h2>
      <div className="mt-5 overflow-x-auto rounded-md border border-warm-150 shadow-field">
        <table className="min-w-full divide-y divide-warm-200 text-left text-sm">
          <thead className={`bg-warm-50 text-xs text-warm-600 ${tableHeadingTracking}`}>
            <tr>
              <Column>{resultsT(resultsDictionary.scenario, lang)}</Column>
              <Column>{resultsT(resultsDictionary.status, lang)}</Column>
              <Column>{resultsT(resultsDictionary.personA, lang)}</Column>
              <Column>{resultsT(resultsDictionary.personB, lang)}</Column>
              <Column>{resultsT(resultsDictionary.totalTax, lang)}</Column>
              <Column>{resultsT(resultsDictionary.why, lang)}</Column>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100 text-warm-700">
            {optimizerResult.scenarios.map((scenario) => (
              <ScenarioRow
                key={scenario.id}
                bestScenario={bestScenario}
                isWinner={scenario.id === optimizerResult.best}
                lang={lang}
                optimizerResult={optimizerResult}
                scenario={scenario}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Column({ children }: { children: string }) {
  return <th className="px-3 py-3 font-bold">{children}</th>;
}

function ScenarioRow({
  bestScenario,
  isWinner,
  lang,
  optimizerResult,
  scenario,
}: {
  bestScenario: OptimizerScenario | undefined;
  isWinner: boolean;
  lang: ResultsLanguage;
  optimizerResult: OptimizerResult;
  scenario: OptimizerScenario;
}) {
  return (
    <tr className={isWinner ? "bg-teal-50" : undefined}>
      <td className="px-3 py-3 align-top">
        <div className="font-semibold text-navy-900">
          {lang === "zh" ? scenario.labelZh : scenario.labelEn}
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${
          scenario.available ? "bg-teal-100 text-teal-800" : "bg-warm-100 text-warm-700"
        }`}
        >
          {isWinner
            ? resultsT(resultsDictionary.winner, lang)
            : resultsT(scenario.available ? resultsDictionary.available : resultsDictionary.unavailable, lang)}
        </span>
      </td>
      <td className="px-3 py-3 align-top">{personTotal(scenario.perPerson.a.finalTax, scenario.available)}</td>
      <td className="px-3 py-3 align-top">
        {scenario.perPerson.b ? personTotal(scenario.perPerson.b.finalTax, scenario.available) : "-"}
      </td>
      <td className="px-3 py-3 align-top font-bold text-navy-900">
        {scenario.available ? formatHKD(scenario.totalTax) : "-"}
      </td>
      <td className="max-w-md px-3 py-3 align-top leading-6">
        {scenarioWhy(scenario, optimizerResult, bestScenario, isWinner, lang)}
      </td>
    </tr>
  );
}

function personTotal(amount: number, available: boolean): string {
  if (!available || !Number.isFinite(amount)) {
    return "-";
  }
  return formatHKD(amount);
}

function scenarioWhy(
  scenario: OptimizerScenario,
  optimizerResult: OptimizerResult,
  bestScenario: OptimizerScenario | undefined,
  isWinner: boolean,
  lang: ResultsLanguage,
): string {
  if (!scenario.available) {
    return lang === "zh"
      ? scenario.reasonUnavailableZh ?? resultsT(resultsDictionary.unavailable, lang)
      : scenario.reasonUnavailableEn ?? resultsT(resultsDictionary.unavailable, lang);
  }

  if (isWinner) {
    return lang === "zh" ? optimizerResult.explanationZh : optimizerResult.explanationEn;
  }

  if (bestScenario && scenario.totalTax === bestScenario.totalTax) {
    return resultsT(resultsDictionary.tied, lang);
  }

  const difference = bestScenario ? scenario.totalTax - bestScenario.totalTax : 0;
  return `${resultsT(resultsDictionary.lost, lang)} ${formatHKD(Math.max(0, difference))}`;
}
