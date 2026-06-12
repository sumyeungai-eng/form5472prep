import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";
import { requirePartner } from "@/lib/partner/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getTiersForSource } from "@/lib/pricing";
import { PartnerFilingRow } from "./PartnerFilingRow";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "slate" | "amber" | "blue" | "emerald" | "red" }> = {
  DRAFT: { label: "Draft — not paid", tone: "slate" },
  PAID: { label: "Paid — ready to generate", tone: "amber" },
  PDF_GENERATED: { label: "Ready to sign", tone: "amber" },
  SIGNATURE_PENDING: { label: "Awaiting signature", tone: "amber" },
  SIGNED_UPLOADED: { label: "Ready to fax", tone: "blue" },
  FAXED: { label: "Faxed", tone: "blue" },
  CONFIRMED: { label: "Confirmed", tone: "emerald" },
  FAILED: { label: "Failed", tone: "red" },
};

export default async function PartnerDashboard() {
  const partner = await requirePartner();

  const filings = await prisma.filing.findMany({
    where: { partnerId: partner.id },
    orderBy: { updatedAt: "desc" },
    include: { user: true },
  });

  const activeCount = filings.filter((f) => !["CONFIRMED", "FAILED"].includes(f.status)).length;
  const doneCount = filings.filter((f) => f.status === "CONFIRMED").length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Client filings</h1>
          <p className="text-sm text-slate-500 mt-1">
            {partner.company || partner.name} · {filings.length} total · {activeCount} in progress · {doneCount} confirmed
          </p>
        </div>
        <Link href="/partner/filings/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New client filing
          </Button>
        </Link>
      </div>

      {filings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No filings yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Start your first client filing. You prepare it; your client signs with a link you send them.
          </p>
          <Link href="/partner/filings/new" className="inline-block mt-4">
            <Button>Start a client filing</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {filings.map((f) => {
            const s = STATUS[f.status] ?? { label: f.status, tone: "slate" as const };
            return (
              <PartnerFilingRow
                key={f.id}
                id={f.id}
                llcName={f.llcName}
                clientEmail={f.user?.email ?? null}
                taxYears={f.taxYears}
                tierLabel={
                  getTiersForSource(f.funnelSource)[
                    f.tier as "single_year" | "two_year_diirsp" | "multi_year_diirsp"
                  ]?.label ?? f.tier
                }
                updatedAt={f.updatedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                statusLabel={s.label}
                statusTone={s.tone}
                status={f.status}
                hasSignature={!!f.signaturePngKey || !!f.signedPdfKey}
              />
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-500 leading-relaxed">
        Each filing is paid for individually at checkout and signed by your client. Need volume
        pricing or invoicing? Email{" "}
        <a href="mailto:support@form5472prep.com" className="text-accent hover:underline">
          support@form5472prep.com
        </a>
        .
      </p>
    </div>
  );
}
