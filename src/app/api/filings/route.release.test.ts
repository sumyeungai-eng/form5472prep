import { describe, expect, it, vi } from "vitest";

// Release gate: GET /api/filings (the signed-in list) runs every row through
// the real toClientFiling, so no package key leaks before release.
const findMany = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: () => ({ get: vi.fn(() => undefined) }) }));
vi.mock("@/lib/session", async (orig) => ({
  ...(await orig<typeof import("@/lib/session")>()),
  getCurrentUser: vi.fn(async () => ({ id: "user_1" })),
  claimAccountFilings: vi.fn(async () => ({ userId: "user_1" })),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findMany } } }));

import { GET } from "./route";

describe("GET /api/filings release gate", () => {
  it("strips the package key from unreleased rows and keeps it on released rows", async () => {
    findMany.mockResolvedValue([
      { id: "f1", sessionId: "s", reviewApprovedAt: null, generatedPdfKey: "f1_unsigned_1.pdf", reviewApprovedPdfKey: null, yearData: [] },
      {
        id: "f2",
        sessionId: "s",
        reviewApprovedAt: new Date("2026-10-30T00:00:00Z"),
        generatedPdfKey: "f2_unsigned_2.pdf",
        reviewApprovedPdfKey: "f2_unsigned_2.pdf",
        yearData: [],
      },
    ]);
    const body = (await (await GET()).json()) as Array<Record<string, unknown>>;
    expect(body[0].generatedPdfKey).toBeNull();
    expect(JSON.stringify(body[0])).not.toContain("_unsigned_");
    expect(body[1].generatedPdfKey).toBe("f2_unsigned_2.pdf");
    expect(body.every((row) => !("sessionId" in row))).toBe(true);
  });
});
