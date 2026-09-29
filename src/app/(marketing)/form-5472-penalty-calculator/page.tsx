import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileQuestion,
  FileWarning,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import { SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import {
  CONTINUATION_GRACE_DAYS,
  CONTINUATION_PER_PERIOD_CENTS,
  PENALTY_PER_FORM_CENTS,
} from "@/lib/penalty";
import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import {
  LAST_REVIEWED_ISO,
  LAST_REVIEWED_LABEL,
  SOURCES,
  type SourceId,
} from "@/lib/tools/penalty/sources";
import { PenaltyCalculator } from "./PenaltyCalculator";

const PAGE_PATH = "/form-5472-penalty-calculator";
const PAGE_TITLE = "Form 5472 Penalty Calculator — What Late Filing Costs";
const PAGE_DESCRIPTION =
  "Estimate Form 5472 late-filing exposure, see IRS penalty citations, and review the DIIRSP reasonable-cause path for catching up.";

const PENALTY_FAQS = [
  {
    q: "Is the Form 5472 penalty really automatic?",
    a: `It can be. IRC §6038A(d) sets an initial ${formatPrice(PENALTY_PER_FORM_CENTS)} penalty when a reporting corporation doesn't furnish the required Form 5472 information on time, and a substantially incomplete Form 5472 counts as not filed. The IRS manual says the penalty may be assessed systemically when a late Form 5472 is processed with a late Form 1120.`,
  },
  {
    q: "Can the penalty be abated?",
    a: "Possibly, but there is no guarantee. Treas. Reg. §1.6038A-4(b) lets the IRS excuse a late Form 5472 for reasonable cause, decided case by case. First Time Abate generally does not apply to Form 5472 penalties.",
  },
  {
    q: "What is a CP 215 notice?",
    a: "It is the IRS's Notice of Penalty Charge. The IRS manual says a CP 215 is generated and sent once a Form 5472 penalty is assessed. Once the IRS has notified you of the failure, continuation penalties can start 90 days later if the filing is still not corrected.",
  },
  {
    q: "Does having no income exempt me from the penalty?",
    a: "No. A foreign-owned disregarded LLC can still have a Form 5472 and pro forma Form 1120 filing obligation even when it had no income, because reportable transactions can include contributions, distributions, and other owner-LLC activity.",
  },
  {
    q: "Is there a statute of limitations?",
    a: "Under IRC §6501(c)(8), the time to assess tax for a return or period the Form 5472 information relates to does not expire until 3 years after the IRS is furnished that information.",
    href: "/blog/form-5472-statute-of-limitations",
    linkText: "Read the Form 5472 statute of limitations guide.",
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

export default function Form5472PenaltyCalculatorPage() {
  return (
    <>
      <PenaltyCalculatorStructuredData />
      <main className="bg-white">
        <Hero />
        <PenaltyCalculator />
        <HowPenaltyWorks />
        <HowWeCalculate />
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
            <ShieldCheck className="h-3.5 w-3.5" />
            Free tool
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Form 5472 penalty calculator.
          </h1>
          <p
            data-speakable
            className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300"
          >
            The IRS can assess $25,000 per Form 5472, per year, often automatically when a late return is processed, and
            another $25,000 per 30 days once 90 days pass after a notice.
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            Use this as a statutory exposure estimate, then compare it with the
            ordinary catch-up route: file the missing Form 5472 package and
            include a reasonable-cause statement under DIIRSP.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
            Calm next step
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">
            Estimate first, then fix the filing.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The number below is not a prediction. It is a statutory framework
            calculator paired with the IRS&apos;s route for filing late
            information returns.
          </p>
          <Link href="/start?src=tool-penalty" className="group mt-5 block">
            <Button className="h-12 w-full gap-2">
              File the late years — {formatPrice(TIERS.standard.priceCents)}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowPenaltyWorks() {
  const blocks = [
    {
      icon: FileWarning,
      title: "What is the initial penalty?",
      body: `The initial penalty is ${formatPrice(PENALTY_PER_FORM_CENTS)} per Form 5472, per year. We use it as a statutory exposure estimate because the IRS can assess it when required Form 5472 information is late, missing, or substantially incomplete (often automatically when a late return is processed), before you compare the number with the ordinary catch-up route.`,
    },
    {
      icon: Clock,
      title: "What happens after a notice?",
      body: `After an IRS notice, there is a ${CONTINUATION_GRACE_DAYS}-day correction period. If the filing is still not fixed after that window, the statute adds ${formatPrice(CONTINUATION_PER_PERIOD_CENTS)} for each 30-day period or part of one, so we treat the notice timeline separately from the initial per-form, per-year penalty estimate.`,
    },
    {
      icon: FileQuestion,
      title: "What are common triggers?",
      body: "Common triggers are never filing, filing Form 5472 without the required pro forma Form 1120, or sending an incomplete package. We also flag no-income cases, since a foreign-owned disregarded LLC can still have a filing obligation when reportable transactions include contributions, distributions, and other owner-LLC activity.",
    },
    {
      icon: ShieldCheck,
      title: "What is the relief path?",
      body: "If the IRS has not contacted you yet, the relief path is a DIIRSP filing that pairs late information returns with a reasonable-cause statement. We follow the ordinary catch-up route described above: file the missing Form 5472 package, include the statement, and ask the IRS to abate penalties when the facts support reasonable cause.",
    },
  ];

  return (
    <section className="border-b border-slate-100 bg-paper py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            How the penalty works
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
            How does the Form 5472 penalty rule work?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            The initial penalty applies per Form 5472, per year, and continuation penalties can add more after an IRS notice. We show both pieces together because the calculator is a statutory exposure estimate, not a prediction, and the ordinary next step is still to fix the filing with the missing package and reasonable-cause statement.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {blocks.map((block) => (
            <div
              key={block.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent">
                <block.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                {block.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {block.body}
              </p>
            </div>
          ))}
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

const PENALTY = formatPrice(PENALTY_PER_FORM_CENTS);
const CONTINUATION = formatPrice(CONTINUATION_PER_PERIOD_CENTS);

function HowWeCalculate() {
  const rules: Array<{ title: string; body: string; sources: SourceId[] }> = [
    {
      title: `Initial penalty: ${PENALTY} × LLCs × unfiled years`,
      body: `The statute sets ${PENALTY} for each taxable year a reporting corporation fails to furnish the information, and the IRS applies it to each failure to file a complete and correct Form 5472. We count one Form 5472 per LLC per year, which assumes one related party (usually the foreign owner). The IRS manual asserts the initial penalty once per related party per taxable year, so an LLC that dealt with more related parties can face more.`,
      sources: ["irc6038a", "intlPenalties", "irm20_1_9", "i5472"],
    },
    {
      title: "Continuation penalty: counted from your notice date",
      body: `If the failure continues more than ${CONTINUATION_GRACE_DAYS} days after the IRS mails notice of it, another ${CONTINUATION} applies for each 30-day period or part of one. The statute counts from the day the notice is mailed; we use the notice date you enter. Day ${CONTINUATION_GRACE_DAYS + 1} starts the first period and each further 30 days (or part) adds one, per LLC per year, up to today. The IRS says there is no maximum penalty amount.`,
      sources: ["irc6038a", "reg6038a4", "intlPenalties"],
    },
    {
      title: "How the IRS assesses it",
      body: "The IRS manual says the penalty may be assessed systemically during initial processing of a late Form 5472 attached to a late Form 1120, and that a CP 215 Notice of Penalty Charge is sent once a penalty is assessed. That is why the calculator treats the initial penalty as exposure from the day a return is late.",
      sources: ["irm20_1_9", "cp215"],
    },
    {
      title: "What the estimate leaves out",
      body: "Relief. The IRS can excuse a late Form 5472 for reasonable cause, case by case, and must apply that rule liberally to small corporations that meet its conditions. If reasonable cause existed, the 90-day period starts no earlier than the last day it did. First Time Abate isn't on the IRS's list of eligible penalties. The calculator shows none of these reductions.",
      sources: ["reg6038a4", "irc6038a", "adminRelief"],
    },
    {
      title: "Filing late before the IRS contacts you",
      body: "If you're not under IRS examination or investigation and haven't been contacted about the missing returns, the IRS says to file them through normal filing procedures, and you may attach a reasonable-cause statement. Penalties may still be assessed.",
      sources: ["diirsp"],
    },
    {
      title: "How long the IRS has",
      body: "The time to assess tax for a return or period the Form 5472 information relates to doesn't expire until 3 years after the IRS is furnished that information, so that 3-year period hasn't started while the form is unfiled. If the failure was due to reasonable cause and not willful neglect, the rule covers only the related items.",
      sources: ["irc6501"],
    },
  ];

  return (
    <section id="how-we-calculate" className="border-b border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
          How we calculate this
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
          How does the calculator work out the estimate?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          The figures come from IRC §6038A(d) and the IRS&apos;s own guidance. Each rule below links
          to its primary source.
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
          against IRC §6038A(d), Treas. Reg. §1.6038A-4, the Form 5472 instructions (Rev. 12/2024),
          IRM 20.1.9 and the IRS pages linked above. General information, not tax advice.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-slate-100 bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          What are common penalty questions?
        </h2>
        <div className="mt-7 space-y-3">
          {PENALTY_FAQS.map((faq) => (
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
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {faq.a}{" "}
                {"href" in faq ? (
                  <Link
                    href={faq.href}
                    className="font-medium text-accent underline underline-offset-4 hover:no-underline"
                  >
                    {faq.linkText}
                  </Link>
                ) : null}
              </p>
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
          Ready to file the late years?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-accent-100">
          We prepare the missing Form 5472 package, pro forma Form 1120, and
          reasonable-cause statement for DIIRSP catch-up filings.
        </p>
        <Link href="/start?src=tool-penalty" className="group mt-6 inline-block">
          <Button className="min-h-12 gap-2 bg-white px-6 text-accent hover:bg-accent-50">
            Start filing — {formatPrice(TIERS.standard.priceCents)}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function PenaltyCalculatorStructuredData() {
  const url = `${env.appUrl}${PAGE_PATH}`;

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: PAGE_TITLE,
    url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    description: PAGE_DESCRIPTION,
    dateModified: LAST_REVIEWED_ISO,
    provider: organizationNode(),
    offers: {
      "@type": "Offer",
      name: "Form 5472 penalty calculator",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PENALTY_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: "href" in faq ? `${faq.a} ${faq.linkText}` : faq.a,
      },
    })),
  };

  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Penalty calculator", path: PAGE_PATH },
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
