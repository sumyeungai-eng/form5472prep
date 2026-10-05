import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Send, ShieldCheck, Sparkles } from "lucide-react";
import {
  TIERS,
  TIER_ORDER,
  MULTI_YEAR_ADDON_CENTS,
  MULTI_YEAR_ADDON_LABEL,
  STANDARD_TURNAROUND,
  EXPRESS_TURNAROUND,
  type Tier,
} from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { FaxReceiptProof } from "@/components/FaxReceiptProof";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonTable, FILING_COMPARISON } from "@/components/ComparisonTable";
import { ORG_REF, SITE_URL, SPEAKABLE, breadcrumbList, organizationDocument, pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing for Form 5472 Filing",
  description:
    `Pricing for Form 5472 + pro forma 1120 filing: Standard ${formatPrice(TIERS.standard.priceCents)} in ${STANDARD_TURNAROUND}, Express ${formatPrice(TIERS.express.priceCents)} within ${EXPRESS_TURNAROUND}. We fax to the IRS Ogden PIN Unit.`,
  ...pageMeta({
    title: "Pricing — Form 5472 Filing for Foreign-Owned LLCs",
    description:
      `Pricing for Form 5472 + pro forma 1120 filing: Standard ${formatPrice(TIERS.standard.priceCents)} in ${STANDARD_TURNAROUND}, Express ${formatPrice(TIERS.express.priceCents)} within ${EXPRESS_TURNAROUND}. We fax to the IRS Ogden PIN Unit.`,
    path: "/pricing",
  }),
};

const tierEntries = TIER_ORDER.map((key) => [key, TIERS[key]] as const);

// Visible "Last reviewed" date and the WebPage dateModified share this one
// constant so they cannot drift. Bump it whenever pricing or process copy changes.
const PRICING_LAST_REVIEWED = "2026-10-05";
const PRICING_LAST_REVIEWED_LABEL = "October 5, 2026";

// The answer capsule under "How much does Form 5472 filing cost?": prices and
// turnarounds come from src/lib/pricing.ts, never typed here.
const COST_ANSWER = `Form 5472 filing costs ${formatPrice(TIERS.standard.priceCents)} on Standard (ready in ${STANDARD_TURNAROUND}) or ${formatPrice(TIERS.express.priceCents)} on Express (ready within ${EXPRESS_TURNAROUND}), plus ${formatPrice(MULTI_YEAR_ADDON_CENTS)} for each additional past tax year. IRS fax delivery and a qualified-accountant review are included on both plans, with no subscription.`;

const PRICING_FAQS: { q: string; a: string }[] = [
  {
    q: "How much does it cost?",
    a: `Two flat, all-inclusive prices for a single tax year — ${formatPrice(TIERS.standard.priceCents)} for ${TIERS.standard.label.toLowerCase()}, ready in ${STANDARD_TURNAROUND}, or ${formatPrice(TIERS.express.priceCents)} for ${TIERS.express.label.toLowerCase()}, ready within ${EXPRESS_TURNAROUND}. Additional past tax years are +${formatPrice(MULTI_YEAR_ADDON_CENTS)} each on either tier. IRS fax delivery to the Ogden PIN Unit is included in both.`,
  },
  {
    q: "What's the difference between the two tiers?",
    a: `Only the turnaround. The filing itself is identical: we prepare your Form 5472 + pro forma 1120, a qualified tax accountant reviews it, we fax it to the IRS Ogden PIN Unit, and email you the timestamped confirmation. Both tiers also include a reasonable-cause letter on late / DIIRSP filings and a filing reminder in the second week of January for next year. ${TIERS.standard.label} (${formatPrice(TIERS.standard.priceCents)}) is ready in ${STANDARD_TURNAROUND}; ${TIERS.express.label.toLowerCase()} (${formatPrice(TIERS.express.priceCents)}) is ready within ${EXPRESS_TURNAROUND} and comes with priority email support.`,
  },
  {
    q: "Is fax filing really included?",
    a: "Yes — every plan includes fax delivery to the IRS Ogden PIN Unit and the fax provider's transmission receipt (destination, timestamp, page count, result): evidence of transmission, not IRS acceptance. You don't need your own fax machine.",
  },
  {
    q: "What if I'm filing for multiple past years (DIIRSP)?",
    a: `Add ${formatPrice(MULTI_YEAR_ADDON_CENTS)} per additional past year on either tier. We include a reasonable-cause statement on every late filing so the IRS Delinquent International Information Return Submission Procedure (DIIRSP) is invoked correctly.`,
  },
  {
    q: "Are there any hidden fees?",
    a: "No. The price you see is the price you pay. No setup fee, no monthly subscription, no per-page fax surcharge.",
  },
];

// Schema.org Product with Offer per tier — drives rich-result pricing
// snippets in Google search.
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${SITE_URL}/pricing#product`,
  name: "Form 5472 + Pro Forma 1120 Filing Service",
  description:
    "Done-for-you IRS Form 5472 and pro forma Form 1120 filing for foreign-owned single-member US LLCs. Fax delivery to the IRS Ogden PIN Unit is included on every plan.",
  // Same Organization @id as every other page, so engines consolidate the brand.
  brand: ORG_REF,
  manufacturer: ORG_REF,
  offers: [
    ...tierEntries.map(([slug, t]) => ({
      "@type": "Offer",
      name: `${t.label} — ${t.subtitle}`,
      priceCurrency: "USD",
      price: (t.priceCents / 100).toFixed(2),
      url: `${SITE_URL}/start?tier=${slug}`,
      availability: "https://schema.org/InStock",
      seller: ORG_REF,
      eligibleQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "filing" },
    })),
    // The flat add-on for every tax year past the first, on either tier.
    {
      "@type": "Offer",
      name: MULTI_YEAR_ADDON_LABEL,
      description: "Flat add-on for each additional past tax year, on either tier.",
      priceCurrency: "USD",
      price: (MULTI_YEAR_ADDON_CENTS / 100).toFixed(2),
      url: `${SITE_URL}/start`,
      availability: "https://schema.org/InStock",
      seller: ORG_REF,
      eligibleQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "additional tax year" },
    },
  ],
};

