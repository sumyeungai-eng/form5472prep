// Date engine for state deadlines. Pure: given a rule, the formation date,
// the fiscal-year-end month and a window, list every due date in the window.
// State dates are returned exactly as the state states them — we do NOT apply
// the federal weekend/holiday roll (IRC §7503 governs federal deadlines only).

import {
  type IsoDate,
  addDays,
  compareIso,
  lastDayOfMonth,
  monthsAfter,
  parseIsoDate,
  toIso,
  ymd,
} from "./dates";
import type { DueRule } from "./types";

export type RuleContext = {
  formed: IsoDate;
  fyeMonth: number; // 1-12, only used by tax-year rules
};

function inWindow(date: IsoDate, from: IsoDate, to: IsoDate): boolean {
  return compareIso(date, from) >= 0 && compareIso(date, to) <= 0;
}

export function ruleOccurrences(
  rule: DueRule,
  ctx: RuleContext,
  from: IsoDate,
  to: IsoDate,
): IsoDate[] {
  const formed = parseIsoDate(ctx.formed);
  const end = parseIsoDate(to);
  if (!formed || !end || compareIso(from, to) > 0) return [];
  const out: IsoDate[] = [];

  switch (rule.kind) {
    case "none":
      return [];

    case "fixed-date": {
      for (let y = formed.y + rule.firstYearOffset; y <= end.y; y += 1) {
        const date = toIso(ymd(y, rule.month, rule.day));
        if (inWindow(date, from, to)) out.push(date);
      }
      return out;
    }

    case "anniversary-month": {
      for (let y = formed.y + rule.firstYearOffset; y <= end.y; y += rule.everyYears) {
        const date =
          rule.day === "first" ? toIso({ y, m: formed.m, d: 1 }) : lastDayOfMonth(y, formed.m);
        if (inWindow(date, from, to)) out.push(date);
      }
      return out;
    }

    case "tax-year-month": {
      // Taxable years start on the formation date, then the day after each fiscal-year end.
      let start: IsoDate = ctx.formed;
      for (let i = 0; i < 250; i += 1) {
        const s = parseIsoDate(start)!;
        const date = monthsAfter(s.y, s.m, rule.monthOfTaxYear - 1, rule.day);
        if (compareIso(date, to) > 0) break;
        if (inWindow(date, from, to)) out.push(date);
        // Next taxable year begins the day after the first fiscal-year end on/after `start`.
        let fyeYear = s.y;
        if (compareIso(lastDayOfMonth(fyeYear, ctx.fyeMonth), start) < 0) fyeYear += 1;
        start = addDays(lastDayOfMonth(fyeYear, ctx.fyeMonth), 1);
      }
      return out;
    }

    case "after-tax-year-end": {
      let endYear = formed.y;
      if (compareIso(lastDayOfMonth(endYear, ctx.fyeMonth), ctx.formed) < 0) endYear += 1;
      for (let i = 0; i < 250; i += 1, endYear += 1) {
        const date = monthsAfter(endYear, ctx.fyeMonth, rule.monthsAfter, rule.day);
        if (compareIso(date, to) > 0) break;
        if (inWindow(date, from, to)) out.push(date);
      }
      return out;
    }

    case "days-after-formation": {
      const date = addDays(ctx.formed, rule.days);
      return inWindow(date, from, to) ? [date] : [];
    }
  }
}
