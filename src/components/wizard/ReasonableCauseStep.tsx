"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const REASONS = [
  {
    key: "unaware",
    label: "I was unaware of the requirement",
    template:
      "The taxpayer was unaware of the Form 5472 filing requirement applicable to foreign-owned U.S. disregarded entities. Upon learning of the requirement, the taxpayer acted promptly and in good faith to come into compliance by preparing and submitting this filing under the Delinquent International Information Return Submission Procedures. The failure was not willful and no U.S. tax was due for the year(s) at issue.",
  },
  {
    key: "preparer",
    label: "My prior preparer didn't advise me of this requirement",
    template:
      "The taxpayer relied in good faith on a tax professional who did not advise the taxpayer of the Form 5472 filing requirement applicable to foreign-owned U.S. disregarded entities. Upon learning of the requirement from another source, the taxpayer acted promptly to come into compliance under the Delinquent International Information Return Submission Procedures. The failure was not willful and no U.S. tax was due for the year(s) at issue.",
  },
  {
    key: "personal",
    label: "Personal circumstances (illness, family, relocation)",
    template:
      "The taxpayer was unable to timely meet the Form 5472 filing requirement due to extenuating personal circumstances during the period in question. Upon being able to address the matter, the taxpayer acted promptly to come into compliance under the Delinquent International Information Return Submission Procedures. The failure was not willful and no U.S. tax was due for the year(s) at issue.",
  },
  {
    key: "admin",
    label: "Administrative oversight by my team",
    template:
      "The taxpayer experienced an administrative oversight that resulted in the Form 5472 filing requirement not being met on a timely basis. Upon identifying the oversight, the taxpayer implemented corrective procedures and acted promptly to come into compliance under the Delinquent International Information Return Submission Procedures. The failure was not willful and no U.S. tax was due for the year(s) at issue.",
  },
];

export function ReasonableCauseStep({
  initial,
  onSubmit,
  onBack,
  saving,
}: {
  initial: string;
  onSubmit: (text: string) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  // Try to recognise which reason matches the saved narrative; otherwise treat as custom.
  const matchedKey =
    REASONS.find((r) => initial.startsWith(r.template.slice(0, 40)))?.key ?? null;
  const [reasonKey, setReasonKey] = useState<string | null>(matchedKey ?? "unaware");
  const [extra, setExtra] = useState(matchedKey ? initial.slice(REASONS.find((r) => r.key === matchedKey)!.template.length).trim() : initial ? initial : "");

  function buildText(): string {
    if (!reasonKey) return extra.trim();
    const base = REASONS.find((r) => r.key === reasonKey)?.template ?? "";
    return [base, extra.trim()].filter(Boolean).join("\n\n");
  }

  // Keep textarea preview in sync if user switches reason.
  const [preview, setPreview] = useState(buildText());
  useEffect(() => {
    setPreview(buildText());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reasonKey, extra]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Reasonable cause statement</h2>
        <p className="text-sm text-slate-500 mt-1">
          The IRS needs a written explanation of why the filing is late. Pick the closest reason
          and add any specifics. We&apos;ll attach this statement to your package.
        </p>
      </div>

      <div className="space-y-2">
        {REASONS.map((r) => (
          <label
            key={r.key}
            className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer ${
              reasonKey === r.key
                ? "border-accent bg-accent-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="reason"
              value={r.key}
              checked={reasonKey === r.key}
              onChange={() => setReasonKey(r.key)}
              className="mt-1"
            />
            <span className="text-sm text-slate-900">{r.label}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Optional: add specifics
        </label>
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          rows={3}
          placeholder="E.g. 'I learned about the requirement in March 2025 while preparing my LLC's first tax return.'"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">Preview — final statement</p>
        <div className="rounded-md bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {preview || <em className="text-slate-400">Pick a reason above.</em>}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => onSubmit(preview)} disabled={saving || !preview}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
