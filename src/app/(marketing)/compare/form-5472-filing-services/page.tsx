import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import {
  PRICES_CHECKED_ON,
  PRICES_CHECKED_ON_LABEL,
  UNVERIFIED_PROVIDERS,
  bundleRange,
  lateYearProviders,
  perFilingRange,
  pricedProviders,
  providerSourceUrls,
  rangeForKinds,
  threeLateYearsFormula,
  threeLateYearsUsd,
  unpricedProviders,
  usd,
  type ProviderKind,
  type ProviderPrice,
} from "@/lib/provider-prices";
import {
  ORG_EMAIL,
  ORG_REF,
  SITE_NAME,
  SITE_URL,
  SPEAKABLE,
  breadcrumbList,
  organizationDocument,
  pageMeta,
} from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";

// /compare/form-5472-filing-services: sourced price comparison. Every
// competitor number comes from src/lib/provider-prices.ts, which copies the
// survey in docs/seo/form5472-price-survey-2026-10-05.md; our own prices come
// from src/lib/pricing.ts through that file. Do not type a price into this
// page. Tone rules: neutral, no superlatives, nothing about a competitor
// beyond what its own page says, and we are never described as a CPA,
// licensed or IRS-approved. A fax receipt is evidence of transmission, not of
// IRS acceptance.

const PATH = "/compare/form-5472-filing-services";
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = "Form 5472 Filing Services Compared: 2026 Prices";
const H1 = "Form 5472 filing services compared: 2026 prices";
const PUBLISHED = "2026-10-05";

const ROWS = pricedProviders();
const UNPRICED = unpricedProviders();
const ONE_YEAR = perFilingRange();
const BUNDLES = bundleRange();
const SOFTWARE = rangeForKinds(["software you complete yourself"]);
const DONE_FOR_YOU = rangeForKinds(["done-for-you filing service", "CPA firm"]);
const LATE = lateYearProviders();
const LATE_TOTALS = LATE.map((p) => threeLateYearsUsd(p) as number);
const OURS = ROWS.find((p) => p.isOurs);

const DESCRIPTION = `Published one-year prices for Form 5472 + pro forma 1120 filing from ${ONE_YEAR.count} services, ${usd(ONE_YEAR.min)} to ${usd(ONE_YEAR.max)}, plus annual bundles, each linked to its source.`;

const CAPSULE = `Published prices for one year of Form 5472 with the pro forma Form 1120 run from ${usd(ONE_YEAR.min)} to ${usd(ONE_YEAR.max)} across ${ONE_YEAR.count} filing services and software tools. Formation providers' annual packages that include Form 5472 list ${usd(BUNDLES.min)} to ${usd(BUNDLES.max)} a year. Prices checked ${PRICES_CHECKED_ON_LABEL}.`;

const KIND_GROUPS: Array<{ kind: ProviderKind; label: string; text: string }> = [
  {
    kind: "software you complete yourself",
    label: "Software you complete yourself",
    text: "You answer the questions and the tool produces the forms. These sites describe themselves as software or document preparation tools, not a CPA or tax adviser. Whether the price includes sending the package to the IRS varies: included, a paid add-on, or download only.",
  },
  {
    kind: "done-for-you filing service",
    label: "Done-for-you filing service",
    text: "The provider prepares the package from your information. Who reviews it differs, as each site states it: a qualified tax accountant, a professional tax preparer or a CPA. Whether IRS delivery is in the listed price also differs.",
  },
  {
    kind: "CPA firm",
    label: "CPA firm",
    text: "An accounting firm prepares the return with CPA review. The firm in this table fixes its fee after a 30-minute call.",
  },
  {
    kind: "formation-provider annual bundle",
    label: "Formation-provider annual bundle",
    text: "Company-formation providers sell yearly tax packages. The price is per year, and the package can include other filings, so it is not like-for-like with a single Form 5472 filing.",
  },
];

