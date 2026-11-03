import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ update: vi.fn(async () => ({ id: "f1" })), createMany: vi.fn(async () => ({ count: 1 })) }));
vi.mock("@/lib/prisma", () => ({
  prisma: { filing: { update: db.update }, filingChangeLog: { createMany: db.createMany } },
}));

import { persistNewPackagePreflight } from "./persistPreflight";

// P0-3 snapshot: written only when a generated artifact is STORED.
describe("verbatim RCS snapshot", () => {
  const verbatimRecord = {
    generatorVersion: "2.5.1",
    commit: "test",
    taxYears: [
      { taxYear: 2024, rcs: { verbatim: { text: "My words ?", unencodable: ["ฉ"], chosenBy: "admin_1", chosenAt: "2026-11-01T00:00:00.000Z" } } },
      { taxYear: 2025, rcs: { verbatim: null } },
    ],
  } as never;
  const preflight = { ok: true, failures: [], warnings: [] };
  beforeEach(() => vi.clearAllMocks());

  it("appends one change-log row per verbatim year with the key, printed body and chooser", async () => {
    await persistNewPackagePreflight({ filingId: "f1", preflight, record: verbatimRecord, data: { generatedPdfKey: "f1_unsigned_9.pdf" } });
    expect(db.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          filingId: "f1",
          source: "system",
          field: "rcsVerbatimSnapshot:2024",
          afterJson: expect.objectContaining({ artifactKey: "f1_unsigned_9.pdf", renderedBody: "My words ?", chosenBy: "admin_1" }),
        }),
      ],
    });
    // Not a "year:" field, so a snapshot never makes pre-flight stale.
    expect((db.createMany.mock.calls[0] as unknown as [{ data: Array<{ field: string }> }])[0].data[0].field.startsWith("year:")).toBe(false);
  });

  it("writes nothing when no artifact key is stored, or no year is verbatim", async () => {
    await persistNewPackagePreflight({ filingId: "f1", preflight, record: verbatimRecord, data: { status: "PDF_GENERATED" } });
    await persistNewPackagePreflight({
      filingId: "f1",
      preflight,
      record: { generatorVersion: "2.5.1", commit: "t", taxYears: [] },
      data: { generatedPdfKey: "f1_unsigned_10.pdf" },
    });
    expect(db.createMany).not.toHaveBeenCalled();
  });

  it("never throws when the change-log write fails (payment path)", async () => {
    db.createMany.mockRejectedValueOnce(new Error("db down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      persistNewPackagePreflight({ filingId: "f1", preflight, record: verbatimRecord, data: { generatedPdfKey: "k.pdf" } }),
    ).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
