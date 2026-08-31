"use client";

import { useState, type FormEvent } from "react";
import { getParams } from "@/lib/tax/params";
import { optimize } from "@/lib/tax/optimizer";
import { useI18n } from "@/lib/i18n/useI18n";
import { mapWizardStateToFamilyScenarioInput } from "@/lib/wizard/mapping";
import { useWizard } from "@/lib/wizard/wizardContext";
import type {
  WizardDeductions,
  WizardFamilyState,
  WizardIncomeSources,
  WizardPersonId,
  WizardPersonState,
  WizardState,
} from "@/lib/wizard/wizardState";
import { wizardDictionary, wizardT } from "@/lib/wizard/wizardDictionary";
import { formatHKD } from "./FormFields";
import { saveWizardResult } from "./resultsStorage";

type ReviewStepProps = {
  formId: string;
  onValid: () => void;
};

export function ReviewStep({ formId, onValid }: ReviewStepProps) {
  const { lang } = useI18n();
  const { wizardState } = useWizard();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const people = activePeople(wizardState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const familyScenarioInput = mapWizardStateToFamilyScenarioInput(wizardState);
      const optimizerResult = optimize(familyScenarioInput, getParams(wizardState.year));
      saveWizardResult({
        familyScenarioInput,
        optimizerResult,
        storedAt: new Date().toISOString(),
      });
      onValid();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          {wizardT(wizardDictionary.review.title, lang)}
        </h1>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <p className="font-bold">
            {wizardDictionary.review.mappingError.zh} / {wizardDictionary.review.mappingError.en}
          </p>
          <p className="mt-2">{errorMessage}</p>
        </div>
      ) : null}

      <section className="space-y-4 rounded-md border border-warm-200 bg-white p-5">
        <h2 className="text-lg font-bold text-navy-900">
          {wizardT(wizardDictionary.review.personSummary, lang)}
        </h2>
        <dl className="grid gap-3 text-sm text-warm-700 md:grid-cols-2">
          <SummaryItem
            label={wizardT(wizardDictionary.basics.maritalStatus.label, lang)}
            value={wizardT(
              wizardState.maritalStatus === "married"
                ? wizardDictionary.basics.maritalStatus.married
                : wizardDictionary.basics.maritalStatus.single,
              lang,
            )}
          />
          <SummaryItem
            label={wizardT(wizardDictionary.basics.claimingSpouseForFamilyAllowances.label, lang)}
            value={personName(wizardState.claimingSpouseForFamilyAllowances, lang)}
          />
          <SummaryItem
            label={wizardT(wizardDictionary.basics.claimMarriedAllowanceBy.label, lang)}
            value={wizardState.claimMarriedAllowanceBy === "none"
              ? wizardT(wizardDictionary.basics.claimMarriedAllowanceBy.none, lang)
              : personName(wizardState.claimMarriedAllowanceBy, lang)}
          />
        </dl>
        <div className="grid gap-4 lg:grid-cols-2">
          {people.map(({ id, person }) => (
            <PersonSummary key={id} personId={id} person={person} lang={lang} />
          ))}
        </div>
      </section>

      <FamilySummary family={wizardState.family} year={wizardState.year} lang={lang} />

      <section className="space-y-4 rounded-md border border-warm-200 bg-white p-5">
        <h2 className="text-lg font-bold text-navy-900">
          {wizardT(wizardDictionary.review.deductionsSummary, lang)}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {people.map(({ id, person }) => (
            <DeductionsSummary key={id} personId={id} deductions={person.deductions} lang={lang} />
          ))}
        </div>
      </section>

      <button
        type="submit"
        className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800"
      >
        {wizardT(wizardDictionary.common.compute, lang)}
      </button>
    </form>
  );
}

