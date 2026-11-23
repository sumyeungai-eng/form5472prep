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
import { env } from "@/lib/env";
import { SPEAKABLE, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import {
  CONTINUATION_GRACE_DAYS,
  CONTINUATION_PER_PERIOD_CENTS,
  PENALTY_PER_FORM_CENTS,
} from "@/lib/penalty";
import { TIERS as EnglishTIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import {
  LAST_REVIEWED_ISO,
  LAST_REVIEWED_LABEL,
  SOURCES,
  type SourceId,
} from "@/lib/tools/penalty/sources";
import { EmbedThisCalculator } from "@/components/embed/EmbedThisCalculator";
import { PenaltyCalculator } from "@/components/tools/PenaltyCalculator";
import { getMarketingTranslator, type MarketingTranslator } from "@/i18n/marketing";
import { localizedPath, type MarketingLocale } from "@/i18n/marketing/config";
import { translateData, localizedMetadata, LocalizedJsonLd } from "@/components/marketing/translation";

function createPenalty(locale: "en" | MarketingLocale, t: MarketingTranslator) {
  const TIERS = translateData(locale, t, "shared.tiers", EnglishTIERS);
  const JsonLd = ({ data }: { data: object }) => <LocalizedJsonLd locale={locale} path="/form-5472-penalty-calculator" data={data} />;


  const PAGE_PATH = "/form-5472-penalty-calculator";
  // iframe height that fits /embed/form-5472-penalty-calculator at 640px wide with no inner scroll.
  const EMBED_HEIGHT = 1620;
  const PAGE_TITLE = t("penalty.s001");
  const PAGE_DESCRIPTION =
    t("penalty.s002");

  const PENALTY_FAQS = [
    {
      q: t("penalty.s003"),
      a: t("penalty.s004", { value1: formatPrice(PENALTY_PER_FORM_CENTS) }),
    },
    {
      q: t("penalty.s005"),
      a: t("penalty.s006"),
    },
    {
      q: t("penalty.s007"),
      a: t("penalty.s008", { days1: "90" }),
    },
    {
      q: t("penalty.s009"),
      a: t("penalty.s010"),
    },
    {
      q: t("penalty.s011"),
      a: t("penalty.s012"),
      href: "/blog/form-5472-statute-of-limitations",
      linkText: t("penalty.s013"),
    },
  ] as const;

  const metadata: Metadata = {
    title: { absolute: PAGE_TITLE },
    description: PAGE_DESCRIPTION,
    ...pageMeta({
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      path: PAGE_PATH,
    }),
    robots: { index: true, follow: true },
  };

  function Form5472PenaltyCalculatorPage() {
    return (
      <>
        <PenaltyCalculatorStructuredData />
        <main className="bg-white">
          <Hero />
          <PenaltyCalculator locale={locale} />
          <HowPenaltyWorks />
          <HowWeCalculate />
          {locale === "en" && <EmbedThisCalculator
            embedPath="/embed/form-5472-penalty-calculator"
            toolPath={PAGE_PATH}
            title={t("penalty.s014")}
            linkText={t("penalty.s014")}
            height={EMBED_HEIGHT}
          />}
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
              {t("penalty.s015")}
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
              {t("penalty.s016")}
            </h1>
            <p
              data-speakable
              className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300"
            >
              {t("penalty.s017", { amount1: "$25,000", amount2: "$25,000", days1: "30", days2: "90" })}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
              {t("penalty.s018")}{" "}
              <Link href={localizedPath(locale, "/form-5472-penalty")} className="font-medium text-white underline underline-offset-2">
                {t("penalty.s019")}
              </Link>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
              {t("penalty.s020")}
            </p>
            <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">
              {t("penalty.s021")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {t("penalty.s022")}
            </p>
            <Link href={localizedPath(locale, "/start?src=tool-penalty")} className="group mt-5 block">
              <Button className="h-12 w-full gap-2">
                {t("penalty.s023")}{formatPrice(TIERS.standard.priceCents)}
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
        title: t("penalty.s024"),
        body: t("penalty.s025", { value1: formatPrice(PENALTY_PER_FORM_CENTS) }),
      },
      {
        icon: Clock,
        title: t("penalty.s026"),
        body: t("penalty.s027", { periodDays: 30, value1: CONTINUATION_GRACE_DAYS, value2: formatPrice(CONTINUATION_PER_PERIOD_CENTS) }),
      },
      {
        icon: FileQuestion,
        title: t("penalty.s028"),
        body: t("penalty.s029"),
      },
      {
        icon: ShieldCheck,
        title: t("penalty.s030"),
        body: t("penalty.s031"),
      },
    ];

    return (
      <section className="border-b border-slate-100 bg-paper py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              {t("penalty.s032")}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
              {t("penalty.s033")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {t("penalty.s034")}
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
        href={localizedPath(locale, source.url)}
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
        title: t("penalty.s035", { value1: PENALTY }),
        body: t("penalty.s036", { value1: PENALTY }),
        sources: ["irc6038a", "intlPenalties", "irm20_1_9", "i5472"],
      },
      {
        title: t("penalty.s037"),
        body: t("penalty.s038", { periodDays: 30, days1: "30", value1: CONTINUATION_GRACE_DAYS, value2: CONTINUATION, value3: CONTINUATION_GRACE_DAYS + 1 }),
        sources: ["irc6038a", "reg6038a4", "intlPenalties"],
      },
      {
        title: t("penalty.s039"),
        body: t("penalty.s040"),
        sources: ["irm20_1_9", "cp215"],
      },
      {
        title: t("penalty.s041"),
        body: t("penalty.s042", { graceDays: CONTINUATION_GRACE_DAYS }),
        sources: ["reg6038a4", "irc6038a", "adminRelief"],
      },
      {
        title: t("penalty.s043"),
        body: t("penalty.s044"),
        sources: ["diirsp"],
      },
      {
        title: t("penalty.s045"),
        body: t("penalty.s046"),
        sources: ["irc6501"],
      },
    ];

    return (
      <section id="how-we-calculate" className="border-b border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            {t("penalty.s047")}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
            {t("penalty.s048")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {t("penalty.s049")}
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
            <span className="font-semibold text-slate-800">{t("penalty.s050")}{locale === "en" ? LAST_REVIEWED_LABEL : new Date(LAST_REVIEWED_ISO).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</span>{" "}
            {t("penalty.s051")}
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
            {t("penalty.s052")}
          </h2>
          <div className="mt-7 space-y-3">
            {PENALTY_FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-slate-200 bg-white p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                  <h3>{faq.q}</h3>
                  <span aria-hidden className="text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {faq.a}{" "}
                  {"href" in faq ? (
                    <Link
                      href={localizedPath(locale, faq.href)}
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
            {t("penalty.s053")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-accent-100">
            {t("penalty.s054")}
          </p>
          <Link href={localizedPath(locale, "/start?src=tool-penalty")} className="group mt-6 inline-block">
            <Button className="min-h-12 gap-2 bg-white px-6 text-accent hover:bg-accent-50">
              {t("penalty.s055")}{formatPrice(TIERS.standard.priceCents)}
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
        name: t("penalty.s014"),
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
      { name: t("penalty.s056"), path: "/" },
      { name: t("penalty.s057"), path: PAGE_PATH },
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

  return { Page: Form5472PenaltyCalculatorPage, metadata: localizedMetadata(locale, "/form-5472-penalty-calculator", metadata) };
}
export function PenaltyPage({ locale = "en", t = getMarketingTranslator(locale) }: { locale?: "en" | MarketingLocale; t?: MarketingTranslator } = {}) { return createPenalty(locale, t).Page(); }
export function penaltyMetadata(locale: "en" | MarketingLocale) { return createPenalty(locale, getMarketingTranslator(locale)).metadata; }
