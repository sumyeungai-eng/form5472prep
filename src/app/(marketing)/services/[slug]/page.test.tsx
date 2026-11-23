import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ServicePageRoute from "./page";
import { SERVICE_PAGES, toPlainText } from "@/lib/services-pages";

const caption = "Example only: illustrative receipt with fictional data";
const explanation = "A fax receipt shows the package was transmitted and when; it is not an IRS acceptance notice.";
const textOf = (html: string) => html
  .replace(/<[^>]+>/g, "")
  .replace(/&quot;/g, '"')
  .replace(/&#x27;/g, "'")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();

describe("/services/[slug] additions", () => {
  const render = (slug: string) => renderToStaticMarkup(<ServicePageRoute params={{ slug }} />);

  it("places an accessible fictional receipt immediately after the fax-receipt explanation", () => {
    const html = render("form-5472-fax-filing-service");
    const section = html.match(/<h2\b[^>]*>What is on the fax receipt\?<\/h2>([\s\S]*?)(?=<h2\b)/)?.[1];
    expect(section).toBeDefined();
    const figure = section!.match(/<figure\b[^>]*>([\s\S]*?)<\/figure>/)?.[1];
    expect(figure).toBeDefined();
    const img = figure!.match(/<div role="img" aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/div><\/div>/);
    expect(img).not.toBeNull();
    for (const value of ["2026-01-15 10:42 UTC", "8 pages", "IRS Ogden PIN Unit", "Sent", "EX-000000"]) {
      expect(img![1]).toContain(value);
      expect(textOf(img![2])).toContain(value);
    }
    expect(textOf(img![2])).toContain("Status: Sent");
    expect(textOf(img![2])).toContain("Job ID: EX-000000");
    expect(figure).toMatch(new RegExp(`<figcaption\\b[^>]*>${caption}</figcaption>`));
    expect(section).toMatch(new RegExp(`</figure><p\\b[^>]*>${explanation}</p>`));
    expect(img![2]).not.toContain(caption);
    expect(img![2]).not.toContain(explanation);
    expect(figure!.indexOf(caption)).toBeGreaterThan(figure!.indexOf(img![0]));
    expect(section!.indexOf(explanation)).toBeGreaterThan(section!.indexOf(caption));
    expect(figure).not.toMatch(/855|887|7737|DELIVERED|logo|<svg|<img/i);
    expect(section).toContain("Keep both with the LLC&#x27;s tax records.");
    expect(section!.indexOf("Keep both with the LLC&#x27;s tax records.")).toBeLessThan(section!.indexOf("<figure"));
  });

  it.each(SERVICE_PAGES.filter((page) => page.slug !== "form-5472-fax-filing-service"))(
    "does not show the receipt example on $slug",
    ({ slug }) => {
      const html = render(slug);
      expect(html).not.toContain('role="img"');
      expect(html).not.toContain(caption);
      expect(html).not.toContain(explanation);
      expect(html).not.toContain("EX-000000");
    },
  );

  it.each(SERVICE_PAGES)("keeps $slug FAQ schema identical to the visible answers", (page) => {
    const html = render(page.slug);
    const faq = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
      .map((match) => JSON.parse(match[1]))
      .find((node) => node["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(page.faqs.length);
    const visible = Array.from(html.matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt><dd\b[^>]*>([\s\S]*?)<\/dd>/g));
    expect(visible).toHaveLength(page.faqs.length);
    page.faqs.forEach((answer, index) => {
      expect(faq.mainEntity[index].name).toBe(textOf(visible[index][1]));
      expect(faq.mainEntity[index].acceptedAnswer.text).toBe(toPlainText(answer.a));
      expect(faq.mainEntity[index].acceptedAnswer.text).toBe(textOf(visible[index][2]));
    });
  });

  it.each([
    ["form-5472-filing-service", "/services/form-5472-fax-filing-service", "Form 5472 fax filing service"],
    ["form-5472-fax-filing-service", "/services/form-5472-filing-service", "Form 5472 filing service"],
    ["form-5472-preparer", "/form-5472-instructions", "Form 5472 instructions"],
  ])("renders the new contextual links on %s", (slug, href, anchor) => {
    const html = render(slug);
    expect(html).toMatch(new RegExp(`<a[^>]*href="${href}"[^>]*>${anchor}</a>`));
    for (const [path, label] of [["/form-5472-instructions", "Form 5472 instructions"], ["/form-5472-example", "Form 5472 example"]]) {
      expect(html).toMatch(new RegExp(`<a[^>]*href="${path}"[^>]*>${label}</a>`));
    }
  });
});
