import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  getOwnedFiling: vi.fn(),
  bindFilingToEmail: vi.fn(),
}));
const db = vi.hoisted(() => {
  const update = vi.fn();
  const upsert = vi.fn();
  return {
    update,
    upsert,
    transaction: vi.fn(
      async (fn: (tx: {
        filing: { update: typeof update };
        filingYearData: { upsert: typeof upsert };
      }) => Promise<unknown>) =>
        fn({ filing: { update }, filingYearData: { upsert } }),
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
      upsert: db.upsert,
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
    ownerAddressState: "Ontario",
    ownerAddressPostal: "M5H 2N2",
    ownerNoPostalCode: false,
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
    db.upsert.mockClear();
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

  it("requires owner postal code unless ownerNoPostalCode is true", async () => {
    const missing = await PATCH(
      new Request("https://example.test/api/filings/filing_1", {
        method: "PATCH",
        body: JSON.stringify({
          ownerAddressState: "Ontario",
          ownerAddressPostal: "",
          ownerNoPostalCode: false,
        }),
      }),
      { params: { id: "filing_1" } },
    );
    expect(missing.status).toBe(400);
    await expect(missing.json()).resolves.toMatchObject({
      issues: [{ field: "ownerAddressPostal" }],
    });

    const allowed = await PATCH(
      new Request("https://example.test/api/filings/filing_1", {
        method: "PATCH",
        body: JSON.stringify({
          ownerAddressState: "Ontario",
          ownerAddressPostal: "",
          ownerNoPostalCode: true,
        }),
      }),
      { params: { id: "filing_1" } },
    );
    expect(allowed.status).toBe(200);
  });

  it("rejects an ITIN-looking value in ownerFtin", async () => {
    const res = await PATCH(
      new Request("https://example.test/api/filings/filing_1", {
        method: "PATCH",
        body: JSON.stringify({ ownerFtin: "912-34-5678" }),
      }),
      { params: { id: "filing_1" } },
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      issues: [
        {
          field: "ownerFtin",
          message: "This looks like a U.S. ITIN. Put it in the ITIN field instead.",
        },
      ],
    });
  });

  it("persists valid non-cash transfers and reasonable-cause fields", async () => {
    const res = await PATCH(
      new Request("https://example.test/api/filings/filing_1", {
        method: "PATCH",
        body: JSON.stringify({
          yearData: [
            {
              taxYear: 2025,
              totalAssetsYearEnd: 0,
              contributions: 0,
              distributions: 0,
              nonCashTransfers: [
                {
                  date: "2025-06-01",
                  direction: "in",
                  description: "Shares",
                  fairMarketValueCents: 100_00,
                  valuationMethod: "Broker statement",
                  alsoInPartV: true,
                },
              ],
              rcsWhyMissed: "I did not know the form was required.",
              rcsWhenLearned: "I learned in 2026.",
              rcsNoIrsNoticeConfirmed: true,
            },
          ],
        }),
      }),
      { params: { id: "filing_1" } },
    );

    expect(res.status).toBe(200);
    expect(db.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          nonCashTransfers: [
            expect.objectContaining({
              date: "2025-06-01",
              direction: "in",
              fairMarketValueCents: 100_00,
            }),
          ],
          rcsNoIrsNoticeConfirmed: true,
        }),
      }),
    );
  });

  it("rejects invalid non-cash transfer payloads", async () => {
    const res = await PATCH(
      new Request("https://example.test/api/filings/filing_1", {
        method: "PATCH",
        body: JSON.stringify({
          yearData: [
            {
              taxYear: 2025,
              totalAssetsYearEnd: 0,
              contributions: 0,
              distributions: 0,
              nonCashTransfers: [
                {
                  date: "2025/06/01",
                  direction: "sideways",
                  description: "Shares",
                  fairMarketValueCents: -1,
                  valuationMethod: "Broker statement",
                  alsoInPartV: false,
                },
              ],
            },
          ],
        }),
      }),
      { params: { id: "filing_1" } },
    );

    expect(res.status).toBe(400);
  });
});
