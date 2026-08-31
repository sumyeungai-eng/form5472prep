import { describe, expect, it } from "vitest";
import { clampStepIndex } from "./wizardContext";

describe("clampStepIndex", () => {
  it("defaults older or invalid persisted payloads to the first step", () => {
    expect(clampStepIndex(undefined)).toBe(0);
    expect(clampStepIndex(Number.NaN)).toBe(0);
    expect(clampStepIndex(-1)).toBe(0);
  });

  it("clamps persisted step indexes to the wizard range", () => {
    expect(clampStepIndex(3)).toBe(3);
    expect(clampStepIndex(3.8)).toBe(3);
    expect(clampStepIndex(99)).toBe(5);
  });
});
