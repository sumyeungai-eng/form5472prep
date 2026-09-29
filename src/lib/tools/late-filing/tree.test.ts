import { describe, expect, it } from "vitest";
import { PENALTY_PER_FORM_CENTS } from "@/lib/penalty";
import { MULTI_YEAR_ADDON_CENTS, TIERS } from "@/lib/pricing";
import { ANSWER_FIRST, FAQS, wordCount } from "./content";
import { SOURCES } from "./sources";
import {
  OUTCOME_IDS,
  OUTCOMES,
  QUESTIONS,
  QUESTION_ORDER,
  START,
  answersToQuery,
  canonicalAnswers,
  evaluate,
  initialExposureCents,
  lateYears,
  packagePriceCents,
  parseAnswers,
  withoutLastAnswer,
  type Answers,
  type OutcomeId,
} from "./tree";

// Every combination of one valid answer per question (3 * 4 * 3 * 4 * 3 = 432).
function allFullCombinations(): Answers[] {
  let combos: Answers[] = [{}];
  for (const id of QUESTION_ORDER) {
    const next: Answers[] = [];
    for (const combo of combos) {
      for (const option of QUESTIONS[id].options) next.push({ ...combo, [id]: option.value });
    }
    combos = next;
  }
  return combos;
}

function outcomeOf(answers: Answers): OutcomeId {
  const step = evaluate(answers);
  if (step.kind !== "outcome") throw new Error(`expected an outcome, got question ${step.question}`);
  return step.outcome;
}

describe("late-filing tree structure", () => {
  it("every option points at a real question or outcome", () => {
    for (const id of QUESTION_ORDER) {
      const question = QUESTIONS[id];
      expect(question.id).toBe(id);
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      const values = question.options.map((o) => o.value);
      expect(new Set(values).size).toBe(values.length);
      for (const option of question.options) {
        if ("question" in option.next) expect(QUESTIONS[option.next.question]).toBeDefined();
        else expect(OUTCOMES[option.next.outcome]).toBeDefined();
      }
    }
  });

  it("asks between 4 and 7 questions on the longest path", () => {
    expect(QUESTION_ORDER.length).toBeGreaterThanOrEqual(4);
    expect(QUESTION_ORDER.length).toBeLessThanOrEqual(7);
    const longest = Math.max(...allFullCombinations().map((a) => evaluate(a).path.length));
    expect(longest).toBe(QUESTION_ORDER.length);
  });

  it("starts at the exam question", () => {
    expect(START).toBe("exam");
    expect(evaluate({})).toEqual({ kind: "question", question: "exam", path: [] });
  });
});

describe("evaluate: exhaustive", () => {
  const combos = allFullCombinations();

  it("covers 432 combinations", () => {
    expect(combos).toHaveLength(432);
  });

  it("every full answer combination reaches exactly one outcome", () => {
    for (const answers of combos) {
      const step = evaluate(answers);
      expect(step.kind).toBe("outcome");
      if (step.kind === "outcome") expect(OUTCOME_IDS).toContain(step.outcome);
      // Deterministic: same input, same outcome.
      expect(evaluate(answers)).toEqual(step);
    }
  });

  it("every outcome is reachable", () => {
    const reached = new Set(combos.map(outcomeOf));
    expect(Array.from(reached).sort()).toEqual([...OUTCOME_IDS].sort());
  });

  it("answers off the path never change the outcome", () => {
    for (const answers of combos) {
      expect(outcomeOf(canonicalAnswers(answers))).toBe(outcomeOf(answers));
    }
  });
});

describe("evaluate: key combinations", () => {
  const diirspBase = { exam: "no", notice: "no", tax: "no", years: "3" } as const;

  it("under exam wins over everything else", () => {
    expect(outcomeOf({ exam: "yes" })).toBe("exam-or-investigation");
    expect(outcomeOf({ exam: "yes", notice: "penalty", tax: "yes", years: "1", reason: "yes" })).toBe(
      "exam-or-investigation",
    );
  });

  it("any 'not sure' on exam, notice or tax routes to a review", () => {
    expect(outcomeOf({ exam: "unsure" })).toBe("needs-review");
    expect(outcomeOf({ exam: "no", notice: "unsure" })).toBe("needs-review");
    expect(outcomeOf({ exam: "no", notice: "no", tax: "unsure" })).toBe("needs-review");
  });

  it("IRS contact routes away from DIIRSP", () => {
    expect(outcomeOf({ exam: "no", notice: "penalty" })).toBe("penalty-assessed");
    expect(outcomeOf({ exam: "no", notice: "letter" })).toBe("irs-letter-no-penalty");
    expect(outcomeOf({ exam: "no", notice: "penalty", tax: "no", years: "2", reason: "yes" })).toBe(
      "penalty-assessed",
    );
  });

  it("unreported tax routes to a different programme", () => {
    expect(outcomeOf({ exam: "no", notice: "no", tax: "yes" })).toBe("unreported-tax");
  });

  it("the brief's example URL stops at the reasonable-cause question", () => {
    const answers = parseAnswers("?notice=no&exam=no&tax=no&years=3");
    expect(evaluate(answers)).toEqual({
      kind: "question",
      question: "reason",
      path: ["exam", "notice", "tax", "years"],
    });
  });

  it("DIIRSP outcomes depend on the reasonable-cause answer", () => {
    expect(outcomeOf({ ...diirspBase, reason: "yes" })).toBe("diirsp-reasonable-cause");
    expect(outcomeOf({ ...diirspBase, reason: "unsure" })).toBe("diirsp-cause-unclear");
    expect(outcomeOf({ ...diirspBase, reason: "no" })).toBe("diirsp-no-reasonable-cause");
  });

  it("the number of late years never changes the route", () => {
    for (const years of ["1", "2", "3", "4plus"]) {
      expect(outcomeOf({ ...diirspBase, years, reason: "yes" })).toBe("diirsp-reasonable-cause");
    }
  });

  it("partial answers return the next question in order", () => {
    expect(evaluate({ exam: "no" })).toMatchObject({ kind: "question", question: "notice" });
    expect(evaluate({ exam: "no", notice: "no" })).toMatchObject({ kind: "question", question: "tax" });
    expect(evaluate({ exam: "no", notice: "no", tax: "no" })).toMatchObject({
      kind: "question",
      question: "years",
    });
  });

  it("an invalid answer is treated as unanswered", () => {
    expect(evaluate({ exam: "maybe" })).toMatchObject({ kind: "question", question: "exam" });
    expect(evaluate({ exam: "no", notice: "YES" })).toMatchObject({ kind: "question", question: "notice" });
  });
});

