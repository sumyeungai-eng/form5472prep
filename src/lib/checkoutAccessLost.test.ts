import { describe, expect, it, vi } from "vitest";

// Regression guard: when a filing's owner takes it over mid-checkout,
// bindFilingToEmail throws FilingAccessLostError. Checkout must answer 404
// (no rebind and no Stripe session), not an unhandled 500.
vi.mock("@/lib/session", async (orig) => {
  const actual = await orig<typeof import("@/lib/session")>();
  return {
    ...actual,
    getOwnedFiling: vi.fn(async () => ({ id: "f1", status: "DRAFT", tier: "standard", taxYears: [2025], yearData: [] })),
    bindFilingToEmail: vi.fn(async () => { throw new actual.FilingAccessLostError("f1"); }),
  };
});
vi.mock("@/lib/completeness", () => ({ filingCompletionIssues: () => [], requiresReasonableCause: () => false }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findUnique: vi.fn(async () => ({ yearData: [] })), update: vi.fn() } } }));
const stripeCreate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/stripe", () => ({ stripe: () => ({ checkout: { sessions: { create: stripeCreate, retrieve: vi.fn(), expire: vi.fn() } } }) }));

// Load the route outside the timed assertion; its PDF imports can be slow under full-suite load.
import { POST } from "@/app/api/checkout/route";

describe("checkout when the filing was taken over mid-request", () => {
  it("returns 404 and creates no Stripe session", async () => {
    const res = await POST(new Request("http://x/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filingId: "f1", email: "owner@example.test" }),
    }));
    expect(res.status).toBe(404);
    expect(stripeCreate).not.toHaveBeenCalled();
  });
});
