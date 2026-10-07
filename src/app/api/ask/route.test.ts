import { beforeEach, describe, expect, it, vi } from "vitest";

const email = vi.hoisted(() => ({ sendWebsiteQuestionAdminEmail: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendWebsiteQuestionAdminEmail: email.sendWebsiteQuestionAdminEmail }));
vi.mock("@/lib/env", () => ({ env: { adminEmail: "support@example.test", appUrl: "https://app.example.test" } }));
const db = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { websiteQuestion: { create: db.create } } }));
vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn(async () => ({ ok: true })),
  clientIp: () => "127.0.0.1",
  tooManyRequests: () => new Response(null, { status: 429 }),
}));

import { POST } from "./route";

function ask(body: Record<string, unknown>) {
  return POST(
    new Request("https://example.test/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello, I need help with my EIN.", ...body }),
    }),
  );
}

describe("POST /api/ask", () => {
  beforeEach(() => {
    email.sendWebsiteQuestionAdminEmail.mockReset();
    email.sendWebsiteQuestionAdminEmail.mockResolvedValue({ id: "1" });
    db.create.mockReset();
    db.create.mockResolvedValue({ id: "q_1" });
  });

  it.each(["jose@altorven", "a@b.com, c@d.com", "jose altorven@x.com", "no-at-sign.com"])(
    "rejects %s with a clear message instead of a send failure",
    async (address) => {
      const res = await ask({ email: address });
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/check your email address/i);
      expect(email.sendWebsiteQuestionAdminEmail).not.toHaveBeenCalled();
    },
  );

  it("sends a valid question with the visitor as Reply-To", async () => {
    const res = await ask({ email: "jose@altorven.com" });
    expect(res.status).toBe(200);
    expect(email.sendWebsiteQuestionAdminEmail).toHaveBeenCalledTimes(1);
    expect(email.sendWebsiteQuestionAdminEmail.mock.calls[0][0].replyToVisitor).toBeUndefined();
  });

  it("retries without Reply-To so the question is never lost", async () => {
    email.sendWebsiteQuestionAdminEmail.mockRejectedValueOnce(new Error("Invalid `reply_to` field"));
    const res = await ask({ email: "jose@altorven.com" });
    expect(res.status).toBe(200);
    expect(email.sendWebsiteQuestionAdminEmail).toHaveBeenCalledTimes(2);
    expect(email.sendWebsiteQuestionAdminEmail.mock.calls[1][0]).toMatchObject({
      replyToVisitor: false,
      email: "jose@altorven.com",
    });
  });

  it("stores the question for the admin Questions page and links it in the email", async () => {
    const res = await ask({ email: "jose@altorven.com", name: "Jose", topic: "billing", pageUrl: "https://x.test/pricing" });
    expect(res.status).toBe(200);
    expect(db.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: "Jose",
          email: "jose@altorven.com",
          message: "Hello, I need help with my EIN.",
          topic: "Billing or refund",
          pageUrl: "https://x.test/pricing",
        },
      }),
    );
    expect(email.sendWebsiteQuestionAdminEmail.mock.calls[0][0].adminLink).toBe("https://app.example.test/admin/questions/q_1");
  });

  it("does not store honeypot spam or invalid addresses", async () => {
    await ask({ email: "bot@spam.test", company: "Acme" });
    await ask({ email: "jose@altorven" });
    expect(db.create).not.toHaveBeenCalled();
  });

  it("still emails the question when the database write fails", async () => {
    db.create.mockRejectedValueOnce(new Error("db down"));
    const res = await ask({ email: "jose@altorven.com" });
    expect(res.status).toBe(200);
    expect(email.sendWebsiteQuestionAdminEmail).toHaveBeenCalledTimes(1);
    expect(email.sendWebsiteQuestionAdminEmail.mock.calls[0][0].adminLink).toBeUndefined();
  });

  it("succeeds when both emails fail but the question was stored", async () => {
    email.sendWebsiteQuestionAdminEmail.mockRejectedValue(new Error("down"));
    const res = await ask({ email: "jose@altorven.com" });
    expect(res.status).toBe(200);
  });

  it("only shows the fallback error when the question was neither stored nor emailed", async () => {
    db.create.mockRejectedValueOnce(new Error("db down"));
    email.sendWebsiteQuestionAdminEmail.mockRejectedValue(new Error("down"));
    const res = await ask({ email: "jose@altorven.com" });
    expect(res.status).toBe(500);
  });
});
