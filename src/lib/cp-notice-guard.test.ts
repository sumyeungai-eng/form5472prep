import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The IRS notice for a Form 5472 (IRC §6038A) penalty is CP 215, Notice of
// Penalty Charge (IRM 20.1.9.5.2). CP 15 is the individual-account (IMF)
// version and was wrongly cited across the site until 2026-10-11
// (docs/seo/plan-2026-10-11-moz.md §3, A2). Lower-case "cp15" in ids and slug
// regexes is allowed so existing anchors keep working.
const FILES = ["src/lib/faq.ts", "src/lib/landing-pages.ts", "src/lib/llms.ts"];
const WRONG_NOTICE = /\bCP-?15(?!\d)/;

describe("Form 5472 penalty notice code", () => {
  it.each(FILES)("%s never cites CP-15 / CP15", (file) => {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    const hit = source.split("\n").findIndex((line) => WRONG_NOTICE.test(line));
    expect(hit, hit >= 0 ? `${file}:${hit + 1}` : file).toBe(-1);
  });
});
