import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { getLandingPage } from "@/lib/landing-pages";
import { SERVICES_HUB_PATH } from "@/lib/services-pages";
import { SITE_NAME, SITE_URL, breadcrumbList, pageMeta } from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";

// /compare: alternatives hub. Lists the provider comparison landing pages
// (src/lib/landing-pages.ts) with a neutral one-line summary each. Summaries
// are derived from the first sentence of each page's own intro, which only
// describes what the provider sells; nothing here is written about a competitor
// beyond that. Mirrors the /services hub layout.

const PATH = "/compare";
const H1 = "Compare Form 5472 filing services";
const DESCRIPTION =
  "How formation and registered-agent providers such as doola, Firstbase, Clemta, StartGlobal, Zenind, Northwest and Stripe Atlas relate to Form 5472 filing.";
const LONG_DESCRIPTION =
  "A neutral guide to how company-formation and registered-agent providers relate to the annual Form 5472 and pro forma Form 1120 filing for a foreign-owned US LLC, with a page for each provider and a checklist of what to confirm before you choose a filing service.";

export const metadata: Metadata = {
  title: seoTitle(H1),
  description: DESCRIPTION,
  ...pageMeta({ title: H1, description: LONG_DESCRIPTION, path: PATH }),
  robots: { index: true, follow: true },
};

const PROVIDERS = [
  { slug: "stripe-atlas-form-5472", name: "Stripe Atlas" },
  { slug: "doola-form-5472", name: "doola" },
  { slug: "firstbase-form-5472", name: "Firstbase" },
  { slug: "clemta-form-5472", name: "Clemta" },
  { slug: "startglobal-form-5472", name: "StartGlobal" },
  { slug: "zenind-form-5472", name: "Zenind" },
  { slug: "northwest-registered-agent-form-5472", name: "Northwest Registered Agent" },
] as const;

/** First sentence of the page intro, cut at ", but" so it states only what the provider sells. */
function summarise(intro: string): string {
  const first = intro.match(/^.*?\.(?=\s|$)/)?.[0] ?? intro;
  const cut = first.split(", but ")[0];
  return cut.endsWith(".") ? cut : `${cut}.`;
}

const CHECKLIST = [
  "Whether the plan names Form 5472 and the pro forma Form 1120 specifically, rather than a general tax-filing line.",
  "Which tax years the plan covers, and how late or missed years are handled.",
  "Who reviews the package before it is submitted.",
  "How the package reaches the IRS (these forms cannot be e-filed) and what proof of transmission you receive.",
  "The turnaround time and the total price for the number of years you need.",
];

export default function ComparePage() {
  const items = PROVIDERS.map((p) => {
    const lp = getLandingPage(p.slug);
    if (!lp) throw new Error(`compare hub: missing landing page ${p.slug}`);
    return { ...p, href: `/${lp.slug}`, h1: lp.h1, summary: summarise(lp.intro) };
  });

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: H1,
    description: LONG_DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.h1,
        url: `${SITE_URL}${it.href}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collection} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Compare", path: PATH },
        ])}
      />

      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: "radial-gradient(55% 55% at 20% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li className="text-slate-300" aria-current="page">Compare</li>
            </ol>
          </nav>
          <h1 className="mt-8 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {H1}
          </h1>
          <p className="lead mt-6 max-w-3xl text-lg leading-relaxed text-slate-300" data-speakable>
            Many foreign founders form their US LLC through a formation or registered-agent company and then have to
            work out who files Form 5472. Each page below looks at one provider, says what it sells, and shows where
            the annual Form 5472 and pro forma Form 1120 filing fits. Plans change, so check the provider&apos;s
            current terms.
          </p>
        </div>
      </section>

      <div className="bg-white">
        <div className="mx-auto max-w-4xl space-y-14 px-4 py-14 sm:px-6 sm:py-16">
          <section aria-labelledby="providers">
            <h2 id="providers" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Formation and registered-agent providers
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Seven providers, each with a page on what its plans include and what to confirm about Form 5472.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {items.map((it) => (
                <li key={it.slug}>
                  <Link
                    href={it.href}
                    className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                  >
                    <span className="font-medium text-slate-900 group-hover:text-accent">{it.name} and Form 5472</span>
                    <span className="mt-1.5 line-clamp-4 text-sm text-slate-600">{it.summary}</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                      Read the comparison
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="checklist">
            <h2 id="checklist" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              What to confirm before choosing a filing service
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-700 marker:text-accent">
              {CHECKLIST.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              For how Form5472 Prep handles each point, see the{" "}
              <Link href={SERVICES_HUB_PATH} className="font-medium text-accent underline-offset-4 hover:underline">
                filing services
              </Link>{" "}
              and{" "}
              <Link href="/pricing" className="font-medium text-accent underline-offset-4 hover:underline">
                pricing
              </Link>{" "}
              pages.
            </p>
          </section>
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
            <Link href="/start?src=compare-hub" className="group">
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
