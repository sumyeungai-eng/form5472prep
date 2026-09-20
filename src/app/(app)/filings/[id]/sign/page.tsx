import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getFilingAccess, hasFilingInviteAccess, partnerOwnsFiling } from "@/lib/session";
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
  const access = await getFilingAccess(params.id, "sign");
  if (access.kind === "not_found") notFound();
  if (access.kind === "locked") return <FilingLocked ownerEmail={access.ownerEmail} />;

  const filing = await prisma.filing.findUnique({
    where: { id: access.filing.id },
    include: { user: true },
  });
  if (!filing) notFound();

  const currentUser = await getCurrentUser();

  // Signing is reserved for the client. A partner "owns" (can view/edit) a
  // filing they created via partnerId, but must never sign on the client's
  // behalf — in-portal signing exists specifically to capture the CLIENT'S
  // own acknowledgment of the package. Send the partner back to their
  // dashboard with an explanation instead of the signature canvas. The
  // ordinary sessionId/userId-owned customer flow is untouched —
  // partnerOwnsFiling is null for it.
  const owningPartner = await partnerOwnsFiling(filing.id);
  const grantedByInvite = hasFilingInviteAccess(filing.id, "sign");
  if (owningPartner && !grantedByInvite && (!currentUser || currentUser.id !== filing.userId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-slate-900">Only the client can sign this filing</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Signing captures the client&apos;s own acknowledgment of the package, so it has to happen from
            their sign link, not the partner dashboard. Send (or resend) {filing.llcName ?? "this client"}
            &apos;s sign link from their filing row, and they can sign from there.
          </p>
          <Link
            href="/partner"
            className="mt-6 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-accent px-4 text-white text-sm font-semibold shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all hover:-translate-y-0.5"
          >
            Back to partner dashboard
          </Link>
        </div>
      </div>
    );
  }

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
  // Only load a prior signature for an AUTHENTICATED user who owns this filing
  // — not merely because filing.userId is set. Otherwise an anonymous owner who
  // bound their draft to a victim's email would be served the victim's saved
  // signature image.
  let priorSignatureDataUrl: string | null = null;
  if (currentUser?.id && currentUser.id === filing.userId) {
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
