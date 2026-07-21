"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/countries";
import { MULTI_YEAR_ADDON_CENTS, multiYearAddonCents, tierInfo, totalPriceCents } from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
import { fireMetaInitiateCheckout } from "@/lib/analytics/meta";

// Generates a self-assigned Reference ID for Form 5472 when the customer
// leaves the field blank. Uses last-name + first-initial as a human-readable
// prefix (so it's identifiable on the form), plus 4 random alphanumeric chars
// for uniqueness. Pure function, no React deps.
//
// IRS rule (Instructions for Form 5472): the reference ID number must be
// alphanumeric with NO special characters or spaces, 50 chars or less. So no
// hyphens — e.g. SMITHJA7B2, not SMITH-J-A7B2.
function generateReferenceId(lastName?: string, firstName?: string): string {
  const sanitize = (s: string) => s.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const last = sanitize(lastName ?? "");
  const first = sanitize(firstName ?? "");
  const prefix = last ? `${last.slice(0, 6)}${first ? first[0] : ""}` : "REF";
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // unambiguous chars
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}${suffix}`.slice(0, 50);
}
import { z } from "zod";
import {
  entitySchema,
  ownerBaseSchema,
  yearScopeSchema,
  type EntityForm,
  type OwnerForm,
  type YearScopeForm,
} from "@/lib/schemas";

// Reference ID is allowed to be empty here even when ITIN is empty —
// handleOwnerSubmit auto-generates one before save. The IRS "ITIN OR
// Reference ID" rule is therefore satisfied by the time the row hits the
// DB, just without bouncing the customer back to fill in a field they
// don't need to think about.
const ownerStepObject = ownerBaseSchema.omit({ ownerName: true, ownerAddress: true }).extend({
  ownerFirstName: z.string().trim().min(1, "Required"),
  ownerMiddleName: z.string().trim().optional().or(z.literal("")),
  ownerLastName: z.string().trim().min(1, "Required"),
  ownerAddressStreet: z.string().trim().min(2, "Required"),
  ownerAddressCity: z.string().trim().min(1, "Required"),
  ownerAddressState: z.string().trim().optional().or(z.literal("")),
  ownerAddressPostal: z.string().trim().optional().or(z.literal("")),
  ownerAddressCountry: z.string().trim().min(1, "Required"),
});
const ownerStepSchema = ownerStepObject;
type OwnerStepForm = z.infer<typeof ownerStepObject>;
import { TransactionsReview } from "./TransactionsReview";
import { ReasonableCauseStep } from "./ReasonableCauseStep";

// Common principal business activities for foreign-owned single-member LLCs,
// with their IRS 6-digit NAICS codes. The catch-all "Other (please specify)"
// option falls back to the original free-text input.
// Curated NAICS list — only the activities our customer base (foreign-owned
// US LLCs) actually picks. Goal: every customer finds something specific
// enough that they don't pick "Other" and land on 999999 (or worse, an
// admin manually-types a wrong code that survives review — e.g. the
// "Music Publishers (512230)" picked for a non-music publishing business
// in one historical filing). When in doubt, add more granular entries
// instead of fewer, generic ones.
const BUSINESS_ACTIVITIES: { activity: string; code: string }[] = [
  // ── Software & tech services ────────────────────────────────
  { activity: "Software / SaaS / app development", code: "541512" },
  { activity: "Software publishing (commercial software products)", code: "511210" },
  { activity: "IT services / computer systems design", code: "541510" },
  { activity: "Web design / web development", code: "541511" },

  // ── Consulting & professional services ──────────────────────
  { activity: "Management consulting", code: "541611" },
  { activity: "Marketing / advertising consulting", code: "541613" },
  { activity: "Advertising agency / digital marketing services", code: "541810" },
  { activity: "Graphic / industrial design services", code: "541430" },
  { activity: "Financial / accounting / bookkeeping services", code: "541219" },
  { activity: "Legal services", code: "541110" },
  { activity: "Engineering / architectural services", code: "541330" },

  // ── Publishing & content ────────────────────────────────────
  // Common foreign-founder content businesses. The split between
  // 511130 (books), 511199 (other publishers), 519130 (internet
  // content), 711510 (independent creator), and 512230 (music
  // publishers) is the one most likely to be mis-coded — keep them
  // all explicitly listed so the picker doesn't force a default.
  { activity: "Book publishing (ebooks, print books)", code: "511130" },
  { activity: "Newspaper / periodical / magazine publishing", code: "511120" },
  { activity: "Other publishing (greeting cards, calendars, etc.)", code: "511199" },
  { activity: "Music publishing / music rights", code: "512230" },
  { activity: "Internet content / blog / newsletter / Substack", code: "519130" },
  { activity: "Affiliate marketing / content monetization", code: "519130" },
  { activity: "Writing / content creation / translation", code: "711510" },
  { activity: "Independent artist / performer / influencer", code: "711510" },
  { activity: "Photography / video production", code: "541921" },
  { activity: "Online education / courses / coaching", code: "611430" },

  // ── E-commerce & retail ─────────────────────────────────────
  { activity: "Online / e-commerce retail (physical products)", code: "454110" },
  { activity: "Dropshipping / Amazon FBA seller", code: "454110" },
  { activity: "Print-on-demand (books, apparel, prints)", code: "323111" },
  { activity: "Wholesale distribution / import-export", code: "424990" },

  // ── Finance, investment, real estate ────────────────────────
  { activity: "Investment activities / holding company", code: "523900" },
  { activity: "Cryptocurrency / digital asset trading", code: "523900" },
  { activity: "Real estate — rental property", code: "531110" },
  { activity: "Real estate — other (flipping, syndication, etc.)", code: "531390" },

  // ── Goods, services, ops ────────────────────────────────────
  { activity: "Restaurants / food service", code: "722511" },
  { activity: "Construction / contractor", code: "236220" },
  { activity: "Manufacturing", code: "339999" },
  { activity: "Transportation / logistics / freight", code: "488510" },
  { activity: "Trucking / delivery", code: "484110" },
  { activity: "Personal services (cleaning, beauty, etc.)", code: "812990" },
  { activity: "Healthcare / wellness services", code: "621399" },

  // Fallback. Lives here at the bottom so it's the last option.
  { activity: "Other (unable to classify)", code: "999999" },
];

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
  ownerAddressStreet: string | null;
  ownerAddressCity: string | null;
  ownerAddressState: string | null;
  ownerAddressPostal: string | null;
  ownerAddressCountry: string | null;
  ownerCountryCitizenship: string | null;
  ownerCountryTaxResidence: string | null;
  ownerCountryBusiness: string | null;
  ownerFtin: string | null;
  ownerItin: string | null;
  ownerReferenceId: string | null;
  taxYears: number[];
  isDiirsp: boolean;
  reasonableCauseNarrative: string | null;
  faxService: boolean;
  // Service tier ("standard" | "rush" | "premium") chosen at /pricing or
  // /start?tier=. Drives base price; year count drives the per-extra-year
  // add-on. Legacy values like "single_year" still appear on old filings
  // and resolve to Standard via resolveTier() in pricing.ts.
  tier: string | null;
  // Source attribution slug captured from ?src= on the landing page that
  // sent the visitor to /start. Used for sales-attribution reporting.
  funnelSource: string | null;
  yearData: {
    taxYear: number;
    totalAssetsYearEnd: string;
    contributions: string;
    distributions: string;
    otherTransactionsNote: string | null;
  }[];
};

// Exported so wrapper components (v3 sidebar layout) can build their own
// step list and stay in sync with the wizard's current step.
export type StepKey = "entity" | "owner" | "years" | "rcs" | "transactions" | "review";

async function patchFiling(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/filings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Surface the server's validation message + field issues so the wizard can
    // show WHY the save failed instead of silently not advancing.
    const err = (await res.json().catch(() => ({}))) as {
      error?: string;
      issues?: { field?: string; message?: string }[];
    };
    const issueText = Array.isArray(err.issues)
      ? err.issues.map((i) => i.message).filter(Boolean).join("; ")
      : "";
    const message = [err.error, issueText].filter(Boolean).join(" — ") || `Save failed (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export function FilingWizard({
  filing: initial,
  plaidEnabled = false,
  // Optional controlled-mode props. When `step` is provided, the parent owns
  // step state and the wizard fires `onStepChange` whenever it would have
  // moved internally. When omitted, behavior is unchanged from the original
  // /edit usage (internal state). Used by the v3 sidebar layout so the
  // sidebar can highlight + control the active step.
  step,
  onStepChange,
  // When true, hide the wizard's own top Stepper (the v3 layout shows steps
  // in the left sidebar so the inline one would be redundant).
  hideTopStepper = false,
  // When true, hide the wizard's outer max-width container so a parent
  // layout (the v3 sidebar wrapper) controls the page chrome instead.
  bareLayout = false,
  // Notifies the parent when underlying filing data changes (autosave
  // returns updated record). Lets the sidebar recompute completion status
  // without reading prisma directly.
  onFilingChange,
}: {
  filing: Filing;
  plaidEnabled?: boolean;
  step?: StepKey;
  onStepChange?: (next: StepKey) => void;
  hideTopStepper?: boolean;
  bareLayout?: boolean;
  onFilingChange?: (next: Filing) => void;
}) {
  const router = useRouter();
  const [filing, setFiling] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Whenever local filing state changes, surface it to the parent so the
  // v3 sidebar can recompute step-status badges.
  useEffect(() => {
    onFilingChange?.(filing);
  }, [filing, onFilingChange]);

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

  // Internal-vs-controlled step state. Controlled wins when `step` is
  // explicitly passed by the parent.
  const [internalStepKey, setInternalStepKey] = useState<StepKey>("entity");
  const stepKey = step ?? internalStepKey;
  const setStepKey = (next: StepKey) => {
    if (step === undefined) setInternalStepKey(next);
    onStepChange?.(next);
  };
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
    setSaveError(null);
    try {
      const updated = await patchFiling(filing.id, body);
      setFiling({ ...filing, ...updated, yearData: filing.yearData });
      return updated;
    } catch (err) {
      // Record the error for the banner and RE-THROW so the caller's goNext()
      // is skipped — a failed save must not advance the wizard.
      setSaveError(err instanceof Error ? err.message : "Could not save. Please try again.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  // Outer container: v3 sidebar layout asks for `bareLayout` so the parent
  // page owns max-width + padding. Default behavior is the original /edit
  // self-contained look.
  const Outer: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    bareLayout
      ? <div className="w-full">{children}</div>
      : <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</div>;

  return (
    <Outer>
      {!hideTopStepper && (
        <Stepper steps={steps} current={stepIndex} onJumpTo={(key) => setStepKey(key)} />
      )}
      <div className={`${hideTopStepper ? "" : "mt-6 sm:mt-8"} bg-white rounded-lg border border-slate-200 p-5 sm:p-8`}>
        {saveError && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
            <strong>Couldn&apos;t save:</strong> {saveError}
          </div>
        )}
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
                otherTransactionsNote: ex?.otherTransactionsNote ?? "",
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
                  otherTransactionsNote: y.otherTransactionsNote || null,
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
            onPay={async (email, faxService) => {
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filingId: filing.id, email, faxService }),
              });
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert(`Checkout failed: ${body.error ?? res.status}`);
                return;
              }
              const { url } = await res.json();
              fireMetaInitiateCheckout({
                filingId: filing.id,
                amountCents: totalPriceCents(filing.tier, filing.taxYears.length || 1),
              });
              router.push(url);
            }}
          />
        )}
      </div>
    </Outer>
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
    setValue,
    watch,
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

  // Pre-existing activity values that aren't in the dropdown list start in
  // "Other" mode so we don't silently lose the customer's prior input.
  const initialActivity = filing.llcBusinessActivity ?? "";
  const initialIsPreset = BUSINESS_ACTIVITIES.some((b) => b.activity === initialActivity);
  const [activityIsOther, setActivityIsOther] = useState<boolean>(
    initialActivity.length > 0 && !initialIsPreset,
  );

  function handleActivitySelect(value: string) {
    if (value === "__other__") {
      setActivityIsOther(true);
      setValue("llcBusinessActivity", "", { shouldValidate: true });
      setValue("llcBusinessCode", "", { shouldValidate: true });
      return;
    }
    setActivityIsOther(false);
    const preset = BUSINESS_ACTIVITIES.find((b) => b.activity === value);
    if (preset) {
      setValue("llcBusinessActivity", preset.activity, { shouldValidate: true });
      setValue("llcBusinessCode", preset.code, { shouldValidate: true });
    }
  }

  const currentActivity = watch("llcBusinessActivity");

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
        {/* Auto-format as XX-XXXXXXX while the user types: strip everything
            that isn't a digit, cap at 9 digits, and re-insert the dash after
            the first two. inputMode="numeric" pops the numeric keypad on
            mobile; maxLength includes the dash. */}
        <Input
          inputMode="numeric"
          maxLength={10}
          value={watch("llcEin") ?? ""}
          name="llcEin"
          placeholder="XX-XXXXXXX"
          onBlur={register("llcEin").onBlur}
          ref={register("llcEin").ref}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
            const formatted = digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
            setValue("llcEin", formatted, { shouldValidate: true, shouldDirty: true });
          }}
        />
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
      <Field
        label="Date of formation"
        error={errors.llcDateIncorporated?.message}
        help={
          <p>
            The date the state registered your LLC. Check the formation certificate or the
            confirmation email from the state agency (or the company that formed it for you).
          </p>
        }
      >
        <Input type="date" {...register("llcDateIncorporated")} />
      </Field>
      <Field
        label="Principal business activity"
        hint="Pick the closest match. We'll auto-fill the IRS 6-digit code below."
        error={errors.llcBusinessActivity?.message}
      >
        <select
          value={
            activityIsOther
              ? "__other__"
              : (BUSINESS_ACTIVITIES.find((b) => b.activity === currentActivity)?.activity ?? "")
          }
          onChange={(e) => handleActivitySelect(e.target.value)}
          className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        >
          <option value="">Select your business activity…</option>
          {BUSINESS_ACTIVITIES.map((b) => (
            <option key={b.code} value={b.activity}>
              {b.activity}
            </option>
          ))}
          <option value="__other__">Other (specify) …</option>
        </select>
        {activityIsOther && (
          <Input
            {...register("llcBusinessActivity")}
            placeholder="Describe what your LLC does (e.g., custom yacht brokering)"
            className="mt-2"
          />
        )}
        {!activityIsOther && (
          <input type="hidden" {...register("llcBusinessActivity")} />
        )}
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

