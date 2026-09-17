import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Full-bleed header band for /partner, matching the treatment used on the
// blog index (src/app/(marketing)/blog/page.tsx#BlogHeader) and the EIN apply
// sidebar card: paper ground, dotted radial texture, a soft accent blob, a
// mono eyebrow, and a serif display heading.
export function PartnerHero({
  company,
  partnerName,
  total,
  needsYou,
  nextDeadline,
}: {
  company: string;
  partnerName: string;
  total: number;
  needsYou: number;
  nextDeadline: string;
}) {
  const stateLine =
    needsYou > 0
      ? `${needsYou} of your ${total} filings need you today.`
      : `Nothing is waiting on you. ${total} filings in flight.`;

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-paper">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle, #1e3a8a 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        aria-hidden
        className="absolute -right-24 -top-40 h-[520px] w-[520px] rounded-full bg-accent-100/70 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Partner · {company || partnerName}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
              Client filings
            </h1>
            <p className="mt-3 max-w-xl text-base text-slate-600">{stateLine}</p>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <Link href="/partner/filings/new">
              <Button>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                New client filing
              </Button>
            </Link>
            <p className="text-xs text-slate-500">
              Calendar-year filings for 2026 are due {nextDeadline}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
