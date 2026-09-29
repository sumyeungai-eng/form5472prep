type CheckoutSession = {
  status: "open" | "complete" | "expired" | null;
  url: string | null;
  amount_total: number | null;
};

type CheckoutDecision =
  | { action: "reuse"; url: string }
  | { action: "processing" }
  | { action: "expire" }
  | { action: "create" };

export function checkoutSessionDecision(session: CheckoutSession, expectedCents: number): CheckoutDecision {
  if (session.status === "complete") return { action: "processing" };
  if (session.status !== "open") return { action: "create" };
  if (session.url && session.amount_total === expectedCents) {
    return { action: "reuse", url: session.url };
  }
  return { action: "expire" };
}

// Stripe is injected so expiry ordering and completion races can be tested
// without making a payment or contacting Stripe.
export async function preparePreviousCheckout(
  oldId: string,
  expectedCents: number,
  sessions: {
    retrieve: (id: string) => Promise<CheckoutSession>;
    expire: (id: string) => Promise<CheckoutSession>;
  },
  warn: (message: string, error: unknown) => void,
): Promise<Exclude<CheckoutDecision, { action: "expire" }>> {
  let previous: CheckoutSession;
  try {
    previous = await sessions.retrieve(oldId);
  } catch (error) {
    warn("[checkout] existing Stripe session could not be retrieved", error);
    return { action: "create" };
  }
  const decision = checkoutSessionDecision(previous, expectedCents);
  if (decision.action !== "expire") return decision;

  try {
    const expired = await sessions.expire(oldId);
    if (expired.status === "complete") return { action: "processing" };
  } catch (error) {
    warn("[checkout] previous Stripe session expiry failed", error);
    // The customer may have paid between retrieval and expiry. Stripe rejects
    // expiry of completed sessions; retrieve its authoritative status again.
    try {
      const latest = await sessions.retrieve(oldId);
      if (latest.status === "complete") return { action: "processing" };
    } catch (retrieveError) {
      warn("[checkout] previous Stripe session status recheck failed", retrieveError);
    }
  }
  return { action: "create" };
}

export function isSupersededCheckout(paidSessionId: string, currentSessionId: string | null): boolean {
  return paidSessionId !== currentSessionId;
}

type OrphanedPayment = {
  filingId: string;
  paidSessionId: string;
  amountCents: number | null;
  currency: string | null;
  paymentIntent: string | { id: string } | null;
};

export function refundAlertEmail(adminEmail: string, payment: OrphanedPayment) {
  // Deliberately enumerate operational identifiers. Never serialize the filing
  // or Stripe payload: either can carry customer tax IDs or other private data.
  const text = [
    "A superseded Checkout session or second distinct payment was received. Fulfilment was rejected; review and refund this charge.",
    `Filing: ${payment.filingId}`,
    `Paid session: ${payment.paidSessionId}`,
    `Amount (minor units): ${payment.amountCents ?? "unknown"} ${(payment.currency ?? "unknown").toUpperCase()}`,
    `Payment intent: ${typeof payment.paymentIntent === "string" ? payment.paymentIntent : payment.paymentIntent?.id ?? "unknown"}`,
  ].join("\n");
  const escaped = text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
  return {
    to: adminEmail,
    subject: `ACTION: refund — superseded checkout ${payment.paidSessionId}`,
    text,
    html: `<pre>${escaped}</pre>`,
  };
}

export async function sendSupersededCheckoutAlert(
  adminEmail: string,
  payment: OrphanedPayment,
  sendEmail: (email: ReturnType<typeof refundAlertEmail>) => Promise<unknown>,
  logError: (message: string, error: unknown) => void,
): Promise<void> {
  try {
    await sendEmail(refundAlertEmail(adminEmail, payment));
  } catch (error) {
    // A mail outage must not change Stripe's acknowledgement or fulfilment.
    logError("[stripe-webhook] ACTION: refund alert email failed", error);
  }
}
