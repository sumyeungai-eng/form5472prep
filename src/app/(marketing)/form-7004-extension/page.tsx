import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarClock, CheckCircle2, FileText, Printer, Mail } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import { EXTENSION_PRICE_CENTS } from "@/lib/pricing";
import { AREA_SERVED, breadcrumbList, organizationNode, pageMeta } from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";
import { formatPrice } from "@/lib/utils";

const PRICE = formatPrice(EXTENSION_PRICE_CENTS);
const DESCRIPTION = `Form 7004 extension for foreign-owned single-member LLCs, ${PRICE} per tax year. We prepare it, fax it to the IRS Ogden PIN Unit and email you the confirmation.`;

export const metadata: Metadata = {
  title: seoTitle(`Form 7004 Extension for Foreign-Owned LLCs — ${PRICE}`),
  description: DESCRIPTION,
  ...pageMeta({
    title: `Form 7004 Extension for Foreign-Owned LLCs — ${PRICE}`,
    description: DESCRIPTION,
    path: "/form-7004-extension",
  }),
};

const steps = [
  {
    icon: FileText,
    title: "Order online",
    body: "Tell us the LLC's name, EIN, US address and the tax year you need extended, then pay in Stripe Checkout. If you don't have every detail to hand, order anyway — we email you for anything missing.",
  },
  {
    icon: FileText,
    title: "We prepare Form 7004",
    body: "We complete Form 7004 the way the IRS instructions describe for a foreign-owned U.S. disregarded entity: Form 1120 code 12 in Part I and “Foreign-owned U.S. DE” written across the top.",
  },
  {
    icon: Printer,
    title: "We fax it to the IRS",
    body: "We fax it to the IRS Ogden PIN Unit — the dedicated route for foreign-owned DEs, not the regular Form 7004 address. Orders are faxed within 2 business days; for a tax year that has not ended yet, we fax it in the first business days after 1 January.",
  },
  {
    icon: Mail,
    title: "You get the fax confirmation",
    body: "We email you the fax confirmation for your records. It shows the fax was transmitted to the IRS; it is not an IRS acceptance, and the IRS does not normally send one for an extension.",
  },
];

const faq = [
  {
    q: "Does a foreign-owned single-member LLC need Form 7004 to extend Form 5472?",
    a: "Yes. A foreign-owned U.S. disregarded entity files Form 5472 attached to a pro forma Form 1120, so it requests more time with Form 7004 using the Form 1120 code (12). A valid extension moves the filing deadline by 6 months — for a calendar-year LLC, from 15 April to 15 October.",
  },
  {
    q: "When must Form 7004 be filed?",
    a: "By the original due date of the return: 15 April of the year after the tax year for a calendar-year LLC, moved to the next business day when it falls on a weekend or legal holiday. A Form 7004 filed after that date does not extend anything, so order before the deadline.",
  },
  {
    q: "Can I e-file Form 7004 for a foreign-owned DE?",
    a: "No. The IRS instructions route a foreign-owned U.S. DE's Form 7004 by fax or mail to the Ogden PIN Unit, not to the regular Form 7004 address or e-file. We fax it for you.",
  },
  {
    q: `What do I get for ${PRICE}?`,
    a: "Form 7004 prepared for one LLC and one tax year, faxed to the IRS Ogden PIN Unit, and the fax confirmation emailed to you. Orders are faxed within 2 business days; a tax year that has not ended yet is faxed in the first business days after 1 January.",
  },
  {
    q: "Does the extension extend the time to pay?",
    a: "No. Form 7004 extends the time to file, not to pay. A foreign-owned DE's pro forma Form 1120 normally reports no tax, so there is usually nothing to pay with it.",
  },
  {
    q: "Is the fax confirmation proof that the IRS accepted the extension?",
    a: "No. It is evidence that the fax was transmitted to the IRS fax line. Keep it with your records. The IRS does not normally send an acceptance letter for an extension.",
  },
  {
    q: "I already missed the April deadline. Can you still file an extension?",
    a: "No — a late Form 7004 cannot extend a deadline that has passed. File the Form 5472 and pro forma Form 1120 as soon as possible instead, usually with a reasonable-cause statement; our Form 5472 filing service covers late years.",
  },
  {
    q: "Do I still need to file Form 5472 after the extension?",
    a: "Yes. The extension only moves the deadline. The Form 5472 and pro forma Form 1120 must still be filed by the extended due date (15 October for a calendar-year LLC). We prepare that filing too.",
  },
];

