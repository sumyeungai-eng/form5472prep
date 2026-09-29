import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import { SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import {
  CONTINUATION_GRACE_DAYS,
  CONTINUATION_PER_PERIOD_CENTS,
  PENALTY_PER_FORM_CENTS,
} from "@/lib/penalty";
import { MULTI_YEAR_ADDON_CENTS, TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { ANSWER_FIRST, FAQS } from "@/lib/tools/late-filing/content";
import {
  LAST_REVIEWED_ISO,
  LAST_REVIEWED_LABEL,
  SOURCES,
  type SourceId,
} from "@/lib/tools/late-filing/sources";
import {
  DIIRSP_ELIGIBILITY_QUOTE,
  DIIRSP_PENALTY_QUOTE,
  OUTCOMES,
  OUTCOME_IDS,
  QUESTION_ORDER,
} from "@/lib/tools/late-filing/tree";
import { LateFilingChecker } from "./LateFilingChecker";

const PAGE_PATH = "/form-5472-late-filing-checker";
const PAGE_TITLE = "Missed Form 5472? Late-Filing Route Checker";
const PAGE_DESCRIPTION =
  "Answer five questions to see which IRS late-filing route fits your foreign-owned LLC: DIIRSP with a reasonable-cause statement, a penalty-notice response, or a review first.";
const START_HREF = "/start?src=tool-latefile";

export const metadata: Metadata = {
  title: { absolute: `${PAGE_TITLE} | Form5472 Prep` },
  description: PAGE_DESCRIPTION,
  ...pageMeta({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: PAGE_PATH,
  }),
  robots: { index: true, follow: true },
};

const PENALTY = formatPrice(PENALTY_PER_FORM_CENTS);
const CONTINUATION = formatPrice(CONTINUATION_PER_PERIOD_CENTS);

export default function Form5472LateFilingCheckerPage() {
  return (
    <>
      <LateFilingStructuredData />
      <main className="bg-white">
        <Hero />
        <LateFilingChecker />
        <RoutesAtAGlance />
        <HowWeDecide />
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
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <p className="mb-6 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Free tool
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Missed Form 5472? Find your late-filing route.
          </h1>
          <p data-speakable className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            {ANSWER_FIRST}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            For foreign-owned U.S. single-member LLCs. Answer up to {QUESTION_ORDER.length} short
            questions to see which route applies, what you&apos;d submit and the honest risks, with
            the IRS source for each rule.
          </p>
          <ul className="mt-7 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
            {["No email required", "Primary IRS sources only", "Shareable result link"].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function RoutesAtAGlance() {
  return (
    <section className="border-b border-slate-100 bg-slate-50 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          Routes at a glance
        </p>
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Which late-filing route applies to a missed Form 5472?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          The checker gives exactly one of these results. The questions run in order of priority:
          examination or investigation first, then IRS contact, then unpaid U.S. tax, then reasonable
          cause.
        </p>
        <ol className="mt-8 space-y-3">
          {OUTCOME_IDS.map((id) => {
            const outcome = OUTCOMES[id];
            return (
              <li key={id} className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                <p className="text-sm font-semibold text-slate-900">{outcome.route}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-700">When: </span>
                  {outcome.appliesWhen}
                </p>
              </li>
            );
          })}
        </ol>
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

function HowWeDecide() {
  const rules: Array<{ title: string; body: React.ReactNode; sources: SourceId[] }> = [
    {
      title: "Who the DIIRSP route is for",
      body: (
        <>
          <p>The IRS&apos;s own wording:</p>
          <blockquote className="mt-2 border-l-2 border-accent/40 pl-4 italic text-slate-700">
            &ldquo;{DIIRSP_ELIGIBILITY_QUOTE}&rdquo;
          </blockquote>
          <p className="mt-2">
            So an examination, an investigation or earlier IRS contact about the returns takes you
            off this route. The checker asks those questions first.
          </p>
        </>
      ),
      sources: ["diirsp"],
    },
    {
      title: "What DIIRSP does not promise",
      body: (
        <p>
          The same page says: &ldquo;{DIIRSP_PENALTY_QUOTE}&rdquo; A reasonable-cause statement is
          optional, and the IRS warns that penalties may be assessed during processing without
          considering it, so you may need to answer later IRS letters and resubmit it. We show that
          risk on every DIIRSP result.
        </p>
      ),
      sources: ["diirsp"],
    },
    {
      title: "The penalty",
      body: (
        <p>
          IRC §6038A(d) sets a {PENALTY} penalty for each tax year a Form 5472 isn&apos;t filed on
          time. If the failure continues more than {CONTINUATION_GRACE_DAYS} days after the IRS
          mails notice of it, another {CONTINUATION} applies for each 30-day period or part of one.
          A substantially incomplete Form 5472 counts as not filed.{" "}
          <Link
            href="/form-5472-penalty-calculator"
            className="font-medium text-accent underline underline-offset-4 hover:no-underline"
          >
            Estimate your exposure with the penalty calculator
          </Link>
          .
        </p>
      ),
      sources: ["irc6038a", "i5472"],
    },
    {
      title: "Reasonable cause",
      body: (
        <p>
          Treasury Regulation §1.6038A-4(b) lets a late Form 5472 be excused for reasonable cause and
          good faith. The facts must be set out in a written statement containing a declaration that
          it is made under penalties of perjury, and the decision is made case by case. The IRS must
          apply the rule liberally to a small corporation (gross receipts of $20 million or less) that
          had no knowledge of the requirement, has limited presence in and contact with the United
          States, and promptly and fully complies with IRS requests.
        </p>
      ),
      sources: ["reg6038a4"],
    },
    {
      title: "First Time Abate",
      body: (
        <p>
          The IRS&apos;s list of penalties eligible for First Time Abate doesn&apos;t include
          §6038A(d), and the Internal Revenue Manual names Form 5472 among returns where the waiver
          isn&apos;t applicable. The manual describes one narrow exception: when the penalty was
          assessed automatically because Form 5472 was attached to a late-filed Form 1120, relief may
          follow First Time Abate on that Form 1120 if the prior three periods are clean. The same
          manual section recommends that reasonable cause not be considered for any year until all
          delinquent returns have been filed.
        </p>
      ),
      sources: ["adminRelief", "irm20_1_1", "irm20_1_9"],
    },
    {
      title: "Where the late forms go",
      body: (
        <p>
          A foreign-owned U.S. disregarded entity files a pro forma Form 1120 with Form 5472
          attached, by fax or mail to the IRS as the Form 5472 instructions direct. It cannot file
          Form 5472 electronically.
        </p>
      ),
      sources: ["i5472"],
    },
    {
      title: "Penalty already charged",
      body: (
        <p>
          The IRS says to follow the instructions and deadlines in the notice, to call the number on
          it or write explaining why the penalty should be removed, and that after paying you can
          claim a refund on Form 843.
        </p>
      ),
      sources: ["intlPenalties"],
    },
    {
      title: "Unpaid U.S. tax",
      body: (
        <p>
          The DIIRSP page points to two other options. The Streamlined procedures are designed only
          for individual taxpayers who certify non-willful conduct, and the Voluntary Disclosure
          Practice is for willful non-compliance. Because the right one depends on facts this tool
          can&apos;t test, we route unpaid tax to a review.
        </p>
      ),
      sources: ["streamlined", "vdp"],
    },
  ];

  return (
    <section id="how-we-decide" className="border-b border-slate-100 bg-paper py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          How we decide
        </p>
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Which IRS rules does the checker follow?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Every result comes from the primary sources below. Where the sources don&apos;t clearly
          cover a situation (any &ldquo;Not sure&rdquo; answer, unpaid tax, or no reasonable cause),
          the checker sends you to a review instead of guessing.
        </p>
        <div className="mt-8 space-y-4">
          {rules.map((rule) => (
            <article key={rule.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{rule.title}</h3>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">{rule.body}</div>
              <ul className="mt-3 space-y-1 text-sm">
                {rule.sources.map((id) => (
                  <li key={id} className="min-w-0">
                    <SourceLink id={id} />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Last reviewed {LAST_REVIEWED_LABEL}</span>{" "}
          against the IRS pages, Form 5472 instructions (Rev. 12/2024), statute and regulation linked
          above.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          What do late Form 5472 filers ask?
        </h2>
        <div className="mt-7 space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-slate-200 bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                {faq.q}
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Want the numbers? Use the{" "}
          <Link
            href="/form-5472-penalty-calculator"
            className="font-medium text-accent underline underline-offset-4 hover:no-underline"
          >
            Form 5472 penalty calculator
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-accent py-16 text-center text-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight">
          Ready to file the late years?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-accent-100">
          Our late-filing package prepares the missing Form 5472 and pro forma Form 1120 for each year,
          plus a reasonable-cause statement. Every filing is reviewed by a qualified accountant before
          it is submitted. {formatPrice(TIERS.standard.priceCents)} for the first year,{" "}
          {formatPrice(MULTI_YEAR_ADDON_CENTS)} for each additional year.
        </p>
        <Link
          href={START_HREF}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent-50"
        >
          Start my late filing
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-6 text-xs leading-relaxed text-accent-100">
          General information, not tax advice. The checker points to the IRS route that usually
          applies; the IRS decides whether any penalty is removed. For advice on your own situation,
          speak to a tax professional.
        </p>
      </div>
    </section>
  );
}

function LateFilingStructuredData() {
  const url = `${env.appUrl}${PAGE_PATH}`;
  const organization = organizationNode();

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: PAGE_TITLE,
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    dateModified: LAST_REVIEWED_ISO,
    description: PAGE_DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: organization,
    author: organization,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Form 5472 late-filing checker", path: PAGE_PATH },
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
    publisher: organization,
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
