import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { FaxActions, type CurrentFaxLink } from "./FaxActions";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { isAdmin } from "@/lib/admin/auth";
import { formatFaxNumber } from "@/lib/inboundFax";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!(await isAdmin())) return { title: "Fax - Admin" };
  const fax = await prisma.receivedFax.findUnique({
    where: { id: params.id },
    select: { fromNumber: true },
  });
  return { title: `${formatFaxNumber(fax?.fromNumber ?? null)} - Faxes - Admin` };
}

export default async function AdminFaxDetailPage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  let fax = await prisma.receivedFax.findUnique({
    where: { id: params.id },
    include: {
      filing: { select: { id: true, llcName: true, status: true, user: { select: { email: true } } } },
      einApplication: { select: { id: true, fullName: true, llcName: true, email: true, status: true } },
      itinApplication: { select: { id: true, fullName: true, email: true, status: true } },
    },
  });
  if (!fax) notFound();

  if (!fax.readAt) {
    const readAt = new Date();
    await prisma.receivedFax.update({ where: { id: fax.id }, data: { readAt } });
    fax = { ...fax, readAt };
  }

  const pdfUrl = `/api/admin/faxes/${fax.id}/pdf`;
  const currentLink = currentFaxLink(fax);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <AdminPageHeader
        title="Received fax"
        breadcrumb={[
          { label: "Received faxes", href: "/admin/faxes" },
          { label: formatFaxNumber(fax.fromNumber), href: `/admin/faxes/${fax.id}` },
        ]}
        actions={
          <Link href="/admin/faxes" className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Back to inbox
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          {fax.pdfKey ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                  Open in new tab <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a href={pdfUrl} download className="text-accent hover:underline">
                  Download
                </a>
              </div>
              <iframe src={pdfUrl} title="Received fax PDF" className="h-[80vh] w-full rounded-md border border-slate-200" />
            </>
          ) : (
            <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-800">
              {fax.downloadError ?? "No PDF available"}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Details</h2>
            <dl className="space-y-2.5">
              <Field label="From" value={formatFaxNumber(fax.fromNumber)} />
              <Field label="To" value={fax.toNumber} />
              <Field label="Pages" value={fax.pageCount == null ? null : String(fax.pageCount)} />
              <Field label="Received" value={fax.receivedAt.toLocaleString("en-US")} />
              <Field label="Telnyx ID" value={fax.telnyxFaxId} mono />
            </dl>
          </div>

          <FaxActions
            faxId={fax.id}
            currentLink={currentLink}
            initialNote={fax.note ?? ""}
            initiallyRead={!!fax.readAt}
            initiallyArchived={!!fax.archivedAt}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`col-span-2 break-words text-slate-900 ${mono ? "font-mono text-xs" : ""}`}>
        {value && value.trim().length > 0 ? value : <span className="text-slate-400">-</span>}
      </dd>
    </div>
  );
}

function currentFaxLink(fax: {
  filing: { id: string; llcName: string | null; status: string; user: { email: string } | null } | null;
  einApplication: { id: string; fullName: string; llcName: string; email: string; status: string } | null;
  itinApplication: { id: string; fullName: string; email: string; status: string } | null;
}): CurrentFaxLink {
  if (fax.einApplication) {
    return {
      type: "ein",
      id: fax.einApplication.id,
      label: fax.einApplication.fullName || fax.einApplication.llcName,
      sublabel: `EIN - ${fax.einApplication.email} - ${fax.einApplication.status}`,
    };
  }
  if (fax.itinApplication) {
    return {
      type: "itin",
      id: fax.itinApplication.id,
      label: fax.itinApplication.fullName,
      sublabel: `ITIN - ${fax.itinApplication.email} - ${fax.itinApplication.status}`,
    };
  }
  if (fax.filing) {
    return {
      type: "filing",
      id: fax.filing.id,
      label: fax.filing.llcName ?? "(untitled filing)",
      sublabel: `Form 5472 - ${fax.filing.user?.email ?? "no account"} - ${fax.filing.status}`,
    };
  }
  return null;
}
