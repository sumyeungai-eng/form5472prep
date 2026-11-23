import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Send, ShieldCheck, Sparkles } from "lucide-react";
import {
  TIERS as EnglishTIERS,
  TIER_ORDER,
  MULTI_YEAR_ADDON_CENTS,
  MULTI_YEAR_ADDON_LABEL,
  STANDARD_TURNAROUND as EnglishSTANDARD_TURNAROUND,
  EXPRESS_TURNAROUND as EnglishEXPRESS_TURNAROUND,
  EIN_PRICE_CENTS,
  ITIN_PRICE_CENTS,
  EXTENSION_PRICE_CENTS,
  type Tier,
} from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { FaxReceiptProof } from "@/components/FaxReceiptProof";
import { ComparisonTable, FILING_COMPARISON as EnglishFILING_COMPARISON } from "@/components/ComparisonTable";
import { BRAND_CAPSULES as EnglishBRAND_CAPSULES, SERVICE_FACT_FAQS as EnglishSERVICE_FACT_FAQS } from "@/lib/faq";
import { ORG_REF, SITE_URL, SPEAKABLE, breadcrumbList, organizationDocument, pageMeta } from "@/lib/seo";
import { getMarketingTranslator, type MarketingTranslator } from "@/i18n/marketing";
import { localizedPath, type MarketingLocale } from "@/i18n/marketing/config";
import { translateData, localizedMetadata, LocalizedJsonLd } from "@/components/marketing/translation";

