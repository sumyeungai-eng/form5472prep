import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Users, FileText, Send, ArrowRight, LayoutDashboard } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import { PartnerApplyForm } from "./PartnerApplyForm";

export const metadata: Metadata = {
  // `absolute` skips the root layout's "%s · Form5472 Prep" template so the
  // brand isn't doubled (the title already ends in "| Form5472 Prep").
  title: { absolute: "Partner Program — Batch Form 5472 Filings for Your Clients | Form5472 Prep" },
  description:
    "Formation agencies, CPA firms, and registered agents: manage Form 5472 filings for all your clients under one partner account. You prepare, your client signs with a secure link, we review and fax to the IRS.",
  alternates: { canonical: "https://www.form5472prep.com/partners" },
  openGraph: {
    title: "Partner Program — Batch Form 5472 Filings for Your Clients",
    description:
      "Formation agencies, CPA firms, and registered agents: manage Form 5472 filings for all your clients under one account. Your client signs with a secure link — we review and fax to the IRS.",
    url: "https://www.form5472prep.com/partners",
  },
};

const faq = [
  {
    q: "Who is the partner program for?",
    a: "Formation agencies, registered agents, CPA and accounting firms, and consultants who manage US LLCs for multiple foreign-owned clients and need to batch Form 5472 filings under a single account.",
  },
  {
    q: "Can filings be batched under a single partner account?",
    a: "Yes. Every filing you start from your partner dashboard is grouped under your account — one login shows the live status of every client filing: draft, paid, awaiting signature, faxed, and IRS-confirmed.",
  },
  {
    q: "Who signs each filing?",
    a: "Your client does. When a filing is ready, you send them a secure one-click sign link from your dashboard. They review the prepared package and sign in the browser — no printing or scanning. You keep full visibility throughout.",
  },
  {
    q: "How does payment work?",
    a: "Each filing is paid individually at checkout with the same flat pricing as direct customers — Standard $199 and Rush $279, +$149 per additional past year, IRS fax delivery included. For volume pricing or consolidated invoicing, email support@form5472prep.com.",
  },
  {
    q: "How do I become a partner?",
    a: "Fill in the short application form on this page with your company and contact details. We approve partner accounts manually — usually within one business day — then you sign in with a secure email link. No password to manage.",
  },
  {
    q: "Do my clients see Form5472 Prep or my brand?",
    a: "Clients receive emails from Form5472 Prep — the sign link, filing confirmation, and the IRS fax receipt. You appear as the preparer coordinating the filing. White-label delivery isn't available yet; tell us if you need it.",
  },
];

const steps = [
  {
    icon: Users,
    title: "Get approved",
    body: "Submit the short application form with your company details. We set up your partner account manually — usually within one business day.",
  },
  {
    icon: FileText,
    title: "Prepare client filings",
    body: "Start a filing per client LLC from your dashboard. Same 15-minute wizard, pre-tagged to your account.",
  },
  {
    icon: Send,
    title: "Client signs via link",
    body: "Send each client a secure sign link. They review and sign in the browser — you never chase paperwork.",
  },
  {
    icon: LayoutDashboard,
    title: "Track everything in one place",
    body: "One dashboard shows every filing's live status through to the IRS fax confirmation receipt.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <PartnersStructuredData />

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
              <Users className="h-3.5 w-3.5" />
              For agencies, CPA firms &amp; registered agents
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.08]">
              All your clients&apos; Form 5472 filings,
              <br />
              <span className="text-accent-100">one partner account.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-xl">
              Batch filings for every foreign-owned LLC you manage. You prepare each filing in
              minutes, your client signs with a secure link, our tax accountant reviews, and we fax
              to the IRS Ogden PIN Unit — with a timestamped receipt for every one.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "One dashboard for every client filing's live status",
                "Clients sign with a one-click secure link — no paperwork chasing",
                "Every package reviewed by a qualified tax accountant",
                "IRS fax receipt stored per filing as proof of submission",
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
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent mb-1">
              Partner Program
            </p>
            <p className="font-serif text-2xl font-semibold text-ink">Same flat pricing</p>
            <p className="text-sm text-slate-500 mt-1">
              From $199 per filing · fax included · no subscription
            </p>
            <a
              href="#apply"
              className="mt-5 flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-700 transition-colors"
            >
              Request a partner account
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/partner/sign-in"
              className="mt-2 flex items-center justify-center w-full h-10 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Already a partner? Sign in →
            </Link>
            <ul className="mt-5 space-y-1.5 text-xs text-slate-600">
              {[
                "Approved within ~1 business day",
                "Passwordless email sign-in",
                "Pay per filing — no platform fee",
                "Volume pricing available on request",
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
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-10">How the partner flow works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title}>
                <div className="h-10 w-10 rounded-full bg-accent-50 border border-accent/20 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Step {i + 1}
                </p>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section id="apply" className="py-16 border-b border-slate-100 bg-slate-50 scroll-mt-20">
        <div className="max-w-2xl mx-auto px-6">
          <PartnerApplyForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-8">Partner FAQ</h2>
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
          <h2 className="text-2xl font-semibold mb-3">Filing 5472s for more than one client?</h2>
          <p className="text-accent-100 mb-6 text-sm leading-relaxed">
            Stop juggling separate accounts and email threads. One dashboard, every client, full
            audit trail.
          </p>
          <a
            href="#apply"
            className="inline-flex items-center gap-2 bg-white text-accent font-semibold text-sm px-6 py-3 rounded-md hover:bg-accent-50 transition-colors"
          >
            Request a partner account
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-4 text-xs text-accent-200">
            Already approved?{" "}
            <Link href="/partner/sign-in" className="underline hover:no-underline">
              Sign in to your dashboard →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

// Structured data: Service + FAQPage + Breadcrumb, mirroring /ein and /itin.
function PartnersStructuredData() {
  const url = `${env.appUrl}/partners`;

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Form 5472 partner / reseller program for agencies and firms",
    name: "Form5472 Prep Partner Program",
    provider: { "@type": "Organization", name: "Form5472 Prep", url: env.appUrl },
    areaServed: { "@type": "Country", name: "United States" },
    audience: {
      "@type": "Audience",
      audienceType:
        "Formation agencies, CPA firms, and registered agents managing foreign-owned US LLCs",
    },
    description:
      "Batch IRS Form 5472 + pro forma 1120 filings for multiple client LLCs under a single partner account. Per-filing flat pricing, client e-sign links, accountant review, and IRS fax delivery with receipts.",
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
      { "@type": "ListItem", position: 2, name: "Partner Program", item: url },
    ],
  };

  return (
    <>
      <JsonLd data={service} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumb} />
    </>
  );
}
