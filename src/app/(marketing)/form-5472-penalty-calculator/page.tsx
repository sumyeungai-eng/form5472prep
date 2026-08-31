import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileQuestion,
  FileWarning,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import {
  CONTENT_LAST_REVIEWED,
  SPEAKABLE,
  breadcrumbList,
  organizationNode,
  pageOpenGraph,
} from "@/lib/seo";
import {
  CONTINUATION_GRACE_DAYS,
  CONTINUATION_PER_PERIOD_CENTS,
  PENALTY_PER_FORM_CENTS,
} from "@/lib/penalty";
import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { PenaltyCalculator } from "./PenaltyCalculator";

const PAGE_PATH = "/form-5472-penalty-calculator";
const PAGE_TITLE = "Form 5472 Penalty Calculator — What Late Filing Costs";
const PAGE_DESCRIPTION =
  "Estimate Form 5472 late-filing exposure, see IRS penalty citations, and review the DIIRSP reasonable-cause path for catching up.";

const PENALTY_FAQS = [
  {
    q: "Is the Form 5472 penalty really automatic?",
    a: `Yes. IRC §6038A(d) provides an initial ${formatPrice(PENALTY_PER_FORM_CENTS)} penalty when a reporting corporation fails to furnish required Form 5472 information on time or files an incomplete return.`,
  },
  {
    q: "Can the penalty be abated?",
    a: "Yes, but there are no guarantees. Many late filers pursue reasonable-cause relief through DIIRSP, and first-time late filers are frequently successful when the facts support reasonable cause.",
  },
  {
    q: "What is a CP15 notice?",
    a: "A CP15 is an IRS notice assessing a civil penalty. For Form 5472, it is commonly the notice that starts the post-notice timeline for continuation penalties if the filing is still not corrected.",
  },
  {
    q: "Does having no income exempt me from the penalty?",
    a: "No. A foreign-owned disregarded LLC can still have a Form 5472 and pro forma Form 1120 filing obligation even when it had no income, because reportable transactions can include contributions, distributions, and other owner-LLC activity.",
  },
  {
    q: "Is there a statute of limitations?",
    a: "There effectively is not one until a complete or substantially complete return is filed.",
    href: "/blog/form-5472-statute-of-limitations",
    linkText: "Read the Form 5472 statute of limitations guide.",
  },
] as const;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: pageOpenGraph({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: PAGE_PATH,
  }),
  robots: { index: true, follow: true },
};

export default function Form5472PenaltyCalculatorPage() {
  return (
    <>
      <PenaltyCalculatorStructuredData />
      <main className="bg-white">
        <Hero />
        <PenaltyCalculator />
        <HowPenaltyWorks />
        <Faq />
        <FinalCta />
      </main>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(55% 55% at 20% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <p className="mb-6 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Free tool
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Form 5472 penalty calculator.
          </h1>
          <p
            data-speakable
            className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300"
          >
            The IRS assesses $25,000 per Form 5472, per year, automatically, and
            another $25,000 per 30 days once 90 days pass after a notice.
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            Use this as a statutory exposure estimate, then compare it with the
            ordinary catch-up route: file the missing Form 5472 package and
            include a reasonable-cause statement under DIIRSP.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
            Calm next step
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">
            Estimate first, then fix the filing.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The number below is not a prediction. It is a statutory framework
            calculator paired with the relief path late filers commonly use.
          </p>
          <Link href="/start?src=tool-penalty" className="group mt-5 block">
            <Button className="h-12 w-full gap-2">
              File the late years — {formatPrice(TIERS.standard.priceCents)}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowPenaltyWorks() {
  const blocks = [
    {
      icon: FileWarning,
      title: "Initial penalty",
      body: `The initial penalty is ${formatPrice(PENALTY_PER_FORM_CENTS)} per Form 5472, per year. It applies automatically when the required information is late, missing, or incomplete.`,
    },
    {
      icon: Clock,
      title: "After a notice",
      body: `After an IRS notice, there is a ${CONTINUATION_GRACE_DAYS}-day correction period. If the filing is still not fixed, the statute adds ${formatPrice(CONTINUATION_PER_PERIOD_CENTS)} for each 30-day period and does not cap that continuation amount.`,
    },
    {
      icon: FileQuestion,
      title: "Common triggers",
      body: "The usual issues are never filing, filing Form 5472 without the required pro forma Form 1120, or filing an incomplete Form 5472 package.",
    },
    {
      icon: ShieldCheck,
      title: "Relief path",
      body: "DIIRSP filings pair the late information returns with a reasonable-cause statement. The IRS can abate penalties when the facts support reasonable cause.",
    },
  ];

  return (
    <section className="border-b border-slate-100 bg-paper py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            How the penalty works
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
            The rule is mechanical, but the response should be measured.
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {blocks.map((block) => (
            <div
              key={block.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent">
                <block.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                {block.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {block.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-7 space-y-3">
          {PENALTY_FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-slate-200 bg-white p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                {faq.q}
                <span className="text-accent transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {faq.a}{" "}
                {"href" in faq ? (
                  <Link
                    href={faq.href}
                    className="font-medium text-accent underline underline-offset-4 hover:no-underline"
                  >
                    {faq.linkText}
                  </Link>
                ) : null}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-accent py-16 text-center text-white">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight">
          Ready to file the late years?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-accent-100">
          We prepare the missing Form 5472 package, pro forma Form 1120, and
          reasonable-cause statement for DIIRSP catch-up filings.
        </p>
        <Link href="/start?src=tool-penalty" className="group mt-6 inline-block">
          <Button className="min-h-12 gap-2 bg-white px-6 text-accent hover:bg-accent-50">
            Start filing — {formatPrice(TIERS.standard.priceCents)}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function PenaltyCalculatorStructuredData() {
  const url = `${env.appUrl}${PAGE_PATH}`;

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: PAGE_TITLE,
    url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    dateModified: CONTENT_LAST_REVIEWED,
    provider: organizationNode(),
    offers: {
      "@type": "Offer",
      name: "Form 5472 penalty calculator",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PENALTY_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: "href" in faq ? `${faq.a} ${faq.linkText}` : faq.a,
      },
    })),
  };

  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Penalty calculator", path: PAGE_PATH },
  ]);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: PAGE_TITLE,
    dateModified: CONTENT_LAST_REVIEWED,
    speakable: SPEAKABLE,
  };

  return (
    <>
      <JsonLd data={webApplication} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPage} />
    </>
  );
}
