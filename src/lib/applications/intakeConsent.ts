export const INTAKE_CONSENT_VERSION = "2026-09-21";
export const INTAKE_SIGNER_NAME_MAX = 120;

const PNG_PREFIX = "data:image/png;base64,";
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MIN_PNG_BYTES = 200;
const MAX_PNG_BYTES = 2 * 1024 * 1024;
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function intakeConsentText(type: "ein" | "itin"): string {
  const form = type === "ein" ? "Form SS-4" : "Form W-7";
  return `I adopt the signature drawn above as my own for my ${form} application. Form5472 Prep will prepare the form from the information I provide and show me the completed form for review. My signature will be applied to the form only after I confirm the completed form is true, correct, and complete.`;
}

function normalizeSignerName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > INTAKE_SIGNER_NAME_MAX) return null;
  return normalized;
}

function bytesFromBinaryString(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64Manually(base64: string): Uint8Array {
  const clean = base64.replace(/\s+/g, "");
  if (!clean || clean.length % 4 === 1) throw new Error("invalid base64");

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  let seenPadding = false;

  for (const char of clean) {
    if (char === "=") {
      seenPadding = true;
      continue;
    }
    if (seenPadding) throw new Error("invalid base64");

    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) throw new Error("invalid base64");

    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

function decodeBase64(base64: string): Uint8Array {
  if (typeof globalThis.atob === "function") {
    return bytesFromBinaryString(globalThis.atob(base64));
  }
  return decodeBase64Manually(base64);
}

export function parseIntakeSignature(raw: {
  signaturePngDataUrl?: unknown;
  signerName?: unknown;
  consent?: unknown;
}):
  | { ok: true; pngBytes: Uint8Array; signerName: string }
  | { ok: false; error: string } {
  if (raw.consent !== true) {
    return { ok: false, error: "Please confirm your consent before signing." };
  }

  const signerName = normalizeSignerName(raw.signerName);
  if (!signerName) {
    return { ok: false, error: "Enter your full legal name." };
  }

  if (typeof raw.signaturePngDataUrl !== "string" || !raw.signaturePngDataUrl.startsWith(PNG_PREFIX)) {
    return { ok: false, error: "Malformed signature image." };
  }

  let pngBytes: Uint8Array;
  try {
    pngBytes = decodeBase64(raw.signaturePngDataUrl.slice(PNG_PREFIX.length));
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

  return { ok: true, pngBytes, signerName };
}
