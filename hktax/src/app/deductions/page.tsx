"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/motion/Reveal";
import {
  DONATION_MINIMUM_HKD,
  deductionEntries,
  type DeductionEntry
} from "@/lib/content/deductions";
import { useI18n } from "@/lib/i18n/useI18n";
import { getParams } from "@/lib/tax/params";

type FilterKind = "all" | DeductionEntry["kind"];
type SectionKey = "eligibility" | "evidence" | "pitfalls";
type DeductionCapKey = keyof ReturnType<typeof getParams>["deductionCaps"];

const sectionKeys: SectionKey[] = ["eligibility", "evidence", "pitfalls"];

const kindLabels: Record<FilterKind, { zh: string; en: string }> = {
  all: { zh: "全部", en: "All" },
  deduction: { zh: "扣除項目", en: "Deductions" },
  allowance: { zh: "免稅額", en: "Allowances" }
};

const sectionLabels: Record<SectionKey, { zh: string; en: string }> = {
  eligibility: { zh: "資格問題", en: "Eligibility Q&A" },
  evidence: { zh: "所需證明", en: "Evidence Needed" },
  pitfalls: { zh: "常見陷阱", en: "Common Pitfalls" }
};

const deductionCapLabels = {
  selfEducation: { zh: "每年上限", en: "Annual cap" },
  donationsPercent: { zh: "百分比上限", en: "Percentage ceiling" },
  mpfMandatory: { zh: "強制性供款上限", en: "Mandatory contribution cap" },
  homeLoanInterest: { zh: "一般上限", en: "Standard cap" },
  homeLoanInterestElevated: { zh: "新生子女較高上限", en: "Newborn elevated cap" },
  homeLoanInterestYears: { zh: "可申索年期", en: "Claim years" },
  domesticRent: { zh: "一般上限", en: "Standard cap" },
  domesticRentElevated: { zh: "新生子女較高上限", en: "Newborn elevated cap" },
  elderlyCare: { zh: "每名受養人上限", en: "Per-dependant cap" },
  annuityAndTvc: { zh: "合併上限", en: "Combined cap" },
  vhisPerPerson: { zh: "每名受保人上限", en: "Per insured person cap" },
  assistedReproduction: { zh: "每年上限", en: "Annual cap" }
} as const;

const allowanceLabels = {
  basic: { zh: "免稅額", en: "Allowance" },
  married: { zh: "免稅額", en: "Allowance" },
  child: { zh: "每名子女", en: "Per child" },
  childNewbornExtra: { zh: "出生年度額外", en: "Extra in year of birth" },
  parentAged60: { zh: "60 歲或以上", en: "Age 60 or above" },
  parentAged55: { zh: "55 至 59 歲", en: "Age 55 to 59" },
  parentResidingExtra60: { zh: "60 歲或以上同住額", en: "Age 60+ residing extra" },
  parentResidingExtra55: { zh: "55 至 59 歲同住額", en: "Age 55 to 59 residing extra" },
  sibling: { zh: "每名受養人", en: "Per dependant" },
  singleParent: { zh: "免稅額", en: "Allowance" },
  disabledDependant: { zh: "每名傷殘受養人", en: "Per disabled dependant" },
  personalDisability: { zh: "本人免稅額", en: "For the claimant" }
} as const;

