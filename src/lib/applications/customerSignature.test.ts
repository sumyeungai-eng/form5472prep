import { describe, expect, it } from "vitest";
import { clientIp, parseSignBody } from "./customerSignature";

const SHA = "a".repeat(64);
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
    docSha256: SHA,
    ...overrides,
  };
}

describe("parseSignBody", () => {
  it("rejects missing consent", () => {
    const result = parseSignBody(validBody({ consent: undefined }));
    expect(result.ok).toBe(false);
  });

  it("rejects consent as a string", () => {
    const result = parseSignBody(validBody({ consent: "true" }));
    expect(result.ok).toBe(false);
  });

  it("rejects a bad PNG data URL prefix", () => {
    const result = parseSignBody(validBody({ signaturePngDataUrl: "data:image/jpeg;base64,abcd" }));
    expect(result.ok).toBe(false);
  });

  it("rejects non-PNG bytes", () => {
    const result = parseSignBody(validBody({ signaturePngDataUrl: `data:image/png;base64,${Buffer.from("not png".repeat(40)).toString("base64")}` }));
    expect(result.ok).toBe(false);
  });

  it("rejects a PNG that is too small", () => {
    const result = parseSignBody(validBody({ signaturePngDataUrl: pngDataUrl(199) }));
    expect(result.ok).toBe(false);
  });

  it("rejects a PNG that is too large", () => {
    const result = parseSignBody(validBody({ signaturePngDataUrl: pngDataUrl(2 * 1024 * 1024 + 1) }));
    expect(result.ok).toBe(false);
  });

  it("rejects a bad signer name", () => {
    const result = parseSignBody(validBody({ signerName: "   " }));
    expect(result.ok).toBe(false);
  });

  it("rejects a bad document SHA", () => {
    const result = parseSignBody(validBody({ docSha256: "A".repeat(64) }));
    expect(result.ok).toBe(false);
  });

  it("accepts a valid signature payload", () => {
    const result = parseSignBody(validBody());
    expect(result).toMatchObject({ ok: true, signerName: "Alex Chen", docSha256: SHA });
    expect(result.ok && result.pngBytes.byteLength).toBe(200);
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": " 203.0.113.10, 198.51.100.7 " });
    expect(clientIp(headers)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": " 203.0.113.11 " });
    expect(clientIp(headers)).toBe("203.0.113.11");
  });

  it("returns null without IP headers", () => {
    expect(clientIp(new Headers())).toBeNull();
  });
});
