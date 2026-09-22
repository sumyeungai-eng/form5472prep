"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FilingWizard, type FilingWizardHandle, type StepKey } from "@/components/wizard/FilingWizard";
import { Sidebar, type SidebarStepDef } from "./Sidebar";
import { computeStatuses, computeProgressPct, type StepStatus } from "./status";
import {
  PreflightStep,
  EMPTY_PREFLIGHT_ANSWERS,
  preflightStatus,
  type PreflightAnswers,
} from "./PreflightStep";
import { SaveForLater } from "./SaveForLater";
import type { SaveForLaterMode } from "@/lib/saveForLater";
import { requiresReasonableCause } from "@/lib/completeness";

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

// Where a returning user should land on (re)mount. A brand-new draft (nothing
// entered) starts at the pre-flight gate as before; but once any real data
// exists we skip pre-flight (it's a client-only eligibility check with no
// persistence — having saved data means they already passed it) and drop them
// on the first step that isn't complete. This is derived purely from the
// server-provided filing, so it's deterministic across SSR/hydration (no
// localStorage, no mismatch) and a refresh mid-wizard no longer bounces the
// user all the way back to step 1.
function resumeStep(f: WizardFiling): V3StepKey {
  const st = computeStatuses(f);
  const anyStarted = (["entity", "owner", "years", "transactions"] as StepKey[]).some(
    (k) => st[k] !== "untouched",
  );
  if (!anyStarted) return "preflight";
  const needsReasonableCause = requiresReasonableCause({
    taxYears: f.taxYears,
    isFinalReturn: f.isFinalReturn,
    dissolvedAt: f.dissolvedAt,
    extensionFiled: f.extensionFiled,
    extensionTransmittedAt: f.extensionTransmittedAt,
  });
  const order: StepKey[] = needsReasonableCause
    ? ["entity", "owner", "years", "rcs", "transactions", "review"]
    : ["entity", "owner", "years", "transactions", "review"];
  return order.find((k) => st[k] !== "complete") ?? "review";
}

export function FilingWizardV3({
  filing: initial,
  plaidEnabled = false,
  saveForLater,
  defaultEmail,
}: {
  filing: WizardFiling;
  plaidEnabled?: boolean;
  saveForLater: SaveForLaterMode;
  defaultEmail?: string | null;
}) {
  // Fresh drafts land on the pre-flight check; returning users resume on the
  // first step they haven't completed (see resumeStep). Lazy initializer so it
  // runs once from the server-provided filing.
  const [stepKey, setStepKey] = useState<V3StepKey>(() => resumeStep(initial));
  const [filing, setFiling] = useState(initial);
  const [preflightAnswers, setPreflightAnswers] = useState<PreflightAnswers>(() => ({
    ...EMPTY_PREFLIGHT_ANSWERS,
    isMultiMember:
      initial.llcMemberCount === 1 ? false : initial.llcMemberCount === 2 ? true : null,
  }));
  const wizardRef = useRef<FilingWizardHandle>(null);
  const saveMemberCount = useCallback(async (isMultiMember: boolean) => {
    const llcMemberCount = isMultiMember ? 2 : 1;
    setFiling((current) => ({ ...current, llcMemberCount }));
    await fetch(`/api/filings/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ llcMemberCount }),
    });
  }, [initial.id]);

  // RCS step only shown when the live filing facts require it. Mirror FilingWizard's logic.
  const visibleSteps = useMemo<SidebarStepDef[]>(() => {
    const needsReasonableCause = requiresReasonableCause({
      taxYears: filing.taxYears,
      isFinalReturn: filing.isFinalReturn,
      dissolvedAt: filing.dissolvedAt,
      extensionFiled: filing.extensionFiled,
      extensionTransmittedAt: filing.extensionTransmittedAt,
    });
    return ALL_STEPS
      .filter((s) => s.key !== "rcs" || needsReasonableCause)
      // Re-number sequentially so badges always read "Step 1..N".
      .map((s, i) => ({ ...s, number: i + 1 }));
  }, [
    filing.dissolvedAt,
    filing.extensionFiled,
    filing.extensionTransmittedAt,
    filing.isFinalReturn,
    filing.taxYears,
  ]);

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
            <div className="mb-4">
              <SaveForLater
                filingId={initial.id}
                mode={saveForLater}
                defaultEmail={defaultEmail}
                onBeforeLeave={
                  stepKey === "preflight"
                    ? undefined
                    : async () => (await wizardRef.current?.saveCurrentStep()) ?? true
                }
              />
            </div>
            {stepKey === "preflight" ? (
              <PreflightStep
                answers={preflightAnswers}
                onAnswers={(next) => {
                  const previous = preflightAnswers.isMultiMember;
                  setPreflightAnswers(next);
                  if (next.isMultiMember !== null && next.isMultiMember !== previous) {
                    void saveMemberCount(next.isMultiMember);
                  }
                }}
                onContinue={() => setStepKey("entity")}
              />
            ) : (
              <FilingWizard
                ref={wizardRef}
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
