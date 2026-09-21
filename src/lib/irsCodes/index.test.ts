import { describe, expect, it, vi } from "vitest";
import {
  NO_ACTIVITY_CODE,
  describePbaCode,
  isValidPbaCode,
  pbaCodesFor,
  pbaYearFor,
  searchPbaCodes,
} from ".";

const years = [2023, 2024, 2025] as const;
const goodCodes = ["541600", "541512", "523900", "999000"] as const;
const badCodes = ["541611", "541510", "000000", "999999"] as const;

describe("IRS Form 1120 PBA code data", () => {
  it("contains several hundred distinct 6-digit codes for every extracted year", () => {
    for (const year of years) {
      const codes = pbaCodesFor(year);
      const distinct = new Set(codes.map((item) => item.code));

      expect(codes.length).toBeGreaterThan(300);
      expect(distinct.size).toBe(codes.length);
      expect(codes.every((item) => /^\d{6}$/.test(item.code))).toBe(true);
    }
  });

  it("contains the required good codes and excludes known off-list codes every year", () => {
    for (const year of years) {
      for (const code of goodCodes) {
        expect(isValidPbaCode(code, year), `${code} should be valid for ${year}`).toBe(true);
      }
      for (const code of badCodes) {
        expect(isValidPbaCode(code, year), `${code} should be invalid for ${year}`).toBe(false);
      }
    }
  });
});

describe("PBA code helpers", () => {
  it("chooses the nearest available IRS list by tax year", () => {
    expect(pbaYearFor(2019)).toBe(2023);
    expect(pbaYearFor(2023)).toBe(2023);
    expect(pbaYearFor(2024)).toBe(2024);
    expect(pbaYearFor(2025)).toBe(2025);
    expect(pbaYearFor(2027)).toBe(2025);
  });

  it("describes valid codes and returns null for off-list codes", () => {
    expect(describePbaCode("541600", 2025)).toContain("Consulting");
    expect(describePbaCode("541611", 2025)).toBeNull();
  });

  it("searches by code prefix and description word prefixes", () => {
    expect(searchPbaCodes("5415", 2025).map((item) => item.code)).toContain("541512");

    const consultingResults = searchPbaCodes("consult", 2025);
    expect(consultingResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "541600",
          description: expect.stringContaining("Consulting"),
        }),
      ]),
    );
  });

  it("exports the Form 1120 unclassified establishments code", () => {
    expect(NO_ACTIVITY_CODE).toBe("999000");
    expect(describePbaCode(NO_ACTIVITY_CODE, 2025)).toBe("Unclassified Establishments (unable to classify)");
  });
});

describe("filing PATCH PBA code validation", () => {
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

  async function loadPatch() {
    vi.resetModules();
    const session = {
      getOwnedFiling: vi.fn().mockResolvedValue(filing),
      bindFilingToEmail: vi.fn(),
    };
    const update = vi.fn(async ({ data }) => ({ ...filing, ...data }));
    vi.doMock("@/lib/session", () => session);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        $transaction: vi.fn(async (fn) => fn({ filing: { update } })),
        filing: {
          findUnique: vi.fn(),
          update,
        },
        filingYearData: {
          upsert: vi.fn(),
        },
      },
    }));
    vi.doMock("@/lib/storage", () => ({
      del: vi.fn(),
    }));
    const route = await import("@/app/api/filings/[id]/route");
    return { PATCH: route.PATCH, update };
  }

  it("rejects an off-list business activity code", async () => {
    const { PATCH, update } = await loadPatch();
    const res = await PATCH(
      new Request("https://example.test/api/filings/filing_1", {
        method: "PATCH",
        body: JSON.stringify({ llcBusinessCode: "541611" }),
      }),
      { params: { id: "filing_1" } },
    );

    await expect(res.json()).resolves.toEqual({
      error: "Choose a business activity code from the IRS list.",
    });
    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("accepts a listed business activity code", async () => {
    const { PATCH, update } = await loadPatch();
    const res = await PATCH(
      new Request("https://example.test/api/filings/filing_1", {
        method: "PATCH",
        body: JSON.stringify({ llcBusinessCode: "541600" }),
      }),
      { params: { id: "filing_1" } },
    );

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      where: { id: "filing_1" },
      data: { llcBusinessCode: "541600", dissolvedAt: null },
    });
  });
});
