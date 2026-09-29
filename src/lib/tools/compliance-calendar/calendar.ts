// Builds the personal compliance calendar: federal Form 5472 / Form 7004
// deadlines plus the chosen state's recurring filings, for a window starting
// "today". Pure — the page passes today's date in.

import {
  type IsoDate,
  addDays,
  addMonths,
  compareIso,
  formatLongDate,
  weekdayOf,
} from "@/lib/tools/state-fees/dates";
import { getStateFees } from "@/lib/tools/state-fees/data";
import { ruleOccurrences } from "@/lib/tools/state-fees/rules";
import type { SourceRef, StateCode, StateObligation } from "@/lib/tools/state-fees/types";
import { FEDERAL_SOURCES, type FederalDue, federalDueDates } from "./federal";
import type { CalendarInput } from "./params";

export const CALENDAR_WINDOW_MONTHS = 18;

export type CalendarEventKind =
  | "federal-return"
  | "federal-extension"
  | "federal-extended-return"
  | "state";

export type CalendarEvent = {
  id: string; // stable; used for the .ics UID
  date: IsoDate;
  kind: CalendarEventKind;
  jurisdiction: "Federal" | StateCode;
  title: string;
  amount?: string;
  detail: string;
  note?: string;
  source: SourceRef;
};

export type CalendarResult = {
  input: CalendarInput;
  windowStart: IsoDate;
  windowEnd: IsoDate;
  events: CalendarEvent[];
  // The latest federal deadline that fell before the window (for a "did you
  // file it?" prompt). Null when the LLC had no tax year end before today.
  recentlyPassed: CalendarEvent | null;
  // State items that depend on facts we don't collect (revenue, NY-source
  // income …) or that we could not verify, so they are not placed on dates.
  notScheduled: StateObligation[];
  // Set when the state has no recurring filing at all (e.g. New Mexico).
  stateNote: string | null;
  // Next date of a dated state filing that has no occurrence inside the window
  // (e.g. a biennial report due just after it), so it is never silently missing.
  later: CalendarEvent[];
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function rollNote(statutory: IsoDate, due: IsoDate): string | undefined {
  if (statutory === due) return undefined;
  const why = weekdayOf(statutory) === 0 || weekdayOf(statutory) === 6
    ? `falls on a ${DAY_NAMES[weekdayOf(statutory)]}`
    : "is a legal holiday in the District of Columbia";
  return `${formatLongDate(statutory)} ${why}, so the deadline moves to the next business day (IRC § 7503).`;
}

function taxYearLabel(due: FederalDue): string {
  const { start, end, first } = due.taxYear;
  return `Tax year ${formatLongDate(start)} – ${formatLongDate(end)}${first ? " (first, short year from formation)" : ""}.`;
}

const REPORTABLE_NOTE =
  "Required if the LLC had a reportable transaction with its foreign owner or another related party in that year — formation costs paid by the owner and owner contributions or withdrawals count.";

function federalEvents(due: FederalDue, extension: boolean): CalendarEvent[] {
  const end = due.taxYear.end;
  if (!extension) {
    return [
      {
        id: `fed-5472-${end}`,
        date: due.originalDue,
        kind: "federal-return",
        jurisdiction: "Federal",
        title: "Form 5472 + pro forma Form 1120 due",
        detail: `${taxYearLabel(due)} Fax or mail it to the IRS — or file Form 7004 by this date to extend to ${formatLongDate(due.extendedDue)}. ${REPORTABLE_NOTE}`,
        note: rollNote(due.originalStatutory, due.originalDue),
        source: FEDERAL_SOURCES.i5472,
      },
    ];
  }
  return [
    {
      id: `fed-7004-${end}`,
      date: due.originalDue,
      kind: "federal-extension",
      jurisdiction: "Federal",
      title: "Form 7004 extension due (Form 5472 package)",
      detail: `Extends the Form 5472 + pro forma Form 1120 for the tax year ending ${formatLongDate(end)} by ${due.extensionMonths} months, to ${formatLongDate(due.extendedDue)}. Write "Foreign-owned U.S. DE" across the top and fax or mail it to the IRS.`,
      note: rollNote(due.originalStatutory, due.originalDue),
      source: FEDERAL_SOURCES.i5472,
    },
    {
      id: `fed-5472-ext-${end}`,
      date: due.extendedDue,
      kind: "federal-extended-return",
      jurisdiction: "Federal",
      title: "Extended Form 5472 + pro forma Form 1120 due",
      detail: `${taxYearLabel(due)} Only if Form 7004 was filed by ${formatLongDate(due.originalDue)}. ${REPORTABLE_NOTE}`,
      note: rollNote(due.extendedStatutory, due.extendedDue),
      source: FEDERAL_SOURCES.i7004,
    },
  ];
}

export function buildComplianceCalendar(
  input: CalendarInput,
  today: IsoDate,
  months: number = CALENDAR_WINDOW_MONTHS,
): CalendarResult {
  const windowStart = today;
  const windowEnd = addDays(addMonths(today, months), -1);

  // Tax years ending up to the window end cover every federal date that can
  // fall inside it (the latest date is < 12 months after a year end).
  const dues = federalDueDates(input.formed, input.fyeMonth, windowEnd);
  const allFederal = dues.flatMap((d) => federalEvents(d, input.extension));

  const federalInWindow = allFederal.filter(
    (e) => compareIso(e.date, windowStart) >= 0 && compareIso(e.date, windowEnd) <= 0,
  );

  // Governing federal deadline per year = the return (extended or not), never the 7004 itself.
  const governing = allFederal.filter((e) => e.kind !== "federal-extension");
  const passed = governing.filter((e) => compareIso(e.date, windowStart) < 0);
  const recentlyPassed = passed.length > 0 ? passed[passed.length - 1] : null;

  const state = getStateFees(input.state);
  const stateEvents: CalendarEvent[] = [];
  const later: CalendarEvent[] = [];
  const notScheduled: StateObligation[] = [];
  const ctx = { formed: input.formed, fyeMonth: input.fyeMonth };
  const toEvent = (obligation: StateObligation, date: IsoDate): CalendarEvent => ({
    id: `${obligation.id}-${date}`,
    date,
    kind: "state",
    jurisdiction: state.code,
    title: `${state.name}: ${obligation.name}`,
    amount: obligation.amount,
    detail: obligation.appliesTo ? `${obligation.due} ${obligation.appliesTo}` : obligation.due,
    note: obligation.late ? `Late: ${obligation.late}.` : undefined,
    source: obligation.source,
  });
  for (const obligation of state.obligations) {
    if (!obligation.inCalendar || !obligation.verified) {
      notScheduled.push(obligation);
      continue;
    }
    const dates = ruleOccurrences(obligation.rule, ctx, windowStart, windowEnd);
    for (const date of dates) stateEvents.push(toEvent(obligation, date));
    // One-time filings that are already past are simply done; recurring ones
    // with no date in the window get their next date listed as "later".
    if (dates.length === 0 && obligation.frequency !== "one-time") {
      const next = ruleOccurrences(obligation.rule, ctx, addDays(windowEnd, 1), addMonths(windowEnd, 24))[0];
      if (next) later.push(toEvent(obligation, next));
    }
  }

  const events = [...federalInWindow, ...stateEvents].sort(
    (a, b) =>
      compareIso(a.date, b.date) ||
      (a.jurisdiction === "Federal" ? -1 : 0) - (b.jurisdiction === "Federal" ? -1 : 0),
  );

  const stateNote =
    state.obligations.length === 0
      ? `${state.name} has no annual report or recurring state fee for LLCs.`
      : null;

  later.sort((a, b) => compareIso(a.date, b.date));

  return { input, windowStart, windowEnd, events, recentlyPassed, notScheduled, stateNote, later };
}
