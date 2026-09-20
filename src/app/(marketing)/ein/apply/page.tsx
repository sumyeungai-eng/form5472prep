"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ArrowRight, Clock, Loader2 } from "lucide-react";
import { Input, Select, Field } from "@/components/ui/input";
import { sanitizeSrc } from "@/lib/attribution";
import { EIN_APPLICATION_FAQ } from "@/lib/einApplicationFaq";

const APPLICATION_ID_STORAGE_KEY = "einApplicationId";

type Status = "idle" | "submitting" | "redirecting" | "retrying" | "success" | "error";
type PageState = "form" | "received" | "paid" | "canceled";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

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
  const [funnelSource, setFunnelSource] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    llcName: "",
    llcState: "",
    llcFormedDate: "",
    llcCounty: "",
    llcMembers: "1",
    ownerName: "",
    ownerCitizenship: "",
    ownerResidence: "",
    responsiblePartyTin: "",
    dateOfBirth: "",
    businessMailingAddress: "",
    ownerHomeAddress: "",
    businessType: "",
    businessPurpose: "",
    principalProducts: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFunnelSource(sanitizeSrc(params.get("src")));
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
        body: JSON.stringify({ ...form, fullName: form.ownerName, funnelSource }),
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
      <div className="min-h-[70vh] bg-[#f8f9fb] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
          <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 aria-hidden className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink mb-3">Payment received</h1>
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
      <div className="min-h-[70vh] bg-[#f8f9fb] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
          <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 aria-hidden className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink mb-3">Almost done — complete payment to submit</h1>
          <p className="text-slate-600 mb-4">
            Your details are saved. Your application is submitted to our team once payment is complete, and you&apos;ll receive a confirmation email then.
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
                {status === "retrying" ? <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Opening checkout…</> : "Retry payment"}
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
    <div className="bg-[#f8f9fb]">
      <section className="relative overflow-hidden border-b border-slate-200 bg-paper">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #1e3a8a 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div aria-hidden className="absolute -right-24 -top-40 h-[520px] w-[520px] rounded-full bg-accent-100/70 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-16">
          <Link href="/ein" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-accent">
            <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
            EIN service
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
            <CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-accent" />
            EIN service · Form SS-4 prepared for you
          </div>
          <h1 className="mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.65rem]">
            EIN Application
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Submit the form, pay in Stripe Checkout, and we follow up within 1 business day with a document checklist. Once we have your documents, the EIN is typically delivered by email in 1–5 business days.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
              EIN by email in 1–5 business days
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
              No SSN or ITIN required
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
              $149 flat fee
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div>
      {pageState === "canceled" && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="space-y-8">
            <fieldset>
              <legend className="font-serif text-xl font-semibold text-ink">Contact</legend>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                We use this email for checkout, follow-up, and delivery.
              </p>
              <div className="mt-5">
                <Field label="Email address">
                  <Input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                </Field>
                <div className="mt-4">
                  <Field label="Phone number" hint="Optional. Used only if the IRS needs to reach you about this application.">
                    <Input type="tel" value={form.phone} onChange={set("phone")} />
                  </Field>
                </div>
              </div>
            </fieldset>

            <fieldset className="border-t border-slate-100 pt-8">
              <legend className="font-serif text-xl font-semibold text-ink">Company</legend>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tell us about the entity and its business activity.
              </p>
              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <Field label="Company name">
                    <Input required value={form.llcName} onChange={set("llcName")} placeholder="Acme LLC" />
                  </Field>
                </div>
                <div>
                  <Field label="State of formation">
                    <Select required value={form.llcState} onChange={set("llcState")}>
                      <option value="">Select a state...</option>
                      {US_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div>
                  <Field label="Date the company was formed">
                    <Input required type="date" value={form.llcFormedDate} onChange={set("llcFormedDate")} />
                  </Field>
                </div>
                <div>
                  <Field label="County where the business is located" hint="Optional. If you use a registered agent address, use that county.">
                    <Input value={form.llcCounty} onChange={set("llcCounty")} />
                  </Field>
                </div>
                <div>
                  <Field label="Number of owners (members)">
                    <Select value={form.llcMembers} onChange={set("llcMembers")}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5 or more</option>
                    </Select>
                  </Field>
                </div>
                <div>
                  <Field label="Company business mailing address">
                    <Input required value={form.businessMailingAddress} onChange={set("businessMailingAddress")} placeholder="Street, city, state, postal code, country" />
                  </Field>
                </div>
                <div>
                  <Field label="Business type">
                    <Select required value={form.businessType} onChange={set("businessType")}>
                      <option value="">Select a business type…</option>
                      <option value="LLC">LLC</option>
                      <option value="Corporation">Corporation</option>
                      <option value="Sole proprietorship">Sole proprietorship</option>
                    </Select>
                  </Field>
                </div>
                <div>
                  <Field label="Business activity">
                    <Input required value={form.businessPurpose} onChange={set("businessPurpose")} placeholder="Retail" />
                  </Field>
                </div>
                <div>
                  <Field label="Principal line of products or services sold">
                    <Input required value={form.principalProducts} onChange={set("principalProducts")} placeholder="Home and kitchen products" />
                  </Field>
                </div>
              </div>
            </fieldset>

            <fieldset className="border-t border-slate-100 pt-8">
              <legend className="font-serif text-xl font-semibold text-ink">Owner</legend>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Use the name exactly as it appears on your documents.
              </p>
              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <Field label="Owner full legal name (as on documents)">
                    <Input required value={form.ownerName} onChange={set("ownerName")} placeholder="Full legal name" />
                  </Field>
                </div>
                <div>
                  <Field label="Country of citizenship">
                    <Input required value={form.ownerCitizenship} onChange={set("ownerCitizenship")} />
                  </Field>
                </div>
                <div>
                  <Field label="Country of residence">
                    <Input required value={form.ownerResidence} onChange={set("ownerResidence")} />
                  </Field>
                </div>
                <div>
                  <Field label="US tax number (SSN or ITIN)" hint="Optional. Leave blank if you do not have one.">
                    <Input value={form.responsiblePartyTin} onChange={set("responsiblePartyTin")} />
                  </Field>
                </div>
                <div>
                  <Field label="Owner date of birth">
                    <Input required type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
                  </Field>
                </div>
                <div>
                  <Field label="Owner home address">
                    <Input required value={form.ownerHomeAddress} onChange={set("ownerHomeAddress")} placeholder="Street, city, postal code, country" />
                  </Field>
                </div>
              </div>
            </fieldset>
          </div>
        </section>

        <div className="rounded-2xl bg-accent-50 border border-accent/20 px-5 py-4 text-sm text-slate-700">
          <strong>Flat fee: $149</strong> — payment opens in Stripe Checkout immediately after you
          submit this application.
        </div>

        {status === "error" && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Something went wrong. Please try again or email{" "}
            <a href="mailto:support@form5472prep.com" className="underline">support@form5472prep.com</a>.
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
            <>Submit and continue to payment · $149 <ArrowRight aria-hidden className="h-4 w-4" /></>
          )}
        </button>

        <p className="text-center text-xs leading-5 text-slate-500">
          By submitting you agree to our{" "}
          <Link href="/terms" className="underline hover:no-underline">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="underline hover:no-underline">Privacy Policy</Link>.
        </p>
      </form>
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent-50">
                <Clock aria-hidden className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  How long does it take?
                </p>
                <p className="mt-2 font-serif text-4xl font-semibold text-ink">1–5 business days</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Typical time to receive your EIN by email once we have your documents.
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="font-serif text-xl font-semibold text-ink">What happens next</h2>
              <ol className="mt-5 space-y-5">
                <li className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-50 font-mono text-[11px] font-semibold text-accent">1</span>
                  <span>
                    <strong className="block text-slate-900">Submit this form</strong>
                    Fill in what you know.
                  </span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-50 font-mono text-[11px] font-semibold text-accent">2</span>
                  <span>
                    <strong className="block text-slate-900">Pay $149 in Stripe Checkout</strong>
                    Opens immediately.
                  </span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-50 font-mono text-[11px] font-semibold text-accent">3</span>
                  <span>
                    <strong className="block text-slate-900">Document checklist from us</strong>
                    Within 1 business day.
                  </span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-50 font-mono text-[11px] font-semibold text-accent">4</span>
                  <span>
                    <strong className="block text-slate-900">We prepare Form SS-4 and contact the IRS by phone or fax</strong>
                    Nothing is sent until you have paid and approved.
                  </span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-50 font-mono text-[11px] font-semibold text-accent">5</span>
                  <span>
                    <strong className="block text-slate-900">EIN delivered by email</strong>
                    Typically 1–5 business days; the IRS mails the CP 575 letter afterwards.
                  </span>
                </li>
              </ol>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="font-serif text-xl font-semibold text-ink">What you receive</h2>
              <ul className="mt-5 space-y-3">
                {[
                  "9-digit EIN by email",
                  "Copy of the completed Form SS-4",
                  "Official IRS CP 575 letter by mail",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                    <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
              Questions?{" "}
              <a href="mailto:support@form5472prep.com" className="text-accent hover:underline">
                support@form5472prep.com
              </a>
            </p>
          </div>
        </aside>
      </main>

      {/* The FAQ sits OUTSIDE the grid on purpose. A sticky grid item is
          constrained by the grid container, not by its own grid area, so a
          full-width row inside this grid slides underneath the sticky sidebar
          on wide screens. */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="font-serif text-2xl font-semibold text-ink">Questions about the application</h2>
          <p className="mt-2 text-sm text-slate-600">Optional — expand any question before you submit.</p>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {EIN_APPLICATION_FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] open:bg-slate-50">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between gap-4">
                  {q}
                  <span className="text-slate-400 group-open:rotate-180 transition" aria-hidden>▾</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
      </section>
    </div>
  );
}
