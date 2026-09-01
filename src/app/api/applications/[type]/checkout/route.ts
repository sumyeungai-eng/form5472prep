import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { EIN_PRICE_CENTS, ITIN_PRICE_CENTS } from "@/lib/pricing";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApplicationType = "ein" | "itin";
type CheckoutApplication = {
  id: string;
  email: string;
  stripePaymentId: string | null;
};

function applicationType(value: string): ApplicationType | null {
  if (value === "ein" || value === "itin") return value;
  return null;
}

function checkoutBody(input: unknown): { applicationId: string } | null {
  if (typeof input !== "object" || input === null) return null;
  const { applicationId } = input as { applicationId?: unknown };
  return typeof applicationId === "string" && applicationId ? { applicationId } : null;
}

async function findApplication(type: ApplicationType, id: string): Promise<CheckoutApplication | null> {
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

export async function POST(req: Request, { params }: { params: { type: string } }) {
  const type = applicationType(params.type);
  if (!type) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = checkoutBody(await req.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const app = await findApplication(type, body.applicationId);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.stripePaymentId) return NextResponse.json({ error: "Already paid" }, { status: 409 });

  const price = type === "ein" ? EIN_PRICE_CENTS : ITIN_PRICE_CENTS;
  const product =
    type === "ein"
      ? {
          name: "EIN application (Form SS-4) preparation",
          description: "Preparation support for a U.S. EIN application.",
        }
      : {
          name: "ITIN application (Form W-7) preparation",
          description: "Preparation support for a U.S. ITIN application.",
        };

  const session = await stripe().checkout.sessions.create(
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
      success_url: `${env.appUrl}/${type}/apply?paid=1`,
      cancel_url: `${env.appUrl}/${type}/apply?canceled=1`,
      metadata: { applicationType: type, applicationId: app.id },
    },
    { idempotencyKey: `appcheckout_${type}_${app.id}` },
  );

  await saveStripeSessionId(type, app.id, session.id);

  if (!session.url) return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
  return NextResponse.json({ url: session.url });
}
