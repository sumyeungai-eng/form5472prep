import { describe, expect, it } from "vitest";
import { intakeConsentText, parseIntakeSignature } from "./intakeConsent";

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function pngDataUrl(size = 200) {
  const bytes = new Uint8Array(size);
  PNG_MAGIC.forEach((byte, index) => {
    bytes[index] = byte;
  });
  return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    signaturePngDataUrl: pngDataUrl(),
    signerName: "  Alex   Chen ",
    consent: true,
    ...overrides,
  };
}

describe("intakeConsentText", () => {
  it("returns the exact EIN consent text", () => {
    expect(intakeConsentText("ein")).toBe(
      "I adopt the signature drawn above as my own for my Form SS-4 application. Form5472 Prep will prepare the form from the information I provide and show me the completed form for review. My signature will be applied to the form only after I confirm the completed form is true, correct, and complete.",
    );
  });

  it("returns the exact ITIN consent text", () => {
    expect(intakeConsentText("itin")).toBe(
      "I adopt the signature drawn above as my own for my Form W-7 application. Form5472 Prep will prepare the form from the information I provide and show me the completed form for review. My signature will be applied to the form only after I confirm the completed form is true, correct, and complete.",
    );
  });
});

describe("parseIntakeSignature", () => {
  it("rejects missing consent", () => {
    expect(parseIntakeSignature(validBody({ consent: undefined }))).toEqual({
      ok: false,
      error: "Please confirm your consent before signing.",
    });
  });

  it("rejects consent as a string", () => {
    expect(parseIntakeSignature(validBody({ consent: "true" }))).toEqual({
      ok: false,
      error: "Please confirm your consent before signing.",
    });
  });

  it("rejects a bad PNG data URL prefix", () => {
    expect(parseIntakeSignature(validBody({ signaturePngDataUrl: "data:image/jpeg;base64,abcd" }))).toEqual({
      ok: false,
      error: "Malformed signature image.",
    });
  });

  it("rejects non-PNG bytes", () => {
    const signaturePngDataUrl = `data:image/png;base64,${Buffer.from("not png".repeat(40)).toString("base64")}`;
    expect(parseIntakeSignature(validBody({ signaturePngDataUrl }))).toEqual({
      ok: false,
      error: "Signature image must be a PNG.",
    });
  });

  it("rejects a PNG that is too small", () => {
    expect(parseIntakeSignature(validBody({ signaturePngDataUrl: pngDataUrl(199) }))).toEqual({
      ok: false,
      error: "Signature image too small. Please draw your signature again.",
    });
  });

  it("rejects a PNG that is too large", () => {
    expect(parseIntakeSignature(validBody({ signaturePngDataUrl: pngDataUrl(2 * 1024 * 1024 + 1) }))).toEqual({
      ok: false,
      error: "Signature image is too large.",
    });
  });

  it("rejects an empty signer name", () => {
    expect(parseIntakeSignature(validBody({ signerName: "   " }))).toEqual({
      ok: false,
      error: "Enter your full legal name.",
    });
  });

  it("rejects a signer name longer than 120 characters after normalization", () => {
    expect(parseIntakeSignature(validBody({ signerName: ` ${"a".repeat(121)} ` }))).toEqual({
      ok: false,
      error: "Enter your full legal name.",
    });
  });

  it("accepts a valid intake signature payload", () => {
    const result = parseIntakeSignature(validBody());
    expect(result).toMatchObject({ ok: true, signerName: "Alex Chen" });
    expect(result.ok && result.pngBytes.byteLength).toBe(200);
  });
});