function PersonSummary({
  lang,
  person,
  personId,
}: {
  lang: "zh" | "en";
  person: WizardPersonState;
  personId: WizardPersonId;
}) {
  return (
    <section className="rounded-md border border-warm-100 bg-warm-50 p-4">
      <h3 className="text-sm font-bold text-navy-900">{personName(personId, lang)}</h3>
      <dl className="mt-3 space-y-2 text-sm text-warm-700">
        <SummaryItem
          label={wizardT(wizardDictionary.paEligibility.title, lang)}
          value={paEligibilitySummary(person, lang)}
        />
        <SummaryItem
          label={wizardT(wizardDictionary.review.incomeSources, lang)}
          value={incomeSourcesSummary(person.incomeSources, lang)}
        />
        <SummaryItem
          label={wizardT(wizardDictionary.review.salaryItems, lang)}
          value={`${person.salary.incomeItems.length} · ${formatHKD(sumMoney(person.salary.incomeItems))}`}
        />
        <SummaryItem
          label={wizardT(wizardDictionary.review.properties, lang)}
          value={`${person.properties.length} · ${formatHKD(sumProperties(person))}`}
        />
        <SummaryItem
          label={wizardT(wizardDictionary.review.businesses, lang)}
          value={`${person.businesses.length} · ${formatHKD(sumBusinesses(person))} · ${twoTierSummary(person, lang)}`}
        />
      </dl>
    </section>
  );
}

function FamilySummary({
  family,
  lang,
  year,
}: {
  family: WizardFamilyState;
  lang: "zh" | "en";
  year: WizardState["year"];
}) {
  const newborns = family.children.filter((child) => child.birthYear === yearEnd(year)).length;
  const careHomeParents = family.parents.filter((parent) => parent.inCareHome).length;
  const careHomeTotal = family.parents.reduce((sum, parent) => sum + (parent.careHomeExpenses ?? 0), 0);

  return (
    <section className="space-y-4 rounded-md border border-warm-200 bg-white p-5">
      <h2 className="text-lg font-bold text-navy-900">
        {wizardT(wizardDictionary.review.familySummary, lang)}
      </h2>
      <dl className="grid gap-3 text-sm text-warm-700 md:grid-cols-2">
        <SummaryItem label={wizardT(wizardDictionary.family.children.label, lang)} value={`${family.children.length} (${newborns} ${wizardT(wizardDictionary.sourceDetails.newborn, lang)})`} />
        <SummaryItem label={wizardT(wizardDictionary.family.parents.label, lang)} value={`${family.parents.length} (${careHomeParents} ${wizardT(wizardDictionary.family.inCareHome.label, lang)}, ${formatHKD(careHomeTotal)})`} />
        <SummaryItem label={wizardT(wizardDictionary.family.siblingCount.label, lang)} value={String(family.siblingCount)} />
        <SummaryItem label={wizardT(wizardDictionary.family.singleParent.label, lang)} value={yesNo(family.singleParent, lang)} />
        <SummaryItem label={wizardT(wizardDictionary.family.disabledDependantCount.label, lang)} value={String(family.disabledDependantCount)} />
        <SummaryItem
          label={wizardT(wizardDictionary.family.personalDisability.label, lang)}
          value={`${personName("A", lang)}: ${yesNo(family.personalDisability.A, lang)} · ${personName("B", lang)}: ${yesNo(family.personalDisability.B, lang)}`}
        />
      </dl>
    </section>
  );
}

