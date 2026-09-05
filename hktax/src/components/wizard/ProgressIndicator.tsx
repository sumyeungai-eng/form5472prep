"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import { wizardDictionary, wizardT, type WizardDictionaryEntry } from "@/lib/wizard/wizardDictionary";

const steps: WizardDictionaryEntry[] = [
  wizardDictionary.basics.title,
  wizardDictionary.incomeSources.title,
  wizardDictionary.salary.title,
  wizardDictionary.family.title,
  wizardDictionary.deductions.title,
  wizardDictionary.context.review.label,
];

export function ProgressIndicator({
  currentStepIndex,
  onSelectStep
}: {
  currentStepIndex: number;
  onSelectStep?: (stepIndex: number) => void;
}) {
  const { lang } = useI18n();
  const stepButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentStep = steps[currentStepIndex] ?? steps[0];

  useEffect(() => {
    const activeButton = stepButtonRefs.current[currentStepIndex];

    if (!activeButton) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    activeButton.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentStepIndex]);

  return (
    <nav aria-label={wizardT(wizardDictionary.context.review.help, lang)}>
      <div className="md:hidden">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-bold text-navy-900">{wizardT(currentStep, lang)}</p>
          <p className="shrink-0 text-xs font-semibold text-warm-600">
            {currentStepIndex + 1} / {steps.length}
          </p>
        </div>
        <div className="overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
          <ol className="flex w-max min-w-full gap-2 pr-1">
            {steps.map((step, index) => {
              const active = index === currentStepIndex;
              const complete = index < currentStepIndex;
              const stateClasses = active
                ? "border-teal-500 bg-teal-50 text-teal-800 shadow-field"
                : complete
                  ? "border-gold-200 bg-gold-100 text-navy-900 shadow-field"
                  : "border-warm-150 bg-white text-warm-700 shadow-field";

              return (
                <li key={wizardT(step, "en")} className="shrink-0">
                  <button
                    ref={(button) => {
                      stepButtonRefs.current[index] = button;
                    }}
                    type="button"
                    onClick={() => onSelectStep?.(index)}
                    aria-current={active ? "step" : undefined}
                    aria-label={`${index + 1}. ${wizardT(step, lang)}`}
                    className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-bold transition-colors ${stateClasses} ${
                      active ? "" : "hover:border-teal-400 hover:bg-teal-50 hover:text-teal-800"
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <ol className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-6">
        {steps.map((step, index) => {
          const active = index === currentStepIndex;
          const complete = index < currentStepIndex;
          const stateClasses = active
            ? "border-teal-500 bg-teal-50 text-teal-800 shadow-field"
            : complete
              ? "border-gold-200 bg-gold-100 text-navy-900 shadow-field"
              : "border-warm-150 bg-white text-warm-700 shadow-field";

          return (
            <li key={wizardT(step, "en")}>
              <button
                type="button"
                onClick={() => onSelectStep?.(index)}
                aria-current={active ? "step" : undefined}
                className={`focus-ring min-h-20 w-full rounded-md border px-3 py-3 text-left text-sm font-semibold transition-colors ${stateClasses} ${
                  active ? "" : "hover:border-teal-400 hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                <span className="block text-xs text-warm-600">{index + 1}</span>
                <span>{wizardT(step, lang)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
