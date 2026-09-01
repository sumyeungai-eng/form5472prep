"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";
import { WIZARD_STORAGE_KEY } from "@/lib/wizard/wizardContext";
import { getParams } from "@/lib/tax/params";
import type { ComputationLine } from "@/lib/tax/types";
import {
  buildProfitsWizardState,
  buildPropertyWizardState,
  buildSalariesWizardState,
  calculateQuickAnnualMpf,
  computeQuickProfits,
  computeQuickProperty,
  computeQuickSalaries,
  type QuickProfitsInput,
  type QuickPropertyInput,
  type QuickSalariesInput,
} from "@/lib/calculators/quick";

type Lang = "zh" | "en";
type LocalText = Record<Lang, string>;

const dict = {
  eyebrow: { zh: "快速計算", en: "Quick calculators" },
  title: { zh: "三個獨立稅務快速計", en: "Three standalone tax quick calculators" },
  intro: {
    zh: "使用頁首選定的課稅年度即時計算。輸入只涵蓋常見情況；如有多個收入來源、配偶、個人入息課稅或進階扣除，請轉到完整報稅精靈。",
    en: "Calculations use the year of assessment selected in the header. These inputs cover common cases only; use the full wizard for multiple sources, spouse details, Personal Assessment, or advanced deductions.",
  },
  yearPrefix: { zh: "目前課稅年度", en: "Current year of assessment" },
  cta: {
    zh: "情況複雜？用完整報稅精靈",
    en: "Need the full picture? Use the wizard",
  },
  salaries: {
    title: { zh: "薪俸稅快速計", en: "Salaries Tax quick calculator" },
    description: {
      zh: "輸入全年薪金、強制性強積金、基本或已婚人士免稅額，以及一項住屋扣除。",
      en: "Enter annual salary, mandatory MPF, basic or married allowance, and one housing deduction.",
    },
    annualIncome: { zh: "全年入息", en: "Annual income" },
    mpf: { zh: "強制性強積金供款", en: "Mandatory MPF contribution" },
    autoMpf: { zh: "按全年入息自動計算", en: "Auto-calc from annual income" },
    allowance: { zh: "免稅額", en: "Allowance" },
    basic: { zh: "基本", en: "Basic" },
    married: { zh: "已婚人士", en: "Married" },
    children: { zh: "子女人數", en: "Number of children" },
    housing: { zh: "住屋扣除", en: "Housing deduction" },
    noHousing: { zh: "沒有", en: "None" },
    rent: { zh: "住宅租金", en: "Domestic rent" },
    homeLoan: { zh: "居所貸款利息", en: "Home loan interest" },
    housingAmount: { zh: "扣除金額", en: "Deduction amount" },
    finalTax: { zh: "應繳薪俸稅", en: "Salaries tax payable" },
    effectiveRate: { zh: "實際稅率", en: "Effective rate" },
    basis: { zh: "採用基準", en: "Basis used" },
    progressive: { zh: "累進稅率", en: "Progressive" },
    standard: { zh: "標準稅率", en: "Standard" },
    reduction: { zh: "稅款寬減", en: "Tax reduction" },
    breakdown: { zh: "計算流程", en: "Calculation chain" },
  },
  property: {
    title: { zh: "物業稅快速計", en: "Property Tax quick calculator" },
    description: {
      zh: "以每月租金乘出租月數計算全年租金，再套用差餉、修葺免稅額及業權份額。",
      en: "Annual rent is calculated as monthly rent times months rented, then rates, repairs allowance, and ownership share are applied.",
    },
    monthlyRent: { zh: "每月租金", en: "Monthly rent" },
    months: { zh: "出租月數", en: "Months rented" },
    ratesToggle: { zh: "業主繳付差餉", en: "Rates paid by owner" },
    ratesAmount: { zh: "已繳差餉", en: "Rates amount paid" },
    share: { zh: "業權份額（%）", en: "Ownership share (%)" },
    tax: { zh: "物業稅", en: "Property tax" },
    nav: { zh: "應評稅淨值", en: "Net assessable value" },
    walkthrough: { zh: "NAV 流程", en: "NAV walkthrough" },
    noReduction: {
      zh: "物業稅不適用一次性稅款寬減。",
      en: "No one-off tax reduction applies to property tax.",
    },
    paHint: {
      zh: "如符合個人入息課稅，整體稅款或可降低；請使用完整報稅精靈檢查。",
      en: "Personal Assessment may reduce the overall tax if you qualify; use the full wizard to check.",
    },
  },
  profits: {
    title: { zh: "利得稅快速計", en: "Profits Tax quick calculator" },
    description: {
      zh: "輸入獨資業務收入、可扣除開支及是否選用兩級制稅率。",
      en: "Enter sole-proprietorship revenue, deductible expenses, and whether two-tier rates are elected.",
    },
    revenue: { zh: "營業收入", en: "Revenue" },
    expenses: { zh: "可扣除開支", en: "Deductible expenses" },
    twoTier: { zh: "選用兩級制利得稅率", en: "Elect two-tier profits tax rates" },
    assessableProfits: { zh: "應評稅利潤", en: "Assessable profits" },
    tierOne: { zh: "第一級利潤／稅款", en: "First-tier profits / tax" },
    remainder: { zh: "餘額利潤／稅款", en: "Remainder profits / tax" },
    standard: { zh: "標準稅率稅款", en: "Standard-rate tax" },
    reduction: { zh: "稅款寬減", en: "Tax reduction" },
    finalTax: { zh: "應繳利得稅", en: "Profits tax payable" },
  },
  common: {
    results: { zh: "即時計算結果", en: "Live result" },
    hkdHint: { zh: "港元，不包括仙位", en: "HKD, whole dollars" },
    percentHint: { zh: "輸入 0 至 100", en: "Enter 0 to 100" },
    amount: { zh: "金額", en: "Amount" },
  },
} as const;

