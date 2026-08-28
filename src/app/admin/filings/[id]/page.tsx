import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Mail, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatAttribution, hasAttribution } from "@/lib/attribution";
import { formatUsd } from "@/lib/utils";
import { publicUrl } from "@/lib/storage";
import { effectiveDueDateUtc, filingDueDateUtc, formatDueDate } from "@/lib/schemas";
import { extensionReviewFlags } from "@/lib/admin/filingActions";
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
    },
  });
  if (!filing) notFound();

  // Resolve public URLs for any uploaded files.
  const generatedPdfUrl = filing.generatedPdfKey ? await publicUrl(filing.generatedPdfKey) : null;
  const signedPdfUrl = filing.signedPdfKey ? await publicUrl(filing.signedPdfKey) : null;
  const faxedPdfUrl = filing.faxedPdfKey ? await publicUrl(filing.faxedPdfKey) : null;
  // The IRS fax transmission receipt — the customer's proof of filing under
  // IRC § 6038A. Written by the Telnyx webhook, with the fax-status-poll cron
  // as a backstop. Support needs it to answer "did it actually land?" without
  // asking the customer to forward their own copy.
  const faxReceiptUrl = filing.faxConfirmationKey
    ? await publicUrl(filing.faxConfirmationKey)
    : null;
  // Optional customer-uploaded state dissolution certificate — final returns
  // only, and never required. Used to sanity-check the effective dissolution
  // date against dissolvedAt.
  const dissolutionCertUrl = filing.dissolutionCertKey
    ? await publicUrl(filing.dissolutionCertKey)
    : null;
  // Optional customer-uploaded copy of the Form 7004 / its transmission
  // receipt. The extension is a customer-ASSERTED fact that suppresses the
  // whole late-filing path, so the reviewer wants to be able to look at the
  // proof before the package goes out.
  const extensionProofUrl = filing.extensionProofKey
    ? await publicUrl(filing.extensionProofKey)
    : null;
  const customerDocuments = await prisma.filingDocument.findMany({
    where: { filingId: filing.id },
    orderBy: { createdAt: "asc" },
  });
  const customerDocumentRows = await Promise.all(
    customerDocuments.map(async (doc) => ({
      ...doc,
      url: await publicUrl(doc.fileKey),
    })),
  );

  // ── Filing deadline ──
  // A Form 7004 covers ONE year, so everything here describes the LATEST tax
  // year in the order; a final return shortens that year, hence dissolvedAt is
  // only passed when isFinalReturn is set (same rule generatePackage uses).
  const maxTaxYear = filing.taxYears.length > 0 ? Math.max(...filing.taxYears) : null;
  const dissolvedForDeadline = filing.isFinalReturn ? filing.dissolvedAt : null;
  const originalDueText =
    maxTaxYear == null ? null : formatDueDate(filingDueDateUtc(maxTaxYear, dissolvedForDeadline));
  const effectiveDueText =
    maxTaxYear == null
      ? null
      : formatDueDate(
          effectiveDueDateUtc(maxTaxYear, dissolvedForDeadline, {
            filed: filing.extensionFiled,
            transmittedAt: filing.extensionTransmittedAt,
          }),
        );
  // Show the extension rows only once the customer has actually told us
  // something — a filing sold before the question existed shows the original
  // due date and nothing else.
  const hasExtensionFacts =
    filing.extensionFiled != null ||
    filing.extensionTransmittedAt != null ||
    filing.extensionMethod != null ||
    filing.extensionDestination != null ||
    filing.extensionProofKey != null;
  const reviewFlags = extensionReviewFlags(filing);

  // First-touch traffic attribution (captured in middleware, stamped on the
  // draft at creation). Filings created before this shipped have all-null
  // columns, so formatAttribution() renders an explicit "unknown" instead.
  const attribution = {
    source: filing.attrSource,
    medium: filing.attrMedium,
    campaign: filing.attrCampaign,
    referrer: filing.attrReferrer,
    landing: filing.attrLanding,
  };
  const attributionKnown = hasAttribution(attribution);

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
          hasFaxedPdf={!!filing.faxedPdfKey}
          faxedAt={filing.faxedAt ? filing.faxedAt.toISOString().replace("T", " ").slice(0, 16) + " UTC" : null}
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
            // Form 7004 remediation fields — seeded so the editor shows the
            // stored answer and clearing a value registers as dirty.
            extensionFiled: filing.extensionFiled,
            extensionTransmittedAt: filing.extensionTransmittedAt
              ? filing.extensionTransmittedAt.toISOString().slice(0, 10)
              : null,
            extensionMethod: filing.extensionMethod,
            extensionDestination: filing.extensionDestination,
          }}
        />
      </div>

      {/* AI compliance check + change log UI removed when the AI plumbing
          was retired. The DB columns (validationStatus, aiHandoff,
          aiTurnsUsed, FilingChangeLog table) are left orphan rather than
          migrated away — they're harmless and a future audit may want to
          read historical records that referenced them. */}

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
          {/* Final-return block. The dissolution certificate is OPTIONAL —
              when it's missing the row prompts the preparer to confirm the
              effective date with the customer instead of blocking anything. */}
          {filing.isFinalReturn && (
            <>
              <Field label="Final return" value="Yes — final Form 5472 (LLC dissolved)" />
              <Field
                label="Dissolution date"
                value={filing.dissolvedAt?.toISOString().split("T")[0] ?? null}
              />
              <CertRow url={dissolutionCertUrl} />
            </>
          )}

          {/* Filing deadline. Original date first — the one the calendar
              gives — then, only when the customer told us about a Form 7004,
              what they said and the date that actually governs. The amber
              chips are INTERNAL review prompts: they never reach the customer
              and never change the package. */}
          {maxTaxYear != null && (
            <div className="pt-3 mt-1 border-t border-slate-100 space-y-2">
              <Field label={`Original due (${maxTaxYear})`} value={originalDueText} />
              {hasExtensionFacts ? (
                <>
                  <Field label="Form 7004 filed" value={EXTENSION_ANSWER_LABEL[filing.extensionFiled ?? ""] ?? filing.extensionFiled} />
                  <Field
                    label="7004 transmitted"
                    value={filing.extensionTransmittedAt?.toISOString().split("T")[0] ?? null}
                  />
                  <Field label="7004 method" value={EXTENSION_METHOD_LABEL[filing.extensionMethod ?? ""] ?? filing.extensionMethod} />
                  <Field label="7004 sent to" value={EXTENSION_DESTINATION_LABEL[filing.extensionDestination ?? ""] ?? filing.extensionDestination} />
                  <Field label="Effective due date" value={effectiveDueText} />
                  <ExtensionProofRow url={extensionProofUrl} />
                </>
              ) : (
                <Field label="Form 7004" value="Not asked — no extension on record" muted />
              )}
              {reviewFlags.length > 0 && (
                <div className="flex flex-col gap-1 pt-1">
                  {reviewFlags.map((f) => (
                    <span
                      key={f.code}
                      className="w-fit text-[11px] font-medium rounded-full px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {f.detail}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </DetailCard>

        {/* Payment + fax */}
        <DetailCard title="Payment & fax">
          <Field label="Stripe session" value={filing.stripeSessionId} mono />
          <Field label="Stripe payment intent" value={filing.stripePaymentId} mono />
          <Field label="Fax job ID" value={filing.faxJobId} mono />
          <Field label="Fax status" value={filing.faxStatus} />
        </DetailCard>

        {/* Where this customer came from. attrSource & co. are FIRST-TOUCH:
            the channel of the visitor's first ever page view, not the last
            one before checkout — that's the number that tells us which ad
            spend actually produced the order. funnelSource is a different
            axis (which landing page they entered through). */}
        <div className="md:col-span-2">
          <DetailCard title="Traffic source">
            <Field
              label="Channel"
              value={formatAttribution(attribution)}
              muted={!attributionKnown}
            />
            <Field label="Landing page" value={filing.attrLanding} mono />
            <Field label="Referring site" value={filing.attrReferrer} />
            <Field label="Landing funnel (?src=)" value={filing.funnelSource} mono />
          </DetailCard>
        </div>

        {/* Files — span both columns */}
        <div className="md:col-span-2">
          <DetailCard title="Files">
            <FileRow label="Generated PDF (unsigned)" url={generatedPdfUrl} />
            <FileRow label="Signed PDF (current)" url={signedPdfUrl} />
            <FileRow
              label={filing.faxedAt ? `Faxed PDF snapshot (sent ${filing.faxedAt.toISOString().slice(0, 16).replace("T", " ")} UTC)` : "Faxed PDF snapshot"}
              url={faxedPdfUrl}
            />
            {/* Proof of filing. Absent after a fax has gone out is a real
                signal — it means Telnyx never reported completion — so the
                empty state says that rather than the generic "Not uploaded". */}
            <FileRow
              label="IRS fax transmission receipt (proof of filing)"
              url={faxReceiptUrl}
              emptyLabel={
                filing.faxedAt
                  ? "No receipt yet — transmission not confirmed"
                  : "Not faxed yet"
              }
            />
          </DetailCard>
        </div>

        <div className="md:col-span-2">
          <DetailCard title="Customer documents">
            {customerDocumentRows.length === 0 ? (
              <p className="text-sm text-slate-400">None uploaded.</p>
            ) : (
              customerDocumentRows.map((doc) => (
                <DocumentFileRow
                  key={doc.id}
                  name={doc.fileName}
                  size={doc.size}
                  createdAt={doc.createdAt}
                  url={doc.url}
                />
              ))
            )}
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
  // `muted` renders a real value in the placeholder grey — used for the
  // "we don't know" attribution summary, which is text rather than a dash.
  muted = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  multiline?: boolean;
  muted?: boolean;
}) {
  const display = value && value.trim().length > 0 ? value : null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-3 text-sm">
      <dt className="text-slate-500 text-xs uppercase tracking-wider sm:text-sm sm:normal-case sm:tracking-normal">{label}</dt>
      <dd className={`sm:col-span-2 ${mono ? "font-mono text-xs" : ""} ${multiline ? "whitespace-pre-line" : ""} ${muted ? "text-slate-400" : "text-slate-900"} break-words`}>
        {display ?? <span className="text-slate-400">—</span>}
      </dd>
    </div>
  );
}

// Wizard-value → human label for the Form 7004 answers. The raw values are
// the shared enums ("not_sure", "certified_mail", "ogden"); reading them off a
// review screen at speed is exactly where a misread happens.
const EXTENSION_ANSWER_LABEL: Record<string, string> = {
  yes: "Yes — extension filed",
  no: "No",
  not_sure: "Not sure",
};
const EXTENSION_METHOD_LABEL: Record<string, string> = {
  fax: "Fax",
  certified_mail: "Certified mail",
  mail: "Regular mail",
  not_sure: "Not sure",
};
const EXTENSION_DESTINATION_LABEL: Record<string, string> = {
  ogden: "Ogden (correct for a foreign-owned DE)",
  standard: "Standard 7004 address",
  not_sure: "Not sure",
};

// Same dt/dd grid as CertRow, for the optional 7004 proof upload.
function ExtensionProofRow({ url }: { url: string | null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-3 text-sm">
      <dt className="text-slate-500 text-xs uppercase tracking-wider sm:text-sm sm:normal-case sm:tracking-normal">
        Extension proof
      </dt>
      <dd className="sm:col-span-2 break-words">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            View extension proof <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-slate-400">
            No proof uploaded — the extension is the customer&apos;s word only.
          </span>
        )}
      </dd>
    </div>
  );
}

// Dissolution-certificate row inside the "Filing scope" card. Uses the same
// dt/dd grid as Field so it lines up, but the value is either a presigned
// link or a muted nudge — Field only renders plain text.
function CertRow({ url }: { url: string | null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-3 text-sm">
      <dt className="text-slate-500 text-xs uppercase tracking-wider sm:text-sm sm:normal-case sm:tracking-normal">
        Dissolution certificate
      </dt>
      <dd className="sm:col-span-2 break-words">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            View dissolution certificate <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-slate-400">
            No certificate uploaded — verify the effective date with the customer.
          </span>
        )}
      </dd>
    </div>
  );
}

function FileRow({
  label,
  url,
  // Some rows want a more informative empty state than "Not uploaded" — e.g.
  // a missing fax receipt on an already-faxed filing means the transmission
  // was never confirmed, which is worth saying out loud.
  emptyLabel = "Not uploaded",
}: {
  label: string;
  url: string | null;
  emptyLabel?: string;
}) {
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
        <span className="text-sm text-slate-400">{emptyLabel}</span>
      )}
    </div>
  );
}

function DocumentFileRow({
  name,
  size,
  createdAt,
  url,
}: {
  name: string;
  size: number;
  createdAt: Date;
  url: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
      <span className="min-w-0 text-sm text-slate-700">
        <span className="block truncate">{name}</span>
        <span className="text-xs text-slate-400">
          {formatFileSize(size)} · {createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-none text-sm text-accent hover:underline inline-flex items-center gap-1"
      >
        View <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
