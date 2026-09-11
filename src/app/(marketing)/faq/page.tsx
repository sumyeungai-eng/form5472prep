import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, HelpCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_CATEGORIES, FAQ_ITEMS, FAQ_LAST_REVIEWED } from "@/lib/faq";
import { SITE_URL, SPEAKABLE, breadcrumbList, pageMeta } from "@/lib/seo";

const DESCRIPTION =
  "Canonical short answers for Form 5472 filing, deadlines, penalties, EIN, ITIN, proof, records, and how Form5472 Prep works.";

export const metadata: Metadata = {
  title: "Form 5472 FAQ: Filing, Deadlines, EIN & ITIN",
  description: DESCRIPTION,
  ...pageMeta({
    title: "Form 5472 FAQ: Filing, Deadlines, EIN & ITIN",
    description: DESCRIPTION,
    path: "/faq",
  }),
};

const itemsByCategory = FAQ_CATEGORIES.map((category) => ({
  category,
  items: FAQ_ITEMS.filter((item) => item.category === category.id),
}));

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/faq#webpage`,
  url: `${SITE_URL}/faq`,
  name: "Form 5472 FAQ",
  description: DESCRIPTION,
  dateModified: FAQ_LAST_REVIEWED,
  inLanguage: "en-US",
  speakable: {
    ...SPEAKABLE,
    cssSelector: ["h1", ...FAQ_ITEMS.filter((item) => item.speakable).map((item) => `#${item.id}`)],
  },
};

function formatReviewedDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function FaqPage() {
  return (
    <main className="bg-white">
      <JsonLd data={faqJsonLd} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      <JsonLd data={webPageJsonLd} />

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
        <div className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
            <HelpCircle className="h-3.5 w-3.5" />
            Central FAQ
          </p>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Form 5472 questions, answered.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Short, source-bound answers to the Form 5472, pro forma Form 1120,
            deadline, penalty, EIN, ITIN, filing proof, and records questions
            customers ask before and after filing.
          </p>
        </div>
      </section>

      <nav
        aria-label="FAQ sections"
        className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {FAQ_CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-accent hover:text-accent"
            >
              {category.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
        <p className="text-xs text-slate-500">
          Last reviewed {formatReviewedDate(FAQ_LAST_REVIEWED)}
        </p>

        <div className="mt-10 space-y-16">
          {itemsByCategory.map(({ category, items }) => (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <div className="border-b border-slate-200 pb-5">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
                  {category.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {category.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{category.blurb}</p>
              </div>

              <dl className="mt-8 space-y-9">
                {items.map((item) => (
                  <div key={item.id}>
                    <dt
                      id={item.id}
                      data-speakable={item.speakable ? true : undefined}
                      className="scroll-mt-28 font-semibold text-slate-900"
                    >
                      {item.question}
                    </dt>
                    <dd className="mt-2">
                      <p className="text-sm leading-relaxed text-slate-600">{item.answer}</p>
                      {item.learnMore && (
                        <Link
                          href={item.learnMore.href}
                          className="mt-3 inline-block text-sm font-medium text-accent underline underline-offset-2"
                        >
                          {item.learnMore.label} →
                        </Link>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>

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
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-100">
            Ready to file
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-white text-balance sm:text-3xl">
            Start with the filing flow, or ask a question first.
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/start" className="group">
              <Button size="lg" className="bg-white !text-ink hover:bg-slate-100">
                Start your filing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact" className="group">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Contact us
                <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
