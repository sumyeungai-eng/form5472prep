"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Input, Select, Label, Field } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/countries";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function EinApplyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    llcName: "", llcState: "", llcFormedDate: "", businessPurpose: "",
    ownerName: "", ownerCitizenship: "", ownerResidence: "", passportNumber: "",
    notes: "",
  });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/ein-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
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
          <p className="text-slate-600 mb-8">
            Our team will reach out within 1 business day with a document checklist and payment link.
          </p>
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
          Fill in what you know — we&apos;ll follow up within 1 business day with a document checklist
          and payment link. Nothing is submitted to the IRS until you&apos;ve paid and approved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Contact */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            Your contact details
          </h2>
          <div className="space-y-4">
            <Field label="Full legal name" >
              <Input required value={form.fullName} onChange={set("fullName")} placeholder="As on your passport" />
            </Field>
            <Field label="Email address">
              <Input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </Field>
            <Field label="Phone number" hint="Optional — include country code">
              <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
            </Field>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* LLC Info */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            LLC information
          </h2>
          <div className="space-y-4">
            <Field label="LLC legal name">
              <Input required value={form.llcName} onChange={set("llcName")} placeholder="Acme LLC" />
            </Field>
            <Field label="State of formation">
              <Select value={form.llcState} onChange={set("llcState")}>
                <option value="">Select a state…</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Formation date" hint="Approximate is fine if you don't have the exact date">
              <Input type="date" value={form.llcFormedDate} onChange={set("llcFormedDate")} />
            </Field>
            <Field
              label="Business purpose"
              hint="Brief description — e.g. 'SaaS software sales', 'ecommerce dropshipping', 'consulting services'"
            >
              <Input value={form.businessPurpose} onChange={set("businessPurpose")} placeholder="What does the LLC do?" />
            </Field>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Owner Info */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            LLC owner (foreign national)
          </h2>
          <div className="space-y-4">
            <Field label="Owner legal name" hint="Leave blank if same as your name above">
              <Input value={form.ownerName} onChange={set("ownerName")} placeholder="Full name as on passport" />
            </Field>
            <Field label="Country of citizenship">
              <Select value={form.ownerCitizenship} onChange={set("ownerCitizenship")}>
                <option value="">Select a country…</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </Select>
            </Field>
            <Field label="Country of residence">
              <Select value={form.ownerResidence} onChange={set("ownerResidence")}>
                <option value="">Select a country…</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </Select>
            </Field>
            <Field label="Passport number" hint="Optional at this stage — we will need it before filing">
              <Input value={form.passportNumber} onChange={set("passportNumber")} placeholder="A1234567" />
            </Field>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Notes */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            Anything else?
          </h2>
          <div>
            <Label>Additional notes <span className="text-slate-400 font-normal">(optional)</span></Label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any questions or context for us…"
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </section>

        {/* Price reminder */}
        <div className="rounded-lg bg-accent-50 border border-accent/20 px-5 py-4 text-sm text-slate-700">
          <strong>Flat fee: $149</strong> — payment will be collected after we review your application
          and send you the document checklist. Nothing is charged today.
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">
            Something went wrong. Please try again or email{" "}
            <a href="mailto:support@form5472prep.com" className="underline">support@form5472prep.com</a>.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full h-12 rounded-md bg-accent text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent-700 disabled:opacity-60 transition-colors"
        >
          {status === "submitting" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
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
    </div>
  );
}
