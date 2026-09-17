import { describe, expect, it } from "vitest";
import { collectFilingStorageKeys, type FilingWithKeys } from "./filingStorageKeys";

const emptyFiling: FilingWithKeys = {
  generatedPdfKey: null,
  signedPdfKey: null,
  faxedPdfKey: null,
  faxConfirmationKey: null,
  signaturePngKey: null,
  extensionProofKey: null,
  dissolutionCertKey: null,
  documents: [],
  bankStatements: [],
  messages: [],
};

describe("collectFilingStorageKeys", () => {
  it("returns [] for an all-null filing with empty relations", () => {
    expect(collectFilingStorageKeys(emptyFiling)).toEqual([]);
  });

  it("collects every scalar key, document, bank statement, and message attachment", () => {
    const filing: FilingWithKeys = {
      generatedPdfKey: "generated.pdf",
      signedPdfKey: "signed.pdf",
      faxedPdfKey: "faxed.pdf",
      faxConfirmationKey: "fax-confirmation.pdf",
      signaturePngKey: "signature.png",
      extensionProofKey: "extension-proof.pdf",
      dissolutionCertKey: "dissolution-cert.pdf",
      documents: [{ fileKey: "doc-1.pdf" }, { fileKey: "doc-2.pdf" }],
      bankStatements: [{ fileKey: "bank-1.pdf" }, { fileKey: "bank-2.pdf" }],
      messages: [{ attachmentKey: "message-1.pdf" }, { attachmentKey: null }],
    };

    const keys = collectFilingStorageKeys(filing);

    expect(keys).toEqual(
      expect.arrayContaining([
        "generated.pdf",
        "signed.pdf",
        "faxed.pdf",
        "fax-confirmation.pdf",
        "signature.png",
        "extension-proof.pdf",
        "dissolution-cert.pdf",
        "doc-1.pdf",
        "doc-2.pdf",
        "bank-1.pdf",
        "bank-2.pdf",
        "message-1.pdf",
      ]),
    );
    expect(keys).toHaveLength(12);
    expect(keys.every((k) => typeof k === "string" && k.length > 0)).toBe(true);
  });

  it("deduplicates a key that appears more than once", () => {
    const filing: FilingWithKeys = {
      ...emptyFiling,
      generatedPdfKey: "shared.pdf",
      documents: [{ fileKey: "shared.pdf" }],
      bankStatements: [{ fileKey: "shared.pdf" }],
      messages: [{ attachmentKey: "shared.pdf" }],
    };

    expect(collectFilingStorageKeys(filing)).toEqual(["shared.pdf"]);
  });

  it("does not throw on nulls or empty arrays", () => {
    expect(() => collectFilingStorageKeys(emptyFiling)).not.toThrow();
  });
});
