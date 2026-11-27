import { I18N_ENABLED } from "@/config/i18n-switch.mjs";
import { effectiveLocale } from "@/i18n/locales";

export const MARKETING_LOCALES = ["zh-Hans", "de"] as const;
export type MarketingLocale = typeof MARKETING_LOCALES[number];
export const MARKETING_PATH_PREFIX: Record<MarketingLocale, "/zh-hans" | "/de"> = { "zh-Hans": "/zh-hans", de: "/de" };
// All metadata, hreflang, sitemap and chrome indexing checks share this gate.
export const MARKETING_LOCALES_INDEXABLE = I18N_ENABLED;
export const LOCALIZED_MARKETING_PATHS = ["/", "/pricing", "/services", "/faq", "/form-5472-penalty-calculator"] as const;
export function localizedPath(locale: MarketingLocale | "en", path: string): string {
  locale = effectiveLocale(locale) as MarketingLocale | "en";
  if (locale === "en" || !LOCALIZED_MARKETING_PATHS.some(p => p === path)) return path;
  return MARKETING_PATH_PREFIX[locale] + (path === "/" ? "" : path);
}
