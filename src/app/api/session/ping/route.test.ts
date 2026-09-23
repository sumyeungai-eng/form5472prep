import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  transaction: vi.fn(),
  rateLimitUpsert: vi.fn(),
  rateLimitHelper: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: db.transaction,
    rateLimit: { upsert: db.rateLimitUpsert },
  },
}));
vi.mock("@/lib/rateLimit", () => ({ rateLimit: db.rateLimitHelper }));
vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => undefined, set: () => undefined }),
  headers: () => new Headers(),
}));
vi.mock("@/lib/session", () => ({ getCurrentUserId: () => null, getSessionId: () => undefined }));

import { NextRequest } from "next/server";
import { POST } from "./route";

function ping(userAgent: string) {
  return new NextRequest("https://www.form5472prep.com/api/session/ping", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": userAgent },
    body: JSON.stringify({ p: "/pricing" }),
  });
}

describe("session ping", () => {
  beforeEach(() => {
    db.transaction.mockReset();
    db.rateLimitUpsert.mockReset();
    db.rateLimitHelper.mockReset();
  });

  it("never touches the database for a bot or crawler", async () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2)",
      "Mozilla/5.0 (compatible; bingbot/2.0)",
    ]) {
      const res = await POST(ping(ua));
      expect(res.status).toBe(204);
    }
    expect(db.rateLimitHelper).not.toHaveBeenCalled();
    expect(db.rateLimitUpsert).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("still reaches the database path for a normal browser", async () => {
    db.rateLimitHelper.mockResolvedValue({ ok: false, retryAfterSec: 60 });
    const res = await POST(
      ping("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15"),
    );
    expect(db.rateLimitHelper).toHaveBeenCalled();
    expect(res.status).toBe(429);
  });
});
