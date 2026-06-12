import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getCurrentPartner } from "@/lib/partner/auth";
import { PartnerSignOut } from "./PartnerSignOut";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const partner = await getCurrentPartner();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Form5472 Prep home">
              <Logo />
            </Link>
            <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider text-accent border border-accent/30 rounded-full px-2 py-0.5">
              Partner
            </span>
          </div>
          {partner && (
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="hidden sm:inline">{partner.name}</span>
              <PartnerSignOut />
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
