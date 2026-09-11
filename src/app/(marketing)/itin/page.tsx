import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck, FileText, Clock, ArrowRight, UserCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import {
  CONTENT_LAST_REVIEWED,
  SPEAKABLE,
  breadcrumbList,
  howTo,
  organizationNode,
  pageMeta,
} from "@/lib/seo";

const ITIN_DESCRIPTION =
  "ITIN application support for non-residents. Eligible applications are forwarded to an IRS-authorized Certifying Acceptance Agent for document review.";

export const metadata: Metadata = {
  // `absolute` skips the root layout's "%s · Form5472 Prep" template so the
  // brand isn't doubled (the title already ends in "| Form5472 Prep").
  title: { absolute: "ITIN Application Support for Non-Residents | Form5472 Prep" },
  description: ITIN_DESCRIPTION,
  ...pageMeta({
    title: "ITIN Application Support for Non-Residents",
    description: ITIN_DESCRIPTION,
    path: "/itin",
  }),
};

const faq = [
  {
    q: "What is an ITIN?",
    a: "An Individual Taxpayer Identification Number (ITIN) is a 9-digit tax ID issued by the IRS to individuals who need to file or be identified on a US tax return but are not eligible for a Social Security Number. It's in the format 9XX-XX-XXXX.",
  },
  {
    q: "Who needs an ITIN?",
    a: "An ITIN is for an individual who has a federal tax reason to be identified on a US return or meets a documented IRS exception, and who cannot obtain an SSN. A bank request, Form W-8BEN, or LLC ownership alone does not automatically establish eligibility.",
  },
  {
    q: "Do I need an ITIN to run my US LLC?",
    a: "Not always. Many foreign-owned US LLC owners use the LLC's EIN and do not need an ITIN personally. An ITIN application needs the owner's separate federal tax reason and supporting package; business ownership by itself is not one.",
  },
  {
    q: "What is a Certifying Acceptance Agent and why does it matter?",
    a: "A CAA is an IRS-authorized person or firm that can authenticate most permitted ITIN supporting documents. We forward eligible applications to an IRS-authorized CAA for review. The CAA determines the document route; some documents and situations may still require originals or issuing-agency-certified copies.",
  },
  {
    q: "What documents do I need?",
    a: "The package normally includes Form W-7, current identity and foreign-status evidence, and either a US federal return or the documents for a specific IRS exception. A valid passport is usually the only stand-alone document, but the required evidence depends on the reason for applying.",
  },
  {
    q: "How long does the ITIN take?",
    a: "The IRS says to allow 7 weeks for an ITIN status notice, or 9–11 weeks if you apply during January 15–April 30 or from overseas. Those are IRS timeframes, not a guaranteed issuance date, and incomplete packages can require more information.",
  },
  {
    q: "What is the difference between an EIN and an ITIN?",
    a: "An EIN is assigned to a business entity (your LLC). An ITIN is assigned to an individual. Your LLC has an EIN; you as a person would have an ITIN (or SSN). Most foreign-owned single-member LLC owners need an EIN for the LLC but may or may not need an ITIN for themselves.",
  },
  {
    q: "Can I apply for an ITIN and EIN at the same time?",
    a: "An EIN and an ITIN identify different taxpayers: the LLC and the individual. Start only the application that has a real federal purpose; an ITIN should not be ordered merely because the LLC needs an EIN.",
  },
  {
    q: "My ITIN expired. Can you renew it?",
    a: "An ITIN generally expires after three consecutive years of nonuse on a US federal return. Renew only when it will be used on a return or another IRS rule requires it; the renewal still needs a qualifying reason and supporting documentation.",
  },
];

