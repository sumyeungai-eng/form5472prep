import { describe, expect, it } from "vitest";
import { formatSsnForForms, maskSsn, normalizeSsn, SSN_FORMAT_MESSAGE, SSN_ITIN_MESSAGE, validateSsn } from "./ssn";

// Synthetic numbers only.
describe("validateSsn (spec S4: reject only impossible numbers)", () => {
  it.each(["123-45-6789", "123 45 6789", "123456789", " 123-45-6789 ", "123 - 45 - 6789"])("accepts %j", (input) => {
    expect(validateSsn(input)).toEqual({ ok: true, ssn: "123456789", last4: "6789" });
  });

  it.each([
    ["12345678", "format"],
    ["1234567890", "format"],
    ["123-45-678a", "format"],
    ["123.45.6789", "format"],
    ["", "format"],
  ])("rejects %j as not 9 digits", (input, code) => {
    expect(validateSsn(input)).toEqual({ ok: false, code, error: SSN_FORMAT_MESSAGE });
  });

  it.each(["900-70-1234", "912-34-5678", "999-99-9999"])("says %j looks like an ITIN (9xx area)", (input) => {
    expect(validateSsn(input)).toEqual({ ok: false, code: "itin_range", error: SSN_ITIN_MESSAGE });
  });

  it.each([
    ["000-12-3456", "area"],
    ["666-12-3456", "area"],
    ["123-00-4567", "group"],
    ["123-45-0000", "serial"],
  ])("rejects impossible %j (%s)", (input, code) => {
    const result = validateSsn(input);
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ code });
  });

  it("accepts edge values that are valid (area 001, 665, 667, 899)", () => {
    for (const area of ["001", "665", "667", "899"]) expect(validateSsn(`${area}-01-0001`).ok).toBe(true);
  });
});

describe("SSN display helpers", () => {
  it("masks to the last four only", () => {
    expect(maskSsn("6789")).toBe("•••-••-6789");
    expect(maskSsn(null)).toBe("");
    expect(maskSsn("123456789")).toBe("");
  });

  it("normalizes and formats for the forms", () => {
    expect(normalizeSsn("123 45-6789")).toBe("123456789");
    expect(formatSsnForForms("123456789")).toBe("123-45-6789");
  });
});
