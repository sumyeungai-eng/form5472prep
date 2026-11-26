import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { logFilingChange } from "@/lib/admin/mutations";
import { decodePngDataUrl, isReadablePng } from "@/lib/pdf/preparerSignature";
import { parsePlacements, stampPlacements } from "@/lib/pdf/stampPlacements";
import { prisma } from "@/lib/prisma";
import { get as getStorageObject, put, putPdf } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Admin-only: takes admin-chosen placements (one per signature), embeds the
// stored customer signature PNG into the unsigned PDF at those coords, and
// saves the result as the signed PDF. Bumps status to SIGNED_UPLOADED so
// the existing "Send fax to IRS" button enables.
//
// Optional preparer signature and handwritten name (Form 1120 "Paid Preparer Use Only"): the
// signing admin's OWN drawings, sent as `preparerSignaturePng` / `preparerNamePng`
// or `useSavedPreparerSignature` / `useSavedPreparerName` to reuse personal
// account copies. Each is kept per filing and audited by key, never image data.
// Neither drawing is interchangeable with the other or the client signature.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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
  const body = (await req.json().catch(() => ({}))) as {
    placements?: unknown;
    preparerSignaturePng?: unknown;
    useSavedPreparerSignature?: unknown;
    rememberPreparerSignature?: unknown;
    preparerNamePng?: unknown;
    useSavedPreparerName?: unknown;
    rememberPreparerName?: unknown;
  };
  const parsed = parsePlacements(body, { allowPreparerSignature: true });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const placements = parsed.placements;

  const needsSignatureImage = placements.some((p) => p.kind === "signature");
  if (needsSignatureImage && !filing.signaturePngKey) {
    return NextResponse.json(
      { error: "customer hasn't drawn a signature yet — date-only placement is OK but signature placements need a PNG on file" },
      { status: 400 },
    );
  }

  // Resolve each admin image independently; never fall back to another kind.
  const preparerImages = [
    { kind: "preparerSignature", label: "signature", png: body.preparerSignaturePng, saved: body.useSavedPreparerSignature,
      remember: body.rememberPreparerSignature, keyField: "preparerSignatureKey", field: "preparer_signature" },
    { kind: "preparerName", label: "name", png: body.preparerNamePng, saved: body.useSavedPreparerName,
      remember: body.rememberPreparerName, keyField: "preparerNameKey", field: "preparer_name" },
  ] as const;
  const imageBytes: Partial<Record<"preparerSignature" | "preparerName", Uint8Array>> = {};
  for (const image of preparerImages) {
    if (!placements.some((p) => p.kind === image.kind)) continue;
    let bytes: Uint8Array | null = null;
    if (image.png !== undefined) {
      bytes = decodePngDataUrl(image.png);
    } else if (image.saved === true && principal.adminId) {
      const admin = await prisma.admin.findUnique({
        where: { id: principal.adminId },
        select: { preparerSignatureKey: true, preparerNameKey: true },
      });
      const key = admin?.[image.keyField];
      if (key) bytes = await getStorageObject(key).catch(() => null);
    }
    if (!bytes) {
      return NextResponse.json(
        { error: `Draw the preparer ${image.label} (or use your saved one) before placing it.` },
        { status: 400 },
      );
    }
    if (!(await isReadablePng(bytes))) {
      return NextResponse.json({ error: `The preparer ${image.label} image is invalid. Draw it again.` }, { status: 400 });
    }
    imageBytes[image.kind] = bytes;
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
    const pdf = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    for (const p of placements) {
      const idx = p.page - 1;
      if (idx < 0 || idx >= pdf.getPageCount()) {
        console.warn(`[place-signature] page ${p.page} out of range for filing ${filing.id}`);
        continue;
      }
      pagesTouched++;
    }
    outBytes = await stampPlacements(
      pdfBytes, needsSignatureImage ? pngBytes : null, placements,
      imageBytes.preparerSignature ?? null, imageBytes.preparerName ?? null,
    );
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

  for (const image of preparerImages) {
    const bytes = imageBytes[image.kind];
    if (!bytes) continue;
    // Timestamp + random suffix keeps every filing's audit copy immutable.
    const stamp = `${Date.now()}_${randomUUID().slice(0, 8)}`;
    const filingCopyKey = `${filing.id}_${image.field}_${stamp}.png`;
    await put(filingCopyKey, bytes, "image/png");
    if (image.remember === true && principal.adminId) {
      const adminKey = `admin_${principal.adminId}_${image.field}_${stamp}.png`;
      await put(adminKey, bytes, "image/png");
      await prisma.admin.update({ where: { id: principal.adminId }, data: { [image.keyField]: adminKey } });
    }
    try {
      await logFilingChange({
        filingId: filing.id,
        adminId: principal.adminId,
        source: "admin",
        field: image.field,
        before: null,
        after: {
          [image.keyField]: filingCopyKey,
          signedBy: principal.email ?? "shared admin session",
          placements: placements.filter((p) => p.kind === image.kind).length,
        },
      });
    } catch (err) {
      console.error(`[place-signature] preparer ${image.label} change-log write failed`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    pagesSigned: signed.pagesSigned,
    signedKey: key,
    bytes: signed.bytes.length,
  });
}
