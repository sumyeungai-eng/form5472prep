import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { CopyButton } from "@/components/press/CopyButton";
import {
  FORM5472_STATS,
  STAT_CATEGORIES,
  STATS_LAST_REVIEWED,
  STATS_LAST_REVIEWED_LABEL,
  statSourceUrls,
  type Form5472Stat,
} from "@/lib/form5472-stats";
import { SERVICES_HUB_PATH } from "@/lib/services-pages";
import {
  ORG_REF,
  SITE_NAME,
  SITE_URL,
  SPEAKABLE,
  breadcrumbList,
  organizationDocument,
  pageMeta,
} from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";

// /form-5472-statistics: linkable "facts and figures" page. Every number comes
// from src/lib/form5472-stats.ts, where each fact carries its official source
// URL and period (evidence: docs/seo/stats-sources-2026-10-05.md). Do not add
// a figure to this page directly; add it to the data file with its source.
// No prices on this page.

const PATH = "/form-5472-statistics";
const PAGE_URL = `${SITE_URL}${PATH}`;
const TITLE = "Form 5472 Statistics and Key Figures (2026)";
const H1 = "Form 5472 statistics and key figures (2026)";
const DESCRIPTION =
  "Form 5472 statistics from official sources: the $25,000 penalty, IRS abatement rates, deadlines, recordkeeping rules and IRS data on Form 5472 filers.";
const PUBLISHED = "2026-10-05";

const PICKS = FORM5472_STATS.filter((s) => s.editorsPick);

const CITATION_TEXT = `${SITE_NAME}. "${H1}." Last reviewed ${STATS_LAST_REVIEWED_LABEL}. ${PAGE_URL}`;
const CITATION_HTML = `<a href="${PAGE_URL}">Form 5472 statistics (${SITE_NAME})</a>`;

const FAQS = [
  {
    q: "What is the penalty for not filing Form 5472?",
    a: "$25,000 per tax year under IRC section 6038A(d). If the failure continues more than 90 days after the IRS mails a notice, another $25,000 applies for each 30-day period, and the IRS states there is no maximum penalty amount.",
  },
  {
    q: "Do foreign-owned single-member LLCs file Form 5472?",
    a: "Under T.D. 9796, for tax years beginning on or after January 1, 2017, a US disregarded entity wholly owned by one foreign person is treated as a corporation for section 6038A. It files Form 5472 attached to a pro forma Form 1120.",
  },
  {
    q: "How often are Form 5472 penalties abated?",
    a: "The National Taxpayer Advocate reported that 55% of the section 6038 and 6038A penalties the IRS assessed systemically in 2018 were abated, or 71% by dollar value. Those figures combine Forms 5471 and 5472.",
  },
  {
    q: "Where do these figures come from?",
    a: "Each figure links to its official source: the Internal Revenue Code, Treasury regulations, the Federal Register, IRS instructions, the Internal Revenue Manual, IRS Statistics of Income and the National Taxpayer Advocate. The review date is shown at the top.",
  },
  {
    q: "Can I quote these statistics?",
    a: "Yes. Use the citation line on this page and link to it. Where you can, also cite the official source shown next to each figure.",
  },
] as const;

export const metadata: Metadata = {
  title: seoTitle(TITLE),
  description: DESCRIPTION,
  ...pageMeta({
    title: TITLE,
    description: DESCRIPTION,
    path: PATH,
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: STATS_LAST_REVIEWED,
  }),
  robots: { index: true, follow: true },
};

