import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

// Moz Pro flags any URL over 75 characters ("URL too long"). The crawl of
// 2026-10-11 listed 52 published posts at 76-89 characters. Those are indexed,
// so renaming them would cost rankings; they are exempt. Every post dated after
// the cut-off below must keep its full URL within the limit, which means the
// slug after `/blog/` is at most 41 characters.
const BLOG_URL_PREFIX = "https://www.form5472prep.com/blog/";
const MAX_URL_LENGTH = 75;
const MAX_SLUG_LENGTH = MAX_URL_LENGTH - BLOG_URL_PREFIX.length;
const GRANDFATHERED_BEFORE_OR_ON = "2026-10-15";

const dir = path.join(process.cwd(), "content", "blog");

// gray-matter hands back YAML dates as Date objects and quoted ones as strings.
function isoDay(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

describe("blog URL length (Moz limit 75 characters)", () => {
  it("derives the slug budget from the real URL prefix", () => {
    expect(BLOG_URL_PREFIX.length).toBe(34);
    expect(MAX_SLUG_LENGTH).toBe(41);
  });

  it("keeps every post dated after 2026-10-15 within 75 characters", async () => {
    const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
    const tooLong: string[] = [];
    let checked = 0;

    for (const file of files) {
      const slug = file.replace(/\.md$/, "");
      const { data } = matter(await readFile(path.join(dir, file), "utf8"));
      if (isoDay(data.date) <= GRANDFATHERED_BEFORE_OR_ON) continue;
      checked += 1;
      const url = `${BLOG_URL_PREFIX}${slug}`;
      if (url.length > MAX_URL_LENGTH) tooLong.push(`${url} (${url.length} chars)`);
    }

    // The queued company-car posts are dated 2026-10-16..18, so the guard is
    // never vacuous while they are in the repo.
    expect(checked).toBeGreaterThan(0);
    expect(tooLong, `Shorten these slugs to <= ${MAX_SLUG_LENGTH} chars:\n${tooLong.join("\n")}`).toEqual([]);
  });
});
