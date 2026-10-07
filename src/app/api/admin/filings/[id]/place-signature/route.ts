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
// Optional preparer signature (Form 1120 "Paid Preparer Use Only"): the
// signing admin's OWN drawn signature — sent as `preparerSignaturePng` (PNG
// data URL) or `useSavedPreparerSignature: true` to reuse the one saved on
// their admin account. A copy is kept per filing and the change log records
// who signed. It is never the client's signature, and vice versa.
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

  // Preparer signature: drawn now, or the admin's saved one.
  const needsPreparerImage = placements.some((p) => p.kind === "preparerSignature");
  let preparerPng: Uint8Array | null = null;
  if (needsPreparerImage) {
    if (body.preparerSignaturePng !== undefined) {
      preparerPng = decodePngDataUrl(body.preparerSignaturePng);
      if (!preparerPng || !(await isReadablePng(preparerPng))) {
        return NextResponse.json({ error: "The preparer signature image is invalid. Draw it again." }, { status: 400 });
      }
    } else if (body.useSavedPreparerSignature === true && principal.adminId) {
      const admin = await prisma.admin.findUnique({
        where: { id: principal.adminId },
        select: { preparerSignatureKey: true },
      });
      if (admin?.preparerSignatureKey) preparerPng = await getStorageObject(admin.preparerSignatureKey);
    }
    if (!preparerPng) {
      return NextResponse.json(
        { error: "Draw the preparer signature (or use your saved one) before placing it." },
        { status: 400 },
      );
    }
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
    outBytes = await stampPlacements(pdfBytes, needsSignatureImage ? pngBytes : null, placements, preparerPng);
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

  if (preparerPng) {
    // Timestamp + random suffix: two saves in the same millisecond must not
    // overwrite each other's copy (the change log points at this key).
    const stamp = `${Date.now()}_${randomUUID().slice(0, 8)}`;
    const filingCopyKey = `${filing.id}_preparer_signature_${stamp}.png`;
    await put(filingCopyKey, preparerPng, "image/png");
    if (body.rememberPreparerSignature === true && principal.adminId) {
      const adminKey = `admin_${principal.adminId}_preparer_signature_${stamp}.png`;
      await put(adminKey, preparerPng, "image/png");
      await prisma.admin.update({ where: { id: principal.adminId }, data: { preparerSignatureKey: adminKey } });
    }
    try {
      await logFilingChange({
        filingId: filing.id,
        adminId: principal.adminId,
        source: "admin",
        field: "preparer_signature",
        before: null,
        after: {
          preparerSignatureKey: filingCopyKey,
          signedBy: principal.email ?? "shared admin session",
          placements: placements.filter((p) => p.kind === "preparerSignature").length,
        },
      });
    } catch (err) {
      console.error("[place-signature] preparer signature change-log write failed", err);
    }
  }

  return NextResponse.json({
    ok: true,
    pagesSigned: signed.pagesSigned,
    signedKey: key,
    bytes: signed.bytes.length,
  });
}
