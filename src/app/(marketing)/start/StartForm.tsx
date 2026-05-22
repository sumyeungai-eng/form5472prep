"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { fireLeadConversion } from "@/lib/analytics/googleAds";

// Pull the funnel source (?src=) off the URL so we can attribute the eventual
// paid filing back to the landing page that sent the visitor here. Sanitized
// to slug-safe characters so a tampered query string can't inject anything
// into the DB. Falls back to null when the param isn't present (direct visit,
// homepage CTA, etc.).
function readFunnelSource(params: URLSearchParams | null): string | null {
  const raw = params?.get("src");
  if (!raw) return null;
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
  return cleaned || null;
}

const ALLOWED_TIERS = new Set(["standard", "rush", "premium"]);

// Read the customer's tier choice off the URL (?tier=rush etc.). The /pricing
// page links here with the tier pre-selected; missing or invalid values fall
// back to Standard via the server-side default.
function readTier(params: URLSearchParams | null): string | null {
  const raw = params?.get("tier");
  if (!raw) return null;
  const cleaned = raw.toLowerCase().trim();
  return ALLOWED_TIERS.has(cleaned) ? cleaned : null;
}

export function StartForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const funnelSource = readFunnelSource(searchParams);
  const tier = readTier(searchParams);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const create = await fetch("/api/filings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelSource, tier }),
      });
      if (!create.ok) throw new Error("Couldn't create your filing");
      const { id } = await create.json();
      const patch = await fetch(`/api/filings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!patch.ok) throw new Error("Couldn't save your email");
      // Fire Google Ads "Form 5472 Lead" conversion. The DRAFT is now
      // created + bound to a real email, which is the qualified-lead signal
      // the campaign optimises for. event_callback gates the redirect so
      // the conversion ping has time to leave the browser before navigation;
      // helper times out after 1.2s so a blocked tag (ad-blocker, consent
      // decline) doesn't strand the user on /start.
      fireLeadConversion({
        onDone: () => router.push(`/filings/${id}/edit`),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // intent=start tells the server to ensure a DRAFT exists so the
        // wizard has something to load. (Default intent is "signin" which
        // does NOT auto-create a draft.) funnelSource tags the new DRAFT
        // with its source page for sales attribution.
        body: JSON.stringify({ credential, intent: "start", funnelSource, tier }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Google sign-in failed: ${res.status}`);
      }
      const { filingId } = await res.json();
      // Google-signin start-intent also creates a DRAFT — same conversion
      // signal as the email path above.
      fireLeadConversion({
        onDone: () => router.push(`/filings/${filingId}/edit`),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <GoogleLoginButton onCredential={handleGoogleCredential} />

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex-1 border-t border-slate-200" />
        <span>or with email</span>
        <span className="flex-1 border-t border-slate-200" />
      </div>

      <form onSubmit={submitEmail} className="space-y-4">
        <Field
          label="Email address"
          hint="We save your progress here — you'll only pay at the end."
          error={error ?? undefined}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <Button type="submit" disabled={submitting} size="lg" className="w-full">
          {submitting ? (
            "Starting…"
          ) : (
            <>
              Begin filing
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <Mail className="h-3.5 w-3.5 mt-0.5 flex-none text-slate-400" />
        <span>
          We email a reminder if you don&apos;t finish, and a magic-link to sign back in. No
          spam, no marketing — only what you need to file.
        </span>
      </p>
    </div>
  );
}
