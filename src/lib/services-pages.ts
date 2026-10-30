// ─────────────────────────────────────────────────────────────────────────────
// /services hub + bottom-of-funnel service pages (compact-keywords pass,
// 2026-10-01). Plan: docs/seo/plan-2026-10-01-compact-keywords.md; keywords
// and Moz evidence: docs/seo/keyword-sheet.csv.
//
// On-page contract (playbook §6, enforced by services-pages.test.ts):
//   - URL contains the keyword; <title> STARTS with the primary keyword, ≤60
//     chars (rendered with `title.absolute`, so no template suffix is added);
//   - meta description STARTS with the keyword, ≤160 chars — the long,
//     entity-dense text lives in `longDescription` (og:, twitter:, JSON-LD);
//   - H1 contains the keyword in EXACT word order;
//   - keyword within the first 6 words of the intro's first sentence;
//   - keyword in at least one H2; 4 FAQs ≤50 words; ≥4 related links;
//     800–1,200 words of body copy (400–700 for the four short audience
//     pages added 2026-10-05: hire someone / preparer / accountants /
//     bookkeepers; docs/seo/audience-keywords-2026-10-05.md).
//
// Facts: only what the site already verifies (docs/research/*.md,
// src/lib/tools/**/sources.ts, form1120DueDate.ts, the partner program code).
// Prices are interpolated from src/lib/pricing.ts — never type a dollar figure.
// Transaction amounts in worked examples are written "USD 5,000", never "$",
// so they cannot be mistaken for (or tested as) our prices.
// Copy rules: no "CPA", "licensed", "IRS-approved", promised outcomes or
// personal tax advice.
//
// Answer-engine contract (AEO pass, 2026-10-05; enforced by the test):
//   - every section H2 is a question that ends in "?";
//   - the first block under each H2 is a standalone answer ("capsule"): a
//     prose paragraph of at most 60 words, not a list, not a lead-in that
//     ends in a colon, and not a pointer ("This ...", "Here ...");
//   - every page states the Standard and Express prices;
//   - the bold direct answer names "Form5472 Prep" exactly once and no
//     capsule names it twice (brand-anchored quotes; audit 2026-10-15 §5);
//   - keyword ownership: a page's primary/secondary keywords appear on
//     another service page only as the anchor of a link to the owner
//     (docs/seo/service-pages-audit-2026-10-15.md §3).
//
// Body markup (rendered by src/app/(marketing)/services/ServiceRichText.tsx):
// blank line = new block; "- " = bullet; "1. " = numbered step;
// **bold**; [label](/internal-path).
// ─────────────────────────────────────────────────────────────────────────────
import { MULTI_YEAR_ADDON_CENTS, STANDARD_TURNAROUND, EXPRESS_TURNAROUND, TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { parseLandingBody } from "@/lib/landing-body";

export const SERVICES_HUB_PATH = "/services";
export const SERVICES_LAST_REVIEWED = "2026-10-15";
/** Every page was rewritten on this date to cut cross-page boilerplate after
 *  the Oct 4-11 ranking loss (docs/seo/service-pages-audit-2026-10-15.md):
 *  page-specific openings, worked examples instead of the repeated "how do the
 *  options compare" block, and brand-named capsules. */
const PAGES_REWRITTEN = "2026-10-15";

const STD = formatPrice(TIERS.standard.priceCents);
const EXP = formatPrice(TIERS.express.priceCents);
const ADD = formatPrice(MULTI_YEAR_ADDON_CENTS);
const STD_2Y = formatPrice(TIERS.standard.priceCents + MULTI_YEAR_ADDON_CENTS);
const STD_3Y = formatPrice(TIERS.standard.priceCents + MULTI_YEAR_ADDON_CENTS * 2);
const IRS_FAX = "+1-855-887-7737";

export type ServiceCategory = "annual" | "situations" | "partners";

export type ServicePage = {
  slug: string;
  /** Primary keyword, lower case, exactly as people type it. */
  keyword: string;
  /** The page's single image (first on the page, so it alone carries the
   *  keyword in its alt). 1280x720 webp under public/services/, rendered by
   *  scripts/render-service-artwork.mjs; the file name carries the slug. */
  heroImage: { src: string; alt: string };
  /** Per-page review date (YYYY-MM-DD); falls back to SERVICES_LAST_REVIEWED. */
  lastReviewed?: string;
  secondaryKeywords: string[];
  category: ServiceCategory;
  /** ISO date the page was added or last materially changed, for the sitemap.
   *  Omitted = the date sitemap.ts passes (the original 2026-10-01 set). */
  lastModified?: string;
  /** Absolute <title>; starts with the keyword; ≤60 chars. */
  title: string;
  /** <meta name="description">; starts with the keyword; ≤160 chars. */
  metaDescription: string;
  /** Long, entity-dense description for og:/twitter:/JSON-LD and llms.txt. */
  longDescription: string;
  h1: string;
  /** Short label for hub panels and related-link cards. */
  shortBlurb: string;
  /** Opening paragraphs. The first sentence carries the keyword; the bold
   *  span is the direct answer. */
  intro: string;
  cta: { href: string; label: string };
  sections: Array<{ heading: string; body: string }>;
  faqs: Array<{ q: string; a: string }>;
  related: Array<{ href: string; label: string; blurb: string }>;
  /** schema.org Service.serviceType */
  serviceType: string;
  /** False for the partner pages: no Offer markup, because volume pricing is
   *  by request. The body copy still states the direct-customer prices that
   *  partner filings are charged at. */
  showOffer: boolean;
  /** Official IRS pages relevant to this page, rendered as visible outbound
   *  links (target=_blank, followed). Every URL must be on https://www.irs.gov/
   *  and return HTTP 200; services-pages.test.ts requires at least two. */
  irsSources: Array<{ label: string; url: string; blurb: string }>;
};

const startCta = (src: string) => ({ href: `/start?src=${src}`, label: "Start your filing" });

// Free tools — the same labels everywhere so anchors stay consistent.
const TOOL = {
  reportable: {
    href: "/form-5472-reportable-transactions-checker",
    label: "Reportable transactions checker",
    blurb: "Check whether common owner–LLC money movements are reportable, with the regulation behind each answer.",
  },
  late: {
    href: "/form-5472-late-filing-checker",
    label: "Late-filing route checker",
    blurb: "A few questions that show which late-filing route fits a missed Form 5472.",
  },
  penalty: {
    href: "/form-5472-penalty-calculator",
    label: "Form 5472 penalty calculator",
    blurb: "Estimate the statutory exposure under IRC §6038A for late or unfiled years.",
  },
  calendar: {
    href: "/foreign-owned-llc-compliance-calendar",
    label: "Foreign-owned LLC compliance calendar",
    blurb: "Your federal and state dates in one list, with a calendar download.",
  },
  fx: {
    href: "/irs-yearly-average-exchange-rates",
    label: "IRS yearly average exchange rates",
    blurb: "Convert foreign-currency amounts to US dollars for Form 5472.",
  },
  stateFees: {
    href: "/llc-annual-fees-by-state",
    label: "LLC annual fees by state",
    blurb: "Annual fees, franchise taxes and report dates for ten states, with official sources.",
  },
  deadline: {
    href: "/form-5472-deadline-calculator",
    label: "Form 5472 deadline calculator",
    blurb: "The exact due date, including fiscal years, dissolution short years and extensions.",
  },
  needToFile: {
    href: "/do-i-need-to-file-form-5472",
    label: "Do I need to file Form 5472?",
    blurb: "Six questions that show whether your LLC has a Form 5472 filing obligation.",
  },
} as const;

// The real six-step flow (homepage "How it works", FilingActions): questionnaire
// → package → accountant review (gates signing) → browser signature → fax →
// timestamped receipt. Reused verbatim where a page walks through the process.
const PROCESS_STEPS = `1. **Questionnaire.** You answer guided questions about the LLC, the foreign owner and the year's money movements. It takes about 15 minutes.
2. **Package generated.** After payment we generate the cover letter, pro forma Form 1120, Form 5472 and Part V supporting statement as one PDF.
3. **Accountant review.** A tax accountant checks the package against your answers. If something needs clarifying, we message you on your filing page.
4. **Online signature.** Signing opens only after the review is approved. You sign once in your browser and the signature is placed in each required box.
5. **Fax to the IRS.** We fax the signed package to the IRS Ogden PIN Unit at ${IRS_FAX}.
6. **Fax receipt.** You get the timestamped transmission receipt on your filing page. It is proof of what was sent and when, not an IRS acceptance notice.`;

export const SERVICE_PAGES: ServicePage[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "form-5472-filing-service",
    keyword: "form 5472 filing service",
    heroImage: {
      src: "/services/services_form-5472-filing-service_form-and-checkmark.webp",
      alt: "Form 5472 filing service: a completed Form 5472 with a confirmation checkmark",
    },
    secondaryKeywords: ["form 5472 and pro forma 1120 filing service", "form 5472 online filing", "1120 and 5472 filing service"],
    category: "annual",
    lastModified: PAGES_REWRITTEN,
    title: "Form 5472 Filing Service, Faxed to the IRS | Form5472 Prep",
    metaDescription:
      "Form 5472 filing service for foreign-owned US LLCs: Form 5472 and pro forma 1120 prepared, reviewed by a PTIN-holding tax accountant and faxed to the IRS.",
    longDescription:
      "Form5472 Prep's Form 5472 and pro forma 1120 filing service for foreign-owned US single-member LLCs (disregarded entities): a 15-minute online questionnaire, a package generated from your answers, review by a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN), online signature, fax delivery to the IRS Ogden PIN Unit (+1-855-887-7737) and a timestamped fax receipt. Flat fee per filing year.",
    h1: "Form 5472 Filing Service for Foreign-Owned US LLCs",
    shortBlurb: "This year's Form 5472 and pro forma 1120, prepared, reviewed and faxed in one order.",
    intro: `Our Form 5472 filing service is for the foreign owner of a US single-member LLC who needs this year's Form 5472 and pro forma 1120 filed. **Form5472 Prep turns about 15 minutes of your answers into the complete IRS package, has a PTIN-holding tax accountant review it, collects your online signature, faxes it to the IRS Ogden PIN Unit and stores the timestamped fax receipt.**

Because the two forms travel together, it is a Form 1120 and 5472 filing service in one order. It is a filing service, not tax advice: the forms are built from the information you give us.`,
    cta: startCta("svc-form-5472-filing-service"),
    sections: [
      {
        heading: "What does the Form 5472 filing service include?",
        body: `Every order covers one tax year end to end: the forms, a Part V statement and a cover letter, the accountant review, online signing, the IRS fax and the stored receipt. A late year also gets its own reasonable-cause statement.

- Form 5472, completed for a foreign-owned disregarded entity
- The pro forma Form 1120 cover, marked "Foreign-owned U.S. DE" as the instructions require
- A Part V supporting statement describing the year's contributions, distributions and other Part V transactions
- A cover letter, plus a reasonable-cause statement for each late year
- Review by a tax accountant before you sign
- Fax delivery to the IRS Ogden PIN Unit
- The timestamped fax receipt, stored on your filing page
- A reminder in the second week of January for next year's filing`,
      },
      {
        heading: "How does the Form 1120 and 5472 filing service work, step by step?",
        body: `The service has six steps: you answer about 15 minutes of questions, we generate the package, a tax accountant reviews it, you sign online, we fax it to the IRS Ogden PIN Unit, and you get the timestamped fax receipt.

${PROCESS_STEPS}

A foreign-owned disregarded entity cannot e-file this package. It goes to the IRS by fax or mail, which is why fax delivery is part of the service rather than an extra.`,
      },
      {
        heading: "What does a filed package look like for a first-year LLC?",
        body: `Take a Wyoming LLC formed in March by an owner who lives in Spain. During the year the owner wired USD 5,000 in, paid a USD 300 registered agent bill from a personal card and took USD 1,000 out in December. All three moved money between the owner and the LLC, so the LLC files.

From those answers the package comes out as:

- **Pro forma Form 1120:** the LLC's name, address and EIN, the initial-return box in item E, and "Foreign-owned U.S. DE" across the top. The income, deduction and tax sections stay blank.
- **Form 5472:** the owner's details as the foreign shareholder and related party, and the LLC's total assets on the last day of the year.
- **Part V statement:** the USD 5,000 contribution, the USD 300 bill paid personally (also a contribution) and the USD 1,000 distribution, each on its own line.
- **Cover letter:** the LLC, its EIN and the tax year, so the pages stay together at the IRS.

For a calendar-year LLC this package is due April 15 of the following year. Amounts in another currency are converted with the [IRS yearly average exchange rates](/irs-yearly-average-exchange-rates). The full list of what to have ready is on the [hire someone to file Form 5472](/services/hire-someone-to-file-form-5472) page.`,
      },
      {
        heading: "What is this service not, and what can nobody promise?",
        body: `The service prepares and submits two forms from the information you give us. It is not tax advice, not an IRS acceptance notice, not a penalty waiver and not a filing for other returns.

- **Not tax advice.** You remain responsible for the accuracy of what you tell us.
- **Not an IRS acceptance notice.** The fax receipt shows what was sent and when, not that the IRS has processed the return.
- **Not a penalty waiver.** If a year is already late, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).
- **Not every return.** We do not prepare Form 1065, a full Form 1120 for an LLC taxed as a corporation, Form 1040-NR or state returns, and we do not keep books. A [Form 7004 extension](/form-7004-extension) is a separate paid service.`,
      },
      {
        heading: "How much does the Form 5472 filing service cost?",
        body: `Form5472 Prep charges ${STD} per filing year on Standard, ready in ${STANDARD_TURNAROUND}, or ${EXP} on Express, ready to sign within ${EXPRESS_TURNAROUND}. Each additional past year adds ${ADD} on either plan, and the accountant review and IRS fax are included, with no subscription.

The sample LLC above would pay ${STD} on Standard. If it had also missed the year before, the order would be ${STD_2Y}. See the [pricing page](/pricing), or start the questionnaire now.`,
      },
    ],
    faqs: [
      {
        q: "Can I file Form 5472 online?",
        a: "Not through IRS e-file for a foreign-owned disregarded entity. The package goes to the IRS Ogden PIN Unit by fax or mail. Our service is online on your side: you answer questions and sign in your browser, and we send the fax.",
      },
      {
        q: "Does the service include the pro forma 1120?",
        a: "Yes. A foreign-owned single-member LLC files Form 5472 attached to a pro forma Form 1120. We prepare both together, have them reviewed, and fax them as one package.",
      },
      {
        q: "When is Form 5472 due?",
        a: "For a calendar-year LLC, April 15 of the following year. The general rule is the 15th day of the 4th month after the tax year ends. The [deadline calculator](/form-5472-deadline-calculator) handles fiscal and short years.",
      },
      {
        q: "Who reviews my filing?",
        a: "Every filing is reviewed by a tax accountant who holds an IRS PTIN (Preparer Tax Identification Number) before it is submitted. Signing opens only after the review is approved, so you never sign an unchecked package.",
      },
    ],
    related: [], // filled below from slugs + tools
    serviceType: "Form 5472 and pro forma Form 1120 preparation and IRS fax filing",
    showOffer: true,
    irsSources: [
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The current revision of Form 5472 and its instructions, and any later IRS changes to them.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file, the pro forma Form 1120 a foreign-owned U.S. DE attaches Form 5472 to, and the Part V statement used in the example above.",
      },
    ],
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "pro-forma-1120-filing-service",
    keyword: "pro forma 1120 filing service",
    heroImage: {
      src: "/services/services_pro-forma-1120-filing-service_form-pair.webp",
      alt: "Pro forma 1120 filing service: Form 1120 and Form 5472 prepared as one filing set",
    },
    secondaryKeywords: ["pro forma 1120 preparer for non resident"],
    category: "annual",
    lastModified: PAGES_REWRITTEN,
    title: "Pro Forma 1120 Filing Service with Form 5472 | Form5472 Prep",
    metaDescription:
      "Pro forma 1120 filing service for non-resident owners of US single-member LLCs: the 1120 cover and Form 5472 prepared, reviewed and faxed to the IRS.",
    longDescription:
      "Form5472 Prep's pro forma Form 1120 preparation for non-resident owners of foreign-owned US single-member LLCs: the Form 1120 page-1 cover (name, address, EIN, item E boxes, marked \"Foreign-owned U.S. DE\") prepared together with Form 5472 and the Part V statement, reviewed by a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN), signed online and faxed to the IRS Ogden PIN Unit with a timestamped receipt.",
    h1: "Pro Forma 1120 Filing Service for Non-Resident LLC Owners",
    shortBlurb: "The Form 1120 cover your Form 5472 is attached to, box by box, filed with it as one set.",
    intro: `Our pro forma 1120 filing service is for a foreign-owned US single-member LLC that needs the Form 1120 cover its Form 5472 is attached to. **Form5472 Prep completes the few page-1 items the IRS asks for, writes "Foreign-owned U.S. DE" across the top, attaches Form 5472 and the Part V statement, and faxes the set to the IRS once you have signed.**

The pro forma 1120 is not an income-tax return: it reports no income and computes no tax.`,
    cta: startCta("svc-pro-forma-1120-filing-service"),
    sections: [
      {
        heading: "What is a pro forma 1120, in plain terms?",
        body: `A pro forma 1120 is the Form 1120 cover that a foreign-owned US single-member LLC attaches Form 5472 to. It carries only identifying details, is marked "Foreign-owned U.S. DE", and reports no income or tax.

Under Treas. Reg. §1.6038A-1(c), a US LLC wholly owned by one foreign person counts as a reporting corporation for the section 6038A rules only. That is why it uses a Form 1120 at all. For income tax it stays a [disregarded entity](/what-is-a-disregarded-entity).`,
      },
      {
        heading: "Which boxes does the pro forma 1120 filing service fill in?",
        body: `Only the items the Form 5472 instructions list for a foreign-owned U.S. DE: the LLC's name and address, its EIN in item B, the applicable item E boxes and the "Foreign-owned U.S. DE" marking. The income, deduction and tax sections stay blank.

For a first-year LLC the cover reads:

- **Name and address:** the LLC's legal name and US address, as on its EIN letter
- **Item B:** the LLC's nine-digit EIN
- **Item E:** "Initial return" checked
- **Top margin:** "Foreign-owned U.S. DE"
- **Page 1 signature block:** signed by you, online, after the accountant review

Form 5472 and the Part V statement are prepared from the same answers, so the EIN, name and year match on every page. For a filled-in sample of the forms, see the [completed Form 5472 example](/form-5472-example).`,
      },
      {
        heading: "Which mistakes does the accountant review catch?",
        body: `The review by a tax accountant who holds an IRS PTIN checks the small errors a short cover makes easy to miss, such as the "Foreign-owned U.S. DE" marking, blank income lines, matching EINs and the year-end total assets on Form 5472.

The checks include:

- "Foreign-owned U.S. DE" is written across the top of the 1120.
- The income, deduction and tax lines are left blank.
- The 1120 and Form 5472 travel together. One without the other is not a complete filing.
- The EIN and LLC name match on both forms.
- Form 5472 still shows the year-end total assets. The cover does not need Schedule L, but that is not permission to leave the Form 5472 figure blank.`,
      },
      {
        heading: "Who needs a pro forma 1120 preparer for a non-resident-owned LLC?",
        body: `You most likely need the filing if the LLC is a US LLC with a single owner who is a foreign individual or company, it has not elected to be taxed as a corporation, and it had a reportable transaction in the year, such as money you put in or took out, or LLC fees you paid personally.

Not sure? The free [Do I need to file Form 5472?](/do-i-need-to-file-form-5472) checker walks through these questions with IRS sources. If the LLC is not formed yet, see [can a foreigner own a US LLC](/can-a-foreigner-own-a-us-llc).`,
      },
      {
        heading: "What is a pro forma 1120 not, and what can nobody promise?",
        body: `A pro forma 1120 is not a corporate income-tax return, not a way to lower tax and not a personal return. If the filing is late, nobody can promise the IRS will not assess the $25,000 penalty.

- **Not a corporate income-tax return.** If your LLC elected corporate tax treatment on Form 8832, it files a full Form 1120 that computes tax, with Form 5472 attached. We do not prepare that return.
- **Not a way to lower tax.** The pro forma return reports no income and no tax.
- **Not a personal return.** If the owner has a US filing duty of their own, such as Form 1040-NR, that is separate. We do not file it.
- **Not penalty relief.** If the filing is late, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).
- **Not tax advice.** We prepare forms from the information you give us.`,
      },
      {
        heading: "What changes on the pro forma 1120 from one year to the next?",
        body: `Very little changes on the cover itself. Each year's pro forma 1120 shows that year's tax period, and the item E boxes follow what happened to the LLC; the figures that move every year live on Form 5472 and its Part V statement.

- **First year:** "Initial return" in item E.
- **A year the LLC changed its name or address:** the matching item E box, with the new details on the cover.
- **The year the LLC dissolves:** "Final return" in item E, for the short year that ends on dissolution; see the [final Form 5472 for a dissolved LLC](/services/final-form-5472-for-dissolved-llc).
- **Every year:** a new Form 5472 with that year's transactions and year-end total assets.

A cover copied from last year with the old tax period or a stale box is one of the errors the review is there to catch.`,
      },
      {
        heading: "How much does a pro forma 1120 filing service cost?",
        body: `Form5472 Prep never prices the pro forma 1120 on its own, because it is always filed with Form 5472. The pair costs ${STD} on Standard (ready in ${STANDARD_TURNAROUND}) or ${EXP} on Express (ready to sign within ${EXPRESS_TURNAROUND}), plus ${ADD} per additional past year.

See the [pricing page](/pricing) for everything each plan includes.`,
      },
    ],
    faqs: [
      {
        q: "Is a pro forma 1120 the same as a Form 1120 tax return?",
        a: "No. It uses Form 1120 page 1 as a cover for Form 5472. You complete the identifying items and write \"Foreign-owned U.S. DE\" across the top. Income, deductions and tax are left blank.",
      },
      {
        q: "Does the pro forma 1120 need an EIN?",
        a: "Yes. Item B asks for the LLC's EIN, and Form 5472 needs it too. If the LLC has no EIN yet, our [EIN service](/ein) can obtain one first.",
      },
      {
        q: "Who signs the pro forma 1120?",
        a: "The person authorized to sign for the LLC. With us you sign once online after the accountant review, and the signature is placed in each required box. A wet-ink option is available if you prefer it.",
      },
      {
        q: "Is the pro forma 1120 filed every year?",
        a: "Every year the LLC must file Form 5472. The instructions excuse a foreign-owned LLC only for a year with no reportable transactions, and owner-paid fees or capital contributions can count as reportable.",
      },
    ],
    related: [],
    serviceType: "Pro forma Form 1120 preparation for foreign-owned US disregarded entities",
    showOffer: true,
    irsSources: [
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "The special rule for a foreign-owned U.S. DE: which Form 1120 items to complete and the marking written across the top.",
      },
      {
        label: "About Form 1120 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-1120",
        blurb: "The IRS page for Form 1120, the return a foreign-owned disregarded entity files in pro forma form with Form 5472.",
      },
      {
        label: "Instructions for Form 1120 (IRS)",
        url: "https://www.irs.gov/instructions/i1120",
        blurb: "The general Form 1120 instructions, including the item E boxes and the page 1 signature block used on the cover.",
      },
    ],
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "late-form-5472-filing-service",
    keyword: "late form 5472 filing service",
    heroImage: {
      src: "/services/services_late-form-5472-filing-service_past-year-returns.webp",
      alt: "Late Form 5472 filing service: stacked folders of missed-year returns and a clock",
    },
    secondaryKeywords: ["delinquent form 5472 filing service", "form 5472 catch up filing multiple years"],
    category: "situations",
    lastModified: PAGES_REWRITTEN,
    title: "Late Form 5472 Filing Service for Past Years | Form5472 Prep",
    metaDescription:
      "Late Form 5472 filing service for missed years: a package and reasonable-cause statement for each year, reviewed and faxed to the IRS Ogden PIN Unit.",
    longDescription:
      "Form5472 Prep's delinquent Form 5472 filing service for foreign-owned US single-member LLCs: one Form 5472 and pro forma 1120 package per missed year, a reasonable-cause statement for each late year under Treas. Reg. §1.6038A-4(b), a DIIRSP cover letter, PTIN-holding tax accountant review, and fax delivery to the IRS Ogden PIN Unit with a timestamped receipt for each package. No promise of penalty relief.",
    h1: "Late Form 5472 Filing Service for Missed Years",
    shortBlurb: "Catch-up filings for one or more missed years, with a reasonable-cause statement for each.",
    intro: `Our late Form 5472 filing service is for foreign owners who missed one or more years of Form 5472 and want every missing year on record. **Form5472 Prep prepares a separate Form 5472 and pro forma 1120 for each missed year, writes a reasonable-cause statement for each from your facts, and faxes every package to the IRS with its own receipt.**

Filing late does not cancel the $25,000 penalty under IRC §6038A(d). Whether the delay is excused is the IRS's decision, made case by case, and nobody can tell you the outcome in advance.`,
    cta: startCta("svc-late-form-5472-filing-service"),
    sections: [
      {
        heading: "Which late-filing route applies to you?",
        body: `The IRS's published late-filing route, the Delinquent International Information Return Submission Procedures (DIIRSP), is for taxpayers who are not under a civil examination or a criminal investigation by the IRS and have not already been contacted by the IRS about the delinquent information returns.

If that fits, the IRS says to file the delinquent returns "through normal filing procedures". For a foreign-owned LLC we read that as the pro forma 1120 with Form 5472 attached, sent as the Form 5472 instructions direct. That reading is ours: the DIIRSP page does not mention disregarded entities by name.

If you already have an IRS notice, that is a different situation. Answer the notice by its deadline. Our free [late-filing checker](/form-5472-late-filing-checker) shows which route fits your facts.`,
      },
      {
        heading: "What does the late Form 5472 filing service include?",
        body: `For each missed year we prepare a Form 5472 and pro forma 1120 package with that year's figures and a reasonable-cause statement, have a tax accountant who holds an IRS PTIN review it, and fax it to the IRS Ogden PIN Unit with a timestamped receipt.

- One Form 5472 and pro forma 1120 package for each missed year, with that year's figures
- A reasonable-cause statement for each late year, written from your answers about why the filing was missed
- A cover letter for the delinquent submission
- Review of every year's package by a tax accountant before you sign
- Fax delivery of each package to the IRS Ogden PIN Unit, with a timestamped receipt for each

For each year we ask for the money that moved between you and the LLC, loans, related-party payments and the year-end total assets. If amounts were in another currency, the [IRS yearly average exchange rates](/irs-yearly-average-exchange-rates) table converts them to US dollars.`,
      },
      {
        heading: "What does reasonable cause mean for a late Form 5472?",
        body: `Treas. Reg. §1.6038A-4(b) allows certain failures to be excused for reasonable cause, including not filing Form 5472 on time. The statement has to set out all the facts and carry a declaration that it is made under penalties of perjury.

- The decision is made case by case, on all the facts and circumstances.
- An honest misunderstanding of fact or law, reasonable for someone with your experience, can qualify.
- For a small corporation (gross receipts of $20,000,000 or less) that did not know the rules, has limited US presence and promptly complies with IRS requests, the regulation tells the IRS to apply the exception liberally.

We write each statement from your facts. We do not invent reasons, and you sign it. For how the statement is structured, see our guide to the [Form 5472 reasonable cause statement](/form-5472-reasonable-cause-statement).`,
      },
      {
        heading: "Does each late year need its own reasonable-cause statement?",
        body: `Yes. Each late year is a separate return with its own penalty exposure, so each gets its own reasonable-cause statement.

The facts often differ from year to year: when the LLC was formed, when you learned of the rule, what changed in between. A statement written for the specific year says what happened in that year, rather than repeating one general explanation across several returns.`,
      },
      {
        heading: "What can nobody promise about late filings?",
        body: `Nobody can promise a penalty outcome for a late Form 5472: the IRS decides reasonable cause case by case and may assess the penalty during processing without considering the attached statement.

- **No penalty outcome.** The DIIRSP page itself says: "Penalties may be assessed in accordance with existing procedures."
- **No first-pass review of your statement.** The IRS says penalties may be assessed during processing without considering the attached statement. You may need to answer later IRS letters and resubmit the reasonable-cause information.
- **No other missed returns.** Form 1065, Form 1040-NR and state filings are outside this service.
- **No tax advice.** If you face an existing penalty or an examination, speak to a tax professional.`,
      },
      {
        heading: "What does a three-year catch-up look like?",
        body: `Take an LLC that was formed three tax years ago and has never filed. That is three separate returns, each with its own figures, its own reasonable-cause statement and its own fax receipt, all ordered through one questionnaire.

- **The formation year:** the money you put in to set the LLC up and any setup costs you paid personally, with "Initial return" checked on that year's pro forma 1120.
- **Each later year:** that year's contributions, distributions and loans, and the LLC's total assets at the end of that year.
- **Three statements:** each one says what happened in its own year, from when the LLC was formed to when you learned of the filing.
- **Three receipts:** one timestamped fax receipt per package, kept on your filing page.

On Standard the whole catch-up costs ${STD_3Y}: ${STD} for the first year plus ${ADD} for each of the other two. Before you start, the [penalty calculator](/form-5472-penalty-calculator) shows the statutory exposure for the years involved.

If you also face an existing penalty, an examination or other unfiled returns, advice from a tax professional matters more than paperwork.`,
      },
      {
        heading: "How much does a late Form 5472 filing cost?",
        body: `Form5472 Prep charges ${STD} for the first late year on Standard (ready in ${STANDARD_TURNAROUND}) or ${EXP} on Express (ready to sign within ${EXPRESS_TURNAROUND}), then ${ADD} for each additional past year. Two years on Standard cost ${STD_2Y}.

Each late year's price includes its own reasonable-cause statement. See the [pricing page](/pricing).`,
      },
    ],
    faqs: [
      {
        q: "How many past years can I file at once?",
        a: `You choose all the years you need when you start. Each year gets its own package and its own reasonable-cause statement, and each additional year adds ${ADD}.`,
      },
      {
        q: "Will the IRS waive the $25,000 penalty?",
        a: "Nobody can promise that. Reasonable cause is decided case by case under Treas. Reg. §1.6038A-4(b), and the IRS states that penalties may be assessed in accordance with existing procedures.",
      },
      {
        q: "What if I already received an IRS notice?",
        a: "Then the DIIRSP eligibility wording no longer fits, because the IRS has contacted you. Respond to the notice by its deadline. The [late-filing checker](/form-5472-late-filing-checker) shows the routes; consider advice from a tax professional.",
      },
      {
        q: "Do I need old bank statements?",
        a: "They help. For each year we ask about money between you and the LLC, loans, related-party payments and year-end total assets. Bank statements are the easiest source for those figures.",
      },
    ],
    related: [],
    serviceType: "Delinquent Form 5472 and pro forma Form 1120 filing with reasonable-cause statements",
    showOffer: true,
    irsSources: [
      {
        label: "Delinquent International Information Return Submission Procedures (IRS)",
        url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures",
        blurb: "The IRS description of the procedure for filing late international information returns, and who it is for.",
      },
      {
        label: "Penalty relief for reasonable cause (IRS)",
        url: "https://www.irs.gov/payments/penalty-relief-for-reasonable-cause",
        blurb: "How the IRS describes reasonable-cause relief from penalties.",
      },
      {
        label: "International information reporting penalties (IRS)",
        url: "https://www.irs.gov/payments/international-information-reporting-penalties",
        blurb: "The IRS overview of penalties for international information returns, including Form 5472.",
      },
    ],
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "foreign-owned-llc-tax-filing-service",
    keyword: "foreign owned llc tax filing service",
    heroImage: {
      src: "/services/services_foreign-owned-llc-tax-filing-service_globe-and-form.webp",
      alt: "Foreign owned LLC tax filing service: a globe beside a Form 5472 information return",
    },
    secondaryKeywords: ["us tax filing service for non resident llc owner", "non resident llc compliance service"],
    category: "annual",
    lastModified: PAGES_REWRITTEN,
    title: "Foreign Owned LLC Tax Filing Service | Form5472 Prep",
    metaDescription:
      "Foreign owned LLC tax filing service for non-resident owners of single-member US LLCs: Form 5472 and pro forma 1120 prepared, reviewed and faxed.",
    longDescription:
      "Federal tax filing service from Form5472 Prep for non-resident owners of foreign-owned US single-member LLCs: Form 5472 with the pro forma Form 1120 required by Treas. Reg. §301.7701-2(c)(2)(vi) and §1.6038A-1, prepared from a questionnaire, reviewed by a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN) and faxed to the IRS Ogden PIN Unit. Scope stated plainly: no Form 1065, Form 1040-NR, state returns or bookkeeping.",
    h1: "Foreign-Owned LLC Tax Filing Service for Non-Resident Owners",
    shortBlurb: "Which US filings a non-resident's LLC has, and the federal one we prepare and fax.",
    intro: `Our foreign-owned LLC tax filing service is for non-resident owners who want to know which US filings their single-member LLC has, and want the federal one done for them. **For a disregarded LLC with one foreign owner, the yearly LLC-level federal filing is generally Form 5472 attached to a pro forma Form 1120; Form5472 Prep prepares, reviews and faxes that filing and says plainly what it does not cover.**

The owner's own return and the state's filings are separate obligations, set out below.`,
    cta: startCta("svc-foreign-owned-llc-tax-filing-service"),
    sections: [
      {
        heading: "What does the foreign-owned LLC tax filing service cover?",
        body: `The service covers the yearly federal information return for a US LLC that has one foreign owner and has not elected corporate tax treatment: Form 5472 with the pro forma Form 1120, prepared, reviewed by a tax accountant who holds an IRS PTIN and faxed to the IRS.

- Form 5472, reporting the year's transactions between the LLC and you or other related parties
- The pro forma Form 1120 that Form 5472 is attached to
- A Part V supporting statement, and a reasonable-cause statement for each late year
- Tax-accountant review, online signing, fax to the IRS Ogden PIN Unit and the timestamped receipt`,
      },
      {
        heading: "Why does a non-resident's LLC file at all?",
        body: `A single-member LLC is disregarded for US income tax by default, but Treas. Reg. §301.7701-2(c)(2)(vi) treats an LLC with one foreign owner as a corporation for section 6038A reporting. That is why it reports its owner transactions on Form 5472.

The result:

- The LLC reports transactions with its owner on Form 5472, even with no income.
- Money you put in, money you take out and LLC bills you pay personally can all be reportable.
- Missing a required Form 5472 can mean a $25,000 penalty for each year under IRC §6038A(d).

The LLC uses the same tax year as its owner uses for US filing or, if the owner has none, the calendar year. The filing is due by the 15th day of the 4th month after the tax year ends: April 15 for a calendar year. It cannot be e-filed; it goes to the IRS by fax or mail.`,
      },
      {
        heading: "Which US filings can a foreign-owned single-member LLC have?",
        body: `They fall into three layers: the LLC's own federal information return, any US return the owner must file personally, and the filings set by the state of formation. Only the first layer is part of this service, and each layer has its own deadline.

- **LLC, federal, each year with a reportable transaction:** Form 5472 with the pro forma Form 1120. Covered.
- **LLC, federal, missed years:** the same package for each year, with a reasonable-cause statement. Covered by the [late Form 5472 filing service](/services/late-form-5472-filing-service).
- **Owner, federal:** for example Form 1040-NR, if the owner has a US filing requirement of their own. Not covered; we cannot tell you whether you need one.
- **LLC, state:** annual reports and franchise taxes set by the state of formation. The [LLC annual fees by state](/llc-annual-fees-by-state) table lists ten states. Not covered.
- **Identification numbers:** an [EIN for the LLC](/ein) if it has none, and [ITIN application support](/itin) for an owner with a federal tax reason to need one. Separate services.

The free [compliance calendar](/foreign-owned-llc-compliance-calendar) puts the federal and state dates in one list.`,
      },
      {
        heading: "Who does this service fit, and who does it not fit?",
        body: `It fits when a US LLC has a single owner who is not a US person, has not elected to be taxed as a corporation, and you want the federal information return prepared and sent for you.

It does not fit if:

- the LLC has two or more members. It is a partnership by default and files Form 1065, which we do not prepare.
- the LLC elected corporate treatment. It files a full Form 1120 that computes tax, which we do not prepare.
- the owner is a US person. The foreign-owned rule does not apply.`,
      },
      {
        heading: "What can nobody promise you?",
        body: `Nobody can promise that the federal information return is your only US obligation, that the figures you supply are complete, or how the IRS will treat a late year. We prepare and file one return from your answers.

- **Completeness of your figures.** We use the totals you give us. We do not keep the LLC's books.
- **A penalty outcome for late years.** The IRS decides reasonable cause case by case.
- **Tax advice.** For planning, or for the owner's own return, speak to a tax professional.`,
      },
      {
        heading: "How much does the foreign-owned LLC tax filing service cost?",
        body: `Form5472 Prep charges a one-time fee per filing year, with no subscription and no annual retainer. Standard is ${STD} and is ready in ${STANDARD_TURNAROUND}; Express is ${EXP} and is ready to sign within ${EXPRESS_TURNAROUND}. Each earlier unfiled year is ${ADD}.

State fees, a registered agent and the owner's own return are not in that price, because they are not part of the service. See the [pricing page](/pricing) for everything included.`,
      },
    ],
    faqs: [
      {
        q: "Does my LLC need to file if it made no money?",
        a: "Possibly. Form 5472 reports transactions, not profit. Capital you put in, distributions and fees you paid for the LLC can be reportable. The instructions excuse only a year with no reportable transactions.",
      },
      {
        q: "Is this the same as a state annual report?",
        a: "No. An annual report is a state filing made to the state where the LLC was formed. Form 5472 with the pro forma 1120 is a federal filing made to the IRS. They have different dates and different fees.",
      },
      {
        q: "Do you file my personal US tax return?",
        a: "No. We prepare the LLC's Form 5472 and pro forma 1120 only. If you need Form 1040-NR or a state return, use a tax professional.",
      },
      {
        q: "What does US tax filing cost for a non-resident LLC owner?",
        a: `With us, ${STD} for Standard or ${EXP} for Express per filing, plus ${ADD} for each additional past year. IRS fax delivery and the accountant review are included in both plans.`,
      },
    ],
    related: [],
    serviceType: "Federal information-return filing for foreign-owned US single-member LLCs",
    showOffer: true,
    irsSources: [
      {
        label: "Single member limited liability companies (IRS)",
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies",
        blurb: "How the IRS treats a single-member LLC for federal tax purposes.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The current Form 5472 and its instructions: the federal return this service covers.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Why a foreign-owned single-member LLC files Form 5472 with a pro forma Form 1120, and when it is due.",
      },
    ],
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "form-5472-fax-filing-service",
    keyword: "form 5472 fax filing service",
    heroImage: {
      src: "/services/services_form-5472-fax-filing-service_fax-machine-receipt.webp",
      alt: "Form 5472 fax filing service: a fax machine sending the return, with a confirmation receipt",
    },
    secondaryKeywords: ["fax form 5472 to irs service"],
    category: "annual",
    lastModified: PAGES_REWRITTEN,
    title: "Form 5472 Fax Filing Service with Receipt | Form5472 Prep",
    metaDescription:
      "Form 5472 fax filing service: we fax your signed Form 5472 and pro forma 1120 to the IRS Ogden PIN Unit and give you the timestamped receipt.",
    longDescription:
      "Form5472 Prep's Form 5472 fax filing to the IRS Ogden PIN Unit (+1-855-887-7737), included in every plan: the reviewed and signed Form 5472 and pro forma 1120 package is faxed for you, and the fax provider's transmission receipt (destination number, timestamp, page count, result) is stored on your filing page. The receipt is proof of transmission, not IRS acceptance.",
    h1: "Form 5472 Fax Filing Service With a Timestamped Receipt",
    shortBlurb: "Delivery to the IRS Ogden PIN Unit by fax, with the timestamped transmission receipt kept for you.",
    intro: `Our Form 5472 fax filing service is for owners who want the signed package delivered to the IRS by fax, with a record of exactly when it went. **Form5472 Prep faxes the reviewed, signed Form 5472 and pro forma 1120 to the IRS Ogden PIN Unit at ${IRS_FAX} and stores the provider's timestamped transmission receipt on your filing page; fax delivery is included in every plan.**

A foreign-owned disregarded entity cannot e-file this package. The receipt records what was sent and when; it is not an IRS acceptance notice.`,
    cta: startCta("svc-form-5472-fax-filing-service"),
    sections: [
      {
        heading: "What does the Form 5472 fax filing service do?",
        body: `The fax goes out only after a tax accountant who holds an IRS PTIN has reviewed the package and you have signed it. We send it to ${IRS_FAX}, email you when the fax provider reports delivery and keep the transmission receipt on your filing page to download at any time.

You do not need a fax machine, a fax account or an IRS account, and nothing has to be posted from abroad.`,
      },
      {
        heading: "What does the IRS receive in the fax?",
        body: `The IRS receives the whole package in one fax, not just Form 5472: a cover letter identifying the LLC, its EIN and the tax year, the signed pro forma Form 1120 marked "Foreign-owned U.S. DE", Form 5472, the Part V supporting statement and, for a late year, the reasonable-cause statement.

Sending the 1120 without Form 5472, or the reverse, is not a complete filing. The package is generated as one PDF so nothing is left out of the transmission.`,
      },
      {
        heading: "What is on the fax receipt?",
        body: `The fax receipt comes from the fax provider and records the destination number, the timestamp, the page count and the reported result. It is evidence of transmission, not of IRS acceptance.

Keep it with the exact package that was sent. Together they show what was sent to the IRS fax line and when. For a late year, that is evidence of when the package was sent, not proof that it was on time.

If the IRS writes to the LLC later, the package and receipt are the record of what you sent. Keep both with the LLC's tax records.`,
      },
      {
        heading: "Why fax Form 5472 instead of mailing it?",
        body: `Both fax and mail are open for this package, and the difference is the record you are left with: a fax leaves a transmission receipt, while mail leaves only postal records.

- **Fax:** the transmission receipt states the destination, time and page count of what was sent.
- **Mail:** the package goes to the Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201. You rely on postal records, such as a certified-mail receipt, and the package takes days to arrive.

You can also fax it yourself. You need a fax service that can send to a US toll-free number. Our guide to the [Form 5472 fax number](/form-5472-fax-number) explains the page order and what to keep.`,
      },
      {
        heading: "What does a fax filing not do?",
        body: `A fax filing is evidence of transmission only: it cannot confirm IRS acceptance, fix errors in the figures or make a late return timely, and it does not cover other returns.

- **It cannot confirm IRS acceptance.** The receipt shows transmission. The IRS processes the return separately.
- **It cannot fix the content.** A faxed package is only as good as its figures. That is why every filing is reviewed by a tax accountant before it is submitted.
- **It cannot make a late return timely.** The timestamp records the actual arrival. For missed years, see the [late Form 5472 filing service](/services/late-form-5472-filing-service).
- **It does not cover other returns.** The Ogden PIN Unit line is for this package. We do not send Form 1065, Form 1040-NR or state filings.`,
      },
      {
        heading: "How can you fax Form 5472 to the IRS?",
        body: `You can fax Form 5472 through your own online fax account, a print shop or office fax, an accounting firm or our service. Whichever you use, it must reach a US toll-free number and give you a transmission report to keep.

- **Your own online fax account.** Low cost. You prepare and sign the package, upload it, send it to ${IRS_FAX} and save the receipt.
- **A print shop or office fax.** Works if it can send to a US toll-free number and hands you a transmission report.
- **An accounting firm.** May fax as part of a wider engagement. Ask whether you receive the transmission receipt.
- **Our service.** Preparation, review, signing and fax in one place, with the receipt on your filing page.`,
      },
      {
        heading: "How much does Form 5472 fax filing cost?",
        body: `Form5472 Prep charges no separate fax fee. The plan you pick sets the speed, not the delivery: Standard at ${STD} is ready in ${STANDARD_TURNAROUND}, Express at ${EXP} is ready to sign within ${EXPRESS_TURNAROUND}, and both are faxed with a receipt. A past year adds ${ADD}.

Each past year is a separate package, so it is faxed separately and gets its own receipt. Firms filing for several client LLCs can use [white label Form 5472 filing](/services/white-label-form-5472-filing). See the [pricing page](/pricing).`,
      },
    ],
    faqs: [
      {
        q: "What is the IRS fax number for Form 5472?",
        a: `${IRS_FAX}, the IRS Ogden PIN Unit. It is the IRS's line, not ours. Send the complete package: the pro forma Form 1120 with Form 5472 and any statements attached.`,
      },
      {
        q: "Is the fax receipt proof of filing?",
        a: "It is proof of transmission: destination number, timestamp, page count and result. Keep it with the exact package sent. It is not an IRS notice that the return was accepted.",
      },
      {
        q: "Can I fax Form 5472 myself?",
        a: "Yes. Any fax service that can send to a US toll-free number works. Our [fax number guide](/form-5472-fax-number) explains the page order and what to keep afterwards.",
      },
      {
        q: "When do you send the fax?",
        a: "After a tax accountant who holds an IRS PTIN (Preparer Tax Identification Number) has reviewed the package and you have signed it online. Nothing is sent to the IRS until you sign. We email you when the fax is delivered.",
      },
    ],
    related: [],
    serviceType: "IRS fax filing of Form 5472 and pro forma Form 1120",
    showOffer: true,
    irsSources: [
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "The where-and-how-to-file rules for a foreign-owned U.S. DE, including the fax number and the mailing address for the package.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The IRS page to check for later developments, such as a change to how or where the package is filed.",
      },
    ],
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "white-label-form-5472-filing",
    keyword: "white label form 5472 filing",
    heroImage: {
      src: "/services/services_white-label-form-5472-filing_partner-handoff.webp",
      alt: "White label Form 5472 filing: two partner forms linked for formation agents",
    },
    secondaryKeywords: ["form 5472 filing for company formation agents", "form 5472 filing for registered agents"],
    category: "partners",
    lastModified: PAGES_REWRITTEN,
    title: "White Label Form 5472 Filing for Agents | Form5472 Prep",
    metaDescription:
      "White label Form 5472 filing for formation agents, registered agents and accounting firms: we never email your clients; you send their links, we review and fax.",
    longDescription:
      "White-label Form 5472 filing for company formation agents, registered agents, accounting firms and consultants: on every partner filing Form5472 Prep sends no email to the partner's client. The partner copies each intake and review-and-sign link from the partner dashboard and sends it, filing emails go to the partner, the partner pays per filing, and the name the partner sets appears in the client's intake and on the IRS fax receipt. Form5472 Prep prepares each client's Form 5472 and pro forma 1120, has a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN) review it, and faxes it to the IRS. One partner dashboard tracks every filing.",
    h1: "White Label Form 5472 Filing for Formation and Registered Agents",
    shortBlurb: "Your clients deal only with you: you send their links; we prepare, review and fax behind you.",
    intro: `Our white label Form 5472 filing is for formation agents, registered agents and accounting firms that want to offer Form 5472 filing to their own clients without us appearing in their inbox. **On every partner filing, Form5472 Prep never emails your client: you send each intake and signing link yourself, filing emails come to you, and we prepare, review and fax the package to the IRS.**

It applies to every approved partner account, so there is nothing to switch on.`,
    cta: { href: "/partners#apply", label: "Apply as a partner" },
    sections: [
      {
        heading: "How does white label Form 5472 filing work?",
        body: `White label Form 5472 filing runs inside our partner program. You apply, start each client's filing from your dashboard and send the client their links yourself; we prepare the package, have it reviewed and fax it to the IRS once the client has signed.

1. **Apply.** Submit the partner application. Accounts are approved manually, usually within one business day.
2. **Set the name your clients see.** Enter it on your partner dashboard. If you leave it blank, your company name is used.
3. **Start client filings.** Each client LLC gets its own filing from your partner dashboard, using the same questionnaire as direct customers.
4. **Send the links yourself.** Copy the client's intake or review-and-sign link from the dashboard and send it from your own email.
5. **We review and fax.** A tax accountant who holds an IRS PTIN reviews each package before the client can sign. After the client signs, we fax it to the IRS Ogden PIN Unit.
6. **Track it.** Your dashboard shows preparation, signature and submission status, and the fax receipt for every client.`,
      },
      {
        heading: "Who enters each client's information?",
        body: `Either you or the client enters the information. You can type it in from records you already hold, or copy the client's secure intake link from your dashboard and send it to them to answer the questions themselves.

- **You enter it** from the records you already hold: the LLC's details, the owner's details, the year's reportable transactions and the year-end total assets.
- **The client enters it.** The intake link opens the same questionnaire without our plans, prices or a payment step. When the client finishes, we email you.

Either way the filing stays under your partner account, so you can review the answers before the package goes to accountant review. The client answers as themselves; you never sign in as the client.

Missed years work the same way as for direct customers: one package and one reasonable-cause statement per late year. Partners sign in with a secure email link, so there is no password to manage.`,
      },
      {
        heading: "What do your clients see, and what comes to you?",
        body: `Your clients hear from you, not from us. Form5472 Prep sends no email to a partner's client; emails about a client's filing, such as review questions and the fax confirmation, come to your address marked with the client's LLC name, and you forward what you need.

- **Links:** the client opens the intake or signing link you sent them. Those pages currently open on form5472prep.com.
- **Your name:** the name you set on your dashboard appears in the client's intake and on the IRS fax receipt.
- **No prices:** the client sees no plans, prices or payment step. You pay for the filing at checkout, and the payment receipt comes to you.
- **The forms:** they are the client LLC's own IRS forms, signed by the person authorized to sign for it.`,
      },
      {
        heading: "How does Form 5472 filing for company formation agents and registered agents work?",
        body: `Company formation agents, registered agents, accounting firms and consultants that look after several foreign-owned LLCs use the partner account, keep the client relationship, and leave preparation, review, IRS fax delivery and receipt storage to us.

- **Company formation agents** whose clients ask what happens at tax time.
- **Registered agents** who already hold the client relationship and send annual reminders.
- **Accounting firms and consultants** managing several foreign-owned single-member LLCs.`,
      },
      {
        heading: "What is white label Form 5472 filing not?",
        body: `It changes who your clients deal with. It is not a website on your own domain, not tax advice for your clients, and not a wider scope or an outcome promise.

- **Not your own website.** Client pages open on form5472prep.com, and the fax reaches the IRS through our fax service.
- **Not client advice.** We prepare and submit forms from the information entered. We do not give tax advice to your clients.
- **Not a wider scope.** The same limits apply as for direct customers: no Form 1065, no full Form 1120 for LLCs taxed as corporations and no bookkeeping. A [Form 7004 extension](/form-7004-extension) is a separate order.
- **Not an outcome promise.** For late years, nobody can promise the IRS will waive penalties.`,
      },
      {
        heading: "What happens when a client has missed years, a dormant LLC or a closed one?",
        body: `The same three situations come up in most client lists, and each runs through the partner account like an ordinary filing. You choose the years and the situation when you start the client's filing; the client still signs every return.

- **Missed years.** One package and one reasonable-cause statement per late year, at ${ADD} for each year after the first. See the [late Form 5472 filing service](/services/late-form-5472-filing-service).
- **A quiet LLC.** An owner who paid the state fee or registered agent personally has usually created a reportable transaction. See [Form 5472 filing for dormant LLC owners](/services/form-5472-filing-for-dormant-llc).
- **A dissolved LLC.** The last short year needs a final return with the final-return box checked. See the [final Form 5472 for a dissolved LLC](/services/final-form-5472-for-dissolved-llc).

Accountants weighing a referral against a partner account can start with [Form 5472 for accountants and tax preparers](/services/form-5472-for-accountants).`,
      },
      {
        heading: "How much does white label Form 5472 filing cost?",
        body: `Form5472 Prep charges partners the same per filing as direct customers, with no platform fee: ${STD} for a Standard filing ready in ${STANDARD_TURNAROUND}, ${EXP} for Express, ready to sign within ${EXPRESS_TURNAROUND}, and ${ADD} for each extra past year, IRS fax included.

You pay for each filing at checkout, and what you charge your own client is up to you. Ask about volume pricing or consolidated invoicing when you apply through the [partner program](/partners).`,
      },
    ],
    faqs: [
      {
        q: "Do my clients know Form5472 Prep is involved?",
        a: "We never email your clients. Their intake and signing pages currently open on form5472prep.com, and the IRS fax receipt carries the name you set. The IRS forms are the client LLC's own and are signed by its authorized signer.",
      },
      {
        q: "Who signs each client's filing?",
        a: "The person authorized to sign for the client LLC. You copy the secure review-and-sign link from your dashboard and send it to them; they review the completed package and sign online. A wet-ink option is available.",
      },
      {
        q: "Do I need to switch white-label filing on?",
        a: "No. It applies to every partner filing from the day your account is approved. Set the name your clients see on your partner dashboard; if you leave it blank, your company name is used.",
      },
      {
        q: "Can I track all client filings in one place?",
        a: "Yes. The partner dashboard lists every filing started from your account, with preparation, signature and submission status, and the IRS fax receipt for each package.",
      },
    ],
    related: [],
    serviceType: "White-label Form 5472 filing for formation agents and registered agents",
    showOffer: false,
    irsSources: [
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The form each client LLC files, with its current instructions and any later IRS updates.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file and what counts as a reportable transaction, for checking a client's facts before you start the filing.",
      },
    ],
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "form-5472-filing-for-dormant-llc",
    keyword: "form 5472 filing for dormant llc",
    heroImage: {
      src: "/services/services_form-5472-filing-for-dormant-llc_empty-ledger.webp",
      alt: "Form 5472 filing for dormant LLC: an empty ledger under a crescent moon",
    },
    secondaryKeywords: ["form 5472 for llc with no activity"],
    category: "situations",
    lastModified: PAGES_REWRITTEN,
    title: "Form 5472 Filing for Dormant LLC Owners | Form5472 Prep",
    metaDescription:
      "Form 5472 filing for dormant LLC owners: when an LLC with no activity still files, which owner-paid costs count, and how we prepare and fax it.",
    longDescription:
      "Form 5472 for a foreign-owned US LLC with no activity: the Form 5472 instructions excuse only a year with no reportable transactions (Parts IV, V and VI), and owner-paid state fees, registered-agent fees, formation costs and capital contributions are reportable under Treas. Reg. §1.6038A-2(b)(3)(xi). Form5472 Prep prepares the pro forma 1120 and Form 5472, has them reviewed and faxes them to the IRS.",
    h1: "Form 5472 Filing for Dormant LLC Owners",
    shortBlurb: "When an LLC with no business activity still files, and which owner-paid costs count.",
    intro: `Form 5472 filing for dormant LLC owners covers a foreign-owned US LLC that did little or nothing this year, and it turns on one question: did any money move between you and the LLC? **Paying the LLC's state fee or registered agent from your own pocket is a reportable transaction, so a quiet LLC often still files; Form5472 Prep then prepares the same Form 5472 and pro forma 1120 package as for any other year.**

The Form 5472 instructions do excuse a year with no reportable transactions at all. The examples below show where that line sits.`,
    cta: startCta("svc-form-5472-filing-for-dormant-llc"),
    sections: [
      {
        heading: "When does a dormant LLC still file Form 5472?",
        body: `A dormant LLC still files Form 5472 if it had any reportable transaction in the year. The Form 5472 instructions excuse a foreign-owned disregarded entity only for a year with no reportable transactions of the types listed in Parts IV, V and VI, which is narrower than it sounds.

Reportable transactions include amounts paid or received in connection with forming or dissolving the LLC, and contributions to and distributions from it. A "dormant" LLC can still have one of these:

- **State fees you paid personally.** Paying the LLC's bill with your own money is a transfer to the LLC.
- **Registered agent fees you paid personally.** The same logic: you covered an LLC cost.
- **Formation-year costs.** Amounts paid to form the LLC are named in the regulation.
- **Capital you put in,** even a small opening deposit.
- **Loans or reimbursements** between you and the LLC.`,
      },
      {
        heading: "What does Form 5472 filing for dormant LLC owners involve?",
        body: `A year with little activity still needs the full filing package, which a tax accountant who holds an IRS PTIN reviews, you sign online and we fax to the IRS Ogden PIN Unit with a timestamped receipt.

- the pro forma Form 1120 cover marked "Foreign-owned U.S. DE",
- Form 5472 with the owner's details and the transactions that did happen, such as a fee you paid for the LLC,
- a Part V supporting statement listing them, and
- the year-end total assets, which may be zero or close to it.

The questionnaire asks about each type of transaction in turn, so a fee paid personally is not missed.`,
      },
      {
        heading: "What are the edge cases for Form 5472 for an LLC with no activity?",
        body: `Three edge cases come up alongside a quiet year: an LLC that existed for only part of the year, an LLC with no EIN yet, and an owner who plans to close the LLC. Each changes what the filing looks like, not whether the rule applies.

- **The LLC existed for part of the year.** It still had a tax year, and formation payments in that year count.
- **The LLC has no EIN yet.** The forms need one. Our [EIN service](/ein) can obtain it.
- **You plan to close it.** The last year has its own due date and a final-return box; see the [final Form 5472 for a dissolved LLC](/services/final-form-5472-for-dissolved-llc).

The free [reportable transactions checker](/form-5472-reportable-transactions-checker) goes through each case with the regulation behind it.`,
      },
      {
        heading: "What should you check before deciding a year was empty?",
        body: `Before concluding that nothing happened, go through the year's records once for any payment between you and the LLC. If any record shows one, plan on filing; if all are empty, the year may be excused.

- Your own card and bank statements, for the state fee, registered agent or other LLC costs
- The LLC's bank account, for any transfer in from you or out to you
- Loans or repayments between you and the LLC
- Formation invoices, if the LLC was formed during the year`,
      },
      {
        heading: "What do we not decide for you?",
        body: `We do not decide whether your year was truly empty, whether skipping a year is safe, whether earlier missed years will see penalty relief or whether to keep or close the LLC. We work from your answers.

- **Whether your year was truly empty.** We work from your answers. If you are unsure, our [filing checker](/do-i-need-to-file-form-5472) leans toward filing; that is our cautious choice, not an IRS rule.
- **That skipping a year is safe.** Missing a required Form 5472 can cost $25,000 under IRC §6038A(d).
- **Penalty relief for earlier years.** If earlier years were missed, see the [late Form 5472 filing service](/services/late-form-5472-filing-service). Nobody can promise the IRS will waive penalties.
- **Whether to keep or close the LLC.** That is a planning question for a tax professional.`,
      },
      {
        heading: "Which of these quiet years still need a Form 5472?",
        body: `Three typical quiet years show where the line falls. Two of them still need a Form 5472 because money moved between the owner and the LLC; the third may not, because nothing did.

- **The owner paid the annual state fee by personal card, and nothing else happened.** File. Paying the LLC's bill with your own money is a transfer to the LLC.
- **The owner put USD 100 in to open the LLC's bank account, and the account then sat idle.** File. The deposit is a capital contribution.
- **The LLC paid its registered agent from its own account, funded in an earlier year, and nothing moved between owner and LLC.** Possibly no filing for that year. A payment from the LLC to an unrelated vendor is not reportable, but check every record first.

When a year falls in the first two groups, the filing costs and looks the same as any other year's.`,
      },
      {
        heading: "How much does Form 5472 filing for a dormant LLC cost?",
        body: `Form5472 Prep charges the same for a quiet year as for a busy one, because the package and the review are the same. A quiet year is ${STD} on Standard, ready in ${STANDARD_TURNAROUND}, or ${EXP} on Express, ready to sign within ${EXPRESS_TURNAROUND}; an extra past year adds ${ADD}.

A dormant LLC that also skipped earlier years can file them in the same order. See the [pricing page](/pricing).`,
      },
    ],
    faqs: [
      {
        q: "Does an LLC with no income need to file Form 5472?",
        a: "It can. Form 5472 reports transactions, not income. Owner-paid fees, capital contributions and formation costs are reportable. The instructions excuse only a year with no reportable transactions at all.",
      },
      {
        q: "I paid the registered agent with my own card. Is that reportable?",
        a: "Generally yes. Paying an LLC cost with your own money is a transfer to the LLC. If the LLC paid the agent from its own account instead, that payment is not reportable on Form 5472.",
      },
      {
        q: "What total assets do I enter if the LLC is empty?",
        a: "The amount the LLC actually held at year end. For an LLC with no account balance or property, that may be zero. The questionnaire asks for it directly.",
      },
      {
        q: "Can I file a dormant year and earlier missed years together?",
        a: `Yes. Choose every year when you start. Each year gets its own package, late years also get a reasonable-cause statement, and each additional year adds ${ADD}.`,
      },
    ],
    related: [],
    serviceType: "Form 5472 and pro forma Form 1120 filing for dormant foreign-owned LLCs",
    showOffer: true,
    irsSources: [
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "The reportable-transaction rules, including the Part V list of formation, contribution and distribution items, behind the examples on this page.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The current Form 5472 and its instructions, and any later IRS updates to either.",
      },
    ],
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "final-form-5472-for-dissolved-llc",
    keyword: "final form 5472 for dissolved llc",
    heroImage: {
      src: "/services/services_final-form-5472-for-dissolved-llc_closed-folder-stamp.webp",
      alt: "Final Form 5472 for dissolved LLC: a closed company folder with a final-return stamp",
    },
    secondaryKeywords: ["close foreign owned us llc tax filing"],
    category: "situations",
    lastModified: PAGES_REWRITTEN,
    title: "Final Form 5472 for Dissolved LLC Owners | Form5472 Prep",
    metaDescription:
      "Final Form 5472 for dissolved LLC owners: the short-year pro forma 1120 and Form 5472 with the final-return box checked, prepared and faxed to the IRS.",
    longDescription:
      "Final-year Form 5472 and pro forma Form 1120 for a dissolved foreign-owned US LLC: a short tax year ending on dissolution, the item E final-return box checked, dissolution distributions reported, generally due the 15th day of the 4th month after dissolution (3rd month for a June short year beginning before 2026). Prepared by Form5472 Prep, reviewed by a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN) and faxed to the IRS Ogden PIN Unit.",
    h1: "Final Form 5472 for Dissolved LLC Owners",
    shortBlurb: "The last Form 5472 and pro forma 1120 for the short year that ends on dissolution.",
    intro: `A final Form 5472 for dissolved LLC owners is the return that closes a foreign-owned US LLC's federal reporting: one Form 5472 and pro forma 1120 for the short year that ends on dissolution. **It is generally due by the 15th day of the 4th month after the LLC dissolved; Form5472 Prep checks the final-return box, reports what you took out on closing, and faxes the package to the IRS.**

Closing the LLC with the state does not file this return for you.`,
    cta: startCta("svc-final-form-5472-for-dissolved-llc"),
    sections: [
      {
        heading: "How do you prepare the final Form 5472 for dissolved LLC owners?",
        body: `The final Form 5472 and pro forma 1120 cover the short tax year that ends on the dissolution date, with the final-return box checked and any amounts paid or received on dissolution reported.

We prepare:

- the pro forma Form 1120 for that short year, with the final-return box in item E checked,
- Form 5472 reporting the year's transactions, including amounts paid or received on dissolution,
- a Part V supporting statement, and
- a reasonable-cause statement if the final year, or any earlier year, is late.

On closing, the LLC's remaining cash or property normally goes to you. That transfer is a distribution, and the Form 5472 instructions list amounts paid or received in connection with dissolution among the Part V transactions. Money you put in to pay closing costs is reportable too.

The questionnaire asks for the dissolution date and marks the return as final. A tax accountant who holds an IRS PTIN reviews the package; you sign online; we fax it to the IRS Ogden PIN Unit and send you the timestamped receipt.`,
      },
      {
        heading: "When is the final Form 5472 due?",
        body: `The final Form 5472 and pro forma 1120 are generally due by the 15th day of the 4th month after the LLC dissolved. The Form 1120 instructions set that date for a dissolved corporation, and the same rule applies to the pro forma 1120 with Form 5472 attached.

- **June exception:** for a short year ending in June that began before January 1, 2026, the due date is the 15th day of the 3rd month. An LLC dissolved in June 2025 was due on September 15, 2025.
- **Weekends and holidays** move the date to the next business day.
- **Form 7004** can extend the deadline. We offer [Form 7004 extension filing](/form-7004-extension) as a separate service; it must be filed by the original due date.

The [deadline calculator](/form-5472-deadline-calculator) works out the exact date from your dissolution date.`,
      },
      {
        heading: "How do you close foreign owned US LLC tax filing obligations?",
        body: `Closing the LLC with the state and finishing its federal filings are separate steps: settle the LLC's money, dissolve with the state, file the final Form 5472 and pro forma 1120, deal with earlier years and keep the records.

1. **Settle the LLC's money.** Pay its remaining bills and move any balance out. A distribution to you on closing is reportable on the final Form 5472.
2. **Dissolve with the state.** File the dissolution or cancellation document with the state of formation, and check whether an annual report or fee is still due.
3. **File the final Form 5472 and pro forma 1120** for the short year, with the final-return box checked.
4. **Deal with earlier years.** Dissolving the LLC does not file missed years for you.
5. **Keep the records.** Keep the filed package and the fax receipt with your permanent tax records for at least six years.`,
      },
      {
        heading: "What does closing the LLC not do?",
        body: `Closing the LLC does not remove the final-year filing, settle the owner's own taxes or bring penalty relief, and a missed final Form 5472 can still carry the $25,000 penalty under IRC §6038A(d).

- **It does not remove the final-year filing.** If a required Form 5472 is missed for the final year, the $25,000 penalty under IRC §6038A(d) can apply as in any other year.
- **It does not settle the owner's own taxes.** Any personal US return, such as Form 1040-NR, is separate and outside this service.
- **It does not come with penalty relief.** For late final or earlier years, nobody can promise the IRS will waive penalties; reasonable cause is decided case by case.
- **It is not tax advice.** How and when to close is a question for a tax professional.`,
      },
      {
        heading: "What does a final return look like for an LLC dissolved in March?",
        body: `Take a calendar-year LLC dissolved on March 20, with USD 1,200 left in its bank account that is wired to the owner on closing. Its final return covers January 1 to March 20 and is due by July 15 of the same year.

- **Pro forma 1120:** the short tax year from January 1 to March 20, the final-return box in item E checked, and "Foreign-owned U.S. DE" across the top.
- **Form 5472:** the owner's details and the LLC's total assets at the end of the short year, which may be zero once the balance has gone out.
- **Part V statement:** the USD 1,200 distribution on dissolution, plus any money the owner put in to pay closing costs.
- **Earlier years:** any year before this one that was never filed, each with its own package and reasonable-cause statement.

Dissolve in a different month and the due date moves with it, so the date above applies only to a March 20 dissolution.`,
      },
      {
        heading: "How much does a final Form 5472 for a dissolved LLC cost?",
        body: `Form5472 Prep prices the final short year like any other year: ${STD} on Standard (ready in ${STANDARD_TURNAROUND}) or ${EXP} on Express (ready to sign within ${EXPRESS_TURNAROUND}), plus ${ADD} for each missing earlier year in the same order.

If the sample LLC above had also missed the previous year, both would cost ${STD_2Y} on Standard. See the [pricing page](/pricing).`,
      },
    ],
    faqs: [
      {
        q: "Do I file Form 5472 for the year my LLC dissolved?",
        a: "Generally yes, if the LLC had a reportable transaction in that short year. Amounts paid or received on dissolution, including distributions to you, are reportable. The final pro forma 1120 has the final-return box checked.",
      },
      {
        q: "When is the final Form 5472 due?",
        a: "Generally by the 15th day of the 4th month after the LLC dissolved; for a June short year that began before 2026, the 15th day of the 3rd month. The [deadline calculator](/form-5472-deadline-calculator) gives the exact date.",
      },
      {
        q: "I already dissolved the LLC and never filed. What now?",
        a: "The missing years, including the final one, can still be filed late with a reasonable-cause statement for each. Nobody can promise the IRS will waive penalties; it decides case by case.",
      },
      {
        q: "How long should I keep the final filing?",
        a: "Keep the filed package and the fax receipt with your permanent tax records for at least six years.",
      },
    ],
    related: [],
    serviceType: "Final-year Form 5472 and pro forma Form 1120 filing for dissolved foreign-owned LLCs",
    showOffer: true,
    irsSources: [
      {
        label: "Closing a business (IRS)",
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/closing-a-business",
        blurb: "The IRS checklist for the federal steps when a business closes, including final returns.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Part V's list of reportable transactions, which includes amounts paid or received in connection with dissolution.",
      },
    ],
  },

  // ── 9 ── audience pages (2026-10-05; Moz evidence in
  // docs/seo/audience-keywords-2026-10-05.md). Shorter by design: 400–700
  // words, unique copy concentrated in the first screen.
  {
    slug: "hire-someone-to-file-form-5472",
    keyword: "hire someone to file form 5472",
    heroImage: {
      src: "/services/services_hire-someone-to-file-form-5472_folder-handover.webp",
      alt: "Hire someone to file Form 5472: a folder of records handed over and returned as a checked form",
    },
    secondaryKeywords: ["pay someone to file form 5472", "form 5472 done for you"],
    category: "annual",
    lastModified: PAGES_REWRITTEN,
    title: "Hire Someone to File Form 5472: Done for You | Form5472 Prep",
    metaDescription:
      "Hire someone to file Form 5472 for your foreign-owned LLC: answer 15 minutes of questions and sign; we prepare, review and fax it to the IRS.",
    longDescription:
      "Done-for-you Form 5472 and pro forma Form 1120 filing for owners of foreign-owned US single-member LLCs who would rather hire someone than file it themselves: the owner answers a 15-minute questionnaire, reviews and signs online; Form5472 Prep prepares the package, has a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN) review it, faxes it to the IRS Ogden PIN Unit and stores the timestamped fax receipt. Flat fee per filing year.",
    h1: "Hire Someone to File Form 5472 for Your Foreign-Owned LLC",
    shortBlurb: "The handover in plain terms: what you give, what comes back, and the two things you still do.",
    intro: `If you want to hire someone to file Form 5472, the handover is short and has a clear line down the middle. **You hand over the facts about your LLC and its money movements, then review and sign; Form5472 Prep prepares the Form 5472 and pro forma 1120, has a PTIN-holding tax accountant check them, faxes them to the IRS and keeps the receipt for you.**

Most owners spend about 15 minutes on their part, with no meeting to book.`,
    cta: startCta("svc-hire-someone-to-file-form-5472"),
    sections: [
      {
        heading: "What do you hand over when you hire someone to file Form 5472?",
        body: `You hand over four sets of facts, not forms: the LLC's details, your details as owner, the year's money movements between you and the LLC, and the LLC's year-end total assets. No accounting software or bank login is involved.

- **The LLC:** legal name, EIN, US address, state and date of formation
- **You, as owner:** name, home address, country of residence and your foreign tax ID if you have one
- **Money between you and the LLC:** what you put in, what you took out, any loans, and LLC bills you paid from a personal account
- **What the LLC owned at year end:** its total assets on the last day of the tax year

Not sure whether a payment counts? The [reportable transactions checker](/form-5472-reportable-transactions-checker) answers that for common cases before you start.`,
      },
      {
        heading: "What comes back to you, and when?",
        body: `With Form5472 Prep the package is ready in ${STANDARD_TURNAROUND} on Standard (${STD}), or ready to sign within ${EXPRESS_TURNAROUND} on Express (${EXP}). After you sign, it is faxed and the receipt appears on your filing page.

1. **Questions, if any.** The reviewing accountant compares the package with your answers and asks on your filing page if something is unclear.
2. **The package to review.** Cover letter, pro forma Form 1120, Form 5472 and the Part V statement, ready for you to read.
3. **The signing link.** It opens only after the review is approved.
4. **The fax.** We send the signed package to the IRS Ogden PIN Unit at ${IRS_FAX}.
5. **The proof.** The timestamped fax receipt, saved with the package.

Missed earlier years add ${ADD} each on either plan. For a calendar-year LLC the filing is due April 15; see the [pricing page](/pricing) for the full plan details.`,
      },
      {
        heading: "What do you still do yourself?",
        body: `You still check your answers, review the finished package before anything is sent, and sign it online. The return is the LLC's own, so you or another person authorized for the LLC signs it; our staff never sign for you. Save the package and the fax receipt with the LLC's records.`,
      },
      {
        heading: "What does hiring us not cover, and what can nobody promise?",
        body: `Hiring us does not cover tax advice, other returns or a promised outcome. The fax receipt proves what was sent and when, not that the IRS has processed it.

- **No other returns.** Form 1065, a full Form 1120 for an LLC taxed as a corporation, Form 1040-NR, state returns, Form 7004 and bookkeeping are outside the service.
- **No promised outcome.** If you are hiring us for a year that is already late, the penalty decision stays with the IRS; nobody can tell you in advance whether it will be assessed.`,
      },
    ],
    faqs: [
      {
        q: "Do I need to talk to anyone before you start?",
        a: "No. Everything runs through the online questionnaire and your filing page, including any question from the reviewing accountant.",
      },
      {
        q: "Can I hire someone to file Form 5472 for past years too?",
        a: "Yes. Each missed year is added to the same order and gets its own package and reasonable-cause statement. The [late-filing route checker](/form-5472-late-filing-checker) shows which route fits before you start.",
      },
      {
        q: "Who signs the return when I hire you?",
        a: "You, or another person authorized to sign for the LLC. Signing opens in your browser after the accountant review. A wet-ink option is available if you prefer to print and sign by hand.",
      },
      {
        q: "How is this different from filing it myself?",
        a: "The IRS forms are free and you can file them yourself. Hiring us adds preparation from plain-language questions, a review by a tax accountant who holds an IRS PTIN (Preparer Tax Identification Number) before you sign, the IRS fax and a stored receipt.",
      },
    ],
    related: [],
    serviceType: "Done-for-you Form 5472 and pro forma Form 1120 preparation and IRS fax filing",
    showOffer: true,
    irsSources: [
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The form you are handing over, with its current instructions, if you want to read what will be filed for you.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "What the IRS asks the LLC to report, which is why the handover asks for the four sets of facts above.",
      },
    ],
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "form-5472-preparer",
    keyword: "form 5472 preparer",
    heroImage: {
      src: "/services/services_form-5472-preparer_magnifier-over-form.webp",
      alt: "Form 5472 preparer: a magnifier checking Form 5472 on top of its pro forma 1120 cover",
    },
    secondaryKeywords: ["who prepares form 5472", "form 5472 tax preparer", "form 5472 preparation service"],
    category: "annual",
    lastModified: PAGES_REWRITTEN,
    title: "Form 5472 Preparer, Reviewed Before You Sign | Form5472 Prep",
    metaDescription:
      "Form 5472 preparer for foreign-owned US LLCs: what a preparer does for Form 5472 and the pro forma 1120, how to choose one, and how our review works.",
    longDescription:
      "How to choose a Form 5472 preparer for a foreign-owned US single-member LLC: what the preparer does (sorting reportable transactions, completing Form 5472, the Part V statement and the pro forma Form 1120 marked \"Foreign-owned U.S. DE\", getting the package to the IRS by fax or mail), the four kinds of preparer, a checklist of questions, and how Form5472 Prep's PTIN-holding tax accountant review works before the owner signs online.",
    h1: "A Form 5472 Preparer for Foreign-Owned US LLCs",
    shortBlurb: "How to choose who prepares your Form 5472: the four kinds of preparer and six questions to ask.",
    intro: `A Form 5472 preparer turns what you know about your LLC's year into the two IRS forms a foreign-owned single-member LLC files, and the choice of preparer is what this page is about. **A preparer completes Form 5472 and the pro forma Form 1120 it is attached to, checks them and gets them to the IRS, while you review and sign; Form5472 Prep adds a review by a tax accountant who holds an IRS PTIN before you sign.**`,
    cta: startCta("svc-form-5472-preparer"),
    sections: [
      {
        heading: "What does a Form 5472 preparer do?",
        body: `A Form 5472 preparer turns the owner's records into Form 5472, the Part V statement and the pro forma 1120, flags anything missing and gets the package to the IRS. The forms are short; the judgment is in what goes on them.

- **Sorts the year's money movements** into contributions, distributions, loans and owner-paid LLC costs, totalled by type.
- **Completes the forms** with the owner and related-party details, the transaction totals and year-end total assets.
- **Sends the package** by fax or mail, because a foreign-owned disregarded entity cannot e-file it.`,
      },
      {
        heading: "What kinds of Form 5472 preparer can you choose from?",
        body: `There are four routes: prepare it yourself on the free IRS forms, hire an accounting firm, take a formation company's tax add-on, or use a fixed-fee specialist such as Form5472 Prep. Each can be the right choice for a different owner.

- **Yourself.** No fee, but you research the rules, send the package and keep the proof.
- **An accounting firm.** Worth it when you also need income-tax returns, bookkeeping or advice.
- **A formation-company add-on.** Check whether it includes the pro forma 1120 and who sends the package.
- **A fixed-fee specialist.** One price per year for this filing only; check the review step and the proof of submission.`,
      },
      {
        heading: "How do you choose a Form 5472 preparer?",
        body: `Choose a Form 5472 preparer by getting clear written answers to six questions on price, review, submission, proof, missed years and scope.

- Does the price include the pro forma 1120, or only Form 5472?
- Who checks the package before I sign it?
- Who sends it to the IRS, by what route, and what proof do I get?
- How are missed years handled, and at what price per year?
- What is outside the job: state returns, Form 1040-NR, bookkeeping?
- Who signs? It should be you, or someone authorized for the LLC.`,
      },
      {
        heading: "How does our Form 5472 preparation service answer those questions?",
        body: `The Form 5472 preparation service at Form5472 Prep costs **${STD}** on Standard (ready in ${STANDARD_TURNAROUND}) or **${EXP}** on Express (ready to sign within ${EXPRESS_TURNAROUND}), pro forma 1120 included, plus ${ADD} per additional past year.

Every filing is reviewed by a tax accountant before it is submitted, and signing opens only after the review is approved. We fax the package to the IRS Ogden PIN Unit and keep the timestamped receipt on your filing page. See [pricing](/pricing).`,
      },
      {
        heading: "What can a Form 5472 preparer not do for you?",
        body: `A preparer cannot sign for the LLC, know facts you have not shared or promise penalty relief, and preparing forms is not tax advice.

- **Sign for the LLC.** Our staff never sign on a client's behalf.
- **Know facts you have not shared.** You remain responsible for the information.
- **Promise penalty relief.** For a late year, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).`,
      },
    ],
    faqs: [
      {
        q: "Does a Form 5472 preparer need my bank statements?",
        a: "The questionnaire asks for totals by transaction type and year-end total assets. Bank statements are the usual source, so keep them to hand.",
      },
      {
        q: "Is the pro forma 1120 prepared too?",
        a: "Yes. A foreign-owned disregarded entity files Form 5472 attached to a pro forma Form 1120, so we prepare, review and fax both as one package.",
      },
      {
        q: "When does the preparer need my information?",
        a: "Early enough to leave time for review and signing. The deadline is April 15 for a calendar-year LLC, generally the 15th day of the 4th month after the tax year ends.",
      },
      {
        q: "Can I use a preparer if I live outside the US?",
        a: "Yes. The questionnaire, review messages, signature and receipt are all online, and the package reaches the IRS by fax, so nothing has to be posted from abroad.",
      },
    ],
    related: [],
    serviceType: "Form 5472 and pro forma Form 1120 preparation with PTIN-holding tax accountant review and IRS fax filing",
    showOffer: true,
    irsSources: [
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "The rules any preparer works from: who must file, the reportable transactions and how a foreign-owned U.S. DE files.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The current revision of the form, to check that a preparer is using this year's version.",
      },
      {
        label: "Instructions for Form 1120 (IRS)",
        url: "https://www.irs.gov/instructions/i1120",
        blurb: "The Form 1120 instructions behind the pro forma cover, including its signature and paid-preparer blocks.",
      },
    ],
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "form-5472-for-accountants",
    keyword: "form 5472 for accountants",
    heroImage: {
      src: "/services/services_form-5472-for-accountants_linked-firm-desks.webp",
      alt: "Form 5472 for accountants: two firm desks linked over a shared Form 5472",
    },
    secondaryKeywords: [
      "form 5472 for tax preparers",
      "form 5472 filing for cpa firms",
      "form 5472 for accounting firms",
      "outsource form 5472 preparation",
      "form 5472 for cpas",
    ],
    category: "partners",
    lastModified: PAGES_REWRITTEN,
    title: "Form 5472 for Accountants and CPAs: You Keep the Client",
    metaDescription:
      "Form 5472 for accountants, tax preparers and CPA firms: refer clients, or run their filings from a partner account while we prepare, review and fax.",
    longDescription:
      "Form 5472 and pro forma Form 1120 filing for accountants, tax preparers, CPA firms and accounting firms that do not want to prepare foreign-owned LLC information returns in-house: refer the client to file directly, or start and track client filings from a partner account, where Form5472 Prep never emails the firm's clients. Form5472 Prep prepares each package, has a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN) review it, collects the client's online signature and faxes it to the IRS Ogden PIN Unit with a timestamped receipt.",
    h1: "Form 5472 for Accountants, CPAs and Tax Preparers",
    shortBlurb: "For firms deciding between referring a client and running filings from a partner account.",
    intro: `Form 5472 for accountants is often small, seasonal work that does not fit the rest of the practice, and this page is for firms deciding how to hand it off. **You can pass the preparation to Form5472 Prep and keep the client: refer them to file directly, or run their filings from a partner account where we never email your client, while we prepare, review and fax each package.**

Form 5472 for CPAs works the same way: we prepare the package, you keep the client relationship. Whichever route you choose, the client reviews and signs their own return.`,
    cta: { href: "/partners#apply", label: "Apply as a partner" },
    sections: [
      {
        heading: "What comes off your desk with Form 5472 for accountants?",
        body: `A foreign-owned single-member LLC files Form 5472 with a pro forma Form 1120 each year, and we take on the narrow but fiddly work of preparing, reviewing, signing, faxing and storing the receipt.

- Preparing Form 5472, the pro forma 1120 and the Part V statement from the questionnaire answers
- Review by a tax accountant who holds an IRS PTIN before signing, including any follow-up questions
- Collecting the client's online signature
- Faxing the package to the IRS Ogden PIN Unit and storing the timestamped receipt
- A January reminder for next year's filing`,
      },
      {
        heading: "How can accountants work with us: refer the client or use a partner account?",
        body: `Accountants can refer the client to file directly or run client filings from a partner account.

- **Refer the client.** Send them to [start a filing](/start?src=svc-form-5472-for-accountants) themselves. They deal with us directly and you stay out of the paperwork.
- **Partner account.** Start each client's filing from one dashboard. Enter the details yourself or copy the client's secure intake link and send it, then follow preparation, signature and fax status in one place. [White label Form 5472 filing](/services/white-label-form-5472-filing) explains what clients see.

Partner accounts are approved manually, usually within one business day. Details are on the [partner program](/partners) page.`,
      },
      {
        heading: "Can you outsource Form 5472 preparation without handing over the client?",
        body: `Yes. Filings sit under your partner account, you see every status, and we never email your client: emails about the filing come to you. You keep the wider relationship, such as income-tax returns, state filings or bookkeeping, while the Form 5472 package runs through our process.`,
      },
      {
        heading: "Who is Form 5472 outsourcing for: tax preparers, CPA firms or accounting firms?",
        body: `It suits tax preparers with a handful of foreign-owned LLC clients each spring, CPA firms and accounting firms with a larger book where one dashboard and one inbox for every client filing save chasing, and solo accountants who want to say yes without taking on a form they see once a year.`,
      },
      {
        heading: "What do we not take on?",
        body: `We do not take on client advice, other returns or signing for the client. The person authorized for the client LLC signs, and our staff never sign in their place.

Other returns stay with your firm or the client: partnership returns, a full Form 1120 for an LLC taxed as a corporation, the owner's Form 1040-NR, state filings and the books. A [Form 7004 extension](/form-7004-extension) is a separate order. For a client's late years, nobody can promise the IRS will waive the penalty.`,
      },
    ],
    faqs: [
      {
        q: "Do I have to become a partner to refer a client?",
        a: "No. A client you refer can start a filing on their own. A partner account is for firms that want to start and track several client filings themselves.",
      },
      {
        q: "What does each client filing cost?",
        a: `Form5472 Prep charges partner filings the same as direct ones: ${STD} on Standard (${STANDARD_TURNAROUND}), ${EXP} on Express (ready to sign within ${EXPRESS_TURNAROUND}), +${ADD} per additional past year, IRS fax delivery included. Ask about volume pricing when you apply.`,
      },
      {
        q: "Can my firm enter the client's information?",
        a: "Yes. A partner account lets your firm type in the figures from its own records, or have the client fill in the questionnaire through a secure link. Either way you can check the answers before they go to accountant review.",
      },
      {
        q: "Who signs the client's pro forma 1120 and Form 5472?",
        a: "Whoever is authorized to sign for the client's LLC, usually the owner. Once the review is approved, you copy the signing link from your partner dashboard and send it; they sign in the browser.",
      },
    ],
    related: [],
    serviceType: "Form 5472 preparation and IRS fax filing for accountants, tax preparers and accounting firms",
    showOffer: false,
    irsSources: [
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The current form and instructions your firm would otherwise track each season.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "The foreign-owned U.S. DE rules, reportable transactions and filing route, for reviewing what is filed for your clients.",
      },
    ],
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: "form-5472-for-bookkeepers",
    keyword: "form 5472 for bookkeepers",
    heroImage: {
      src: "/services/services_form-5472-for-bookkeepers_ledger-handoff.webp",
      alt: "Form 5472 for bookkeepers: ledger totals carried across into a Form 5472",
    },
    secondaryKeywords: ["form 5472 bookkeeping handoff", "foreign-owned llc bookkeeper form 5472"],
    category: "partners",
    lastModified: PAGES_REWRITTEN,
    title: "Form 5472 for Bookkeepers: Hand Off the Filing",
    metaDescription:
      "Form 5472 for bookkeepers of foreign-owned LLCs: the records to hand over, how the filing handoff works, and how to refer the owner to us.",
    longDescription:
      "Form 5472 handoff for bookkeepers who keep the books for foreign-owned US single-member LLCs: the year's owner contributions, distributions, loans, owner-paid LLC costs and related-company amounts, totalled in US dollars, plus year-end total assets. The owner or a partner account starts the filing; Form5472 Prep prepares Form 5472 and the pro forma 1120, has a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN) review them, collects the owner's online signature and faxes the package to the IRS.",
    h1: "Form 5472 for Bookkeepers: Hand Off the Filing, Keep the Books",
    shortBlurb: "Which records to hand over for a client's Form 5472, and how the filing handoff works.",
    intro: `Form 5472 for bookkeepers starts in the ledger you already keep for a foreign-owned US LLC. **You already hold most of what its Form 5472 needs: the money that moved between the owner and the LLC, and what the LLC owned at year end. Hand those totals over and Form5472 Prep prepares, reviews and faxes the filing.**

You keep the books. The owner keeps responsibility for the return and signs it.`,
    cta: { href: "/partners#apply", label: "Apply as a partner" },
    sections: [
      {
        heading: "Which ledger records does Form 5472 for bookkeepers need?",
        body: `The filing needs tax-year totals, not the full ledger: what the owner put in and took out, loans, related-company payments and year-end total assets.

- **Owner contributions:** money or property the owner put in, including LLC bills the owner paid personally, such as state or registered agent fees
- **Owner distributions:** money the owner took out
- **Loans:** amounts lent either way between the owner and the LLC, and repayments
- **Related companies:** payments to or from another company connected to the owner; the [reportable transactions checker](/form-5472-reportable-transactions-checker) shows when these count
- **Year-end total assets:** the balance-sheet total on the last day of the tax year

Amounts go on the form in US dollars. The [IRS yearly average exchange rates](/irs-yearly-average-exchange-rates) page converts foreign-currency entries.`,
      },
      {
        heading: "How do you keep the year-end handoff quick?",
        body: `A few ledger habits make the totals quick to pull: separate accounts for owner contributions, owner distributions and loans, owner-paid LLC costs posted when they happen, and the original currency noted on foreign-currency entries.

Close the year early. For a calendar-year LLC the filing is due April 15, and the package still needs review and signature after you hand over.`,
      },
      {
        heading: "How does the handoff work?",
        body: `You pull the year's totals, the filing is started, we prepare and review it, the owner signs online and we fax it to the IRS Ogden PIN Unit.

1. **You pull the totals.** Take the figures above from the books for the tax year.
2. **The filing is started.** The owner starts it, or you start it from a partner account and either enter the totals or send the owner a secure intake link.
3. **We prepare and review.** A tax accountant who holds an IRS PTIN checks the generated package against the answers.
4. **The owner signs.** The person authorized for the LLC reviews the package and signs online.
5. **We fax it.** The package goes to the IRS Ogden PIN Unit and the timestamped receipt is stored on the filing page.`,
      },
      {
        heading: "Should you refer the owner or open a partner account?",
        body: `For one or two clients, refer the owner to [start a filing](/start?src=svc-form-5472-for-bookkeepers) with your totals in hand. If you keep the books for several foreign-owned LLCs, a [partner account](/partners) lets you start and track every client's filing from one dashboard. We never email a partner's client; [white label Form 5472 filing](/services/white-label-form-5472-filing) explains what clients see.

Whoever starts it, a client filing is priced per tax year. Standard, at ${STD}, is ready in ${STANDARD_TURNAROUND}; Express, at ${EXP}, is ready to sign within ${EXPRESS_TURNAROUND}; each past year added to the order is ${ADD}.`,
      },
      {
        heading: "What do we not take over?",
        body: `We do not take over your bookkeeping (no books, reconciliations or financial statements), other returns (Form 1065, Form 1040-NR or state returns) or tax advice; [Form 7004 extensions](/form-7004-extension) are sold separately. The owner remains responsible for the figures. For a late year, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).`,
      },
    ],
    faqs: [
      {
        q: "Does the bookkeeper sign Form 5472?",
        a: "In our process the bookkeeper supplies the figures, and the owner or another person authorized for the LLC reviews the finished package and signs it online.",
      },
      {
        q: "Do you need the full general ledger?",
        a: "No. The questionnaire asks for totals by type and year-end total assets. Keep the detail on file in case the reviewing accountant asks about a figure.",
      },
      {
        q: "What if the LLC had no activity this year?",
        a: "A quiet year can still need a filing if the owner paid LLC costs personally. See [Form 5472 filing for dormant LLC owners](/services/form-5472-filing-for-dormant-llc) for where the line sits.",
      },
      {
        q: "Can I track several clients' filings?",
        a: "Yes, from a partner account. The dashboard shows preparation, signature and fax status for each client filing, with the IRS fax receipt for each package.",
      },
    ],
    related: [],
    serviceType: "Form 5472 filing handoff for bookkeepers of foreign-owned LLCs",
    showOffer: false,
    irsSources: [
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "The reportable-transaction categories that map to the ledger totals listed on this page.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The current Form 5472 and its instructions, and any later IRS updates.",
      },
      {
        label: "Single member limited liability companies (IRS)",
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies",
        blurb: "How the IRS treats a single-member LLC for federal tax purposes.",
      },
    ],
  },
];

