import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Form5472 Prep home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/#pricing"
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              Pricing
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">My filings</Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/start">
                  <Button size="sm">Start filing</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 py-10 text-xs text-slate-500 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-4 gap-8">
          <div className="sm:col-span-2 space-y-2">
            <p>
              Form5472 Prep is a form preparation and filing courier service. We are not a CPA
              firm and do not provide tax advice. You are responsible for the accuracy of
              information you submit.
            </p>
            <p>&copy; {new Date().getFullYear()} Form5472 Prep</p>
          </div>
          <nav className="space-y-2">
            <p className="font-medium text-slate-700">Learn</p>
            <ul className="space-y-1">
              <li><Link href="/blog" className="hover:text-slate-900">Blog</Link></li>
            </ul>
          </nav>
          <nav className="space-y-2">
            <p className="font-medium text-slate-700">Legal</p>
            <ul className="space-y-1">
              <li><Link href="/terms" className="hover:text-slate-900">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link></li>
              <li><Link href="/data-retention" className="hover:text-slate-900">Data Retention</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
