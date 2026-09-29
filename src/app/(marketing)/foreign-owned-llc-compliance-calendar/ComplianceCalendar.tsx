"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  Download,
  ExternalLink,
  Landmark,
  Link2,
  MapPin,
} from "lucide-react";
import { buildComplianceCalendar, type CalendarEvent } from "@/lib/tools/compliance-calendar/calendar";
import { buildIcs } from "@/lib/tools/compliance-calendar/ics";
import {
  type CalendarInput,
  DEFAULT_FYE_MONTH,
  MIN_FORMED,
  calendarQueryString,
  parseCalendarParams,
} from "@/lib/tools/compliance-calendar/params";
import {
  type IsoDate,
  compareIso,
  addDays,
  formatLongDate,
  formatShortDate,
  isValidIsoDate,
  monthName,
  todayIsoLocal,
} from "@/lib/tools/state-fees/dates";
import { type StateCode, isStateCode } from "@/lib/tools/state-fees/types";

const PAGE_PATH = "/foreign-owned-llc-compliance-calendar";

export type StateOption = { code: StateCode; name: string };

function eventDescription(event: CalendarEvent): string {
  const parts = [event.detail];
  if (event.amount) parts.unshift(`Amount: ${event.amount}.`);
  if (event.note) parts.push(event.note);
  for (const src of [event.source, ...(event.moreSources ?? [])]) {
    parts.push(`Source: ${src.label} — ${src.url}`);
  }
  parts.push(
    "General information from form5472prep.com, not personalised tax advice. Confirm the date and amount with the IRS or the state before relying on it.",
  );
  return parts.join("\n\n");
}

