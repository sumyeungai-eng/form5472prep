import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Globe2 } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts } from "@/lib/blog";
import { COUNTRY_HUB_PATH, countryHubSections } from "@/lib/blog-countries";
import { SITE_URL, breadcrumbList, pageMeta } from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";

// Indexable hub of every country/city residency guide (plan 2026-10-30 P1-2).
// Same ISR cadence as /blog: posts published from /admin live in the database.
export const revalidate = 60;

const TITLE = "Form 5472 by Country";
const DESCRIPTION =
  "One Form 5472 guide per country of residence for foreign owners of a US single-member LLC, grouped by region, with city guides for digital nomads.";
const IRS_INSTRUCTIONS_URL = "https://www.irs.gov/instructions/i5472";
const NOMAD_GUIDE_SLUG = "form-5472-digital-nomad-us-llc";

export const metadata: Metadata = {
  title: seoTitle(TITLE),
  description: DESCRIPTION,
  ...pageMeta({ title: `${TITLE} · Form5472 Prep`, description: DESCRIPTION, path: COUNTRY_HUB_PATH }),
};

export default async function CountryHubPage(): Promise<JSX.Element> {
  const posts = await getAllPosts();
  const sections = countryHubSections(posts);
  const entries = sections.flatMap((section) => section.entries);
  const nomadGuide = posts.find((post) => post.slug === NOMAD_GUIDE_SLUG);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    url: `${SITE_URL}${COUNTRY_HUB_PATH}`,
    description: DESCRIPTION,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: entries.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/blog/${entry.post.slug}`,
        name: entry.post.title,
      })),
    },
  };

  return (
    <div className="bg-[#f8f9fb]">
      <JsonLd data={collectionJsonLd} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog" },
          { name: TITLE, path: COUNTRY_HUB_PATH },
        ])}
      />
      <section className="relative overflow-hidden border-b border-slate-200 bg-paper">
        <div aria-hidden className="absolute -right-24 -top-40 h-[520px] w-[520px] rounded-full bg-accent-100/70 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 lg:py-20">
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-accent transition hover:text-ink">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All guides
          </Link>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
            <Globe2 className="h-3.5 w-3.5 text-accent" />
            {entries.length} country guides
          </div>
          <h1 className="mt-7 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Form 5472 by country
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Form5472 Prep keeps one guide per country of residence for foreign owners of a US single-member LLC. Each
            covers the same US filing plus the home-country details that change how you prepare it, such as which local
            tax ID goes in the FTIN box.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 pb-24 pt-12">
        <section aria-labelledby="who-files-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 id="who-files-heading" className="font-serif text-2xl font-semibold tracking-tight text-ink">
            Do non-US residents in every country file Form 5472?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-700">
            Their US LLC files it, wherever they live. The IRS instructions treat a domestic disregarded entity wholly
            owned by a foreign person as a corporation for Form 5472, and that LLC files Form 5472 attached to a pro
            forma Form 1120 when it has reportable transactions with a related party, such as its owner.
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Source:{" "}
            <a href={IRS_INSTRUCTIONS_URL} className="font-medium text-accent hover:underline" rel="noopener">
              IRS Instructions for Form 5472
            </a>{" "}
            (definitions of reporting corporation and foreign-owned U.S. DE; When and Where To File).
          </p>
        </section>

        {sections.map((section) => {
          const headingId = `region-${section.region.toLowerCase().replace(/\s+/g, "-")}`;
          return (
            <section key={section.region} className="mt-14" aria-labelledby={headingId}>
              <h2 id={headingId} className="font-serif text-2xl font-semibold tracking-tight text-ink">
                {section.region}
              </h2>
              <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
                {section.entries.map((entry) => (
                  <li key={entry.post.slug} className="py-4">
                    <p className="text-sm leading-6 text-slate-600">
                      <span className="font-semibold text-ink">{entry.country}:</span>{" "}
                      <Link href={`/blog/${entry.post.slug}`} className="font-medium text-accent hover:underline">
                        {entry.post.title}
                      </Link>
                      . {entry.post.description}
                    </p>
                    {entry.cities.map((city) => (
                      <p key={city.post.slug} className="mt-1.5 text-xs leading-5 text-slate-500">
                        {city.city} city guide:{" "}
                        <Link href={`/blog/${city.post.slug}`} className="font-medium text-accent hover:underline">
                          {city.post.title}
                        </Link>
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {nomadGuide && (
          <p className="mt-14 text-sm leading-6 text-slate-600">
            No fixed country of residence? Read{" "}
            <Link href={`/blog/${nomadGuide.slug}`} className="font-medium text-accent hover:underline">
              {nomadGuide.title}
            </Link>
            .
          </p>
        )}

        <div className="mt-10">
          <Link
            href="/start"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-ink px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent"
          >
            Start your filing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
