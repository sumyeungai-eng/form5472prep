import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock, FileText, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { LANDING_PAGES, getLandingPage, getRelatedSlugs } from "@/lib/landing-pages";
import { TIERS, TIER_ORDER, MULTI_YEAR_ADDON_CENTS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { env } from "@/lib/env";

// Lock the route to only the known slugs — anything else 404s.
export const dynamicParams = false;

// A/B test the hero layout to see which converts better.
//   - "rail":   2-column hero with a big right-rail CTA card (no price).
//   - "below":  current single-column hero with the CTA below the intro.
// Assignment is deterministic per slug so each page always shows the same
// variant (avoids confusing repeat visitors and lets us compare cleanly).
// CTAs append ?ref=rail / ?ref=below to /start so Vercel Web Analytics' Top
// Pages report shows which variant drove more starts.
//
// Split logic: alphabetically sort all slugs, then assign odd-indexed to
// "rail" and even-indexed to "below". With 19 slugs this gives a 10/9 split.
function heroVariantFor(slug: string): "rail" | "below" {
  const allSlugs = LANDING_PAGES.map((p) => p.slug).sort();
  const idx = allSlugs.indexOf(slug);
  return idx % 2 === 0 ? "below" : "rail";
}

export async function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ seoSlug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { seoSlug: string };
}): Promise<Metadata> {
  const page = getLandingPage(params.seoSlug);
  if (!page) return {};
  return {
    title: { absolute: page.title },
    description: page.metaDescription,
    alternates: { canonical: `/${page.slug}` },
    // Paid-ad landing pages opt out of organic search so Google only sends
    // ad-clicks here. Also keeps the page out of the sitemap (see sitemap.ts).
    robots: page.noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : undefined,
    openGraph: {
      type: "article",
      title: page.title,
      description: page.metaDescription,
      url: `${env.appUrl}/${page.slug}`,
    },
  };
}

