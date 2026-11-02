import { describe, expect, it, vi } from "vitest";

// Magic-link ?next= handling (release gate PR 1 relies on the EXISTING rule:
// same-origin relative paths only, no new whitelist).
vi.mock("@/lib/magicLink", () => ({ verifyMagicLinkToken: vi.fn(() => "user_1") }));
vi.mock("@/lib/session", () => ({ makeUserToken: vi.fn(() => "signed-token") }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn(async () => ({ id: "user_1", email: "client@example.test" })) } },
}));

import { GET } from "./route";

const go = async (next: string | null) => {
  const qs = next === null ? "" : `?next=${encodeURIComponent(next)}`;
  const res = await GET(new Request(`https://app.example.test/auth/tok${qs}`), { params: { token: "tok" } });
  return res.headers.get("location");
};

describe("magic link ?next=", () => {
  it("lands on the filing page (order-time link)", async () => {
    expect(await go("/filings/f1")).toBe("https://app.example.test/filings/f1");
  });
  it("keeps existing sign links working", async () => {
    expect(await go("/filings/f1/sign")).toBe("https://app.example.test/filings/f1/sign");
  });
  it("keeps the #ssn deep link working", async () => {
    expect(await go("/filings/f1#ssn")).toBe("https://app.example.test/filings/f1#ssn");
  });
  it("falls back to the dashboard for a protocol-relative //evil.com", async () => {
    expect(await go("//evil.com")).toBe("https://app.example.test/dashboard");
  });
  it("falls back to the dashboard for an absolute URL", async () => {
    expect(await go("https://evil.com/x")).toBe("https://app.example.test/dashboard");
  });
  it("falls back to the dashboard with no next", async () => {
    expect(await go(null)).toBe("https://app.example.test/dashboard");
  });
});
