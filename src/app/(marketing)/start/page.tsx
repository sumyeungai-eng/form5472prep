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
    </div>
  );
}
