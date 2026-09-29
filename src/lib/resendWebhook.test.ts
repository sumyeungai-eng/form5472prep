import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  updateMany: vi.fn(async (_args: unknown) => ({ count: 1 })),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { emailLog: { updateMany: db.updateMany } } }));

import { POST as resendWebhook } from "@/app/api/resend-webhook/route";
import { applyResendEvent, verifySvixSignature } from "@/lib/resendWebhook";

// A throwaway signing secret in Resend's format (whsec_ + base64 key).
const KEY = crypto.randomBytes(24);
const SECRET = `whsec_${KEY.toString("base64")}`;

function sign(id: string, timestamp: string, body: string, key: Uint8Array = KEY): string {
  return crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
}

function event(type: string, extra: Record<string, unknown> = {}) {
  return {
    type,
    created_at: "2026-09-29T08:00:00.000Z",
    data: { email_id: "resend-abc", to: ["owner@example.test"], subject: "Hi", ...extra },
  };
}

function signedRequest(payload: unknown, opts: { secretKey?: Uint8Array; timestamp?: number; signature?: string } = {}) {
  const body = JSON.stringify(payload);
  const id = "msg_2abc";
  const ts = String(opts.timestamp ?? Math.floor(Date.now() / 1000));
  const signature = opts.signature ?? `v1,${sign(id, ts, body, opts.secretKey)}`;
  return new Request("https://example.test/api/resend-webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "svix-id": id, "svix-timestamp": ts, "svix-signature": signature },
    body,
  });
}

beforeEach(() => {
  db.updateMany.mockReset();
  db.updateMany.mockResolvedValue({ count: 1 });
  vi.stubEnv("RESEND_WEBHOOK_SECRET", SECRET);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/resend-webhook", () => {
  it("accepts a valid signature and records delivery on the matching EmailLog row", async () => {
    const res = await resendWebhook(signedRequest(event("email.delivered")));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, applied: true, status: "delivered" });
    expect(db.updateMany).toHaveBeenCalledWith({
      where: { resendId: "resend-abc", status: { in: ["sent", "failed", "delivery_delayed", "delivered"] } },
      data: { status: "delivered", lastEventAt: new Date("2026-09-29T08:00:00.000Z") },
    });
  });

  it("rejects an invalid signature (wrong secret) without touching the DB", async () => {
    const res = await resendWebhook(signedRequest(event("email.delivered"), { secretKey: crypto.randomBytes(24) }));
    expect(res.status).toBe(401);
    expect(db.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a tampered body", async () => {
    const good = signedRequest(event("email.delivered"));
    const tampered = new Request(good.url, {
      method: "POST",
      headers: good.headers,
      body: JSON.stringify(event("email.bounced")),
    });
    expect((await resendWebhook(tampered)).status).toBe(401);
    expect(db.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a stale timestamp (replay) even with a correct signature", async () => {
    const res = await resendWebhook(
      signedRequest(event("email.delivered"), { timestamp: Math.floor(Date.now() / 1000) - 6 * 60 }),
    );
    expect(res.status).toBe(401);
    expect(db.updateMany).not.toHaveBeenCalled();
  });

  it("answers 503 and does nothing when RESEND_WEBHOOK_SECRET is unset", async () => {
    vi.stubEnv("RESEND_WEBHOOK_SECRET", "");
    const res = await resendWebhook(signedRequest(event("email.delivered")));
    expect(res.status).toBe(503);
    expect(db.updateMany).not.toHaveBeenCalled();
  });

  it("is a 200 no-op for an email id we never logged", async () => {
    db.updateMany.mockResolvedValueOnce({ count: 0 });
    const res = await resendWebhook(signedRequest(event("email.delivered")));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, applied: false, reason: "unknown_or_stale" });
  });

  it("ignores event types we don't track (email.opened) without a DB write", async () => {
    const res = await resendWebhook(signedRequest(event("email.opened")));
    expect(await res.json()).toMatchObject({ applied: false, reason: "ignored_event" });
    expect(db.updateMany).not.toHaveBeenCalled();
  });
});

describe("verifySvixSignature", () => {
  const body = '{"type":"email.delivered"}';
  const now = 1_790_000_000;

  it("accepts any matching v1 signature in a space-separated list (secret rotation)", () => {
    const ts = String(now);
    const header = `v1,${Buffer.alloc(32).toString("base64")} v1,${sign("msg_1", ts, body)}`;
    expect(verifySvixSignature({ secret: SECRET, id: "msg_1", timestamp: ts, signatureHeader: header, rawBody: body, nowSecs: now }))
      .toEqual({ ok: true });
  });

  it("rejects missing headers, non-v1 versions and malformed timestamps", () => {
    const ts = String(now);
    const sig = sign("msg_1", ts, body);
    expect(verifySvixSignature({ secret: SECRET, id: null, timestamp: ts, signatureHeader: `v1,${sig}`, rawBody: body, nowSecs: now }).ok).toBe(false);
    expect(verifySvixSignature({ secret: SECRET, id: "msg_1", timestamp: ts, signatureHeader: `v2,${sig}`, rawBody: body, nowSecs: now }).ok).toBe(false);
    expect(verifySvixSignature({ secret: SECRET, id: "msg_1", timestamp: "12ab", signatureHeader: `v1,${sig}`, rawBody: body, nowSecs: now }).ok).toBe(false);
  });

  it("rejects timestamps more than 5 minutes old (and implausibly far in the future)", () => {
    for (const offset of [-301, 301]) {
      const ts = String(now + offset);
      expect(
        verifySvixSignature({ secret: SECRET, id: "msg_1", timestamp: ts, signatureHeader: `v1,${sign("msg_1", ts, body)}`, rawBody: body, nowSecs: now }).ok,
      ).toBe(false);
    }
    const ts = String(now - 299);
    expect(
      verifySvixSignature({ secret: SECRET, id: "msg_1", timestamp: ts, signatureHeader: `v1,${sign("msg_1", ts, body)}`, rawBody: body, nowSecs: now }).ok,
    ).toBe(true);
  });
});

describe("applyResendEvent", () => {
  it("stores the bounce reason in error", async () => {
    await applyResendEvent(event("email.bounced", { bounce: { type: "Permanent", subType: "General", message: "Mailbox does not exist" } }));
    expect(db.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "bounced", error: "Permanent — General — Mailbox does not exist" }),
    }));
  });

  it("never lets a late delivery_delayed overwrite delivered/bounced (status rank guard)", async () => {
    await applyResendEvent(event("email.delivery_delayed"));
    expect(db.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { resendId: "resend-abc", status: { in: ["sent", "failed", "delivery_delayed"] } },
    }));
  });

  it("lets a complaint land after delivery", async () => {
    await applyResendEvent(event("email.complained"));
    const where = (db.updateMany.mock.calls[0][0] as { where: { status: { in: string[] } } }).where;
    expect(where.status.in).toEqual(expect.arrayContaining(["delivered", "bounced", "complained"]));
  });
});