// Related links: two or three sibling services plus the most relevant free
// tools. Kept here (not inline above) so the sibling anchors always equal the
// sibling's current H1.
const RELATED_PLAN: Record<string, { services: string[]; tools: Array<keyof typeof TOOL> }> = {
  "form-5472-filing-service": {
    services: [
      "pro-forma-1120-filing-service",
      "late-form-5472-filing-service",
      "form-5472-fax-filing-service",
      "hire-someone-to-file-form-5472",
    ],
    tools: ["reportable", "deadline"],
  },
  "pro-forma-1120-filing-service": {
    services: [
      "form-5472-filing-service",
      "form-5472-filing-for-dormant-llc",
      "final-form-5472-for-dissolved-llc",
      "form-5472-preparer",
    ],
    tools: ["needToFile", "reportable"],
  },
  "late-form-5472-filing-service": {
    services: [
      "form-5472-filing-service",
      "form-5472-filing-for-dormant-llc",
      "form-5472-fax-filing-service",
      "form-5472-preparer",
    ],
    tools: ["late", "penalty", "fx"],
  },
  "foreign-owned-llc-tax-filing-service": {
    services: ["form-5472-filing-service", "pro-forma-1120-filing-service"],
    tools: ["calendar", "stateFees", "needToFile"],
  },
  "form-5472-fax-filing-service": {
    services: ["form-5472-filing-service", "late-form-5472-filing-service"],
    tools: ["deadline", "late"],
  },
  "white-label-form-5472-filing": {
    services: [
      "form-5472-for-accountants",
      "form-5472-for-bookkeepers",
      "form-5472-filing-service",
      "late-form-5472-filing-service",
    ],
    tools: ["calendar"],
  },
  "form-5472-filing-for-dormant-llc": {
    services: ["final-form-5472-for-dissolved-llc", "late-form-5472-filing-service"],
    tools: ["reportable", "needToFile"],
  },
  "final-form-5472-for-dissolved-llc": {
    services: ["form-5472-filing-for-dormant-llc", "late-form-5472-filing-service"],
    tools: ["deadline", "calendar", "penalty"],
  },
  "hire-someone-to-file-form-5472": {
    services: ["form-5472-filing-service", "form-5472-preparer", "late-form-5472-filing-service"],
    tools: ["reportable", "deadline"],
  },
  "form-5472-preparer": {
    services: ["hire-someone-to-file-form-5472", "pro-forma-1120-filing-service", "form-5472-filing-service"],
    tools: ["reportable", "needToFile"],
  },
  "form-5472-for-accountants": {
    services: ["white-label-form-5472-filing", "form-5472-for-bookkeepers", "late-form-5472-filing-service"],
    tools: ["calendar"],
  },
  "form-5472-for-bookkeepers": {
    services: ["form-5472-for-accountants", "form-5472-filing-for-dormant-llc", "white-label-form-5472-filing"],
    tools: ["reportable", "fx"],
  },
};

