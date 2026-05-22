import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { PlaceSignatureClient } from "./PlaceSignatureClient";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

// Admin-only canvas-based signature placement tool. Customer drew their
// signature in /filings/[id]/sign; this page lets the admin/accountant
// drag-and-drop that signature image onto the correct spots on the
// unsigned PDF, then click Save to produce the final signed PDF.
export default async function PlaceSignaturePage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      llcName: true,
      taxYears: true,
      generatedPdfKey: true,
      signaturePngKey: true,
      signedPdfKey: true,
    },
  });
  if (!filing) notFound();

  if (!filing.generatedPdfKey) {
    return (
      <Notice id={filing.id}>
        No unsigned PDF on file for this filing. Use the <strong>Regenerate PDF</strong> button on the admin filing page first, then come back here.
      </Notice>
    );
  }
  if (!filing.signaturePngKey) {
    return (
      <Notice id={filing.id}>
        Customer hasn&apos;t drawn their signature yet. They need to open <code className="font-mono text-xs">/filings/{filing.id}/sign</code> in their portal first.
      </Notice>
    );
  }

  return (
    <PlaceSignatureClient
      filingId={filing.id}
      llcName={filing.llcName}
      taxYears={filing.taxYears}
      hasExistingSignedPdf={!!filing.signedPdfKey}
    />
  );
}

function Notice({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
      <Link href={`/admin/filings/${id}`} className="text-sm text-slate-500 hover:underline">
        ← Back to filing
      </Link>
      <h1 className="text-2xl font-semibold">Place signature</h1>
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {children}
      </div>
    </div>
  );
}
