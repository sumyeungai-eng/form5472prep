import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Form5472 Prep to view your filing status, download generated PDFs, and check fax delivery.",
  alternates: { canonical: "/sign-in" },
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const errorMessage =
    searchParams.error === "expired"
      ? "That magic link is invalid or has expired. Enter your email and we'll send a fresh one."
      : searchParams.error === "not_found"
      ? "We couldn't find that account. Enter your email to start over."
      : null;
  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white border border-slate-200 rounded-xl p-8">
        <h1 className="text-xl font-semibold text-slate-900">Check your filing status</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the email you used when starting your filing. We&apos;ll send you a one-click
          link to view status, download PDFs, and track the IRS fax.
        </p>
        {errorMessage && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        )}
        <SignInForm />
        <p className="mt-6 text-xs text-slate-500 text-center">
          No password — we email a one-time link each time.{" "}
          <br />
          Don&apos;t have a filing yet?{" "}
          <a className="text-accent hover:underline" href="/start">
            Start one
          </a>
          .
        </p>
      </div>
    </div>
  );
}