const CHECKLIST = [
  {
    title: "Who prepares and reviews the package",
    text: "Software, a tax accountant, a tax preparer or a CPA. Read the provider's own wording, and check whether a person looks at your return before it is sent.",
  },
  {
    title: "How it reaches the IRS, and what proof you get",
    text: "Several providers note these forms cannot be e-filed; they go by fax or mail. Check whether delivery is in the price or an add-on, and what record you receive. A transmission receipt shows the package was sent. It is not confirmation that the IRS accepted it.",
  },
  {
    title: "How late years are handled",
    text: "Check the price for each past year and whether a reasonable-cause statement is included or charged separately.",
  },
  {
    title: "The total price for all your years",
    text: "Add the base price, every extra year and any add-ons, such as IRS fax delivery, activity fees or faster turnaround.",
  },
];

const FAQS = [
  {
    q: "How much does it cost to file Form 5472?",
    a: `On providers' own pages checked ${PRICES_CHECKED_ON_LABEL}, one year of Form 5472 with the pro forma Form 1120 costs ${usd(SOFTWARE.min)} to ${usd(SOFTWARE.max)} with software you complete yourself, and ${usd(DONE_FOR_YOU.min)} to ${usd(DONE_FOR_YOU.max)} from done-for-you services and a CPA firm. Formation providers' annual packages list ${usd(BUNDLES.min)} to ${usd(BUNDLES.max)} a year.`,
  },
  {
    q: "Why do Form 5472 filing prices vary so much?",
    a: "The prices cover different things: software or a prepared package; review by an accountant, a preparer or a CPA; IRS fax included or extra; late-year letters included or charged separately. Annual bundles also include other services. Compare the total for all the years you need.",
  },
  {
    q: "Is sending the return to the IRS included in the price?",
    a: `It varies. Edetax, form5472.tax, Laramie Ledger Tax and ${SITE_NAME} include fax or mail delivery in the listed price. 5472Direct and Form5472.online charge $49 for IRS fax delivery. form5472.io lists fax under its $197 plan. Several others do not publish their delivery method.`,
  },
  {
    q: "Does a fax receipt mean the IRS accepted my Form 5472?",
    a: "No. A fax transmission receipt shows that the package was sent to the IRS and when. It is a record of transmission, not an IRS acceptance notice. Keep it with your copy of the return.",
  },
  {
    q: "How were these prices collected?",
    a: `Each price was copied from the provider's own pricing or service page on ${PRICES_CHECKED_ON_LABEL}. Review sites, search snippets and other providers' comparison tables were not used. Where a page gave no figure, this page says not published. Prices change, so check the provider's page before buying.`,
  },
];

export const metadata: Metadata = {
  title: seoTitle(TITLE),
  description: DESCRIPTION,
  ...pageMeta({
    title: TITLE,
    description: DESCRIPTION,
    path: PATH,
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: PRICES_CHECKED_ON,
  }),
  robots: { index: true, follow: true },
};

const linkClass = "font-medium text-accent underline-offset-4 hover:underline";
// First column stays visible while the table scrolls sideways on small screens.
const STICKY =
  "sticky left-0 z-10 w-28 min-w-[7rem] px-3 shadow-[1px_0_0_0_#e2e8f0] sm:w-40 sm:min-w-[10rem] sm:px-4";

