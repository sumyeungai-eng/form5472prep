"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  WHY_MISSED_OPTIONS,
  composeWhyMissed,
  parseWhyMissed,
  validateWhySelection,
  type WhyMissedSelection,
} from "@/lib/reasonableCauseOptions";

export type ReasonableCauseYearInput = {
  taxYear: number;
  rcsWhyMissed: string;
  /** No longer asked; an earlier saved answer is passed through unchanged. */
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
    if (row.rcsNoIrsNoticeConfirmed !== true) {
      errors[`${prefix}.rcsNoIrsNoticeConfirmed`] =
        `Confirm you have not received an IRS notice about this ${row.taxYear} return.`;
    }
  }
  return errors;
}

const FIELD_CLASS =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

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
  const [selections, setSelections] = useState<Record<number, WhyMissedSelection>>(() =>
    Object.fromEntries(years.map((row) => [row.taxYear, parseWhyMissed(row.rcsWhyMissed)])),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const sortedRows = useMemo(() => rows.slice().sort((a, b) => a.taxYear - b.taxYear), [rows]);

  function clearErrors(taxYear: number, keys: string[]) {
    setErrors((current) => {
      const next = { ...current };
      for (const key of keys) delete next[`${taxYear}.${key}`];
      return next;
    });
  }

  function setSelection(taxYear: number, next: WhyMissedSelection) {
    setSelections((current) => ({ ...current, [taxYear]: next }));
    setRows((current) =>
      current.map((row) =>
        row.taxYear === taxYear ? { ...row, rcsWhyMissed: composeWhyMissed(next) } : row,
      ),
    );
    clearErrors(taxYear, ["rcsWhyMissed"]);
  }

  function updateWhy(taxYear: number, patch: Partial<WhyMissedSelection>) {
    setSelection(taxYear, { ...selections[taxYear], ...patch });
  }

  function copyFrom(fromYear: number, toYear: number) {
    setSelection(toYear, { ...selections[fromYear] });
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
      ...rows.map((row) => validateWhySelection(row.taxYear, selections[row.taxYear])),
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
          This return is being filed after its due date, so the IRS needs a short explanation. Pick
          the reason that fits best, or choose &ldquo;Other&rdquo; and write your own.
        </p>
      </div>

      <div className="space-y-4">
        {sortedRows.map((row, index) => {
          const prefix = String(row.taxYear);
          const sel = selections[row.taxYear];
          const whyOption = WHY_MISSED_OPTIONS.find((o) => o.key === sel.key);
          const previousYear = index > 0 ? sortedRows[index - 1].taxYear : null;
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
                    value={sel.key}
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
                        value={sel.detail}
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

                {whyOption && (!whyOption.detailRequired || sel.detail.trim()) && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    <p className="font-medium">That&apos;s all we need for {row.taxYear}.</p>
                    <p className="mt-1 text-emerald-800">
                      We&apos;ll turn your answer into a formal reasonable-cause statement and attach it
                      to your filing package. A qualified accountant reviews it before anything is
                      submitted.
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
