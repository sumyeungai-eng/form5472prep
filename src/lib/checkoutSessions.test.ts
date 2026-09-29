import { tierInfo, multiYearAddonCents } from "./pricing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkoutSessionDecision,
  isSupersededCheckout,
  preparePreviousCheckout,
  refundAlertEmail,
} from "./checkoutSessions";

const fake = vi.hoisted(() => ({
  telegram: vi.fn(),
  retrieve: vi.fn(), expire: vi.fn(), create: vi.fn(), constructEvent: vi.fn(),
  findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn(),
  getOwnedFiling: vi.fn(), bindFilingToEmail: vi.fn(),
  sendEmail: vi.fn(), sendMagicLinkEmail: vi.fn(), sendOrderConfirmationEmail: vi.fn(),
  sendNewOrderAdminEmail: vi.fn(), generatePackage: vi.fn(), putPdf: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({ stripe: () => ({
  checkout: { sessions: { retrieve: fake.retrieve, expire: fake.expire, create: fake.create } },
  webhooks: { constructEvent: fake.constructEvent },
  paymentIntents: { retrieve: async () => ({ latest_charge: null }) },
}) }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: {
  findUnique: fake.findUnique, update: fake.update, updateMany: fake.updateMany,
} } }));
vi.mock("@/lib/session", () => ({ getOwnedFiling: fake.getOwnedFiling, bindFilingToEmail: fake.bindFilingToEmail }));
vi.mock("@/lib/env", () => ({ env: {
  adminEmail: "admin@example.test", appUrl: "https://example.test",
  stripe: { webhookSecret: "fake-secret" },
} }));
vi.mock("@/lib/email", () => ({
  sendEmail: fake.sendEmail, sendMagicLinkEmail: fake.sendMagicLinkEmail,
  sendOrderConfirmationEmail: fake.sendOrderConfirmationEmail,
  sendNewOrderAdminEmail: fake.sendNewOrderAdminEmail,
}));
vi.mock("@/lib/completeness", () => ({ filingCompletionIssues: () => [], requiresReasonableCause: () => false }));
vi.mock("@/lib/pdf/generatePackage", () => ({ generatePackage: fake.generatePackage }));
vi.mock("@/lib/storage", () => ({ putPdf: fake.putPdf }));
vi.mock("@/lib/magicLink", () => ({ makeMagicLink: () => "https://example.test/login" }));
vi.mock("@/lib/partnerBrand", () => ({ brandForFiling: async () => null }));
vi.mock("@/lib/analytics/metaServer", () => ({ sendMetaPurchase: vi.fn() }));
vi.mock("@/lib/telegram", () => ({ notifyPaidOrderTelegram: fake.telegram }));
vi.mock("@/lib/supersedeDrafts", () => ({ supersedeDraftsFor: vi.fn() }));
vi.mock("@/lib/pdf/preflight", () => ({ runPreflight: vi.fn().mockResolvedValue({ ok: true, failures: [], warnings: [] }) }));
vi.mock("@/lib/apns", () => ({ apnsConfigured: () => false, sendAdminPush: vi.fn() }));

import { POST as checkout } from "@/app/api/checkout/route";
import { POST as webhook } from "@/app/api/stripe-webhook/route";

const openSession = { status: "open" as const, url: "https://example.test/old", amount_total: 8900 };
const filing = {
  id: "filing_1", status: "DRAFT", stripeSessionId: "cs_old", stripePaymentId: null,
  tier: "budget", taxYears: [2024, 2025], yearData: [], isDiirsp: false,
  user: { id: "user_1", email: "customer@example.test" },
  llcName: "Example LLC", llcEin: "PRIVATE-EIN", llcAddress: "1 Test St", llcCity: "Test",
  llcState: "DE", llcZip: "00000", llcDateIncorporated: "2020-01-01",
  llcBusinessActivity: "Services", llcBusinessCode: "123456", ownerName: "Example Owner",
  ownerAddress: "2 Test St", ownerCountryCitizenship: "GB", ownerCountryTaxResidence: "GB",
  ownerCountryBusiness: "GB", ownerFtin: "PRIVATE-FTIN", ownerItin: "PRIVATE-ITIN",
};

