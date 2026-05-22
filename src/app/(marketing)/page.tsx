import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Clock,
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Building2,
  Receipt,
  PenTool,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { TIERS, TIER_ORDER, MULTI_YEAR_ADDON_CENTS } from "@/lib/pricing";
import { formatUsd } from "@/lib/utils";
import { env } from "@/lib/env";

// FAQ content is the source of truth for both the rendered <dl> and the
// FAQPage JSON-LD structured data — keep them in lockstep by sharing the array.
const FAQS = [
  {
    q: "What if I've missed prior years?",
    a: "Pick all the years you need to file when you start. We'll auto-flag the filing as DIIRSP (Delinquent International Information Return Submission Procedure) and include a reasonable cause statement requesting penalty abatement. Pricing scales with the number of years.",
  },
  {
    q: "Do I really need Form 5472 and Form 1120 if my LLC made no money?",
    a: "Likely yes. Form 5472 reports reportable transactions, which includes any capital you put in or distributions you took out — not just revenue. The pro forma Form 1120 is always required as the attachment vehicle whenever Form 5472 is required, even with zero income.",
  },
  {
    q: "Why does the IRS require fax instead of e-file?",
    a: "Foreign-owned US disregarded entities can't e-file Form 5472 or the attached pro forma Form 1120. The IRS Ogden PIN Unit accepts paper by mail or fax at +1-855-887-7737. Fax is faster, has a transmission receipt, and is the IRS's stated preferred channel.",
  },
  {
    q: "Do you store my bank statements or signed forms?",
    a: "No. We process your bank statements in memory to extract transaction totals, then discard them — they are never written to permanent storage. The signed PDF you upload is held only long enough to fax to the IRS and deliver the fax confirmation receipt back to you, then it is deleted. The only thing we retain is the fax confirmation receipt itself (your proof of filing) and the basic entity / owner information needed to produce next year's filing.",
  },
  {
    q: "What's your guarantee?",
    a: "100% money-back guarantee if we fail to submit your filing to the IRS. If the fax doesn't deliver on the first send, we automatically retry. If it still fails, you get a full refund — no questions asked.",
  },
];

