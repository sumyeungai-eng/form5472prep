import type {
  FilledBir60,
  FilledBir60Box,
  FilledBir60Part,
  FilledBir60Section,
} from "@/lib/bir60/fill";
import type { WizardLanguage } from "@/lib/wizard/wizardDictionary";

import ReplicaColumns from "./ReplicaColumns";
import ReplicaField from "./ReplicaField";
import ReplicaTickPair from "./ReplicaTickPair";
import { BoxNumberTag, buildSectionRenderBlocks } from "./replicaLayout";

export interface FormReplicaProps {
  draft: FilledBir60;
  lang: WizardLanguage;
}

export default function FormReplica({ draft, lang }: FormReplicaProps) {
  return (
    <div className="space-y-6 text-[#111]">
      {draft.parts.map((part) => (
        <ReplicaPart key={part.id} part={part} lang={lang} />
      ))}
    </div>
  );
}

function ReplicaPart({ lang, part }: { lang: WizardLanguage; part: FilledBir60Part }) {
  return (
    <section
      data-part-no={part.partNo}
      className="border border-[#333] bg-[#eef3e6] p-3 shadow-sm sm:p-4"
    >
      <div className="bg-black px-3 py-2 text-sm font-black leading-5 text-white sm:text-base">
        第{part.partNo}部 {part.titleZh} / Part {part.partNo} {part.titleEn}
      </div>
      <div className="border-x border-b border-[#7f9d72] bg-[#d9ead3] px-3 py-2 text-xs font-semibold leading-5 text-[#1f321b]">
        詳情請參閱本網站的相關指南 / See this site&apos;s guide for details
      </div>

      {part.id === "part1" ? <IrdPrintedPlaceholder /> : null}
      {part.id === "part3" || part.id === "part8" ? <AmountCentsNote /> : null}

      <div className="mt-3 space-y-3">
        {part.sections.map((section) => (
          <ReplicaSection key={section.id} section={section} lang={lang} />
        ))}
      </div>

      {part.id === "part13" ? <DeclarationSignatureBlock /> : null}
    </section>
  );
}

function ReplicaSection({ lang, section }: { lang: WizardLanguage; section: FilledBir60Section }) {
  if (section.id === "officialUseOnly") {
    return <OfficialUseOnlySection section={section} lang={lang} />;
  }

  const blocks = buildSectionRenderBlocks(section.boxes);

  return (
    <section className="border border-[#93a58b] bg-[#f5f8f0] p-3">
      <h4 className="mb-3 border-b border-[#93a58b] pb-1 text-sm font-black leading-5">
        {section.titleZh} / {section.titleEn}
      </h4>
      {blocks.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {blocks.map((block) => {
            if (block.type === "columns") {
              return (
                <ReplicaColumns
                  key={block.key}
                  boxes={block.boxes}
                  lang={lang}
                  columnLabelPrefix={block.columnLabelPrefix}
                  className="md:col-span-2 xl:col-span-3"
                />
              );
            }

            return <ReplicaBox key={block.key} box={block.box} lang={lang} />;
          })}
        </div>
      ) : null}
    </section>
  );
}

function ReplicaBox({ box, lang }: { box: FilledBir60Box; lang: WizardLanguage }) {
  if (box.kind === "tick") {
    return (
      <ReplicaTickPair
        box={box}
        lang={lang}
        noLabel={lang === "zh" ? "否" : "No"}
        yesLabel={lang === "zh" ? "是" : "Yes"}
      />
    );
  }

  return <ReplicaField box={box} lang={lang} />;
}

function IrdPrintedPlaceholder() {
  return (
    <div className="mt-3 border border-dashed border-[#777] bg-[#e6e6e6] p-3 text-[#555]">
      <p className="text-xs font-black leading-5">
        此欄由稅務局在正式表格上印上 / Printed by IRD on your official return
      </p>
      <div className="mt-3 grid gap-2 text-[11px] font-semibold leading-4 sm:grid-cols-2 lg:grid-cols-5">
        <PlaceholderCell label="稅務局標誌 / IRD logo" />
        <PlaceholderCell label="條碼 / Barcode" />
        <PlaceholderCell label="檔案號碼 / File number" />
        <PlaceholderCell label="稅務編號 / TIN" />
        <PlaceholderCell label="收件人姓名及地址 / Addressee name and address" />
      </div>
    </div>
  );
}

function PlaceholderCell({ label }: { label: string }) {
  return (
    <div className="min-h-14 border border-dashed border-[#999] bg-[#f1f1f1] p-2">
      {label}
    </div>
  );
}

function OfficialUseOnlySection({ lang, section }: { lang: WizardLanguage; section: FilledBir60Section }) {
  return (
    <section className="border border-[#aaa] bg-[#e9e9e9] p-2 text-[#666]">
      <h4 className="mb-2 text-xs font-black leading-4">
        只供稅務局人員填寫 / For IRD official use only
      </h4>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {section.boxes.map((box) => (
          <div key={box.id} className="relative min-h-12 border border-[#aaa] bg-[#f3f3f3] p-1.5 pr-8">
            <BoxNumberTag boxNo={box.boxNo} />
            <p className="text-[10px] font-semibold leading-3">
              {lang === "zh" ? box.labelZh : box.labelEn}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AmountCentsNote() {
  return (
    <p className="mt-3 border border-[#333] bg-white px-3 py-2 text-xs font-bold leading-5">
      填寫數額時，請將小數點後的角、分數目略去 / When filling in amounts, omit cents.
    </p>
  );
}

function DeclarationSignatureBlock() {
  return (
    <div className="mt-3 border border-[#333] bg-white p-3">
      <p className="mb-4 text-xs font-black leading-5 text-[#7a1f1f]">
        草稿：不可作報稅表遞交 / Draft only - not for submission
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <SignatureLine label="簽署 Signature" />
        <SignatureLine label="配偶簽署 Spouse's signature" />
      </div>
      <p className="mt-4 text-xs font-semibold leading-5">
        請在正式表格上親筆簽署 / Sign the REAL form only — do not type a signature here.
      </p>
    </div>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <label className="block text-xs font-bold leading-5">
      <span className="block min-h-10 border-b border-[#333]" aria-hidden="true" />
      <span className="mt-1 block">{label}</span>
    </label>
  );
}
