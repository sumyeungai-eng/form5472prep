import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  FileClock,
  RotateCw,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { TIERS } from "@/lib/pricing";
import {
  CONTENT_LAST_REVIEWED,
  SITE_URL,
  SPEAKABLE,
  breadcrumbList,
  organizationNode,
  pageOpenGraph,
} from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { DeadlineCalculator } from "./DeadlineCalculator";

const PAGE_PATH = "/form-5472-deadline-calculator";
const PAGE_TITLE = "Form 5472 Deadline Calculator — When Is Your Filing Due?";
const PAGE_DESCRIPTION =
  "Free Form 5472 deadline calculator for foreign-owned LLCs. Check April 15, dissolution short-year, weekend roll, and Form 7004 dates.";

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

const deadlineRules = [
  {
    icon: CalendarDays,
    title: "April 15 rule",
    body: "For a calendar-year foreign-owned single-member LLC, Form 5472 attaches to a pro forma Form 1120 and is due April 15 after the tax year ends.",
  },
  {
    icon: RotateCw,
    title: "Weekend roll",
    body: "When the computed due date lands on a Saturday or Sunday, the filing deadline moves to the next Monday.",
  },
  {
    icon: FileClock,
    title: "Dissolution short year",
    body: "If the LLC dissolved during the tax year, the final short-year return is due on the 15th day of the fourth month after the month of dissolution.",
  },
  {
    icon: CalendarClock,
    title: "Form 7004 extension",
    body: "A timely Form 7004 extends the Form 5472 package to October 15, with the same weekend-roll rule applied to the extended date.",
  },
];

const DEADLINE_FAQS = [
  {
    q: "What if the Form 5472 deadline already passed?",
    a: "DIIRSP, the IRS Delinquent International Information Return Submission Procedures, with a reasonable-cause statement is the standard remedy for a late Form 5472 package.",
  },
  {
    q: "Does having no income or no reportable transactions change the deadline?",
    a: "No. The deadline itself does not change. Form 5472 is triggered by reportable transactions, not income; if reportable transactions exist, the same due date applies.",
  },
  {
    q: "Can this Form 5472 be e-filed?",
    a: "No. Form 5472 for this filer type is fax or mail only. Our service prepares the package and faxes it to the IRS Ogden PIN Unit.",
  },
  {
    q: "How does the Form 7004 extension work?",
    a: "Form 7004 must be filed by the original April 15 deadline. If it is timely, it extends the Form 5472 package due date to October 15.",
  },
  {
    q: "Does a first-year LLC still have this deadline?",
    a: "Yes. The year of formation counts if the LLC had reportable transactions during that year, and the Form 5472 package follows the same deadline rules.",
  },
];

export default function Form5472DeadlineCalculatorPage() {
  return (
    <main className="bg-white">
      <DeadlineStructuredData />
      <Hero />
      <HowDeadlineWorks />
      <Faq />
      <FinalCta />
    </main>
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
            "radial-gradient(60% 55% at 22% 0%, rgba(30,58,138,0.55) 0%, rgba(14,27,51,0) 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
            Free tool
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Form 5472 deadline calculator.
          </h1>
          <p data-speakable className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            Form 5472 plus the pro forma Form 1120 for a foreign-owned single-member LLC is due April 15 of the following year, and this calculator handles weekend rolls and dissolution short-years below.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/start?src=tool-deadline"
              className="group inline-flex h-12 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Start filing
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#calculator"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Calculate your date
            </a>
          </div>
        </div>
        <DeadlineCalculator />
      </div>
    </section>
  );
}

function HowDeadlineWorks() {
  return (
    <section className="border-b border-paper-edge bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="How the deadline works"
          title="One rule, adjusted for timing facts"
          subtitle="The calculator applies the filing year, dissolution date, and extension status to the same due-date logic used in the filing workflow."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {deadlineRules.map((rule) => (
            <div
              key={rule.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent">
                <rule.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-ink">{rule.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{rule.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <SectionHead eyebrow="FAQ" title="Deadline questions" />
        <div className="mt-10 space-y-4">
          {DEADLINE_FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
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
      <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-serif text-3xl font-semibold text-white text-balance sm:text-4xl">
          File Form 5472 with the deadline handled.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          Get the Form 5472 package prepared, reviewed, and faxed to the IRS from {formatPrice(TIERS.standard.priceCents)}.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/start?src=tool-deadline"
            className="group inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto"
          >
            Start filing
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
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
    <div className="mx-auto max-w-2xl text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 leading-relaxed text-slate-600">{subtitle}</p>}
    </div>
  );
}

function DeadlineStructuredData() {
  const url = `${SITE_URL}${PAGE_PATH}`;

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Form 5472 Deadline Calculator",
    url,
    applicationCategory: "FinanceApplication",
    dateModified: CONTENT_LAST_REVIEWED,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: organizationNode(),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: DEADLINE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = breadcrumbList([
    // BreadcrumbList JSON-LD is built by the shared helper so site URLs stay consistent.
    { name: "Home", path: "/" },
    { name: "Deadline calculator", path: PAGE_PATH },
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
