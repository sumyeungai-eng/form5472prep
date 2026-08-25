"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/countries";
import {
  MULTI_YEAR_ADDON_CENTS,
  multiYearAddonCents,
  tierInfo,
  totalPriceCents,
  promoDiscountCents,
  promoTotalCents,
  PROMO_LABEL,
  TIERS,
  TIER_ORDER,
  resolveTier,
  isTestTier,
  type Tier,
} from "@/lib/pricing";
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
  makeYearScopeSchema,
  validateDissolvedAt,
  isYearDelinquent,
  filingDueDateUtc,
  effectiveDueDateUtc,
  isExtensionValid,
  extensionUnclear,
  formatDueDate,
  DISSOLVED_AT_FUTURE,
  type EntityForm,
  type ExtensionFacts,
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
  // True when the LLC was dissolved/closed and this is its final short-year
  // return — the only case that may report a tax year still in progress.
  isFinalReturn: boolean;
  // Day the LLC was dissolved; the short tax year runs Jan 1 → this date.
  // Typed loosely because it reaches this component two ways: as a Date on the
  // server-rendered record (the page spreads the raw row) and as an ISO string
  // in the JSON that PATCH echoes back.
  dissolvedAt: Date | string | null;
  // Storage key of the optional state dissolution/cancellation certificate the
  // customer may upload on a final return. Null until they upload one; nothing
  // downstream requires it.
  dissolutionCertKey: string | null;
  // ── Form 7004 extension gate ──────────────────────────────────────────────
  // Whether the return is late is a LEGAL characterisation, and the calendar
  // alone can't tell us: a validly extended filer is timely months past the
  // original due date. These five fields carry the customer-supplied fact.
  // `extensionFiled` is "yes" | "no" | "not_sure", or null when we've never
  // had to ask (the extension window wasn't open for their year).
  extensionFiled: string | null;
  // Day the 7004 was transmitted. Typed loosely for the same reason as
  // `dissolvedAt`: a Date on the server-rendered row, an ISO string in the
  // JSON that PATCH echoes back.
  extensionTransmittedAt: Date | string | null;
  // "fax" | "certified_mail" | "mail" | "not_sure" — how it was sent.
  extensionMethod: string | null;
  // "ogden" | "standard" | "not_sure" — where it was sent. A foreign-owned DE's
  // 7004 belongs at Ogden; a standard-address answer is reviewed internally
  // (no customer-facing warning here, deliberately).
  extensionDestination: string | null;
  // Storage key of the optional fax receipt / certified-mail slip / 7004 copy.
  extensionProofKey: string | null;
  reasonableCauseNarrative: string | null;
  faxService: boolean;
  // Service tier ("standard" | "express") pre-selected at /pricing or
  // /start?tier=, and changeable by the customer on the Review step right
  // up until they pay. Drives base price; year count drives the
  // per-extra-year add-on. Legacy values ("rush", "premium",
  // "single_year", …) still appear on old filings and resolve to Standard
  // via resolveTier() in pricing.ts.
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
    noReportableTransactions: boolean;
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
              const updated = await save({
                taxYears: data.taxYears,
                isFinalReturn: data.isFinalReturn,
                // Always sent — null clears any date left over from a
                // previously-ticked final-return box.
                dissolvedAt: data.dissolvedAt,
                // Same "always sent" rule for the Form 7004 answers: when the
                // extension question wasn't applicable (or stopped being
                // applicable after a year change) YearsStep sends nulls, so a
                // stale "yes" from an earlier selection can't survive and keep
                // a return marked timely that no longer is.
                extensionFiled: data.extensionFiled,
                extensionTransmittedAt: data.extensionTransmittedAt,
                extensionMethod: data.extensionMethod,
                extensionDestination: data.extensionDestination,
              });
              setFiling({
                ...filing,
                taxYears: updated.taxYears,
                isDiirsp: updated.isDiirsp,
                isFinalReturn: updated.isFinalReturn,
                dissolvedAt: updated.dissolvedAt,
                // Echo back what we sent rather than the server's row: the
                // PATCH route may not persist these yet (separate lane), and a
                // resumed step should still re-render the customer's answers.
                extensionFiled: updated.extensionFiled ?? data.extensionFiled,
                extensionTransmittedAt:
                  updated.extensionTransmittedAt ?? data.extensionTransmittedAt,
                extensionMethod: updated.extensionMethod ?? data.extensionMethod,
                extensionDestination:
                  updated.extensionDestination ?? data.extensionDestination,
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
            formationYear={filing.llcDateIncorporated ? new Date(filing.llcDateIncorporated).getUTCFullYear() : null}
            // Drives the final-return copy: on a closing LLC the money that came
            // back to the owner at wind-up is a distribution, and customers
            // routinely don't think of it as one.
            isFinalReturn={filing.isFinalReturn}
            initialYears={filing.taxYears.map((y) => {
              const ex = filing.yearData.find((d) => d.taxYear === y);
              return {
                taxYear: y,
                totalAssetsYearEnd: ex ? Number(ex.totalAssetsYearEnd) : 0,
                contributions: ex ? Number(ex.contributions) : 0,
                distributions: ex ? Number(ex.distributions) : 0,
                otherTransactionsNote: ex?.otherTransactionsNote ?? "",
                noReportableTransactions: ex?.noReportableTransactions ?? false,
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
                  noReportableTransactions: y.noReportableTransactions,
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
            saving={saving}
            // Persists the customer's tier switch through the same PATCH +
            // setFiling path every other step uses, so `filing.tier` — the
            // value /api/checkout prices off — is what the summary shows.
            // Rejects on failure (save() re-throws) so ReviewStep can roll
            // its optimistic selection back to the server's truth.
            onSelectTier={async (tier) => {
              await save({ tier });
            }}
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
                // Report the amount actually about to be charged (promo
                // applied) so ad-platform value optimisation isn't trained on
                // a price the customer never paid.
                amountCents: promoTotalCents(
                  filing.funnelSource,
                  totalPriceCents(filing.tier, filing.taxYears.length || 1),
                ),
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

// Normalizes a stored date (Date from the server-rendered row, ISO string from
// a PATCH response, or null) to the YYYY-MM-DD that <input type="date"> wants.
// Read in UTC: the value is a calendar day, and local getters would show the
// previous day for anyone west of UTC.
function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// "2026-04-13" → "April 13, 2026". Formatted in UTC (the stored dates are
// date-only instants at UTC midnight), so the prose never shows the customer a
// day either side of the one they typed. Returns null for anything that isn't a
// real calendar date — a <input type="date"> can hold a partial value mid-typing.
function formatLongDate(iso: string | null | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const parsed = new Date(utc);
  if (
    parsed.getUTCFullYear() !== y ||
    parsed.getUTCMonth() !== m - 1 ||
    parsed.getUTCDate() !== d
  ) {
    return null;
  }
  return parsed.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function YearsStep({
  filing,
  onSubmit,
  onBack,
  saving,
}: {
  filing: Filing;
  onSubmit: (
    data: YearScopeForm & {
      isFinalReturn: boolean;
      dissolvedAt: string | null;
      extensionFiled: string | null;
      extensionTransmittedAt: string | null;
      extensionMethod: string | null;
      extensionDestination: string | null;
    },
  ) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  const currentYear = new Date().getUTCFullYear();
  // Cap the picker at the last COMPLETED tax year — a user shouldn't file for a
  // year that hasn't ended yet (the server enforces the same bound via
  // makeYearScopeSchema). The single exception is a FINAL return: a dissolved
  // LLC's tax year ends on the closing date, so its return is already due and
  // filable mid-year. Ticking the box below therefore unlocks — and only for
  // that filer — the year in progress.
  const lastCompletedTaxYear = currentYear - 1;
  const [isFinalReturn, setIsFinalReturn] = useState(filing.isFinalReturn);
  // Dissolution date lives outside react-hook-form because the whole final-
  // return block is conditional and its rule depends on the year selection —
  // validateDissolvedAt() is the same function the server runs, so the inline
  // message matches the 400 the PATCH would return.
  const [dissolvedAt, setDissolvedAt] = useState(toDateInputValue(filing.dissolvedAt));
  const [dissolvedAtError, setDissolvedAtError] = useState<string | null>(null);
  // Optional supporting document: the state dissolution certificate the date
  // above is copied off. Uploaded straight to its own endpoint (not through
  // the wizard's PATCH), so it saves on pick and never blocks Continue.
  const certInputRef = useRef<HTMLInputElement>(null);
  const [certKey, setCertKey] = useState<string | null>(filing.dissolutionCertKey);
  const [certUploading, setCertUploading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  // ── Form 7004 extension answers ───────────────────────────────────────────
  // Outside react-hook-form for the same reason as the dissolution date: the
  // whole block is conditional on a rule derived from the year selection, and
  // its validation mirrors the shared helpers rather than a zod schema.
  const [extensionFiled, setExtensionFiled] = useState<string | null>(
    filing.extensionFiled ?? null,
  );
  const [extensionTransmittedAt, setExtensionTransmittedAt] = useState(
    toDateInputValue(filing.extensionTransmittedAt),
  );
  const [extensionMethod, setExtensionMethod] = useState(filing.extensionMethod ?? "");
  const [extensionDestination, setExtensionDestination] = useState(
    filing.extensionDestination ?? "",
  );
  const [extensionDateError, setExtensionDateError] = useState<string | null>(null);
  // Optional supporting document, same save-on-pick pattern as the dissolution
  // certificate above. The endpoint is owned by another lane; a 404 here just
  // surfaces as an upload error and never blocks Continue.
  const extProofInputRef = useRef<HTMLInputElement>(null);
  const [extProofKey, setExtProofKey] = useState<string | null>(filing.extensionProofKey);
  const [extProofUploading, setExtProofUploading] = useState(false);
  const [extProofError, setExtProofError] = useState<string | null>(null);
  // Escape hatch: "this doesn't match my situation" posts into the existing
  // per-filing message thread the accountant already watches.
  const [flagState, setFlagState] = useState<"idle" | "sending" | "sent">("idle");
  const [flagError, setFlagError] = useState<string | null>(null);
  const maxYear = isFinalReturn ? currentYear : lastCompletedTaxYear;
  const allYears = Array.from({ length: maxYear - 2017 }, (_, i) => 2018 + i);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<YearScopeForm>({
    resolver: zodResolver(makeYearScopeSchema(isFinalReturn)),
    defaultValues: { taxYears: filing.taxYears.length ? filing.taxYears : [lastCompletedTaxYear] },
  });
  const selected = watch("taxYears");

  function toggle(y: number, checked: boolean) {
    const next = checked ? [...selected, y].sort((a, b) => a - b) : selected.filter((x) => x !== y);
    setValue("taxYears", next, { shouldValidate: true });
  }

  function toggleFinalReturn(checked: boolean) {
    setIsFinalReturn(checked);
    // Unticking re-locks the current year. Drop it from the selection too —
    // leaving it checked would submit a year this filing may no longer report
    // and the server would reject the whole save with a 400.
    if (!checked && selected.includes(currentYear)) {
      setValue("taxYears", selected.filter((y) => y !== currentYear), { shouldValidate: true });
    }
    // Stale error from the hidden field would otherwise keep showing.
    if (!checked) setDissolvedAtError(null);
  }

  async function uploadCert(file: File) {
    setCertUploading(true);
    setCertError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/filings/${filing.id}/dissolution-cert`, {
        method: "POST",
        body,
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; key?: string };
      if (!res.ok) {
        setCertError(json.error || `Upload failed (${res.status})`);
        return;
      }
      setCertKey(json.key ?? null);
    } catch {
      setCertError("Upload failed. Please try again.");
    } finally {
      setCertUploading(false);
    }
  }

  async function removeCert() {
    setCertError(null);
    try {
      const res = await fetch(`/api/filings/${filing.id}/dissolution-cert`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setCertError(json.error || `Could not remove the certificate (${res.status})`);
        return;
      }
      setCertKey(null);
    } catch {
      setCertError("Could not remove the certificate. Please try again.");
    }
  }

  async function uploadExtProof(file: File) {
    setExtProofUploading(true);
    setExtProofError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/filings/${filing.id}/extension-proof`, {
        method: "POST",
        body,
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; key?: string };
      if (!res.ok) {
        setExtProofError(json.error || `Upload failed (${res.status})`);
        return;
      }
      setExtProofKey(json.key ?? null);
    } catch {
      setExtProofError("Upload failed. Please try again.");
    } finally {
      setExtProofUploading(false);
    }
  }

  async function removeExtProof() {
    setExtProofError(null);
    try {
      const res = await fetch(`/api/filings/${filing.id}/extension-proof`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setExtProofError(json.error || `Could not remove the file (${res.status})`);
        return;
      }
      setExtProofKey(null);
    } catch {
      setExtProofError("Could not remove the file. Please try again.");
    }
  }

  // "This doesn't match my situation" — the escape hatch behind every
  // automated characterisation. Posts the exact sentence the customer was
  // shown into the filing's message thread so the accountant can see what the
  // wizard claimed, not just that it was wrong.
  async function flagDetermination(sentence: string) {
    if (flagState !== "idle") return;
    setFlagState("sending");
    setFlagError(null);
    try {
      const res = await fetch(`/api/filings/${filing.id}/messages?as=customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body:
            "Customer flagged from the tax-years step: the late/timely determination shown does not match their situation. Shown: " +
            sentence,
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setFlagError(json.error || `Could not send (${res.status})`);
        setFlagState("idle");
        return;
      }
      setFlagState("sent");
    } catch {
      setFlagError("Could not send. Please try again.");
      setFlagState("idle");
    }
  }

  // Tier is pre-selected at /pricing (or /start?tier=) and stored on
  // filing.tier; this step only picks the year count. Each additional past
  // year adds a flat MULTI_YEAR_ADDON_CENTS on top of the tier base, on
  // either tier. The tier itself can be changed later on the Review step.
  const activeTier = tierInfo(filing.tier);
  const extraYears = Math.max(0, selected.length - 1);
  const addOnTotalCents = multiYearAddonCents(selected.length);
  const totalCents = activeTier.priceCents + addOnTotalCents;
  // ── Form 7004 gate: which year it can rescue, and whether to ask ──────────
  // A 7004 covers exactly ONE tax year, and on a multi-year catch-up the only
  // year still rescuable is the LATEST one — every earlier year's extended
  // window has closed too. So the extension facts are attached to
  // max(taxYears) and to nothing else.
  const latestSelectedYear = selected.length > 0 ? Math.max(...selected) : null;
  // Only a final return's dissolution date shortens a year; pass "" as null so
  // a half-typed date can't be read as a real one.
  const shortYearDate = isFinalReturn && dissolvedAt ? dissolvedAt : null;
  // ORIGINAL statutory deadline for the latest year — never hard-coded, always
  // via the shared helper (short years are due four months after they end, not
  // the following April).
  const originalDueMs =
    latestSelectedYear === null ? null : filingDueDateUtc(latestSelectedYear, shortYearDate);
  // The far edge of the six-month extended window: what the deadline WOULD be
  // if a 7004 had been transmitted on the original due date. Past this point a
  // 7004 can no longer make the return timely, so asking about one would only
  // collect an answer that changes nothing.
  const extendedWindowEndMs =
    latestSelectedYear === null || originalDueMs === null
      ? null
      : effectiveDueDateUtc(latestSelectedYear, shortYearDate, {
          filed: "yes",
          transmittedAt: new Date(originalDueMs),
        });
  const nowMs = Date.now();
  // Ask ONLY inside the window where the answer changes the outcome: the
  // original deadline has passed (otherwise the return is plainly timely) but
  // the extended one hasn't (otherwise it's plainly late).
  const showExtensionSection =
    originalDueMs !== null &&
    extendedWindowEndMs !== null &&
    nowMs > originalDueMs &&
    nowMs <= extendedWindowEndMs;
  // Facts that reach the shared helpers. Deliberately null whenever the
  // section isn't on screen — an answer the customer can't currently see must
  // not silently keep driving the determination after they change years.
  const extensionFacts: ExtensionFacts | null = showExtensionSection
    ? { filed: extensionFiled, transmittedAt: extensionTransmittedAt || null }
    : null;
  const extensionIsUnclear = extensionUnclear(extensionFacts);
  const extensionIsValid =
    latestSelectedYear !== null &&
    isExtensionValid(latestSelectedYear, shortYearDate, extensionFacts);
  // "Yes" + a date after the original deadline: the 7004 itself was late, so
  // it bought nothing. Shown as an amber explainer, not a blocking error —
  // the answer is still savable and the RCS path protects them.
  const extensionSentLate =
    showExtensionSection &&
    extensionFiled === "yes" &&
    extensionTransmittedAt.length > 0 &&
    formatLongDate(extensionTransmittedAt) !== null &&
    originalDueMs !== null &&
    !extensionIsValid;

  // Show the DIIRSP hint (and, downstream, the RCS step) exactly when the server
  // will set isDiirsp: any selected year whose IRS deadline has already passed.
  // Use the SAME shared rule the PATCH route runs — so a final short year that
  // is already late triggers it, and a not-yet-due final/current year does not
  // (the old "more than one year, or any past year" heuristic got both wrong).
  // The deadline now depends on the extension answer, which belongs to the
  // latest year alone.
  const lateYears = selected.filter((y) =>
    isYearDelinquent(
      y,
      isFinalReturn ? dissolvedAt : null,
      y === latestSelectedYear ? extensionFacts : null,
    ),
  );
  // "I'm not sure" defers ONLY the latest year's determination — that rule
  // lives inside isYearDelinquent, which already returned false for the
  // unclear year above. Earlier bundle years that no Form 7004 could rescue
  // stay in lateYears, so their reasonable-cause protection is never dropped.
  const wouldBeDiirsp = lateYears.length > 0;

  // ── Determination shown to the customer (plain language) ─────────────────
  // Dated off the most recent deadline that has actually passed when the
  // package is late (on a single-year filing that is simply this year), and
  // off the latest year's effective deadline otherwise.
  const determinationYear =
    lateYears.length > 0 ? Math.max(...lateYears) : latestSelectedYear;
  const determinationDueMs =
    determinationYear === null
      ? null
      : effectiveDueDateUtc(
          determinationYear,
          isFinalReturn ? dissolvedAt : null,
          determinationYear === latestSelectedYear ? extensionFacts : null,
        );
  const determinationSentence =
    determinationDueMs === null
      ? null
      : extensionIsUnclear
        ? lateYears.length > 0
          ? `We'll confirm your extension status for ${latestSelectedYear} by email before anything is filed. The earlier year${lateYears.length > 1 ? "s" : ""} ${lateYears.join(", ")} ${lateYears.length > 1 ? "are" : "is"} being filed after ${lateYears.length > 1 ? "their due dates" : "its due date"}, so a reasonable-cause statement is included for ${lateYears.length > 1 ? "them" : "it"}.`
          : "We'll confirm your extension status by email before anything is filed — you can continue for now."
        : lateYears.length > 0
          ? `This return is being filed after its due date (${formatDueDate(determinationDueMs)}). We'll include a reasonable-cause statement explaining why — it's what protects you from the $25,000 penalty.`
          : extensionIsValid
            ? `We've recorded this as a timely filing under your Form 7004 extension, due ${formatDueDate(determinationDueMs)}.`
            : `Your filing deadline is ${formatDueDate(determinationDueMs)} — this return is on time.`;

  // The short year belongs to the LATEST selected year — earlier years in a
  // multi-year catch-up are ordinary full years. Cap the picker at today when
  // that year is the one still running.
  const dissolvedAtYear = latestSelectedYear ?? maxYear;
  const todayIso = new Date().toISOString().slice(0, 10);
  const dissolvedAtMax = dissolvedAtYear < currentYear ? `${dissolvedAtYear}-12-31` : todayIso;

  // Period the forms will actually cover, stated in plain English under the
  // date field. The START is only January 1 when the LLC already existed at the
  // start of the year — an LLC formed mid-year has a SHORT first year that
  // begins on its formation date (first-and-final filers get both ends short),
  // so read the formation date off the filing rather than hard-coding Jan 1.
  const formationIso = filing.llcDateIncorporated
    ? toDateInputValue(filing.llcDateIncorporated)
    : "";
  const formedInFinalYear =
    formationIso.length > 0 && Number(formationIso.slice(0, 4)) === dissolvedAtYear;
  const periodStartLabel = formedInFinalYear
    ? formatLongDate(formationIso) ?? `January 1, ${dissolvedAtYear}`
    : `January 1, ${dissolvedAtYear}`;
  // Before the customer has entered a dissolution date we can't name the end, so
  // show the full-year end as the placeholder; it updates live as they type.
  const periodEndLabel =
    formatLongDate(dissolvedAt) ?? `December 31, ${dissolvedAtYear}`;

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        // A final return without a dissolution date has no defined tax-year
        // end, so don't let the wizard advance (and don't send a date the
        // filing shouldn't carry when the box is unticked).
        if (isFinalReturn) {
          // Same three arguments the PATCH route passes, so the inline message
          // matches the 400 the server would return (including the
          // dissolved-before-formed case).
          const err = validateDissolvedAt(
            dissolvedAt,
            data.taxYears,
            filing.llcDateIncorporated,
          );
          if (err) {
            setDissolvedAtError(err);
            return;
          }
        }
        setDissolvedAtError(null);
        // A "yes" without a transmittal date is unusable: isExtensionValid()
        // can't compare an absent date to the deadline, so it would silently
        // fall back to "not extended" — the exact misclassification this gate
        // exists to prevent. Mirrors the server's own required-when-yes rule.
        if (showExtensionSection && extensionFiled === "yes" && !extensionTransmittedAt) {
          setExtensionDateError("Enter the date you sent Form 7004");
          return;
        }
        setExtensionDateError(null);
        await onSubmit({
          ...data,
          isFinalReturn,
          dissolvedAt: isFinalReturn ? dissolvedAt : null,
          // Nulls whenever the question wasn't on screen, so an answer given
          // for one year selection can't linger after the customer changes it.
          extensionFiled: showExtensionSection ? extensionFiled : null,
          extensionTransmittedAt:
            showExtensionSection && extensionFiled === "yes" && extensionTransmittedAt
              ? extensionTransmittedAt
              : null,
          extensionMethod:
            showExtensionSection && extensionFiled === "yes" && extensionMethod
              ? extensionMethod
              : null,
          extensionDestination:
            showExtensionSection && extensionFiled === "yes" && extensionDestination
              ? extensionDestination
              : null,
        });
      })}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-semibold">Tax years to file</h2>
        <p className="text-sm text-slate-500 mt-1">
          Pick every tax year you want to file for. If any year is being filed after its
          due date, we&apos;ll help you write a short reasonable-cause statement explaining
          why — it&apos;s what protects you from the $25,000 penalty.
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
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFinalReturn}
            onChange={(e) => toggleFinalReturn(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
          />
          <span className="font-medium">
            My LLC has been closed or dissolved — this is its final return
          </span>
        </label>
        <p className="text-xs text-amber-800 mt-1.5 ml-6">
          Only tick this if the LLC has actually been dissolved. It marks the return as final
          on Form 1120, and if the LLC closed during {currentYear} it also lets you file that
          short tax year now instead of waiting for the year to end.
        </p>
        {isFinalReturn && (
          <div className="mt-3 ml-6">
            <Field
              // The single most common wrong answer here is the date the
              // formation/closure service marked the job done — often weeks
              // before (or after) the state's effective date. Name the document
              // the right date is printed on so the customer copies it off the
              // certificate instead of a dashboard.
              label="Effective date of dissolution — as shown on your Certificate of Cancellation / Dissolution"
              hint="Use the date printed on the state certificate, not the date your formation/closure service marked the task complete — the two can differ."
              error={dissolvedAtError ?? undefined}
            >
              <Input
                type="date"
                value={dissolvedAt}
                onChange={(e) => {
                  setDissolvedAt(e.target.value);
                  if (dissolvedAtError) setDissolvedAtError(null);
                }}
                // Bounds mirror validateDissolvedAt: inside the latest selected
                // year and not in the future. `aria-required` rather than the
                // native `required` so the browser's own bubble doesn't
                // pre-empt our inline message.
                min={`${dissolvedAtYear}-01-01`}
                max={dissolvedAtMax}
                aria-required
              />
            </Field>
            <p className="text-xs text-amber-800 mt-1.5">
              The forms will cover {periodStartLabel} through {periodEndLabel}.
            </p>
            {dissolvedAtError === DISSOLVED_AT_FUTURE && (
              <p className="text-xs text-amber-800 mt-1.5">
                If your LLC&apos;s closure isn&apos;t effective yet, come back once you have the
                certificate — we&apos;ll email you a reminder if you leave your draft unfinished.
              </p>
            )}
            <div className="mt-3">
              <Field
                label="Upload your Certificate of Dissolution (optional)"
                hint="Optional — lets our accountant double-check the effective date against the certificate."
                error={certError ?? undefined}
              >
                <div>
                  <input
                    ref={certInputRef}
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadCert(file);
                      e.target.value = ""; // let the same file be re-picked after an error
                    }}
                  />
                  {certKey ? (
                    <p className="text-sm text-emerald-700">
                      ✓ Certificate uploaded{" "}
                      <button
                        type="button"
                        onClick={() => void removeCert()}
                        className="ml-1 text-xs text-slate-500 hover:underline"
                      >
                        Remove
                      </button>
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={certUploading}
                      onClick={() => certInputRef.current?.click()}
                    >
                      {certUploading ? "Uploading…" : "Upload certificate (optional)"}
                    </Button>
                  )}
                </div>
              </Field>
            </div>
          </div>
        )}
      </div>
      {showExtensionSection && (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-900">
            Did you file Form 7004 (extension of time to file) for this tax year?
          </p>
          <p className="text-xs text-slate-500 mt-1">
            A Form 7004 filed on time gives you six extra months — if you have one, this
            return isn&apos;t late at all.
          </p>
          <div className="mt-3 space-y-2">
            {[
              { value: "yes", label: "Yes — filed on or before the original due date" },
              { value: "no", label: "No" },
              {
                value: "not_sure",
                label: "I'm not sure / my formation agent may have filed one",
                helper:
                  "Formation agents sometimes file extensions without telling you — if in doubt, pick this and we'll confirm before filing.",
              },
            ].map((opt) => {
              const checked = extensionFiled === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-2 rounded-md border p-3 cursor-pointer text-sm ${
                    checked ? "border-accent bg-accent-50" : "border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="extensionFiled"
                    value={opt.value}
                    checked={checked}
                    onChange={() => {
                      setExtensionFiled(opt.value);
                      setExtensionDateError(null);
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                  />
                  <span>
                    <span className="text-slate-900">{opt.label}</span>
                    {opt.helper && (
                      <span className="block text-xs text-slate-500 mt-1">{opt.helper}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {extensionFiled === "yes" && (
            <div className="mt-4 space-y-3">
              <Field
                label="Date you sent Form 7004"
                hint="The day it was faxed or postmarked — not the day you prepared it."
                error={extensionDateError ?? undefined}
              >
                <Input
                  type="date"
                  value={extensionTransmittedAt}
                  onChange={(e) => {
                    setExtensionTransmittedAt(e.target.value);
                    if (extensionDateError) setExtensionDateError(null);
                  }}
                  aria-required
                />
              </Field>
              {/* Amber, not red: a late 7004 is a real answer worth saving, it
                  just doesn't extend anything. Blocking here would strand the
                  customer on a fact they can't change. */}
              {extensionSentLate && originalDueMs !== null && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  This Form 7004 was sent after the original due date (
                  {formatDueDate(originalDueMs)}), so the IRS treats the return as late —
                  we&apos;ll include a reasonable-cause statement protecting you.
                </div>
              )}
              <Field label="How did you send it?">
                <Select
                  value={extensionMethod}
                  onChange={(e) => setExtensionMethod(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="fax">Fax</option>
                  <option value="certified_mail">Certified mail</option>
                  <option value="mail">Regular mail</option>
                  <option value="not_sure">Not sure</option>
                </Select>
              </Field>
              <Field label="Where did you send it?">
                <Select
                  value={extensionDestination}
                  onChange={(e) => setExtensionDestination(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="ogden">
                    The IRS address or fax line for foreign-owned disregarded entities
                    (Ogden, Utah)
                  </option>
                  <option value="standard">The standard Form 7004 filing address</option>
                  <option value="not_sure">Not sure</option>
                </Select>
              </Field>
              <Field
                label="Upload proof of your extension (optional)"
                hint="A fax receipt, certified-mail slip, or the 7004 copy — helps if the IRS has no record of it."
                error={extProofError ?? undefined}
              >
                <div>
                  <input
                    ref={extProofInputRef}
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadExtProof(file);
                      e.target.value = ""; // let the same file be re-picked after an error
                    }}
                  />
                  {extProofKey ? (
                    <p className="text-sm text-emerald-700">
                      ✓ Proof uploaded{" "}
                      <button
                        type="button"
                        onClick={() => void removeExtProof()}
                        className="ml-1 text-xs text-slate-500 hover:underline"
                      >
                        Remove
                      </button>
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={extProofUploading}
                      onClick={() => extProofInputRef.current?.click()}
                    >
                      {extProofUploading ? "Uploading…" : "Upload proof (optional)"}
                    </Button>
                  )}
                </div>
              </Field>
            </div>
          )}
        </div>
      )}
      {determinationSentence && (
        <div className="rounded-md bg-slate-50 border border-slate-200 p-4 text-sm">
          <p className="text-slate-700">{determinationSentence}</p>
          <div className="mt-2">
            {flagState === "sent" ? (
              <p className="text-xs text-emerald-700">
                ✓ Flagged — we&apos;ll review and email you.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void flagDetermination(determinationSentence)}
                disabled={flagState === "sending"}
                className="text-xs text-slate-500 underline hover:text-slate-700 disabled:opacity-50"
              >
                {flagState === "sending" ? "Sending…" : "This doesn't match my situation"}
              </button>
            )}
            {flagError && <p className="text-xs text-red-600 mt-1">{flagError}</p>}
          </div>
        </div>
      )}
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
            Filed after its due date — we&apos;ll help you write the reasonable-cause statement next.
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
  onSelectTier,
  saving,
}: {
  filing: Filing;
  onBack: () => void;
  onPay: (email: string, faxService: boolean) => Promise<void>;
  onSelectTier: (tier: Tier) => Promise<void>;
  saving: boolean;
}) {
  // Tier is pre-selected upstream (/pricing, /start?tier=) but the customer
  // can still switch it here. This is the last screen before payment and the
  // only place the two turnarounds sit side by side, so it's where the
  // upgrade decision actually gets made — the tiers differ ONLY by speed.
  //
  // Admin $0 test filings are the exception: their tier isn't a product, so
  // they keep it and never see the chooser (offering it would let a test
  // order re-tier itself into a real, chargeable one).
  const isTestFiling = isTestTier(filing.tier);
  const savedTier = resolveTier(filing.tier).tier;
  // Optimistic selection so the cards and the total move the instant a card is
  // clicked instead of after the PATCH round-trip. Reset (below) as soon as
  // the server echoes the new tier back onto `filing`, and rolled back to
  // `savedTier` if the save fails — the price shown must never outrun the
  // price /api/checkout will actually charge.
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  const [tierSaving, setTierSaving] = useState(false);
  const selectedTier: Tier = pendingTier ?? savedTier;
  // What the price math runs on: the live selection normally, the raw stored
  // value for a test filing (so tierInfo/totalPriceCents keep returning $0).
  const pricedTierValue: string | null = isTestFiling ? filing.tier : selectedTier;

  // Clear the optimistic override once the PATCH has landed. Comparing against
  // filing.tier (not a success flag) means a save that succeeded server-side
  // but whose response we mishandled still converges on the stored truth.
  useEffect(() => {
    setPendingTier(null);
  }, [filing.tier]);

  async function handleSelectTier(next: Tier) {
    if (next === selectedTier || tierSaving) return;
    setPendingTier(next);
    setTierSaving(true);
    try {
      await onSelectTier(next);
    } catch {
      // The wizard's own error banner already names the failure; just fall
      // back to the tier the server still holds so the Pay button can't quote
      // a plan the customer isn't about to be charged for.
      setPendingTier(null);
    } finally {
      setTierSaving(false);
    }
  }

  const activeTier = tierInfo(pricedTierValue);
  const yearCount = filing.taxYears.length || 1;
  const extraYears = Math.max(0, yearCount - 1);
  const addOnCents = multiYearAddonCents(yearCount);
  const total = totalPriceCents(pricedTierValue, yearCount);
  // Launch promotion — driven by the filing's funnelSource using the exact
  // same helpers /api/checkout runs server-side, so the figure on this button
  // is the figure Stripe charges. 0 for every non-promo filing, which makes
  // dueNow === total and leaves this step rendering exactly as it always has.
  const promoDiscount = promoDiscountCents(filing.funnelSource, total);
  const dueNow = total - promoDiscount;
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
        <Row label="Late filing" value={filing.isDiirsp ? "Yes — reasonable-cause statement included" : "No"} />
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
      </dl>

      {!isTestFiling && (
        <div>
          <h3 className="text-sm font-medium text-slate-900">Choose your turnaround</h3>
          <p className="text-xs text-slate-500 mt-1">
            Both plans include the same package and the same accountant review — the only
            difference is how fast it goes out. You can switch until you pay.
          </p>
          <div
            role="radiogroup"
            aria-label="Choose your turnaround"
            className="mt-3 grid gap-3 sm:grid-cols-2"
          >
            {TIER_ORDER.map((key) => {
              const info = TIERS[key];
              const isSelected = key === selectedTier;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={tierSaving}
                  onClick={() => void handleSelectTier(key)}
                  className={`relative text-left rounded-lg border p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 ${
                    isSelected
                      ? "border-accent ring-1 ring-accent bg-accent/5"
                      : "border-slate-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  {info.highlight && (
                    <span className="absolute top-3 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                      Most popular
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`h-4 w-4 flex-none rounded-full border flex items-center justify-center ${
                        isSelected ? "border-accent" : "border-slate-300"
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </span>
                    <span className="font-medium text-slate-900">{info.label}</span>
                  </span>
                  <span className="block text-xs text-slate-500 mt-1 ml-6">{info.subtitle}</span>
                  <span className="block text-lg font-semibold text-slate-900 mt-2 ml-6">
                    {formatUsd(info.priceCents)}
                  </span>
                  <ul className="mt-3 ml-6 space-y-1 text-xs text-slate-600">
                    {info.features.map((f) => (
                      <li key={f} className="flex gap-1.5">
                        <span aria-hidden className="flex-none text-accent">
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          {extraYears > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Prices shown are for the first tax year. Each additional past year adds{" "}
              {formatUsd(MULTI_YEAR_ADDON_CENTS)} on either plan.
            </p>
          )}
        </div>
      )}

      <dl className="text-sm divide-y divide-slate-200 border border-slate-200 rounded-md">
        <Row label="Plan" value={`${activeTier.label} — ${activeTier.subtitle}`} />
        <Row label={`${activeTier.label} (fax delivery included)`} value={formatUsd(activeTier.priceCents)} />
        {extraYears > 0 && (
          <Row
            label={`${extraYears} additional tax year${extraYears === 1 ? "" : "s"}`}
            value={`${formatUsd(addOnCents)} (${extraYears} × ${formatUsd(MULTI_YEAR_ADDON_CENTS)})`}
          />
        )}
        {promoDiscount > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-4 px-4 py-3">
              <dt className="text-slate-500 text-xs uppercase tracking-wider sm:text-base sm:normal-case sm:tracking-normal">
                {PROMO_LABEL}
              </dt>
              <dd className="sm:col-span-2 font-medium text-emerald-700 break-words">
                −{formatUsd(promoDiscount)}
              </dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-4 px-4 py-3">
              <dt className="text-slate-500 text-xs uppercase tracking-wider sm:text-base sm:normal-case sm:tracking-normal">
                Total
              </dt>
              <dd className="sm:col-span-2 text-slate-900 break-words">
                <span className="line-through text-slate-400">{formatUsd(total)}</span>{" "}
                <span className="font-semibold">{formatUsd(dueNow)}</span>
              </dd>
            </div>
          </>
        ) : (
          <Row label="Total" value={formatUsd(total)} />
        )}
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
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        {/* Blocked while a tier switch is in flight: checkout prices off the
            stored filing.tier, so paying mid-PATCH could charge the plan the
            customer just switched away from. */}
        <Button onClick={handlePay} disabled={paying || saving || tierSaving}>
          {paying ? "Redirecting…" : `Pay ${formatUsd(dueNow)} →`}
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
