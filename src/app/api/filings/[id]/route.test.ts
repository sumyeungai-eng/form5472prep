import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  getOwnedFiling: vi.fn(),
  bindFilingToEmail: vi.fn(),
}));
const db = vi.hoisted(() => {
  const update = vi.fn();
  return {
    update,
    transaction: vi.fn(async (fn: (tx: { filing: { update: typeof update } }) => Promise<unknown>) =>
      fn({ filing: { update } }),
    ),
  };
});

vi.mock("@/lib/session", () => ({
  getOwnedFiling: session.getOwnedFiling,
  bindFilingToEmail: session.bindFilingToEmail,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: db.transaction,
    filing: {
      findUnique: vi.fn(),
      update: db.update,
    },
    filingYearData: {
      upsert: vi.fn(),
    },
  },
}));
vi.mock("@/lib/storage", () => ({
  del: vi.fn(),
}));

import { PATCH } from "./route";

describe("filing PATCH Form 7004 extension fields", () => {
  const filing = {
    id: "filing_1",
    status: "DRAFT",
    taxYears: [2025],
    extensionFiled: null,
    extensionTransmittedAt: null,
    extensionMethod: null,
    extensionDestination: null,
    isFinalReturn: false,
    dissolvedAt: null,
    llcDateIncorporated: new Date("2020-01-01T00:00:00.000Z"),
    tier: "standard",
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T12:00:00.000Z"));
    session.getOwnedFiling.mockResolvedValue(filing);
    db.update.mockImplementation(async ({ data }) => ({ ...filing, ...data }));
    db.transaction.mockClear();
    db.update.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts extensionFiled yes without a transmission date", async () => {
    const res = await PATCH(
      new Request("https://example.test/api/filings/filing_1", {
        method: "PATCH",
        body: JSON.stringify({ extensionFiled: "yes" }),
      }),
      { params: { id: "filing_1" } },
    );

    expect(res.status).toBe(200);
    const data = (db.update.mock.calls.at(-1)?.[0] as { data: Record<string, unknown> }).data;
    expect(data).toMatchObject({
      extensionFiled: "yes",
      extensionTransmittedAt: null,
      extensionMethod: null,
      extensionDestination: null,
      isDiirsp: false,
    });
  });
});
