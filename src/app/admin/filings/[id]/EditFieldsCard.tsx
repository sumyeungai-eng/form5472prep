"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Whitelisted fields the admin can edit on a filing. Mirrors the server
// allowlist in /api/admin/filings/[id]/route.ts (action="updateField"). Each
// entry: column key, label, control type.
const BOOLEAN_OPTIONS = [
  { value: "", label: "Not recorded" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const PRIOR_FORM_OPTIONS = [
  { value: "", label: "Not recorded" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

const FIELDS: Array<{
  key: string;
  label: string;
  kind?: "text" | "textarea" | "number" | "select";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}> = [
  { key: "llcName", label: "LLC name" },
  { key: "llcEin", label: "LLC EIN", placeholder: "12-3456789" },
  { key: "llcAddress", label: "LLC address" },
  { key: "llcCity", label: "LLC city" },
  { key: "llcState", label: "LLC state" },
  { key: "llcZip", label: "LLC ZIP" },
  { key: "llcCountry", label: "LLC country" },
  { key: "llcCountryBusiness", label: "LLC country of business" },
  { key: "llcMemberCount", label: "LLC member count", kind: "number" },
  { key: "llcAddressIsRegisteredAgentOnly", label: "LLC address is registered agent only (no other U.S. presence)", kind: "select", options: BOOLEAN_OPTIONS },
  { key: "llcBusinessActivity", label: "LLC business activity" },
  { key: "llcBusinessCode", label: "LLC business code (NAICS)" },
  { key: "ownerName", label: "Owner name" },
  { key: "ownerAddress", label: "Owner address (single line)" },
  { key: "ownerAddressStreet", label: "Owner street (printed on Form 5472 line 4a)" },
  { key: "ownerAddressCity", label: "Owner city" },
  { key: "ownerAddressState", label: "Owner state / province" },
  { key: "ownerAddressPostal", label: "Owner postal code" },
  { key: "ownerAddressCountry", label: "Owner address country" },
  { key: "ownerHasFtin", label: "Owner has FTIN", kind: "select", options: BOOLEAN_OPTIONS },
  { key: "ownerNoPostalCode", label: "Owner has no postal code", kind: "select", options: BOOLEAN_OPTIONS },
  { key: "ownerCountryCitizenship", label: "Owner country of citizenship" },
  { key: "ownerCountryTaxResidence", label: "Owner country of tax residence" },
  { key: "ownerCountryBusiness", label: "Owner country of business" },
  { key: "ownerFtin", label: "Owner FTIN" },
  { key: "ownerItin", label: "Owner ITIN" },
  { key: "ownerReferenceId", label: "Owner Reference ID" },
  { key: "priorForm5472Filed", label: "Prior Form 5472 filed", kind: "select", options: PRIOR_FORM_OPTIONS },
  { key: "hasUsSourceIncome", label: "Has US-source income", kind: "select", options: BOOLEAN_OPTIONS },
  { key: "usTaxWithheld", label: "US tax withheld", kind: "select", options: BOOLEAN_OPTIONS },
  // Legacy order-level customer text. Never printed (rules doc H4): the RCS
  // cause narrative comes only from each year's "RCS narrative (admin)".
  { key: "reasonableCauseNarrative", label: "Customer's reasonable-cause message (never printed)", kind: "textarea" },
];

// Generator 2.3.0: per-order paid preparer block (spec item 8). Staff-only.
const PREPARER_FIELDS: Array<{
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}> = [
  {
    key: "paidPreparerMode",
    label: "Paid preparer",
    options: [
      { value: "", label: "None (block left blank)" },
      { value: "house", label: "House preparer" },
    ],
    hint: "House preparer fills the Form 1120 “Paid Preparer Use Only” block on every year from the HOUSE_PREPARER_* settings. Signature, date and self-employed box stay blank.",
  },
  {
    key: "irsMayDiscussWithPreparer",
    label: "May the IRS discuss this return with the preparer?",
    options: [
      { value: "", label: "Blank" },
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    hint: "Only printed when a preparer is shown.",
  },
];

const SMALL_CORP_OPTIONS = [
  { value: "", label: "Auto (on when the conditions are met)" },
  { value: "true", label: "On" },
  { value: "false", label: "Off" },
];

// Per-year fields. The customer's own explanation (rcsWhyMissed /
// rcsWhenLearned) is shown read-only beside the narrative instead: it is
// source material for the admin and is never printed.
const YEAR_FIELDS: ReadonlyArray<{
  key: YearFieldKey;
  label: string;
  kind: "narrative" | "date" | "select" | "json";
  options?: Array<{ value: string; label: string }>;
  hint?: string;
}> = [
  {
    key: "rcsAdminNarrative",
    label: "RCS narrative (admin)",
    kind: "narrative",
    hint: "Printed as the cause section of this year's reasonable cause statement. First person (\"I formed…\"). Blank line = new paragraph. No questions, notes to us or \"I prepared\".",
  },
  {
    key: "rcsLearnedOn",
    label: "Learned of requirement on",
    kind: "date",
    hint: "When this is after the year's due date, a later late year's RCS says the owner was still unaware then.",
  },
  {
    key: "rcsSmallCorpParagraph",
    label: "Small-corporation paragraph",
    kind: "select",
    options: SMALL_CORP_OPTIONS,
  },
  { key: "rcsNoIrsNoticeConfirmed", label: "No IRS notice confirmed", kind: "select", options: BOOLEAN_OPTIONS },
  { key: "nonCashTransfers", label: "Non-cash transfers", kind: "json" },
  { key: "ownerPaidCosts", label: "Owner-paid costs", kind: "json" },
  { key: "zeroConfirmations", label: "Zero confirmations", kind: "json" },
];

type YearFieldKey =
  | "rcsAdminNarrative"
  | "rcsLearnedOn"
  | "rcsSmallCorpParagraph"
  | "rcsNoIrsNoticeConfirmed"
  | "nonCashTransfers"
  | "ownerPaidCosts"
  | "zeroConfirmations";

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
  years: Array<{
    taxYear: number;
    rcsWhyMissed: string | null;
    rcsWhenLearned: string | null;
    rcsNoIrsNoticeConfirmed: boolean | null;
    // Generator 2.3.0 admin RCS fields (rcsLearnedOn as YYYY-MM-DD).
    rcsAdminNarrative: string | null;
    rcsLearnedOn: string | null;
    rcsSmallCorpParagraph: boolean | null;
    // The package treats this year as late (it gets a reasonable cause statement).
    packageLate?: boolean;
    nonCashTransfers: unknown;
    ownerPaidCosts: unknown;
    zeroConfirmations: unknown;
  }>;
  // HOUSE_PREPARER_* config status, so the admin sees why "House preparer"
  // would fail pre-flight before choosing it.
  housePreparerConfig?: { complete: boolean; missing: string[]; invalid: string[] };
};

type SaveResponse = {
  preflight?: { ran?: boolean; status?: string; failures?: Array<{ id: string }>; message?: string; overrideCleared?: boolean };
};

// What the automatic pre-flight re-run after a save found, in one line.
export function preflightRerunNote(body: SaveResponse): string {
  const rerun = body.preflight;
  if (!rerun) return "";
  if (rerun.ran === false) return ` Pre-flight was not re-run: ${rerun.message ?? "unknown reason"}.`;
  if (rerun.status === "passed") return " Pre-flight re-ran and passed.";
  const ids = Array.from(new Set((rerun.failures ?? []).map((f) => f.id)));
  return ` Pre-flight re-ran and failed${ids.length > 0 ? ` (${ids.join(", ")})` : ""}.${rerun.overrideCleared ? " The recorded override was cleared." : ""}`;
}

export function EditFieldsCard({ filingId, initial, years, housePreparerConfig }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Values are stored as strings; null DB values render as "".
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      [...FIELDS, ...EXTENSION_FIELDS, ...PREPARER_FIELDS].map((f) => [f.key, initial[f.key] ?? ""]),
    ),
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ key: string; kind: "ok" | "err"; text: string } | null>(null);
  const [reason, setReason] = useState("");
  const [yearValues, setYearValues] = useState<Record<string, string>>(() => {
    const entries: Array<[string, string]> = [];
    for (const year of years) {
      for (const field of YEAR_FIELDS) {
        entries.push([yearKey(year.taxYear, field.key), yearDisplayValue(year, field.key)]);
      }
    }
    return Object.fromEntries(entries);
  });
  const [yearInitial, setYearInitial] = useState<Record<string, string>>(() => ({ ...yearValues }));

  function dirty(key: string): boolean {
    return values[key] !== (initial[key] ?? "");
  }

  function yearDirty(taxYear: number, field: string): boolean {
    const key = yearKey(taxYear, field);
    return yearValues[key] !== (yearInitial[key] ?? "");
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
      const body = (await res.json().catch(() => ({}))) as SaveResponse;
      setMsg({ key, kind: "ok", text: `Saved.${preflightRerunNote(body)} Regenerate the PDF to update it.` });
      // Update initial to the new value so dirty() goes false again.
      initial[key] = values[key].trim() || null;
      setSavingKey(null);
      startTransition(() => router.refresh());
    } catch (e) {
      setMsg({ key, kind: "err", text: e instanceof Error ? e.message : "Network error" });
      setSavingKey(null);
    }
  }

  async function saveYear(taxYear: number, field: string) {
    const key = yearKey(taxYear, field);
    setMsg(null);
    setSavingKey(key);

    let value: unknown = yearValues[key] ?? "";
    // The narrative keeps its line breaks (paragraphs); blank means "not written".
    if (field === "rcsAdminNarrative") value = String(value).trim() === "" ? null : String(value).replace(/\s+$/, "");
    if (YEAR_FIELDS.find((f) => f.key === field)?.kind === "json") {
      const raw = String(value).trim();
      if (!raw) {
        value = null;
      } else {
        try {
          value = JSON.parse(raw);
        } catch {
          setMsg({ key, kind: "err", text: "JSON is invalid." });
          setSavingKey(null);
          return;
        }
      }
    }

    try {
      const res = await fetch(`/api/admin/filings/${filingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateYearField",
          taxYear,
          field,
          value,
          reason: reason.trim() || `Admin edit on ${new Date().toISOString().slice(0, 10)}`,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        setMsg({ key, kind: "err", text: err || `HTTP ${res.status}` });
        setSavingKey(null);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as SaveResponse;
      setMsg({ key, kind: "ok", text: `Saved.${preflightRerunNote(body)} Regenerate the PDF to update it.` });
      setYearInitial((current) => ({ ...current, [key]: yearValues[key] ?? "" }));
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
        Each save is logged to the change log and re-runs pre-flight on the new data.
        Then click <strong>Regenerate PDF</strong> in the Actions card above so the
        PDF reflects the new values.
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
                {f.kind === "textarea" ? (
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
                ) : f.kind === "select" ? (
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
                    type={f.kind === "number" ? "number" : "text"}
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

      <div className="rounded-md border border-slate-200 p-3 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-900">Paid preparer (Form 1120)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Optional per order. House preparer config:{" "}
            {housePreparerConfig?.complete
              ? "complete."
              : `incomplete${
                  housePreparerConfig
                    ? ` (${[
                        housePreparerConfig.missing.length > 0 ? `missing ${housePreparerConfig.missing.join(", ")}` : "",
                        housePreparerConfig.invalid.length > 0 ? `invalid ${housePreparerConfig.invalid.join(", ")}` : "",
                      ]
                        .filter(Boolean)
                        .join("; ")})`
                    : ""
                } — choosing House preparer fails pre-flight until it is set.`}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {PREPARER_FIELDS.map((f) => {
            const isDirty = dirty(f.key);
            const isSaving = savingKey === f.key;
            const fieldMsg = msg?.key === f.key ? msg : null;
            return (
              <div key={f.key} className="space-y-1">
                <label className="block text-xs">
                  <span className="block text-slate-600 font-medium mb-1">{f.label}</span>
                  <select
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    disabled={pending || isSaving}
                    className={`w-full px-2 py-1.5 text-sm border rounded-md bg-white ${
                      isDirty ? "border-accent" : "border-slate-300"
                    }`}
                  >
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
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
                    <span className={`text-xs ${fieldMsg.kind === "ok" ? "text-emerald-700" : "text-red-700"}`}>
                      {fieldMsg.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 p-3 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-900">
            Per-year reasonable-cause and transaction fields
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Edits are saved per tax year, re-run pre-flight, and are included the next time the PDF package is regenerated.
          </p>
        </div>
        {years.length === 0 ? (
          <p className="text-xs text-slate-500">No per-year rows exist for this filing.</p>
        ) : (
          <div className="space-y-4">
            {years.map((year) => (
              <div key={year.taxYear} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  Tax year {year.taxYear}
                  {year.packageLate ? (
                    <span className="ml-2 font-normal text-amber-800">
                      Late per package — the reasonable cause statement needs an admin narrative.
                    </span>
                  ) : null}
                </h4>
                <CustomerExplanation
                  whyMissed={year.rcsWhyMissed}
                  whenLearned={year.rcsWhenLearned}
                  onCopy={() => {
                    const key = yearKey(year.taxYear, "rcsAdminNarrative");
                    setYearValues((v) => ({
                      ...v,
                      [key]: narrativeDraftFrom(v[key] ?? "", year.rcsWhyMissed, year.rcsWhenLearned),
                    }));
                  }}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  {YEAR_FIELDS.map((f) => {
                    const key = yearKey(year.taxYear, f.key);
                    const isDirty = yearDirty(year.taxYear, f.key);
                    const isSaving = savingKey === key;
                    const fieldMsg = msg?.key === key ? msg : null;
                    return (
                      <div key={key} className={`space-y-1 ${f.kind === "narrative" ? "sm:col-span-2" : ""}`}>
                        <label className="block text-xs">
                          <span className="block text-slate-600 font-medium mb-1">{f.label}</span>
                          {f.kind === "select" ? (
                            <select
                              value={yearValues[key] ?? ""}
                              onChange={(e) => setYearValues((v) => ({ ...v, [key]: e.target.value }))}
                              disabled={pending || isSaving}
                              className={`w-full px-2 py-1.5 text-sm border rounded-md bg-white ${
                                isDirty ? "border-accent" : "border-slate-300"
                              }`}
                            >
                              {(f.options ?? BOOLEAN_OPTIONS).map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          ) : f.kind === "date" ? (
                            <input
                              type="date"
                              value={yearValues[key] ?? ""}
                              onChange={(e) => setYearValues((v) => ({ ...v, [key]: e.target.value }))}
                              disabled={pending || isSaving}
                              className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                                isDirty ? "border-accent" : "border-slate-300"
                              }`}
                            />
                          ) : (
                            <textarea
                              value={yearValues[key] ?? ""}
                              onChange={(e) => setYearValues((v) => ({ ...v, [key]: e.target.value }))}
                              disabled={pending || isSaving}
                              rows={f.kind === "json" ? 7 : f.kind === "narrative" ? 8 : 3}
                              spellCheck={f.kind !== "json"}
                              className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                                f.kind === "json" ? "font-mono" : ""
                              } ${isDirty ? "border-accent" : "border-slate-300"}`}
                            />
                          )}
                        </label>
                        {f.hint && <p className="text-[11px] text-slate-500">{f.hint}</p>}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveYear(year.taxYear, f.key)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function yearKey(taxYear: number, field: string): string {
  return `${taxYear}:${field}`;
}

// The customer's own explanation for a late year: shown read-only beside the
// narrative, never printed. "Copy into narrative draft" puts it in the
// narrative box for the admin to rewrite (in the first person, without
// questions to us) and save; nothing is saved by copying.
function CustomerExplanation({
  whyMissed,
  whenLearned,
  onCopy,
}: {
  whyMissed: string | null;
  whenLearned: string | null;
  onCopy: () => void;
}) {
  const has = !!(whyMissed?.trim() || whenLearned?.trim());
  return (
    <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-slate-700">Customer&apos;s explanation (never printed)</span>
        {has && (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
          >
            Copy into narrative draft
          </button>
        )}
      </div>
      {has ? (
        <dl className="mt-1.5 space-y-1 text-slate-700">
          {whyMissed?.trim() ? (
            <div>
              <dt className="inline font-medium">Why missed: </dt>
              <dd className="inline whitespace-pre-wrap">{whyMissed}</dd>
            </div>
          ) : null}
          {whenLearned?.trim() ? (
            <div>
              <dt className="inline font-medium">When learned: </dt>
              <dd className="inline whitespace-pre-wrap">{whenLearned}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-1 text-slate-400">The customer gave no explanation for this year.</p>
      )}
    </div>
  );
}

// Draft text for the narrative box: what is already there, then the customer's
// words. The admin edits it before saving; pre-flight blocks questions and
// notes addressed to us if any survive.
export function narrativeDraftFrom(current: string, whyMissed: string | null, whenLearned: string | null): string {
  const customer = [whyMissed?.trim(), whenLearned?.trim()].filter(Boolean).join("\n\n");
  if (!customer) return current;
  return current.trim() ? `${current.replace(/\s+$/, "")}\n\n${customer}` : customer;
}

function yearDisplayValue(
  year: Props["years"][number],
  field: YearFieldKey,
): string {
  const value = year[field];
  if (value === null || value === undefined) return "";
  if (field === "nonCashTransfers" || field === "ownerPaidCosts" || field === "zeroConfirmations") {
    return JSON.stringify(value, null, 2);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}