function SourceLink({ p, label = "pricing page" }: { p: ProviderPrice; label?: string }) {
  if (p.isOurs) {
    return (
      <Link href="/pricing" className={linkClass}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={p.sourceUrl}
      target="_blank"
      rel="nofollow noopener"
      className={`inline-flex items-center gap-1 ${linkClass}`}
    >
      {label}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
    </a>
  );
}

function capFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function priceOf(id: string): string {
  const p = ROWS.find((r) => r.id === id);
  if (!p || p.oneYearPriceUsd === null) throw new Error(`compare prices: no published price for ${id}`);
  return usd(p.oneYearPriceUsd);
}

function namesOf(kind: ProviderKind): string {
  return ROWS.filter((p) => p.kind === kind)
    .map((p) => p.name)
    .join(", ");
}

function StructuredData() {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${PAGE_URL}#article`,
    headline: H1,
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    mainEntityOfPage: PAGE_URL,
    inLanguage: "en",
    datePublished: PUBLISHED,
    dateModified: PRICES_CHECKED_ON,
    author: ORG_REF,
    publisher: ORG_REF,
    about: [
      { "@type": "Thing", name: "IRS Form 5472" },
      { "@type": "Thing", name: "Form 5472 filing services" },
    ],
    citation: providerSourceUrls(),
    speakable: SPEAKABLE,
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${PAGE_URL}#services`,
    name: "Form 5472 filing services by published one-year price",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: ROWS.length,
    itemListElement: ROWS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: p.siteUrl,
    })),
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={organizationDocument()} />
      <JsonLd data={article} />
      <JsonLd data={itemList} />
      <JsonLd data={faq} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
          { name: "Form 5472 filing services compared", path: PATH },
        ])}
      />
    </>
  );
}