const defaultSalariesInput: QuickSalariesInput = {
  annualIncome: 600_000,
  mpfMandatory: 18_000,
  allowanceKind: "basic",
  children: 0,
  housingKind: "none",
  housingAmount: 0,
};

const defaultPropertyInput: QuickPropertyInput = {
  monthlyRent: 20_000,
  monthsRented: 12,
  ratesPaidByOwner: true,
  ratesAmount: 12_000,
  ownershipSharePercent: 100,
};

const defaultProfitsInput: QuickProfitsInput = {
  revenue: 3_000_000,
  deductibleExpenses: 800_000,
  electedTwoTier: true,
};

export default function CalculatorsPage() {
  const router = useRouter();
  const { lang, year } = useI18n();
  const eyebrowTracking = lang === "en" ? "tracking-[0.18em] uppercase" : "";
  const params = useMemo(() => getParams(year), [year]);
  const [salariesInput, setSalariesInput] = useState<QuickSalariesInput>(defaultSalariesInput);
  const [propertyInput, setPropertyInput] = useState<QuickPropertyInput>(defaultPropertyInput);
  const [profitsInput, setProfitsInput] = useState<QuickProfitsInput>(defaultProfitsInput);
  const debouncedSalariesInput = useDebouncedValue(salariesInput, 220);
  const debouncedPropertyInput = useDebouncedValue(propertyInput, 220);
  const debouncedProfitsInput = useDebouncedValue(profitsInput, 220);
  const salariesResult = useMemo(
    () => computeQuickSalaries(debouncedSalariesInput, params),
    [debouncedSalariesInput, params],
  );
  const propertyResult = useMemo(
    () => computeQuickProperty(debouncedPropertyInput, params),
    [debouncedPropertyInput, params],
  );
  const profitsResult = useMemo(
    () => computeQuickProfits(debouncedProfitsInput, params),
    [debouncedProfitsInput, params],
  );

  function handoffToWizard(stateBuilder: () => ReturnType<typeof buildSalariesWizardState>) {
    const state = stateBuilder();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(state));
    }
    router.push("/wizard");
  }

  return (
    <main>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <p className={`text-xs font-bold text-gold-700 sm:text-sm ${eyebrowTracking}`}>
              {tr(dict.eyebrow, lang)}
            </p>
            <h1 className="display-section mt-4">
              {tr(dict.title, lang)}
            </h1>
            <p className="mt-5 text-base leading-7 text-warm-700">
              {tr(dict.intro, lang)}
            </p>
            <p className="mt-5 inline-flex rounded-md border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800 shadow-field">
              {tr(dict.yearPrefix, lang)}: {formatYear(year)}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-16 sm:py-20 lg:py-24">
        <Container className="space-y-10">
          <CalculatorShell
            eyebrow="01"
            title={tr(dict.salaries.title, lang)}
            description={tr(dict.salaries.description, lang)}
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <MoneyInput
                  id="salary-annual-income"
                  label={tr(dict.salaries.annualIncome, lang)}
                  hint={tr(dict.common.hkdHint, lang)}
                  value={salariesInput.annualIncome}
                  onChange={(annualIncome) => setSalariesInput((current) => ({ ...current, annualIncome }))}
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <MoneyInput
                    id="salary-mpf"
                    label={tr(dict.salaries.mpf, lang)}
                    hint={tr(dict.common.hkdHint, lang)}
                    value={salariesInput.mpfMandatory}
                    onChange={(mpfMandatory) => setSalariesInput((current) => ({ ...current, mpfMandatory }))}
                  />
                  <button
                    type="button"
                    onClick={() => setSalariesInput((current) => ({
                      ...current,
                      mpfMandatory: calculateQuickAnnualMpf(current.annualIncome, params),
                    }))}
                    className="btn-primary"
                  >
                    {tr(dict.salaries.autoMpf, lang)}
                  </button>
                </div>
                <SegmentedControl
                  legend={tr(dict.salaries.allowance, lang)}
                  value={salariesInput.allowanceKind}
                  options={[
                    { value: "basic", label: tr(dict.salaries.basic, lang) },
                    { value: "married", label: tr(dict.salaries.married, lang) },
                  ]}
                  onChange={(allowanceKind) => setSalariesInput((current) => ({ ...current, allowanceKind }))}
                />
                <NumberInput
                  id="salary-children"
                  label={tr(dict.salaries.children, lang)}
                  min={0}
                  max={9}
                  step={1}
                  value={salariesInput.children}
                  onChange={(children) => setSalariesInput((current) => ({ ...current, children }))}
                />
                <SegmentedControl
                  legend={tr(dict.salaries.housing, lang)}
                  value={salariesInput.housingKind}
                  options={[
                    { value: "none", label: tr(dict.salaries.noHousing, lang) },
                    { value: "domesticRent", label: tr(dict.salaries.rent, lang) },
                    { value: "homeLoanInterest", label: tr(dict.salaries.homeLoan, lang) },
                  ]}
                  onChange={(housingKind) => setSalariesInput((current) => ({ ...current, housingKind }))}
                />
                {salariesInput.housingKind !== "none" ? (
                  <MoneyInput
                    id="salary-housing-amount"
                    label={tr(dict.salaries.housingAmount, lang)}
                    hint={tr(dict.common.hkdHint, lang)}
                    value={salariesInput.housingAmount}
                    onChange={(housingAmount) => setSalariesInput((current) => ({ ...current, housingAmount }))}
                  />
                ) : null}
              </div>

              <ResultPanel title={tr(dict.common.results, lang)} lang={lang}>
                <MetricGrid>
                  <Metric label={tr(dict.salaries.finalTax, lang)} value={formatMoney(salariesResult.finalTax)} />
                  <Metric
                    label={tr(dict.salaries.effectiveRate, lang)}
                    value={formatPercent(
                      debouncedSalariesInput.annualIncome > 0
                        ? salariesResult.finalTax / debouncedSalariesInput.annualIncome
                        : 0,
                    )}
                  />
                  <Metric
                    label={tr(dict.salaries.basis, lang)}
                    value={salariesResult.basisUsed === "progressive"
                      ? tr(dict.salaries.progressive, lang)
                      : tr(dict.salaries.standard, lang)}
                  />
                  <Metric label={tr(dict.salaries.reduction, lang)} value={formatMoney(salariesResult.reduction)} />
                </MetricGrid>
                <Breakdown title={tr(dict.salaries.breakdown, lang)} lines={salariesBreakdown(salariesResult.lines)} lang={lang} />
                <WizardButton
                  label={tr(dict.cta, lang)}
                  onClick={() => handoffToWizard(() => buildSalariesWizardState(salariesInput, year))}
                />
              </ResultPanel>
            </div>
          </CalculatorShell>

          <CalculatorShell
            eyebrow="02"
            title={tr(dict.property.title, lang)}
            description={tr(dict.property.description, lang)}
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <MoneyInput
                  id="property-monthly-rent"
                  label={tr(dict.property.monthlyRent, lang)}
                  hint={tr(dict.common.hkdHint, lang)}
                  value={propertyInput.monthlyRent}
                  onChange={(monthlyRent) => setPropertyInput((current) => ({ ...current, monthlyRent }))}
                />
                <NumberInput
                  id="property-months"
                  label={tr(dict.property.months, lang)}
                  min={0}
                  max={12}
                  step={1}
                  value={propertyInput.monthsRented}
                  onChange={(monthsRented) => setPropertyInput((current) => ({ ...current, monthsRented }))}
                />
                <CheckboxInput
                  id="property-rates-toggle"
                  label={tr(dict.property.ratesToggle, lang)}
                  checked={propertyInput.ratesPaidByOwner}
                  onChange={(ratesPaidByOwner) => setPropertyInput((current) => ({ ...current, ratesPaidByOwner }))}
                />
                {propertyInput.ratesPaidByOwner ? (
                  <MoneyInput
                    id="property-rates-amount"
                    label={tr(dict.property.ratesAmount, lang)}
                    hint={tr(dict.common.hkdHint, lang)}
                    value={propertyInput.ratesAmount}
                    onChange={(ratesAmount) => setPropertyInput((current) => ({ ...current, ratesAmount }))}
                  />
                ) : null}
                <NumberInput
                  id="property-share"
                  label={tr(dict.property.share, lang)}
                  hint={tr(dict.common.percentHint, lang)}
                  min={0}
                  max={100}
                  step={1}
                  value={propertyInput.ownershipSharePercent}
                  onChange={(ownershipSharePercent) => setPropertyInput((current) => ({ ...current, ownershipSharePercent }))}
                />
              </div>

              <ResultPanel title={tr(dict.common.results, lang)} lang={lang}>
                <MetricGrid>
                  <Metric label={tr(dict.property.nav, lang)} value={formatMoney(propertyResult.totalNav)} />
                  <Metric label={tr(dict.property.tax, lang)} value={formatMoney(propertyResult.totalTax)} />
                </MetricGrid>
                <Breakdown
                  title={tr(dict.property.walkthrough, lang)}
                  lines={propertyBreakdown(propertyResult.perProperty[0]?.lines ?? [])}
                  lang={lang}
                />
                <div className="rounded-md border border-gold-200 bg-gold-100 p-4 text-sm leading-6 text-navy-900 shadow-field">
                  <p className="font-bold">{tr(dict.property.noReduction, lang)}</p>
                  <p className="mt-1 text-warm-700">{tr(dict.property.paHint, lang)}</p>
                </div>
                <WizardButton
                  label={tr(dict.cta, lang)}
                  onClick={() => handoffToWizard(() => buildPropertyWizardState(propertyInput, year))}
                />
              </ResultPanel>
            </div>
          </CalculatorShell>

          <CalculatorShell
            eyebrow="03"
            title={tr(dict.profits.title, lang)}
            description={tr(dict.profits.description, lang)}
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <MoneyInput
                  id="profits-revenue"
                  label={tr(dict.profits.revenue, lang)}
                  hint={tr(dict.common.hkdHint, lang)}
                  value={profitsInput.revenue}
                  onChange={(revenue) => setProfitsInput((current) => ({ ...current, revenue }))}
                />
                <MoneyInput
                  id="profits-expenses"
                  label={tr(dict.profits.expenses, lang)}
                  hint={tr(dict.common.hkdHint, lang)}
                  value={profitsInput.deductibleExpenses}
                  onChange={(deductibleExpenses) => setProfitsInput((current) => ({ ...current, deductibleExpenses }))}
                />
                <CheckboxInput
                  id="profits-two-tier"
                  label={tr(dict.profits.twoTier, lang)}
                  checked={profitsInput.electedTwoTier}
                  onChange={(electedTwoTier) => setProfitsInput((current) => ({ ...current, electedTwoTier }))}
                />
              </div>

              <ResultPanel title={tr(dict.common.results, lang)} lang={lang}>
                <MetricGrid>
                  <Metric
                    label={tr(dict.profits.assessableProfits, lang)}
                    value={formatMoney(profitsResult.perBusiness[0]?.assessableProfits ?? 0)}
                  />
                  <Metric label={tr(dict.profits.reduction, lang)} value={formatMoney(profitsResult.reduction)} />
                  <Metric label={tr(dict.profits.finalTax, lang)} value={formatMoney(profitsResult.finalTax)} />
                </MetricGrid>
                <div className="space-y-2">
                  {profitsInput.electedTwoTier ? (
                    <>
                      <SplitRow
                        label={tr(dict.profits.tierOne, lang)}
                        amount={profitsResult.tierOneProfits}
                        tax={profitsResult.tierOneTax}
                      />
                      <SplitRow
                        label={tr(dict.profits.remainder, lang)}
                        amount={profitsResult.standardRemainderProfits}
                        tax={profitsResult.standardRemainderTax}
                      />
                    </>
                  ) : (
                    <SplitRow
                      label={tr(dict.profits.standard, lang)}
                      amount={profitsResult.standardRemainderProfits}
                      tax={profitsResult.standardRemainderTax}
                    />
                  )}
                </div>
                <WizardButton
                  label={tr(dict.cta, lang)}
                  onClick={() => handoffToWizard(() => buildProfitsWizardState(profitsInput, year))}
                />
              </ResultPanel>
            </div>
          </CalculatorShell>
        </Container>
      </section>
    </main>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debounced;
}

