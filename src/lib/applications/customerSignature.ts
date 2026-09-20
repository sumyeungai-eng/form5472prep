import { NextResponse } from "next/server";
import {
  SIGNATURE_CONSENT_VERSION,
  normalizeSignerName,
  signatureKeyFor,
  signState,
  type ApplicationType,
} from "@/lib/applicationSignature";
import { env } from "@/lib/env";
import { sendApplicationSignedAdminEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { del, get as getStorageObject, put } from "@/lib/storage";

export type SignableApplication = {
  id: string;
  type: ApplicationType;
  fullName: string;
  paidAt: Date | null;
  preparedPdfKey: string | null;
  preparedPdfSha256: string | null;
  intakeSignaturePngKey: string | null;
  intakeSignerName: string | null;
  signaturePngKey: string | null;
  signedAt: Date | null;
  signerName: string | null;
  signedPdfKey: string | null;
};

const PNG_PREFIX = "data:image/png;base64,";
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MIN_PNG_BYTES = 200;
const MAX_PNG_BYTES = 2 * 1024 * 1024;
const DOC_SHA_RE = /^[a-f0-9]{64}$/;

function jsonError(error: string, status: number): NextResponse<{ error: string }> {
  return NextResponse.json({ error }, { status });
}

export async function loadOwnedApplication(
  type: ApplicationType,
  id: string,
  userId: string,
): Promise<SignableApplication | null> {
  const select = {
    id: true,
    fullName: true,
    paidAt: true,
    preparedPdfKey: true,
    preparedPdfSha256: true,
    intakeSignaturePngKey: true,
    intakeSignerName: true,
    signaturePngKey: true,
    signedAt: true,
    signerName: true,
    signedPdfKey: true,
  };

  if (type === "ein") {
    const app = await prisma.einApplication.findFirst({
      where: { id, userId },
      select,
    });
    return app ? { ...app, type } : null;
  }

  const app = await prisma.itinApplication.findFirst({
    where: { id, userId },
    select,
  });
  return app ? { ...app, type } : null;
}

export function parseSignBody(
  body: unknown,
):
  | { ok: true; pngBytes: Uint8Array | null; signerName: string; docSha256: string }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body" };
  }

  const value = body as {
    signaturePngDataUrl?: unknown;
    signerName?: unknown;
    consent?: unknown;
    docSha256?: unknown;
    useIntakeSignature?: unknown;
  };

  if (value.consent !== true) {
    return { ok: false, error: "Please confirm your consent before signing." };
  }

  const signerName = normalizeSignerName(value.signerName);
  if (!signerName) {
    return { ok: false, error: "Enter your full legal name." };
  }

  if (typeof value.docSha256 !== "string" || !DOC_SHA_RE.test(value.docSha256)) {
    return { ok: false, error: "Invalid document version." };
  }

  if (value.useIntakeSignature === true) {
    return { ok: true, pngBytes: null, signerName, docSha256: value.docSha256 };
  }

  if (typeof value.signaturePngDataUrl !== "string" || !value.signaturePngDataUrl.startsWith(PNG_PREFIX)) {
    return { ok: false, error: "Malformed signature image." };
  }

  let pngBytes: Uint8Array;
  try {
    pngBytes = Buffer.from(value.signaturePngDataUrl.slice(PNG_PREFIX.length), "base64");
  } catch {
    return { ok: false, error: "Malformed signature image." };
  }

  if (!PNG_MAGIC.every((byte, index) => pngBytes[index] === byte)) {
    return { ok: false, error: "Signature image must be a PNG." };
  }
  if (pngBytes.byteLength < MIN_PNG_BYTES) {
    return { ok: false, error: "Signature image too small. Please draw your signature again." };
  }
  if (pngBytes.byteLength > MAX_PNG_BYTES) {
    return { ok: false, error: "Signature image is too large." };
  }

  return { ok: true, pngBytes, signerName, docSha256: value.docSha256 };
}

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  const forwardedFirst = forwarded?.split(",")[0]?.trim();
  if (forwardedFirst) return forwardedFirst.slice(0, 64);

  const realIp = headers.get("x-real-ip")?.trim();
  return realIp ? realIp.slice(0, 64) : null;
}