// WebPage + Speakable: the H1 and the cost capsule are the passages to read
// aloud; dateModified matches the visible "Last reviewed" line.
const pricingWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/pricing#webpage`,
  url: `${SITE_URL}/pricing`,
  name: "Form 5472 filing pricing",
  dateModified: PRICING_LAST_REVIEWED,
  inLanguage: "en-US",
  publisher: ORG_REF,
  about: { "@id": `${SITE_URL}/pricing#product` },
  speakable: SPEAKABLE,
};

const pricingFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PRICING_FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function PricingPage() {
  return (
    <main className="bg-white">
      <JsonLd data={organizationDocument()} />
      <JsonLd data={productJsonLd} />
      <JsonLd data={pricingWebPageJsonLd} />
      <JsonLd data={pricingFaqJsonLd} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />

      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              For foreign-owned US LLCs
            </p>
            <h1 className="mt-5 font-serif text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-balance">
              Form 5472 filing pricing:
              <br />
              <span className="text-accent-100">{formatPrice(TIERS.standard.priceCents)} and {formatPrice(TIERS.express.priceCents)}, nothing hidden.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
              Done-for-you Form 5472 + pro forma 1120 for foreign-owned US LLCs.
              Same filing either way — pick the turnaround you need:{" "}
              {STANDARD_TURNAROUND} or within {EXPRESS_TURNAROUND}. Fax delivery
              to the IRS Ogden PIN Unit is included on both plans, so you avoid
              the $25,000-per-form IRS penalty.
            </p>

            <p className="mt-5 text-xs text-slate-400">
              Last reviewed <time dateTime={PRICING_LAST_REVIEWED}>{PRICING_LAST_REVIEWED_LABEL}</time>
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white ring-1 ring-white/15">
                <Send className="h-4 w-4 text-accent-100" />
                Fax filing on every plan
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white ring-1 ring-white/15">
                <ShieldCheck className="h-4 w-4 text-accent-100" />
                Reviewed by a tax accountant
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <h2 id="cost" className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            How much does Form 5472 filing cost?
          </h2>
          <p className="mt-3 text-slate-600" data-speakable>
            {COST_ANSWER}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto items-stretch">
          {tierEntries.map(([slug, t]) => (
            <TierCard key={slug} slug={slug} tier={t} />
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 text-center">
          <span className="font-semibold text-slate-900">
            + {formatPrice(MULTI_YEAR_ADDON_CENTS)} per additional year, either tier
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
          One-time flat fee, billed in USD via Stripe. No subscription. Every
          filing is reviewed by a qualified accountant before it is submitted.
          We prepare and submit the forms from the information you give us; we
          do not provide personalised tax planning.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 sm:pb-20">
        <h2 className="text-center font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          How does Form5472 Prep compare with a CPA or DIY?
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600 max-w-2xl mx-auto">
          The table compares setup time, filing delivery, proof storage, and cost across Form5472 Prep, CPA, and DIY options.
        </p>
        <ComparisonTable {...FILING_COMPARISON} className="mt-8" />
      </section>

      {/* EIN / ITIN cross-sell — passes internal-link equity to the newer
          service pages and captures founders who need more than the 5472. */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-center font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
            More for foreign founders
          </p>
          <h2 className="mt-3 text-center font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Also need an EIN or ITIN?
          </h2>
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {[
              {
                href: "/ein",
                eyebrow: "EIN — $149",
                title: "Do you need an EIN for your LLC?",
                body: "No SSN or ITIN required. We prepare Form SS-4 and obtain your EIN directly from the IRS in 1–5 business days.",
              },
              {
                href: "/itin",
                eyebrow: "ITIN — $349",
                title: "Do you need an ITIN for yourself?",
                body: "Certified by an IRS Certifying Acceptance Agent — your documents are certified and we file Form W-7. No passport mailing.",
              },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group block h-full rounded-xl border border-slate-200 bg-white p-6 transition hover:border-accent hover:shadow-lg hover:shadow-accent/10"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">{s.eyebrow}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                  <span
                    aria-hidden
                    className="text-accent transition group-hover:translate-x-0.5 inline-block"
                  >
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Annotated fax-receipt section — differentiates against $49 DIY
          competitors that issue no proof-of-delivery. Sits between the
          pricing cards and the FAQ so anyone weighing the fee
          sees the actual product artifact next to the price. */}
      <FaxReceiptProof />

      <section className="max-w-4xl mx-auto px-6 pb-20 space-y-8">
        <h2 className="text-center font-serif text-2xl font-semibold tracking-tight text-ink">
          What pricing questions do filers ask?
        </h2>
        <div className="space-y-4">
          {PRICING_FAQS.map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow">
            <Sparkles className="h-3 w-3" />
            Most popular
          </span>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-ink">{tier.label}</h3>
        <p className="mt-1 text-sm text-slate-600">{tier.subtitle}</p>
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-serif text-5xl font-semibold tracking-tight text-ink">
          {formatPrice(tier.priceCents)}
        </span>
        <span className="font-mono text-xs text-slate-500">/ filing</span>
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
