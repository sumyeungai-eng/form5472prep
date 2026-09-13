import { describe, expect, it } from "vitest";
import { orderedListItems, parseLandingBody } from "./landing-body";
import { LANDING_PAGES } from "./landing-pages";

const legacyOrderedListItems = (body: string) => {
  const items: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const item = current.join(" ").replace(/\s+/g, " ").trim();
    if (item) items.push(item);
    current = [];
  };

  for (const line of body.split("\n")) {
    const itemStart = line.match(/^\s*\d+\.\s+(.+)$/);
    if (itemStart) {
      if (current.length > 0) flush();
      current = [itemStart[1]];
    } else if (current.length > 0) {
      if (line.trim() === "") {
        flush();
      } else {
        current.push(line.trim());
      }
    }
  }
  if (current.length > 0) flush();

  return items;
};

describe("landing body parsing", () => {
  it("matches legacy ordered list extraction for every landing page section", () => {
    let count = 0;

    for (const page of LANDING_PAGES) {
      for (const section of page.sections) {
        count += 1;
        expect(orderedListItems(section.body), `${page.slug}: ${section.heading}`).toEqual(
          legacyOrderedListItems(section.body),
        );
      }
    }

    process.stdout.write(`Compared ${count} landing page sections for ordered-list parity.\n`);
    expect(count).toBeGreaterThan(200);
  });

  it("parses the file-form-5472 step-by-step section as one ordered list", () => {
    const page = LANDING_PAGES.find((landingPage) => landingPage.slug === "file-form-5472");
    expect(page).toBeDefined();

    const section = page?.sections[2];
    expect(section?.heading).toBe("How do you file Form 5472 step by step?");

    const blocks = parseLandingBody(section?.body ?? "");

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.type).toBe("ol");
    const items = blocks[0]?.type === "ol" ? blocks[0].items : [];
    expect(items).toHaveLength(8);
    expect(items[0]).toMatch(/^Gather your LLC info/);
  });

  it("parses the real filing example with prose before a five-item unordered list", () => {
    const page = LANDING_PAGES.find((landingPage) => landingPage.slug === "file-form-5472");
    expect(page).toBeDefined();

    const section = page?.sections[5];
    expect(section?.heading).toBe("What does a real Form 5472 filing look like?");

    const blocks = parseLandingBody(section?.body ?? "");
    const unorderedBlockIndex = blocks.findIndex((block) => block.type === "ul");

    expect(unorderedBlockIndex).toBeGreaterThan(0);
    expect(blocks.slice(0, unorderedBlockIndex).some((block) => block.type === "p")).toBe(true);
    expect(
      blocks[unorderedBlockIndex]?.type === "ul" ? blocks[unorderedBlockIndex].items : [],
    ).toHaveLength(5);
  });

  it("parses two prose paragraphs without lists", () => {
    const body = "First paragraph line one.\nFirst paragraph line two.\n\nSecond paragraph.";

    expect(parseLandingBody(body)).toEqual([
      { type: "p", text: "First paragraph line one.\nFirst paragraph line two." },
      { type: "p", text: "Second paragraph." },
    ]);
  });

  it("leaves inline link syntax untouched in paragraph text", () => {
    const body = "File [Form 7004](/form-5472-deadline) before the original due date.";

    expect(parseLandingBody(body)).toEqual([
      {
        type: "p",
        text: "File [Form 7004](/form-5472-deadline) before the original due date.",
      },
    ]);
  });

  it("keeps leading prose before an ordered list in the same chunk", () => {
    const body = "The package is:\n1. A\n2. B\n3. C";

    expect(parseLandingBody(body)).toEqual([
      { type: "p", text: "The package is:" },
      { type: "ol", items: ["A", "B", "C"] },
    ]);
  });
});
