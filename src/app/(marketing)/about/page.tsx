import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbList, ORG_REF, organizationNode, pageMeta, SITE_NAME, SITE_URL, SPEAKABLE } from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";
import {
  ABOUT_LAST_REVIEWED,
  ABOUT_LAST_REVIEWED_LABEL,
  CTA_TEXT,
  FOUNDED,
  KEY_FACTS,
  LEAD,
  SECTIONS,
  STEPS,
  type AboutLink,
  type AboutSection,
} from "./content";

// All copy lives in ./content.ts (policed by ./content.test.ts).
const DESCRIPTION =
  "Who Form5472 Prep is, what we do and don't do, how a Form 5472 filing works step by step, how your data is protected and how our guides are sourced.";

const TITLE = "About Form5472 Prep: Who Prepares and Reviews Your Filing";

export const metadata: Metadata = {
  // Brand is already in the title — seoTitle() stops the template doubling it.
  title: seoTitle(TITLE),
  description: DESCRIPTION,
  ...pageMeta({
    title: TITLE,
    description: DESCRIPTION,
    path: "/about",
  }),
};

function SectionLinks({ links }: { links: AboutLink[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          {link.external ? (
            <a href={link.href} className="text-accent hover:underline" rel="nofollow noopener" target="_blank">
              {link.label}
            </a>
          ) : (
            <Link href={link.href} className="text-accent hover:underline">
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function QaSection({ section, children }: { section: AboutSection; children?: ReactNode }) {
  return (
    <section id={section.id} className="scroll-mt-24 border-b border-slate-200 py-12 first:pt-0 last:border-b-0">
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">{section.question}</h2>
      <p className="mt-4 text-base leading-relaxed text-slate-700">{section.answer}</p>
      {section.points && section.points.length > 0 ? (
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          {section.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
      {children}
      {section.links && section.links.length > 0 ? <SectionLinks links={section.links} /> : null}
    </section>
  );
}

export default function AboutPage() {
  const url = `${SITE_URL}/about`;
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${url}#webpage`,
    url,
    name: `About ${SITE_NAME}`,
    description: DESCRIPTION,
    inLanguage: "en",
    dateModified: ABOUT_LAST_REVIEWED,
    about: ORG_REF,
    mainEntity: organizationNode(),
    speakable: SPEAKABLE,
  };
  // Every h2 below is a question with its answer under it, so the FAQPage
  // lists exactly those visible Q&As.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SECTIONS.map((section) => ({
      "@type": "Question",
      name: section.question,
      acceptedAnswer: { "@type": "Answer", text: [section.answer, ...(section.points ?? [])].join(" ") },
    })),
  };
  const breadcrumbJsonLd = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  return (
    <>
      <JsonLd data={aboutJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(55% 55% at 20% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
            <Users className="h-3.5 w-3.5" />
            About us
          </p>
          <h1 className="mt-5 font-serif text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight text-balance">
            About {SITE_NAME}
          </h1>
          <p data-speakable className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
            {LEAD}
          </p>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-slate-400">
            Founded {FOUNDED} · Last reviewed{" "}
            <time dateTime={ABOUT_LAST_REVIEWED}>{ABOUT_LAST_REVIEWED_LABEL}</time>
          </p>
        </div>
      </section>

      {/* Key facts */}
      <section aria-label="Key facts" className="border-b border-slate-200 bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Not an h2: every h2 on this page is a question (AEO contract). */}
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">Key facts</p>
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {KEY_FACTS.map((fact) => (
              <div key={fact.term} className="border-t border-paper-edge pt-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{fact.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Question-led sections */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        {SECTIONS.map((section) => (
          <QaSection key={section.id} section={section}>
            {section.id === "how-a-filing-works" ? (
              <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="rounded-2xl border border-paper-edge bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-accent font-mono text-sm font-semibold text-white">
                        {i + 1}
                      </span>
                      <h3 className="font-semibold text-ink">{step.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  </li>
                ))}
              </ol>
            ) : null}
          </QaSection>
        ))}
      </div>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white text-balance">Ready to file?</h2>
          <p className="mt-3 text-slate-300">{CTA_TEXT}</p>
          <div className="mt-7">
            <Link href="/start" className="group inline-block">
              <Button size="lg" className="bg-white !text-ink hover:bg-slate-100">
                Start your filing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
