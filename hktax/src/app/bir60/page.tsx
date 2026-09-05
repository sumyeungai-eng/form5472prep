"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import FormReplica from "@/components/bir60/FormReplica";
import { loadWizardResult, type StoredWizardResult } from "@/components/wizard/resultsStorage";
import { fillBir60, type Bir60Particulars, type FilledBir60, type FilledBir60Box, type FilledBir60Part, type FilledBir60Section } from "@/lib/bir60/fill";
import { useI18n } from "@/lib/i18n/useI18n";
import { resolveResultYear } from "@/lib/results/resolveYear";
import { WizardProvider, useWizard } from "@/lib/wizard/wizardContext";
import { wizardDictionary, wizardT, type WizardDictionaryEntry, type WizardLanguage } from "@/lib/wizard/wizardDictionary";
import type { WizardPersonId, WizardPersonState, WizardState } from "@/lib/wizard/wizardState";
import "./bir60-print.css";

const PARTICULARS_STORAGE_KEY = "hktax:bir60:particulars:v1";

type Bir60Entry = WizardDictionaryEntry;
type Bir60ViewMode = "replica" | "table";

const bir60Dictionary = {
  title: { zh: "BIR60 填表草稿", en: "BIR60 filing draft" },
  subtitle: {
    zh: "根據報稅精靈的計算結果整理，方便你逐格抄寫到報稅表。",
    en: "A box-by-box copy aid prepared from the wizard result.",
  },
  bannerTitle: {
    zh: "草稿：不可作報稅表遞交 / DRAFT — not for submission to IRD",
    en: "草稿：不可作報稅表遞交 / DRAFT — not for submission to IRD",
  },
  bannerBody: {
    zh: "稅務局要求使用官方紙本或 eTAX BIR60 報稅；本頁只供抄寫資料之用，並非可提交表格。 / The IRD requires the official paper or eTAX BIR60; this page is only a copy-from aid, not a submittable return.",
    en: "稅務局要求使用官方紙本或 eTAX BIR60 報稅；本頁只供抄寫資料之用，並非可提交表格。 / The IRD requires the official paper or eTAX BIR60; this page is only a copy-from aid, not a submittable return.",
  },
  print: { zh: "列印 / 儲存為 PDF", en: "Print / Save as PDF" },
  particularsTitle: { zh: "個人資料（選填）", en: "Personal particulars (optional)" },
  particularsNote: {
    zh: "此資料只儲存在你的瀏覽器，不會上傳。 / This data stays in your browser only — it is never uploaded.",
    en: "此資料只儲存在你的瀏覽器，不會上傳。 / This data stays in your browser only — it is never uploaded.",
  },
  clear: { zh: "清除", en: "Clear" },
  taxpayerName: { zh: "納稅人甲姓名", en: "Person A name" },
  taxpayerHkid: { zh: "納稅人甲香港身份證號碼", en: "Person A HKID" },
  spouseName: { zh: "納稅人乙／配偶姓名", en: "Person B / spouse name" },
  spouseHkid: { zh: "納稅人乙／配偶香港身份證號碼", en: "Person B / spouse HKID" },
  employerName: { zh: "僱主名稱", en: "Employer name" },
  employerFileNo: { zh: "僱主檔案號碼", en: "Employer file number" },
  businessName: { zh: "業務名稱", en: "Business name" },
  businessBrNo: { zh: "商業登記號碼", en: "Business Registration Number" },
  propertyAddress: { zh: "物業地址", en: "Property address" },
  childName: { zh: "子女姓名", en: "Child name" },
  optionalPlaceholder: { zh: "選填", en: "Optional" },
  personADraft: { zh: "納稅人甲的報稅草稿", en: "Person A's filing draft" },
  personBDraft: { zh: "納稅人乙的報稅草稿", en: "Person B's filing draft" },
  marriedSeparateDrafts: {
    zh: "已婚個案會列出兩份獨立 BIR60 草稿；每名配偶應按自己的官方報稅表抄寫及核對。",
    en: "For a married case, this page lists two separate BIR60 drafts; each spouse should copy and verify against their own official return.",
  },
  noDraftForPerson: {
    zh: "此納稅人沒有可產生草稿的資料。",
    en: "There is no data to generate a draft for this person.",
  },
  part: { zh: "第", en: "Part" },
  box: { zh: "方格", en: "Box" },
  item: { zh: "項目", en: "Item" },
  value: { zh: "填寫內容", en: "Value" },
  note: { zh: "提示", en: "Note" },
  noBoxNo: { zh: "無方格", en: "No box" },
  completeYourself: { zh: "本工具不會填寫的項目", en: "Not filled by this tool" },
  completeYourselfValue: { zh: "自行填寫", en: "Complete yourself" },
  notProvided: { zh: "未填寫", en: "Not provided" },
  noRows: {
    zh: "此部分沒有由本工具填寫的方格。",
    en: "This section has no boxes filled by this tool.",
  },
  emptyTitle: { zh: "未有 BIR60 草稿", en: "No BIR60 draft yet" },
  emptyBody: {
    zh: "請先完成報稅精靈並產生計算結果，再返回此頁製作填表草稿。",
    en: "Complete the wizard and generate a result first, then return here to prepare the filing draft.",
  },
  year: { zh: "課稅年度", en: "Year of assessment" },
  viewModeLegend: { zh: "草稿檢視模式", en: "Draft view mode" },
  replicaView: { zh: "表格版面", en: "Form layout" },
  tableView: { zh: "清單檢視", en: "List view" },
  replicaRegion: { zh: "BIR60 表格版面草稿", en: "BIR60 form-layout draft" },
} as const satisfies Record<string, Bir60Entry>;

