import { describe, expect, it, vi } from "vitest";

// The v1 (iOS) API never serves a package that prints the owner's SSN
// (SSN capture spec S3); other packages are served as before.

const db = vi.hoisted(() => ({ row: null as null | Record<string, unknown> }));
const storage = vi.hoisted(() => ({ getPdf: vi.fn(async () => new Uint8Array([37, 80, 68, 70])) }));

vi.mock("@/lib/admin/auth", () => ({
  getAdminPrincipal: vi.fn(async () => ({ adminId: "admin_1", email: "a@x.test", via: "bearer" })),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findUnique: vi.fn(async () => db.row) } } }));
vi.mock("@/lib/storage", () => ({ getPdf: storage.getPdf }));

import { GET } from "./route";

const get = () => GET(new Request("http://localhost/api/admin/v1/filings/filing_1/pdf?kind=generated"), { params: { id: "filing_1" } });

describe("GET /api/admin/v1/filings/[id]/pdf", () => {
  it("refuses a package for an owner with an SSN on file", async () => {
    db.row = { generatedPdfKey: "k.pdf", signedPdfKey: null, faxedPdfKey: null, ownerSsnLast4: "6789" };
    const res = await get();
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("web_admin_only");
    expect(storage.getPdf).not.toHaveBeenCalled();
  });

  it("serves the package when no SSN is on file", async () => {
    db.row = { generatedPdfKey: "k.pdf", signedPdfKey: null, faxedPdfKey: null, ownerSsnLast4: null };
    const res = await get();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
  });
});
