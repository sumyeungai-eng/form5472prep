"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bir60Panel } from "@/components/results/Bir60Panel";
import { ComputationBreakdown } from "@/components/results/ComputationBreakdown";
import { DemandNotePanel } from "@/components/results/DemandNotePanel";
import { HeadlineCard } from "@/components/results/HeadlineCard";
import { MarginalRateNote } from "@/components/results/MarginalRateNote";
import { ScenarioTable } from "@/components/results/ScenarioTable";
import { Container } from "@/components/Container";
import { loadWizardResult, type StoredWizardResult } from "@/components/wizard/resultsStorage";
import {
  buildDemandItems,
  buildScenarioBreakdown,
  selectMarginalComputation,
} from "@/lib/results/recompute";
import { resolveResultYear } from "@/lib/results/resolveYear";
import { resultsDictionary, resultsT } from "@/lib/results/resultsDictionary";
import { useI18n } from "@/lib/i18n/useI18n";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";
import "./print.css";

export default function ResultsPage() {
  const { lang } = useI18n();
  const [storedResult, setStoredResult] = useState<StoredWizardResult | null>();

  useEffect(() => {
    setStoredResult(loadWizardResult());
  }, []);

  if (storedResult === undefined) {
    return (
      <Container className="py-16 sm:py-24">
        <section className="mx-auto max-w-3xl rounded-lg border border-warm-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold text-teal-800">
            {wizardT(wizardDictionary.common.loading, lang)}
          </p>
        </section>
      </Container>
    );
  }

  if (storedResult === null) {
    return (
      <Container className="py-16 sm:py-24">
        <section className="mx-auto max-w-3xl rounded-lg border border-warm-200 bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-navy-900">
            {wizardT(wizardDictionary.results.title, lang)}
          </h1>
          <p className="mt-4 text-sm leading-6 text-warm-700">
            {wizardT(wizardDictionary.results.noResult, lang)}
          </p>
          <Link
            href="/wizard"
            className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800"
          >
            {wizardT(wizardDictionary.results.backToWizard, lang)}
          </Link>
        </section>
      </Container>
    );
  }

  const { familyScenarioInput, optimizerResult } = storedResult;
  const bestScenario = optimizerResult.scenarios.find((scenario) => scenario.id === optimizerResult.best);
  const separateScenario = optimizerResult.scenarios.find((scenario) => scenario.id === "separate");

  if (!bestScenario || !separateScenario) {
    return (
      <Container className="py-16 sm:py-24">
        <section className="mx-auto max-w-3xl rounded-lg border border-warm-200 bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-navy-900">
            {wizardT(wizardDictionary.results.title, lang)}
          </h1>
          <p className="mt-4 text-sm leading-6 text-warm-700">
            {wizardT(wizardDictionary.results.noResult, lang)}
          </p>
          <Link
            href="/wizard"
            className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800"
          >
            {wizardT(wizardDictionary.results.backToWizard, lang)}
          </Link>
        </section>
      </Container>
    );
  }

  const resolvedYear = resolveResultYear(familyScenarioInput, optimizerResult);
  const bestBreakdown = buildScenarioBreakdown(familyScenarioInput, bestScenario, resolvedYear.params);
  const separateBreakdown = buildScenarioBreakdown(familyScenarioInput, separateScenario, resolvedYear.params);
  const demandItems = buildDemandItems(bestBreakdown, resolvedYear.params);
  const marginalComputation = selectMarginalComputation(bestBreakdown);
  const yearLabel = resolvedYear.year.replace("_", "/");
  const shouldShowSeparateComparison = bestScenario.id !== separateScenario.id;
  const hasPropertyHead = bestBreakdown.computations.some((item) => item.demandHead === "property");

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <HeadlineCard
          bestScenario={bestScenario}
          optimizerResult={optimizerResult}
          lang={lang}
          yearLabel={yearLabel}
        />

        {!resolvedYear.exactMatch ? (
          <p className="rounded-md border border-gold-200 bg-gold-100 p-4 text-sm leading-6 text-navy-900">
            {resultsT(resultsDictionary.fallbackYear, lang)}
          </p>
        ) : null}

        <ScenarioTable optimizerResult={optimizerResult} lang={lang} />

        <ComputationBreakdown
          breakdown={bestBreakdown}
          heading={resultsT(resultsDictionary.winningBreakdowns, lang)}
          lang={lang}
          defaultOpen
        />

        {shouldShowSeparateComparison ? (
          <ComputationBreakdown
            breakdown={separateBreakdown}
            heading={resultsT(resultsDictionary.baselineBreakdowns, lang)}
            lang={lang}
            printHidden
          />
        ) : null}

        <DemandNotePanel
          demandItems={demandItems}
          hasPropertyHead={hasPropertyHead}
          lang={lang}
        />

        <MarginalRateNote
          item={marginalComputation}
          lang={lang}
          params={resolvedYear.params}
        />

        <Bir60Panel flags={bestBreakdown.bir60Flags} lang={lang} />

        <details className="results-debug rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
          <summary className="cursor-pointer text-sm font-bold text-navy-900">
            {resultsT(resultsDictionary.debugJson, lang)}
          </summary>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <DebugBlock
              title={resultsT(resultsDictionary.inputJson, lang)}
              json={JSON.stringify(familyScenarioInput, null, 2)}
            />
            <DebugBlock
              title={resultsT(resultsDictionary.outputJson, lang)}
              json={JSON.stringify(optimizerResult, null, 2)}
            />
          </div>
        </details>
      </div>
    </Container>
  );
}

function DebugBlock({ json, title }: { json: string; title: string }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-navy-900">{title}</h3>
      <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-navy-900 p-4 text-xs leading-5 text-white">
        {json}
      </pre>
    </section>
  );
}
