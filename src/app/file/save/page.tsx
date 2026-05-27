"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// The /file mini-funnel always uses the Standard tier — it's the entry-level
// "just file my Form 5472" path. The yearsKey maps to year count; additional
// past years add $149 each on top of the $199 Standard base.
const TIER_MAP: Record<string, { tier: string; yearLabel: string; price: string; perYear: string }> = {
  "1": { tier: "standard", yearLabel: "1 tax year",              price: "$199", perYear: "$199 total" },
  "2": { tier: "standard", yearLabel: "2 tax years (catch-up)",  price: "$348", perYear: "$199 + $149 extra year" },
  "3": { tier: "standard", yearLabel: "3+ tax years (catch-up)", price: "$497", perYear: "$199 + 2 × $149 extra years" },
};

function SaveForm() {
  const router = useRouter();
  const params = useSearchParams();
  const yearsKey = params.get("years") ?? "1";
  const tierInfo = TIER_MAP[yearsKey] ?? TIER_MAP["1"];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/filings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierInfo.tier, funnelSource: "file_funnel" }),
      });
      if (!res.ok) throw new Error("Failed to create filing");
      const { id } = await res.json();

      await fetch(`/api/filings/${id}/bind-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      router.push(`/filings/${id}/edit`);
    } catch {
      setError("Something went wrong — please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <StepBar current={3} total={3} onBack={() => router.push("/file/years")} />

        {/* Heading */}
        <div className="mt-10">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider">Step 3 of 3</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Almost there
          </h1>
          <p className="mt-2 text-slate-500">
            Enter your email to save your progress and receive the completed forms.
          </p>
        </div>

        {/* Price reveal */}
        <div className="mt-8 rounded-2xl border-2 border-accent/20 bg-accent/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-wider">Your plan</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{tierInfo.price}</p>
              <p className="mt-0.5 text-sm text-slate-600">{tierInfo.yearLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">That&apos;s only</p>
              <p className="text-sm font-medium text-slate-600">{tierInfo.perYear}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-accent/10 space-y-1.5">
            {[
              "Filled Form 5472 + pro forma 1120",
              "Reasonable cause statement (if DIIRSP)",
              "IRS fax delivery to Ogden PIN Unit (included)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="flex-none h-3.5 w-3.5 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading || !email.trim()}
            className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {loading ? "Starting your filing…" : (
              <>
                Continue to filing
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3 w-3" />
            No password · No subscription · Pay only at the end
          </p>
        </form>
      </div>
    </div>
  );
}

function StepBar({ current, total, onBack }: { current: number; total: number; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex-none w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-center"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="flex-1 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
              i < current ? "bg-accent" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="flex-none text-xs font-medium text-slate-400 tabular-nums">{current} / {total}</span>
    </div>
  );
}

export default function SaveStepPage() {
  return (
    <Suspense>
      <SaveForm />
    </Suspense>
  );
}
