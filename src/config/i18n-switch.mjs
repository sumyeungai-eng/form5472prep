// One reversible switch shared by Next config and application code.
/** @type {boolean} */
export const I18N_ENABLED = false;

/**
 * Temporary redirects preserve every suffix, including paths without a translated page.
 * @param {boolean} [enabled]
 * @returns {Array<{source: string, destination: string, permanent: false}>}
 */
export function buildI18nRedirects(enabled = I18N_ENABLED) {
  if (enabled) return [];
  return ["/de", "/zh-hans"].flatMap(prefix => [
    { source: prefix, destination: "/", permanent: false },
    { source: `${prefix}/:path*`, destination: "/:path*", permanent: false },
  ]);
}
