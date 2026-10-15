import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

// No database in unit tests: by default blog.ts sees an empty Post table and
// serves the markdown files. Individual tests inject DB rows via findMany.
const { findMany, upsert } = vi.hoisted(() => ({
  findMany: vi.fn(async (): Promise<unknown[]> => []),
  upsert: vi.fn(async () => ({})),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { post: { findMany, findUnique: async () => null, upsert } },
}));

import { getAllPosts, getPost, getPostIncludingDraft, writePost } from "./blog";
import {
  PRICE_TOKENS,
  PriceTokenError,
  currentPriceLiterals,
  priceTokenCents,
  renderPriceTokens,
} from "./blog-price-tokens";
import { buildLlmsGuidesTxt, buildLlmsTxt } from "./llms";
import { EIN_PRICE_CENTS, ITIN_PRICE_CENTS, MULTI_YEAR_ADDON_CENTS, TIERS } from "./pricing";
import { formatPrice } from "./utils";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const FILES = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
const read = (file: string) => fs.readFileSync(path.join(BLOG_DIR, file), "utf8");

describe("renderPriceTokens", () => {
  it("renders every token from src/lib/pricing.ts", () => {
    expect(renderPriceTokens("{{price.standard}}")).toBe(formatPrice(TIERS.standard.priceCents));
    expect(renderPriceTokens("{{price.express}}")).toBe(formatPrice(TIERS.express.priceCents));
    expect(renderPriceTokens("+{{price.additionalYear}}")).toBe(`+${formatPrice(MULTI_YEAR_ADDON_CENTS)}`);
    expect(renderPriceTokens("**{{ price.ein }}**")).toBe(`**${formatPrice(EIN_PRICE_CENTS)}**`);
    expect(renderPriceTokens("{{price.itin}}")).toBe(formatPrice(ITIN_PRICE_CENTS));
  });

  it("evaluates worked-example arithmetic with precedence and parentheses", () => {
    const std = TIERS.standard.priceCents / 100;
    expect(priceTokenCents("price.standard * 20")).toBe(std * 20 * 100);
    expect(priceTokenCents("(399 - price.standard) * 60 / 40")).toBe(Math.round((399 - std) * 1.5 * 100));
    expect(priceTokenCents("1 + 2 * 3")).toBe(700);
    expect(renderPriceTokens("{{1000 * 3}}")).toBe("$3,000");
    expect(renderPriceTokens("{{3 / 2}}")).toBe("$1.50");
  });

  it("rounds half cents up as written and never renders -$0", () => {
    expect(renderPriceTokens("{{1.005}}")).toBe("$1.01");
    expect(renderPriceTokens("{{(0 - 1) * 0}}")).toBe("$0");
  });

  it("leaves text without tokens untouched", () => {
    const text = "The IRS penalty is $25,000 and the fee is {not a token}.";
    expect(renderPriceTokens(text)).toBe(text);
  });

  it.each([
    ["{{price.premium}}", /Unknown price token "price.premium"/],
    ["{{standard}}", /Unknown price token "standard"/],
    ["{{}}", /Empty price token/],
    ["{{price.standard +}}", /Malformed/],
    ["{{(price.standard}}", /missing \)/],
    ["{{price.standard $}}", /Malformed/],
    ["{{1 / 0}}", /division by zero/],
    ["{{1 2}}", /trailing input/],
    ["{{-5}}", /unexpected "-"/],
    ["{{__proto__}}", /Unknown price token/],
    ["{{100 - price.itin}}", /negative/],
    ["{{price.standard}", /Unbalanced/],
    ["price.standard}}", /Unbalanced/],
    ["{{ {{price.standard}} }}", /Unbalanced/],
  ])("fails closed on %s", (input, message) => {
    expect(() => renderPriceTokens(input, "test")).toThrow(PriceTokenError);
    expect(() => renderPriceTokens(input, "test")).toThrow(message);
  });

  it("does not resolve object prototype names", () => {
    expect(() => renderPriceTokens("{{constructor}}")).toThrow(/Unknown price token/);
    expect(() => renderPriceTokens("{{toString}}")).toThrow(/Unknown price token/);
  });
});

// ---- Content guard ---------------------------------------------------------

// Literal dollar amounts that EQUAL one of our current prices but are not our
// price. Each entry must match a real line (stale entries fail below). Never
// add our own price here — use a {{price.*}} token instead.
const ALLOWED_LITERALS: { file: string; snippet: string; why: string }[] = [
  {
    file: "form-5472-app-developers-app-store-google-play.md",
    snippet: 'Advertises a "$99 annual membership"',
    why: "Apple Developer Program fee",
  },
  {
    file: "form-5472-app-developers-app-store-google-play.md",
    snippet: "($7,200 + $99 + $25)",
    why: "Apple Developer Program fee inside a worked example",
  },
];

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// "$149" / "$149.00" / "USD 149" / "US$149" — but not "$1,149", "$149,000" or "$149.50".
function literalPattern(): RegExp {
  const numbers = currentPriceLiterals().map((literal) => escapeRegExp(literal.replace(/^\$/, "")));
  const amount = `(?:${numbers.join("|")})(?:\\.00)?(?![0-9]|[.,][0-9])`;
  return new RegExp(`(?:\\$|\\bUSD\\s?|\\bUS\\$\\s?)${amount}`, "g");
}

