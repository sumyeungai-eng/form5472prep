import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const pagePath = (name: string) => path.join(root, "src/app/(marketing)", name, "page.tsx");

const pages = {
  terms: pagePath("terms"),
  privacy: pagePath("privacy"),
  dataRetention: pagePath("data-retention"),
  security: pagePath("security"),
  cookies: pagePath("cookies"),
};

function read(filePath: string): string {
  return readFileSync(filePath, "utf8");
}

describe("legal page source content", () => {
  it("documents electronic signatures and refunds in terms", () => {
    const terms = read(pages.terms);

    expect(terms).toContain("Electronic signatures");
    expect(terms).toMatch(/paper copy/i);
    expect(terms).toMatch(/withdraw/i);
    expect(terms).toMatch(/Refunds and cancellations/i);
  });

  it("documents sensitive privacy categories", () => {
    const privacy = read(pages.privacy);

    expect(privacy).toMatch(/passport/i);
    expect(privacy).toMatch(/signature/i);
    expect(privacy).toMatch(/fax/i);
  });

  it("documents signature image retention", () => {
    const retention = read(pages.dataRetention);

    expect(retention).toMatch(/signature images/i);
  });

  it("has a cookies page that names advertising cookies", () => {
    expect(existsSync(pages.cookies)).toBe(true);

    const cookies = read(pages.cookies);
    expect(cookies).toMatch(/Google Ads/i);
    expect(cookies).toMatch(/Meta pixel/i);
  });

  it("does not use the old CPA firm disclaimer on legal pages", () => {
    for (const filePath of Object.values(pages)) {
      expect(read(filePath)).not.toMatch(/\bnot a cpa\s+firm\b/i);
    }
  });
});
