import { beforeEach, describe, expect, it, vi } from "vitest";
import { unzipSync, strFromU8 } from "fflate";

const auth = vi.hoisted(() => ({ isAdmin: vi.fn() }));
const db = vi.hoisted(() => ({ findUnique: vi.fn() }));
const storage = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/admin/auth", () => ({ isAdmin: auth.isAdmin }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findUnique: db.findUnique } } }));
vi.mock("@/lib/storage", () => ({ get: storage.get }));

import { GET } from "./route";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const filing = {
  id: "f1",
  llcName: "Demo Holdings LLC",
  taxYears: [2024, 2025],
  extensionProofKey: "f1_ext.pdf",
  dissolutionCertKey: null,
  documents: [
    { fileKey: "docs/a.pdf", fileName: "Articles of Organization.pdf", createdAt: d("2026-10-01") },
    { fileKey: "docs/b.pdf", fileName: "Articles of Organization.pdf", createdAt: d("2026-10-02") },
  ],
  yearData: [
    { taxYear: 2024, bankStatements: [{ fileKey: "st/1.csv", fileName: "mercury-2024", uploadedAt: d("2026-10-01") }] },
    { taxYear: 2025, bankStatements: [] },
  ],
  messages: [{ attachmentKey: "att/x.jpg", attachmentName: "receipt.jpg", createdAt: d("2026-10-03") }],
};

const call = () => GET(new Request("https://x.test/api/admin/filings/f1/download-all"), { params: { id: "f1" } });

describe("GET /api/admin/filings/[id]/download-all (customer uploads)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.isAdmin.mockResolvedValue(true);
    db.findUnique.mockResolvedValue(filing);
    storage.get.mockImplementation(async (key: string) => new TextEncoder().encode(`bytes:${key}`));
  });

  it("refuses non-admins and unknown filings", async () => {
    auth.isAdmin.mockResolvedValueOnce(false);
    expect((await call()).status).toBe(401);
    db.findUnique.mockResolvedValueOnce(null);
    expect((await call()).status).toBe(404);
  });

  it("only selects customer-side files (customer documents, client messages)", async () => {
    await call();
    const select = db.findUnique.mock.calls[0][0].select;
    expect(select.documents.where).toEqual({ uploadedBy: "customer" });
    expect(select.messages.where).toMatchObject({ fromAdmin: false });
    expect(select).not.toHaveProperty("generatedPdfKey");
    expect(select).not.toHaveProperty("signedPdfKey");
  });

  it("zips the uploads into folders with the customer's file names", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("Demo_Holdings_LLC_2024-2025_customer_uploads.zip");
    const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
    const names = Object.keys(files).map((n) => n.split("/").slice(1).join("/")).sort();
    expect(names).toEqual([
      "Bank statements/2024/mercury-2024.csv",
      "Documents/Articles of Organization (2).pdf",
      "Documents/Articles of Organization.pdf",
      "Extension proof/form-7004-extension-proof.pdf",
      "Message attachments/2026-10-03 receipt.jpg",
      "README.txt",
    ]);
    const readme = strFromU8(files["Demo_Holdings_LLC_2024-2025_customer_uploads/README.txt"]);
    expect(readme).toContain("Included (5)");
  });

  it("says so when the customer uploaded nothing", async () => {
    db.findUnique.mockResolvedValueOnce({ ...filing, extensionProofKey: null, documents: [], yearData: [], messages: [] });
    const res = await call();
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/hasn't uploaded/);
  });
});
