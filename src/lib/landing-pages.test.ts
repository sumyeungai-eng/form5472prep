import { describe, expect, it } from "vitest";
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

  it("keeps every section heading within the length cap", () => {
    for (const section of sections) {
      expect(section.heading.length, `${section.slug}: ${section.heading}`).toBeLessThanOrEqual(
        70,
      );
    }
  });
});
