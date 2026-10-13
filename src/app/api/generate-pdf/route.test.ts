import { beforeEach, describe, expect, it, vi } from "vitest";

// A failed pre-flight is staff-only: the customer's "generate my PDF" call must
// answer exactly as it does for a passing package, and the findings (which can
// quote the admin's RCS narrative) never appear in the response.
const db = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn(async () => ({ id: "f1" })) }));
const pdf = vi.hoisted(() => ({
  generatePackage: vi.fn(async () => ({
    bytes: new Uint8Array([37, 80, 68, 70]),
    signatures: [{ page: 2, x: 1, y: 2 }],
    record: { generatorVersion: "2.3.0", commit: "test" },
  })),
  runPreflight: vi.fn(),
}));
vi.mock("@/lib/session", () => ({ getOwnedFiling: vi.fn(async () => ({ id: "f1" })) }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findUnique: db.findUnique, update: db.update } } }));
vi.mock("@/lib/storage", () => ({ putPdf: vi.fn() }));
vi.mock("@/lib/pdf/generatePackage", () => ({ generatePackage: pdf.generatePackage }));
vi.mock("@/lib/pdf/packageInput", () => ({ filingToPackageInput: (filing: unknown) => filing }));
vi.mock("@/lib/pdf/preflight", () => ({ runPreflight: pdf.runPreflight }));

import { POST } from "./route";

const paidFiling = {
  id: "f1",
  status: "PAID",
  reviewApprovedAt: null,
  llcName: "Synthetic Test LLC",
  llcEin: "12-3456789",
  llcAddress: "1 Example St",
  llcCity: "Sheridan",
  llcState: "WY",
  llcZip: "82801",
  llcDateIncorporated: new Date("2024-11-02T00:00:00.000Z"),
  llcBusinessActivity: "Software",
  llcBusinessCode: "541512",
  ownerName: "Alex Example",
  ownerAddress: "88 Example Road, Hong Kong",
  ownerCountryCitizenship: "Hong Kong",
  ownerCountryTaxResidence: "Hong Kong",
  ownerCountryBusiness: "Hong Kong",
  ownerFtin: "HK1234567",
  ownerHasFtin: true,
  yearData: [],
};

const call = () =>
  POST(new Request("https://x.test/api/generate-pdf", { method: "POST", body: JSON.stringify({ filingId: "f1" }) }));

describe("customer generate-pdf with a failed pre-flight", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.findUnique.mockResolvedValue(paidFiling);
  });

  it("answers the customer the same way as a passing package and stores the failure for staff only", async () => {
    pdf.runPreflight.mockResolvedValueOnce({ ok: true, failures: [], warnings: [] });
    const passed = await call();
    const passedBody = await passed.json();

    pdf.runPreflight.mockResolvedValueOnce({
      ok: false,
      failures: [{ id: "A32", message: "RCS narrative not written for tax year 2024." }],
      warnings: [{ id: "W26b", message: 'Customer text: "The Owner has no operating expenses."' }],
    });
    const failed = await call();
    const failedBody = await failed.json();

    expect(failed.status).toBe(200);
    expect(failedBody).toEqual(passedBody);
    expect(JSON.stringify(failedBody)).not.toMatch(/preflight|A32|narrative/i);
    expect(db.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: "f1" },
        data: expect.objectContaining({
          status: "PDF_GENERATED",
          generatedPdfKey: "f1_unsigned.pdf",
          preflightStatus: "failed",
          preflightFailures: [{ id: "A32", message: "RCS narrative not written for tax year 2024." }],
          preflightOverrideBy: null,
          reviewApprovedAt: null,
        }),
      }),
    );
  });
});
