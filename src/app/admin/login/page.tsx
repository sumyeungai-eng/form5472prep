import { redirect } from "next/navigation";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { LoginForm } from "./LoginForm";
import { MagicLinkForm } from "./MagicLinkForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (await getAdminPrincipal()) redirect("/admin/filings");

  const error =
    searchParams.error === "invalid_link"
      ? "That sign-in link is invalid or has expired. Enter your email below to get a fresh one, or use the password below."
      : null;

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-xl font-semibold text-center">Admin sign in</h1>
      <p className="text-sm text-slate-500 text-center mt-2">
        Manage filings, customer orders, and blog content.
      </p>
      {error && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}
      <LoginForm />
      <h2 className="mt-8 text-sm font-medium text-center text-slate-700">
        Or email me a sign-in link
      </h2>
      <MagicLinkForm />
    </div>
  );
}
