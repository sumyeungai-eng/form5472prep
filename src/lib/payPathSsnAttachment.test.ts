import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// SSN capture (security review fix 1): a package that prints the owner's SSN
// is never attached to the order-confirmation email on the payment paths
// (Stripe webhook, admin $0 test checkout). Payment, storage, pre-flight and
// the admin "PDF generated" flag are unchanged. Harness mirrors
// checkoutSessions.test.ts. No real SSN — the ciphertext is a placeholder.

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
vi.mock("@/lib/session", () => ({
  getOwnedFiling: fake.getOwnedFiling,
  bindFilingToEmail: fake.bindFilingToEmail,
  FilingAccessLostError: class extends Error {},
}));
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

const filing = {
  id: "filing_1", status: "DRAFT", stripeSessionId: "cs_1", stripePaymentId: null,
  tier: "standard", taxYears: [2025], yearData: [], isDiirsp: false, faxService: true,
  user: { id: "user_1", email: "customer@example.test" },
  llcName: "Example LLC", llcEin: "00-0000000", llcAddress: "1 Test St", llcCity: "Test",
  llcState: "DE", llcZip: "00000", llcCountry: "USA", llcDateIncorporated: "2020-01-01",
  llcBusinessActivity: "Services", llcBusinessCode: "123456", ownerName: "Example Owner",
  ownerAddress: "2 Test St", ownerCountryCitizenship: "GB", ownerCountryTaxResidence: "GB",
  ownerCountryBusiness: "GB", ownerFtin: "GB-FTIN", ownerItin: null,
  ownerSsnCiphertext: null as string | null,
  marketingConsent: false, isFinalReturn: false, dissolvedAt: null,
  extensionFiled: null, extensionTransmittedAt: null, funnelSource: null, amountPaid: 14900,
};
const PDF = new Uint8Array([37, 80, 68, 70]);
const SIGNATURES = [{ page: 1, x: 1, y: 1 }];

function webhookRequest() {
  return new Request("https://example.test/api/stripe-webhook", {
    method: "POST", headers: { "stripe-signature": "fake-signature" }, body: "fake-event",
  });
}
function checkoutRequest() {
  return new Request("https://example.test/api/checkout", {
    method: "POST", body: JSON.stringify({ filingId: filing.id, email: filing.user.email }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  fake.telegram.mockResolvedValue(true);
  fake.update.mockResolvedValue({});
  fake.updateMany.mockResolvedValue({ count: 1 });
  fake.bindFilingToEmail.mockResolvedValue(filing.user);
  fake.constructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: {
    id: "cs_1", metadata: { filingId: filing.id }, payment_status: "paid",
    amount_total: 14900, currency: "usd", payment_intent: "pi_1",
  } } });
  fake.generatePackage.mockResolvedValue({ bytes: PDF, signatures: SIGNATURES, record: { generatorVersion: "t", commit: "t" } });
});
afterEach(() => vi.restoreAllMocks());

describe.each([
  ["Stripe webhook", "standard", () => webhook(webhookRequest())],
  ["$0 test checkout", "test", () => checkout(checkoutRequest())],
])("%s: order confirmation attachment", (_name, tier, run) => {
  function seed(ownerSsnCiphertext: string | null) {
    const row = { ...filing, tier, ownerSsnCiphertext };
    fake.findUnique.mockResolvedValue(row);
    fake.getOwnedFiling.mockResolvedValue(row);
  }

  it("attaches the package when no SSN is on file", async () => {
    seed(null);
    expect((await run()).status).toBe(200);
    expect(fake.sendOrderConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ pdfBytes: PDF, signatures: SIGNATURES }),
    );
  });

  it("sends the confirmation WITHOUT the package when an SSN is on file; storage and admin flag unchanged", async () => {
    seed("v1:placeholder:placeholder:placeholder");
    expect((await run()).status).toBe(200);
    expect(fake.sendOrderConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ pdfBytes: null, signatures: [] }),
    );
    expect(fake.putPdf).toHaveBeenCalledWith("filing_1_unsigned.pdf", PDF);
    expect(fake.sendNewOrderAdminEmail).toHaveBeenCalledWith(expect.objectContaining({ pdfGenerated: true }));
  });
});
