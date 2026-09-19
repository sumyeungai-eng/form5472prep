import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PlaceSignatureClient } from "@/app/admin/filings/[id]/place-signature/PlaceSignatureClient";
import { canStamp, formLabel } from "@/lib/applicationSignature";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function PlaceEinSignaturePage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const app = await prisma.einApplication.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      llcName: true,
      preparedPdfKey: true,
      preparedPdfSha256: true,
      signaturePngKey: true,
      signedDocSha256: true,
      signedPdfKey: true,
    },
  });
  if (!app) notFound();

  if (!app.preparedPdfKey) {
    return <Notice id={app.id}>Upload the prepared {formLabel("ein")} before placing a signature.</Notice>;
  }
  if (!canStamp(app)) {
    return (
      <Notice id={app.id}>
        The customer has not signed the current prepared {formLabel("ein")} yet, or their signature was made on a different version.
      </Notice>
    );
  }

  return (
    <PlaceSignatureClient
      filingId={app.id}
      llcName={app.llcName}
      taxYears={[]}
      hasExistingSignedPdf={!!app.signedPdfKey}
      endpoints={{
        pdf: `/api/admin/applications/ein/${app.id}/prepared-pdf`,
        signedPdf: `/api/admin/applications/ein/${app.id}/signed-pdf`,
        signaturePng: `/api/admin/applications/ein/${app.id}/signature-png`,
        place: `/api/admin/applications/ein/${app.id}/place-signature`,
        backHref: `/admin/applications/ein/${app.id}`,
        backLabel: "application",
      }}
    />
  );
}

function Notice({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
      <Link href={`/admin/applications/ein/${id}`} className="text-sm text-slate-500 hover:underline">
        Back to application
      </Link>
      <h1 className="text-2xl font-semibold">Place signature</h1>
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {children}
      </div>
    </div>
  );
}
