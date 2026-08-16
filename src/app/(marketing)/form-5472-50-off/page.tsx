import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  PenTool,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaxReceiptProof } from "@/components/FaxReceiptProof";
import { Reveal } from "@/components/Reveal";
import {
  EXPRESS_TURNAROUND,
  MULTI_YEAR_ADDON_CENTS,
  PROMO_DISCOUNT_CENTS,
  STANDARD_TURNAROUND,
  TIERS,
  TIER_ORDER,
  promoTotalCents,
  type Tier,
} from "@/lib/pricing";
import { ORG_EMAIL, pageOpenGraph } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

// PROMO_SOURCES in src/lib/pricing.ts must contain this funnel source.
const PROMO_SRC = "promo50";
const START_URL = `/start?v=rail&src=${PROMO_SRC}`;

function tierUrl(slug: Tier) {
  const sep = START_URL.includes("?") ? "&" : "?";
  return `${START_URL}${sep}tier=${slug}`;
}

const STANDARD_PROMO_PRICE = promoTotalCents(PROMO_SRC, TIERS.standard.priceCents);
const EXPRESS_PROMO_PRICE = promoTotalCents(PROMO_SRC, TIERS.express.priceCents);
const PROMO_TITLE = `File Form 5472 for ${formatPrice(STANDARD_PROMO_PRICE)} — ${formatPrice(PROMO_DISCOUNT_CENTS)} Off (Was ${formatPrice(TIERS.standard.priceCents)}) | Form5472 Prep`;
const PROMO_DESCRIPTION = `Save ${formatPrice(PROMO_DISCOUNT_CENTS)} on accountant-reviewed Form 5472 + pro forma 1120 preparation, with IRS Ogden fax delivery and a timestamped receipt included.`;

export const metadata: Metadata = {
  title: { absolute: PROMO_TITLE },
  description: PROMO_DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: "/form-5472-50-off" },
  openGraph: pageOpenGraph({
    title: PROMO_TITLE,
    description: PROMO_DESCRIPTION,
    path: "/form-5472-50-off",
  }),
};

const FAQS = [
  {
    q: `Is ${formatPrice(STANDARD_PROMO_PRICE)} really the full price?`,
    a: `Yes. ${formatPrice(STANDARD_PROMO_PRICE)} is the total for one tax year, including the forms, accountant review, a reasonable cause letter if you're late, IRS fax delivery, and the timestamped receipt. There is no separate fax fee, setup fee, or subscription. Additional past tax years are ${formatPrice(MULTI_YEAR_ADDON_CENTS)} each and are not discounted; Express also receives the same ${formatPrice(PROMO_DISCOUNT_CENTS)} reduction.`,
  },
  {
    q: `Is the promoted filing different from the ${formatPrice(TIERS.standard.priceCents)} service?`,
    a: `No. ${formatPrice(TIERS.standard.priceCents)} is the Standard list price, and this Google Ads offer applies a ${formatPrice(PROMO_DISCOUNT_CENTS)} promotional discount. The package, accountant review, IRS fax delivery, ${STANDARD_TURNAROUND} turnaround, and guarantee are identical.`,
  },
  {
    q: "How much is a two- or three-year catch-up?",
    a: `The ${formatPrice(PROMO_DISCOUNT_CENTS)} comes off the base filing fee once; extra past years remain ${formatPrice(MULTI_YEAR_ADDON_CENTS)} each. All delinquent years go to the IRS together under DIIRSP with one comprehensive reasonable cause statement. The exact computed totals are shown in the multi-year table above.`,
  },
  {
    q: "How fast will my filing go out, and can I get it sooner?",
    a: `Standard is ready in ${STANDARD_TURNAROUND}. If your deadline is tight, Express is ready within ${EXPRESS_TURNAROUND} and carries the same ${formatPrice(PROMO_DISCOUNT_CENTS)} discount. Express is not a different or more thorough filing; you are paying only for speed and priority email support.`,
  },
  {
    q: "Do I have to enter a discount code?",
    a: "No. The discount is applied automatically because you started from this page. You will see the full price struck through and the reduction itemised on the review screen and Stripe payment page before you pay.",
  },
  {
    q: "What exactly do I get?",
    a: "One tax year filed end to end: Form 5472 + pro forma Form 1120 with the Part V supporting statement, review by a qualified tax accountant, a reasonable cause letter if you are filing late, fax delivery to the IRS Ogden PIN Unit, a timestamped transmission receipt, filing confirmation, and a reminder before next year's deadline.",
  },
  {
    q: "What happens if I do not file at all?",
    a: "IRC § 6038A carries an automatic $25,000 penalty per form, per year, even if your LLC had no revenue and owes no US tax. If the IRS sends a notice and the filing stays outstanding, another penalty can be added for each 30-day period. There is no cap.",
  },
  {
    q: "Money-back guarantee — what does it cover?",
    a: "If we fail to submit your filing to the IRS, you get a 100% refund. If the IRS assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge. It does not cover a penalty assessed on a correctly filed return or a change-of-mind cancellation after the package has been faxed.",
  },
];

