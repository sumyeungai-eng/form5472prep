import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  event: vi.fn(), telegram: vi.fn(), applications: vi.fn(),
  filing: { updateMany: vi.fn(), findUnique: vi.fn() },
  einApplication: { updateMany: vi.fn() }, itinApplication: { updateMany: vi.fn() },
}));
vi.mock("@/lib/stripe", () => ({ stripe: () => ({ webhooks: { constructEvent: mock.event } }) }));
vi.mock("@/lib/env", () => ({ env: { stripe: { webhookSecret: "test" } } }));
vi.mock("@/lib/prisma", () => ({ prisma: mock }));
vi.mock("@/lib/telegram", () => ({ notifyPaidOrderTelegram: mock.telegram }));
vi.mock("@/lib/applicationNotifications", () => ({ notifyApplicationPaid: mock.applications }));
vi.mock("@/lib/pdf/generatePackage", () => ({ generatePackage: vi.fn() }));
vi.mock("@/lib/storage", () => ({ putPdf: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendMagicLinkEmail: vi.fn(), sendOrderConfirmationEmail: vi.fn(), sendNewOrderAdminEmail: vi.fn() }));
vi.mock("@/lib/apns", () => ({ apnsConfigured: () => false, sendAdminPush: vi.fn() }));
import { POST } from "./route";
const req = () => new Request("https://example.com/api/stripe-webhook", { method: "POST", headers: { "stripe-signature": "sig" }, body: "{}" });
function event(metadata: Record<string, string>, extra = {}, type = "checkout.session.completed") {
  mock.event.mockReturnValue({ type, data: { object: { id: "cs_1", payment_intent: "pi_1", payment_status: "paid", amount_total: 14900, metadata, ...extra } } });
}
beforeEach(() => {
  vi.resetAllMocks();
  mock.telegram.mockResolvedValue(true);
  mock.einApplication.updateMany.mockResolvedValue({ count: 1 });
  mock.itinApplication.updateMany.mockResolvedValue({ count: 1 });
  mock.filing.updateMany.mockResolvedValue({ count: 0 });
});
describe("Stripe order alerts", () => {
  it.each(["ein", "itin"])("completes %s emails even when Telegram fails, then requests retry", async (type) => {
    event({ applicationType: type, applicationId: "app1" }); mock.telegram.mockResolvedValue(false);
    expect((await POST(req())).status).toBe(500);
    expect(mock.applications).toHaveBeenCalledWith(type, "app1");
  });
  it("retries Telegram on a duplicate filing event without repeating fulfillment", async () => {
    event({ filingId: "filing1" }); mock.telegram.mockResolvedValue(false);
    expect((await POST(req())).status).toBe(500);
    expect(mock.telegram).toHaveBeenCalledOnce();
    expect(mock.filing.findUnique).not.toHaveBeenCalled();
    mock.telegram.mockResolvedValue(true);
    expect((await POST(req())).status).toBe(200);
  });
  it("retries application alerts without resending emails", async () => {
    event({ applicationType: "ein", applicationId: "app1" });
    mock.einApplication.updateMany.mockResolvedValue({ count: 0 });
    mock.telegram.mockResolvedValue(false);
    expect((await POST(req())).status).toBe(500);
    expect(mock.applications).not.toHaveBeenCalled();
  });
  it("ignores unpaid checkout completions", async () => {
    event({ filingId: "filing1" }, { payment_status: "unpaid" });
    expect((await POST(req())).status).toBe(200);
    expect(mock.filing.updateMany).not.toHaveBeenCalled(); expect(mock.telegram).not.toHaveBeenCalled();
  });
  it("handles delayed payment success", async () => {
    event({ applicationType: "itin", applicationId: "app1" }, {}, "checkout.session.async_payment_succeeded");
    expect((await POST(req())).status).toBe(200);
    expect(mock.telegram).toHaveBeenCalledOnce(); expect(mock.applications).toHaveBeenCalledOnce();
  });
  it("does not alert on a stale filing session", async () => {
    event({ filingId: "filing1" }); mock.filing.updateMany.mockResolvedValue({ count: 1 });
    mock.filing.findUnique.mockResolvedValue({ id: "filing1", stripeSessionId: "new_session" });
    expect((await POST(req())).status).toBe(200); expect(mock.telegram).not.toHaveBeenCalled();
  });
  it("rejects unsigned requests before sending anything", async () => {
    expect((await POST(new Request("https://example.com", { method: "POST" }))).status).toBe(400);
    expect(mock.telegram).not.toHaveBeenCalled();
  });
});