export default function Form7004ExtensionPage() {
  return (
    <>
      <StructuredData />
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(55% 55% at 20% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)" }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20 grid md:grid-cols-[1fr_340px] gap-12 items-start">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100 mb-6">
              <CalendarClock aria-hidden className="h-3.5 w-3.5" />
              Form 7004 · foreign-owned U.S. DE
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.08]">
              Form 7004 extension<br />
              <span className="text-accent-100">for your foreign-owned LLC.</span>
            </h1>
            <p data-speakable className="mt-6 text-lg leading-relaxed text-slate-300 max-w-xl">
              We prepare <strong className="text-white">Form 7004</strong> (with &ldquo;Foreign-owned U.S. DE&rdquo; and Form 1120
              code 12) and fax it to the IRS Ogden PIN Unit, then email you the fax confirmation. A valid
              extension moves your Form 5472 deadline from 15 April to 15 October.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "Filed the foreign-owned DE way — fax to the Ogden PIN Unit",
                "Faxed within 2 business days of your order",
                "Fax confirmation emailed to you",
                "Must be ordered before the original due date",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 aria-hidden className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white text-slate-900 ring-1 ring-black/5 shadow-2xl shadow-black/30 p-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent mb-1">Form 7004 extension</p>
            <p className="font-serif text-5xl font-semibold text-ink">{PRICE}</p>
            <p className="text-sm text-slate-500 mt-1">Per LLC, per tax year · one-time</p>
            <Link
              href="/form-7004-extension/apply"
              className="mt-5 flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-700 transition-colors"
            >
              Order the extension
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="mt-2 flex items-center justify-center w-full h-10 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See Form 5472 filing plans
            </Link>
            <ul className="mt-5 space-y-1.5 text-xs text-slate-600">
              {[
                "Form 7004 prepared for you",
                "Faxed to the IRS Ogden PIN Unit",
                "Fax confirmation by email",
                "Only your email is required to order",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-4">How does the Form 7004 service work?</h2>
          <p className="mb-10 max-w-3xl text-sm leading-relaxed text-slate-600">
            You order, we prepare Form 7004, we fax it to the IRS, and you receive the fax confirmation by email.
          </p>
          <ol className="list-none m-0 p-0 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <li key={step.title}>
                <div className="h-10 w-10 rounded-full bg-accent-50 border border-accent/20 flex items-center justify-center mb-4">
                  <step.icon aria-hidden className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Step {i + 1}</p>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 border-b border-slate-100 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-5">What should you know before you order?</h2>
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              <strong className="text-slate-800">The deadline is the original due date.</strong> For a calendar-year LLC,
              Form 7004 must be filed by 15 April of the year after the tax year (the next business day if that falls on a
              weekend or holiday). A valid extension moves the Form 5472 and pro forma Form 1120 due date by 6 months, to 15 October.
            </p>
            <p>
              <strong className="text-slate-800">It extends the time to file, not to pay.</strong> A foreign-owned DE&apos;s
              pro forma Form 1120 normally reports no tax.
            </p>
            <p>
              <strong className="text-slate-800">A fax confirmation is not IRS acceptance.</strong> It is evidence that the
              fax was transmitted. The IRS does not normally send an acceptance letter for an extension.
            </p>
            <p>
              <strong className="text-slate-800">You still file the return.</strong> The extension only buys time. When you are
              ready, our <Link href="/pricing" className="text-accent hover:underline">Form 5472 filing service</Link> prepares
              the Form 5472 and pro forma Form 1120. Already past the April deadline? An extension can no longer help —
              see <Link href="/form-5472-late-filing-checker" className="text-accent hover:underline">the late filing checker</Link>.
            </p>
            <p className="text-xs text-slate-500">
              We are not a CPA firm and do not give tax or legal advice. We prepare and fax the form from the information you give us.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-8">Form 7004 questions from foreign LLC owners</h2>
          <div className="space-y-6">
            {faq.map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <Link
            href="/form-7004-extension/apply"
            className="mt-10 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-700 transition-colors"
          >
            Order the Form 7004 extension — {PRICE}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

// Service + Offer (price from EXTENSION_PRICE_CENTS), FAQPage and BreadcrumbList.
function StructuredData() {
  const url = `${env.appUrl}/form-7004-extension`;
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Form 7004 extension filing for foreign-owned US LLCs",
    name: "Form 7004 Extension Filing for Foreign-Owned US LLCs",
    provider: organizationNode(),
    areaServed: AREA_SERVED,
    audience: {
      "@type": "Audience",
      audienceType: "Foreign owners of single-member US LLCs (foreign-owned U.S. disregarded entities)",
    },
    description:
      "Form 7004 prepared with “Foreign-owned U.S. DE” and Form 1120 code 12, faxed to the IRS Ogden PIN Unit, with the fax confirmation emailed to the client.",
    offers: {
      "@type": "Offer",
      name: "Form 7004 extension filing — per LLC, per tax year",
      price: (EXTENSION_PRICE_CENTS / 100).toFixed(2),
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
    { name: "Form 7004 Extension", path: "/form-7004-extension" },
  ]);
  return (
    <>
      <JsonLd data={service} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumb} />
    </>
  );
}
