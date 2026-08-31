"use client";

import { useId, type ReactNode } from "react";
import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  wizardDictionary,
  wizardT,
  type WizardDictionaryEntry,
  type WizardDictionaryTree,
} from "@/lib/wizard/wizardDictionary";
import { HelpPopover } from "./HelpPopover";

type BaseFieldProps<T extends FieldValues> = {
  name: Path<T>;
  register: UseFormRegister<T>;
  label: WizardDictionaryEntry;
  help: WizardDictionaryEntry;
  error?: FieldError;
  hint?: ReactNode;
  className?: string;
};

type NumberFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  min?: number;
  max?: number;
  step?: number | string;
  optional?: boolean;
};

type TextFieldProps<T extends FieldValues> = BaseFieldProps<T>;

type CheckboxFieldProps<T extends FieldValues> = BaseFieldProps<T>;

type RadioOption = {
  value: string;
  label: WizardDictionaryEntry;
};

type RadioGroupFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  options: RadioOption[];
  setValueAs?: (value: string) => unknown;
};

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  options: SelectOption[];
  parseNumber?: boolean;
};

export function NumberField<T extends FieldValues>({
  className = "",
  error,
  help,
  hint,
  label,
  max,
  min = 0,
  name,
  optional = false,
  register,
  step = 1,
}: NumberFieldProps<T>) {
  const { lang } = useI18n();
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} help={help} />
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="form-input mt-2 w-full"
        {...register(name, {
          setValueAs: (value) => {
            if (value === "" && optional) {
              return undefined;
            }
            if (value === "") {
              return Number.NaN;
            }
            return Number(value);
          },
        })}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-warm-600">
          {hint}
        </p>
      ) : null}
      <FieldErrorText id={`${id}-error`} error={error} lang={lang} />
    </div>
  );
}

export function TextField<T extends FieldValues>({
  className = "",
  error,
  help,
  hint,
  label,
  name,
  register,
}: TextFieldProps<T>) {
  const { lang } = useI18n();
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} help={help} />
      <input
        id={id}
        type="text"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="form-input mt-2 w-full"
        {...register(name)}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-warm-600">
          {hint}
        </p>
      ) : null}
      <FieldErrorText id={`${id}-error`} error={error} lang={lang} />
    </div>
  );
}

export function CheckboxField<T extends FieldValues>({
  className = "",
  error,
  help,
  hint,
  label,
  name,
  register,
}: CheckboxFieldProps<T>) {
  const { lang } = useI18n();
  const id = useId();

  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          className="focus-ring mt-1 h-4 w-4 rounded border-warm-300 text-teal-700"
          {...register(name)}
        />
        <div className="min-w-0 flex-1">
          <FieldLabel htmlFor={id} label={label} help={help} compact />
          {hint ? <p className="mt-1 text-xs text-warm-600">{hint}</p> : null}
          <FieldErrorText id={`${id}-error`} error={error} lang={lang} />
        </div>
      </div>
    </div>
  );
}

export function RadioGroupField<T extends FieldValues>({
  className = "",
  error,
  help,
  hint,
  label,
  name,
  options,
  register,
  setValueAs,
}: RadioGroupFieldProps<T>) {
  const { lang } = useI18n();
  const id = useId();

  return (
    <fieldset className={className} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="flex items-center gap-2 text-sm font-semibold text-navy-900">
        <span>{wizardT(label, lang)}</span>
        <HelpPopover entry={help} />
      </legend>
      {hint ? <p className="mt-1 text-xs text-warm-600">{hint}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className="focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-warm-200 bg-white px-3 py-2 text-sm font-medium text-navy-900 hover:border-teal-400"
            >
              <input
                id={optionId}
                type="radio"
                value={option.value}
                className="h-4 w-4 text-teal-700"
                {...register(name, setValueAs ? { setValueAs } : undefined)}
              />
              <span>{wizardT(option.label, lang)}</span>
            </label>
          );
        })}
      </div>
      <FieldErrorText id={`${id}-error`} error={error} lang={lang} />
    </fieldset>
  );
}

export function SelectField<T extends FieldValues>({
  className = "",
  error,
  help,
  hint,
  label,
  name,
  options,
  parseNumber = false,
  register,
}: SelectFieldProps<T>) {
  const { lang } = useI18n();
  const id = useId();

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} help={help} />
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className="form-select mt-2 w-full"
        {...register(name, {
          setValueAs: (value) => (parseNumber ? Number(value) : value),
        })}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="mt-1 text-xs text-warm-600">{hint}</p> : null}
      <FieldErrorText id={`${id}-error`} error={error} lang={lang} />
    </div>
  );
}

export function FieldErrorText({
  error,
  id,
  lang,
}: {
  error?: FieldError;
  id: string;
  lang: "zh" | "en";
}) {
  const message = errorMessage(error?.message, lang);

  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-1 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export function getFieldError<T extends FieldValues>(
  errors: FieldErrors<T>,
  path: string,
): FieldError | undefined {
  let current: unknown = errors;

  for (const segment of path.split(".")) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  if (current && typeof current === "object" && "message" in current) {
    return current as FieldError;
  }

  return undefined;
}

export function formatHKD(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "HKD",
  }).format(value);
}

function FieldLabel({
  compact = false,
  help,
  htmlFor,
  label,
}: {
  compact?: boolean;
  help: WizardDictionaryEntry;
  htmlFor: string;
  label: WizardDictionaryEntry;
}) {
  const { lang } = useI18n();

  return (
    <label
      htmlFor={htmlFor}
      className={`flex items-center gap-2 ${compact ? "text-sm" : "text-sm"} font-semibold text-navy-900`}
    >
      <span>{wizardT(label, lang)}</span>
      <HelpPopover entry={help} />
    </label>
  );
}

function errorMessage(message: unknown, lang: "zh" | "en"): string | undefined {
  if (typeof message !== "string") {
    return undefined;
  }

  const entry = lookupDictionaryEntry(message);
  return entry ? wizardT(entry, lang) : message;
}

function lookupDictionaryEntry(path: string): WizardDictionaryEntry | undefined {
  const segments = path.split(".");
  let current: WizardDictionaryEntry | WizardDictionaryTree = wizardDictionary;

  for (const segment of segments) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return undefined;
    }

    current = (current as WizardDictionaryTree)[segment];
  }

  if (
    current
    && typeof current === "object"
    && "zh" in current
    && "en" in current
    && typeof current.zh === "string"
    && typeof current.en === "string"
  ) {
    return current as WizardDictionaryEntry;
  }

  return undefined;
}
