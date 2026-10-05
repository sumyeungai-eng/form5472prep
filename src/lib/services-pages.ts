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
// Copy rules: no "CPA", "licensed", "IRS-approved", promised outcomes or
// personal tax advice.
//
// Body markup (rendered by src/app/(marketing)/services/ServiceRichText.tsx):
// blank line = new block; "- " = bullet; "1. " = numbered step;
// **bold**; [label](/internal-path).
// ─────────────────────────────────────────────────────────────────────────────
import { MULTI_YEAR_ADDON_CENTS, STANDARD_TURNAROUND, EXPRESS_TURNAROUND, TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { parseLandingBody } from "@/lib/landing-body";

export const SERVICES_HUB_PATH = "/services";
export const SERVICES_LAST_REVIEWED = "2026-10-01";
/** The four audience pages (hire someone / preparer / accountants /
 *  bookkeepers) went live on this date. */
const AUDIENCE_PAGES_ADDED = "2026-10-05";

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
  /** False for the partner page: partner pricing is not published. */
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
3. **Accountant review.** A qualified accountant checks the package against your answers. If something needs clarifying, we message you on your filing page.
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
    secondaryKeywords: ["form 5472 and pro forma 1120 filing service", "form 5472 online filing"],
    category: "annual",
    title: "Form 5472 Filing Service, Faxed to the IRS | Form5472 Prep",
    metaDescription:
      "Form 5472 filing service for foreign-owned US LLCs: Form 5472 and pro forma 1120 prepared, reviewed by a qualified accountant and faxed to the IRS.",
    longDescription:
      "Form 5472 and pro forma 1120 filing service for foreign-owned US single-member LLCs (disregarded entities): a 15-minute online questionnaire, a package generated from your answers, review by a qualified accountant, online signature, fax delivery to the IRS Ogden PIN Unit (+1-855-887-7737) and a timestamped fax receipt. Flat fee per filing year.",
    h1: "Form 5472 Filing Service for Foreign-Owned US LLCs",
    shortBlurb: "The annual Form 5472 and pro forma 1120 package, prepared, reviewed and faxed for you.",
    intro: `Our Form 5472 filing service prepares the Form 5472 and pro forma 1120 package for a foreign-owned US single-member LLC, then sends it to the IRS for you. **You answer about 15 minutes of questions, a qualified accountant reviews the package, you sign online, and we fax it to the IRS Ogden PIN Unit and give you the timestamped fax receipt.**

It is a filing service, not tax advice. The forms are built from the information you give us.`,
    cta: startCta("svc-form-5472-filing-service"),
    sections: [
      {
        heading: "What the Form 5472 filing service includes",
        body: `Everything below is in both plans. The plans differ only in turnaround.

- Form 5472, completed for a foreign-owned disregarded entity
- The pro forma Form 1120 cover, marked "Foreign-owned U.S. DE" as the instructions require
- A Part V supporting statement listing the year's reportable transactions
- A cover letter, plus a reasonable-cause statement for each late year
- Review by a qualified accountant before you sign
- Fax delivery to the IRS Ogden PIN Unit
- The timestamped fax receipt, stored on your filing page
- A reminder in the second week of January for next year's filing`,
      },
      {
        heading: "How the filing works, step by step",
        body: `${PROCESS_STEPS}

A foreign-owned disregarded entity cannot e-file this package. It goes to the IRS by fax or mail, which is why fax delivery is part of the service rather than an extra.`,
      },
      {
        heading: "What you need before you start",
        body: `Have these to hand. Nothing else is needed, and no accounting software is involved.

- **The LLC:** its name, EIN, US address, state and date of formation
- **The owner:** name, address, country of residence and foreign tax ID
- **The year's money movements:** capital you put in, distributions you took out, loans either way, and LLC costs you paid personally
- **Year-end total assets:** what the LLC held on the last day of the tax year

If any amounts were in another currency, the [IRS yearly average exchange rates](/irs-yearly-average-exchange-rates) table converts them to US dollars.`,
      },
      {
        heading: "What this service is not, and what nobody can promise",
        body: `- **Not tax advice.** We prepare and submit forms from the information you provide. You remain responsible for its accuracy.
- **Not an IRS acceptance notice.** The fax receipt shows what was sent and when. It does not show that the IRS has processed the return.
- **Not a penalty waiver.** If a year is already late, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).
- **Not every return.** We do not prepare Form 1065 for multi-member LLCs, a full Form 1120 for an LLC taxed as a corporation, Form 1040-NR, state returns or Form 7004 extensions. We do not do bookkeeping.`,
      },
      {
        heading: "How to compare filing options",
        body: `There are three common routes. Each can be the right one.

- **Doing it yourself.** The IRS forms are free. You complete Form 5472 and the pro forma 1120, sign them, and send them by fax or mail. Our free [reportable transactions checker](/form-5472-reportable-transactions-checker) and [deadline calculator](/form-5472-deadline-calculator) help either way.
- **An accounting firm.** Useful when you also need income-tax returns, bookkeeping or advice on your situation. Ask for a written quote and a list of what is included.
- **A formation-company add-on.** Some formation providers sell a tax package. Check whether it covers the pro forma 1120 and who submits it.

Whichever you choose, ask four questions. Who reviews the package? Who sends it to the IRS? What record do you get afterwards? How are late years handled?`,
      },
      {
        heading: "Price and next step",
        body: `Two plans, same filing:

- **Standard:** ${STD}, ready in ${STANDARD_TURNAROUND}
- **Express:** ${EXP}, ready within ${EXPRESS_TURNAROUND}
- **Each additional past year:** +${ADD} on either plan

Fax delivery and the accountant review are included in both. See the [pricing page](/pricing) for the full list, or start the questionnaire now.`,
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
        a: "Every filing is reviewed by a qualified accountant before it is submitted. Signing opens only after the review is approved, so you never sign an unchecked package.",
      },
    ],
    related: [], // filled below from slugs + tools
    serviceType: "Form 5472 and pro forma Form 1120 preparation and IRS fax filing",
    showOffer: true,
    irsSources: [
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
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
    title: "Pro Forma 1120 Filing Service with Form 5472 | Form5472 Prep",
    metaDescription:
      "Pro forma 1120 filing service for non-resident owners of US single-member LLCs: the 1120 cover and Form 5472 prepared, reviewed and faxed to the IRS.",
    longDescription:
      "Pro forma Form 1120 preparation for non-resident owners of foreign-owned US single-member LLCs: the Form 1120 page-1 cover (name, address, EIN, item E boxes, marked \"Foreign-owned U.S. DE\") prepared together with Form 5472 and the Part V statement, reviewed by a qualified accountant, signed online and faxed to the IRS Ogden PIN Unit with a timestamped receipt.",
    h1: "Pro Forma 1120 Filing Service for Non-Resident LLC Owners",
    shortBlurb: "The Form 1120 cover your Form 5472 is attached to, prepared with it as one package.",
    intro: `A pro forma 1120 filing service prepares the Form 1120 cover that a foreign-owned US disregarded entity attaches its Form 5472 to, and submits both. **The pro forma 1120 is not an income-tax return. It carries the LLC's identifying details, is marked "Foreign-owned U.S. DE", and is always filed together with Form 5472.**

We prepare both, have them reviewed, and fax them to the IRS.`,
    cta: startCta("svc-pro-forma-1120-filing-service"),
    sections: [
      {
        heading: "What a pro forma 1120 is, in plain terms",
        body: `Under Treas. Reg. §1.6038A-1(c), a US LLC wholly owned by one foreign person is treated as a domestic corporation for Form 5472 purposes only. That is why it uses a Form 1120 at all.

The Form 5472 instructions require it to file a pro forma Form 1120 with Form 5472 attached. Only a few page-1 items apply:

- The LLC's name and address
- Item B, the employer identification number (EIN)
- The applicable item E boxes: initial return, final return, name change, address change
- "Foreign-owned U.S. DE" written across the top

The income, deduction and tax sections stay blank. No tax is computed on it.`,
      },
      {
        heading: "What our pro forma 1120 filing service does",
        body: `We treat the 1120 cover and Form 5472 as one package, because that is how the IRS receives them.

- We fill the page-1 items from your questionnaire answers and mark the form "Foreign-owned U.S. DE".
- We tick the applicable item E boxes, such as final return for a dissolved LLC.
- We prepare Form 5472 and the Part V statement from the same answers, so the figures match.
- A qualified accountant reviews the package before signing opens.
- You sign online. We fax the package to the IRS Ogden PIN Unit and send you the timestamped receipt.`,
      },
      {
        heading: "Mistakes the review is there to catch",
        body: `The cover is short, which makes small errors easy to miss. The accountant review checks, among other things:

- "Foreign-owned U.S. DE" is written across the top of the 1120.
- The income, deduction and tax lines are left blank.
- The 1120 and Form 5472 travel together. One without the other is not a complete filing.
- The EIN and LLC name match on both forms.
- Form 5472 still shows the year-end total assets. The cover does not need Schedule L, but that is not permission to leave the Form 5472 figure blank.`,
      },
      {
        heading: "Who needs a pro forma 1120 preparer for a non-resident-owned LLC",
        body: `You most likely need the filing if all of these are true:

- The LLC is a US LLC with a single owner.
- The owner is a foreign individual or a foreign company.
- The LLC has not elected to be taxed as a corporation.
- The LLC had a reportable transaction in the year, such as money you put in or took out, or LLC fees you paid personally.

Not sure? The free [Do I need to file Form 5472?](/do-i-need-to-file-form-5472) checker walks through these questions with IRS sources.`,
      },
      {
        heading: "What it is not, and what nobody can promise",
        body: `- **Not a corporate income-tax return.** If your LLC elected corporate tax treatment on Form 8832, it files a full Form 1120 that computes tax, with Form 5472 attached. We do not prepare that return.
- **Not a way to lower tax.** The pro forma return reports no income and no tax.
- **Not a personal return.** If the owner has a US filing duty of their own, such as Form 1040-NR, that is separate. We do not file it.
- **Not penalty relief.** If the filing is late, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).
- **Not tax advice.** We prepare forms from the information you give us.`,
      },
      {
        heading: "Comparing your options",
        body: `- **Prepare it yourself.** The form is free on irs.gov. Most of the work is in Form 5472, not the cover: transaction totals, Part V, the signature and the fax. Our [reportable transactions checker](/form-5472-reportable-transactions-checker) helps identify what to report.
- **A freelance preparer.** Ask whether they also prepare Form 5472 and who sends the package to the IRS. A cover page on its own is not a filing.
- **An accounting firm.** Worth it if you need income-tax returns or advice beyond the information return.
- **A formation-company package.** Check whether the pro forma 1120 is included, or only Form 5472, and what proof of submission you receive.`,
      },
      {
        heading: "Price and how to start",
        body: `The pro forma 1120 is never priced on its own. It is part of every Form 5472 filing.

- **Standard:** ${STD}, ready in ${STANDARD_TURNAROUND}
- **Express:** ${EXP}, ready within ${EXPRESS_TURNAROUND}
- **Each additional past year:** +${ADD}

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
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
      },
      {
        label: "About Form 1120 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-1120",
        blurb: "The IRS page for Form 1120, the return a foreign-owned disregarded entity files in pro forma form with Form 5472.",
      },
      {
        label: "Instructions for Form 1120 (IRS)",
        url: "https://www.irs.gov/instructions/i1120",
        blurb: "The IRS instructions for Form 1120, the form the pro forma return is based on.",
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
    title: "Late Form 5472 Filing Service for Past Years | Form5472 Prep",
    metaDescription:
      "Late Form 5472 filing service for missed years: a package and reasonable-cause statement for each year, reviewed and faxed to the IRS Ogden PIN Unit.",
    longDescription:
      "Delinquent Form 5472 filing service for foreign-owned US single-member LLCs: one Form 5472 and pro forma 1120 package per missed year, a reasonable-cause statement for each late year under Treas. Reg. §1.6038A-4(b), a DIIRSP cover letter, qualified-accountant review, and fax delivery to the IRS Ogden PIN Unit with a timestamped receipt for each package. No promise of penalty relief.",
    h1: "Late Form 5472 Filing Service for Missed Years",
    shortBlurb: "Catch-up filings for one or more missed years, with a reasonable-cause statement for each.",
    intro: `Our late Form 5472 filing service prepares the missing Form 5472 and pro forma 1120 for each past year, with a reasonable-cause statement for each late year, and faxes them to the IRS. **Filing late does not cancel the $25,000 penalty under IRC §6038A(d). It puts the missing returns on record, and the statement asks the IRS to excuse the delay, a decision it makes case by case.**

We cannot tell you the outcome in advance. Nobody can.`,
    cta: startCta("svc-late-form-5472-filing-service"),
    sections: [
      {
        heading: "Which late-filing route applies to you",
        body: `The IRS publishes the Delinquent International Information Return Submission Procedures (DIIRSP). Its eligibility wording covers taxpayers who:

- are not under a civil examination or a criminal investigation by the IRS, and
- have not already been contacted by the IRS about the delinquent information returns.

If that fits, the IRS says to file the delinquent returns "through normal filing procedures". For a foreign-owned LLC we read that as the pro forma 1120 with Form 5472 attached, sent as the Form 5472 instructions direct. That reading is ours: the DIIRSP page does not mention disregarded entities by name.

If you already have an IRS notice, that is a different situation. Answer the notice by its deadline. Our free [late-filing checker](/form-5472-late-filing-checker) shows which route fits your facts.`,
      },
      {
        heading: "What the late Form 5472 filing service includes",
        body: `- One Form 5472 and pro forma 1120 package for each missed year, with that year's figures
- A reasonable-cause statement for each late year, written from your answers about why the filing was missed
- A cover letter for the delinquent submission
- Review of every year's package by a qualified accountant before you sign
- Fax delivery of each package to the IRS Ogden PIN Unit, with a timestamped receipt for each

For each year we ask for the money that moved between you and the LLC, loans, related-party payments and the year-end total assets. If amounts were in another currency, the [IRS yearly average exchange rates](/irs-yearly-average-exchange-rates) table converts them to US dollars.`,
      },
      {
        heading: "What reasonable cause means here",
        body: `Treas. Reg. §1.6038A-4(b) allows certain failures to be excused for reasonable cause, including not filing Form 5472 on time. The statement has to set out all the facts and carry a declaration that it is made under penalties of perjury.

- The decision is made case by case, on all the facts and circumstances.
- An honest misunderstanding of fact or law, reasonable for someone with your experience, can qualify.
- For a small corporation (gross receipts of $20,000,000 or less) that did not know the rules, has limited US presence and promptly complies with IRS requests, the regulation tells the IRS to apply the exception liberally.

We write each statement from your facts. We do not invent reasons, and you sign it.`,
      },
      {
        heading: "One statement for each late year",
        body: `Each late year is a separate return with its own penalty exposure, so each gets its own reasonable-cause statement.

The facts often differ from year to year: when the LLC was formed, when you learned of the rule, what changed in between. A statement written for the specific year says what happened in that year, rather than repeating one general explanation across several returns.`,
      },
      {
        heading: "What nobody can promise about late filings",
        body: `- **No penalty outcome.** The DIIRSP page itself says: "Penalties may be assessed in accordance with existing procedures."
- **No first-pass review of your statement.** The IRS says penalties may be assessed during processing without considering the attached statement. You may need to answer later IRS letters and resubmit the reasonable-cause information.
- **No other missed returns.** Form 1065, Form 1040-NR and state filings are outside this service.
- **No tax advice.** If you face an existing penalty or an examination, speak to a tax professional.`,
      },
      {
        heading: "Comparing ways to catch up multiple years",
        body: `- **File each year yourself.** Possible, but each year needs its own package, its own figures and its own statement. A mistake made once tends to repeat in every year.
- **An accounting firm.** Sensible if you face an existing penalty, an examination or other unfiled returns, where advice matters more than paperwork.
- **A filing service like ours.** Fits the common case: a single-member LLC owned by one foreign person, unfiled years, no IRS contact yet. One questionnaire covers every year you select.

Before deciding, the [penalty calculator](/form-5472-penalty-calculator) shows the statutory exposure for the years involved.`,
      },
      {
        heading: "Price for catch-up filings",
        body: `You pay for the first year at your chosen plan, then +${ADD} for each additional past year.

- **Standard:** ${STD} for the first year, ready in ${STANDARD_TURNAROUND}
- **Express:** ${EXP} for the first year, ready within ${EXPRESS_TURNAROUND}
- **Two years on Standard:** ${STD_2Y}. **Three years:** ${STD_3Y}.

Every late year includes its own reasonable-cause statement. See the [pricing page](/pricing).`,
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
    title: "Foreign Owned LLC Tax Filing Service | Form5472 Prep",
    metaDescription:
      "Foreign owned LLC tax filing service for non-resident owners of single-member US LLCs: Form 5472 and pro forma 1120 prepared, reviewed and faxed.",
    longDescription:
      "Federal tax filing service for non-resident owners of foreign-owned US single-member LLCs: Form 5472 with the pro forma Form 1120 required by Treas. Reg. §301.7701-2(c)(2)(vi) and §1.6038A-1, prepared from a questionnaire, reviewed by a qualified accountant and faxed to the IRS Ogden PIN Unit. Scope stated plainly: no Form 1065, Form 1040-NR, state returns or bookkeeping.",
    h1: "Foreign Owned LLC Tax Filing Service for Non-Resident Owners",
    shortBlurb: "The federal filing a non-resident's single-member US LLC makes each year, with the scope stated plainly.",
    intro: `A foreign owned LLC tax filing service handles the federal return that a non-resident's single-member US LLC files each year. **For a disregarded LLC with one foreign owner, the yearly federal filing at the LLC level is generally Form 5472 attached to a pro forma Form 1120. That is what we prepare and fax. Other obligations, such as the owner's own return or state reports, sit outside this service.**

This page sets out both sides, so you can see whether we cover what you need.`,
    cta: startCta("svc-foreign-owned-llc-tax-filing-service"),
    sections: [
      {
        heading: "What the foreign owned LLC tax filing service covers",
        body: `We cover the federal information return for a US LLC that has one foreign owner and has not elected corporate tax treatment.

- Form 5472, reporting the year's transactions between the LLC and you or other related parties
- The pro forma Form 1120 that Form 5472 is attached to
- A Part V supporting statement, and a reasonable-cause statement for each late year
- Qualified-accountant review, online signing, fax to the IRS Ogden PIN Unit and the timestamped receipt

We also offer [EIN applications](/ein) for LLCs that do not have one yet, and [ITIN application support](/itin) for individuals with a federal tax reason to need one.`,
      },
      {
        heading: "Why a non-resident's LLC files at all",
        body: `By default a single-member LLC is disregarded for US income tax. A special rule changes that for one purpose. Under Treas. Reg. §301.7701-2(c)(2)(vi), an LLC with one foreign owner is treated as a corporation for section 6038A reporting.

The result:

- The LLC reports transactions with its owner on Form 5472, even with no income.
- Money you put in, money you take out and LLC bills you pay personally can all be reportable.
- Missing a required Form 5472 can mean a $25,000 penalty for each year under IRC §6038A(d).

The LLC uses the same tax year as its owner uses for US filing or, if the owner has none, the calendar year. The filing is due by the 15th day of the 4th month after the tax year ends: April 15 for a calendar year. It cannot be e-filed; it goes to the IRS by fax or mail.`,
      },
      {
        heading: "Who this service fits, and who it does not",
        body: `It fits if:

- the LLC has a single owner who is not a US person,
- the LLC has not elected to be taxed as a corporation, and
- you want the federal information return prepared and sent for you.

It does not fit if:

- the LLC has two or more members. It is a partnership by default and files Form 1065, which we do not prepare.
- the LLC elected corporate treatment. It files a full Form 1120 that computes tax, which we do not prepare.
- the owner is a US person. The foreign-owned rule does not apply.`,
      },
      {
        heading: "What nobody can promise you",
        body: `- **That Form 5472 is your only obligation.** If the LLC earns US business income, the owner may have a personal US return, such as Form 1040-NR. We do not prepare it and cannot tell you whether you need one.
- **That state obligations are covered.** Annual reports and franchise taxes are set by each state. The [LLC annual fees by state](/llc-annual-fees-by-state) table lists them for ten states; filing them is not part of this service.
- **That your figures are complete.** We use the totals you give us. We do not keep the LLC's books.
- **A penalty outcome for late years.** The IRS decides reasonable cause case by case.
- **Tax advice.** For planning, speak to a tax professional.`,
      },
      {
        heading: "Comparing compliance services for non-resident LLC owners",
        body: `Services sold to non-resident LLC owners vary a lot in scope. Compare them on what is actually done:

- Is the pro forma 1120 included, or only Form 5472?
- Who submits the package to the IRS, and what proof do you receive?
- Does a qualified person review it before you sign?
- Are late years handled with a statement for each year?
- Are state reports, a registered agent and bookkeeping included, and do you need them?

An all-in-one compliance subscription suits some owners. Others already have a registered agent and only need the federal filing; a per-filing service fits them. The free [compliance calendar](/foreign-owned-llc-compliance-calendar) lists your federal and state dates either way.`,
      },
      {
        heading: "Price and next step",
        body: `Each filing year is a one-time fee. No subscription.

- **Standard:** ${STD}, ready in ${STANDARD_TURNAROUND}
- **Express:** ${EXP}, ready within ${EXPRESS_TURNAROUND}
- **Each additional past year:** +${ADD}

See the [pricing page](/pricing) for everything included.`,
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
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
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
    title: "Form 5472 Fax Filing Service with Receipt | Form5472 Prep",
    metaDescription:
      "Form 5472 fax filing service: we fax your signed Form 5472 and pro forma 1120 to the IRS Ogden PIN Unit and give you the timestamped receipt.",
    longDescription:
      "Form 5472 fax filing to the IRS Ogden PIN Unit (+1-855-887-7737), included in every plan: the reviewed and signed Form 5472 and pro forma 1120 package is faxed for you, and the fax provider's transmission receipt (destination number, timestamp, page count, result) is stored on your filing page. The receipt is proof of transmission, not IRS acceptance.",
    h1: "Form 5472 Fax Filing Service With a Timestamped Receipt",
    shortBlurb: "We fax the signed package to the IRS Ogden PIN Unit and store the transmission receipt.",
    intro: `Our Form 5472 fax filing service sends your signed Form 5472 and pro forma 1120 package to the IRS Ogden PIN Unit at ${IRS_FAX} and gives you the transmission receipt. **A foreign-owned disregarded entity cannot e-file this package; it goes by fax or mail. The fax receipt records what was sent and when. It is not an IRS acceptance notice.**

Fax delivery is included in every plan.`,
    cta: startCta("svc-form-5472-fax-filing-service"),
    sections: [
      {
        heading: "What the Form 5472 fax filing service does",
        body: `We prepare the package, then deliver it. Fax is part of the filing, not a separate product.

- The package is faxed only after a qualified accountant has reviewed it and you have signed it.
- The complete package is sent: cover letter, pro forma Form 1120, Form 5472 and supporting statements.
- We email you when the fax provider reports delivery.
- The receipt is stored on your filing page for you to download at any time.

You do not need a fax machine, a fax account or an IRS account.`,
      },
      {
        heading: "What the IRS receives",
        body: `The fax carries the whole package, not just Form 5472:

- a cover letter identifying the LLC, its EIN and the tax year,
- the pro forma Form 1120, marked "Foreign-owned U.S. DE" and signed,
- Form 5472,
- the Part V supporting statement listing the year's reportable transactions, and
- for a late year, the reasonable-cause statement.

Sending the 1120 without Form 5472, or the reverse, is not a complete filing. The package is generated as one PDF so nothing is left out of the transmission.`,
      },
      {
        heading: "What is on the fax receipt",
        body: `The receipt comes from the fax provider. It records:

- the destination number,
- the timestamp,
- the page count, and
- the reported result.

Keep it with the exact package that was sent. Together they show what reached the IRS fax line and when. For a late year, that is proof of when the package arrived, not proof that it was on time.

If the IRS writes to the LLC later, the package and receipt are the record of what you sent. Keep both with the LLC's tax records.`,
      },
      {
        heading: "Why fax instead of mail",
        body: `Both routes are open for this package. The difference is the record you are left with.

- **Fax:** the transmission receipt states the destination, time and page count of what was sent.
- **Mail:** the package goes to the IRS Ogden Service Center, PIN Unit, Stop 6273, Ogden, UT 84201. You rely on postal records, such as a certified-mail receipt, and the package takes days to arrive.

You can also fax it yourself. You need a fax service that can send to a US toll-free number. Our guide to the [Form 5472 fax number](/form-5472-fax-number) explains the page order and what to keep.`,
      },
      {
        heading: "What a fax filing cannot do",
        body: `- **It cannot confirm IRS acceptance.** The receipt shows transmission. The IRS processes the return separately.
- **It cannot fix the content.** A faxed package is only as good as its figures. That is why every filing is reviewed by a qualified accountant before it is submitted.
- **It cannot make a late return timely.** The timestamp records the actual arrival. For missed years, see the [late Form 5472 filing service](/services/late-form-5472-filing-service).
- **It does not cover other returns.** The Ogden PIN Unit line is for this package. We do not send Form 1065, Form 1040-NR or state filings.`,
      },
      {
        heading: "Who uses the fax filing service",
        body: `- **Owners filing on time** who want the package prepared, checked and sent without setting up a fax account.
- **Owners catching up missed years,** who get a separate package and a separate receipt for each year.
- **Formation agents, registered agents and accounting firms** filing for several client LLCs; see [white label Form 5472 filing](/services/white-label-form-5472-filing).

In each case the fax is sent only after review and signature, and the receipt is kept on the filing page.`,
      },
      {
        heading: "Comparing ways to fax Form 5472 to the IRS",
        body: `- **Your own online fax account.** Low cost. You prepare and sign the package, upload it, send it to ${IRS_FAX} and save the receipt.
- **A print shop or office fax.** Works if it can send to a US toll-free number and hands you a transmission report.
- **An accounting firm.** May fax as part of a wider engagement. Ask whether you receive the transmission receipt.
- **Our service.** Preparation, review, signing and fax in one place, with the receipt on your filing page.`,
      },
      {
        heading: "Price",
        body: `There is no separate fax fee. Fax delivery is in both plans.

- **Standard:** ${STD}, ready in ${STANDARD_TURNAROUND}
- **Express:** ${EXP}, ready within ${EXPRESS_TURNAROUND}
- **Each additional past year:** +${ADD}

See the [pricing page](/pricing).`,
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
        a: "After a qualified accountant has reviewed the package and you have signed it online. Nothing is sent to the IRS until you sign. We email you when the fax is delivered.",
      },
    ],
    related: [],
    serviceType: "IRS fax filing of Form 5472 and pro forma Form 1120",
    showOffer: true,
    irsSources: [
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
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
    // Body gained the accountants/bookkeepers cross-link on this date.
    lastModified: AUDIENCE_PAGES_ADDED,
    title: "White Label Form 5472 Filing for Agents | Form5472 Prep",
    metaDescription:
      "White label Form 5472 filing for formation agents, registered agents and accounting firms: client emails under your brand, replies to you, one dashboard.",
    longDescription:
      "White-label Form 5472 filing for company formation agents, registered agents, accounting firms and consultants: approved partners with white-label delivery enabled have client filing emails sent under the partner's brand name with replies to the partner's address, while Form5472 Prep prepares, has a qualified accountant review, and faxes each client's Form 5472 and pro forma 1120 to the IRS. One partner dashboard tracks every filing.",
    h1: "White Label Form 5472 Filing for Formation and Registered Agents",
    shortBlurb: "Offer Form 5472 filing to your clients under your brand; we prepare, review and fax.",
    intro: `Our white label Form 5472 filing option lets formation agents, registered agents and accounting firms offer Form 5472 filing to their clients under their own brand. **For approved partners with white-label delivery enabled, client emails go out under the partner's brand name and replies go to the partner's address, while we prepare, review and fax each filing.**

White-label delivery is switched on per partner, on request, after the partner account is approved.`,
    cta: { href: "/partners#apply", label: "Apply as a partner" },
    sections: [
      {
        heading: "How white label Form 5472 filing works",
        body: `It runs inside our partner program.

1. **Apply.** Submit the partner application. Accounts are approved manually, usually within one business day.
2. **Ask for white-label delivery.** Say so on the application or after approval. We enable it and set your brand name and reply-to address.
3. **Start client filings.** Each client LLC gets its own filing from your partner dashboard, using the same questionnaire as direct customers.
4. **Send the signing link.** The client receives the secure review-and-sign link by email under your brand name.
5. **We review and fax.** A qualified accountant reviews each package. After the client signs, we fax it to the IRS Ogden PIN Unit.
6. **Track it.** Your dashboard shows preparation, signature and submission status, and the fax receipt for every client.`,
      },
      {
        heading: "Who enters each client's information",
        body: `There are two ways to fill in a client filing:

- **You enter it** from the records you already hold: the LLC's details, the owner's details, the year's reportable transactions and the year-end total assets.
- **The client enters it.** Send the client a secure link to answer the questions themselves. With white-label delivery on, that email also goes out under your brand. You can copy the link instead and paste it into your own message.

Either way the filing stays under your partner account, so you can review the answers before the package goes to accountant review. The client answers as themselves; you never sign in as the client.

Missed years work the same way as for direct customers: one package and one reasonable-cause statement per late year. Partners sign in with a secure email link, so there is no password to manage.`,
      },
      {
        heading: "What your clients see",
        body: `With white-label delivery on:

- Client emails for each filing show your brand name as the sender name and in the email header.
- When a client replies, the reply goes to the address you gave us. If none is set, replies come to our support address.
- A short line at the foot of those emails says the filing is processed by Form5472 Prep.
- The forms are the client LLC's own IRS forms, signed by the person authorized to sign for it.

Without white-label delivery, clients receive these emails from Form5472 Prep, with you shown as the preparer coordinating the filing.`,
      },
      {
        heading: "Form 5472 filing for company formation agents and registered agents",
        body: `The partner account is built for firms that look after several foreign-owned LLCs:

- **Company formation agents** whose clients ask what happens at tax time.
- **Registered agents** who already hold the client relationship and send annual reminders.
- **Accounting firms and consultants** managing several foreign-owned single-member LLCs.

You keep the client relationship. We handle preparation, review, IRS fax delivery and receipt storage for each filing.`,
      },
      {
        heading: "What white-label delivery is not",
        body: `- **Not a full rebrand.** Emails carry a short note that Form5472 Prep processes the filing, and the fax reaches the IRS through our fax service.
- **Not automatic.** It is enabled per partner, on request, after approval.
- **Not client advice.** We prepare and submit forms from the information entered. We do not give tax advice to your clients.
- **Not a wider scope.** The same limits apply as for direct customers: no Form 1065, no full Form 1120 for LLCs taxed as corporations, no Form 7004 extensions, no bookkeeping.
- **Not an outcome promise.** For late years, nobody can promise the IRS will waive penalties.`,
      },
      {
        heading: "Comparing ways to offer Form 5472 to your clients",
        body: `- **Refer clients elsewhere.** Simple, but the client deals with another firm at tax time.
- **Prepare in-house.** Full control. You need staff who know Form 5472 and the pro forma 1120, a review step, and a fax workflow that keeps receipts.
- **White-label partner filing.** Your brand faces the client. Preparation, review, fax and receipt storage happen on our side, and you track every filing in one dashboard.

Accountants and bookkeepers weighing these options can start with [Form 5472 for accountants and tax preparers](/services/form-5472-for-accountants) or [Form 5472 for bookkeepers](/services/form-5472-for-bookkeepers).`,
      },
      {
        heading: "Next step",
        body: `Apply through the [partner program](/partners). Direct-customer prices are on the [pricing page](/pricing). For volume pricing or consolidated invoicing, ask when you apply.`,
      },
    ],
    faqs: [
      {
        q: "Do my clients know Form5472 Prep is involved?",
        a: "Branded emails show your name and send replies to you, with a short footer line saying the filing is processed by Form5472 Prep. The IRS forms are the client LLC's own and are signed by its authorized signer.",
      },
      {
        q: "Who signs each client's filing?",
        a: "The person authorized to sign for the client LLC. You send the secure review-and-sign link from your dashboard; they review the completed package and sign online. A wet-ink option is available.",
      },
      {
        q: "How do I turn on white-label delivery?",
        a: "Mention it on the partner application, or ask after approval. We enable it for approved partners and set your brand name and reply-to address.",
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
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
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
    title: "Form 5472 Filing for Dormant LLC Owners | Form5472 Prep",
    metaDescription:
      "Form 5472 filing for dormant LLC owners: when an LLC with no activity still files, which owner-paid costs count, and how we prepare and fax it.",
    longDescription:
      "Form 5472 for a foreign-owned US LLC with no activity: the Form 5472 instructions excuse only a year with no reportable transactions (Parts IV, V and VI), and owner-paid state fees, registered-agent fees, formation costs and capital contributions are reportable under Treas. Reg. §1.6038A-2(b)(3)(xi). We prepare the pro forma 1120 and Form 5472, have them reviewed and fax them to the IRS.",
    h1: "Form 5472 Filing for Dormant LLC Owners",
    shortBlurb: "When an LLC with no business activity still files, and which owner-paid costs count.",
    intro: `Form 5472 filing for dormant LLC owners usually comes down to one question: did any money move between you and the LLC? **A foreign-owned LLC with no bank activity can still have a reportable transaction. Paying its state fee or registered agent from your own pocket is one, and then the LLC files Form 5472 with a pro forma 1120 like any other year.**

The Form 5472 instructions do excuse a year with no reportable transactions at all. This page explains where that line sits.`,
    cta: startCta("svc-form-5472-filing-for-dormant-llc"),
    sections: [
      {
        heading: "When a dormant LLC still files",
        body: `The Form 5472 instructions excuse a foreign-owned disregarded entity from filing for a year with no reportable transactions of the types listed in Parts IV, V and VI. That exception is narrower than it sounds.

Reportable transactions include amounts paid or received in connection with forming or dissolving the LLC, and contributions to and distributions from it. A "dormant" LLC can still have one of these:

- **State fees you paid personally.** Paying the LLC's bill with your own money is a transfer to the LLC.
- **Registered agent fees you paid personally.** The same logic: you covered an LLC cost.
- **Formation-year costs.** Amounts paid to form the LLC are named in the regulation.
- **Capital you put in,** even a small opening deposit.
- **Loans or reimbursements** between you and the LLC.`,
      },
      {
        heading: "What Form 5472 filing for dormant LLC owners involves",
        body: `The filing is short when little happened, but it is still the full package:

- the pro forma Form 1120 cover marked "Foreign-owned U.S. DE",
- Form 5472 with the owner's details and the transactions that did happen, such as a fee you paid for the LLC,
- a Part V supporting statement listing them, and
- the year-end total assets, which may be zero or close to it.

The questionnaire asks about each type of transaction in turn, so a fee paid personally is not missed. A qualified accountant reviews the package, you sign online, and we fax it to the IRS Ogden PIN Unit and send you the timestamped receipt.`,
      },
      {
        heading: "Form 5472 for an LLC with no activity: the edge cases",
        body: `- **The LLC paid its fees from its own account.** Payments from the LLC's account to unrelated vendors, such as the registered agent, are not reportable. If nothing else moved between you and the LLC, the year may have no reportable transaction.
- **The LLC existed for part of the year.** It still had a tax year, and formation payments in that year count.
- **The LLC has no EIN yet.** The forms need one. Our [EIN service](/ein) can obtain it.
- **You plan to close it.** The last year has its own due date and a final-return box; see the [final Form 5472 for a dissolved LLC](/services/final-form-5472-for-dissolved-llc).

The free [reportable transactions checker](/form-5472-reportable-transactions-checker) goes through each case with the regulation behind it.`,
      },
      {
        heading: "What to check before you decide",
        body: `Go through the year's records once before concluding that nothing happened:

- your own card and bank statements, for the state fee, registered agent or other LLC costs,
- the LLC's bank account, for any transfer in from you or out to you,
- loans or repayments between you and the LLC, and
- formation invoices, if the LLC was formed during the year.

If all of these are empty, the year may be excused. If any one shows a payment, plan on filing.`,
      },
      {
        heading: "What we cannot decide for you",
        body: `- **Whether your year was truly empty.** We work from your answers. If you are unsure, our [filing checker](/do-i-need-to-file-form-5472) leans toward filing; that is our cautious choice, not an IRS rule.
- **That skipping a year is safe.** Missing a required Form 5472 can cost $25,000 under IRC §6038A(d).
- **Penalty relief for earlier years.** If earlier years were missed, see the [late Form 5472 filing service](/services/late-form-5472-filing-service). Nobody can promise the IRS will waive penalties.
- **Whether to keep or close the LLC.** That is a planning question for a tax professional.`,
      },
      {
        heading: "Comparing options for a low-activity year",
        body: `- **Do it yourself.** With few transactions the forms are short. You still need the pro forma 1120 cover, the right Part V entries, a signature, and a fax or mail submission.
- **A formation provider's package.** Check whether it includes the pro forma 1120 and the submission, not only Form 5472.
- **Our service.** The same flat price whatever the activity level, with accountant review and fax delivery included.`,
      },
      {
        heading: "Price",
        body: `A dormant-year filing costs the same as any other year.

- **Standard:** ${STD}, ready in ${STANDARD_TURNAROUND}
- **Express:** ${EXP}, ready within ${EXPRESS_TURNAROUND}
- **Each additional past year:** +${ADD}

See the [pricing page](/pricing).`,
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
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
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
    title: "Final Form 5472 for Dissolved LLC Owners | Form5472 Prep",
    metaDescription:
      "Final Form 5472 for dissolved LLC owners: the short-year pro forma 1120 and Form 5472 with the final-return box checked, prepared and faxed to the IRS.",
    longDescription:
      "Final-year Form 5472 and pro forma Form 1120 for a dissolved foreign-owned US LLC: a short tax year ending on dissolution, the item E final-return box checked, dissolution distributions reported, generally due the 15th day of the 4th month after dissolution (3rd month for a June short year beginning before 2026). Reviewed by a qualified accountant and faxed to the IRS Ogden PIN Unit.",
    h1: "Final Form 5472 for Dissolved LLC Owners",
    shortBlurb: "The last Form 5472 and pro forma 1120 for the short year that ends on dissolution.",
    intro: `A final Form 5472 for dissolved LLC owners closes the federal reporting of a foreign-owned US LLC: one last Form 5472 and pro forma 1120 for the short year that ends on dissolution. **It is generally due by the 15th day of the 4th month after the LLC dissolved. The final-return box on the pro forma 1120 is checked, and money you take out on closing is reportable.**

Closing with the state does not file it for you.`,
    cta: startCta("svc-final-form-5472-for-dissolved-llc"),
    sections: [
      {
        heading: "Preparing the final Form 5472 for dissolved LLC owners",
        body: `The last year is a short tax year that ends on the dissolution date. We prepare:

- the pro forma Form 1120 for that short year, with the final-return box in item E checked,
- Form 5472 reporting the year's transactions, including amounts paid or received on dissolution,
- a Part V supporting statement, and
- a reasonable-cause statement if the final year, or any earlier year, is late.

On closing, the LLC's remaining cash or property normally goes to you. That transfer is a distribution, and the Form 5472 instructions list amounts paid or received in connection with dissolution among the Part V transactions. Money you put in to pay closing costs is reportable too.

The questionnaire asks for the dissolution date and marks the return as final. A qualified accountant reviews the package; you sign online; we fax it to the IRS Ogden PIN Unit and send you the timestamped receipt.`,
      },
      {
        heading: "When the final return is due",
        body: `The Form 1120 instructions say a dissolved corporation must generally file by the 15th day of the 4th month after the date it dissolved. The same rule sets the date for the pro forma 1120 with Form 5472 attached.

- **Example:** an LLC dissolved on 20 March files by 15 July of the same year.
- **June exception:** for a short year ending in June that began before 1 January 2026, the due date is the 15th day of the 3rd month. An LLC dissolved in June 2025 was due on 15 September 2025.
- **Weekends and holidays** move the date to the next business day.
- **Form 7004** can extend the deadline. We do not file Form 7004.

The [deadline calculator](/form-5472-deadline-calculator) works out the exact date from your dissolution date.`,
      },
      {
        heading: "How to close foreign owned US LLC tax filing obligations",
        body: `Closing the LLC with the state and finishing its federal filings are separate steps.

1. **Settle the LLC's money.** Pay its remaining bills and move any balance out. A distribution to you on closing is reportable on the final Form 5472.
2. **Dissolve with the state.** File the dissolution or cancellation document with the state of formation, and check whether an annual report or fee is still due.
3. **File the final Form 5472 and pro forma 1120** for the short year, with the final-return box checked.
4. **Deal with earlier years.** Dissolving the LLC does not file missed years for you.
5. **Keep the records.** Keep the filed package and the fax receipt with your permanent tax records for at least six years.`,
      },
      {
        heading: "What closing the LLC does not do",
        body: `- **It does not remove the final-year filing.** If a required Form 5472 is missed for the final year, the $25,000 penalty under IRC §6038A(d) can apply as in any other year.
- **It does not settle the owner's own taxes.** Any personal US return, such as Form 1040-NR, is separate and outside this service.
- **It does not come with penalty relief.** For late final or earlier years, nobody can promise the IRS will waive penalties; reasonable cause is decided case by case.
- **It is not tax advice.** How and when to close is a question for a tax professional.`,
      },
      {
        heading: "Comparing ways to file the final return",
        body: `- **A formation provider or registered agent.** Some handle the state dissolution. Ask whether the federal final Form 5472 is included.
- **Do it yourself.** Possible. The short-year dates, the final-return box and the dissolution distribution are the details to get right.
- **An accounting firm.** Worth it if the closure involves property, a sale of the business or other tax returns.
- **Our service.** The federal final return only: prepared, reviewed and faxed, with a receipt.`,
      },
      {
        heading: "Price",
        body: `A final-year filing is priced like any other year.

- **Standard:** ${STD}, ready in ${STANDARD_TURNAROUND}
- **Express:** ${EXP}, ready within ${EXPRESS_TURNAROUND}
- **Each additional past year,** if earlier years are missing: +${ADD}

See the [pricing page](/pricing).`,
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
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
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
    lastModified: AUDIENCE_PAGES_ADDED,
    title: "Hire Someone to File Form 5472: Done for You | Form5472 Prep",
    metaDescription:
      "Hire someone to file Form 5472 for your foreign-owned LLC: answer 15 minutes of questions and sign; we prepare, review and fax it to the IRS.",
    longDescription:
      "Done-for-you Form 5472 and pro forma Form 1120 filing for owners of foreign-owned US single-member LLCs who would rather hire someone than file it themselves: the owner answers a 15-minute questionnaire, reviews and signs online; Form5472 Prep prepares the package, has a qualified accountant review it, faxes it to the IRS Ogden PIN Unit and stores the timestamped fax receipt. Flat fee per filing year.",
    h1: "Hire Someone to File Form 5472 for Your Foreign-Owned LLC",
    shortBlurb: "Hand the filing over: what you provide, what we do, and the two things you still do yourself.",
    intro: `If you want to hire someone to file Form 5472, the job splits cleanly in two. **You hand over the facts about your LLC and its money movements, then review and sign; we prepare the Form 5472 and pro forma 1120, have a qualified accountant check them, fax them to the IRS and keep the receipt for you.**

Most owners spend about 15 minutes on their part, with no meeting to book.`,
    cta: startCta("svc-hire-someone-to-file-form-5472"),
    sections: [
      {
        heading: "What you hand over when you hire someone to file Form 5472",
        body: `The questionnaire asks for facts, not forms. Have these ready:

- **The LLC:** legal name, EIN, US address, state of formation and the date it was formed
- **You, as owner:** name, home address, country of residence and your foreign tax ID if you have one
- **Money between you and the LLC:** what you put in, what you took out, any loans, and LLC bills you paid from a personal account
- **What the LLC owned at year end:** its total assets on the last day of the tax year

Not sure whether a payment counts? The [reportable transactions checker](/form-5472-reportable-transactions-checker) answers that for common cases before you start.`,
      },
      {
        heading: "What we do once you hand it over",
        body: `1. **Build the package.** After payment, your answers become a cover letter, the pro forma Form 1120, Form 5472 and a Part V statement.
2. **Check it.** A qualified accountant compares the package with your answers and asks on your filing page if anything is unclear.
3. **Send it for signature.** Signing opens only after the review is approved.
4. **Fax it.** We send the signed package to the IRS Ogden PIN Unit at ${IRS_FAX}.
5. **Hand you the proof.** The timestamped fax receipt is saved on your filing page.`,
      },
      {
        heading: "Timeline and price",
        body: `- **Your time:** about 15 minutes of questions, then a few minutes to review and sign.
- **Standard:** ${STD}, package ready in ${STANDARD_TURNAROUND}.
- **Express:** ${EXP}, package ready within ${EXPRESS_TURNAROUND}.
- **Missed earlier years:** +${ADD} per extra year on either plan, each with its own reasonable-cause statement.

For a calendar-year LLC the filing is due April 15. Full details are on the [pricing page](/pricing).`,
      },
      {
        heading: "What you still do yourself",
        body: `Your part does not disappear entirely:

- **Check your answers.** You know the LLC's money movements; we work only from what you tell us.
- **Review the finished package.** You see the completed forms before anything is sent.
- **Sign it.** The return is the LLC's own, so you or another person authorized for the LLC signs it online. Our staff never sign for you.
- **Keep the record.** Save the package and the fax receipt with the LLC's records.`,
      },
      {
        heading: "What hiring us does not cover, and what nobody can promise",
        body: `- **No tax advice.** We prepare forms from your information; we do not plan your tax position.
- **No other returns.** Form 1065, a full Form 1120 for an LLC taxed as a corporation, Form 1040-NR, state returns, Form 7004 and bookkeeping are outside the service.
- **No promised outcome.** The fax receipt proves what was sent and when, not that the IRS has processed it. For late years, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).`,
      },
    ],
    faqs: [
      {
        q: "Do I need to talk to anyone before you start?",
        a: "No. Everything runs through the online questionnaire and your filing page. If the reviewing accountant needs a detail clarified, the question appears on your filing page and you answer it there.",
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
        a: "The IRS forms are free and you can file them yourself. Hiring us adds preparation from plain-language questions, an accountant review before you sign, the IRS fax and a stored receipt.",
      },
    ],
    related: [],
    serviceType: "Done-for-you Form 5472 and pro forma Form 1120 preparation and IRS fax filing",
    showOffer: true,
    irsSources: [
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
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
    secondaryKeywords: ["who prepares form 5472", "form 5472 tax preparer"],
    category: "annual",
    lastModified: AUDIENCE_PAGES_ADDED,
    title: "Form 5472 Preparer, Reviewed Before You Sign | Form5472 Prep",
    metaDescription:
      "Form 5472 preparer for foreign-owned US LLCs: what a preparer does for Form 5472 and the pro forma 1120, how to choose one, and how our review works.",
    longDescription:
      "What a Form 5472 preparer does for a foreign-owned US single-member LLC: sorting the year's reportable transactions, completing Form 5472, the Part V statement and the pro forma Form 1120 marked \"Foreign-owned U.S. DE\", and getting the package to the IRS by fax or mail. Includes a checklist for choosing a preparer and how Form5472 Prep's qualified-accountant review works before the owner signs online.",
    h1: "A Form 5472 Preparer for Foreign-Owned US LLCs",
    shortBlurb: "What a preparer actually does, a checklist for choosing one, and how our review works.",
    intro: `A Form 5472 preparer turns what you know about your LLC's year into the two IRS forms a foreign-owned single-member LLC files. **The preparer completes Form 5472 and the pro forma Form 1120 it is attached to, checks them and gets them to the IRS; you, as the person authorized for the LLC, review and sign.**

Here is what that work involves, how to choose someone for it, and how we do it.`,
    cta: startCta("svc-form-5472-preparer"),
    sections: [
      {
        heading: "What a Form 5472 preparer actually does",
        body: `The forms are short. The judgement is in what goes on them.

- **Sorts the year's money movements.** Contributions, distributions, loans and owner-paid LLC costs are identified and totalled by type.
- **Completes Form 5472.** Owner details, related-party information, the transaction totals and year-end total assets.
- **Writes the Part V statement.** A plain list of the reportable transactions behind the totals.
- **Completes the pro forma 1120.** Only the identifying items, marked "Foreign-owned U.S. DE", with the income and tax lines left blank.
- **Gets the package to the IRS.** A foreign-owned disregarded entity cannot e-file these forms, so they go by fax or mail.`,
      },
      {
        heading: "How to choose a Form 5472 preparer: a checklist",
        body: `Ask each candidate these questions and get the answers in writing:

- Does the price include the pro forma 1120, or only Form 5472?
- Who checks the package before I sign it?
- Who sends it to the IRS, by what route, and what proof do I get?
- How are missed years handled, and at what price per year?
- What is outside the job: state returns, Form 1040-NR, bookkeeping?
- Who signs? It should be you, or someone authorized for the LLC.

A clear answer to each matters more than a firm's size or location.`,
      },
      {
        heading: "How our review works",
        body: `Every filing is reviewed by a qualified accountant before it is submitted. In practice:

- The package is generated from your questionnaire answers, so the forms and the Part V statement use the same figures.
- The reviewer compares the forms with those answers and checks details that are easy to miss, such as the "Foreign-owned U.S. DE" marking and a matching EIN on both forms.
- If something is unclear, the question appears on your filing page. Nothing moves until it is answered.
- Signing opens only after the review is approved, so you never sign an unchecked package.`,
      },
      {
        heading: "What a preparer cannot do for you",
        body: `- **Sign for the LLC.** The return is signed by the owner or another authorized person. Our staff never sign on a client's behalf.
- **Know facts you have not shared.** A preparer works from your information, and you remain responsible for its accuracy.
- **Promise penalty relief.** If a year is late, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).
- **Replace tax advice.** We prepare and submit forms; we do not advise on tax positions.`,
      },
      {
        heading: "Price and getting started",
        body: `Both plans include the review and the IRS fax. **Standard** is ${STD}, ready in ${STANDARD_TURNAROUND}; **Express** is ${EXP}, ready within ${EXPRESS_TURNAROUND}. Each additional past year adds ${ADD}. See [pricing](/pricing), or start the questionnaire now.`,
      },
    ],
    faqs: [
      {
        q: "Does a Form 5472 preparer need my bank statements?",
        a: "The questionnaire asks for totals by transaction type and year-end total assets. Bank statements are the usual source of those figures, so keep them to hand while you answer.",
      },
      {
        q: "Is the pro forma 1120 prepared too?",
        a: "Yes. A foreign-owned disregarded entity files Form 5472 attached to a pro forma Form 1120, so we prepare, review and fax both as one package.",
      },
      {
        q: "When does the preparer need my information?",
        a: "Early enough to leave time for review and signing before the deadline. For a calendar-year LLC that is April 15; generally it is the 15th day of the 4th month after the tax year ends.",
      },
      {
        q: "Can I use a preparer if I live outside the US?",
        a: "Yes. The questionnaire, review messages, signature and receipt are all online, and the package reaches the IRS by fax, so nothing has to be posted from abroad.",
      },
    ],
    related: [],
    serviceType: "Form 5472 and pro forma Form 1120 preparation with accountant review and IRS fax filing",
    showOffer: true,
    irsSources: [
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
      },
      {
        label: "Instructions for Form 1120 (IRS)",
        url: "https://www.irs.gov/instructions/i1120",
        blurb: "The IRS instructions for Form 1120, the form the pro forma return is based on.",
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
    ],
    category: "partners",
    lastModified: AUDIENCE_PAGES_ADDED,
    title: "Form 5472 for Accountants: We Prepare, You Keep the Client",
    metaDescription:
      "Form 5472 for accountants, tax preparers and CPA firms: refer clients, or run their filings from a partner account while we prepare, review and fax.",
    longDescription:
      "Form 5472 and pro forma Form 1120 filing for accountants, tax preparers, CPA firms and accounting firms that do not want to prepare foreign-owned LLC information returns in-house: refer the client to file directly, start and track client filings from a partner account, or enable white-label delivery so client emails carry the firm's brand. Form5472 Prep prepares each package, has a qualified accountant review it, collects the client's online signature and faxes it to the IRS Ogden PIN Unit with a timestamped receipt.",
    h1: "Form 5472 for Accountants and Tax Preparers",
    shortBlurb: "Hand off Form 5472 work without losing the client: refer, partner or white label.",
    intro: `Form 5472 for accountants is often small, seasonal work that does not fit the rest of the practice. **You can hand the preparation to us and keep the client: refer them to file directly, run their filings from a partner account, or offer the filing under your own brand while we prepare, review and fax each package.**

Whichever route you choose, the client reviews and signs their own return.`,
    cta: { href: "/partners#apply", label: "Apply as a partner" },
    sections: [
      {
        heading: "Form 5472 for accountants: what comes off your desk",
        body: `A foreign-owned single-member LLC files Form 5472 with a pro forma Form 1120 each year. The work is narrow but fiddly. We take on:

- Preparing Form 5472, the pro forma 1120 and the Part V statement from the questionnaire answers
- The accountant review before signing, including any follow-up questions
- Collecting the client's online signature
- Faxing the package to the IRS Ogden PIN Unit and storing the timestamped receipt
- A January reminder for next year's filing`,
      },
      {
        heading: "Refer, partner or white label: three ways to work with us",
        body: `- **Refer the client.** Send them to [start a filing](/start?src=svc-form-5472-for-accountants) themselves. They deal with us directly and you stay out of the paperwork.
- **Partner account.** Start each client's filing from one dashboard. Enter the details yourself or send the client a secure intake link, then follow preparation, signature and fax status in one place.
- **White-label delivery.** For approved partners, on request: client emails go out under your brand name and replies come to your address. See [white label Form 5472 filing](/services/white-label-form-5472-filing) for how it works.

Partner accounts are approved manually, usually within one business day. Details are on the [partner program](/partners) page.`,
      },
      {
        heading: "Outsource Form 5472 preparation without handing over the client",
        body: `Outsourcing usually stalls on one worry: the client meets another firm. The partner account is built around that. Filings sit under your account, you see every status, and with white-label delivery the client sees your brand on their emails.

You keep the wider relationship, such as income-tax returns, state filings or bookkeeping, while the Form 5472 package runs through our process.`,
      },
      {
        heading: "For tax preparers, CPA firms and accounting firms",
        body: `- **Tax preparers** with a handful of foreign-owned LLC clients each spring, who would rather not build a fax workflow for them.
- **CPA firms and accounting firms** with a larger book, where one dashboard and branded client emails save chasing.
- **Solo accountants** who want to say yes to a foreign-owned LLC client without taking on a form they see once a year.`,
      },
      {
        heading: "What we do not take on",
        body: `- **No client advice.** We prepare and submit forms from the information entered.
- **No other returns.** No Form 1065, full Form 1120 for an LLC taxed as a corporation, Form 1040-NR, state returns, Form 7004 or bookkeeping.
- **No signing for the client.** The person authorized for the client LLC signs. Our staff never sign in their place.
- **No promised outcome.** For late years, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).`,
      },
    ],
    faqs: [
      {
        q: "Do I have to become a partner to refer a client?",
        a: "No. A client you refer can start a filing on their own. A partner account is for firms that want to start and track several client filings themselves.",
      },
      {
        q: "What does each client filing cost?",
        a: "Partner filings are paid per filing at the same prices as direct customers, shown on the [pricing page](/pricing). Ask about volume pricing or consolidated invoicing when you apply.",
      },
      {
        q: "Can my firm enter the client's information?",
        a: "Yes. From a partner account you can enter it from records you hold, or send the client a secure link to answer the questions themselves. You can review the answers before the package goes to accountant review.",
      },
      {
        q: "Who signs the client's pro forma 1120 and Form 5472?",
        a: "The person authorized to sign for the client LLC. You send the secure review-and-sign link from your dashboard; they review the completed package and sign online.",
      },
    ],
    related: [],
    serviceType: "Form 5472 preparation and IRS fax filing for accountants, tax preparers and accounting firms",
    showOffer: false,
    irsSources: [
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
      },
      {
        label: "Instructions for Form 5472 (IRS)",
        url: "https://www.irs.gov/instructions/i5472",
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
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
    lastModified: AUDIENCE_PAGES_ADDED,
    title: "Form 5472 for Bookkeepers: Hand Off the Filing",
    metaDescription:
      "Form 5472 for bookkeepers of foreign-owned LLCs: the records to hand over, how the filing handoff works, and how to refer the owner to us.",
    longDescription:
      "Form 5472 handoff for bookkeepers who keep the books for foreign-owned US single-member LLCs: the year's owner contributions, distributions, loans, owner-paid LLC costs and related-company amounts, totalled in US dollars, plus year-end total assets. The owner or a partner account starts the filing; Form5472 Prep prepares Form 5472 and the pro forma 1120, has a qualified accountant review them, collects the owner's online signature and faxes the package to the IRS.",
    h1: "Form 5472 for Bookkeepers: Hand Off the Filing, Keep the Books",
    shortBlurb: "Which records to hand over for a client's Form 5472, and how the filing handoff works.",
    intro: `Form 5472 for bookkeepers starts in the ledger you already keep. **If you keep the books for a foreign-owned US LLC, you hold most of what its Form 5472 needs: the money that moved between the owner and the LLC, and what the LLC owned at year end. Hand those totals over and we prepare, review and fax the filing.**

You keep the books. The owner keeps responsibility for the return and signs it.`,
    cta: { href: "/partners#apply", label: "Apply as a partner" },
    sections: [
      {
        heading: "Form 5472 for bookkeepers: the records to hand over",
        body: `The filing needs totals for the tax year, not the full ledger:

- **Owner contributions:** money or property the owner put in, including LLC bills the owner paid personally, such as state or registered agent fees
- **Owner distributions:** money the owner took out
- **Loans:** amounts lent either way between the owner and the LLC, and repayments
- **Related companies:** payments to or from another company connected to the owner; the [reportable transactions checker](/form-5472-reportable-transactions-checker) shows when these count
- **Year-end total assets:** the balance-sheet total on the last day of the tax year
- **Identity details:** the LLC's name, EIN and address, and the owner's name, address and country

Amounts go on the form in US dollars. The [IRS yearly average exchange rates](/irs-yearly-average-exchange-rates) page converts foreign-currency entries.`,
      },
      {
        heading: "Keep the year-end handoff quick",
        body: `A few ledger habits make the totals quick to pull:

- Keep separate accounts for owner contributions, owner distributions and loans, so each total is one figure.
- Post LLC costs the owner paid from a personal card when they happen, tagged as owner-paid, rather than rebuilding them in January.
- Note the original currency of any foreign-currency entry.
- Close the year early. For a calendar-year LLC the filing is due April 15, and the package still needs review and signature after you hand over.`,
      },
      {
        heading: "How the handoff works",
        body: `1. **You pull the totals.** Take the figures above from the books for the tax year.
2. **The filing is started.** The owner starts it, or you start it from a partner account and either enter the totals or send the owner a secure intake link.
3. **We prepare and review.** The package is generated and a qualified accountant checks it against the answers.
4. **The owner signs.** The person authorized for the LLC reviews the package and signs online.
5. **We fax it.** The package goes to the IRS Ogden PIN Unit and the timestamped receipt is stored on the filing page.`,
      },
      {
        heading: "Refer the owner or open a partner account",
        body: `For one or two clients, refer the owner to [start a filing](/start?src=svc-form-5472-for-bookkeepers) with your totals in hand. If you keep the books for several foreign-owned LLCs, a [partner account](/partners) lets you start and track every client's filing from one dashboard. Firms that want client emails under their own brand can read about [white label Form 5472 filing](/services/white-label-form-5472-filing).`,
      },
      {
        heading: "What we do not take over",
        body: `- **Not your bookkeeping.** We do not keep books, reconcile accounts or prepare financial statements.
- **Not other returns.** No Form 1065, Form 1040-NR, state returns or Form 7004.
- **Not tax advice.** We prepare forms from the figures provided, and the owner remains responsible for their accuracy.
- **Not a promised outcome.** If a year is late, nobody can promise the IRS will not assess the $25,000 penalty under IRC §6038A(d).`,
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
        blurb: "Who must file, what counts as a reportable transaction, how to complete Part V, and where and how to file.",
      },
      {
        label: "About Form 5472 (IRS)",
        url: "https://www.irs.gov/forms-pubs/about-form-5472",
        blurb: "The IRS page for Form 5472, with the current form, its instructions and any later developments.",
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
    services: ["form-5472-filing-service", "form-5472-filing-for-dormant-llc"],
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

export const SERVICES_HUB = {
  title: "Form 5472 Filing Services | Form5472 Prep",
  metaDescription:
    "Form 5472 filing services for foreign-owned US LLCs: annual, late, dormant and final-year filings, IRS fax delivery, white-label for agents, EIN and ITIN.",
  longDescription:
    "Form 5472 and pro forma Form 1120 filing services for foreign-owned US single-member LLCs: annual filings, late (DIIRSP) catch-up filings with reasonable-cause statements, dormant-LLC and final-year filings for dissolved LLCs, IRS Ogden PIN Unit fax delivery with timestamped receipts, white-label filing for formation and registered agents, plus EIN and ITIN application support.",
  h1: "Form 5472 filing services",
  intro:
    "Every service here is built around one federal filing: Form 5472 with a pro forma Form 1120, for a US LLC owned by one foreign person. Each filing is prepared from your answers, reviewed by a qualified accountant before it is submitted, signed online and faxed to the IRS Ogden PIN Unit, with a timestamped receipt. Pick the page that matches your situation.",
} as const;

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
      heading: "Annual Form 5472 filing",
      description: "The yearly Form 5472 and pro forma 1120 for a single-member LLC with one foreign owner.",
      links: servicesIn("annual"),
    },
    {
      heading: "Late, dormant and final-year filings",
      description: "Missed years, years with little or no activity, and the last year before dissolution.",
      links: servicesIn("situations"),
    },
    {
      heading: "For accountants, bookkeepers, formation agents and registered agents",
      description: "Hand off client filings, or file for several client LLCs from one partner account, optionally under your own brand.",
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
];

/** Sitemap rows for the hub and every service page (used by src/app/sitemap.ts). */
export function serviceSitemapEntries(base: string, lastModified: Date) {
  // The hub lists every page, so it changes whenever a page is added.
  const hubModified = new Date(
    Math.max(
      lastModified.getTime(),
      ...SERVICE_PAGES.filter((p) => p.lastModified).map((p) => new Date(`${p.lastModified}T00:00:00Z`).getTime()),
    ),
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
