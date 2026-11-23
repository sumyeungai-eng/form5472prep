export const MARKETING_LOCALES = ["zh-Hans", "de"] as const;
export type MarketingLocale = typeof MARKETING_LOCALES[number];
export const MARKETING_PATH_PREFIX: Record<MarketingLocale, "/zh-hans" | "/de"> = { "zh-Hans": "/zh-hans", de: "/de" };
export const MARKETING_LOCALES_INDEXABLE = true;
export const LOCALIZED_MARKETING_PATHS = ["/", "/pricing", "/services", "/faq", "/form-5472-penalty-calculator"] as const;
export function localizedPath(locale: MarketingLocale | "en", path: string): string {
  if (locale === "en" || !LOCALIZED_MARKETING_PATHS.some(p => p === path)) return path;
  return MARKETING_PATH_PREFIX[locale] + (path === "/" ? "" : path);
}
