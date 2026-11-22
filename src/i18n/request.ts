import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { localeFromAcceptLanguage, normalizeLocale } from "./locales";

// Add future email/wizard namespaces here; no portal components need to change.
export const MESSAGE_NAMESPACES = ["common", "domain", "portal"] as const;
type Messages = { [key: string]: string | Messages };

export function deepMerge(english: Messages, translated: Messages): Messages {
  const merged: Messages = { ...english };
  for (const key of Object.keys(english)) {
    const base = english[key];
    const value = translated[key];
    if (typeof base === "string") merged[key] = typeof value === "string" ? value : base;
    else merged[key] = deepMerge(base, value && typeof value === "object" ? value : {});
  }
  return merged;
}

export default getRequestConfig(async () => {
  const cookie = cookies().get("NEXT_LOCALE");
  const locale = cookie ? normalizeLocale(cookie.value) : localeFromAcceptLanguage(headers().get("accept-language"));
  const english: Messages = {};
  const messages: Messages = {};
  await Promise.all(MESSAGE_NAMESPACES.map(async (namespace) => {
    const base = (await import(`../../messages/en/${namespace}.json`)).default as Messages;
    english[namespace] = base;
    let translated: Messages = {};
    if (locale !== "en") {
      try { translated = (await import(`../../messages/${locale}/${namespace}.json`)).default as Messages; }
      catch (error) { console.warn("[i18n] Could not load translations", locale, namespace, error); }
    }
    messages[namespace] = deepMerge(base, translated);
  }));
  return {
    locale,
    messages,
    // Explicit zone keeps date rendering consistent between server and browser.
    timeZone: "UTC",
    onError(error: unknown) { console.warn("[i18n]", error); },
    getMessageFallback({ namespace, key }: { namespace?: string; key: string }) {
      const path = [namespace, key].filter(Boolean).join(".");
      let value: string | Messages | undefined = english;
      for (const part of path.split(".")) value = value && typeof value === "object" ? value[part] : undefined;
      return typeof value === "string" ? value : key;
    },
  };
});
