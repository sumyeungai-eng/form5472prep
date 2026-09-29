import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, ExternalLink, Landmark } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { TIERS } from "@/lib/pricing";
import { SITE_URL, SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { LAST_REVIEWED, LAST_REVIEWED_LABEL, STATE_FEES } from "@/lib/tools/state-fees/data";
import type { StateFees } from "@/lib/tools/state-fees/types";
import { FeesTable } from "./FeesTable";

const PAGE_PATH = "/llc-annual-fees-by-state";
const CALENDAR_PATH = "/foreign-owned-llc-compliance-calendar";
const PAGE_TITLE = "LLC Annual Fees by State (2026): Delaware, Wyoming, New Mexico and More";
const PAGE_DESCRIPTION =
  "Annual LLC fees, franchise taxes and report due dates for 10 states foreign owners use — Delaware, Wyoming, New Mexico, Florida, Texas, Nevada and more — from official sources.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  ...pageMeta({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: PAGE_PATH }),
  robots: { index: true, follow: true },
};

const FEES_FAQS = [
  {
    q: "Which state has the lowest LLC annual fee?",
    a: "New Mexico: no annual report and no annual state fee. Texas also costs $0 below $2.65 million of revenue, though a report is still due each 15 May. Among paid filings, Montana ($20, waived if on time in 2026–27), Colorado ($25) and Wyoming ($60 minimum) are cheapest.",
  },
  {
    q: "How much is the Delaware LLC annual tax?",
    a: "$400 a year, due on or before 1 June for the previous calendar year. House Bill 400 raised it from $300 from 1 January 2026, so the first $400 payment is due 1 June 2027. Late payment costs a $200 penalty plus 1.5% interest a month.",
  },
  {
    q: "Is a Wyoming LLC cheaper than a Delaware LLC for a non-resident?",
    a: "On state fees, yes. Wyoming's annual report license tax is $60 unless Wyoming-located assets exceed $300,000; Delaware charges a flat $400. The federal side is identical: a foreign-owned LLC in either state files Form 5472 for each year with a reportable transaction.",
  },
  {
    q: "Does California charge the $800 LLC tax in the first year?",
    a: "Yes, for LLCs formed since 2024. The first-year exemption covered only tax years beginning in 2021 through 2023. The first $800 is due the 15th day of the 4th month after the LLC files with the Secretary of State, then every year until it is cancelled.",
  },
  {
    q: "Do I still pay the state fee if my LLC had no income?",
    a: "Usually yes. Most charges are for keeping the LLC on the state register, not on income: Delaware taxes any LLC active during the year, and California's $800 is due even if the LLC does no business. Texas is different — below its revenue threshold no franchise tax is owed.",
  },
  {
    q: "Do state fees replace the federal Form 5472?",
    a: "No. State fees keep the LLC in good standing with its state. A foreign-owned single-member LLC separately files Form 5472 with a pro forma Form 1120 for each year it has a reportable transaction, and the IRS penalty for not filing is $25,000.",
  },
];

function byCode(code: StateFees["code"]): StateFees {
  return STATE_FEES.find((s) => s.code === code)!;
}

