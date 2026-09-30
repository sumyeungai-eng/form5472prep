import type { ReviewStepFiling } from "./ReviewStep";

// The "what you're filing" table on the Review step: entity, owner, years and
// the late-filing determination, exactly as the wizard has stored them.
export function FilingDetails({ filing }: { filing: ReviewStepFiling }) {
  return (
    <dl className="divide-y divide-paper-edge overflow-hidden rounded-xl border border-paper-edge bg-paper text-sm">
      <Row label="LLC name" value={filing.llcName} />
      <Row label="EIN" value={filing.llcEin} />
      <Row
        label="Address"
        value={`${filing.llcAddress}, ${filing.llcCity}, ${filing.llcState} ${filing.llcZip}`}
      />
      <Row label="Owner" value={filing.ownerName} />
      <Row label="Owner FTIN" value={filing.ownerFtin} />
      <Row label="Tax years" value={filing.taxYears.join(", ")} />
      {/* "I'm not sure" is deliberately not collapsed into yes or no anywhere
          in the product: isYearDelinquent() defers the latest year rather than
          asserting it, so isDiirsp can be false purely because the question is
          still OPEN. Printing "No" there would present an unresolved
          determination as a resolved one — the customer would read "not late"
          off a filing we have not yet decided about. */}
      {filing.extensionFiled === "not_sure" ? (
        <Row
          label="Late filing"
          value="Pending — we'll confirm your extension before filing"
          muted
        />
      ) : (
        <Row
          label="Late filing"
          value={filing.isDiirsp ? "Yes — reasonable-cause statement included" : "No"}
        />
      )}
      {filing.isDiirsp && (
        <Row
          label="Reasonable cause"
          value={reasonableCauseSummary(filing)}
        />
      )}
    </dl>
  );
}

function Row({
  label,
  value,
  // Renders the value in the muted grey used for "not decided yet" states, so
  // an unresolved determination doesn't read like a confirmed answer.
  muted = false,
}: {
  label: string;
  value: string | null | undefined;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-0.5 px-4 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 sm:text-sm sm:font-normal sm:normal-case sm:tracking-normal">
        {label}
      </dt>
      <dd
        className={`break-words ${muted ? "text-slate-500" : "font-medium text-ink"}`}
      >
        {value || <em className="font-normal text-amber-700">missing</em>}
      </dd>
    </div>
  );
}

// The RCS step saves one answer per late year (yearData.rcsWhyMissed); older
// filings may only have the legacy single narrative. Checkout already refuses
// a late filing without answers, so "missing" here means genuinely missing.
function reasonableCauseSummary(filing: ReviewStepFiling): string | null {
  const answered = (filing.yearData ?? [])
    .filter((y) => (y.rcsWhyMissed ?? "").trim().length > 0)
    .map((y) => y.taxYear)
    .sort((a, b) => a - b);
  if (answered.length > 0) {
    return `Answered for ${answered.join(", ")} — we write a statement for each late year`;
  }
  const legacy = filing.reasonableCauseNarrative;
  if (legacy) return `${legacy.slice(0, 80)}${legacy.length > 80 ? "…" : ""}`;
  return null;
}
