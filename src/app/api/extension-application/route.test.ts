import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { upsert: vi.fn() },
  extensionApplication: { create: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn(async () => ({ ok: true, retryAfterSec: 0 })),
  clientIp: () => "203.0.113.7",
  tooManyRequests: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: () => ({ get: vi.fn(() => undefined) }) }));

import { POST } from "./route";

const post = (body: unknown) =>
  POST(new Request("https://example.com/api/extension-application", { method: "POST", body: JSON.stringify(body) }));

beforeEach(() => {
  vi.clearAllMocks();
  db.user.upsert.mockResolvedValue({ id: "user1" });
  db.extensionApplication.create.mockResolvedValue({ id: "ext1" });
});

describe("POST /api/extension-application (never block payment)", () => {
  it("accepts an email-only order and leaves every other field blank for staff", async () => {
    const res = await post({ email: "  Owner@Example.com " });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: "ext1" });
    const data = db.extensionApplication.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      email: "owner@example.com", fullName: "", llcName: null, ein: null, taxYear: null,
      status: "PAYMENT_PENDING", userId: "user1",
    });
  });

  it("stores a full order, trimming and bounding free text", async () => {
    await post({
      email: "owner@example.com", fullName: "Sample Owner", llcName: "Sample Holdings LLC", ein: "12-3456789",
      llcStreet: "1 Example St", llcCity: "Sheridan", llcState: "WY", llcZip: "82801", taxYear: "2026",
      phone: "+44 20 0000 0000", notes: "x".repeat(5000), funnelSource: "Google Ads!",
    });
    const data = db.extensionApplication.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ taxYear: 2026, llcState: "WY", funnelSource: "googleads" });
    expect(data.notes).toHaveLength(2000);
  });

  it("stores an unusable tax year as null instead of rejecting the order", async () => {
    expect((await post({ email: "owner@example.com", taxYear: "next year" })).status).toBe(200);
    expect(db.extensionApplication.create.mock.calls[0][0].data.taxYear).toBeNull();
  });

  it("rejects only a missing or malformed email", async () => {
    expect((await post({ llcName: "Sample LLC" })).status).toBe(400);
    expect((await post({ email: "not-an-email" })).status).toBe(400);
    expect(db.extensionApplication.create).not.toHaveBeenCalled();
  });
});
