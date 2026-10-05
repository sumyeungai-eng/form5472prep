import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { getLandingPage } from "@/lib/landing-pages";
import {
  EIN_ITIN_LINKS,
  FORMATION_PROVIDER_SLUGS,
  SERVICES_HUB,
  SERVICES_HUB_PATH,
  SERVICE_PAGES,
  serviceHubCategories,
  servicePath,
  servicesHubLastModified,
  type HubCategory,
} from "@/lib/services-pages";
import { ORG_REF, SITE_NAME, SITE_URL, SPEAKABLE, breadcrumbList, organizationDocument, pageMeta } from "@/lib/seo";

// /services hub: H1 + intro, H2 categories with styled panels linking each
// child (anchor = the child's H1), CTA at the bottom. Linked from the
// marketing footer so every child is two clicks from the homepage.

export const metadata: Metadata = {
  title: { absolute: SERVICES_HUB.title },
  description: SERVICES_HUB.metaDescription,
  ...pageMeta({
    title: SERVICES_HUB.title,
    description: SERVICES_HUB.longDescription,
    path: SERVICES_HUB_PATH,
  }),
  robots: { index: true, follow: true },
};

const catId = (heading: string) => `cat-${heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

function hubCategories(): HubCategory[] {
  const formationLinks = FORMATION_PROVIDER_SLUGS.map((slug) => {
    const lp = getLandingPage(slug);
    if (!lp) throw new Error(`services hub: missing landing page ${slug}`);
    return { href: `/${lp.slug}`, label: lp.h1, blurb: lp.metaDescription };
  });
  return [
    ...serviceHubCategories(),
    {
      heading: "Which pages cover Form 5472 for clients of formation services?",
      description:
        "A formation or registered-agent plan may or may not include the yearly Form 5472, so each page shows where the filing fits next to what that provider sells and how the package reaches the IRS.",
      links: formationLinks,
    },
    {
      heading: "Do I need an EIN or ITIN before filing?",
      description:
        "A foreign-owned LLC needs an EIN to file Form 5472, and its owner needs an ITIN only when there is a qualifying federal tax reason. We help with both.",
      links: EIN_ITIN_LINKS,
    },
  ];
}

// "October 6, 2026" from the same ISO date that feeds the JSON-LD dateModified.
function formatReviewed(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ServicesHubPage() {
  const categories = hubCategories();
  const modified = servicesHubLastModified();
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: SERVICES_HUB.h1,
    description: SERVICES_HUB.longDescription,
    url: `${SITE_URL}${SERVICES_HUB_PATH}`,
    dateModified: modified,
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    publisher: ORG_REF,
    provider: ORG_REF,
    speakable: SPEAKABLE,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: SERVICE_PAGES.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.h1,
        url: `${SITE_URL}${servicePath(p.slug)}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={organizationDocument()} />
      <JsonLd data={collection} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Services", path: SERVICES_HUB_PATH },
        ])}
      />

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
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li className="text-slate-300" aria-current="page">Services</li>
            </ol>
          </nav>
          <h1 className="mt-8 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {SERVICES_HUB.h1}
          </h1>
          <p className="lead mt-6 max-w-3xl text-lg leading-relaxed text-slate-300" data-speakable>
            {SERVICES_HUB.intro}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Last reviewed <time dateTime={modified}>{formatReviewed(modified)}</time>
          </p>
        </div>
      </section>

      <div className="bg-white">
        <div className="mx-auto max-w-4xl space-y-14 px-4 py-14 sm:px-6 sm:py-16">
          {categories.map((cat) => (
            <section key={cat.heading} aria-labelledby={catId(cat.heading)}>
              <h2
                id={catId(cat.heading)}
                className="font-serif text-2xl font-semibold tracking-tight text-ink"
              >
                {cat.heading}
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">{cat.description}</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {cat.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                    >
                      <span className="font-medium text-slate-900 group-hover:text-accent">{l.label}</span>
                      <span className="mt-1.5 line-clamp-3 text-sm text-slate-600">{l.blurb}</span>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        Read more
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <section className="border-y border-paper-edge bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Start your Form 5472 filing</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            About 15 minutes of questions. Every filing is reviewed by a qualified accountant before it is
            submitted, then faxed to the IRS with a timestamped receipt.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/start?src=services-hub" className="group">
              <Button size="lg" className="shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5">
                Start your filing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
