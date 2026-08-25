import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Prisma is mocked so the updateField tests below assert on the exact `data`
// object handed to the DB — the grouped extension rules (cascade + isDiirsp
// recompute) live entirely in that object, so this is the cheapest place to
// pin them without a database.
const db = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn((args: unknown) => ({ op: "filing.update", args })),
  createLog: vi.fn((args: unknown) => ({ op: "log.create", args })),
  transaction: vi.fn(async (ops: unknown[]) => ops),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: { findUnique: db.findUnique, update: db.update },
    filingChangeLog: { create: db.createLog },
    $transaction: db.transaction,
  },
}));

import {
  FilingActionError,
  isValidForceOverride,
  runFilingAction,
  SIDE_EFFECTING_ACTIONS,
} from "./filingActions";

describe("SIDE_EFFECTING_ACTIONS", () => {
  it("contains exactly the four externally side-effecting filing actions", () => {
    expect(Array.from(SIDE_EFFECTING_ACTIONS).sort()).toEqual([
      "regeneratePdf",
      "resendMagicLink",
      "resendOrderConfirmation",
      "retryFax",
    ]);
  });
});

describe("isValidForceOverride", () => {
  it.each([
    [{ force: true, reason: "legacy admin override" }, true],
    [{ force: true, reason: "  documented override  " }, true],
    [{ force: true, reason: "" }, false],
    [{ force: true, reason: "   " }, false],
    [{ force: true }, false],
    [{ force: false, reason: "documented override" }, false],
    [{ reason: "documented override" }, false],
  ] as const)("returns %s for %o", (ctx, expected) => {
    expect(isValidForceOverride(ctx)).toBe(expected);
  });
});

describe("updateField — Form 7004 grouped rules", () => {
  // Delinquency reads the clock, so pin it: 2024 is long past due, 2025 is past
  // its April 15 2026 due date but still inside the extended (Oct 15 2026)
  // window — which is the whole point of the extension gate.
  const NOW = new Date("2026-08-25T12:00:00.000Z");

  const baseFiling = {
    id: "filing_1",
    status: "PAID",
    llcName: "Acme LLC",
    taxYears: [2025],
    isDiirsp: true,
    isFinalReturn: false,
    dissolvedAt: null,
    extensionFiled: null as string | null,
    extensionTransmittedAt: null as Date | null,
    extensionMethod: null as string | null,
    extensionDestination: null as string | null,
    extensionProofKey: null as string | null,
    user: { id: "u1", email: "a@b.com" },
  };

  function givenFiling(overrides: Partial<typeof baseFiling> = {}) {
    db.findUnique.mockResolvedValue({ ...baseFiling, ...overrides });
  }

  // The `data` object the single filing.update in the transaction received.
  function updatedData(): Record<string, unknown> {
    const call = db.update.mock.calls.at(-1)?.[0] as { data: Record<string, unknown> };
    return call.data;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    db.findUnique.mockReset();
    db.update.mockClear();
    db.createLog.mockClear();
    db.transaction.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cascades: setting extensionFiled to 'no' clears the details, the proof and re-derives isDiirsp", async () => {
    givenFiling({
      extensionFiled: "yes",
      extensionTransmittedAt: new Date("2026-04-10T00:00:00.000Z"),
      extensionMethod: "fax",
      extensionDestination: "ogden",
      extensionProofKey: "filing_1_7004.pdf",
      isDiirsp: false,
    });

    const res = await runFilingAction(
      "filing_1",
      "updateField",
      { field: "extensionFiled", value: "no" },
      { adminId: "admin_1" },
    );

    expect(updatedData()).toEqual({
      extensionFiled: "no",
      extensionTransmittedAt: null,
      extensionMethod: null,
      extensionDestination: null,
      extensionProofKey: null,
      // No extension → 2025 is past its April 15 2026 deadline → late again.
      isDiirsp: true,
    });
    expect(res).toMatchObject({ ok: true, field: "extensionFiled", after: "no" });
    // One row for the named field + one per derived column, so the change log
    // explains the values nobody typed.
    expect(db.createLog).toHaveBeenCalledTimes(6);
  });

  it("rejects an extensionTransmittedAt that is not a real YYYY-MM-DD calendar date", async () => {
    givenFiling();

    for (const bad of ["2026-02-31", "2026-13-01", "2026-04-10T12:00:00Z", "April 10 2026"]) {
      await expect(
        runFilingAction(
          "filing_1",
          "updateField",
          { field: "extensionTransmittedAt", value: bad },
          { adminId: "admin_1" },
        ),
      ).rejects.toBeInstanceOf(FilingActionError);
    }
    expect(db.update).not.toHaveBeenCalled();
  });

  it("rejects extensionFiled='yes' when no transmittal date is stored or provided", async () => {
    givenFiling({ extensionFiled: null, extensionTransmittedAt: null });

    await expect(
      runFilingAction(
        "filing_1",
        "updateField",
        { field: "extensionFiled", value: "yes" },
        { adminId: "admin_1" },
      ),
    ).rejects.toMatchObject({ code: "extension_date_required", status: 400 });
    expect(db.update).not.toHaveBeenCalled();
  });

  it("recomputes isDiirsp: a valid stored 7004 makes the latest year timely again", async () => {
    givenFiling({
      extensionFiled: null,
      // Sent before the original April 15 2026 deadline → valid, extends to
      // October 15 2026, which is still ahead of the pinned clock.
      extensionTransmittedAt: new Date("2026-04-10T00:00:00.000Z"),
      isDiirsp: true,
    });

    await runFilingAction(
      "filing_1",
      "updateField",
      { field: "extensionFiled", value: "yes" },
      { adminId: "admin_1" },
    );

    expect(updatedData()).toEqual({ extensionFiled: "yes", isDiirsp: false });
  });

  it("does not recompute when the admin sets isDiirsp explicitly — the manual override wins", async () => {
    givenFiling({ isDiirsp: true });

    await runFilingAction(
      "filing_1",
      "updateField",
      { field: "isDiirsp", value: "false" },
      { adminId: "admin_1" },
    );

    expect(updatedData()).toEqual({ isDiirsp: false });
  });
});
