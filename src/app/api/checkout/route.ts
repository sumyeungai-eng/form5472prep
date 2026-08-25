import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { MULTI_YEAR_ADDON_CENTS, MULTI_YEAR_ADDON_LABEL, multiYearAddonCents, tierInfo, isTestTier, resolveTier, promoDiscountCents, PROMO_LABEL } from "@/lib/pricing";
import { generatePackage, type SignatureLocation } from "@/lib/pdf/generatePackage";
import { putPdf } from "@/lib/storage";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";
import { effectiveDueDateUtc, formatDueDate } from "@/lib/schemas";
import { filingCompletionIssues, requiresReasonableCause } from "@/lib/completeness";

export async function POST(req: Request) {
  const { filingId, email } = await req.json();
  if (typeof email !== "string" || !email.includes("@"))
    return NextResponse.json({ error: "Email required" }, { status: 400 });

  const filing = await getOwnedFiling(filingId);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (filing.status !== "DRAFT")
    return NextResponse.json({ error: "Already paid" }, { status: 409 });

  const filingYearData = await prisma.filing.findUnique({
    where: { id: filing.id },
    select: { yearData: true },
  });
  const yearDataRows = filingYearData?.yearData ?? [];

  // Completeness gate — the desktop sidebar lets a user jump straight to Review,
  // so refuse to charge for an incomplete filing (which would otherwise pay,
  // skip PDF generation, and strand them in PAID with no product). The rules
  // live in @/lib/completeness so the admin drafts view can flag exactly the
  // drafts this gate would accept.
  const completionIssues = filingCompletionIssues(
    filing,
    yearDataRows.map((yearData) => yearData.taxYear),
  );
  if (completionIssues.length > 0) {
    return NextResponse.json(
      { error: "Filing is incomplete — please finish all steps before paying.", issues: completionIssues },
      { status: 400 },
    );
  }

  // Tier is pre-selected at /pricing (or /start?tier=), changeable by the
  // customer on the wizard's Review step, and stored on Filing.tier. Standard
  // and Express are identical packages at different turnarounds, so the tier
  // only moves the base price. Fax delivery is bundled into every tier —
  // there's no separate add-on line item anymore. Multi-year filings add a
  // flat per-extra-year charge on either tier.
  const tier = tierInfo(filing.tier);
  const yearCount = filing.taxYears.length || 1;
  const extraYears = Math.max(0, yearCount - 1);

  // Final list total: tier base + multi-year add-on...
  const expectedTotalCents = tier.priceCents + multiYearAddonCents(yearCount);
  // ...and the promotion taken off it. Decided SERVER-SIDE from the filing's
  // own funnelSource (the landing page the customer actually arrived through,
  // persisted at draft creation) — never from anything in this request body.
  // Computed here, ahead of the session-reuse check below, because the amount
  // is what decides whether an existing session is still the right one.
  const discountCents = promoDiscountCents(filing.funnelSource, expectedTotalCents);
  const expectedChargeCents = expectedTotalCents - discountCents;

  // ─── Re-pin the stored classification BEFORE anything can return early ───
  // Fax delivery is included on every tier — pin faxService=true so post-
  // payment UI + admin views never branch into the legacy "self-fax" path.
  //
  // The same update re-pins isDiirsp when the live verdict disagrees with what
  // the wizard last stored. The completeness gate above already refuses to
  // charge on the FRESH classification, but everything downstream of payment
  // (Stripe webhook, PDF generation, the emails) reads the stored column — so a
  // draft that went delinquent while it sat, or one that a Form 7004 answer
  // just rescued, would otherwise produce a package classified by a stale flag.
  //
  // ORDER IS LOAD-BEARING: this must run on EVERY checkout attempt, including
  // the session-reuse short-circuit below. When it sat after that `return`, a
  // draft that crossed its deadline between two checkout attempts reused the
  // old Stripe session and paid carrying the stale classification — the fresh
  // verdict never reached the database, so the package was built (and the
  // reasonable-cause statement omitted) on the wizard's obsolete answer.
  const freshIsDiirsp = requiresReasonableCause(filing);
  await prisma.filing.update({
    where: { id: filing.id },
    data: {
      faxService: true,
      ...(freshIsDiirsp !== filing.isDiirsp ? { isDiirsp: freshIsDiirsp } : {}),
    },
  });

  // Idempotency — if a still-open Stripe session already exists for this filing
  // (double-click / retried request), reuse it instead of minting a second
  // payable session that could double-charge the customer.
  //
  // ONLY when its amount still matches what this request would charge. The
  // customer can abandon Checkout (cancel_url drops them back in the wizard),
  // switch Standard ⇄ Express or add a tax year, and come back — reusing the
  // stale session would then bill them the OLD plan's price while the wizard
  // and the confirmation email say otherwise. A price mismatch falls through
  // to create a fresh session; the create below is itself idempotent on
  // (filing, tier price, year count, discount), so that can't double-charge.
  if (!isTestTier(filing.tier) && filing.stripeSessionId) {
    try {
      const existingSession = await stripe().checkout.sessions.retrieve(filing.stripeSessionId);
      if (
        existingSession.status === "open" &&
        existingSession.url &&
        existingSession.amount_total === expectedChargeCents
      ) {
        return NextResponse.json({ url: existingSession.url });
      }
      if (existingSession.status === "open" && existingSession.amount_total !== expectedChargeCents) {
        console.log(
          "[checkout] existing session priced at", existingSession.amount_total,
          "but this order is", expectedChargeCents, "— creating a new session. filing:", filing.id,
        );
      }
    } catch (err) {
      console.warn("[checkout] existing Stripe session could not be reused", err);
    }
  }

  // Bind the filing to the email before payment so the Stripe webhook can
  // look up the user and email the magic link even if the cookie is lost.
  const user = await bindFilingToEmail(filing.id, email);

  // ─── Admin-only $0 test path ───
  // Skip Stripe entirely. Mark PAID, generate the PDF inline (mirroring the
  // production Stripe webhook), and send the order-confirmation email with
  // the PDF + sign link. No AI compliance check — the accountant reviews
  // the package before fax, same as real orders.
  if (isTestTier(filing.tier)) {
    await prisma.filing.update({
      where: { id: filing.id },
      data: { status: "PAID", stripePaymentId: "test_no_payment" },
    });

    // Refetch with yearData + user so we have everything generatePackage +
    // sendOrderConfirmationEmail need.
    const full = await prisma.filing.findUnique({
      where: { id: filing.id },
      include: { user: true, yearData: true },
    });

    let pdfBytes: Uint8Array | null = null;
    let pdfSignatures: SignatureLocation[] = [];
    try {
      if (full && full.llcName && full.llcEin && full.llcAddress && full.llcCity &&
          full.llcState && full.llcZip && full.llcDateIncorporated &&
          full.llcBusinessActivity && full.llcBusinessCode && full.ownerName &&
          full.ownerAddress && full.ownerCountryCitizenship &&
          full.ownerCountryTaxResidence && full.ownerCountryBusiness && full.ownerFtin) {
        const result = await generatePackage({
          llcName: full.llcName, llcEin: full.llcEin, llcAddress: full.llcAddress,
          llcCity: full.llcCity, llcState: full.llcState, llcZip: full.llcZip,
          llcCountry: full.llcCountry, llcDateIncorporated: full.llcDateIncorporated,
          llcBusinessActivity: full.llcBusinessActivity, llcBusinessCode: full.llcBusinessCode,
          ownerName: full.ownerName, ownerAddress: full.ownerAddress,
          ownerCountryCitizenship: full.ownerCountryCitizenship,
          ownerCountryTaxResidence: full.ownerCountryTaxResidence,
          ownerCountryBusiness: full.ownerCountryBusiness, ownerFtin: full.ownerFtin,
          ownerItin: full.ownerItin, ownerReferenceId: full.ownerReferenceId,
          taxYears: full.taxYears, isDiirsp: full.isDiirsp,
          isFinalReturn: full.isFinalReturn,
          dissolvedAt: full.dissolvedAt,
          reasonableCauseNarrative: full.reasonableCauseNarrative,
          // The Form 7004 facts decide the deadline the package prints (and
          // whether it reads as extended rather than delinquent). Every other
          // generatePackage call site passes them; this one used to be the sole
          // omission, so an admin test order silently rendered an extended
          // filer's package on the unextended April 15 deadline.
          extensionFiled: full.extensionFiled,
          extensionTransmittedAt: full.extensionTransmittedAt,
          yearData: full.yearData.map((y) => ({
            taxYear: y.taxYear,
            totalAssetsYearEnd: Number(y.totalAssetsYearEnd),
            contributions: Number(y.contributions),
            distributions: Number(y.distributions),
            otherTransactionsNote: y.otherTransactionsNote,
            reportableTransactions: Array.isArray(y.reportableTransactions)
              ? (y.reportableTransactions as unknown[]).filter(
                  (t): t is { date: string; description: string; counterparty?: string; amountCents: number; category: string } =>
                    !!t && typeof t === "object" && "date" in t && "amountCents" in t && "category" in t,
                )
              : [],
          })),
        });
        pdfBytes = result.bytes;
        pdfSignatures = result.signatures;
        const key = `${filing.id}_unsigned.pdf`;
        await putPdf(key, result.bytes);
        await prisma.filing.update({
          where: { id: filing.id },
          data: { generatedPdfKey: key, status: "PDF_GENERATED" },
        });
      } else {
        console.warn("[checkout test] PDF generation skipped — required fields missing");
      }
    } catch (err) {
      console.error("[checkout test] PDF generation failed", err);
    }

    if (full?.user) {
      try {
        await sendOrderConfirmationEmail({
          email: full.user.email,
          filingId: full.id,
          llcName: full.llcName,
          taxYears: full.taxYears,
          tier: resolveTier(full.tier).tier,
          amountPaidCents: 0,
          faxService: full.faxService,
          portalLink: makeMagicLink(full.user.id),
          receiptUrl: null,
          funnelSource: full.funnelSource,
          pdfBytes,
          signatures: pdfSignatures,
          // Keep admin test orders identical to real ones: final returns get
          // the EIN-cancellation warning + deadline line.
          isFinalReturn: full.isFinalReturn,
          // effectiveDueDateUtc, NOT filingDueDateUtc: a validly-extended filer's
          // deadline is the ORIGINAL date plus six months, so the raw statutory
          // date would tell them April 15 when they actually have until
          // October 15 — a date wrong in the direction that makes them panic
          // (or, on a short year, act on a deadline that isn't theirs).
          dueDateText:
            full.taxYears.length > 0
              ? formatDueDate(
                  effectiveDueDateUtc(
                    Math.max(...full.taxYears),
                    full.isFinalReturn ? full.dissolvedAt : null,
                    {
                      filed: full.extensionFiled,
                      transmittedAt: full.extensionTransmittedAt,
                    },
                  ),
                )
              : null,
        });
      } catch (err) {
        console.error("[checkout test] order confirmation email failed", err);
      }
    }
    // Admin notification — same as the real Stripe webhook path, marked as
    // a test order so the operator can ignore it when triaging real orders.
    try {
      await sendNewOrderAdminEmail({
        adminEmail: env.adminEmail,
        customerEmail: full?.user?.email ?? null,
        llcName: full?.llcName ?? null,
        taxYears: full?.taxYears ?? [],
        filingId: filing.id,
        adminFilingUrl: `${env.appUrl}/admin/filings/${filing.id}`,
        tier: resolveTier(filing.tier).tier,
        amountPaidCents: 0,
        isTestOrder: true,
        pdfGenerated: !!pdfBytes,
      });
    } catch (err) {
      console.error("[checkout test] admin new-order email failed", err);
    }
    return NextResponse.json({ url: `${env.appUrl}/filings/${filing.id}?paid=1` });
  }

  const lineItems = [
    {
      price_data: {
        currency: "usd" as const,
        unit_amount: tier.priceCents,
        product_data: {
          name: `Form5472 Prep — ${tier.label}`,
          // The turnaround is the ONLY thing the tier buys, so it has to be on
          // the Checkout page and the receipt — otherwise an Express customer
          // has nothing on paper saying what the extra $50 was for.
          description: `Filing for ${filing.llcName ?? "your LLC"} — ${filing.taxYears.join(", ") || "tax year"} · ${tier.subtitle} (IRS fax delivery included)`,
        },
      },
      quantity: 1,
    },
  ];
  if (extraYears > 0) {
    lineItems.push({
      price_data: {
        currency: "usd" as const,
        unit_amount: MULTI_YEAR_ADDON_CENTS,
        product_data: {
          name: MULTI_YEAR_ADDON_LABEL,
          description: `Each additional past tax year beyond the first (${extraYears} × $${(MULTI_YEAR_ADDON_CENTS / 100).toFixed(0)}).`,
        },
      },
      quantity: extraYears,
    });
  }
  // ─── Launch promotion ───
  // expectedTotalCents / discountCents were computed above (the session-reuse
  // check needs them). line_items above stay at FULL list price and the
  // reduction rides as a Stripe coupon, so the customer sees the list price
  // and a separate "−$50" on the Checkout page and on their receipt.
  let discounts: Array<{ coupon: string }> | undefined;
  if (discountCents > 0) {
    // Deterministic coupon id, keyed on the amount off. The promotion is a
    // FLAT $50 off the base fee (PROMO_DISCOUNT_CENTS) on either tier — not a
    // percentage of the order — so in practice exactly one coupon object
    // (f5472_promo50_5000) ever exists in the Stripe account. Keying on the
    // amount rather than hardcoding the id keeps that true if the figure is
    // ever retuned, without stamping a new amount onto the old coupon.
    const couponId = `f5472_promo50_${discountCents}`;
    try {
      try {
        await stripe().coupons.retrieve(couponId);
      } catch {
        await stripe().coupons.create({
          id: couponId,
          amount_off: discountCents,
          currency: "usd",
          duration: "once",
          name: PROMO_LABEL,
        });
      }
    } catch (err) {
      // NEVER fall through to full price here. The customer was shown the
      // discounted figure on the landing page and in the wizard; charging them
      // list price instead is a chargeback and an ad-policy violation. Fail the
      // request loudly instead.
      console.error("[checkout] promo coupon setup failed — refusing to charge full price", err);
      return NextResponse.json(
        { error: "We couldn't apply your discount. Nothing has been charged — please try again." },
        { status: 500 },
      );
    }
    discounts = [{ coupon: couponId }];
  }
  console.log(
    "[checkout] list total cents:", expectedTotalCents,
    "discount:", discountCents,
    "charged:", expectedTotalCents - discountCents,
    "filing:", filing.id,
  );

  const session = await stripe().checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: lineItems,
      // `discounts` and `allow_promotion_codes` are mutually exclusive in
      // Stripe — only ever set one of them (we never set the latter).
      ...(discounts ? { discounts } : {}),
      success_url: `${env.appUrl}/filings/${filing.id}?paid=1`,
      cancel_url: `${env.appUrl}/filings/${filing.id}/edit`,
      metadata: { filingId: filing.id, userId: user.id },
    },
    // Idempotency key scoped to the filing + its priced inputs (discount
    // included, so a promo and non-promo session for the same filing can never
    // collide) — a retried identical create returns the same session instead of
    // a second one.
    { idempotencyKey: `checkout_${filing.id}_${tier.priceCents}_${yearCount}_${discountCents}` },
  );

  await prisma.filing.update({
    where: { id: filing.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
