// Per-step completion computation for the v3 sidebar. Uses the SAME Filing
// shape the v1 wizard serializes (see /filings/[id]/edit/page.tsx) so we
// can compute status without touching the wizard's internal state.

import type { StepKey } from "@/components/wizard/FilingWizard";

export type StepStatus = "complete" | "missing" | "untouched";

type FilingShape = {
  llcName: string | null;
  llcEin: string | null;
  llcAddress: string | null;
  llcCity: string | null;
  llcState: string | null;
  llcZip: string | null;
  llcCountryBusiness: string | null;
  llcDateIncorporated: string | null;
  llcBusinessActivity: string | null;
  llcBusinessCode: string | null;
  priorForm5472Filed: string | null;
  llcAddressIsRegisteredAgentOnly: boolean | null;
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
  ownerHasFtin: boolean | null;
  ownerNoPostalCode: boolean | null;
  ownerFtin: string | null;
  ownerReferenceId: string | null;
  taxYears: number[];
  isDiirsp: boolean;
  reasonableCauseNarrative: string | null;
  yearData: Array<{
    taxYear: number;
    rcsWhyMissed?: string | null;
    rcsWhenLearned?: string | null;
    rcsNoIrsNoticeConfirmed?: boolean | null;
  }>;
};

const nonEmpty = (v: string | null | undefined): boolean => !!v && v.trim().length > 0;

function entityStatus(f: FilingShape): StepStatus {
  const required = [
    f.llcName, f.llcEin, f.llcAddress, f.llcCity, f.llcState, f.llcZip,
    f.llcCountryBusiness, f.llcDateIncorporated, f.llcBusinessActivity,
    f.llcBusinessCode, f.priorForm5472Filed,
  ];
  const some =
    required.some((x) => nonEmpty(x)) ||
    f.llcAddressIsRegisteredAgentOnly !== null;
  const all =
    required.every((x) => nonEmpty(x)) &&
    f.llcAddressIsRegisteredAgentOnly !== null;
  if (all) return "complete";
  if (some) return "missing";
  return "untouched";
}

function ownerStatus(f: FilingShape): StepStatus {
  const required = [
    f.ownerName,
    f.ownerAddressStreet ?? f.ownerAddress,
    f.ownerAddressCity,
    f.ownerAddressState,
    f.ownerNoPostalCode === true ? "no-postal-code" : f.ownerAddressPostal,
    f.ownerAddressCountry,
    f.ownerCountryCitizenship,
    f.ownerCountryTaxResidence,
    f.ownerCountryBusiness,
  ];
  const hasIdentifier =
    f.ownerHasFtin === false
      ? nonEmpty(f.ownerReferenceId)
      : nonEmpty(f.ownerFtin) || nonEmpty(f.ownerReferenceId);
  const some = required.some((x) => nonEmpty(x as string | null)) || hasIdentifier;
  const all = required.every((x) => nonEmpty(x as string | null)) && hasIdentifier;
  if (all) return "complete";
  if (some) return "missing";
  return "untouched";
}

function yearsStatus(f: FilingShape): StepStatus {
  if (f.taxYears.length === 0) return "untouched";
  return "complete";
}

function rcsStatus(f: FilingShape): StepStatus {
  if (!f.isDiirsp) return "complete"; // step hidden anyway
  const lateYears = f.taxYears.filter((year) => year < new Date().getUTCFullYear());
  const complete = lateYears.every((year) => {
    const row = f.yearData.find((yd) => yd.taxYear === year);
    return (
      nonEmpty(row?.rcsWhyMissed) &&
      nonEmpty(row?.rcsWhenLearned) &&
      row?.rcsNoIrsNoticeConfirmed === true
    );
  });
  return complete ? "complete" : "missing";
}

function transactionsStatus(f: FilingShape): StepStatus {
  if (f.taxYears.length === 0) return "untouched";
  return f.taxYears.every((y) => f.yearData.some((yd) => yd.taxYear === y))
    ? "complete"
    : "missing";
}

export function computeStatuses(f: FilingShape): Record<StepKey, StepStatus> {
  const out: Record<StepKey, StepStatus> = {
    entity: entityStatus(f),
    owner: ownerStatus(f),
    years: yearsStatus(f),
    rcs: rcsStatus(f),
    transactions: transactionsStatus(f),
    review: "untouched",
  };
  const priorAllComplete = (["entity", "owner", "years", "transactions"] as StepKey[])
    .every((k) => out[k] === "complete")
    && (!f.isDiirsp || out.rcs === "complete");
  out.review = priorAllComplete ? "complete" : "untouched";
  return out;
}

export function computeProgressPct(
  statuses: Record<StepKey, StepStatus>,
  visibleKeys: StepKey[],
): number {
  const done = visibleKeys.filter((k) => statuses[k] === "complete").length;
  return Math.round((done / visibleKeys.length) * 100);
}
