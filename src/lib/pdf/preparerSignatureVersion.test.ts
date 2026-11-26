import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { preparerNameStatus, readPdfGeneratorVersion } from "./preparerSignatureVersion";

async function metadataPdf(fields: { producer?: string; creator?: string; keywords?: string[] } = {}) {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  if (fields.producer !== undefined) pdf.setProducer(fields.producer);
  if (fields.creator !== undefined) pdf.setCreator(fields.creator);
  if (fields.keywords !== undefined) pdf.setKeywords(fields.keywords);
  return pdf.save();
}

describe("readPdfGeneratorVersion", () => {
  it.each(["2.5.1", "2.5.2", "2.5.2-rc.1", "2.5.2+build.1", "2.10.0"])(
    "reads generatePackage's complete metadata for %s", async (version) => {
      expect(await readPdfGeneratorVersion(await metadataPdf({
        producer: `generator ${version}`, creator: `generator ${version}`,
        keywords: [`version=${version}`, "commit=abc123", "generatedAt=2026-11-27T00:00:00.000Z"],
      }))).toBe(version);
    },
  );

  it.each([
    { producer: "generator 2.5.1" },
    { creator: "generator 2.5.1" },
    { producer: "External PDF editor", keywords: ["commit=abc123", "version=2.5.1", "generatedAt=test"] },
    { keywords: ["commit=abc123,version=2.5.1;generatedAt=test"] },
  ])("reads a preserved generator field in %j", async (fields) => {
    expect(await readPdfGeneratorVersion(await metadataPdf(fields))).toBe("2.5.1");
  });

  it.each(["unknown", "2.5", "02.5.2", "2.5.2junk", "2.5.2-01", "9007199254740992.0.0"])(
    "returns unknown for malformed version %s", async (version) => {
      expect(await readPdfGeneratorVersion(await metadataPdf({
        producer: `generator ${version}`, creator: `generator ${version}`, keywords: [`version=${version}`],
      }))).toBeNull();
    },
  );

  it("returns unknown for missing, unrelated or contradictory generator metadata", async () => {
    for (const fields of [
      {},
      { producer: "External editor 2.5.1", keywords: ["myversion=2.5.1"] },
      { producer: "generator 2.5.1", creator: "generator 2.5.2" },
      { keywords: ["version=2.5.1", "version=2.5.2"] },
    ]) {
      expect(await readPdfGeneratorVersion(await metadataPdf(fields))).toBeNull();
    }
  });

  it("returns unknown for unparseable PDF bytes", async () => {
    expect(await readPdfGeneratorVersion(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});

describe("preparerNameStatus", () => {
  it.each([
    [null, "unknown"], ["2.5.1", "blocked"], ["2.5.2-rc.1", "blocked"],
    ["2.5.2", "allowed"], ["2.5.10", "allowed"], ["2.10.0", "allowed"],
  ] as const)("maps PDF version %s to %s", (version, status) => {
    expect(preparerNameStatus(version)).toBe(status);
  });
});