function bir60T(entry: Bir60Entry, lang: WizardLanguage): string {
  return entry[lang];
}

const TEXT_FIELDS = [
  "taxpayerName",
  "taxpayerHkid",
  "spouseName",
  "spouseHkid",
  "employerName",
  "employerFileNo",
  "businessName",
  "businessBrNo",
] as const;

type TextParticularKey = (typeof TEXT_FIELDS)[number];

const TEXT_FIELD_LABELS: Record<TextParticularKey, Bir60Entry> = {
  taxpayerName: bir60Dictionary.taxpayerName,
  taxpayerHkid: bir60Dictionary.taxpayerHkid,
  spouseName: bir60Dictionary.spouseName,
  spouseHkid: bir60Dictionary.spouseHkid,
  employerName: bir60Dictionary.employerName,
  employerFileNo: bir60Dictionary.employerFileNo,
  businessName: bir60Dictionary.businessName,
  businessBrNo: bir60Dictionary.businessBrNo,
};

const moneyFormatter = new Intl.NumberFormat("en-HK", {
  maximumFractionDigits: 0,
});

export default function Bir60Page() {
  return (
    <WizardProvider>
      <Bir60PageContent />
    </WizardProvider>
  );
}

function Bir60PageContent() {
  const { lang } = useI18n();
  const { hasHydrated, wizardState } = useWizard();
  const [storedResult, setStoredResult] = useState<StoredWizardResult | null>();
  const [particulars, setParticulars] = useState<Bir60Particulars>({});
  const [particularsLoaded, setParticularsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"replica" | "table">("replica");

  useEffect(() => {
    setStoredResult(loadWizardResult());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(PARTICULARS_STORAGE_KEY);
    if (!stored) {
      setParticularsLoaded(true);
      return;
    }

    try {
      setParticulars(normalizeParticulars(JSON.parse(stored) as unknown));
    } catch {
      window.localStorage.removeItem(PARTICULARS_STORAGE_KEY);
    } finally {
      setParticularsLoaded(true);
    }
  }, []);

  const arraySizes = useMemo(() => particularsArraySizes(wizardState), [wizardState]);
  const normalizedParticulars = useMemo(
    () => normalizeArrayLengths(particulars, arraySizes.propertyCount, arraySizes.childCount),
    [arraySizes.childCount, arraySizes.propertyCount, particulars],
  );

  useEffect(() => {
    if (!particularsLoaded) {
      return;
    }

    setParticulars((previous) => normalizeArrayLengths(previous, arraySizes.propertyCount, arraySizes.childCount));
  }, [arraySizes.childCount, arraySizes.propertyCount, particularsLoaded]);

  useEffect(() => {
    if (!particularsLoaded || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(PARTICULARS_STORAGE_KEY, JSON.stringify(normalizedParticulars));
  }, [normalizedParticulars, particularsLoaded]);

  if (storedResult === undefined || !hasHydrated || !particularsLoaded) {
    return <LoadingState lang={lang} />;
  }

  if (storedResult === null || isUntouchedDefault(wizardState)) {
    return <EmptyState lang={lang} />;
  }

  const resolvedYear = resolveResultYear(storedResult.familyScenarioInput, storedResult.optimizerResult);
  const personADraft = fillBir60("A", wizardState, storedResult, normalizedParticulars, resolvedYear.params);
  const personBDraft = wizardState.maritalStatus === "married"
    ? fillBir60("B", wizardState, storedResult, normalizedParticulars, resolvedYear.params)
    : null;
  const yearLabel = resolvedYear.year.replace("_", "/");

  return (
    <Container className="bir60-page py-8 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <DraftBanner />

        <section className="rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
                BIR60
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-navy-900">
                {bir60T(bir60Dictionary.title, lang)}
              </h1>
              <p className="mt-2 text-sm leading-6 text-warm-700">
                {bir60T(bir60Dictionary.subtitle, lang)}
              </p>
              <p className="mt-2 text-sm font-semibold text-warm-700">
                {bir60T(bir60Dictionary.year, lang)}: {yearLabel}
              </p>
            </div>
            <div className="bir60-print-action">
              <button
                type="button"
                onClick={() => window.print()}
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800"
              >
                {bir60T(bir60Dictionary.print, lang)}
              </button>
            </div>
          </div>
        </section>

        <ParticularsForm
          lang={lang}
          particulars={normalizedParticulars}
          propertyCount={arraySizes.propertyCount}
          childCount={arraySizes.childCount}
          onChange={setParticulars}
          onClear={() => {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(PARTICULARS_STORAGE_KEY);
            }
            setParticulars(emptyParticulars(arraySizes.propertyCount, arraySizes.childCount));
          }}
        />

        {wizardState.maritalStatus === "married" ? (
          <p className="rounded-md border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-navy-900">
            {bir60T(bir60Dictionary.marriedSeparateDrafts, lang)}
          </p>
        ) : null}

        <Bir60ViewModeToggle
          mode={viewMode}
          onChange={setViewMode}
          controls={wizardState.maritalStatus === "married" ? "bir60-A-draft bir60-B-draft" : "bir60-A-draft"}
        />

        <DraftOrNote
          draft={personADraft}
          heading={bir60T(bir60Dictionary.personADraft, lang)}
          lang={lang}
          personId="A"
          viewMode={viewMode}
        />

        {wizardState.maritalStatus === "married" ? (
          <DraftOrNote
            draft={personBDraft}
            heading={bir60T(bir60Dictionary.personBDraft, lang)}
            lang={lang}
            personId="B"
            pageBreakBefore
            viewMode={viewMode}
          />
        ) : null}

        <div className="bir60-print-final-banner">
          <DraftBanner compact />
        </div>
      </div>
    </Container>
  );
}

function LoadingState({ lang }: { lang: WizardLanguage }) {
  return (
    <Container className="py-16 sm:py-24">
      <section className="mx-auto max-w-3xl rounded-lg border border-warm-200 bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold text-teal-800">
          {wizardT(wizardDictionary.common.loading, lang)}
        </p>
      </section>
    </Container>
  );
}

function EmptyState({ lang }: { lang: WizardLanguage }) {
  return (
    <Container className="py-16 sm:py-24">
      <section className="mx-auto max-w-3xl rounded-lg border border-warm-200 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-navy-900">
          {bir60T(bir60Dictionary.emptyTitle, lang)}
        </h1>
        <p className="mt-4 text-sm leading-6 text-warm-700">
          {bir60T(bir60Dictionary.emptyBody, lang)}
        </p>
        <Link
          href="/wizard"
          className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800"
        >
          {wizardT(wizardDictionary.results.backToWizard, lang)}
        </Link>
      </section>
    </Container>
  );
}

function DraftBanner({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact
      ? "rounded-md border-2 border-navy-900 bg-gold-100 p-3 text-navy-950"
      : "rounded-lg border-2 border-navy-900 bg-gold-100 p-4 text-navy-950 shadow-soft sm:p-5"}
    >
      <p className={compact ? "text-sm font-black" : "text-base font-black sm:text-lg"}>
        {bir60Dictionary.bannerTitle.zh}
      </p>
      <p className="mt-1 text-xs font-semibold leading-5 sm:text-sm">
        {bir60Dictionary.bannerBody.zh}
      </p>
    </section>
  );
}

