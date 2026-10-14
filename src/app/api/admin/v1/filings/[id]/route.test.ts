import { describe, expect, it, vi } from "vitest";

// Admin v1 (iOS) filing detail: the owner's SSN is only ever masked here
// (SSN capture spec S3). The ciphertext is never selected, so even a mocked
// row that carries it cannot reach the response.

const db = vi.hoisted(() => ({
  findUnique: vi.fn(async (args: { select: Record<string, unknown> }) => {
    const row: Record<string, unknown> = {
      id: "filing_1",
      status: "PDF_GENERATED",
      tier: "single_year",
      amountPaid: 14900,
      llcDateIncorporated: null,
      ownerItin: null,
      ownerSsnCiphertext: "v1:aaaa:bbbb:cccc",
      ownerSsnLast4: "6789",
      ownerSsnSubmittedAt: new Date("2026-10-15T12:00:00.000Z"),
      ownerSsnSubmittedBy: "client",
      ownerSsnRequestedAt: null,
      taxYears: [2025],
      faxedAt: null,
      signedAt: null,
      validationCheckedAt: null,
      createdAt: new Date("2026-10-01T00:00:00.000Z"),
      updatedAt: new Date("2026-10-15T00:00:00.000Z"),
      user: null,
      yearData: [],
    };
    // Honour the select like Prisma does.
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(args.select)) out[key] = row[key] ?? null;
    out.yearData = [];
    return out;
  }),
}));

vi.mock("@/lib/admin/auth", () => ({
  getAdminPrincipal: vi.fn(async () => ({ adminId: "admin_1", email: "a@x.test", via: "bearer" })),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: { findUnique: db.findUnique },
    message: { findMany: vi.fn(async () => []) },
    filingChangeLog: { findMany: vi.fn(async () => []) },
  },
}));

import { GET } from "./route";

describe("GET /api/admin/v1/filings/[id] — SSN is masked only", () => {
  it("never selects the ciphertext and returns the masked number + timestamps", async () => {
    const res = await GET(new Request("http://localhost/api/admin/v1/filings/filing_1"), { params: { id: "filing_1" } });
    expect(res.status).toBe(200);
    const select = db.findUnique.mock.calls[0][0].select;
    expect(select).not.toHaveProperty("ownerSsnCiphertext");
    expect(select).not.toHaveProperty("ownerSsnSubmittedBy");
    const json = await res.json();
    expect(json.data.filing).toMatchObject({
      ownerSsnMasked: "•••-••-6789",
      ownerSsnSubmittedAt: "2026-10-15T12:00:00.000Z",
      ownerSsnRequestedAt: null,
    });
    expect(JSON.stringify(json)).not.toContain("v1:aaaa");
    expect(JSON.stringify(json)).not.toContain("ownerSsnCiphertext");
  });
});
