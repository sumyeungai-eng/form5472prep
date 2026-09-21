import { describe, expect, it } from "vitest";
import { isLegalHoliday, nextBusinessDay } from "./federalHolidays";

function utc(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

describe("isLegalHoliday", () => {
  it("recognizes Independence Day 2026 and its observed Friday", () => {
    expect(isLegalHoliday(utc(2026, 6, 4))).toBe(true);
    expect(isLegalHoliday(utc(2026, 6, 3))).toBe(true);
  });

  it("recognizes Christmas 2027 and its observed Friday", () => {
    expect(isLegalHoliday(utc(2027, 11, 25))).toBe(true);
    expect(isLegalHoliday(utc(2027, 11, 24))).toBe(true);
  });

  it("recognizes New Year's Day 2028 and its observed date in 2027", () => {
    expect(isLegalHoliday(utc(2028, 0, 1))).toBe(true);
    expect(isLegalHoliday(utc(2027, 11, 31))).toBe(true);
  });

  it("recognizes DC Emancipation Day and an observed-date edge", () => {
    expect(isLegalHoliday(utc(2026, 3, 16))).toBe(true);
    expect(isLegalHoliday(utc(2022, 3, 15))).toBe(true);
  });
});

describe("nextBusinessDay", () => {
  it("rolls a Monday federal holiday to the Tuesday immediately after", () => {
    expect(nextBusinessDay(utc(2027, 4, 31)).getTime()).toBe(Date.UTC(2027, 5, 1));
  });

  it("rolls through an observed fixed-date holiday", () => {
    expect(nextBusinessDay(utc(2026, 6, 3)).getTime()).toBe(Date.UTC(2026, 6, 6));
  });
});
