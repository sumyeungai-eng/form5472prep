"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import { wizardT, type WizardDictionaryEntry } from "@/lib/wizard/wizardDictionary";

type HelpPopoverProps = {
  entry: WizardDictionaryEntry;
  label: WizardDictionaryEntry;
};

export function HelpPopover({ entry, label }: HelpPopoverProps) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const helpLabel = lang === "zh"
    ? `${wizardT(label, lang)}說明`
    : `${wizardT(label, lang)} help`;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={helpLabel}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((previous) => !previous)}
        className="focus-ring inline-flex h-6 w-6 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-xs font-bold text-teal-700 shadow-field hover:bg-teal-100"
      >
        ?
      </button>
      {open ? (
        <span
          id={panelId}
          role="tooltip"
          className="absolute left-0 top-8 z-20 w-72 rounded-md border border-warm-150 bg-white p-3 text-left text-sm font-normal leading-6 text-warm-700 shadow-card"
        >
          {wizardT(entry, lang)}
        </span>
      ) : null}
    </span>
  );
}