function ParticularsForm({
  childCount,
  lang,
  onChange,
  onClear,
  particulars,
  propertyCount,
}: {
  childCount: number;
  lang: WizardLanguage;
  onChange: (next: Bir60Particulars | ((previous: Bir60Particulars) => Bir60Particulars)) => void;
  onClear: () => void;
  particulars: Bir60Particulars;
  propertyCount: number;
}) {
  return (
    <details className="bir60-particulars rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8" open>
      <summary className="cursor-pointer text-sm font-bold text-navy-900">
        {bir60Dictionary.particularsTitle.zh} / {bir60Dictionary.particularsTitle.en}
      </summary>
      <div className="mt-5 space-y-5">
        <p className="rounded-md border border-teal-100 bg-teal-50 p-3 text-xs font-semibold leading-5 text-teal-800">
          {bir60T(bir60Dictionary.particularsNote, lang)}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {TEXT_FIELDS.map((field) => (
            <TextInput
              key={field}
              label={bir60T(TEXT_FIELD_LABELS[field], lang)}
              value={particulars[field] ?? ""}
              placeholder={bir60T(bir60Dictionary.optionalPlaceholder, lang)}
              onChange={(value) => onChange((previous) => ({ ...previous, [field]: value }))}
            />
          ))}
        </div>

        {propertyCount > 0 ? (
          <div>
            <h3 className="text-sm font-bold text-navy-900">
              {bir60T(bir60Dictionary.propertyAddress, lang)}
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {Array.from({ length: propertyCount }, (_, index) => (
                <TextInput
                  key={`property-${index}`}
                  label={`${bir60T(bir60Dictionary.propertyAddress, lang)} ${index + 1}`}
                  value={particulars.propertyAddresses?.[index] ?? ""}
                  placeholder={bir60T(bir60Dictionary.optionalPlaceholder, lang)}
                  onChange={(value) => onChange((previous) => updateArrayField(previous, "propertyAddresses", index, value, propertyCount))}
                />
              ))}
            </div>
          </div>
        ) : null}

        {childCount > 0 ? (
          <div>
            <h3 className="text-sm font-bold text-navy-900">
              {bir60T(bir60Dictionary.childName, lang)}
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {Array.from({ length: childCount }, (_, index) => (
                <TextInput
                  key={`child-${index}`}
                  label={`${bir60T(bir60Dictionary.childName, lang)} ${index + 1}`}
                  value={particulars.childrenNames?.[index] ?? ""}
                  placeholder={bir60T(bir60Dictionary.optionalPlaceholder, lang)}
                  onChange={(value) => onChange((previous) => updateArrayField(previous, "childrenNames", index, value, childCount))}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="bir60-print-action">
          <button
            type="button"
            onClick={onClear}
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-warm-200 bg-white px-4 py-2 text-sm font-bold text-navy-900 hover:border-teal-400"
          >
            {bir60Dictionary.clear.zh} / {bir60Dictionary.clear.en}
          </button>
        </div>
      </div>
    </details>
  );
}

function TextInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold text-navy-900">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="bir60-particulars-input form-input mt-2 w-full"
      />
    </label>
  );
}

function Bir60ViewModeToggle({
  controls,
  mode,
  onChange,
}: {
  controls: string;
  mode: Bir60ViewMode;
  onChange: (mode: Bir60ViewMode) => void;
}) {
  const options: Array<{ label: Bir60Entry; value: Bir60ViewMode }> = [
    { label: bir60Dictionary.replicaView, value: "replica" },
    { label: bir60Dictionary.tableView, value: "table" },
  ];

  return (
    <fieldset className="bir60-view-toggle rounded-lg border border-warm-200 bg-white p-4 shadow-soft" aria-controls={controls}>
      <legend className="px-1 text-sm font-bold text-navy-900">
        {bir60Dictionary.viewModeLegend.zh} / {bir60Dictionary.viewModeLegend.en}
      </legend>
      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold focus-within:ring-2 focus-within:ring-teal-500 ${
              mode === option.value
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-warm-200 bg-white text-navy-900 hover:border-teal-400"
            }`}
          >
            <input
              type="radio"
              name="bir60-view-mode"
              value={option.value}
              checked={mode === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 accent-teal-700"
            />
            <span>{option.label.zh} / {option.label.en}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function DraftOrNote({
  draft,
  heading,
  lang,
  pageBreakBefore = false,
  personId,
  viewMode,
}: {
  draft: FilledBir60 | null;
  heading: string;
  lang: WizardLanguage;
  pageBreakBefore?: boolean;
  personId: WizardPersonId;
  viewMode: Bir60ViewMode;
}) {
  if (!draft) {
    return (
      <section
        id={`bir60-${personId}-draft`}
        className={pageBreakBefore ? "bir60-person-break rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8" : "rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8"}
      >
        <h2 className="text-xl font-bold text-navy-900">{heading}</h2>
        <p className="mt-3 text-sm leading-6 text-warm-700">
          {bir60T(bir60Dictionary.noDraftForPerson, lang)}
        </p>
      </section>
    );
  }

  return (
    <article
      id={`bir60-${personId}-draft`}
      className={pageBreakBefore ? "bir60-person-break space-y-5" : "space-y-5"}
      aria-labelledby={`bir60-${personId}-title`}
    >
      <DraftBanner compact />
      <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
          BIR60
        </p>
        <h2 id={`bir60-${personId}-title`} className="mt-2 text-2xl font-bold text-navy-900">
          {heading}
        </h2>
      </div>
      {viewMode === "replica" ? (
        <div
          className="bir60-replica"
          role="region"
          aria-label={`${heading} - ${bir60T(bir60Dictionary.replicaRegion, lang)}`}
        >
          <FormReplica draft={draft} lang={lang} />
        </div>
      ) : (
        draft.parts.map((part) => (
          <Bir60PartView key={part.id} part={part} lang={lang} />
        ))
      )}
    </article>
  );
}

function Bir60PartView({ lang, part }: { lang: WizardLanguage; part: FilledBir60Part }) {
  return (
    <section className="bir60-part rounded-lg border border-warm-200 bg-white p-5 shadow-soft sm:p-8">
      <div className="border-b border-warm-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
          {bir60T(bir60Dictionary.part, lang)} {part.partNo}
        </p>
        <h3 className="mt-1 text-xl font-bold text-navy-900">
          {part.titleZh} / {part.titleEn}
        </h3>
      </div>
      <div className="mt-5 space-y-5">
        {part.sections.map((section) => (
          <Bir60SectionView key={section.id} section={section} lang={lang} />
        ))}
      </div>
    </section>
  );
}

function Bir60SectionView({ lang, section }: { lang: WizardLanguage; section: FilledBir60Section }) {
  const valueBoxes = section.boxes.filter((box) => box.kind !== "note");
  const noteBoxes = section.boxes.filter((box) => box.kind === "note");

  return (
    <section className="bir60-section">
      <h4 className="text-base font-bold text-navy-900">
        {section.titleZh} / {section.titleEn}
      </h4>

      {valueBoxes.length > 0 ? (
        <div className="mt-3 overflow-x-auto rounded-md border border-warm-200">
          <table className="min-w-full divide-y divide-warm-200 text-left text-sm">
            <thead className="bg-warm-50 text-xs uppercase text-warm-600">
              <tr>
                <th className="w-24 px-3 py-2 font-bold">{bir60T(bir60Dictionary.box, lang)}</th>
                <th className="px-3 py-2 font-bold">{bir60T(bir60Dictionary.item, lang)}</th>
                <th className="w-44 px-3 py-2 font-bold">{bir60T(bir60Dictionary.value, lang)}</th>
                <th className="w-64 px-3 py-2 font-bold">{bir60T(bir60Dictionary.note, lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100 text-warm-700">
              {valueBoxes.map((box) => (
                <tr key={box.id}>
                  <td className="px-3 py-3 align-top">
                    <BoxChip boxNo={box.boxNo} lang={lang} />
                  </td>
                  <td className="px-3 py-3 align-top leading-6">
                    <p className="font-semibold text-navy-900">{box.labelZh}</p>
                    <p className="text-xs leading-5 text-warm-600">{box.labelEn}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-top font-bold text-navy-900">
                    {formatBoxValue(box, lang)}
                  </td>
                  <td className="px-3 py-3 align-top text-xs leading-5 text-warm-600">
                    {box.noteZh || box.noteEn ? (
                      <>
                        {box.noteZh ? <p>{box.noteZh}</p> : null}
                        {box.noteEn ? <p>{box.noteEn}</p> : null}
                      </>
                    ) : (
                      <span aria-label={bir60T(bir60Dictionary.notProvided, lang)}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : noteBoxes.length === 0 ? (
        <p className="mt-3 rounded-md border border-warm-100 bg-warm-50 p-3 text-sm leading-6 text-warm-700">
          {bir60T(bir60Dictionary.noRows, lang)}
        </p>
      ) : null}

      {noteBoxes.length > 0 ? (
        <div className="mt-3 rounded-md border border-warm-200 bg-warm-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-warm-600">
            {bir60Dictionary.completeYourself.zh} / {bir60Dictionary.completeYourself.en}
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {noteBoxes.map((box) => (
              <article key={box.id} className="rounded-md border border-warm-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <BoxChip boxNo={box.boxNo} lang={lang} />
                  <p className="text-sm font-bold text-navy-900">
                    {bir60T(bir60Dictionary.completeYourselfValue, lang)}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-navy-900">
                  {box.labelZh}
                </p>
                <p className="text-xs leading-5 text-warm-600">
                  {box.labelEn}
                </p>
                {box.noteZh || box.noteEn ? (
                  <div className="mt-2 text-xs leading-5 text-warm-600">
                    {box.noteZh ? <p>{box.noteZh}</p> : null}
                    {box.noteEn ? <p>{box.noteEn}</p> : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BoxChip({ boxNo, lang }: { boxNo?: string; lang: WizardLanguage }) {
  return boxNo ? (
    <span className="inline-flex rounded-md border border-warm-200 bg-warm-50 px-1.5 py-0.5 font-mono text-xs font-bold text-navy-900">
      {boxNo}
    </span>
  ) : (
    <span className="inline-flex rounded-md border border-warm-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-warm-600">
      {bir60T(bir60Dictionary.noBoxNo, lang)}
    </span>
  );
}

function formatBoxValue(box: FilledBir60Box, lang: WizardLanguage): string {
  if (box.kind === "note") {
    return "";
  }

  if (box.kind === "tick") {
    return box.value === true ? "☑" : "☐";
  }

  if (box.value === null || box.value === "") {
    return "—";
  }

  if (box.kind === "amount") {
    const numericValue = typeof box.value === "number" ? box.value : Number(box.value);
    if (!Number.isFinite(numericValue)) {
      return String(box.value);
    }

    return `HK$${moneyFormatter.format(Math.round(numericValue))}`;
  }

  return String(box.value);
}

function normalizeParticulars(value: unknown): Bir60Particulars {
  if (!value || typeof value !== "object") {
    return {};
  }

  const record = value as Record<string, unknown>;
  const next: Bir60Particulars = {};

  for (const field of TEXT_FIELDS) {
    if (typeof record[field] === "string") {
      next[field] = record[field];
    }
  }

  if (Array.isArray(record.propertyAddresses)) {
    next.propertyAddresses = record.propertyAddresses.map((item) => typeof item === "string" ? item : "");
  }

  if (Array.isArray(record.childrenNames)) {
    next.childrenNames = record.childrenNames.map((item) => typeof item === "string" ? item : "");
  }

  return next;
}

function normalizeArrayLengths(particulars: Bir60Particulars, propertyCount: number, childCount: number): Bir60Particulars {
  return {
    ...particulars,
    propertyAddresses: resizeArray(particulars.propertyAddresses, propertyCount),
    childrenNames: resizeArray(particulars.childrenNames, childCount),
  };
}

function emptyParticulars(propertyCount: number, childCount: number): Bir60Particulars {
  return {
    propertyAddresses: resizeArray([], propertyCount),
    childrenNames: resizeArray([], childCount),
  };
}

function resizeArray(value: string[] | undefined, length: number): string[] {
  return Array.from({ length }, (_, index) => value?.[index] ?? "");
}

function updateArrayField(
  particulars: Bir60Particulars,
  field: "propertyAddresses" | "childrenNames",
  index: number,
  value: string,
  length: number,
): Bir60Particulars {
  const next = resizeArray(particulars[field], length);
  next[index] = value;
  return {
    ...particulars,
    [field]: next,
  };
}

function particularsArraySizes(wizard: WizardState): { childCount: number; propertyCount: number } {
  const people = wizard.maritalStatus === "married" ? [wizard.personA, wizard.personB] : [wizard.personA];
  const propertyCount = people.reduce((count, person) => Math.max(count, person.properties.length), 0);
  return {
    childCount: wizard.family.children.length,
    propertyCount,
  };
}

function isUntouchedDefault(wizard: WizardState): boolean {
  return wizard.maritalStatus === "single"
    && !personHasData(wizard.personA)
    && !personHasData(wizard.personB)
    && wizard.family.children.length === 0
    && wizard.family.parents.length === 0
    && wizard.family.siblingCount === 0
    && !wizard.family.singleParent
    && wizard.family.disabledDependantCount === 0
    && !wizard.family.personalDisability.A
    && !wizard.family.personalDisability.B;
}

function personHasData(person: WizardPersonState): boolean {
  return person.incomeSources.hasSalary
    || person.incomeSources.hasProperty
    || person.incomeSources.hasBusiness
    || person.salary.incomeItems.length > 0
    || person.salary.outgoingsAndExpenses.length > 0
    || person.salary.depreciationAllowances.length > 0
    || person.salary.employerAccommodation.length > 0
    || person.properties.length > 0
    || person.businesses.length > 0
    || person.paLossBroughtForward !== undefined
    || person.deductions.selfEducation !== undefined
    || person.deductions.charitableDonations !== undefined
    || person.deductions.elderlyCare !== undefined
    || person.deductions.mpfMandatory !== undefined
    || person.deductions.annuityAndTvc !== undefined
    || person.deductions.vhisPremiums !== undefined
    || person.deductions.vhisInsuredPersons !== undefined
    || person.deductions.assistedReproduction !== undefined
    || person.deductions.housing.kind !== "none"
    || person.deductions.housing.amount > 0;
}
