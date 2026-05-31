import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck, FileText, Clock, ArrowRight, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "ITIN for Non-Residents — CAA Certification, No Passport Mailing | Form5472 Prep",
  description:
    "Get a US Individual Taxpayer Identification Number (ITIN) without mailing your original passport. As a Certifying Acceptance Agent (CAA), we certify your identity documents and submit Form W-7 to the IRS on your behalf. Flat fee $349.",
  alternates: { canonical: "https://www.form5472prep.com/itin" },
};

const faq = [
  {
    q: "What is an ITIN?",
    a: "An Individual Taxpayer Identification Number (ITIN) is a 9-digit tax ID issued by the IRS to individuals who need to file or be identified on a US tax return but are not eligible for a Social Security Number. It's in the format 9XX-XX-XXXX.",
  },
  {
    q: "Who needs an ITIN?",
    a: "Non-resident and resident aliens who: (1) receive US-source income subject to withholding (e.g. rental income, dividends, royalties); (2) are required to file a US tax return; (3) are claimed as dependents on a US tax return; or (4) need a US tax ID for other purposes such as opening certain bank accounts or completing W-8BEN forms.",
  },
  {
    q: "Do I need an ITIN to run my US LLC?",
    a: "Not always. Many foreign-owned US LLC owners operate with just an EIN and never need an ITIN. You may need an ITIN if you receive US-source income that is reportable on a personal tax return, or if a withholding agent (such as a broker or payer) requires one. If you're unsure, email us and we'll help you figure it out.",
  },
  {
    q: "What is a Certifying Acceptance Agent and why does it matter?",
    a: "A CAA is authorized by the IRS to verify and certify identity documents for ITIN applications. Without a CAA, you must mail your original passport to the IRS and wait several months for it to be returned — a major inconvenience. As a CAA, we review and certify your documents, so the IRS accepts our certification in place of the original. Your passport stays with you.",
  },
  {
    q: "What documents do I need?",
    a: "A valid passport (primary identity document), proof of foreign status (often the same passport), and any supporting tax documents required for your specific W-7 reason code (e.g. a US tax return, withholding agent letter, or exception documentation). We will tell you exactly what applies to your situation after you contact us.",
  },
  {
    q: "How long does the ITIN take?",
    a: "The IRS typically issues ITINs within 6–11 weeks of receiving a complete W-7 application. During peak filing season (January–April) it can take longer. We submit your application promptly after completing the certification; IRS processing time is outside our control.",
  },
  {
    q: "What is the difference between an EIN and an ITIN?",
    a: "An EIN is assigned to a business entity (your LLC). An ITIN is assigned to an individual. Your LLC has an EIN; you as a person would have an ITIN (or SSN). Most foreign-owned single-member LLC owners need an EIN for the LLC but may or may not need an ITIN for themselves.",
  },
  {
    q: "Can I apply for an ITIN and EIN at the same time?",
    a: "Yes — we can handle both. Contact us and we'll coordinate them. Note that EINs are usually obtained faster (1–5 business days) than ITINs (6–11 weeks).",
  },
  {
    q: "My ITIN expired. Can you renew it?",
    a: "Yes. ITINs that haven't been used on a US federal tax return in the past three years expire. Renewal uses the same Form W-7 process with CAA certification. Contact us to renew.",
  },
];

const steps = [
  {
    icon: FileText,
    title: "Intake & eligibility check",
    body: "Tell us why you need an ITIN (W-7 reason code). We confirm your eligibility and tell you exactly which documents are required for your situation.",
  },
  {
    icon: UserCheck,
    title: "CAA identity certification",
    body: "We review your passport and other required documents via a video call or secure document upload, then certify them as an IRS-authorized CAA. No mailing required.",
  },
  {
    icon: FileText,
    title: "Form W-7 prepared and submitted",
    body: "We prepare your Form W-7 application and submit it to the IRS ITIN Unit with our CAA certification attached.",
  },
  {
    icon: Clock,
    title: "ITIN issued in 6–11 weeks",
    body: "The IRS mails your ITIN assignment letter to your address. We'll help you follow up if there are any IRS questions.",
  },
];

