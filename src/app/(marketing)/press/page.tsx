import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Download } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { CopyButton } from "@/components/press/CopyButton";
import {
  EIN_PRICE_CENTS,
  EXPRESS_TURNAROUND,
  PRIORITY_TURNAROUND,
  ITIN_PRICE_CENTS,
  MULTI_YEAR_ADDON_CENTS,
  STANDARD_TURNAROUND,
  TIERS,
} from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { SERVICES_HUB_PATH, SERVICE_PAGES, servicePath } from "@/lib/services-pages";
import {
  ORG_EMAIL,
  SITE_NAME,
  SITE_URL,
  SPEAKABLE,
  TRUSTPILOT_PROFILE_URL,
  breadcrumbList,
  organizationNode,
  pageMeta,
} from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";

// /press: press kit. Journalists, bloggers, directories and answer engines use
// it to describe the brand correctly. Every statement here must be verifiable
// from the repo (services-pages.ts, /about, llms.ts); no founders, customer
// counts, awards or quotes. Journalists and answer engines lift numbers
// straight from a press kit, so the key facts state the prices and turnarounds,
// always interpolated from src/lib/pricing.ts (never typed here). The founding
// year is read from Organization.foundingDate so the page and the schema agree.

const PATH = "/press";
const FOUNDED = String(organizationNode().foundingDate);
const DESCRIPTION =
  "Press kit for Form5472 Prep: a short blurb, boilerplate, key facts, logo files, brand colours, free tools and the press contact, for citing the service.";

export const metadata: Metadata = {
  title: seoTitle(`${SITE_NAME} Press Kit`),
  description: DESCRIPTION,
  ...pageMeta({ title: `${SITE_NAME} Press Kit`, description: DESCRIPTION, path: PATH }),
  robots: { index: true, follow: true },
};

type Segment = string | { href: string; text: string };

// Blurb and boilerplate are written once as segments, then rendered with links
// on the page and flattened to plain text (absolute URLs) for the Copy button.
const BLURB: Segment[] = [
  "Form5472 Prep prepares and files IRS Form 5472 with the pro forma Form 1120 for foreign-owned US single-member LLCs. Every filing is reviewed by a qualified accountant before it is submitted, then signed online and faxed to the IRS Ogden PIN Unit with a timestamped receipt. See the ",
  { href: SERVICES_HUB_PATH, text: "filing services" },
  " or read ",
  { href: "/about", text: "about Form5472 Prep" },
  ".",
];

const BOILERPLATE: Segment[][] = [
  [
    "Form5472 Prep (",
    { href: "/", text: "www.form5472prep.com" },
    ") is an online filing service for the owners of US single-member LLCs who are not US persons. A single-member LLC owned by one foreign person must report certain transactions with its owner on IRS Form 5472, attached to a pro forma Form 1120. These forms cannot be e-filed, so Form5472 Prep prepares the package from the owner's answers, has it reviewed by a qualified accountant, collects the signature online and faxes it to the IRS Ogden PIN Unit, returning a timestamped transmission receipt.",
  ],
  [
    "The same service covers late and catch-up filings with a reasonable-cause statement, dormant LLCs and final-year filings for dissolved LLCs. It also offers ",
    { href: "/ein", text: "EIN" },
    " and ",
    { href: "/itin", text: "ITIN" },
    " application support, a white-label ",
    { href: "/partners", text: "partner programme" },
    " for formation and registered agents, and a set of free calculators and checkers. Form5472 Prep is not a general tax firm and does not provide personalised tax planning.",
  ],
];

const toPlain = (segs: Segment[]) =>
  segs.map((s) => (typeof s === "string" ? s : `${s.text} (${s.href === "/" ? SITE_URL : `${SITE_URL}${s.href}`})`)).join("");
const wordCount = (segs: Segment[]) => toPlain(segs).replace(/\(https?:[^)]*\)/g, "").trim().split(/\s+/).length;

