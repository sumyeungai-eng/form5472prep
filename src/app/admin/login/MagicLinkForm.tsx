"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitting(true);

    try {
      await fetch("/api/admin/v1/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Keep the response neutral so account existence is never disclosed.
    } finally {
      setSent(true);
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
        <p className="mt-3 font-medium text-slate-900">Check your inbox</p>
        <p className="mt-1 text-sm text-slate-600">
          If that address belongs to an admin, a sign-in link is on its way.
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
    <form onSubmit={submit} className="mt-4 space-y-4 bg-white border border-slate-200 rounded-lg p-6">
      <Field label="Admin email">
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
  );
}
