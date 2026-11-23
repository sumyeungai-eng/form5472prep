import { getMarketingTranslator } from "@/i18n/marketing";
import { type MarketingLocale } from "@/i18n/marketing/config";
import { BadgeDollarSign, ClipboardList, Clock, Wrench, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type HowToSummaryProps = {
 locale?: "en" | MarketingLocale;
  totalTime?: string;
  tools?: string[];
  supplies?: string[];
  cost?: { currency: string; value: string };
  className?: string;
};

type SummaryItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export function formatDuration(iso: string): string {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?$/.exec(iso);

  if (!match) {
    return iso;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }

  return parts.length > 0 ? `About ${parts.join(" ")}` : iso;
}

function formatList(items: string[]): string {
  return items.join(", ");
}

function formatCost(cost: { currency: string; value: string }): string {
  if (cost.currency === "USD") {
    return `$${cost.value} flat fee`;
  }

  return `${cost.value} ${cost.currency}`;
}

export function HowToSummary({
 locale = "en",
  totalTime,
  tools,
  supplies,
  cost,
  className,
}: HowToSummaryProps): JSX.Element | null {
  const t = getMarketingTranslator(locale);
  const items: SummaryItem[] = [
    ...(totalTime ? [{ label: t("shared.summary.s001"), value: locale === "en" ? formatDuration(totalTime) : t("shared.summary.duration", { minutes: String(Number(/^PT(\d+)M$/.exec(totalTime)?.[1] ?? 15)) }), icon: Clock }] : []),
    ...(supplies && supplies.length > 0
      ? [{ label: t("shared.summary.s002"), value: formatList(supplies), icon: ClipboardList }]
      : []),
    ...(tools && tools.length > 0 ? [{ label: t("shared.summary.s003"), value: formatList(tools), icon: Wrench }] : []),
    ...(cost ? [{ label: t("shared.summary.s004"), value: locale === "en" ? formatCost(cost) : t("shared.summary.cost", { value: new Intl.NumberFormat(locale, { style: "currency", currency: cost.currency }).format(Number(cost.value)) }), icon: BadgeDollarSign }] : []),
  ];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm", className)}>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{t("shared.summary.s005")}</p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="grid grid-cols-[auto_1fr] gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-accent-50">
              <Icon aria-hidden={true} className="h-4 w-4 text-accent" />
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-700">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
