import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock, FileText, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { LANDING_PAGES, getLandingPage } from "@/lib/landing-pages";
import { TIERS, TIER_ORDER, MULTI_YEAR_ADDON_CENTS } from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
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

  const related = (page.relatedSlugs ?? [])
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
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-accent-50 via-white to-accent-50 animate-gradient">
          {/* Decorative floating blobs — subtle ambient motion. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-float"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl animate-float"
            style={{ animationDelay: "1.5s" }}
          />
          {variant === "rail" ? (
            <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 animate-fade-in-up">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  For foreign-owned US single-member LLCs
                </span>
                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 text-balance animate-fade-in-up animate-delay-100">
                  {page.h1}
                </h1>
                <p className="mt-5 text-lg text-slate-600 animate-fade-in-up animate-delay-200">{page.intro}</p>
              </div>
              <HeroRailCta startUrl={startUrl} />
            </div>
          ) : (
            <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 animate-fade-in-up">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Form 5472 + 1120 filing service
              </span>
              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 text-balance animate-fade-in-up animate-delay-100">
                {page.h1}
              </h1>
              <p className="mt-5 text-lg text-slate-600 animate-fade-in-up animate-delay-200">{page.intro}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3 animate-fade-in-up animate-delay-300">
                <Link href={startUrl} className="group">
                  <Button size="lg" className="shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30">
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
            {page.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 60}>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  {s.heading}
                </h2>
                <div className="mt-3 space-y-3 text-slate-700 leading-relaxed whitespace-pre-line">
                  {s.body}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="relative overflow-hidden bg-accent-50 border-b border-slate-200">
          {/* Decorative motion behind the CTA. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl animate-float"
          />
          <Reveal as="div" className="relative max-w-3xl mx-auto px-6 py-12 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Skip the work — file in 15 minutes.
            </h2>
            <p className="mt-3 text-slate-600 max-w-xl mx-auto">
              We generate every form, you sign one PDF, we fax it to the IRS Ogden PIN Unit.
              Starting at {formatUsd(TIERS.standard.priceCents)}. IRS fax delivery included on every plan.
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

        {/* Three-tier pricing — appears on every landing page so visitors
            always see all the package options before deciding. Premium
            pages display PREMIUM_TIERS; the price the customer sees here
            is what they'll be charged at Stripe checkout. */}
        <PricingSection startUrl={startUrl} pricingMode={page.pricingMode} />

        {/* FAQs */}
        {page.faqs.length > 0 && (
          <section className="border-b border-slate-200">
            <div className="max-w-3xl mx-auto px-6 py-16">
              <Reveal>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
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
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
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
    <div className="lg:sticky lg:top-8 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-accent/5 p-6 animate-fade-in-up animate-delay-200">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Start filing now
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-900 leading-tight">
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
        className="mt-2 block text-center text-sm font-medium text-slate-700 border border-slate-300 rounded-md py-2.5 hover:bg-slate-50 transition-colors"
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
  // Always use the canonical three-tier set on every landing page. The
  // /pro-form-5472 page used to override with PREMIUM_TIERS — that funnel
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
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Flat-rate Form 5472 filing.
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            One-time fee per filing. No subscription. IRS fax delivery to the
            Ogden PIN Unit is included on every plan.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 border-2 border-emerald-200 px-4 py-1.5 text-xs font-medium text-emerald-800">
            Fax filing included on every plan
          </div>
        </Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-6 items-stretch">
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
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold rounded-full bg-accent text-white px-3 py-0.5 shadow">
                    Most popular
                  </span>
                )}
                <div>
                  <p className="font-semibold text-slate-900">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {formatUsd(t.priceCents)}
                  <span className="ml-1 text-sm font-normal text-slate-500">/ year</span>
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
            + {formatUsd(MULTI_YEAR_ADDON_CENTS)} per additional year
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
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.metaDescription,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Form5472 Prep", url: env.appUrl },
    publisher: {
      "@type": "Organization",
      name: "Form5472 Prep",
      url: env.appUrl,
      logo: { "@type": "ImageObject", url: `${env.appUrl}/logo-mark.svg` },
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
  return (
    <>
      <JsonLd data={article} />
      {page.faqs.length > 0 && <JsonLd data={faq} />}
      <JsonLd data={breadcrumb} />
    </>
  );
}