const MULTI_YEAR_ROWS = [1, 2, 3].map((yearCount) => {
  const fullTotal =
    TIERS.standard.priceCents + (yearCount - 1) * MULTI_YEAR_ADDON_CENTS;
  return {
    yearCount,
    fullTotal,
    promoTotal: promoTotalCents(PROMO_SRC, fullTotal),
  };
});

export default function PromoLandingPage() {
  return (
    <main className="bg-white">
      <Hero />
      <TrustStrip />
      <Offer />
      <Includes />
      <Pricing />
      <HowItWorks />
      <ValueOfFiling />
      <WhoItsFor />
      <FaxReceiptProof />
      <Faq />
      <FinalCta />
    </main>
  );
}

function Hero() {
  const checklist = [
    "Filled IRS Form 5472 + pro forma 1120",
    "Reasonable cause statement (if late)",
    "Reviewed by a qualified tax accountant",
    "Faxed to IRS Ogden PIN Unit",
    "100% money-back if we fail to submit",
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 55% at 22% 0%, rgba(30,58,138,0.55) 0%, rgba(14,27,51,0) 70%)",
        }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />

      <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 sm:pb-20 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div className="animate-fade-in-up">
            <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
              <BadgePercent className="h-3.5 w-3.5" />
              {formatPrice(PROMO_DISCOUNT_CENTS)} off · Google Ads offer · Foreign-owned US single-member LLCs
            </p>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              File your Form 5472 for {formatPrice(STANDARD_PROMO_PRICE)}.
            </h1>
            <p className="mt-4 font-serif text-2xl leading-snug text-slate-200 sm:text-3xl">
              <s className="text-slate-400">{formatPrice(TIERS.standard.priceCents)}</s> list price —{" "}
              {formatPrice(PROMO_DISCOUNT_CENTS)} off, applied automatically.
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Get an accountant-reviewed Form 5472 + pro forma 1120, faxed to the IRS Ogden PIN Unit with a timestamped receipt as proof of filing. The same complete package is ready in {STANDARD_TURNAROUND}; Express is also {formatPrice(PROMO_DISCOUNT_CENTS)} off and ready within {EXPRESS_TURNAROUND}.
            </p>
          </div>

          <div className="w-full animate-fade-in-up animate-delay-200">
            <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-2xl shadow-black/30 ring-1 ring-black/5 sm:p-7">
              <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-soft-pulse" />
                Start filing now
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2">
                <s className="pb-1 font-serif text-2xl text-slate-400">
                  {formatPrice(TIERS.standard.priceCents)}
                </s>
                <span className="font-serif text-5xl font-semibold tracking-tight text-ink">
                  {formatPrice(STANDARD_PROMO_PRICE)}
                </span>
                <span className="mb-1.5 rounded-full bg-seal/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-seal">
                  {formatPrice(PROMO_DISCOUNT_CENTS)} off
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Standard · ready in {STANDARD_TURNAROUND}
              </p>

              <Link href={START_URL} className="group mt-6 block">
                <Button size="lg" className="h-14 w-full text-base shadow-lg shadow-accent/25 transition-all duration-200 hover:-translate-y-0.5">
                  Start filing — {formatPrice(STANDARD_PROMO_PRICE)}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link
                href={tierUrl("express")}
                className="group mt-2 flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-accent"
              >
                Need it in {EXPRESS_TURNAROUND}? Express&nbsp;
                <s className="text-slate-400">{formatPrice(TIERS.express.priceCents)}</s>
                &nbsp;{formatPrice(EXPRESS_PROMO_PRICE)}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <ul className="mt-5 space-y-2.5 text-sm">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 border-t border-slate-100 pt-5 text-center font-mono text-[11px] leading-relaxed text-slate-500">
                Discount itemised on the payment screen before you enter a card. No subscription — pay once per filing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Clock, label: "15 min", sub: "average completion" },
    { icon: FileText, label: "IRS forms", sub: "filled, not redrawn" },
    { icon: Send, label: "Faxed for you", sub: "to Ogden PIN Unit" },
    { icon: ShieldCheck, label: "Receipt stored", sub: "proof of filing" },
  ];

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 md:grid-cols-4">
        {items.map((item, index) => (
          <Reveal key={item.label} delay={index * 100} className="group flex items-center gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-accent-50 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Offer() {
  const cards = [
    {
      icon: ShieldCheck,
      title: "Nothing stripped out",
      body: `The ${formatPrice(STANDARD_PROMO_PRICE)} filing is the same complete package as the ${formatPrice(TIERS.standard.priceCents)} filing: same preparation, accountant review, fax delivery, and guarantee.`,
    },
    {
      icon: Zap,
      title: `Express is ${formatPrice(PROMO_DISCOUNT_CENTS)} off too`,
      body: `Choose Express for delivery within ${EXPRESS_TURNAROUND}. The documents and review are identical; the upgrade buys speed and priority email support.`,
    },
    {
      icon: BadgePercent,
      title: "Applied automatically",
      body: `The ${formatPrice(PROMO_DISCOUNT_CENTS)} reduction is itemised before you enter a card. There is no code, checkout upsell, separate fax fee, or subscription.`,
    },
  ];

  return (
    <section className="border-b border-paper-edge bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="The offer"
          title={`${formatPrice(TIERS.standard.priceCents)} → ${formatPrice(STANDARD_PROMO_PRICE)}. Same filing, lower price.`}
          subtitle={`A fixed ${formatPrice(PROMO_DISCOUNT_CENTS)} reduction on the complete filing package, shown before payment.`}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <Reveal
              key={card.title}
              delay={index * 120}
              className="group rounded-lg border border-paper-edge bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-ink">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Includes() {
  const items = [
    'Filled IRS Form 5472 + pro forma Form 1120 with the "Foreign-Owned U.S. DE" stamp and Part V supporting statement',
    "Review by a qualified tax accountant before anything is sent",
    "Reasonable cause statement for late filings under DIIRSP, drafted around your circumstances",
    "Fax delivery to the IRS Ogden PIN Unit (+1-855-887-7737) with no separate fax fee",
    "Timestamped fax transmission receipt emailed to you and stored in your portal",
    "Filing confirmation and email support from start to receipt",
    `Ready in ${STANDARD_TURNAROUND}, or within ${EXPRESS_TURNAROUND} on Express with the same ${formatPrice(PROMO_DISCOUNT_CENTS)} off`,
    "A reminder next March so the following year's deadline does not slip past you",
    "100% money-back guarantee if we fail to submit",
  ];

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Complete filing package"
          title={`What your ${formatPrice(STANDARD_PROMO_PRICE)} includes`}
          subtitle="One tax year, prepared, reviewed, signed, and delivered end to end."
        />
        <ul className="mt-10 grid gap-x-10 gap-y-4 md:grid-cols-2">
          {items.map((item, index) => (
            <Reveal as="li" key={item} delay={(index % 2) * 90} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-accent" />
              <span className="text-sm leading-relaxed text-slate-700">{item}</span>
            </Reveal>
          ))}
        </ul>
        <Reveal className="mt-10 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
          <p className="text-slate-700">
            You answer 12 questions — about 15 minutes — and sign once on screen. No printing, scanning, or mailing.
          </p>
          <Link href={START_URL} className="group mx-auto mt-5 block w-fit">
            <Button size="lg">
              Start filing
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <SectionHead
          eyebrow="Choose your turnaround"
          title={`${formatPrice(PROMO_DISCOUNT_CENTS)} off either filing tier`}
          subtitle="Both tiers include the same forms, accountant review, IRS fax delivery, and timestamped receipt. Only timing and support priority differ."
        />

        <div className="mx-auto mt-10 grid max-w-3xl items-stretch gap-6 sm:grid-cols-2">
          {TIER_ORDER.map((key, index) => (
            <TierCard key={key} slug={key} delay={index * 120} />
          ))}
        </div>

        <Reveal className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
                Filing more than one year?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Additional past tax years are {formatPrice(MULTI_YEAR_ADDON_CENTS)} each and are not discounted; the {formatPrice(PROMO_DISCOUNT_CENTS)} comes off once.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Tax years</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Was</th>
                  <th className="px-4 py-3 font-medium text-accent">Now</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MULTI_YEAR_ROWS.map((row) => (
                  <tr key={row.yearCount} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-ink">{row.yearCount}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <s>{formatPrice(row.fullTotal)}</s>
                    </td>
                    <td className="bg-accent-50 px-4 py-3 font-semibold text-ink">
                      {formatPrice(row.promoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            More than three years behind? Email{" "}
            <a className="font-medium text-accent hover:underline" href={`mailto:${ORG_EMAIL}`}>
              {ORG_EMAIL}
            </a>{" "}
            and we&apos;ll scope it before you pay.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function TierCard({ slug, delay }: { slug: Tier; delay: number }) {
  const tier = TIERS[slug];
  const highlighted = !!tier.highlight;

  return (
    <Reveal
      delay={delay}
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

      <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <s className="font-serif text-2xl text-slate-400">{formatPrice(tier.priceCents)}</s>
        <span className="font-serif text-5xl font-semibold tracking-tight text-ink">
          {formatPrice(promoTotalCents(PROMO_SRC, tier.priceCents))}
        </span>
        <span className="font-mono text-xs text-slate-500">/ filing</span>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-700">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href={tierUrl(slug)} className="mt-7 block">
        <Button
          size="lg"
          variant={slug === "standard" ? "primary" : "outline"}
          className="w-full transition-transform hover:-translate-y-0.5"
        >
          {tier.ctaLabel}
        </Button>
      </Link>
    </Reveal>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Answer 12 questions",
      body: "Complete the wizard in about 15 minutes the first year, or about 5 minutes when you return.",
    },
    {
      icon: FileCheck2,
      title: "Accountant review",
      body: "A qualified tax accountant checks the complete package and emails you if anything needs clarification.",
    },
    {
      icon: PenTool,
      title: "Sign once on screen",
      body: "Your canvas signature is embedded into every required signature box on the forms.",
    },
    {
      icon: Send,
      title: "We fax and store proof",
      body: "We send the signed package to the IRS Ogden PIN Unit and keep the timestamped transmission receipt in your portal.",
    },
  ];

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="How it works"
          title="From your answers to the IRS in four steps"
          subtitle="Form 5472 cannot be e-filed. Faxing to Ogden gives you dated proof of delivery."
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 90}
              className="group rounded-lg border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-accent text-sm font-medium text-white transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                  {index + 1}
                </span>
                <step.icon className="h-5 w-5 text-slate-400 transition-colors duration-300 group-hover:text-accent" />
              </div>
              <h3 className="font-medium text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ValueOfFiling() {
  const risks = [
    {
      title: "Never filed",
      body: "The LLC exists, money moved in and out, and Form 5472 never came up when the LLC was formed.",
    },
    {
      title: "Filed 5472 without the pro forma 1120",
      body: "Without the pro forma Form 1120 it attaches to, the IRS treats the return as never filed.",
    },
    {
      title: "Filed, but incomplete",
      body: "A blank Part V, missing supporting statement, or missing owner identifier is scored like a missing return.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-100">
            Why it is worth far more than {formatPrice(STANDARD_PROMO_PRICE)}
          </p>
          <p className="mt-5 font-serif text-6xl font-semibold tracking-tight text-white sm:text-7xl">
            $25,000
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-white sm:text-3xl">
            per form, per year under IRC § 6038A
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-300">
            The penalty applies when Form 5472 is late, incomplete, or not filed. There is no small-LLC exception for an entity with no revenue or US tax due.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {risks.map((risk, index) => (
            <Reveal
              key={risk.title}
              delay={index * 100}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent-100">
                Risk {index + 1}
              </p>
              <h3 className="mt-3 font-semibold text-white">{risk.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{risk.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-10 max-w-3xl border-t border-white/10 pt-8 text-center text-slate-300">
          Your discounted filing buys a complete package, accountant review, IRS delivery, and dated proof of when it arrived.
        </Reveal>
      </div>
    </section>
  );
}

function WhoItsFor() {
  const items = [
    "Non-US owners of a US single-member LLC in any state who need this year's filing done correctly",
    "Owners who only just discovered the requirement and are one, two, or three years behind",
    "Owners who received an IRS CP-15 notice or § 6038A letter and need a properly prepared late filing",
    "Owners of several LLCs who want every entity filed the same way each year",
    "CPAs and tax attorneys who want a foreign client's package prepared, reviewed, and faxed",
  ];

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <SectionHead
          eyebrow="Who this is for"
          title="Foreign owners, late filers, and the advisers helping them"
          subtitle="Built for foreign-owned US single-member LLC information returns, not general business tax filing."
        />
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item}
              delay={(index % 2) * 90}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-accent" />
              <span className="text-sm leading-relaxed text-slate-700">{item}</span>
            </Reveal>
          ))}
        </ul>
        <Reveal className="mt-8 rounded-lg border border-accent/20 bg-accent-50 px-6 py-5 text-center text-sm leading-relaxed text-slate-700">
          If your LLC had even one reportable transaction last year — including the wire sent to open its US bank account — you are in scope, revenue or no revenue.
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-paper-edge bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <SectionHead
          eyebrow="FAQ"
          title={`Questions about the ${formatPrice(PROMO_DISCOUNT_CENTS)} offer`}
        />
        <div className="mt-10 space-y-4">
          {FAQS.map((faq, index) => (
            <Reveal key={faq.q} delay={index * 60}>
              <FaqItem q={faq.q} a={faq.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border border-slate-200 bg-white p-4 open:bg-slate-50">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
        {q}
        <span className="ml-4 text-slate-400 transition group-open:rotate-180">▾</span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{a}</p>
    </details>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(55% 60% at 50% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
        }}
      />
      <Reveal as="div" className="relative mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-serif text-3xl font-semibold text-white text-balance sm:text-4xl">
          Start now at {formatPrice(STANDARD_PROMO_PRICE)}.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          The {formatPrice(TIERS.standard.priceCents)} list price is shown struck through on the payment screen. Get 100% back if we fail to submit your filing.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={START_URL} className="group block w-full sm:w-auto">
            <Button size="lg" className="w-full bg-white !text-ink shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto">
              Start filing — {formatPrice(STANDARD_PROMO_PRICE)}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href={tierUrl("express")} className="block w-full sm:w-auto">
            <Button size="lg" variant="ghost" className="w-full !text-white hover:bg-white/10 sm:w-auto">
              Express — {formatPrice(EXPRESS_PROMO_PRICE)}
            </Button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 leading-relaxed text-slate-600">{subtitle}</p>}
    </Reveal>
  );
}
