import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ExternalLink,
  FileClock,
  RotateCw,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { TIERS } from "@/lib/pricing";
import { SITE_URL, SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import {
  LAST_REVIEWED_ISO,
  LAST_REVIEWED_LABEL,
  SOURCES,
  type SourceId,
} from "@/lib/tools/deadline/sources";
import { DeadlineCalculator } from "./DeadlineCalculator";

const PAGE_PATH = "/form-5472-deadline-calculator";
const PAGE_TITLE = "Form 5472 Deadline Calculator — When Is Your Filing Due?";
const PAGE_DESCRIPTION =
  "Free Form 5472 deadline calculator for foreign-owned LLCs. Check April 15, dissolution short-year, weekend roll, and Form 7004 dates.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  ...pageMeta({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: PAGE_PATH,
  }),
  robots: { index: true, follow: true },
};

const deadlineRules: Array<{
  icon: typeof CalendarDays;
  title: string;
  body: string;
  sources: SourceId[];
}> = [
  {
    icon: CalendarDays,
    title: "What is the April 15 rule?",
    body: "A foreign-owned single-member LLC files Form 5472 with a pro forma Form 1120 by the due date of that Form 1120: the 15th day of the 4th month after its tax year ends, which is April 15 for a calendar year. We use that date as the starting point before checking whether a dissolution short year, a timely Form 7004, or a weekend or legal holiday changes the final deadline.",
    sources: ["i5472", "i1120", "irc6072"],
  },
  {
    icon: RotateCw,
    title: "How does the weekend and holiday roll work?",
    body: "When a due date falls on a Saturday, Sunday or legal holiday, filing on the next business day counts as on time. The legal holidays are those of the District of Columbia, so DC Emancipation Day on April 16 counts too. The calculator applies the roll last, to the regular, short-year or extended date.",
    sources: ["irc7503", "p509", "i1120"],
  },
  {
    icon: FileClock,
    title: "When does a dissolution short year apply?",
    body: "A dissolution short year applies when the LLC dissolved during the tax year. A dissolved corporation generally files by the 15th day of the 4th month after the date it dissolved; the calculator uses the 15th of the 4th month after the month of dissolution (the 3rd month for a June dissolution in a year that began before 2026, below), then applies the same weekend and holiday roll.",
    sources: ["i1120"],
  },
  {
    icon: CalendarRange,
    title: "What changes for a year ending in June?",
    body: "A tax year ending June 30 that began before January 1, 2026 is due on the 15th day of the 3rd month after it ends (September 15), and a timely Form 7004 extends it by 7 months instead of 6 (to April 15). A short year ending anytime in June is treated as ending June 30, so this covers an LLC that dissolved in June 2025 or earlier. For tax years beginning in 2026 or later, the general 4th-month date and 6-month extension apply.",
    sources: ["i1120", "i7004", "plaw11441"],
  },
  {
    icon: CalendarClock,
    title: "How does a Form 7004 extension work?",
    body: "A Form 7004 filed by the regular due date gives an automatic extension, generally 6 months: October 15 for a calendar year, or six months after a short-year due date (seven for a June year-end that began before 2026). The calculator adds the extension to the unrolled due date, then applies the weekend and holiday roll. It takes your word that the Form 7004 was filed on time.",
    sources: ["i7004", "i5472"],
  },
];

const DEADLINE_FAQS = [
  {
    q: "What if the Form 5472 deadline already passed?",
    a: "If you are not under IRS examination or investigation and the IRS hasn't contacted you about the missing return, its Delinquent International Information Return Submission Procedures (DIIRSP) say to file it through normal filing procedures, optionally with a reasonable-cause statement. Penalties may still be assessed.",
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
    a: "Form 7004 must be filed by the regular due date of the return, April 15 for a calendar-year LLC. If it is timely, the automatic extension, generally 6 months, moves the Form 5472 package due date to October 15.",
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
      <HowWeCalculate />
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
            Form 5472 plus the pro forma Form 1120 for a calendar-year foreign-owned single-member LLC is due April 15 of the following year, and this calculator handles weekend and holiday rolls, dissolution short years and Form 7004 extensions below.
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

function SourceLink({ id }: { id: SourceId }) {
  const source = SOURCES[id];
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-start gap-1 break-words font-medium text-accent underline underline-offset-4 hover:no-underline"
    >
      <span className="min-w-0">{source.label}</span>
      <ExternalLink className="mt-1 h-3 w-3 shrink-0" aria-hidden />
    </a>
  );
}

function HowWeCalculate() {
  return (
    <section id="how-we-calculate" className="border-b border-paper-edge bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHead
          eyebrow="How we calculate this"
          title="How does the deadline rule work?"
          subtitle="The calculator applies the filing year, dissolution date, and extension status to the same due-date logic used in our filing workflow. We start with April 15, switch to the dissolution short-year rule when needed (including the earlier June rule for years that began before 2026), add the Form 7004 extension for a timely filing, and move a date that lands on a weekend or DC legal holiday to the next business day."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {deadlineRules.map((rule) => (
            <div key={rule.title} className="min-w-0 rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent">
                <rule.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-ink">{rule.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{rule.body}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {rule.sources.map((id) => (
                  <li key={id} className="min-w-0">
                    <SourceLink id={id} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-ink">What the calculator does not cover</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>
              It assumes a calendar tax year. A foreign-owned LLC uses its owner&apos;s U.S. tax year
              or, if the owner has none, the calendar year. <SourceLink id="i5472" />
            </li>
            <li>
              A missed deadline: if the IRS hasn&apos;t contacted you, the IRS says to file the late
              return through normal filing procedures, and penalties may still be assessed.{" "}
              <SourceLink id="diirsp" />
            </li>
          </ul>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Last reviewed {LAST_REVIEWED_LABEL}</span>{" "}
          against the Form 1120, Form 7004 and Form 5472 instructions, IRC §§6072 and 7503, and
          Pub. L. 114-41 §2006.
          General information, not tax advice.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <SectionHead eyebrow="FAQ" title="What are common deadline questions?" />
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
    operatingSystem: "Web",
    isAccessibleForFree: true,
    description: PAGE_DESCRIPTION,
    dateModified: LAST_REVIEWED_ISO,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: organizationNode(),
    author: organizationNode(),
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
    description: PAGE_DESCRIPTION,
    dateModified: LAST_REVIEWED_ISO,
    lastReviewed: LAST_REVIEWED_ISO,
    speakable: SPEAKABLE,
    publisher: organizationNode(),
    citation: Object.values(SOURCES).map((source) => ({
      "@type": "CreativeWork",
      name: source.label,
      url: source.url,
    })),
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