async function updateSignedApplication(args: {
  type: ApplicationType;
  id: string;
  userId: string;
  signaturePngKey: string;
  signedAt: Date;
  signerName: string;
  signatureIp: string | null;
  signatureUserAgent: string | null;
  signedDocSha256: string;
}) {
  const data = {
    signaturePngKey: args.signaturePngKey,
    signedAt: args.signedAt,
    signerName: args.signerName,
    signatureIp: args.signatureIp,
    signatureUserAgent: args.signatureUserAgent,
    signatureConsentVersion: SIGNATURE_CONSENT_VERSION,
    signedDocSha256: args.signedDocSha256,
  };

  if (args.type === "ein") {
    return prisma.einApplication.updateMany({
      where: { id: args.id, userId: args.userId, signedPdfKey: null, preparedPdfSha256: args.signedDocSha256 },
      data,
    });
  }

  return prisma.itinApplication.updateMany({
    where: { id: args.id, userId: args.userId, signedPdfKey: null, preparedPdfSha256: args.signedDocSha256 },
    data,
  });
}

export async function handleSign(type: ApplicationType, id: string, req: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const app = await loadOwnedApplication(type, id, user.id);
  if (!app) return jsonError("Not found", 404);

  const state = signState(app);
  if (state === "NOT_READY") return jsonError("not ready to sign yet", 409);
  if (state === "LOCKED") return jsonError("already finalised", 409);

  const parsed = parseSignBody(await req.json().catch(() => null));
  if (!parsed.ok) return jsonError(parsed.error, 400);

  let pngBytes = parsed.pngBytes;
  if (pngBytes === null) {
    if (app.intakeSignaturePngKey === null) {
      return jsonError("We do not have a signature from your application. Draw one below.", 409);
    }
    pngBytes = await getStorageObject(app.intakeSignaturePngKey);
  }

  if (parsed.docSha256 !== app.preparedPdfSha256) {
    return jsonError("The form was updated after you opened it. Reload the page and review the new version.", 409);
  }

  const signaturePngKey = signatureKeyFor(type, id, parsed.docSha256);
  await put(signaturePngKey, pngBytes, "image/png");

  const claim = await updateSignedApplication({
    type,
    id,
    userId: user.id,
    signaturePngKey,
    signedAt: new Date(),
    signerName: parsed.signerName,
    signatureIp: clientIp(req.headers),
    signatureUserAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    signedDocSha256: parsed.docSha256,
  });
  if (claim.count === 0) {
    if (signaturePngKey !== app.signaturePngKey) {
      await Promise.allSettled([del(signaturePngKey)]);
    }
    return jsonError("The form was updated after you opened it. Reload the page and review the new version.", 409);
  }

  if (app.signaturePngKey && app.signaturePngKey !== signaturePngKey) {
    await Promise.allSettled([del(app.signaturePngKey)]);
  }

  try {
    await sendApplicationSignedAdminEmail({
      type,
      applicationId: id,
      fullName: app.fullName,
      adminLink: `${env.appUrl}/admin/applications/${type}/${id}`,
    });
  } catch (err) {
    console.error("[application sign] admin email failed", { type, id, err });
  }

  return NextResponse.json({ ok: true });
}

export async function handleDocument(type: ApplicationType, id: string, req: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const app = await loadOwnedApplication(type, id, user.id);
  if (!app) return jsonError("Not found", 404);

  const signed = new URL(req.url).searchParams.get("signed") === "1";
  const key = signed ? app.signedPdfKey : app.preparedPdfKey;
  if (!key || (!signed && !app.paidAt)) return jsonError("Not found", 404);

  const bytes = await getStorageObject(key);
  const baseName = type === "ein" ? "form-ss4" : "form-w7";
  const filename = `${baseName}${signed ? "-signed" : ""}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
