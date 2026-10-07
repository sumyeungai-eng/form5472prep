import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { decodePngDataUrl, MAX_PREPARER_SIGNATURE_BYTES } from "./preparerSignature";

describe("decodePngDataUrl", () => {
  it("accepts a PNG data URL or bare base64", async () => {
    const png = await sharp({ create: { width: 2, height: 2, channels: 4, background: "#fff" } }).png().toBuffer();
    const b64 = png.toString("base64");
    expect(decodePngDataUrl(`data:image/png;base64,${b64}`)?.length).toBe(png.length);
    expect(decodePngDataUrl(b64)?.length).toBe(png.length);
  });

  it("rejects non-PNG, junk and oversized input", () => {
    expect(decodePngDataUrl(undefined)).toBeNull();
    expect(decodePngDataUrl("data:image/jpeg;base64," + Buffer.from("x".repeat(64)).toString("base64"))).toBeNull();
    expect(decodePngDataUrl("not base64 at all !!!!!!!!!!!!!!!!!!!!!!!!!!!!")).toBeNull();
    const big = Buffer.alloc(MAX_PREPARER_SIGNATURE_BYTES + 10);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(big);
    expect(decodePngDataUrl(big.toString("base64"))).toBeNull();
  });
});
