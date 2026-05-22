"use client";

import { useMemo, useState } from "react";
import { FilingWizard, type StepKey } from "@/components/wizard/FilingWizard";
import { Sidebar, type SidebarStepDef } from "./Sidebar";
import { computeStatuses, computeProgressPct, type StepStatus } from "./status";
import {
  PreflightStep,
  EMPTY_PREFLIGHT_ANSWERS,
  preflightStatus,
  type PreflightAnswers,
} from "./PreflightStep";

// Wraps the existing FilingWizard with a left sidebar matching the
// competitor's design. The wizard keeps ALL its current logic (validation,
// save endpoints, per-step components, DIIRSP branching) — we just hide its
// inline top stepper and feed it controlled step state from the parent.
//
// Step 0 of v3 is a Pre-flight eligibility check that lives entirely in
// client state (answers don't persist anywhere). It's there to short-circuit
// users whose situation doesn't fit before they invest time on the form.

// v3 extends the wizard's StepKey with a synthetic "preflight" key. When the
// user is on "preflight" we render the eligibility component; otherwise we
// hand stepKey through to FilingWizard which runs the real form.
type V3StepKey = "preflight" | StepKey;

const ALL_STEPS: SidebarStepDef[] = [
  {
    key: "preflight" as StepKey, // synthetic; sidebar treats it like any other key
    number: 1,
    title: "Pre-flight check",
    formSection: null,
    subtitle: "Quick eligibility check before you start.",
  },
  {
    key: "entity",
    number: 2,
    title: "Entity",
    formSection: "Form 5472 Part I",
    subtitle: "U.S. LLC name, EIN, address, and business activity.",
  },
  {
    key: "owner",
    number: 3,
    title: "Foreign owner",
    formSection: "Form 5472 Part II",
    subtitle: "Direct owner identity, address, and country information.",
  },
  {
    key: "years",
    number: 4,
    title: "Tax years",
    formSection: null,
    subtitle: "Pick the tax year(s) you're filing for.",
  },
  {
    key: "rcs",
    number: 5,
    title: "Reasonable cause",
    formSection: "DIIRSP attachment",
    subtitle: "Late-filing reasonable cause statement.",
  },
  {
    key: "transactions",
    number: 6,
    title: "Transactions",
    formSection: "Form 5472 Parts IV-VI",
    subtitle: "Yearly totals and any Part V reportable items.",
  },
  {
    key: "review",
    number: 7,
    title: "Review & pay",
    formSection: null,
    subtitle: "Confirm details, pay, and we generate the forms.",
  },
];

type WizardFiling = React.ComponentProps<typeof FilingWizard>["filing"];

export function FilingWizardV3({
  filing: initial,
  plaidEnabled = false,
}: {
  filing: WizardFiling;
  plaidEnabled?: boolean;
}) {
  // Default landing step is the pre-flight check.
  const [stepKey, setStepKey] = useState<V3StepKey>("preflight");
  const [filing, setFiling] = useState(initial);
  const [preflightAnswers, setPreflightAnswers] = useState<PreflightAnswers>(EMPTY_PREFLIGHT_ANSWERS);

  // RCS step only shown when isDiirsp. Mirror FilingWizard's logic.
  const visibleSteps = useMemo<SidebarStepDef[]>(() => {
    return ALL_STEPS
      .filter((s) => s.key !== "rcs" || filing.isDiirsp)
      // Re-number sequentially so badges always read "Step 1..N".
      .map((s, i) => ({ ...s, number: i + 1 }));
  }, [filing.isDiirsp]);

  // Status calc: pre-flight uses its own derivation; other steps reuse the
  // wizard-data-based status helper.
  const dataStatuses = useMemo(() => computeStatuses(filing), [filing]);
  const statuses = useMemo<Record<StepKey, StepStatus>>(
    () => ({ ...dataStatuses, [("preflight" as StepKey)]: preflightStatus(preflightAnswers) as StepStatus }),
    [dataStatuses, preflightAnswers],
  );
  const progressPct = useMemo(
    () => computeProgressPct(statuses, visibleSteps.map((s) => s.key)),
    [statuses, visibleSteps],
  );

  // Sidebar can jump to any step. Casting is safe — "preflight" is the only
  // non-wizard key and the consumer branches on it below.
  function jumpTo(k: StepKey) {
    setStepKey(k as V3StepKey);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start">
          <Sidebar
            steps={visibleSteps}
            current={stepKey as StepKey}
            statuses={statuses}
            progressPct={progressPct}
            onJump={jumpTo}
          />
          <div className="flex-1 min-w-0">
            {stepKey === "preflight" ? (
              <PreflightStep
                answers={preflightAnswers}
                onAnswers={setPreflightAnswers}
                onContinue={() => setStepKey("entity")}
              />
            ) : (
              <FilingWizard
                filing={initial}
                plaidEnabled={plaidEnabled}
                step={stepKey as StepKey}
                onStepChange={(next) => setStepKey(next)}
                hideTopStepper
                bareLayout
                onFilingChange={setFiling}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
