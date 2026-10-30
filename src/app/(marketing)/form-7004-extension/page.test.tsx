import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FORM_7004_ANSWERS } from "@/lib/form7004-answers";
import Form7004ExtensionPage from "./page";

// Plan 2026-10-30 P0-6 / P1-1: question-H2 capsules, the exact phrase in the
// first paragraph, and FAQPage JSON-LD that lists exactly the visible Q&As.
const html = renderToStaticMarkup(<Form7004ExtensionPage />);

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;|&apos;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const jsonLd = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)).map((m) =>
  JSON.parse(m[1]),
);

describe("/form-7004-extension", () => {
  it("every JSON-LD block parses, including the Service offer", () => {
    expect(jsonLd.map((d) => d["@type"])).toEqual(["Service", "FAQPage", "BreadcrumbList"]);
  });

  it("puts each capsule under its own question H2", () => {
    const h2s = Array.from(html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)).map((m) => decode(m[1]));
    for (const { q, a } of FORM_7004_ANSWERS) {
      expect(h2s).toContain(q);
      expect(decode(html)).toContain(a);
    }
    for (const h of h2s) expect(h, h).toMatch(/\?$/);
  });

  it("FAQPage lists exactly the visible questions and answers", () => {
    const faq = jsonLd.find((d) => d["@type"] === "FAQPage");
    const visibleQs = Array.from(html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g))
      .map((m) => decode(m[1]))
      .filter((t) => t.endsWith("?"));
    const schemaQs = faq.mainEntity.map((e: { name: string }) => e.name);
    // Every schema question is a visible heading; every visible Q&A heading
    // except the section H2s without an answer of their own is in the schema.
    for (const q of schemaQs) expect(visibleQs).toContain(q);
    for (const e of faq.mainEntity) expect(decode(html)).toContain(e.acceptedAnswer.text);
    expect(new Set(schemaQs).size).toBe(schemaQs.length);
  });

  it("opens with the exact phrase “Form 7004 extension”", () => {
    const lead = html.match(/<p data-speakable[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "";
    expect(decode(lead)).toContain("Form 7004 extension");
  });

  it("states who prepares the 7004 without claiming a PTIN review of it", () => {
    expect(decode(html)).toContain("tax accountant who holds an IRS PTIN is part of our Form 5472 filing service");
  });
});
