import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { MULTI_YEAR_ADDON_CENTS } from "@/lib/pricing";
import {
  breadcrumbList,
  ORG_EMAIL,
  organizationNode,
  pageOpenGraph,
  SITE_URL,
  SPEAKABLE,
} from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { ContactForm } from "./ContactForm";

const PAGE_TITLE = "Contact Form5472 Prep — Form 5472 Filing Questions";
const PAGE_DESCRIPTION =
  "Contact Form5472 Prep about Form 5472 filing, past tax years, EIN or ITIN questions, IRS notices, billing, or an active filing.";

const CONTACT_FAQS: { q: string; a: string }[] = [
  {
    q: "How quickly will you reply?",
    a: "Within one business day, Monday to Friday, from support@form5472prep.com. If you don't see our reply, check your spam folder.",
  },
  {
    q: "What should I include in my message?",
    a: "Your LLC's state of formation, the tax years you need filed, and whether the LLC already has an EIN. With those three details we can usually answer in a single reply.",
  },
  {
    q: "Can you tell me whether I need to file Form 5472?",
    a: "Yes. If your US LLC is a single-member LLC owned by a non-US person and it had any reportable transaction during the year — including the money you moved in to open its bank account — it must file Form 5472 together with a pro forma Form 1120. Send us your situation and we'll confirm.",
  },
  {
    q: "I'm several years behind. Can you still help?",
    a: `Yes. We file the past years together under the IRS Delinquent International Information Return Submission Procedures (DIIRSP), with one reasonable-cause statement covering every delinquent year. Additional past tax years are ${formatPrice(MULTI_YEAR_ADDON_CENTS)} each.`,
  },
  {
    q: "I've received an IRS notice — what do you need from me?",
    a: "Send us the notice number (for example CP15) and the tax year it covers. We'll tell you what a corrected or late filing involves before you pay anything.",
  },
];

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: PAGE_TITLE,
  url: `${SITE_URL}/contact`,
  description: PAGE_DESCRIPTION,
  mainEntity: organizationNode(),
  speakable: SPEAKABLE,
};

const contactFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: CONTACT_FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: pageOpenGraph({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: "/contact",
  }),
  robots: { index: true, follow: true },
};

const HELP_TOPICS = [
  "Form 5472 + pro forma 1120 filing",
  "Late or missed tax years (DIIRSP)",
  "EIN applications without an SSN",
  "ITIN applications",
  "IRS notices and penalties",
  "Partner and accountant enquiries",
];

export default function ContactPage() {
  return (
    <main className="bg-white">
      <JsonLd data={contactPageJsonLd} />
      <JsonLd data={contactFaqJsonLd} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Contact
            </p>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight text-ink text-balance">
              Talk to us about your Form 5472 filing.
            </h1>
            <p data-speakable className="mt-5 text-lg leading-relaxed text-slate-600">
              Whether you&apos;re filing for the first time, catching up on past years, or
              you&apos;ve received an IRS notice — tell us the details and we&apos;ll come back
              with a straight answer. We reply within one business day, Monday to Friday.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
              <span>Replies within 1 business day</span>
              <span aria-hidden className="text-slate-300">·</span>
              <a href={`mailto:${ORG_EMAIL}`} className="text-accent hover:underline">
                {ORG_EMAIL}
              </a>
              <span aria-hidden className="text-slate-300">·</span>
              <span>Filed to the IRS Ogden PIN Unit</span>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink">
                Send us a question
              </h2>
              <ContactForm />
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-paper-edge bg-paper p-6 text-sm leading-relaxed text-slate-700">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
                  Already filing with us?
                </h2>
                <p className="mt-3">
                  If you have a filing in progress, sign in and message us from inside the
                  filing — your reply is attached to your file and we can see exactly where
                  it is.
                </p>
                <Link
                  href="/sign-in"
                  className="mt-4 inline-flex font-medium text-accent hover:underline"
                >
                  Sign in →
                </Link>
              </div>

              <div className="rounded-xl border border-paper-edge bg-paper p-6 text-sm leading-relaxed text-slate-700">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
                  Prefer email?
                </h2>
                <a
                  href={`mailto:${ORG_EMAIL}`}
                  className="mt-3 inline-flex break-all font-medium text-accent hover:underline"
                >
                  {ORG_EMAIL}
                </a>
                <p className="mt-3 font-medium text-ink">We reply within 1 business day.</p>
              </div>

              <div className="rounded-xl border border-paper-edge bg-paper p-6 text-sm leading-relaxed text-slate-700">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
                  What we can help with
                </h2>
                <ul className="mt-4 space-y-2">
                  {HELP_TOPICS.map((topic) => (
                    <li key={topic} className="flex gap-2">
                      <span aria-hidden className="text-accent">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center font-serif text-2xl font-semibold tracking-tight text-ink">
          Common questions
        </h2>
        <div className="mt-8 space-y-4">
          {CONTACT_FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-lg border border-slate-200 bg-white p-4 open:bg-slate-50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                {q}
                <span className="text-slate-400 transition group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{a}</p>
            </details>
          ))}
        </div>

        <p className="mt-10 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
          Form5472 Prep is a form-preparation and filing-courier service — not a CPA firm,
          and nothing here is tax advice. You are responsible for the accuracy of what you
          submit.
        </p>
      </section>
    </main>
  );
}