function Rich({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        typeof s === "string" ? (
          <span key={i}>{s}</span>
        ) : (
          <Link key={i} href={s.href} className="font-medium text-accent underline-offset-4 hover:underline">
            {s.text}
          </Link>
        ),
      )}
    </>
  );
}

const FREE_TOOLS: Array<{ href: string; label: string; blurb: string }> = [
  { href: "/do-i-need-to-file-form-5472", label: "Do I need to file Form 5472?", blurb: "Six questions on whether a US LLC has a Form 5472 obligation." },
  { href: "/form-5472-deadline-calculator", label: "Form 5472 deadline calculator", blurb: "The due date for a Form 5472 and pro forma 1120, including short years and Form 7004 extensions." },
  { href: "/form-5472-penalty-calculator", label: "Form 5472 penalty calculator", blurb: "Statutory exposure under IRC section 6038A for late or unfiled forms." },
  { href: "/form-5472-reportable-transactions-checker", label: "Reportable transactions checker", blurb: "Whether common owner-to-LLC transactions are reportable on Form 5472." },
  { href: "/form-5472-late-filing-checker", label: "Late-filing route checker", blurb: "Which late-filing route applies to a missed Form 5472, with IRS sources." },
  { href: "/irs-yearly-average-exchange-rates", label: "IRS yearly average exchange rates", blurb: "The IRS yearly average rates table with a converter to US dollars." },
  { href: "/foreign-owned-llc-compliance-calendar", label: "Compliance calendar", blurb: "Federal and state deadlines for a foreign-owned single-member LLC, with an .ics download." },
  { href: "/llc-annual-fees-by-state", label: "LLC annual fees by state", blurb: "Annual fees, franchise taxes and report due dates for ten states, with official sources." },
];

const KEY_FACTS: string[] = [
  "What it does: prepares and files IRS Form 5472 with the pro forma Form 1120 for foreign-owned US single-member LLCs.",
  "Who it is for: non-US owners of single-member US LLCs, plus formation agents, registered agents and accounting firms that file for client LLCs.",
  "Review: every filing is reviewed by a qualified accountant before it is submitted.",
  "Delivery: the signed package is faxed to the IRS Ogden PIN Unit and a timestamped transmission receipt is stored.",
  `Prices: Standard ${formatPrice(TIERS.standard.priceCents)} (${STANDARD_TURNAROUND}), Express ${formatPrice(TIERS.express.priceCents)} (within ${EXPRESS_TURNAROUND}), 24-Hour ${formatPrice(TIERS.priority.priceCents)} (ready to sign within ${PRIORITY_TURNAROUND}), +${formatPrice(MULTI_YEAR_ADDON_CENTS)} per additional past tax year; IRS fax delivery included. The three tiers differ only in speed. EIN service ${formatPrice(EIN_PRICE_CENTS)}; ITIN service ${formatPrice(ITIN_PRICE_CENTS)}.`,
  "Other services: late (DIIRSP) catch-up filings, dormant-LLC and final-year filings, EIN and ITIN application support, white-label filing for partners.",
  `Free tools: ${FREE_TOOLS.length} calculators, checkers and reference tables (listed below).`,
  "Scope: Form5472 Prep prepares and submits forms from the information customers give it. It is not a general tax firm and does not give personalised tax planning.",
  `Founded: ${FOUNDED}.`,
  "Website: www.form5472prep.com. Reviews: Trustpilot.",
];

// Keep in sync with tailwind.config.ts (accent, ink, paper, seal) and the
// wordmark colour inside public/logo.svg.
const COLOURS: Array<{ name: string; hex: string; use: string; text: string }> = [
  { name: "Accent blue", hex: "#1e3a8a", use: "Logo mark, links, buttons", text: "#ffffff" },
  { name: "Ink", hex: "#0e1b33", use: "Hero bands, display text", text: "#ffffff" },
  { name: "Wordmark slate", hex: "#0f172a", use: "“Form” and “Prep” in the wordmark", text: "#ffffff" },
  { name: "Paper", hex: "#fbfaf7", use: "Document-style surfaces", text: "#0e1b33" },
  { name: "Seal brass", hex: "#b08d4f", use: "Hairline rule, receipt stamp", text: "#ffffff" },
];

