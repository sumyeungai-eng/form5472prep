import { beforeEach, describe, expect, it, vi } from "vitest";

const email = vi.hoisted(() => ({ sendWebsiteQuestionAdminEmail: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendWebsiteQuestionAdminEmail: email.sendWebsiteQuestionAdminEmail }));
vi.mock("@/lib/env", () => ({ env: { adminEmail: "support@example.test" } }));
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

  it("only shows the fallback error when both attempts fail", async () => {
    email.sendWebsiteQuestionAdminEmail.mockRejectedValue(new Error("down"));
    const res = await ask({ email: "jose@altorven.com" });
    expect(res.status).toBe(500);
  });
});
