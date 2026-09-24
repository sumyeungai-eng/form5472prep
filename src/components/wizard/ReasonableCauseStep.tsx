"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LEARNED_SOURCE_OPTIONS,
  WHY_MISSED_OPTIONS,
  composeWhenLearned,
  composeWhyMissed,
  parseWhenLearned,
  parseWhyMissed,
  validateSelections,
  type WhenLearnedSelection,
  type WhyMissedSelection,
} from "@/lib/reasonableCauseOptions";

export type ReasonableCauseYearInput = {
  taxYear: number;
  rcsWhyMissed: string;
  rcsWhenLearned: string;
  rcsNoIrsNoticeConfirmed: boolean;
};

type FieldErrors = Record<string, string>;

export function validateReasonableCauseYears(rows: ReasonableCauseYearInput[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const row of rows) {
    const prefix = String(row.taxYear);
    if (!row.rcsWhyMissed.trim()) {
      errors[`${prefix}.rcsWhyMissed`] = `Explain why the filing for ${row.taxYear} was missed.`;
    }
    if (!row.rcsWhenLearned.trim()) {
      errors[`${prefix}.rcsWhenLearned`] = "Enter when you learned that this form was required.";
    }
    if (row.rcsNoIrsNoticeConfirmed !== true) {
      errors[`${prefix}.rcsNoIrsNoticeConfirmed`] =
        `Confirm you have not received an IRS notice about this ${row.taxYear} return.`;
    }
  }
  return errors;
}

type Selection = { why: WhyMissedSelection; when: WhenLearnedSelection };

