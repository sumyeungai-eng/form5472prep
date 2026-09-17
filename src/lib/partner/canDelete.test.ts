import { describe, expect, it } from "vitest";
import { canDeleteFiling } from "./canDelete";

describe("canDeleteFiling", () => {
  it("DRAFT with no signature is deletable", () => {
    expect(canDeleteFiling({ status: "DRAFT", signedPdfKey: null })).toBe(true);
  });

  it("DRAFT with a signed PDF is not deletable", () => {
    expect(canDeleteFiling({ status: "DRAFT", signedPdfKey: "signed/abc.pdf" })).toBe(false);
  });

  const nonDraftStatuses = [
    "PAID",
    "PDF_GENERATED",
    "SIGNATURE_PENDING",
    "SIGNED_UPLOADED",
    "FAXED",
    "CONFIRMED",
    "FAILED",
  ];

  for (const status of nonDraftStatuses) {
    it(`${status} is never deletable`, () => {
      expect(canDeleteFiling({ status, signedPdfKey: null })).toBe(false);
    });
  }
});
