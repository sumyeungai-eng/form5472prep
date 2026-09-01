import Link from "next/link";
import { formatHKD } from "@/components/wizard/FormFields";
import type { DemandItem } from "@/lib/results/recompute";
import type { ResultsLanguage } from "@/lib/results/resultsDictionary";
import { resultsDictionary, resultsT } from "@/lib/results/resultsDictionary";

type DemandNotePanelProps = {
  demandItems: DemandItem[];
  hasPropertyHead: boolean;
  lang: ResultsLanguage;
};

export function DemandNotePanel({ demandItems, hasPropertyHead, lang }: DemandNotePanelProps) {
  const tableHeadingTracking = lang === "en" ? "tracking-[0.12em] uppercase" : "";
  const totals = demandItems.reduce(
    (sum, item) => ({
      finalTax: sum.finalTax + item.demand.finalTax,
      provisionalTax: sum.provisionalTax + item.demand.provisionalTax,
      totalDemand: sum.totalDemand + item.demand.totalDemand,
      firstAmount: sum.firstAmount + item.demand.installments.firstAmount,
      secondAmount: sum.secondAmount + item.demand.installments.secondAmount,
    }),
    { finalTax: 0, provisionalTax: 0, totalDemand: 0, firstAmount: 0, secondAmount: 0 },
  );

  return (
    <section className="card p-5 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="display-subsection">
            {resultsT(resultsDictionary.demandTitle, lang)}
          </h2>
          <Link
            href="/guides/provisional-tax"
            className="focus-ring mt-2 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-600"
          >
            {resultsT(resultsDictionary.demandGuide, lang)}
          </Link>
        </div>
      </div>

      {demandItems.length ? (
        <>
          <dl className="mt-5 grid gap-4 text-sm md:grid-cols-5">
            <Metric label={resultsT(resultsDictionary.finalTax, lang)} value={formatHKD(totals.finalTax)} />
            <Metric label={resultsT(resultsDictionary.provisionalTax, lang)} value={formatHKD(totals.provisionalTax)} />
            <Metric label={resultsT(resultsDictionary.totalDemand, lang)} value={formatHKD(totals.totalDemand)} strong />
            <Metric label={resultsT(resultsDictionary.firstInstallment, lang)} value={formatHKD(totals.firstAmount)} />
            <Metric label={resultsT(resultsDictionary.secondInstallment, lang)} value={formatHKD(totals.secondAmount)} />
          </dl>

          <div className="mt-5 overflow-x-auto rounded-md border border-warm-150 shadow-field">
            <table className="min-w-full divide-y divide-warm-200 text-left text-sm">
              <thead className={`bg-warm-50 text-xs text-warm-600 ${tableHeadingTracking}`}>
                <tr>
                  <th className="px-3 py-2 font-bold">{resultsT(resultsDictionary.computationLine, lang)}</th>
                  <th className="px-3 py-2 text-right font-bold">{resultsT(resultsDictionary.finalTax, lang)}</th>
                  <th className="px-3 py-2 text-right font-bold">{resultsT(resultsDictionary.provisionalTax, lang)}</th>
                  <th className="px-3 py-2 text-right font-bold">{resultsT(resultsDictionary.totalDemand, lang)}</th>
                  <th className="px-3 py-2 text-right font-bold">{resultsT(resultsDictionary.firstInstallment, lang)}</th>
                  <th className="px-3 py-2 text-right font-bold">{resultsT(resultsDictionary.secondInstallment, lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-warm-700">
                {demandItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 font-semibold text-navy-900">
                      {lang === "zh" ? item.titleZh : item.titleEn}
                    </td>
                    <MoneyCell amount={item.demand.finalTax} />
                    <MoneyCell amount={item.demand.provisionalTax} />
                    <MoneyCell amount={item.demand.totalDemand} />
                    <MoneyCell amount={item.demand.installments.firstAmount} />
                    <MoneyCell amount={item.demand.installments.secondAmount} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-warm-700">
          {resultsT(resultsDictionary.noDemand, lang)}
        </p>
      )}

      {hasPropertyHead ? (
        <p className="mt-5 rounded-md border border-gold-200 bg-gold-100 p-4 text-sm leading-6 text-navy-900 shadow-field">
          {resultsT(resultsDictionary.propertyReductionNote, lang)}
        </p>
      ) : null}

      {demandItems.length ? (
        <p className="mt-4 text-sm leading-6 text-warm-600">
          {resultsT(resultsDictionary.provisionalCaveatNote, lang)}
        </p>
      ) : null}
    </section>
  );
}

function Metric({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className={`rounded-md border p-3 shadow-field ${strong ? "border-teal-200 bg-teal-50" : "border-warm-150 bg-warm-50"}`}>
      <dt className="text-xs font-semibold text-warm-600">{label}</dt>
      <dd className="mt-1 text-lg font-bold text-navy-900">{value}</dd>
    </div>
  );
}

function MoneyCell({ amount }: { amount: number }) {
  return <td className="whitespace-nowrap px-3 py-2 text-right font-medium text-navy-900">{formatHKD(amount)}</td>;
}
