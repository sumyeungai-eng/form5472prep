import type { FilledBir60Box } from "@/lib/bir60/fill";
import type { WizardLanguage } from "@/lib/wizard/wizardDictionary";

import ReplicaField from "./ReplicaField";
import ReplicaTickPair from "./ReplicaTickPair";
import {
  columnIndexForBox,
  type LocalizedText,
  type ReplicaColumnsOrientation,
} from "./replicaLayout";

export interface ReplicaColumnsProps {
  boxes: FilledBir60Box[];
  lang: WizardLanguage;
  columnLabelPrefix: LocalizedText;
  orientation?: ReplicaColumnsOrientation;
  className?: string;
}

export default function ReplicaColumns({
  boxes,
  className = "",
  columnLabelPrefix,
  lang,
  orientation = "responsive",
}: ReplicaColumnsProps) {
  const columnIndexes = Array.from(
    new Set(
      boxes
        .map((box) => columnIndexForBox(box))
        .filter((index): index is number => index !== null)
        .filter((index) => index >= 1 && index <= 3),
    ),
  ).sort((first, second) => first - second);

  if (columnIndexes.length === 0) {
    return null;
  }

  const fixedStyle = orientation === "fixed"
    ? { gridTemplateColumns: `repeat(${columnIndexes.length}, minmax(0, 1fr))` }
    : undefined;
  const gridClass = orientation === "fixed"
    ? "grid"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`min-w-0 ${className}`}>
      <div className={`${gridClass} min-w-0 gap-3`} style={fixedStyle}>
        {columnIndexes.map((columnIndex) => {
          const columnBoxes = boxes.filter((box) => columnIndexForBox(box) === columnIndex);
          return (
            <section key={columnIndex} className="min-w-0 border border-[#333] bg-[#f8fbf4] p-2">
              <h5 className="mb-2 border-b border-[#333] pb-1 text-center text-sm font-black text-[#111]">
                {columnLabelPrefix[lang]}{columnIndex}
              </h5>
              <div className="space-y-2">
                {columnBoxes.map((box) => (
                  <ReplicaColumnBox key={box.id} box={box} lang={lang} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ReplicaColumnBox({ box, lang }: { box: FilledBir60Box; lang: WizardLanguage }) {
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

  return <ReplicaField box={{ ...box, labelZh: stripOrdinal(box.labelZh), labelEn: stripOrdinal(box.labelEn) }} lang={lang} />;
}

function stripOrdinal(label: string): string {
  return label.replace(/\s+[1-3]$/, "");
}
