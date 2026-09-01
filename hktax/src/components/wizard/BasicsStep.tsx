"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/lib/i18n/useI18n";
import { useWizard } from "@/lib/wizard/wizardContext";
import {
  basicsStepSchema,
  type BasicsStepFormValues,
} from "@/lib/wizard/wizardSchemas";
import {
  createDefaultWizardState,
  type WizardPersonId,
  type WizardState,
} from "@/lib/wizard/wizardState";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";
import {
  CheckboxField,
  NumberField,
  RadioGroupField,
  SelectField,
  getFieldError,
  scrollToFirstError,
} from "./FormFields";

type BasicsStepProps = {
  formId: string;
  onValid: () => void;
};

const years = [
  { value: "2024_25", label: "2024/25" },
  { value: "2025_26", label: "2025/26" },
];

export function BasicsStep({ formId, onValid }: BasicsStepProps) {
  const { lang, setYear, year } = useI18n();
  const { setWizardState, wizardState } = useWizard();
  const defaultValues = useMemo(() => basicsDefaults(wizardState), [wizardState]);
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<BasicsStepFormValues>({
    resolver: zodResolver(basicsStepSchema),
    defaultValues,
  });
  const maritalStatus = watch("maritalStatus");

  useEffect(() => {
    if (!isDirty) {
      reset(defaultValues);
    }
  }, [defaultValues, isDirty, reset]);

  useEffect(() => {
    if (isFreshWizardState(wizardState) && wizardState.year !== year) {
      setWizardState((previous) => ({ ...previous, year }));
    }
  }, [setWizardState, wizardState, year]);

  function onSubmit(values: BasicsStepFormValues) {
    setWizardState((previous) => ({
      ...previous,
      year: values.year,
      maritalStatus: values.maritalStatus,
      personA: {
        ...previous.personA,
        personId: "A",
        paEligibility: values.personA.paEligibility,
      },
      personB: {
        ...previous.personB,
        personId: "B",
        paEligibility: values.personB.paEligibility,
      },
      claimingSpouseForFamilyAllowances: values.maritalStatus === "married"
        ? values.claimingSpouseForFamilyAllowances
        : "A",
      claimMarriedAllowanceBy: values.maritalStatus === "married"
        ? values.claimMarriedAllowanceBy
        : "none",
    }));
    setYear(values.year);
    onValid();
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit, scrollToFirstError)} className="space-y-8" noValidate>
      <input type="hidden" {...register("personA.personId")} />
      <input type="hidden" {...register("personB.personId")} />
      <div>
        <h1 className="display-subsection">
          {wizardT(wizardDictionary.basics.title, lang)}
        </h1>
      </div>

      <div className="card grid gap-5 p-5 md:grid-cols-2 sm:p-6">
        <SelectField
          name="year"
          register={register}
          label={wizardDictionary.basics.year.label}
          help={wizardDictionary.basics.year.help}
          options={years}
          error={getFieldError(errors, "year")}
        />
        <RadioGroupField
          name="maritalStatus"
          register={register}
          label={wizardDictionary.basics.maritalStatus.label}
          help={wizardDictionary.basics.maritalStatus.help}
          options={[
            { value: "single", label: wizardDictionary.basics.maritalStatus.single },
            { value: "married", label: wizardDictionary.basics.maritalStatus.married },
          ]}
          error={getFieldError(errors, "maritalStatus")}
        />
      </div>

      <PAEligibilityFields personId="A" register={register} errors={errors} />
      {maritalStatus === "married" ? (
        <>
          <PAEligibilityFields personId="B" register={register} errors={errors} />
          <div className="grid gap-5 md:grid-cols-2">
            <RadioGroupField
              name="claimingSpouseForFamilyAllowances"
              register={register}
              label={wizardDictionary.basics.claimingSpouseForFamilyAllowances.label}
              help={wizardDictionary.basics.claimingSpouseForFamilyAllowances.help}
              options={personOptions()}
              error={getFieldError(errors, "claimingSpouseForFamilyAllowances")}
            />
            <RadioGroupField
              name="claimMarriedAllowanceBy"
              register={register}
              label={wizardDictionary.basics.claimMarriedAllowanceBy.label}
              help={wizardDictionary.basics.claimMarriedAllowanceBy.help}
              options={[
                ...personOptions(),
                { value: "none", label: wizardDictionary.basics.claimMarriedAllowanceBy.none },
              ]}
              error={getFieldError(errors, "claimMarriedAllowanceBy")}
            />
          </div>
        </>
      ) : null}
    </form>
  );
}

