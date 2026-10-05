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
// The client's "check & sign" step. Requires `confirmed: true` (they ticked
// "everything is correct") and `pdfKey` = the generatedPdfKey of the exact
// PDF they were shown, so a signature can never attach to a version they
// didn't see (e.g. a stale tab after admin uploaded a corrected PDF).
//
// Stores the drawn signature PNG (versioned key — re-signing never
// overwrites the earlier image) and marks the filing SIGNATURE_PENDING.
// Admin then places this signature on the package (place-signature) or
// uploads a finalized signed PDF, which sets `signedPdfKey` and
// SIGNED_UPLOADED. The PNG is also reused to pre-fill future filings.
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

  const body = (await req.json().catch(() => ({}))) as {
    pngDataUrl?: unknown;
    confirmed?: unknown;
    pdfKey?: unknown;
  };
  // The client must explicitly confirm they checked the exact PDF they're
  // signing (the "everything is correct" tick on the check-and-sign page).
  if (body.confirmed !== true) {
    return NextResponse.json(
      { error: "Please confirm you've checked your forms and everything is correct." },
      { status: 400 },
    );
  }
  if (typeof body.pdfKey !== "string" || body.pdfKey !== filing.generatedPdfKey) {
    return NextResponse.json(
      { error: "Your forms were updated since you opened this page. Please reload and check the new version." },
      { status: 409 },
    );
  }
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

  // Versioned key: an earlier signature (set aside when a corrected PDF was
  // uploaded) stays in storage for the audit trail.
  const signatureKey = `${filing.id}_signature_${Date.now()}.png`;
  try {
    await put(signatureKey, pngBytes, "image/png");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[sign] storage put failed", { filingId: filing.id, error: msg });
    return NextResponse.json({ error: `Failed to save signature: ${msg}` }, { status: 500 });
  }

  // Conditional write: if admin swapped the PDF between our read and now,
  // nothing matches and the client is asked to reload.
  const written = await prisma.filing.updateMany({
    where: {
      id: filing.id,
      generatedPdfKey: body.pdfKey,
      status: { in: ["PDF_GENERATED", "SIGNATURE_PENDING"] },
    },
    data: {
      signaturePngKey: signatureKey,
      signedAt: new Date(),
      // SIGNATURE_PENDING = customer acknowledged + signed; awaiting our
      // accountant to upload the final signed PDF for fax.
      status: "SIGNATURE_PENDING",
    },
  });
  if (written.count === 0) {
    return NextResponse.json(
      { error: "Your forms were updated since you opened this page. Please reload and check the new version." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, signatureKey });
}
