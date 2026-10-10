import { Check, Clock } from "lucide-react";
import { TIERS, TIER_ORDER, type Tier } from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
import { tierOnlyFeatures } from "./tierFeatures";

// The two turnaround cards. Presentational only: selection state, the
// optimistic switch and the in-flight guard all live in ReviewStep, which
// passes `disabled` while a tier PATCH is in flight.
export function TierChooser({
  selectedTier,
  disabled,
  onSelect,
}: {
  selectedTier: Tier;
  disabled: boolean;
  onSelect: (tier: Tier) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose your turnaround"
      className="grid gap-3 sm:grid-cols-2"
    >
      {TIER_ORDER.map((key) => {
        const info = TIERS[key];
        const isSelected = key === selectedTier;
        const ownFeatures = tierOnlyFeatures(key);
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(key)}
            className={`group relative flex h-full flex-col rounded-xl border p-4 text-left transition-[border-color,box-shadow,background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:p-5 ${
              isSelected
                ? "border-accent bg-accent-50/70 shadow-sm ring-1 ring-accent"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            {info.highlight && (
              <span className="mb-2 inline-flex self-start rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-white">
                Most popular
              </span>
            )}
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2 transition-colors ${
                  isSelected ? "border-accent bg-accent" : "border-slate-300 bg-white group-hover:border-slate-400"
                }`}
              >
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="font-semibold text-ink">{info.label}</span>
            </span>
            <span className="mt-1.5 flex items-start gap-1.5 pl-7 text-sm leading-snug text-slate-600">
              <Clock aria-hidden className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-500" />
              {info.subtitle}
            </span>
            <span className="mt-3 block pl-7 font-serif text-2xl font-semibold tabular-nums tracking-tight text-ink">
              {formatUsd(info.priceCents)}
            </span>
            {ownFeatures.length > 0 && (
              <ul className="ml-7 mt-3 space-y-1.5 border-t border-slate-200/80 pt-3 text-xs leading-snug text-slate-600">
                {ownFeatures.map((f) => (
                  <li key={f} className="flex gap-1.5">
                    <Check aria-hidden className="mt-px h-3.5 w-3.5 flex-none text-accent" strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </button>
        );
      })}
    </div>
  );
}
