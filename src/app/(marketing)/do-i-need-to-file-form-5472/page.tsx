import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import { SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import {
  LAST_REVIEWED_ISO,
  LAST_REVIEWED_LABEL,
  SOURCES,
  type SourceId,
} from "@/lib/tools/filing-checker/sources";
import { FilingChecker } from "./FilingChecker";

const PAGE_PATH = "/do-i-need-to-file-form-5472";
const PAGE_TITLE = "Do I Need to File Form 5472? 2-Minute Checker";
const PAGE_DESCRIPTION =
  "Use this free checker to see whether your foreign-owned US LLC likely needs Form 5472 and pro forma 1120 for the tax year.";

export const metadata: Metadata = {
  title: { absolute: `${PAGE_TITLE} | Form5472 Prep` },
  description: PAGE_DESCRIPTION,
  ...pageMeta({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: PAGE_PATH,
  }),
};

const CHECKER_FAQS = [
  {
    q: "Who usually needs to file Form 5472?",
    a: "A foreign-owned US single-member LLC that is treated as a disregarded entity usually files Form 5472 with a pro forma Form 1120 when it has a reportable transaction during the tax year.",
  },
  {
    q: "Does a dormant LLC with no income still need Form 5472?",
    a: "Often, yes. No income is different from no reportable transactions, and formation costs, owner contributions, reimbursements, loans, or owner draws can create a filing requirement.",
  },
  {
    q: "What is the Form 5472 deadline?",
    a: "For a calendar-year LLC, Form 5472 with the pro forma Form 1120 is generally due April 15. Extensions may be available, but the extension process must be handled correctly.",
  },
  {
    q: "What happens if Form 5472 is missed?",
    a: "The penalty is $25,000 for a Form 5472 that is not filed when due or is substantially incomplete. Late filings can sometimes include a reasonable cause explanation, but the best answer depends on the exact facts.",
  },
];

export default function DoINeedToFileForm5472Page() {
  return (
    <>
      <CheckerStructuredData />
      <Hero />
      <FilingChecker />
      <PlainEnglishRule />
      <HowWeDecide />
      <Faq />
      <FinalCta />
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
      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="mb-6 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Free tool
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Do I need to file Form 5472?
          </h1>
          <p data-speakable className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            A foreign-owned US single-member LLC with any reportable transaction during the year
            must file Form 5472 with a pro forma Form 1120, due April 15 for a calendar-year LLC.
          </p>
          <ul className="mt-7 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
            {["No email required", "Honest no-filing paths", "Built for foreign-owned LLCs"].map(
              (item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PlainEnglishRule() {
  return (
    <section className="border-b border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          The rule in plain English
        </p>
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          When do foreign-owned LLCs file Form 5472?
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
          <p>
            The common Form 5472 case is a US single-member LLC that is wholly owned by a non-US
            person or foreign company and has not elected corporate tax treatment. The IRS treats that
            LLC as a disregarded entity for income tax purposes, but still requires an information
            filing when reportable transactions occur.
          </p>
          <p>
            Reportable transactions are broader than sales revenue. Owner capital contributions,
            loans, reimbursements, formation costs paid personally, registered-agent fees paid by the
            owner, and owner draws can all matter even when the LLC had no customers and no profit.
          </p>
          <p>
            Some paths are different. A multi-member LLC usually starts with partnership filing rules,
            and an LLC that elected to be taxed as a corporation files through its corporate Form 1120
            process. This checker separates those cases so the answer is not forced into a filing sale
            when the facts point elsewhere.
          </p>
        </div>
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
  const rules: Array<{ title: string; body: string; sources: SourceId[] }> = [
    {
      title: "Who must file",
      body: "A U.S. LLC wholly owned by one foreign person is disregarded for income tax, but the regulations treat it as a corporation for section 6038A, which makes it a “reporting corporation”. A reporting corporation must file Form 5472 if it had a reportable transaction with a related party, and a foreign-owned LLC files it attached to a pro forma Form 1120.",
      sources: ["reg7701_2", "reg6038a1", "i5472"],
    },
    {
      title: "One owner or two or more",
      body: "By default a U.S. LLC with two or more members is a partnership, and one with a single owner is disregarded. Partnerships file Form 1065, so a multi-member LLC gets the “different rules” result. The pro forma Form 1120 route is written for the single-owner case.",
      sources: ["reg7701_3", "i1065"],
    },
    {
      title: "A U.S. owner",
      body: "The disregarded-entity rule applies when one foreign person owns the LLC. A single-member LLC owned by a U.S. person isn't covered by it, so the checker shows no Form 5472 filing.",
      sources: ["reg7701_2", "i5472"],
    },
    {
      title: "A corporate election",
      body: "An LLC that elected to be taxed as a corporation files its own corporate income tax return. If it is at least 25% foreign-owned it is a reporting corporation and attaches Form 5472 to that return, so the filing path differs. “Not sure” is treated as no election, because the default classification applies unless the LLC elected otherwise.",
      sources: ["i5472", "irc6038a", "reg7701_3"],
    },
    {
      title: "The tax year",
      body: "Form 5472 reports transactions during the reporting corporation’s tax year, so the checker asks whether the LLC existed at any point in the year. A foreign-owned LLC uses its owner’s U.S. tax year or, if the owner has none, the calendar year.",
      sources: ["i5472"],
    },
    {
      title: "Reportable transactions",
      body: "For a foreign-owned LLC, reportable transactions include amounts paid or received in connection with forming, dissolving, acquiring or disposing of the LLC, including contributions to and distributions from it, as well as payments such as loans listed in Part IV of the form. No income is not the same as no transactions. The instructions excuse a year with no reportable transactions.",
      sources: ["reg6038a2", "i5472"],
    },
    {
      title: "Deadline and penalty",
      body: "The pro forma Form 1120 is due by the 15th day of the 4th month after the tax year ends (April 15 for a calendar year), or later with a timely Form 7004. Not filing Form 5472 when due, or filing a substantially incomplete one, carries a $25,000 penalty.",
      sources: ["i1120", "i5472", "irc6038a"],
    },
  ];

  return (
    <section id="how-we-decide" className="border-b border-slate-100 bg-paper py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          How we decide
        </p>
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Which rules does the checker follow?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Each question applies one rule from the primary sources below. Where you answer
          &ldquo;Not sure&rdquo; about money moving, the checker leans towards filing; that is our
          cautious choice, not an IRS rule.
        </p>
        <div className="mt-8 space-y-4">
          {rules.map((rule) => (
            <article key={rule.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{rule.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{rule.body}</p>
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
          against the Form 5472 instructions (Rev. 12/2024), the Form 1120 and Form 1065 instructions,
          IRC §6038A and the Treasury regulations linked above. General information, not tax advice.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-slate-100 bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          What are common Form 5472 filing questions?
        </h2>
        <div className="mt-8 space-y-3">
          {CHECKER_FAQS.map(({ q, a }) => (
            <details key={q} className="rounded-lg border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">{q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
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
      <div className="mx-auto max-w-xl px-6">
        <h2 className="mb-3 text-2xl font-semibold">Ready to file the forms?</h2>
        <p className="mb-6 text-sm leading-relaxed text-accent-100">
          If the checker points to a filing requirement, we prepare Form 5472 and the pro forma 1120
          for your foreign-owned LLC.
        </p>
        <Link
          href="/start?src=tool-checker"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent-50"
        >
          File it now — done for you
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function CheckerStructuredData() {
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
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: PAGE_DESCRIPTION,
    publisher: organization,
    author: organization,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CHECKER_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Do I Need to File Form 5472?", path: PAGE_PATH },
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
