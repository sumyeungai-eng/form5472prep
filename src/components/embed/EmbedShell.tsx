import type { ReactNode } from "react";

// Chrome shared by the /embed/* routes: compact heading, the tool, and a
// dofollow "Powered by" attribution. The link is absolute and opens in a new
// tab so a click leaves the host page for ours rather than navigating the frame.
export function EmbedShell({
  heading,
  poweredByHref,
  poweredByLabel,
  children,
}: {
  heading: string;
  poweredByHref: string;
  poweredByLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-[640px] bg-white px-3 pb-3 pt-4 text-slate-900">
      <h1 className="font-serif text-xl font-semibold tracking-tight text-ink">{heading}</h1>
      <div className="mt-1">{children}</div>
      <p className="mt-3 border-t border-slate-100 pt-3 text-center text-xs text-slate-500">
        Powered by{" "}
        <a
          href={poweredByHref}
          target="_blank"
          rel="noopener"
          className="font-medium text-accent underline underline-offset-2 hover:no-underline"
        >
          {poweredByLabel}
        </a>
      </p>
    </main>
  );
}