function CalculatorShell({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="card p-5 sm:p-7 lg:p-8">
      <div className="mb-6 grid gap-4 border-b border-warm-150 pb-6 md:grid-cols-[auto_1fr] md:items-start">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-950 text-sm font-black text-gold shadow-button">
          {eyebrow}
        </div>
        <div>
          <h2 className="display-subsection">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-warm-700">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ResultPanel({ children, lang, title }: { children: ReactNode; lang: Lang; title: string }) {
  const eyebrowTracking = lang === "en" ? "tracking-[0.14em] uppercase" : "";

  return (
    <aside className="space-y-5 rounded-lg border border-teal-100 bg-teal-50 p-4 shadow-card sm:p-5">
      <h3 className={`text-xs font-bold text-teal-800 sm:text-sm ${eyebrowTracking}`}>{title}</h3>
      {children}
    </aside>
  );
}

function MetricGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-warm-150 bg-white p-4 shadow-field">
      <dt className="text-xs font-semibold text-warm-600">{label}</dt>
      <dd className="mt-2 text-xl font-bold text-navy-900">{value}</dd>
    </div>
  );
}

function MoneyInput({
  hint,
  id,
  label,
  onChange,
  value,
}: {
  hint?: string;
  id: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <NumberInput
      id={id}
      label={label}
      min={0}
      step={1}
      value={value}
      onChange={onChange}
      hint={hint}
    />
  );
}

