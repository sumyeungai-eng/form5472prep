import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Mail, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";
import { publicUrl } from "@/lib/storage";
import { StatusBadge } from "../StatusBadge";
import { AdminActions } from "./AdminActions";
import { EditFieldsCard } from "./EditFieldsCard";
import { MessagesPanel } from "@/components/MessagesPanel";

export const dynamic = "force-dynamic";

export default async function AdminFilingDetailPage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      yearData: { orderBy: { taxYear: "asc" } },
      changeLog: { orderBy: { changedAt: "desc" }, take: 20 },
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
        <AdminActions
          filingId={filing.id}
          currentStatus={filing.status}
          userEmail={filing.user?.email ?? null}
          hasFaxService={filing.faxService}
          hasSignedPdf={!!filing.signedPdfKey}
          hasGeneratedPdf={!!filing.generatedPdfKey}
          hasCustomerSignature={!!filing.signaturePngKey}
        />
      </div>

      {/* Field editor — apply customer-reported corrections without making
          them go back through the wizard. Each save is logged to
          FilingChangeLog and a regenerate-PDF nudge is shown above. */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Edit filing fields</h2>
        <EditFieldsCard
          filingId={filing.id}
          initial={{
            llcName: filing.llcName,
            llcEin: filing.llcEin,
            llcAddress: filing.llcAddress,
            llcCity: filing.llcCity,
            llcState: filing.llcState,
            llcZip: filing.llcZip,
            llcCountry: filing.llcCountry,
            llcBusinessActivity: filing.llcBusinessActivity,
            llcBusinessCode: filing.llcBusinessCode,
            ownerName: filing.ownerName,
            ownerAddress: filing.ownerAddress,
            ownerCountryCitizenship: filing.ownerCountryCitizenship,
            ownerCountryTaxResidence: filing.ownerCountryTaxResidence,
            ownerCountryBusiness: filing.ownerCountryBusiness,
            ownerFtin: filing.ownerFtin,
            ownerItin: filing.ownerItin,
            ownerReferenceId: filing.ownerReferenceId,
            reasonableCauseNarrative: filing.reasonableCauseNarrative,
          }}
        />
      </div>

      {/* AI compliance check status — shown when validation has run */}
      {filing.validationStatus && (
        <ValidationStatusCard
          status={filing.validationStatus}
          issuesJson={filing.validationIssuesJson}
          checkedAt={filing.validationCheckedAt}
          aiHandoff={filing.aiHandoff}
          aiTurnsUsed={filing.aiTurnsUsed}
        />
      )}

      {/* AI change log — every field the agent has touched */}
      {filing.changeLog.length > 0 && (
        <ChangeLogCard entries={filing.changeLog} />
      )}

      {/* Customer ↔ admin messages */}
      <div className="mb-6">
        <MessagesPanel filingId={filing.id} isAdmin={true} />
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
          <Field
            label="Fax delivery"
            value={filing.faxService ? "We fax it (paid)" : "Customer self-faxes (DIY — no action needed from us)"}
          />
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

function ValidationStatusCard({
  status,
  issuesJson,
  checkedAt,
  aiHandoff,
  aiTurnsUsed,
}: {
  status: string;
  issuesJson: unknown;
  checkedAt: Date | null;
  aiHandoff: string | null;
  aiTurnsUsed: number;
}) {
  const tone =
    status === "passed" || status === "fixed"
      ? { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", label: "✓ AI check passed" }
      : status === "needs_customer_input"
        ? { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", label: "AI flagged — needs customer input" }
        : status === "error"
          ? { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", label: "AI check error (fail-open)" }
          : { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", label: `AI check status: ${status}` };

  // issuesJson is the ValidationResponse the AI returned. Render shape lenient.
  const json = issuesJson as { summary?: string; issues?: Array<{ severity: string; location: string; description: string; customer_question?: string | null }>; customer_questions?: string[]; errorMessage?: string } | null;

  const handoffBadge =
    aiHandoff === "agent"
      ? { bg: "bg-violet-100", text: "text-violet-800", label: `🤖 AI engaged (${aiTurnsUsed}/3 turns)` }
      : aiHandoff === "admin"
        ? { bg: "bg-slate-200", text: "text-slate-700", label: "👤 Admin handoff (AI standby)" }
        : null;

  return (
    <div className={`${tone.bg} ${tone.border} border rounded-lg p-5 mb-6`}>
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <h2 className={`text-sm font-semibold ${tone.text}`}>{tone.label}</h2>
        <div className="flex items-center gap-2">
          {handoffBadge && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${handoffBadge.bg} ${handoffBadge.text}`}>
              {handoffBadge.label}
            </span>
          )}
          {checkedAt && (
            <span className="text-xs text-slate-500">Checked {checkedAt.toLocaleString()}</span>
          )}
        </div>
      </div>
      {json?.summary && (
        <p className="text-sm text-slate-800 mb-3">{json.summary}</p>
      )}
      {json?.errorMessage && (
        <p className="text-xs font-mono text-red-700 mb-3">{json.errorMessage}</p>
      )}
      {Array.isArray(json?.issues) && json.issues.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
            {json.issues.length} issue{json.issues.length === 1 ? "" : "s"} — show details
          </summary>
          <ul className="mt-3 space-y-3">
            {json.issues.map((i, idx) => (
              <li key={idx} className="border-l-2 border-slate-300 pl-3">
                <div className="text-xs uppercase tracking-wider text-slate-500">
                  {i.severity} · {i.location}
                </div>
                <div className="text-sm text-slate-800 mt-0.5">{i.description}</div>
                {i.customer_question && (
                  <div className="text-xs text-slate-600 mt-1 italic">Asked customer: {i.customer_question}</div>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function ChangeLogCard({
  entries,
}: {
  entries: Array<{
    id: string;
    source: string;
    field: string;
    beforeJson: unknown;
    afterJson: unknown;
    reason: string | null;
    changedAt: Date;
  }>;
}) {
  const display = (v: unknown) => v == null ? "—" : typeof v === "string" ? v : JSON.stringify(v);
  const sourceTone = (s: string) =>
    s === "ai" ? "bg-violet-100 text-violet-800"
      : s === "admin" ? "bg-blue-100 text-blue-800"
        : s === "customer" ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">Change log ({entries.length})</h2>
      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="flex gap-3 text-sm">
            <span className={`shrink-0 self-start text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${sourceTone(e.source)}`}>
              {e.source}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <code className="font-mono text-xs text-slate-700 break-all">{e.field}</code>
                <span className="text-xs text-slate-400 shrink-0">{e.changedAt.toLocaleString()}</span>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                <span className="font-mono">{display(e.beforeJson)}</span>
                <span className="mx-1.5 text-slate-400">→</span>
                <span className="font-mono text-emerald-700 font-semibold">{display(e.afterJson)}</span>
              </div>
              {e.reason && (
                <div className="mt-1 text-xs italic text-slate-500">{e.reason}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
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
