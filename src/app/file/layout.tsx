import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function FileFunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-accent-50/30">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-center">
          <Link href="/file" aria-label="Form5472 Prep home">
            <Logo className="h-9 w-auto" />
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="py-6 text-center text-xs text-slate-400">
        <span>Not a CPA firm. We prepare forms, you verify accuracy.</span>
        {" · "}
        <Link href="/terms" className="hover:text-slate-600 underline underline-offset-2">Terms</Link>
        {" · "}
        <Link href="/privacy" className="hover:text-slate-600 underline underline-offset-2">Privacy</Link>
      </footer>
    </div>
  );
}
