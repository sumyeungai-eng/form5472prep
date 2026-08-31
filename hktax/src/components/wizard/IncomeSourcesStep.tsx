"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/lib/i18n/useI18n";
import { useWizard } from "@/lib/wizard/wizardContext";
import {
  incomeSourcesStepSchema,
  type IncomeSourcesStepFormValues,
} from "@/lib/wizard/wizardSchemas";
import type { WizardPersonId, WizardState } from "@/lib/wizard/wizardState";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";
import { CheckboxField, getFieldError, scrollToFirstError } from "./FormFields";

type IncomeSourcesStepProps = {
  formId: string;
  onValid: () => void;
};

export function IncomeSourcesStep({ formId, onValid }: IncomeSourcesStepProps) {
  const { lang } = useI18n();
  const { setWizardState, wizardState } = useWizard();
  const defaultValues = useMemo(() => incomeSourceDefaults(wizardState), [wizardState]);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<IncomeSourcesStepFormValues>({
    resolver: zodResolver(incomeSourcesStepSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  function onSubmit(values: IncomeSourcesStepFormValues) {
    setWizardState((previous) => ({
      ...previous,
      personA: {
        ...previous.personA,
        incomeSources: values.personA.incomeSources,
      },
      personB: {
        ...previous.personB,
        incomeSources: values.personB.incomeSources,
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
          {wizardT(wizardDictionary.incomeSources.title, lang)}
        </h1>
      </div>
      <IncomeSourceFields personId="A" register={register} errors={errors} />
      {wizardState.maritalStatus === "married" ? (
        <IncomeSourceFields personId="B" register={register} errors={errors} />
      ) : null}
    </form>
  );
}

function IncomeSourceFields({
  errors,
  personId,
  register,
}: {
  errors: Parameters<typeof getFieldError<IncomeSourcesStepFormValues>>[0];
  personId: WizardPersonId;
  register: ReturnType<typeof useForm<IncomeSourcesStepFormValues>>["register"];
}) {
  const { lang } = useI18n();
  const root = personId === "A" ? "personA" : "personB";

  return (
    <fieldset className="rounded-md border border-warm-200 bg-white p-5">
      <legend className="px-2 text-sm font-bold text-navy-900">
        {wizardT(personId === "A" ? wizardDictionary.common.personA : wizardDictionary.common.personB, lang)}
      </legend>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        <CheckboxField
          name={`${root}.incomeSources.hasSalary`}
          register={register}
          label={wizardDictionary.incomeSources.hasSalary.label}
          help={wizardDictionary.incomeSources.hasSalary.help}
          error={getFieldError(errors, `${root}.incomeSources.hasSalary`)}
        />
        <CheckboxField
          name={`${root}.incomeSources.hasProperty`}
          register={register}
          label={wizardDictionary.incomeSources.hasProperty.label}
          help={wizardDictionary.incomeSources.hasProperty.help}
          error={getFieldError(errors, `${root}.incomeSources.hasProperty`)}
        />
        <CheckboxField
          name={`${root}.incomeSources.hasBusiness`}
          register={register}
          label={wizardDictionary.incomeSources.hasBusiness.label}
          help={wizardDictionary.incomeSources.hasBusiness.help}
          error={getFieldError(errors, `${root}.incomeSources.hasBusiness`)}
        />
      </div>
    </fieldset>
  );
}

function incomeSourceDefaults(state: WizardState): IncomeSourcesStepFormValues {
  return {
    personA: {
      personId: "A",
      incomeSources: state.personA.incomeSources,
    },
    personB: {
      personId: "B",
      incomeSources: state.personB.incomeSources,
    },
  };
}
