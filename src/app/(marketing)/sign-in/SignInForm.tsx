"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { GoogleLoginButton } from "../start/GoogleLoginButton";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitting(true);
    try {
      await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
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
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
        <p className="mt-3 font-medium text-slate-900">Check your inbox</p>
        <p className="mt-1 text-sm text-slate-600">
          If we have a filing for <span className="font-medium">{email}</span>, a sign-in link is
          on its way. The link is good for 7 days.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
          className="mt-4 text-xs text-slate-500 hover:text-slate-900"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <GoogleLoginButton onCredential={handleGoogleCredential} />

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex-1 border-t border-slate-200" />
        <span>or</span>
        <span className="flex-1 border-t border-slate-200" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address" error={error ?? undefined}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <Button type="submit" disabled={submitting || !email.includes("@")} className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          {submitting ? "Sending…" : "Email me a sign-in link"}
        </Button>
      </form>
    </div>
  );
}