for (const page of SERVICE_PAGES) {
  const plan = RELATED_PLAN[page.slug];
  page.related = [
    ...plan.services.map((slug) => {
      const sibling = SERVICE_PAGES.find((p) => p.slug === slug);
      if (!sibling) throw new Error(`services-pages: unknown related slug ${slug}`);
      return { href: servicePath(slug), label: sibling.h1, blurb: sibling.shortBlurb };
    }),
    ...plan.tools.map((key) => ({ ...TOOL[key] })),
  ];
}

export function servicePath(slug: string): string {
  return `${SERVICES_HUB_PATH}/${slug}`;
}

export function getServicePage(slug: string): ServicePage | null {
  return SERVICE_PAGES.find((p) => p.slug === slug) ?? null;
}

// ── Hub (/services) ─────────────────────────────────────────────────────────

// The hub is a directory "by situation", not a page for the head term: the
// singular/plural "form 5472 filing service(s)" belongs to
// /services/form-5472-filing-service (audit 2026-10-15 §3). Before that date
// the hub's title and H1 were "Form 5472 filing services", a near-exact
// collision with the flagship's title.
export const SERVICES_HUB = {
  title: "Form 5472 Services by Situation | Form5472 Prep",
  metaDescription:
    "Form 5472 services by situation for foreign-owned US LLCs: annual, late, dormant and final-year filings, IRS fax delivery, partner filing, EIN and ITIN.",
  longDescription:
    "Form 5472 and pro forma Form 1120 filing services for foreign-owned US single-member LLCs: annual filings, late (DIIRSP) catch-up filings with reasonable-cause statements, dormant-LLC and final-year filings for dissolved LLCs, IRS Ogden PIN Unit fax delivery with timestamped receipts, white-label filing for formation and registered agents, plus EIN and ITIN application support.",
  h1: "Form 5472 services by situation",
  // The capsule under the H1: what the filing is, what it costs and how long it
  // takes (prices from pricing.ts; the test caps it at 60 words).
  intro: `Every Form5472 Prep service here is one filing: Form 5472 with a pro forma Form 1120 for a US LLC with one foreign owner, at ${STD} (ready in ${STANDARD_TURNAROUND}) or ${EXP} (ready to sign within ${EXPRESS_TURNAROUND}) per year. A tax accountant who holds an IRS PTIN reviews every filing before we fax it to the IRS.`,
} as const;

