import { createTranslator } from "next-intl";
import en from "../../messages/en/email.json";
import hans from "../../messages/zh-Hans/email.json";
import hant from "../../messages/zh-Hant/email.json";
import de from "../../messages/de/email.json";
import fr from "../../messages/fr/email.json";
import es from "../../messages/es/email.json";
import { LOCALES, type Locale } from "./locales";
import { deepMerge, type Messages } from "./merge";

export type EmailTranslator = (key: string, values?: Record<string, string | number | Date>) => string;
const catalogs = { en, "zh-Hans": hans, "zh-Hant": hant, de, fr, es };

// User.locale is a catalog identifier, not an Accept-Language header.
export function emailLocale(locale?: string | null): Locale {
  return LOCALES.includes(locale as Locale) ? locale as Locale : "en";
}

// Independent of the formatter: even a formatter initialization failure must
// leave the original English send path available. English uses simple values.
export const englishEmailTranslator: EmailTranslator = (key, values = {}) => {
  let message: string | Messages | undefined = en;
  for (const part of key.split(".")) message = typeof message === "object" ? message[part] : undefined;
  if (typeof message !== "string") return key;
  return message.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));
};

export function getEmailTranslator(locale?: string | null): EmailTranslator {
  const chosen = emailLocale(locale);
  try {
    let failed = false;
    const t = createTranslator({
      locale: chosen,
      messages: { email: deepMerge(en, catalogs[chosen]) },
      namespace: "email",
      onError(error) { failed = true; console.warn("[email i18n]", error); },
    });
    return (key, values) => {
      failed = false;
      try {
        const result = t(key, values);
        return failed ? englishEmailTranslator(key, values) : result;
      } catch (error) {
        console.warn("[email i18n] English fallback", error);
        return englishEmailTranslator(key, values);
      }
    };
  } catch (error) {
    console.warn("[email i18n] Could not load translations; using English", error);
    return englishEmailTranslator;
  }
}
