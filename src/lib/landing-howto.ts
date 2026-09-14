import { parseLandingBody } from "./landing-body";
import type { LandingHowTo, LandingPage } from "./landing-pages";

export const IMPERATIVE_VERBS: ReadonlySet<string> = new Set([
  "enter",
  "gather",
  "fill",
  "add",
  "build",
  "sign",
  "fax",
  "complete",
  "submit",
  "confirm",
  "review",
  "pay",
  "upload",
  "choose",
  "check",
  "send",
  "keep",
  "answer",
  "provide",
  "verify",
  "receive",
  "download",
  "attach",
  "prepare",
  "wait",
  "file",
  "request",
  "mail",
  "stamp",
  "calculate",
  "list",
  "report",
  "open",
  "collect",
  "select",
  "apply",
  "create",
  "scan",
  "print",
  "type",
  "write",
  "get",
  "make",
  "start",
  "finish",
  "record",
  "save",
  "note",
  "tell",
  "give",
  "run",
  "compare",
  "decide",
  "let",
  "track",
  "use",
  "approve",
  "authorize",
  "email",
  "phone",
  "call",
  "read",
  "pick",
  "store",
  "hold",
  "retain",
  "have",
  "preserve",
  "set",
  "monitor",
]);

const trailingPunctuationPattern = /[\s.,;:!?]+$/;

function stripTrailingPunctuation(text: string): string {
  return text.trim().replace(trailingPunctuationPattern, "");
}

function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function firstSentence(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  const match = normalized.match(/^(.+?[.!?])(?=\s|$)/);
  return match?.[1] ?? normalized;
}

function trimToWordLimit(text: string, limit: number): string {
  return words(text).slice(0, limit).join(" ");
}

export function stepName(item: string): string {
  const colonIndex = item.indexOf(":");

  if (colonIndex > 0) {
    const lead = stripTrailingPunctuation(item.slice(0, colonIndex));

    if (words(lead).length <= 8) {
      return lead;
    }
  }

  return stripTrailingPunctuation(trimToWordLimit(firstSentence(item), 12));
}

export type DerivedHowToStep = { name: string; text: string; anchor: string };
export type DerivedHowTo = {
  sectionIndex: number;
  steps: DerivedHowToStep[];
  tools?: string[];
  supplies?: string[];
  totalTime?: string;
  cost?: LandingHowTo["cost"];
};

export function deriveHowTo(page: LandingPage): DerivedHowTo | null {
  if (!page.howTo) {
    return null;
  }

  const sectionIndex = page.sections.findIndex((section) => section.heading === page.howTo?.section);

  if (sectionIndex < 0) {
    return null;
  }

  const section = page.sections[sectionIndex];
  const orderedList = parseLandingBody(section.body).find(
    (block): block is { type: "ol"; items: string[] } => block.type === "ol",
  );

  if (!orderedList || orderedList.items.length < 1) {
    return null;
  }

  return {
    sectionIndex,
    steps: orderedList.items.map((item, index) => ({
      name: stepName(item),
      text: item,
      anchor: `#step-${index + 1}`,
    })),
    tools: page.howTo.tools,
    supplies: page.howTo.supplies,
    totalTime: page.howTo.totalTime,
    cost: page.howTo.cost,
  };
}
