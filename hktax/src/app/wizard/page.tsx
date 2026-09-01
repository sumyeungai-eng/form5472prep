"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { BasicsStep } from "@/components/wizard/BasicsStep";
import { ProgressIndicator } from "@/components/wizard/ProgressIndicator";
import { useI18n } from "@/lib/i18n/useI18n";
import { WizardProvider, useWizard } from "@/lib/wizard/wizardContext";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";

const LAST_STEP_INDEX = 5;

const LazyStepLoading = () => {
  const { lang } = useI18n();

  return (
    <div className="rounded-md border border-teal-100 bg-teal-50 p-5 text-sm font-semibold text-teal-800">
      {wizardT(wizardDictionary.common.loading, lang)}
    </div>
  );
};

const IncomeSourcesStep = dynamic(
  () => import("@/components/wizard/IncomeSourcesStep").then((mod) => mod.IncomeSourcesStep),
  { loading: LazyStepLoading },
);
const SourceDetailsStep = dynamic(
  () => import("@/components/wizard/SourceDetailsStep").then((mod) => mod.SourceDetailsStep),
  { loading: LazyStepLoading },
);
const FamilyStep = dynamic(
  () => import("@/components/wizard/FamilyStep").then((mod) => mod.FamilyStep),
  { loading: LazyStepLoading },
);
const DeductionsStep = dynamic(
  () => import("@/components/wizard/DeductionsStep").then((mod) => mod.DeductionsStep),
  { loading: LazyStepLoading },
);
const ReviewStep = dynamic(
  () => import("@/components/wizard/ReviewStep").then((mod) => mod.ReviewStep),
  { loading: LazyStepLoading },
);

export default function WizardPage() {
  return (
    <WizardProvider>
      <WizardFlow />
    </WizardProvider>
  );
}

function WizardFlow() {
  const router = useRouter();
  const { lang } = useI18n();
  const {
    clearData,
    currentStepIndex,
    hasHydrated,
    nextStep,
    previousStep,
    setCurrentStepIndex,
    wizardState,
  } = useWizard();
  const formId = `wizard-step-${currentStepIndex}`;

  useEffect(() => {
    if (currentStepIndex > LAST_STEP_INDEX) {
      setCurrentStepIndex(LAST_STEP_INDEX);
    }
  }, [currentStepIndex, setCurrentStepIndex]);

  // Step chips: jumping back is immediate (same contract as the Back button),
  // but jumping forward submits the current step first so what the user typed is
  // validated and saved rather than silently dropped.
  const pendingStepRef = useRef<number | null>(null);
  const chipInitiatedSubmitRef = useRef(false);

  function handleSelectStep(target: number) {
    if (target === currentStepIndex) {
      return;
    }

    if (target < currentStepIndex) {
      pendingStepRef.current = null;
      setCurrentStepIndex(target);
      return;
    }

    const form = document.getElementById(formId);
    if (form instanceof HTMLFormElement) {
      pendingStepRef.current = target;
      chipInitiatedSubmitRef.current = true;
      form.requestSubmit();
      return;
    }

    pendingStepRef.current = null;
  }

  function handleValidStep() {
    const pendingStep = pendingStepRef.current;
    pendingStepRef.current = null;

    if (pendingStep !== null) {
      setCurrentStepIndex(Math.min(pendingStep, LAST_STEP_INDEX));
      return;
    }

    if (currentStepIndex === LAST_STEP_INDEX) {
      router.push("/results");
      return;
    }

    nextStep();
  }

  function handleStepSubmitCapture() {
    if (chipInitiatedSubmitRef.current) {
      chipInitiatedSubmitRef.current = false;
      return;
    }

    pendingStepRef.current = null;
  }

  function handleClearData() {
    if (window.confirm(`${wizardDictionary.common.confirmClear.zh}\n${wizardDictionary.common.confirmClear.en}`)) {
      clearData();
    }
  }

  return (
    <Container className="py-10 sm:py-14">
      <section className="mx-auto min-h-[44rem] max-w-5xl rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
        {!hasHydrated ? (
          <div className="min-h-[40rem] rounded-md border border-teal-100 bg-teal-50 p-5 text-sm font-semibold text-teal-800">
            {wizardT(wizardDictionary.common.loading, lang)}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 border-b border-warm-100 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-teal-700">
                  {wizardT(wizardDictionary.context.persisted.label, lang)}
                </p>
                <p className="mt-1 text-sm text-warm-600">
                  {wizardT(wizardDictionary.context.persisted.help, lang)} · {formatYear(wizardState.year)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearData}
                className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-warm-300 px-4 py-2 text-sm font-bold text-navy-900 hover:border-red-300 hover:text-red-700"
              >
                {wizardT(wizardDictionary.context.clearData.label, lang)}
              </button>
            </div>

            <ProgressIndicator currentStepIndex={currentStepIndex} onSelectStep={handleSelectStep} />

            <div className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0" onSubmitCapture={handleStepSubmitCapture}>
              {renderStep(currentStepIndex, formId, handleValidStep)}
            </div>

            <div className="hidden gap-3 border-t border-warm-100 pt-5 md:flex md:items-center md:justify-between">
              <button
                type="button"
                onClick={() => {
                  pendingStepRef.current = null;
                  previousStep();
                }}
                disabled={currentStepIndex === 0}
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-warm-300 px-5 py-2 text-sm font-bold text-navy-900 hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {wizardT(wizardDictionary.context.previousStep.label, lang)}
              </button>
              <button
                type="submit"
                form={formId}
                onClick={() => {
                  pendingStepRef.current = null;
                }}
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800"
              >
                {wizardT(
                  currentStepIndex === LAST_STEP_INDEX
                    ? wizardDictionary.common.compute
                    : wizardDictionary.context.nextStep.label,
                  lang,
                )}
              </button>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 !mt-0 border-t border-warm-200 bg-white px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(14,32,56,0.12)] print:hidden md:hidden">
              <div className="mx-auto flex max-w-5xl gap-3">
                <button
                  type="button"
                  onClick={() => {
                    pendingStepRef.current = null;
                    previousStep();
                  }}
                  disabled={currentStepIndex === 0}
                  className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-warm-300 px-4 py-2 text-sm font-bold text-navy-900 hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {wizardT(wizardDictionary.context.previousStep.label, lang)}
                </button>
                <button
                  type="submit"
                  form={formId}
                  onClick={() => {
                    pendingStepRef.current = null;
                  }}
                  className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-navy-900 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800"
                >
                  {wizardT(
                    currentStepIndex === LAST_STEP_INDEX
                      ? wizardDictionary.common.compute
                      : wizardDictionary.context.nextStep.label,
                    lang,
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </Container>
  );
}

function renderStep(currentStepIndex: number, formId: string, onValid: () => void) {
  switch (currentStepIndex) {
    case 0:
      return <BasicsStep formId={formId} onValid={onValid} />;
    case 1:
      return <IncomeSourcesStep formId={formId} onValid={onValid} />;
    case 2:
      return <SourceDetailsStep formId={formId} onValid={onValid} />;
    case 3:
      return <FamilyStep formId={formId} onValid={onValid} />;
    case 4:
      return <DeductionsStep formId={formId} onValid={onValid} />;
    case 5:
      return <ReviewStep formId={formId} onValid={onValid} />;
    default:
      return <ReviewStep formId={formId} onValid={onValid} />;
  }
}

function formatYear(year: "2024_25" | "2025_26"): string {
  return year === "2024_25" ? "2024/25" : "2025/26";
}
