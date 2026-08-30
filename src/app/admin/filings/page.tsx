import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";
import { formatAttribution } from "@/lib/attribution";
import { filingCompletionIssues } from "@/lib/completeness";
import { extensionReviewFlags, type ExtensionReviewFlag } from "@/lib/admin/filingActions";
import { StatusBadge } from "./StatusBadge";
import { DraftActions } from "./DraftActions";

export const dynamic = "force-dynamic";

type SearchParams = { status?: string; q?: string; hidden?: string; ready?: string };

// yearData rides along ONLY on the draft view (conditional include below), so
// it's optional here — the completeness check is the only consumer.
type FilingRow = Prisma.FilingGetPayload<{ include: { user: true } }> & {
  yearData?: { taxYear: number }[];
};

export default async function AdminFilingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const statusFilter = searchParams.status?.toUpperCase();
  const q = (searchParams.q ?? "").trim();
  // hidden=1 flips the list into the archive view: ONLY drafts the admin
  // dismissed. Any other value means the normal list, which must never show
  // them — dismissing a draft is meant to make it disappear.
  const showHidden = searchParams.hidden === "1";
  // Every view that can contain DRAFT rows — the default (all statuses), the
  // explicit DRAFT filter, and the archive. Only these pay for the extra
  // yearData join + the completeness pass; a PAID-only filter skips it.
  const draftView = !statusFilter || statusFilter === "DRAFT" || showHidden;
  // ready=1 narrows to the drafts checkout would accept — the customers who
  // filled everything in and stopped at the payment step.
  const readyOnly = draftView && searchParams.ready === "1";

  // Default = ALL statuses, drafts included. Drafts used to be hidden by
  // default as "mostly abandoned wizard sessions", but that also hid the
  // customers who finished everything and stalled at payment — the exact rows
  // the admin most wants to see. Junk drafts are handled by Hide, not by
  // hiding the whole status.
  const where: Record<string, unknown> = { adminHidden: showHidden };
  if (statusFilter && STATUS_VALUES.includes(statusFilter)) {
    where.status = statusFilter;
  }
  if (q) {
    where.OR = [
      { llcName: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { id: { equals: q } },
    ];
  }

  const filings: FilingRow[] = await prisma.filing.findMany({
    where,
    include: { user: true, ...(draftView ? { yearData: { select: { taxYear: true } } } : {}) },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  // Which drafts are actually finished. Uses the SAME helper /api/checkout
  // gates on, so a green pill means "this would have paid if they'd clicked".
  const draftIssues = new Map<string, string[]>();
  if (draftView) {
    for (const f of filings) {
      if (f.status !== "DRAFT") continue;
      draftIssues.set(f.id, filingCompletionIssues(f, (f.yearData ?? []).map((y) => y.taxYear)));
    }
  }
  // Filtered in JS rather than SQL — completeness isn't expressible as a where
  // clause, and take:100 keeps the pass trivial.
  const visibleFilings = readyOnly
    ? filings.filter((f) => draftIssues.get(f.id)?.length === 0)
    : filings;

  // Quick stats: last 30 days
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [statsPaid, statsConfirmed, statsFailed, statsRevenue, statsUnfinished] = await Promise.all([
    prisma.filing.count({ where: { status: "PAID", updatedAt: { gte: since } } }),
    prisma.filing.count({ where: { status: "CONFIRMED", updatedAt: { gte: since } } }),
    prisma.filing.count({ where: { status: "FAILED", updatedAt: { gte: since } } }),
    prisma.filing.aggregate({
      where: { status: { in: ["PAID", "PDF_GENERATED", "SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAXED", "CONFIRMED"] }, updatedAt: { gte: since } },
      _sum: { amountPaid: true },
    }),
    // Unfinished = abandoned wizard drafts that got far enough to leave an
    // email. Drafts without a user are anonymous bounces (every /start visit
    // creates one), so counting those would drown the real recovery pipeline.
    // adminHidden rows are excluded too: the admin already triaged them, and a
    // count that keeps them alive would never fall to zero.
    prisma.filing.count({
      where: {
        status: "DRAFT",
        userId: { not: null },
        adminHidden: false,
        updatedAt: { gte: since },
      },
    }),
  ]);

  // "Show hidden" / "Hide archived" toggle, keeping the current status+search
  // filters so the archive view isn't a context reset.
  const toggleQuery = new URLSearchParams();
  if (statusFilter) toggleQuery.set("status", statusFilter);
  if (q) toggleQuery.set("q", q);
  if (!showHidden) toggleQuery.set("hidden", "1");
  const toggleQs = toggleQuery.toString();
  const toggleHref = toggleQs ? `/admin/filings?${toggleQs}` : "/admin/filings";

  // "Ready to pay only" / "← All drafts" toggle, same param-preserving idiom.
  const readyQuery = new URLSearchParams();
  if (statusFilter) readyQuery.set("status", statusFilter);
  if (q) readyQuery.set("q", q);
  if (showHidden) readyQuery.set("hidden", "1");
  if (!readyOnly) readyQuery.set("ready", "1");
  const readyQs = readyQuery.toString();
  const readyHref = readyQs ? `/admin/filings?${readyQs}` : "/admin/filings";

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Filings</h1>
          <p className="text-sm text-slate-500 mt-1">All customer filings, newest first.</p>
        </div>
      </div>

      {/* Quick stats — last 30 days */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <StatCard label="Paid (30d)" value={statsPaid.toString()} />
        <StatCard label="Delivered" value={statsConfirmed.toString()} />
        <StatCard label="Failed" value={statsFailed.toString()} tone={statsFailed > 0 ? "danger" : "default"} />
        <StatCard
          label="Unfinished (30d)"
          value={statsUnfinished.toString()}
          href="/admin/filings?status=DRAFT"
        />
        <StatCard label="Revenue (30d)" value={formatUsd(statsRevenue._sum.amountPaid ?? 0)} />
      </div>

      {/* Filters */}
      <form className="mb-2 flex flex-col sm:flex-row gap-2" method="get">
        {/* Keep the archive view sticky when re-filtering from inside it. */}
        {showHidden && <input type="hidden" name="hidden" value="1" />}
        {/* Same for the ready-to-pay narrowing. */}
        {readyOnly && <input type="hidden" name="ready" value="1" />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by LLC name, email, or filing ID…"
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        >
          <option value="">All statuses</option>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800"
        >
          Filter
        </button>
      </form>

      <div className="mb-4 text-xs flex gap-4">
        <Link href={toggleHref} className="text-slate-500 hover:text-slate-900 hover:underline">
          {showHidden ? "← Hide archived" : "Show hidden"}
        </Link>
        {draftView && (
          <Link href={readyHref} className="text-slate-500 hover:text-slate-900 hover:underline">
            {readyOnly ? "← All rows" : "Ready to pay only"}
          </Link>
        )}
      </div>

      {visibleFilings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No filings match your filters</p>
          <p className="mt-1 text-sm text-slate-500">Try a different status or clear the search.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[780px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Customer / LLC</th>
                <th className="text-left font-semibold px-4 py-3">Years</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-left font-semibold px-4 py-3">Signed</th>
                <th className="text-left font-semibold px-4 py-3">Source</th>
                <th className="text-right font-semibold px-4 py-3">Paid</th>
                <th className="text-left font-semibold px-4 py-3">Updated</th>
                <th className="text-right font-semibold px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleFilings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/filings/${f.id}`} className="block">
                      <div className="font-medium text-slate-900 truncate max-w-[280px]">
                        {f.llcName || <span className="text-slate-400">(no LLC name)</span>}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[280px]">
                        {f.user?.email ?? <span className="text-slate-400">no email</span>}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {f.taxYears.length > 0 ? f.taxYears.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={f.status} />
                    {/* Draft views only: did they actually finish the wizard? */}
                    {draftIssues.has(f.id) && <CompletenessHint issues={draftIssues.get(f.id)!} />}
                    <ExtensionHint filing={f} />
                  </td>
                  <td className="px-4 py-3"><SignedCell filing={f} /></td>
                  <td className="px-4 py-3"><SourceCell filing={f} /></td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <PaidCell status={f.status} amountCents={f.amountPaid} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {formatRelative(f.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {/* Drafts only — paid/faxed filings are never disposable. */}
                    {f.status === "DRAFT" && (
                      <DraftActions filingId={f.id} hidden={f.adminHidden} hasEmail={Boolean(f.user?.email)} remindedAt={f.abandonedReminderSentAt?.toISOString() ?? null} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filings.length === 100 && (
        <p className="mt-4 text-xs text-slate-500 text-center">
          Showing newest 100. Use filters to narrow down.
        </p>
      )}
    </div>
  );
}

// DRAFT has no package to sign, so it stays neutral instead of "not signed".
function SignedCell({ filing: f }: { filing: FilingRow }) {
  const signed = f.signedAt != null || f.signedPdfKey != null;

  if (f.status === "DRAFT") {
    return (
      <span className="text-slate-400" title="Not paid yet — nothing to sign">
        —
      </span>
    );
  }

  if (signed) {
    return (
      <>
        <span className="inline-block text-[11px] font-medium rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-800">
          Signed
        </span>
        <div className="mt-1 text-[11px] text-slate-400 whitespace-nowrap">
          {f.signedAt ? formatRelative(f.signedAt) : "uploaded"}
        </div>
      </>
    );
  }

  if (["PAID", "PDF_GENERATED", "SIGNATURE_PENDING"].includes(f.status)) {
    return (
      <span className="inline-block text-[11px] font-medium rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
        Awaiting signature
      </span>
    );
  }

  // SIGNED_UPLOADED with no signature on file contradicts itself — flag it red
  // rather than amber, so nobody chases a customer who may already have signed.
  if (["SIGNED_UPLOADED", "FAXED", "CONFIRMED"].includes(f.status)) {
    return (
      <span
        className="inline-block text-[11px] font-medium rounded-full px-2 py-0.5 bg-red-100 text-red-800"
        title="No signature recorded — check this order"
      >
        Not signed
      </span>
    );
  }

  if (f.status === "FAILED") {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <span className="inline-block text-[11px] font-medium rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
      Awaiting signature
    </span>
  );
}

const STATUS_VALUES = [
  "DRAFT",
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
];

// Late/extension triage at a glance — the row-level counterpart to the
// "Filing deadline" block on the detail page. Two chips, both amber, both
// INTERNAL:
//   • "Late filing"      — this PAID order is classified as a delinquent
//                          submission. The owner needs to eyeball these to
//                          find 2025 orders that were misclassified before the
//                          Form 7004 question existed.
//   • "Review extension" — the customer's extension answer needs a human
//                          before the package is faxed (unclear answer, wrong
//                          destination, or a 7004 dated before the year even
//                          closed).
// A DRAFT is never chipped as late: isDiirsp on an unpaid draft is a moving
// inference, not a decision anyone has acted on.
function ExtensionHint({ filing }: { filing: FilingRow }) {
  const flags: ExtensionReviewFlag[] = extensionReviewFlags(filing);
  const late = filing.status === "DRAFT" ? false : filing.isDiirsp;
  if (!late && flags.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {late && (
        <span
          className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-amber-50 text-amber-800"
          title="Classified as a delinquent (DIIRSP) submission — package carries the late-filing language and a reasonable cause statement."
        >
          Late filing
        </span>
      )}
      {flags.length > 0 && (
        <span
          className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-amber-50 text-amber-800"
          title={flags.map((x) => x.detail).join(" · ")}
        >
          Review extension
        </span>
      )}
    </div>
  );
}

// Draft triage at a glance: a draft with zero completeness issues is a
// customer who filled in EVERYTHING and stopped at the payment step — the
// hottest lead on the list. Anything else is a half-empty abandonment.
function CompletenessHint({ issues }: { issues: string[] }) {
  if (issues.length === 0) {
    return (
      <span className="mt-1 block w-fit text-[11px] font-medium rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700">
        Ready to pay
      </span>
    );
  }
  return (
    <div className="mt-1 text-xs text-slate-400" title={issues.join(", ")}>
      {issues.length} field{issues.length === 1 ? "" : "s"} missing
    </div>
  );
}

// Where this customer came FROM (first-touch attribution), with the landing
// funnel they entered through underneath when there is one.
// Filing.amountPaid is written while the customer is still in the wizard — it
// is the QUOTE for the tax years they picked, not evidence of a payment. So a
// draft carries a dollar figure long before anyone is charged. Rendering that
// under a "Paid" heading made unpaid drafts look settled once drafts started
// showing by default, so drafts render the figure explicitly as a quote, in
// muted type, and only a filing that actually left DRAFT shows a paid amount.
function PaidCell({ status, amountCents }: { status: string; amountCents: number }) {
  if (amountCents <= 0) return <span className="text-slate-400">—</span>;
  if (status === "DRAFT") {
    return (
      <span className="text-xs text-slate-400" title="Quoted total — not yet paid">
        {formatUsd(amountCents)} quote
      </span>
    );
  }
  return <span className="text-slate-700">{formatUsd(amountCents)}</span>;
}

function SourceCell({ filing }: { filing: FilingRow }) {
  const label = formatAttribution({
    source: filing.attrSource,
    medium: filing.attrMedium,
    campaign: filing.attrCampaign,
    referrer: filing.attrReferrer,
    landing: filing.attrLanding,
  });
  return (
    <>
      <div className="text-xs text-slate-600 truncate max-w-[140px]" title={label}>
        {label}
      </div>
      {filing.funnelSource && (
        <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={filing.funnelSource}>
          via {filing.funnelSource}
        </div>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
  href,
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
  href?: string;
}) {
  const valueColor = tone === "danger" ? "text-red-600" : "text-slate-900";
  const body = (
    <>
      <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${valueColor}`}>{value}</div>
    </>
  );
  // Linked variant drills into the matching filtered list.
  if (href) {
    return (
      <Link
        href={href}
        className="block bg-white border border-slate-200 rounded-lg p-4 transition-colors hover:border-slate-400 hover:bg-slate-50"
      >
        {body}
      </Link>
    );
  }
  return <div className="bg-white border border-slate-200 rounded-lg p-4">{body}</div>;
}

function formatRelative(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}
