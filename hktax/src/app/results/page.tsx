"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { formatHKD } from "@/components/wizard/FormFields";
import { loadWizardResult, type StoredWizardResult } from "@/components/wizard/resultsStorage";
import { useI18n } from "@/lib/i18n/useI18n";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";

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

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
          <p className="text-sm font-semibold uppercase text-teal-700">
            {wizardT(wizardDictionary.results.recommended, lang)}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-navy-900">
            {bestScenario ? `${bestScenario.labelZh} / ${bestScenario.labelEn}` : optimizerResult.best}
          </h1>
          <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
            <ResultMetric
              label={wizardT(wizardDictionary.results.totalTax, lang)}
              value={formatHKD(bestScenario?.totalTax ?? 0)}
            />
            <ResultMetric
              label={wizardT(wizardDictionary.results.saving, lang)}
              value={formatHKD(optimizerResult.saving)}
            />
          </dl>
        </section>

        <section className="rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
          <h2 className="text-xl font-bold text-navy-900">
            {wizardT(wizardDictionary.results.scenarios, lang)}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-warm-200 text-left text-sm">
              <thead className="text-xs uppercase text-warm-600">
                <tr>
                  <th className="px-3 py-3 font-bold">ID</th>
                  <th className="px-3 py-3 font-bold">{wizardT(wizardDictionary.context.review.label, lang)}</th>
                  <th className="px-3 py-3 font-bold">{wizardT(wizardDictionary.common.available, lang)}</th>
                  <th className="px-3 py-3 font-bold">{wizardT(wizardDictionary.results.totalTax, lang)}</th>
                  <th className="px-3 py-3 font-bold">{wizardT(wizardDictionary.results.reason, lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-warm-700">
                {optimizerResult.scenarios.map((scenario) => (
                  <tr key={scenario.id}>
                    <td className="px-3 py-3 font-mono text-xs text-navy-900">{scenario.id}</td>
                    <td className="px-3 py-3 font-semibold text-navy-900">
                      {scenario.labelZh} / {scenario.labelEn}
                    </td>
                    <td className="px-3 py-3">
                      {wizardT(scenario.available ? wizardDictionary.common.yes : wizardDictionary.common.no, lang)}
                    </td>
                    <td className="px-3 py-3">
                      {scenario.available ? formatHKD(scenario.totalTax) : "-"}
                    </td>
                    <td className="px-3 py-3">
                      {scenario.available
                        ? "-"
                        : `${scenario.reasonUnavailableZh ?? ""} / ${scenario.reasonUnavailableEn ?? ""}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <details className="rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
          <summary className="cursor-pointer text-sm font-bold text-navy-900">
            {wizardT(wizardDictionary.results.debugJson, lang)}
          </summary>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <DebugBlock
              title={wizardT(wizardDictionary.results.inputJson, lang)}
              json={JSON.stringify(familyScenarioInput, null, 2)}
            />
            <DebugBlock
              title={wizardT(wizardDictionary.results.outputJson, lang)}
              json={JSON.stringify(optimizerResult, null, 2)}
            />
          </div>
        </details>
      </div>
    </Container>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-warm-100 bg-warm-50 p-4">
      <dt className="font-semibold text-warm-700">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-navy-900">{value}</dd>
    </div>
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