function checkoutRequest() {
  return new Request("https://example.test/api/checkout", {
    method: "POST", body: JSON.stringify({ filingId: filing.id, email: filing.user.email }),
  });
}
function webhookRequest() {
  return new Request("https://example.test/api/stripe-webhook", {
    method: "POST", headers: { "stripe-signature": "fake-signature" }, body: "fake-event",
  });
}
function paidEvent(sessionId = "cs_old") {
  return { type: "checkout.session.completed", data: { object: {
    id: sessionId, metadata: { filingId: filing.id, brand: "form5472prep" },
    payment_status: "paid", amount_total: 8900, currency: "usd", payment_intent: "pi_paid",
  } } };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  fake.telegram.mockResolvedValue(true);
  fake.getOwnedFiling.mockResolvedValue({ ...filing });
  fake.bindFilingToEmail.mockResolvedValue(filing.user);
  fake.findUnique.mockResolvedValue({ ...filing });
  fake.update.mockResolvedValue({});
  fake.updateMany.mockResolvedValue({ count: 1 });
  fake.retrieve.mockResolvedValue({ ...openSession });
  fake.expire.mockResolvedValue({ ...openSession, status: "expired", url: null });
  fake.create.mockResolvedValue({ id: "cs_new", url: "https://example.test/new" });
  fake.constructEvent.mockReturnValue(paidEvent());
  fake.generatePackage.mockResolvedValue({ bytes: new Uint8Array([1]), signatures: [], record: { generatorVersion: "test", commit: "test" } });
  fake.sendEmail.mockResolvedValue({ id: "mail_1" });
});
afterEach(() => vi.restoreAllMocks());

describe("pure session decisions", () => {
  it("reuses only an open session with a matching amount and URL", () => {
    expect(checkoutSessionDecision(openSession, 8900)).toEqual({ action: "reuse", url: openSession.url });
    expect(checkoutSessionDecision(openSession, 15800)).toEqual({ action: "expire" });
    expect(checkoutSessionDecision({ ...openSession, url: null }, 8900)).toEqual({ action: "expire" });
    expect(checkoutSessionDecision({ ...openSession, status: "expired" }, 8900)).toEqual({ action: "create" });
    expect(checkoutSessionDecision({ ...openSession, status: "complete" }, 8900)).toEqual({ action: "processing" });
  });

  it("treats a missing or different current session as superseded", () => {
    expect(isSupersededCheckout("cs_old", "cs_new")).toBe(true);
    expect(isSupersededCheckout("cs_old", null)).toBe(true);
    expect(isSupersededCheckout("cs_old", "cs_old")).toBe(false);
  });

  it("builds an escaped refund email from operational fields only", () => {
    const email = refundAlertEmail("admin@example.test", {
      filingId: "filing_<1>", paidSessionId: "cs_old", amountCents: 8900,
      currency: "usd", paymentIntent: { id: "pi_paid" },
    });
    expect(email.text).toContain("Payment intent: pi_paid");
    expect(email.html).toContain("filing_&lt;1&gt;");
    expect(email.html).not.toContain("filing_<1>");
  });
});

