"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Input, Select, Field } from "@/components/ui/input";
import { EIN_APPLICATION_FAQ } from "@/lib/einApplicationFaq";

const APPLICATION_ID_STORAGE_KEY = "einApplicationId";

type Status = "idle" | "submitting" | "redirecting" | "retrying" | "success" | "error";
type PageState = "form" | "received" | "paid" | "canceled";

function applicationResponse(input: unknown): { id: string } | null {
  if (typeof input !== "object" || input === null) return null;
  const { id } = input as { id?: unknown };
  return typeof id === "string" && id ? { id } : null;
}

function checkoutResponse(input: unknown): { url: string } | null {
  if (typeof input !== "object" || input === null) return null;
  const { url } = input as { url?: unknown };
  return typeof url === "string" && url ? { url } : null;
}

export default function EinApplyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [pageState, setPageState] = useState<PageState>("form");
  const [applicationId, setApplicationId] = useState("");
  const [needsCheckoutRetry, setNeedsCheckoutRetry] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [form, setForm] = useState({
    email: "",
    llcName: "",
    ownerName: "",
    businessMailingAddress: "",
    ownerHomeAddress: "",
    businessType: "",
    businessPurpose: "",
    principalProducts: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedApplicationId = window.sessionStorage.getItem(APPLICATION_ID_STORAGE_KEY) ?? "";
    if (storedApplicationId) setApplicationId(storedApplicationId);
    if (params.get("paid") === "1") {
      setPageState("paid");
      return;
    }
    if (params.get("canceled") === "1") {
      setPageState("canceled");
      setNeedsCheckoutRetry(true);
    }
  }, []);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function openCheckout(id: string) {
    const res = await fetch("/api/applications/ein/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: id }),
    });
    const payload = checkoutResponse(await res.json().catch(() => null));
    if (!res.ok || !payload) throw new Error("Checkout unavailable");
    window.location.href = payload.url;
  }

  async function retryCheckout() {
    const id = applicationId || window.sessionStorage.getItem(APPLICATION_ID_STORAGE_KEY) || "";
    if (!id) {
      setCheckoutError("We couldn't find the saved application to open payment. Please submit the form again.");
      return;
    }
    setCheckoutError("");
    setStatus("retrying");
    try {
      await openCheckout(id);
    } catch {
      setCheckoutError("We couldn't open Stripe Checkout. Please try the payment button again.");
      setStatus("success");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setCheckoutError("");
    try {
      const res = await fetch("/api/ein-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fullName: form.ownerName }),
      });
      if (!res.ok) throw new Error("Server error");
      const payload = applicationResponse(await res.json().catch(() => null));
      if (!payload) throw new Error("Missing application id");
      setApplicationId(payload.id);
      window.sessionStorage.setItem(APPLICATION_ID_STORAGE_KEY, payload.id);
      setStatus("redirecting");
      try {
        await openCheckout(payload.id);
      } catch {
        setNeedsCheckoutRetry(true);
        setPageState("received");
        setStatus("success");
      }
    } catch {
      setStatus("error");
    }
  }

  if (pageState === "paid") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">Payment received</h1>
          <p className="text-slate-600 mb-8">
            Your EIN application is paid and in review. We&apos;ve sent a confirmation to your email.
          </p>
          <Link href="/ein" className="text-sm text-accent hover:underline">
            ← Back to EIN service page
          </Link>
        </div>
      </div>
    );
  }

  if (pageState === "received") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">Application received</h1>
          <p className="text-slate-600 mb-2">
            We&apos;ve also sent a confirmation to <strong>{form.email}</strong>.
          </p>
          <p className="text-slate-600 mb-4">
            Our team will reach out within 1 business day with a document checklist.
          </p>
          {needsCheckoutRetry && (
            <div className="mb-8">
              <p className="text-sm text-slate-600 mb-4">
                We couldn&apos;t open Stripe Checkout, but your application was saved. We&apos;ll also email you a payment link.
              </p>
              <button
                type="button"
                onClick={retryCheckout}
                disabled={status === "retrying"}
                className="w-full h-11 rounded-md bg-accent text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent-700 disabled:opacity-60 transition-colors"
              >
                {status === "retrying" ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening checkout…</> : "Retry payment"}
              </button>
              {checkoutError && <p className="text-sm text-red-600 mt-3">{checkoutError}</p>}
            </div>
          )}
          <Link href="/ein" className="text-sm text-accent hover:underline">
            ← Back to EIN service page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      {/* Breadcrumb */}
      <Link href="/ein" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8">
        <ArrowLeft className="h-3.5 w-3.5" />
        EIN service
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">EIN Application</h1>
        <p className="mt-2 text-slate-600">
          Fill in what you know — after you submit, we&apos;ll take payment and follow up within 1
          business day with a document checklist. Nothing is submitted to the IRS until you&apos;ve paid
          and approved.
        </p>
      </div>

      {pageState === "canceled" && (
        <div className="mb-8 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="mb-3">Payment was canceled and can be completed via the retry button.</p>
          <button
            type="button"
            onClick={retryCheckout}
            disabled={status === "retrying"}
            className="h-9 rounded-md bg-white border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {status === "retrying" ? "Opening checkout…" : "Retry payment"}
          </button>
          {checkoutError && <p className="text-sm text-red-600 mt-3">{checkoutError}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="space-y-4">
            <Field label="Email address">
              <Input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </Field>
            <Field label="Company name">
              <Input required value={form.llcName} onChange={set("llcName")} placeholder="Acme LLC" />
            </Field>
            <Field label="Owner full legal name (as on documents)">
              <Input required value={form.ownerName} onChange={set("ownerName")} placeholder="Full legal name" />
            </Field>
            <Field label="Company business mailing address">
              <Input required value={form.businessMailingAddress} onChange={set("businessMailingAddress")} placeholder="Street, city, state, postal code, country" />
            </Field>
            <Field label="Owner home address">
              <Input required value={form.ownerHomeAddress} onChange={set("ownerHomeAddress")} placeholder="Street, city, postal code, country" />
            </Field>
            <Field label="Business type">
              <Select required value={form.businessType} onChange={set("businessType")}>
                <option value="">Select a business type…</option>
                <option value="LLC">LLC</option>
                <option value="Corporation">Corporation</option>
                <option value="Sole proprietorship">Sole proprietorship</option>
              </Select>
            </Field>
            <Field label="Business activity">
              <Input required value={form.businessPurpose} onChange={set("businessPurpose")} placeholder="Retail" />
            </Field>
            <Field label="Principal line of products or services sold">
              <Input required value={form.principalProducts} onChange={set("principalProducts")} placeholder="Home and kitchen products" />
            </Field>
          </div>
        </section>

        {/* Price reminder */}
        <div className="rounded-lg bg-accent-50 border border-accent/20 px-5 py-4 text-sm text-slate-700">
          <strong>Flat fee: $149</strong> — payment opens in Stripe Checkout immediately after you
          submit this application.
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">
            Something went wrong. Please try again or email{" "}
            <a href="mailto:support@form5472prep.com" className="underline">support@form5472prep.com</a>.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || status === "redirecting"}
          className="w-full h-12 rounded-md bg-accent text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent-700 disabled:opacity-60 transition-colors"
        >
          {status === "submitting" || status === "redirecting" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {status === "redirecting" ? "Opening checkout…" : "Submitting…"}</>
          ) : (
            <>Submit application <ArrowRight className="h-4 w-4" /></>
          )}
        </button>

        <p className="text-xs text-slate-500 text-center">
          By submitting you agree to our{" "}
          <Link href="/terms" className="underline hover:no-underline">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="underline hover:no-underline">Privacy Policy</Link>.
        </p>
      </form>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-slate-900">Questions about the application</h2>
        <p className="mt-2 text-sm text-slate-600">Optional — expand any question before you submit.</p>
        <div className="mt-5 space-y-3">
          {EIN_APPLICATION_FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-lg border border-slate-200 bg-white p-4 open:bg-slate-50">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
                {q}
                <span className="text-slate-400 group-open:rotate-180 transition">▾</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
