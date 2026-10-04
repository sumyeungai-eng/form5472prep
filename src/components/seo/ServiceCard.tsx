import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServicePage, servicePath } from "@/lib/services-pages";

// One compact internal-link card from content pages (landing pages, blog
// posts) into the matching bottom-of-funnel /services/* page. The slug comes
// from src/lib/service-links.ts. Anchor text is the service page's H1, which
// is the descriptive, keyword-bearing label we want pointing at it.
export function ServiceCard({ serviceSlug, className = "" }: { serviceSlug: string | null; className?: string }) {
  const page = serviceSlug ? getServicePage(serviceSlug) : null;
  if (!page) return null;
  return (
    <aside
      aria-label="Related filing service"
      data-service-card={page.slug}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Need it handled for you?
      </p>
      <Link href={servicePath(page.slug)} className="group mt-2 block">
        <span className="block font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {page.h1}
        </span>
        <span className="mt-1.5 block text-sm leading-6 text-slate-600">{page.shortBlurb}</span>
        <span className="mt-3 inline-flex items-center text-sm font-semibold text-accent group-hover:underline">
          See how the service works
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </span>
      </Link>
    </aside>
  );
}
