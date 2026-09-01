"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldErrors,
  type Path,
  type UseFormRegister,
  type UseFormWatch,
} from "react-hook-form";
import {
  DONATION_MINIMUM_HKD,
  deductionEntries,
  type DeductionEntry,
} from "@/lib/content/deductions";
import { getParams } from "@/lib/tax/params";
import { useI18n } from "@/lib/i18n/useI18n";
import { useWizard } from "@/lib/wizard/wizardContext";
import {
  deductionsStepSchema,
  type DeductionsStepFormValues,
} from "@/lib/wizard/wizardSchemas";
import type {
  WizardDeductions,
  WizardHousingDeductionKind,
  WizardPersonId,
  WizardState,
} from "@/lib/wizard/wizardState";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";
import {
  CheckboxField,
  NumberField,
  RadioGroupField,
  getFieldError,
  formatHKD,
  scrollToFirstError,
} from "./FormFields";
import { HintsPanel } from "./HintsPanel";

type DeductionsStepProps = {
  formId: string;
  onValid: () => void;
};

type PersonRoot = "personA" | "personB";
type Register = UseFormRegister<DeductionsStepFormValues>;
type Watch = UseFormWatch<DeductionsStepFormValues>;

export function DeductionsStep({ formId, onValid }: DeductionsStepProps) {
  const { lang } = useI18n();
  const { setWizardState, wizardState } = useWizard();
  const defaultValues = useMemo(() => deductionsDefaults(wizardState), [wizardState]);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<DeductionsStepFormValues>({
    resolver: zodResolver(deductionsStepSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  function onSubmit(values: DeductionsStepFormValues) {
    setWizardState((previous) => ({
      ...previous,
      personA: {
        ...previous.personA,
        deductions: normalizeDeductions(values.personA.deductions),
      },
      personB: {
        ...previous.personB,
        deductions: normalizeDeductions(values.personB.deductions),
      },
    }));
    onValid();
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit, scrollToFirstError)} className="space-y-8" noValidate>
      <input type="hidden" {...register("personA.personId")} />
      <input type="hidden" {...register("personB.personId")} />
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          {wizardT(wizardDictionary.deductions.title, lang)}
        </h1>
      </div>
      <HintsPanel step="deductions" />
      <PersonDeductions
        personId="A"
        root="personA"
        register={register}
        watch={watch}
        errors={errors}
        state={wizardState}
      />
      {wizardState.maritalStatus === "married" ? (
        <PersonDeductions
          personId="B"
          root="personB"
          register={register}
          watch={watch}
          errors={errors}
          state={wizardState}
        />
      ) : null}
    </form>
  );
}

function PersonDeductions({
  errors,
  personId,
  register,
  root,
  state,
  watch,
}: {
  errors: FieldErrors<DeductionsStepFormValues>;
  personId: WizardPersonId;
  register: Register;
  root: PersonRoot;
  state: WizardState;
  watch: Watch;
}) {
  const { lang } = useI18n();
  const params = getParams(state.year);
  const caps = params.deductionCaps;
  const housingKind = (watch(`${root}.deductions.housing.kind` as Path<DeductionsStepFormValues>)
    ?? "none") as WizardHousingDeductionKind;

  return (
    <fieldset className="space-y-5 rounded-md border border-warm-200 bg-white p-5">
      <legend className="px-2 text-sm font-bold text-navy-900">
        {wizardT(personId === "A" ? wizardDictionary.common.personA : wizardDictionary.common.personB, lang)}
      </legend>
      <div className="grid gap-5 md:grid-cols-2">
        <NumberField
          name={`${root}.deductions.selfEducation` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.selfEducation.label}
          help={wizardDictionary.deductions.selfEducation.help}
          optional
          hint={deductionExplainer("self-education", params, lang)}
          error={getFieldError(errors, `${root}.deductions.selfEducation`)}
        />
        <NumberField
          name={`${root}.deductions.charitableDonations` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.charitableDonations.label}
          help={wizardDictionary.deductions.charitableDonations.help}
          optional
          hint={deductionExplainer("donations", params, lang)}
          error={getFieldError(errors, `${root}.deductions.charitableDonations`)}
        />
        <NumberField
          name={`${root}.deductions.elderlyCare` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.elderlyCare.label}
          help={wizardDictionary.deductions.elderlyCare.help}
          optional
          hint={deductionExplainer("elderly-care", params, lang)}
          error={getFieldError(errors, `${root}.deductions.elderlyCare`)}
        />
        <NumberField
          name={`${root}.deductions.mpfMandatory` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.mpfMandatory.label}
          help={wizardDictionary.deductions.mpfMandatory.help}
          optional
          hint={deductionExplainer("mpf-mandatory", params, lang)}
          error={getFieldError(errors, `${root}.deductions.mpfMandatory`)}
        />
      </div>

      <section className="space-y-4 rounded-md border border-warm-100 bg-warm-50 p-4">
        <RadioGroupField
          name={`${root}.deductions.housing.kind` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.housingKind.label}
          help={wizardDictionary.deductions.housingKind.help}
          options={[
            { value: "none", label: wizardDictionary.deductions.housingNone.label },
            { value: "homeLoanInterest", label: wizardDictionary.deductions.homeLoanInterest.label },
            { value: "domesticRent", label: wizardDictionary.deductions.domesticRent.label },
          ]}
          hint={housingDeductionExplainer(housingKind, params, lang)}
          error={getFieldError(errors, `${root}.deductions.housing.kind`)}
        />
        {housingKind !== "none" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <NumberField
              name={`${root}.deductions.housing.amount` as Path<DeductionsStepFormValues>}
              register={register}
              label={wizardDictionary.deductions.housingAmount.label}
              help={wizardDictionary.deductions.housingAmount.help}
              hint={selectedHousingCapHint(housingKind, caps, lang)}
              error={getFieldError(errors, `${root}.deductions.housing.amount`)}
            />
            <CheckboxField
              name={`${root}.deductions.housing.eligibleForElevatedCap` as Path<DeductionsStepFormValues>}
              register={register}
              label={wizardDictionary.deductions.newbornElevatedCap.label}
              help={wizardDictionary.deductions.newbornElevatedCap.help}
              error={getFieldError(errors, `${root}.deductions.housing.eligibleForElevatedCap`)}
            />
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <NumberField
          name={`${root}.deductions.annuityAndTvc` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.annuityAndTvc.label}
          help={wizardDictionary.deductions.annuityAndTvc.help}
          optional
          hint={deductionExplainer("annuity-tvc", params, lang)}
          error={getFieldError(errors, `${root}.deductions.annuityAndTvc`)}
        />
        <NumberField
          name={`${root}.deductions.vhisPremiums` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.vhisPremiums.label}
          help={wizardDictionary.deductions.vhisPremiums.help}
          optional
          hint={deductionExplainer("vhis", params, lang)}
          error={getFieldError(errors, `${root}.deductions.vhisPremiums`)}
        />
        <NumberField
          name={`${root}.deductions.vhisInsuredPersons` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.vhisInsuredPersons.label}
          help={wizardDictionary.deductions.vhisInsuredPersons.help}
          optional
          error={getFieldError(errors, `${root}.deductions.vhisInsuredPersons`)}
        />
        <NumberField
          name={`${root}.deductions.assistedReproduction` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.assistedReproduction.label}
          help={wizardDictionary.deductions.assistedReproduction.help}
          optional
          hint={deductionExplainer("assisted-reproduction", params, lang)}
          error={getFieldError(errors, `${root}.deductions.assistedReproduction`)}
        />
      </div>
    </fieldset>
  );
}

function deductionsDefaults(state: WizardState): DeductionsStepFormValues {
  return {
    personA: {
      personId: "A",
      deductions: state.personA.deductions,
    },
    personB: {
      personId: "B",
      deductions: state.personB.deductions,
    },
  };
}

function normalizeDeductions(deductions: WizardDeductions): WizardDeductions {
  if (deductions.housing.kind === "none") {
    return {
      ...deductions,
      housing: {
        kind: "none",
        amount: 0,
        eligibleForElevatedCap: null,
      },
    };
  }

  return {
    ...deductions,
    housing: {
      ...deductions.housing,
      eligibleForElevatedCap: Boolean(deductions.housing.eligibleForElevatedCap),
    },
  };
}

function selectedHousingCapHint(
  kind: WizardHousingDeductionKind,
  caps: ReturnType<typeof getParams>["deductionCaps"],
  lang: "zh" | "en",
): string {
  if (kind === "homeLoanInterest") {
    return `${wizardT(wizardDictionary.deductions.capNote, lang)}: ${formatHKD(caps.homeLoanInterest)} / ${formatHKD(caps.homeLoanInterestElevated)}`;
  }

  return `${wizardT(wizardDictionary.deductions.capNote, lang)}: ${formatHKD(caps.domesticRent)} / ${formatHKD(caps.domesticRentElevated)}`;
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    maximumFractionDigits: 0,
    style: "percent",
  }).format(value);
}

