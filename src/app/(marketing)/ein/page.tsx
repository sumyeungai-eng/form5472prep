import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck, Phone, FileText, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "EIN for Foreign-Owned US LLC — No Passport Mailing | Form5472 Prep",
  description:
    "Get a US Employer Identification Number (EIN) for your foreign-owned LLC without mailing your passport. As a Certifying Acceptance Agent (CAA), we certify your identity — IRS Form SS-4 prepared and submitted on your behalf. Flat fee $149.",
  alternates: { canonical: "https://www.form5472prep.com/ein" },
};

const faq = [
  {
    q: "What is an EIN and why do I need one?",
    a: "An EIN (Employer Identification Number) is a 9-digit US tax ID issued by the IRS to business entities. Your LLC needs an EIN to open a US business bank account (Mercury, Relay, Chase), set up Stripe or PayPal, hire US contractors, file Form 5472, and sign certain contracts. Without an EIN you can't operate a US LLC in any meaningful way.",
  },
  {
    q: "Can't I just apply myself on the IRS website?",
    a: "The online EIN application (irs.gov) is only available if you have a US Social Security Number or ITIN. Foreign nationals without a US tax ID cannot use the online tool. The only option is to file Form SS-4 by fax or phone, which we handle on your behalf.",
  },
  {
    q: "What is a Certifying Acceptance Agent (CAA) and why does it matter?",
    a: "A CAA is an individual authorized by the IRS to certify identity and foreign status documents. Because we hold CAA authorization, we can certify a copy of your passport — so the IRS accepts it without requiring you to mail your original passport. This removes the biggest friction point for non-resident EIN applicants.",
  },
  {
    q: "What documents do I need to provide?",
    a: "A clear copy of your passport (photo page), your LLC formation document (Articles of Organization or Certificate of Formation), and a short questionnaire about your LLC's business purpose. We guide you through all of it after you order.",
  },
  {
    q: "How long does it take to get the EIN?",
    a: "Typically 1–5 business days once we have your documents. We call the IRS Business & Specialty Tax Line on your behalf and can often obtain the EIN on the call. Complex cases (e.g., trusts as members) may take slightly longer.",
  },
  {
    q: "What do I receive at the end?",
    a: "Your 9-digit EIN, delivered by email. You also receive a copy of the completed Form SS-4 for your records. The IRS mails the official CP 575 confirmation letter to your LLC address within 4–6 weeks — this is the document banks sometimes ask for.",
  },
  {
    q: "Do I need an EIN to file Form 5472?",
    a: "Yes — Form 5472 requires your LLC's EIN in the header. If you need both an EIN and a Form 5472 filing, we can handle both. Ask about our bundle when you order.",
  },
  {
    q: "What if my LLC already has an EIN?",
    a: "Then you don't need this service. If you've lost or forgotten your EIN, we can also help retrieve it — contact support@form5472prep.com.",
  },
];

const steps = [
  {
    icon: FileText,
    title: "Complete the intake form",
    body: "A short questionnaire about your LLC (name, state, business purpose) and owner (name, country, passport details). Takes about 5 minutes.",
  },
  {
    icon: ShieldCheck,
    title: "CAA identity certification",
    body: "We certify your passport copy as a Certifying Acceptance Agent. No need to mail original documents to the IRS — a certified copy is accepted.",
  },
  {
    icon: Phone,
    title: "We contact the IRS",
    body: "We prepare Form SS-4 and call the IRS Business & Specialty Tax Line on your behalf to obtain the EIN directly.",
  },
  {
    icon: CheckCircle2,
    title: "EIN delivered to you",
    body: "You receive your 9-digit EIN by email, plus a copy of your completed Form SS-4. CP 575 confirmation letter follows by mail from the IRS.",
  },
];

