import crypto from "node:crypto";

// Field-level encryption for taxpayer PII (first user: the owner's U.S. SSN,
// spec docs/reviews/2026-10-15-ssn-capture-spec.md S2).
//
//   Algorithm  AES-256-GCM, random 12-byte IV per value, 16-byte auth tag.
//   Key        env PII_ENCRYPTION_KEY = base64 of 32 random bytes
//              (`openssl rand -base64 32`). Owner-gated: set in Vercel.
//   Format     "v1:<iv>:<tag>:<ciphertext>", each part base64url.
//
// Decryption verifies the auth tag: a wrong key or any change to the stored
// string throws PiiCryptoError — it never returns garbage. Losing the key makes
// stored values unreadable; rotating it needs a re-encrypt step (not built).
//
// NEVER log plaintext, ciphertext or the key. Error messages below are fixed
// strings and never include the input.

export { normalizeSsn, validateSsn, maskSsn, formatSsnForForms } from "./ssn";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;

export type PiiCryptoErrorCode =
  | "not_configured"
  | "invalid_key"
  | "malformed"
  | "unsupported_version"
  | "decrypt_failed";

export class PiiCryptoError extends Error {
  readonly code: PiiCryptoErrorCode;

  constructor(code: PiiCryptoErrorCode, message: string) {
    super(message);
    this.name = "PiiCryptoError";
    this.code = code;
  }
}

type EnvLike = Record<string, string | undefined>;

const BASE64_RE = /^[A-Za-z0-9+/_-]+={0,2}$/;

function decodeKey(raw: string | undefined): Buffer {
  const value = (raw ?? "").trim();
  if (!value) throw new PiiCryptoError("not_configured", "PII_ENCRYPTION_KEY is not set");
  if (!BASE64_RE.test(value)) {
    throw new PiiCryptoError("invalid_key", "PII_ENCRYPTION_KEY must be base64 of 32 bytes");
  }
  const key = Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (key.length !== KEY_BYTES) {
    throw new PiiCryptoError("invalid_key", "PII_ENCRYPTION_KEY must be base64 of 32 bytes");
  }
  return key;
}

function loadKey(env: EnvLike = process.env): Buffer {
  return decodeKey(env.PII_ENCRYPTION_KEY);
}

// True when PII_ENCRYPTION_KEY is set and decodes to exactly 32 bytes. Callers
// use it to show the "temporarily unavailable" state instead of failing late.
export function isPiiCryptoConfigured(env: EnvLike = process.env): boolean {
  try {
    loadKey(env);
    return true;
  } catch {
    return false;
  }
}

export function encryptPii(plaintext: string, env: EnvLike = process.env): string {
  if (typeof plaintext !== "string" || plaintext.length === 0) {
    throw new PiiCryptoError("malformed", "nothing to encrypt");
  }
  const key = loadKey(env);
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(":");
}

const PART_RE = /^[A-Za-z0-9_-]+$/;

export function decryptPii(payload: string, env: EnvLike = process.env): string {
  if (typeof payload !== "string") throw new PiiCryptoError("malformed", "stored value is not a string");
  const parts = payload.split(":");
  if (parts.length !== 4) throw new PiiCryptoError("malformed", "stored value is not in the v1 format");
  const [version, ivPart, tagPart, ctPart] = parts;
  if (version !== VERSION) throw new PiiCryptoError("unsupported_version", "stored value has an unknown version");
  if (!PART_RE.test(ivPart) || !PART_RE.test(tagPart) || !PART_RE.test(ctPart)) {
    throw new PiiCryptoError("malformed", "stored value is not in the v1 format");
  }
  const iv = Buffer.from(ivPart, "base64url");
  const tag = Buffer.from(tagPart, "base64url");
  const ciphertext = Buffer.from(ctPart, "base64url");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES || ciphertext.length === 0) {
    throw new PiiCryptoError("malformed", "stored value is not in the v1 format");
  }
  const key = loadKey(env);
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    // Wrong key or tampered value: GCM's tag check failed. Never surface the
    // underlying error (it carries no secret, but keep the contract simple).
    throw new PiiCryptoError("decrypt_failed", "stored value could not be decrypted (wrong key or altered)");
  }
}
