import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Inbox } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export const dynamic = "force-dynamic";

type SearchParams = { status?: string; q?: string };

export default async function AdminFilingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const statusFilter = searchParams.status?.toUpperCase();
  const q = (searchParams.q ?? "").trim();

  const where: Record<string, unknown> = {};
  if (statusFilter && STATUS_VALUES.includes(statusFilter)) {
    where.status = statusFilter;
  } else {
    // Default: hide DRAFT filings (mostly abandoned wizard sessions).
    where.status = { not: "DRAFT" };
  }
  if (q) {
    where.OR = [
      { llcName: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { id: { equals: q } },
    ];
  }

  const filings = await prisma.filing.findMany({
    where,
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  // Quick stats: last 30 days
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [statsPaid, statsConfirmed, statsFailed, statsRevenue] = await Promise.all([
    prisma.filing.count({ where: { status: "PAID", updatedAt: { gte: since } } }),
    prisma.filing.count({ where: { status: "CONFIRMED", updatedAt: { gte: since } } }),
    prisma.filing.count({ where: { status: "FAILED", updatedAt: { gte: since } } }),
    prisma.filing.aggregate({
      where: { status: { in: ["PAID", "PDF_GENERATED", "SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAXED", "CONFIRMED"] }, updatedAt: { gte: since } },
      _sum: { amountPaid: true },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Filings</h1>
          <p className="text-sm text-slate-500 mt-1">All customer filings, newest first.</p>
        </div>
      </div>

      {/* Quick stats — last 30 days */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Paid (30d)" value={statsPaid.toString()} />
        <StatCard label="Delivered" value={statsConfirmed.toString()} />
        <StatCard label="Failed" value={statsFailed.toString()} tone={statsFailed > 0 ? "danger" : "default"} />
        <StatCard label="Revenue (30d)" value={formatUsd(statsRevenue._sum.amountPaid ?? 0)} />
      </div>

      {/* Filters */}
      <form className="mb-4 flex flex-col sm:flex-row gap-2" method="get">
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
          <option value="">All statuses (except draft)</option>
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

      {filings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No filings match your filters</p>
          <p className="mt-1 text-sm text-slate-500">Try a different status or clear the search.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Customer / LLC</th>
                <th className="text-left font-semibold px-4 py-3">Years</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-4 py-3">Paid</th>
                <th className="text-left font-semibold px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filings.map((f) => (
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
                  <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                    {f.amountPaid > 0 ? formatUsd(f.amountPaid) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {formatRelative(f.updatedAt)}
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

function StatCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" }) {
  const valueColor = tone === "danger" ? "text-red-600" : "text-slate-900";
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
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
