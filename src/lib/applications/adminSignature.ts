import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import {
  PREPARED_PDF_MAX_BYTES,
  type ApplicationType,
  applicationKeys,
  canStamp,
  sha256Hex,
} from "@/lib/applicationSignature";
import { sendApplicationSignatureRequestEmail } from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";
import { parsePlacements, stampPlacements } from "@/lib/pdf/stampPlacements";
import { prisma } from "@/lib/prisma";
import { del, get as getStorageObject, getPdf, put, putPdf } from "@/lib/storage";

const MIN_PDF_BYTES = 1024;

type ApplicationRecord = {
  id: string;
  email: string;
  fullName: string;
  paidAt: Date | null;
  userId: string | null;
  preparedPdfKey: string | null;
  preparedPdfSha256: string | null;
  signaturePngKey: string | null;
  signedAt: Date | null;
  signedDocSha256: string | null;
  signedPdfKey: string | null;
};

export function validatePreparedPdf(
  bytes: Uint8Array,
  contentType: string | null,
): { ok: true } | { ok: false; error: string } {
  const normalizedType = (contentType ?? "").trim().toLowerCase();
  if (normalizedType && normalizedType !== "application/pdf") {
    return { ok: false, error: "file must be a PDF" };
  }
  if (bytes.length <= MIN_PDF_BYTES) {
    return { ok: false, error: "PDF is too small" };
  }
  if (bytes.length > PREPARED_PDF_MAX_BYTES) {
    return { ok: false, error: "PDF must be 4 MB or smaller" };
  }
  const header = new TextDecoder("ascii").decode(bytes.slice(0, 5));
  if (header !== "%PDF-") {
    return { ok: false, error: "file must start with %PDF-" };
  }
  return { ok: true };
}

export function signedLinkPath(type: ApplicationType, id: string): string {
  return `/applications/${type}/${id}/sign`;
}

export async function handleUploadPrepared(type: ApplicationType, id: string, req: Request): Promise<Response> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const app = await findApplication(type, id);
  if (!app) return json({ error: "application not found" }, 404);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!isFormFile(file)) {
    return json({ error: "file is required" }, 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const valid = validatePreparedPdf(bytes, file.type || null);
  if (!valid.ok) return json({ error: valid.error }, 400);

  try {
    await PDFDocument.load(bytes);
  } catch {
    return json({ error: "could not read that PDF" }, 400);
  }

  const keys = applicationKeys(type, id);
  const sha256 = sha256Hex(bytes);
  const oldKeys = [app.signaturePngKey, app.signedPdfKey].filter((key): key is string => !!key);

  await updateApplication(type, id, {
    preparedPdfSha256: null,
    signatureRequestedAt: null,
    signaturePngKey: null,
    signedAt: null,
    signerName: null,
    signatureIp: null,
    signatureUserAgent: null,
    signatureConsentVersion: null,
    signedDocSha256: null,
    signedPdfKey: null,
    signedPdfAt: null,
  });

  await put(keys.prepared, bytes, "application/pdf");
  await updateApplication(type, id, {
    preparedPdfKey: keys.prepared,
    preparedPdfSha256: sha256,
    preparedPdfUploadedAt: new Date(),
  });
  await Promise.allSettled(oldKeys.map((key) => del(key)));

  return NextResponse.json({
    ok: true,
    sha256,
    replacedSignature: !!(app.signaturePngKey || app.signedAt || app.signedDocSha256),
  });
}

export async function handleGetPrepared(type: ApplicationType, id: string, _req: Request): Promise<Response> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const app = await findApplication(type, id);
  if (!app) return json({ error: "application not found" }, 404);
  if (!app.preparedPdfKey) return json({ error: "no prepared PDF on file" }, 404);

  return pdfResponse(await getPdf(app.preparedPdfKey), app.preparedPdfKey);
}

export async function handleRequestSignature(type: ApplicationType, id: string, _req: Request): Promise<Response> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  let app = await findApplication(type, id);
  if (!app) return json({ error: "application not found" }, 404);
  if (!app.preparedPdfKey) return json({ error: "upload the prepared PDF first" }, 400);
  if (!app.paidAt) return json({ error: "application must be paid before requesting a signature" }, 400);

  let userId = app.userId;
  if (!userId) {
    const normalizedEmail = app.email.trim().toLowerCase();
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail },
    });
    app = await updateApplication(type, id, { userId: user.id });
    userId = user.id;
  }

  const baseLink = makeMagicLink(userId);
  const sep = baseLink.includes("?") ? "&" : "?";
  const signLink = `${baseLink}${sep}next=${encodeURIComponent(signedLinkPath(type, id))}`;

  try {
    await sendApplicationSignatureRequestEmail({
      email: app.email,
      fullName: app.fullName,
      type,
      signLink,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "could not send signature request" }, 502);
  }

  await updateApplication(type, id, { signatureRequestedAt: new Date() });
  return NextResponse.json({ ok: true, sentTo: app.email });
}

