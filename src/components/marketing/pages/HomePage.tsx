import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Clock,
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Building2,
  Receipt,
  PenTool,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComparisonTable, FILING_COMPARISON as EnglishFILING_COMPARISON } from "@/components/ComparisonTable";
import { HowToSummary } from "@/components/HowToSummary";
import { Reveal } from "@/components/Reveal";
import {
  TIERS as EnglishTIERS,
  TIER_ORDER,
  MULTI_YEAR_ADDON_CENTS,
  STANDARD_TURNAROUND as EnglishSTANDARD_TURNAROUND,
  EXPRESS_TURNAROUND as EnglishEXPRESS_TURNAROUND,
  EIN_PRICE_CENTS,
  EXTENSION_PRICE_CENTS,
  ITIN_PRICE_CENTS,
} from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { BRAND_CAPSULES as EnglishBRAND_CAPSULES } from "@/lib/faq";
import { env } from "@/lib/env";
import { getConfirmedFilingsCount, formatFilingCount } from "@/lib/stats";
import { FaxReceiptProof } from "@/components/FaxReceiptProof";
import { CONTENT_LAST_REVIEWED, ORG_REF, SITE_NAME, howTo, organizationDocument, pageMeta, AREA_SERVED } from "@/lib/seo";
import { getMarketingTranslator, type MarketingTranslator } from "@/i18n/marketing";
import { localizedPath, type MarketingLocale } from "@/i18n/marketing/config";
import { translateData, localizedMetadata, LocalizedJsonLd } from "@/components/marketing/translation";

