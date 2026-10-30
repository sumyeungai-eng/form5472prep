import { PDFDocument, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { downloadFileName } from "./downloadFileName";
import { embedSignatureIntoPdf } from "./embedSignature";
import { generateFaxReceiptPdf, type FaxReceiptInput } from "./faxReceipt";
import { generatePackage } from "./generatePackage";
import { stampPlacements } from "./stampPlacements";
import { F1, finalisedAt } from "./__fixtures__/filings";

// Partners file for their own clients: nothing a client can open (PDF
// metadata, receipt text, download names) may name us or our PDF library.
const BRAND = /form5472prep|form5472 prep|pdf-lib/i;

async function infoFields(bytes: Uint8Array) {
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
  return {
    Title: pdf.getTitle(),
    Producer: pdf.getProducer(),
    Creator: pdf.getCreator(),
    Author: pdf.getAuthor(),
    Subject: pdf.getSubject(),
  };
}

function expectNeutral(fields: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(fields)) {
    expect(value ?? "", key).not.toMatch(BRAND);
  }
}

const receiptInput: FaxReceiptInput = {
  filingId: "f_1",
  llcName: "Acme LLC",
  llcEin: "12-3456789",
  taxYears: [2025],
  ownerName: "Jane Doe",
  telnyxFaxId: "fax_123",
  fromFax: "+15550001111",
  toFax: null,
  submittedAtIso: "2026-03-28T10:30:00.000Z",
  deliveredAtIso: "2026-03-28T10:36:28.212Z",
  pageCount: 12,
};

describe("white-label PDF metadata", () => {
  it("package, signed copies and fax receipt carry no brand or pdf-lib string", async () => {
    const pkg = await generatePackage(F1, finalisedAt);
    const base = await infoFields(pkg.bytes);
    expectNeutral(base);
    expect(base.Title).toBe("Form 5472 – Example Holdings LLC – 2025");
    expect(base.Producer).toMatch(/^generator \d/);
    expect(base.Creator).toBe(base.Producer);
    expect(base.Author ?? "").toBe("");
    expect(base.Subject ?? "").toBe("");
    const loaded = await PDFDocument.load(pkg.bytes, { updateMetadata: false });
    expect(loaded.getKeywords()).toContain("version=");

    const png = new Uint8Array(
      await sharp({ create: { width: 32, height: 32, channels: 4, background: { r: 20, g: 20, b: 20, alpha: 1 }, noise: { type: "gaussian", mean: 128, sigma: 40 } } })
        .png()
        .toBuffer(),
    );
    const embedded = await embedSignatureIntoPdf(pkg.bytes, png, pkg.signatures.slice(0, 1));
    const stamped = await stampPlacements(pkg.bytes, png, [{ kind: "signature", page: 1, x: 10, y: 10, width: 50, height: 20 }]);
    for (const bytes of [embedded.bytes, stamped]) {
      const fields = await infoFields(bytes);
      expectNeutral(fields);
      expect(fields).toEqual(base);
    }

    const receipt = await generateFaxReceiptPdf({ ...receiptInput, brandLine: "Acme Tax Partners" });
    const rFields = await infoFields(receipt);
    expectNeutral(rFields);
    expect(rFields.Producer).toBe("fax receipt");
    expect(rFields.Creator).toBe("fax receipt");
  }, 60_000);

  it("fax receipt: partner name replaces ours; retail keeps today's text", async () => {
    // Standard-font text is drawn as hex strings in Flate streams: decode every
    // stream and collect the `<hex> Tj` operands.
    const drawn = async (input: FaxReceiptInput) => {
      const pdf = await PDFDocument.load(await generateFaxReceiptPdf(input), { updateMetadata: false });
      const lines: string[] = [];
      pdf.context.enumerateIndirectObjects().forEach(([, obj]) => {
        if (!(obj instanceof PDFRawStream)) return;
        const src = Buffer.from(decodePDFRawStream(obj).decode()).toString("latin1");
        for (const m of Array.from(src.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g))) lines.push(Buffer.from(m[1], "hex").toString("latin1"));
      });
      return lines;
    };

    const partner = await drawn({ ...receiptInput, brandLine: "Acme Tax Partners" });
    expect(partner).toContain("Acme Tax Partners");
    expect(partner.join("\n")).not.toMatch(BRAND);
    expect(partner.join("\n")).not.toContain("Telnyx");
    expect(partner).toContain("Fax ID");
    expect(partner.some((l) => /^Generated \S+ UTC$/.test(l))).toBe(true);

    const retail = await drawn(receiptInput);
    expect(retail.some((l) => /^form5472prep\.com .* IRS Direct Delivery Service$/.test(l))).toBe(true);
    expect(retail.some((l) => /^Generated \S+ UTC by Form5472 Prep .* form5472prep\.com$/.test(l))).toBe(true);
    expect(retail.join("\n")).not.toContain("Telnyx");
  });
});

describe("downloadFileName", () => {
  it("builds '<LLC> - Form 5472 - <years> - <kind>.pdf'", () => {
    expect(downloadFileName("Acme Holdings LLC", [2024, 2025], "signed")).toBe(
      "Acme Holdings LLC - Form 5472 - 2024, 2025 - signed.pdf",
    );
    expect(downloadFileName("Acme LLC", [2025], "package")).toBe("Acme LLC - Form 5472 - 2025 - package.pdf");
    expect(downloadFileName("Acme LLC", [2025], "fax receipt")).toBe("Acme LLC - Form 5472 - 2025 - fax receipt.pdf");
  });

  it("is ASCII-safe for any LLC name and falls back to 'LLC'", () => {
    const name = downloadFileName('Café "Ñandú" / Ltd; \\ x\n', [2025], "filed");
    expect(name).toBe("Cafe Nandu Ltd x - Form 5472 - 2025 - filed.pdf");
    expect(name).toMatch(/^[\x20-\x7e]+$/);
    expect(name).not.toMatch(/["\\/;]/);
    expect(downloadFileName(null, [], "signed")).toBe("LLC - Form 5472 - signed.pdf");
    expect(downloadFileName("日本語", [2025], "signed")).toBe("LLC - Form 5472 - 2025 - signed.pdf");
  });
});
