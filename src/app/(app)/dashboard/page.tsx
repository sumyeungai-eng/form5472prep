import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/utils";
import { TIERS } from "@/lib/pricing";

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

const TONE: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  emerald: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const filings = await prisma.filing.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

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
              <Link
                key={f.id}
                href={`/filings/${f.id}`}
                className="flex items-center justify-between p-5 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {f.llcName ?? <em className="text-slate-400">Unnamed filing</em>}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {f.taxYears.length > 0 ? `Tax years ${f.taxYears.join(", ")}` : "No years selected"}
                    {" · "}
                    {TIERS[f.tier as keyof typeof TIERS]?.label ?? f.tier}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Last updated {f.updatedAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex-none text-right ml-4">
                  <span
                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${TONE[s.tone]}`}
                  >
                    {s.label}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">{formatUsd(f.amountPaid)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
