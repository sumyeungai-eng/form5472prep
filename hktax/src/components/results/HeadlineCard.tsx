import Link from "next/link";
import type { ReactNode } from "react";
import { CountUp } from "@/components/motion/CountUp";
import type { OptimizerResult, OptimizerScenario } from "@/lib/tax/optimizer";
import type { ResultsLanguage } from "@/lib/results/resultsDictionary";
import { resultsDictionary, resultsT } from "@/lib/results/resultsDictionary";

type HeadlineCardProps = {
  bestScenario: OptimizerScenario;
  optimizerResult: OptimizerResult;
  lang: ResultsLanguage;
  yearLabel: string;
};

export function HeadlineCard({ bestScenario, optimizerResult, lang, yearLabel }: HeadlineCardProps) {
  return (
    <section className="rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">
            {resultsT(resultsDictionary.recommended, lang)}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-navy-900">
            {lang === "zh" ? bestScenario.labelZh : bestScenario.labelEn}
          </h1>
          <p className="mt-2 text-sm font-medium text-warm-600">
            {resultsT(resultsDictionary.year, lang)}: {yearLabel}
          </p>
        </div>
        <div className="results-print-action flex flex-col gap-2 sm:items-end">
          <Link
            href="/bir60/"
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2 text-sm font-bold text-navy-900 hover:bg-gold-600 hover:text-white"
          >
            {resultsT(resultsDictionary.generateDraft, lang)}
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-warm-300 px-5 py-2 text-sm font-bold text-navy-900 hover:border-teal-300"
          >
            {resultsT(resultsDictionary.print, lang)}
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
        <Metric
          label={resultsT(resultsDictionary.totalFamilyTax, lang)}
          value={<CountUp value={bestScenario.totalTax} />}
        />
        <Metric
          label={resultsT(resultsDictionary.savingVsSeparate, lang)}
          value={<CountUp value={optimizerResult.saving} />}
        />
      </dl>

      <div className="mt-5 rounded-md border border-teal-100 bg-teal-50 p-4">
        <p className="text-xs font-semibold uppercase text-teal-800">
          {resultsT(resultsDictionary.optimizerReason, lang)}
        </p>
        <p className="mt-2 text-sm leading-6 text-navy-900">
          {lang === "zh" ? optimizerResult.explanationZh : optimizerResult.explanationEn}
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-warm-100 bg-warm-50 p-4">
      <dt className="font-semibold text-warm-700">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-navy-900">{value}</dd>
    </div>
  );
}