export default function SeoLandingPage({ params }: { params: { seoSlug: string } }) {
  const page = getLandingPage(params.seoSlug);
  if (!page) notFound();

  // Topic-cluster-derived related pages — see TOPIC_CLUSTERS in
  // landing-pages.ts. Honours page.relatedSlugs[] overrides, falls back to
  // cluster mates, excludes noindex pages and the page itself. The helper
  // always returns up to N indexable slugs so the "Related guides" block
  // is never empty (it was, because no page had relatedSlugs set).
  const related = getRelatedSlugs(page.slug, 4)
    .map((s) => getLandingPage(s))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Premium (paid-ad) pages always use the rail variant — same-day promise
  // and direct accountant access deserve the most-prominent CTA layout.
  // Organic SEO pages stay in the A/B split.
  const variant = page.pricingMode === "premium" ? "rail" : heroVariantFor(page.slug);
  // ?v= drives the layout-variant A/B comparison in Vercel Analytics (Top
  // Pages report). ?src= is the source landing-page slug — captured on
  // /start and persisted as Filing.funnelSource for per-page sales attribution.
  // Premium pages also drive the pricing mode (PREMIUM_SOURCES in pricing.ts
  // reads funnelSource to route the filing to PREMIUM_TIERS in checkout).
  const startUrl = `/start?v=${variant}&src=${page.slug}`;

  return (
    <>
      <ArticleStructuredData page={page} />

      <article className="bg-white">
        {/* Hero — variant assignment is deterministic per slug. */}
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
          {variant === "rail" ? (
            <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-14 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 lg:gap-16 items-start animate-fade-in-up">
              <div>
                <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  For foreign-owned US single-member LLCs
                </p>
                <h1 className="mt-5 font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08] tracking-tight text-balance">
                  {page.h1}
                </h1>
                {/* className="lead" matches the SpeakableSpecification cssSelector
                  in the Article schema below — voice assistants read this aloud
                  for the page. The first ~60 words also feed Google AI Overviews
                  and ChatGPT direct answers, so page.intro is written as a
                  definitional / direct-answer paragraph. */}
              <p className="lead mt-6 text-lg leading-relaxed text-slate-300">{page.intro}</p>
              </div>
              <HeroRailCta startUrl={startUrl} />
            </div>
          ) : (
            <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-14 animate-fade-in-up">
              <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Form 5472 + 1120 filing service
              </p>
              <h1 className="mt-5 font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08] tracking-tight text-balance">
                {page.h1}
              </h1>
              {/* className="lead" matches the SpeakableSpecification cssSelector
                  in the Article schema below — voice assistants read this aloud
                  for the page. The first ~60 words also feed Google AI Overviews
                  and ChatGPT direct answers, so page.intro is written as a
                  definitional / direct-answer paragraph. */}
              <p className="lead mt-6 text-lg leading-relaxed text-slate-300">{page.intro}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href={startUrl} className="group">
                  <Button size="lg" className="shadow-lg shadow-accent/25 transition-all duration-200 hover:-translate-y-0.5">
                    Start filing
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Trust strip — 4 quick value props right under the hero so visitors
            see the headline benefits before scrolling into long-form content. */}
        <TrustStrip />

        {/* Body sections */}
        <section className="border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
            {/* In-page Table of Contents — only on pages with 4+ sections
                (anything shorter doesn't benefit from a TOC and clutters the
                fold). Links use #step-N anchors that match the HowTo JSON-LD
                step URLs, so when Google's AI Overview cites a specific step
                of our guide it can deep-link straight to it. */}
            {page.sections.length >= 4 && (
              <Reveal>
                <nav
                  aria-label="In this guide"
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">
                    In this guide
                  </p>
                  <ol className="mt-3 space-y-1.5 text-sm">
                    {page.sections.map((s, i) => (
                      <li key={s.heading} className="flex gap-2">
                        <span className="text-slate-400 tabular-nums w-5 shrink-0 text-right">
                          {i + 1}.
                        </span>
                        <a
                          href={`#step-${i + 1}`}
                          className="text-slate-700 hover:text-accent hover:underline"
                        >
                          {s.heading}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </Reveal>
            )}
            {page.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 60}>
                {/* id="step-N" matches the HowTo JSON-LD step URLs so AI
                    crawlers can deep-link to each step on the page. The
                    visible "#" anchor link gives readers a copy-link affordance
                    (fades in on hover; always visible on touch devices via
                    sm:opacity-0 vs default opacity-100). */}
                <h2
                  id={`step-${i + 1}`}
                  className="group flex items-center gap-2 font-serif text-2xl font-semibold text-ink tracking-tight scroll-mt-20"
                >
                  <span>{s.heading}</span>
                  <a
                    href={`#step-${i + 1}`}
                    aria-label={`Link to ${s.heading}`}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-accent text-xl font-light"
                  >
                    #
                  </a>
                </h2>
                <div className="mt-3 space-y-3 text-slate-700 leading-relaxed whitespace-pre-line">
                  {s.body}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="border-y border-paper-edge bg-paper">
          <Reveal as="div" className="relative max-w-3xl mx-auto px-6 py-14 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">
              Skip the work — file in 15 minutes.
            </h2>
            <p className="mt-3 text-slate-600 max-w-xl mx-auto">
              We generate every form, you sign one PDF, we fax it to the IRS Ogden PIN Unit.
              Starting at {formatPrice(TIERS.standard.priceCents)}. IRS fax delivery included on every plan.
            </p>
            <ul className="mt-6 inline-block text-left space-y-2 text-sm">
              {[
                "Filled IRS Form 5472 + pro forma 1120",
                "Reasonable cause statement (if late)",
                "Faxed to IRS Ogden PIN Unit",
                "100% money-back guarantee",
              ].map((it, i) => (
                <li
                  key={it}
                  className="flex items-start gap-2 text-slate-700 animate-fade-in-up"
                  style={{ animationDelay: `${200 + i * 70}ms` }}
                >
                  <CheckCircle2 className="flex-none h-4 w-4 text-emerald-500 mt-0.5" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <Link href={startUrl} className="group">
                <Button size="lg" className="shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30">
                  Start filing
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </section>

        {/* Pricing — appears on every landing page so visitors see the
            package options before deciding. The price shown here is exactly
            what they'll be charged at Stripe checkout. */}
        <PricingSection startUrl={startUrl} pricingMode={page.pricingMode} />

        {/* FAQs */}
        {page.faqs.length > 0 && (
          <section className="border-b border-slate-200">
            <div className="max-w-3xl mx-auto px-6 py-16">
              <Reveal>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
                  Frequently asked questions
                </h2>
              </Reveal>
              <dl className="mt-8 space-y-6">
                {page.faqs.map((f, i) => (
                  <Reveal key={f.q} delay={i * 80}>
                    <dt className="font-medium text-slate-900">{f.q}</dt>
                    <dd className="mt-2 text-sm text-slate-600 leading-relaxed">{f.a}</dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="bg-slate-50 border-b border-slate-200">
            <div className="max-w-3xl mx-auto px-6 py-16">
              <Reveal>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-ink tracking-tight">
                  Related guides
                </h2>
              </Reveal>
              <ul className="mt-6 grid sm:grid-cols-2 gap-4">
                {related.map((r, i) => (
                  <Reveal as="li" key={r.slug} delay={i * 100}>
                    <Link
                      href={`/${r.slug}`}
                      className="group block rounded-lg border border-slate-200 bg-white p-5 hover:border-accent hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300"
                    >
                      <p className="font-medium text-slate-900 group-hover:text-accent transition-colors">{r.h1}</p>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{r.intro}</p>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        )}
      </article>
    </>
  );
}

// Trust strip — 4 quick value props rendered as a horizontal row right
// under the hero. Reinforces the headline promises before the visitor
// starts scrolling through long-form content. Wraps on small screens.
function TrustStrip() {
  const items = [
    {
      icon: Clock,
      title: "15 min",
      sub: "average completion",
    },
    {
      icon: FileText,
      title: "IRS forms",
      sub: "filled, not redrawn",
    },
    {
      icon: Send,
      title: "Faxed for you",
      sub: "to Ogden PIN Unit",
    },
    {
      icon: ShieldCheck,
      title: "Receipt stored",
      sub: "proof of filing",
    },
  ];
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((it) => (
            <li key={it.title} className="flex items-center gap-3">
              <div className="flex-none h-10 w-10 rounded-lg bg-accent-50 text-accent flex items-center justify-center">
                <it.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
                  {it.title}
                </p>
                <p className="text-xs text-slate-500 leading-tight truncate">
                  {it.sub}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Hero right-rail CTA card. No price shown — the bottom pricing section
// handles the full breakdown. Per the A/B test design, this variant tries
// to convert on intent + social proof bullets rather than on price visibility.
function HeroRailCta({ startUrl }: { startUrl: string }) {
  const bullets = [
    "Filled IRS Form 5472 + pro forma 1120",
    "Reasonable cause statement (if late)",
    "Reviewed by a qualified tax accountant",
    "Faxed to IRS Ogden PIN Unit",
    "100% money-back if we fail to submit",
  ];
  return (
    <div className="lg:sticky lg:top-8 rounded-2xl bg-white text-slate-900 ring-1 ring-black/5 shadow-2xl shadow-black/30 p-6 animate-fade-in-up animate-delay-200">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          Start filing now
        </span>
      </div>
      <p className="mt-4 font-serif text-2xl font-semibold text-ink leading-tight">
        File in 15 minutes.
      </p>
      <p className="mt-2 text-sm text-slate-600">
        We generate, you sign, we fax to the IRS.
      </p>
      <Link href={startUrl} className="mt-5 block group">
        {/* Bigger CTA than the default `lg` size — wider, taller, larger
            type. This is the rail variant's primary conversion lever, and
            we deliberately let it visually dominate the card. */}
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40"
        >
          Start filing now
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
      </Link>
      <a
        href="#pricing"
        className="mt-2 block text-center text-sm font-medium text-slate-700 border border-slate-300 rounded-lg py-2.5 hover:bg-slate-50 transition-colors"
      >
        See pricing
      </a>
      <ul className="mt-5 space-y-2.5 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 className="flex-none h-4 w-4 text-emerald-500 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
        No subscription. Pay once per filing.
      </p>
    </div>
  );
}

// Three-tier pricing block, rendered near the bottom of every landing page.
// Matches the homepage pricing structure so visitors who arrived from search
// see the same options regardless of which guide they landed on.
function PricingSection({
  startUrl,
}: {
  startUrl: string;
  pricingMode?: "premium";
}) {
  // Always use the canonical tier set (Standard / Rush) on every landing page.
  // The /pro-form-5472 page used to override with a premium tier — that funnel
  // has been retired in favour of one shared price across organic + paid.
  const tiers = TIER_ORDER.map((key) => [key, TIERS[key]] as const);
  // Preserve any ?src= attribution baked into startUrl by appending tier as
  // a second query param (the /start route accepts both).
  const tierUrl = (slug: string) => {
    const sep = startUrl.includes("?") ? "&" : "?";
    return `${startUrl}${sep}tier=${slug}`;
  };
  return (
    <section id="pricing" className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Reveal as="div" className="text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">Pricing</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink">
            Flat-rate Form 5472 filing.
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            One-time fee per filing. No subscription. IRS fax delivery to the
            Ogden PIN Unit is included on every plan.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border-2 border-emerald-200 px-4 py-1.5 text-xs font-medium text-emerald-800">
              Fax filing included on every plan
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 border-2 border-accent/30 px-4 py-1.5 text-xs font-medium text-accent">
              Reviewed by a qualified tax accountant
            </div>
          </div>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
          {tiers.map(([key, t], idx) => {
            const highlighted = !!t.highlight;
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
                    Most popular
                  </span>
                )}
                <div>
                  <p className="font-semibold text-ink">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
                </div>
                <p className="mt-3 font-serif text-4xl font-semibold text-ink">
                  {formatPrice(t.priceCents)}
                  <span className="ml-1.5 font-mono text-xs font-normal text-slate-500">/ filing</span>
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-700 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tierUrl(key)} className="block mt-6">
                  <Button
                    variant={highlighted ? "primary" : "outline"}
                    className="w-full transition-transform hover:-translate-y-0.5"
                  >
                    {t.ctaLabel}
                  </Button>
                </Link>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            + {formatPrice(MULTI_YEAR_ADDON_CENTS)} per additional year
          </span>
          <span className="mx-2 text-slate-400">·</span>
          Saves you from the $25,000-per-form IRS penalty
        </p>
      </div>
    </section>
  );
}

function ArticleStructuredData({ page }: { page: NonNullable<ReturnType<typeof getLandingPage>> }) {
  const url = `${env.appUrl}/${page.slug}`;
  // datePublished anchors article freshness for Google. dateModified bumps
  // whenever we redeploy — good for AI engines that prefer recent sources.
  const buildDate = new Date().toISOString();
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.metaDescription,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: "2026-01-15",
    dateModified: buildDate,
    inLanguage: "en-US",
    author: {
      "@type": "Organization",
      name: "Form5472 Prep",
      url: env.appUrl,
      // knowsAbout signals topical expertise (E-E-A-T) — helps AI engines
      // (Perplexity, ChatGPT) decide whether to cite us as a source.
      knowsAbout: [
        "IRS Form 5472",
        "IRS Form 1120",
        "Foreign-owned US LLC tax filing",
        "DIIRSP — Delinquent International Information Return Submission Procedure",
        "IRC § 6038A",
        "Treasury Regulation § 1.6038A-1",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "Form5472 Prep",
      url: env.appUrl,
      logo: { "@type": "ImageObject", url: `${env.appUrl}/logo-mark.svg` },
    },
    // Speakable picks the H1 + intro paragraph for voice-assistant readback
    // (Google Assistant, Alexa). Cheap to declare; only takes effect on
    // pages an assistant actually serves.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "p.lead"],
    },
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.appUrl },
      { "@type": "ListItem", position: 2, name: page.h1, item: url },
    ],
  };
  // HowTo schema is what unlocks Google AI Overview citation + AI assistant
  // step-by-step extraction. We derive it from page.sections: each section's
  // heading becomes a HowToStep, body becomes the step text. Only emit when
  // we have at least 3 sections so the schema actually represents a process.
  const howTo = page.sections.length >= 3
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: page.h1,
        description: page.metaDescription,
        totalTime: "PT15M",
        estimatedCost: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: "199",
        },
        supply: [
          { "@type": "HowToSupply", name: "LLC formation documents (EIN, state of formation, date of incorporation)" },
          { "@type": "HowToSupply", name: "Owner identity (legal name, address, country of citizenship + tax residence, FTIN or Reference ID)" },
          { "@type": "HowToSupply", name: "Year-end total assets and a list of reportable transactions with the foreign owner" },
        ],
        tool: [
          { "@type": "HowToTool", name: "Form5472 Prep online filer" },
          { "@type": "HowToTool", name: "IRS fax delivery to Ogden PIN Unit (+1-855-887-7737) — included on every plan" },
        ],
        step: page.sections.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.heading,
          text: s.body.replace(/\n+/g, " ").trim().slice(0, 600),
          url: `${url}#step-${i + 1}`,
        })),
      }
    : null;
  return (
    <>
      <JsonLd data={article} />
      {page.faqs.length > 0 && <JsonLd data={faq} />}
      <JsonLd data={breadcrumb} />
      {howTo && <JsonLd data={howTo} />}
    </>
  );
}