function SourceLink({ stat, className = "" }: { stat: Form5472Stat; className?: string }) {
  return (
    <a
      href={stat.sourceUrl}
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline ${className}`}
    >
      {stat.sourceLabel}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
    </a>
  );
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
    dateModified: STATS_LAST_REVIEWED,
    author: ORG_REF,
    publisher: ORG_REF,
    about: [
      { "@type": "Thing", name: "IRS Form 5472" },
      { "@type": "Thing", name: "Foreign-owned US single-member LLC" },
    ],
    citation: statSourceUrls(),
    speakable: SPEAKABLE,
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
      <JsonLd data={faq} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Form 5472 statistics", path: PATH },
        ])}
      />
    </>
  );
}

export default function Form5472StatisticsPage() {
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
              <li className="text-slate-300" aria-current="page">Form 5472 statistics</li>
            </ol>
          </nav>
          <h1 className="mt-8 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {H1}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300" data-speakable>
            The Form 5472 penalty is $25,000 per tax year, plus $25,000 for each 30 days a failure continues more
            than 90 days after IRS notice, with no maximum. Below are {FORM5472_STATS.length} Form 5472 facts and
            figures, each linked to the official source it comes from.
          </p>
          <p className="mt-5 text-sm text-slate-400">
            Last reviewed{" "}
            <time dateTime={STATS_LAST_REVIEWED} className="text-slate-200">
              {STATS_LAST_REVIEWED_LABEL}
            </time>{" "}
            · Sources: IRS, Treasury regulations, US Code, Federal Register, National Taxpayer Advocate
          </p>
        </div>
      </section>

      <div className="bg-white">
        <div className="mx-auto max-w-4xl space-y-16 px-4 py-14 sm:px-6 sm:py-16">
          <section aria-labelledby="editors-pick" className="rounded-xl border border-paper-edge bg-paper p-6 sm:p-8">
            <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              <Star className="h-3.5 w-3.5" aria-hidden />
              Editors&rsquo; pick
            </p>
            <h2 id="editors-pick" className="mt-3 font-serif text-2xl font-semibold tracking-tight text-ink">
              What are the top 5 Form 5472 statistics?
            </h2>
            <ol className="mt-6 space-y-5">
              {PICKS.map((s, i) => (
                <li key={s.id} className="grid gap-3 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <p className="font-serif text-2xl font-semibold leading-tight text-accent sm:text-right">
                    <span className="sr-only">{i + 1}. </span>
                    {s.figure}
                  </p>
                  <div>
                    <p className="font-medium leading-snug text-slate-900">{s.headline}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      <SourceLink stat={s} /> · {s.period}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {STAT_CATEGORIES.map((cat) => {
            const stats = FORM5472_STATS.filter((s) => s.category === cat.id);
            return (
              <section key={cat.id} aria-labelledby={cat.id}>
                <h2 id={cat.id} className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {cat.question}
                </h2>
                <p className="mt-2 max-w-2xl text-slate-600">{cat.intro}</p>
                <ul className="mt-6 space-y-4">
                  {stats.map((s) => (
                    <li key={s.id} id={s.id} className="rounded-lg border border-slate-200 bg-white p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5">
                        <p className="shrink-0 font-serif text-xl font-semibold text-accent sm:w-40">{s.figure}</p>
                        <div className="min-w-0">
                          <h3 className="font-medium leading-snug text-slate-900">{s.headline}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.detail}</p>
                          <p className="mt-3 text-xs text-slate-500">
                            Source: <SourceLink stat={s} /> · Period: {s.period}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {cat.id === "penalties" ? (
                  <p className="mt-4 text-sm text-slate-600">
                    To see how these amounts add up for a specific situation, use the{" "}
                    <Link href="/form-5472-penalty-calculator" className="font-medium text-accent underline-offset-4 hover:underline">
                      Form 5472 penalty calculator
                    </Link>
                    .
                  </p>
                ) : null}
                {cat.id === "deadlines" ? (
                  <p className="mt-4 text-sm text-slate-600">
                    For an exact date, use the{" "}
                    <Link href="/form-5472-deadline-calculator" className="font-medium text-accent underline-offset-4 hover:underline">
                      Form 5472 deadline calculator
                    </Link>
                    . State annual fees and report dates are in the{" "}
                    <Link href="/llc-annual-fees-by-state" className="font-medium text-accent underline-offset-4 hover:underline">
                      LLC annual fees by state
                    </Link>{" "}
                    table.
                  </p>
                ) : null}
              </section>
            );
          })}

          <section aria-labelledby="cite" className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 id="cite" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              How can I cite these statistics?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You are welcome to quote these figures. Please link to this page and, where you can, to the official
              source listed next to each figure.
            </p>
            <p className="mt-4 rounded-lg border border-slate-200 bg-white p-4 font-mono text-xs leading-relaxed text-slate-800 break-words">
              {CITATION_TEXT}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <CopyButton text={CITATION_TEXT} label="the citation" />
              <CopyButton text={CITATION_HTML} label="the HTML link" />
            </div>
          </section>

          <section aria-labelledby="method">
            <h2 id="method" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              How were these figures collected?
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              Every figure was read directly from an official source: the US Code, Treasury regulations on eCFR, the
              Federal Register, IRS form instructions, the Internal Revenue Manual, IRS Statistics of Income and the
              National Taxpayer Advocate&rsquo;s report to Congress. Figures are stated as the source states them,
              with the period they cover. The IRS penalty-assessment and abatement figures combine Forms 5471 and 5472
              because the source does not split them. See our{" "}
              <Link href="/editorial-policy" className="font-medium text-accent underline-offset-4 hover:underline">
                editorial policy
              </Link>
              .
            </p>
          </section>

          <section aria-labelledby="faq">
            <h2 id="faq" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              What are common questions about Form 5472 statistics?
            </h2>
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
          <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Need Form 5472 filed?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            We prepare Form 5472 with the pro forma Form 1120 for foreign-owned US LLCs. Every filing is reviewed by
            a qualified accountant before it is submitted.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href={SERVICES_HUB_PATH} className="group">
              <Button size="lg" className="shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5">
                See filing services
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/start?src=stats-page" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
              Start your filing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