function usd(amount: number): string {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default function LlcAnnualFeesByStatePage() {
  const rows = [...STATE_FEES].sort((a, b) => a.name.localeCompare(b.name));
  const de = byCode("DE");
  const wy = byCode("WY");
  const ca = byCode("CA");
  return (
    <div className="bg-white">
      <FeesStructuredData />
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
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-100">
            Free reference · last reviewed {LAST_REVIEWED_LABEL}
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
            LLC annual fees by state.
          </h1>
          <p data-speakable className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
            Of these ten states, New Mexico is the cheapest place to keep an LLC: no annual report and no annual fee.
            Wyoming charges a {usd(wy.minYearlyUsd)} minimum annual report license tax, due on the first day of the
            LLC&apos;s anniversary month. Delaware charges a flat {usd(de.minYearlyUsd)} LLC tax every 1 June for the
            previous year, and California an {usd(ca.obligations[0].amountUsd ?? 800)} annual tax. Texas LLCs owe no
            franchise tax at or below $2.65 million of revenue but still file a report each 15 May.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400">
            Every figure links to an official state source. Fees change — confirm with the state before paying.
            Whatever the state, a foreign-owned single-member LLC also has a federal Form 5472 deadline: see your
            dates in the{" "}
            <Link href={CALENDAR_PATH} className="font-semibold text-white underline underline-offset-2">
              compliance calendar
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#fees"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Compare the states
            </a>
            <Link
              href={CALENDAR_PATH}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Get my deadlines
            </Link>
          </div>
        </div>
      </section>

      <section id="fees" className="scroll-mt-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHead
            eyebrow="Comparison"
            title="What does an LLC cost each year in each state?"
            subtitle="The recurring state fee or tax for a domestic LLC, when it is due, and whether the state wants an annual report. Registered-agent charges are private fees and are not included."
          />
          <div className="mt-10">
            <FeesTable rows={rows} />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Amounts are for an LLC formed in that state. “Verify with the state” means we could not confirm the rule
            from an official source. Last reviewed {LAST_REVIEWED_LABEL}; fees change — confirm with the state before
            paying.
          </p>
        </div>
      </section>

      <section className="border-b border-paper-edge bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHead eyebrow="Non-resident owners" title="Wyoming vs Delaware vs New Mexico: which costs less?" />
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              For a non-resident owner running an online business, the recurring state cost is{" "}
              <strong className="text-ink">$0 in New Mexico</strong>,{" "}
              <strong className="text-ink">{usd(wy.minYearlyUsd)} in Wyoming</strong> (the minimum license tax — it
              only rises once assets located in Wyoming pass $300,000) and{" "}
              <strong className="text-ink">{usd(de.minYearlyUsd)} in Delaware</strong>. Over five years at today&apos;s
              rates that is $0, {usd(wy.minYearlyUsd * 5)} and {usd(de.minYearlyUsd * 5)} in state fees, before
              registered-agent charges.
            </p>
            <p>
              The deadlines differ too. Wyoming&apos;s annual report is due on the first day of the month the LLC was
              formed, and an LLC that has not filed within 60 days can be administratively dissolved. Delaware&apos;s
              tax is due every 1 June for the previous year, with a $200 penalty plus 1.5% interest a month if it is
              late. New Mexico has nothing to file each year.
            </p>
            <p>
              The federal side does not depend on the state. A foreign-owned single-member LLC in any of the three files
              Form 5472 with a pro forma Form 1120 for each year it has a reportable transaction with its owner.{" "}
              <Link href={CALENDAR_PATH} className="font-semibold text-accent hover:underline">
                Get your exact dates
              </Link>{" "}
              or see{" "}
              <a href={`${PAGE_PATH}?state=WY#fees`} className="font-semibold text-accent hover:underline">
                Wyoming
              </a>{" "}
              and{" "}
              <a href={`${PAGE_PATH}?state=DE#fees`} className="font-semibold text-accent hover:underline">
                Delaware
              </a>{" "}
              in the table.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHead
            eyebrow="State notes"
            title="Every recurring filing, state by state"
            subtitle="All the recurring state filings we found for a domestic LLC, with the official source for each."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {rows.map((state) => (
              <article
                key={state.code}
                id={`notes-${state.code}`}
                className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-xl font-semibold text-ink">{state.name}</h3>
                  {/* Plain <a>: a full load lets the tool read ?state= on mount. */}
                  <a
                    href={`${CALENDAR_PATH}?state=${state.code}`}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    My {state.name} dates
                  </a>
                </div>
                <p className="mt-1 text-xs text-slate-500">{state.authority}</p>
                <ul className="mt-4 space-y-3">
                  {state.obligations.map((o) => (
                    <li key={o.id} className="text-sm leading-relaxed text-slate-700">
                      <p>
                        <span className="font-semibold text-ink">{o.name}</span>
                        <span className="font-mono text-[13px] text-ink"> · {o.amount}</span>
                      </p>
                      <p className="mt-0.5">{o.due}</p>
                      {o.appliesTo && <p className="mt-0.5 text-slate-600">{o.appliesTo}</p>}
                      {o.late && <p className="mt-0.5 text-slate-600">Late: {o.late}.</p>}
                      <a
                        href={o.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                      >
                        {o.source.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
                {state.notes.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 border-t border-slate-100 pl-5 pt-4 text-xs leading-relaxed text-slate-600">
                    {state.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-paper-edge bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <Landmark className="mt-1 h-6 w-6 flex-none text-accent" />
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">The federal filing is the same in every state</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Choosing a cheaper state does not change the federal side. A single-member LLC owned by a foreign
                person files Form 5472 attached to a pro forma Form 1120 for each year it has a reportable transaction
                with its owner — due 15 April for a calendar year — and the IRS penalty for not filing is $25,000.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/start?src=tool-state-fees"
                  className="group inline-flex h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-700"
                >
                  File Form 5472 — from {formatPrice(TIERS.standard.priceCents)}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={CALENDAR_PATH}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                >
                  See all my deadlines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHead eyebrow="Method" title="How we compiled this table" />
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              For each state we read the Secretary of State, Division of Corporations, Comptroller or Franchise Tax
              Board page — or the statute — that sets the fee for a domestic LLC, and recorded the amount, the due-date
              rule and any late penalty the source states. Registered-agent, formation and one-off amendment fees are
              excluded. Where an official source did not settle a point, the table says so rather than filling the gap.
            </p>
            <p>
              The “lowest yearly cost” sort uses the smallest recurring state charge (a two-yearly fee counts as half
              per year) and ignores revenue-based taxes and fees you may never owe.
            </p>
            <p className="font-medium text-ink">Last reviewed {LAST_REVIEWED_LABEL}.</p>
            <p className="text-slate-600">
              Fees change — confirm with the state before paying. General information, not personalised tax planning.
              For advice on your own situation, speak to a tax professional.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHead eyebrow="FAQ" title="Questions about state LLC fees" />
          <div className="mt-10 space-y-4">
            {FEES_FAQS.map((faq) => (
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

      <section className="relative overflow-hidden bg-ink">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-semibold text-white text-balance sm:text-4xl">
            State fee paid? Now the federal one.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            We prepare your Form 5472 and pro forma Form 1120, have it reviewed, and fax it to the IRS — from{" "}
            {formatPrice(TIERS.standard.priceCents)}.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/start?src=tool-state-fees"
              className="group inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto"
            >
              Start filing
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={CALENDAR_PATH}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Build my compliance calendar
            </Link>
          </div>
        </div>
      </section>
    </div>
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

function FeesStructuredData() {
  const url = `${SITE_URL}${PAGE_PATH}`;
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "LLC annual fees, franchise taxes and report due dates by US state",
    description:
      "Recurring state fees, taxes and annual or biennial reports for a domestic limited liability company in Delaware, Wyoming, New Mexico, Florida, Texas, Nevada, New York, California, Colorado and Montana, with due-date rules, late penalties and the official source for each figure.",
    url,
    creator: organizationNode(),
    publisher: organizationNode(),
    dateModified: LAST_REVIEWED,
    isAccessibleForFree: true,
    inLanguage: "en",
    temporalCoverage: "2026/2027",
    spatialCoverage: STATE_FEES.map((s) => ({
      "@type": "Place",
      name: `${s.name}, United States`,
    })),
    variableMeasured: [
      "Recurring state fee or tax (USD)",
      "Due date rule",
      "Annual report required",
      "Late penalty",
    ],
    keywords: [
      "LLC annual fee",
      "franchise tax",
      "annual report",
      "foreign-owned LLC",
      "non-resident LLC",
    ],
    citation: Array.from(new Set(STATE_FEES.flatMap((s) => s.obligations.map((o) => o.source.url)))),
  };
  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LLC Annual Fees by State",
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
    mainEntity: FEES_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "LLC annual fees by state", path: PAGE_PATH },
  ]);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: PAGE_TITLE,
    dateModified: LAST_REVIEWED,
    speakable: SPEAKABLE,
    relatedLink: [`${SITE_URL}${CALENDAR_PATH}`],
  };
  return (
    <>
      <JsonLd data={dataset} />
      <JsonLd data={webApplication} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPage} />
    </>
  );
}
