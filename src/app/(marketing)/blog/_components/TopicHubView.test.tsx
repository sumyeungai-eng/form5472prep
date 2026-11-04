import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { POSTS_PER_PAGE } from "@/lib/blog-pagination";

vi.mock("@/lib/blog", () => ({
  formatPostDate: (d: string) => d,
  // blog-tags.ts imports slugify from the loader.
  slugify: (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
}));

import { resolveTopicPage, TopicHubView } from "./TopicHubView";

const posts = (tag: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({
    slug: `${tag}-${i}`,
    title: `${tag} ${i}`,
    description: "d",
    date: "2026-10-01",
    tags: [tag],
    readingMinutes: 3,
    image: `/blog/${tag}-${i}.webp`,
    imageAlt: "",
  })) as never[];

const render = (all: never[], tag: string, page: number) =>
  renderToStaticMarkup(createElement(TopicHubView, resolveTopicPage(all, tag, page)!));

describe("TopicHubView intro", () => {
  const all = posts("deadline", POSTS_PER_PAGE + 3);

  it("renders the intro on page 1 with its links as anchors, replacing the generic description", () => {
    const html = render(all, "deadline", 1);
    expect(html).toContain("<h2");
    expect(html).toContain("When is Form 5472 due?");
    expect(html).toContain('href="/form-5472-deadline"');
    expect(html).toContain('href="/blog/form-5472-extension-vs-late-filing"');
    expect(html).not.toContain("[Form 5472 deadline guide]");
    // The JSON-LD still carries the generic description; only the visible <p> is replaced.
    expect(html).not.toContain("owners.</p>");
  });

  it("leaves page 2 on the generic line with no intro", () => {
    const html = render(all, "deadline", 2);
    expect(html).not.toContain("When is Form 5472 due?");
    expect(html).toContain("Guides 25–27 of 27 on Deadline, newest first.");
  });

  it("keeps the generic description on hubs without an intro", () => {
    const html = render(posts("ein", 8), "ein", 1);
    expect(html).toContain("8 practical guides from Form5472 Prep on EIN");
  });
});
