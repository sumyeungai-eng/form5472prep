import Stripe from "stripe";
import { env } from "@/lib/env";

type SessionCreateParams = NonNullable<Parameters<Stripe["checkout"]["sessions"]["create"]>[0]>;
type BrandingSettings = NonNullable<SessionCreateParams["branding_settings"]>;
type CustomText = NonNullable<SessionCreateParams["custom_text"]>;
type CheckoutSession = Awaited<ReturnType<Stripe["checkout"]["sessions"]["create"]>>;
type StripeInvalidRequestError = InstanceType<typeof Stripe.errors.StripeInvalidRequestError>;

export const CHECKOUT_BRAND = {
  displayName: "Form5472 Prep",
  buttonColor: "#1e3a8a",
  backgroundColor: "#ffffff",
  fontFamily: "inter",
  borderStyle: "rounded",
} as const;

const BRANDING_ERROR_FIELDS = ["branding_settings", "logo", "icon", "custom_text"];

export function brandingSettings(appUrl: string): BrandingSettings {
  return {
    display_name: CHECKOUT_BRAND.displayName,
    logo: { type: "url", url: `${appUrl}/brand/checkout-logo.png` },
    icon: { type: "url", url: `${appUrl}/brand/checkout-icon.png` },
    button_color: CHECKOUT_BRAND.buttonColor,
    background_color: CHECKOUT_BRAND.backgroundColor,
    font_family: CHECKOUT_BRAND.fontFamily,
    border_style: CHECKOUT_BRAND.borderStyle,
  };
}

export function checkoutCustomText(): CustomText {
  return {
    submit: {
      message:
        "Every filing is reviewed by a qualified accountant before it is submitted. You sign only after the review.",
    },
  };
}

function mentionsBrandingField(error: StripeInvalidRequestError): boolean {
  const message = error.message.toLowerCase();
  const param = (error.param ?? "").toLowerCase();
  return BRANDING_ERROR_FIELDS.some((field) => message.includes(field) || param.includes(field));
}

export async function createBrandedSession(
  params: SessionCreateParams,
  options: Stripe.RequestOptions | undefined,
  create: (
    params: SessionCreateParams,
    options?: Stripe.RequestOptions,
  ) => Promise<CheckoutSession>,
): Promise<CheckoutSession> {
  const brandedParams: SessionCreateParams = {
    ...params,
    branding_settings: brandingSettings(env.appUrl),
    // A caller-supplied note wins (the EIN/ITIN checkout has its own wording).
    custom_text: params.custom_text ?? checkoutCustomText(),
    locale: "auto",
  };

  try {
    return await create(brandedParams, options);
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      mentionsBrandingField(error)
    ) {
      console.warn(
        "[checkout] Stripe rejected checkout branding settings, retrying once with the original unbranded session params",
        error,
      );
      const retryOptions = options?.idempotencyKey
        ? { ...options, idempotencyKey: `${options.idempotencyKey}_plain` }
        : options;
      return create(params, retryOptions);
    }
    throw error;
  }
}
