import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { get as getStorageObject, putPdf } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Placement =
  | {
      kind: "signature";
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      kind: "date";
      page: number;
      x: number;
      y: number;
      text: string; // human-typed date string, e.g. "05/22/2026"
      fontSize: number; // PDF points
    }
  | {
      kind: "text";
      page: number;
      x: number;
      y: number;
      text: string; // free-form admin text, e.g. an EIN correction, "See attached", etc.
      fontSize: number;
    };

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
  if (!Array.isArray(body.placements) || body.placements.length === 0) {
    return NextResponse.json({ error: "placements array required" }, { status: 400 });
  }

  // Validate every placement before doing any work — partial application
  // would write a half-signed PDF to storage. Pages are 1-based; coords are
  // PDF points with bottom-left origin (matches pdf-lib).
  const placements: Placement[] = [];
  for (const raw of body.placements as unknown[]) {
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "placement entry must be an object" }, { status: 400 });
    }
    const p = raw as Record<string, unknown>;
    const kind: "signature" | "date" | "text" =
      p.kind === "date" ? "date" : p.kind === "text" ? "text" : "signature";
    const page = Number(p.page);
    const x = Number(p.x);
    const y = Number(p.y);
    if (!Number.isFinite(page) || page < 1) {
      return NextResponse.json({ error: `bad page ${p.page}` }, { status: 400 });
    }
    if ([x, y].some((n) => !Number.isFinite(n))) {
      return NextResponse.json({ error: "x/y must be numbers" }, { status: 400 });
    }
    if (kind === "signature") {
      const width = Number(p.width);
      const height = Number(p.height);
      if ([width, height].some((n) => !Number.isFinite(n))) {
        return NextResponse.json({ error: "width/height must be numbers" }, { status: 400 });
      }
      if (width <= 0 || height <= 0 || width > 612 || height > 200) {
        return NextResponse.json({ error: "signature width/height out of range" }, { status: 400 });
      }
      placements.push({ kind: "signature", page: Math.round(page), x, y, width, height });
    } else {
      // date and text share validation — both are arbitrary admin-typed strings
      // drawn in Helvetica. Cap text at 200 chars (vs 60 for dates) since text
      // mode is meant for longer notes like addresses or sentences.
      const maxLen = kind === "date" ? 60 : 200;
      const text = typeof p.text === "string" ? p.text : "";
      const fontSize = Number(p.fontSize);
      if (!text.trim()) {
        return NextResponse.json({ error: `${kind} placement requires non-empty text` }, { status: 400 });
      }
      if (text.length > maxLen) {
        return NextResponse.json({ error: `${kind} text too long (max ${maxLen} chars)` }, { status: 400 });
      }
      if (!Number.isFinite(fontSize) || fontSize < 4 || fontSize > 40) {
        return NextResponse.json({ error: `${kind} fontSize out of range (4-40 pt)` }, { status: 400 });
      }
      placements.push({ kind, page: Math.round(page), x, y, text: text.trim(), fontSize });
    }
  }

  // Need at least one signature OR date for it to be worth saving.
  if (placements.length === 0) {
    return NextResponse.json({ error: "no placements provided" }, { status: 400 });
  }

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

  // Single-pass embedding: load the PDF once, embed the signature PNG +
  // a standard font, then iterate placements drawing image or text per kind.
  let outBytes: Uint8Array;
  let pagesTouched = 0;
  try {
    const pdf = await PDFDocument.load(pdfBytes);
    const signatureImage = needsSignatureImage ? await pdf.embedPng(pngBytes) : null;
    // Single font load for both date and text placements — both render
    // through pdf-lib's drawText in Helvetica.
    const needsTextFont = placements.some((p) => p.kind === "date" || p.kind === "text");
    const textFont = needsTextFont ? await pdf.embedFont(StandardFonts.Helvetica) : null;

    for (const p of placements) {
      const idx = p.page - 1;
      if (idx < 0 || idx >= pdf.getPageCount()) {
        console.warn(`[place-signature] page ${p.page} out of range for filing ${filing.id}`);
        continue;
      }
      const page = pdf.getPage(idx);
      if (p.kind === "signature" && signatureImage) {
        page.drawImage(signatureImage, { x: p.x, y: p.y, width: p.width, height: p.height });
      } else if ((p.kind === "date" || p.kind === "text") && textFont) {
        page.drawText(p.text, {
          x: p.x,
          y: p.y,
          size: p.fontSize,
          font: textFont,
          color: rgb(0, 0, 0),
        });
      }
      pagesTouched++;
    }
    outBytes = await pdf.save();
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
