"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Input, Select, Field } from "@/components/ui/input";
import { sanitizeSrc } from "@/lib/attribution";
import { extensionDueDateUtc, formatExtensionDate, openExtensionTaxYears } from "@/lib/form7004";
import { EXTENSION_PRICE_CENTS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

const APPLICATION_ID_STORAGE_KEY = "extensionApplicationId";
const PRICE = formatPrice(EXTENSION_PRICE_CENTS);
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type Status = "idle" | "submitting" | "redirecting" | "retrying" | "error";
type PageState = "form" | "received" | "paid" | "canceled";

function idResponse(input: unknown): string | null {
  const id = (input as { id?: unknown } | null)?.id;
  return typeof id === "string" && id ? id : null;
}

// The server explains a refusal (e.g. a closed tax year); otherwise fall back to a generic retry hint.
function checkoutErrorMessage(err: unknown): string {
  return err instanceof Error && err.message !== "Checkout unavailable"
    ? err.message
    : "We couldn't open Stripe Checkout. Please try the payment button again.";
}

function urlResponse(input: unknown): string | null {
  const url = (input as { url?: unknown } | null)?.url;
  return typeof url === "string" && url ? url : null;
}

export default function Form7004ApplyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [pageState, setPageState] = useState<PageState>("form");
  const [applicationId, setApplicationId] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [funnelSource, setFunnelSource] = useState<string | null>(null);
  // Computed after mount so a statically rendered page never shows stale years.
  const [years, setYears] = useState<number[]>([]);
  const [now, setNow] = useState<number | null>(null);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    llcName: "",
    ein: "",
    llcStreet: "",
    llcCity: "",
    llcState: "",
    llcZip: "",
    taxYear: "",
    notes: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFunnelSource(sanitizeSrc(params.get("src")));
    const open = openExtensionTaxYears(new Date());
    setYears(open);
    setNow(Date.now());
    setForm((f) => ({ ...f, taxYear: String(open[0]) }));
    const stored = window.sessionStorage.getItem(APPLICATION_ID_STORAGE_KEY) ?? "";
    if (stored) setApplicationId(stored);
    if (params.get("paid") === "1") setPageState("paid");
    else if (params.get("canceled") === "1") setPageState("canceled");
  }, []);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function openCheckout(id: string) {
    const res = await fetch("/api/applications/extension/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: id }),
    });
    const payload = await res.json().catch(() => null);
    const url = urlResponse(payload);
    if (!res.ok || !url) throw new Error(typeof payload?.error === "string" ? payload.error : "Checkout unavailable");
    window.location.href = url;
  }

  async function retryCheckout() {
    const id = applicationId || window.sessionStorage.getItem(APPLICATION_ID_STORAGE_KEY) || "";
    if (!id) {
      setCheckoutError("We couldn't find your saved order. Please submit the form again.");
      return;
    }
    setCheckoutError("");
    setStatus("retrying");
    try {
      await openCheckout(id);
    } catch (err) {
      setCheckoutError(checkoutErrorMessage(err));
      setStatus("idle");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setCheckoutError("");
    setSubmitError("");
    try {
      const res = await fetch("/api/extension-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, funnelSource }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Server error");
      const id = idResponse(payload);
      if (!id) throw new Error("Missing order id");
      setApplicationId(id);
      window.sessionStorage.setItem(APPLICATION_ID_STORAGE_KEY, id);
      setStatus("redirecting");
      try {
        await openCheckout(id);
      } catch (err) {
        setCheckoutError(checkoutErrorMessage(err));
        setPageState("received");
        setStatus("idle");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "");
      setStatus("error");
    }
  }

  const selectedYear = Number.parseInt(form.taxYear, 10);
  const dueMs = Number.isInteger(selectedYear) ? extensionDueDateUtc(selectedYear) : null;
  const daysLeft = dueMs !== null && now !== null ? Math.floor((dueMs + ONE_DAY_MS - now) / ONE_DAY_MS) : null;
  const yearNotEnded = now !== null && Number.isInteger(selectedYear) && selectedYear >= new Date(now).getUTCFullYear();
  // Friendly, never-blocking reminders: staff follow up after payment.
  const missing = [
    !form.llcName.trim() && "LLC name",
    form.ein.replace(/\D/g, "").length !== 9 && "EIN (9 digits)",
    !(form.llcStreet.trim() && form.llcCity.trim() && form.llcZip.trim()) && "LLC US address",
    !form.taxYear && "tax year",
  ].filter((v): v is string => Boolean(v));

  if (pageState === "paid" || pageState === "received") {
    const paid = pageState === "paid";
    return (
      <div className="min-h-[70vh] bg-[#f8f9fb] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
          <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 aria-hidden className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink mb-3">
            {paid ? "Payment received" : "Almost done — complete payment"}
          </h1>
          <p className="text-slate-600 mb-6">
            {paid
              ? "Your Form 7004 order is paid. We've emailed you a confirmation with the next steps, and we'll email the fax confirmation once it is sent to the IRS."
              : "Your details are saved, but we couldn't open Stripe Checkout. Your order is placed once payment is complete."}
          </p>
          {!paid && (
            <div className="mb-6">
              <button
                type="button"
                onClick={retryCheckout}
                disabled={status === "retrying"}
                className="w-full h-11 rounded-md bg-accent text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent-700 disabled:opacity-60 transition-colors"
              >
                {status === "retrying" ? <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Opening checkout…</> : "Retry payment"}
              </button>
              {checkoutError && <p className="text-sm text-red-600 mt-3">{checkoutError}</p>}
            </div>
          )}
          <Link href="/form-7004-extension" className="text-sm text-accent hover:underline">
            ← Back to the Form 7004 page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fb]">
      <section className="border-b border-slate-200 bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link href="/form-7004-extension" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-accent">
            <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
            Form 7004 extension
          </Link>
          <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-ink">Order your Form 7004 extension</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            We prepare Form 7004 (with &ldquo;Foreign-owned U.S. DE&rdquo; and Form 1120 code 12) and fax it to the IRS
            Ogden PIN Unit, then email you the fax confirmation. Orders are faxed within 2 business days; for a tax year
            that has not ended yet, we fax it in the first business days after 1 January.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {pageState === "canceled" && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            <p className="mb-3">Payment was canceled. Your details are saved — you can complete payment here.</p>
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
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8">
            <fieldset>
              <legend className="font-serif text-xl font-semibold text-ink">Tax year</legend>
              <div className="mt-4">
                <Field label="Tax year to extend" hint="Calendar tax years whose Form 7004 deadline has not passed.">
                  <Select value={form.taxYear} onChange={set("taxYear")}>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y} — file by {formatExtensionDate(extensionDueDateUtc(y))}
                      </option>
                    ))}
                    <option value="">Not sure — we&apos;ll confirm with you</option>
                  </Select>
                </Field>
                {dueMs !== null && daysLeft !== null && daysLeft <= 3 && (
                  <p className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <AlertTriangle aria-hidden className="h-4 w-4 mt-0.5 shrink-0" />
                    The deadline for {selectedYear} is {formatExtensionDate(dueMs)}. Orders are normally faxed within 2 business
                    days, so please also email support@form5472prep.com right after paying so we can try to fax it in time.
                  </p>
                )}
                {yearNotEnded && (
                  <p className="mt-3 text-sm text-slate-600">
                    Tax year {selectedYear} has not ended yet, so we fax your Form 7004 in the first business days after 1 January {selectedYear + 1}.
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className="border-t border-slate-100 pt-8">
              <legend className="font-serif text-xl font-semibold text-ink">LLC</legend>
              <p className="mt-1 text-sm text-slate-500">Exactly as the IRS has them — a name or EIN mismatch can invalidate the extension.</p>
              <div className="mt-5 flex flex-col gap-4">
                <Field label="LLC legal name">
                  <Input value={form.llcName} onChange={set("llcName")} placeholder="Acme LLC" maxLength={200} />
                </Field>
                <Field label="EIN" hint="The LLC's 9-digit EIN, XX-XXXXXXX.">
                  <Input value={form.ein} onChange={set("ein")} placeholder="12-3456789" inputMode="numeric" maxLength={20} />
                </Field>
                <Field label="LLC US street address">
                  <Input value={form.llcStreet} onChange={set("llcStreet")} placeholder="Street and suite" maxLength={200} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-[1fr_140px_120px]">
                  <Field label="City">
                    <Input value={form.llcCity} onChange={set("llcCity")} maxLength={100} />
                  </Field>
                  <Field label="State">
                    <Input value={form.llcState} onChange={set("llcState")} placeholder="WY" maxLength={40} />
                  </Field>
                  <Field label="ZIP">
                    <Input value={form.llcZip} onChange={set("llcZip")} inputMode="numeric" maxLength={20} />
                  </Field>
                </div>
              </div>
            </fieldset>

            <fieldset className="border-t border-slate-100 pt-8">
              <legend className="font-serif text-xl font-semibold text-ink">Contact</legend>
              <p className="mt-1 text-sm text-slate-500">We send the payment receipt, any follow-up and the fax confirmation here.</p>
              <div className="mt-5 flex flex-col gap-4">
                <Field label="Email address">
                  <Input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
                </Field>
                <Field label="Your full name">
                  <Input value={form.fullName} onChange={set("fullName")} autoComplete="name" maxLength={200} />
                </Field>
                <Field label="Phone number" hint="Optional.">
                  <Input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" maxLength={40} />
                </Field>
                <Field label="Notes" hint="Optional. Anything we should know.">
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    rows={3}
                    maxLength={2000}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </Field>
              </div>
            </fieldset>
          </section>

          {missing.length > 0 && form.email.trim() && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              <p className="font-medium">You can still pay now.</p>
              <p className="mt-1">We&apos;ll email you after payment for: {missing.join(", ")}. We need these before we can fax the form.</p>
            </div>
          )}

          <div className="rounded-2xl bg-accent-50 border border-accent/20 px-5 py-4 text-sm text-slate-700">
            <strong>{PRICE} per LLC, per tax year</strong> — payment opens in Stripe Checkout when you submit. A fax
            confirmation shows the fax was transmitted; it is not IRS acceptance. We are not a CPA firm and do not give tax advice.
          </div>

          {status === "error" && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError || (
                <>
                  Something went wrong. Please try again or email{" "}
                  <a href="mailto:support@form5472prep.com" className="underline">support@form5472prep.com</a>.
                </>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting" || status === "redirecting"}
            className="w-full h-12 rounded-lg bg-accent text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent-700 disabled:opacity-60 transition-colors"
          >
            {status === "submitting" || status === "redirecting" ? (
              <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> {status === "redirecting" ? "Opening checkout…" : "Submitting…"}</>
            ) : (
              <>Continue to payment · {PRICE} <ArrowRight aria-hidden className="h-4 w-4" /></>
            )}
          </button>

          <p className="text-center text-xs leading-5 text-slate-500">
            By submitting you agree to our{" "}
            <Link href="/terms" className="underline hover:no-underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline hover:no-underline">Privacy Policy</Link>.
          </p>
        </form>
      </main>
    </div>
  );
}