const FIELD_CLASS =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function ReasonableCauseStep({
  years,
  onSubmit,
  onBack,
  saving,
}: {
  years: ReasonableCauseYearInput[];
  onSubmit: (years: ReasonableCauseYearInput[]) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  const [rows, setRows] = useState<ReasonableCauseYearInput[]>(years);
  const [selections, setSelections] = useState<Record<number, Selection>>(() =>
    Object.fromEntries(
      years.map((row) => [
        row.taxYear,
        { why: parseWhyMissed(row.rcsWhyMissed), when: parseWhenLearned(row.rcsWhenLearned) },
      ]),
    ),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const sortedRows = useMemo(() => rows.slice().sort((a, b) => a.taxYear - b.taxYear), [rows]);
  const maxMonth = useMemo(currentMonth, []);

  function clearErrors(taxYear: number, keys: string[]) {
    setErrors((current) => {
      const next = { ...current };
      for (const key of keys) delete next[`${taxYear}.${key}`];
      return next;
    });
  }

  function setSelection(taxYear: number, next: Selection) {
    setSelections((current) => ({ ...current, [taxYear]: next }));
    setRows((current) =>
      current.map((row) =>
        row.taxYear === taxYear
          ? { ...row, rcsWhyMissed: composeWhyMissed(next.why), rcsWhenLearned: composeWhenLearned(next.when) }
          : row,
      ),
    );
  }

  function updateWhy(taxYear: number, patch: Partial<WhyMissedSelection>) {
    const current = selections[taxYear];
    setSelection(taxYear, { ...current, why: { ...current.why, ...patch } });
    clearErrors(taxYear, ["rcsWhyMissed"]);
  }

  function updateWhen(taxYear: number, patch: Partial<WhenLearnedSelection>) {
    const current = selections[taxYear];
    setSelection(taxYear, { ...current, when: { ...current.when, ...patch } });
    clearErrors(taxYear, ["rcsWhenLearned"]);
  }

  function copyFrom(fromYear: number, toYear: number) {
    const source = selections[fromYear];
    setSelection(toYear, { why: { ...source.why }, when: { ...source.when } });
    clearErrors(toYear, ["rcsWhyMissed", "rcsWhenLearned"]);
  }

  function update(taxYear: number, patch: Partial<ReasonableCauseYearInput>) {
    setRows((current) =>
      current.map((row) => (row.taxYear === taxYear ? { ...row, ...patch } : row)),
    );
    clearErrors(taxYear, Object.keys(patch));
  }

  async function submit() {
    const selectionErrors = Object.assign(
      {},
      ...rows.map((row) => {
        const sel = selections[row.taxYear];
        return validateSelections(row.taxYear, sel.why, sel.when);
      }),
    ) as FieldErrors;
    const nextErrors = { ...validateReasonableCauseYears(rows), ...selectionErrors };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit(rows);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Reasonable cause statement</h2>
        <p className="text-sm text-slate-500 mt-1">
          This return is being filed after its due date. Pick the answers that fit best and we will
          write the reasonable-cause statement for you. You can always choose &ldquo;Other&rdquo; and
          write your own.
        </p>
      </div>

      <div className="space-y-4">
        {sortedRows.map((row, index) => {
          const prefix = String(row.taxYear);
          const sel = selections[row.taxYear];
          const whyOption = WHY_MISSED_OPTIONS.find((o) => o.key === sel.why.key);
          const whenIsOther = sel.when.source === "other";
          const previousYear = index > 0 ? sortedRows[index - 1].taxYear : null;
          const preview = [row.rcsWhyMissed, row.rcsWhenLearned].filter(Boolean).join(" ");
          return (
            <section
              key={row.taxYear}
              className="rounded-md border border-slate-200 bg-white p-4"
              aria-labelledby={`rcs-heading-${row.taxYear}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id={`rcs-heading-${row.taxYear}`} className="text-sm font-semibold text-slate-900">
                  Tax year {row.taxYear}
                </h3>
                {previousYear !== null && (
                  <button
                    type="button"
                    onClick={() => copyFrom(previousYear, row.taxYear)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Use the same answers as {previousYear}
                  </button>
                )}
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor={`rcs-why-${row.taxYear}`}
                    className="block text-sm font-medium text-slate-700"
                  >
                    Why was the filing for {row.taxYear} missed?
                  </label>
                  <select
                    id={`rcs-why-${row.taxYear}`}
                    value={sel.why.key}
                    onChange={(e) =>
                      updateWhy(row.taxYear, { key: e.target.value as WhyMissedSelection["key"] })
                    }
                    className={`mt-1 ${FIELD_CLASS}`}
                  >
                    <option value="" disabled>
                      Choose a reason…
                    </option>
                    {WHY_MISSED_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {whyOption && (
                    <div className="mt-2">
                      <label
                        htmlFor={`rcs-why-detail-${row.taxYear}`}
                        className="block text-xs font-medium text-slate-600"
                      >
                        {whyOption.key === "other"
                          ? "Explain in your own words"
                          : whyOption.detailRequired
                            ? "Briefly describe what happened"
                            : "Add details (optional)"}
                      </label>
                      <textarea
                        id={`rcs-why-detail-${row.taxYear}`}
                        rows={whyOption.detailRequired ? 3 : 2}
                        value={sel.why.detail}
                        onChange={(e) => updateWhy(row.taxYear, { detail: e.target.value })}
                        placeholder={
                          whyOption.key === "other"
                            ? "E.g. I moved countries that year and my mail was not forwarded."
                            : whyOption.key === "hardship"
                              ? "E.g. I was in hospital from March to June 2024."
                              : "Anything the IRS should know about your situation."
                        }
                        className={`mt-1 ${FIELD_CLASS}`}
                      />
                    </div>
                  )}
                  {errors[`${prefix}.rcsWhyMissed`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`${prefix}.rcsWhyMissed`]}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`rcs-when-${row.taxYear}`}
                    className="block text-sm font-medium text-slate-700"
                  >
                    How and when did you find out that this form was required?
                  </label>
                  <div className="mt-1 grid gap-2 sm:grid-cols-[1fr_11rem]">
                    <select
                      id={`rcs-when-${row.taxYear}`}
                      value={sel.when.source}
                      onChange={(e) =>
                        updateWhen(row.taxYear, {
                          source: e.target.value as WhenLearnedSelection["source"],
                        })
                      }
                      className={FIELD_CLASS}
                    >
                      <option value="" disabled>
                        Choose one…
                      </option>
                      {LEARNED_SOURCE_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="month"
                      aria-label={`Month you found out (tax year ${row.taxYear})`}
                      value={sel.when.month}
                      max={maxMonth}
                      onChange={(e) => updateWhen(row.taxYear, { month: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>
                  {sel.when.source && (
                    <div className="mt-2">
                      <label
                        htmlFor={`rcs-when-detail-${row.taxYear}`}
                        className="block text-xs font-medium text-slate-600"
                      >
                        {whenIsOther ? "Tell us how and when you found out" : "Add details (optional)"}
                      </label>
                      <textarea
                        id={`rcs-when-detail-${row.taxYear}`}
                        rows={2}
                        value={sel.when.detail}
                        onChange={(e) => updateWhen(row.taxYear, { detail: e.target.value })}
                        placeholder={
                          whenIsOther
                            ? "E.g. A friend with a U.S. LLC mentioned it in early 2026."
                            : "Optional."
                        }
                        className={`mt-1 ${FIELD_CLASS}`}
                      />
                    </div>
                  )}
                  {errors[`${prefix}.rcsWhenLearned`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`${prefix}.rcsWhenLearned`]}</p>
                  )}
                </div>

                {preview && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">What your statement will say</p>
                    <p className="mt-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                      {preview}
                    </p>
                  </div>
                )}

                <label className="flex items-start gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={row.rcsNoIrsNoticeConfirmed}
                    onChange={(e) =>
                      update(row.taxYear, { rcsNoIrsNoticeConfirmed: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                  />
                  <span>
                    I confirm I have not received an IRS notice about this {row.taxYear} return.
                  </span>
                </label>
                {errors[`${prefix}.rcsNoIrsNoticeConfirmed`] && (
                  <p className="text-xs text-red-600">
                    {errors[`${prefix}.rcsNoIrsNoticeConfirmed`]}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => void submit()} disabled={saving}>
          {saving ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
