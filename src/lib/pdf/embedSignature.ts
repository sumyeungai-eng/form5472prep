import { PDFDocument } from "pdf-lib";
import type { SignatureLocation } from "./generatePackage";

// Embeds a customer's signature PNG image into the unsigned generated PDF
// at each declared SignatureLocation. Outputs the resulting bytes ready to
// store as `signedPdfKey`.
//
// Coordinate convention: pdf-lib uses bottom-left origin in PDF points.
// US Letter pages are 612 x 792 pts. We pick a reasonable signature size
// (180 x 50 pts) and place it near the bottom-left of each signature page,
// shifted slightly upward to land in the "Sign here" zone of the standard
// IRS forms. If the customer's drawing is empty or invalid, we throw so
// the route handler can surface the error instead of writing a blank PDF.

export type SignedDocument = {
  bytes: Uint8Array;
  pagesSigned: number;
};

// Per-label tuned placement. Falls back to BASIC if the label isn't matched.
// All values are in PDF points (1pt = 1/72 inch).
const PLACEMENTS: Array<{ match: (label: string) => boolean; x: number; y: number; width: number; height: number }> = [
  // Cover letter — signature line above the typed name near the bottom.
  { match: (l) => l.toLowerCase().includes("cover"), x: 72, y: 110, width: 200, height: 55 },
  // Reasonable Cause Statement — end of doc, last page.
  { match: (l) => l.toLowerCase().includes("reasonable"), x: 72, y: 110, width: 200, height: 55 },
  // Form 1120 — "Sign Here" box at the bottom of the first page.
  { match: (l) => l.toLowerCase().includes("1120"), x: 200, y: 138, width: 180, height: 38 },
];

const BASIC = { x: 72, y: 110, width: 200, height: 55 };

function placementFor(label: string) {
  return PLACEMENTS.find((p) => p.match(label)) ?? BASIC;
}

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
    const place = placementFor(loc.label);
    page.drawImage(image, {
      x: place.x,
      y: place.y,
      width: place.width,
      height: place.height,
    });
    pagesSigned++;
  }

  const bytes = await pdf.save();
  return { bytes, pagesSigned };
}
