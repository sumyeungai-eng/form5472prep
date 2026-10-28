import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { EIN_PRICE_CENTS, EXTENSION_PRICE_CENTS, ITIN_PRICE_CENTS } from "@/lib/pricing";
import { stripe } from "@/lib/stripe";
import { createBrandedSession } from "@/lib/stripeCheckoutBranding";
import { openExtensionTaxYears } from "@/lib/form7004";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApplicationType = "ein" | "itin" | "extension";
type CheckoutApplication = {
  id: string;
  email: string;
  stripePaymentId: string | null;
  taxYear?: number | null;
};

function applicationType(value: string): ApplicationType | null {
  if (value === "ein" || value === "itin" || value === "extension") return value;
  return null;
}

function checkoutBody(input: unknown): { applicationId: string } | null {
  if (typeof input !== "object" || input === null) return null;
  const { applicationId } = input as { applicationId?: unknown };
  return typeof applicationId === "string" && applicationId ? { applicationId } : null;
}

async function findApplication(type: ApplicationType, id: string): Promise<CheckoutApplication | null> {
  if (type === "extension") {
    return prisma.extensionApplication.findUnique({
      where: { id },
      select: { id: true, email: true, stripePaymentId: true, taxYear: true },
    });
  }
  if (type === "ein") {
    return prisma.einApplication.findUnique({
      where: { id },
      select: { id: true, email: true, stripePaymentId: true },
    });
  }
  return prisma.itinApplication.findUnique({
    where: { id },
    select: { id: true, email: true, stripePaymentId: true },
  });
}

async function saveStripeSessionId(type: ApplicationType, id: string, stripeSessionId: string) {
  if (type === "extension") {
    await prisma.extensionApplication.update({
      where: { id },
      data: { stripeSessionId },
    });
    return;
  }
  if (type === "ein") {
    await prisma.einApplication.update({
      where: { id },
      data: { stripeSessionId },
    });
    return;
  }
  await prisma.itinApplication.update({
    where: { id },
    data: { stripeSessionId },
  });
}

function applyPath(type: ApplicationType): string {
  return type === "extension" ? "form-7004-extension/apply" : `${type}/apply`;
}

export async function POST(req: Request, { params }: { params: { type: string } }) {
  const type = applicationType(params.type);
  if (!type) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = checkoutBody(await req.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const app = await findApplication(type, body.applicationId);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.stripePaymentId) return NextResponse.json({ error: "Already paid" }, { status: 409 });
  // A Form 7004 filed after the return's due date extends nothing, so never sell a closed year
  // (an unknown year is fine: staff confirm it after payment).
  if (type === "extension" && app.taxYear != null && !openExtensionTaxYears().includes(app.taxYear)) {
    return NextResponse.json(
      { error: `The Form 7004 deadline for tax year ${app.taxYear} has passed, so it can no longer be extended. Please choose another tax year.` },
      { status: 409 },
    );
  }

  const price = type === "extension" ? EXTENSION_PRICE_CENTS : type === "ein" ? EIN_PRICE_CENTS : ITIN_PRICE_CENTS;
  const product =
    type === "extension"
      ? {
          name: "Form 7004 extension filing",
          description: "Form 7004 prepared for your foreign-owned LLC and faxed to the IRS Ogden PIN Unit; we email you the fax confirmation.",
          images: [`${env.appUrl}/brand/product-ein-itin.png`],
        }
      : type === "ein"
      ? {
          name: "EIN application (Form SS-4) preparation",
          description: "Form SS-4 prepared from your answers, reviewed, and submitted to the IRS on your behalf.",
          images: [`${env.appUrl}/brand/product-ein-itin.png`],
        }
      : {
          name: "ITIN application (Form W-7) preparation",
          description: "Form W-7 prepared from your answers and reviewed; we guide you through submission.",
          images: [`${env.appUrl}/brand/product-ein-itin.png`],
        };

  const session = await createBrandedSession(
    {
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: app.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: price,
            product_data: product,
          },
        },
      ],
      success_url: `${env.appUrl}/${applyPath(type)}?paid=1`,
      cancel_url: `${env.appUrl}/${applyPath(type)}?canceled=1`,
      metadata: { applicationType: type, applicationId: app.id },
      custom_text: {
        submit: {
          message: type === "extension"
            ? "Your Form 7004 is prepared from your answers and checked by our team before it is faxed to the IRS."
            : "Your application is prepared from your answers and reviewed by our team before anything is sent.",
        },
      },
    },
    // v2: see src/app/api/checkout/route.ts (keys from before the branded checkout must not be reused).
    { idempotencyKey: `appcheckout_v3_${type}_${app.id}` },
    (p, o) => stripe().checkout.sessions.create(p, o),
  );

  await saveStripeSessionId(type, app.id, session.id);

  if (!session.url) return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
  return NextResponse.json({ url: session.url });
}
