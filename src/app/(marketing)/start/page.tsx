import type { Metadata } from "next";
import { StartForm } from "./StartForm";

export const metadata: Metadata = {
  title: "Start your filing",
  description:
    "Start your IRS Form 5472 and pro forma Form 1120 filing. Enter your email to begin — we'll save your progress and send a reminder if you don't finish.",
  alternates: { canonical: "/start" },
  robots: { index: false, follow: false },
};

export default function StartPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white border border-slate-200 rounded-xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Start your filing</h1>
        <p className="mt-2 text-sm text-slate-600">
          We&apos;ll save your progress as you go and email you a magic-link so you can pick up
          where you left off from any device.
        </p>
        <StartForm />
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
