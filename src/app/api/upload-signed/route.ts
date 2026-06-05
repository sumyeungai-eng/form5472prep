import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { putPdf } from "@/lib/storage";
import { isAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

// Admin-only fallback for uploading a finalized signed PDF.
//
// SECURITY: this used to be owner-accessible (getOwnedFiling), which let any
// filing owner POST an arbitrary blob and flip the filing to SIGNED_UPLOADED
// without validation. The customer UI no longer exposes any upload control —
// in-portal signing (/filings/[id]/sign) + admin place-signature is the real
// flow — so this route is now gated to admin and hardened:
//   - requires a valid admin session
//   - validates the upload is actually a PDF (%PDF- magic bytes)
//   - caps file size
//   - requires the filing to already have a generated PDF to sign over
const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const filingId = formData.get("filingId");
  const file = formData.get("file");

  if (typeof filingId !== "string" || !(file instanceof Blob))
    return NextResponse.json({ error: "filingId + file required" }, { status: 400 });

  if (file.size === 0 || file.size > MAX_PDF_BYTES)
    return NextResponse.json({ error: "File must be a non-empty PDF under 25 MB" }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  // PDF magic number: %PDF-
  const isPdf =
    bytes.length > 5 &&
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
  if (!isPdf) return NextResponse.json({ error: "Uploaded file is not a PDF" }, { status: 400 });

  const filing = await prisma.filing.findUnique({ where: { id: filingId } });
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!filing.generatedPdfKey)
    return NextResponse.json({ error: "No generated PDF to sign over yet" }, { status: 409 });

  const key = `${filing.id}_signed.pdf`;
  await putPdf(key, bytes);

  await prisma.filing.update({
    where: { id: filing.id },
    data: { signedPdfKey: key, status: "SIGNED_UPLOADED" },
  });

  return NextResponse.json({ key });
}