function PAEligibilityFields({
  errors,
  personId,
  register,
}: {
  errors: Parameters<typeof getFieldError<BasicsStepFormValues>>[0];
  personId: WizardPersonId;
  register: ReturnType<typeof useForm<BasicsStepFormValues>>["register"];
}) {
  const { lang } = useI18n();
  const root = personId === "A" ? "personA" : "personB";
  const title = personId === "A"
    ? wizardDictionary.basics.personA.label
    : wizardDictionary.basics.personB.label;

  return (
    <fieldset className="card p-5 sm:p-6">
      <legend className="px-2 text-sm font-bold text-navy-900">
        {wizardT(title, lang)} · {wizardT(wizardDictionary.paEligibility.title, lang)}
      </legend>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <NumberField
          name={`${root}.paEligibility.ageDuringYear`}
          register={register}
          label={wizardDictionary.paEligibility.ageDuringYear.label}
          help={wizardDictionary.paEligibility.ageDuringYear.help}
          optional
          error={getFieldError(errors, `${root}.paEligibility.ageDuringYear`)}
        />
        <CheckboxField
          name={`${root}.paEligibility.bothParentsDeceased`}
          register={register}
          label={wizardDictionary.paEligibility.bothParentsDeceased.label}
          help={wizardDictionary.paEligibility.bothParentsDeceased.help}
          error={getFieldError(errors, `${root}.paEligibility.bothParentsDeceased`)}
        />
        <CheckboxField
          name={`${root}.paEligibility.isHongKongPermanentResident`}
          register={register}
          label={wizardDictionary.paEligibility.isHongKongPermanentResident.label}
          help={wizardDictionary.paEligibility.isHongKongPermanentResident.help}
          error={getFieldError(errors, `${root}.paEligibility.isHongKongPermanentResident`)}
        />
        <CheckboxField
          name={`${root}.paEligibility.ordinarilyResidentInHongKong`}
          register={register}
          label={wizardDictionary.paEligibility.ordinarilyResidentInHongKong.label}
          help={wizardDictionary.paEligibility.ordinarilyResidentInHongKong.help}
          error={getFieldError(errors, `${root}.paEligibility.ordinarilyResidentInHongKong`)}
        />
        <CheckboxField
          name={`${root}.paEligibility.presentInHongKongMoreThan180Days`}
          register={register}
          label={wizardDictionary.paEligibility.presentInHongKongMoreThan180Days.label}
          help={wizardDictionary.paEligibility.presentInHongKongMoreThan180Days.help}
          error={getFieldError(errors, `${root}.paEligibility.presentInHongKongMoreThan180Days`)}
        />
        <CheckboxField
          name={`${root}.paEligibility.presentInHongKongMoreThan300DaysAcrossTwoYears`}
          register={register}
          label={wizardDictionary.paEligibility.presentInHongKongMoreThan300DaysAcrossTwoYears.label}
          help={wizardDictionary.paEligibility.presentInHongKongMoreThan300DaysAcrossTwoYears.help}
          error={getFieldError(errors, `${root}.paEligibility.presentInHongKongMoreThan300DaysAcrossTwoYears`)}
        />
      </div>
    </fieldset>
  );
}

function basicsDefaults(state: WizardState): BasicsStepFormValues {
  return {
    year: state.year,
    maritalStatus: state.maritalStatus,
    personA: {
      personId: "A",
      paEligibility: state.personA.paEligibility,
    },
    personB: {
      personId: "B",
      paEligibility: state.personB.paEligibility,
    },
    claimingSpouseForFamilyAllowances: state.claimingSpouseForFamilyAllowances,
    claimMarriedAllowanceBy: state.claimMarriedAllowanceBy,
  };
}

function personOptions() {
  return [
    { value: "A", label: wizardDictionary.common.personA },
    { value: "B", label: wizardDictionary.common.personB },
  ];
}

function isFreshWizardState(state: WizardState): boolean {
  const defaultState = createDefaultWizardState();
  return JSON.stringify({ ...state, year: defaultState.year }) === JSON.stringify(defaultState);
}
