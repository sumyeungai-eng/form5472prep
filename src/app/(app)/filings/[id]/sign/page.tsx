import { notFound, redirect } from "next/navigation";
import { getFilingAccess } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FilingLocked } from "@/components/FilingLocked";
import { SignClient } from "./SignClient";
import { get as getStorageObject } from "@/lib/storage";

// Page where customers sign their filing in-portal. Replaces the prior
// "download + sign offline + upload signed PDF" loop. Gated to:
//   - filing must exist and be owned by the requester
//   - status must be PAID or PDF_GENERATED (so the unsigned PDF exists)
//   - AI validation, if it ran, must NOT be in needs_customer_input state
//     (otherwise we send the user back to the chat thread first)
export default async function SignFilingPage({ params }: { params: { id: string } }) {
  const access = await getFilingAccess(params.id);
  if (access.kind === "not_found") notFound();
  if (access.kind === "locked") return <FilingLocked ownerEmail={access.ownerEmail} />;

  const filing = await prisma.filing.findUnique({
    where: { id: access.filing.id },
    include: { user: true },
  });
  if (!filing) notFound();
  if (!filing.generatedPdfKey) {
    // Pre-payment or generation not complete yet — bounce back to the filing
    // detail page where the status banner will explain.
    redirect(`/filings/${filing.id}`);
  }
  if (filing.signedPdfKey || filing.signaturePngKey) {
    // Already signed — either the customer signed in-portal (signaturePngKey
    // set, status SIGNATURE_PENDING) or the admin already embedded and
    // uploaded the finalized PDF (signedPdfKey set). Either way, don't show
    // them the canvas again — bounce back to the filing detail page so the
    // "Signature received — accountant reviewing" banner explains what's
    // happening. Without this gate, a returning customer hits a blank canvas,
    // re-signs, gets bounced back to the filing page, sees "Sign my filing"
    // again (pre-fix), and loops forever.
    redirect(`/filings/${filing.id}`);
  }
  if (filing.validationStatus === "needs_customer_input") {
    redirect(`/filings/${filing.id}`);
  }

  // Pre-populate the SignaturePad if the same user has a saved signature
  // from a previous filing. Falls back to "" when none.
  let priorSignatureDataUrl: string | null = null;
  if (filing.userId) {
    const previous = await prisma.filing.findFirst({
      where: {
        userId: filing.userId,
        signaturePngKey: { not: null },
        id: { not: filing.id },
      },
      orderBy: { signedAt: "desc" },
      select: { signaturePngKey: true },
    });
    if (previous?.signaturePngKey) {
      try {
        const bytes = await getStorageObject(previous.signaturePngKey);
        priorSignatureDataUrl = `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
      } catch (err) {
        console.warn("[sign page] could not load prior signature", err);
      }
    }
  }

  return (
    <SignClient
      filingId={filing.id}
      llcName={filing.llcName}
      taxYears={filing.taxYears}
      priorSignatureDataUrl={priorSignatureDataUrl}
    />
  );
}
