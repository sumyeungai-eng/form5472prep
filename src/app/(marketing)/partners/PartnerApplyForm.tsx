"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

// Public partner-application form. POSTs to /api/partner/apply, which creates
// the Partner record as inactive (pending admin approval) and notifies the
// admin. Rendered inside a collapsible panel on /partners; the page's CTA
// buttons scroll to / open it.
export function PartnerApplyForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
    website: "", // honeypot
  });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/partner/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-3 text-lg font-semibold text-slate-900">Application received</h3>
        <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
          Thanks! We&apos;ll review your details and activate your partner account — usually within
          one business day. You&apos;ll get an email at <strong>{form.email}</strong> when it&apos;s
          ready, then you can sign in with a secure link.
        </p>
        <Link
          href="/partner/sign-in"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          Go to partner sign-in
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Request a partner account</h3>
        <p className="mt-1 text-sm text-slate-600">
          Tell us a bit about your firm. We approve partner accounts manually — usually within one
          business day.
        </p>
      </div>

      {/* Honeypot — hidden from humans. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={set("website")}
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contact name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Your name"
            disabled={status === "submitting"}
            className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company / firm</label>
          <input
            value={form.company}
            onChange={set("company")}
            placeholder="Agency or firm name"
            disabled={status === "submitting"}
            className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Work email <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@agency.com"
            disabled={status === "submitting"}
            className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <p className="mt-1 text-xs text-slate-400">This becomes your sign-in email.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone (optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+1 555 000 0000"
            disabled={status === "submitting"}
            className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Anything else? (optional)
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={set("notes")}
          placeholder="How many clients do you file for? Any questions?"
          disabled={status === "submitting"}
          className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">
          Please enter at least your name and a valid email, then try again. Or email{" "}
          <a href="mailto:support@form5472prep.com" className="underline">support@form5472prep.com</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full h-11 rounded-md bg-accent text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent-700 disabled:opacity-60 transition-colors"
      >
        {status === "submitting" ? "Submitting…" : "Submit application"}
        {status !== "submitting" && <ArrowRight className="h-4 w-4" />}
      </button>
      <p className="text-xs text-slate-400 text-center">
        Already approved?{" "}
        <Link href="/partner/sign-in" className="text-accent hover:underline">
          Sign in
        </Link>
        .
      </p>
    </form>
  );
}
