import type { FilledBir60Box } from "@/lib/bir60/fill";
import type { WizardLanguage } from "@/lib/wizard/wizardDictionary";

import {
  BoxNumberTag,
  boxLabel,
  formatAmountValue,
  noteText,
  parseDateParts,
  splitCharacters,
  valueToString,
} from "./replicaLayout";

export interface ReplicaFieldProps {
  box: FilledBir60Box;
  lang: WizardLanguage;
  className?: string;
  digitCellCount?: number;
}

const defaultAmountCells = 11;
const defaultTextCells = 10;

export default function ReplicaField({ box, className = "", digitCellCount, lang }: ReplicaFieldProps) {
  const label = boxLabel(box, lang);
  const note = noteText(box, lang);

  if (box.kind === "note") {
    return (
      <article className={`relative border border-[#9a9a9a] bg-[#e9e9e9] p-2.5 pr-10 text-[#666] ${className}`}>
        <BoxNumberTag boxNo={box.boxNo} />
        <p className="text-[11px] font-semibold leading-4">{label}</p>
        <p className="mt-1 text-[11px] leading-4">{note}</p>
      </article>
    );
  }

  return (
    <article className={`relative border border-[#333] bg-white p-2.5 pr-10 text-[#111] ${className}`}>
      <BoxNumberTag boxNo={box.boxNo} />
      <p className="mb-2 min-h-5 text-xs font-semibold leading-5 text-[#111]">{label}</p>
      {renderFieldBody(box, digitCellCount)}
      {box.noteZh || box.noteEn ? (
        <p className="mt-2 text-[11px] leading-4 text-[#555]">{note}</p>
      ) : null}
    </article>
  );
}

function renderFieldBody(box: FilledBir60Box, digitCellCount?: number) {
  if (box.kind === "amount") {
    const amount = formatAmountValue(box.value);
    const characters = splitCharacters(amount.replace(/,/g, ""));
    const cellCount = Math.max(digitCellCount ?? defaultAmountCells, characters.length);
    return (
      <div className="flex min-w-0 items-end gap-1">
        <span className="flex-none pb-1 text-sm font-bold">$</span>
        <SegmentedCells characters={characters} cellCount={cellCount} align="right" />
      </div>
    );
  }

  if (box.kind === "date") {
    const parsedDate = parseDateParts(box.value);
    if (parsedDate) {
      return <DateCells day={parsedDate.day} month={parsedDate.month} year={parsedDate.year} />;
    }

    return (
      <SegmentedCells
        characters={splitCharacters(valueToString(box.value))}
        cellCount={Math.max(digitCellCount ?? 8, valueToString(box.value).length)}
        align="left"
      />
    );
  }

  if (box.kind === "text" && shouldUseSegmentedText(box)) {
    const value = valueToString(box.value).replace(/\s/g, "");
    return (
      <SegmentedCells
        characters={splitCharacters(value)}
        cellCount={Math.max(digitCellCount ?? defaultTextCells, value.length)}
        align="left"
      />
    );
  }

  return (
    <div className="min-h-9 border border-[#333] bg-white px-2 py-1.5 text-sm font-semibold leading-5">
      {valueToString(box.value)}
    </div>
  );
}

function DateCells({ day, month, year }: { day: string; month: string; year: string }) {
  return (
    <div className="flex min-w-0 flex-wrap items-end gap-1.5">
      <DateGroup label="日" value={day} cellCount={2} />
      <DateGroup label="月" value={month} cellCount={2} />
      <DateGroup label="年" value={year} cellCount={4} />
    </div>
  );
}

function DateGroup({ cellCount, label, value }: { cellCount: number; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-end gap-1">
      <SegmentedCells characters={splitCharacters(value)} cellCount={cellCount} align="left" compact />
      <span className="flex-none pb-1 text-[11px] font-bold text-[#333]">{label}</span>
    </div>
  );
}

function SegmentedCells({
  align,
  cellCount,
  characters,
  compact = false,
}: {
  align: "left" | "right";
  cellCount: number;
  characters: string[];
  compact?: boolean;
}) {
  const emptyCells = Math.max(cellCount - characters.length, 0);
  const cells = align === "right"
    ? [...Array.from({ length: emptyCells }, () => ""), ...characters]
    : [...characters, ...Array.from({ length: emptyCells }, () => "")];

  return (
    <div className="bir60-segmented-row min-w-0 max-w-full flex-1 overflow-x-auto pb-1">
      <div
        className={`bir60-segmented-cells flex w-max flex-nowrap ${
          align === "right" ? "ml-auto justify-end" : "justify-start"
        }`}
      >
        {cells.map((character, index) => (
          <span
            key={`${character}-${index}`}
            className={`${
              compact ? "bir60-segmented-cell-compact h-7" : "bir60-segmented-cell h-8"
            } -ml-px flex shrink-0 items-center justify-center border border-[#333] bg-white font-mono text-sm font-bold leading-none first:ml-0`}
          >
            {character}
          </span>
        ))}
      </div>
    </div>
  );
}

function shouldUseSegmentedText(box: FilledBir60Box): boolean {
  const searchable = `${box.id} ${box.labelEn} ${box.labelZh}`.toLowerCase();
  return (
    searchable.includes("hkid") ||
    searchable.includes("identity card") ||
    searchable.includes("身分證") ||
    searchable.includes("身份證") ||
    searchable.includes("brnumber") ||
    searchable.includes("business registration") ||
    searchable.includes("telephone") ||
    searchable.includes("phone")
  );
}
