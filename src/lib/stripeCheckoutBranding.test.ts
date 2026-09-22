import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import {
  CHECKOUT_BRAND,
  brandingSettings,
  checkoutCustomText,
  createBrandedSession,
} from "./stripeCheckoutBranding";

type SessionCreateParams = NonNullable<Parameters<Stripe["checkout"]["sessions"]["create"]>[0]>;
type CheckoutSession = Awaited<ReturnType<Stripe["checkout"]["sessions"]["create"]>>;

describe("brandingSettings", () => {
  it("returns the Stripe Checkout branding shape", () => {
    const appUrl = "https://www.form5472prep.com";

    expect(brandingSettings(appUrl)).toEqual({
      display_name: CHECKOUT_BRAND.displayName,
      logo: { type: "url", url: `${appUrl}/brand/checkout-logo.png` },
      icon: { type: "url", url: `${appUrl}/brand/checkout-icon.png` },
      button_color: CHECKOUT_BRAND.buttonColor,
      background_color: CHECKOUT_BRAND.backgroundColor,
      font_family: CHECKOUT_BRAND.fontFamily,
      border_style: CHECKOUT_BRAND.borderStyle,
    });
  });
});

describe("checkoutCustomText", () => {
  it("returns plain submit copy under Stripe's limit", () => {
    const customText = checkoutCustomText();
    const submit = customText.submit;

    expect(submit).toBeTruthy();
    expect(typeof submit).toBe("object");
    if (!submit || typeof submit !== "object") throw new Error("Expected submit custom text");

    const message = submit.message;

    expect(message.length).toBeLessThan(1200);
    expect(message).toContain(
      "Every filing is reviewed by a qualified accountant before it is submitted. You sign only after the review.",
    );
    expect(message).not.toMatch(/\[[^\]]+\]\([^)]+\)/);
  });
});

describe("createBrandedSession", () => {
  const params: SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: "customer@example.com",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 14900,
          product_data: {
            name: "Form5472 Prep filing",
          },
        },
      },
    ],
    success_url: "https://www.form5472prep.com/success",
    cancel_url: "https://www.form5472prep.com/cancel",
    metadata: { filingId: "filing_123", userId: "user_123" },
  };

  it("adds branding and locale while preserving the original params on success", async () => {
    const session = { id: "cs_test_123", object: "checkout.session" } as CheckoutSession;
    const create = vi.fn().mockResolvedValue(session);

    await expect(
      createBrandedSession(params, { idempotencyKey: "checkout_123" }, create),
    ).resolves.toBe(session);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      {
        ...params,
        branding_settings: brandingSettings("http://localhost:3000"),
        custom_text: checkoutCustomText(),
        locale: "auto",
      },
      { idempotencyKey: "checkout_123" },
    );
    expect(params).not.toHaveProperty("branding_settings");
    expect(params).not.toHaveProperty("custom_text");
    expect(params).not.toHaveProperty("locale");
  });

  it("retries once with original params and a plain idempotency key when Stripe rejects branding", async () => {
    const brandedError = new Stripe.errors.StripeInvalidRequestError({
      message: "Received unknown parameter: branding_settings",
      param: "branding_settings",
    });
    const session = { id: "cs_test_plain", object: "checkout.session" } as CheckoutSession;
    const create = vi.fn().mockRejectedValueOnce(brandedError).mockResolvedValueOnce(session);

    await expect(
      createBrandedSession(params, { idempotencyKey: "checkout_123" }, create),
    ).resolves.toBe(session);

    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        ...params,
        branding_settings: brandingSettings("http://localhost:3000"),
        custom_text: checkoutCustomText(),
        locale: "auto",
      },
      { idempotencyKey: "checkout_123" },
    );
    expect(create).toHaveBeenNthCalledWith(2, params, { idempotencyKey: "checkout_123_plain" });
  });

  it("rethrows non-branding errors without retrying", async () => {
    const lineItemError = new Stripe.errors.StripeInvalidRequestError({
      message: "Invalid line_items",
      param: "line_items",
    });
    const create = vi.fn().mockRejectedValue(lineItemError);

    await expect(createBrandedSession(params, undefined, create)).rejects.toBe(lineItemError);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
