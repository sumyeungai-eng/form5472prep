import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { IRS_FAX_NUMBER } from "@/config/filingPackage";
import { isAdmin } from "@/lib/admin/auth";
import { formatAttribution } from "@/lib/attribution";
import { prisma } from "@/lib/prisma";
import { filingDueDateUtc, formatDueDate } from "@/lib/schemas";
import { formatUsd } from "@/lib/utils";
import { AdminPageHeader } from "../../../_components/AdminPageHeader";
import { extensionFaxDecision } from "@/lib/fax/extension";
import { form7004Warnings } from "@/lib/pdf/form7004";
import { ExtensionAdminActions } from "./ExtensionAdminActions";
import { ExtensionDetailsForm } from "./ExtensionDetailsForm";
import { Form7004Panel } from "./Form7004Panel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Titles carry customer names: never query them for a visitor who isn't signed in as admin.
  const app = (await isAdmin()) ? await prisma.extensionApplication.findUnique({
    where: { id: params.id },
    select: { llcName: true },
  }) : null;
  return { title: `${app?.llcName || "Form 7004 order"} · Applications · Admin` };
}

export default async function AdminExtensionApplicationPage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const app = await prisma.extensionApplication.findUnique({ where: { id: params.id } });
  if (!app) notFound();

  const title = app.llcName || "Form 7004 order";
  const due = app.taxYear ? formatDueDate(filingDueDateUtc(app.taxYear)) : null;
  const yearNotEnded = app.taxYear !== null && app.taxYear >= new Date().getUTCFullYear();
  const attribution = {
    source: app.attrSource,
    medium: app.attrMedium,
    campaign: app.attrCampaign,
    referrer: app.attrReferrer,
    landing: app.attrLanding,
  };
  const faxDecision = extensionFaxDecision(app, new Date());
  // Remount the client panels after router.refresh() so they show fresh data.
  const freshKey = app.updatedAt.toISOString();
  const hasTrafficSource = !!(app.funnelSource || app.attrSource || app.attrMedium || app.attrCampaign || app.attrReferrer || app.attrLanding);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AdminPageHeader
        title={title}
        breadcrumb={[
          { label: "Applications", href: "/admin/applications" },
          { label: "Form 7004", href: "/admin/applications?type=extension" },
          { label: title, href: `/admin/applications/extension/${app.id}` },
        ]}
        actions={
          <span className="text-xs text-slate-400">
            {app.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        }
      />

      <p className="mb-6 text-slate-500 text-sm">
        {app.fullName || "(no name)"} &middot; {app.email}
      </p>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 mb-8">
        <Section title="Extension">
          <Row label="Tax year" value={app.taxYear ?? <Missing>Not provided — confirm with the client</Missing>} />
          <Row label="IRS due date (fax by)" value={due} />
          {yearNotEnded && <Row label="Timing" value={`Tax year not ended — fax in the first business days after 1 January ${(app.taxYear ?? 0) + 1}.`} />}
        </Section>
        <Section title="LLC">
          <Row label="LLC name" value={app.llcName ?? <Missing>Not provided</Missing>} />
          <Row label="EIN" value={app.ein ?? <Missing>Not provided</Missing>} />
          <Row label="Street" value={app.llcStreet} />
          <Row label="City" value={app.llcCity} />
          <Row label="State" value={app.llcState} />
          <Row label="ZIP" value={app.llcZip} />
        </Section>
        <Section title="Contact">
          <Row label="Name" value={app.fullName} />
          <Row label="Email" value={<a href={`mailto:${app.email}`} className="text-accent hover:underline">{app.email}</a>} />
          <Row label="Phone" value={app.phone} />
        </Section>
        <Section title="Payment">
          <Row label="Status" value={<PaymentBadge paid={!!app.stripePaymentId} />} />
          <Row label="Amount" value={app.amountPaid > 0 ? formatUsd(app.amountPaid) : null} />
          <Row label="Paid on" value={app.paidAt ? app.paidAt.toLocaleString("en-US") : null} />
          <Row label="Stripe payment" value={app.stripePaymentId} />
        </Section>
        <Section title="Traffic source">
          {hasTrafficSource ? (
            <>
              <Row label="Channel" value={formatAttribution(attribution)} />
              <Row label="Landing page" value={app.attrLanding} />
              <Row label="Referring site" value={app.attrReferrer} />
              <Row label="Landing funnel" value={app.funnelSource} />
            </>
          ) : (
            <Row label="Channel" value="Direct / unknown" />
          )}
        </Section>
        {app.notes && (
          <Section title="Notes from client">
            <p className="text-sm text-slate-700 px-5 py-3 whitespace-pre-wrap">{app.notes}</p>
          </Section>
        )}
      </div>

      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900 mb-2">Fulfilment</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Check the order details against IRS records (LLC name, EIN, address) and correct them below if needed.</li>
          <li>Generate Form 7004 and open it — every line, the &quot;Foreign-owned U.S. DE&quot; header and code 12.</li>
          <li>After the tax year ends and before the due date above, click Fax to IRS ({IRS_FAX_NUMBER}). Status moves to Faxing.</li>
          <li>On delivery the order completes itself and the client is emailed the receipt and the faxed form (transmission evidence — not IRS acceptance). A failed fax returns the order to In review and alerts you only.</li>
        </ol>
      </div>

      <div className="space-y-6 mb-8">
        <Form7004Panel
          key={`f7004-${freshKey}`}
          id={app.id}
          generatedAt={app.generatedPdfKey && app.generatedAt ? app.generatedAt.toISOString() : null}
          warnings={form7004Warnings(app)}
          faxRefusal={faxDecision.kind === "refused" ? faxDecision.message : null}
          faxNeedsReason={faxDecision.kind === "needs_reason" ? faxDecision.message : null}
          fax={{
            jobId: app.faxJobId,
            status: app.faxStatus,
            sentAt: app.faxSentAt?.toISOString() ?? null,
            deliveredAt: app.faxDeliveredAt?.toISOString() ?? null,
            attempts: app.faxAttempts,
            hasReceipt: !!app.faxConfirmationKey,
          }}
          irsFaxNumber={IRS_FAX_NUMBER}
        />
        <ExtensionDetailsForm
          key={`details-${freshKey}`}
          id={app.id}
          initial={{
            llcName: app.llcName ?? "",
            ein: app.ein ?? "",
            llcStreet: app.llcStreet ?? "",
            llcCity: app.llcCity ?? "",
            llcState: app.llcState ?? "",
            llcZip: app.llcZip ?? "",
            taxYear: app.taxYear ? String(app.taxYear) : "",
            fullName: app.fullName,
            email: app.email,
          }}
        />
      </div>

      <ExtensionAdminActions key={`actions-${freshKey}`} id={app.id} currentStatus={app.status} currentAdminNotes={app.adminNotes ?? ""} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="pb-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex px-5 py-1.5 text-sm">
      <span className="w-44 text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function Missing({ children }: { children: React.ReactNode }) {
  return <span className="text-amber-700">{children}</span>;
}

function PaymentBadge({ paid }: { paid: boolean }) {
  return (
    <span
      className={`inline-block text-[11px] font-medium rounded-full px-2 py-0.5 ${
        paid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}
