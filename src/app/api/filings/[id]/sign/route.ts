import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedFiling } from "@/lib/session";
import { put } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
  const owned = await getOwnedFiling(params.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { user: true, yearData: { orderBy: { taxYear: "asc" } } },
  });
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!filing.generatedPdfKey) {
    return NextResponse.json({ error: "Filing has not been generated yet" }, { status: 400 });
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
