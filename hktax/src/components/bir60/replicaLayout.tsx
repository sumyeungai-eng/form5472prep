import type { FilledBir60Box } from "@/lib/bir60/fill";
import type { WizardLanguage } from "@/lib/wizard/wizardDictionary";

export interface LocalizedText {
  zh: string;
  en: string;
}

export type ReplicaColumnsOrientation = "responsive" | "fixed";

export interface TrailingColumnInfo {
  baseId: string;
  columnIndex: number;
}

export interface EntityColumnInfo {
  groupKey: string;
  columnIndex: number;
}

export type SectionRenderBlock =
  | { type: "field"; key: string; box: FilledBir60Box }
  | { type: "columns"; key: string; boxes: FilledBir60Box[]; columnLabelPrefix: LocalizedText };

const trailingColumnPattern = /^(.*)\.(\d+)$/;
const entityColumnPattern = /^(.*\.)(property|business|child|parent|relative)([1-3])(\..+)$/;

export function boxLabel(box: FilledBir60Box, lang: WizardLanguage): string {
  return lang === "zh" ? box.labelZh : box.labelEn;
}

export function noteText(box: FilledBir60Box, lang: WizardLanguage): string {
  const note = lang === "zh" ? box.noteZh : box.noteEn;
  return note || boxLabel(box, lang);
}

export function valueToString(value: FilledBir60Box["value"]): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function splitCharacters(value: string): string[] {
  return Array.from(value);
}

export function formatAmountValue(value: FilledBir60Box["value"]): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericValue = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-HK", { maximumFractionDigits: 0 }).format(Math.trunc(numericValue));
}

export function parseDateParts(value: FilledBir60Box["value"]): { day: string; month: string; year: string } | null {
  const rawValue = valueToString(value).trim();
  if (!rawValue) {
    return { day: "", month: "", year: "" };
  }

  const isoMatch = rawValue.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    return {
      day: isoMatch[3].padStart(2, "0"),
      month: isoMatch[2].padStart(2, "0"),
      year: isoMatch[1],
    };
  }

  const dayFirstMatch = rawValue.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
  if (dayFirstMatch) {
    return {
      day: dayFirstMatch[1].padStart(2, "0"),
      month: dayFirstMatch[2].padStart(2, "0"),
      year: normalizeYear(dayFirstMatch[3]),
    };
  }

  const digits = rawValue.replace(/\D/g, "");
  if (digits.length === 8) {
    const firstFour = Number(digits.slice(0, 4));
    if (firstFour >= 1900 && firstFour <= 2099) {
      return { day: digits.slice(6, 8), month: digits.slice(4, 6), year: digits.slice(0, 4) };
    }

    return { day: digits.slice(0, 2), month: digits.slice(2, 4), year: digits.slice(4, 8) };
  }

  return null;
}

export function trailingColumnInfo(id: string): TrailingColumnInfo | null {
  const match = id.match(trailingColumnPattern);
  if (!match) {
    return null;
  }

  return {
    baseId: match[1],
    columnIndex: Number(match[2]),
  };
}

export function entityColumnInfo(id: string): EntityColumnInfo | null {
  const match = id.match(entityColumnPattern);
  if (!match) {
    return null;
  }

  return {
    groupKey: `${match[1]}${match[2]}`,
    columnIndex: Number(match[3]),
  };
}

export function columnIndexForBox(box: FilledBir60Box): number | null {
  return trailingColumnInfo(box.id)?.columnIndex ?? entityColumnInfo(box.id)?.columnIndex ?? null;
}

export function buildSectionRenderBlocks(boxes: FilledBir60Box[]): SectionRenderBlock[] {
  const trailingBaseCounts = new Map<string, number>();
  const entityGroupIndexes = new Map<string, Set<number>>();

  for (const box of boxes) {
    const trailing = trailingColumnInfo(box.id);
    if (trailing) {
      trailingBaseCounts.set(trailing.baseId, (trailingBaseCounts.get(trailing.baseId) ?? 0) + 1);
    }

    const entity = entityColumnInfo(box.id);
    if (entity) {
      const indexes = entityGroupIndexes.get(entity.groupKey) ?? new Set<number>();
      indexes.add(entity.columnIndex);
      entityGroupIndexes.set(entity.groupKey, indexes);
    }
  }

  const repeatedTrailingIds = new Set(
    boxes
      .filter((box) => {
        const trailing = trailingColumnInfo(box.id);
        return trailing ? (trailingBaseCounts.get(trailing.baseId) ?? 0) >= 2 : false;
      })
      .map((box) => box.id),
  );
  const repeatedEntityGroups = new Set(
    Array.from(entityGroupIndexes.entries())
      .filter(([, indexes]) => indexes.size >= 2)
      .map(([groupKey]) => groupKey),
  );

  const renderedIds = new Set<string>();
  const blocks: SectionRenderBlock[] = [];

  for (const box of boxes) {
    if (renderedIds.has(box.id)) {
      continue;
    }

    const entity = entityColumnInfo(box.id);
    if (entity && repeatedEntityGroups.has(entity.groupKey)) {
      const groupBoxes = boxes.filter((candidate) => entityColumnInfo(candidate.id)?.groupKey === entity.groupKey);
      for (const groupBox of groupBoxes) {
        renderedIds.add(groupBox.id);
      }
      blocks.push({
        type: "columns",
        key: entity.groupKey,
        boxes: groupBoxes,
        columnLabelPrefix: columnLabelPrefixForKey(entity.groupKey),
      });
      continue;
    }

    if (repeatedTrailingIds.has(box.id)) {
      const groupBoxes = boxes.filter((candidate) => repeatedTrailingIds.has(candidate.id));
      for (const groupBox of groupBoxes) {
        renderedIds.add(groupBox.id);
      }
      blocks.push({
        type: "columns",
        key: "trailing-columns",
        boxes: groupBoxes,
        columnLabelPrefix: columnLabelPrefixForKey(box.id),
      });
      continue;
    }

    renderedIds.add(box.id);
    blocks.push({ type: "field", key: box.id, box });
  }

  return blocks;
}

export function BoxNumberTag({ boxNo }: { boxNo?: string }) {
  if (!boxNo) {
    return null;
  }

  return (
    <span className="absolute -right-px -top-px z-10 flex h-8 min-w-8 items-center justify-center border border-[#222] bg-white px-1.5 font-mono text-sm font-black leading-none text-[#111] shadow-[0_1px_0_rgba(0,0,0,0.2)]">
      {boxNo}
    </span>
  );
}

function normalizeYear(year: string): string {
  if (year.length === 4) {
    return year;
  }

  const numericYear = Number(year);
  if (!Number.isFinite(numericYear)) {
    return year;
  }

  return numericYear >= 50 ? `19${year}` : `20${year}`;
}

function columnLabelPrefixForKey(key: string): LocalizedText {
  if (key.includes("relative")) {
    return { zh: "親屬", en: "Relative" };
  }

  if (key.includes("child") || key.includes("parent")) {
    return { zh: "受養人", en: "Dependant" };
  }

  if (key.includes("business")) {
    return { zh: "業務", en: "Business" };
  }

  if (key.includes("property")) {
    return { zh: "物業", en: "Property" };
  }

  return { zh: "項目", en: "Item" };
}