export default function EinPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-accent-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20 grid md:grid-cols-[1fr_340px] gap-12 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 mb-6">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Certifying Acceptance Agent — no passport mailing
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 text-balance leading-tight">
              Get a US EIN<br />
              <span className="text-accent">without mailing your passport.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Foreign nationals cannot use the IRS online EIN tool — it requires a US Social Security
              Number. We prepare Form SS-4 and call the IRS on your behalf, and as a{" "}
              <strong>Certifying Acceptance Agent (CAA)</strong> we certify your identity documents so
              the IRS accepts a copy of your passport instead of the original.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "No passport mailing — CAA-certified copy accepted by IRS",
                "Form SS-4 prepared and submitted on your behalf",
                "EIN delivered by email in 1–5 business days",
                "Copy of completed Form SS-4 included",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 sticky top-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">EIN Acquisition</p>
            <p className="text-4xl font-semibold text-slate-900">$149</p>
            <p className="text-sm text-slate-500 mt-1">Flat fee · one-time · no subscription</p>
            <Link
              href="mailto:support@form5472prep.com?subject=EIN%20application%20enquiry"
              className="mt-5 flex items-center justify-center gap-2 w-full h-11 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-700 transition-colors"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="mt-2 flex items-center justify-center w-full h-10 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See Form 5472 filing plans
            </Link>
            <ul className="mt-5 space-y-1.5 text-xs text-slate-600">
              {[
                "No original passport required",
                "CAA certification included",
                "Form SS-4 prepared for you",
                "IRS call handled by us",
                "EIN by email in 1–5 business days",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-10">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="h-10 w-10 rounded-full bg-accent-50 border border-accent/20 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Step {i + 1}</p>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is an EIN — background */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-5">What is an EIN?</h2>
          <div className="prose prose-slate prose-sm max-w-none space-y-4 text-slate-600 leading-relaxed">
            <p>
              An <strong className="text-slate-800">Employer Identification Number (EIN)</strong> is a
              nine-digit number in the format XX-XXXXXXX assigned by the IRS to identify a business
              entity for US federal tax purposes. Despite the name, you don&apos;t need employees to get one
              — every US LLC should have an EIN.
            </p>
            <p>
              For a foreign-owned single-member LLC, the EIN is required to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Open a US business bank account (Mercury, Relay, Brex, Chase, etc.)</li>
              <li>Set up US payment processors (Stripe, PayPal, Square)</li>
              <li>File IRS Form 5472 and the attached pro forma Form 1120</li>
              <li>Sign contracts and agreements that require a US tax ID</li>
              <li>Issue 1099-NEC forms to US contractors you pay</li>
              <li>Apply for an ITIN (the ITIN application requires an EIN)</li>
            </ul>
            <p>
              The IRS issues EINs by phone, fax, or mail via Form SS-4. For foreign-owned entities, the
              online portal is unavailable — you must go through the paper/phone process. We handle this
              for you.
            </p>
          </div>
        </div>
      </section>

      {/* Why CAA matters */}
      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              Certifying Acceptance Agent
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Why CAA authorization matters for EIN applicants
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The IRS requires proof of identity when you apply for an EIN as a foreign national. Without
              a CAA, applicants typically have to mail their <strong>original passport</strong> to the IRS
              and wait months to get it back — a significant inconvenience and risk.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              As an IRS-authorized Certifying Acceptance Agent, we are permitted to{" "}
              <strong>certify copies of your identity documents</strong> rather than requiring originals.
              The IRS accepts our certified copy in lieu of the original, so your passport never leaves
              your hands.
            </p>
            <p className="text-slate-600 leading-relaxed">
              CAA authorization is granted by the IRS after a background check, training, and passing
              a competency exam — it&apos;s not a self-declared status.
            </p>
          </div>
          <div className="rounded-xl border border-accent/20 bg-white p-6 space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2 rounded-lg border border-red-100 bg-red-50 p-4 text-xs text-red-700">
                <p className="font-semibold mb-2 text-red-800">Without CAA</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>Mail original passport to IRS</li>
                  <li>Wait 4–6 weeks for return</li>
                  <li>Risk of passport loss in mail</li>
                  <li>Can&apos;t travel while passport is away</li>
                </ul>
              </div>
              <div className="w-1/2 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-700">
                <p className="font-semibold mb-2 text-emerald-800">With our CAA</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>Send us a passport copy</li>
                  <li>We certify it for the IRS</li>
                  <li>Passport stays with you</li>
                  <li>EIN in 1–5 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {faq.map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-accent text-white text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl font-semibold mb-3">Ready to get your EIN?</h2>
          <p className="text-accent-100 mb-6 text-sm leading-relaxed">
            Flat fee of $149. No passport mailing. EIN delivered in 1–5 business days.
          </p>
          <Link
            href="mailto:support@form5472prep.com?subject=EIN%20application%20enquiry"
            className="inline-flex items-center gap-2 bg-white text-accent font-semibold text-sm px-6 py-3 rounded-md hover:bg-accent-50 transition-colors"
          >
            Email us to get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-accent-200">
            Also need to file Form 5472?{" "}
            <Link href="/pricing" className="underline hover:no-underline">
              See our filing plans →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
