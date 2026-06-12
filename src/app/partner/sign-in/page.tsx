import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partner/auth";
import { PartnerSignInForm } from "./PartnerSignInForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Partner sign in",
  robots: { index: false, follow: false },
};

export default async function PartnerSignInPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // Already signed in → straight to the dashboard.
  const partner = await getCurrentPartner();
  if (partner) redirect("/partner");

  const error =
    searchParams.error === "expired"
      ? "That link has expired. Enter your email to get a fresh one."
      : searchParams.error === "inactive"
        ? "That partner account isn't active. Contact support@form5472prep.com."
        : null;

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Partner sign in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage Form 5472 filings for all your clients in one place. Enter your partner email and
        we&apos;ll send you a secure sign-in link.
      </p>
      {error && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}
      <PartnerSignInForm />
      <p className="mt-6 text-xs text-slate-500">
        Want to become a partner?{" "}
        <a href="mailto:support@form5472prep.com" className="text-accent hover:underline">
          Email us
        </a>{" "}
        — partner accounts are set up by our team.
      </p>
    </div>
  );
}
