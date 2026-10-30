import { describe, expect, it } from "vitest";
import { FILING_SIGNATURE_DECLARATION_VERSION, filingDeclarationText } from "./filingSignature";

describe("filingSignature", () => {
  it("pins the declaration version", () => {
    expect(FILING_SIGNATURE_DECLARATION_VERSION).toBe("2026-10-30");
  });
  it("pins the declaration text", () => {
    expect(filingDeclarationText()).toBe(
      "Under penalties of perjury, I declare that I have examined this return, including the accompanying schedules and statements, and to the best of my knowledge and belief it is true, correct, and complete. I authorize my signature above to be applied to the Form 1120 and the statements in this package.",
    );
  });
});
