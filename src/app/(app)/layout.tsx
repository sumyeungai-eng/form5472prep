import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutLink } from "./SignOutLink";
import { getCurrentUser } from "@/lib/session";
import { headers } from "next/headers";
import { isPortalHost } from "@/lib/partner/portalHost";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Partner portal domain: no Form5472 header; filings/[id]/layout.tsx shows
  // the partner's name instead.
  if (isPortalHost(headers().get("host"))) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Form5472 Prep home">
            <Logo />
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {user && <span className="hidden sm:inline">{user.email}</span>}
            {user && <SignOutLink />}
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
