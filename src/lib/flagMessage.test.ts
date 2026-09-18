import { describe, expect, it } from "vitest";
import { FLAG_NOTE_MAX, buildFlagMessage } from "./flagMessage";

const SHOWN =
  "We've recorded this as a timely filing under your Form 7004 extension, due October 15, 2026.";

const PREFIX =
  "Customer flagged from the tax-years step: the late/timely determination shown does not match their situation. Shown: " +
  SHOWN;

describe("buildFlagMessage", () => {
  it("returns the fixed sentence alone when no note is given", () => {
    expect(buildFlagMessage(SHOWN)).toBe(PREFIX);
    expect(buildFlagMessage(SHOWN, undefined)).toBe(PREFIX);
    expect(buildFlagMessage(SHOWN, null)).toBe(PREFIX);
  });

  it("returns the fixed sentence alone for an empty note", () => {
    expect(buildFlagMessage(SHOWN, "")).toBe(PREFIX);
  });

  it("returns the fixed sentence alone for a whitespace-only note", () => {
    expect(buildFlagMessage(SHOWN, "   \n\t  ")).toBe(PREFIX);
  });

  it("appends a normal note after a single newline with the 'They added: ' prefix", () => {
    const note = "My accountant e-filed the 7004 on March 12.";
    expect(buildFlagMessage(SHOWN, note)).toBe(`${PREFIX}\nThey added: ${note}`);
  });

  it("trims surrounding whitespace from the note", () => {
    const note = "  The LLC dissolved in June.  \n";
    expect(buildFlagMessage(SHOWN, note)).toBe(
      `${PREFIX}\nThey added: The LLC dissolved in June.`,
    );
  });

  it("collapses runs of 3+ newlines inside the note down to 2", () => {
    const note = "Line one\n\n\n\nLine two";
    expect(buildFlagMessage(SHOWN, note)).toBe(`${PREFIX}\nThey added: Line one\n\nLine two`);
  });

  it("truncates a note longer than FLAG_NOTE_MAX characters", () => {
    const longNote = "a".repeat(600);
    const result = buildFlagMessage(SHOWN, longNote);
    expect(result).toBe(`${PREFIX}\nThey added: ${"a".repeat(FLAG_NOTE_MAX)}`);
    expect(result.length).toBe(PREFIX.length + "\nThey added: ".length + FLAG_NOTE_MAX);
  });

  it("preserves the fixed prefix and shown sentence verbatim in every case", () => {
    for (const note of [undefined, null, "", "   ", "hello", "a".repeat(600)]) {
      expect(buildFlagMessage(SHOWN, note)).toMatch(new RegExp(`^${escapeRegExp(PREFIX)}`));
    }
  });
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
