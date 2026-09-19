import { describe, expect, it } from "vitest";
import { PREPARED_PDF_MAX_BYTES } from "@/lib/applicationSignature";
import { signedLinkPath, validatePreparedPdf } from "./adminSignature";

function pdfBytes(size = 2048): Uint8Array {
  const bytes = new Uint8Array(size);
  bytes.set(new TextEncoder().encode("%PDF-1.7\n"));
  return bytes;
}

describe("validatePreparedPdf", () => {
  it("rejects bytes that do not start with the PDF header", () => {
    const bytes = pdfBytes();
    bytes[0] = 0x78;

    expect(validatePreparedPdf(bytes, "application/pdf")).toEqual({
      ok: false,
      error: "file must start with %PDF-",
    });
  });

  it("rejects PDFs that are too small", () => {
    expect(validatePreparedPdf(pdfBytes(1024), "application/pdf")).toEqual({
      ok: false,
      error: "PDF is too small",
    });
  });

  it("rejects PDFs that are too large", () => {
    expect(validatePreparedPdf(pdfBytes(PREPARED_PDF_MAX_BYTES + 1), "application/pdf")).toEqual({
      ok: false,
      error: "PDF must be 4 MB or smaller",
    });
  });

  it("accepts PDFs at the maximum size", () => {
    expect(validatePreparedPdf(pdfBytes(PREPARED_PDF_MAX_BYTES), "application/pdf")).toEqual({ ok: true });
  });

  it("rejects the wrong content type", () => {
    expect(validatePreparedPdf(pdfBytes(), "text/plain")).toEqual({
      ok: false,
      error: "file must be a PDF",
    });
  });

  it("accepts a valid PDF with PDF content type or no content type", () => {
    expect(validatePreparedPdf(pdfBytes(), "application/pdf")).toEqual({ ok: true });
    expect(validatePreparedPdf(pdfBytes(), "")).toEqual({ ok: true });
    expect(validatePreparedPdf(pdfBytes(), null)).toEqual({ ok: true });
  });
});

describe("signedLinkPath", () => {
  it("returns the customer application signing path", () => {
    expect(signedLinkPath("ein", "ein_123")).toBe("/applications/ein/ein_123/sign");
    expect(signedLinkPath("itin", "itin_456")).toBe("/applications/itin/itin_456/sign");
  });
});
