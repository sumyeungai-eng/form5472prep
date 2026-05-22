import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "File IRS Form 5472 — Form5472 Prep",
  robots: { index: false, follow: false },
};

export default function FileFunnelLandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-accent/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="relative max-w-xl w-full text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent tracking-wide uppercase">
          <ShieldCheck className="h-3.5 w-3.5" />
          Foreign-owned US LLCs
        </span>

        {/* Headline */}
        <h1 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-tight text-slate-900 text-balance leading-[1.08]">
          Get your<br />
          <span className="text-accent">Form 5472</span> filed.
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-sm mx-auto text-balance leading-relaxed">
          Answer two quick questions. We handle the forms, filings, and IRS submission.
        </p>

        {/* CTA */}
        <div className="mt-10">
          <Link href="/file/owner" className="group inline-block">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold shadow-xl shadow-accent/25 hover:shadow-2xl hover:shadow-accent/35 transition-all duration-200 hover:-translate-y-0.5 rounded-xl"
            >
              Fill it now
              <ArrowRight className="ml-2.5 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="mt-3 text-sm text-slate-400">No account needed to start</p>
        </div>

        {/* Trust strip */}
        <div className="mt-14 grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "15 minutes", sub: "average to complete" },
            { icon: Send, label: "IRS faxed", sub: "directly to Ogden unit" },
            { icon: ShieldCheck, label: "Money-back", sub: "if we fail to submit" },
          ].map((it) => (
            <div
              key={it.label}
              className="rounded-xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col items-center gap-2 text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <it.icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">{it.label}</p>
              <p className="text-xs text-slate-500 leading-tight">{it.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
