import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Send, ShieldCheck, Sparkles } from "lucide-react";
import {
  TIERS,
  TIER_ORDER,
  MULTI_YEAR_ADDON_CENTS,
  type Tier,
} from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
import { FaxReceiptProof } from "@/components/FaxReceiptProof";

export const metadata: Metadata = {
  title: "Pricing — Form 5472 Filing for Foreign-Owned LLCs | Form5472 Prep",
  description:
    "Flat-rate Form 5472 + pro forma 1120 filing for foreign-owned US LLCs. Standard $199, Rush $279, Premium $449. IRS fax delivery included on every plan. Avoid the $25,000 IRS penalty.",
  alternates: { canonical: "https://www.form5472prep.com/pricing" },
};

const tierEntries = TIER_ORDER.map((key) => [key, TIERS[key]] as const);

// Schema.org Product with Offer per tier — drives rich-result pricing
// snippets in Google search.
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Form 5472 + Pro Forma 1120 Filing Service",
  description:
    "Done-for-you IRS Form 5472 and pro forma Form 1120 filing for foreign-owned single-member US LLCs. Fax delivery to the IRS Ogden PIN Unit is included on every plan.",
  brand: { "@type": "Brand", name: "Form5472 Prep" },
  offers: tierEntries.map(([slug, t]) => ({
    "@type": "Offer",
    name: `${t.label} — ${t.subtitle}`,
    priceCurrency: "USD",
    price: (t.priceCents / 100).toFixed(2),
    url: `https://www.form5472prep.com/start?tier=${slug}`,
    availability: "https://schema.org/InStock",
    eligibleQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "filing" },
  })),
};

export default function PricingPage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <section className="border-b border-slate-200 bg-gradient-to-br from-accent-50 via-white to-white">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Built for foreign founders · No CPA required · No US address needed
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 text-balance">
              Flat-rate Form 5472 filing.
              <br />
              <span className="text-accent">No hidden fees.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
              Done-for-you Form 5472 + pro forma 1120 for foreign-owned US LLCs.
              Avoid the $25,000-per-form IRS penalty. Fax delivery to the IRS
              Ogden PIN Unit included on every plan.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border-2 border-emerald-200 px-5 py-2 text-sm font-medium text-emerald-800">
                <Send className="h-4 w-4" />
                Fax filing included on every plan
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 border-2 border-accent/30 px-5 py-2 text-sm font-medium text-accent">
                <ShieldCheck className="h-4 w-4" />
                Every order reviewed by a qualified tax accountant
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {tierEntries.map(([slug, t]) => (
            <TierCard key={slug} slug={slug} tier={t} />
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 text-center">
          <span className="font-semibold text-slate-900">
            + {formatUsd(MULTI_YEAR_ADDON_CENTS)} per additional year
          </span>
          <span className="mx-2 text-slate-400">·</span>
          <span>
            Saves you from the{" "}
            <span className="font-semibold text-slate-900">
              $25,000-per-form IRS penalty
            </span>
          </span>
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center max-w-2xl mx-auto">
          One-time flat fee, billed in USD via Stripe. No subscription. We are
          not a CPA firm and do not provide tax advice — we prepare and submit
          your information return as you provide it.
        </p>
      </section>

      {/* Annotated fax-receipt section — differentiates against $49 DIY
          competitors that issue no proof-of-delivery. Sits between the
          pricing cards and the FAQ so anyone reading "is this worth $199?"
          sees the actual product artifact next to the price. */}
      <FaxReceiptProof />

      <section className="max-w-4xl mx-auto px-6 pb-20 space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 text-center">
          Pricing FAQ
        </h2>
        <div className="space-y-4">
          <FaqItem
            q="How much does it cost?"
            a="Three plans — Standard $199, Rush $279, Premium $449. Each plan is a flat one-time fee for a single tax year filing. Additional past tax years are +$149 each. IRS fax delivery to the Ogden PIN Unit is included on every plan."
          />
          <FaqItem
            q="What's the difference between the plans?"
            a="Standard is our done-for-you baseline — we prepare your Form 5472 + pro forma 1120, fax it to the IRS, and email you the confirmation. Rush adds 24-hour turnaround, priority email support, and a March filing reminder for next year. Premium adds same-day (12-hour) turnaround, IRS-letter handling for one year, and a BOI filing review."
          />
          <FaqItem
            q="Is fax filing really included?"
            a="Yes — every plan includes fax delivery to the IRS Ogden PIN Unit and the timestamped fax receipt as proof of on-time filing under IRC § 6038A. You don't need your own fax machine."
          />
          <FaqItem
            q="What if I'm filing for multiple past years (DIIRSP)?"
            a="Add $149 per additional past year on any plan. We include a reasonable-cause statement on every late filing so the IRS Delinquent International Information Return Submission Procedure (DIIRSP) is invoked correctly."
          />
          <FaqItem
            q="Are there any hidden fees?"
            a="No. The price you see is the price you pay. No setup fee, no monthly subscription, no per-page fax surcharge."
          />
        </div>
      </section>
    </main>
  );
}

function TierCard({ slug, tier }: { slug: Tier; tier: typeof TIERS[Tier] }) {
  const highlighted = !!tier.highlight;
  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl bg-white p-6 sm:p-7",
        highlighted
          ? "border-2 border-accent shadow-lg shadow-accent/10"
          : "border border-slate-200",
      ].join(" ")}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow">
            <Sparkles className="h-3 w-3" />
            Most popular
          </span>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-slate-900">{tier.label}</h3>
        <p className="mt-1 text-sm text-slate-600">{tier.subtitle}</p>
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight text-slate-900">
          {formatUsd(tier.priceCents)}
        </span>
        <span className="text-sm text-slate-500">/ year</span>
      </div>

      <ul className="mt-6 space-y-2.5 text-sm text-slate-700 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 flex-none mt-0.5 text-emerald-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/start?tier=${slug}`}
        className={[
          "mt-7 inline-flex items-center justify-center rounded-md h-11 px-5 text-sm font-semibold transition",
          highlighted
            ? "bg-accent text-white hover:bg-accent-dark"
            : "bg-slate-900 text-white hover:bg-slate-800",
        ].join(" ")}
      >
        {tier.ctaLabel}
      </Link>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border border-slate-200 bg-white p-4 open:bg-slate-50">
      <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
        {q}
        <span className="text-slate-400 group-open:rotate-180 transition">▾</span>
      </summary>
      <p className="mt-3 text-sm text-slate-700 leading-relaxed">{a}</p>
    </details>
  );
}
