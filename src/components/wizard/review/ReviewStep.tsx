"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock, FileText, Loader2, Lock, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import {
  MULTI_YEAR_ADDON_CENTS,
  multiYearAddonCents,
  tierInfo,
  totalPriceCents,
  promoDiscountCents,
  resolveTier,
  isTestTier,
  type Tier,
} from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
import { DocumentsUploader } from "@/components/DocumentsUploader";
import { FilingDetails } from "./FilingDetails";
import { IncludedFeatures } from "./IncludedFeatures";
import { OrderSummary } from "./OrderSummary";
import { SectionHeading } from "./SectionHeading";
import { TierChooser } from "./TierChooser";
import { sharedTierFeatures } from "./tierFeatures";

// The subset of the wizard's Filing record this step reads. FilingWizard's
// full Filing type is structurally assignable to it.
export type ReviewStepFiling = {
  id: string;
  email: string | null;
  llcName: string | null;
  llcEin: string | null;
  llcAddress: string | null;
  llcCity: string | null;
  llcState: string | null;
  llcZip: string | null;
  ownerName: string | null;
  ownerFtin: string | null;
  taxYears: number[];
  isDiirsp: boolean;
  extensionFiled: string | null;
  reasonableCauseNarrative: string | null;
  /** Per-year reasonable-cause answers (the RCS step saves these, not the legacy narrative). */
  yearData?: { taxYear: number; rcsWhyMissed?: string | null }[];
  tier: string | null;
  funnelSource: string | null;
};

// Layout: the step switches to two columns (details left, sticky order
// summary right) when the STEP itself is at least 44rem wide. That is a
// container query rather than a viewport breakpoint on purpose — on large
// screens the wizard sits beside the 18rem step sidebar, so the viewport says
// little about how much room this step actually has. Below 44rem everything
// stacks, with the summary and Pay button at the end.
//
// Money path: every figure below is computed by the block that follows,
// moved verbatim from FilingWizard.tsx — the same pricing.ts helpers
// /api/checkout runs, so the Pay button quotes what Stripe charges. The
// sub-components only render the numbers they are handed.

