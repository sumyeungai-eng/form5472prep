"use client";

import {
  Building2,
  User as UserIcon,
  Calendar,
  FileText,
  ClipboardCheck,
  PenLine,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import type { StepKey } from "@/components/wizard/FilingWizard";
import type { StepStatus } from "./status";

// Icon lookup. Includes the v3-synthetic "preflight" key that the wrapper
// casts into the StepKey union. Falls back to HelpCircle for any unknown
// key so a future synthetic step can't crash the sidebar.
const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  preflight: HelpCircle,
  entity: Building2,
  owner: UserIcon,
  years: Calendar,
  rcs: PenLine,
  transactions: FileText,
  review: ClipboardCheck,
};

export type SidebarStepDef = {
  key: StepKey;
  number: number;
  title: string;
  formSection: string | null;
  subtitle: string;
};

// Left rail rendered alongside the existing wizard. Pure presentation — the
// wrapper page owns step state, status calc, and progress %.
export function Sidebar({
  steps,
  current,
  statuses,
  progressPct,
  onJump,
}: {
  steps: SidebarStepDef[];
  current: StepKey;
  statuses: Record<StepKey, StepStatus>;
  progressPct: number;
  onJump: (k: StepKey) => void;
}) {
  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold tracking-wider text-blue-900 uppercase">
              Progress
            </div>
            <p className="mt-1.5 text-xs text-slate-500 leading-snug">
              Move in order. The review step assumes the earlier sections are complete.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-900">
            {Math.round(progressPct)}%
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {steps.map((step) => (
            <SidebarStep
              key={step.key}
              step={step}
              status={statuses[step.key]}
              active={current === step.key}
              onClick={() => onJump(step.key)}
            />
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-xs text-slate-500 leading-relaxed">
        <div className="text-blue-900 font-semibold tracking-wider uppercase mb-2">
          Filing reminders
        </div>
        <p>
          Foreign-owned U.S. disregarded entities file a pro forma Form 1120 with Form 5472
          attached. This workflow does not e-file.
        </p>
        <p className="mt-2">
          After payment, we generate the forms, run an AI compliance check, and let you sign
          in-portal before faxing to the IRS Ogden PIN Unit.
        </p>
      </div>
    </aside>
  );
}

function SidebarStep({
  step,
  status,
  active,
  onClick,
}: {
  step: SidebarStepDef;
  status: StepStatus;
  active: boolean;
  onClick: () => void;
}) {
  // Fallback to HelpCircle when a step key has no icon mapping — prevents
  // a future synthetic step (like preflight) from rendering `<undefined />`
  // and crashing the whole layout if someone forgets to add the entry.
  const Icon = STEP_ICONS[step.key] ?? HelpCircle;

  const iconTone = active
    ? "bg-blue-900 text-white border-blue-900"
    : status === "complete"
      ? "bg-blue-100 text-blue-900 border-blue-200"
      : status === "missing"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-400 border-slate-200";

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
          active
            ? "border-blue-200 bg-blue-50/60"
            : "border-slate-200 bg-white hover:bg-slate-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${iconTone}`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-semibold ${active ? "text-slate-900" : "text-slate-800"}`}>
                {step.title}
              </span>
              <span className="shrink-0 rounded-full bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-900">
                Step {step.number}
              </span>
            </div>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
            {step.formSection && (
              <div className="mt-1 text-[11px] font-medium text-slate-500">
                {step.formSection}
              </div>
            )}
            <p className="mt-1 text-xs text-slate-500 leading-snug">{step.subtitle}</p>
          </div>
        </div>
      </button>
    </li>
  );
}

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-900">
        <Check className="h-3 w-3" /> Complete
      </span>
    );
  }
  if (status === "missing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
        <AlertCircle className="h-3 w-3" /> Missing info
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      Not started
    </span>
  );
}
