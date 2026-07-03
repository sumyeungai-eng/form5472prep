import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck, FileText, Clock, ArrowRight, UserCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  // `absolute` skips the root layout's "%s · Form5472 Prep" template so the
  // brand isn't doubled (the title already ends in "| Form5472 Prep").
  title: { absolute: "ITIN for Non-Residents — No Passport Mailing | Form5472 Prep" },
  description:
    "Get a US Individual Taxpayer Identification Number (ITIN) without mailing your original passport. As a Certifying Acceptance Agent (CAA), we certify your identity documents and submit Form W-7 to the IRS on your behalf. Flat fee $349.",
  alternates: { canonical: "https://www.form5472prep.com/itin" },
  openGraph: {
    title: "ITIN for Non-Residents — No Passport Mailing",
    description:
      "As a Certifying Acceptance Agent (CAA), we certify your identity documents and submit Form W-7 to the IRS. No passport mailing. Flat fee $349.",
    url: "https://www.form5472prep.com/itin",
  },
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
      <ItinStructuredData />
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(55% 55% at 20% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20 grid md:grid-cols-[1fr_340px] gap-12 items-start">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100 mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              Certifying Acceptance Agent — no passport mailing
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.08]">
              Get a US ITIN<br />
              <span className="text-accent-100">without mailing your passport.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-xl">
              Non-residents applying for an ITIN normally have to mail their original passport to the IRS
              and wait months for it back. As an{" "}
              <strong className="text-white">IRS-authorized Certifying Acceptance Agent (CAA)</strong>, we certify your
              identity documents so the IRS accepts a certified copy — your passport stays with you.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "No original passport mailing — CAA-certified copy accepted",
                "Form W-7 prepared and submitted on your behalf",
                "ITIN issued in 6–11 weeks (IRS processing time)",
                "ITIN renewals also available",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA card */}
          <div className="rounded-2xl bg-white text-slate-900 ring-1 ring-black/5 shadow-2xl shadow-black/30 p-6 sticky top-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent mb-1">ITIN Acquisition</p>
            <p className="font-serif text-5xl font-semibold text-ink">$349</p>
            <p className="text-sm text-slate-500 mt-1">Flat fee · one-time · no subscription</p>
            <Link
              href="/itin/apply"
              className="mt-5 flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-700 transition-colors"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ein"
              className="mt-2 flex items-center justify-center w-full h-10 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
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
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-10">How it works</h2>
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
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-5">What is an ITIN?</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-4">
            <p>
              An <strong className="text-slate-800">Individual Taxpayer Identification Number (ITIN)</strong>{" "}
              is a tax processing number issued by the IRS to individuals who need a US taxpayer ID but
              are not eligible for a Social Security Number. ITINs are for tax purposes only — they
              don&apos;t authorize work in the US or provide eligibility for Social Security benefits.
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
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent mb-3">
              Certifying Acceptance Agent
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-4">
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
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-8">Frequently asked questions</h2>
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
            href="/itin/apply"
            className="inline-flex items-center gap-2 bg-white text-accent font-semibold text-sm px-6 py-3 rounded-md hover:bg-accent-50 transition-colors"
          >
            Start your ITIN application
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

// Structured data for search + AI answer engines.
// - Service + Offer surfaces the $349 ITIN offering with price for AEO/GEO.
// - FAQPage (shares the rendered `faq` array) powers Google's FAQ rich result.
// - BreadcrumbList + WebPage/Speakable round out the entity graph.
function ItinStructuredData() {
  const url = `${env.appUrl}/itin`;

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "ITIN (Form W-7) preparation and CAA certification",
    name: "ITIN Acquisition for Non-Residents",
    provider: { "@type": "Organization", name: "Form5472 Prep", url: env.appUrl },
    areaServed: { "@type": "Country", name: "United States" },
    audience: {
      "@type": "Audience",
      audienceType: "Non-resident individuals requiring a US Individual Taxpayer Identification Number",
    },
    description:
      "IRS Form W-7 preparation with Certifying Acceptance Agent (CAA) document certification — no original passport mailing required. We certify your identity documents and submit your ITIN application to the IRS.",
    offers: {
      "@type": "Offer",
      name: "ITIN Acquisition — flat fee",
      price: "349.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.appUrl },
      { "@type": "ListItem", position: 2, name: "ITIN Acquisition", item: url },
    ],
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: "ITIN for Non-Residents — No Passport Mailing",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "section p"],
    },
  };

  return (
    <>
      <JsonLd data={service} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPage} />
    </>
  );
}
