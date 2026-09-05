import type { FilledBir60Box } from "@/lib/bir60/fill";
import type { WizardLanguage } from "@/lib/wizard/wizardDictionary";

import { BoxNumberTag, boxLabel, noteText } from "./replicaLayout";

export interface ReplicaTickPairProps {
  box: FilledBir60Box;
  lang: WizardLanguage;
  noLabel: string;
  yesLabel: string;
  className?: string;
}

export default function ReplicaTickPair({
  box,
  className = "",
  lang,
  noLabel,
  yesLabel,
}: ReplicaTickPairProps) {
  const selected = typeof box.value === "boolean" ? box.value : null;

  return (
    <article className={`relative border border-[#333] bg-white p-2.5 pr-10 text-[#111] ${className}`}>
      <BoxNumberTag boxNo={box.boxNo} />
      <p className="mb-2 min-h-5 text-xs font-semibold leading-5">{boxLabel(box, lang)}</p>
      <div className="flex flex-wrap items-center gap-3">
        <TickBox label={noLabel} checked={selected === false} />
        <TickBox label={yesLabel} checked={selected === true} />
      </div>
      {box.noteZh || box.noteEn ? (
        <p className="mt-2 text-[11px] leading-4 text-[#555]">{noteText(box, lang)}</p>
      ) : null}
    </article>
  );
}

function TickBox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-7 w-7 items-center justify-center border border-[#333] bg-white text-lg font-black leading-none">
        {checked ? "✓" : ""}
      </span>
      <span className="text-sm font-bold leading-5">{label}</span>
    </div>
  );
}
