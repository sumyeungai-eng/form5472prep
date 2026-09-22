import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedFiling, getCurrentUser, hasFilingInviteAccess, partnerOwnsFiling } from "@/lib/session";
import { put } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const REVIEW_PENDING_MESSAGE = "Your forms are still being reviewed. We will email you when they are ready to sign.";
const REVIEW_GATE_GRANDFATHERED_STATUSES = new Set([
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
]);

// POST /api/filings/[id]/sign
//
// Stores the customer's drawn signature PNG for record-keeping and marks
// the filing as SIGNATURE_PENDING ("customer acknowledged + signed; awaiting
// accountant-finalized PDF"). The signature is NOT pasted onto the PDF —
// our accountant signs the package offline and uploads the final signed PDF
// via the admin portal. That upload populates `signedPdfKey` and bumps the
// status to SIGNED_UPLOADED.
//
// Keeping the customer-facing signature pad serves two purposes:
//   1. Captures customer acknowledgment that they've reviewed the package.
//   2. Stores their signature for reuse on future filings (same logic as
//      before — populates the wizard signature pre-fill on next year's
//      return).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const owned = await getOwnedFiling(params.id, "sign");
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Signing is reserved for the client. A partner "owns" (can view/edit) a
  // filing they created via partnerId, but must never sign on the client's
  // behalf — in-portal signing exists specifically to capture the CLIENT'S
  // own acknowledgment of the package. Refuse when the requester resolves to
  // the partner who created this filing and isn't also the filing's own
  // client user (the ordinary sessionId/userId-owned customer flow is
  // untouched — partnerOwnsFiling is null for it).
  const owningPartner = await partnerOwnsFiling(owned.id);
  if (owningPartner && !hasFilingInviteAccess(owned.id, "sign")) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.id !== owned.userId) {
      return NextResponse.json({ error: "Only the client can sign this filing" }, { status: 403 });
    }
  }

  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { user: true, yearData: { orderBy: { taxYear: "asc" } } },
  });
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!filing.generatedPdfKey) {
    return NextResponse.json({ error: "Filing has not been generated yet" }, { status: 400 });
  }
  if (!filing.reviewApprovedAt && !REVIEW_GATE_GRANDFATHERED_STATUSES.has(filing.status)) {
    return NextResponse.json({ error: REVIEW_PENDING_MESSAGE }, { status: 409 });
  }
  // Guard against a stale open tab / double-submit / direct re-POST after the
  // package has been finalized. Once the accountant has uploaded the signed PDF
  // (SIGNED_UPLOADED) or it has been faxed/confirmed/failed, re-signing would
  // overwrite signaturePngKey + signedAt and regress the status of an
  // already-transmitted filing back to SIGNATURE_PENDING. Re-signing is only
  // valid while still in PDF_GENERATED / SIGNATURE_PENDING.
  if (["SIGNED_UPLOADED", "FAXED", "CONFIRMED", "FAILED"].includes(filing.status)) {
    return NextResponse.json(
      { error: "This filing has already been finalized and can no longer be re-signed." },
      { status: 409 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { pngDataUrl?: unknown };
  // Accept the canonical "data:image/png;base64,..." prefix AND tolerate the
  // less-common "data:image/png;charset=utf-8;base64,..." that some browsers
  // emit. Anything else gets rejected with a specific reason.
  const rawUrl = typeof body.pngDataUrl === "string" ? body.pngDataUrl : "";
  const commaIdx = rawUrl.indexOf(",");
  const header = commaIdx === -1 ? "" : rawUrl.slice(0, commaIdx);
  if (!header.startsWith("data:image/png") || !header.includes("base64")) {
    return NextResponse.json(
      { error: `Malformed signature image. Got header: "${header.slice(0, 60)}"` },
      { status: 400 },
    );
  }

  const pngBytes = Buffer.from(rawUrl.slice(commaIdx + 1), "base64");
  if (pngBytes.byteLength < 200) {
    return NextResponse.json(
      { error: `Signature image too small (${pngBytes.byteLength} bytes). Please draw your signature again.` },
      { status: 400 },
    );
  }

  // Store the signature PNG only — for audit + reuse on future filings.
  // We do NOT embed it into the PDF anymore. The accountant signs offline
  // and uploads the finalized signed PDF via /admin, which writes
  // signedPdfKey and bumps status to SIGNED_UPLOADED.
  const signatureKey = `${filing.id}_signature.png`;
  try {
    await put(signatureKey, pngBytes, "image/png");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[sign] storage put failed", { filingId: filing.id, error: msg });
    return NextResponse.json({ error: `Failed to save signature: ${msg}` }, { status: 500 });
  }

  await prisma.filing.update({
    where: { id: filing.id },
    data: {
      signaturePngKey: signatureKey,
      signedAt: new Date(),
      // SIGNATURE_PENDING = customer acknowledged + signed; awaiting our
      // accountant to upload the final signed PDF for fax.
      status: "SIGNATURE_PENDING",
    },
  });

  return NextResponse.json({ ok: true, signatureKey });
}
