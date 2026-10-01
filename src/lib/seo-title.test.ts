import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, fitTitle, seoTitle } from "@/lib/seo-title";

describe("fitTitle", () => {
  it("appends the brand when the whole title fits in 60 chars", () => {
    expect(fitTitle("EIN Application")).toBe("EIN Application · Form5472 Prep");
  });

  it("drops the brand (never the topic) when it would overflow", () => {
    const title = "Form 5472 for Digital Nomads With No Fixed Tax Residence";
    expect(fitTitle(title)).toBe(title);
  });

  it("never doubles the brand", () => {
    expect(fitTitle("About Form5472 Prep")).toBe("About Form5472 Prep");
  });

  it("returns an absolute title so the root template cannot re-append", () => {
    expect(seoTitle("Blog")).toEqual({ absolute: "Blog · Form5472 Prep" });
  });
});

// Guard for content/blog: a post whose <title> or meta description runs long
// must carry a `seoTitle:` / `seoDescription:` front-matter override.
describe("blog front-matter snippet lengths", () => {
  const dir = path.join(process.cwd(), "content", "blog");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  it.each(files)("%s fits the title and description limits", (file) => {
    const fm = matter(fs.readFileSync(path.join(dir, file), "utf8")).data as Record<string, string>;
    expect(fitTitle(fm.seoTitle ?? fm.title).length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    expect((fm.seoDescription ?? fm.description).length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
  });
});