const LOGOS: Array<{ file: string; name: string; detail: string; kind: "svg" | "png"; light: boolean }> = [
  { file: "form5472-prep-logo.svg", name: "Logo with wordmark (SVG)", detail: "Vector, horizontal. For light backgrounds.", kind: "svg", light: true },
  { file: "form5472-prep-logo-horizontal.png", name: "Logo with wordmark (PNG)", detail: "1200 x 258 px, transparent background. For light backgrounds.", kind: "png", light: true },
  { file: "form5472-prep-logo-mark.svg", name: "Logo mark (SVG)", detail: "Vector, square document mark.", kind: "svg", light: false },
  { file: "form5472-prep-icon-512.png", name: "App icon (PNG)", detail: "512 x 512 px, rounded square.", kind: "png", light: false },
];

export default function PressPage() {
  const blurbText = toPlain(BLURB);
  const boilerplateText = BOILERPLATE.map(toPlain).join("\n\n");

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}${PATH}#webpage`,
        url: `${SITE_URL}${PATH}`,
        name: `${SITE_NAME} press kit`,
        description: DESCRIPTION,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        about: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
        // The H1, the lead and the short blurb carry data-speakable.
        speakable: SPEAKABLE,
      },
      organizationNode(),
    ],
  };

  return (
    <>
      <JsonLd data={graph} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Press kit", path: PATH },
        ])}
      />

      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-seal/50" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: "radial-gradient(55% 55% at 20% 0%, rgba(30,58,138,0.5) 0%, rgba(14,27,51,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li className="text-slate-300" aria-current="page">Press kit</li>
            </ol>
          </nav>
          <h1 className="mt-8 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Form5472 Prep press kit
          </h1>
          <p className="lead mt-6 max-w-3xl text-lg leading-relaxed text-slate-300" data-speakable>
            Everything needed to describe Form5472 Prep accurately: a short blurb, a longer description, key facts,
            logo files, brand colours and a contact for press enquiries. Text can be copied and quoted as written.
          </p>
        </div>
      </section>

      <div className="bg-white">
        <div className="mx-auto max-w-4xl space-y-16 px-4 py-14 sm:px-6 sm:py-16">
          <section aria-labelledby="blurb">
            <h2 id="blurb" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              What is Form5472 Prep?
            </h2>
            <p className="mt-1 text-xs text-slate-500">Short blurb, {wordCount(BLURB)} words.</p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-paper p-5">
              <p className="leading-relaxed text-slate-800" data-speakable>
                <Rich segments={BLURB} />
              </p>
              <div className="mt-4">
                <CopyButton text={blurbText} label="the short blurb" />
              </div>
            </div>
          </section>

          <section aria-labelledby="boilerplate">
            <h2 id="boilerplate" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Boilerplate / long description
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {BOILERPLATE.reduce((n, p) => n + wordCount(p), 0)} words. Suitable for directory listings and the
              end of an article.
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-paper p-5">
              <div className="space-y-4 leading-relaxed text-slate-800">
                {BOILERPLATE.map((p, i) => (
                  <p key={i}>
                    <Rich segments={p} />
                  </p>
                ))}
              </div>
              <div className="mt-4">
                <CopyButton text={boilerplateText} label="the boilerplate" />
              </div>
            </div>
          </section>

          <section aria-labelledby="facts">
            <h2 id="facts" className="font-serif text-2xl font-semibold tracking-tight text-ink">What are the key facts about Form5472 Prep?</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-700 marker:text-accent">
              {KEY_FACTS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              Full plan details are on the{" "}
              <Link href="/pricing" className="font-medium text-accent underline-offset-4 hover:underline">pricing page</Link>
              . Reviews are on{" "}
              <a
                href={TRUSTPILOT_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Trustpilot
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="logos">
            <h2 id="logos" className="font-serif text-2xl font-semibold tracking-tight text-ink">Logos</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Use the files unchanged: no recolouring, stretching or added effects. The wordmark is dark, so place the
              full logo on a light background.
            </p>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {LOGOS.map((l) => (
                <li key={l.file} className="flex flex-col overflow-hidden rounded-lg border border-slate-200">
                  <div className="grid grid-cols-2">
                    <div className="flex h-28 items-center justify-center bg-white p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/press/${l.file}`} alt={`${l.name} on a light background`} className="max-h-full max-w-full object-contain" />
                    </div>
                    {l.light ? (
                      <div className="flex h-28 items-center justify-center bg-paper p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/press/${l.file}`} alt={`${l.name} on a paper background`} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-28 items-center justify-center bg-ink p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/press/${l.file}`} alt={`${l.name} on a dark background`} className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col border-t border-slate-200 p-4">
                    <p className="font-medium text-slate-900">{l.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{l.detail}</p>
                    <a
                      href={`/press/${l.file}`}
                      download
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      Download {l.kind.toUpperCase()}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="colours">
            <h2 id="colours" className="font-serif text-2xl font-semibold tracking-tight text-ink">Brand colours</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COLOURS.map((c) => (
                <li key={c.hex} className="overflow-hidden rounded-lg border border-slate-200">
                  <div
                    className="flex h-16 items-end px-4 pb-2 font-mono text-sm"
                    style={{ backgroundColor: c.hex, color: c.text }}
                  >
                    {c.hex}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-600">{c.use}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tools">
            <h2 id="tools" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Free tools you can cite or link
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Each tool is free to use without an account.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {FREE_TOOLS.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                  >
                    <span className="font-medium text-slate-900 group-hover:text-accent">{t.label}</span>
                    <span className="mt-1.5 text-sm text-slate-600">{t.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="related">
            <h2 id="related" className="font-serif text-2xl font-semibold tracking-tight text-ink">Related links</h2>
            <ul className="mt-4 grid gap-x-8 gap-y-2 text-slate-700 sm:grid-cols-2">
              <li><Link href="/about" className="text-accent underline-offset-4 hover:underline">About Form5472 Prep</Link></li>
              <li><Link href={SERVICES_HUB_PATH} className="text-accent underline-offset-4 hover:underline">Form 5472 filing services</Link></li>
              {SERVICE_PAGES.map((p) => (
                <li key={p.slug}>
                  <Link href={servicePath(p.slug)} className="text-accent underline-offset-4 hover:underline">{p.h1}</Link>
                </li>
              ))}
              <li><Link href="/compare" className="text-accent underline-offset-4 hover:underline">Compare Form 5472 filing services</Link></li>
              <li><Link href="/pricing" className="text-accent underline-offset-4 hover:underline">Pricing</Link></li>
              <li><Link href="/editorial-policy" className="text-accent underline-offset-4 hover:underline">Editorial policy</Link></li>
            </ul>
          </section>

          <section aria-labelledby="contact" className="rounded-lg border border-paper-edge bg-paper p-6">
            <h2 id="contact" className="font-serif text-2xl font-semibold tracking-tight text-ink">Who is the press contact?</h2>
            <p className="mt-3 text-slate-700">
              For press enquiries, interview requests and corrections, email{" "}
              <a href={`mailto:${ORG_EMAIL}`} className="font-medium text-accent underline-offset-4 hover:underline">
                {ORG_EMAIL}
              </a>
              . Please mention that the enquiry is for the press team.
            </p>
            <p className="mt-4">
              <Link href="/contact" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                Other ways to get in touch
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
