import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/MobileMenu";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";

// No `force-dynamic` and no cookie reads here: the auth-dependent header bits are
// client islands (MobileMenu + HeaderAuthButtons) that poll /api/me after paint,
// so the whole marketing shell can be statically generated and edge-cached.

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Form5472 Prep home">
            <Logo mark className="h-9 w-9 min-[430px]:hidden" />
            <Logo className="hidden min-[430px]:block" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <MobileMenu />
            <Link
              href="/pricing"
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              Pricing
            </Link>
            <Link
              href="/ein"
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              EIN
            </Link>
            <Link
              href="/itin"
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              ITIN
            </Link>
            <Link
              href="/blog"
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              Guide
            </Link>
            <Link
              href="/contact"
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              Contact
            </Link>
            <HeaderAuthButtons />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-paper-edge bg-paper text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            <div className="sm:col-span-2 space-y-4">
              <Logo />
              <p className="max-w-sm leading-relaxed">
                Done-for-you Form 5472 + pro forma 1120 filing for foreign-owned US LLCs.
                Every filing is reviewed by a qualified accountant before it is submitted.
                We prepare and submit the forms from the information you give us; we do not
                provide personalised tax planning. You are responsible for the accuracy of what
                you submit.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                Filed to the IRS Ogden PIN Unit · +1-855-887-7737
              </p>
              <p>
                Questions?{" "}
                <a href="mailto:support@form5472prep.com" className="text-accent hover:underline">
                  support@form5472prep.com
                </a>
              </p>
              <p>
                <a
                  href="https://www.trustpilot.com/review/form5472prep.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-ink"
                >
                  <span aria-hidden className="text-[#00b67a]">★</span> See our reviews on Trustpilot
                </a>
              </p>
            </div>
            <nav className="space-y-2.5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink">Services</p>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="hover:text-ink">Form 5472 Filing</Link></li>
                <li><Link href="/ein" className="hover:text-ink">EIN Acquisition</Link></li>
                <li><Link href="/itin" className="hover:text-ink">ITIN Acquisition</Link></li>
                <li><Link href="/partners" className="hover:text-ink">Become a Partner</Link></li>
                <li><Link href="/partner/sign-in" className="hover:text-ink">Partner sign in</Link></li>
                <li><Link href="/blog" className="hover:text-ink">Guides</Link></li>
                <li><Link href="/faq" className="hover:text-ink">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
                <li><Link href="/about" className="hover:text-ink">About</Link></li>
              </ul>
            </nav>
            <nav className="space-y-2.5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink">Free tools</p>
              <ul className="space-y-2">
                <li><Link href="/do-i-need-to-file-form-5472" className="hover:text-ink">Do I need to file?</Link></li>
                <li><Link href="/form-5472-deadline-calculator" className="hover:text-ink">Deadline calculator</Link></li>
                <li><Link href="/form-5472-penalty-calculator" className="hover:text-ink">Penalty calculator</Link></li>
                <li><Link href="/irs-yearly-average-exchange-rates" className="hover:text-ink">IRS exchange rates</Link></li>
                <li><Link href="/form-5472-reportable-transactions-checker" className="hover:text-ink">Reportable transactions</Link></li>
                <li><Link href="/form-5472-late-filing-checker" className="hover:text-ink">Late-filing checker</Link></li>
                <li><Link href="/foreign-owned-llc-compliance-calendar" className="hover:text-ink">Compliance calendar</Link></li>
                <li><Link href="/llc-annual-fees-by-state" className="hover:text-ink">LLC fees by state</Link></li>
              </ul>
            </nav>
            <nav className="space-y-2.5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink">Legal</p>
              <ul className="space-y-2">
                <li><Link href="/terms" className="hover:text-ink">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-ink">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-ink">Cookies</Link></li>
                <li><Link href="/editorial-policy" className="hover:text-ink">Editorial Policy</Link></li>
                <li><Link href="/data-retention" className="hover:text-ink">Data Retention</Link></li>
                <li><Link href="/security" className="hover:text-ink">Security</Link></li>
              </ul>
            </nav>
          </div>
          <div className="mt-10 border-t border-paper-edge pt-6">
            <p>&copy; {new Date().getFullYear()} Form5472 Prep. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
