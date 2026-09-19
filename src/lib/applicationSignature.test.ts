import { describe, expect, it } from "vitest";
import {
  SIGNER_NAME_MAX,
  applicationKeys,
  canStamp,
  consentText,
  formLabel,
  isApplicationType,
  normalizeSignerName,
  sha256Hex,
  signatureKeyFor,
  signState,
} from "@/lib/applicationSignature";

describe("applicationSignature", () => {
  it("identifies supported application types and labels", () => {
    expect(isApplicationType("ein")).toBe(true);
    expect(isApplicationType("itin")).toBe(true);
    expect(isApplicationType("filing")).toBe(false);
    expect(formLabel("ein")).toBe("Form SS-4");
    expect(formLabel("itin")).toBe("Form W-7");
  });

  it("builds stable storage keys", () => {
    expect(applicationKeys("ein", "app_123")).toEqual({
      signature: "applications/ein/app_123/signature.png",
      prepared: "applications/ein/app_123/prepared.pdf",
      signed: "applications/ein/app_123/signed.pdf",
    });
  });

  it("builds document-versioned signature storage keys", () => {
    expect(signatureKeyFor("itin", "app_456", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")).toBe(
      "applications/itin/app_456/signature-0123456789abcdef.png",
    );
  });

  it("renders consent text containing the form label", () => {
    expect(consentText("ein")).toContain("Form SS-4");
    expect(consentText("itin")).toContain("Form W-7");
  });

  it("hashes bytes as sha256 hex", () => {
    expect(sha256Hex(new TextEncoder().encode("abc"))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("returns all sign states in the required order", () => {
    const paidAt = new Date("2026-09-19T12:00:00.000Z");
    expect(signState({ paidAt: null, preparedPdfKey: "prepared.pdf", signaturePngKey: "sig.png", signedPdfKey: "signed.pdf" })).toBe("NOT_READY");
    expect(signState({ paidAt, preparedPdfKey: null, signaturePngKey: "sig.png", signedPdfKey: "signed.pdf" })).toBe("NOT_READY");
    expect(signState({ paidAt, preparedPdfKey: "prepared.pdf", signaturePngKey: "sig.png", signedPdfKey: "signed.pdf" })).toBe("LOCKED");
    expect(signState({ paidAt, preparedPdfKey: "prepared.pdf", signaturePngKey: "sig.png", signedPdfKey: null })).toBe("SIGNED");
    expect(signState({ paidAt, preparedPdfKey: "prepared.pdf", signaturePngKey: null, signedPdfKey: null })).toBe("READY");
  });

  it("only allows stamping when a signature exists and hashes match", () => {
    expect(canStamp({ preparedPdfSha256: "abc", signedDocSha256: "abc", signaturePngKey: null })).toBe(false);
    expect(canStamp({ preparedPdfSha256: "abc", signedDocSha256: "def", signaturePngKey: "sig.png" })).toBe(false);
    expect(canStamp({ preparedPdfSha256: null, signedDocSha256: "abc", signaturePngKey: "sig.png" })).toBe(false);
    expect(canStamp({ preparedPdfSha256: "abc", signedDocSha256: null, signaturePngKey: "sig.png" })).toBe(false);
    expect(canStamp({ preparedPdfSha256: "abc", signedDocSha256: "abc", signaturePngKey: "sig.png" })).toBe(true);
  });

  it("normalizes signer names", () => {
    expect(normalizeSignerName("  Alex \n Chen\t ")).toBe("Alex Chen");
    expect(normalizeSignerName("   ")).toBeNull();
    expect(normalizeSignerName(null)).toBeNull();
    expect(normalizeSignerName("a".repeat(SIGNER_NAME_MAX))).toBe("a".repeat(SIGNER_NAME_MAX));
    expect(normalizeSignerName("a".repeat(SIGNER_NAME_MAX + 1))).toBeNull();
  });
});
