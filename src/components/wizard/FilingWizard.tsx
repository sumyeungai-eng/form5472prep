"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { TIERS, tierForYearCount, FAX_FEE_CENTS, FAX_FEE_LABEL } from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
import {
  entitySchema,
  ownerSchema,
  yearScopeSchema,
  type EntityForm,
  type OwnerForm,
  type YearScopeForm,
} from "@/lib/schemas";
import { TransactionsReview } from "./TransactionsReview";
import { ReasonableCauseStep } from "./ReasonableCauseStep";

type Filing = {
  id: string;
  email: string | null;
  llcName: string | null;
  llcEin: string | null;
  llcAddress: string | null;
  llcCity: string | null;
  llcState: string | null;
  llcZip: string | null;
  llcDateIncorporated: string | null;
  llcBusinessActivity: string | null;
  llcBusinessCode: string | null;
  ownerName: string | null;
  ownerAddress: string | null;
  ownerCountryCitizenship: string | null;
  ownerCountryTaxResidence: string | null;
  ownerCountryBusiness: string | null;
  ownerFtin: string | null;
  ownerItin: string | null;
  ownerReferenceId: string | null;
  taxYears: number[];
  isDiirsp: boolean;
  reasonableCauseNarrative: string | null;
  yearData: {
    taxYear: number;
    totalAssetsYearEnd: string;
    contributions: string;
    distributions: string;
  }[];
};

type StepKey = "entity" | "owner" | "years" | "rcs" | "transactions" | "review";

async function patchFiling(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/filings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
  return res.json();
}

export function FilingWizard({
  filing: initial,
  plaidEnabled = false,
}: {
  filing: Filing;
  plaidEnabled?: boolean;
}) {
  const router = useRouter();
  const [filing, setFiling] = useState(initial);
  const [saving, setSaving] = useState(false);

  // RCS step only shown when DIIRSP.
  const steps: { key: StepKey; label: string }[] = useMemo(() => {
    const base: { key: StepKey; label: string }[] = [
      { key: "entity", label: "Entity" },
      { key: "owner", label: "Owner" },
      { key: "years", label: "Tax years" },
    ];
    if (filing.isDiirsp) base.push({ key: "rcs", label: "Reasonable cause" });
    base.push({ key: "transactions", label: "Transactions" });
    base.push({ key: "review", label: "Review" });
    return base;
  }, [filing.isDiirsp]);

  const [stepKey, setStepKey] = useState<StepKey>("entity");
  const stepIndex = steps.findIndex((s) => s.key === stepKey);

  function goNext() {
    const next = steps[stepIndex + 1];
    if (next) setStepKey(next.key);
  }
  function goBack() {
    const prev = steps[stepIndex - 1];
    if (prev) setStepKey(prev.key);
  }

  async function save(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const updated = await patchFiling(filing.id, body);
      setFiling({ ...filing, ...updated, yearData: filing.yearData });
      return updated;
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Stepper steps={steps} current={stepIndex} onJumpTo={(key) => setStepKey(key)} />
      <div className="mt-6 sm:mt-8 bg-white rounded-lg border border-slate-200 p-5 sm:p-8">
        {stepKey === "entity" && (
          <EntityStep
            filing={filing}
            onSubmit={async (data) => {
              await save(data);
              goNext();
            }}
            saving={saving}
          />
        )}
        {stepKey === "owner" && (
          <OwnerStep
            filing={filing}
            onSubmit={async (data) => {
              await save(data);
              goNext();
            }}
            onBack={goBack}
            saving={saving}
          />
        )}
        {stepKey === "years" && (
          <YearsStep
            filing={filing}
            onSubmit={async (data) => {
              const updated = await save({ taxYears: data.taxYears });
              setFiling({
                ...filing,
                taxYears: updated.taxYears,
                isDiirsp: updated.isDiirsp,
              });
              // The steps list will pick up the new isDiirsp on the next render.
              setStepKey(updated.isDiirsp ? "rcs" : "transactions");
            }}
            onBack={goBack}
            saving={saving}
          />
        )}
        {stepKey === "rcs" && (
          <ReasonableCauseStep
            initial={filing.reasonableCauseNarrative ?? ""}
            onSubmit={async (text) => {
              await save({ reasonableCauseNarrative: text });
              setFiling({ ...filing, reasonableCauseNarrative: text });
              goNext();
            }}
            onBack={goBack}
            saving={saving}
          />
        )}
        {stepKey === "transactions" && (
          <TransactionsReview
            filingId={filing.id}
            ownerName={filing.ownerName}
            plaidEnabled={plaidEnabled}
            initialYears={filing.taxYears.map((y) => {
              const ex = filing.yearData.find((d) => d.taxYear === y);
              return {
                taxYear: y,
                totalAssetsYearEnd: ex ? Number(ex.totalAssetsYearEnd) : 0,
                contributions: ex ? Number(ex.contributions) : 0,
                distributions: ex ? Number(ex.distributions) : 0,
              };
            })}
            onSubmit={async (yearData) => {
              await save({ yearData });
              setFiling({
                ...filing,
                yearData: yearData.map((y) => ({
                  taxYear: y.taxYear,
                  totalAssetsYearEnd: String(y.totalAssetsYearEnd),
                  contributions: String(y.contributions),
                  distributions: String(y.distributions),
                })),
              });
              goNext();
            }}
            onBack={goBack}
            saving={saving}
          />
        )}
        {stepKey === "review" && (
          <ReviewStep
            filing={filing}
            onBack={goBack}
            onPay={async (email) => {
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filingId: filing.id, email }),
              });
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert(`Checkout failed: ${body.error ?? res.status}`);
                return;
              }
              const { url } = await res.json();
              router.push(url);
            }}
          />
        )}
      </div>
    </div>
  );
}