export default function ItinPage() {
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
              Get a US ITIN<br />
              <span className="text-accent">without mailing your passport.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Non-residents applying for an ITIN normally have to mail their original passport to the IRS
              and wait months for it back. As an{" "}
              <strong>IRS-authorized Certifying Acceptance Agent (CAA)</strong>, we certify your
              identity documents so the IRS accepts a certified copy — your passport stays with you.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "No original passport mailing — CAA-certified copy accepted",
                "Form W-7 prepared and submitted on your behalf",
                "ITIN issued in 6–11 weeks (IRS processing time)",
                "ITIN renewals also available",
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
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">ITIN Acquisition</p>
            <p className="text-4xl font-semibold text-slate-900">$349</p>
            <p className="text-sm text-slate-500 mt-1">Flat fee · one-time · no subscription</p>
            <Link
              href="mailto:support@form5472prep.com?subject=ITIN%20application%20enquiry"
              className="mt-5 flex items-center justify-center gap-2 w-full h-11 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-700 transition-colors"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ein"
              className="mt-2 flex items-center justify-center w-full h-10 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Need an EIN instead? →
            </Link>
            <ul className="mt-5 space-y-1.5 text-xs text-slate-600">
              {[
                "No original passport required",
                "CAA certification included",
                "Form W-7 prepared for you",
                "Submitted to IRS ITIN Unit",
                "Renewals also handled",
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
              <div key={step.title}>
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

      {/* What is an ITIN */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-5">What is an ITIN?</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-4">
            <p>
              An <strong className="text-slate-800">Individual Taxpayer Identification Number (ITIN)</strong>{" "}
              is a tax processing number issued by the IRS to individuals who need a US taxpayer ID but
              are not eligible for a Social Security Number. ITINs are for tax purposes only — they
              don't authorize work in the US or provide eligibility for Social Security benefits.
            </p>
            <p>Common reasons non-residents need an ITIN:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Filing a US non-resident tax return (Form 1040-NR)</li>
              <li>Receiving US-source income subject to withholding (rental income, royalties, dividends)</li>
              <li>Being claimed as a dependent or spouse on a US tax return</li>
              <li>Opening certain US bank or brokerage accounts</li>
              <li>Completing Form W-8BEN for US withholding agents</li>
            </ul>
            <p>
              ITINs are issued by the IRS after a review of Form W-7 along with certified identity
              documentation. The process typically takes 6–11 weeks once a complete application is
              submitted.
            </p>
          </div>
        </div>
      </section>

      {/* CAA section */}
      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              Certifying Acceptance Agent
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Why a CAA is the right way to apply
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Without a CAA, Form W-7 applicants must mail their <strong>original passport</strong>{" "}
              (or other primary identity document) to the IRS and wait 4–6 months for it to be returned
              — during which time they cannot travel internationally.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              As an IRS-authorized CAA, we can <strong>certify your identity documents</strong> in place
              of the originals. The IRS accepts our certification, so your passport stays with you at all
              times.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We verify your documents via a secure process, prepare your W-7, attach our CAA
              certification, and submit everything to the IRS ITIN Unit.
            </p>
          </div>
          <div className="rounded-xl border border-accent/20 bg-white p-6 space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2 rounded-lg border border-red-100 bg-red-50 p-4 text-xs text-red-700">
                <p className="font-semibold mb-2 text-red-800">Without CAA</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>Mail original passport to IRS</li>
                  <li>Wait 4–6 months for return</li>
                  <li>No international travel</li>
                  <li>Risk of loss in transit</li>
                </ul>
              </div>
              <div className="w-1/2 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-700">
                <p className="font-semibold mb-2 text-emerald-800">With our CAA</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>Share a passport copy with us</li>
                  <li>We certify it for the IRS</li>
                  <li>Passport stays with you</li>
                  <li>Travel freely while waiting</li>
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
          <h2 className="text-2xl font-semibold mb-3">Ready to get your ITIN?</h2>
          <p className="text-accent-100 mb-6 text-sm leading-relaxed">
            Flat fee of $349. No passport mailing. CAA certification included.
          </p>
          <Link
            href="mailto:support@form5472prep.com?subject=ITIN%20application%20enquiry"
            className="inline-flex items-center gap-2 bg-white text-accent font-semibold text-sm px-6 py-3 rounded-md hover:bg-accent-50 transition-colors"
          >
            Email us to get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-accent-200">
            Also need an EIN for your LLC?{" "}
            <Link href="/ein" className="underline hover:no-underline">
              See our EIN service →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
