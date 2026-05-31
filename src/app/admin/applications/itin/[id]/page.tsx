import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { ItinAdminActions } from "./ItinAdminActions";

export const dynamic = "force-dynamic";

export default async function AdminItinApplicationPage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const app = await prisma.itinApplication.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!app) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/admin/applications?type=itin"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> ITIN Applications
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{app.fullName}</h1>
          <p className="text-slate-500 text-sm mt-1">{app.email}</p>
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
        <Section title="Personal Info">
          <Row label="Date of birth" value={app.dateOfBirth} />
          <Row label="Country of birth" value={app.countryOfBirth} />
          <Row label="Citizenship" value={app.citizenship} />
          <Row label="Country of residence" value={app.countryOfResidence} />
        </Section>
        <Section title="ITIN Application">
          <Row label="W-7 reason" value={app.itinReason} />
          <Row label="Tax return type" value={app.taxReturnType} />
          <Row label="US activity" value={app.usActivity} />
        </Section>
        <Section title="Passport">
          <Row label="Passport number" value={app.passportNumber} />
          <Row label="Passport expiry" value={app.passportExpiry} />
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

      <ItinAdminActions
        id={app.id}
        currentStatus={app.status}
        currentAdminNotes={app.adminNotes ?? ""}
        currentItin={app.itin ?? ""}
      />
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
