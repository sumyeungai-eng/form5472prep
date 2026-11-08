import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CONTACT_EMAIL } from "@/lib/contactEmail";

// Owner decision 2026-11-08: the contact page (and the footer it renders) shows
// hello@ only; support@ attracts spam. Source scan, like diirspWording.test.ts.
const root = path.join(process.cwd(), "src/app/(marketing)");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("public contact page email", () => {
  it("is hello@", () => {
    expect(CONTACT_EMAIL).toBe("hello@form5472prep.com");
  });

  it.each(["contact/page.tsx", "contact/ContactForm.tsx", "layout.tsx"])(
    "%s does not show support@",
    (file) => {
      const source = read(file);
      expect(source).not.toMatch(/support@/);
      expect(source).not.toMatch(/ORG_EMAIL/);
    },
  );
});
