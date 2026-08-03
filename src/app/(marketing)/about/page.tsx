import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, FileText, Send, PenTool, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "About Form5472 Prep",
  description:
    "Form5472 Prep is a done-for-you filing and courier service built only for the foreign-owned single-member LLC's Form 5472 + pro forma 1120. How we work, and what we are and aren't.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Form5472 Prep",
    description:
      "A done-for-you filing service built only for the foreign-owned LLC's Form 5472 + pro forma 1120. How we work — accountant-reviewed, faxed to the IRS, with a proof-of-delivery receipt.",
    url: "https://www.form5472prep.com/about",
  },
};

const steps = [
  { icon: FileText, title: "You answer a short intake", body: "About a dozen questions about your LLC, its foreign owner, and year-end totals. No accounting software, no document gathering beyond what you already know." },
  { icon: ShieldCheck, title: "We prepare the full package", body: "Cover letter, pro forma Form 1120 stamped “Foreign-Owned U.S. DE”, Form 5472 (all parts), the Part V supporting statement, and a reasonable-cause statement if you're filing late." },
  { icon: PenTool, title: "An accountant reviews and you sign", body: "A qualified tax accountant on our team reviews the package before anything leaves. You sign once, in your browser — no printing or scanning." },
  { icon: Send, title: "We fax it and prove it", body: "We fax the signed package to the IRS Ogden PIN Unit and send you a timestamped fax-transmission receipt — your proof of filing if a penalty notice is ever questioned." },
];

export default function AboutPage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Form5472 Prep",
    url: `${env.appUrl}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "Form5472 Prep",
      url: env.appUrl,
      description:
        "Done-for-you IRS Form 5472 + pro forma Form 1120 filing for foreign-owned US single-member LLCs, reviewed by a qualified tax accountant before fax delivery to the IRS Ogden PIN Unit.",
    },
  };

  return (
    <>
      <JsonLd data={aboutJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(55% 55% at 20% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-100">
            <Users className="h-3.5 w-3.5" />
            About us
          </p>
          <h1 className="mt-5 font-serif text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight text-balance">
            One filing, done properly.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Form5472 Prep exists to do a single thing well: prepare and file the IRS
            Form 5472 and pro forma Form 1120 that every foreign-owned US single-member
            LLC owes each year — and prove it reached the IRS. We are not a general
            tax firm and we don&apos;t try to be.
          </p>
        </div>
      </section>

      {/* Why we exist */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-6 py-16 space-y-5 text-slate-700 leading-relaxed">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">Why we built this</h2>
          <p>
            Most foreign founders discover Form 5472 the hard way — through a warning
            about a <strong>$25,000 penalty</strong>, often after they&apos;ve already missed a
            deadline. The form isn&apos;t hard to fill in, but it&apos;s hard to fill in completely,
            correctly, and on time from outside the US, in a format the IRS accepts, using a
            channel (fax to the Ogden PIN Unit) most people no longer have.
          </p>
          <p>
            Generic tax software won&apos;t file it. Most US CPAs rarely see it. So we built a
            service that does only this filing, for only this profile of taxpayer, and does
            it end to end — with an accountant reviewing every package and a fax receipt
            proving delivery.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-slate-200 bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">How we work</p>
            <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              Four steps, about fifteen minutes of your time
            </h2>
          </div>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-paper-edge bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-accent text-white font-mono text-sm font-semibold">
                    {i + 1}
                  </span>
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we are / aren't — trust */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">What we are — and what we&apos;re not</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-emerald-700">We are</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>A form-preparation and filing-courier service for Form 5472 + pro forma 1120.</li>
                <li>Reviewed by a qualified tax accountant before every submission.</li>
                <li>Transparent, flat-fee, and up front about multi-year pricing.</li>
                <li>Built to give you a timestamped IRS fax receipt as proof of filing.</li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">We are not</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>A CPA firm, and we don&apos;t provide tax advice.</li>
                <li>A tool for multi-member LLCs or corporations (those file different returns).</li>
                <li>Responsible for the accuracy of the information you submit — that stays with you.</li>
                <li>Affiliated with the IRS or any government agency.</li>
              </ul>
            </div>
          </div>
          <p className="mt-8 text-sm leading-relaxed text-slate-600">
            The guides on our{" "}
            <Link href="/blog" className="text-accent hover:underline">blog</Link>{" "}
            are researched from primary sources — chiefly the{" "}
            <a href="https://www.irs.gov/instructions/i5472" className="text-accent hover:underline" rel="nofollow">IRS Instructions for Form 5472</a>{" "}
            and the Internal Revenue Code — and reviewed on a regular schedule; see our{" "}
            <Link href="/editorial-policy" className="text-accent hover:underline">editorial policy</Link>.
            For how we handle your data, see{" "}
            <Link href="/security" className="text-accent hover:underline">Security</Link>{" "}and{" "}
            <Link href="/data-retention" className="text-accent hover:underline">Data Retention</Link>.
            Questions? Email{" "}
            <a href="mailto:support@form5472prep.com" className="text-accent hover:underline">support@form5472prep.com</a>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white text-balance">Ready to file?</h2>
          <p className="mt-3 text-slate-300">Flat $199, accountant-reviewed, faxed to the IRS with a receipt.</p>
          <div className="mt-7">
            <Link href="/start" className="group inline-block">
              <Button size="lg" className="bg-white !text-ink hover:bg-slate-100">
                Start your filing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
