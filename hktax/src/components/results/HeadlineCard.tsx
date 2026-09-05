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
  const eyebrowTracking = lang === "en" ? "tracking-[0.18em] uppercase" : "";

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-navy-950 p-5 text-white shadow-card sm:p-8 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`text-xs font-bold text-gold sm:text-sm ${eyebrowTracking}`}>
            {resultsT(resultsDictionary.recommended, lang)}
          </p>
          <h1 className="display-section mt-3 text-white">
            {lang === "zh" ? bestScenario.labelZh : bestScenario.labelEn}
          </h1>
          <p className="mt-3 text-sm font-medium text-teal-50">
            {resultsT(resultsDictionary.year, lang)}: {yearLabel}
          </p>
        </div>
        <div className="results-print-action flex flex-col gap-2 sm:items-end">
          <Link
            href="/bir60/"
            className="btn-primary"
          >
            {resultsT(resultsDictionary.generateDraft, lang)}
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary"
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

      <div className="mt-6 rounded-md border border-white/10 bg-white/[0.07] p-4 shadow-field">
        <p className={`text-xs font-bold text-gold ${eyebrowTracking}`}>
          {resultsT(resultsDictionary.optimizerReason, lang)}
        </p>
        <p className="mt-2 text-sm leading-6 text-teal-50">
          {lang === "zh" ? optimizerResult.explanationZh : optimizerResult.explanationEn}
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-white/[0.12] bg-white p-5 text-navy-950 shadow-card">
      <dt className="text-sm font-semibold text-warm-700">{label}</dt>
      <dd className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-display-sm">{value}</dd>
    </div>
  );
}
