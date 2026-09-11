import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck, Phone, FileText, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { EIN_APPLICATION_FAQ } from "@/lib/einApplicationFaq";
import { env } from "@/lib/env";
import {
  CONTENT_LAST_REVIEWED,
  SPEAKABLE,
  breadcrumbList,
  howTo,
  organizationNode,
  pageMeta,
} from "@/lib/seo";

export const metadata: Metadata = {
  // `absolute` skips the root layout's "%s · Form5472 Prep" template so the
  // brand isn't doubled (the title already ends in "| Form5472 Prep").
  title: { absolute: "EIN for Foreign-Owned US LLC — No SSN Needed | Form5472 Prep" },
  description:
    "EIN for foreign-owned US LLCs: $149 flat fee, no SSN or ITIN required. We prepare Form SS-4 and get your EIN directly from the IRS.",
  ...pageMeta({
    title: "EIN for Foreign-Owned US LLC — No SSN Needed",
    description:
      "EIN for foreign-owned US LLCs: $149 flat fee, no SSN or ITIN required. We prepare Form SS-4 and get your EIN directly from the IRS.",
    path: "/ein",
  }),
};

const serviceFaq = [
  {
    q: "What is an EIN and why do I need one?",
    a: "An EIN (Employer Identification Number) is a 9-digit US tax ID issued by the IRS to business entities. Your LLC needs an EIN to open a US business bank account (Mercury, Relay, Chase), set up Stripe or PayPal, hire US contractors, file Form 5472, and sign certain contracts. Without an EIN you can't operate a US LLC in any meaningful way.",
  },
  {
    q: "Can't I just apply myself on the IRS website?",
    a: "The online EIN application (irs.gov) is only available if you have a US Social Security Number or ITIN. Foreign nationals without a US tax ID cannot use the online tool. The only option is to file Form SS-4 by fax or phone, which we handle on your behalf.",
  },
  {
    q: "Do I need to mail my passport or get documents certified for an EIN?",
    a: "No. Unlike an ITIN application, an EIN does not require you to submit or certify any identity documents. On Form SS-4, line 7b, a responsible party without a US tax ID simply enters \"Foreign.\" That's the entire identity requirement — there is no passport to mail and nothing to certify.",
  },
  {
    q: "What information do I need to provide?",
    a: "Your LLC's legal name and formation state, your LLC formation document (Articles of Organization or Certificate of Formation), your name and country as the responsible party, and a short description of the business activity. We guide you through all of it after you order — no passport copy needed.",
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

const faq = [...serviceFaq, ...EIN_APPLICATION_FAQ];

const steps = [
  {
    icon: FileText,
    title: "Complete the intake form",
    anchor: "#step-1",
    body: "Complete the seven-question intake form: company name, the owner's full legal name as it appears on their documents, the company's business mailing address, the owner's home address, business type (LLC, Inc. or sole proprietor), business activity, and the principal line of products or services. We also ask for the owner's date of birth. There is no passport to mail and no formation document to certify.",
  },
  {
    icon: FileText,
    title: "We prepare Form SS-4",
    anchor: "#step-2",
    body: "We complete Form SS-4 from your answers. For a responsible party without a US Social Security Number or ITIN, line 7b is entered as \"Foreign\" — that is the entire identity requirement, so nothing is certified and nothing is mailed. You do not need to read the form line by line; if anything in your answers is unclear, we email you before the form goes to the IRS.",
  },
  {
    icon: Phone,
    title: "Let us contact the IRS",
    anchor: "#step-3",
    body: "Let us submit the SS-4 and contact the IRS by fax or phone on your behalf. Foreign nationals without a US tax ID cannot use the online EIN application, so the paper or phone route is the available path. Once we have everything needed, EIN timing is typically 1-5 business days.",
  },
  {
    icon: CheckCircle2,
    title: "Receive your EIN",
    anchor: "#step-4",
    body: "Receive the nine-digit EIN by email once the IRS issues it. You also receive a copy of the completed Form SS-4 for your records, so you can keep the application details with your LLC formation documents. Use the EIN where your LLC needs a US federal tax ID, including Form 5472 filing.",
  },
  {
    icon: CheckCircle2,
    title: "Confirm it is done",
    anchor: "#step-5",
    body: "Confirm that the email includes the nine-digit EIN and the completed Form SS-4. The IRS also mails the official CP 575 confirmation letter to the LLC address within 4-6 weeks, and banks may ask for that letter. Keep both the emailed SS-4 copy and the CP 575 with your LLC records.",
  },
];

export default function EinPage() {
  return (
    <>
      <EinStructuredData />
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
              No SSN or ITIN required — we file Form SS-4 for you
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.08]">
              Get a US EIN<br />
              <span className="text-accent-100">for your foreign-owned LLC.</span>
            </h1>
            <p data-speakable className="mt-6 text-lg leading-relaxed text-slate-300 max-w-xl">
              Foreign founders can&apos;t use the IRS online EIN tool — it requires a US Social Security
              Number or ITIN. We prepare <strong className="text-white">Form SS-4</strong> and obtain your EIN directly from
              the IRS by fax or phone. No SSN, no ITIN, and no passport mailing — the EIN itself never
              requires one.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "No SSN or ITIN required — just \"Foreign\" on Form SS-4",
                "Form SS-4 prepared and submitted on your behalf",
                "EIN delivered by email in 1–5 business days",
                "Copy of completed Form SS-4 included",
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
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent mb-1">EIN Acquisition</p>
            <p className="font-serif text-5xl font-semibold text-ink">$149</p>
            <p className="text-sm text-slate-500 mt-1">Flat fee · one-time · no subscription</p>
            <Link
              href="/ein/apply"
              className="mt-5 flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-700 transition-colors"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="mt-2 flex items-center justify-center w-full h-10 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See Form 5472 filing plans
            </Link>
            <ul className="mt-5 space-y-1.5 text-xs text-slate-600">
              {[
                "No SSN, ITIN, or passport required",
                "Form SS-4 prepared for you",
                "IRS fax / phone application handled by us",
                "EIN by email in 1–5 business days",
                "Completed Form SS-4 included",
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
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-4">How does the EIN service work?</h2>
          <p className="mb-10 max-w-3xl text-sm leading-relaxed text-slate-600">
            You complete the intake form, we prepare Form SS-4, we contact the IRS, and you receive the EIN by email.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
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

      {/* What is an EIN — background */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-5">What is an EIN?</h2>
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

      {/* Why foreign founders can't DIY the online tool */}
      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent mb-3">
              Why you can&apos;t just do it online
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-4">
              Why is the IRS online EIN tool closed to foreign founders?
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The instant online EIN assistant on irs.gov only works if the responsible party has a US{" "}
              <strong>Social Security Number or ITIN</strong>. If you have neither — the situation for
              most non-resident LLC owners — the online route is simply unavailable to you.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              The only paths left are <strong>Form SS-4 by fax or phone</strong>. Both are slower,
              easy to get wrong (a single mis-entered line can bounce the application), and the
              international phone line has long holds. We handle the form and the IRS contact for you.
            </p>
            <p className="text-slate-600 leading-relaxed">
              No SSN, no ITIN, and no passport are required for the EIN itself — on Form SS-4 the
              responsible party simply enters <strong>&quot;Foreign&quot;</strong> on line 7b.
            </p>
          </div>
          <div className="rounded-xl border border-accent/20 bg-white p-6 space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2 rounded-lg border border-red-100 bg-red-50 p-4 text-xs text-red-700">
                <p className="font-semibold mb-2 text-red-800">DIY by yourself</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>Online tool blocked without SSN/ITIN</li>
                  <li>Decode Form SS-4 line by line</li>
                  <li>Long international IRS phone holds</li>
                  <li>One wrong entry = rejection &amp; restart</li>
                </ul>
              </div>
              <div className="w-1/2 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-700">
                <p className="font-semibold mb-2 text-emerald-800">With Form5472 Prep</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>SS-4 prepared correctly for you</li>
                  <li>We apply by fax / phone for you</li>
                  <li>No passport or ID to send</li>
                  <li>EIN by email in 1–5 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-8">What EIN questions do foreign founders ask?</h2>
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
            href="/ein/apply"
            className="inline-flex items-center gap-2 bg-white text-accent font-semibold text-sm px-6 py-3 rounded-md hover:bg-accent-50 transition-colors"
          >
            Start your EIN application
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

// Structured data for search + AI answer engines.
// - Service + Offer surfaces the $149 EIN offering with price for AEO/GEO.
// - FAQPage (shares the rendered `faq` array) powers Google's FAQ rich result.
// - BreadcrumbList + WebPage/Speakable round out the entity graph.
function EinStructuredData() {
  const url = `${env.appUrl}/ein`;

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "EIN (Form SS-4) acquisition for foreign-owned US LLCs",
    name: "EIN Acquisition for Foreign-Owned US LLCs",
    provider: organizationNode(),
    dateModified: CONTENT_LAST_REVIEWED,
    areaServed: { "@type": "Country", name: "United States" },
    audience: {
      "@type": "Audience",
      audienceType: "Foreign founders of US LLCs without a US Social Security Number or ITIN",
    },
    description:
      "Form SS-4 preparation and EIN acquisition for foreign-owned US LLCs whose owners have no SSN or ITIN. We prepare the form and obtain the EIN directly from the IRS by fax or phone — no online tool, no passport required.",
    offers: {
      "@type": "Offer",
      name: "EIN Acquisition — flat fee",
      price: "149.00",
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
    { name: "EIN Acquisition", path: "/ein" },
  ]);

  const howToSchema = howTo({
    name: "How to get an EIN for a foreign-owned US LLC",
    description:
      "Complete the EIN intake, review Form SS-4, and receive the IRS-issued EIN by email.",
    url,
    totalTime: "PT10M", // Customer hands-on time for intake and review, not IRS processing time.
    steps: steps.map(({ title, body, anchor }) => ({ name: title, text: body, anchor })),
    tools: ["Form SS-4", "IRS fax or phone application route"],
    supplies: ["LLC formation document", "Responsible party name and country", "Business activity description"],
  });

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name: "EIN for Foreign-Owned US LLC — No SSN Needed",
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
