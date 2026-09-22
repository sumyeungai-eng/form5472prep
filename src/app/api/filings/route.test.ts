import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  getOrCreateSessionId: vi.fn(),
  getCurrentUser: vi.fn(),
}));

const db = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

const draft = vi.hoisted(() => ({
  findLatestPaidOwnerReferenceId: vi.fn(),
  findOrCreateDraftFiling: vi.fn(),
  ownerNamesMatchForReferenceId: vi.fn((a: string | null | undefined, b: string | null | undefined) =>
    (a ?? "").trim().replace(/\s+/g, " ").toLowerCase() ===
    (b ?? "").trim().replace(/\s+/g, " ").toLowerCase(),
  ),
}));

vi.mock("next/headers", () => ({
  cookies: () => ({ get: vi.fn(() => undefined) }),
}));
vi.mock("@/lib/session", () => session);
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: { findFirst: db.findFirst },
  },
}));
vi.mock("@/lib/findOrCreateDraft", () => draft);
vi.mock("@/lib/attribution", () => ({
  ATTR_COOKIE: "attr",
  parseAttributionCookie: vi.fn(() => null),
}));

import { POST } from "./route";

describe("POST /api/filings", () => {
  beforeEach(() => {
    session.getOrCreateSessionId.mockReset().mockReturnValue("session_1");
    session.getCurrentUser.mockReset().mockResolvedValue({ id: "user_1" });
    db.findFirst.mockReset();
    draft.findLatestPaidOwnerReferenceId.mockReset();
    draft.findOrCreateDraftFiling.mockReset().mockResolvedValue({
      filing: { id: "filing_1", marketingConsent: false },
      reused: false,
    });
    draft.ownerNamesMatchForReferenceId.mockClear();
  });

  it("does not prefill owner identity when a requested owner name differs from the previous paid filing", async () => {
    db.findFirst.mockResolvedValue({
      llcName: "Reusable LLC",
      llcEin: "12-3456789",
      llcAddress: "100 Main St",
      llcCity: "Dover",
      llcState: "DE",
      llcZip: "19901",
      llcCountry: "USA",
      llcDateIncorporated: new Date("2025-01-01T00:00:00.000Z"),
      llcBusinessActivity: "Consulting",
      llcBusinessCode: "541600",
      ownerName: "Person A",
      ownerAddress: "Private owner address",
      ownerAddressStreet: "1 Private Road",
      ownerAddressCity: "Hong Kong",
      ownerAddressState: "HK",
      ownerAddressPostal: "12345",
      ownerAddressCountry: "Hong Kong",
      ownerCountryCitizenship: "Hong Kong",
      ownerCountryTaxResidence: "Hong Kong",
      ownerCountryBusiness: "Hong Kong",
      ownerFtin: "HK-A",
      ownerItin: "900-00-0000",
    });

    const res = await POST(new Request("https://example.test/api/filings", {
      method: "POST",
      body: JSON.stringify({ ownerName: "Person B" }),
    }));

    expect(res.status).toBe(200);
    expect(draft.findLatestPaidOwnerReferenceId).not.toHaveBeenCalled();
    const prefill = draft.findOrCreateDraftFiling.mock.calls[0][0].prefill;
    expect(prefill).toMatchObject({
      llcName: "Reusable LLC",
      llcEin: "12-3456789",
      ownerName: "Person B",
    });
    expect(prefill).not.toHaveProperty("ownerFtin");
    expect(prefill).not.toHaveProperty("ownerItin");
    expect(prefill).not.toHaveProperty("ownerAddress");
    expect(prefill).not.toHaveProperty("ownerAddressStreet");
    expect(prefill).not.toHaveProperty("ownerAddressPostal");
    expect(prefill).not.toHaveProperty("ownerCountryCitizenship");
    expect(prefill).not.toHaveProperty("ownerCountryTaxResidence");
    expect(prefill).not.toHaveProperty("ownerCountryBusiness");
    expect(prefill).not.toHaveProperty("ownerReferenceId");
  });
});
