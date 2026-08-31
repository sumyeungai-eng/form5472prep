"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldErrors,
  type Path,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { getParams } from "@/lib/tax/params";
import { useI18n } from "@/lib/i18n/useI18n";
import { calculateMpfAutoFill } from "@/lib/wizard/mapping";
import { useWizard } from "@/lib/wizard/wizardContext";
import {
  sourceDetailsStepSchema,
  type SourceDetailsStepFormValues,
} from "@/lib/wizard/wizardSchemas";
import type {
  WizardBusiness,
  WizardEmployerAccommodation,
  WizardMoneyItem,
  WizardPersonId,
  WizardProperty,
  WizardState,
} from "@/lib/wizard/wizardState";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";
import {
  NumberField,
  RadioGroupField,
  SelectField,
  TextField,
  getFieldError,
} from "./FormFields";
import { HelpPopover } from "./HelpPopover";

type SourceDetailsStepProps = {
  formId: string;
  onValid: () => void;
};

type PersonRoot = "personA" | "personB";
type Register = UseFormRegister<SourceDetailsStepFormValues>;
type SetValue = UseFormSetValue<SourceDetailsStepFormValues>;
type Watch = UseFormWatch<SourceDetailsStepFormValues>;

export function SourceDetailsStep({ formId, onValid }: SourceDetailsStepProps) {
  const { lang } = useI18n();
  const { setWizardState, wizardState } = useWizard();
  const defaultValues = useMemo(() => sourceDetailsDefaults(wizardState), [wizardState]);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<SourceDetailsStepFormValues>({
    resolver: zodResolver(sourceDetailsStepSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const hasAnySource = personHasAnySource(wizardState, "A")
    || (wizardState.maritalStatus === "married" && personHasAnySource(wizardState, "B"));

  function onSubmit(values: SourceDetailsStepFormValues) {
    setWizardState((previous) => ({
      ...previous,
      personA: {
        ...previous.personA,
        salary: values.personA.salary,
        properties: values.personA.properties,
        businesses: values.personA.businesses,
        electedTwoTierBusinessId: values.personA.electedTwoTierBusinessId,
        paLossBroughtForward: values.personA.paLossBroughtForward,
      },
      personB: {
        ...previous.personB,
        salary: values.personB.salary,
        properties: values.personB.properties,
        businesses: values.personB.businesses,
        electedTwoTierBusinessId: values.personB.electedTwoTierBusinessId,
        paLossBroughtForward: values.personB.paLossBroughtForward,
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
          {wizardT(wizardDictionary.salary.title, lang)}
        </h1>
      </div>
      {!hasAnySource ? (
        <div className="rounded-md border border-warm-200 bg-white p-5 text-sm text-warm-700">
          {wizardT(wizardDictionary.sourceDetails.noSources, lang)}
        </div>
      ) : null}
      <PersonSourceDetails
        personId="A"
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />
      {wizardState.maritalStatus === "married" ? (
        <PersonSourceDetails
          personId="B"
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />
      ) : null}
    </form>
  );
}

function PersonSourceDetails({
  errors,
  personId,
  register,
  setValue,
  watch,
}: {
  errors: FieldErrors<SourceDetailsStepFormValues>;
  personId: WizardPersonId;
  register: Register;
  setValue: SetValue;
  watch: Watch;
}) {
  const { lang } = useI18n();
  const { setWizardState, wizardState } = useWizard();
  const root = personRoot(personId);
  const person = personId === "A" ? wizardState.personA : wizardState.personB;

  if (!personHasAnySource(wizardState, personId)) {
    return null;
  }

  return (
    <fieldset className="space-y-6 rounded-md border border-warm-200 bg-white p-5">
      <legend className="px-2 text-sm font-bold text-navy-900">
        {wizardT(personId === "A" ? wizardDictionary.common.personA : wizardDictionary.common.personB, lang)}
      </legend>
      {person.incomeSources.hasSalary ? (
        <SalaryDetailForm
          personId={personId}
          root={root}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          onMpfAutoFill={(amount) => {
            setWizardState((previous) => {
              const key = personId === "A" ? "personA" : "personB";
              return {
                ...previous,
                [key]: {
                  ...previous[key],
                  deductions: {
                    ...previous[key].deductions,
                    mpfMandatory: amount,
                  },
                },
              };
            });
          }}
        />
      ) : null}
      {person.incomeSources.hasProperty ? (
        <PropertyDetailForm root={root} register={register} setValue={setValue} watch={watch} errors={errors} />
      ) : null}
      {person.incomeSources.hasBusiness ? (
        <BusinessDetailForm root={root} register={register} setValue={setValue} watch={watch} errors={errors} />
      ) : null}
    </fieldset>
  );
}

function SalaryDetailForm({
  errors,
  onMpfAutoFill,
  personId,
  register,
  root,
  setValue,
  watch,
}: {
  errors: FieldErrors<SourceDetailsStepFormValues>;
  onMpfAutoFill: (amount: number) => void;
  personId: WizardPersonId;
  register: Register;
  root: PersonRoot;
  setValue: SetValue;
  watch: Watch;
}) {
  const { lang } = useI18n();
  const { wizardState } = useWizard();
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const incomeItems = (watch(`${root}.salary.incomeItems` as Path<SourceDetailsStepFormValues>) ?? []) as WizardMoneyItem[];
  const expenses = (watch(`${root}.salary.outgoingsAndExpenses` as Path<SourceDetailsStepFormValues>) ?? []) as WizardMoneyItem[];
  const depreciation = (watch(`${root}.salary.depreciationAllowances` as Path<SourceDetailsStepFormValues>) ?? []) as WizardMoneyItem[];
  const accommodation = (watch(`${root}.salary.employerAccommodation` as Path<SourceDetailsStepFormValues>) ?? []) as WizardEmployerAccommodation[];

  return (
    <section className="space-y-4 border-t border-warm-100 pt-5">
      <h2 className="text-lg font-bold text-navy-900">{wizardT(wizardDictionary.salary.title, lang)}</h2>
      <MoneyItems
        array={incomeItems}
        basePath={`${root}.salary.incomeItems`}
        addLabel={wizardDictionary.sourceDetails.addIncomeItem}
        register={register}
        setValue={setValue}
        errors={errors}
        itemFactory={() => defaultMoneyItem("income", incomeItems.length + 1)}
      />
      <AccommodationItems
        array={accommodation}
        basePath={`${root}.salary.employerAccommodation`}
        register={register}
        setValue={setValue}
        errors={errors}
      />
      <div className="rounded-md border border-teal-100 bg-teal-50 p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-navy-900" htmlFor={`${root}-mpf-income`}>
          <span>{wizardT(wizardDictionary.sourceDetails.mpfMonthlyIncome.label, lang)}</span>
          <HelpPopover entry={wizardDictionary.sourceDetails.mpfMonthlyIncome.help} />
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id={`${root}-mpf-income`}
            type="number"
            min={0}
            step={1}
            value={monthlyIncome}
            onChange={(event) => setMonthlyIncome(event.target.value)}
            className="form-input w-full"
          />
          <button
            type="button"
            onClick={() => {
              const amount = calculateMpfAutoFill(Number(monthlyIncome || 0), getParams(wizardState.year));
              onMpfAutoFill(amount);
            }}
            className="focus-ring inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-navy-900 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800"
          >
            {wizardT(wizardDictionary.sourceDetails.autoMpf, lang)}
          </button>
        </div>
      </div>
      <MoneyItems
        array={expenses}
        basePath={`${root}.salary.outgoingsAndExpenses`}
        addLabel={wizardDictionary.sourceDetails.addExpenseItem}
        register={register}
        setValue={setValue}
        errors={errors}
        itemFactory={() => defaultMoneyItem("expense", expenses.length + 1)}
      />
      <MoneyItems
        array={depreciation}
        basePath={`${root}.salary.depreciationAllowances`}
        addLabel={wizardDictionary.sourceDetails.addDepreciationItem}
        register={register}
        setValue={setValue}
        errors={errors}
        itemFactory={() => defaultMoneyItem("depreciation", depreciation.length + 1)}
      />
      <NumberField
        name={`${root}.paLossBroughtForward` as Path<SourceDetailsStepFormValues>}
        register={register}
        label={wizardDictionary.business.paLossBroughtForward.label}
        help={wizardDictionary.business.paLossBroughtForward.help}
        optional
        error={getFieldError(errors, `${root}.paLossBroughtForward`)}
      />
    </section>
  );
}

function MoneyItems({
  addLabel,
  array,
  basePath,
  errors,
  itemFactory,
  register,
  setValue,
}: {
  addLabel: { zh: string; en: string };
  array: WizardMoneyItem[];
  basePath: string;
  errors: FieldErrors<SourceDetailsStepFormValues>;
  itemFactory: () => WizardMoneyItem;
  register: Register;
  setValue: SetValue;
}) {
  const { lang } = useI18n();

  return (
    <div className="space-y-3">
      {array.map((_item, index) => (
        <div key={index} className="grid gap-3 rounded-md border border-warm-100 bg-warm-50 p-3 md:grid-cols-4">
          <TextField
            name={`${basePath}.${index}.key` as Path<SourceDetailsStepFormValues>}
            register={register}
            label={wizardDictionary.salary.key.label}
            help={wizardDictionary.salary.key.help}
            error={getFieldError(errors, `${basePath}.${index}.key`)}
          />
          <TextField
            name={`${basePath}.${index}.labelZh` as Path<SourceDetailsStepFormValues>}
            register={register}
            label={wizardDictionary.salary.labelZh.label}
            help={wizardDictionary.salary.labelZh.help}
            error={getFieldError(errors, `${basePath}.${index}.labelZh`)}
          />
          <TextField
            name={`${basePath}.${index}.labelEn` as Path<SourceDetailsStepFormValues>}
            register={register}
            label={wizardDictionary.salary.labelEn.label}
            help={wizardDictionary.salary.labelEn.help}
            error={getFieldError(errors, `${basePath}.${index}.labelEn`)}
          />
          <NumberField
            name={`${basePath}.${index}.amount` as Path<SourceDetailsStepFormValues>}
            register={register}
            label={wizardDictionary.salary.amount.label}
            help={wizardDictionary.salary.amount.help}
            error={getFieldError(errors, `${basePath}.${index}.amount`)}
          />
          <div className="md:col-span-4">
            <button type="button" className="focus-ring text-sm font-semibold text-red-700" onClick={() => removeAt(basePath, array, index, setValue)}>
              {wizardT(wizardDictionary.common.remove, lang)}
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="focus-ring rounded-md border border-teal-200 px-3 py-2 text-sm font-bold text-teal-700" onClick={() => appendTo(basePath, array, itemFactory(), setValue)}>
        {wizardT(addLabel, lang)}
      </button>
    </div>
  );
}

function AccommodationItems({
  array,
  basePath,
  errors,
  register,
  setValue,
}: {
  array: WizardEmployerAccommodation[];
  basePath: string;
  errors: FieldErrors<SourceDetailsStepFormValues>;
  register: Register;
  setValue: SetValue;
}) {
  const { lang } = useI18n();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-navy-900">{wizardT(wizardDictionary.salary.employerAccommodation.label, lang)}</h3>
      {array.map((_item, index) => (
        <div key={index} className="grid gap-3 rounded-md border border-warm-100 bg-warm-50 p-3 md:grid-cols-3">
          <TextField name={`${basePath}.${index}.key` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.salary.key.label} help={wizardDictionary.salary.key.help} error={getFieldError(errors, `${basePath}.${index}.key`)} />
          <TextField name={`${basePath}.${index}.labelZh` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.salary.labelZh.label} help={wizardDictionary.salary.labelZh.help} error={getFieldError(errors, `${basePath}.${index}.labelZh`)} />
          <TextField name={`${basePath}.${index}.labelEn` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.salary.labelEn.label} help={wizardDictionary.salary.labelEn.help} error={getFieldError(errors, `${basePath}.${index}.labelEn`)} />
          <RadioGroupField
            name={`${basePath}.${index}.type` as Path<SourceDetailsStepFormValues>}
            register={register}
            label={wizardDictionary.salary.accommodationType.label}
            help={wizardDictionary.salary.accommodationType.help}
            options={[
              { value: "residence", label: wizardDictionary.sourceDetails.accommodationResidence },
              { value: "twoRoomHotel", label: wizardDictionary.sourceDetails.accommodationTwoRoomHotel },
              { value: "oneRoomHotel", label: wizardDictionary.sourceDetails.accommodationOneRoomHotel },
            ]}
            error={getFieldError(errors, `${basePath}.${index}.type`)}
            className="md:col-span-3"
          />
          <NumberField name={`${basePath}.${index}.employerAssessableIncomeBeforeAccommodation` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.salary.employerAssessableIncomeBeforeAccommodation.label} help={wizardDictionary.salary.employerAssessableIncomeBeforeAccommodation.help} error={getFieldError(errors, `${basePath}.${index}.employerAssessableIncomeBeforeAccommodation`)} />
          <NumberField name={`${basePath}.${index}.employerOutgoingsAndExpenses` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.salary.employerOutgoingsAndExpenses.label} help={wizardDictionary.salary.employerOutgoingsAndExpenses.help} optional error={getFieldError(errors, `${basePath}.${index}.employerOutgoingsAndExpenses`)} />
          <NumberField name={`${basePath}.${index}.rateableValueElection` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.salary.rateableValueElection.label} help={wizardDictionary.salary.rateableValueElection.help} optional error={getFieldError(errors, `${basePath}.${index}.rateableValueElection`)} />
          <div className="md:col-span-3">
            <button type="button" className="focus-ring text-sm font-semibold text-red-700" onClick={() => removeAt(basePath, array, index, setValue)}>
              {wizardT(wizardDictionary.common.remove, lang)}
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="focus-ring rounded-md border border-teal-200 px-3 py-2 text-sm font-bold text-teal-700" onClick={() => appendTo(basePath, array, defaultAccommodation(array.length + 1), setValue)}>
        {wizardT(wizardDictionary.sourceDetails.addAccommodation, lang)}
      </button>
    </div>
  );
}

function PropertyDetailForm({
  errors,
  register,
  root,
  setValue,
  watch,
}: {
  errors: FieldErrors<SourceDetailsStepFormValues>;
  register: Register;
  root: PersonRoot;
  setValue: SetValue;
  watch: Watch;
}) {
  const { lang } = useI18n();
  const properties = watch(`${root}.properties` as Path<SourceDetailsStepFormValues>) ?? [];

  return (
    <section className="space-y-4 border-t border-warm-100 pt-5">
      <h2 className="text-lg font-bold text-navy-900">{wizardT(wizardDictionary.property.title, lang)}</h2>
      {(properties as WizardProperty[]).map((_property, index) => (
        <div key={index} className="grid gap-3 rounded-md border border-warm-100 bg-warm-50 p-3 md:grid-cols-3">
          <TextField name={`${root}.properties.${index}.id` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.id.label} help={wizardDictionary.property.id.help} error={getFieldError(errors, `${root}.properties.${index}.id`)} />
          <NumberField name={`${root}.properties.${index}.rentReceived` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.rentReceived.label} help={wizardDictionary.property.rentReceived.help} error={getFieldError(errors, `${root}.properties.${index}.rentReceived`)} />
          <NumberField name={`${root}.properties.${index}.leasePremium` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.leasePremium.label} help={wizardDictionary.property.leasePremium.help} optional error={getFieldError(errors, `${root}.properties.${index}.leasePremium`)} />
          <NumberField name={`${root}.properties.${index}.leaseTermMonths` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.leaseTermMonths.label} help={wizardDictionary.property.leaseTermMonths.help} optional error={getFieldError(errors, `${root}.properties.${index}.leaseTermMonths`)} />
          <NumberField name={`${root}.properties.${index}.premiumMonthsInYear` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.premiumMonthsInYear.label} help={wizardDictionary.property.premiumMonthsInYear.help} optional error={getFieldError(errors, `${root}.properties.${index}.premiumMonthsInYear`)} />
          <NumberField name={`${root}.properties.${index}.irrecoverableRent` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.irrecoverableRent.label} help={wizardDictionary.property.irrecoverableRent.help} optional error={getFieldError(errors, `${root}.properties.${index}.irrecoverableRent`)} />
          <NumberField name={`${root}.properties.${index}.irrecoverableRentRecovered` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.irrecoverableRentRecovered.label} help={wizardDictionary.property.irrecoverableRentRecovered.help} optional error={getFieldError(errors, `${root}.properties.${index}.irrecoverableRentRecovered`)} />
          <NumberField name={`${root}.properties.${index}.ratesPaidByOwner` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.ratesPaidByOwner.label} help={wizardDictionary.property.ratesPaidByOwner.help} optional error={getFieldError(errors, `${root}.properties.${index}.ratesPaidByOwner`)} />
          <NumberField name={`${root}.properties.${index}.ownershipShare` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.ownershipShare.label} help={wizardDictionary.property.ownershipShare.help} min={0} max={1} step={0.01} optional error={getFieldError(errors, `${root}.properties.${index}.ownershipShare`)} />
          <NumberField name={`${root}.properties.${index}.letPropertyMortgageInterestForPA` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.property.letPropertyMortgageInterestForPA.label} help={wizardDictionary.property.letPropertyMortgageInterestForPA.help} optional error={getFieldError(errors, `${root}.properties.${index}.letPropertyMortgageInterestForPA`)} />
          <div className="md:col-span-3">
            <button type="button" className="focus-ring text-sm font-semibold text-red-700" onClick={() => removeAt(`${root}.properties`, properties as WizardProperty[], index, setValue)}>
              {wizardT(wizardDictionary.common.remove, lang)}
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="focus-ring rounded-md border border-teal-200 px-3 py-2 text-sm font-bold text-teal-700" onClick={() => appendTo(`${root}.properties`, properties as WizardProperty[], defaultProperty((properties as WizardProperty[]).length + 1), setValue)}>
        {wizardT(wizardDictionary.sourceDetails.addProperty, lang)}
      </button>
    </section>
  );
}

function BusinessDetailForm({
  errors,
  register,
  root,
  setValue,
  watch,
}: {
  errors: FieldErrors<SourceDetailsStepFormValues>;
  register: Register;
  root: PersonRoot;
  setValue: SetValue;
  watch: Watch;
}) {
  const { lang } = useI18n();
  const businesses = (watch(`${root}.businesses` as Path<SourceDetailsStepFormValues>) ?? []) as WizardBusiness[];
  const electionOptions = [
    { value: "null", label: wizardDictionary.sourceDetails.notElected },
    ...businesses.map((business, index) => ({
      value: business.id,
      label: {
        zh: business.name || business.id || `${wizardT(wizardDictionary.business.title, "zh")} ${index + 1}`,
        en: business.name || business.id || `${wizardT(wizardDictionary.business.title, "en")} ${index + 1}`,
      },
    })),
  ];

  return (
    <section className="space-y-4 border-t border-warm-100 pt-5">
      <h2 className="text-lg font-bold text-navy-900">{wizardT(wizardDictionary.business.title, lang)}</h2>
      {businesses.map((business, index) => {
        const pools = business.capitalAllowances?.pools ?? [];

        return (
          <div key={index} className="space-y-4 rounded-md border border-warm-100 bg-warm-50 p-3">
            <div className="grid gap-3 md:grid-cols-2">
              <TextField name={`${root}.businesses.${index}.id` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.id.label} help={wizardDictionary.business.id.help} error={getFieldError(errors, `${root}.businesses.${index}.id`)} />
              <TextField name={`${root}.businesses.${index}.name` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.name.label} help={wizardDictionary.business.name.help} error={getFieldError(errors, `${root}.businesses.${index}.name`)} />
              <NumberField name={`${root}.businesses.${index}.revenue` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.revenue.label} help={wizardDictionary.business.revenue.help} error={getFieldError(errors, `${root}.businesses.${index}.revenue`)} />
              <NumberField name={`${root}.businesses.${index}.deductibleExpenses` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.deductibleExpenses.label} help={wizardDictionary.business.deductibleExpenses.help} error={getFieldError(errors, `${root}.businesses.${index}.deductibleExpenses`)} />
              <NumberField name={`${root}.businesses.${index}.addBacks.privatePortion` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.privatePortion.label} help={wizardDictionary.business.privatePortion.help} optional error={getFieldError(errors, `${root}.businesses.${index}.addBacks.privatePortion`)} />
              <NumberField name={`${root}.businesses.${index}.addBacks.capitalExpenditure` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.capitalExpenditure.label} help={wizardDictionary.business.capitalExpenditure.help} optional error={getFieldError(errors, `${root}.businesses.${index}.addBacks.capitalExpenditure`)} />
              <NumberField name={`${root}.businesses.${index}.addBacks.proprietorSalaries` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.proprietorSalaries.label} help={wizardDictionary.business.proprietorSalaries.help} optional error={getFieldError(errors, `${root}.businesses.${index}.addBacks.proprietorSalaries`)} />
              <NumberField name={`${root}.businesses.${index}.addBacks.nonDeductibleDonations` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.nonDeductibleDonations.label} help={wizardDictionary.business.nonDeductibleDonations.help} optional error={getFieldError(errors, `${root}.businesses.${index}.addBacks.nonDeductibleDonations`)} />
              <NumberField name={`${root}.businesses.${index}.lossBroughtForward` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.lossBroughtForward.label} help={wizardDictionary.business.lossBroughtForward.help} optional error={getFieldError(errors, `${root}.businesses.${index}.lossBroughtForward`)} />
            </div>
            <details className="rounded-md border border-warm-200 bg-white p-3">
              <summary className="cursor-pointer text-sm font-bold text-navy-900">
                {wizardT(wizardDictionary.sourceDetails.advanced, lang)}
              </summary>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <NumberField name={`${root}.businesses.${index}.capitalAllowances.pmInitialAdditions` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.pmInitialAdditions.label} help={wizardDictionary.business.pmInitialAdditions.help} optional error={getFieldError(errors, `${root}.businesses.${index}.capitalAllowances.pmInitialAdditions`)} />
                <NumberField name={`${root}.businesses.${index}.capitalAllowances.buildingAllowance` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.buildingAllowance.label} help={wizardDictionary.business.buildingAllowance.help} optional error={getFieldError(errors, `${root}.businesses.${index}.capitalAllowances.buildingAllowance`)} />
              </div>
              <div className="mt-4 space-y-3">
                {pools.map((_pool, poolIndex) => (
                  <div key={poolIndex} className="grid gap-3 border-t border-warm-100 pt-3 md:grid-cols-3">
                    <SelectField name={`${root}.businesses.${index}.capitalAllowances.pools.${poolIndex}.rate` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.poolRate.label} help={wizardDictionary.business.poolRate.help} parseNumber options={[{ value: "0.1", label: "10%" }, { value: "0.2", label: "20%" }, { value: "0.3", label: "30%" }]} error={getFieldError(errors, `${root}.businesses.${index}.capitalAllowances.pools.${poolIndex}.rate`)} />
                    <NumberField name={`${root}.businesses.${index}.capitalAllowances.pools.${poolIndex}.broughtForward` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.poolBroughtForward.label} help={wizardDictionary.business.poolBroughtForward.help} error={getFieldError(errors, `${root}.businesses.${index}.capitalAllowances.pools.${poolIndex}.broughtForward`)} />
                    <NumberField name={`${root}.businesses.${index}.capitalAllowances.pools.${poolIndex}.additions` as Path<SourceDetailsStepFormValues>} register={register} label={wizardDictionary.business.poolAdditions.label} help={wizardDictionary.business.poolAdditions.help} error={getFieldError(errors, `${root}.businesses.${index}.capitalAllowances.pools.${poolIndex}.additions`)} />
                    <div className="md:col-span-3">
                      <button type="button" className="focus-ring text-sm font-semibold text-red-700" onClick={() => setValue(`${root}.businesses.${index}.capitalAllowances.pools` as Path<SourceDetailsStepFormValues>, pools.filter((_item, itemIndex) => itemIndex !== poolIndex) as never, { shouldDirty: true })}>
                        {wizardT(wizardDictionary.common.remove, lang)}
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="focus-ring rounded-md border border-teal-200 px-3 py-2 text-sm font-bold text-teal-700" onClick={() => setValue(`${root}.businesses.${index}.capitalAllowances.pools` as Path<SourceDetailsStepFormValues>, [...pools, { rate: 0.2, broughtForward: 0, additions: 0 }] as never, { shouldDirty: true })}>
                  {wizardT(wizardDictionary.sourceDetails.addPool, lang)}
                </button>
              </div>
            </details>
            <button type="button" className="focus-ring text-sm font-semibold text-red-700" onClick={() => removeAt(`${root}.businesses`, businesses, index, setValue)}>
              {wizardT(wizardDictionary.common.remove, lang)}
            </button>
          </div>
        );
      })}
      <button type="button" className="focus-ring rounded-md border border-teal-200 px-3 py-2 text-sm font-bold text-teal-700" onClick={() => appendTo(`${root}.businesses`, businesses, defaultBusiness(businesses.length + 1), setValue)}>
        {wizardT(wizardDictionary.sourceDetails.addBusiness, lang)}
      </button>
      <div className="rounded-md border border-teal-100 bg-white p-4">
        <RadioGroupField
          name={`${root}.electedTwoTierBusinessId` as Path<SourceDetailsStepFormValues>}
          register={register}
          label={wizardDictionary.business.electedTwoTierBusinessId.label}
          help={wizardDictionary.sourceDetails.twoTierHelp}
          options={electionOptions}
          error={getFieldError(errors, `${root}.electedTwoTierBusinessId`)}
          setValueAs={(value) => (value === "null" ? null : value)}
        />
      </div>
    </section>
  );
}

function sourceDetailsDefaults(state: WizardState): SourceDetailsStepFormValues {
  return {
    personA: {
      personId: "A",
      salary: state.personA.salary,
      properties: state.personA.properties,
      businesses: state.personA.businesses,
      electedTwoTierBusinessId: state.personA.electedTwoTierBusinessId,
      paLossBroughtForward: state.personA.paLossBroughtForward,
    },
    personB: {
      personId: "B",
      salary: state.personB.salary,
      properties: state.personB.properties,
      businesses: state.personB.businesses,
      electedTwoTierBusinessId: state.personB.electedTwoTierBusinessId,
      paLossBroughtForward: state.personB.paLossBroughtForward,
    },
  };
}

function appendTo<T>(path: string, array: T[], item: T, setValue: SetValue) {
  setValue(path as Path<SourceDetailsStepFormValues>, [...array, item] as never, { shouldDirty: true });
}

function removeAt<T>(path: string, array: T[], index: number, setValue: SetValue) {
  setValue(path as Path<SourceDetailsStepFormValues>, array.filter((_item, itemIndex) => itemIndex !== index) as never, { shouldDirty: true });
}

function defaultMoneyItem(prefix: string, index: number): WizardMoneyItem {
  return {
    key: `${prefix}-${index}`,
    labelZh: `${prefix}-${index}`,
    labelEn: `${prefix}-${index}`,
    amount: 0,
  };
}

function defaultAccommodation(index: number): WizardEmployerAccommodation {
  return {
    ...defaultMoneyItem("accommodation", index),
    type: "residence",
    employerAssessableIncomeBeforeAccommodation: 0,
  };
}

function defaultProperty(index: number): WizardProperty {
  return {
    id: `property-${index}`,
    rentReceived: 0,
  };
}

function defaultBusiness(index: number): WizardBusiness {
  return {
    id: `business-${index}`,
    revenue: 0,
    deductibleExpenses: 0,
    addBacks: {},
    capitalAllowances: {
      pools: [],
    },
  };
}

function personRoot(personId: WizardPersonId): PersonRoot {
  return personId === "A" ? "personA" : "personB";
}

function personHasAnySource(state: WizardState, personId: WizardPersonId): boolean {
  const sources = personId === "A" ? state.personA.incomeSources : state.personB.incomeSources;
  return sources.hasSalary || sources.hasProperty || sources.hasBusiness;
}