type DeductionOnlyEntry = Extract<DeductionEntry, { kind: "deduction" }>;
type DeductionEntryId =
  | "self-education"
  | "donations"
  | "elderly-care"
  | "mpf-mandatory"
  | "home-loan-interest"
  | "domestic-rent"
  | "annuity-tvc"
  | "vhis"
  | "assisted-reproduction";

function deductionExplainer(
  entryId: DeductionEntryId,
  params: ReturnType<typeof getParams>,
  lang: "zh" | "en",
): ReactNode {
  const entry = findDeductionEntry(entryId);
  const pitfall = entry ? (lang === "zh" ? entry.pitfallsZh[0] : entry.pitfallsEn[0]) : undefined;

  if (!entry || !pitfall) {
    return null;
  }

  return (
    <>
      {deductionCapSummary(entry, params.deductionCaps, lang)} · {interpolate(pitfall, deductionVariables(params, lang))} ·{" "}
      <Link href="/deductions" className="font-semibold text-teal-700 underline-offset-2 hover:underline">
        {wizardT(wizardDictionary.hints.moreDetails, lang)}
      </Link>
    </>
  );
}

function housingDeductionExplainer(
  kind: WizardHousingDeductionKind,
  params: ReturnType<typeof getParams>,
  lang: "zh" | "en",
): ReactNode {
  if (kind === "none") {
    return null;
  }

  return deductionExplainer(kind === "homeLoanInterest" ? "home-loan-interest" : "domestic-rent", params, lang);
}

function findDeductionEntry(entryId: DeductionEntryId): DeductionOnlyEntry | null {
  const entry = deductionEntries.find((item) => item.id === entryId);
  return entry?.kind === "deduction" ? entry : null;
}

function deductionCapSummary(
  entry: DeductionOnlyEntry,
  caps: ReturnType<typeof getParams>["deductionCaps"],
  lang: "zh" | "en",
): string {
  return `${wizardT(wizardDictionary.common.cap, lang)}: ${entry.capKeys
    .filter((key) => key !== "homeLoanInterestYears")
    .map((key) => key === "donationsPercent" ? formatPercent(caps[key]) : formatHKD(caps[key]))
    .join(" / ")}`;
}

function deductionVariables(params: ReturnType<typeof getParams>, lang: "zh" | "en"): Record<string, string> {
  return {
    donationMinimum: formatHKD(DONATION_MINIMUM_HKD),
    donationsPercent: formatPercent(params.deductionCaps.donationsPercent),
    homeLoanInterestYears: formatCount(params.deductionCaps.homeLoanInterestYears, lang),
  };
}

function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => variables[key] ?? match);
}

function formatCount(value: number, lang: "zh" | "en"): string {
  return lang === "zh" ? `${value} 年` : `${value} years`;
}