export const metadata: Metadata = {
  // `absolute` skips the layout's "%s · Form5472 Prep" template — the homepage title
  // already brands the product, so we don't want the suffix appended.
  title: { absolute: "File IRS Form 5472 and pro forma 1120 in 15 minutes — Form5472 Prep" },
  description:
    "IRS Form 5472 and pro forma Form 1120 filing for foreign-owned US single-member LLCs. We prepare the forms, you sign once, we fax to the IRS Ogden PIN Unit. Starting at $199 — fax delivery included on every plan. 100% money-back guarantee if we fail to submit.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <>
      <StructuredData />
      <Hero />
      <TrustStrip />
      <Eligibility />
      <HowItWorks />
      <Deliverables />
      <Comparison />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-accent-50 via-white to-accent-50 animate-gradient">
      {/* Decorative floating blobs — subtle ambient motion behind the content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-start">
          {/* Left: the pitch */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 animate-fade-in-up">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              For foreign-owned US single-member LLCs
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 text-balance animate-fade-in-up animate-delay-100">
              File IRS Form 5472 and pro forma Form 1120 in 15 minutes.<br />
              <span className="text-accent">Avoid the $25,000 penalty.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl animate-fade-in-up animate-delay-200">
              Form5472 Prep prepares your Form 5472 and pro forma Form 1120 for foreign-owned US
              LLCs, generates the reasonable cause statement for late DIIRSP filings, and faxes
              the signed package to the IRS Ogden PIN Unit on your behalf. Starting at $199 with
              IRS fax delivery included — backed by a 100% money-back guarantee if we fail to submit.
            </p>
          </div>

          {/* Right: bold CTA card */}
          <div className="w-full lg:w-[360px] lg:flex-none animate-fade-in-up animate-delay-300">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xl shadow-accent/5 p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-xs font-medium text-accent uppercase tracking-wide">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-soft-pulse" />
                Start filing now
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
                  {formatUsd(TIERS.standard.priceCents)}
                </span>
                <span className="text-sm text-slate-500">/ filing</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                IRS fax delivery included. Rush and Premium plans available — see <Link href="/pricing" className="text-accent underline">pricing</Link>.
              </p>

              <Link href="/start" className="block mt-6 group">
                <Button
                  size="lg"
                  className="w-full h-14 text-sm sm:text-base shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Start filing
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#how-it-works" className="block mt-3">
                <Button variant="outline" size="lg" className="w-full h-12 transition-colors">
                  See how it works
                </Button>
              </Link>

              <ul className="mt-6 space-y-2.5 text-sm">
                {[
                  "Filled IRS Form 5472 + pro forma 1120",
                  "Reasonable cause statement (if late)",
                  "Reviewed by a qualified tax accountant",
                  "Faxed to IRS Ogden PIN Unit",
                  "100% money-back if we fail to submit",
                ].map((it, i) => (
                  <li
                    key={it}
                    className="flex items-start gap-2 text-slate-700 animate-fade-in-up"
                    style={{ animationDelay: `${400 + i * 80}ms` }}
                  >
                    <CheckCircle2 className="flex-none h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 pt-5 border-t border-slate-100 text-xs text-slate-500 text-center">
                No subscription. No upsell. Pay once per filing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Clock, label: "15 min", sub: "average completion" },
    { icon: FileText, label: "IRS forms", sub: "filled, not redrawn" },
    { icon: Send, label: "Faxed for you", sub: "to Ogden PIN Unit" },
    { icon: ShieldCheck, label: "Receipt stored", sub: "proof of filing" },
  ];
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 100} className="flex items-center gap-3 group">
            <div className="flex-none w-10 h-10 rounded-md bg-accent-50 text-accent flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{it.label}</p>
              <p className="text-xs text-slate-500">{it.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Eligibility() {
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <SectionHead
          eyebrow="Eligibility"
          title="Do you need to file Form 5472 and Form 1120?"
          subtitle="If all three of these are true, the IRS requires you to file both forms every year — even if your LLC made zero revenue. Form 5472 reports the related-party transactions; the pro forma Form 1120 is the vehicle it attaches to."
        />
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Reveal delay={0}>
            <Criterion
              icon={Building2}
              title="You own a US LLC"
              body="A single-member LLC organized in any US state — Wyoming, Delaware, New Mexico, Florida, etc."
            />
          </Reveal>
          <Reveal delay={120}>
            <Criterion
              icon={Globe}
              title="You're not a US person"
              body="You're not a US citizen, green card holder, or US tax resident. You live and pay tax outside the US."
            />
          </Reveal>
          <Reveal delay={240}>
            <Criterion
              icon={Receipt}
              title="You moved money in or out"
              body="You contributed capital, took distributions, paid yourself, or had any reportable transactions during the year."
            />
          </Reveal>
        </div>
        <Reveal delay={300} className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 flex gap-3">
          <AlertTriangle className="flex-none h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium">The penalty is $25,000 per form, per year.</p>
            <p className="mt-1 text-amber-800">
              The IRS automatically assesses the penalty for late or missing Form 5472 and
              Form 1120 filings. If you&apos;ve missed prior years, the Delinquent International
              Information Return Submission Procedure (DIIRSP) lets you catch up with a
              reasonable cause statement — we generate this for you.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Building2,
      title: "Enter your LLC info",
      body: "Name, EIN, address, formation date, NAICS code. Standard fields you already know.",
    },
    {
      icon: Globe,
      title: "Enter your owner info",
      body: "Your name, foreign tax ID, residential address, country of citizenship and tax residence.",
    },
    {
      icon: Receipt,
      title: "Add your numbers",
      body: "Capital contributions in, distributions out, year-end total assets. Manual entry — or upload bank statements (coming soon).",
    },
    {
      icon: FileText,
      title: "We generate the package",
      body: "Cover letter, reasonable cause statement (if late), filled Form 1120 + 5472, Part V supporting statement. One PDF.",
    },
    {
      icon: PenTool,
      title: "You sign it",
      body: "Print, sign in pen on the marked pages, scan, upload back. We verify pages are signed.",
    },
    {
      icon: Send,
      title: "We fax to the IRS",
      body: "Direct to the IRS Ogden PIN Unit at +1-855-887-7737. We store the fax confirmation as proof of filing.",
    },
  ];
  return (
    <section id="how-it-works" className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <SectionHead
          eyebrow="How it works"
          title="Six steps. About fifteen minutes."
          subtitle="No CPA back-and-forth. No PDF fields filled in the wrong language. No second-guessing whether you checked the right box."
        />
        <ol className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i * 80}
              className="group rounded-lg border border-slate-200 p-6 hover:border-accent hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300 bg-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex-none w-8 h-8 rounded-md bg-accent text-white text-sm font-medium flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {i + 1}
                </span>
                <s.icon className="h-5 w-5 text-slate-400 transition-colors duration-300 group-hover:text-accent" />
              </div>
              <h3 className="font-medium text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Deliverables() {
  const docs = [
    {
      name: "Cover letter",
      body: "Addressed to IRS Ogden Service Center, PIN Unit. Identifies your entity, EIN, and tax year(s) covered.",
    },
    {
      name: "Reasonable Cause Statement",
      body: "Only for DIIRSP filings. Explains why the prior year wasn't filed and requests penalty abatement.",
      tag: "If DIIRSP",
    },
    {
      name: "Pro Forma Form 1120",
      body: "Filled with your LLC name, EIN, address, formation date, and year-end total assets. Stamped \"Foreign-Owned U.S. DE\".",
    },
    {
      name: "Form 5472",
      body: "Parts I, II, III, IV, V, VII all completed. Line 1f calculated to include Part V transactions per IRS rules for foreign-owned DEs.",
    },
    {
      name: "Part V Supporting Statement",
      body: "Itemizes capital contributions and distributions, totals matching Form 5472 line 1f, with the regulatory closing language.",
    },
  ];
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <SectionHead
          eyebrow="What you get"
          title="A complete, IRS-ready package."
          subtitle="The exact same documents a CPA would prepare. Every order is reviewed by a qualified tax accountant before we submit to the IRS. Bundled as one PDF, ready for your signature."
        />
        <ul className="mt-10 space-y-3">
          {docs.map((d, i) => (
            <Reveal
              as="li"
              key={d.name}
              delay={i * 70}
              className="group flex gap-4 rounded-lg bg-white border border-slate-200 p-5 hover:border-accent hover:shadow-md hover:shadow-accent/5 hover:translate-x-1 transition-all duration-300"
            >
              <FileText className="flex-none h-5 w-5 text-accent mt-0.5 transition-transform duration-300 group-hover:scale-110" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-900">{d.name}</p>
                  {d.tag && (
                    <span className="text-[11px] font-medium rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">
                      {d.tag}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{d.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["Setup time", "1–2 weeks back-and-forth", "1–4 hours of confusion", "15 minutes"],
    ["Knows Form 5472", "Hit or miss", "Up to you", "Built only for this"],
    ["Reasonable cause statement (DIIRSP)", "Usually extra", "DIY", "Included"],
    ["Files with the IRS", "By mail or fax", "Your problem", "We fax to Ogden"],
    ["Stores filing proof", "Sometimes", "Your problem", "Yes, automatic"],
    ["Cost", "$400 – $800", "Free (until $25k)", `From ${formatUsd(TIERS.standard.priceCents)}`],
  ];
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <SectionHead
          eyebrow="vs. the alternatives"
          title="Why not a CPA, why not DIY."
        />
        <div className="mt-10 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="py-3 px-4 font-medium text-slate-600"></th>
                <th className="py-3 px-4 font-medium text-slate-600">CPA</th>
                <th className="py-3 px-4 font-medium text-slate-600">DIY</th>
                <th className="py-3 px-4 font-medium text-accent">Form5472 Prep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r, i) => (
                <tr key={i} className="transition-colors hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-medium text-slate-900">{r[0]}</td>
                  <td className="py-3 px-4 text-slate-600">{r[1]}</td>
                  <td className="py-3 px-4 text-slate-600">{r[2]}</td>
                  <td className="py-3 px-4 text-slate-900 font-medium bg-accent-50 transition-colors hover:bg-accent-100">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <SectionHead
          eyebrow="Pricing"
          title="Pay once per filing."
          subtitle="One-time flat fee per filing. IRS fax delivery to the Ogden PIN Unit included on every plan. Additional past tax years add $149 each."
        />
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border-2 border-emerald-200 px-4 py-1.5 text-xs font-medium text-emerald-800">
            Fax filing included on every plan
          </span>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-6 items-stretch">
          {TIER_ORDER.map((key, idx) => {
            const t = TIERS[key];
            const highlighted = !!t.highlight;
            return (
              <Reveal
                key={key}
                delay={idx * 120}
                className={`relative flex flex-col rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10 ${
                  highlighted
                    ? "border-2 border-accent bg-white shadow-md"
                    : "border border-slate-200 bg-white hover:border-accent"
                }`}
              >
                {highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold rounded-full bg-accent text-white px-3 py-0.5 shadow">
                    Most popular
                  </span>
                )}
                <div>
                  <p className="font-semibold text-slate-900">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {formatUsd(t.priceCents)}
                  <span className="ml-1 text-sm font-normal text-slate-500">/ year</span>
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-700 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/start?tier=${key}`} className="block mt-6">
                  <Button variant={highlighted ? "primary" : "outline"} className="w-full transition-transform hover:-translate-y-0.5">
                    {t.ctaLabel}
                  </Button>
                </Link>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          <span className="font-semibold text-slate-900">+ {formatUsd(MULTI_YEAR_ADDON_CENTS)} per additional year</span>
          <span className="mx-2 text-slate-400">·</span>
          Saves you from the $25,000-per-form IRS penalty
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">
          DIIRSP = IRS Delinquent International Information Return Submission Procedure.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <SectionHead eyebrow="FAQ" title="Common questions." />
        <dl className="mt-10 space-y-6">
          {FAQS.map((it, i) => (
            <Reveal key={it.q} delay={i * 80}>
              <dt className="font-medium text-slate-900">{it.q}</dt>
              <dd className="mt-2 text-sm text-slate-600 leading-relaxed">{it.a}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-accent">
      {/* Animated accent shapes — subtle motion in the dark CTA. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <Reveal as="div" className="relative max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-white text-balance">
          Stop worrying about the $25,000 penalty.
        </h2>
        <p className="mt-4 text-lg text-accent-50/90 max-w-xl mx-auto">
          File this year&apos;s Form 5472 in fifteen minutes. Catch up on prior years in
          one sitting.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/start" className="group">
            <Button size="lg" className="bg-white !text-accent hover:bg-accent-50 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20">
              Start filing
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="max-w-2xl mx-auto text-center">
      <p className="text-sm font-medium text-accent uppercase tracking-wide">{eyebrow}</p>
      <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-balance">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-slate-600">{subtitle}</p>}
    </Reveal>
  );
}

function Criterion({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof CheckCircle2;
  title: string;
  body: string;
}) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
      <div className="w-10 h-10 rounded-md bg-accent-50 text-accent flex items-center justify-center transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-medium text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}

// Structured data for search engines and AI answer engines.
// - Organization establishes brand identity for knowledge-panel surfaces.
// - Service describes what we sell, who for, and price tiers.
// - FAQPage powers Google's expandable FAQ rich result + AI direct-answer pulls.
function StructuredData() {
  const url = env.appUrl;
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Form5472 Prep",
    url,
    logo: `${url}/logo-mark.svg`,
    sameAs: [] as string[],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@form5472prep.com",
        availableLanguage: ["en"],
      },
    ],
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "IRS Form 5472 and pro forma Form 1120 preparation and filing",
    provider: { "@type": "Organization", name: "Form5472 Prep", url },
    areaServed: { "@type": "Country", name: "United States" },
    audience: {
      "@type": "Audience",
      audienceType: "Foreign-owned US single-member LLC owners",
    },
    description:
      "Self-service preparation and fax-delivery of IRS Form 5472 with pro forma Form 1120 for foreign-owned US single-member LLCs. Includes reasonable cause statement generation for DIIRSP delinquent filings.",
    offers: TIER_ORDER.map((key) => {
      const t = TIERS[key];
      return {
        "@type": "Offer",
        name: `${t.label} — ${t.subtitle}`,
        sku: key,
        price: (t.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${url}/start?tier=${key}`,
      };
    }),
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: url },
    ],
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={service} />
      <JsonLd data={faq} />
      <JsonLd data={breadcrumb} />
    </>
  );
}