describe("checkout route with fake Stripe", () => {
  it("awaits expiry of the old price before creating and storing the replacement", async () => {
    let finishExpiry!: (session: { status: "expired"; url: null; amount_total: number }) => void;
    let expiryStarted!: () => void;
    const started = new Promise<void>((resolve) => { expiryStarted = resolve; });
    fake.expire.mockImplementation(() => {
      expiryStarted();
      return new Promise((resolve) => { finishExpiry = resolve; });
    });
    const response = checkout(checkoutRequest());
    await Promise.race([started, response]);
    expect(fake.expire).toHaveBeenCalledWith("cs_old");
    expect(fake.create).not.toHaveBeenCalled();
    finishExpiry({ ...openSession, status: "expired", url: null });
    expect((await response).status).toBe(200);
    expect(fake.create).toHaveBeenCalledOnce();
    expect(fake.update).toHaveBeenCalledWith({ where: { id: filing.id }, data: { stripeSessionId: "cs_new" } });
  });

  it.each([8900, 15800])("blocks a completed old session even at amount %i", async (amount_total) => {
    fake.retrieve.mockResolvedValue({ ...openSession, status: "complete", amount_total });
    const response = await checkout(checkoutRequest());
    expect(response.status).toBe(409);
    expect((await response.json()).error).toMatch(/payment is being processed/i);
    expect(fake.expire).not.toHaveBeenCalled();
    expect(fake.create).not.toHaveBeenCalled();
  });

  it("continues checkout and logs when expiry fails and the old session is still open", async () => {
    const error = new Error("Stripe unavailable");
    fake.expire.mockRejectedValue(error);
    expect((await checkout(checkoutRequest())).status).toBe(200);
    expect(fake.retrieve).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("expiry failed"), error);
    expect(fake.create).toHaveBeenCalledOnce();
  });

  it("blocks replacement when payment completes between retrieval and failed expiry", async () => {
    fake.retrieve.mockResolvedValueOnce(openSession).mockResolvedValueOnce({ ...openSession, status: "complete" });
    fake.expire.mockRejectedValue(new Error("Session is no longer open"));
    const response = await checkout(checkoutRequest());
    expect(response.status).toBe(409);
    expect(fake.create).not.toHaveBeenCalled();
  });

  it("blocks replacement if the expiry response reports completion", async () => {
    fake.expire.mockResolvedValue({ ...openSession, status: "complete" });
    expect((await checkout(checkoutRequest())).status).toBe(409);
    expect(fake.create).not.toHaveBeenCalled();
  });

  it("continues after expiry and status-recheck failures", async () => {
    const retrieve = vi.fn().mockResolvedValueOnce(openSession).mockRejectedValueOnce(new Error("offline"));
    const expire = vi.fn().mockRejectedValue(new Error("offline"));
    const warn = vi.fn();
    await expect(preparePreviousCheckout("cs_old", 15800, { retrieve, expire }, warn)).resolves.toEqual({ action: "create" });
    expect(expire).toHaveBeenCalledWith("cs_old");
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("reuses the current matching price without expiring or creating", async () => {
    fake.retrieve.mockResolvedValue({ ...openSession, amount_total: tierInfo(filing.tier).priceCents + multiYearAddonCents(filing.taxYears.length) });
    const response = await checkout(checkoutRequest());
    expect(await response.json()).toEqual({ url: openSession.url });
    expect(fake.expire).not.toHaveBeenCalled();
    expect(fake.create).not.toHaveBeenCalled();
  });

  it("uses a distinct creation key when returning to a previously expired price", async () => {
    fake.retrieve.mockResolvedValue({ ...openSession, status: "expired" });
    await checkout(checkoutRequest());
    fake.getOwnedFiling.mockResolvedValue({ ...filing, stripeSessionId: "cs_intermediate" });
    await checkout(checkoutRequest());
    const firstKey = fake.create.mock.calls[0][1].idempotencyKey;
    const nextKey = fake.create.mock.calls[1][1].idempotencyKey;
    expect(firstKey).not.toBe(nextKey);
  });
});

describe("webhook route with fake mailer", () => {
  beforeEach(() => {
    fake.findUnique.mockResolvedValue({ ...filing, stripeSessionId: "cs_current" });
  });

  it("alerts the admin about the orphaned payment and rejects fulfilment", async () => {
    const response = await webhook(webhookRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, staleSession: true });
    expect(fake.sendEmail).toHaveBeenCalledOnce();
    const email = fake.sendEmail.mock.calls[0][0];
    expect(email.to).toBe("admin@example.test");
    expect(email.subject).toMatch(/^ACTION: refund/);
    for (const value of [filing.id, "cs_old", "8900 USD", "pi_paid"]) {
      expect(email.text).toContain(value);
      expect(email.html).toContain(value);
    }
    for (const taxId of [filing.llcEin, filing.ownerFtin, filing.ownerItin]) {
      expect(JSON.stringify(email)).not.toContain(taxId);
    }
    expect(fake.updateMany).toHaveBeenLastCalledWith({
      where: { id: filing.id, stripePaymentId: "pi_paid" },
      data: { status: "DRAFT", stripePaymentId: null },
    });
    expect(fake.update).not.toHaveBeenCalled();
    expect(fake.generatePackage).not.toHaveBeenCalled();
    expect(fake.sendMagicLinkEmail).not.toHaveBeenCalled();
    expect(fake.sendOrderConfirmationEmail).not.toHaveBeenCalled();
  });

  it.each(["stale", "second"])("acknowledges %s payment without fulfilment even when the mailer fails", async (kind) => {
    if (kind === "second") {
      fake.updateMany.mockResolvedValue({ count: 0 });
      fake.findUnique.mockResolvedValue({ ...filing, stripePaymentId: "pi_first" });
    }
    const error = new Error("Mail offline");
    fake.sendEmail.mockRejectedValue(error);
    const response = await webhook(webhookRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(kind === "stale"
      ? { received: true, staleSession: true } : { received: true, deduplicated: true });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("refund alert email failed"), error);
    expect(fake.update).not.toHaveBeenCalled();
    expect(fake.generatePackage).not.toHaveBeenCalled();
    expect(fake.sendOrderConfirmationEmail).not.toHaveBeenCalled();
  });

  it.each(["pi_second", { id: "pi_second" }])("alerts for a distinct second payment %j without fulfilling again", async (paymentIntent) => {
    fake.updateMany.mockResolvedValue({ count: 0 });
    fake.findUnique.mockResolvedValue({ ...filing, status: "PAID", stripePaymentId: "pi_first" });
    const event = paidEvent("cs_second");
    fake.constructEvent.mockReturnValue({ ...event, data: { object: { ...event.data.object, payment_intent: paymentIntent } } });
    const response = await webhook(webhookRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, deduplicated: true });
    expect(fake.sendEmail).toHaveBeenCalledOnce();
    expect(fake.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "admin@example.test", subject: expect.stringMatching(/^ACTION: refund/),
      text: expect.stringContaining("Payment intent: pi_second"),
    }));
    expect(fake.updateMany).toHaveBeenCalledOnce();
    expect(fake.update).not.toHaveBeenCalled();
    expect(fake.generatePackage).not.toHaveBeenCalled();
    expect(fake.putPdf).not.toHaveBeenCalled();
    expect(fake.sendOrderConfirmationEmail).not.toHaveBeenCalled();
    expect(fake.sendMagicLinkEmail).not.toHaveBeenCalled();
    expect(fake.sendNewOrderAdminEmail).not.toHaveBeenCalled();
  });

  it.each(["pi_paid", { id: "pi_paid" }])("silently acknowledges same-payment redelivery %j", async (paymentIntent) => {
    fake.updateMany.mockResolvedValue({ count: 0 });
    fake.findUnique.mockResolvedValue({ ...filing, status: "PAID", stripePaymentId: "pi_paid" });
    const event = paidEvent();
    fake.constructEvent.mockReturnValue({ ...event, data: { object: { ...event.data.object, payment_intent: paymentIntent } } });
    const response = await webhook(webhookRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, deduplicated: true, telegramDelivered: true });
    expect(fake.sendEmail).not.toHaveBeenCalled();
    expect(fake.updateMany).toHaveBeenCalledOnce();
    expect(fake.update).not.toHaveBeenCalled();
    expect(fake.generatePackage).not.toHaveBeenCalled();
    expect(fake.sendOrderConfirmationEmail).not.toHaveBeenCalled();
    // Prove this is payment-identity deduplication: a different payment alerts.
    fake.constructEvent.mockReturnValue({ ...event, data: { object: { ...event.data.object, payment_intent: "pi_second" } } });
    expect((await webhook(webhookRequest())).status).toBe(200);
    expect(fake.sendEmail).toHaveBeenCalledOnce();
  });

  it("fulfils the current session and sends no refund alert", async () => {
    fake.constructEvent.mockReturnValue(paidEvent("cs_current"));
    const response = await webhook(webhookRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, telegramDelivered: true });
    expect(fake.sendEmail).not.toHaveBeenCalled();
    expect(fake.updateMany).toHaveBeenCalledOnce();
    expect(fake.update).toHaveBeenCalledWith({ where: { id: filing.id }, data: { amountPaid: 8900 } });
    expect(fake.generatePackage).toHaveBeenCalledOnce();
    expect(fake.sendOrderConfirmationEmail).toHaveBeenCalledOnce();
  });
});
