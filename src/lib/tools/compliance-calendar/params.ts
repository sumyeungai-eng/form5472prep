// Shareable-URL state for the compliance calendar:
//   ?state=DE&formed=2024-03-10&fye=12-31&ext=0
// Parsing is forgiving (bad values fall back to defaults and are reported),
// serialising is canonical so the same inputs always produce the same URL.

import { STATE_CODES, type StateCode, isStateCode } from "@/lib/tools/state-fees/types";
import { daysInMonth, isValidIsoDate, type IsoDate } from "@/lib/tools/state-fees/dates";

export type CalendarInput = {
  state: StateCode;
  formed: IsoDate;
  fyeMonth: number; // 1-12; the fiscal year always ends on the month's last day
  extension: boolean;
};

export const DEFAULT_FYE_MONTH = 12;
export const MIN_FORMED = "1990-01-01";

export type ParsedCalendarParams = {
  state: StateCode | null;
  formed: IsoDate | null;
  fyeMonth: number;
  extension: boolean;
  // Parameters that were present but invalid (so the UI can say so).
  invalid: Array<"state" | "formed" | "fye" | "ext">;
};

// "12-31" ↔ 12. Only month-end year ends are supported (52–53-week years are not).
export function formatFye(month: number): string {
  // February is written as 02-28; leap years are resolved per year in the date math.
  const day = month === 2 ? 28 : daysInMonth(2025, month);
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseFye(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const isMonthEnd = month === 2 ? day === 28 || day === 29 : day === daysInMonth(2025, month);
  return isMonthEnd ? month : null;
}

export function parseCalendarParams(
  search: URLSearchParams | string,
  maxFormed: IsoDate,
): ParsedCalendarParams {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const invalid: ParsedCalendarParams["invalid"] = [];

  const rawState = params.get("state");
  const upper = rawState?.trim().toUpperCase() ?? null;
  const state = upper && isStateCode(upper) ? upper : null;
  if (rawState && !state) invalid.push("state");

  const rawFormed = params.get("formed");
  const formed =
    rawFormed && isValidIsoDate(rawFormed) && rawFormed >= MIN_FORMED && rawFormed <= maxFormed
      ? rawFormed
      : null;
  if (rawFormed && !formed) invalid.push("formed");

  const rawFye = params.get("fye");
  const parsedFye = parseFye(rawFye);
  if (rawFye && parsedFye === null) invalid.push("fye");

  const rawExt = params.get("ext");
  if (rawExt !== null && rawExt !== "0" && rawExt !== "1") invalid.push("ext");

  return {
    state,
    formed,
    fyeMonth: parsedFye ?? DEFAULT_FYE_MONTH,
    extension: rawExt === "1",
    invalid,
  };
}

export function calendarQueryString(input: CalendarInput): string {
  const params = new URLSearchParams();
  params.set("state", input.state);
  params.set("formed", input.formed);
  params.set("fye", formatFye(input.fyeMonth));
  params.set("ext", input.extension ? "1" : "0");
  return params.toString();
}

export { STATE_CODES };
