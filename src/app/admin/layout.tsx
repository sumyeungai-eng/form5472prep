import Link from "next/link";
import { isAdmin } from "@/lib/admin/auth";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

// Per-page auth: each admin page calls requireAdmin() from src/lib/admin/guard.ts.
// The layout only renders the chrome (and hides nav when logged out).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
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
                <Link href="/admin/posts" className="hover:text-slate-900">Posts</Link>
                <Link href="/admin/posts/new" className="hover:text-slate-900">New post</Link>
              </nav>
            )}
          </div>
          {authed && <SignOutButton />}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
