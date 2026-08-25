import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getFilingAccess, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { FilingActions } from "@/components/wizard/FilingActions";
import { FilingStatusBanner } from "@/components/FilingStatusBanner";
import { FilingLocked } from "@/components/FilingLocked";
import { MessagesPanel } from "@/components/MessagesPanel";
import { PurchaseConversionPing } from "./PurchaseConversionPing";
import { getTiersForSource } from "@/lib/pricing";
import { effectiveDueDateUtc, formatDueDate } from "@/lib/schemas";
import { TrustpilotWidget, TRUSTPILOT_TEMPLATES, REVIEW_COLLECTOR_TOKEN } from "@/components/TrustpilotWidget";

// Statuses where the filing is paid but not yet acknowledged as complete —
// the window in which the customer still cares "will this land before my
// deadline?". DRAFT (unpaid), CONFIRMED (done) and FAILED (different
// conversation entirely) deliberately show nothing.
const DEADLINE_VISIBLE_STATUSES = new Set([
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
]);

// Verify with Stripe — NOT the bare ?paid=1 query param — that the filing's
// Checkout Session actually completed before promoting DRAFT → PAID. The
// stripe-webhook remains the authoritative path; this is only a fallback for
// the brief window where the customer lands back on the page before the
// webhook fires. Returns true only when Stripe reports payment_status "paid"
// (or a $0 admin test session). Never trusts the client.
async function isStripePaid(stripeSessionId: string | null): Promise<boolean> {
  if (!stripeSessionId) return false;
  try {
    const session = await stripe().checkout.sessions.retrieve(stripeSessionId);
    return session.payment_status === "paid" || session.payment_status === "no_payment_required";
  } catch (err) {
    console.error("[filing] Stripe session verify failed", err);
    return false;
  }
}

export default async function FilingDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string };
}) {
  const access = await getFilingAccess(params.id);
  if (access.kind === "not_found") notFound();
  if (access.kind === "locked") return <FilingLocked ownerEmail={access.ownerEmail} />;
  const owned = access.filing;
  const user = await getCurrentUser();

  let filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { yearData: true },
  });
  if (!filing) notFound();

  // Fallback promotion after Stripe redirect, in case the webhook hasn't fired
  // yet. SECURITY: we do NOT trust ?paid=1 alone — we re-check the actual
  // Checkout Session with Stripe and only promote when Stripe confirms payment.
  // This closes the bypass where any draft owner could append ?paid=1 to
  // unlock PDF generation without paying.
  if (searchParams.paid === "1" && filing.status === "DRAFT") {
    if (await isStripePaid(filing.stripeSessionId)) {
      await prisma.filing.update({
        where: { id: filing.id },
        data: { status: "PAID" },
      });
      filing = { ...filing, status: "PAID" };
    }
  }

  // DRAFT filings haven't been paid yet (and the Stripe re-check above didn't
  // promote them) — send the user back to the wizard rather than showing
  // post-payment actions.
  if (filing.status === "DRAFT") {
    redirect(`/filings/${owned.id}/edit`);
  }

  // Filing deadline for the in-flight window. Latest tax year drives the date;
  // a FINAL return shortens that year, so dissolvedAt is passed only when
  // isFinalReturn is set. A valid Form 7004 pushes the date out six months, so
  // the extension facts are read here as well — showing an extended customer
  // an April 15 deadline they have already lawfully moved is both wrong and
  // alarming. Omitted entirely when there are no tax years.
  const maxTaxYear = filing.taxYears.length > 0 ? Math.max(...filing.taxYears) : null;
  const deadlineText =
    maxTaxYear != null && DEADLINE_VISIBLE_STATUSES.has(filing.status)
      ? formatDueDate(
          effectiveDueDateUtc(maxTaxYear, filing.isFinalReturn ? filing.dissolvedAt : null, {
            filed: filing.extensionFiled,
            transmittedAt: filing.extensionTransmittedAt,
          }),
        )
      : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Google Ads purchase conversion — fire on any paid view (not just the
          ?paid=1 redirect), so a customer who closes the Stripe tab or opens
          the filing from their dashboard still converts. Google dedupes on the
          transaction_id (= filing id). Only reachable when status !== DRAFT. */}
      {(filing.status as string) !== "DRAFT" && (
        <PurchaseConversionPing amountCents={filing.amountPaid} filingId={filing.id} />
      )}
      <div>
        {user ? (
          <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
            ← My filings
          </Link>
        ) : (
          <Link href="/" className="text-sm text-slate-500 hover:underline">
            ← Home
          </Link>
        )}
        <h1 className="text-2xl font-semibold mt-2">{filing.llcName ?? "Filing"}</h1>
        <p className="text-sm text-slate-500">
          {getTiersForSource(filing.funnelSource)[filing.tier as "single_year" | "two_year_diirsp" | "multi_year_diirsp"]?.label} · Tax years {filing.taxYears.join(", ")}
        </p>
      </div>

      <div className="space-y-3">
        <FilingStatusBanner
          filingId={filing.id}
          status={filing.status}
          updatedAt={filing.updatedAt}
        />

        {deadlineText && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">Your filing deadline: {deadlineText}</span>{" "}
            — we file well before this.
          </p>
        )}
      </div>

      <FilingActions
        filing={{
          id: filing.id,
          status: filing.status,
          generatedPdfKey: filing.generatedPdfKey,
          signaturePngKey: filing.signaturePngKey,
          signedPdfKey: filing.signedPdfKey,
          faxJobId: filing.faxJobId,
          faxStatus: filing.faxStatus,
          faxService: filing.faxService,
          faxConfirmationKey: filing.faxConfirmationKey,
        }}
      />

      {/* Ask for a Trustpilot review at the happiest moment — once the filing
          has actually been delivered to the IRS. Review Collector is the one
          TrustBox that's free on every plan. */}
      {filing.status === "CONFIRMED" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-sm font-semibold text-slate-900">Filed with the IRS — nicely done.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
            If we made Form 5472 painless, a quick review helps other foreign founders find us.
          </p>
          <div className="mt-3 flex justify-center">
            <TrustpilotWidget
              templateId={TRUSTPILOT_TEMPLATES.reviewCollector}
              token={REVIEW_COLLECTOR_TOKEN}
              height="52px"
              width="260px"
            />
          </div>
        </div>
      )}

      {/* In-portal messaging. Visible to any owner of the filing — signed-in
          user OR anonymous session-cookie match. Anonymous owners can still
          post; admin notifications go to the filing's owner email if one
          was captured at /start (i.e. filing.user is non-null), even when
          the current browser doesn't have an active user cookie. */}
      <MessagesPanel filingId={filing.id} isAdmin={false} />
    </div>
  );
}
