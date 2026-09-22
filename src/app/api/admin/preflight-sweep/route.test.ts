import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  isAdmin: vi.fn(),
}));

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  createLog: vi.fn(),
}));

const storage = vi.hoisted(() => ({
  put: vi.fn(),
  putPdf: vi.fn(),
}));

const pdf = vi.hoisted(() => ({
  filingToPackageInput: vi.fn((filing: unknown) => ({ filing })),
  generatePackage: vi.fn(),
  runPreflight: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ isAdmin: auth.isAdmin }));
vi.mock("@/lib/admin/filingActions", () => ({
  packageFilingSelect: {
    llcName: true,
    ownerName: true,
    taxYears: true,
    yearData: { select: { taxYear: true, rcsWhyMissed: true } },
  },
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      findMany: db.findMany,
      update: db.update,
      create: db.create,
      delete: db.delete,
    },
    filingChangeLog: { create: db.createLog },
  },
}));
vi.mock("@/lib/storage", () => ({
  put: storage.put,
  putPdf: storage.putPdf,
}));
vi.mock("@/lib/pdf/packageInput", () => ({ filingToPackageInput: pdf.filingToPackageInput }));
vi.mock("@/lib/pdf/generatePackage", () => ({ generatePackage: pdf.generatePackage }));
vi.mock("@/lib/pdf/preflight", () => ({ runPreflight: pdf.runPreflight }));

import { GET } from "./route";

describe("GET /api/admin/preflight-sweep", () => {
  beforeEach(() => {
    auth.isAdmin.mockReset();
    db.findMany.mockReset();
    db.update.mockReset();
    db.create.mockReset();
    db.delete.mockReset();
    db.createLog.mockReset();
    storage.put.mockReset();
    storage.putPdf.mockReset();
    pdf.filingToPackageInput.mockClear();
    pdf.generatePackage.mockReset();
    pdf.runPreflight.mockReset();
  });

  it("returns 401 for unauthenticated requests", async () => {
    auth.isAdmin.mockResolvedValue(false);

    const res = await GET();

    expect(res.status).toBe(401);
    expect(db.findMany).not.toHaveBeenCalled();
  });

  it("reports sweep results without database or storage writes or PII in the response", async () => {
    auth.isAdmin.mockResolvedValue(true);
    db.findMany.mockResolvedValue([
      {
        id: "filing_safe_1",
        preflightStatus: "passed",
        llcName: "Sensitive Holdings LLC",
        ownerName: "Private Owner",
        user: { email: "owner@example.test" },
        taxYears: [2025],
        yearData: [{ taxYear: 2025, rcsWhyMissed: "Sensitive reason" }],
      },
      {
        id: "filing_safe_2",
        preflightStatus: "failed",
        llcName: "Second Sensitive LLC",
        ownerName: "Second Private Owner",
        taxYears: [2025],
        yearData: [{ taxYear: 2025, rcsWhyMissed: null }],
      },
    ]);
    pdf.generatePackage
      .mockResolvedValueOnce({
        record: { id: "record_1" },
        bytes: new Uint8Array([37, 80, 68, 70]),
      })
      .mockRejectedValueOnce(new Error("Could not generate Second Sensitive LLC package"));
    pdf.runPreflight.mockResolvedValueOnce({
      ok: true,
      failures: [],
      warnings: [{ id: "A20", message: "Review this package" }],
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(db.findMany).toHaveBeenCalledWith({
      where: {
        generatedPdfKey: { not: null },
        status: { notIn: ["SIGNED_UPLOADED", "FAXED", "CONFIRMED"] },
      },
      select: expect.objectContaining({
        id: true,
        preflightStatus: true,
        yearData: expect.objectContaining({
          orderBy: { taxYear: "asc" },
        }),
      }),
      take: 200,
      orderBy: { updatedAt: "asc" },
    });
    expect(body).toMatchObject({
      totalChecked: 2,
      cappedAt200: false,
      results: [
        {
          filingId: "filing_safe_1",
          storedPreflightStatus: "passed",
          sweepResult: "needs_review",
          failedAssertionIds: [],
          warningIds: ["A20"],
        },
        {
          filingId: "filing_safe_2",
          storedPreflightStatus: "failed",
          sweepResult: "error",
          failedAssertionIds: [],
          warningIds: [],
          errorMessage: "Could not generate [redacted] package",
        },
      ],
    });
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("Sensitive Holdings LLC");
    expect(serialized).not.toContain("Private Owner");
    expect(serialized).not.toContain("owner@example.test");
    expect(serialized).not.toContain("Second Sensitive LLC");
    expect(db.update).not.toHaveBeenCalled();
    expect(db.create).not.toHaveBeenCalled();
    expect(db.delete).not.toHaveBeenCalled();
    expect(db.createLog).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
    expect(storage.putPdf).not.toHaveBeenCalled();
  });
});
