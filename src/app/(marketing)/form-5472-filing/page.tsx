import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  PenTool,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttributionSeed } from "@/components/AttributionSeed";
import { FaxReceiptProof } from "@/components/FaxReceiptProof";
import { Reveal } from "@/components/Reveal";
import {
  EXPRESS_TURNAROUND,
  MULTI_YEAR_ADDON_CENTS,
  STANDARD_TURNAROUND,
  TIERS,
  TIER_ORDER,
  type Tier,
} from "@/lib/pricing";
import { ORG_EMAIL, pageOpenGraph, TRUSTPILOT_PROFILE_URL } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

// Google Ads funnel attribution for this list-price landing page.
const ATTRIBUTION_SRC = "gads";
const START_URL = `/start?v=rail&src=${ATTRIBUTION_SRC}`;

function tierUrl(slug: Tier) {
  const sep = START_URL.includes("?") ? "&" : "?";
  return `${START_URL}${sep}tier=${slug}`;
}

const PAGE_TITLE = `Form 5472 Filing Service — ${formatPrice(TIERS.standard.priceCents)}, Done For You | Form5472 Prep`;
const PAGE_DESCRIPTION = `Accountant-reviewed Form 5472 + pro forma 1120 for ${formatPrice(TIERS.standard.priceCents)}, with IRS Ogden fax delivery and a timestamped receipt included.`;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: "/form-5472-filing" },
  openGraph: pageOpenGraph({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: "/form-5472-filing",
  }),
};

const FAQS = [
  {
    q: "What's included for the price?",
    a: `The price includes Form 5472 + pro forma Form 1120 with the Part V supporting statement, review by a qualified tax accountant, a reasonable cause letter if you're late, IRS fax delivery, a timestamped receipt, filing confirmation, and a reminder before next year's deadline. There is no separate fax fee, setup fee, or subscription. Additional past tax years are ${formatPrice(MULTI_YEAR_ADDON_CENTS)} each.`,
  },
  {
    q: "What's the difference between Standard and Express?",
    a: `Turnaround only. Standard is ready in ${STANDARD_TURNAROUND} at ${formatPrice(TIERS.standard.priceCents)}; Express is ready within ${EXPRESS_TURNAROUND} at ${formatPrice(TIERS.express.priceCents)}. Both include the same documents and accountant review. Express buys speed and priority email support.`,
  },
  {
    q: "Is fax filing to the IRS really included?",
    a: "Yes. Fax delivery to the IRS Ogden PIN Unit is included on every plan with no separate fee, and you receive a timestamped transmission receipt as proof of filing.",
  },
  {
    q: "What if I'm two or three years late (DIIRSP)?",
    a: `Additional past tax years are ${formatPrice(MULTI_YEAR_ADDON_CENTS)} each. All delinquent years go to the IRS together under DIIRSP with one comprehensive reasonable cause statement, and the exact totals are shown in the multi-year table above. If you're more than three years behind, email ${ORG_EMAIL} to scope it first.`,
  },
  {
    q: "I already received an IRS notice — can you still help?",
    a: "Yes. We help owners who received an IRS CP-15 notice or §6038A letter and need a properly prepared late filing, including the required forms and a reasonable cause statement based on their circumstances.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No. One price per filing includes IRS fax delivery, accountant review, and the timestamped receipt. There is no subscription, no checkout upsell, and no separate fax fee.",
  },
];

const MULTI_YEAR_ROWS = [1, 2, 3].map((yearCount) => {
  const fullTotal =
    TIERS.standard.priceCents + (yearCount - 1) * MULTI_YEAR_ADDON_CENTS;
  return {
    yearCount,
    fullTotal,
  };
});

