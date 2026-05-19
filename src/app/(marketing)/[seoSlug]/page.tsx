import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { LANDING_PAGES, getLandingPage } from "@/lib/landing-pages";
import { TIERS, FAX_FEE_CENTS } from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
import { env } from "@/lib/env";

// Lock the route to only the known slugs — anything else 404s.
export const dynamicParams = false;

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

  const total = TIERS.single_year.priceCents + FAX_FEE_CENTS;

  return (
    <>
      <ArticleStructuredData page={page} />

      <article className="bg-white">
        {/* Hero */}
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
              <Link href="/start" className="group">
                <Button size="lg" className="shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30">
                  Start filing — {formatUsd(total)}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-xs text-slate-500">
                100% money-back if we fail to submit · 15-minute filing
              </p>
            </div>
          </div>
        </section>

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
              Flat {formatUsd(TIERS.single_year.priceCents)} + {formatUsd(FAX_FEE_CENTS)} fax
              delivery.
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
              <Link href="/start" className="group">
                <Button size="lg" className="shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30">
                  Start filing — {formatUsd(total)}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </section>

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
