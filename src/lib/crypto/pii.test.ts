import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptPii, encryptPii, isPiiCryptoConfigured, PiiCryptoError } from "./pii";

// Synthetic values only — never a real SSN.
const SSN = "123456789";
const keyA = { PII_ENCRYPTION_KEY: crypto.randomBytes(32).toString("base64") };
const keyB = { PII_ENCRYPTION_KEY: crypto.randomBytes(32).toString("base64") };

function codeOf(fn: () => unknown): string | null {
  try {
    fn();
    return null;
  } catch (err) {
    expect(err).toBeInstanceOf(PiiCryptoError);
    // Errors never echo the input.
    expect(String((err as Error).message)).not.toContain(SSN);
    return (err as PiiCryptoError).code;
  }
}

describe("PII encryption (AES-256-GCM, v1 format)", () => {
  it("round-trips and never stores the plaintext", () => {
    const stored = encryptPii(SSN, keyA);
    expect(stored).toMatch(/^v1:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/);
    expect(stored).not.toContain(SSN);
    expect(decryptPii(stored, keyA)).toBe(SSN);
  });

  it("uses a fresh 12-byte IV per value (same input, different ciphertext)", () => {
    const a = encryptPii(SSN, keyA);
    const b = encryptPii(SSN, keyA);
    expect(a).not.toBe(b);
    expect(Buffer.from(a.split(":")[1], "base64url")).toHaveLength(12);
    expect(Buffer.from(a.split(":")[2], "base64url")).toHaveLength(16);
  });

  it("throws (never returns garbage) with the wrong key", () => {
    const stored = encryptPii(SSN, keyA);
    expect(codeOf(() => decryptPii(stored, keyB))).toBe("decrypt_failed");
  });

  it.each([
    ["ciphertext", 3],
    ["auth tag", 2],
    ["IV", 1],
  ])("throws when the %s is altered", (_label, index) => {
    const parts = encryptPii(SSN, keyA).split(":");
    const bytes = Buffer.from(parts[index], "base64url");
    bytes[0] ^= 0x01;
    parts[index] = bytes.toString("base64url");
    expect(codeOf(() => decryptPii(parts.join(":"), keyA))).toBe("decrypt_failed");
  });

  it("rejects malformed and unknown-version values", () => {
    const stored = encryptPii(SSN, keyA);
    expect(codeOf(() => decryptPii(stored.replace(/^v1:/, "v2:"), keyA))).toBe("unsupported_version");
    expect(codeOf(() => decryptPii("v1:abc", keyA))).toBe("malformed");
    expect(codeOf(() => decryptPii(SSN, keyA))).toBe("malformed");
    expect(codeOf(() => decryptPii("v1:!!:!!:!!", keyA))).toBe("malformed");
  });

  it("refuses to work without a key, and reports it as not configured", () => {
    expect(isPiiCryptoConfigured({})).toBe(false);
    expect(isPiiCryptoConfigured({ PII_ENCRYPTION_KEY: "  " })).toBe(false);
    expect(codeOf(() => encryptPii(SSN, {}))).toBe("not_configured");
    const stored = encryptPii(SSN, keyA);
    expect(codeOf(() => decryptPii(stored, {}))).toBe("not_configured");
  });

  it("rejects a key that is not base64 of exactly 32 bytes", () => {
    const short = { PII_ENCRYPTION_KEY: crypto.randomBytes(16).toString("base64") };
    const garbage = { PII_ENCRYPTION_KEY: "not a key!" };
    expect(isPiiCryptoConfigured(short)).toBe(false);
    expect(isPiiCryptoConfigured(garbage)).toBe(false);
    expect(codeOf(() => encryptPii(SSN, short))).toBe("invalid_key");
    expect(codeOf(() => encryptPii(SSN, garbage))).toBe("invalid_key");
    expect(isPiiCryptoConfigured(keyA)).toBe(true);
  });

  it("accepts the key in base64url form too", () => {
    const raw = crypto.randomBytes(32);
    const std = { PII_ENCRYPTION_KEY: raw.toString("base64") };
    const url = { PII_ENCRYPTION_KEY: raw.toString("base64url") };
    expect(decryptPii(encryptPii(SSN, std), url)).toBe(SSN);
  });
});
