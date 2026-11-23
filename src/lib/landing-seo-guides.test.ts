import { describe, expect, it } from "vitest";
import { LANDING_PAGES } from "./landing-pages";

describe("Form 5472 example and instructions discovery", () => {
  it("distinguishes official blank forms, the filled sample and actual preparation", () => {
    const example = LANDING_PAGES.find(({ slug }) => slug === "form-5472-example")!;
    const sections = example.sections.filter(({ heading }) => heading === "Is there a Form 5472 template I can use?");
    expect(sections).toHaveLength(1);
    const answer = sections[0].body;
    const words = answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(40);
    expect(words).toBeLessThanOrEqual(60);
    expect(answer).toContain("official blank Form 5472 and Form 1120 as fillable PDFs");
    expect(answer).toContain("](https://www.irs.gov/forms-pubs/about-form-5472)");
    expect(answer).toContain("filled sample to compare against");
    expect(answer).toContain("prepares the actual forms from your facts");
    expect(example.sections.some(({ body }) => body.includes("](/samples/form-5472-example-sample.pdf)"))).toBe(true);
  });

  it("keeps the instructions linked to the example and filing service", () => {
    const instructions = LANDING_PAGES.find(({ slug }) => slug === "form-5472-instructions")!;
    const body = instructions.sections.map(({ body }) => body).join("\n");
    expect(body).toContain("](/form-5472-example)");
    expect(body).toContain("](/services/form-5472-filing-service)");
  });
});
