import { describe, expect, it } from "vitest";
import { deriveHowTo, IMPERATIVE_VERBS, stepName } from "./landing-howto";
import type { LandingPage } from "./landing-pages";

function mockPage(overrides: Partial<LandingPage> = {}): LandingPage {
  return {
    slug: "mock-page",
    title: "Mock Page",
    metaDescription: "Mock meta description.",
    h1: "Mock Page",
    intro: "Mock intro.",
    keyword: "mock keyword",
    sections: [
      {
        heading: "Overview",
        body: "Plain overview paragraph.",
      },
    ],
    faqs: [],
    ...overrides,
  };
}

describe("stepName", () => {
  it("uses concise text before a colon", () => {
    expect(
      stepName("Gather your LLC info: legal name as registered with the state, EIN, US address"),
    ).toBe("Gather your LLC info");
  });

  it("trims a long sentence without a colon to at most 12 words", () => {
    const result = stepName(
      "Gather every annual filing record before you start because missing ownership details can slow the review and create preventable rework.",
    );

    expect(result.split(/\s+/)).toHaveLength(12);
    expect(result).not.toMatch(/[.,;:!?]$/);
  });

  it("falls back when pre-colon text is longer than eight words", () => {
    expect(
      stepName(
        "Gather every annual filing record before you start with the owner: legal name and address.",
      ),
    ).toBe("Gather every annual filing record before you start with the owner: legal");
  });
});

describe("IMPERATIVE_VERBS", () => {
  it("contains process verbs without common filler words", () => {
    expect(IMPERATIVE_VERBS.has("gather")).toBe(true);
    expect(IMPERATIVE_VERBS.has("fax")).toBe(true);
    expect(IMPERATIVE_VERBS.has("keep")).toBe(true);
    expect(IMPERATIVE_VERBS.has("preserve")).toBe(true);
    expect(IMPERATIVE_VERBS.has("confirm")).toBe(true);
    expect(IMPERATIVE_VERBS.has("your")).toBe(false);
    expect(IMPERATIVE_VERBS.has("the")).toBe(false);
  });
});

describe("deriveHowTo", () => {
  it("returns null when howTo is undefined", () => {
    expect(deriveHowTo(mockPage())).toBeNull();
  });

  it("returns null when the configured section does not match", () => {
    expect(deriveHowTo(mockPage({ howTo: { section: "Nonexistent" } }))).toBeNull();
  });

  it("returns null when the matched section has no ordered list", () => {
    const page = mockPage({
      howTo: { section: "How do you do X?" },
      sections: [
        {
          heading: "How do you do X?",
          body: "Read this first.\n\n- Gather A\n- Fill B",
        },
      ],
    });

    expect(deriveHowTo(page)).toBeNull();
  });

  it("derives steps from the first ordered list in the configured section", () => {
    const page = mockPage({
      howTo: {
        section: "How do you do X?",
        tools: ["A tool"],
        supplies: ["A supply"],
      },
      sections: [
        {
          heading: "Overview",
          body: "Plain overview paragraph.",
        },
        {
          heading: "How do you do X?",
          body: "1. Gather A: detail.\n2. Fill B.\n3. Confirm C.",
        },
      ],
    });

    expect(deriveHowTo(page)).toEqual({
      sectionIndex: 1,
      steps: [
        { name: "Gather A", text: "Gather A: detail.", anchor: "#step-1" },
        { name: "Fill B", text: "Fill B.", anchor: "#step-2" },
        { name: "Confirm C", text: "Confirm C.", anchor: "#step-3" },
      ],
      tools: ["A tool"],
      supplies: ["A supply"],
      totalTime: undefined,
      cost: undefined,
    });
  });
});
