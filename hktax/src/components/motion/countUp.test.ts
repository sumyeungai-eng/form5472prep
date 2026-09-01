import { describe, expect, it } from "vitest";

import { shouldAnimateCountUp } from "./CountUp";

// Regression cover for a shipped defect: the headline tax figures rendered
// HK$0 permanently because the component snapshotted its target at mount,
// before the stored results had loaded, and never re-ran afterwards.
// Anything that returns false here must render the value directly.
describe("shouldAnimateCountUp", () => {
  it("animates a real value on first sight", () => {
    expect(shouldAnimateCountUp(55_500, false, null)).toBe(true);
  });

  it("does not animate when the user prefers reduced motion", () => {
    expect(shouldAnimateCountUp(55_500, true, null)).toBe(false);
  });

  it("does not animate a zero value, so a genuine zero renders immediately", () => {
    expect(shouldAnimateCountUp(0, false, null)).toBe(false);
  });

  it("does not re-animate a value it has already animated", () => {
    expect(shouldAnimateCountUp(55_500, false, 55_500)).toBe(false);
  });

  it("animates the real figure that arrives after an initial zero render", () => {
    // The defect: mounted with 0, then results loaded. The component must
    // animate to (and settle on) the real amount rather than stay at zero.
    expect(shouldAnimateCountUp(0, false, null)).toBe(false);
    expect(shouldAnimateCountUp(55_500, false, null)).toBe(true);
  });

  it("animates again when the figure changes, e.g. switching year of assessment", () => {
    expect(shouldAnimateCountUp(58_560, false, 55_500)).toBe(true);
  });

  it("does not animate a non-finite value", () => {
    expect(shouldAnimateCountUp(Number.NaN, false, null)).toBe(false);
  });
});