export default function Form5472FilingLandingPage() {
  return (
    <main className="bg-white">
      <AttributionSeed src="gads" />
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
        <div className="grid items-center gap-0 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div className="contents lg:block lg:animate-fade-in-up">
            <p className="order-1 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Done-for-you Form 5472 · Foreign-owned US single-member LLCs
            </p>
            <h1 className="order-2 mt-5 font-serif text-3xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              File your Form 5472 for {formatPrice(TIERS.standard.priceCents)}.
            </h1>
            <p className="order-3 mt-4 font-serif text-2xl leading-snug text-slate-200 sm:text-3xl">
              Accountant-reviewed, faxed to the IRS, timestamped receipt in your inbox.
            </p>
            <p className="order-5 mt-6 max-w-xl text-lg leading-relaxed text-slate-300 lg:order-none">
              Get an accountant-reviewed Form 5472 + pro forma 1120, faxed to the IRS Ogden PIN Unit with a timestamped receipt as proof of filing. The complete package is ready in {STANDARD_TURNAROUND}, or within {EXPRESS_TURNAROUND} on Express.
            </p>
          </div>

          <div className="order-4 mt-8 w-full animate-fade-in-up animate-delay-200 lg:order-none lg:mt-0">
            <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-2xl shadow-black/30 ring-1 ring-black/5 sm:p-7">
              <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-soft-pulse" />
                Start filing now
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2">
                <span className="font-serif text-5xl font-semibold tracking-tight text-ink">
                  {formatPrice(TIERS.standard.priceCents)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Standard · ready in {STANDARD_TURNAROUND}
              </p>

              <Link href={START_URL} data-attribution={ATTRIBUTION_SRC} className="group mt-6 block">
                <Button size="lg" className="h-14 w-full text-base shadow-lg shadow-accent/25 transition-all duration-200 hover:-translate-y-0.5">
                  Start filing — {formatPrice(TIERS.standard.priceCents)}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <a
                href={TRUSTPILOT_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 hover:text-accent hover:underline"
              >
                <span aria-hidden="true" className="text-[#00b67a]">★</span>
                See our reviews on Trustpilot
              </a>
              <Link
                href={tierUrl("express")}
                data-attribution={ATTRIBUTION_SRC}
                className="group mt-2 flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-accent"
              >
                Need it within {EXPRESS_TURNAROUND}? Express&nbsp;
                {formatPrice(TIERS.express.priceCents)}
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
                Pay once per filing. No subscription. Price shown is what Stripe charges.
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
      icon: FileCheck2,
      title: "Nothing to assemble yourself",
      body: "We prepare the complete Form 5472 + pro forma 1120 package, including the supporting statement and a reasonable cause letter when needed.",
    },
    {
      icon: ShieldCheck,
      title: "Reviewed by a qualified tax accountant",
      body: "A qualified tax accountant checks the completed filing before anything is signed or sent to the IRS.",
    },
    {
      icon: Send,
      title: "Proof of filing, stored for you",
      body: "We keep the timestamped IRS fax transmission receipt in your portal so you can retrieve dated proof of filing when you need it.",
    },
  ];

  return (
    <section className="border-b border-paper-edge bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="The offer"
          title="Complete filing, one flat price"
          subtitle="Every filing gets the same accountant-reviewed package and IRS fax delivery — priced once, shown before you pay."
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
    "Reasonable cause statement for late filings under the IRS Delinquent International Information Return Submission Procedures (DIIRSP), drafted around your circumstances",
    "Fax delivery to the IRS Ogden PIN Unit (+1-855-887-7737) with no separate fax fee",
    "Timestamped fax transmission receipt emailed to you and stored in your portal",
    "Filing confirmation and email support from start to receipt",
    `Ready in ${STANDARD_TURNAROUND}, or within ${EXPRESS_TURNAROUND} on Express`,
    "A reminder next March so the following year's deadline does not slip past you",
    "100% money-back guarantee if we fail to submit",
  ];

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Complete filing package"
          title={`What your ${formatPrice(TIERS.standard.priceCents)} includes`}
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
          <Link href={START_URL} data-attribution={ATTRIBUTION_SRC} className="group mx-auto mt-5 block w-fit">
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
          eyebrow="Pricing"
          title="Choose your turnaround"
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
                Additional past tax years are {formatPrice(MULTI_YEAR_ADDON_CENTS)} each; one reasonable-cause statement covers all delinquent years (DIIRSP).
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Tax years</th>
                  <th className="px-4 py-3 font-medium text-accent">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MULTI_YEAR_ROWS.map((row) => (
                  <tr key={row.yearCount} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-ink">{row.yearCount}</td>
                    <td className="bg-accent-50 px-4 py-3 font-semibold text-ink">
                      {formatPrice(row.fullTotal)}
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
        <span className="font-serif text-5xl font-semibold tracking-tight text-ink">
          {formatPrice(tier.priceCents)}
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

      <Link href={tierUrl(slug)} data-attribution={ATTRIBUTION_SRC} className="mt-7 block">
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
      body: "The LLC exists, money moved in and out, and no one mentioned Form 5472 during formation.",
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
            Why it is worth far more than {formatPrice(TIERS.standard.priceCents)}
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
          Your filing includes the complete package, accountant review, IRS delivery, and dated proof of when it arrived.
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
          title="Common filing questions"
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
          Start your Form 5472 filing — {formatPrice(TIERS.standard.priceCents)}.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          Get 100% back if we fail to submit your filing.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={START_URL} data-attribution={ATTRIBUTION_SRC} className="group block w-full sm:w-auto">
            <Button size="lg" className="w-full bg-white !text-ink shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto">
              Start filing — {formatPrice(TIERS.standard.priceCents)}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href={tierUrl("express")} data-attribution={ATTRIBUTION_SRC} className="block w-full sm:w-auto">
            <Button size="lg" variant="ghost" className="w-full !text-white hover:bg-white/10 sm:w-auto">
              Express — {formatPrice(TIERS.express.priceCents)}
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