describe("content/blog price guard", () => {
  it("knows every current price literal", () => {
    expect(currentPriceLiterals().sort()).toEqual(
      Array.from(new Set(Object.values(PRICE_TOKENS).map((cents) => formatPrice(cents)))).sort(),
    );
  });

  it("no post hard-codes one of our current prices outside a {{price.*}} token", () => {
    const pattern = literalPattern();
    const violations: string[] = [];
    const used = new Set<number>();
    for (const file of FILES) {
      read(file)
        .split("\n")
        .forEach((line, index) => {
          pattern.lastIndex = 0;
          for (let match = pattern.exec(line); match; match = pattern.exec(line)) {
            const allowed = ALLOWED_LITERALS.findIndex(
              (entry) => entry.file === file && line.includes(entry.snippet) && entry.snippet.includes(match[0]),
            );
            if (allowed >= 0) {
              used.add(allowed);
              continue;
            }
            violations.push(`${file}:${index + 1}: "${match[0]}" — use a {{price.*}} token (see src/lib/blog-price-tokens.ts)`);
          }
        });
    }
    expect(violations).toEqual([]);
    const stale = ALLOWED_LITERALS.filter((_, index) => !used.has(index)).map((entry) => `${entry.file}: ${entry.snippet}`);
    expect(stale, "stale ALLOWED_LITERALS entries").toEqual([]);
  });

  it.each(FILES)("%s renders every price token", (file) => {
    const rendered = renderPriceTokens(read(file), file);
    expect(rendered).not.toMatch(/\{\{|\}\}/);
  });
});

// ---- Loader: every public consumer gets rendered prices ----------------------

describe("blog loader renders price tokens", () => {
  const TOKENISED = "offer-form-5472-filing-as-a-service";

  it("the fixture post really carries tokens on disk", () => {
    const raw = read(`${TOKENISED}.md`);
    expect(raw).toContain("{{price.standard}}");
    expect(raw).toContain("{{price.standard * 20}}");
  });

  it("getPost renders body, description and FAQ text", async () => {
    const post = await getPost(TOKENISED);
    expect(post).not.toBeNull();
    const std = formatPrice(TIERS.standard.priceCents);
    for (const text of [post!.title, post!.description, post!.body]) expect(text).not.toMatch(/\{\{|\}\}/);
    expect(post!.description).toContain(`our ${std} fee`);
    expect(post!.body).toContain(`| Our Standard fee | ${std} | ${formatPrice(TIERS.standard.priceCents * 20)} |`);
  });

  it("getAllPosts renders every title and description", async () => {
    const posts = await getAllPosts({ includeDrafts: true });
    expect(posts.length).toBeGreaterThan(100);
    for (const post of posts) {
      for (const text of [post.title, post.description, post.seoTitle ?? "", post.seoDescription ?? ""]) {
        expect(text, post.slug).not.toMatch(/\{\{|\}\}/);
      }
    }
  });

  const row = (slug: string, body: string) => ({
    slug,
    title: `DB post ${slug}`,
    description: `Costs {{price.express}} for ${slug}`,
    date: "2026-10-01",
    publishAt: null,
    updated: null,
    author: null,
    tags: ["form-5472"],
    draft: false,
    body,
    deleted: false,
  });
  afterEach(() => findMany.mockReset().mockResolvedValue([]));

  it("renders database-backed posts too", async () => {
    findMany.mockResolvedValue([row("db-token-post", "Body {{price.standard}}")]);
    const post = (await getAllPosts()).find((p) => p.slug === "db-token-post");
    expect(post?.description).toBe(`Costs ${formatPrice(TIERS.express.priceCents)} for db-token-post`);
  });

  it("public listings throw on a bad token; the admin listing falls back to raw text", async () => {
    findMany.mockResolvedValue([row("db-bad-post", "Body {{price.retired}}")]);
    await expect(getAllPosts()).rejects.toThrow(PriceTokenError);
    const admin = (await getAllPosts({ includeDrafts: true })).find((p) => p.slug === "db-bad-post");
    expect(admin?.description).toBe("Costs {{price.express}} for db-bad-post");
  }, 30_000); // walks every post through the loader; slow under the full parallel suite

  it("writePost refuses a bad token before touching the database", async () => {
    upsert.mockClear();
    await expect(
      writePost("token-check", { title: "T", description: "D", date: "2026-10-01" }, "Pay {{price.gold}}"),
    ).rejects.toThrow(/Unknown price token "price.gold"/);
    expect(upsert).not.toHaveBeenCalled();
    await writePost("token-check", { title: "T", description: "{{price.ein}}", date: "2026-10-01" }, "{{price.itin}}");
    // Stored as written: tokens, not rendered prices.
    expect(upsert.mock.calls[0]).toEqual([
      expect.objectContaining({
        create: expect.objectContaining({ description: "{{price.ein}}", body: "{{price.itin}}" }),
      }),
    ]);
  });

  it("the admin reader keeps raw tokens so editing never bakes a price in", async () => {
    const post = await getPostIncludingDraft(TOKENISED);
    expect(post?.body).toContain("{{price.standard}}");
  });

  it("llms.txt and llms-guides.txt (built through the loader) carry rendered prices only", async () => {
    const [index, guides] = await Promise.all([buildLlmsTxt(), buildLlmsGuidesTxt()]);
    for (const text of [index, guides]) expect(text).not.toMatch(/\{\{|\}\}/);
    expect(guides).toContain(`pay us ${formatPrice(TIERS.standard.priceCents)} per Standard filing`);
  }, 30_000); // walks every post through the loader; slow under the full parallel suite
});
