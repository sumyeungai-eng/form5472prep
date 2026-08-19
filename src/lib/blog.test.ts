import { describe, expect, it } from "vitest";
import { blogSlugFromHref, extractFaqs, isPubliclyAvailable } from "./blog";

describe("isPubliclyAvailable", () => {
  const now = new Date("2026-07-27T13:00:00.000Z");

  it("keeps drafts private even after their release time", () => {
    expect(
      isPubliclyAvailable(
        { draft: true, publishAt: "2026-07-27T09:00:00-04:00" },
        now,
      ),
    ).toBe(false);
  });

  it("keeps a scheduled post private before its release time", () => {
    expect(
      isPubliclyAvailable(
        { draft: false, publishAt: "2026-07-27T09:00:01-04:00" },
        now,
      ),
    ).toBe(false);
  });

  it("publishes at the exact scheduled instant", () => {
    expect(
      isPubliclyAvailable(
        { draft: false, publishAt: "2026-07-27T09:00:00-04:00" },
        now,
      ),
    ).toBe(true);
  });

  it("continues to publish older posts without a schedule", () => {
    expect(isPubliclyAvailable({ draft: false }, now)).toBe(true);
  });
});

describe("blogSlugFromHref", () => {
  it.each([
    ["/blog/foo", "foo"],
    ["/blog/foo/", "foo"],
    ["/blog/foo?utm=x#h", "foo"],
    ["/blog", null],
    ["/blog/", null],
    ["/start", null],
    ["https://www.form5472prep.com/blog/foo", null],
    [undefined, null],
  ])("parses %s as %s", (href, expected) => {
    expect(blogSlugFromHref(href)).toBe(expected);
  });
});

describe("extractFaqs", () => {
  it("stops the FAQ section at a horizontal rule, not just the next H2", () => {
    const body = [
      "## Frequently asked questions",
      "",
      "### Do I need an EIN?",
      "",
      "Yes. The LLC needs its own EIN.",
      "",
      "---",
      "",
      "The bottom line: file it.",
      "",
      "[File it here](/start?utm_source=blog)",
    ].join("\n");
    expect(extractFaqs(body)).toEqual([
      { q: "Do I need an EIN?", a: "Yes. The LLC needs its own EIN." },
    ]);
  });

  it("caps an answer at its first paragraph when the FAQ is the last section", () => {
    const body = [
      "## FAQ",
      "",
      "**Is a dormant LLC exempt?**",
      "",
      "No. A capital contribution is still a reportable transaction.",
      "",
      "Filing takes about fifteen minutes and costs $149.",
    ].join("\n");
    expect(extractFaqs(body)).toEqual([
      {
        q: "Is a dormant LLC exempt?",
        a: "No. A capital contribution is still a reportable transaction.",
      },
    ]);
  });

  it("still extracts every question and is unaffected by the blank line under a heading", () => {
    const body = [
      "## Common questions",
      "",
      "### First?",
      "",
      "Answer one.",
      "",
      "### Second?",
      "",
      "Answer two.",
      "",
      "## The bottom line",
      "",
      "Trailing prose that must not appear in any answer.",
    ].join("\n");
    expect(extractFaqs(body)).toEqual([
      { q: "First?", a: "Answer one." },
      { q: "Second?", a: "Answer two." },
    ]);
  });
});
