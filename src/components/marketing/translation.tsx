import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import type { MarketingTranslator } from "@/i18n/marketing";
import { localizedPath, marketingLanguageAlternates, MARKETING_LOCALES_INDEXABLE, type MarketingLocale } from "@/i18n/marketing/config";
import { messageFacts } from "@/i18n/marketing/facts";
import { ORG_REF, SITE_URL } from "@/lib/seo";

export function catalogText(locale: string, t: MarketingTranslator, key: string, english: string): string {
  if (locale === "en" || !t.has(key)) return english;
  return t(key, messageFacts(english).values);
}

export function translateData<T>(locale: string, t: MarketingTranslator, key: string, value: T): T {
  if (locale === "en") return value;
  if (typeof value === "string") return catalogText(locale, t, key, value) as T;
  if (Array.isArray(value)) return value.map((item, i) => translateData(locale, t, `${key}.${i}`, item)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, translateData(locale, t, `${key}.${field}`, item)])) as T;
  return value;
}

export function localizedMetadata(locale: "en" | MarketingLocale, path: string, metadata: Metadata): Metadata {
  const languages = marketingLanguageAlternates(path);
  if (locale === "en") return languages ? { ...metadata, alternates: { ...metadata.alternates, languages } } : metadata;
  const canonical = SITE_URL + localizedPath(locale, path);
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical, ...(languages ? { languages } : {}) },
    ...(MARKETING_LOCALES_INDEXABLE ? { robots: undefined } : { robots: { index: false, follow: true } }),
    openGraph: { ...metadata.openGraph, url: canonical, locale: locale === "de" ? "de_DE" : "zh_CN" },
  };
}

export function LocalizedJsonLd({ locale, path, data }: { locale: "en" | MarketingLocale; path: string; data: object }) {
  if (locale === "en") return <JsonLd data={data} />;
  function localize(value: unknown): unknown {
    if (typeof value === "string" && value.startsWith(SITE_URL)) {
      const url = new URL(value);
      // Organization and its logo retain their canonical shared identity.
      if (url.hash === "#organization" || url.hash === "#logo") return value;
      return SITE_URL + localizedPath(locale, url.pathname) + url.search + url.hash;
    }
    if (Array.isArray(value)) return value.map(localize);
    if (value && typeof value === "object") {
      const node = value as Record<string, unknown>;
      if (node["@type"] === "Organization") return ORG_REF;
      const result = Object.fromEntries(Object.entries(node).map(([key, item]) => [key, localize(item)]));
      if (["WebApplication", "WebPage", "WebSite", "FAQPage", "CollectionPage", "HowTo", "Service", "Product"].includes(String(node["@type"]))) result.inLanguage = locale;
      return result;
    }
    return value;
  }
  void path;
  return <JsonLd data={localize(data) as object} />;
}