export default function DeductionsPage() {
  const { lang, t, year } = useI18n();
  const [filter, setFilter] = useState<FilterKind>("all");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const params = getParams(year);

  const variables = useMemo(
    () => ({
      donationMinimum: formatMoney(DONATION_MINIMUM_HKD),
      donationsPercent: formatPercent(params.deductionCaps.donationsPercent),
      homeLoanInterestYears: formatCount(params.deductionCaps.homeLoanInterestYears, lang)
    }),
    [lang, params.deductionCaps.donationsPercent, params.deductionCaps.homeLoanInterestYears]
  );

  const visibleEntries = deductionEntries.filter(
    (entry) => filter === "all" || entry.kind === filter
  );

  function toggleSection(entryId: string, section: SectionKey) {
    const key = `${entryId}:${section}`;
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <main>
      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              {lang === "zh" ? "慳稅檢查" : "Tax-saving check"}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
              {lang === "zh"
                ? "扣除項目及免稅額資格檢查"
                : "Deduction and allowance eligibility checker"}
            </h1>
            <p className="mt-5 text-base leading-7 text-warm-700">
              {lang === "zh"
                ? `按 ${t(`header.year.${year}`)} 顯示每項上限，逐張卡檢查資格、需保存的證明及常見稅務局風險。切換頁首課稅年度時，金額會即時更新。`
                : `Review each cap for ${t(`header.year.${year}`)}, then check eligibility, evidence to keep, and common IRD pitfalls. Amounts update immediately when you switch the year of assessment in the header.`}
            </p>
          </div>

          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label={lang === "zh" ? "篩選扣除項目及免稅額" : "Filter deductions and allowances"}
          >
            {(Object.keys(kindLabels) as FilterKind[]).map((kind) => {
              const isActive = filter === kind;
              return (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setFilter(kind)}
                  className={`focus-ring rounded-md border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-warm-200 bg-warm-50 text-navy-900 hover:border-teal-500 hover:bg-white"
                  }`}
                >
                  {kindLabels[kind][lang]}
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-12 sm:py-16">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEntries.map((entry, index) => (
              <Reveal key={entry.id} delayMs={(index % 6) * 70}>
                <article className="card flex flex-col overflow-hidden">
                  <div className="border-b border-warm-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                          {kindLabels[entry.kind][lang]}
                        </p>
                        <h2 className="mt-2 text-xl font-bold leading-tight text-navy-900">
                          {lang === "zh" ? entry.titleZh : entry.titleEn}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-5 rounded-md border border-teal-100 bg-teal-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-800">
                        {lang === "zh" ? "本年度上限" : "Current-year cap"}
                      </p>
                      <dl className="mt-3 space-y-2">
                        {getCapLines(entry, params, lang).map((line) => (
                          <div key={line.label} className="flex items-baseline justify-between gap-3">
                            <dt className="text-sm text-warm-700">{line.label}</dt>
                            <dd className="text-right text-sm font-bold text-navy-900">
                              {line.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col divide-y divide-warm-200">
                    {sectionKeys.map((section) => {
                      const sectionId = `${entry.id}-${section}`;
                      const isOpen = openSections[`${entry.id}:${section}`] ?? section === "eligibility";
                      const items = getSectionItems(entry, section, lang).map((item) =>
                        interpolate(item, variables)
                      );

                      return (
                        <div key={section} className="bg-white">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={sectionId}
                            onClick={() => toggleSection(entry.id, section)}
                            className="focus-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-navy-900 transition hover:bg-warm-50"
                          >
                            <span>{sectionLabels[section][lang]}</span>
                            <span aria-hidden="true" className="text-lg leading-none text-teal-700">
                              {isOpen ? "-" : "+"}
                            </span>
                          </button>
                          {isOpen ? (
                            <div id={sectionId} className="px-5 pb-5">
                              <ul className="space-y-2 text-sm leading-6 text-warm-700">
                                {items.map((item) => (
                                  <li key={item} className="flex gap-2">
                                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}

function getSectionItems(entry: DeductionEntry, section: SectionKey, lang: "zh" | "en") {
  if (section === "eligibility") {
    return lang === "zh" ? entry.eligibilityQuestionsZh : entry.eligibilityQuestionsEn;
  }

  if (section === "evidence") {
    return lang === "zh" ? entry.evidenceZh : entry.evidenceEn;
  }

  return lang === "zh" ? entry.pitfallsZh : entry.pitfallsEn;
}

function getCapLines(
  entry: DeductionEntry,
  params: ReturnType<typeof getParams>,
  lang: "zh" | "en"
) {
  if (entry.kind === "deduction") {
    return entry.capKeys.map((key) => {
      const value = params.deductionCaps[key];

      return {
        label: deductionCapLabels[key][lang],
        value: formatDeductionCap(key, value, lang)
      };
    });
  }

  return entry.capKeys.map((key) => ({
    label: allowanceLabels[key][lang],
    value: formatMoney(params.allowances[key])
  }));
}

function formatDeductionCap(
  key: DeductionCapKey,
  value: number,
  lang: "zh" | "en"
) {
  if (key === "donationsPercent") {
    const percent = formatPercent(value);
    return lang === "zh" ? `合資格捐款的${percent}` : `${percent} of qualifying donations`;
  }

  if (key === "homeLoanInterestYears") {
    return formatCount(value, lang);
  }

  return formatMoney(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-HK", {
    style: "percent",
    maximumFractionDigits: 2
  }).format(value);
}

function formatCount(value: number, lang: "zh" | "en") {
  return lang === "zh" ? `${value} 個課稅年度` : `${value} years of assessment`;
}

function interpolate(text: string, variables: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => variables[key] ?? match);
}
