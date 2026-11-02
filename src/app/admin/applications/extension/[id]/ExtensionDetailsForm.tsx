"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type ExtensionDetails = {
  llcName: string;
  ein: string;
  llcStreet: string;
  llcCity: string;
  llcState: string;
  llcZip: string;
  taxYear: string;
  fullName: string;
  email: string;
};

const FIELDS: Array<[keyof ExtensionDetails, string]> = [
  ["llcName", "LLC name"],
  ["ein", "EIN (9 digits)"],
  ["llcStreet", "Street (number, street, suite)"],
  ["llcCity", "City"],
  ["llcState", "State"],
  ["llcZip", "ZIP"],
  ["taxYear", "Tax year"],
  ["fullName", "Contact name"],
  ["email", "Contact email"],
];

// Staff correct what the customer typed (customers may pay with missing or
// wrong data). Changing a field printed on the form clears the generated 7004.
export function ExtensionDetailsForm({ id, initial }: { id: string; initial: ExtensionDetails }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/applications/extension/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // Tax year goes as typed: the server rejects anything that is not a year (never silently clears it).
      body: JSON.stringify({ ...values, taxYear: values.taxYear.trim() || null }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => null) : null;
    setSaving(false);
    setMessage(res?.ok ? "Saved ✓" : typeof body?.error === "string" ? body.error : "Could not save — try again.");
    if (res?.ok) router.refresh();
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Edit order details</h2>
        <p className="mt-1 text-xs text-slate-500">
          Use the LLC name, EIN and address exactly as on IRS records. Changes are logged in the internal notes; changing a
          field printed on the form clears the generated Form 7004.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(([key, label]) => (
          <label key={key} className="block text-xs font-medium text-slate-600">
            <span className="mb-1 block">{label}</span>
            <input
              value={values[key]}
              inputMode={key === "taxYear" ? "numeric" : undefined}
              onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save details
      </button>
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
