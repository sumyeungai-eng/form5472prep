import { Check } from "lucide-react";

// "Included with every plan" checklist. Fed by sharedTierFeatures(), i.e. the
// features TIERS in pricing.ts lists on every tier — never a restated copy.
export function IncludedFeatures({ features }: { features: string[] }) {
  if (features.length === 0) return null;
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">
        Included with every plan
      </h4>
      <ul className="mt-3 grid gap-x-6 gap-y-2.5 text-sm leading-snug text-slate-700 sm:grid-cols-2">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <span
              aria-hidden
              className="mt-px flex h-4 w-4 flex-none items-center justify-center rounded-full bg-accent text-white"
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
