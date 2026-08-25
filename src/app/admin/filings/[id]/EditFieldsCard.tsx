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

// ─── Form 7004 extension group ──────────────────────────────────────────────
// The remediation path for orders sold BEFORE the extension question existed:
// a customer writes in "I filed a 7004 on April 10" and the facts get recorded
// here, with isDiirsp recomputed server-side, instead of a wizard round-trip or
// a re-purchase. These are closed enums plus one date — free text would let an
// admin store a value the rest of the app cannot read back — so they get
// selects, not the text inputs above. Same save() / same updateField action.
const EXTENSION_FIELDS: Array<{
  key: string;
  label: string;
  kind: "select" | "date";
  options?: Array<{ value: string; label: string }>;
  hint?: string;
}> = [
  {
    key: "extensionFiled",
    label: "Form 7004 filed?",
    kind: "select",
    options: [
      { value: "", label: "— not recorded" },
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" },
    ],
    // Saving anything other than "yes" also clears the three fields below and
    // any uploaded proof — that cascade happens server-side, in one transaction.
    hint: "Anything but “Yes” clears the date, method, destination and proof.",
  },
  {
    key: "extensionTransmittedAt",
    label: "Date the 7004 was sent",
    kind: "date",
    hint: "Save this BEFORE setting “Yes” — a yes with no date is rejected.",
  },
  {
    key: "extensionMethod",
    label: "How it was sent",
    kind: "select",
    options: [
      { value: "", label: "— not recorded" },
      { value: "fax", label: "Fax" },
      { value: "certified_mail", label: "Certified mail" },
      { value: "mail", label: "Regular mail" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    key: "extensionDestination",
    label: "Where it was sent",
    kind: "select",
    options: [
      { value: "", label: "— not recorded" },
      { value: "ogden", label: "Ogden (foreign-owned DE address/fax)" },
      { value: "standard", label: "Standard Form 7004 address" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    key: "isDiirsp",
    label: "Late filing (isDiirsp)",
    kind: "select",
    options: [
      { value: "", label: "Auto — derived from the extension facts" },
      { value: "true", label: "Yes — late, reasonable-cause statement" },
      { value: "false", label: "No — timely" },
    ],
    // Left on "Auto" the field is never sent, so the server's recompute governs.
    // Choosing Yes/No writes it explicitly and that manual value then survives
    // subsequent extension edits.
    hint: "Manual override. Leave on Auto unless the derived answer is wrong.",
  },
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
    Object.fromEntries(
      [...FIELDS, ...EXTENSION_FIELDS].map((f) => [f.key, initial[f.key] ?? ""]),
    ),
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

      <div className="rounded-md border border-slate-200 p-3 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-900">Form 7004 extension</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Each control saves on its own, through the same change-logged action. The
            server enforces the grouped rules (a “Yes” needs a date; anything else
            clears the details) and recomputes the late/timely classification unless
            you override it below.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {EXTENSION_FIELDS.map((f) => {
            const isDirty = dirty(f.key);
            const isSaving = savingKey === f.key;
            const fieldMsg = msg?.key === f.key ? msg : null;
            return (
              <div key={f.key} className="space-y-1">
                <label className="block text-xs">
                  <span className="block text-slate-600 font-medium mb-1">{f.label}</span>
                  {f.kind === "select" ? (
                    <select
                      value={values[f.key]}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      disabled={pending || isSaving}
                      className={`w-full px-2 py-1.5 text-sm border rounded-md bg-white ${
                        isDirty ? "border-accent" : "border-slate-300"
                      }`}
                    >
                      {f.options!.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="date"
                      value={values[f.key]}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      disabled={pending || isSaving}
                      className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                        isDirty ? "border-accent" : "border-slate-300"
                      }`}
                    />
                  )}
                </label>
                {f.hint && <p className="text-[11px] text-slate-500">{f.hint}</p>}
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
    </div>
  );
}
