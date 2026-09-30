import Link from "next/link";
import { Lock, Printer, ShieldCheck } from "lucide-react";
import { MULTI_YEAR_ADDON_CENTS, PROMO_LABEL, type TierInfo } from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";

// Order summary card for the Review step. Purely presentational: every figure
// it prints is computed by ReviewStep (with the same pricing.ts helpers
// /api/checkout runs) and passed in — this component does no arithmetic, so
// the total it shows is by construction the total the Pay button quotes.
//
// `children` is the checkout block (email + Pay button), rendered inside the
// card so the button sits directly under the total it charges.
export function OrderSummary({
  llcName,
  taxYears,
  activeTier,
  extraYears,
  addOnCents,
  promoDiscount,
  total,
  dueNow,
  children,
}: {
  llcName: string | null;
  taxYears: number[];
  activeTier: TierInfo;
  extraYears: number;
  addOnCents: number;
  promoDiscount: number;
  total: number;
  dueNow: number;
  children: React.ReactNode;
}) {
  const yearsLabel =
    taxYears.length === 0
      ? null
      : `Tax year${taxYears.length === 1 ? "" : "s"} ${taxYears.join(", ")}`;

  return (
    <div>
      <section
        aria-labelledby="order-summary-title"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.06]"
      >
        <div className="relative border-b border-paper-edge bg-paper px-5 pb-4 pt-5">
          <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-seal/70" />
          <h3
            id="order-summary-title"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500"
          >
            Order summary
          </h3>
          <p className="mt-2 break-words font-serif text-lg font-semibold leading-snug text-ink">
            {llcName || "Your LLC"}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            Form 5472 + pro forma 1120{yearsLabel ? ` · ${yearsLabel}` : ""}
          </p>
        </div>

        <dl className="px-5 text-sm">
          <LineItem
            label={activeTier.label}
            detail={activeTier.subtitle}
            amount={formatUsd(activeTier.priceCents)}
          />
          <LineItem
            label="IRS fax delivery"
            detail="Timestamped fax receipt"
            amount="Included"
            amountClassName="text-emerald-700"
          />
          {extraYears > 0 && (
            <LineItem
              label={`${extraYears} additional tax year${extraYears === 1 ? "" : "s"}`}
              detail={`${extraYears} × ${formatUsd(MULTI_YEAR_ADDON_CENTS)}`}
              amount={formatUsd(addOnCents)}
            />
          )}
          {promoDiscount > 0 && (
            <LineItem
              label={PROMO_LABEL}
              amount={`−${formatUsd(promoDiscount)}`}
              amountClassName="text-emerald-700"
            />
          )}
          <div className="flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
            <dt>
              <span className="block font-semibold text-ink">Total</span>
              <span className="mt-0.5 block text-xs text-slate-500">USD</span>
            </dt>
            <dd className="text-right tabular-nums">
              {promoDiscount > 0 ? (
                <>
                  <span className="block text-sm text-slate-500 line-through">
                    {formatUsd(total)}
                  </span>
                  <span className="block font-serif text-3xl font-semibold tracking-tight text-ink">
                    {formatUsd(dueNow)}
                  </span>
                </>
              ) : (
                <span className="block font-serif text-3xl font-semibold tracking-tight text-ink">
                  {formatUsd(total)}
                </span>
              )}
            </dd>
          </div>
        </dl>
        <p className="px-5 pb-4 pt-1.5 text-xs text-slate-500">One-time payment · no subscription</p>

        <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
          {children}
          <TrustList />
        </div>
      </section>

      <p className="mt-3 px-1 text-center text-xs leading-relaxed text-slate-500">
        Fees and refunds are covered in our{" "}
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-accent hover:decoration-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}

function LineItem({
  label,
  detail,
  amount,
  amountClassName = "text-ink",
}: {
  label: string;
  detail?: string;
  amount: string;
  amountClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-slate-100 py-3 first:border-t-0">
      <dt className="min-w-0">
        <span className="block font-medium text-ink">{label}</span>
        {detail && <span className="mt-0.5 block text-xs text-slate-500">{detail}</span>}
      </dt>
      <dd className={`flex-none text-right font-medium tabular-nums ${amountClassName}`}>
        {amount}
      </dd>
    </div>
  );
}

function TrustList() {
  return (
    <ul className="space-y-2.5 text-xs leading-relaxed text-slate-600">
      <li className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="flex items-center gap-2">
          <Lock aria-hidden className="h-3.5 w-3.5 flex-none text-slate-500" />
          <span className="font-medium text-slate-800">Secure payment by Stripe</span>
        </span>
        <CardMarks />
      </li>
      <li className="flex gap-2">
        <ShieldCheck aria-hidden className="mt-0.5 h-3.5 w-3.5 flex-none text-emerald-600" />
        <span>Every order is reviewed by a qualified accountant before submission to the IRS.</span>
      </li>
      <li className="flex gap-2">
        <Printer aria-hidden className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-500" />
        <span>Timestamped IRS fax receipt included.</span>
      </li>
    </ul>
  );
}

// Text/inline-SVG acceptance marks (no external images). Checkout runs with
// payment_method_types: ["card"], so these are the card networks Stripe
// accepts on it; they are decoration, the sr-only line carries the meaning.
function CardMarks() {
  const chip = "inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded border px-1.5";
  return (
    <span className="flex items-center gap-1.5">
      <span className="sr-only">Visa, Mastercard and American Express accepted</span>
      <span
        aria-hidden
        className={`${chip} border-slate-200 bg-white font-sans text-[11px] font-extrabold italic tracking-tight text-[#1a1f71]`}
      >
        VISA
      </span>
      <span aria-hidden className={`${chip} border-slate-200 bg-white`}>
        <svg viewBox="0 0 24 15" className="h-3.5 w-auto">
          <circle cx="8" cy="7.5" r="6.5" fill="#eb001b" />
          <circle cx="16" cy="7.5" r="6.5" fill="#f79e1b" />
          <path d="M12 2.4a6.5 6.5 0 0 1 0 10.2 6.5 6.5 0 0 1 0-10.2z" fill="#ff5f00" />
        </svg>
      </span>
      <span
        aria-hidden
        className={`${chip} border-[#1f72cd] bg-[#1f72cd] font-sans text-[9px] font-bold tracking-wide text-white`}
      >
        AMEX
      </span>
    </span>
  );
}
