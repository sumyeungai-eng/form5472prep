"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldErrors,
  type Path,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { deductionEntries, type DeductionEntry } from "@/lib/content/deductions";
import { getParams } from "@/lib/tax/params";
import { useI18n } from "@/lib/i18n/useI18n";
import { useWizard } from "@/lib/wizard/wizardContext";
import {
  createFamilyStepSchema,
  type FamilyStepFormValues,
} from "@/lib/wizard/wizardSchemas";
import { isChildBornInCurrentYear } from "@/lib/wizard/mapping";
import type { WizardChild, WizardParent, WizardState } from "@/lib/wizard/wizardState";
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

type FamilyWizardFormValues = FamilyStepFormValues & Pick<
  WizardState,
  "claimingSpouseForFamilyAllowances" | "claimMarriedAllowanceBy"
>;

type FamilyStepProps = {
  formId: string;
  onValid: () => void;
};

type Register = UseFormRegister<FamilyWizardFormValues>;
type SetValue = UseFormSetValue<FamilyWizardFormValues>;
type Watch = UseFormWatch<FamilyWizardFormValues>;

export function FamilyStep({ formId, onValid }: FamilyStepProps) {
  const { lang } = useI18n();
  const { setWizardState, wizardState } = useWizard();
  const defaultValues = useMemo(() => familyDefaults(wizardState), [wizardState]);
  const params = getParams(wizardState.year);
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<FamilyWizardFormValues>({
    resolver: zodResolver(createFamilyStepSchema(wizardState.year)),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  function onSubmit(values: FamilyWizardFormValues) {
    const rawValues = getValues();
    setWizardState((previous) => ({
      ...previous,
      family: {
        children: values.children,
        parents: values.parents,
        siblingCount: values.siblingCount,
        singleParent: values.singleParent,
        disabledDependantCount: values.disabledDependantCount,
        personalDisability: values.personalDisability,
      },
      claimingSpouseForFamilyAllowances: previous.maritalStatus === "married"
        ? rawValues.claimingSpouseForFamilyAllowances
        : "A",
      claimMarriedAllowanceBy: previous.maritalStatus === "married"
        ? rawValues.claimMarriedAllowanceBy
        : "none",
    }));
    onValid();
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit, scrollToFirstError)} className="space-y-8" noValidate>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          {wizardT(wizardDictionary.family.title, lang)}
        </h1>
      </div>
      <HintsPanel step="family" />
      <ChildrenFields register={register} setValue={setValue} watch={watch} errors={errors} year={wizardState.year} />
      <ParentFields register={register} setValue={setValue} watch={watch} errors={errors} year={wizardState.year} />
      <div className="grid gap-5 rounded-md border border-warm-200 bg-white p-5 md:grid-cols-2">
        <NumberField name="siblingCount" register={register} label={wizardDictionary.family.siblingCount.label} help={wizardDictionary.family.siblingCount.help} error={getFieldError(errors, "siblingCount")} />
        <NumberField name="disabledDependantCount" register={register} label={wizardDictionary.family.disabledDependantCount.label} help={wizardDictionary.family.disabledDependantCount.help} error={getFieldError(errors, "disabledDependantCount")} />
        <CheckboxField name="singleParent" register={register} label={wizardDictionary.family.singleParent.label} help={wizardDictionary.family.singleParent.help} hint={allowanceExplainer("single-parent", params, lang)} error={getFieldError(errors, "singleParent")} />
        <CheckboxField name="personalDisability.A" register={register} label={wizardDictionary.family.personalDisability.label} help={wizardDictionary.family.personalDisability.help} hint={wizardT(wizardDictionary.common.personA, lang)} error={getFieldError(errors, "personalDisability.A")} />
        {wizardState.maritalStatus === "married" ? (
          <CheckboxField name="personalDisability.B" register={register} label={wizardDictionary.family.personalDisability.label} help={wizardDictionary.family.personalDisability.help} hint={wizardT(wizardDictionary.common.personB, lang)} error={getFieldError(errors, "personalDisability.B")} />
        ) : null}
      </div>
      {wizardState.maritalStatus === "married" ? (
        <div className="grid gap-5 rounded-md border border-warm-200 bg-white p-5 md:grid-cols-2">
          <RadioGroupField
            name={"claimingSpouseForFamilyAllowances" as Path<FamilyWizardFormValues>}
            register={register}
            label={wizardDictionary.basics.claimingSpouseForFamilyAllowances.label}
            help={wizardDictionary.basics.claimingSpouseForFamilyAllowances.help}
            options={personOptions()}
            error={getFieldError(errors, "claimingSpouseForFamilyAllowances")}
          />
          <RadioGroupField
            name={"claimMarriedAllowanceBy" as Path<FamilyWizardFormValues>}
            register={register}
            label={wizardDictionary.basics.claimMarriedAllowanceBy.label}
            help={wizardDictionary.basics.claimMarriedAllowanceBy.help}
            options={[...personOptions(), { value: "none", label: wizardDictionary.basics.claimMarriedAllowanceBy.none }]}
            error={getFieldError(errors, "claimMarriedAllowanceBy")}
          />
        </div>
      ) : null}
    </form>
  );
}

