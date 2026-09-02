import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MessagesPanel } from "@/components/MessagesPanel";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";
import { EinAdminActions } from "./EinAdminActions";

export const dynamic = "force-dynamic";

export default async function AdminEinApplicationPage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const app = await prisma.einApplication.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!app) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/admin/applications?type=ein"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> EIN Applications
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{app.llcName}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {app.fullName} &middot; {app.email}
          </p>
        </div>
        <span className="text-xs text-slate-400">
          {app.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Application details */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 mb-8">
        <Section title="Contact">
          <Row label="Name" value={app.fullName} />
          <Row label="Email" value={<a href={`mailto:${app.email}`} className="text-accent hover:underline">{app.email}</a>} />
          <Row label="Phone" value={app.phone} />
        </Section>
        <Section title="LLC">
          <Row label="LLC name" value={app.llcName} />
          <Row label="State" value={app.llcState} />
          <Row label="Formed" value={app.llcFormedDate} />
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

      <EinAdminActions
        id={app.id}
        currentStatus={app.status}
        currentAdminNotes={app.adminNotes ?? ""}
        currentEin={app.ein ?? ""}
      />

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
