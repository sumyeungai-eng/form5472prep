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
    ["form-5472-filing-requirements", "What are the Form 5472 filing requirements?"],
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
});
