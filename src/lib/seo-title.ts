// Title/description length guards for <title> and <meta name="description">.
//
// The root layout's title template appends " · Form5472 Prep" (16 chars) to
// every string title, which pushed ~130 blog titles past Google's ~60-char
// display limit (crawl 2026-10-01). Pages whose title may be long must use
// `seoTitle()` instead of a plain string: it returns an `{ absolute }` title
// that carries the brand only when the whole thing still fits in 60 chars, and
// never adds the brand twice. Keep the primary keyword at the START of the
// title you pass in — the brand is the part that gets dropped, never the topic.
import type { Metadata } from "next";

export const TITLE_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 160;
export const BRAND_NAME = "Form5472 Prep";
export const BRAND_TITLE_SUFFIX = ` · ${BRAND_NAME}`;

/** Final <title> text: `title · Form5472 Prep` when that fits in 60 chars, else `title`. */
export function fitTitle(title: string): string {
  const base = title.trim();
  if (base.includes(BRAND_NAME)) return base;
  const branded = `${base}${BRAND_TITLE_SUFFIX}`;
  return branded.length <= TITLE_MAX_LENGTH ? branded : base;
}

/** Metadata `title` that bypasses the root template (see fitTitle). */
export function seoTitle(title: string): NonNullable<Metadata["title"]> {
  return { absolute: fitTitle(title) };
}
