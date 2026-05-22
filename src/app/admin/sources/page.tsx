import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Per-source sales attribution. Groups every Filing by funnelSource (the
// source landing page slug captured from ?src= on /start) and shows funnel
// counts + revenue, so we can see which SEO pages actually drive paid
// filings — not just visits.
//
// Funnel definition:
//   - Started:   any filing (DRAFT or paid). The top of the funnel.
//   - Paid:      filings that reached at least PAID status (Stripe checkout
//                completed). Counted toward revenue.
//   - Confirmed: filings whose IRS fax delivered successfully.
//
// "Untagged" row = filings with funnelSource = null. These are visitors who
// arrived from outside the SEO pages — homepage CTA, direct /start, organic
// links into /start without ?src=, returning customers, etc.

const PAID_STATUSES = new Set([
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
]);

type Row = {
  source: string | null;
  started: number;
  paid: number;
  confirmed: number;
  revenueCents: number;
};

export default async function AdminSourcesPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  // Pull every filing's source + status + amount. Aggregating in JS instead
  // of Prisma groupBy because: (a) volume is small (low thousands at most),
  // (b) groupBy's typing is awkward and we'd end up doing three separate
  // queries anyway, (c) one pass over the array is straightforward.
  const filings = await prisma.filing.findMany({
    select: { funnelSource: true, status: true, amountPaid: true },
  });

  const bySource = new Map<string | null, Row>();
  for (const f of filings) {
    const key = f.funnelSource;
    let row = bySource.get(key);
    if (!row) {
      row = { source: key, started: 0, paid: 0, confirmed: 0, revenueCents: 0 };
      bySource.set(key, row);
    }
    row.started++;
    if (PAID_STATUSES.has(f.status)) {
      row.paid++;
      row.revenueCents += f.amountPaid ?? 0;
    }
    if (f.status === "CONFIRMED") row.confirmed++;
  }
  const rows: Row[] = Array.from(bySource.values());

  // Sort: revenue desc, then paid count, then started.
  rows.sort((a, b) =>
    b.revenueCents - a.revenueCents ||
    b.paid - a.paid ||
    b.started - a.started,
  );

  const totals = rows.reduce(
    (acc, r) => ({
      started: acc.started + r.started,
      paid: acc.paid + r.paid,
      confirmed: acc.confirmed + r.confirmed,
      revenueCents: acc.revenueCents + r.revenueCents,
    }),
    { started: 0, paid: 0, confirmed: 0, revenueCents: 0 },
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Sales by source</h1>
        <p className="mt-1 text-sm text-slate-500">
          Filings grouped by the landing page that sent the visitor to /start. The source is
          captured from the <code className="text-xs">?src=</code> query param on the start link
          and saved as <code className="text-xs">Filing.funnelSource</code>.
        </p>
      </div>

      {/* Totals row across all sources */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Total started" value={totals.started.toString()} />
        <Stat label="Total paid" value={totals.paid.toString()} />
        <Stat label="Total confirmed (faxed)" value={totals.confirmed.toString()} />
        <Stat label="Total revenue" value={formatUsd(totals.revenueCents)} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No filings yet — sources will appear here once visitors start hitting the wizard.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Started</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Confirmed</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Paid rate</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r) => {
                const rate = r.started > 0 ? (r.paid / r.started) * 100 : 0;
                const isLandingPage = !!r.source;
                return (
                  <tr key={r.source ?? "__untagged__"} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {isLandingPage ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-slate-100 rounded px-1.5 py-0.5">
                            {r.source}
                          </code>
                          <a
                            href={`/${r.source}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-accent"
                            title="Open landing page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">
                          Untagged (direct / homepage / sign-in)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.started}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{r.paid}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.confirmed}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-emerald-700">
                      {r.revenueCents > 0 ? formatUsd(r.revenueCents) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {r.started > 0 ? `${rate.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/filings?q=${encodeURIComponent(r.source ?? "")}`}
                        className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                      >
                        View filings
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Paid rate = paid filings ÷ started filings (per source). Revenue sums Stripe-paid amounts,
        not the IRS fax fee.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}
