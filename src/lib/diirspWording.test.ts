import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// PR 10 / owner decision D8(b): app, chat, contact and admin text say "late
// filing with a reasonable-cause statement", never the DIIRSP acronym.
// Marketing pages, /diirsp and blog posts are deliberately NOT covered here.
// Comments and code identifiers (isDiirsp) are fine.
const FILES = [
  "src/lib/pricing.ts",
  "src/app/api/chat/route.ts",
  "src/app/api/ask/route.ts",
  "src/app/(marketing)/contact/page.tsx",
  "src/app/(marketing)/contact/ContactForm.tsx",
  "src/app/admin/filings/[id]/page.tsx",
  "src/app/admin/filings/page.tsx",
];

describe("no DIIRSP in user-visible app/chat/admin strings (D8b)", () => {
  it.each(FILES)("%s", (file) => {
    const code = readFileSync(path.join(process.cwd(), file), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((line) => !/^\s*(\/\/|\{\/\*)/.test(line));
    expect(code.filter((line) => /DIIRSP/.test(line))).toEqual([]);
  });
});
