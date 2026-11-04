import { describe, expect, it } from "vitest";
import { blogSlugFromHref, extractFaqs, extractQuestionHeadings, isPubliclyAvailable } from "./blog";

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

describe("extractQuestionHeadings", () => {
  it("returns each question H2 with the first paragraph under it, markdown stripped", () => {
    const body = [
      "## How much does an EIN cost?",
      "",
      "The IRS charges **nothing**. See the",
      "[IRS page](https://irs.gov/ein) for details.",
      "",
      "A second paragraph that must not be in the answer.",
      "",
      "## Can I apply online?",
      "",
      "No, foreign applicants fax Form SS-4.",
      "",
      "## What about an ITIN?",
      "",
      "A different number, for a different purpose.",
      "",
      "## The bottom line",
      "",
      "Not a question.",
    ].join("\n");
    expect(extractQuestionHeadings(body)).toEqual([
      { q: "How much does an EIN cost?", a: "The IRS charges nothing. See the IRS page for details." },
      { q: "Can I apply online?", a: "No, foreign applicants fax Form SS-4." },
      { q: "What about an ITIN?", a: "A different number, for a different purpose." },
    ]);
  });

  it("yields a single pair for one question H2 (the page needs two to emit)", () => {
    const body = "## Is it free?\n\nYes.\n\n## Summary\n\nDone.";
    expect(extractQuestionHeadings(body)).toEqual([{ q: "Is it free?", a: "Yes." }]);
  });

  it("skips a section whose first block is a list, table or code, and stops at any heading", () => {
    const body = [
      "## What do I need?",
      "",
      "- a passport",
      "- an address",
      "",
      "Trailing paragraph after the list.",
      "",
      "## Which form?",
      "",
      "| a | b |",
      "|---|---|",
      "",
      "## When is it due?",
      "",
      "### A subsection",
      "",
      "Belongs to the H3, not the question.",
      "",
      "## Who signs?",
      "",
      "The owner signs.",
    ].join("\n");
    expect(extractQuestionHeadings(body)).toEqual([{ q: "Who signs?", a: "The owner signs." }]);
  });

  it("ignores H3 questions and the FAQ heading itself", () => {
    const body = "## Frequently asked questions?\n\nIntro.\n\n### Is this a question?\n\nNo, an H3.";
    expect(extractQuestionHeadings(body)).toEqual([]);
  });

  it("completes a lead-in paragraph ending in a colon with the next list (max 6 items)", () => {
    const body = [
      "## What work does a paid service replace?",
      "",
      "A managed application can replace several tasks:",
      "",
      "- Fill in **Form SS-4**.",
      "- [Fax it](https://example.com) to the IRS.",
      "  - nested bullet that is skipped",
      "- Track the result,",
      "  then store the receipt.",
      "- Four.",
      "- Five.",
      "- Six; and",
      "- Seven.",
      "",
      "A closing paragraph that must not be included.",
      "",
      "## Which steps come first?",
      "",
      "Do these in order:",
      "1. Form the LLC.",
      "2. Apply for the EIN.",
    ].join("\n");
    expect(extractQuestionHeadings(body)).toEqual([
      {
        q: "What work does a paid service replace?",
        a: "A managed application can replace several tasks: Fill in Form SS-4; Fax it to the IRS; Track the result, then store the receipt; Four; Five; Six.",
      },
      { q: "Which steps come first?", a: "Do these in order: Form the LLC; Apply for the EIN." },
    ]);
  });
});
