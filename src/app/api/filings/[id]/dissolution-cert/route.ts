import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { put } from "@/lib/storage";

export const runtime = "nodejs";

export const maxDuration = 30;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// Optional supporting document for FINAL returns only: the state-issued
// dissolution / cancellation certificate. Nothing downstream requires it —
// it exists so the accountant can eyeball the effective dissolution date
// against dissolvedAt instead of emailing the customer. A filing is complete
// without it.
//
// Auth mirrors /api/filings/[id]/statements: ownership via getOwnedFiling
// (anonymous session cookie OR magic-link user), nodejs runtime for Buffer +
// the storage adapter. Like statements, there is no DRAFT-status gate — the
// customer may be asked for this after the package has been generated.

type Detected = { ext: "pdf" | "png" | "jpg"; contentType: string };

// Sniff the real format from the leading bytes rather than trusting the
// browser-supplied content-type or the filename extension (both are
// attacker-controlled, and the extension feeds the storage key).
function detectType(bytes: Uint8Array): Detected | null {
  // %PDF-
  if (
    bytes.length > 5 &&
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d
  ) {
    return { ext: "pdf", contentType: "application/pdf" };
  }
  // \x89PNG\r\n\x1a\n
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { ext: "png", contentType: "image/png" };
  }
  // JPEG SOI + marker
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  return null;
}

// Upload (or replace) the dissolution certificate for a final return.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Deliberately NOT gated on filing.isFinalReturn. The upload control appears
  // as soon as the customer ticks the final-return box, which is before that
  // flag is persisted by the step's Continue — gating here would reject the
  // upload exactly when the UI invites it. Ownership is the real guard, and an
  // uploaded certificate on a filing that never becomes final is inert.
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob))
    return NextResponse.json({ error: "file required" }, { status: 400 });

  if (file.size === 0)
    return NextResponse.json({ error: "File is empty" }, { status: 400 });

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — max 10 MB` },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectType(bytes);
  if (!detected) {
    return NextResponse.json(
      { error: "Only PDF, PNG or JPG files are accepted." },
      { status: 415 },
    );
  }

  // Deterministic key: one certificate per filing, re-uploading overwrites.
  const key = `${filing.id}_dissolution_cert.${detected.ext}`;
  try {
    await put(key, bytes, detected.contentType);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[dissolution-cert] storage put failed", { filingId: filing.id, error: msg });
    return NextResponse.json({ error: `Failed to save certificate: ${msg}` }, { status: 500 });
  }

  await prisma.filing.update({
    where: { id: filing.id },
    data: { dissolutionCertKey: key },
  });

  return NextResponse.json({
    ok: true,
    key,
    fileType: detected.ext,
    fileName: (file as File).name ?? null,
  });
}

// Detach the certificate from the filing. The R2/local object is deliberately
// left in place — storage cleanup is out of scope, and re-uploading the same
// format overwrites the same key anyway.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.filing.update({
    where: { id: filing.id },
    data: { dissolutionCertKey: null },
  });

  return NextResponse.json({ ok: true });
}