export function ComplianceCalendar({ states }: { states: StateOption[] }) {
  const [today, setToday] = useState<IsoDate | null>(null);
  const [state, setState] = useState<StateCode | "">("");
  const [formed, setFormed] = useState("");
  const [fyeMonth, setFyeMonth] = useState(DEFAULT_FYE_MONTH);
  const [extension, setExtension] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invalidParams, setInvalidParams] = useState<string[]>([]);

  // Today and the shared-URL inputs are read after hydration so the server
  // HTML never bakes in a stale "today" (and never mismatches the client).
  useEffect(() => {
    const now = todayIsoLocal();
    setToday(now);
    const parsed = parseCalendarParams(window.location.search, now);
    if (parsed.state) setState(parsed.state);
    if (parsed.formed) setFormed(parsed.formed);
    setFyeMonth(parsed.fyeMonth);
    setExtension(parsed.extension);
    setInvalidParams(parsed.invalid);
  }, []);

  const input: CalendarInput | null = useMemo(() => {
    if (!today || !state || !isStateCode(state)) return null;
    if (!isValidIsoDate(formed) || formed < MIN_FORMED || formed > today) return null;
    return { state, formed, fyeMonth, extension };
  }, [extension, formed, fyeMonth, state, today]);

  const result = useMemo(
    () => (input && today ? buildComplianceCalendar(input, today) : null),
    [input, today],
  );

  // Keep the address bar shareable as the inputs change.
  useEffect(() => {
    if (!input) return;
    window.history.replaceState(null, "", `${PAGE_PATH}?${calendarQueryString(input)}`);
  }, [input]);

  const stateName = states.find((s) => s.code === state)?.name ?? "";
  const soon = today ? addDays(today, 30) : null;

  async function copyLink() {
    if (!input) return;
    const url = `${window.location.origin}${PAGE_PATH}?${calendarQueryString(input)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function downloadIcs() {
    if (!result || !input) return;
    const ics = buildIcs(
      [...result.events, ...result.later].map((event) => ({
        uid: `${event.id}-${input.state}-${input.formed}@form5472prep.com`,
        date: event.date,
        summary: event.amount ? `${event.title} (${event.amount})` : event.title,
        description: eventDescription(event),
        url: event.source.url,
        reminderDays: 14,
      })),
      { now: new Date(), calendarName: `LLC deadlines — ${stateName}` },
    );
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `llc-compliance-calendar-${input.state.toLowerCase()}-${input.formed}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  const fieldClass =
    "mt-2 block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";

  return (
    <section
      id="calendar"
      aria-labelledby="calendar-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-black/25 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
            Your deadlines
          </p>
          <h2 id="calendar-heading" className="mt-2 font-serif text-2xl font-semibold text-ink">
            Build your compliance calendar
          </h2>
        </div>
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-accent-50 text-accent">
          <CalendarDays className="h-5 w-5" />
        </div>
      </div>

      {invalidParams.length > 0 && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Part of the shared link could not be read ({invalidParams.join(", ")}). Check the fields below.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label htmlFor="cal-state" className="block">
          <span className="text-sm font-medium text-ink">State the LLC was formed in</span>
          <select
            id="cal-state"
            value={state}
            onChange={(e) => setState(e.target.value as StateCode | "")}
            className={fieldClass}
          >
            <option value="">Choose a state</option>
            {states.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="cal-formed" className="block">
          <span className="text-sm font-medium text-ink">Formation date</span>
          <input
            id="cal-formed"
            type="date"
            min={MIN_FORMED}
            max={today ?? undefined}
            value={formed}
            onChange={(e) => setFormed(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label htmlFor="cal-fye" className="block">
          <span className="text-sm font-medium text-ink">Tax year ends</span>
          <select
            id="cal-fye"
            value={fyeMonth}
            onChange={(e) => setFyeMonth(Number(e.target.value))}
            className={fieldClass}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m === 12 ? "31 December (calendar year)" : `Last day of ${monthName(m)}`}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor="cal-ext"
          className="flex cursor-pointer items-start gap-3 self-end rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <input
            id="cal-ext"
            type="checkbox"
            checked={extension}
            onChange={(e) => setExtension(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
          />
          <span>
            <span className="block text-sm font-medium text-ink">I&apos;ll file a Form 7004 extension</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
              Shows the 7004 date and the later extended deadline.
            </span>
          </span>
        </label>
      </div>

      {!result && (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          Choose your state and formation date to list every federal and state deadline for the next 18 months.
        </p>
      )}

      {result && input && (
        <div className="mt-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={downloadIcs}
              disabled={result.events.length + result.later.length === 0}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Add to calendar (.ics)
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            {formatLongDate(result.windowStart)} to {formatLongDate(result.windowEnd)} · {stateName} LLC formed{" "}
            {formatLongDate(input.formed)} · tax year ends{" "}
            {input.fyeMonth === 12 ? "31 December" : `last day of ${monthName(input.fyeMonth)}`}
          </p>

          {result.recentlyPassed && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="flex items-start gap-2 font-semibold">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                Your last Form 5472 deadline was {formatLongDate(result.recentlyPassed.date)}.
              </p>
              <p className="mt-1 pl-6 text-amber-900">
                If that return was not filed, the late-filing route with a reasonable-cause statement is the usual fix.{" "}
                <Link href="/start?src=tool-calendar-late" className="font-semibold underline">
                  File it now
                </Link>
              </p>
            </div>
          )}

          <ol className="mt-4 space-y-3">
            {result.events.map((event) => {
              const isSoon = soon !== null && compareIso(event.date, soon) <= 0;
              const Icon = event.jurisdiction === "Federal" ? Landmark : MapPin;
              return (
                <li
                  key={event.id}
                  className={`rounded-lg border p-4 ${isSoon ? "border-amber-300 bg-amber-50/60" : "border-slate-200"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <time dateTime={event.date} className="font-mono text-sm font-semibold text-ink">
                      {formatShortDate(event.date)}
                    </time>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      <Icon className="h-3 w-3" />
                      {event.jurisdiction === "Federal" ? "Federal" : stateName}
                    </span>
                    {isSoon && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                        Within 30 days
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-semibold text-ink">
                    {event.title}
                    {event.amount ? <span className="font-normal text-slate-600"> · {event.amount}</span> : null}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{event.detail}</p>
                  {event.note && <p className="mt-1 text-xs leading-relaxed text-slate-500">{event.note}</p>}
                  <div className="mt-2 flex flex-col gap-1">
                    {[event.source, ...(event.moreSources ?? [])].map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                      >
                        {src.label}
                        <ExternalLink className="h-3 w-3 flex-none" />
                      </a>
                    ))}
                  </div>
                </li>
              );
            })}
            {result.events.length === 0 && (
              <li className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
                No dated deadlines fall in this window.
              </li>
            )}
          </ol>

          {result.later.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-ink">Next, just after this window</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {result.later.map((event) => (
                  <li key={event.id}>
                    <time dateTime={event.date} className="font-mono text-ink">
                      {formatShortDate(event.date)}
                    </time>{" "}
                    — {event.title}
                    {event.amount ? ` · ${event.amount}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.stateNote && (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {result.stateNote}
            </p>
          )}

          {result.notScheduled.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-ink">Also check — not dated above</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {result.notScheduled.map((o) => (
                  <li key={o.id}>
                    <span className="font-medium text-ink">{o.name}</span> ({o.amount}): {o.due}
                    {o.appliesTo ? ` ${o.appliesTo}` : ""}{" "}
                    <a
                      href={o.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Source
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            No FinCEN BOI report: US-formed LLCs are exempt. State dates are shown exactly as each state sets them; federal
            dates already include the weekend and holiday roll. Fees change — confirm with the state before paying.
          </p>
        </div>
      )}

      <Link
        href="/start?src=tool-calendar"
        className="group mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-ink px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-800"
      >
        Have us file your Form 5472
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </section>
  );
}
