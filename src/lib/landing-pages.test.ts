import { describe, expect, it } from "vitest";
import { parseLandingBody } from "./landing-body";
import { LANDING_PAGES } from "./landing-pages";

const questionHeadingPattern =
  /^(what|why|how|when|which|who|do|does|is|can|should)\b.*\?$/i;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function firstSentence(body: string) {
  const normalized = body.trim().replace(/\s+/g, " ");
  return normalized.match(/^(.+?[.!?])(?=\s|$)/)?.[1] ?? normalized;
}

describe("landing page question headings", () => {
  const sections = LANDING_PAGES.flatMap((page) =>
    page.sections.map((section) => ({ ...section, slug: page.slug })),
  );

  it("keeps at least 65 percent of section headings in question form", () => {
    const questionCount = sections.filter((section) =>
      questionHeadingPattern.test(section.heading),
    ).length;
    const ratio = questionCount / sections.length;

    process.stdout.write(
      `Landing page question-heading ratio: ${questionCount}/${sections.length} = ${(
        ratio * 100
      ).toFixed(1)}%\n`,
    );

    expect(ratio).toBeGreaterThanOrEqual(0.65);
  });

  it("keeps question-heading first sentences concise", () => {
    for (const section of sections) {
      if (!questionHeadingPattern.test(section.heading)) continue;

      const sentence = firstSentence(section.body);
      expect(wordCount(sentence), `${section.slug}: ${section.heading}`).toBeLessThanOrEqual(40);
      expect(sentence, `${section.slug}: ${section.heading}`).not.toMatch(
        /^(In this section|Below|Let's)/,
      );
    }
  });

  it("answers every question heading with a 40-60 word lead unless a list follows", () => {
    for (const section of sections) {
      const blocks = parseLandingBody(section.body);
      const message = `${section.slug}: ${section.heading}`;

      if (blocks[0]?.type === "p") {
        expect(wordCount(blocks[0].text), message).toBeLessThanOrEqual(80);
      }

      if (!section.heading.endsWith("?")) continue;

      if (blocks[0]?.type === "p" && (!blocks[1] || blocks[1].type === "p")) {
        expect(wordCount(blocks[0].text), message).toBeGreaterThanOrEqual(40);
        expect(wordCount(blocks[0].text), message).toBeLessThanOrEqual(60);
      }
    }
  });

  it("keeps every section heading within the length cap", () => {
    for (const section of sections) {
      expect(section.heading.length, `${section.slug}: ${section.heading}`).toBeLessThanOrEqual(
        70,
      );
    }
  });
});

describe("landing section tables", () => {
  it("keeps every section table snippet-shaped", () => {
    for (const page of LANDING_PAGES) {
      for (const section of page.sections) {
        const { table } = section;
        if (!table) continue;

        expect(table.caption.trim().length, `${page.slug}: ${section.heading} caption`).toBeGreaterThan(0);
        expect(table.columns.length, `${page.slug}: ${section.heading} columns`).toBeGreaterThanOrEqual(2);
        expect(table.columns.length, `${page.slug}: ${section.heading} columns`).toBeLessThanOrEqual(3);
        expect(table.rows.length, `${page.slug}: ${section.heading} rows`).toBeGreaterThanOrEqual(3);
        expect(table.rows.length, `${page.slug}: ${section.heading} rows`).toBeLessThanOrEqual(8);

        table.columns.forEach((column, columnIndex) => {
          expect(column.trim().length, `${page.slug}: ${section.heading} column ${columnIndex + 1}`).toBeGreaterThan(0);
          expect(wordCount(column), `${page.slug}: ${section.heading} column ${columnIndex + 1}`).toBeLessThanOrEqual(12);
        });

        table.rows.forEach((row, rowIndex) => {
          expect(row.length, `${page.slug}: ${section.heading} row ${rowIndex + 1}`).toBe(table.columns.length);

          row.forEach((cell, cellIndex) => {
            expect(cell.trim().length, `${page.slug}: ${section.heading} row ${rowIndex + 1} cell ${cellIndex + 1}`).toBeGreaterThan(0);
            expect(wordCount(cell), `${page.slug}: ${section.heading} row ${rowIndex + 1} cell ${cellIndex + 1}`).toBeLessThanOrEqual(12);
          });
        });
      }
    }
  });
});

describe("landing page intros", () => {
  it("keeps every intro between 40 and 60 words", () => {
    for (const page of LANDING_PAGES) {
      const count = wordCount(page.intro);

      expect(count, page.slug).toBeGreaterThanOrEqual(40);
      expect(count, page.slug).toBeLessThanOrEqual(60);
    }
  });
});
