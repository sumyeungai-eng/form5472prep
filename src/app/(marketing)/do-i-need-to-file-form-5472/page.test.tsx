import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { IRS_OGDEN_FAX, IRS_OGDEN_MAIL_ADDRESS } from "@/lib/seo";
import DoINeedToFileForm5472Page from "./page";

// The "who must file" / "filing requirements" capsules make this page the owner
// for those queries (docs/seo/moz-full-report-2026-10-07.md §3.1a, §3.6 item 7).
// Answer-engine contract: a question H2 followed by a 40-60 word direct answer.
const html = renderToStaticMarkup(<DoINeedToFileForm5472Page />);

function text(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&ldquo;|&rdquo;|&#x27;|&rsquo;|&quot;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function leadAfter(headingId: string): string {
  const start = html.indexOf(`id="${headingId}"`);
  expect(start, headingId).toBeGreaterThan(-1);
  const p = html.slice(start).match(/<p[^>]*>([\s\S]*?)<\/p>/);
  return text(p?.[1] ?? "");
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

describe("/do-i-need-to-file-form-5472 capsules", () => {
  it.each([
    ["who-must-file-form-5472", "Who must file Form 5472?"],
    ["form-5472-filing-requirements", "What are the Form 5472 filing requirements for a foreign-owned US LLC?"],
  ])("answers %s in 40-60 words right under the question H2", (id, question) => {
    expect(html).toContain(question);
    const lead = leadAfter(id);
    expect(words(lead), lead).toBeGreaterThanOrEqual(40);
    expect(words(lead), lead).toBeLessThanOrEqual(60);
  });

  it("names the three kinds of reporting corporation", () => {
    const lead = leadAfter("who-must-file-form-5472");
    expect(lead).toMatch(/25% foreign-owned US corporation/);
    expect(lead).toMatch(/foreign-owned US disregarded entity/);
    expect(lead).toMatch(/foreign corporation engaged in a trade or business within the United States/);
    expect(html).toContain("301.7701-2(c)(2)(vi)");
  });

  it("takes the IRS fax number and mailing address from the seo.ts constants", () => {
    expect(html).toContain(IRS_OGDEN_FAX);
    expect(html).toContain(IRS_OGDEN_MAIL_ADDRESS);
    expect(html).toContain('href="/form-5472-fax-number"');
    expect(html).toContain('href="/form-5472-instructions"');
  });

  // Moz 2026-10-25: "form 5472 preparer" and "hire someone to file form 5472"
  // ranked this checker instead of the service pages; exact-anchor links point
  // Google at the intended pages.
  it.each([
    ["/services/form-5472-preparer", "Form 5472 preparer"],
    ["/services/hire-someone-to-file-form-5472", "hire someone to file Form 5472"],
  ])("links %s with the exact anchor %j", (href, anchor) => {
    const link = html.match(new RegExp(`<a[^>]*href="${href}"[^>]*>([\\s\\S]*?)</a>`));
    expect(link, href).not.toBeNull();
    expect(text(link![1])).toBe(anchor);
  });
});


describe("requirements checklist", () => {
  it("adds one exact-question summary with a 40-60 word answer and the filing essentials", () => {
    const question = "What are the Form 5472 filing requirements?";
    expect(html.split(question)).toHaveLength(2);
    const lead = leadAfter("form-5472-requirements-checklist");
    expect(words(lead)).toBeGreaterThanOrEqual(40);
    expect(words(lead)).toBeLessThanOrEqual(60);
    expect(lead).toContain("wholly owned by one foreign person");
    expect(lead).toContain("disregarded for federal tax");
    expect(lead).toContain("any year with a reportable transaction");
    expect(lead).toContain("owner contributions and distributions");
    expect(lead).toContain("pro forma Form 1120");

    const checklist = text(html.slice(html.indexOf('id="form-5472-requirements-checklist"')).split("</ul>")[0]);
    expect(checklist).toContain("April 15");
    expect(checklist).toContain("October 15 with a Form 7004 extension filed by April 15");
    expect(checklist).toContain("no e-filing");
    expect(checklist).toContain("$25,000 per Form 5472");
    expect(checklist).toContain("Record-keeping:");
    expect(html).toContain('href="/file-form-5472"');
    expect(html).toContain('href="/form-5472-instructions"');
  });

  it("keeps every FAQ schema answer identical to its visible answer", () => {
    const nodes = Array.from(html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))
      .map((match) => JSON.parse(match[1]));
    const faq = nodes.find((node) => node["@type"] === "FAQPage");
    expect(faq).toBeDefined();
    const visible = Array.from(html.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/g)).map((match) => ({
      q: text(match[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] ?? ""),
      a: text(match[1].match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? ""),
    }));
    for (const question of faq.mainEntity) {
      expect(visible.find(({ q }) => q === question.name)?.a).toBe(question.acceptedAnswer.text);
    }
  });
});
