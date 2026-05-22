import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getTiersForSource } from "@/lib/pricing";
import { DashboardRow } from "./DashboardRow";

const STATUS: Record<string, { label: string; tone: "slate" | "amber" | "blue" | "emerald" | "red" }> = {
  DRAFT: { label: "Draft", tone: "slate" },
  PAID: { label: "Paid — ready to generate", tone: "amber" },
  PDF_GENERATED: { label: "Ready to sign", tone: "amber" },
  SIGNATURE_PENDING: { label: "Awaiting signature", tone: "amber" },
  SIGNED_UPLOADED: { label: "Ready to fax", tone: "blue" },
  FAXED: { label: "Faxed", tone: "blue" },
  CONFIRMED: { label: "Confirmed", tone: "emerald" },
  FAILED: { label: "Failed", tone: "red" },
};

export default async function DashboardPage() {
  const user = await requireUser();
  const filings = await prisma.filing.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  // Unread admin → customer message counts per filing, so the dashboard
  // surfaces "you have a message" without an extra round-trip per row.
  const unreadCounts = filings.length
    ? await prisma.message.groupBy({
        by: ["filingId"],
        where: {
          filingId: { in: filings.map((f) => f.id) },
          fromAdmin: true,
          readAt: null,
        },
        _count: { _all: true },
      })
    : [];
  const unreadByFiling = new Map(unreadCounts.map((u) => [u.filingId, u._count._all]));

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Your filings</h1>
          <p className="text-sm text-slate-500 mt-1">{user.email}</p>
        </div>
        <Link href="/filings/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New filing
          </Button>
        </Link>
      </div>

      {filings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No filings yet</p>
          <p className="mt-1 text-sm text-slate-500">Start your first Form 5472 filing.</p>
          <Link href="/filings/new" className="inline-block mt-4">
            <Button>Start filing</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {filings.map((f) => {
            const s = STATUS[f.status] ?? { label: f.status, tone: "slate" as const };
            return (
              <DashboardRow
                key={f.id}
                id={f.id}
                href={`/filings/${f.id}`}
                llcName={f.llcName}
                taxYears={f.taxYears}
                tierLabel={getTiersForSource(f.funnelSource)[f.tier as "single_year" | "two_year_diirsp" | "multi_year_diirsp"]?.label ?? f.tier}
                updatedAt={f.updatedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                amountPaid={f.amountPaid}
                statusLabel={s.label}
                statusTone={s.tone}
                canDelete={f.status === "DRAFT"}
                unreadMessages={unreadByFiling.get(f.id) ?? 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
