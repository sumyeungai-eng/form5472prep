"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldErrors,
  type Path,
  type UseFormRegister,
  type UseFormWatch,
} from "react-hook-form";
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
} from "./FormFields";

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
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <input type="hidden" {...register("personA.personId")} />
      <input type="hidden" {...register("personB.personId")} />
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          {wizardT(wizardDictionary.deductions.title, lang)}
        </h1>
      </div>
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
  const caps = getParams(state.year).deductionCaps;
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
          hint={capHint(caps.selfEducation, lang)}
          error={getFieldError(errors, `${root}.deductions.selfEducation`)}
        />
        <NumberField
          name={`${root}.deductions.charitableDonations` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.charitableDonations.label}
          help={wizardDictionary.deductions.charitableDonations.help}
          optional
          hint={`${wizardT(wizardDictionary.deductions.donationsPercentNote, lang)}: ${formatPercent(caps.donationsPercent)}`}
          error={getFieldError(errors, `${root}.deductions.charitableDonations`)}
        />
        <NumberField
          name={`${root}.deductions.elderlyCare` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.elderlyCare.label}
          help={wizardDictionary.deductions.elderlyCare.help}
          optional
          hint={capHint(caps.elderlyCare, lang)}
          error={getFieldError(errors, `${root}.deductions.elderlyCare`)}
        />
        <NumberField
          name={`${root}.deductions.mpfMandatory` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.mpfMandatory.label}
          help={wizardDictionary.deductions.mpfMandatory.help}
          optional
          hint={capHint(caps.mpfMandatory, lang)}
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
          hint={housingCapHint(caps, lang)}
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
          hint={capHint(caps.annuityAndTvc, lang)}
          error={getFieldError(errors, `${root}.deductions.annuityAndTvc`)}
        />
        <NumberField
          name={`${root}.deductions.vhisPremiums` as Path<DeductionsStepFormValues>}
          register={register}
          label={wizardDictionary.deductions.vhisPremiums.label}
          help={wizardDictionary.deductions.vhisPremiums.help}
          optional
          hint={capHint(caps.vhisPerPerson, lang)}
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
          hint={capHint(caps.assistedReproduction, lang)}
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

function capHint(cap: number, lang: "zh" | "en"): string {
  return `${wizardT(wizardDictionary.deductions.capNote, lang)}: ${formatHKD(cap)}`;
}

function housingCapHint(
  caps: ReturnType<typeof getParams>["deductionCaps"],
  lang: "zh" | "en",
): string {
  return [
    `${wizardT(wizardDictionary.deductions.homeLoanInterest.label, lang)}: ${formatHKD(caps.homeLoanInterest)} / ${formatHKD(caps.homeLoanInterestElevated)}`,
    `${wizardT(wizardDictionary.deductions.domesticRent.label, lang)}: ${formatHKD(caps.domesticRent)} / ${formatHKD(caps.domesticRentElevated)}`,
  ].join(" · ");
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
