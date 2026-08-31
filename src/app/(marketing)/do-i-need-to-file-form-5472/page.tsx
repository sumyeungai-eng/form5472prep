import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import {
  CONTENT_LAST_REVIEWED,
  SPEAKABLE,
  breadcrumbList,
  organizationNode,
  pageOpenGraph,
} from "@/lib/seo";
import { FilingChecker } from "./FilingChecker";

const PAGE_PATH = "/do-i-need-to-file-form-5472";
const PAGE_TITLE = "Do I Need to File Form 5472? 2-Minute Checker";
const PAGE_DESCRIPTION =
  "Use this free checker to see whether your foreign-owned US LLC likely needs Form 5472 and pro forma 1120 for the tax year.";

export const metadata: Metadata = {
  title: { absolute: `${PAGE_TITLE} | Form5472 Prep` },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: pageOpenGraph({
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
    a: "The IRS penalty is generally $25,000 for a missing or incomplete Form 5472. Late filings can sometimes include a reasonable cause explanation, but the best answer depends on the exact facts.",
  },
];

export default function DoINeedToFileForm5472Page() {
  return (
    <>
      <CheckerStructuredData />
      <Hero />
      <FilingChecker />
      <PlainEnglishRule />
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
            must file Form 5472 with a pro forma Form 1120, due April 15.
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
          Form 5472 depends on ownership, tax classification, and transactions.
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

function Faq() {
  return (
    <section className="border-b border-slate-100 bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Frequently asked questions
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
    dateModified: CONTENT_LAST_REVIEWED,
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
    dateModified: CONTENT_LAST_REVIEWED,
    speakable: SPEAKABLE,
    publisher: organization,
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
