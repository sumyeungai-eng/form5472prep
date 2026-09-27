import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  telegramOrderNotification: { upsert: vi.fn(), updateMany: vi.fn() },
  einApplication: { findUnique: vi.fn() }, itinApplication: { findUnique: vi.fn() },
  filing: { findUnique: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/env", () => ({ env: { appUrl: "https://www.form5472prep.com" } }));
import { deliverOrderAlert, notifyPaidOrderTelegram, orderAlertText, type OrderAlert } from "./telegram";
import type Stripe from "stripe";
const order: OrderAlert = {
  id: "filing:123", service: "Form 5472", customer: "Example LLC", email: "test@example.com",
  amountCents: 14900, currency: "usd", adminPath: "/admin/filings/123", details: "Tax years: 2025",
};
const session = (overrides = {}) => ({
  id: "cs_live", payment_intent: "pi_live", payment_status: "paid", livemode: true,
  amount_total: 19900, currency: "usd", metadata: { filingId: "123" }, ...overrides,
}) as unknown as Stripe.Checkout.Session;
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "secret-token"); vi.stubEnv("TELEGRAM_CHAT_ID", "12345");
  db.telegramOrderNotification.upsert.mockResolvedValue({ sentAt: null });
  db.telegramOrderNotification.updateMany.mockResolvedValue({ count: 1 });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }));
  vi.spyOn(console, "error").mockImplementation(() => {});
  db.filing.findUnique.mockResolvedValue({ id: "123", stripePaymentId: "pi_live", stripeSessionId: "cs_live", llcName: "Example LLC", tier: "express", taxYears: [2024, 2025], user: { email: "test@example.com" } });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("Telegram delivery", () => {
  it("sends a bounded plain-text order summary and marks success", async () => {
    expect(await deliverOrderAlert(order)).toBe(true);
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://api.telegram.org/botsecret-token/sendMessage");
    const body = JSON.parse(options!.body as string);
    expect(body).toMatchObject({ chat_id: "12345", link_preview_options: { is_disabled: true } });
    expect(body.text).toContain("Paid: $149.00");
    expect(body.text).toContain("https://www.form5472prep.com/admin/filings/123");
    expect(body.parse_mode).toBeUndefined();
    expect(db.telegramOrderNotification.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ data: { sentAt: expect.any(Date), leaseUntil: null } }));
  });
  it("does nothing when configuration is missing", async () => {
    vi.stubEnv("TELEGRAM_CHAT_ID", "");
    expect(await deliverOrderAlert(order)).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
    expect(db.telegramOrderNotification.upsert).not.toHaveBeenCalled();
  });
  it("deduplicates already delivered orders", async () => {
    db.telegramOrderNotification.upsert.mockResolvedValue({ sentAt: new Date() });
    expect(await deliverOrderAlert(order)).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("requests a retry when another delivery holds the lease", async () => {
    db.telegramOrderNotification.updateMany.mockResolvedValue({ count: 0 });
    expect(await deliverOrderAlert(order)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([429, 500, 403])("releases a failed delivery for Stripe retry (HTTP %s)", async (status) => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status, json: async () => ({ ok: false }) } as Response);
    expect(await deliverOrderAlert(order)).toBe(false);
    expect(db.telegramOrderNotification.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ data: { leaseUntil: null } }));
  });
  it("checks Telegram's ok field even on HTTP 200", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ok: false }) } as Response);
    expect(await deliverOrderAlert(order)).toBe(false);
  });
  it("never logs URLs or secrets on a network timeout", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("https://api.telegram.org/botsecret-token/sendMessage"));
    expect(await deliverOrderAlert(order)).toBe(false);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("secret-token");
  });
  it("bounds user input and removes newlines", () => {
    const text = orderAlertText({ ...order, customer: "A\nB" + "x".repeat(5000) });
    expect(text).toContain("Customer / company: A B"); expect(text.length).toBeLessThan(1500);
  });
});
describe("paid-order routing", () => {
  it("uses Stripe's actual paid amount and includes filing years", async () => {
    expect(await notifyPaidOrderTelegram(session())).toBe(true);
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.text).toContain("Express filing"); expect(body.text).toContain("$199.00"); expect(body.text).toContain("2024, 2025");
  });
  it.each(["ein", "itin"])("covers %s paid applications without exporting tax identity data", async (type) => {
    const app = { id: "app1", fullName: "Alex", email: "alex@example.com", stripePaymentId: "pi_live", ...(type === "ein" ? { llcName: "Example LLC" } : {}) };
    db[type === "ein" ? "einApplication" : "itinApplication"].findUnique.mockResolvedValue(app);
    expect(await notifyPaidOrderTelegram(session({ metadata: { applicationType: type, applicationId: "app1" } }))).toBe(true);
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.text).toContain(`/admin/applications/${type}/app1`);
    expect(body.text).toContain(`${type.toUpperCase()} application`);
  });
  it.each([{ livemode: false }, { payment_status: "unpaid" }, { payment_intent: null }])("ignores test or unpaid events: %j", async (overrides) => {
    expect(await notifyPaidOrderTelegram(session(overrides))).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("ignores stale sessions and unmatched payment IDs", async () => {
    expect(await notifyPaidOrderTelegram(session({ id: "old_session" }))).toBe(true);
    expect(await notifyPaidOrderTelegram(session({ payment_intent: "wrong_payment" }))).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("requests retry when the order database is unavailable", async () => {
    db.filing.findUnique.mockRejectedValue(new Error("database unavailable"));
    expect(await notifyPaidOrderTelegram(session())).toBe(false);
  });
});
