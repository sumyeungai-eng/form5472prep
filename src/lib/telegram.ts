import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { tierLabel } from "@/lib/pricing";

export type OrderAlert = {
  id: string;
  service: string;
  customer: string;
  email: string;
  amountCents: number;
  currency: string;
  adminPath: string;
  details?: string;
};

// Plain text prevents customer-supplied names from injecting Telegram markup.
const line = (value: string) => value.replace(/[\r\n\t]/g, " ").slice(0, 300);
export function orderAlertText(order: OrderAlert): string {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency", currency: order.currency.toUpperCase(),
  }).format(order.amountCents / 100);
  return [
    "New paid order — Form5472 Prep",
    `Service: ${line(order.service)}`,
    `Customer / company: ${line(order.customer)}`,
    `Email: ${line(order.email)}`,
    `Paid: ${amount}`,
    order.details ? line(order.details) : null,
    `Order: ${line(order.id)}`,
    `${env.appUrl}${order.adminPath}`,
  ].filter(Boolean).join("\n");
}

// false tells the webhook to request a Stripe retry AFTER normal fulfillment.
// Never log fetch errors or Telegram bodies: they can contain the bot token.
export async function deliverOrderAlert(order: OrderAlert): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return true;
  let leaseUntil: Date | undefined;
  try {
    const state = await prisma.telegramOrderNotification.upsert({
      where: { id: order.id }, create: { id: order.id }, update: {},
    });
    if (state.sentAt) return true;
    const now = new Date();
    leaseUntil = new Date(now.getTime() + 60_000);
    const claim = await prisma.telegramOrderNotification.updateMany({
      where: { id: order.id, sentAt: null, OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }] },
      data: { leaseUntil },
    });
    if (!claim.count) return false;
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: orderAlertText(order), link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    const result = await response.json() as { ok?: boolean };
    if (!response.ok || !result.ok) throw new Error("Telegram rejected notification");
    await prisma.telegramOrderNotification.updateMany({
      where: { id: order.id, leaseUntil },
      data: { sentAt: new Date(), leaseUntil: null },
    });
    return true;
  } catch {
    console.error("[telegram] Order alert failed; Stripe retry requested", { orderId: order.id });
    if (leaseUntil) {
      try {
        await prisma.telegramOrderNotification.updateMany({
          where: { id: order.id, sentAt: null, leaseUntil }, data: { leaseUntil: null },
        });
      } catch { /* The lease expires if the database is unavailable. */ }
    }
    return false;
  }
}

export async function notifyPaidOrderTelegram(session: Stripe.Checkout.Session): Promise<boolean> {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID || !session.livemode) return true;
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return true;
  const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!paymentId) return true;
  try {
    const type = session.metadata?.applicationType;
    const applicationId = session.metadata?.applicationId;
    const amountCents = session.amount_total ?? 0;
    const currency = session.currency ?? "usd";
    if ((type === "ein" || type === "itin") && applicationId) {
      const select = { id: true, fullName: true, email: true, stripePaymentId: true };
      const app = type === "ein"
        ? await prisma.einApplication.findUnique({ where: { id: applicationId }, select: { ...select, llcName: true } })
        : await prisma.itinApplication.findUnique({ where: { id: applicationId }, select });
      if (!app || app.stripePaymentId !== paymentId) return true;
      return deliverOrderAlert({
        id: `${type}:${app.id}`, service: `${type.toUpperCase()} application`,
        customer: "llcName" in app ? String(app.llcName) : app.fullName,
        email: app.email, amountCents, currency,
        adminPath: `/admin/applications/${type}/${app.id}`,
      });
    }
    const filingId = session.metadata?.filingId;
    if (!filingId) return true;
    const filing = await prisma.filing.findUnique({
      where: { id: filingId },
      select: { id: true, stripePaymentId: true, stripeSessionId: true, llcName: true, tier: true, taxYears: true, user: { select: { email: true } } },
    });
    if (!filing || filing.stripePaymentId !== paymentId || filing.stripeSessionId !== session.id) return true;
    return deliverOrderAlert({
      id: `filing:${filing.id}`, service: `Form 5472 — ${tierLabel(filing.tier)}`,
      customer: filing.llcName ?? "New filing", email: filing.user?.email ?? "Not available",
      amountCents, currency, details: `Tax years: ${filing.taxYears.join(", ")}`,
      adminPath: `/admin/filings/${filing.id}`,
    });
  } catch {
    console.error("[telegram] Could not load paid order; Stripe retry requested");
    return false;
  }
}
