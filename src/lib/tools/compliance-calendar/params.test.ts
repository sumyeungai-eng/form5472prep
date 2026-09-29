import { describe, expect, it } from "vitest";
import { calendarQueryString, formatFye, parseCalendarParams, parseFye } from "./params";

const MAX = "2026-09-29";

describe("fye params", () => {
  it("round-trips every month-end", () => {
    for (let m = 1; m <= 12; m += 1) expect(parseFye(formatFye(m))).toBe(m);
    expect(formatFye(12)).toBe("12-31");
    expect(formatFye(2)).toBe("02-28");
    expect(parseFye("02-29")).toBe(2);
  });

  it("rejects non-month-end or malformed values", () => {
    expect(parseFye("06-15")).toBeNull();
    expect(parseFye("13-31")).toBeNull();
    expect(parseFye("1231")).toBeNull();
  });
});

describe("parseCalendarParams", () => {
  it("parses the documented shareable URL", () => {
    expect(parseCalendarParams("?state=DE&formed=2024-03-10&fye=12-31&ext=0", MAX)).toEqual({
      state: "DE",
      formed: "2024-03-10",
      fyeMonth: 12,
      extension: false,
      invalid: [],
    });
    expect(parseCalendarParams("state=wy&formed=2025-01-15&fye=06-30&ext=1", MAX)).toMatchObject({
      state: "WY",
      fyeMonth: 6,
      extension: true,
    });
  });

  it("falls back to defaults and reports bad values", () => {
    const parsed = parseCalendarParams("state=ZZ&formed=2030-01-01&fye=06-15&ext=yes", MAX);
    expect(parsed).toEqual({
      state: null,
      formed: null,
      fyeMonth: 12,
      extension: false,
      invalid: ["state", "formed", "fye", "ext"],
    });
    expect(parseCalendarParams("", MAX).invalid).toEqual([]);
  });

  it("serialises canonically", () => {
    expect(
      calendarQueryString({ state: "NV", formed: "2024-03-10", fyeMonth: 9, extension: true }),
    ).toBe("state=NV&formed=2024-03-10&fye=09-30&ext=1");
  });
});
