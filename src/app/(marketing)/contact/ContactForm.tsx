"use client";

import type { FormEvent } from "react";
import { useState } from "react";

const SUPPORT_EMAIL = "support@form5472prep.com";
const GENERIC_ERROR = `Could not send your message. Please email ${SUPPORT_EMAIL} directly.`;

function valueFrom(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: valueFrom(formData, "name"),
          email: valueFrom(formData, "email"),
          topic: valueFrom(formData, "topic"),
          message: valueFrom(formData, "message"),
          company: valueFrom(formData, "company"),
          pageUrl: "/contact",
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        return;
      }

      if (response.status === 429) {
        setError(
          `Too many messages from your connection — please wait a few minutes or email ${SUPPORT_EMAIL} directly.`,
        );
        return;
      }

      const data = await response.json().catch(() => null);
      setError(data && typeof data.error === "string" ? data.error : GENERIC_ERROR);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-relaxed text-emerald-900">
        <p>
          Thanks — we&apos;ve received your question. We reply within 1 business day, from{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p className="mt-2">
          You&apos;ll get a reply from {SUPPORT_EMAIL} — if it doesn&apos;t arrive, check your
          spam folder.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          Name <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
        />
        <p className="mt-2 text-xs text-slate-500">
          We only use this to reply — no marketing.
        </p>
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-ink">
          What&apos;s this about?
        </label>
        <select
          id="topic"
          name="topic"
          defaultValue="service"
          required
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
        >
          <option value="service">Pre-sales question</option>
          <option value="in-progress">Filing in progress</option>
          <option value="late-years">Late or past years (DIIRSP)</option>
          <option value="ein-itin">EIN or ITIN</option>
          <option value="irs-notice">IRS notice or penalty</option>
          <option value="billing">Billing or refund</option>
          <option value="partner">Partner enquiry</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={4000}
          required
          placeholder="Tell us your LLC's state, which tax years are involved, and whether the LLC already has an EIN — with those three details we can usually answer in one reply."
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
        />
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Sending..." : "Send question"}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          We never ask for your SSN, ITIN, or bank details by email. Read our{" "}
          <a href="/privacy" className="font-medium text-accent hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
