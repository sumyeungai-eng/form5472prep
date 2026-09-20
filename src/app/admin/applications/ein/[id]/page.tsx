import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { MessagesPanel } from "@/components/MessagesPanel";
import { ApplicationSignaturePanel } from "@/components/admin/ApplicationSignaturePanel";
import { LinkedFaxes } from "@/components/admin/LinkedFaxes";
import { Ss4Panel } from "@/components/admin/Ss4Panel";
import { isAdmin } from "@/lib/admin/auth";
import { formLabel } from "@/lib/applicationSignature";
import { prisma } from "@/lib/prisma";
import { formatAttribution } from "@/lib/attribution";
import { parseSs4Options, type Ss4Source } from "@/lib/pdf/ss4Options";
import { formatUsd } from "@/lib/utils";
import { AdminPageHeader } from "../../../_components/AdminPageHeader";
import { EinAdminActions } from "./EinAdminActions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const app = await prisma.einApplication.findUnique({
    where: { id: params.id },
    select: { llcName: true },
  });
  const name = app?.llcName || "EIN application";
  return { title: `${name} · Applications · Admin` };
}

export default async function AdminEinApplicationPage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const app = await prisma.einApplication.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!app) notFound();

  const attribution = {
    source: app.attrSource,
    medium: app.attrMedium,
    campaign: app.attrCampaign,
    referrer: app.attrReferrer,
    landing: app.attrLanding,
  };
  const hasTrafficSource = !!(
    app.funnelSource ||
    app.attrSource ||
    app.attrMedium ||
    app.attrCampaign ||
    app.attrReferrer ||
    app.attrLanding
  );
  const ss4Source: Ss4Source = {
    fullName: app.fullName,
    phone: app.phone,
    llcName: app.llcName,
    llcState: app.llcState,
    llcFormedDate: app.llcFormedDate,
    llcCounty: app.llcCounty,
    llcMembers: app.llcMembers,
    businessMailingAddress: app.businessMailingAddress,
    businessType: app.businessType,
    businessPurpose: app.businessPurpose,
    principalProducts: app.principalProducts,
    ownerName: app.ownerName,
    ownerResidence: app.ownerResidence,
    ownerCitizenship: app.ownerCitizenship,
    responsiblePartyTin: app.responsiblePartyTin,
  };
  const ss4Options = parseSs4Options(app.ss4Options, ss4Source);
  const hasPrepared = !!(app.preparedPdfKey || app.preparedPdfSha256 || app.preparedPdfUploadedAt);
  const hasSignature = !!(app.signaturePngKey || app.signedAt || app.signedDocSha256);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AdminPageHeader
        title={app.llcName}
        breadcrumb={[
          { label: "Applications", href: "/admin/applications" },
          { label: "EIN", href: "/admin/applications?type=ein" },
          { label: app.llcName, href: `/admin/applications/ein/${app.id}` },
        ]}
        actions={
        <span className="text-xs text-slate-400">
          {app.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        }
      />

      <p className="mb-6 text-slate-500 text-sm">
        {app.fullName} &middot; {app.email}
      </p>

      {/* Application details */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 mb-8">
        <Section title="Contact">
          <Row label="Name" value={app.fullName} />
          <Row label="Email" value={<a href={`mailto:${app.email}`} className="text-accent hover:underline">{app.email}</a>} />
          <Row label="Phone" value={app.phone} />
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
        <Section title="LLC">
          <Row label="LLC name" value={app.llcName} />
          <Row label="State" value={app.llcState} />
          <Row label="Formed" value={app.llcFormedDate} />
          <Row label="County" value={app.llcCounty} />
          <Row label="Members" value={app.llcMembers} />
          <Row label="Business mailing address" value={app.businessMailingAddress} />
          <Row label="Business type" value={app.businessType} />
          <Row label="Business purpose" value={app.businessPurpose} />
          <Row label="Products or services" value={app.principalProducts} />
        </Section>
        <Section title="Owner">
          <Row label="Owner name" value={app.ownerName} />
          <Row label="Date of birth" value={app.dateOfBirth} />
          <Row label="Home address" value={app.ownerHomeAddress} />
          <Row label="Citizenship" value={app.ownerCitizenship} />
          <Row label="Residence" value={app.ownerResidence} />
          <Row label="US tax number" value={app.responsiblePartyTin} />
          <Row label="Passport" value={app.passportNumber} />
        </Section>
        <Section title="Payment">
          <Row label="Status" value={<PaymentBadge paid={!!app.stripePaymentId} />} />
          <Row label="Amount" value={app.amountPaid > 0 ? formatUsd(app.amountPaid) : null} />
          <Row label="Paid on" value={app.paidAt ? app.paidAt.toLocaleString("en-US") : null} />
        </Section>
        {app.notes && (
          <Section title="Notes from applicant">
            <p className="text-sm text-slate-700 px-5 py-3">{app.notes}</p>
          </Section>
        )}
        {app.user && (
          <Section title="Portal account">
            <Row label="User ID" value={app.user.id} />
            <Row label="Email" value={app.user.email} />
          </Section>
        )}
      </div>

      <div className="mb-8">
        <ApplicationSignaturePanel
          type="ein"
          id={app.id}
          formLabel={formLabel("ein")}
          paid={!!app.paidAt}
          preparedUploadedAt={app.preparedPdfUploadedAt?.toISOString() ?? null}
          preparedSha256={app.preparedPdfSha256}
          requestedAt={app.signatureRequestedAt?.toISOString() ?? null}
          signedAt={app.signedAt?.toISOString() ?? null}
          signerName={app.signerName}
          signatureIp={app.signatureIp}
          signatureUserAgent={app.signatureUserAgent}
          consentVersion={app.signatureConsentVersion}
          signedDocSha256={app.signedDocSha256}
          signedPdfAt={app.signedPdfAt?.toISOString() ?? null}
        />
      </div>

      <div className="mb-8">
        <Ss4Panel
          id={app.id}
          llcName={app.llcName}
          options={ss4Options}
          hasPrepared={hasPrepared}
          preparedSource={app.preparedPdfSource}
          hasSignature={hasSignature}
        />
      </div>

      <EinAdminActions
        id={app.id}
        currentStatus={app.status}
        currentAdminNotes={app.adminNotes ?? ""}
        currentEin={app.ein ?? ""}
      />

      <LinkedFaxes where={{ einApplicationId: app.id }} />

      <div className="mt-8">
        <MessagesPanel apiBase={`/api/applications/ein/${app.id}/messages`} isAdmin />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="pb-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex px-5 py-1.5 text-sm">
      <span className="w-40 text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
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
