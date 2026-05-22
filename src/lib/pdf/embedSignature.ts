import { PDFDocument } from "pdf-lib";
import type { SignatureLocation } from "./generatePackage";

// Embeds a customer's signature PNG image into the unsigned generated PDF
// at each declared SignatureLocation. Outputs the resulting bytes ready to
// store as `signedPdfKey`.
//
// Coordinates come from the SignatureLocation itself — generatePackage knows
// each form's signature-line position (per IRS revision) and emits exact
// x/y/w/h alongside the page number. This file just draws — no guessing.
//
// Coordinate convention: pdf-lib uses bottom-left origin in PDF points.
// US Letter pages are 612 x 792 pts.

export type SignedDocument = {
  bytes: Uint8Array;
  pagesSigned: number;
};

export async function embedSignatureIntoPdf(
  unsignedPdfBytes: Uint8Array | Buffer,
  signaturePngBytes: Uint8Array | Buffer,
  locations: SignatureLocation[],
): Promise<SignedDocument> {
  if (!signaturePngBytes || signaturePngBytes.byteLength < 100) {
    throw new Error("Signature image is empty or invalid.");
  }
  if (locations.length === 0) {
    throw new Error("No signature locations on file — refusing to write a blank signed PDF.");
  }

  const pdf = await PDFDocument.load(unsignedPdfBytes);
  const image = await pdf.embedPng(signaturePngBytes);

  let pagesSigned = 0;
  for (const loc of locations) {
    // Convert 1-based page numbers to 0-based pdf-lib index.
    const idx = loc.page - 1;
    if (idx < 0 || idx >= pdf.getPageCount()) {
      // Generator emitted a page number outside the doc — log and skip rather
      // than crash. This keeps a single bad metadata entry from blocking the
      // rest of the signature application.
      console.warn(`[embedSignature] page ${loc.page} out of range for "${loc.label}"`);
      continue;
    }
    const page = pdf.getPage(idx);
    page.drawImage(image, {
      x: loc.x,
      y: loc.y,
      width: loc.width,
      height: loc.height,
    });
    pagesSigned++;
  }

  const bytes = await pdf.save();
  return { bytes, pagesSigned };
}
