import { formatHKD } from "@/components/wizard/FormFields";
import type { ResultComputation, ScenarioBreakdown } from "@/lib/results/recompute";
import type { ResultsLanguage } from "@/lib/results/resultsDictionary";
import { resultsDictionary, resultsT } from "@/lib/results/resultsDictionary";
import type { ComputationLine } from "@/lib/tax/types";

type ComputationBreakdownProps = {
  breakdown: ScenarioBreakdown;
  heading: string;
  lang: ResultsLanguage;
  defaultOpen?: boolean;
  printHidden?: boolean;
};

export function ComputationBreakdown({
  breakdown,
  defaultOpen = false,
  heading,
  lang,
  printHidden = false,
}: ComputationBreakdownProps) {
  const eyebrowTracking = lang === "en" ? "tracking-[0.18em] uppercase" : "";

  return (
    <section className={`results-breakdown-section card p-5 sm:p-8${printHidden ? " results-breakdown-baseline" : ""}`}>
      <div>
        <p className={`text-xs font-bold text-gold-700 sm:text-sm ${eyebrowTracking}`}>
          {lang === "zh" ? breakdown.scenario.labelZh : breakdown.scenario.labelEn}
        </p>
        <h2 className="display-subsection mt-3">{heading}</h2>
      </div>

      {breakdown.computations.length ? (
        <div className="mt-5 space-y-4">
          {breakdown.computations.map((item) => (
            <ComputationPanel
              key={item.id}
              item={item}
              lang={lang}
              defaultOpen={defaultOpen}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-warm-700">
          {resultsT(resultsDictionary.noBreakdowns, lang)}
        </p>
      )}
    </section>
  );
}

function ComputationPanel({
  defaultOpen,
  item,
  lang,
}: {
  defaultOpen: boolean;
  item: ResultComputation;
  lang: ResultsLanguage;
}) {
  const comp = item.computation;
  const tableHeadingTracking = lang === "en" ? "tracking-[0.12em] uppercase" : "";

  return (
    <details open={defaultOpen || undefined} className="overflow-hidden rounded-md border border-warm-150 bg-warm-50 shadow-field">
      <summary className="focus-ring flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md px-4 py-3 text-left text-sm font-bold text-navy-900">
        <span>{lang === "zh" ? item.titleZh : item.titleEn}</span>
        <span className="flex-none text-base text-teal-700" aria-hidden="true">+</span>
      </summary>

      <div className="border-t border-warm-150 bg-white p-4">
        <dl className="grid gap-3 text-xs text-warm-700 sm:grid-cols-3 lg:grid-cols-6">
          <SummaryMetric label={resultsT(resultsDictionary.basisUsed, lang)} value={basisLabel(comp.basisUsed, lang)} />
          <SummaryMetric label={resultsT(resultsDictionary.netAssessableIncome, lang)} value={formatHKD(comp.netAssessableIncome)} />
          <SummaryMetric label={resultsT(resultsDictionary.netChargeableIncome, lang)} value={formatHKD(comp.netChargeableIncome)} />
          <SummaryMetric label={resultsT(resultsDictionary.taxBeforeReduction, lang)} value={formatHKD(comp.taxBeforeReduction)} />
          <SummaryMetric label={resultsT(resultsDictionary.reduction, lang)} value={formatHKD(comp.reduction)} />
          <SummaryMetric label={resultsT(resultsDictionary.finalTax, lang)} value={formatHKD(comp.finalTax)} />
        </dl>

        <div className="mt-5 overflow-x-auto rounded-md border border-warm-150 shadow-field">
          <table className="min-w-full divide-y divide-warm-200 text-sm">
            <thead className={`bg-warm-50 text-left text-xs text-warm-600 ${tableHeadingTracking}`}>
              <tr>
                <th className="px-3 py-2 font-bold">{resultsT(resultsDictionary.computationLine, lang)}</th>
                <th className="px-3 py-2 text-right font-bold">{resultsT(resultsDictionary.amount, lang)}</th>
                <th className="px-3 py-2 font-bold">{resultsT(resultsDictionary.kind, lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {comp.lines.map((line) => (
                <tr key={line.key} className={rowClass(line.kind)}>
                  <td className="px-3 py-2 leading-6">{lang === "zh" ? line.labelZh : line.labelEn}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-medium text-navy-900">
                    {formatLineAmount(line)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-warm-500">
                    {kindLabel(line.kind, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-warm-150 bg-white p-3 shadow-field">
      <dt className="font-semibold text-warm-600">{label}</dt>
      <dd className="mt-1 font-bold text-navy-900">{value}</dd>
    </div>
  );
}

function basisLabel(basis: "progressive" | "standard", lang: ResultsLanguage): string {
  return resultsT(basis === "progressive" ? resultsDictionary.progressive : resultsDictionary.standard, lang);
}

function rowClass(kind: ComputationLine["kind"]): string {
  if (kind === "subtotal") {
    return "bg-warm-50 font-bold text-navy-900";
  }
  if (kind === "tax") {
    return "border-l-4 border-teal-500 bg-teal-50 text-navy-900";
  }
  if (kind === "info") {
    return "text-xs text-warm-500";
  }
  return "text-warm-700";
}

function formatLineAmount(line: ComputationLine): string {
  if (line.kind === "info" && line.key.includes("ownershipShare")) {
    return `${(line.amount * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
  }

  return formatHKD(line.amount);
}

function kindLabel(kind: ComputationLine["kind"], lang: ResultsLanguage): string {
  return resultsT(resultsDictionary.computationKinds[kind], lang);
}
