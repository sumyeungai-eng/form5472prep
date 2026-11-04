import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Page from "./page";

// Every question in the page's FAQPage JSON-LD must be a visible h2 on the
// page, and each answer must be visible page text (plan-2026-10-30 P0-2).
function textOf(fragment: string): string {
  return fragment
    .replace(/<\/(li|p|h[1-6]|div|section)>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

describe("/press FAQPage JSON-LD", () => {
  it("mirrors the visible question headings and their answers", () => {
    const html = renderToStaticMarkup(<Page />);
    const faq = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
      .map((m) => JSON.parse(m[1]) as { "@type"?: string; mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> })
      .find((n) => n["@type"] === "FAQPage");
    expect(faq?.mainEntity?.length).toBeGreaterThanOrEqual(3);

    const headings = new Set(Array.from(html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)).map((m) => textOf(m[1])));
    const visible = textOf(html.replace(/<script[\s\S]*?<\/script>/g, ""));
    for (const { name, acceptedAnswer } of faq?.mainEntity ?? []) {
      expect(headings.has(name), name).toBe(true);
      expect(visible.includes(acceptedAnswer.text), acceptedAnswer.text).toBe(true);
    }
  });
});
