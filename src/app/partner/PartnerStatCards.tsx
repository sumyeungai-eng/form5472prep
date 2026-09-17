import Link from "next/link";
import { User, Users, Landmark, BadgeCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Court } from "@/lib/partner/responsibility";

const COURTS: Court[] = ["you", "client", "irs", "done"];

const COURT_VISUALS: Record<
  Court,
  { icon: LucideIcon; label: string; hint: string; edge: string; chip: string }
> = {
  you: {
    icon: User,
    label: "Needs you",
    hint: "Draft, ready to send, or failed",
    edge: "bg-amber-500",
    chip: "bg-amber-50 text-amber-800",
  },
  client: {
    icon: Users,
    label: "With your client",
    hint: "Filling in details or signing",
    edge: "bg-sky-500",
    chip: "bg-sky-50 text-sky-800",
  },
  irs: {
    icon: Landmark,
    label: "Filing with the IRS",
    hint: "Ready to fax or waiting on confirmation",
    edge: "bg-accent",
    chip: "bg-accent-50 text-accent",
  },
  done: {
    icon: BadgeCheck,
    label: "Confirmed",
    hint: "Filed and confirmed",
    edge: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-800",
  },
};

// The four "whose court is it in" stat cards. Each is a real link: clicking
// one filters the list below to that court, and clicking the active one
// clears the filter (hrefFor(null)).
export function PartnerStatCards({
  counts,
  activeCourt,
  hrefFor,
}: {
  counts: Record<Court, number>;
  activeCourt: Court | null;
  hrefFor: (court: Court | null) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {COURTS.map((court) => {
        const visuals = COURT_VISUALS[court];
        const Icon = visuals.icon;
        const active = activeCourt === court;
        const count = counts[court] ?? 0;

        return (
          <Link
            key={court}
            href={hrefFor(active ? null : court)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "relative flex flex-col gap-1.5 overflow-hidden rounded-2xl border bg-white p-5 pl-6 transition",
              "motion-safe:hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              active ? "border-accent/40 ring-1 ring-accent/20" : "border-slate-200",
            )}
          >
            <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[2px]", visuals.edge)} />
            {/* Below `lg` this wrapper is a real flex row (icon + label share
                one line, compact for the 2-col mobile grid). At `lg` it
                becomes `display:contents` and disappears from the box tree,
                so its two children rejoin the outer flex-col as ordinary
                flex items and fall back into the original desktop order
                (icon, then count, then label, then hint) via `order-*`. */}
            <div className="flex items-center gap-2 lg:contents">
              <Icon aria-hidden className="h-5 w-5 shrink-0 text-slate-400 lg:order-1" />
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  "lg:order-3",
                  visuals.chip,
                )}
              >
                {visuals.label}
              </span>
            </div>
            <span className="font-serif text-3xl text-ink lg:order-2">
              {count}
              <span className="sr-only">
                {" "}
                filings {active ? "— currently filtered to" : "—"} {visuals.label.toLowerCase()}
                {active ? ". Click to clear this filter." : ". Click to filter the list."}
              </span>
            </span>
            <span className="hidden text-xs text-slate-500 sm:block lg:order-4">{visuals.hint}</span>
          </Link>
        );
      })}
    </div>
  );
}
