import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import { SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import {
  EXCHANGE_RATES,
  FORM_5472_INSTRUCTIONS_URL,
  IRS_PAGE_LAST_REVIEWED,
  RELATED_SOURCE_URL,
  SOURCE_TYPOS,
  SOURCE_URL,
  YEARS,
} from "@/lib/tools/exchange-rates/data";
import { ExchangeRateConverter } from "./ExchangeRateConverter";

const PAGE_PATH = "/irs-yearly-average-exchange-rates";
const PAGE_TITLE = "IRS Yearly Average Exchange Rates (2021–2025) + Converter";
const PAGE_DESCRIPTION =
  "The IRS yearly average currency exchange rate table for 2021–2025, plus a free converter to translate foreign-currency amounts to or from U.S. dollars.";

// This tool's own content freshness date, separate from the site-wide
// CONTENT_LAST_REVIEWED constant in src/lib/seo.ts — the rate data was
// retrieved directly from irs.gov on this date (see docs/research/irs-exchange-rates.md).
const PAGE_LAST_REVIEWED = "2026-09-29";
const PAGE_LAST_REVIEWED_LABEL = "29 September 2026";

const RATE_FAQS = [
  {
    q: "What is the IRS yearly average exchange rate?",
    a: "It's a table the IRS publishes showing, for each listed country, the average units of that country's currency per 1 U.S. dollar over a full tax year — a convenience rate for converting foreign-currency amounts to U.S. dollars on a return.",
  },
  {
    q: "How do I convert foreign currency to USD using this table?",
    a: "Divide the foreign-currency amount by that year's rate for the currency. For example, at a rate of 0.811 GBP per USD, £811 ÷ 0.811 = $1,000.00.",
  },
  {
    q: "How do I convert USD to a foreign currency?",
    a: "Multiply the U.S. dollar amount by that year's rate. At 0.811 GBP per USD, $1,000 × 0.811 = £811.00.",
  },
  {
    q: "Does the IRS require me to use this exact rate?",
    a: "No. The IRS says it has no official exchange rate and generally accepts any posted rate used consistently. The yearly average table is a commonly used, consistently posted option — not a mandatory one.",
  },
  {
    q: "Do I have to use this rate on Form 5472?",
    a: "Form 5472 instructions require amounts in U.S. dollars with a schedule showing the exchange rate(s) used, but they don't name one required rate. The IRS yearly average is a commonly used option for that schedule.",
  },
  {
    q: "How often does the IRS update this table?",
    a: "The IRS typically posts the new full-year rates each January, once the prior tax year has ended, and keeps a rolling multi-year window on the same page.",
  },
] as const;

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

export default function IrsYearlyAverageExchangeRatesPage() {
  return (
    <>
      <ExchangeRateStructuredData />
      <main className="bg-white">
        <Hero />
        <Suspense fallback={<div className="mx-auto h-[520px] max-w-6xl px-6" aria-hidden />}>
          <ExchangeRateConverter />
        </Suspense>
        <RatesTable />
        <HowWeCalculate />
        <Form5472Usage />
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
            <Landmark className="h-3.5 w-3.5" />
            Free tool
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            IRS yearly average exchange rates.
          </h1>
          <p
            data-speakable
            className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300"
          >
            The IRS publishes yearly average exchange rates you can use to
            convert foreign-currency amounts to U.S. dollars — this page has
            the full {YEARS[YEARS.length - 1]}–{YEARS[0]} table plus a
            calculator that does the division or multiplication for you.
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            Filing Form 5472 for a foreign-owned U.S. LLC means every
            reportable transaction amount has to be in U.S. dollars, with a
            schedule showing the exchange rate you used. Convert your amounts
            below, then let us prepare the filing.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
            Calm next step
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">
            Convert first, then file.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Use the converter to get a clean U.S. dollar figure for your
            reportable transactions, then start your Form 5472 filing.
          </p>
          <Link href="/start?src=tool-exchange-rates" className="group mt-5 block">
            <Button className="h-12 w-full gap-2">
              File Form 5472 — {formatPrice(TIERS.standard.priceCents)}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function RatesTable() {
  return (
    <section id="full-table" className="border-b border-slate-100 bg-paper py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            Full table
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
            IRS yearly average exchange rate table ({YEARS[YEARS.length - 1]}–{YEARS[0]})
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Rates are units of foreign currency per 1 U.S. dollar, exactly as
            published by the IRS. Source:{" "}
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline underline-offset-4 hover:no-underline"
            >
              irs.gov yearly average currency exchange rates
            </a>
            . The IRS page itself is marked &ldquo;Page Last Reviewed or
            Updated: {IRS_PAGE_LAST_REVIEWED}&rdquo;.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">
              IRS yearly average currency exchange rates by country and year,
              in units of foreign currency per 1 U.S. dollar
            </caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th scope="col" className="px-4 py-3 font-semibold text-slate-900">
                  Country
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-900">
                  Currency
                </th>
                {YEARS.map((year) => (
                  <th
                    key={year}
                    scope="col"
                    className="px-4 py-3 text-right font-semibold text-slate-900"
                  >
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXCHANGE_RATES.map((row) => (
                <tr key={row.code} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-800">{row.country}</td>
                  <td className="px-4 py-2.5 text-slate-600">{row.currency}</td>
                  {YEARS.map((year) => {
                    const typo = SOURCE_TYPOS.find(
                      (t) => t.code === row.code && t.year === year,
                    );
                    const value = row.rates[year];
                    return (
                      <td
                        key={year}
                        className="px-4 py-2.5 text-right font-mono text-slate-800"
                      >
                        {value === null ? (
                          <span className="text-slate-400">—</span>
                        ) : typo ? (
                          <span title={`Published on irs.gov as "${typo.published}"; shown here corrected.`}>
                            {value}
                            <sup className="ml-0.5 text-accent">*</sup>
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {SOURCE_TYPOS.length > 0 ? (
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            <sup className="text-accent">*</sup> The IRS page publishes this
            cell with a typo:{" "}
            {SOURCE_TYPOS.map((typo, i) => {
              const row = EXCHANGE_RATES.find((r) => r.code === typo.code);
              return (
                <span key={`${typo.code}-${typo.year}`}>
                  {row?.country} {typo.year} as &ldquo;{typo.published}&rdquo;
                  {i < SOURCE_TYPOS.length - 1 ? "; " : ""}
                </span>
              );
            })}
            . We show the corrected value above and use it in the converter;
            see{" "}
            <span className="font-medium">
              our source notes for the raw HTML evidence
            </span>
            .
          </p>
        ) : null}
      </div>
    </section>
  );
}

function HowWeCalculate() {
  return (
    <section className="border-b border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
          How we calculate this
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
          How does the converter work?
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
          <p>
            The IRS publishes each year&rsquo;s rate as units of foreign
            currency per 1 U.S. dollar. To convert foreign currency to U.S.
            dollars, we divide the foreign-currency amount by that year&rsquo;s
            rate. To convert U.S. dollars to foreign currency, we multiply the
            U.S. dollar amount by that year&rsquo;s rate — the same two rules
            the IRS states on its own rates page.
          </p>
          <p>
            The IRS says directly: &ldquo;To convert from foreign currency to
            U.S. dollars, divide the foreign currency amount by the applicable
            yearly average exchange rate in the table below,&rdquo; and
            &ldquo;To convert from U.S. dollars to foreign currency, multiply
            the U.S. dollar amount by the applicable yearly average exchange
            rate in the table below.&rdquo; Source:{" "}
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline underline-offset-4 hover:no-underline"
            >
              IRS yearly average currency exchange rates
            </a>
            .
          </p>
          <p>
            The IRS also says it &ldquo;has no official exchange rate&rdquo;
            and &ldquo;generally accepts any posted exchange rate that is used
            consistently,&rdquo; and points to its{" "}
            <a
              href={RELATED_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline underline-offset-4 hover:no-underline"
            >
              foreign currency and currency exchange rates page
            </a>{" "}
            for additional rates and resources not listed in this table.
          </p>
          <p>
            The IRS typically adds the newly completed tax year&rsquo;s rates
            to this table each January and keeps a rolling multi-year window,
            so we revisit this table when the IRS updates it.
          </p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Last reviewed {PAGE_LAST_REVIEWED_LABEL}. Rates captured directly
            from irs.gov; see our{" "}
            <span className="font-medium text-slate-600">source research notes</span>{" "}
            for the exact retrieval method.
          </p>
        </div>
      </div>
    </section>
  );
}

function Form5472Usage() {
  return (
    <section className="border-b border-slate-100 bg-paper py-16">
      <div className="mx-auto max-w-3xl px-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
          Using these rates on Form 5472
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
          What do the Form 5472 instructions say about currency?
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
          <p>
            The Instructions for Form 5472, under Part IV — Monetary
            Transactions Between Reporting Corporations and Foreign Related
            Party — state: &ldquo;State all amounts in U.S. dollars and attach
            a schedule showing the exchange rates used.&rdquo; A similar rule
            appears for Part VIII (Cost Sharing Arrangements): &ldquo;All
            amounts should be reported in U.S. dollars.&rdquo; Source:{" "}
            <a
              href={FORM_5472_INSTRUCTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline underline-offset-4 hover:no-underline"
            >
              Instructions for Form 5472
            </a>
            .
          </p>
          <p>
            The instructions don&rsquo;t name one required rate for Form 5472
            — they require the U.S.-dollar amount and a schedule of whatever
            rate you used. The IRS yearly average rate above is a commonly
            used, consistently posted rate you can use for that schedule.
          </p>
          <p>
            We prepare the Form 5472 and pro forma Form 1120 package,
            including the exchange-rate schedule, as part of every filing.
          </p>
        </div>
        <Link href="/start?src=tool-exchange-rates" className="group mt-6 inline-flex">
          <Button variant="outline" className="gap-2">
            See how Form 5472 filing works
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Common exchange-rate questions
        </h2>
        <div className="mt-7 space-y-3">
          {RATE_FAQS.map((faq) => (
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
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
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
          Ready to file Form 5472?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-accent-100">
          We prepare the Form 5472, pro forma Form 1120, and the exchange-rate
          schedule for foreign-owned U.S. LLCs.
        </p>
        <Link href="/start?src=tool-exchange-rates" className="group mt-6 inline-block">
          <Button className="min-h-12 gap-2 bg-white px-6 text-accent hover:bg-accent-50">
            Start filing — {formatPrice(TIERS.standard.priceCents)}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function ExchangeRateStructuredData() {
  const url = `${env.appUrl}${PAGE_PATH}`;

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: PAGE_TITLE,
    url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    dateModified: PAGE_LAST_REVIEWED,
    provider: organizationNode(),
    offers: {
      "@type": "Offer",
      name: "IRS yearly average exchange rate converter",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: RATE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "IRS yearly average exchange rates", path: PAGE_PATH },
  ]);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: PAGE_TITLE,
    dateModified: PAGE_LAST_REVIEWED,
    speakable: SPEAKABLE,
  };

  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "IRS yearly average currency exchange rates",
    description:
      "Yearly average currency exchange rates published by the IRS, in units of foreign currency per 1 U.S. dollar, by country and year.",
    url,
    license: SOURCE_URL,
    isBasedOn: SOURCE_URL,
    temporalCoverage: `${YEARS[YEARS.length - 1]}/${YEARS[0]}`,
    dateModified: PAGE_LAST_REVIEWED,
    creator: {
      "@type": "GovernmentOrganization",
      name: "Internal Revenue Service",
      url: "https://www.irs.gov",
    },
    variableMeasured: "Foreign currency units per 1 U.S. dollar (yearly average)",
  };

  return (
    <>
      <JsonLd data={webApplication} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPage} />
      <JsonLd data={dataset} />
    </>
  );
}
