import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarClock, CalendarDays, FileClock, RotateCw, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { TIERS } from "@/lib/pricing";
import { SITE_URL, SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { buildComplianceCalendar } from "@/lib/tools/compliance-calendar/calendar";
import { FEDERAL_SOURCES } from "@/lib/tools/compliance-calendar/federal";
import { formatLongDate, formatShortDate } from "@/lib/tools/state-fees/dates";
import { LAST_REVIEWED, LAST_REVIEWED_LABEL, STATE_FEES } from "@/lib/tools/state-fees/data";
import { ComplianceCalendar } from "./ComplianceCalendar";

const PAGE_PATH = "/foreign-owned-llc-compliance-calendar";
const FEES_PATH = "/llc-annual-fees-by-state";
const PAGE_TITLE = "Foreign-Owned LLC Compliance Calendar — Federal and State Deadlines";
const PAGE_DESCRIPTION =
  "Free deadline calendar for foreign-owned single-member LLCs: Form 5472, Form 7004 and your state's annual tax or report, with an .ics download.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  ...pageMeta({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: PAGE_PATH }),
  robots: { index: true, follow: true },
};

// Worked example rendered on the server with a fixed "as of" date so the
// static HTML carries real, citable dates (the live tool recomputes from today).
const EXAMPLE = {
  input: { state: "WY" as const, formed: "2024-03-10", fyeMonth: 12, extension: false },
  asOf: LAST_REVIEWED,
};

const FEDERAL_RULES = [
  {
    icon: CalendarDays,
    title: "Form 5472 + pro forma Form 1120",
    body: "Due the 15th day of the 4th month after the LLC's tax year ends — 15 April for a calendar year. The first, short year from formation counts too.",
    source: FEDERAL_SOURCES.i1120,
  },
  {
    icon: CalendarClock,
    title: "Form 7004 extension",
    body: "Filed by the original due date, it adds 6 months — 15 October for a calendar year. Write \"Foreign-owned U.S. DE\" across the top and fax or mail it.",
    source: FEDERAL_SOURCES.i7004,
  },
  {
    icon: RotateCw,
    title: "Weekends and holidays",
    body: "A federal date that falls on a Saturday, Sunday or District of Columbia legal holiday moves to the next business day.",
    source: FEDERAL_SOURCES.irc7503,
  },
  {
    icon: FileClock,
    title: "June 30 fiscal years",
    body: "Tax years ending 30 June and beginning before 2026 are due the 15th day of the 3rd month, with a 7-month extension. From 2026 they follow the normal rule.",
    source: FEDERAL_SOURCES.june30Rule,
  },
];

const CALENDAR_FAQS = [
  {
    q: "What is the Form 5472 deadline for a foreign-owned LLC?",
    a: "The 15th day of the 4th month after the LLC's tax year ends — 15 April for a calendar-year LLC. A timely Form 7004 extends it by 6 months, to 15 October. Weekend and holiday dates move to the next business day.",
  },
  {
    q: "Does my LLC use a calendar year or a fiscal year?",
    a: "The IRS says a foreign-owned disregarded LLC uses its owner's US tax year or, if the owner has none, the calendar year. If the owner has no US tax year, the LLC's year ends 31 December.",
  },
  {
    q: "Does a foreign-owned LLC still need to file a BOI report?",
    a: "No. FinCEN exempted every US-formed company from BOI reporting in its March 2025 interim final rule and made that permanent in a final rule effective 14 August 2026. Foreign-formed companies registered in a US state are the exception.",
  },
  {
    q: "Do I file Form 5472 for the year the LLC was formed?",
    a: "Usually yes. The first tax year runs from the formation date to the first year end, and money the owner put in or paid to set up the LLC is a reportable transaction for that year.",
  },
  {
    q: "Are the state dates moved for weekends too?",
    a: "Not by the calendar. It shows each state's date as the state publishes it; only federal dates are moved under the IRS weekend and holiday rule. Where a state allows the next business day, as Texas and California do, the entry says so — otherwise pay by the date shown.",
  },
  {
    q: "How do I add these deadlines to Google Calendar or Outlook?",
    a: "Use \"Add to calendar (.ics)\". The file adds each deadline as an all-day event with a 14-day reminder and a link to the official source; Google Calendar, Apple Calendar and Outlook all import it.",
  },
];

