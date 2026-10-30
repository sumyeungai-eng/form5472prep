import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// slugify lives in blog.ts, which imports prisma; no database in unit tests.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { LANDING_PAGES } from "@/lib/landing-pages";
import SeoLandingPage from "./page";

function decode(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const textOf = (fragment: string) => decode(fragment.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

type Node = { "@type"?: string; [key: string]: unknown };

function jsonLd(html: string): Node[] {
  return Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)).map(
    (m) => JSON.parse(m[1]) as Node,
  );
}

const rendered = LANDING_PAGES.map((page) => ({
  page,
  html: renderToStaticMarkup(<SeoLandingPage params={{ seoSlug: page.slug }} />),
}));

describe("landing page structured data matches the visible page", () => {
  // plan-2026-10-30 P0-2: Google treats FAQ markup that lists questions the
  // page does not show as a structured-data quality problem.
  it.each(rendered.map((r) => [r.page.slug, r] as const))("%s: FAQPage lists exactly the visible questions", (_slug, { html }) => {
    const faq = jsonLd(html).find((n) => n["@type"] === "FAQPage") as
      | { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> }
      | undefined;
    // Only the FAQ block: the HowTo "Before you start" box is a <dl> too.
    const faqBlock = html.slice(html.indexOf("Frequently asked questions"));
    const visible = Array.from(faqBlock.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>/g)).map((m) => textOf(m[1]));

    expect(faq?.mainEntity.map((q) => q.name) ?? []).toEqual(visible);
    for (const q of faq?.mainEntity ?? []) {
      expect(q.acceptedAnswer.text, q.name).not.toMatch(/\]\(\//);
    }
  });

  it.each(rendered.filter((r) => r.page.howTo).map((r) => [r.page.slug, r] as const))(
    "%s: HowTo steps are the visible numbered steps",
    (_slug, { html }) => {
      const howTo = jsonLd(html).find((n) => n["@type"] === "HowTo") as
        | { step: Array<{ name: string; text: string; url: string }> }
        | undefined;
      const visible = Array.from(html.matchAll(/<li id="step-\d+"[^>]*>([\s\S]*?)<\/li>/g)).map((m) => textOf(m[1]));

      expect(howTo).toBeDefined();
      expect(howTo!.step.map((s) => s.text)).toEqual(visible);
      for (const s of howTo!.step) expect(s.name + s.text).not.toMatch(/\]\(\//);
    },
  );
});

describe("landing page wording", () => {
  it.each(rendered.map((r) => [r.page.slug, r] as const))("%s: names Form5472 Prep and never an online filer", (_slug, { html }) => {
    expect(html).toContain("Form5472 Prep prepares every form");
    expect(html).not.toMatch(/online filer/i);
  });
});

// plan-2026-10-30 P1-4: the three "how to file / fill out Form 5472" pages.
describe("how-to pages", () => {
  const byslug = new Map(rendered.map((r) => [r.page.slug, r]));

  it.each([
    ["file-form-5472", "How do you file Form 5472 step by step?", ["/form-5472-instructions", "/form-5472-example"]],
    ["form-5472-instructions", "How do you fill out Form 5472 step by step?", ["/file-form-5472", "/form-5472-example"]],
    ["form-5472-example", "How do you fill out Form 5472, using this example?", ["/form-5472-instructions", "/file-form-5472"]],
  ] as const)("%s leads with numbered steps, an Updated date, IRS sources and cross-links", (slug, heading, links) => {
    const { page, html } = byslug.get(slug)!;

    expect(page.sections[0].heading).toBe(heading);
    expect(page.howTo?.section).toBe(heading);
    expect(html).toMatch(/Updated <time datetime="\d{4}-\d{2}-\d{2}"/i);
    expect(page.sources?.some((s) => s.url.startsWith("https://www.irs.gov/"))).toBe(true);
    for (const href of links) expect(html, href).toContain(`href="${href}"`);
  });
});
