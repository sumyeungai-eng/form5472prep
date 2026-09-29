import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, CircleSlash, Scale, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import { SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { TX_CHECKER_FAQS } from "@/lib/tools/reportable-transactions/content";
import {
  METHOD_SOURCES,
  SOURCES,
  TX_CHECKER_LAST_REVIEWED,
  TX_CHECKER_LAST_REVIEWED_LABEL,
} from "@/lib/tools/reportable-transactions/sources";
import {
  GROUPS,
  PART_DESCRIPTIONS,
  TRANSACTIONS,
  type FormPart,
} from "@/lib/tools/reportable-transactions/transactions";
import { TransactionsChecker } from "./TransactionsChecker";
import { VerdictBadge } from "./VerdictBadge";

const PAGE_PATH = "/form-5472-reportable-transactions-checker";
const PAGE_TITLE = "Form 5472 Reportable Transactions Checker";
const PAGE_DESCRIPTION =
  "Free checker for foreign-owned US LLCs: are owner transfers, loans, or LLC fees you paid personally reportable on Form 5472? Answers cite IRS sources.";
const CTA_HREF = "/start?src=tool-txcheck";

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

const RELATED_GUIDES = [
  { href: "/blog/form-5472-reportable-transactions-examples", label: "Form 5472 reportable transactions: 15 examples" },
  { href: "/blog/form-5472-formation-costs-registered-agent-fees", label: "Formation costs and registered agent fees" },
  { href: "/blog/form-5472-owner-loans-contributions-reimbursements", label: "Owner loans, contributions and reimbursements" },
  { href: "/blog/form-5472-outstanding-owner-loan-no-transfers", label: "An outstanding owner loan with no new transfers" },
  { href: "/do-i-need-to-file-form-5472", label: "Do I need to file Form 5472? (2-minute checker)" },
  { href: "/form-5472-penalty-calculator", label: "Form 5472 penalty calculator" },
] as const;

export default function ReportableTransactionsCheckerPage() {
  const ctaLabel = `Start filing — ${formatPrice(TIERS.standard.priceCents)}`;
  return (
    <>
      <StructuredData />
      <Hero />
      <TransactionsChecker ctaLabel={ctaLabel} />
      <AllTransactions />
      <HowWeDecide />
      <Faq />
      <FinalCta ctaLabel={ctaLabel} />
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
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <p className="mb-6 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Free tool
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Is this a reportable transaction on Form 5472?
          </h1>
          <p data-speakable className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            For a foreign-owned single-member US LLC, any money or property that moves between you
            and the LLC is a reportable transaction — including state fees, registered-agent fees and
            other LLC costs you pay personally, and loans either way. Sales to unrelated customers
            and payments to unrelated vendors are not.
          </p>
        </div>
        <ul className="mt-8 grid max-w-4xl gap-3 text-sm sm:grid-cols-2">
          <li className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-4 text-slate-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
            <span>
              <span className="font-semibold text-white">Reportable:</span> money you put in or take
              out, loans and interest, LLC bills you paid yourself, property you contribute, dealings
              with your family or other companies you control.
            </span>
          </li>
          <li className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-4 text-slate-200">
            <CircleSlash className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <span>
              <span className="font-semibold text-white">Not reportable:</span> payments from
              unrelated customers and payments by the LLC to unrelated vendors or contractors.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function AllTransactions() {
  return (
    <section id="all-transactions" className="border-b border-slate-100 bg-paper py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            Quick reference
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
            Every transaction type, answered
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            The same answers the checker gives, for all {TRANSACTIONS.length} transaction types.
            &ldquo;You&rdquo; is the foreign owner of a US single-member LLC that has not elected to be
            taxed as a corporation.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {GROUPS.map((group) => (
            <div key={group.id}>
              <h3 className="font-serif text-xl font-semibold text-ink">{group.title}</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {TRANSACTIONS.filter((item) => item.group === group.id).map((item) => (
                  <article
                    key={item.id}
                    id={item.id}
                    className="min-w-0 scroll-mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <VerdictBadge verdict={item.verdict} />
                    <h4 className="mt-3 text-base font-semibold leading-snug text-slate-900">
                      {item.label}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.hint}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      <span className="font-medium text-ink">Where it goes: </span>
                      {item.where}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.reason}</p>
                    <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <span className="text-slate-500">Source:</span>
                      {item.sources.map((key) => (
                        <a
                          key={key}
                          href={SOURCES[key].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-words font-medium text-accent hover:underline"
                        >
                          {SOURCES[key].label}
                        </a>
                      ))}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PART_ORDER: FormPart[] = ["IV", "V", "VI"];

function HowWeDecide() {
  const steps = [
    {
      title: "Is the other side a related party?",
      body: "You are one, as the LLC's foreign owner. So are your spouse, brothers and sisters, ancestors (parents, grandparents) and descendants (children, grandchildren), and companies you own more than 50% of or otherwise control (Treas. Reg. §1.6038A-1(d), via IRC §267(b) and §482). Unrelated customers and vendors are not.",
    },
    {
      title: "Did money, property or services move?",
      body: "A foreign-owned single-member LLC is treated as a separate corporation for Form 5472 (Treas. Reg. §1.6038A-1(c)(1)). On top of the usual list of sales, services, loans and interest, it must report “any other transaction” in the sense of §1.482-1(i)(7) — any transfer of money or property, however carried out, including contributions and distributions (§1.6038A-2(b)(3)(xi)).",
    },
    {
      title: "Which part of the form?",
      body: "Money-only dealings with a foreign related party go in Part IV; contributions, distributions and other transfers go in Part V; non-cash or below-value dealings with a foreign related party are described in Part VI (§1.6038A-2(b)(3)–(4) and the Form 5472 instructions).",
    },
  ];

  return (
    <section id="how-we-decide" className="border-b border-slate-100 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            <Scale className="h-3.5 w-3.5" />
            How we decide
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
            How does this checker decide what is reportable?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Every answer applies three questions to the IRS instructions for Form 5472 and the
            Treasury regulations behind them. Where those sources do not settle a case, the checker
            says &ldquo;Depends&rdquo; rather than guessing.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-mono text-xs font-medium text-accent">Step {index + 1}</p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>

        <figure className="mt-8 rounded-xl border-l-4 border-seal bg-paper p-5">
          <figcaption className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            The key rule, word for word
          </figcaption>
          <blockquote className="mt-2 text-sm leading-relaxed text-slate-700">
            &ldquo;{SOURCES.reg2B3Xi.quote}&rdquo;
          </blockquote>
          <p className="mt-2 text-xs text-slate-500">
            <a
              href={SOURCES.reg2B3Xi.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              {SOURCES.reg2B3Xi.label}
            </a>
            , added by T.D. 9796. The §1.482-1(i)(7) definition it points to covers any
            &ldquo;transfer of any interest in or a right to use any property … or money, however
            such transaction is effected&rdquo;.
          </p>
        </figure>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="min-w-0">
            <h3 className="font-serif text-xl font-semibold text-ink">The parts of Form 5472, in plain words</h3>
            <dl className="mt-4 space-y-4">
              {PART_ORDER.map((part) => (
                <div key={part}>
                  <dt className="text-sm font-semibold text-slate-900">{PART_DESCRIPTIONS[part].title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-600">{PART_DESCRIPTIONS[part].plain}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Transactions with a US related party still count, but the instructions do not require
              them to be itemised in Parts IV–VI. Amounts are reported in US dollars with the
              exchange rates used.
            </p>
          </div>

          <div className="min-w-0">
            <h3 className="font-serif text-xl font-semibold text-ink">Primary sources</h3>
            <ul className="mt-4 space-y-3">
              {METHOD_SOURCES.map((source) => (
                <li key={source.url} className="text-sm leading-relaxed">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words font-medium text-accent hover:underline"
                  >
                    {source.label}
                  </a>
                  <span className="block text-slate-600">{source.note}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-slate-700">
              Last reviewed{" "}
              <time dateTime={TX_CHECKER_LAST_REVIEWED} className="font-semibold">
                {TX_CHECKER_LAST_REVIEWED_LABEL}
              </time>
              .
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              General information, not tax advice. We prepare and submit forms from the information
              you give us; for advice on your own situation, speak to a tax professional.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 bg-paper p-5">
          <h3 className="text-sm font-semibold text-slate-900">Worked examples and related tools</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {RELATED_GUIDES.map((guide) => (
              <li key={guide.href}>
                <Link
                  href={guide.href}
                  className="group inline-flex items-start gap-2 text-sm font-medium text-accent hover:underline"
                >
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  {guide.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-slate-100 bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          What do foreign LLC owners ask about reportable transactions?
        </h2>
        <div className="mt-8 space-y-3">
          {TX_CHECKER_FAQS.map(({ q, a }) => (
            <details key={q} className="group rounded-xl border border-slate-200 bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                {q}
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ ctaLabel }: { ctaLabel: string }) {
  return (
    <section className="bg-accent py-16 text-center text-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight">
          We report all of these for you
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-accent-100">
          Tell us what moved between you and your LLC. We prepare Form 5472 and the pro forma Form
          1120, including the attached statements, and fax the package to the IRS.
        </p>
        <Link
          href={CTA_HREF}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent-50"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function StructuredData() {
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
    dateModified: TX_CHECKER_LAST_REVIEWED,
    description: PAGE_DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: organization,
    author: organization,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TX_CHECKER_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Reportable transactions checker", path: PAGE_PATH },
  ]);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    dateModified: TX_CHECKER_LAST_REVIEWED,
    speakable: SPEAKABLE,
    publisher: organization,
    citation: METHOD_SOURCES.map((source) => ({
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
