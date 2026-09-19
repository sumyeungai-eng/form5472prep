import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { isAdmin } from "@/lib/admin/auth";
import { parsePlacements, stampPlacements } from "@/lib/pdf/stampPlacements";
import { prisma } from "@/lib/prisma";
import { get as getStorageObject, putPdf } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Admin-only: takes admin-chosen placements (one per signature), embeds the
// stored customer signature PNG into the unsigned PDF at those coords, and
// saves the result as the signed PDF. Bumps status to SIGNED_UPLOADED so
// the existing "Send fax to IRS" button enables.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: { id: true, generatedPdfKey: true, signaturePngKey: true },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });
  if (!filing.generatedPdfKey) {
    return NextResponse.json({ error: "no unsigned PDF on file — regenerate first" }, { status: 400 });
  }
  // signaturePngKey is only required if at least one placement is a
  // signature (vs date-only). We re-check below once we've parsed the body.
  const body = (await req.json().catch(() => ({}))) as { placements?: unknown };
  const parsed = parsePlacements(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const placements = parsed.placements;

  const needsSignatureImage = placements.some((p) => p.kind === "signature");
  if (needsSignatureImage && !filing.signaturePngKey) {
    return NextResponse.json(
      { error: "customer hasn't drawn a signature yet — date-only placement is OK but signature placements need a PNG on file" },
      { status: 400 },
    );
  }
  const [pdfBytes, pngBytes] = await Promise.all([
    getStorageObject(filing.generatedPdfKey),
    needsSignatureImage && filing.signaturePngKey
      ? getStorageObject(filing.signaturePngKey)
      : Promise.resolve(new Uint8Array()),
  ]);

  let outBytes: Uint8Array;
  let pagesTouched = 0;
  try {
    const pdf = await PDFDocument.load(pdfBytes);
    for (const p of placements) {
      const idx = p.page - 1;
      if (idx < 0 || idx >= pdf.getPageCount()) {
        console.warn(`[place-signature] page ${p.page} out of range for filing ${filing.id}`);
        continue;
      }
      pagesTouched++;
    }
    outBytes = await stampPlacements(pdfBytes, needsSignatureImage ? pngBytes : null, placements);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[place-signature] embed failed", { filingId: filing.id, error: msg });
    return NextResponse.json({ error: `Embed failed: ${msg}` }, { status: 500 });
  }

  const key = `${filing.id}_signed.pdf`;
  await putPdf(key, outBytes);
  await prisma.filing.update({
    where: { id: filing.id },
    data: {
      signedPdfKey: key,
      signedAt: new Date(),
      status: "SIGNED_UPLOADED",
    },
  });
  const signed = { pagesSigned: pagesTouched, bytes: outBytes };

  return NextResponse.json({
    ok: true,
    pagesSigned: signed.pagesSigned,
    signedKey: key,
    bytes: signed.bytes.length,
  });
}