describe("shareable URL codec", () => {
  it("drops unknown keys, invalid values and off-path answers", () => {
    expect(parseAnswers("exam=no&notice=bogus&tax=no&foo=bar")).toEqual({ exam: "no" });
    expect(parseAnswers("exam=yes&notice=no&tax=no")).toEqual({ exam: "yes" });
    expect(parseAnswers("")).toEqual({});
  });

  it("round-trips every combination", () => {
    for (const answers of allFullCombinations()) {
      const canonical = canonicalAnswers(answers);
      expect(parseAnswers(answersToQuery(answers))).toEqual(canonical);
    }
  });

  it("writes answers in question order and keeps unrelated params", () => {
    const query = answersToQuery(
      { reason: "yes", years: "4plus", tax: "no", notice: "no", exam: "no" },
      "?utm_source=chatgpt&exam=yes",
    );
    expect(query).toBe("utm_source=chatgpt&exam=no&notice=no&tax=no&years=4plus&reason=yes");
  });

  it("clears our params when all answers are removed", () => {
    expect(answersToQuery({}, "exam=no&notice=no&gclid=abc")).toBe("gclid=abc");
  });

  it("Back removes the latest answer on the path", () => {
    const full = { exam: "no", notice: "no", tax: "no", years: "2", reason: "no" };
    expect(withoutLastAnswer(full)).toEqual({ exam: "no", notice: "no", tax: "no", years: "2" });
    expect(withoutLastAnswer({ exam: "yes", notice: "no" })).toEqual({});
    expect(withoutLastAnswer({})).toEqual({});
  });
});

describe("late-years figures", () => {
  it("reads years only when on the path", () => {
    expect(lateYears({ exam: "no", notice: "no", tax: "no", years: "3" })).toEqual({ count: 3, orMore: false });
    expect(lateYears({ exam: "no", notice: "no", tax: "no", years: "4plus" })).toEqual({ count: 4, orMore: true });
    expect(lateYears({ exam: "yes", years: "3" })).toBeNull();
  });

  it("uses the shared penalty and pricing constants", () => {
    const three = { count: 3, orMore: false };
    expect(initialExposureCents(three)).toBe(PENALTY_PER_FORM_CENTS * 3);
    expect(packagePriceCents({ count: 1, orMore: false })).toBe(TIERS.standard.priceCents);
    expect(packagePriceCents(three)).toBe(TIERS.standard.priceCents + 2 * MULTI_YEAR_ADDON_CENTS);
  });
});

describe("outcome copy: accuracy guard", () => {
  const banned = [
    /guarantee/i,
    /\bwaive/i,
    /\bCPA\b/,
    /IRS[- ]approved/i,
    /will be (abated|removed|forgiven)/i,
    /penalty[- ]free/i,
    /no penalty will/i,
  ];

  function outcomeText(id: OutcomeId): string {
    const o = OUTCOMES[id];
    return [o.route, o.appliesWhen, ...o.meaning, o.submitHeading, ...o.submit, o.risk].join(" ");
  }

  it("no outcome promises relief or claims credentials", () => {
    for (const id of OUTCOME_IDS) {
      for (const pattern of banned) expect(outcomeText(id)).not.toMatch(pattern);
    }
  });

  it("every outcome cites at least one primary source", () => {
    for (const id of OUTCOME_IDS) {
      const sources = OUTCOMES[id].sources;
      expect(sources.length).toBeGreaterThan(0);
      for (const sourceId of sources) {
        expect(SOURCES[sourceId].url).toMatch(/^https:\/\/(www\.irs\.gov|www\.ecfr\.gov|www\.law\.cornell\.edu)\//);
      }
    }
  });

  it("every DIIRSP outcome carries the 'penalties may be assessed' warning and cites the DIIRSP page", () => {
    for (const id of ["diirsp-reasonable-cause", "diirsp-cause-unclear"] as const) {
      expect(OUTCOMES[id].risk).toMatch(/penalties may be assessed/i);
      expect(OUTCOMES[id].sources).toContain("diirsp");
      expect(OUTCOMES[id].cta).toBe("start");
    }
  });

  it("routes outside DIIRSP never send the visitor straight to checkout", () => {
    for (const id of OUTCOME_IDS) {
      if (!id.startsWith("diirsp-") || id === "diirsp-no-reasonable-cause") {
        expect(OUTCOMES[id].cta).not.toBe("start");
      }
    }
  });
});

describe("page content", () => {
  it("has 4 to 6 FAQs, each answer 50 words or fewer", () => {
    expect(FAQS.length).toBeGreaterThanOrEqual(4);
    expect(FAQS.length).toBeLessThanOrEqual(6);
    for (const faq of FAQS) expect(wordCount(faq.a)).toBeLessThanOrEqual(50);
  });

  it("the answer-first lead is honest about penalties", () => {
    expect(ANSWER_FIRST).toMatch(/Penalties may still be assessed/);
  });
});
