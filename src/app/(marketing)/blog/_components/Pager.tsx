import Link from "next/link";
import { pageWindow } from "@/lib/blog-pagination";

const pagerLink =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-accent/40 hover:text-accent";

/**
 * Numbered pager shared by the blog index (/blog, /blog/page/n) and the topic
 * hubs (/blog/topics/<tag>, /blog/topics/<tag>/page/n). `pathFor` maps a
 * 1-based page number to its canonical URL. At most 5 numbers plus prev/next,
 * so the pager itself never adds many links.
 */
export function Pager({
  page,
  pages,
  pathFor,
  label = "Blog pages",
}: {
  page: number;
  pages: number;
  pathFor: (page: number) => string;
  label?: string;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label={label} className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={pathFor(page - 1)} rel="prev" className={pagerLink}>
          &larr; Newer guides
        </Link>
      )}
      {pageWindow(page, pages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden className="px-1 text-slate-400">
            &hellip;
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-ink px-3 text-sm font-semibold text-white"
          >
            {item}
          </span>
        ) : (
          <Link key={item} href={pathFor(item)} aria-label={`Page ${item}`} className={pagerLink}>
            {item}
          </Link>
        ),
      )}
      {page < pages && (
        <Link href={pathFor(page + 1)} rel="next" className={pagerLink}>
          Older guides &rarr;
        </Link>
      )}
    </nav>
  );
}