export function ReviewStep({
  filing,
  onBack,
  onPay,
  onSelectTier,
  saving,
}: {
  filing: ReviewStepFiling;
  onBack: () => void;
  onPay: (email: string, faxService: boolean) => Promise<void>;
  onSelectTier: (tier: Tier) => Promise<void>;
  saving: boolean;
}) {
  // Tier is pre-selected upstream (/pricing, /start?tier=) but the customer
  // can still switch it here. This is the last screen before payment and the
  // only place the two turnarounds sit side by side, so it's where the
  // upgrade decision actually gets made — the tiers differ ONLY by speed.
  //
  // Admin $0 test filings are the exception: their tier isn't a product, so
  // they keep it and never see the chooser (offering it would let a test
  // order re-tier itself into a real, chargeable one).
  const isTestFiling = isTestTier(filing.tier);
  const savedTier = resolveTier(filing.tier).tier;
  // Optimistic selection so the cards and the total move the instant a card is
  // clicked instead of after the PATCH round-trip. Reset (below) as soon as
  // the server echoes the new tier back onto `filing`, and rolled back to
  // `savedTier` if the save fails — the price shown must never outrun the
  // price /api/checkout will actually charge.
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  const [tierSaving, setTierSaving] = useState(false);
  const selectedTier: Tier = pendingTier ?? savedTier;
  // What the price math runs on: the live selection normally, the raw stored
  // value for a test filing (so tierInfo/totalPriceCents keep returning $0).
  const pricedTierValue: string | null = isTestFiling ? filing.tier : selectedTier;

  // Clear the optimistic override once the PATCH has landed. Comparing against
  // filing.tier (not a success flag) means a save that succeeded server-side
  // but whose response we mishandled still converges on the stored truth.
  useEffect(() => {
    setPendingTier(null);
  }, [filing.tier]);

  async function handleSelectTier(next: Tier) {
    if (next === selectedTier || tierSaving) return;
    setPendingTier(next);
    setTierSaving(true);
    try {
      await onSelectTier(next);
    } catch {
      // The wizard's own error banner already names the failure; just fall
      // back to the tier the server still holds so the Pay button can't quote
      // a plan the customer isn't about to be charged for.
      setPendingTier(null);
    } finally {
      setTierSaving(false);
    }
  }

  const activeTier = tierInfo(pricedTierValue);
  const yearCount = filing.taxYears.length || 1;
  const extraYears = Math.max(0, yearCount - 1);
  const addOnCents = multiYearAddonCents(yearCount);
  const total = totalPriceCents(pricedTierValue, yearCount);
  // Launch promotion — driven by the filing's funnelSource using the exact
  // same helpers /api/checkout runs server-side, so the figure on this button
  // is the figure Stripe charges. 0 for every non-promo filing, which makes
  // dueNow === total and leaves this step rendering exactly as it always has.
  const promoDiscount = promoDiscountCents(filing.funnelSource, total);
  const dueNow = total - promoDiscount;
  const [email, setEmail] = useState(filing.email ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError(null);
    setPaying(true);
    try {
      // faxService arg kept for the existing onPay signature; checkout API
      // now ignores it (fax is bundled on every tier).
      await onPay(trimmed, true);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="[container-type:inline-size]">
      <header className="border-b border-slate-200 pb-6">
        <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          <Lock aria-hidden className="h-3 w-3" />
          Last step before payment
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Review &amp; pay
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Confirm everything looks right. After payment we&apos;ll generate the filled PDFs and
          email you an access link.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-10 [@container(min-width:44rem)]:grid-cols-[minmax(0,1fr)_20rem] [@container(min-width:44rem)]:gap-x-10 [@container(min-width:44rem)]:gap-y-8">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="review-details-title">
            <SectionHeading id="review-details-title" icon={FileText} title="Filing details" />
            <div className="mt-4">
              <FilingDetails filing={filing} />
            </div>
          </section>

          <section aria-labelledby="review-documents-title">
            <SectionHeading
              id="review-documents-title"
              icon={Paperclip}
              title="Supporting documents"
              aside={
                <span className="flex-none rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  Optional
                </span>
              }
              description="Anything that helps us prepare your filing — formation documents, IRS letters, prior filings."
            />
            <div className="mt-4">
              <DocumentsUploader filingId={filing.id} />
            </div>
          </section>

          {!isTestFiling && (
            <section aria-labelledby="review-turnaround-title">
              <SectionHeading
                id="review-turnaround-title"
                icon={Clock}
                title="Choose your turnaround"
                aside={
                  <span aria-live="polite" className="flex-none text-xs text-slate-500">
                    {tierSaving ? "Updating…" : ""}
                  </span>
                }
                description="Both plans include the same package and the same accountant review — the only difference is how fast it goes out. You can switch until you pay."
              />
              <div className="mt-4">
                <TierChooser
                  selectedTier={selectedTier}
                  disabled={tierSaving}
                  onSelect={(key) => void handleSelectTier(key)}
                />
              </div>
              {extraYears > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  Prices shown are for the first tax year. Each additional past year adds{" "}
                  {formatUsd(MULTI_YEAR_ADDON_CENTS)} on either plan.
                </p>
              )}
              <IncludedFeatures features={sharedTierFeatures()} />
            </section>
          )}

          <section aria-labelledby="review-delivery-title">
            <SectionHeading id="review-delivery-title" icon={Send} title="Delivery to the IRS" />
            <p className="mt-4 rounded-xl border border-paper-edge bg-paper p-4 text-sm leading-relaxed text-slate-700">
              We fax your signed package to the IRS Ogden PIN Unit and return the
              timestamped fax receipt as proof of when your package reached the IRS. Fax delivery is
              included on every plan — no separate fee.
            </p>
          </section>
        </div>

        <aside
          aria-label="Order summary and payment"
          className="[@container(min-width:44rem)]:sticky [@container(min-width:44rem)]:top-6 [@container(min-width:44rem)]:col-start-2 [@container(min-width:44rem)]:row-span-2 [@container(min-width:44rem)]:row-start-1 [@container(min-width:44rem)]:self-start"
        >
          <OrderSummary
            llcName={filing.llcName}
            taxYears={filing.taxYears}
            activeTier={activeTier}
            extraYears={extraYears}
            addOnCents={addOnCents}
            promoDiscount={promoDiscount}
            total={total}
            dueNow={dueNow}
          >
            <Field
              label="Email address"
              hint="We send your filing receipt and an access link to this address."
              error={emailError ?? undefined}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:border-red-500 aria-[invalid=true]:focus:ring-red-500"
              />
            </Field>
            {/* Blocked while a tier switch is in flight: checkout prices off the
                stored filing.tier, so paying mid-PATCH could charge the plan the
                customer just switched away from. */}
            <Button
              type="button"
              size="lg"
              onClick={handlePay}
              disabled={paying || saving || tierSaving}
              aria-busy={paying}
              className="h-12 w-full text-base shadow-lg shadow-accent/20"
            >
              {paying ? (
                <>
                  <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  <Lock aria-hidden className="mr-2 h-4 w-4" />
                  {`Pay ${formatUsd(dueNow)} securely`}
                </>
              )}
            </Button>
          </OrderSummary>
        </aside>

        <div className="[@container(min-width:44rem)]:col-start-1 [@container(min-width:44rem)]:row-start-2">
          <Button type="button" variant="outline" onClick={onBack} className="h-11">
            <ArrowLeft aria-hidden className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
