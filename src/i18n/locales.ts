// Shared by portal, future email/wizard namespaces, and server actions. Keep pure.
export const LOCALES = ["en", "zh-Hans", "zh-Hant", "de", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English", "zh-Hans": "简体中文", "zh-Hant": "繁體中文",
  de: "Deutsch", fr: "Français", es: "Español",
};

export function normalizeLocale(input?: string | null): Locale {
  const value = typeof input === "string" ? input.trim().toLowerCase().replace(/_/g, "-") : "";
  if (value.startsWith("zh")) {
    return /^zh-(?:tw|hk|mo|hant)(?:-|$)/.test(value) || value.startsWith("zh-hant") ? "zh-Hant" : "zh-Hans";
  }
  for (const language of ["de", "fr", "es"] as const) {
    if (value === language || value.startsWith(`${language}-`)) return language;
  }
  return DEFAULT_LOCALE;
}

export function localeFromAcceptLanguage(h?: string | null): Locale {
  if (typeof h !== "string") return DEFAULT_LOCALE;
  const ranges = h.split(",").map((part, index) => {
    const [tag, ...parameters] = part.trim().split(";");
    const weight = parameters.find((p) => /^\s*q\s*=/i.test(p));
    const q = weight ? Number(weight.split("=")[1]?.trim()) : 1;
    return { tag: tag.trim(), q, index };
  }).filter(({ tag, q }) => /^(?:en|zh|de|fr|es)(?:-|$)/i.test(tag) && Number.isFinite(q) && q > 0 && q <= 1)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return ranges.length ? normalizeLocale(ranges[0].tag) : DEFAULT_LOCALE;
}

const COUNTRY_LOCALES: Record<string, Locale> = Object.create(null);
for (const [locale, countries] of Object.entries({
  "zh-Hans": ["China", "CN", "Singapore", "SG"],
  "zh-Hant": ["Hong Kong", "HK", "Taiwan", "TW", "Macau", "Macao", "MO"],
  de: ["Germany", "DE", "Austria", "AT", "Liechtenstein", "LI"],
  fr: ["France", "FR", "Belgium", "BE", "Luxembourg", "LU"],
  es: ["Spain", "ES", "Argentina", "AR", "Bolivia", "BO", "Chile", "CL", "Colombia", "CO",
    "Costa Rica", "CR", "Cuba", "CU", "Dominican Republic", "DO", "Ecuador", "EC", "El Salvador", "SV",
    "Guatemala", "GT", "Honduras", "HN", "Mexico", "MX", "Nicaragua", "NI", "Panama", "PA",
    "Paraguay", "PY", "Peru", "PE", "Puerto Rico", "PR", "Uruguay", "UY", "Venezuela", "VE"],
})) {
  for (const country of countries) COUNTRY_LOCALES[country.toLowerCase()] = locale as Locale;
}
export function localeFromCountry(c?: string | null): Locale {
  return typeof c === "string" ? COUNTRY_LOCALES[c.trim().toLowerCase()] ?? DEFAULT_LOCALE : DEFAULT_LOCALE;
}
