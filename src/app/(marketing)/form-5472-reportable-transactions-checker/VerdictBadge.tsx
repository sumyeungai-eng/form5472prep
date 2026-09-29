import { CheckCircle2, CircleSlash, HelpCircle } from "lucide-react";
import { VERDICT_LABELS, type Verdict } from "@/lib/tools/reportable-transactions/transactions";

const STYLES: Record<Verdict, string> = {
  reportable: "bg-blue-50 text-blue-800 ring-blue-200",
  "not-reportable": "bg-emerald-50 text-emerald-800 ring-emerald-200",
  depends: "bg-amber-50 text-amber-800 ring-amber-200",
};

const ICONS = {
  reportable: CheckCircle2,
  "not-reportable": CircleSlash,
  depends: HelpCircle,
} as const;

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const Icon = ICONS[verdict];
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[verdict]}`}
    >
      <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0">{VERDICT_LABELS[verdict]}</span>
    </span>
  );
}
