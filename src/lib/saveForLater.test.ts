import { describe, expect, it } from "vitest";
import { saveForLaterMode } from "./saveForLater";

describe("saveForLaterMode", () => {
  it("returns the partner mode when the filing is a partner filing", () => {
    expect(saveForLaterMode({ isPartnerFiling: true, isSignedIn: false })).toEqual({
      kind: "partner",
      href: "/partner",
      label: "Save and back to dashboard",
    });
  });

  it("prefers partner over signed-in when both are true", () => {
    expect(saveForLaterMode({ isPartnerFiling: true, isSignedIn: true })).toEqual({
      kind: "partner",
      href: "/partner",
      label: "Save and back to dashboard",
    });
  });

  it("returns the user mode for a signed-in customer who is not a partner filing", () => {
    expect(saveForLaterMode({ isPartnerFiling: false, isSignedIn: true })).toEqual({
      kind: "user",
      href: "/dashboard",
      label: "Save and exit",
    });
  });

  it("returns the anonymous mode when neither a partner nor signed in", () => {
    expect(saveForLaterMode({ isPartnerFiling: false, isSignedIn: false })).toEqual({
      kind: "anonymous",
      label: "Save for later",
    });
  });
});
