import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { StartForm } from "./StartForm";
import { SITE_URL } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Start your filing",
  description:
    "Start your IRS Form 5472 and pro forma Form 1120 filing. Enter your email to begin — we'll save your progress and send a reminder if you don't finish.",
  alternates: {
    canonical: "/start",
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  robots: { index: false, follow: false },
};

export default async function StartPage() {
  const user = await getCurrentUser();

  // Signed-in visitors land here both from the header "Start filing" CTA
  // (may already have filings) and from the January/March renewal reminder
  // emails (`src/lib/reminders.ts`, linking to /start?utm_campaign=...
  // -reminder) — those are returning customers who intend to file another
  // year, so the signed-in card must lead with starting a new filing, not
  // steer them away from it. "Go to my filings" and any draft-in-progress
  // are offered as secondary options alongside it.
  let filingCount = 0;
  let draftId: string | null = null;
  if (user) {
    const [count, recentFilings] = await Promise.all([
      prisma.filing.count({ where: { userId: user.id } }),
      prisma.filing.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { id: true, llcName: true, status: true, taxYears: true, updatedAt: true },
      }),
    ]);
    filingCount = count;
    draftId = recentFilings.find((f) => f.status === "DRAFT")?.id ?? null;
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      {user && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Signed in as {user.email}
            {filingCount > 0 ? ` · ${filingCount} filing${filingCount === 1 ? "" : "s"} on file` : ""}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Start a filing for another tax year, or check on the filings you already have.
          </p>
          <div className="mt-5 space-y-3">
            <Link href="/filings/new" className="block">
              <Button size="lg" className="w-full">
                Start a new filing
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
              <Link href="/dashboard" className="text-accent hover:underline">
                Go to my filings
              </Link>
              {draftId && (
                <>
                  <span className="text-slate-300" aria-hidden="true">
                    &middot;
                  </span>
                  <Link href={`/filings/${draftId}/edit`} className="text-accent hover:underline">
                    Continue your draft
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {user && (
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3 text-center">
          Or start a filing for a different LLC
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Start your filing</h1>
        <p className="mt-2 text-sm text-slate-600">
          We&apos;ll save your progress as you go and email you a magic-link so you can pick up
          where you left off from any device.
        </p>
        {/* Suspense boundary required by useSearchParams inside StartForm. */}
        <Suspense fallback={<div className="mt-6 h-[380px]" aria-hidden />}>
          <StartForm />
        </Suspense>
        <p className="mt-6 text-xs text-slate-500 text-center">
          Already started a filing?{" "}
          <a className="text-accent hover:underline" href="/sign-in">
            Sign in
          </a>
          .
        </p>
      </div>
      <p className="mt-5 text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
        <svg className="h-3.5 w-3.5 text-emerald-500 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Every order is reviewed by a qualified tax accountant before submission to the IRS.
      </p>
    </div>
  );
}
