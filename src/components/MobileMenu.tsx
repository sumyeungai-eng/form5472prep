"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Secondary nav links that are inlined in the desktop header but hidden on
// mobile (`hidden sm:inline`). Without this menu they'd be unreachable from the
// header on phones — users would have to scroll to the footer to find EIN/ITIN/
// Guide/Pricing. This hamburger restores that access on small screens.
const LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/ein", label: "EIN" },
  { href: "/itin", label: "ITIN" },
  { href: "/blog", label: "Guide" },
];

export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes (e.g. after tapping a link).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center h-9 w-9 rounded-md text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop — tap anywhere outside the panel to close. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-40 cursor-default bg-slate-900/20"
          />
          <nav
            id="mobile-menu"
            className="absolute inset-x-0 top-16 z-50 border-b border-slate-200 bg-white shadow-lg"
          >
            <ul className="max-w-6xl mx-auto px-6 py-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-sm font-medium text-slate-700 hover:text-slate-900 border-b border-slate-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {!signedIn && (
                <li>
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="block py-3 text-sm font-medium text-slate-700 hover:text-slate-900"
                  >
                    Sign in
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
