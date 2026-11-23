import { createTranslator } from "next-intl";
import en from "./en.json";
import de from "./de.json";
import zh from "./zh-Hans.json";
import { deepMerge, type Messages } from "@/i18n/merge";
import type { MarketingLocale } from "./config";
const catalogs = { en, de, "zh-Hans": zh };
export function getMarketingMessages(locale: MarketingLocale | "en") {
  const messages = deepMerge(en, catalogs[locale] ?? en);
  if (locale === "en") return messages as typeof en;
  let failed = false;
  const validate = createTranslator({
    locale, messages, timeZone: "UTC", now: new Date(0),
    onError: () => { failed = true; },
  });
  // Validate ICU before passing messages into client useTranslations too.
  // Placeholder values are only probes; the page supplies the actual facts.
  function recover(base: Messages, target: Messages, prefix = "") {
    for (const [key, value] of Object.entries(base)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value !== "string") {
        recover(value, target[key] as Messages, path);
        continue;
      }
      const values: Record<string, number | ((chunks: React.ReactNode) => React.ReactNode)> = {};
      for (const match of Array.from(value.matchAll(/\{(\w+)(?:\}|,)/g))) values[match[1]] = 1;
      for (const match of Array.from(value.matchAll(/<([A-Za-z][\w-]*)>/g))) values[match[1]] = chunks => chunks;
      failed = false;
      validate.rich(path, values);
      if (failed) target[key] = value;
    }
  }
  recover(en, messages);
  return messages as typeof en;
}
export function getMarketingTranslator(locale: MarketingLocale | "en") {
  const messages: Messages = getMarketingMessages(locale);
  let failed = false;
  const translated = createTranslator({ locale, messages, onError: () => { failed = true; } });
  const english = createTranslator({ locale: "en", messages: en, onError: () => {} });
  // Recover malformed ICU as well as missing translations. Keep the same
  // translator API, including rich text, without a request-scoped provider.
  return new Proxy(translated, {
    apply(target, thisArg, args) {
      failed = false;
      const result = Reflect.apply(target, thisArg, args);
      return failed ? Reflect.apply(english, thisArg, args) : result;
    },
    get(target, property) {
      const method = Reflect.get(target, property);
      const fallback = Reflect.get(english, property);
      if (typeof method !== "function" || typeof fallback !== "function") return method;
      return (...args: unknown[]) => {
        failed = false;
        const result = Reflect.apply(method, target, args);
        return failed ? Reflect.apply(fallback, english, args) : result;
      };
    },
  });
}
export type MarketingTranslator = ReturnType<typeof getMarketingTranslator>;
