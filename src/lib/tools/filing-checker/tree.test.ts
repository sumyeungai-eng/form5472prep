import { describe, expect, it } from "vitest";
import { SOURCES } from "./sources";
import {
  NODES,
  QUESTION_PARAMS,
  START,
  answersToQuery,
  canonicalAnswers,
  parseAnswers,
  walk,
  withAnswer,
  withoutLastAnswer,
  type Answers,
  type NodeId,
} from "./tree";

// Every complete path through the tree: the answers taken and the result reached.
function allPaths(): Array<{ answers: Answers; result: NodeId }> {
  const out: Array<{ answers: Answers; result: NodeId }> = [];
  function visit(nodeId: NodeId, answers: Answers) {
    const node = NODES[nodeId];
    if (node.kind === "result") {
      out.push({ answers, result: nodeId });
      return;
    }
    for (const option of node.options) visit(option.next, { ...answers, [node.param]: option.value });
  }
  visit(START, {});
  return out;
}

describe("filing-checker tree structure", () => {
  it("every option points at a real node, with unique query keys and values", () => {
    const params = new Set<string>();
    for (const node of Object.values(NODES)) {
      if (node.kind !== "question") continue;
      expect(params.has(node.param)).toBe(false);
      params.add(node.param);
      expect(node.param).toMatch(/^[a-z]{2,8}$/);
      const values = node.options.map((o) => o.value);
      expect(new Set(values).size).toBe(values.length);
      for (const option of node.options) {
        expect(option.value).toMatch(/^[a-z]{2,8}$/);
        expect(NODES[option.next]).toBeDefined();
      }
    }
    expect(Array.from(params)).toEqual(Array.from(QUESTION_PARAMS));
  });

  it("every result is reachable and cites at least one known source", () => {
    const reached = new Set(allPaths().map((p) => p.result));
    for (const node of Object.values(NODES)) {
      if (node.kind !== "result") continue;
      expect(reached.has(node.id)).toBe(true);
      expect(node.sources.length).toBeGreaterThan(0);
      for (const id of node.sources) expect(SOURCES[id]).toBeDefined();
    }
  });

  // Pins the routing so the shareable-URL refactor can't change any result.
  it("keeps the original answer → result routing", () => {
    const routes = Object.fromEntries(allPaths().map((p) => [answersToQuery(p.answers), p.result]));
    expect(routes).toEqual({
      "llc=no": "no-us-llc",
      "llc=yes&owners=multi": "multi-member-different-rules",
      "llc=yes&owners=one&owner=us": "us-owned-no-filing",
      "llc=yes&owners=one&owner=foreign&corp=yes": "corp-election-different-rules",
      "llc=yes&owners=one&owner=foreign&corp=no&existed=no": "not-formed-no-filing",
      "llc=yes&owners=one&owner=foreign&corp=no&existed=yes&moved=yes":
        "must-file-reportable-transaction",
      "llc=yes&owners=one&owner=foreign&corp=no&existed=yes&moved=no": "protective-filing",
      "llc=yes&owners=one&owner=foreign&corp=no&existed=yes&moved=unsure":
        "uncertain-transactions",
    });
  });
});

describe("filing-checker shareable URL", () => {
  it("round-trips every complete path and every partial path", () => {
    for (const { answers, result } of allPaths()) {
      const query = answersToQuery(answers);
      expect(parseAnswers(query)).toEqual(answers);
      expect(walk(parseAnswers(`?${query}`)).current).toBe(result);

      // Each prefix of the path is a shareable "question N" state too.
      const steps = walk(answers).path;
      for (let n = 0; n < steps.length; n += 1) {
        const prefix: Answers = {};
        for (const step of steps.slice(0, n)) prefix[step.param] = step.value;
        const parsed = parseAnswers(answersToQuery(prefix));
        expect(parsed).toEqual(prefix);
        expect(walk(parsed).current).toBe(steps[n].nodeId);
      }
    }
  });

  it("an empty or unrelated query starts at the first question", () => {
    expect(parseAnswers("")).toEqual({});
    expect(walk(parseAnswers("?utm_source=x")).current).toBe(START);
  });

  it("falls back to the last valid question when a value is invalid", () => {
    expect(walk(parseAnswers("llc=maybe")).current).toBe(START);
    const stopped = parseAnswers("llc=yes&owners=three&owner=foreign&moved=yes");
    expect(stopped).toEqual({ llc: "yes" });
    expect(walk(stopped).current).toBe("owner-count");
  });

  it("drops answers that are not on the path the tree follows", () => {
    // owners=multi ends the walk, so the later answers must not survive.
    expect(parseAnswers("llc=yes&owners=multi&owner=foreign&moved=yes")).toEqual({
      llc: "yes",
      owners: "multi",
    });
    // An answer for a later question without the earlier ones is ignored.
    expect(parseAnswers("moved=yes")).toEqual({});
  });

  it("tolerates case and whitespace, and keeps unrelated params", () => {
    expect(parseAnswers("llc=YES&owners=%20one%20")).toEqual({ llc: "yes", owners: "one" });
    expect(answersToQuery({ llc: "yes", owners: "one" }, "?utm_source=news&llc=no&moved=yes")).toBe(
      "utm_source=news&llc=yes&owners=one",
    );
    expect(answersToQuery({}, "utm_source=news&llc=no")).toBe("utm_source=news");
  });

  it("answering and going back keep the answers canonical", () => {
    let answers: Answers = {};
    answers = withAnswer(answers, "has-us-llc", "yes");
    answers = withAnswer(answers, "owner-count", "one");
    answers = withAnswer(answers, "foreign-owner", "foreign");
    expect(walk(answers).current).toBe("corporate-election");

    answers = withoutLastAnswer(answers);
    expect(answers).toEqual({ llc: "yes", owners: "one" });
    expect(walk(answers).current).toBe("foreign-owner");

    answers = withAnswer(answers, "foreign-owner", "us");
    expect(walk(answers).current).toBe("us-owned-no-filing");

    // Going back from a result reopens its question.
    expect(walk(withoutLastAnswer(answers)).current).toBe("foreign-owner");
    expect(withoutLastAnswer({})).toEqual({});
    // A value that is not an option leaves the state unchanged.
    expect(withAnswer({ llc: "yes" }, "owner-count", "seven")).toEqual({ llc: "yes" });
    expect(canonicalAnswers({ llc: "yes", corp: "yes" })).toEqual({ llc: "yes" });
  });
});
