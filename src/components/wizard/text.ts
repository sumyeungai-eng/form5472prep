import { createTranslator } from "next-intl";
import english from "../../../messages/en/wizard.json";
import { deepMerge, type Messages } from "@/i18n/merge";
import { normalizeLocale } from "@/i18n/locales";

type Values = Record<string, string | number | Date>;
function flatten(messages: Messages, prefix = ""): Record<string, string> {
  return Object.fromEntries(Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [[path, value]] : Object.entries(flatten(value, path));
  }));
}
const base = flatten(english);
const keys = new Map(Object.entries(base).map(([key, value]) => [value, key]));
const englishTranslate = createTranslator({ locale: "en", messages: english, timeZone: "UTC", onError() {} });
function restoreEmpty(base: Messages, merged: Messages) {
  for (const key of Object.keys(base)) {
    const value = merged[key];
    if (typeof value === "string") {
      if (!value.trim()) merged[key] = base[key];
    } else restoreEmpty(base[key] as Messages, value);
  }
}
// These sentences are built in English for the existing staff-message payload.
// Localize only their display, retaining the original sentence for submission.
const displayPatterns = Object.entries(base).filter(([, value]) =>
  /\{v\d+\}/.test(value) && /[a-z]{2}/i.test(value.replace(/\{v\d+\}/g, "")),
).map(([key, value]) => ({
  key,
  names: Array.from(value.matchAll(/\{(\w+)\}/g), (match) => match[1]),
  pattern: new RegExp("^" + value.split(/\{\w+\}/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.*?)") + "$"),
}));
function interpolate(source: string, values?: Values): string {
  return source.replace(/\{(\w+)\}/g, (token, key) => values?.[key] === undefined ? token : String(values[key]));
}

/** Display copy only. Never call this on input values or data being saved. */
export function createWizardText(messages?: Messages, locale?: string) {
  const merged = deepMerge(english, messages ?? {});
  restoreEmpty(english, merged);
  let failed = false;
  const translate = createTranslator({
    locale: normalizeLocale(locale), messages: merged, timeZone: "UTC",
    onError() { failed = true; },
    getMessageFallback({ key }) { return base[key] ?? key; },
  });
  function w(source: string, values?: Values): string {
    let key = keys.get(source);
    let args = values;
    const late = !key && !values ? source.match(/^We'll confirm your extension status for (.+?) by email before anything is filed\. The earlier year(s?) (.+?) (?:are|is) being filed after (?:their due dates|its due date), so a reasonable-cause statement is included for (?:them|it)\.$/) : null;
    if (late) {
      key = "years.weLlConfirmYourExtensionStatusFor";
      args = { latestYear: late[1], count: late[2] ? 2 : 1, years: late[3] };
    }
    if (!key && !values) {
      for (const item of displayPatterns) {
        const match = source.match(item.pattern);
        if (!match) continue;
        key = item.key;
        args = Object.fromEntries(item.names.map((name, i) => {
          const value = match[i + 1];
          // These four warnings wrap another generated warning. All other
          // interpolated values (including customer text) stay untouched.
          return [name, /\.(moneyInIssue|moneyOutIssue|ownerLoanIssue|llcLoanIssue)$/.test(item.key) ? w(value) : value];
        }));
        break;
      }
    }
    if (!key) return interpolate(source, values);
    const fallback = () => {
      if (!values) return source;
      try { return englishTranslate(key, values); }
      catch { return interpolate(source, values); }
    };
    try {
      failed = false;
      const result = translate(key, args);
      return failed ? fallback() : result;
    } catch {
      return fallback();
    }
  }
  return w;
}
