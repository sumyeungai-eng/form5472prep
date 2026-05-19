"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { formatUsd } from "@/lib/utils";
import { TIERS } from "@/lib/pricing";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function StartForm() {
  const router = useRouter();
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
      const create = await fetch("/api/filings", { method: "POST" });
      if (!create.ok) throw new Error("Couldn't create your filing");
      const { id } = await create.json();
      const patch = await fetch(`/api/filings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!patch.ok) throw new Error("Couldn't save your email");
      router.push(`/filings/${id}/edit`);
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
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Google sign-in failed: ${res.status}`);
      }
      const { filingId } = await res.json();
      router.push(`/filings/${filingId}/edit`);
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
          hint="We save your progress here. $169 plus a flat $29 IRS fax fee — you'll only pay at the end."
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
              Begin filing — from {formatUsd(TIERS.single_year.priceCents)}
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
