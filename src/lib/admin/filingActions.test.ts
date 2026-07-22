import { describe, expect, it } from "vitest";
import {
  isValidForceOverride,
  SIDE_EFFECTING_ACTIONS,
} from "./filingActions";

describe("SIDE_EFFECTING_ACTIONS", () => {
  it("contains exactly the four externally side-effecting filing actions", () => {
    expect(Array.from(SIDE_EFFECTING_ACTIONS).sort()).toEqual([
      "regeneratePdf",
      "resendMagicLink",
      "resendOrderConfirmation",
      "retryFax",
    ]);
  });
});

describe("isValidForceOverride", () => {
  it.each([
    [{ force: true, reason: "legacy admin override" }, true],
    [{ force: true, reason: "  documented override  " }, true],
    [{ force: true, reason: "" }, false],
    [{ force: true, reason: "   " }, false],
    [{ force: true }, false],
    [{ force: false, reason: "documented override" }, false],
    [{ reason: "documented override" }, false],
  ] as const)("returns %s for %o", (ctx, expected) => {
    expect(isValidForceOverride(ctx)).toBe(expected);
  });
});
