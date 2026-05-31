"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Input, Select, Label, Field } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/countries";

const ITIN_REASONS = [
  { code: "a", label: "A — Nonresident alien required to get ITIN to claim tax treaty benefit" },
  { code: "b", label: "B — US resident alien (based on days present in the US)" },
  { code: "c", label: "C — Dependent of a US citizen or resident alien" },
  { code: "d", label: "D — Spouse of a US citizen or resident alien" },
  { code: "e", label: "E — Nonresident alien student, professor, or researcher filing a US return" },
  { code: "f", label: "F — Nonresident alien dependent of a nonimmigrant visa holder" },
  { code: "g", label: "G — Electing to be treated as a resident alien (IRC 6013g/h)" },
  { code: "h", label: "H — Other — required to file a US tax return or claim an exception" },
];

type Status = "idle" | "submitting" | "success" | "error";

export default function ItinApplyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    dateOfBirth: "", countryOfBirth: "", citizenship: "", countryOfResidence: "",
    itinReason: "", taxReturnType: "", usActivity: "",
    passportNumber: "", passportExpiry: "",
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
      const res = await fetch("/api/itin-application", {
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
            We&apos;ve sent a confirmation to <strong>{form.email}</strong>.
          </p>
          <p className="text-slate-600 mb-8">
            Our team will reach out within 1 business day with a document checklist, CAA certification
            appointment details, and a payment link.
          </p>
          <Link href="/itin" className="text-sm text-accent hover:underline">
            ← Back to ITIN service page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      {/* Breadcrumb */}
      <Link href="/itin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8">
        <ArrowLeft className="h-3.5 w-3.5" />
        ITIN service
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">ITIN Application</h1>
        <p className="mt-2 text-slate-600">
          Fill in what you know — we&apos;ll follow up within 1 business day with a document checklist,
          CAA certification appointment, and payment link. Nothing is submitted to the IRS until
          you&apos;ve paid and approved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Contact */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            Your contact details
          </h2>
          <div className="space-y-4">
            <Field label="Full legal name" hint="Exactly as it appears on your passport">
              <Input required value={form.fullName} onChange={set("fullName")} placeholder="First Middle Last" />
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

        {/* Personal Info */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            Personal information
          </h2>
          <div className="space-y-4">
            <Field label="Date of birth">
              <Input required type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
            </Field>
            <Field label="Country of birth">
              <Select value={form.countryOfBirth} onChange={set("countryOfBirth")}>
                <option value="">Select a country…</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </Select>
            </Field>
            <Field label="Country of citizenship">
              <Select value={form.citizenship} onChange={set("citizenship")}>
                <option value="">Select a country…</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </Select>
            </Field>
            <Field label="Country of residence">
              <Select value={form.countryOfResidence} onChange={set("countryOfResidence")}>
                <option value="">Select a country…</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </Select>
            </Field>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* ITIN Reason */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            Why do you need an ITIN?
          </h2>
          <div className="space-y-4">
            <Field
              label="W-7 reason"
              hint="Not sure? Pick the closest option — we will confirm the right code when we review your application."
            >
              <Select required value={form.itinReason} onChange={set("itinReason")}>
                <option value="">Select a reason…</option>
                {ITIN_REASONS.map((r) => (
                  <option key={r.code} value={r.label}>{r.label}</option>
                ))}
              </Select>
            </Field>
            <Field
              label="US tax return type"
              hint="Only required if your reason involves filing a US tax return"
            >
              <Select value={form.taxReturnType} onChange={set("taxReturnType")}>
                <option value="">Not applicable / not sure</option>
                <option value="1040-NR">Form 1040-NR (Non-resident alien income tax return)</option>
                <option value="1040">Form 1040 (Resident alien income tax return)</option>
                <option value="1040-NR-EZ">Form 1040-NR-EZ</option>
                <option value="Other">Other</option>
              </Select>
            </Field>
            <Field
              label="US activity description"
              hint="Brief description of your US income or connection — e.g. 'rental income from US property', 'dividends from US stocks', 'US LLC distributions'"
            >
              <Input value={form.usActivity} onChange={set("usActivity")} placeholder="What US income or activity requires the ITIN?" />
            </Field>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Passport */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            Passport details
          </h2>
          <div className="space-y-4">
            <Field label="Passport number" hint="Optional at this stage — required before we submit">
              <Input value={form.passportNumber} onChange={set("passportNumber")} placeholder="A1234567" />
            </Field>
            <Field label="Passport expiry date" hint="Your passport must be valid at the time of submission">
              <Input type="date" value={form.passportExpiry} onChange={set("passportExpiry")} />
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
          <strong>Flat fee: $349</strong> — payment will be collected after we review your application
          and schedule the CAA certification. Nothing is charged today.
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
