import { beforeEach, describe, expect, it, vi } from "vitest";

// Release gate (PR 1): the customer PDF route — shared by customers and
// partners — serves nothing until staff release the package, then only the
// released key.
const session = vi.hoisted(() => ({ getOwnedFiling: vi.fn() }));
const storage = vi.hoisted(() => ({ getPdf: vi.fn(async (_key: string) => new Uint8Array([37, 80, 68, 70])) }));
vi.mock("@/lib/session", () => session);
vi.mock("@/lib/storage", () => storage);

import { GET } from "./route";

const call = () => GET(new Request("https://x.test/api/filings/f1/pdf"), { params: { id: "f1" } });
const base = {
  id: "f1",
  llcName: "Synthetic Test LLC",
  taxYears: [2025],
  status: "PDF_GENERATED",
  generatedPdfKey: "f1_unsigned_200.pdf",
  reviewApprovedAt: null as Date | null,
  reviewApprovedPdfKey: null as string | null,
  partnerId: null as string | null,
};

describe("GET /api/filings/[id]/pdf release gate", () => {
  beforeEach(() => {
    session.getOwnedFiling.mockReset();
    storage.getPdf.mockClear();
  });

  it("404s before release", async () => {
    session.getOwnedFiling.mockResolvedValue(base);
    const res = await call();
    expect(res.status).toBe(404);
    expect(storage.getPdf).not.toHaveBeenCalled();
  });

  it("serves the released key (not the current generated key) after release", async () => {
    session.getOwnedFiling.mockResolvedValue({
      ...base,
      reviewApprovedAt: new Date("2026-10-31T00:00:00Z"),
      reviewApprovedPdfKey: "f1_unsigned_100.pdf",
    });
    const res = await call();
    expect(res.status).toBe(200);
    expect(storage.getPdf).toHaveBeenCalledWith("f1_unsigned_100.pdf");
  });

  it.each(["SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAXED", "CONFIRMED", "FAILED"])(
    "404s for a former-grandfathered %s filing that was never released",
    async (status) => {
      session.getOwnedFiling.mockResolvedValue({ ...base, status });
      expect((await call()).status).toBe(404);
      expect(storage.getPdf).not.toHaveBeenCalled();
    },
  );

  it("gates a partner on the shared route the same way (D3)", async () => {
    session.getOwnedFiling.mockResolvedValue({ ...base, partnerId: "partner_1" });
    expect((await call()).status).toBe(404);
    session.getOwnedFiling.mockResolvedValue({
      ...base,
      partnerId: "partner_1",
      reviewApprovedAt: new Date(),
      reviewApprovedPdfKey: "f1_unsigned_200.pdf",
    });
    expect((await call()).status).toBe(200);
    expect(storage.getPdf).toHaveBeenLastCalledWith("f1_unsigned_200.pdf");
  });

  it("404s when the requester does not own the filing", async () => {
    session.getOwnedFiling.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });
});
