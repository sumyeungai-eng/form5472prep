"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { fitsCell, SS4_CELL_WIDTHS, ss4FitWarnings } from "@/lib/pdf/ss4Fit";
import { ss4Warnings, toFormText, unencodableChars, type Ss4Options } from "@/lib/pdf/ss4Options";

type Props = {
  id: string;
  llcName: string;
  options: Ss4Options;
  hasPrepared: boolean;
  preparedSource: string | null;
  hasSignature: boolean;
};

type TextKey = {
  [K in keyof Ss4Options]: Ss4Options[K] extends string ? K : never;
}[keyof Ss4Options];
type BooleanKey = {
  [K in keyof Ss4Options]: Ss4Options[K] extends boolean ? K : never;
}[keyof Ss4Options];

const ENTITY_TYPES = [
  ["other", "Other"],
  ["sole_proprietor", "Sole proprietor"],
  ["partnership", "Partnership"],
  ["corporation", "Corporation"],
] as const;

const REASONS = [
  ["started_new_business", "Started new business"],
  ["banking_purpose", "Banking purpose"],
  ["compliance_withholding", "Compliance withholding"],
  ["hired_employees", "Hired employees"],
  ["other", "Other"],
] as const;

const ACTIVITIES = [
  ["other", "Other"],
  ["health_care", "Health care and social assistance"],
  ["wholesale_agent", "Wholesale agent or broker"],
  ["construction", "Construction"],
  ["rental_leasing", "Rental and leasing"],
  ["transportation", "Transportation and warehousing"],
  ["accommodation_food", "Accommodation and food service"],
  ["wholesale_other", "Wholesale other"],
  ["retail", "Retail"],
  ["real_estate", "Real estate"],
  ["manufacturing", "Manufacturing"],
  ["finance_insurance", "Finance and insurance"],
] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function Ss4Panel({ id, llcName, options, hasPrepared, preparedSource, hasSignature }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(options);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [serverWarnings, setServerWarnings] = useState<string[]>([]);
  const warnings = useMemo(() => {
    const fitWarnings = ss4FitWarnings({ llcName, options: current });
    const line1Text = toFormText(llcName);
    if (!fitsCell(line1Text, SS4_CELL_WIDTHS.line1) && !fitWarnings.some((warning) => warning.startsWith("Line 1 "))) {
      const line1Capacity = Math.floor(SS4_CELL_WIDTHS.line1 / (0.5 * 9));
      fitWarnings.unshift(`Line 1 may be cut off on the form (about ${line1Capacity} characters fit). Shorten it.`);
    }
    const line1Unencodable = unencodableChars(llcName);
    const line1Warnings = line1Unencodable
      ? [`Line 1 contains characters the form cannot print: ${line1Unencodable.split("").join(" ")}. Replace them with Latin letters.`]
      : [];
    return [...ss4Warnings(current), ...line1Warnings, ...fitWarnings];
  }, [current, llcName]);
  const preparedUrl = `/api/admin/applications/ein/${id}/prepared-pdf`;

  function setText(key: TextKey, value: string) {
    setCurrent((prev) => ({ ...prev, [key]: value }));
  }

  function setBoolean(key: BooleanKey, value: boolean) {
    setCurrent((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    if (hasSignature) {
      const ok = window.confirm("Generating a new form discards the customer signature. They will need to sign again.");
      if (!ok) return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    setGenerated(false);
    try {
      const res = await fetch(`/api/admin/applications/ein/${id}/generate-ss4`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(typeof body?.error === "string" ? body.error : `HTTP ${res.status}`);
      setServerWarnings(Array.isArray(body?.warnings) ? body.warnings : []);
      setGenerated(true);
      setNotice(body?.replacedSignature ? "Generated a new draft. The prior signature was reset." : "Generated draft Form SS-4.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Form SS-4 draft
          </h2>
          <p className="mt-1 text-sm text-slate-600">Draft for staff review before requesting a signature.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {hasPrepared ? sourceLabel(preparedSource) : "No prepared PDF"}
        </span>
      </div>

      <FieldGroup title="Entity">
        <TextInput label="Trade name" value={current.tradeName} onChange={(value) => setText("tradeName", value)} />
        <TextInput label="Care of" value={current.careOf} onChange={(value) => setText("careOf", value)} />
        <CheckInput label="LLC or foreign equivalent" checked={current.isLlc} onChange={(value) => setBoolean("isLlc", value)} />
        <TextInput label="LLC members" value={current.llcMembers} onChange={(value) => setText("llcMembers", value)} />
        <CheckInput label="Organized in the United States" checked={current.organizedInUs} onChange={(value) => setBoolean("organizedInUs", value)} />
      </FieldGroup>

      <FieldGroup title="Address">
        <TextInput label="Mailing address" value={current.mailingAddressLine} onChange={(value) => setText("mailingAddressLine", value)} />
        <TextInput label="Mailing city, state, ZIP" value={current.mailingCityStateZip} onChange={(value) => setText("mailingCityStateZip", value)} />
        <TextInput label="Street address" value={current.streetAddressLine} onChange={(value) => setText("streetAddressLine", value)} />
        <TextInput label="Street city, state, ZIP" value={current.streetCityStateZip} onChange={(value) => setText("streetCityStateZip", value)} />
        <TextInput label="County and state" value={current.countyAndState} onChange={(value) => setText("countyAndState", value)} />
      </FieldGroup>

      <FieldGroup title="Responsible party">
        <TextInput label="Name" value={current.responsibleParty} onChange={(value) => setText("responsibleParty", value)} />
        <TextInput label="TIN" value={current.responsiblePartyTin} onChange={(value) => setText("responsiblePartyTin", value)} />
      </FieldGroup>

      <FieldGroup title="Type and reason">
        <SelectInput label="Entity type" value={current.entityType} options={ENTITY_TYPES} onChange={(value) => setCurrent((prev) => ({ ...prev, entityType: value }))} />
        <TextInput label="Entity other text" value={current.entityOtherText} onChange={(value) => setText("entityOtherText", value)} />
        <TextInput label="State of incorporation" value={current.incorporationState} onChange={(value) => setText("incorporationState", value)} />
        <TextInput label="Country of incorporation" value={current.incorporationCountry} onChange={(value) => setText("incorporationCountry", value)} />
        <SelectInput label="Reason" value={current.reason} options={REASONS} onChange={(value) => setCurrent((prev) => ({ ...prev, reason: value }))} />
        <TextInput label="Reason specify" value={current.reasonSpecify} onChange={(value) => setText("reasonSpecify", value)} />
        <TextInput label="Business start date" value={current.businessStartDate} onChange={(value) => setText("businessStartDate", value)} />
        <SelectInput label="Closing month" value={current.closingMonth} options={MONTHS.map((m) => [m, m] as const)} onChange={(value) => setText("closingMonth", value)} />
      </FieldGroup>

      <FieldGroup title="Employees">
        <TextInput label="Agricultural employees" value={current.employeesAgricultural} onChange={(value) => setText("employeesAgricultural", value)} />
        <TextInput label="Household employees" value={current.employeesHousehold} onChange={(value) => setText("employeesHousehold", value)} />
        <TextInput label="Other employees" value={current.employeesOther} onChange={(value) => setText("employeesOther", value)} />
        <CheckInput label="Form 944 box" checked={current.form944} onChange={(value) => setBoolean("form944", value)} />
        <TextInput label="First wages date" value={current.firstWagesDate} onChange={(value) => setText("firstWagesDate", value)} />
      </FieldGroup>

      <FieldGroup title="Activity">
        <SelectInput label="Principal activity" value={current.activity} options={ACTIVITIES} onChange={(value) => setCurrent((prev) => ({ ...prev, activity: value }))} />
        <TextInput label="Activity other text" value={current.activityOtherText} onChange={(value) => setText("activityOtherText", value)} />
        <TextInput label="Principal products or services" value={current.principalProducts} onChange={(value) => setText("principalProducts", value)} />
        <CheckInput label="Prior EIN" checked={current.priorEin} onChange={(value) => setBoolean("priorEin", value)} />
        <TextInput label="Prior EIN number" value={current.priorEinNumber} onChange={(value) => setText("priorEinNumber", value)} />
      </FieldGroup>

      <FieldGroup title="Designee">
        <CheckInput label="Use third party designee" checked={current.designeeEnabled} onChange={(value) => setBoolean("designeeEnabled", value)} />
        <TextInput label="Designee name" value={current.designeeName} onChange={(value) => setText("designeeName", value)} />
        <TextInput label="Designee phone" value={current.designeePhone} onChange={(value) => setText("designeePhone", value)} />
        <TextInput label="Designee address" value={current.designeeAddress} onChange={(value) => setText("designeeAddress", value)} />
        <TextInput label="Designee fax" value={current.designeeFax} onChange={(value) => setText("designeeFax", value)} />
      </FieldGroup>

      <FieldGroup title="Applicant">
        <TextInput label="Name and title" value={current.applicantNameAndTitle} onChange={(value) => setText("applicantNameAndTitle", value)} />
        <TextInput label="Phone" value={current.applicantPhone} onChange={(value) => setText("applicantPhone", value)} />
        <TextInput label="Fax" value={current.applicantFax} onChange={(value) => setText("applicantFax", value)} />
      </FieldGroup>

      <ReviewWarnings warnings={warnings} />
      {serverWarnings.length > 0 && generated && <ReviewWarnings title="Returned warnings" warnings={serverWarnings} />}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Generate Form SS-4
        </button>
        {generated && (
          <a
            href={preparedUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            View the generated form
          </a>
        )}
      </div>

      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      <span className="mb-1 block">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      <span className="mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckInput({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
      />
      {label}
    </label>
  );
}

function ReviewWarnings({ title = "Review warnings", warnings }: { title?: string; warnings: string[] }) {
  if (warnings.length === 0) {
    return <p className="text-sm text-emerald-700">No draft warnings.</p>;
  }
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}

function sourceLabel(source: string | null): string {
  if (source === "generated") return "Generated draft on file";
  if (source === "upload") return "Uploaded PDF on file";
  return "Prepared PDF on file";
}

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
