import { WizardStaticProvider } from "@/components/wizard/WizardStaticProvider";
import { WizardCopy, WizardLink } from "@/components/wizard/WizardCopy";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function FileFunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <WizardStaticProvider>
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-accent-50/30">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-center">
          <WizardLink href="/file" aria-label="Form5472 Prep home">
            <Logo className="h-9 w-auto" />
          </WizardLink>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="py-6 text-center text-xs text-slate-400">
        <span><WizardCopy text="Every filing is reviewed by a PTIN-holding tax accountant before submission. You verify accuracy." /></span>
        {" · "}
        <Link href="/terms" className="hover:text-slate-600 underline underline-offset-2"><WizardCopy text="Terms" /></Link>
        {" · "}
        <Link href="/privacy" className="hover:text-slate-600 underline underline-offset-2"><WizardCopy text="Privacy" /></Link>
      </footer>
    </div>
    </WizardStaticProvider>
  );
}
