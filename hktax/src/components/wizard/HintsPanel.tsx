"use client";

import { getParams } from "@/lib/tax/params";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  deriveHints,
  type WizardHintKind,
  type WizardHintStep,
} from "@/lib/wizard/optimizationHints";
import { useWizard } from "@/lib/wizard/wizardContext";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";
import { formatHKD } from "./FormFields";

const kindClasses: Record<WizardHintKind, string> = {
  opportunity: "border-teal-200 bg-teal-50 text-teal-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-warm-200 bg-warm-50 text-warm-700",
};

// Hints are recomputed on every render directly from the committed wizardState
// (not the in-progress react-hook-form draft of the current step), so they
// reflect state as of the last successful step submit. This is intentional; do
// not wire them into individual field onChange handlers.
export function HintsPanel({ step }: { step: WizardHintStep | "all" }): JSX.Element | null {
  const { lang } = useI18n();
  const { wizardState } = useWizard();
  const params = getParams(wizardState.year);
  const hints = deriveHints(wizardState, params).filter((hint) => step === "all" || hint.step === step);

  if (hints.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" role="note">
      <ul className="space-y-3">
        {hints.map((hint) => (
          <li key={hint.id} className={`rounded-md border p-4 text-sm ${kindClasses[hint.kind]}`}>
            <p className="font-bold">{lang === "zh" ? hint.titleZh : hint.titleEn}</p>
            <p className="mt-2 leading-6">{lang === "zh" ? hint.bodyZh : hint.bodyEn}</p>
            {hint.estimatedSavingHKD !== undefined ? (
              <span className="mt-3 inline-flex rounded-md bg-white/70 px-2.5 py-1 text-xs font-bold">
                {wizardT(wizardDictionary.hints.savingChip, lang)} {formatHKD(hint.estimatedSavingHKD)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="text-xs text-warm-600">{wizardT(wizardDictionary.hints.disclaimer, lang)}</p>
    </div>
  );
}