/** Eyebrow above each service page's H1: the page's group, so the 12 pages
 *  do not all open with the same head-term line. */
export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  annual: "Annual Form 5472 filing",
  situations: "Missed, quiet and final years",
  partners: "For firms and agents",
};

export type HubLink = { href: string; label: string; blurb: string };
export type HubCategory = { heading: string; description: string; links: HubLink[] };

// The six formation-provider pages and the fax-number guide had no inbound
// internal link before this hub (audit 2026-10-01 §2.2). Their anchors are
// resolved from LANDING_PAGES at render time (anchor = the page's H1).
export const FORMATION_PROVIDER_SLUGS = [
  "clemta-form-5472",
  "doola-form-5472",
  "firstbase-form-5472",
  "northwest-registered-agent-form-5472",
  "startglobal-form-5472",
  "zenind-form-5472",
  "form-5472-fax-number",
] as const;

function servicesIn(category: ServiceCategory): HubLink[] {
  return SERVICE_PAGES.filter((p) => p.category === category).map((p) => ({
    href: servicePath(p.slug),
    label: p.h1,
    blurb: p.shortBlurb,
  }));
}

/** Hub categories other than the formation-provider group (which needs
 *  LANDING_PAGES and is assembled by the hub page). */
export function serviceHubCategories(): HubCategory[] {
  return [
    {
      heading: "Which service do I need for the annual Form 5472 filing?",
      description:
        "The yearly Form 5472 and pro forma 1120 for a single-member LLC with one foreign owner is covered by the filing service, with separate pages on the pro forma 1120, federal scope, fax delivery, hiring someone and choosing a preparer.",
      links: servicesIn("annual"),
    },
    {
      heading: "Which service do I need for a missed, dormant or final year?",
      description:
        "A missed year needs a late filing with a reasonable-cause statement, a dormant LLC with no activity can still have a reportable transaction, and a dissolved LLC files a final short-year return. Each situation has its own page.",
      links: servicesIn("situations"),
    },
    {
      heading: "Which service is for accountants, bookkeepers, formation agents and registered agents?",
      description:
        "Accountants, bookkeepers, formation agents and registered agents can refer clients, run client filings from one partner account, or offer the filing under their own brand while we prepare, review and fax each package.",
      links: servicesIn("partners"),
    },
  ];
}