export default function Form5472FilingServicesComparePage() {
  return (
    <>
      <StructuredData />

      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: "radial-gradient(55% 55% at 20% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li>
                <Link href="/compare" className="hover:text-white">Compare</Link>
              </li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li className="text-slate-300" aria-current="page">Form 5472 filing services compared</li>
            </ol>
          </nav>
          <h1 className="mt-8 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {H1}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300" data-speakable>
            {CAPSULE}
          </p>
          <p className="mt-6 max-w-3xl rounded-lg border border-white/15 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
            {SITE_NAME} is one of the services in this table. Prices are copied from each provider&apos;s own website
            on{" "}
            <time dateTime={PRICES_CHECKED_ON} className="text-slate-100">
              {PRICES_CHECKED_ON_LABEL}
            </time>
            ; they change, so check the provider&apos;s page before buying. Spotted an error? Email{" "}
            <a href={`mailto:${ORG_EMAIL}`} className="font-medium text-white underline underline-offset-4">
              {ORG_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>

      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-16">
          <section aria-labelledby="prices">
            <h2 id="prices" className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Published Form 5472 prices, one tax year
            </h2>
            <p className="mt-2 max-w-3xl text-slate-600">
              Form 5472 with the pro forma Form 1120 for a foreign-owned single-member LLC, sorted by published
              one-year price. Annual bundles are listed last because they are priced per year and include other
              services.
            </p>
            <p className="mt-3 text-xs text-slate-500 lg:hidden">Scroll the table sideways to see every column.</p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 lg:mt-6">
              <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Published Form 5472 prices for one tax year, checked {PRICES_CHECKED_ON_LABEL}, sorted by one-year
                  price
                </caption>
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th scope="col" className={`${STICKY} bg-slate-50 py-3 font-semibold`}>Service</th>
                    <th scope="col" className="min-w-[10.5rem] px-4 py-3 font-semibold">Type</th>
                    <th scope="col" className="min-w-[11rem] px-4 py-3 font-semibold">One-year price</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Extra past year</th>
                    <th scope="col" className="px-4 py-3 font-semibold">How it reaches the IRS</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Turnaround</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 align-top text-slate-700">
                  {ROWS.map((p) => (
                    <tr key={p.id}>
                      <th scope="row" className={`${STICKY} bg-white py-4 font-semibold text-slate-900`}>
                        {p.name}
                        {p.isOurs ? (
                          <span className="mt-1 block text-xs font-normal text-slate-500">This site</span>
                        ) : null}
                        {p.operatorNote ? (
                          <span className="mt-1 block text-xs font-normal text-slate-500">{p.operatorNote}</span>
                        ) : null}
                      </th>
                      <td className="px-4 py-4">
                        <span className="font-medium text-slate-900">{capFirst(p.kind)}</span>
                        <span className="mt-1 block text-xs text-slate-500">{p.reviewNote}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-serif text-lg font-semibold text-ink">
                          {usd(p.oneYearPriceUsd as number)}
                        </span>
                        <span className="mt-1 block text-xs text-slate-600">{p.priceNote}</span>
                        <span className="mt-1 block text-xs text-slate-500">{p.billing}</span>
                      </td>
                      <td className="px-4 py-4">{p.extraYearNote}</td>
                      <td className="px-4 py-4">{p.filingMethodNote}</td>
                      <td className="px-4 py-4">{p.turnaroundNote}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <SourceLink p={p} />
                        <span className="mt-1 block text-xs text-slate-500">Checked {PRICES_CHECKED_ON_LABEL}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="mx-auto max-w-4xl space-y-16 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12">
          <section aria-labelledby="not-published">
            <h3 id="not-published" className="font-serif text-xl font-semibold tracking-tight text-ink">
              No published Form 5472 price
            </h3>
            <ul className="mt-4 space-y-3">
              {UNPRICED.map((p) => (
                <li key={p.id} className="text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">{p.name}:</span> {p.priceNote}{" "}
                  <SourceLink p={p} label="Source" />
                </li>
              ))}
              {UNVERIFIED_PROVIDERS.map((u) => (
                <li key={u.name} className="text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">{u.name}:</span> {u.note}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="difference">
            <h2 id="difference" className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              What&apos;s the difference between Form 5472 services?
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The main difference is who does the work. Software tools generate the forms from your answers.
              Done-for-you services prepare the package for you, with review by an accountant, preparer or CPA as
              each site states. A CPA firm prepares it with CPA review. Formation providers sell yearly packages
              that bundle tax filing with other services.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {KIND_GROUPS.map((g) => {
                const range = rangeForKinds([g.kind]);
                return (
                  <div key={g.kind} className="rounded-lg border border-slate-200 bg-white p-5">
                    <dt className="font-semibold text-slate-900">{g.label}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-slate-600">{g.text}</dd>
                    <dd className="mt-3 text-xs text-slate-500">
                      In the table: {namesOf(g.kind)} ·{" "}
                      {range.min === range.max ? usd(range.min) : `${usd(range.min)} to ${usd(range.max)}`}
                      {g.kind === "formation-provider annual bundle" ? " a year" : ""}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section aria-labelledby="late-years">
            <h2 id="late-years" className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              How much do late or past years cost?
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              Three late years filed together add up to {usd(Math.min(...LATE_TOTALS))} to{" "}
              {usd(Math.max(...LATE_TOTALS))} among the {LATE.length} services that publish a per-year price for
              past years. These totals are our arithmetic from each provider&apos;s published per-year prices, not
              quotes. What each year includes differs, especially the reasonable-cause letter.
            </p>
            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Three late years of Form 5472, our arithmetic from published per-year prices
                </caption>
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                    <th scope="col" className="px-4 py-3 font-semibold">3 late years</th>
                    <th scope="col" className="px-4 py-3 font-semibold">How we worked it out</th>
                    <th scope="col" className="px-4 py-3 font-semibold">What each year includes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 align-top text-slate-700">
                  {LATE.map((p) => (
                    <tr key={p.id}>
                      <th scope="row" className="px-4 py-3 font-semibold text-slate-900">
                        {p.name}
                        {p.isOurs ? <span className="block text-xs font-normal text-slate-500">This site (Standard)</span> : null}
                      </th>
                      <td className="px-4 py-3 font-serif text-base font-semibold text-ink">
                        {usd(threeLateYearsUsd(p) as number)}
                      </td>
                      <td className="px-4 py-3">{threeLateYearsFormula(p)}</td>
                      <td className="px-4 py-3 text-slate-600">{p.lateYears?.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Scope differs between these services (see the types above), so use this as an illustration, not a
              quote. Some providers quote multi-year work individually.
            </p>
          </section>

          <section aria-labelledby="formation-providers">
            <h2
              id="formation-providers"
              className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              Do Stripe Atlas, doola and Firstbase file Form 5472?
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              Going by their own pages: Stripe Atlas&apos;s published inclusions do not list Form 5472. doola&apos;s
              help center lists a Tax Filing-only service at {priceOf("doola")} a year that covers Form 5472.
              Firstbase lists a Tax Filing package at {priceOf("firstbase")} a year that includes Form 5472 for
              non-US-owned single-member LLCs.
            </p>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-700">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Stripe Atlas</h3>
                <p className="mt-1">
                  Atlas&apos;s $500 one-time setup covers Delaware incorporation, the company tax ID, founder equity,
                  the 83(b) election filing, document templates and a first year of registered agent service. Form
                  5472 preparation or filing is not among the listed inclusions, and Atlas&apos;s business-taxes
                  documentation points founders to &ldquo;one of our tax partners&rdquo;.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">doola</h3>
                <p className="mt-1">
                  doola&apos;s pricing page lists Tax and Compliance at $1,999 a year plus state fees, including
                  federal and state tax filing. Its help center lists a standalone Tax Filing-only service at{" "}
                  {priceOf("doola")} a year that &ldquo;covers your federal tax filings, including Form 5472&rdquo;. One help article says
                  Tax and Compliance &ldquo;generally covers&rdquo; Form 5472; another lists Form 5472 among optional
                  add-ons that &ldquo;may carry an extra fee&rdquo;. Ask doola which applies to your plan.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Firstbase</h3>
                <p className="mt-1">
                  Firstbase&apos;s Tax Filing package for a non-US-owned single-member LLC is {priceOf("firstbase")} a year and lists
                  Forms 5472, the pro forma Form 1120, Forms 1099 and a six-month extension. Firstbase One bundles it
                  with other subscriptions at $2,388 a year for most customers.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="checklist">
            <h2 id="checklist" className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              What should you check before choosing a service?
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              Check four things: who prepares and reviews the package, how it reaches the IRS and what proof you
              get, how late years are handled, and the total price for every year you need. A fax receipt shows the
              package was transmitted; it is not confirmation that the IRS accepted it.
            </p>
            <ol className="mt-6 space-y-4">
              {CHECKLIST.map((c, i) => (
                <li key={c.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{c.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {OURS ? (
              <p className="mt-6 text-sm text-slate-600">
                For how {SITE_NAME} handles each point, see the{" "}
                <Link href="/pricing" className={linkClass}>
                  pricing page
                </Link>
                .
              </p>
            ) : null}
          </section>

          <section aria-labelledby="method">
            <h2 id="method" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              How these prices were collected
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              Each figure was copied from the provider&apos;s own pricing or service page on{" "}
              {PRICES_CHECKED_ON_LABEL}, for one tax year of Form 5472 with the pro forma Form 1120 for a
              foreign-owned single-member LLC. Review sites, search snippets and other providers&apos; comparison
              tables were not used. Where a page gave no figure, this page says &ldquo;not published&rdquo;. Our own
              prices come from our pricing page. See our{" "}
              <Link href="/editorial-policy" className={linkClass}>
                editorial policy
              </Link>
              .
            </p>
            <details className="group mt-5 rounded-xl border border-slate-200 bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                Exact wording on each provider&apos;s page
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                {[...ROWS, ...UNPRICED]
                  .filter((p) => !p.isOurs)
                  .map((p) => (
                    <li key={p.id}>
                      <span className="font-semibold text-slate-900">{p.name}:</span>{" "}
                      <q className="italic">{p.sourceQuote}</q> <SourceLink p={p} label="Source" />
                    </li>
                  ))}
              </ul>
            </details>
          </section>

          <section aria-labelledby="faq">
            <h2 id="faq" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Form 5472 filing costs: common questions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              For a wider look at what drives price, see our guide to{" "}
              <Link href="/blog/form-5472-cost" className="font-medium text-accent underline underline-offset-2 hover:text-accent-700">
                Form 5472 filing cost
              </Link>
              .
            </p>
            <div className="mt-6 space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                    {f.q}
                    <span className="text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="border-y border-paper-edge bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Start your Form 5472 filing</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            About 15 minutes of questions. Every filing is reviewed by a qualified accountant before it is
            submitted, then faxed to the IRS with a timestamped receipt.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/start?src=compare-prices" className="group">
              <Button size="lg" className="shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5">
                Start your filing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
