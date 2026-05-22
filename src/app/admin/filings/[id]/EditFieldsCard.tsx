"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Whitelisted fields the admin can edit on a filing. Mirrors the server
// allowlist in /api/admin/filings/[id]/route.ts (action="updateField"). Each
// entry: column key, label, multiline?
const FIELDS: Array<{ key: string; label: string; multiline?: boolean; placeholder?: string }> = [
  { key: "llcName", label: "LLC name" },
  { key: "llcEin", label: "LLC EIN", placeholder: "12-3456789" },
  { key: "llcAddress", label: "LLC address" },
  { key: "llcCity", label: "LLC city" },
  { key: "llcState", label: "LLC state" },
  { key: "llcZip", label: "LLC ZIP" },
  { key: "llcCountry", label: "LLC country" },
  { key: "llcBusinessActivity", label: "LLC business activity" },
  { key: "llcBusinessCode", label: "LLC business code (NAICS)" },
  { key: "ownerName", label: "Owner name" },
  { key: "ownerAddress", label: "Owner address (single line)" },
  { key: "ownerCountryCitizenship", label: "Owner country of citizenship" },
  { key: "ownerCountryTaxResidence", label: "Owner country of tax residence" },
  { key: "ownerCountryBusiness", label: "Owner country of business" },
  { key: "ownerFtin", label: "Owner FTIN" },
  { key: "ownerItin", label: "Owner ITIN" },
  { key: "ownerReferenceId", label: "Owner Reference ID" },
  { key: "reasonableCauseNarrative", label: "Reasonable cause narrative (DIIRSP)", multiline: true },
];

type Props = {
  filingId: string;
  initial: Record<string, string | null>;
};

export function EditFieldsCard({ filingId, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Values are stored as strings; null DB values render as "".
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, initial[f.key] ?? ""])),
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ key: string; kind: "ok" | "err"; text: string } | null>(null);
  const [reason, setReason] = useState("");

  function dirty(key: string): boolean {
    return values[key] !== (initial[key] ?? "");
  }

  async function save(key: string) {
    setMsg(null);
    setSavingKey(key);
    try {
      const res = await fetch(`/api/admin/filings/${filingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateField",
          field: key,
          value: values[key].trim() || null,
          reason: reason.trim() || `Admin edit on ${new Date().toISOString().slice(0, 10)}`,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        setMsg({ key, kind: "err", text: err || `HTTP ${res.status}` });
        setSavingKey(null);
        return;
      }
      setMsg({ key, kind: "ok", text: "Saved. Remember to regenerate the PDF." });
      // Update initial to the new value so dirty() goes false again.
      initial[key] = values[key].trim() || null;
      setSavingKey(null);
      startTransition(() => router.refresh());
    } catch (e) {
      setMsg({ key, kind: "err", text: e instanceof Error ? e.message : "Network error" });
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
        After editing, click <strong>Regenerate PDF</strong> in the Actions card above
        so the unsigned PDF reflects the new values. Each save is logged to the
        change log below.
      </div>

      <label className="block text-xs">
        <span className="block text-slate-500 mb-1">Reason (optional — saved to change log)</span>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Customer emailed to say EIN was wrong"
          className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md"
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        {FIELDS.map((f) => {
          const isDirty = dirty(f.key);
          const isSaving = savingKey === f.key;
          const fieldMsg = msg?.key === f.key ? msg : null;
          return (
            <div key={f.key} className="space-y-1">
              <label className="block text-xs">
                <span className="block text-slate-600 font-medium mb-1">{f.label}</span>
                {f.multiline ? (
                  <textarea
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    disabled={pending || isSaving}
                    rows={3}
                    placeholder={f.placeholder}
                    className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                      isDirty ? "border-accent" : "border-slate-300"
                    }`}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    disabled={pending || isSaving}
                    placeholder={f.placeholder}
                    className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                      isDirty ? "border-accent" : "border-slate-300"
                    }`}
                  />
                )}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => save(f.key)}
                  disabled={!isDirty || isSaving || pending}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                </button>
                {fieldMsg && (
                  <span
                    className={`text-xs ${
                      fieldMsg.kind === "ok" ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {fieldMsg.text}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