export default function ComplianceCalendarPage() {
  const states = STATE_FEES.map((s) => ({ code: s.code, name: s.name })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const example = buildComplianceCalendar(EXAMPLE.input, EXAMPLE.asOf, 18);
  const exampleState = STATE_FEES.find((s) => s.code === EXAMPLE.input.state)!;

  return (
    <div className="bg-white">
      <CalendarStructuredData />
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
        <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-14">
          <div className="min-w-0">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-100">Free tool</p>
            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Foreign-owned LLC compliance calendar.
            </h1>
            <p data-speakable className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
              A foreign-owned single-member LLC has one federal filing of its own each year: Form 5472 attached to a pro forma
              Form 1120, due the 15th day of the 4th month after its tax year ends — 15 April for a calendar year, or
              15 October with a timely Form 7004. On top of that comes its state&apos;s annual tax or report. US-formed
              LLCs no longer file FinCEN BOI reports.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              Enter your state and formation date to get every date for the next 18 months, each with its official
              source, as a list you can share or add to your calendar. Comparing states first? See{" "}
              <Link href={FEES_PATH} className="font-semibold text-white underline underline-offset-2">
                LLC annual fees by state
              </Link>
              .
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start?src=tool-calendar"
                className="group inline-flex h-12 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Start filing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#calendar"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Build my calendar
              </a>
            </div>
          </div>
          <div className="min-w-0">
            <ComplianceCalendar states={states} />
          </div>
        </div>
      </section>

      <section className="border-b border-paper-edge bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Federal deadlines"
            title="Which federal deadlines apply to a foreign-owned LLC?"
            subtitle="One return a year: Form 5472 attached to a pro forma Form 1120, filed by fax or mail. The optional Form 7004 extension is the only other federal date the calendar lists."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEDERAL_RULES.map((rule) => (
              <div key={rule.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent">
                  <rule.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{rule.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{rule.body}</p>
                <a
                  href={rule.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
                >
                  {rule.source.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="State deadlines"
            title="When is each state's annual fee or report due?"
            subtitle="The recurring state filing for a domestic LLC in the ten states foreign owners use most. Amounts, penalties and sources are on the fees page."
          />
          <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">State LLC annual filing due dates</caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">State</th>
                  <th scope="col" className="px-4 py-3 font-semibold">What is due</th>
                  <th scope="col" className="px-4 py-3 font-semibold">When</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...STATE_FEES]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((s) => (
                    <tr key={s.code} className="border-t border-slate-100 align-top">
                      <th scope="row" className="px-4 py-3 font-semibold text-ink">
                        <a href={`${FEES_PATH}?state=${s.code}`} className="hover:text-accent hover:underline">
                          {s.name}
                        </a>
                      </th>
                      <td className="px-4 py-3 text-slate-700">{s.feeName}</td>
                      <td className="px-4 py-3 text-slate-700">{s.headlineDue}</td>
                      <td className="px-4 py-3 font-mono text-[13px] text-ink">{s.headlineAmount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-paper-edge bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Worked example"
            title="What does the calendar show for a Wyoming LLC?"
            subtitle={`A ${exampleState.name} LLC formed on ${formatLongDate(EXAMPLE.input.formed)}, calendar tax year, no extension — deadlines for 18 months from ${formatLongDate(EXAMPLE.asOf)}.`}
          />
          <ol className="mt-8 space-y-3">
            {example.events.map((event) => (
              <li key={event.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-mono text-sm font-semibold text-ink">
                  <time dateTime={event.date}>{formatShortDate(event.date)}</time>
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {event.title}
                  {event.amount ? <span className="font-normal text-slate-600"> · {event.amount}</span> : null}
                </p>
                <p className="mt-1 text-sm text-slate-600">{event.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <ShieldCheck className="mt-1 h-6 w-6 flex-none text-accent" />
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">Is there a BOI deadline?</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                No. FinCEN&apos;s interim final rule published on 26 March 2025 exempted every company created in the
                United States from beneficial ownership information (BOI) reporting, and a final rule issued on 11
                August 2026 (effective 14 August 2026) made that permanent. A US-formed LLC with a foreign owner
                therefore has no BOI report to file. Companies formed outside the US that register to do business in a
                US state are still reporting companies.
              </p>
              <a
                href={FEDERAL_SOURCES.boi.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
              >
                {FEDERAL_SOURCES.boi.label}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-paper-edge bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead eyebrow="Method" title="How we calculate this" />
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              The LLC&apos;s first tax year runs from its formation date to the first year end you choose; each later
              year is twelve months. For every year we take the 15th day of the 4th month after the year end (the
              Form 1120 due date the Form 5472 instructions point to), add 6 months when you plan a Form 7004, and move
              any Saturday, Sunday or District of Columbia holiday to the next business day. This is the same date
              logic as our{" "}
              <Link href="/form-5472-deadline-calculator" className="font-semibold text-accent hover:underline">
                Form 5472 deadline calculator
              </Link>
              .
            </p>
            <p>
              State dates come from each state&apos;s own rule — a fixed date, the LLC&apos;s anniversary month, or the
              start of its tax year — using the formation date you enter. Filings that depend on revenue or income we
              don&apos;t ask about are listed under &ldquo;Also check&rdquo; instead of being dated.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {[
                FEDERAL_SOURCES.i5472,
                FEDERAL_SOURCES.i1120,
                FEDERAL_SOURCES.i7004,
                FEDERAL_SOURCES.irc7503,
                FEDERAL_SOURCES.june30Rule,
                FEDERAL_SOURCES.boi,
              ].map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                State sources: see{" "}
                <Link href={FEES_PATH} className="text-accent hover:underline">
                  LLC annual fees by state
                </Link>
                .
              </li>
            </ul>
            <p className="font-medium text-ink">Last reviewed {LAST_REVIEWED_LABEL}.</p>
            <p className="text-slate-600">
              Fees and dates change — confirm with the IRS or the state before you file or pay. General information,
              not personalised tax planning. For advice on your own situation, speak to a tax professional.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead eyebrow="FAQ" title="Questions about foreign-owned LLC deadlines" />
          <div className="mt-10 space-y-4">
            {CALENDAR_FAQS.map((faq) => (
              <details key={faq.q} className="group rounded-lg border border-slate-200 bg-white p-4 open:bg-slate-50">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                  {faq.q}
                  <span className="ml-4 text-slate-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
    </div>
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
          background: "radial-gradient(55% 60% at 50% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-serif text-3xl font-semibold text-white text-balance sm:text-4xl">
          Take the federal deadline off your list.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          We prepare your Form 5472 and pro forma Form 1120, have it reviewed, and fax it to the IRS — from{" "}
          {formatPrice(TIERS.standard.priceCents)}.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/start?src=tool-calendar"
            className="group inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto"
          >
            Start filing
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href={FEES_PATH}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Compare state fees
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 leading-relaxed text-slate-600">{subtitle}</p>}
    </div>
  );
}

function CalendarStructuredData() {
  const url = `${SITE_URL}${PAGE_PATH}`;
  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Foreign-Owned LLC Compliance Calendar",
    url,
    description: PAGE_DESCRIPTION,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    dateModified: LAST_REVIEWED,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: organizationNode(),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CALENDAR_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "LLC compliance calendar", path: PAGE_PATH },
  ]);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: PAGE_TITLE,
    dateModified: LAST_REVIEWED,
    speakable: SPEAKABLE,
    relatedLink: [`${SITE_URL}${FEES_PATH}`, `${SITE_URL}/form-5472-deadline-calculator`],
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