function ChildrenFields({
  errors,
  register,
  setValue,
  watch,
  year,
}: {
  errors: FieldErrors<FamilyWizardFormValues>;
  register: Register;
  setValue: SetValue;
  watch: Watch;
  year: WizardState["year"];
}) {
  const { lang } = useI18n();
  const children = watch("children") ?? [];
  const endYear = year === "2024_25" ? 2025 : 2026;
  const params = getParams(year);

  return (
    <section className="space-y-3 rounded-md border border-warm-200 bg-white p-5">
      <h2 className="text-lg font-bold text-navy-900">{wizardT(wizardDictionary.family.children.label, lang)}</h2>
      {allowanceExplainer("child", params, lang)}
      {children.map((child, index) => (
        <div key={index} className="grid gap-3 rounded-md border border-warm-100 bg-warm-50 p-3 md:grid-cols-[1fr_auto]">
          <NumberField
            name={`children.${index}.birthYear` as Path<FamilyWizardFormValues>}
            register={register}
            label={wizardDictionary.family.childBirthYear.label}
            help={wizardDictionary.family.childBirthYear.help}
            error={getFieldError(errors, `children.${index}.birthYear`)}
          />
          <div className="flex items-end gap-3">
            {child.bornDuringYearOfAssessment ? (
              <span className="rounded-md bg-gold-100 px-3 py-2 text-sm font-semibold text-gold-700">
                {wizardT(wizardDictionary.sourceDetails.newborn, lang)}
              </span>
            ) : null}
            <button type="button" className="focus-ring rounded-md px-3 py-2 text-sm font-semibold text-red-700" onClick={() => setValue("children", children.filter((_item, itemIndex) => itemIndex !== index), { shouldDirty: true })}>
              {wizardT(wizardDictionary.common.remove, lang)}
            </button>
          </div>
          <CheckboxField
            name={`children.${index}.bornDuringYearOfAssessment` as Path<FamilyWizardFormValues>}
            register={register}
            label={wizardDictionary.family.childBornDuringYearOfAssessment.label}
            help={wizardDictionary.family.childBornDuringYearOfAssessment.help}
            error={getFieldError(errors, `children.${index}.bornDuringYearOfAssessment`)}
            className="md:col-span-2"
          />
        </div>
      ))}
      <button type="button" className="focus-ring rounded-md border border-teal-200 px-3 py-2 text-sm font-bold text-teal-700" onClick={() => setValue("children", [...children, { key: `child-${children.length + 1}`, birthYear: endYear, bornDuringYearOfAssessment: true }], { shouldDirty: true })}>
        {wizardT(wizardDictionary.common.add, lang)}
      </button>
    </section>
  );
}