function DeductionsSummary({
  deductions,
  lang,
  personId,
}: {
  deductions: WizardDeductions;
  lang: "zh" | "en";
  personId: WizardPersonId;
}) {
  return (
    <section className="rounded-md border border-warm-100 bg-warm-50 p-4">
      <h3 className="text-sm font-bold text-navy-900">{personName(personId, lang)}</h3>
      <dl className="mt-3 space-y-2 text-sm text-warm-700">
        <SummaryItem label={wizardT(wizardDictionary.deductions.selfEducation.label, lang)} value={formatHKD(deductions.selfEducation ?? 0)} />
        <SummaryItem label={wizardT(wizardDictionary.deductions.charitableDonations.label, lang)} value={formatHKD(deductions.charitableDonations ?? 0)} />
        <SummaryItem label={wizardT(wizardDictionary.deductions.elderlyCare.label, lang)} value={formatHKD(deductions.elderlyCare ?? 0)} />
        <SummaryItem label={wizardT(wizardDictionary.deductions.housingKind.label, lang)} value={housingSummary(deductions, lang)} />
        <SummaryItem label={wizardT(wizardDictionary.deductions.mpfMandatory.label, lang)} value={formatHKD(deductions.mpfMandatory ?? 0)} />
        <SummaryItem label={wizardT(wizardDictionary.deductions.annuityAndTvc.label, lang)} value={formatHKD(deductions.annuityAndTvc ?? 0)} />
        <SummaryItem label={wizardT(wizardDictionary.deductions.vhisPremiums.label, lang)} value={`${formatHKD(deductions.vhisPremiums ?? 0)} · ${deductions.vhisInsuredPersons ?? 0}`} />
        <SummaryItem label={wizardT(wizardDictionary.deductions.assistedReproduction.label, lang)} value={formatHKD(deductions.assistedReproduction ?? 0)} />
      </dl>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-navy-900">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

function activePeople(state: WizardState): Array<{ id: WizardPersonId; person: WizardPersonState }> {
  return state.maritalStatus === "married"
    ? [
        { id: "A", person: state.personA },
        { id: "B", person: state.personB },
      ]
    : [{ id: "A", person: state.personA }];
}

function personName(personId: WizardPersonId, lang: "zh" | "en"): string {
  return wizardT(personId === "A" ? wizardDictionary.common.personA : wizardDictionary.common.personB, lang);
}

function yesNo(value: boolean | undefined, lang: "zh" | "en"): string {
  return wizardT(value ? wizardDictionary.common.yes : wizardDictionary.common.no, lang);
}

function paEligibilitySummary(person: WizardPersonState, lang: "zh" | "en"): string {
  const flags = [
    person.paEligibility.isHongKongPermanentResident,
    person.paEligibility.ordinarilyResidentInHongKong,
    person.paEligibility.presentInHongKongMoreThan180Days,
    person.paEligibility.presentInHongKongMoreThan300DaysAcrossTwoYears,
  ].filter(Boolean).length;

  return `${wizardT(wizardDictionary.paEligibility.ageDuringYear.label, lang)}: ${person.paEligibility.ageDuringYear ?? wizardT(wizardDictionary.common.notProvided, lang)} · ${flags} ${wizardT(wizardDictionary.common.yes, lang)}`;
}

function incomeSourcesSummary(sources: WizardIncomeSources, lang: "zh" | "en"): string {
  const selected = [
    sources.hasSalary ? wizardT(wizardDictionary.incomeSources.hasSalary.label, lang) : null,
    sources.hasProperty ? wizardT(wizardDictionary.incomeSources.hasProperty.label, lang) : null,
    sources.hasBusiness ? wizardT(wizardDictionary.incomeSources.hasBusiness.label, lang) : null,
  ].filter((value): value is string => Boolean(value));

  return selected.length > 0 ? selected.join(", ") : wizardT(wizardDictionary.common.none, lang);
}

function twoTierSummary(person: WizardPersonState, lang: "zh" | "en"): string {
  return `${wizardT(wizardDictionary.business.electedTwoTierBusinessId.label, lang)}: ${person.electedTwoTierBusinessId ? wizardT(wizardDictionary.common.yes, lang) : wizardT(wizardDictionary.common.no, lang)}`;
}

function housingSummary(deductions: WizardDeductions, lang: "zh" | "en"): string {
  if (deductions.housing.kind === "none") {
    return wizardT(wizardDictionary.common.none, lang);
  }

  const label = deductions.housing.kind === "homeLoanInterest"
    ? wizardDictionary.deductions.homeLoanInterest.label
    : wizardDictionary.deductions.domesticRent.label;

  return `${wizardT(label, lang)} · ${formatHKD(deductions.housing.amount)} · ${yesNo(Boolean(deductions.housing.eligibleForElevatedCap), lang)}`;
}

function sumMoney(items: Array<{ amount: number }>): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

function sumProperties(person: WizardPersonState): number {
  return person.properties.reduce((sum, property) => sum + property.rentReceived, 0);
}

function sumBusinesses(person: WizardPersonState): number {
  return person.businesses.reduce((sum, business) => sum + business.revenue, 0);
}

function yearEnd(year: WizardState["year"]): number {
  return year === "2024_25" ? 2025 : 2026;
}
