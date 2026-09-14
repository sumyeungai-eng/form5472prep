import { describe, expect, it } from "vitest";
import { parseLandingBody } from "./landing-body";
import { deriveHowTo, IMPERATIVE_VERBS, stepName } from "./landing-howto";
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

describe("landing page howTo derivation", () => {
  const howToSlugs = [
    "file-form-5472",
    "diirsp",
    "late-form-5472",
    "wyoming-llc-form-5472",
    "delaware-llc-form-5472",
    "form-5472-germany",
    "form-5472-uae",
    "irs-form-5472",
    "form-5472-deadline",
    "form-5472-fax-number",
    "pro-form-5472",
  ] as const;
  const howToSlugSet = new Set<string>(howToSlugs);
  const pagesWithHowTo = LANDING_PAGES.filter((page) => page.howTo);

  it("points each howTo config at exactly one section", () => {
    for (const page of pagesWithHowTo) {
      const matchingSections = page.sections.filter(
        (section) => section.heading === page.howTo?.section,
      );

      expect(matchingSections, page.slug).toHaveLength(1);
    }
  });

  it("derives at least three steps for every configured howTo", () => {
    for (const page of pagesWithHowTo) {
      const derived = deriveHowTo(page);

      expect(derived, page.slug).not.toBeNull();
      expect(derived?.steps.length, page.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("starts every derived step name with a supported imperative verb", () => {
    for (const page of pagesWithHowTo) {
      const derived = deriveHowTo(page);

      expect(derived, page.slug).not.toBeNull();

      for (const step of derived?.steps ?? []) {
        const derivedName = stepName(step.text);
        expect(step.name, `${page.slug}: ${step.text}`).toBe(derivedName);

        const firstWord = derivedName
          .split(/\s+/)[0]
          .toLowerCase()
          .replace(/[,:]+$/, "");

        expect(IMPERATIVE_VERBS.has(firstWord), `${page.slug}: ${derivedName}`).toBe(true);
      }
    }
  });

  it("ends every configured howTo with a verification-style step", () => {
    for (const page of pagesWithHowTo) {
      const derived = deriveHowTo(page);
      const lastStep = derived?.steps.at(-1);

      expect(lastStep?.text, page.slug).toMatch(/keep|receipt|confirm|verify|check|record|preserve/i);
    }
  });

  it("keeps howTo tools and supplies snippet-sized", () => {
    for (const page of pagesWithHowTo) {
      for (const tool of page.howTo?.tools ?? []) {
        expect(wordCount(tool), `${page.slug}: ${tool}`).toBeLessThanOrEqual(6);
      }

      for (const supply of page.howTo?.supplies ?? []) {
        expect(wordCount(supply), `${page.slug}: ${supply}`).toBeLessThanOrEqual(6);
      }
    }
  });

  it("uses ISO-8601 minute or hour durations when totalTime is present", () => {
    for (const page of pagesWithHowTo) {
      if (!page.howTo?.totalTime) continue;

      expect(page.howTo.totalTime, page.slug).toMatch(/^PT\d+[HM]/);
    }
  });

  it("only configures howTo for the phase B process pages", () => {
    for (const page of LANDING_PAGES) {
      if (howToSlugSet.has(page.slug)) {
        expect(page.howTo, page.slug).toBeDefined();
      } else {
        expect(page.howTo, page.slug).toBeUndefined();
      }
    }
  });
});
