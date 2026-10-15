// Pagination for the blog index. /blog is page 1; older posts live at
// /blog/page/2, /blog/page/3, ... Each page is statically generated and
// self-canonical, and every published post appears on exactly one page.
//
// Why: the single-page index linked every post (~250 anchors with the site
// chrome) and Moz's Page Optimization grader failed
// avoid_excessive_internal_links on it (crawl 2026-10-11). 24 posts per page
// keeps each page at roughly 100 anchors including header/footer.

export const POSTS_PER_PAGE = 24;

/** Number of index pages for `count` posts (always at least 1). */
export function totalPages(count: number, perPage = POSTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(count / perPage));
}

/** The posts shown on 1-based `page`. Out-of-range pages return []. */
export function pageSlice<T>(items: readonly T[], page: number, perPage = POSTS_PER_PAGE): T[] {
  if (!Number.isInteger(page) || page < 1) return [];
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

/** Canonical path for a page: 1 -> /blog, n -> /blog/page/n. */
export function blogPagePath(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

/**
 * Parse the `[n]` route segment. Only canonical decimal strings >= 2 are
 * accepted ("2", not "02", "2.0", "+2" or "1"), so every page has exactly one
 * URL. Page 1 is /blog itself and is deliberately not accepted here.
 */
export function parsePageParam(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= 2 ? n : null;
}

/**
 * Compact page list for the pager: first, last, and the current page with one
 * neighbour on each side; "gap" marks an elided run. At most 5 numbers, so the
 * pager stays small however many pages exist.
 */
export function pageWindow(current: number, total: number): Array<number | "gap"> {
  const keep = new Set<number>([1, total, current - 1, current, current + 1]);
  const pages = Array.from(keep)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/** "Guides 25-48 of 190" range for page `page` (1-based). */
export function pageRange(
  page: number,
  count: number,
  perPage = POSTS_PER_PAGE,
): { from: number; to: number } {
  const from = (page - 1) * perPage + 1;
  return { from, to: Math.min(count, page * perPage) };
}
