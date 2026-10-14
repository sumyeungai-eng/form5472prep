import { describe, expect, it, vi } from "vitest";

// Package PDFs carry taxpayer IDs (and, since 2026-10-15, the owner's SSN on
// lines 4b(1)/8b(1)): the customer routes must never let them be cached.

vi.mock("@/lib/session", () => ({
  getOwnedFiling: vi.fn(async () => ({
    id: "filing_1",
    generatedPdfKey: "filing_1_unsigned.pdf",
    signedPdfKey: "filing_1_signed.pdf",
  })),
}));
vi.mock("@/lib/storage", () => ({ getPdf: vi.fn(async () => new Uint8Array([37, 80, 68, 70])) }));

import { GET as getPdf } from "./route";
import { GET as getSignedPdf } from "../signed-pdf/route";

describe("customer package PDF routes", () => {
  it.each([
    ["pdf", () => getPdf(new Request("http://localhost/api/filings/filing_1/pdf"), { params: { id: "filing_1" } })],
    ["signed-pdf", () => getSignedPdf(new Request("http://localhost/api/filings/filing_1/signed-pdf"), { params: { id: "filing_1" } })],
  ])("%s sends Cache-Control: private, no-store", async (_name, call) => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("content-type")).toBe("application/pdf");
  });
});
