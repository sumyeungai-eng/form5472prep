"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function PartnerSignInForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitting(true);
    try {
      await fetch("/api/partner/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
        <p className="mt-3 font-medium text-slate-900">Check your inbox</p>
        <p className="mt-1 text-sm text-slate-600">
          If <span className="font-medium">{email}</span> is an active partner account, a sign-in
          link is on its way. The link is good for 7 days.
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
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field label="Partner email">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@agency.com"
          autoComplete="email"
          required
        />
      </Field>
      <Button type="submit" disabled={submitting || !email.includes("@")} className="w-full">
        <Mail className="mr-2 h-4 w-4" />
        {submitting ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