export async function handleGetSignaturePng(type: ApplicationType, id: string, _req: Request): Promise<Response> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const app = await findApplication(type, id);
  if (!app) return json({ error: "application not found" }, 404);
  if (!app.signaturePngKey) return json({ error: "no signature on file" }, 404);

  const bytes = await getStorageObject(app.signaturePngKey);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function handleGetSignedPdf(type: ApplicationType, id: string, _req: Request): Promise<Response> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const app = await findApplication(type, id);
  if (!app) return json({ error: "application not found" }, 404);
  if (!app.signedPdfKey) return json({ error: "no signed PDF on file" }, 404);

  return pdfResponse(await getPdf(app.signedPdfKey), app.signedPdfKey);
}

export async function handlePlaceSignature(type: ApplicationType, id: string, req: Request): Promise<Response> {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const app = await findApplication(type, id);
  if (!app) return json({ error: "application not found" }, 404);
  if (!app.preparedPdfKey) return json({ error: "no prepared PDF on file" }, 400);

  const body = await req.json().catch(() => ({}));
  const parsed = parsePlacements(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const needsSignatureImage = parsed.placements.some((p) => p.kind === "signature");
  if (!needsSignatureImage) {
    return json({ error: "add at least one signature placement" }, 400);
  }
  if (!canStamp(app)) {
    const error = app.signaturePngKey
      ? "The signature on file was made on a different version of this form. Ask the customer to sign again."
      : "customer has not signed yet";
    return json({ error }, 409);
  }

  const [pdfBytes, pngBytes] = await Promise.all([
    getPdf(app.preparedPdfKey),
    getStorageObject(app.signaturePngKey!),
  ]);
  const pdfSha256 = sha256Hex(pdfBytes);
  if (pdfSha256 !== app.signedDocSha256) {
    return json({ error: "The stored form does not match the version the customer signed. Upload the form again and request a new signature." }, 409);
  }

  let outBytes: Uint8Array;
  let pagesTouched = 0;
  try {
    const pdf = await PDFDocument.load(pdfBytes);
    for (const placement of parsed.placements) {
      const idx = placement.page - 1;
      if (idx >= 0 && idx < pdf.getPageCount()) {
        pagesTouched++;
      }
    }
    outBytes = await stampPlacements(pdfBytes, pngBytes, parsed.placements);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: `Embed failed: ${msg}` }, 500);
  }

  const key = applicationKeys(type, id).signed;
  await putPdf(key, outBytes);
  const claim = await updateStampedApplication(type, id, {
    signedDocSha256: pdfSha256,
    signaturePngKey: app.signaturePngKey!,
    signedPdfKey: key,
    signedPdfAt: new Date(),
  });
  if (claim.count === 0) {
    return json({ error: "The application changed while stamping. Reload and try again." }, 409);
  }

  return NextResponse.json({
    ok: true,
    pagesSigned: pagesTouched,
    signedKey: key,
    bytes: outBytes.length,
  });
}

async function requireAdmin(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return json({ error: "unauthorized" }, 401);
}

function json(body: { error: string }, status: number): Response {
  return NextResponse.json(body, { status });
}

function pdfResponse(bytes: Uint8Array, key: string): Response {
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${key}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function isFormFile(value: FormDataEntryValue | null | undefined): value is File {
  return !!value && typeof value === "object" && "arrayBuffer" in value && "type" in value;
}

async function findApplication(type: ApplicationType, id: string): Promise<ApplicationRecord | null> {
  if (type === "ein") {
    return prisma.einApplication.findUnique({
      where: { id },
      select: applicationSelect,
    });
  }
  return prisma.itinApplication.findUnique({
    where: { id },
    select: applicationSelect,
  });
}

async function updateApplication(
  type: ApplicationType,
  id: string,
  data: Record<string, unknown>,
): Promise<ApplicationRecord> {
  if (type === "ein") {
    return prisma.einApplication.update({
      where: { id },
      data,
      select: applicationSelect,
    });
  }
  return prisma.itinApplication.update({
    where: { id },
    data,
    select: applicationSelect,
  });
}

async function updateStampedApplication(
  type: ApplicationType,
  id: string,
  args: {
    signedDocSha256: string;
    signaturePngKey: string;
    signedPdfKey: string;
    signedPdfAt: Date;
  },
) {
  const where = { id, signedDocSha256: args.signedDocSha256, signaturePngKey: args.signaturePngKey };
  const data = { signedPdfKey: args.signedPdfKey, signedPdfAt: args.signedPdfAt };

  if (type === "ein") {
    return prisma.einApplication.updateMany({ where, data });
  }
  return prisma.itinApplication.updateMany({ where, data });
}

const applicationSelect = {
  id: true,
  email: true,
  fullName: true,
  paidAt: true,
  userId: true,
  preparedPdfKey: true,
  preparedPdfSha256: true,
  signaturePngKey: true,
  signedAt: true,
  signedDocSha256: true,
  signedPdfKey: true,
} as const;
