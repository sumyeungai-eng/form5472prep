import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import {
  SERVICES_HUB,
  SERVICES_HUB_PATH,
  serviceLastReviewed,
  SERVICE_PAGES,
  getServicePage,
  serviceHowTo,
  servicePath,
  toPlainText,
  type ServicePage,
} from "@/lib/services-pages";
import { TIERS, TIER_ORDER } from "@/lib/pricing";
import { slugify } from "@/lib/blog";
import { formatPrice } from "@/lib/utils";
import { ORG_REF, SITE_URL, breadcrumbList, howTo, organizationDocument, pageMeta } from "@/lib/seo";
import { ServiceRichText } from "../ServiceRichText";

// Bottom-of-funnel service pages under the /services hub. Copy, keywords and
// the on-page contract live in src/lib/services-pages.ts (tested in
// services-pages.test.ts). Fully static: only the known slugs are built.
export const dynamicParams = false;

// "October 1, 2026" from the ISO date constant that also feeds the JSON-LD
// dateModified, so the visible date and the structured date cannot drift.
function formatReviewed(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function generateStaticParams() {
  return SERVICE_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getServicePage(params.slug);
  if (!page) return {};
  return {
    // Absolute: the root template would otherwise append " · Form5472 Prep".
    title: { absolute: page.title },
    // Short, keyword-first description for the SERP; the long entity-dense
    // version goes to og:/twitter: (via pageMeta) and the JSON-LD.
    description: page.metaDescription,
    ...pageMeta({
      title: page.title,
      description: page.longDescription,
      path: servicePath(page.slug),
      type: "website",
    }),
    robots: { index: true, follow: true },
  };
}

export default function ServicePageRoute({ params }: { params: { slug: string } }) {
  const page = getServicePage(params.slug);
  if (!page) notFound();

  const secondaryCta =
    page.cta.href.startsWith("/partners")
      ? { href: "/partners", label: "How the partner program works" }
      : { href: "/pricing", label: "See pricing" };

  return (
    <>
      <ServiceStructuredData page={page} />
      <article className="bg-white">
        {/* Hero: H1, intro with the bold direct answer, CTA right after it. */}
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
          <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
            <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link href="/" className="hover:text-white">Home</Link>
                </li>
                <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
                <li>
                  <Link href={SERVICES_HUB_PATH} className="hover:text-white">Services</Link>
                </li>
                <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
                <li className="text-slate-300" aria-current="page">{page.h1}</li>
              </ol>
            </nav>
            <p className="mt-8 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
              <ShieldCheck className="h-3.5 w-3.5 flex-none" />
              Form 5472 filing services
            </p>
            <h1 className="mt-4 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-balance break-words sm:text-4xl lg:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-4 text-xs text-slate-400">
              Last reviewed{" "}
              <time dateTime={serviceLastReviewed(page)}>{formatReviewed(serviceLastReviewed(page))}</time>
            </p>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-300">
              <ServiceRichText body={page.intro} tone="dark" firstParagraphClassName="lead" />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={page.cta.href} className="group">
                <Button size="lg" className="shadow-lg shadow-accent/25 transition-all duration-200 hover:-translate-y-0.5">
                  {page.cta.label}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link
                href={secondaryCta.href}
                className="text-sm font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline"
              >
                {secondaryCta.label}
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Every filing is reviewed by a qualified accountant before it is submitted.
            </p>
            {/* The page's one image, after H1 -> intro -> CTA so on phones the
                order is text first. Fixed 16:9 box (width/height set) so it
                cannot shift layout; priority because it is above the fold on
                desktop. Only this image carries the keyword in its alt. */}
            <figure className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-paper shadow-xl shadow-black/20">
              <Image
                src={page.heroImage.src}
                alt={page.heroImage.alt}
                width={1280}
                height={720}
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="h-auto w-full"
              />
            </figure>
          </div>
        </section>

        {/* Body sections */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-3xl space-y-12 px-4 py-14 sm:px-6 sm:py-16">
            {page.sections.map((s) => {
              const id = slugify(s.heading);
              return (
                <div key={s.heading}>
                  <h2 id={id} className="scroll-mt-20 font-serif text-2xl font-semibold tracking-tight text-ink">
                    {s.heading}
                  </h2>
                  <div className="mt-4 space-y-4 leading-relaxed text-slate-700">
                    <ServiceRichText body={s.body} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Same CTA again at the bottom of the copy. */}
        <section className="border-b border-paper-edge bg-paper">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
            <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              {page.cta.href.startsWith("/partners") ? "Offer Form 5472 filing to your clients" : "Ready to file?"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              {page.cta.href.startsWith("/partners")
                ? "Apply for a partner account. Accounts are approved manually, usually within one business day."
                : `About 15 minutes of questions. From ${formatPrice(TIERS.standard.priceCents)} per filing, with accountant review and IRS fax delivery included.`}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href={page.cta.href} className="group">
                <Button size="lg" className="shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5">
                  {page.cta.label}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={secondaryCta.href} className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Frequently asked questions
            </h2>
            <dl className="mt-8 space-y-6">
              {page.faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-medium text-slate-900">{f.q}</dt>
                  <dd className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
                    <ServiceRichText body={f.a} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Official IRS sources: contextual outbound links to the primary
            authority for this page (followed, new tab, no nofollow). */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 id="official-irs-sources" className="scroll-mt-20 font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Official IRS sources for this page
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The IRS pages this page relies on. Check them for the current form year before you file.
            </p>
            <ul className="mt-5 space-y-4 text-sm">
              {page.irsSources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-accent underline-offset-2 hover:underline"
                  >
                    {source.label}
                  </a>
                  <p className="mt-1 leading-6 text-slate-600">{source.blurb}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Related services and free tools */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Related services and free tools
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {page.related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="group block h-full rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                  >
                    <p className="font-medium text-slate-900 group-hover:text-accent">{r.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{r.blurb}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm">
              <Link href={SERVICES_HUB_PATH} className="font-medium text-accent hover:underline">
                All {SERVICES_HUB.h1.toLowerCase()}
              </Link>
            </p>
          </div>
        </section>
      </article>
    </>
  );
}

function ServiceStructuredData({ page }: { page: ServicePage }) {
  const url = `${SITE_URL}${servicePath(page.slug)}`;
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: page.h1,
    serviceType: page.serviceType,
    description: page.longDescription,
    url,
    image: `${SITE_URL}${page.heroImage.src}`,
    dateModified: serviceLastReviewed(page),
    provider: ORG_REF,
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        page.category === "partners"
          ? "Company formation agents, registered agents and accounting firms"
          : "Foreign owners of US single-member LLCs",
    },
    ...(page.showOffer
      ? {
          offers: TIER_ORDER.map((t) => ({
            "@type": "Offer",
            name: TIERS[t].label,
            price: (TIERS[t].priceCents / 100).toFixed(2),
            priceCurrency: "USD",
            url: `${SITE_URL}/pricing`,
          })),
        }
      : {}),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: toPlainText(f.a) },
    })),
  };
  // HowTo mirrors the page's own numbered list (only three pages have one).
  // Step anchors resolve to the heading of the section that holds the list.
  const steps = serviceHowTo(page);
  const howToJsonLd = steps
    ? howTo({
        name: steps.heading,
        description: page.metaDescription,
        url,
        steps: steps.steps.map((st) => ({
          name: st.name,
          text: st.text,
          anchor: `#${slugify(steps.heading)}`,
        })),
      })
    : null;
  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Services", path: SERVICES_HUB_PATH },
    { name: page.h1, path: servicePath(page.slug) },
  ]);
  return (
    <>
      <JsonLd data={organizationDocument()} />
      <JsonLd data={service} />
      <JsonLd data={faq} />
      {howToJsonLd && <JsonLd data={howToJsonLd} />}
      <JsonLd data={breadcrumb} />
    </>
  );
}
