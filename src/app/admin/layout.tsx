import Link from "next/link";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { AdminShell } from "./_components/AdminShell";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

// Per-page auth: each admin page calls isAdmin() from src/lib/admin/auth.ts.
// The layout only renders the chrome (and hides nav when logged out).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await getAdminPrincipal();

  if (principal === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/admin" className="font-semibold tracking-tight text-sm">
              Form5472 Prep / admin
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  const principalLabel = principal.via === "legacy-password"
    ? "shared password session"
    : principal.email ?? "admin session";

  return (
    <AdminShell principalLabel={principalLabel}>
      {children}
    </AdminShell>
  );
}
