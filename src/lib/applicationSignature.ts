import { createHash } from "node:crypto";

export type ApplicationType = "ein" | "itin";

export const SIGNATURE_CONSENT_VERSION = "2026-09-19";
export const SIGNER_NAME_MAX = 120;
export { PREPARED_PDF_MAX_BYTES } from "./applicationSignatureLimits";

export function isApplicationType(v: unknown): v is ApplicationType {
  return v === "ein" || v === "itin";
}

export function formLabel(type: ApplicationType): "Form SS-4" | "Form W-7" {
  return type === "ein" ? "Form SS-4" : "Form W-7";
}

export function consentText(type: ApplicationType): string {
  return `I have reviewed the attached ${formLabel(type)}. Under penalties of perjury, I declare that it is true, correct, and complete to the best of my knowledge, and I adopt the signature below as my own.`;
}

export function applicationKeys(type: ApplicationType, id: string): { signature: string; prepared: string; signed: string } {
  return {
    signature: `applications/${type}/${id}/signature.png`,
    prepared: `applications/${type}/${id}/prepared.pdf`,
    signed: `applications/${type}/${id}/signed.pdf`,
  };
}

export function preparedKeyFor(type: ApplicationType, id: string, sha256: string): string {
  return `applications/${type}/${id}/prepared-${sha256.slice(0, 16)}.pdf`;
}

export function signatureKeyFor(type: ApplicationType, id: string, docSha256: string): string {
  return `applications/${type}/${id}/signature-${docSha256.slice(0, 16)}.png`;
}

export function signedKeyFor(type: ApplicationType, id: string, docSha256: string): string {
  return `applications/${type}/${id}/signed-${docSha256.slice(0, 16)}.pdf`;
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export type SignState = "NOT_READY" | "READY" | "SIGNED" | "LOCKED";

export function signState(app: {
  paidAt: Date | null;
  preparedPdfKey: string | null;
  signaturePngKey: string | null;
  signedPdfKey: string | null;
}): SignState {
  if (app.paidAt === null || app.preparedPdfKey === null) return "NOT_READY";
  if (app.signedPdfKey !== null) return "LOCKED";
  if (app.signaturePngKey !== null) return "SIGNED";
  return "READY";
}

export function canStamp(app: {
  preparedPdfSha256: string | null;
  signedDocSha256: string | null;
  signaturePngKey: string | null;
}): boolean {
  return (
    app.signaturePngKey !== null &&
    app.preparedPdfSha256 !== null &&
    app.signedDocSha256 !== null &&
    app.preparedPdfSha256 === app.signedDocSha256
  );
}

export function normalizeSignerName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > SIGNER_NAME_MAX) return null;
  return normalized;
}
