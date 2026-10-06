import { beforeEach, describe, expect, it, vi } from "vitest";
import { unzipSync, strFromU8 } from "fflate";

const auth = vi.hoisted(() => ({ isAdmin: vi.fn() }));
const db = vi.hoisted(() => ({ findUnique: vi.fn() }));
const storage = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/admin/auth", () => ({ isAdmin: auth.isAdmin }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findUnique: db.findUnique } } }));
vi.mock("@/lib/storage", () => ({ get: storage.get }));
vi.mock("@/lib/fax/finalize", () => ({ faxReceiptKey: (id: string) => `${id}_fax_receipt.pdf` }));

import { GET } from "./route";

const filing = {
  id: "f1",
  llcName: "Demo Holdings LLC",
  taxYears: [2024, 2025],
  generatedPdfKey: "f1_reviewed_1.pdf",
  signedPdfKey: "f1_signed.pdf",
  faxedPdfKey: null,
  signaturePngKey: "f1_signature_1.png",
  extensionProofKey: null,
  dissolutionCertKey: null,
  messages: [{ attachmentKey: "att/abc.jpg", attachmentName: "bank statement.jpg", createdAt: new Date("2026-10-01T00:00:00Z"), fromAdmin: false }],
};

const call = () => GET(new Request("https://x.test/api/admin/filings/f1/download-all"), { params: { id: "f1" } });

describe("GET /api/admin/filings/[id]/download-all", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.isAdmin.mockResolvedValue(true);
    db.findUnique.mockResolvedValue(filing);
    storage.get.mockImplementation(async (key: string) => {
      if (key === "f1_fax_receipt.pdf") throw new Error("NoSuchKey");
      return new TextEncoder().encode(`bytes:${key}`);
    });
  });

  it("refuses non-admins", async () => {
    auth.isAdmin.mockResolvedValue(false);
    expect((await call()).status).toBe(401);
  });

  it("returns 404 for an unknown filing", async () => {
    db.findUnique.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });

  it("zips every stored document with a README of what's missing", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/zip");
    expect(res.headers.get("Content-Disposition")).toContain("Demo_Holdings_LLC_2024-2025_f1.zip");

    const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
    const names = Object.keys(files).map((n) => n.split("/")[1]).sort();
    expect(names).toEqual([
      "01_package_unsigned.pdf",
      "02_package_signed.pdf",
      "05_client_signature.png",
      "08_attachment_01_bank_statement.jpg",
      "README.txt",
    ]);
    const prefix = "Demo_Holdings_LLC_2024-2025_f1/";
    expect(strFromU8(files[`${prefix}02_package_signed.pdf`])).toBe("bytes:f1_signed.pdf");
    const readme = strFromU8(files[`${prefix}README.txt`]);
    expect(readme).toContain("Faxed package (exact bytes sent to the IRS): not on file");
    expect(readme).toContain("IRS fax transmission receipt: not found in storage");
  });
});