const steps = [
  {
    icon: FileText,
    title: "Confirm you need an ITIN",
    anchor: "#step-1",
    body: "Confirm that you need an ITIN before collecting documents. An ITIN is a nine-digit tax ID issued by the IRS to individuals who must file or be identified on a US tax return but are not eligible for a Social Security Number. Many foreign-owned US LLC owners operate with just the LLC's EIN and never need one, so we check eligibility first and email you a short document checklist within 1 business day.",
  },
  {
    icon: UserCheck,
    title: "Submit your documents",
    anchor: "#step-2",
    body: "Send the identity documents on the checklist through the secure upload. Your passport is the key document: it is the one item that proves both identity and foreign status on its own. You keep the original — nothing is mailed to the IRS, because a CAA-certified copy is accepted in place of the original, and that certification happens in the next step.",
  },
  {
    icon: FileText,
    title: "Complete the CAA certification",
    anchor: "#step-3",
    body: "We forward your application to an IRS-authorized Certifying Acceptance Agent, who verifies your identity documents by video call or secure upload and certifies them. The IRS accepts that certification in place of your original passport, which stays with you throughout. Once the certification is complete, we prepare your Form W-7 with the certification attached, ready for submission.",
  },
  {
    icon: Clock,
    title: "Send the W-7 package",
    anchor: "#step-4",
    body: "We submit the Form W-7 package to the IRS ITIN Unit with the certification attached. The IRS says to allow about 7 weeks for a status notice, or 9–11 weeks when applying from overseas or between January 15 and April 30. These are IRS processing estimates and are outside our control, so plan any filing that depends on the ITIN around them.",
  },
  {
    icon: CheckCircle2,
    title: "Confirm the IRS notice",
    anchor: "#step-5",
    body: "Completion is the IRS notice assigning your ITIN, sent to the mailing address on Form W-7. Keep it with your records and use the number wherever a US tax filing asks for it. If the IRS writes to request more information instead, respond by the deadline in the notice; the application stays open until you do, so treat silence as pending, not as approval.",
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
              ITIN application support
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.08]">
              Check whether you may need<br />
              <span className="text-accent-100">an ITIN for a federal tax purpose.</span>
            </h1>
            <p data-speakable className="mt-6 text-lg leading-relaxed text-slate-300 max-w-xl">
              An ITIN is an individual federal tax number, not a general business or banking ID. If you
              cannot obtain an SSN and have a qualifying federal tax reason, we can assess whether our
              application service fits. Eligible applications are forwarded to an{" "}
              <strong className="text-white">IRS-authorized Certifying Acceptance Agent (CAA)</strong>{" "}
              for document review; the available document route depends on the applicant and documents.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "Eligibility assessed before document collection",
                "Eligible applications forwarded to an IRS-authorized CAA",
                "IRS status notice: generally 7 weeks; 9–11 in peak season or overseas",
                "Renewal requests assessed under the same federal-purpose rules",
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
              Start ITIN application
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
                "Individual federal tax-purpose review",
                "CAA referral for eligible requests",
                "Document route confirmed for your case",
                "Form W-7 package preparation",
                "IRS decision remains outside our control",
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
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-4">How does the ITIN service work?</h2>
          <p className="mb-10 max-w-3xl text-sm leading-relaxed text-slate-600">
            You confirm the ITIN need, submit documents, complete CAA certification, send the W-7 package, and confirm the IRS notice.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title}>
                <div className="h-10 w-10 rounded-full bg-accent-50 border border-accent/20 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Step {i + 1}</p>
                <h3 id={step.anchor.slice(1)} className="text-sm font-semibold text-slate-900 mb-2">{step.title}</h3>
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
              <li>Filing a US federal return that requires the individual&apos;s tax ID</li>
              <li>Being an eligible spouse or dependent on a US return</li>
              <li>Using one of the narrowly documented{" IRS"} exceptions to the return requirement</li>
            </ul>
            <p>
              Most applicants submit Form W-7 with a federal return; an exception needs its own evidence.
              The IRS says to allow 7 weeks for a status notice, or 9–11 weeks in peak season or when
              applying from overseas. It may request more information or reject an incomplete application.
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
              How do you choose the document route for your case?
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Direct mail generally requires original documents or copies certified by the issuing agency.
              The IRS says it will return mailed supporting documents to the Form W-7 mailing address
              within 60 days. An IRS Taxpayer Assistance Center, participating VITA site, or an eligible
              CAA route can authenticate certain documents and return them at the appointment or review.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              A CAA can authenticate <strong>most permitted supporting documents</strong>, but IRS rules
              limit what a CAA can authenticate, especially for some dependent and foreign military-ID
              cases. Document authentication is not an ITIN approval, and it does not replace the tax
              return or exception evidence.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We forward eligible requests to an IRS-authorized CAA for review. The application opens
              paid checkout before team review. If you are unsure about eligibility, documents, or
              whether related return preparation is included, <Link href="/contact" className="text-accent underline">contact us before purchasing</Link>.
            </p>
          </div>
          <div className="rounded-xl border border-accent/20 bg-white p-6 space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2 rounded-lg border border-red-100 bg-red-50 p-4 text-xs text-red-700">
                <p className="font-semibold mb-2 text-red-800">Direct mail</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>Originals or issuing-{"agency-certified"} copies</li>
                  <li>IRS returns mailed documents within 60 days</li>
                  <li>Self-prepared package or separate adviser</li>
                  <li>IRS reviews the application</li>
                </ul>
              </div>
              <div className="w-1/2 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-700">
                <p className="font-semibold mb-2 text-emerald-800">CAA or in-person route</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>Authentication of most eligible documents</li>
                  <li>Document limits still apply</li>
                  <li>CAA services may be available abroad</li>
                  <li>Same IRS processing decision</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-8">What ITIN questions do non-residents ask?</h2>
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
          <h2 className="text-2xl font-semibold mb-3">Get help with your ITIN application</h2>
          <p className="text-accent-100 mb-6 text-sm leading-relaxed">
            You need an individual federal tax purpose and a suitable document route. Application
            submission leads to paid checkout before team review. Contact us first if unsure; IRS assignment is never guaranteed.
          </p>
          <Link
            href="/itin/apply"
            className="inline-flex items-center gap-2 bg-white text-accent font-semibold text-sm px-6 py-3 rounded-md hover:bg-accent-50 transition-colors"
          >
            Start ITIN application
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
    serviceType: "ITIN (Form W-7) application support and CAA referral",
    name: "ITIN Acquisition for Non-Residents",
    provider: organizationNode(),
    dateModified: CONTENT_LAST_REVIEWED,
    areaServed: { "@type": "Country", name: "United States" },
    audience: {
      "@type": "Audience",
      audienceType: "Non-resident individuals requiring a US Individual Taxpayer Identification Number",
    },
    description:
      "ITIN application support for eligible requests, which are forwarded to an IRS-authorized Certifying Acceptance Agent for document review. The available document route depends on the applicant and supporting documents.",
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

  const breadcrumb = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "ITIN Acquisition", path: "/itin" },
  ]);

  const howToSchema = howTo({
    name: "How to apply for an ITIN with support",
    description: ITIN_DESCRIPTION,
    url,
    totalTime: "PT20M", // Customer hands-on time for eligibility and document steps, not IRS processing time.
    steps: steps.map(({ title, body, anchor }) => ({ name: title, text: body, anchor })),
    tools: ["Form W-7", "IRS-authorized Certifying Acceptance Agent review"],
    supplies: ["Federal tax reason or IRS exception evidence", "Identity and foreign-status documents"],
  });

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: "ITIN Application Support for Non-Residents",
    dateModified: CONTENT_LAST_REVIEWED,
    speakable: SPEAKABLE,
  };

  return (
    <>
      <JsonLd data={service} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={howToSchema} />
      <JsonLd data={webPage} />
    </>
  );
}