function splitOwnerName(full: string | null): { first: string; middle: string; last: string } {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", middle: "", last: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return { first: parts[0], middle: parts.slice(1, -1).join(" "), last: parts[parts.length - 1] };
}

function OwnerStep({
  filing,
  onSubmit,
  onBack,
  saving,
}: {
  filing: Filing;
  onSubmit: (data: OwnerForm & Partial<OwnerStepForm>) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  const nameParts = splitOwnerName(filing.ownerName);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnerStepForm>({
    resolver: zodResolver(ownerStepSchema),
    defaultValues: {
      ownerFirstName: nameParts.first,
      ownerMiddleName: nameParts.middle,
      ownerLastName: nameParts.last,
      // Prefer the structured columns; fall back to the legacy combined
      // ownerAddress (which lands entirely in Street) only for filings saved
      // before structured fields existed.
      ownerAddressStreet:
        filing.ownerAddressStreet ??
        (filing.ownerAddressCity || filing.ownerAddressCountry ? "" : filing.ownerAddress ?? ""),
      ownerAddressCity: filing.ownerAddressCity ?? "",
      ownerAddressState: filing.ownerAddressState ?? "",
      ownerAddressPostal: filing.ownerAddressPostal ?? "",
      ownerAddressCountry: filing.ownerAddressCountry ?? "",
      ownerCountryCitizenship: filing.ownerCountryCitizenship ?? "",
      ownerCountryTaxResidence: filing.ownerCountryTaxResidence ?? "",
      ownerCountryBusiness: filing.ownerCountryBusiness ?? "",
      ownerFtin: filing.ownerFtin ?? "",
      ownerItin: filing.ownerItin ?? "",
      ownerReferenceId: filing.ownerReferenceId ?? "",
    },
  });

  function handleOwnerSubmit(data: OwnerStepForm) {
    const { ownerFirstName, ownerMiddleName, ownerLastName,
            ownerAddressStreet, ownerAddressCity, ownerAddressState,
            ownerAddressPostal, ownerAddressCountry, ...rest } = data;
    const ownerName = [ownerFirstName, ownerMiddleName, ownerLastName].filter(Boolean).join(" ");
    const ownerAddress = [ownerAddressStreet, ownerAddressCity, ownerAddressState, ownerAddressPostal, ownerAddressCountry]
      .filter(Boolean).join(", ");

    // Form 5472 requires a Reference ID when the owner has no ITIN. If the
    // customer left the field blank, generate a stable self-assigned ID
    // (last-name initials + 4 random alphanumeric chars, or "REFXXXX" if
    // we don't have a name yet) so the filing remains valid. They can edit
    // it on a return visit if they want a different value.
    const ownerItinTrim = (rest.ownerItin ?? "").trim();
    const ownerRefTrim = (rest.ownerReferenceId ?? "").trim();
    if (!ownerItinTrim && !ownerRefTrim) {
      rest.ownerReferenceId = generateReferenceId(ownerLastName, ownerFirstName);
    }

    // Save both the structured parts (so the form can re-hydrate them on
    // next visit) and the concatenated string (used by PDF generation).
    return onSubmit({
      ownerName,
      ownerAddress,
      ownerAddressStreet,
      ownerAddressCity,
      ownerAddressState,
      ownerAddressPostal,
      ownerAddressCountry,
      ...rest,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleOwnerSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Foreign owner information</h2>
        <p className="text-sm text-slate-500 mt-1">As shown on your passport.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="First name" error={errors.ownerFirstName?.message}>
          <Input {...register("ownerFirstName")} placeholder="John" />
        </Field>
        <Field label="Middle name" error={errors.ownerMiddleName?.message}>
          <Input {...register("ownerMiddleName")} placeholder="(optional)" />
        </Field>
        <Field label="Last name" error={errors.ownerLastName?.message}>
          <Input {...register("ownerLastName")} placeholder="Smith" />
        </Field>
      </div>
      <Field label="Street address" error={errors.ownerAddressStreet?.message}>
        <Input {...register("ownerAddressStreet")} placeholder="Flat 5A, 123 Queens Rd" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="City" error={errors.ownerAddressCity?.message}>
          <Input {...register("ownerAddressCity")} placeholder="Hong Kong" />
        </Field>
        <Field label="State / Province" error={errors.ownerAddressState?.message}>
          <Input {...register("ownerAddressState")} placeholder="(optional)" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Postal / ZIP code" error={errors.ownerAddressPostal?.message}>
          <Input {...register("ownerAddressPostal")} placeholder="(optional)" />
        </Field>
        <Field label="Country" error={errors.ownerAddressCountry?.message}>
          <Select {...register("ownerAddressCountry")}>
            <option value="">Select a country…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field
          label="Citizenship"
          error={errors.ownerCountryCitizenship?.message}
          help={
            <p>
              The country that issued your passport. If you hold more than one passport, list the
              country you use the most (or the same one you used on bank documents for this LLC).
            </p>
          }
        >
          <Select {...register("ownerCountryCitizenship")}>
            <option value="">Select a country…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field
          label="Tax residence"
          error={errors.ownerCountryTaxResidence?.message}
          help={
            <>
              <p>
                The country where you currently <strong>pay personal income tax</strong>. Usually
                the country you live in and have a tax ID for.
              </p>
              <p className="mt-2">
                Example: a UK citizen living in Dubai pays tax in the UAE, so the answer is{" "}
                <strong>United Arab Emirates</strong>, not United Kingdom.
              </p>
            </>
          }
        >
          <Select {...register("ownerCountryTaxResidence")}>
            <option value="">Select a country…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field
          label="Country of business"
          error={errors.ownerCountryBusiness?.message}
          help={
            <p>
              Where you actually <strong>run the LLC from</strong> — the country you&apos;re sitting in
              when you make decisions, sign contracts, and manage operations. Often the same as
              your tax residence.
            </p>
          }
        >
          <Select {...register("ownerCountryBusiness")}>
            <option value="">Select a country…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
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
          hint="Leave blank and we'll generate one for you. Letters/numbers only."
          error={errors.ownerReferenceId?.message}
          help={
            <>
              <p>
                If you don&apos;t have a US ITIN, the IRS requires a self-assigned Reference ID
                on Form 5472. It just needs to be unique to you and stable across years.
              </p>
              <p className="mt-2">
                <strong>You can leave this blank</strong> — we&apos;ll generate one based on your
                name (e.g. <code>SMITHJA7B2</code>). Or set your own: easiest is your{" "}
                <strong>FTIN with dashes removed</strong>, or a short code like{" "}
                <code>SMITHJ001</code>. Letters and numbers only — no spaces, dashes, or special
                characters.
              </p>
            </>
          }
        >
          <Input {...register("ownerReferenceId")} placeholder="e.g. A1234567 or SMITHJ001" />
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
  const currentYear = new Date().getUTCFullYear();
  // Cap the picker at the last COMPLETED tax year — a user shouldn't file for a
  // year that hasn't ended yet (the server enforces the same bound via
  // yearScopeSchema).
  const lastCompletedTaxYear = currentYear - 1;
  const allYears = Array.from({ length: lastCompletedTaxYear - 2017 }, (_, i) => 2018 + i);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<YearScopeForm>({
    resolver: zodResolver(yearScopeSchema),
    defaultValues: { taxYears: filing.taxYears.length ? filing.taxYears : [lastCompletedTaxYear] },
  });
  const selected = watch("taxYears");

  function toggle(y: number, checked: boolean) {
    const next = checked ? [...selected, y].sort((a, b) => a - b) : selected.filter((x) => x !== y);
    setValue("taxYears", next, { shouldValidate: true });
  }

  // Tier is selected at /pricing (or /start?tier=) and stored on filing.tier.
  // Wizard just lets the customer pick year count; each additional past year
  // adds a flat $149 on top of the tier base.
  const activeTier = tierInfo(filing.tier);
  const extraYears = Math.max(0, selected.length - 1);
  const addOnTotalCents = multiYearAddonCents(selected.length);
  const totalCents = activeTier.priceCents + addOnTotalCents;
  const wouldBeDiirsp =
    selected.length > 1 || selected.some((y) => y < currentYear);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Tax years to file</h2>
        <p className="text-sm text-slate-500 mt-1">
          Pick every tax year you want to file for. If you pick more than one — or any year
          before the current one — we&apos;ll guide you through the IRS late-filing procedure
          (called DIIRSP) and help you write a short reason for being late.
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
          {activeTier.label}: {formatUsd(activeTier.priceCents)}
          {extraYears > 0 && (
            <span className="text-slate-500">
              {" "}+ {extraYears} extra year{extraYears === 1 ? "" : "s"} × {formatUsd(MULTI_YEAR_ADDON_CENTS)} = {formatUsd(totalCents)}
            </span>
          )}
        </p>
        <p className="text-slate-600 mt-1">IRS fax delivery included.</p>
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
  onPay: (email: string, faxService: boolean) => Promise<void>;
}) {
  // Tier chosen upstream at /pricing or /start?tier=. Fax delivery is
  // included on every tier — no add-on toggle anymore.
  const activeTier = tierInfo(filing.tier);
  const yearCount = filing.taxYears.length || 1;
  const extraYears = Math.max(0, yearCount - 1);
  const addOnCents = multiYearAddonCents(yearCount);
  const total = totalPriceCents(filing.tier, yearCount);
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
      // faxService arg kept for the existing onPay signature; checkout API
      // now ignores it (fax is bundled on every tier).
      await onPay(trimmed, true);
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
        <Row label="Plan" value={`${activeTier.label} — ${activeTier.subtitle}`} />
        <Row label={`${activeTier.label} (fax delivery included)`} value={formatUsd(activeTier.priceCents)} />
        {extraYears > 0 && (
          <Row
            label={`${extraYears} additional tax year${extraYears === 1 ? "" : "s"}`}
            value={`${formatUsd(addOnCents)} (${extraYears} × ${formatUsd(MULTI_YEAR_ADDON_CENTS)})`}
          />
        )}
        <Row label="Total" value={formatUsd(total)} />
      </dl>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        We fax your signed package to the IRS Ogden PIN Unit and return the
        timestamped fax receipt as proof of on-time filing. Fax delivery is
        included on every plan — no separate fee.
      </div>

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
          {paying ? "Redirecting…" : `Pay ${formatUsd(total)} →`}
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