function createHome(locale: "en" | MarketingLocale, t: MarketingTranslator) {
  const EXPRESS_TURNAROUND = locale === "en" ? EnglishEXPRESS_TURNAROUND : t("shared.expressTurnaround", { days: EnglishEXPRESS_TURNAROUND.match(/[0-9]+(?:-[0-9]+)?/)?.[0] ?? "" });
  const STANDARD_TURNAROUND = locale === "en" ? EnglishSTANDARD_TURNAROUND : t("shared.standardTurnaround", { days: EnglishSTANDARD_TURNAROUND.match(/[0-9]+(?:-[0-9]+)?/)?.[0] ?? "" });
  const BRAND_CAPSULES = translateData(locale, t, "shared.capsules", EnglishBRAND_CAPSULES);
  const TIERS = translateData(locale, t, "shared.tiers", EnglishTIERS);
  const FILING_COMPARISON = translateData(locale, t, "shared.comparison", EnglishFILING_COMPARISON);
  const JsonLd = ({ data }: { data: object }) => <LocalizedJsonLd locale={locale} path="/" data={data} />;


  // FAQ content is the source of truth for both the rendered <dl> and the
  // FAQPage JSON-LD structured data — keep them in lockstep by sharing the array.
  // Order is intentional: pricing/scope questions first (highest visitor intent),
  // then mechanics, then trust/legal. The cost and "automated?" brand capsules
  // are H2 sections (Pricing, Automated); the Express and "legit?" capsules sit
  // here. All four come verbatim from BRAND_CAPSULES in src/lib/faq.ts.
  const FAQS = [
    { q: BRAND_CAPSULES.express.question, a: BRAND_CAPSULES.express.answer },
    {
      q: t("home.s001"),
      a: t("home.s002", { value1: formatPrice(MULTI_YEAR_ADDON_CENTS) }),
    },
    {
      q: t("home.s003"),
      a: t("home.s004"),
    },
    {
      q: t("home.s005"),
      a: t("home.s006"),
    },
    {
      q: t("home.s007"),
      a: t("home.s008"),
    },
    {
      q: t("home.s009"),
      a: t("home.s010", { value1: formatPrice(MULTI_YEAR_ADDON_CENTS) }),
    },
    {
      q: t("home.s011"),
      a: t("home.s012"),
    },
    { q: BRAND_CAPSULES.legit.question, a: BRAND_CAPSULES.legit.answer },
    {
      q: t("home.s013"),
      a: t("home.s014"),
    },
  ];

  // ISR: the homepage reads a live filings count from the DB. Regenerate the
  // static page every 10 minutes instead of server-rendering on every request, so
  // it's edge-cached globally while the counter stays fresh.


  const HOME_DESCRIPTION =
    t("home.s015", { value1: formatPrice(TIERS.standard.priceCents) });

  // Homepage "How it works" — mirrors the real filing flow in FilingActions:
  // enter details -> we generate the package -> accountant review (gates signing)
  // -> browser signature -> fax -> timestamped fax receipt. `id` is the stable DOM
  // id on each step heading; the same array feeds the visible list and the HowTo
  // JSON-LD (see `howToSchema` below), so the two can never drift apart.
  const processSteps = [
    {
      id: "how-step-1",
      icon: Building2,
      title: t("home.s016"),
      body: t("home.s017"),
    },
    {
      id: "how-step-2",
      icon: FileText,
      title: t("home.s018"),
      body: t("home.s019"),
    },
    {
      id: "how-step-3",
      icon: ShieldCheck,
      title: t("home.s020"),
      body: t("home.s021"),
    },
    {
      id: "how-step-4",
      icon: PenTool,
      title: t("home.s022"),
      body: t("home.s023"),
    },
    {
      id: "how-step-5",
      icon: Send,
      title: t("home.s024"),
      body: t("home.s025"),
    },
    {
      id: "how-step-6",
      icon: CheckCircle2,
      title: t("home.s026"),
      body: t("home.s027"),
    },
  ];

  const HOW_TO_META = {
    totalTime: "PT15M", // Customer hands-on time in the filing questionnaire, not IRS processing time.
    tools: [t("home.s028"), t("home.s029")],
    supplies: [t("home.s030"), t("home.s031"), t("home.s032")],
    cost: { currency: "USD", value: String(TIERS.standard.priceCents / 100) },
  };

  const metadata: Metadata = {
    // `absolute` skips the layout's "%s · Form5472 Prep" template — the homepage title
    // already brands the product, so we don't want the suffix appended.
    title: { absolute: t("home.absoluteTitle") },
    description: HOME_DESCRIPTION,
    ...pageMeta({
      title: t("home.s033"),
      description: HOME_DESCRIPTION,
      path: "/",
      image: `${env.appUrl}/opengraph-image`,
    }),
    twitter: {
      card: "summary_large_image",
      title: t("home.s033"),
      description:
        t("home.s034", { value1: formatPrice(TIERS.standard.priceCents), value2: formatPrice(TIERS.express.priceCents), value3: EXPRESS_TURNAROUND }),
      images: ["/opengraph-image"],
    },
  };

  async function LandingPage() {
    // Single server-side data fetch shared across the hero. Hits the DB
    // exactly once per server render; Next.js caches the page output so the
    // count refreshes naturally with the route's revalidation cadence.
    const filingsCount = await getConfirmedFilingsCount();
    return (
      <>
        <StructuredData />
        <Hero filingsCount={filingsCount} />
        <Pricing />
        {/* Annotated fax-receipt section — same component used on /pricing.
            Sits right after the pricing cards so anyone weighing the fee sees
            the actual proof-of-filing artifact next to the price.
            Differentiates vs $49 DIY tools that issue no receipt. */}
        <FaxReceiptProof locale={locale} />
        <TrustStrip />
        <Eligibility />
        <Deadline />
        <HowItWorks />
        <Automated />
        <Deliverables />
        <Comparison />
        <OtherServices />
        <ToolsAndGuides />
        <Faq />
        <PartnerPromo />
        <FinalCta />
      </>
    );
  }

  // Cross-sell strip for the EIN and ITIN services. Lives on the homepage so the
  // site's highest-authority page passes internal-link equity to the newer
  // /ein and /itin pages (otherwise only reachable from the nav/footer).
  function OtherServices() {
    const services = [
      {
        href: "/ein",
        eyebrow: t("home.s035", { value1: formatPrice(EIN_PRICE_CENTS) }),
        title: t("home.s036"),
        body: t("home.s037", { days1: "1–5" }),
      },
      {
        href: "/itin",
        eyebrow: t("home.s038", { value1: formatPrice(ITIN_PRICE_CENTS) }),
        title: t("home.s039"),
        body: t("home.s040"),
      },
      {
        href: "/form-7004-extension",
        eyebrow: t("home.s041", { value1: formatPrice(EXTENSION_PRICE_CENTS) }),
        title: t("home.s042"),
        body: t("home.s043"),
      },
    ];
    return (
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <SectionHead
            eyebrow={t("home.s044")}
            title={t("home.s045")}
            subtitle={t("home.s046")}
          />
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <Reveal as="div" key={s.href} delay={i * 120}>
                <Link
                  href={localizedPath(locale, s.href)}
                  className="group block h-full rounded-lg border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">{s.eyebrow}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                    {s.title}
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent" />
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Countries with the highest historical filing volume (from /admin/sources),
  // shown as a plain text line rather than emoji flags: country-flag emoji don't
  // render as flags on Windows/many desktops (they show as raw letter pairs),
  // which reads as broken to the exact foreign-founder audience this addresses.
  const FOUNDER_COUNTRIES =
    t("home.s047");

  function Hero({ filingsCount }: { filingsCount: number }) {
    return (
      <section className="relative overflow-hidden bg-ink text-white">
        {/* Faint radial highlight behind the copy — depth without pastel blobs. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 55% at 22% 0%, rgba(30,58,138,0.55) 0%, rgba(14,27,51,0) 70%)",
          }}
        />
        {/* Thin brass rule at the very top — the "official document" hairline. */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />

        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 sm:pb-20 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            {/* Left: the pitch */}
            <div className="animate-fade-in-up">
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                <span className="mb-5 flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-normal tracking-[0.2em] text-accent-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("home.s048")}
                </span>
                {t("home.s049")}<br />
                <span className="text-accent-100">{t("home.s050")}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300" data-speakable>
                {t("home.s051", { amount1: "$25,000" })}
              </p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-300">
                {t("home.s052")}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white ring-1 ring-white/15">
                  <Send className="h-4 w-4 text-accent-100" />
                  {t("home.s053")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white ring-1 ring-white/15">
                  <ShieldCheck className="h-4 w-4 text-accent-100" />
                  {t("home.s054")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white ring-1 ring-white/15">
                  {t("home.s055")}
                </span>
              </div>

              {/* Country reach — plain text, no broken flags */}
              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  {t("home.s056")}
                </p>
                <p className="mt-1.5 text-sm text-slate-400">{FOUNDER_COUNTRIES}</p>
              </div>

              {/* Live filings counter — real Filing table (FAXED/CONFIRMED). Below
                  the floor (50), show the review-promise line instead of "0". */}
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-soft-pulse" />
                {filingsCount >= 50 ? (
                  <span>
                    <span className="font-mono font-semibold tabular-nums text-white">
                      {formatFilingCount(filingsCount)}
                    </span>{" "}
                    {t("home.s057")}
                  </span>
                ) : (
                  <span>{t("home.s058")}</span>
                )}
              </div>
            </div>

            {/* Right: premium CTA card, light on the dark band */}
            <div className="w-full animate-fade-in-up animate-delay-200">
              <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-2xl shadow-black/30 ring-1 ring-black/5 sm:p-7">
                <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-soft-pulse" />
                  {t("home.s059")}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {TIER_ORDER.map((key) => {
                    const tierInfo = TIERS[key];
                    return (
                      <div
                        key={key}
                        className={[
                          "rounded-lg px-3 py-3",
                          tierInfo.highlight
                            ? "border-2 border-accent bg-accent-50/50"
                            : "border border-slate-200 bg-white",
                        ].join(" ")}
                      >
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                          {tierInfo.label}
                        </p>
                        <p className="mt-1 font-serif text-3xl font-semibold tracking-tight text-ink">
                          {formatPrice(tierInfo.priceCents)}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">{tierInfo.subtitle}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {t("home.s060")}{" "}
                  <Link href={localizedPath(locale, "/pricing")} className="text-accent underline underline-offset-2">
                    {t("home.s061")}
                  </Link>
                  .
                </p>

                <Link href={localizedPath(locale, "/start")} className="group mt-6 block">
                  <Button size="lg" className="h-14 w-full text-base shadow-lg shadow-accent/25 transition-all duration-200 hover:-translate-y-0.5">
                    {t("home.s062")}<ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href={localizedPath(locale, "#pricing")} className="mt-3 block">
                  <Button variant="outline" size="lg" className="w-full">
                    {t("home.s063")}
                  </Button>
                </Link>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {[
                    t("home.heroDeliverables.forms"),
                    t("home.heroDeliverables.reasonableCause"),
                    t("home.heroDeliverables.review"),
                    t("home.heroDeliverables.fax"),
                    t("home.heroDeliverables.moneyBack"),
                  ].map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t border-slate-100 pt-5 text-center font-mono text-[11px] text-slate-500">
                  {t("home.s064")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function TrustStrip() {
    const items = [
      { icon: Clock, label: t("home.s065"), sub: t("home.extra1") },
      { icon: FileText, label: t("home.s066"), sub: t("home.extra2") },
      { icon: Send, label: t("home.s067"), sub: t("home.extra3") },
      { icon: ShieldCheck, label: t("home.s068"), sub: t("home.extra4") },
    ];
    return (
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((it, i) => (
            <Reveal key={it.label} delay={i * 100} className="flex items-center gap-3 group">
              <div className="flex-none w-10 h-10 rounded-md bg-accent-50 text-accent flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{it.label}</p>
                <p className="text-xs text-slate-500">{it.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  function Eligibility() {
    return (
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <SectionHead
            eyebrow={t("home.s069")}
            title={t("home.s070")}
            subtitle={t("home.s071")}
          />
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <Reveal delay={0}>
                <Criterion
                  icon={Building2}
                  title={t("home.s072")}
                  body={t("home.s073")}
                />
            </Reveal>
            <Reveal delay={120}>
                <Criterion
                  icon={Globe}
                  title={t("home.s074")}
                  body={t("home.s075")}
                />
            </Reveal>
            <Reveal delay={240}>
                <Criterion
                  icon={Receipt}
                  title={t("home.s076")}
                  body={t("home.s077")}
                />
            </Reveal>
          </div>
          <Reveal delay={300} className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 flex gap-3">
            <AlertTriangle className="flex-none h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium">{t("home.s078", { amount1: "$25,000" })}</p>
              <p className="mt-1 text-amber-800">
                {t("home.s079")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  // Deadline answer: a standalone capsule an answer engine can quote for
  // "when is Form 5472 due?" — the date rule, the extension and the fiscal-year
  // case in two sentences. Facts match /form-5472-deadline-calculator and the
  // services pages (Form 7004 extends; we offer it as a separate service).
  function Deadline() {
    return (
      <section id="deadline" className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <SectionHead
            eyebrow={t("home.s080")}
            title={t("home.s081")}
            subtitle={t("home.s082")}
            speakable
          />
          <p className="mt-6 text-center text-sm">
            <Link
              href={localizedPath(locale, "/form-5472-deadline-calculator")}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent-dark"
            >
              {t("home.s083")}
            </Link>
          </p>
        </div>
      </section>
    );
  }

  // Brand capsule: answer engines described us as an "automated document
  // generator" (Moz AI Visibility, 2026-10-19). Sits right after the six steps.
  function Automated() {
    return (
      <section id="automated" className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <SectionHead
            eyebrow={t("home.s084")}
            title={BRAND_CAPSULES.automated.question}
            subtitle={BRAND_CAPSULES.automated.answer}
            speakable
          />
          <p className="mt-6 text-center text-sm">
            <Link
              href={localizedPath(locale, "/about#who-reviews")}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent-dark"
            >
              {t("home.s085")}
            </Link>
          </p>
        </div>
      </section>
    );
  }

  function HowItWorks() {
    return (
      <section id="how-it-works" className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <SectionHead
            eyebrow={t("home.s086")}
            title={t("home.s087")}
            speakable
            subtitle={t("home.s088")}
          />
          <HowToSummary locale={locale} {...HOW_TO_META} className="mt-10" />
          <ol className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processSteps.map((s, i) => (
              <Reveal
                as="li"
                key={s.title}
                delay={i * 80}
                className="group rounded-lg border border-slate-200 p-6 hover:border-accent hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex-none w-8 h-8 rounded-md bg-accent text-white text-sm font-medium flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {i + 1}
                  </span>
                  <s.icon className="h-5 w-5 text-slate-400 transition-colors duration-300 group-hover:text-accent" />
                </div>
                <h3 id={s.id} className="font-medium text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  function Deliverables() {
    const docs = [
      {
        name: t("home.s089"),
        body: t("home.s090"),
      },
      {
        name: t("home.s091"),
        body: t("home.s092"),
        tag: t("home.diirspTag"),
      },
      {
        name: t("home.s093"),
        body: t("home.s094"),
      },
      {
        name: t("home.s095"),
        body: t("home.s096"),
      },
      {
        name: t("home.s097"),
        body: t("home.s098"),
      },
    ];
    return (
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <SectionHead
            eyebrow={t("home.s099")}
            title={t("home.s100")}
            subtitle={t("home.s101")}
          />
          <ul className="mt-10 space-y-3">
            {docs.map((d, i) => (
              <Reveal
                as="li"
                key={d.name}
                delay={i * 70}
                className="group flex gap-4 rounded-lg bg-white border border-slate-200 p-5 hover:border-accent hover:shadow-md hover:shadow-accent/5 hover:translate-x-1 transition-all duration-300"
              >
                <FileText className="flex-none h-5 w-5 text-accent mt-0.5 transition-transform duration-300 group-hover:scale-110" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900">{d.name}</p>
                    {d.tag && (
                      <span className="text-[11px] font-medium rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">
                        {d.tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{d.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  function Comparison() {
    return (
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <SectionHead
            eyebrow={t("home.s102")}
            title={t("home.s103")}
            subtitle={t("home.s104", { value1: formatPrice(TIERS.standard.priceCents), value2: STANDARD_TURNAROUND, value3: formatPrice(TIERS.express.priceCents), value4: EXPRESS_TURNAROUND })}
          />
          <ComparisonTable {...FILING_COMPARISON} className="mt-10" />
        </div>
      </section>
    );
  }

  function Pricing() {
    return (
      <section id="pricing" className="bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <SectionHead
            eyebrow={t("home.s105")}
            title={BRAND_CAPSULES.cost.question}
            subtitle={BRAND_CAPSULES.cost.answer}
            speakable
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto items-stretch">
            {TIER_ORDER.map((key, idx) => {
              const tierInfo = TIERS[key];
              const highlighted = !!tierInfo.highlight;
              return (
                <Reveal
                  key={key}
                  delay={idx * 120}
                  className={`relative flex flex-col rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10 ${
                    highlighted
                      ? "border-2 border-accent bg-white shadow-md"
                      : "border border-slate-200 bg-white hover:border-accent"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] rounded-full bg-accent text-white px-3 py-1 shadow">
                      {t("home.s106")}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-ink">{tierInfo.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tierInfo.subtitle}</p>
                  </div>
                  <p className="mt-3 font-serif text-4xl font-semibold text-ink">
                    {formatPrice(tierInfo.priceCents)}
                    <span className="ml-1.5 font-mono text-xs font-normal text-slate-500">{t("home.s107")}</span>
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-700 flex-1">
                    {tierInfo.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={localizedPath(locale, `/start?tier=${key}`)} className="block mt-6">
                    <Button variant={highlighted ? "primary" : "outline"} className="w-full transition-transform hover:-translate-y-0.5">
                      {tierInfo.ctaLabel}
                    </Button>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            <span className="font-semibold text-ink">+ {formatPrice(MULTI_YEAR_ADDON_CENTS)} {t("home.s108")}</span>
            <span className="mx-2 text-slate-400">·</span>
            {t("home.s109", { amount1: "$25,000" })}
          </p>
          <p className="mt-3 text-center text-xs text-slate-500">
            {t("home.s110")}
          </p>
        </div>
      </section>
    );
  }

  function ToolsAndGuides() {
    const tools = [
      {
        href: "/do-i-need-to-file-form-5472",
        title: t("home.s111"),
        description: t("home.s112"),
      },
      {
        href: "/form-5472-deadline-calculator",
        title: t("home.s113"),
        description: t("home.s114"),
      },
      {
        href: "/form-5472-penalty-calculator",
        title: t("home.s115"),
        description: t("home.s116"),
      },
      {
        href: "/irs-yearly-average-exchange-rates",
        title: t("home.s117"),
        description: t("home.s118"),
      },
      {
        href: "/form-5472-reportable-transactions-checker",
        title: t("home.s119"),
        description: t("home.s120"),
      },
      {
        href: "/form-5472-late-filing-checker",
        title: t("home.s121"),
        description: t("home.s122"),
      },
      {
        href: "/foreign-owned-llc-compliance-calendar",
        title: t("home.s123"),
        description: t("home.s124"),
      },
      {
        href: "/llc-annual-fees-by-state",
        title: t("home.s125"),
        description: t("home.s126"),
      },
    ];

    const guides = [
      { href: "/file-form-5472", text: t("home.s127") },
      { href: "/form-5472-penalty", text: t("home.s128", { amount1: "$25,000" }) },
      { href: "/diirsp", text: t("home.s129") },
      { href: "/pro-forma-1120", text: t("home.s130") },
      { href: "/blog/what-is-form-5472", text: t("home.s131") },
      { href: "/blog/form-5472-deadline-2026", text: t("home.s132") },
      { href: "/blog/does-foreign-owned-llc-pay-us-tax", text: t("home.s133") },
      { href: "/blog/form-5472-filed-late-never-filed", text: t("home.s134") },
    ];

    return (
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <SectionHead
            eyebrow={t("home.s135")}
            title={t("home.s136")}
            subtitle={t("home.s137")}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, i) => (
              <Reveal as="div" key={tool.href} delay={i * 100}>
                <Link
                  href={localizedPath(locale, tool.href)}
                  className="group block h-full rounded-xl border border-paper-edge bg-paper p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                >
                  <h3 className="flex items-center gap-1.5 font-medium text-ink">
                    {tool.title}
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent" />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-paper-edge bg-paper p-5 sm:p-6">
            <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {guides.map((guide, i) => (
                <Reveal as="li" key={guide.href} delay={i * 60}>
                  <Link
                    href={localizedPath(locale, guide.href)}
                    className="text-sm font-medium text-slate-700 underline-offset-2 transition-colors hover:text-accent hover:underline"
                  >
                    {guide.text}
                  </Link>
                </Reveal>
              ))}
            </ul>
            <Link href={localizedPath(locale, "/blog")} className="mt-5 inline-block text-sm text-accent underline underline-offset-2">
              {t("home.s138")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  function Faq() {
    return (
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <SectionHead
            eyebrow={t("home.s139")}
            title={t("home.s140")}
          />
          <dl className="mt-10 space-y-6">
            {FAQS.map((it, i) => (
              <Reveal key={it.q} delay={i * 80}>
                <dt className="font-medium text-slate-900">{it.q}</dt>
                <dd className="mt-2 text-sm text-slate-600 leading-relaxed">{it.a}</dd>
              </Reveal>
            ))}
          </dl>
          <Link href={localizedPath(locale, "/faq")} className="mt-8 inline-block text-sm text-accent underline underline-offset-2">
            {t("home.s141")}
          </Link>
        </div>
      </section>
    );
  }

  // Persona-targeted plug for accountancy firms and formation agents, placed
  // right before the closing CTA so the last thing visitors from that audience
  // see before the generic sign-off is a path into the partner program.
  function PartnerPromo() {
    return (
      <section className="bg-paper border-b border-paper-edge">
        <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {t("home.s142")}
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-ink text-balance">
            {t("home.s143")}
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            {t("home.s144")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={localizedPath(locale, "/partners")}>
              <Button size="lg">{t("home.s145")}</Button>
            </Link>
            <Link href={localizedPath(locale, "/partner/sign-in")}>
              <Button variant="outline" size="lg">
                {t("home.s146")}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {t("home.s147")}
          </p>
        </div>
      </section>
    );
  }

  function FinalCta() {
    return (
      <section className="relative overflow-hidden bg-ink">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(55% 60% at 50% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
          }}
        />
        <Reveal as="div" className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white text-balance">
            {t("home.s148", { amount1: "$25,000" })}
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-xl mx-auto">
            {t("home.s149")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href={localizedPath(locale, "/start")} className="group">
              <Button size="lg" className="bg-white !text-ink hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/20">
                {t("home.s062")}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>
    );
  }

  function SectionHead({
    eyebrow,
    title,
    subtitle,
    speakable = false,
  }: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    /** Mark the subtitle (the section's answer capsule) for Speakable. */
    speakable?: boolean;
  }) {
    return (
      <Reveal className="max-w-2xl mx-auto text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-ink text-balance">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-slate-600" data-speakable={speakable ? true : undefined}>
            {subtitle}
          </p>
        )}
      </Reveal>
    );
  }

  function Criterion({
    icon: Icon,
    title,
    body,
  }: {
    icon: typeof CheckCircle2;
    title: string;
    body: string;
  }) {
    return (
      <div className="group rounded-lg border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
        <div className="w-10 h-10 rounded-md bg-accent-50 text-accent flex items-center justify-center transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-medium text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{body}</p>
      </div>
    );
  }

  // Structured data for search engines and AI answer engines.
  // - Organization establishes brand identity for knowledge-panel surfaces.
  // - Service describes what we sell, who for, and price tiers.
  // - FAQPage powers Google's expandable FAQ rich result + AI direct-answer pulls.
  function StructuredData() {
    const url = env.appUrl;
    // Organization — the single full node (enriched for knowledge-panel +
    // E-E-A-T; knowsAbout tells AI engines we are a topical source on Form 5472
    // / DIIRSP). Everything else on this page references it by ORG_REF.
    const organization = organizationDocument();

    // WebSite. No SearchAction: the site has no search, and /blog?q= does
    // nothing, so declaring one would be dishonest structured data.
    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${url}/#website`,
      url,
      name: SITE_NAME,
      alternateName: ["Form5472Prep", "form5472prep.com"],
      publisher: ORG_REF,
      inLanguage: "en-US",
    };

    const service = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: t("home.s150"),
      provider: ORG_REF,
      areaServed: AREA_SERVED,
      audience: {
        "@type": "Audience",
        audienceType: t("home.s151"),
      },
      description:
        t("home.s152"),
      offers: TIER_ORDER.map((key) => {
        const tierInfo = TIERS[key];
        return {
          "@type": "Offer",
          name: t("home.s153", { value1: tierInfo.label, value2: tierInfo.subtitle }),
          sku: key,
          price: (tierInfo.priceCents / 100).toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${url}/start?tier=${key}`,
        };
      }),
    };

    // The cost and "automated?" capsules are visible as H2 sections, so they lead
    // the FAQPage alongside the <dl> entries.
    const { cost, automated } = BRAND_CAPSULES;
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ q: cost.question, a: cost.answer }, { q: automated.question, a: automated.answer }, ...FAQS].map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("home.s154"), item: url },
      ],
    };

    const howToSchema = howTo({
      name: t("home.s155"),
      description: HOME_DESCRIPTION,
      url,
      totalTime: HOW_TO_META.totalTime,
      steps: processSteps.map(({ id, title, body }) => ({ name: title, text: body, anchor: `#${id}` })),
      tools: HOW_TO_META.tools,
      supplies: HOW_TO_META.supplies,
      estimatedCost: HOW_TO_META.cost,
    });

    // WebPage + Speakable — flags the hero headline and the answer capsules
    // (hero summary, the cost and "automated?" capsules, "How does Form 5472
    // filing work?" and "When is Form 5472 due?") as the passages voice assistants should read aloud. Every selector
    // must match real elements: [data-speakable] is set only on those <p>s.
    const webPage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url,
      name: t("home.s156"),
      dateModified: CONTENT_LAST_REVIEWED,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "[data-speakable]"],
      },
    };

    return (
      <>
        <JsonLd data={organization} />
        <JsonLd data={website} />
        <JsonLd data={service} />
        <JsonLd data={faq} />
        <JsonLd data={breadcrumb} />
        <JsonLd data={howToSchema} />
        <JsonLd data={webPage} />
      </>
    );
  }

  return { Page: LandingPage, metadata: localizedMetadata(locale, "/", metadata) };
}
export function HomePage({ locale = "en", t = getMarketingTranslator(locale) }: { locale?: "en" | MarketingLocale; t?: MarketingTranslator } = {}) { return createHome(locale, t).Page(); }
export function homeMetadata(locale: "en" | MarketingLocale) { return createHome(locale, getMarketingTranslator(locale)).metadata; }
