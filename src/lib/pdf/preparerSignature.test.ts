import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { decodePngDataUrl, isReadablePng, MAX_PREPARER_SIGNATURE_BYTES } from "./preparerSignature";
import { MIN_HANDWRITTEN_PREPARER_NAME_VERSION, supportsHandwrittenPreparerName } from "./preparerSignatureVersion";

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


describe("shared preparer signature/name image validation", () => {
  it("rejects a real PNG truncated to 80 bytes even when its metadata is readable", async () => {
    const png = await sharp({ create: { width: 600, height: 160, channels: 4, background: "#fff" } }).png().toBuffer();
    const truncated = png.subarray(0, 80);
    expect(truncated).toHaveLength(80);
    expect(await sharp(truncated).metadata()).toMatchObject({ format: "png", width: 600, height: 160 });
    expect(decodePngDataUrl(truncated.toString("base64"))).not.toBeNull();
    expect(await isReadablePng(truncated)).toBe(false);
  });

  it("requires a readable PNG with the same dimension limits for either drawing", async () => {
    const png = async (width: number, height: number) => new Uint8Array(await sharp({
      create: { width, height, channels: 4, background: "#fff" },
    }).png().toBuffer());
    expect(await isReadablePng(await png(600, 160))).toBe(true);
    expect(await isReadablePng(await png(4001, 1))).toBe(false);
    expect(await isReadablePng(await png(1, 2001))).toBe(false);
    expect(await isReadablePng(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
  });
});

describe("handwritten preparer name generator compatibility", () => {
  it("exports the first compatible version", () => {
    expect(MIN_HANDWRITTEN_PREPARER_NAME_VERSION).toBe("2.5.2");
  });

  it.each([
    [undefined, false], [null, false], ["", false], ["unknown", false],
    ["2.5", false], ["2.5.2junk", false], ["02.5.2", false], ["2.5.2\n", false],
    ["1.99.99", false], ["2.4.99", false],
    ["2.5.1", false], ["2.5.2-rc.1", false], ["2.5.2-01", false],
    ["2.5.2", true], ["2.5.2+build.1", true], ["2.5.10", true],
    ["2.10.0", true], ["3.0.0", true], ["2.6.0-rc.1", true],
  ])("checks %s numerically against the minimum", (version, supported) => {
    expect(supportsHandwrittenPreparerName(version)).toBe(supported);
  });
});