function Stepper({
  steps,
  current,
  onJumpTo,
}: {
  steps: { key: StepKey; label: string }[];
  current: number;
  onJumpTo: (key: StepKey) => void;
}) {
  const currentLabel = steps[current]?.label ?? "";
  return (
    <div>
      {/* Mobile-only: show "Step N of M — Label" since dots alone aren't self-describing */}
      <p className="sm:hidden text-xs text-slate-500 mb-2">
        Step {current + 1} of {steps.length} · <span className="font-medium text-slate-900">{currentLabel}</span>
      </p>
      <ol className="flex items-center text-xs">
      {steps.map((s, i) => {
        // Allow jumping back to any visited step (current or earlier).
        // Forward steps stay locked so the wizard can run validation
        // through the Continue button before letting the user advance.
        const visited = i <= current;
        const isCurrent = i === current;
        const canJump = visited && !isCurrent;
        const dot = (
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-medium transition-colors ${
              visited ? "bg-accent text-white" : "bg-slate-200 text-slate-600"
            } ${canJump ? "group-hover:bg-accent-700" : ""}`}
          >
            {i + 1}
          </div>
        );
        const label = (
          <span
            className={`ml-2 hidden sm:inline ${isCurrent ? "font-medium" : "text-slate-500"} ${
              canJump ? "group-hover:text-slate-900 group-hover:underline" : ""
            }`}
          >
            {s.label}
          </span>
        );
        return (
          <li key={s.key} className="flex items-center flex-1">
            {canJump ? (
              <button
                type="button"
                onClick={() => onJumpTo(s.key)}
                className="group flex items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`Go back to ${s.label}`}
                title={`Go back to ${s.label}`}
              >
                {dot}
                {label}
              </button>
            ) : (
              <div className="flex items-center" aria-current={isCurrent ? "step" : undefined}>
                {dot}
                {label}
              </div>
            )}
            {i < steps.length - 1 && <div className="flex-1 mx-2 h-px bg-slate-200" />}
          </li>
        );
      })}
      </ol>
    </div>
  );
}

function EntityStep({
  filing,
  onSubmit,
  saving,
}: {
  filing: Filing;
  onSubmit: (data: EntityForm) => Promise<void>;
  saving: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntityForm>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      llcName: filing.llcName ?? "",
      llcEin: filing.llcEin ?? "",
      llcAddress: filing.llcAddress ?? "",
      llcCity: filing.llcCity ?? "",
      llcState: filing.llcState ?? "",
      llcZip: filing.llcZip ?? "",
      llcDateIncorporated: filing.llcDateIncorporated?.slice(0, 10) ?? "",
      llcBusinessActivity: filing.llcBusinessActivity ?? "",
      llcBusinessCode: filing.llcBusinessCode ?? "",
    },
  });

  // If the LLC name is already populated on a fresh DRAFT, the customer is a
  // returning filer whose previous filing's details were pre-filled. Surface
  // a banner so they know to review (e.g. EIN/address may have changed).
  const isPrefilled = !!filing.llcName;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">LLC information</h2>
        <p className="text-sm text-slate-500 mt-1">
          Use the legal name and address registered with your state.
        </p>
      </div>
      {isPrefilled && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <strong>Pre-filled from your previous filing.</strong> Review each field and update anything that&apos;s changed since last year — address, EIN, owner details, etc.
        </div>
      )}
      <Field label="LLC legal name" error={errors.llcName?.message}>
        <Input {...register("llcName")} placeholder="Acme Holdings LLC" />
      </Field>
      <Field
        label="EIN"
        hint="9-digit IRS employer identification number, e.g. 12-3456789."
        error={errors.llcEin?.message}
        help={
          <>
            <p>
              The <strong>EIN</strong> (Employer Identification Number) is the IRS&apos;s
              identifier for your LLC. It&apos;s on the IRS confirmation letter (CP 575) you
              received when the LLC was registered.
            </p>
            <p className="mt-2">
              Don&apos;t have one yet? You can&apos;t file Form 5472 without it. Apply via{" "}
              <a
                className="text-accent underline"
                href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online"
                target="_blank"
                rel="noreferrer"
              >
                irs.gov/EIN
              </a>
              {" "}— foreign owners must apply by fax or mail using Form SS-4 (takes 2–4 weeks).
            </p>
          </>
        }
      >
        <Input {...register("llcEin")} placeholder="XX-XXXXXXX" />
      </Field>
      <Field label="Street address" error={errors.llcAddress?.message}>
        <Input {...register("llcAddress")} placeholder="123 Main St" />
      </Field>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="City" error={errors.llcCity?.message}>
          <Input {...register("llcCity")} />
        </Field>
        <Field label="State" hint="2-letter" error={errors.llcState?.message}>
          <Input {...register("llcState")} placeholder="WY" maxLength={2} />
        </Field>
        <Field label="ZIP" error={errors.llcZip?.message}>
          <Input {...register("llcZip")} placeholder="82001" />
        </Field>
      </div>
      <Field label="Date of formation" error={errors.llcDateIncorporated?.message}>
        <Input type="date" {...register("llcDateIncorporated")} />
      </Field>
      <Field label="Principal business activity" error={errors.llcBusinessActivity?.message}>
        <Input {...register("llcBusinessActivity")} placeholder="Software consulting" />
      </Field>
      <Field
        label="6-digit business code (NAICS)"
        hint="The IRS code that best matches what your LLC does."
        error={errors.llcBusinessCode?.message}
        help={
          <>
            <p>
              A <strong>NAICS code</strong> classifies what kind of business you run. Form 1120
              wants the 6-digit code that most closely matches your principal activity.
            </p>
            <p className="mt-2 font-medium text-slate-900">Common ones:</p>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li><code>541512</code> — Computer systems design / software</li>
              <li><code>541611</code> — Management consulting</li>
              <li><code>454110</code> — Online / e-commerce retail</li>
              <li><code>541810</code> — Advertising agencies</li>
              <li><code>711510</code> — Independent artists, writers, performers</li>
              <li><code>531390</code> — Real estate (other)</li>
              <li><code>523900</code> — Investment activities (holding companies)</li>
              <li><code>999999</code> — Unable to classify / catch-all</li>
            </ul>
            <p className="mt-2">
              Full list at{" "}
              <a
                className="text-accent underline"
                href="https://www.census.gov/naics/"
                target="_blank"
                rel="noreferrer"
              >
                census.gov/naics
              </a>
              . If unsure, use <code>999999</code> — the IRS doesn&apos;t reject filings over
              this field.
            </p>
          </>
        }
      >
        <Input {...register("llcBusinessCode")} placeholder="541512" />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}

function OwnerStep({
  filing,
  onSubmit,
  onBack,
  saving,
}: {
  filing: Filing;
  onSubmit: (data: OwnerForm) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      ownerName: filing.ownerName ?? "",
      ownerAddress: filing.ownerAddress ?? "",
      ownerCountryCitizenship: filing.ownerCountryCitizenship ?? "",
      ownerCountryTaxResidence: filing.ownerCountryTaxResidence ?? "",
      ownerCountryBusiness: filing.ownerCountryBusiness ?? "",
      ownerFtin: filing.ownerFtin ?? "",
      ownerItin: filing.ownerItin ?? "",
      ownerReferenceId: filing.ownerReferenceId ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Foreign owner information</h2>
        <p className="text-sm text-slate-500 mt-1">As shown on your passport.</p>
      </div>
      <Field label="Full legal name" error={errors.ownerName?.message}>
        <Input {...register("ownerName")} />
      </Field>
      <Field label="Residential address" error={errors.ownerAddress?.message}>
        <Input {...register("ownerAddress")} placeholder="Flat 5A, 123 Queens Rd, Hong Kong" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Citizenship" error={errors.ownerCountryCitizenship?.message}>
          <Input {...register("ownerCountryCitizenship")} placeholder="Hong Kong" />
        </Field>
        <Field label="Tax residence" error={errors.ownerCountryTaxResidence?.message}>
          <Input {...register("ownerCountryTaxResidence")} placeholder="Hong Kong" />
        </Field>
        <Field label="Country of business" error={errors.ownerCountryBusiness?.message}>
          <Input {...register("ownerCountryBusiness")} placeholder="Hong Kong" />
        </Field>
      </div>
      <Field
        label="Foreign tax ID (FTIN)"
        hint="The number your home country uses to identify you for tax purposes."
        error={errors.ownerFtin?.message}
        help={
          <>
            <p className="font-medium text-slate-900 mb-1.5">What goes here?</p>
            <p>
              The tax identification number issued to you by your <strong>home country</strong>
              {" "}— not the United States. The IRS uses this on Form 5472 to identify you as the
              foreign owner.
            </p>
            <p className="mt-2 font-medium text-slate-900">Common examples by country:</p>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li><strong>Hong Kong:</strong> HKID number (e.g. A123456(7))</li>
              <li><strong>United Kingdom:</strong> UTR (10 digits) or National Insurance number</li>
              <li><strong>Singapore:</strong> NRIC / FIN number</li>
              <li><strong>Canada:</strong> SIN (Social Insurance Number)</li>
              <li><strong>Australia:</strong> TFN (Tax File Number)</li>
              <li><strong>EU countries:</strong> your national tax / personal ID number</li>
              <li><strong>BVI, Cayman, other tax-free jurisdictions:</strong> your national ID or
                passport number</li>
            </ul>
            <p className="mt-2">
              If your country doesn&apos;t issue a tax ID number, use your passport number and
              fill the Reference ID field below.
            </p>
          </>
        }
      >
        <Input {...register("ownerFtin")} placeholder="Your home-country tax ID number" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="US ITIN (optional)"
          hint="Only if you've previously been issued one by the IRS."
          error={errors.ownerItin?.message}
          help={
            <>
              <p>
                An <strong>ITIN</strong> (Individual Taxpayer Identification Number) is a 9-digit
                number the IRS issues to non-US persons who need to file US tax returns but
                can&apos;t get an SSN. It starts with the digit 9, e.g. <code>9XX-XX-XXXX</code>.
              </p>
              <p className="mt-2">
                Most foreign-owned LLC owners <strong>don&apos;t have one</strong> — leave this
                field blank. Form 5472 accepts a Reference ID instead (next field).
              </p>
            </>
          }
        >
          <Input {...register("ownerItin")} placeholder="9XX-XX-XXXX" />
        </Field>
        <Field
          label="Reference ID (if no ITIN)"
          hint="Required when ITIN is blank. Letters/numbers only."
          error={errors.ownerReferenceId?.message}
          help={
            <>
              <p>
                If you don&apos;t have a US ITIN, the IRS requires a self-assigned Reference ID
                on Form 5472. It just needs to be unique to you and stable across years.
              </p>
              <p className="mt-2">
                Easiest: use your <strong>FTIN with dashes removed</strong>, or a short code like{" "}
                <code>SMITH-J-001</code>. Letters and numbers only — no spaces or special
                characters.
              </p>
            </>
          }
        >
          <Input {...register("ownerReferenceId")} placeholder="e.g. A1234567 or SMITH-J-001" />
        </Field>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}

function YearsStep({
  filing,
  onSubmit,
  onBack,
  saving,
}: {
  filing: Filing;
  onSubmit: (data: YearScopeForm) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const allYears = Array.from({ length: currentYear - 2017 }, (_, i) => 2018 + i);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<YearScopeForm>({
    resolver: zodResolver(yearScopeSchema),
    defaultValues: { taxYears: filing.taxYears.length ? filing.taxYears : [currentYear - 1] },
  });
  const selected = watch("taxYears");

  function toggle(y: number, checked: boolean) {
    const next = checked ? [...selected, y].sort((a, b) => a - b) : selected.filter((x) => x !== y);
    setValue("taxYears", next, { shouldValidate: true });
  }

  const tier = tierForYearCount(selected.length);
  const wouldBeDiirsp =
    selected.length > 1 || selected.some((y) => y < currentYear);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Tax years to file</h2>
        <p className="text-sm text-slate-500 mt-1">
          Multi-year filings — or any prior year — go through the DIIRSP procedure with a
          reasonable cause statement.
        </p>
      </div>
      <input type="hidden" {...register("taxYears", { valueAsNumber: false })} />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {allYears.map((y) => {
          const checked = selected.includes(y);
          return (
            <label
              key={y}
              className={`flex items-center justify-center h-10 rounded-md border cursor-pointer text-sm ${
                checked ? "bg-accent text-white border-accent" : "bg-white border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => toggle(y, e.target.checked)}
                className="sr-only"
              />
              {y}
            </label>
          );
        })}
      </div>
      {errors.taxYears && <p className="text-xs text-red-600">{errors.taxYears.message}</p>}
      <div className="rounded-md bg-slate-50 p-4 text-sm">
        <p className="font-medium">
          {selected.length} year{selected.length === 1 ? "" : "s"} → {formatUsd(TIERS[tier].priceCents)}
          <span className="text-slate-500"> + {formatUsd(FAX_FEE_CENTS)} fax fee</span>
        </p>
        <p className="text-slate-600 mt-1">{TIERS[tier].description}</p>
        {wouldBeDiirsp && (
          <p className="text-xs text-accent mt-2">
            DIIRSP applies — we&apos;ll help you write the reasonable cause statement next.
          </p>
        )}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}

function ReviewStep({
  filing,
  onBack,
  onPay,
}: {
  filing: Filing;
  onBack: () => void;
  onPay: (email: string) => Promise<void>;
}) {
  const tier = tierForYearCount(filing.taxYears.length);
  const [email, setEmail] = useState(filing.email ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError(null);
    setPaying(true);
    try {
      await onPay(trimmed);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review</h2>
        <p className="text-sm text-slate-500 mt-1">
          Confirm everything looks right. After payment we&apos;ll generate the filled PDFs and
          email you an access link.
        </p>
      </div>
      <dl className="text-sm divide-y divide-slate-200 border border-slate-200 rounded-md">
        <Row label="LLC name" value={filing.llcName} />
        <Row label="EIN" value={filing.llcEin} />
        <Row
          label="Address"
          value={`${filing.llcAddress}, ${filing.llcCity}, ${filing.llcState} ${filing.llcZip}`}
        />
        <Row label="Owner" value={filing.ownerName} />
        <Row label="Owner FTIN" value={filing.ownerFtin} />
        <Row label="Tax years" value={filing.taxYears.join(", ")} />
        <Row label="DIIRSP" value={filing.isDiirsp ? "Yes" : "No"} />
        {filing.isDiirsp && (
          <Row
            label="Reasonable cause"
            value={
              filing.reasonableCauseNarrative
                ? `${filing.reasonableCauseNarrative.slice(0, 80)}${
                    filing.reasonableCauseNarrative.length > 80 ? "…" : ""
                  }`
                : null
            }
          />
        )}
        <Row label="Tier" value={TIERS[tier].label} />
        <Row label={TIERS[tier].label} value={formatUsd(TIERS[tier].priceCents)} />
        <Row label={FAX_FEE_LABEL} value={formatUsd(FAX_FEE_CENTS)} />
        <Row
          label="Total"
          value={formatUsd(TIERS[tier].priceCents + FAX_FEE_CENTS)}
        />
      </dl>

      <Field
        label="Email address"
        hint="We send your filing receipt and an access link to this address."
        error={emailError ?? undefined}
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>

      <div className="flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
        <svg className="flex-none h-4 w-4 mt-0.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Every order is reviewed by a qualified tax accountant before submission to the IRS.</span>
      </div>
      <p className="text-xs text-slate-500">
        We are not a CPA firm and do not provide tax advice. You are responsible for the accuracy
        of all information.
      </p>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handlePay} disabled={paying}>
          {paying ? "Redirecting…" : `Pay ${formatUsd(TIERS[tier].priceCents + FAX_FEE_CENTS)} →`}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-4 px-4 py-3">
      <dt className="text-slate-500 text-xs uppercase tracking-wider sm:text-base sm:normal-case sm:tracking-normal">{label}</dt>
      <dd className="sm:col-span-2 text-slate-900 break-words">{value || <em className="text-slate-400">missing</em>}</dd>
    </div>
  );
}
