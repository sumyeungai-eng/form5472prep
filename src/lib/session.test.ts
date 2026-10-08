import { beforeEach, describe, expect, it, vi } from "vitest";

// Mirrors the Prisma-mocking pattern used in src/lib/supersedeDrafts.test.ts.
const db = vi.hoisted(() => ({
  filingFindUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      findUnique: db.filingFindUnique,
    },
  },
}));

// partnerOwnsFiling's only partner-identity dependency is getCurrentPartner
// (which itself wraps cookies() + a separate Prisma model). Mocking that
// module boundary — rather than re-deriving cookies/HMAC verification here —
// keeps this test focused on partnerOwnsFiling's own ownership comparison.
const partnerAuth = vi.hoisted(() => ({
  getCurrentPartner: vi.fn(),
}));

vi.mock("@/lib/partner/auth", () => ({
  getCurrentPartner: partnerAuth.getCurrentPartner,
}));

import { partnerOwnsFiling } from "./session";

describe("partnerOwnsFiling", () => {
  beforeEach(() => {
    db.filingFindUnique.mockReset();
    partnerAuth.getCurrentPartner.mockReset();
  });

  it("returns the partner when the filing's partnerId matches the signed-in partner", async () => {
    partnerAuth.getCurrentPartner.mockResolvedValue({
      id: "partner_1",
      name: "Acme Advisors",
      company: "Acme LLC",
      active: true,
    });
    db.filingFindUnique.mockResolvedValue({ partnerId: "partner_1" });

    await expect(partnerOwnsFiling("filing_1")).resolves.toEqual({
      id: "partner_1",
      name: "Acme Advisors",
      company: "Acme LLC",
    });
  });

  it("returns null when the filing belongs to a different partner", async () => {
    partnerAuth.getCurrentPartner.mockResolvedValue({
      id: "partner_1",
      name: "Acme Advisors",
      company: null,
      active: true,
    });
    db.filingFindUnique.mockResolvedValue({ partnerId: "partner_2" });

    await expect(partnerOwnsFiling("filing_1")).resolves.toBeNull();
  });

  it("returns null when there is no signed-in partner (no partner cookie) and does not throw", async () => {
    partnerAuth.getCurrentPartner.mockResolvedValue(null);

    await expect(partnerOwnsFiling("filing_1")).resolves.toBeNull();
    // Ownership can't be true without a partner identity — never worth a
    // filing lookup once getCurrentPartner has already said "no partner".
    expect(db.filingFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when the filing itself doesn't exist", async () => {
    partnerAuth.getCurrentPartner.mockResolvedValue({
      id: "partner_1",
      name: "Acme Advisors",
      company: null,
      active: true,
    });
    db.filingFindUnique.mockResolvedValue(null);

    await expect(partnerOwnsFiling("missing_filing")).resolves.toBeNull();
  });
});

describe("toClientFiling", () => {
  it("drops the session credential and staff-only identity fields", async () => {
    const { toClientFiling, STAFF_ONLY_FILING_FIELDS } = await import("./session");
    const out = toClientFiling({
      id: "f1",
      sessionId: "s",
      llcName: "Synthetic Test LLC",
      reviewedBy: "a@gmail.com",
      reviewApprovedBy: "a@gmail.com",
      preflightOverrideBy: "a@gmail.com",
      preflightOverrideReason: "internal",
      reviewApprovedAt: "2026-10-07T00:00:00Z",
    });
    expect(out).toEqual({ id: "f1", llcName: "Synthetic Test LLC", reviewApprovedAt: "2026-10-07T00:00:00Z" });
    expect(STAFF_ONLY_FILING_FIELDS).toContain("reviewApprovedBy");
  });
});