function createPricing(locale: "en" | MarketingLocale, t: MarketingTranslator) {
  const EXPRESS_TURNAROUND = locale === "en" ? EnglishEXPRESS_TURNAROUND : t("shared.expressTurnaround", { days: EnglishEXPRESS_TURNAROUND.match(/[0-9]+(?:-[0-9]+)?/)?.[0] ?? "" });
  const STANDARD_TURNAROUND = locale === "en" ? EnglishSTANDARD_TURNAROUND : t("shared.standardTurnaround", { days: EnglishSTANDARD_TURNAROUND.match(/[0-9]+(?:-[0-9]+)?/)?.[0] ?? "" });
  const BRAND_CAPSULES = translateData(locale, t, "shared.capsules", EnglishBRAND_CAPSULES);
  const SERVICE_FACT_FAQS = translateData(locale, t, "shared.serviceFaqs", EnglishSERVICE_FACT_FAQS);
  const TIERS = translateData(locale, t, "shared.tiers", EnglishTIERS);
  const FILING_COMPARISON = translateData(locale, t, "shared.comparison", EnglishFILING_COMPARISON);
  const JsonLd = ({ data }: { data: object }) => <LocalizedJsonLd locale={locale} path="/pricing" data={data} />;


  const metadata: Metadata = {
    title: t("pricing.s001"),
    description:
      t("pricing.s002", { value1: formatPrice(TIERS.standard.priceCents), value2: STANDARD_TURNAROUND, value3: formatPrice(TIERS.express.priceCents), value4: EXPRESS_TURNAROUND }),
    ...pageMeta({
      title: t("pricing.s003"),
      description:
        t("pricing.s002", { value1: formatPrice(TIERS.standard.priceCents), value2: STANDARD_TURNAROUND, value3: formatPrice(TIERS.express.priceCents), value4: EXPRESS_TURNAROUND }),
      path: "/pricing",
    }),
  };

  const tierEntries = TIER_ORDER.map((key) => [key, TIERS[key]] as const);

  // Visible "Last reviewed" date and the WebPage dateModified share this one
  // constant so they cannot drift. Bump it whenever pricing or process copy changes.
  const PRICING_LAST_REVIEWED = "2026-10-26";
  const PRICING_LAST_REVIEWED_LABEL = t("pricing.s004");

  // The H2 cost capsule and the brand FAQ entries are the shared brand capsules
  // (src/lib/faq.ts) — the same words as /, /about, /faq and llms.txt, with
  // prices and turnarounds templated from src/lib/pricing.ts.
  const { cost: COST, automated: AUTOMATED, express: EXPRESS, legit: LEGIT, snapfile: SNAPFILE } = BRAND_CAPSULES;

  const PRICING_FAQS: { q: string; a: string }[] = [
    { q: EXPRESS.question, a: EXPRESS.answer },
    {
      q: t("pricing.s005"),
      a: t("pricing.s006", { value1: TIERS.standard.label, value2: formatPrice(TIERS.standard.priceCents), value3: STANDARD_TURNAROUND, value4: TIERS.express.label.toLowerCase(), value5: formatPrice(TIERS.express.priceCents), value6: EXPRESS_TURNAROUND }),
    },
    {
      q: t("pricing.s007"),
      a: t("pricing.s008"),
    },
    {
      q: t("pricing.s009"),
      a: t("pricing.s010", { value1: formatPrice(MULTI_YEAR_ADDON_CENTS) }),
    },
    {
      q: t("pricing.s011"),
      a: t("pricing.s012"),
    },
    { q: AUTOMATED.question, a: AUTOMATED.answer },
    { q: LEGIT.question, a: LEGIT.answer },
    { q: SNAPFILE.question, a: SNAPFILE.answer },
    ...SERVICE_FACT_FAQS.map(({ question, answer }) => ({ q: question, a: answer })),
  ];

  // Schema.org Product with Offer per tier — drives rich-result pricing
  // snippets in Google search.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/pricing#product`,
    name: t("pricing.s013"),
    description:
      t("pricing.s014"),
    // Same Organization @id as every other page, so engines consolidate the brand.
    brand: ORG_REF,
    manufacturer: ORG_REF,
    offers: [
      ...tierEntries.map(([slug, tierInfo]) => ({
        "@type": "Offer",
        name: t("pricing.s015", { value1: tierInfo.label, value2: tierInfo.subtitle }),
        priceCurrency: "USD",
        price: (tierInfo.priceCents / 100).toFixed(2),
        url: `${SITE_URL}/start?tier=${slug}`,
        availability: "https://schema.org/InStock",
        seller: ORG_REF,
        eligibleQuantity: { "@type": "QuantitativeValue", value: 1, unitText: t("pricing.s016") },
      })),
      // The flat add-on for every tax year past the first, on either tier.
      {
        "@type": "Offer",
        name: locale === "en" ? MULTI_YEAR_ADDON_LABEL : t("shared.additionalYear"),
        description: t("pricing.s017"),
        priceCurrency: "USD",
        price: (MULTI_YEAR_ADDON_CENTS / 100).toFixed(2),
        url: `${SITE_URL}/start`,
        availability: "https://schema.org/InStock",
        seller: ORG_REF,
        eligibleQuantity: { "@type": "QuantitativeValue", value: 1, unitText: t("pricing.s018") },
      },
    ],
  };

  // WebPage + Speakable: the H1 and the cost capsule are the passages to read
  // aloud; dateModified matches the visible "Last reviewed" line.
  const pricingWebPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/pricing#webpage`,
    url: `${SITE_URL}/pricing`,
    name: t("pricing.s019"),
    dateModified: PRICING_LAST_REVIEWED,
    inLanguage: "en-US",
    publisher: ORG_REF,
    about: { "@id": `${SITE_URL}/pricing#product` },
    speakable: SPEAKABLE,
  };

  const pricingFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    // The H2 cost capsule is visible on the page, so it leads the FAQPage.
    mainEntity: [{ q: COST.question, a: COST.answer }, ...PRICING_FAQS].map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  function PricingPage() {
    return (
      <main className="bg-white">
        <JsonLd data={organizationDocument()} />
        <JsonLd data={productJsonLd} />
        <JsonLd data={pricingWebPageJsonLd} />
        <JsonLd data={pricingFaqJsonLd} />
        <JsonLd
          data={breadcrumbList([
            { name: t("pricing.s020"), path: "/" },
            { name: t("pricing.s021"), path: "/pricing" },
          ])}
        />

        <section className="relative overflow-hidden bg-ink text-white">
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
            }}
          />
          <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
            <div className="text-center max-w-3xl mx-auto">
              <p className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t("pricing.s022")}
              </p>
              <h1 className="mt-5 font-serif text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-balance">
                {t("pricing.s023")}<br />
                <span className="text-accent-100">{formatPrice(TIERS.standard.priceCents)} {t("pricing.s024")}{formatPrice(TIERS.express.priceCents)}{t("pricing.s025")}</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
                {t("pricing.s026")}{" "}
                {t("pricing.s027")}{STANDARD_TURNAROUND}{t("pricing.s028")}{EXPRESS_TURNAROUND} {t("pricing.s029")}
              </p>

              <p className="mt-5 text-xs text-slate-400">
                {t("pricing.s030")}<time dateTime={PRICING_LAST_REVIEWED}>{PRICING_LAST_REVIEWED_LABEL}</time>
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white ring-1 ring-white/15">
                  <Send className="h-4 w-4 text-accent-100" />
                  {t("pricing.s031")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white ring-1 ring-white/15">
                  <ShieldCheck className="h-4 w-4 text-accent-100" />
                  {t("pricing.s032")}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h2 id="cost" className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              {COST.question}
            </h2>
            <p className="mt-3 text-slate-600" data-speakable>
              {COST.answer}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto items-stretch">
            {tierEntries.map(([slug, tierInfo]) => (
              <TierCard key={slug} slug={slug} tier={tierInfo} />
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 text-center">
            <span className="font-semibold text-slate-900">
              + {formatPrice(MULTI_YEAR_ADDON_CENTS)} {t("pricing.s033")}</span>
            <span className="mx-2 text-slate-400">·</span>
            <span>
              {t("pricing.s034")}{" "}
              <span className="font-semibold text-slate-900">
                {t("pricing.s035", { amount1: "$25,000" })}
              </span>
            </span>
          </div>
          <p className="mt-4 text-center text-sm text-slate-600">
            {t("pricing.s036")}{" "}
            <Link href={localizedPath(locale, "/blog/form-5472-cost")} className="font-medium text-accent underline underline-offset-2 hover:text-accent-700">
              {t("pricing.s037")}
            </Link>
            {t("pricing.s038")}{" "}
            <Link
              href={localizedPath(locale, "/compare/form-5472-filing-services")}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent-700"
            >
              {t("pricing.s039")}
            </Link>
            .
          </p>

          <p className="mt-4 text-xs text-slate-500 text-center max-w-2xl mx-auto">
            {t("pricing.s040", { currency: "USD" })}
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-16 sm:pb-20">
          <h2 className="text-center font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            {t("pricing.s041")}
          </h2>
          <p className="mt-3 text-center text-sm text-slate-600 max-w-2xl mx-auto">
            {t("pricing.s042")}
          </p>
          <ComparisonTable {...FILING_COMPARISON} className="mt-8" />
        </section>

        {/* EIN / ITIN cross-sell — passes internal-link equity to the newer
            service pages and captures founders who need more than the 5472. */}
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-center font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
              {t("pricing.s043")}
            </p>
            <h2 className="mt-3 text-center font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              {t("pricing.s044")}
            </h2>
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              {[
                {
                  href: "/ein",
                  eyebrow: t("pricing.s045", { value1: formatPrice(EIN_PRICE_CENTS) }),
                  title: t("pricing.s046"),
                  body: t("pricing.s047", { days1: "1–5" }),
                },
                {
                  href: "/itin",
                  eyebrow: t("pricing.s048", { value1: formatPrice(ITIN_PRICE_CENTS) }),
                  title: t("pricing.s049"),
                  body: t("pricing.s050"),
                },
                {
                  href: "/form-7004-extension",
                  eyebrow: t("pricing.s051", { value1: formatPrice(EXTENSION_PRICE_CENTS) }),
                  title: t("pricing.s052"),
                  body: t("pricing.s053"),
                },
              ].map((s) => (
                <Link
                  key={s.href}
                  href={localizedPath(locale, s.href)}
                  className="group block h-full rounded-xl border border-slate-200 bg-white p-6 transition hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">{s.eyebrow}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                    <span
                      aria-hidden
                      className="text-accent transition group-hover:translate-x-0.5 inline-block"
                    >
                      →
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Annotated fax-receipt section — differentiates against $49 DIY
            competitors that issue no proof-of-delivery. Sits between the
            pricing cards and the FAQ so anyone weighing the fee
            sees the actual product artifact next to the price. */}
        <FaxReceiptProof locale={locale} />

        <section className="max-w-4xl mx-auto px-6 pb-20 space-y-8">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-tight text-ink">
            {t("pricing.s054")}
          </h2>
          <div className="space-y-4">
            {PRICING_FAQS.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </section>
      </main>
    );
  }

  function TierCard({ slug, tier }: { slug: Tier; tier: typeof TIERS[Tier] }) {
    const highlighted = !!tier.highlight;
    return (
      <div
        className={[
          "relative flex flex-col rounded-2xl bg-white p-6 sm:p-7",
          highlighted
            ? "border-2 border-accent shadow-lg shadow-accent/10"
            : "border border-slate-200",
        ].join(" ")}
      >
        {highlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow">
              <Sparkles className="h-3 w-3" />
              {t("pricing.s055")}
            </span>
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold text-ink">{tier.label}</h3>
          <p className="mt-1 text-sm text-slate-600">{tier.subtitle}</p>
        </div>

        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="font-serif text-5xl font-semibold tracking-tight text-ink">
            {formatPrice(tier.priceCents)}
          </span>
          <span className="font-mono text-xs text-slate-500">{t("pricing.s056")}</span>
        </div>

        <ul className="mt-6 space-y-2.5 text-sm text-slate-700 flex-1">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 flex-none mt-0.5 text-emerald-600" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Link
          href={localizedPath(locale, `/start?tier=${slug}`)}
          className={[
            "mt-7 inline-flex items-center justify-center rounded-md h-11 px-5 text-sm font-semibold transition",
            highlighted
              ? "bg-accent text-white hover:bg-accent-dark"
              : "bg-slate-900 text-white hover:bg-slate-800",
          ].join(" ")}
        >
          {tier.ctaLabel}
        </Link>
      </div>
    );
  }

  function FaqItem({ q, a }: { q: string; a: string }) {
    return (
      <details className="group rounded-lg border border-slate-200 bg-white p-4 open:bg-slate-50">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
          {q}
          <span className="text-slate-400 group-open:rotate-180 transition">▾</span>
        </summary>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">{a}</p>
      </details>
    );
  }

  return { Page: PricingPage, metadata: localizedMetadata(locale, "/pricing", metadata) };
}
export function PricingPage({ locale = "en", t = getMarketingTranslator(locale) }: { locale?: "en" | MarketingLocale; t?: MarketingTranslator } = {}) { return createPricing(locale, t).Page(); }
export function pricingMetadata(locale: "en" | MarketingLocale) { return createPricing(locale, getMarketingTranslator(locale)).metadata; }
