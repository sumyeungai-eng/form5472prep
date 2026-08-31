"use client";

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

export function ProgressIndicator({ currentStepIndex }: { currentStepIndex: number }) {
  const { lang } = useI18n();

  return (
    <nav aria-label={wizardT(wizardDictionary.context.review.help, lang)}>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        {steps.map((step, index) => {
          const active = index === currentStepIndex;
          const complete = index < currentStepIndex;

          return (
            <li key={wizardT(step, "en")}>
              <div
                className={`rounded-md border px-3 py-3 text-sm font-semibold ${
                  active
                    ? "border-teal-500 bg-teal-50 text-teal-800"
                    : complete
                      ? "border-gold-200 bg-gold-100 text-navy-900"
                      : "border-warm-200 bg-white text-warm-700"
                }`}
                aria-current={active ? "step" : undefined}
              >
                <span className="block text-xs text-warm-600">{index + 1}</span>
                <span>{wizardT(step, lang)}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
