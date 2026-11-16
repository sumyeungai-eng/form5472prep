import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { extractFaqs, extractQuestionHeadings } from "./blog";
import { renderPriceTokens } from "./blog-price-tokens";
import { fitTitle, TITLE_MAX_LENGTH } from "./seo-title";
import { TRUSTPILOT_PROFILE_URL } from "./seo";

function readPost(slug: string) {
  return matter(readFileSync(join(process.cwd(), "content/blog", `${slug}.md`), "utf8"));
}
function words(text: string) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim().split(/\s+/).length;
}

describe("buyer question answers", () => {
  it.each([
    ["form-5472-deadline-tomorrow-urgent-filing", "Can Form5472 Prep get my filing ready before the deadline?"],
    ["form-5472-penalty-notice-what-to-do", "What should I do if I get an IRS CP15 notice for Form 5472?"],
  ])("%s gives the requested question a 40-60 word direct answer", (slug, heading) => {
    const answer = extractQuestionHeadings(readPost(slug).content).find(({ q }) => q === heading)?.a;
    expect(answer).toBeDefined();
    expect(words(answer!)).toBeGreaterThanOrEqual(40);
    expect(words(answer!)).toBeLessThanOrEqual(60);
  });

  it("limits Express to readiness for signing and distinguishes transmission from acceptance", () => {
    const answers = extractQuestionHeadings(readPost("form-5472-deadline-tomorrow-urgent-filing").content);
    const answer = answers.find(({ q }) => q === "Can Form5472 Prep get my filing ready before the deadline?")!.a;
    expect(answer).toContain("ready to sign in under 3 days, 7 days a week");
    expect(answer).toContain("then check and sign");
    expect(answer).toContain("we fax it to the IRS");
    expect(answer).toContain("cannot promise the IRS accepts it on time");
    expect(answer).toContain("fax receipt shows when it was sent, not IRS acceptance");
  });
});

describe("Form5472 Prep legitimacy explainer", () => {
  const { content, data } = readPost("is-form5472-prep-legit");
  const rendered = renderPriceTokens(content);

  it("keeps the requested title, publication date, length and URL budget", () => {
    expect(data.title).toBe("Is Form5472 Prep Legit? What It Is and What It Is Not");
    expect(new Date(data.date).toISOString().slice(0, 10)).toBe("2026-11-16");
    expect(data.draft).toBe(false);
    expect(fitTitle(data.seoTitle ?? data.title).length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    expect("https://www.form5472prep.com/blog/is-form5472-prep-legit".length).toBeLessThanOrEqual(75);
    expect(words(rendered)).toBeGreaterThanOrEqual(600);
    expect(words(rendered)).toBeLessThanOrEqual(900);
    const lead = rendered.trim().split(/\n\s*\n/)[0];
    expect(words(lead)).toBeGreaterThanOrEqual(40);
    expect(words(lead)).toBeLessThanOrEqual(60);
  });

  it("answers all seven questions and exposes exactly three FAQs", () => {
    expect(extractQuestionHeadings(rendered).map(({ q }) => q)).toEqual([
      "What does Form5472 Prep do?", "Who reviews the filing?", "What is it not?",
      "How is payment handled?", "How is my data protected?", "What do customers say?",
      "How new is the company?",
    ]);
    expect(extractFaqs(rendered)).toHaveLength(3);
  });

  it("uses current price tokens, required source links, reviewer wording and scope limits", () => {
    for (const token of ["standard", "express", "additionalYear"]) {
      expect(content).toContain(`{{price.${token}}}`);
    }
    for (const link of ["/pricing", "/about", "/security", "/services/form-5472-filing-service", TRUSTPILOT_PROFILE_URL]) {
      expect(content).toContain(`](${link})`);
    }
    expect(content).toContain("a tax accountant who holds an IRS PTIN");
    expect(content).toContain("We are not a CPA firm");
    expect(content).toContain("We do not give tax advice");
    expect(content).toContain("we do not provide IRS representation");
    expect(content).toContain("founded in 2025");
    expect(content.replaceAll("not a CPA firm", "")).not.toMatch(/\bCPA\b|licensed|IRS-approved|wizard|\bbest\b|cheapest|#1/i);
    expect(content).not.toMatch(/\$\d|\d(?:\.\d)?\s*(?:stars?|out of)|rated\s+\d/i);
    expect(rendered).not.toMatch(/\{\{|\}\}/);
  });
});
