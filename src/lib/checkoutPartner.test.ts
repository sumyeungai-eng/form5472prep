import { beforeEach, describe, expect, it, vi } from "vitest";

// A partner's filing is paid by the partner: the client's invite link gets 403,
// the partner's session pays with the partner email and never rebinds the user.
const m = vi.hoisted(() => ({
  filing: { id: "f1", status: "DRAFT", tier: "standard", taxYears: [2025], yearData: [], partnerId: "p1", userId: "u1" } as Record<string, unknown>,
  partnerOwns: vi.fn(),
  bind: vi.fn(),
  stripeCreate: vi.fn(),
  userFind: vi.fn(async () => ({ id: "u1", email: "client@example.test" })),
}));
vi.mock("@/lib/session", async (orig) => {
  const actual = await orig<typeof import("@/lib/session")>();
  return { ...actual, getOwnedFiling: vi.fn(async () => m.filing), bindFilingToEmail: m.bind, partnerOwnsFiling: m.partnerOwns };
});
vi.mock("@/lib/partner/auth", () => ({ getCurrentPartner: vi.fn(async () => ({ id: "p1", email: "partner@example.test" })) }));
vi.mock("@/lib/completeness", () => ({ filingCompletionIssues: () => [], requiresReasonableCause: () => false }));
vi.mock("@/lib/prisma", () => ({
  prisma: { filing: { findUnique: vi.fn(async () => ({ yearData: [] })), update: vi.fn() }, user: { findUnique: m.userFind } },
}));
vi.mock("@/lib/stripe", () => ({
  stripe: () => ({ checkout: { sessions: { create: m.stripeCreate, retrieve: vi.fn(), expire: vi.fn() } } }),
}));
vi.mock("@/lib/stripeCheckoutBranding", () => ({
  createBrandedSession: vi.fn(async (params: unknown) => m.stripeCreate(params)),
}));

import { POST } from "@/app/api/checkout/route";

const post = (body: object) =>
  POST(new Request("http://x/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));

describe("checkout for a partner filing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.filing.userId = "u1";
    m.stripeCreate.mockResolvedValue({ id: "cs_1", url: "https://stripe.test/cs_1" });
    m.bind.mockResolvedValue({ id: "u2", email: "partner@example.test" });
  });

  it("403s without the partner session and creates no Stripe session", async () => {
    m.partnerOwns.mockResolvedValue(null);
    const res = await post({ filingId: "f1", email: "x@example.test" });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe("Your provider completes payment for this filing.");
    expect(m.stripeCreate).not.toHaveBeenCalled();
  });

  it("bills the partner email, adds partnerId, and does not rebind an existing user", async () => {
    m.partnerOwns.mockResolvedValue({ id: "p1", name: "Pat", company: null });
    const res = await post({ filingId: "f1", email: "" });
    expect(res.status).toBe(200);
    expect(m.bind).not.toHaveBeenCalled();
    const params = m.stripeCreate.mock.calls[0][0] as { customer_email: string; metadata: Record<string, string> };
    expect(params.customer_email).toBe("partner@example.test");
    expect(params.metadata).toEqual({ filingId: "f1", userId: "u1", partnerId: "p1" });
  });

  it("binds the partner email when the filing has no user yet", async () => {
    m.filing.userId = null;
    m.partnerOwns.mockResolvedValue({ id: "p1", name: "Pat", company: null });
    await post({ filingId: "f1" });
    expect(m.bind).toHaveBeenCalledWith("f1", "partner@example.test");
  });
});
