"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const sortedRows = useMemo(() => rows.slice().sort((a, b) => a.taxYear - b.taxYear), [rows]);

  function update(taxYear: number, patch: Partial<ReasonableCauseYearInput>) {
    setRows((current) =>
      current.map((row) => (row.taxYear === taxYear ? { ...row, ...patch } : row)),
    );
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[`${taxYear}.${key}`];
      return next;
    });
  }

  async function submit() {
    const nextErrors = validateReasonableCauseYears(rows);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit(rows);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Reasonable cause statement</h2>
        <p className="text-sm text-slate-500 mt-1">
          This return is being filed after its due date. We include a reasonable-cause statement explaining why.
        </p>
      </div>

      <div className="space-y-4">
        {sortedRows.map((row) => {
          const prefix = String(row.taxYear);
          return (
            <section
              key={row.taxYear}
              className="rounded-md border border-slate-200 bg-white p-4"
              aria-labelledby={`rcs-heading-${row.taxYear}`}
            >
              <h3 id={`rcs-heading-${row.taxYear}`} className="text-sm font-semibold text-slate-900">
                Tax year {row.taxYear}
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor={`rcs-why-${row.taxYear}`}
                    className="block text-sm font-medium text-slate-700"
                  >
                    Why was the filing for {row.taxYear} missed?
                  </label>
                  <textarea
                    id={`rcs-why-${row.taxYear}`}
                    rows={4}
                    value={row.rcsWhyMissed}
                    onChange={(e) => update(row.taxYear, { rcsWhyMissed: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {errors[`${prefix}.rcsWhyMissed`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`${prefix}.rcsWhyMissed`]}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`rcs-when-${row.taxYear}`}
                    className="block text-sm font-medium text-slate-700"
                  >
                    When did you learn that this form was required?
                  </label>
                  <textarea
                    id={`rcs-when-${row.taxYear}`}
                    rows={3}
                    value={row.rcsWhenLearned}
                    onChange={(e) => update(row.taxYear, { rcsWhenLearned: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {errors[`${prefix}.rcsWhenLearned`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`${prefix}.rcsWhenLearned`]}</p>
                  )}
                </div>

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
