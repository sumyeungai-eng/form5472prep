import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  extensionApplication: { findUnique: vi.fn(), update: vi.fn() },
  einApplication: { findUnique: vi.fn(), update: vi.fn() },
  itinApplication: { findUnique: vi.fn(), update: vi.fn() },
}));
const branded = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/env", () => ({ env: { appUrl: "https://www.form5472prep.com" } }));
vi.mock("@/lib/stripe", () => ({ stripe: () => ({ checkout: { sessions: { create: vi.fn() } } }) }));
vi.mock("@/lib/stripeCheckoutBranding", () => ({ createBrandedSession: branded }));

import { POST } from "./route";

const checkout = (type: string, applicationId = "ext1") =>
  POST(
    new Request(`https://example.com/api/applications/${type}/checkout`, { method: "POST", body: JSON.stringify({ applicationId }) }),
    { params: { type } },
  );

beforeEach(() => {
  vi.clearAllMocks();
  db.extensionApplication.findUnique.mockResolvedValue({ id: "ext1", email: "owner@example.com", stripePaymentId: null });
  branded.mockResolvedValue({ id: "cs_ext", url: "https://checkout.stripe.com/c/cs_ext" });
});

describe("Form 7004 extension checkout", () => {
  it("charges EXTENSION_PRICE_CENTS (7900) and returns to the 7004 apply page", async () => {
    const res = await checkout("extension");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: "https://checkout.stripe.com/c/cs_ext" });

    const [params, options] = branded.mock.calls[0];
    expect(params.line_items[0].price_data.unit_amount).toBe(7900);
    expect(params.line_items[0].price_data.product_data.name).toBe("Form 7004 extension filing");
    expect(params.metadata).toEqual({ applicationType: "extension", applicationId: "ext1" });
    expect(params.customer_email).toBe("owner@example.com");
    expect(params.success_url).toBe("https://www.form5472prep.com/form-7004-extension/apply?paid=1");
    expect(params.cancel_url).toBe("https://www.form5472prep.com/form-7004-extension/apply?canceled=1");
    expect(options).toEqual({ idempotencyKey: "appcheckout_v3_extension_ext1" });
    expect(db.extensionApplication.update).toHaveBeenCalledWith({ where: { id: "ext1" }, data: { stripeSessionId: "cs_ext" } });
    expect(db.einApplication.findUnique).not.toHaveBeenCalled();
  });

  it("refuses a second payment for an already-paid order", async () => {
    db.extensionApplication.findUnique.mockResolvedValue({ id: "ext1", email: "owner@example.com", stripePaymentId: "pi_1" });
    expect((await checkout("extension")).status).toBe(409);
    expect(branded).not.toHaveBeenCalled();
  });

  it("refuses a tax year whose Form 7004 deadline has passed, but allows an unknown year", async () => {
    db.extensionApplication.findUnique.mockResolvedValue({ id: "ext1", email: "owner@example.com", stripePaymentId: null, taxYear: 2018 });
    const res = await checkout("extension");
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain("deadline for tax year 2018 has passed");
    expect(branded).not.toHaveBeenCalled();

    db.extensionApplication.findUnique.mockResolvedValue({ id: "ext1", email: "owner@example.com", stripePaymentId: null, taxYear: null });
    expect((await checkout("extension")).status).not.toBe(409);
  });

  it("keeps EIN pricing and return URLs unchanged", async () => {
    db.einApplication.findUnique.mockResolvedValue({ id: "ein1", email: "owner@example.com", stripePaymentId: null });
    await checkout("ein", "ein1");
    const [params] = branded.mock.calls[0];
    expect(params.line_items[0].price_data.unit_amount).toBe(14900);
    expect(params.success_url).toBe("https://www.form5472prep.com/ein/apply?paid=1");
  });

  it("404s an unknown application type", async () => {
    expect((await checkout("boi")).status).toBe(404);
  });
});
