import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The IRS notice for a Form 5472 (IRC §6038A) penalty is CP 215, Notice of
// Penalty Charge (IRM 20.1.9.5.2). CP 15 is the individual-account (IMF)
// version and was wrongly cited across the site until 2026-10-11
// (docs/seo/plan-2026-10-11-moz.md §3, A2). Lower-case "cp15" in ids and slug
// regexes is allowed so existing anchors keep working. The one sourced CP15
// explanation below is allowed because it distinguishes the account types;
// every other mention remains prohibited, including elsewhere in that post.
// Every source that renders public copy: lib modules, app pages and blog posts.
function walk(dir: string): string[] {
  return readdirSync(join(process.cwd(), dir)).flatMap((name) => {
    const rel = join(dir, name);
    if (statSync(join(process.cwd(), rel)).isDirectory()) return walk(rel);
    return /\.(tsx?|md)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [rel] : [];
  });
}
const FILES = [...walk("src/lib"), ...walk("src/app"), ...walk("content/blog")];
const WRONG_NOTICE = /\bCP-?15(?!\d)/;
const CP15_POST = "content/blog/form-5472-penalty-notice-what-to-do.md";
// Deliberately exact: adding an explanation must not exempt the whole post or
// allow the old incorrect CP15 = Form 5472 business-penalty claim to return.
const APPROVED_CP15_EXPLANATION = `## What should I do if I get an IRS CP15 notice for Form 5472?

CP15 is an individual-account civil-penalty notice, according to the [IRS manual](https://www.irs.gov/irm/part21/irm_21-003-001r). Check the penalty reference number, tax year and response instructions on your notice. Form 5472 business-account penalties generally use CP215, which this guide covers below. Do not assume the codes are interchangeable; ask a tax professional to review a notice that does not match your LLC.`;

function unexpectedNoticeLine(file: string, source: string): number {
  const guarded = file === CP15_POST ? source.replace(APPROVED_CP15_EXPLANATION, "") : source;
  return guarded.split("\n").findIndex((line) => WRONG_NOTICE.test(line));
}

describe("Form 5472 penalty notice code", () => {
  it.each(FILES)("%s has no unsourced or incorrect CP-15 / CP15 mention", (file) => {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    const hit = unexpectedNoticeLine(file, source);
    expect(hit, hit >= 0 ? `${file}:${hit + 1}` : file).toBe(-1);
  });

  it("keeps the sourced explanation distinguishing CP15 from business-account CP215", () => {
    const source = readFileSync(join(process.cwd(), CP15_POST), "utf8");
    expect(source).toContain(APPROVED_CP15_EXPLANATION);
  });

  it("rejects incorrect mentions outside the exact explanation, even in the same post", () => {
    const incorrect = "The Form 5472 penalty notice is CP15.";
    expect(unexpectedNoticeLine(CP15_POST, `${APPROVED_CP15_EXPLANATION}\n${incorrect}`)).toBeGreaterThanOrEqual(0);
    expect(unexpectedNoticeLine("content/blog/another-post.md", APPROVED_CP15_EXPLANATION)).toBeGreaterThanOrEqual(0);
    expect(unexpectedNoticeLine(CP15_POST, APPROVED_CP15_EXPLANATION.replace("CP215", "CP15"))).toBeGreaterThanOrEqual(0);
  });
});
