import Link from "next/link";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

// Per-page auth: each admin page calls requireAdmin() from src/lib/admin/guard.ts.
// The layout only renders the chrome (and hides nav when logged out).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await getAdminPrincipal();
  const authed = principal !== null;
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold tracking-tight text-sm">
              Form5472 Prep / admin
            </Link>
            {authed && (
              <nav className="flex items-center gap-4 text-sm text-slate-600">
                <Link href="/admin/filings" className="hover:text-slate-900">Filings</Link>
                <Link href="/admin/applications" className="hover:text-slate-900">Applications</Link>
                <Link href="/admin/partners" className="hover:text-slate-900">Partners</Link>
                <Link href="/admin/sources" className="hover:text-slate-900">Sources</Link>
                <Link href="/admin/reminders" className="hover:text-slate-900">Reminders</Link>
                <Link href="/admin/posts" className="hover:text-slate-900">Posts</Link>
                <Link href="/admin/test-order" className="hover:text-slate-900 text-amber-700">Test order</Link>
              </nav>
            )}
          </div>
          {principal && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {principal.via === "legacy-password"
                  ? "shared password session"
                  : principal.email}
              </span>
              <SignOutButton />
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
