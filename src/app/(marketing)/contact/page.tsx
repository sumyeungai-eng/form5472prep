import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Ask Form5472 Prep about Form 5472, pro forma 1120, foreign-owned LLC filing requirements, catch-up filings, EINs, or ITINs.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Contact us
            </p>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight text-ink text-balance">
              Ask a Form 5472 filing question.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Send us a question about Form 5472, pro forma 1120, foreign-owned LLC
              filing requirements, or catching up on past years.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <ContactForm />
            </div>

            <aside className="rounded-xl border border-paper-edge bg-paper p-6 text-sm leading-relaxed text-slate-700">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
                Prefer email?
              </h2>
              <p className="mt-3">
                You can email us directly at{" "}
                <a
                  href="mailto:support@form5472prep.com"
                  className="font-medium text-accent hover:underline"
                >
                  support@form5472prep.com
                </a>
                .
              </p>
              <p className="mt-4 font-medium text-ink">We reply within 1 business day.</p>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