export const EIN_ITIN_LINKS: HubLink[] = [
  {
    href: "/ein",
    label: "Get a US EIN for your foreign-owned LLC",
    blurb: "We prepare Form SS-4 and obtain the EIN. No SSN or ITIN required.",
  },
  {
    href: "/itin",
    label: "Check whether you may need an ITIN for a federal tax purpose",
    blurb: "ITIN application support for individuals with a qualifying federal tax reason.",
  },
  {
    href: "/form-7004-extension",
    label: "File a Form 7004 extension for your foreign-owned LLC",
    blurb: "We prepare Form 7004 and fax it to the IRS Ogden PIN Unit, then email you the fax confirmation.",
  },
];

/** The hub lists every page, so it changes whenever a page is added or edited:
 *  its date is the newest page date (ISO YYYY-MM-DD), never older than the
 *  hub's own review date. Feeds the hub's visible "Last reviewed" line, its
 *  JSON-LD dateModified and its sitemap row, so the three cannot drift. */
export function servicesHubLastModified(floor: string = SERVICES_LAST_REVIEWED): string {
  return [floor, ...SERVICE_PAGES.map((p) => p.lastModified).filter((d): d is string => !!d)].sort().at(-1)!;
}

/** Sitemap rows for the hub and every service page (used by src/app/sitemap.ts). */
export function serviceSitemapEntries(base: string, lastModified: Date) {
  const hubModified = new Date(
    `${servicesHubLastModified(lastModified.toISOString().slice(0, 10))}T00:00:00Z`,
  );
  return [
    { url: `${base}${SERVICES_HUB_PATH}`, lastModified: hubModified, changeFrequency: "monthly" as const, priority: 0.8 },
    ...SERVICE_PAGES.map((p) => ({
      url: `${base}${servicePath(p.slug)}`,
      lastModified: p.lastModified ? new Date(`${p.lastModified}T00:00:00Z`) : lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}

// ── Plain-text helpers (JSON-LD answers, llms.txt, word counts) ─────────────

/** Strip the body markup down to plain text: links keep their label, bold
 *  markers and list markers go. */
export function toPlainText(markup: string): string {
  return markup
    .replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/^\s*(?:\d+\.|[-•–])\s+/gm, "");
}

/** Every visible copy block of a service page, as plain text, in page order. */
export function servicePlainBody(page: ServicePage): string {
  return [
    page.intro,
    ...page.sections.flatMap((s) => [s.heading, s.body]),
    ...page.faqs.flatMap((f) => [f.q, f.a]),
  ]
    .map(toPlainText)
    .join("\n\n");
}

// ── HowTo (JSON-LD) ─────────────────────────────────────────────────────────

export type ServiceHowTo = {
  /** Heading of the section that holds the steps (its slugified id is the anchor). */
  heading: string;
  steps: Array<{ name: string; text: string }>;
};

/** The page's first numbered list, as HowTo steps. Only three pages have one;
 *  the others describe a service rather than a procedure, so they get no
 *  HowTo (structured data must mirror visible content). A step's name is its
 *  bold lead-in ("Questionnaire."), or its first sentence when it has none. */
export function serviceHowTo(page: ServicePage): ServiceHowTo | null {
  for (const section of page.sections) {
    const list = parseLandingBody(section.body).find((b) => b.type === "ol");
    if (!list || list.type !== "ol" || list.items.length < 2) continue;
    return {
      heading: section.heading,
      steps: list.items.map((item) => {
        const text = toPlainText(item).trim();
        const lead = item.match(/^\*\*([^*]+?)\.?\*\*/)?.[1];
        const name = lead ?? text.split(/(?<=[.!?])\s+/)[0];
        return { name: name.trim(), text };
      }),
    };
  }
  return null;
}

export function serviceLastReviewed(page: Pick<ServicePage, "lastReviewed">): string {
  return page.lastReviewed ?? SERVICES_LAST_REVIEWED;
}
