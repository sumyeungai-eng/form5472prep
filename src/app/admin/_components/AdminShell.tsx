"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SignOutButton } from "../SignOutButton";
import { AdminNav } from "./AdminNav";

type Props = {
  principalLabel: string;
  children: React.ReactNode;
};

function SidebarContent({ principalLabel, onNavigate }: { principalLabel: string; onNavigate?: () => void }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="h-14 px-5 flex items-center border-b border-slate-200">
        <Link href="/admin" onClick={onNavigate} className="font-semibold tracking-tight text-sm text-slate-900">
          Form5472 Prep / admin
        </Link>
      </div>
      <div className="flex-1">
        <Suspense fallback={null}>
          <AdminNav onNavigate={onNavigate} />
        </Suspense>
      </div>
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-sm text-slate-600">{principalLabel}</span>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ principalLabel, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const placeSignatureMatch = pathname.match(/^\/admin\/filings\/([^/]+)\/place-signature(\/|$)/);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (placeSignatureMatch) {
    const filingId = placeSignatureMatch[1];

    return (
      <div className="min-h-screen bg-white">
        <header className="h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link href={`/admin/filings/${filingId}`} className="text-sm text-slate-600 hover:text-slate-900">
              &larr; Back to filing
            </Link>
            <div className="text-sm font-medium text-slate-900">Place signature</div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="max-w-[40vw] truncate text-sm text-slate-600">{principalLabel}</span>
            <SignOutButton />
          </div>
        </header>
        <main className="w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden w-60 border-r border-slate-200 bg-white lg:block sticky top-0 h-screen overflow-y-auto">
        <SidebarContent principalLabel={principalLabel} />
      </aside>

      <div className="min-w-0">
        <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between lg:hidden">
          <Link href="/admin" className="font-semibold tracking-tight text-sm text-slate-900">
            Form5472 Prep / admin
          </Link>
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </header>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setOpen(false)}
            />
            <div className="relative h-full w-72 max-w-[calc(100vw-2rem)] bg-white shadow-xl">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-2.5 inline-flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
              <SidebarContent principalLabel={principalLabel} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="min-h-screen bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
