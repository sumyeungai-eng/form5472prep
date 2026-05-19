import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Mail, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";
import { publicUrl } from "@/lib/storage";
import { StatusBadge } from "../StatusBadge";
import { AdminActions } from "./AdminActions";

export const dynamic = "force-dynamic";

export default async function AdminFilingDetailPage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      yearData: { orderBy: { taxYear: "asc" } },
    },
  });
  if (!filing) notFound();

  // Resolve public URLs for any uploaded files.
  const generatedPdfUrl = filing.generatedPdfKey ? await publicUrl(filing.generatedPdfKey) : null;
  const signedPdfUrl = filing.signedPdfKey ? await publicUrl(filing.signedPdfKey) : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/admin/filings"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        All filings
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 truncate">
              {filing.llcName || <span className="text-slate-400">(no LLC name)</span>}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Filing <code className="text-slate-700">{filing.id}</code>
            </p>
            {filing.user && (
              <p className="text-sm text-slate-700 mt-2 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <a href={`mailto:${filing.user.email}`} className="hover:text-accent">
                  {filing.user.email}
                </a>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={filing.status} />
            <div className="text-right">
              <div className="text-xs text-slate-500">Amount paid</div>
              <div className="text-lg font-semibold tabular-nums">
                {formatUsd(filing.amountPaid)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Actions</h2>
        <AdminActions filingId={filing.id} currentStatus={filing.status} userEmail={filing.user?.email ?? null} />
      </div>

      {/* Two-column details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LLC */}
        <DetailCard title="LLC details">
          <Field label="Name" value={filing.llcName} />
          <Field label="EIN" value={filing.llcEin} mono />
          <Field
            label="Address"
            value={[
              filing.llcAddress,
              [filing.llcCity, filing.llcState, filing.llcZip].filter(Boolean).join(", "),
              filing.llcCountry,
            ].filter(Boolean).join("\n")}
          />
          <Field label="Date incorporated" value={filing.llcDateIncorporated?.toISOString().split("T")[0] ?? null} />
          <Field label="Business activity" value={filing.llcBusinessActivity} />
          <Field label="Business code" value={filing.llcBusinessCode} mono />
        </DetailCard>

        {/* Foreign owner */}
        <DetailCard title="Foreign owner">
          <Field label="Name" value={filing.ownerName} />
          <Field label="Address" value={filing.ownerAddress} />
          <Field label="Citizenship" value={filing.ownerCountryCitizenship} />
          <Field label="Tax residence" value={filing.ownerCountryTaxResidence} />
          <Field label="Country of business" value={filing.ownerCountryBusiness} />
          <Field label="FTIN" value={filing.ownerFtin} mono />
          <Field label="ITIN" value={filing.ownerItin} mono />
          <Field label="Reference ID" value={filing.ownerReferenceId} mono />
        </DetailCard>

        {/* Filing scope */}
        <DetailCard title="Filing scope">
          <Field label="Tier" value={filing.tier} />
          <Field label="Tax year(s)" value={filing.taxYears.join(", ") || null} />
          <Field label="DIIRSP" value={filing.isDiirsp ? "Yes — delinquent submission" : "No (current year)"} />
          {filing.isDiirsp && (
            <Field label="Reasonable cause" value={filing.reasonableCauseNarrative} multiline />
          )}
        </DetailCard>

        {/* Payment + fax */}
        <DetailCard title="Payment & fax">
          <Field label="Stripe session" value={filing.stripeSessionId} mono />
          <Field label="Stripe payment intent" value={filing.stripePaymentId} mono />
          <Field label="Fax job ID" value={filing.faxJobId} mono />
          <Field label="Fax status" value={filing.faxStatus} />
        </DetailCard>

        {/* Files — span both columns */}
        <div className="md:col-span-2">
          <DetailCard title="Files">
            <FileRow label="Generated PDF" url={generatedPdfUrl} />
            <FileRow label="Signed PDF (uploaded by customer)" url={signedPdfUrl} />
          </DetailCard>
        </div>

        {/* Year-by-year data */}
        {filing.yearData.length > 0 && (
          <div className="md:col-span-2">
            <DetailCard title="Year-by-year data">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-semibold py-2">Year</th>
                    <th className="text-right font-semibold py-2">Total assets (year-end)</th>
                    <th className="text-right font-semibold py-2">Contributions</th>
                    <th className="text-right font-semibold py-2">Distributions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filing.yearData.map((y) => (
                    <tr key={y.id}>
                      <td className="py-2 font-medium">{y.taxYear}</td>
                      <td className="py-2 text-right tabular-nums">${y.totalAssetsYearEnd.toString()}</td>
                      <td className="py-2 text-right tabular-nums">${y.contributions.toString()}</td>
                      <td className="py-2 text-right tabular-nums">${y.distributions.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DetailCard>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-slate-400 text-center">
        Created {filing.createdAt.toLocaleString()} · Updated {filing.updatedAt.toLocaleString()}
      </p>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">{title}</h2>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
  multiline = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  multiline?: boolean;
}) {
  const display = value && value.trim().length > 0 ? value : null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-3 text-sm">
      <dt className="text-slate-500 text-xs uppercase tracking-wider sm:text-sm sm:normal-case sm:tracking-normal">{label}</dt>
      <dd className={`sm:col-span-2 ${mono ? "font-mono text-xs" : ""} ${multiline ? "whitespace-pre-line" : ""} text-slate-900 break-words`}>
        {display ?? <span className="text-slate-400">—</span>}
      </dd>
    </div>
  );
}

function FileRow({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">{label}</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:underline inline-flex items-center gap-1"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-sm text-slate-400">Not uploaded</span>
      )}
    </div>
  );
}
