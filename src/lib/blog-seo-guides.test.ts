import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderPriceTokens } from "./blog-price-tokens";

const readPost = (slug: string) => readFileSync(join(process.cwd(), "content/blog", `${slug}.md`), "utf8");

describe("instructional blog links", () => {
  it.each([
    "form-5472-part-v-statement-example",
    "form-5472-lines-1f-1g-1h-total-value",
    "form-5472-ftin-reference-id-foreign-address",
  ])("%s points to the full example once with the requested anchor", (slug) => {
    const post = readPost(slug);
    expect(post).toContain("[Form 5472 example and sample](/form-5472-example)");
    expect(post.match(/\]\(\/form-5472-example\)/g)).toHaveLength(1);
  });

  it("connects the fax instructions to the fax filing service once", () => {
    const post = readPost("how-to-fax-form-5472-irs");
    expect(post).toContain("[Form 5472 fax filing service](/services/form-5472-fax-filing-service)");
    expect(post.match(/\]\(\/services\/form-5472-fax-filing-service\)/g)).toHaveLength(1);
  });
});

describe("generic DIY tool comparison", () => {
  const post = readPost("form-5472-diy-vs-preparer");
  const section = post.split("## A $50 DIY form tool vs done-for-you preparation: what is the difference?\n")[1]?.split("\n## ")[0];

  it("explains preparation, review, signing and transmission without attributing limits to a competitor", () => {
    expect(section).toBeDefined();
    expect(section).toContain("fill-in fields, calculations and PDF generation");
    expect(section).toContain("Our team prepares Form 5472 and pro forma Form 1120 from your facts");
    expect(section).toContain("a tax accountant who holds an IRS PTIN");
    expect(section).toContain("then you check and sign");
    expect(section).toContain("We fax the signed package to the IRS and provide a timestamped receipt");
    expect(section).toContain("A fax receipt shows transmission, not IRS acceptance");
    expect(section).toContain("We do not give tax advice");
    expect(section).not.toMatch(/form5472\.us|competitor|can't|cannot|\bCPA\b|licensed|IRS-approved|wizard|\bbest\b|cheapest|#1/i);
  });

  it("renders service prices from tokens while keeping the hypothetical DIY price in the heading", () => {
    for (const token of ["standard", "express", "additionalYear"]) {
      expect(section).toContain(`{{price.${token}}}`);
    }
    expect(section).not.toMatch(/\$\d/);
    expect(renderPriceTokens(section!)).not.toMatch(/\{\{|\}\}/);
  });
});