function NumberInput({
  hint,
  id,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  hint?: string;
  id: string;
  label: string;
  max?: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-navy-900">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(numberFromInput(event.target.value))}
        className="form-input mt-2 w-full"
      />
      {hint ? <p className="mt-1 text-xs text-warm-600">{hint}</p> : null}
    </div>
  );
}

function CheckboxInput({
  checked,
  id,
  label,
  onChange,
}: {
  checked: boolean;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-warm-150 bg-white px-4 py-3 text-sm font-semibold text-navy-900 shadow-field hover:border-teal-400"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-warm-300 text-teal-700"
      />
      <span>{label}</span>
    </label>
  );
}

function SegmentedControl<T extends string>({
  legend,
  onChange,
  options,
  value,
}: {
  legend: string;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  value: T;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-navy-900">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`focus-ring min-h-10 rounded-md border px-4 py-2 text-sm font-bold transition ${
                active
                  ? "border-navy-950 bg-navy-950 text-white shadow-button"
                  : "border-warm-150 bg-white text-navy-900 shadow-field hover:border-teal-400 hover:bg-teal-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Breakdown({
  lang,
  lines,
  title,
}: {
  lang: Lang;
  lines: ComputationLine[];
  title: string;
}) {
  return (
    <div>
      <h4 className="text-sm font-bold text-navy-900">{title}</h4>
      <dl className="mt-3 divide-y divide-teal-100 rounded-md border border-teal-100 bg-white shadow-field">
        {lines.map((line) => (
          <div key={line.key} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
            <dt className="text-sm text-warm-700">{lang === "zh" ? line.labelZh : line.labelEn}</dt>
            <dd className="text-right text-sm font-bold text-navy-900">{formatMoney(line.amount)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SplitRow({ amount, label, tax }: { amount: number; label: string; tax: number }) {
  return (
    <div className="grid gap-2 rounded-md border border-teal-100 bg-white p-3 shadow-field sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-sm font-bold text-navy-900">{label}</p>
        <p className="mt-1 text-sm text-warm-700">{formatMoney(amount)}</p>
      </div>
      <p className="text-left text-lg font-bold text-navy-900 sm:text-right">{formatMoney(tax)}</p>
    </div>
  );
}

function WizardButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary w-full"
    >
      {label}
    </button>
  );
}

function salariesBreakdown(lines: ComputationLine[]): ComputationLine[] {
  return compactLines(lines, [
    "assessableIncome",
    "netAssessableIncome",
    "netChargeableIncome",
    "tax.final",
  ]);
}

function propertyBreakdown(lines: ComputationLine[]): ComputationLine[] {
  return compactLines(lines, [
    "assessableValue",
    "assessableValueAfterRates",
    "repairsAllowance",
    "netAssessableValue",
    "propertyTax",
  ]);
}

function compactLines(lines: ComputationLine[], keys: string[]): ComputationLine[] {
  return keys.flatMap((key) => {
    const line = lines.find((item) => item.key === key);
    return line ? [line] : [];
  });
}

function tr(text: LocalText, lang: Lang): string {
  return text[lang];
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    currency: "HKD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    maximumFractionDigits: 2,
    style: "percent",
  }).format(value);
}

function formatYear(year: "2024_25" | "2025_26"): string {
  return year === "2024_25" ? "2024/25" : "2025/26";
}

function numberFromInput(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
