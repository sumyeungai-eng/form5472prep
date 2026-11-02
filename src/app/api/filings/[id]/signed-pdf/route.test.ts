import { beforeEach, describe, expect, it, vi } from "vitest";

// Release gate (Codex P1): a staff-uploaded signed PDF on an unreleased,
// unfaxed filing is not served to the customer or the owning partner.
const session = vi.hoisted(() => ({ getOwnedFiling: vi.fn() }));
const storage = vi.hoisted(() => ({ getPdf: vi.fn(async () => new Uint8Array([37, 80, 68, 70])) }));
vi.mock("@/lib/session", () => session);
vi.mock("@/lib/storage", () => storage);
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { GET } from "./route";

const base = {
  id: "f1",
  llcName: "Synthetic Test LLC",
  taxYears: [2025],
  signedPdfKey: "f1_signed.pdf",
  reviewApprovedAt: null as Date | null,
  faxedAt: null as Date | null,
  partnerId: null as string | null,
};
const call = () => GET(new Request("https://x.test/api/filings/f1/signed-pdf"), { params: { id: "f1" } });

describe("GET /api/filings/[id]/signed-pdf release gate", () => {
  beforeEach(() => storage.getPdf.mockClear());

  it.each([null, "partner_1"])("404s before release or fax (partnerId %s)", async (partnerId) => {
    session.getOwnedFiling.mockResolvedValue({ ...base, partnerId });
    expect((await call()).status).toBe(404);
    expect(storage.getPdf).not.toHaveBeenCalled();
  });

  it("serves it once released", async () => {
    session.getOwnedFiling.mockResolvedValue({ ...base, reviewApprovedAt: new Date() });
    expect((await call()).status).toBe(200);
  });

  it("serves it once faxed", async () => {
    session.getOwnedFiling.mockResolvedValue({ ...base, faxedAt: new Date() });
    expect((await call()).status).toBe(200);
  });
});