function ParentFields({
  errors,
  register,
  setValue,
  watch,
  year,
}: {
  errors: FieldErrors<FamilyWizardFormValues>;
  register: Register;
  setValue: SetValue;
  watch: Watch;
  year: WizardState["year"];
}) {
  const { lang } = useI18n();
  const parents = watch("parents") ?? [];
  const params = getParams(year);

  return (
    <section className="space-y-3 rounded-md border border-warm-200 bg-white p-5">
      <h2 className="text-lg font-bold text-navy-900">{wizardT(wizardDictionary.family.parents.label, lang)}</h2>
      {allowanceExplainer("parent-grandparent", params, lang)}
      {parents.map((parent, index) => (
        <div key={index} className="grid gap-3 rounded-md border border-warm-100 bg-warm-50 p-3 md:grid-cols-2">
          <NumberField name={`parents.${index}.birthYear` as Path<FamilyWizardFormValues>} register={register} label={wizardDictionary.family.parentBirthYear.label} help={wizardDictionary.family.parentBirthYear.help} optional error={getFieldError(errors, `parents.${index}.birthYear`)} />
          <NumberField name={`parents.${index}.ageDuringYear` as Path<FamilyWizardFormValues>} register={register} label={wizardDictionary.family.parentAgeDuringYear.label} help={wizardDictionary.family.parentAgeDuringYear.help} optional error={getFieldError(errors, `parents.${index}.ageDuringYear`)} />
          <CheckboxField name={`parents.${index}.inCareHome` as Path<FamilyWizardFormValues>} register={register} label={wizardDictionary.family.inCareHome.label} help={wizardDictionary.family.inCareHome.help} error={getFieldError(errors, `parents.${index}.inCareHome`)} />
          {parent.inCareHome ? (
            <NumberField name={`parents.${index}.careHomeExpenses` as Path<FamilyWizardFormValues>} register={register} label={wizardDictionary.family.careHomeExpenses.label} help={wizardDictionary.family.careHomeExpenses.help} optional error={getFieldError(errors, `parents.${index}.careHomeExpenses`)} />
          ) : (
            <CheckboxField name={`parents.${index}.residedWithTaxpayer` as Path<FamilyWizardFormValues>} register={register} label={wizardDictionary.family.residedWithTaxpayer.label} help={wizardDictionary.family.residedWithTaxpayer.help} error={getFieldError(errors, `parents.${index}.residedWithTaxpayer`)} />
          )}
          <div className="md:col-span-2">
            <button type="button" className="focus-ring rounded-md px-3 py-2 text-sm font-semibold text-red-700" onClick={() => setValue("parents", parents.filter((_item, itemIndex) => itemIndex !== index), { shouldDirty: true })}>
              {wizardT(wizardDictionary.common.remove, lang)}
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="focus-ring rounded-md border border-teal-200 px-3 py-2 text-sm font-bold text-teal-700" onClick={() => setValue("parents", [...parents, defaultParent(parents.length + 1)], { shouldDirty: true })}>
        {wizardT(wizardDictionary.common.add, lang)}
      </button>
    </section>
  );
}

function familyDefaults(state: WizardState): FamilyWizardFormValues {
  return {
    ...state.family,
    children: state.family.children.map((child) => ({
      ...child,
      bornDuringYearOfAssessment: child.bornDuringYearOfAssessment
        ?? isChildBornInCurrentYear(child.birthYear, state.year),
    })),
    claimingSpouseForFamilyAllowances: state.claimingSpouseForFamilyAllowances,
    claimMarriedAllowanceBy: state.claimMarriedAllowanceBy,
  };
}

function defaultParent(index: number): WizardParent {
  return {
    key: `parent-${index}`,
    ageDuringYear: 60,
    residedWithTaxpayer: false,
    inCareHome: false,
  };
}

function personOptions() {
  return [
    { value: "A", label: wizardDictionary.common.personA },
    { value: "B", label: wizardDictionary.common.personB },
  ];
}

type AllowanceEntry = Extract<DeductionEntry, { kind: "allowance" }>;

function allowanceExplainer(
  entryId: "child" | "parent-grandparent" | "single-parent",
  params: ReturnType<typeof getParams>,
  lang: "zh" | "en",
): ReactNode {
  const entry = findAllowanceEntry(entryId);
  const pitfall = entry ? (lang === "zh" ? entry.pitfallsZh[0] : entry.pitfallsEn[0]) : undefined;

  if (!entry || !pitfall) {
    return null;
  }

  // Must be a block element: as an inline <span> it shared a line with the
  // following "add" button, whose padding then overlapped the text.
  return (
    <p className="text-xs leading-5 text-warm-600">
      {allowanceCapSummary(entry, params.allowances, lang)} · {interpolate(pitfall, allowanceVariables(params, lang))} ·{" "}
      <Link href="/deductions" className="font-semibold text-teal-700 underline-offset-2 hover:underline">
        {wizardT(wizardDictionary.hints.moreDetails, lang)}
      </Link>
    </p>
  );
}

function findAllowanceEntry(entryId: string): AllowanceEntry | null {
  const entry = deductionEntries.find((item) => item.id === entryId);
  return entry?.kind === "allowance" ? entry : null;
}

function allowanceCapSummary(
  entry: AllowanceEntry,
  allowances: ReturnType<typeof getParams>["allowances"],
  lang: "zh" | "en",
): string {
  return `${wizardT(wizardDictionary.common.cap, lang)}: ${entry.capKeys
    .map((key) => formatHKD(allowances[key]))
    .join(" / ")}`;
}

function allowanceVariables(params: ReturnType<typeof getParams>, lang: "zh" | "en"): Record<string, string> {
  return {
    homeLoanInterestYears: formatCount(params.deductionCaps.homeLoanInterestYears, lang),
  };
}

function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => variables[key] ?? match);
}

function formatCount(value: number, lang: "zh" | "en"): string {
  return lang === "zh" ? `${value} 年` : `${value} years`;
}
