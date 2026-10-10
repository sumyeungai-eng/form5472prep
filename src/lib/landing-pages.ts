// SEO landing pages — each one targets a specific keyword phrase.
// One page per long-tail query that buyers actually search for.
// All content funnels back to /start.

import { IRS_OGDEN_FAX, IRS_OGDEN_MAIL_ADDRESS } from "@/lib/seo";
import { MULTI_YEAR_ADDON_CENTS, TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

// Our own prices, derived from src/lib/pricing.ts so landing copy can never
// drift from what checkout charges (same pattern as services-pages.ts).
// Competitor prices and IRS penalty amounts stay literal in the copy.
const STD_CENTS = TIERS.standard.priceCents;
const EXP_CENTS = TIERS.express.priceCents;
const PRICE_STD = formatPrice(STD_CENTS);
const PRICE_EXP = formatPrice(EXP_CENTS);
const PRICE_24H = formatPrice(TIERS.priority.priceCents);
const PRICE_ADDON = formatPrice(MULTI_YEAR_ADDON_CENTS);
const PRICE_ADDON_2Y = formatPrice(MULTI_YEAR_ADDON_CENTS * 2);
const PRICE_STD_2Y = formatPrice(STD_CENTS + MULTI_YEAR_ADDON_CENTS);
const PRICE_EXP_2Y = formatPrice(EXP_CENTS + MULTI_YEAR_ADDON_CENTS);
const PRICE_STD_3Y = formatPrice(STD_CENTS + MULTI_YEAR_ADDON_CENTS * 2);
const PRICE_EXP_3Y = formatPrice(EXP_CENTS + MULTI_YEAR_ADDON_CENTS * 2);
const PRICE_24H_2Y = formatPrice(TIERS.priority.priceCents + MULTI_YEAR_ADDON_CENTS);
const PRICE_24H_3Y = formatPrice(TIERS.priority.priceCents + MULTI_YEAR_ADDON_CENTS * 2);
// Plain-language definition of the 24-Hour promise (ready to sign, not filed).
const NOTE_24H = "24-Hour means the reviewed package is ready for you to check and sign within 24 hours of your order.";
// Three single-year Standard filings (one per LLC).
const PRICE_STD_X3 = formatPrice(STD_CENTS * 3);
// One Standard filing plus Delaware's $400 annual LLC tax (a state figure).
const PRICE_STD_PLUS_DE_TAX = formatPrice(STD_CENTS + 40_000);

export type LandingTable = { caption: string; columns: string[]; rows: string[][] };

export type LandingSection = {
  heading: string;
  body: string; // supports double-newline paragraphs
  table?: LandingTable;
};

export type LandingFaq = { q: string; a: string };

export type LandingHowTo = {
  section: string; // exact heading of the process section on this page
  tools?: string[]; // <= 6 words each, only things the page names
  supplies?: string[]; // <= 6 words each, only things the page names
  totalTime?: string; // ISO 8601, only if the page states a duration for THIS process
  cost?: { currency: string; value: string }; // only if the page states a price for THIS process
};

export type LandingPage = {
  slug: string;
  title: string; // <title>
  metaDescription: string;
  h1: string;
  intro: string; // 2-3 sentence answer-up-front for AI snippets
  keyword: string; // primary target phrase
  sections: LandingSection[];
  faqs: LandingFaq[];
  sources?: Array<{ label: string; url: string }>;
  updated?: string; // ISO date YYYY-MM-DD (last reviewed / dateModified)
  published?: string; // ISO date YYYY-MM-DD the page first shipped (datePublished); falls back to `updated`
  relatedSlugs?: string[]; // for internal linking
  // Hide from organic search (noindex + nofollow + excluded from sitemap).
  // Used for paid-ad landing pages where we don't want Google to surface
  // the page organically — only ad clicks should reach it.
  noindex?: boolean;
  // Drives opt-in HowTo JSON-LD and the visible "Before you start" box.
  // See src/lib/landing-howto.ts for derivation rules.
  howTo?: LandingHowTo;
  // When set, the page displays PREMIUM_TIERS pricing and the filing
  // started from this page is billed at premium prices end-to-end. The
  // slug must also be added to PREMIUM_SOURCES in src/lib/pricing.ts.
  pricingMode?: "premium";
  // Overrides the ?src= tag every CTA on the page sends to /start. Default is
  // the page's own slug. Set this when the funnel source has to match an entry
  // in PROMO_SOURCES (src/lib/pricing.ts) rather than the slug — the tag is
  // what decides the price the customer is actually charged, so it must not
  // drift from what the page advertises.
  startSrc?: string;
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "file-form-5472",
    keyword: "how to file form 5472",
    title: "How to File IRS Form 5472 (2026 Step-by-Step Guide)",
    metaDescription:
      "Step-by-step guide to filing IRS Form 5472 with pro forma Form 1120 for foreign-owned US LLCs. Avoid the $25,000 penalty. File online in 15 minutes.",
    sources: [
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: Instructions for Form 1120", url: "https://www.irs.gov/instructions/i1120" },
      { label: "Treas. Reg. §1.6038A-2", url: "https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFRe4c8b1cb2ac9d43/section-1.6038A-2" },
    ],
    published: "2026-05-19",
    updated: "2026-10-07",
    h1: "How to File IRS Form 5472",
    intro:
      `Foreign-owned US single-member LLCs must file Form 5472 with an attached pro forma Form 1120 by April 15 each year. The IRS accepts the annual package by mail or fax to the Ogden PIN Unit at +1-855-887-7737, and our 15-minute online filer starts from ${PRICE_STD}.`,
    howTo: {
      section: "How do you file Form 5472 step by step?",
      supplies: [
        "LLC legal name and EIN",
        "Owner passport details",
        "Year-end financials",
        "Part V supporting statement",
        "Signed pro forma 1120",
      ],
    },
    sections: [
      {
        heading: "Who has to file Form 5472?",
        body: "You must file Form 5472 if all three are true:\n\n1. You own a single-member US LLC (Wyoming, Delaware, New Mexico, Florida, or any state).\n2. You are NOT a US person — meaning you are not a US citizen, green card holder, or US tax resident.\n3. Your LLC had at least one reportable transaction during the year (capital contributions in, distributions out, payments to or from the owner, loans, or any related-party transaction).\n\nEven if your LLC had zero revenue, you still have to file. Capital contributions and distributions count as reportable transactions — and almost every foreign-owned LLC has at least one. The seed money you wired in to open the bank account counts. A reimbursement you took out for a business expense counts. A payment from the LLC to a company you also own counts.\n\nIn practice, every active foreign-owned single-member LLC files Form 5472 every year. The only realistic exception is an LLC that has been totally dormant — no bank account, no money in or out, no contracts signed.",
      },
      {
        heading: "What forms do you actually file?",
        body: "You file Form 5472 by attaching it to a pro forma Form 1120 (US Corporation Income Tax Return) as the cover. The 1120 is \"pro forma,\" meaning you don't fill in most of it. You only complete the entity identification section and stamp \"Foreign-Owned U.S. DE\" across the top of page 1.\n\nThe full package is:\n\n1. Cover letter identifying the filing.\n2. Pro forma Form 1120 with the \"Foreign-Owned U.S. DE\" stamp.\n3. Form 5472 with Parts I, II and III completed, Part IV and Part V as the year's transactions require, and the Part VII questions answered.\n4. Part V supporting statement that lists each reportable transaction in detail.\n5. Reasonable Cause Statement (only if you are filing late under DIIRSP).\n\nMissing any one of these can trigger the $25,000 penalty, even if you've technically \"filed\". The IRS treats incomplete returns the same as missing returns under IRC § 6038A.",
      },
      {
        heading: "How do you file Form 5472 step by step?",
        body: "1. Gather your LLC info: legal name as registered with the state, EIN, US address, date of formation, country of incorporation (US), state of incorporation, NAICS / principal business activity code.\n2. Gather your owner info: full legal name as on passport, foreign tax ID (FTIN) or self-assigned Reference ID, residential address abroad, country of citizenship, country of tax residence, country of organization of any related foreign entities.\n3. Add up year-end financials: capital contributions in, distributions out, total assets at year-end (in USD), and a list of every transaction between the LLC and any related party.\n4. Fill in Form 1120: name, address, item B (EIN) and applicable item E boxes, as the special DE instructions require. Leave income and tax sections blank. Stamp or type \"Foreign-Owned U.S. DE\" across the top margin.\n5. Fill in Form 5472: Part I (the LLC, with line 3 checked as a foreign-owned U.S. DE), Part II (25% foreign shareholder), Part III (related party), Part IV (monetary transactions), Part V (contributions, distributions and other DE transactions), Part VII (additional-information questions every filer answers).\n6. Build the Part V supporting statement: one line per reportable transaction with date, amount, related party, and nature.\n7. Have the authorized person sign the completed pro forma 1120 in ink, then scan that signed page for fax, as a conservative workflow. Form 5472 has no signature block; [electronic-signature rules depend on the document and route](/blog/form-5472-pro-forma-1120-signature).\n8. Fax the complete package to +1-855-887-7737 (IRS Ogden PIN Unit). Keep the fax confirmation receipt — it is your transmission evidence.",
      },
      {
        heading: "What goes on each part of Form 5472?",
        body: "Form 5472 is split by role and transaction type. Part I identifies the LLC, and its line 3 marks a foreign-owned U.S. DE. Parts II and III identify the foreign owner and related party, Parts IV and V report payments, contributions and distributions, and Part VII asks additional yes-or-no questions.\n\nPart II — 25% Foreign Shareholder (lines 4a to 4e): you, the foreign owner. Name and address, US identifying number if any or a reference ID, FTIN, countries where business is conducted, country of citizenship, and countries where you file as a tax resident.\n\nPart III — Related Party (lines 8a to 8g): same as Part II for a single-owner LLC, since you are both the 25%+ shareholder and the related party. For multi-related-party scenarios, you list each one.\n\nPart IV — Monetary Transactions Between Reporting Corporation and Foreign Related Party: dollar amounts of sales, services, rents, royalties, interest, loans, and other payments in each direction.\n\nPart V — Reportable Transactions of a Reporting Corporation That Is a Foreign-Owned U.S. DE: this is where capital contributions, distributions, and most owner-to-LLC payments get reported. Must be backed by a supporting statement.\n\nPart VII — Additional Information: yes-or-no questions every filer answers, starting with whether the LLC imports goods from a foreign related party (line 37). A foreign-owned U.S. DE does not complete lines 43a and 43b. Foreign-owned DE status itself is the Part I, line 3 checkbox.",
      },
      {
        heading: "Can Form 5472 be filed online or e-filed?",
        body: `No, not for a foreign-owned US disregarded entity. The IRS Instructions for Form 5472 (Rev. December 2024) state that a foreign-owned U.S. DE cannot file Form 5472 electronically. It files Form 5472 and the pro forma Form 1120 by fax to the IRS at ${IRS_OGDEN_FAX} or by mail to the dedicated Ogden address.\n\nThe e-file rule is different for other reporting corporations: the instructions tell a corporation that files its income tax return electronically to see that return's instructions for general information about electronic filing. The ban applies to the foreign-owned DE route, which is the single-member LLC case this page covers.\n\n"Filing online" for a foreign-owned LLC therefore means preparing the package online and sending it by fax. Consumer e-file software is not a route for this package. Fax gives you a timestamped transmission receipt to keep with the exact package; certified mail with a return receipt also works but takes longer. See [where to file Form 5472](/form-5472-fax-number) for the fax number and mailing address.`,
      },
      {
        heading: "What does a real Form 5472 filing look like?",
        body: "Mei is a Hong Kong resident who incorporated a Wyoming single-member LLC in 2023 to run a Shopify dropshipping business. The LLC had $84,000 in revenue in 2024, $0 in US-source income (all customers were European), and she paid herself $30,000 in distributions to her HK bank account.\n\nHer filing for tax year 2024:\n\n• Pro forma Form 1120: stamped \"Foreign-Owned U.S. DE\". Entity info filled in. No income or tax fields completed.\n• Form 5472 Part IV: blank, because she had no sales, loans, fees or other Part IV transactions with the LLC.\n• Form 5472 Part V: box checked for the $5,000 capital contribution she wired in at the start of the year to fund inventory and the $30,000 distribution she took.\n• Part V supporting statement: lists both transactions with dates and amounts.\n• Faxed to +1-855-887-7737 by April 15, 2025.\n\nHer total US federal tax owed: $0 (all income was foreign-source from a foreign-owned disregarded entity). Her filing obligation: still mandatory.",
      },
      {
        heading: "What are the most common Form 5472 mistakes?",
        body: "• Filing only Form 5472 without the pro forma 1120 — the IRS will reject this and treat it as not filed.\n• Forgetting to stamp \"Foreign-Owned U.S. DE\" on the 1120.\n• Leaving Part V blank when capital contributions or distributions occurred.\n• Assuming a digital-only signature is authorized merely because faxing is allowed. Ink signing of the completed pro forma cover followed by scanning is a conservative workflow, not an absolute IRS ban on every other method.\n• Filing for the wrong tax year (the package is for the tax year that ended, not the current year).\n• Missing the Part V supporting statement — Part V references it but many DIY filers forget to attach the list.\n• Reporting amounts in a foreign currency — all dollar figures must be in USD using the appropriate exchange rate.\n• Sending to the wrong fax number — only +1-855-887-7737 is the IRS Ogden PIN Unit fax for these filings.",
      },
      {
        heading: "How much does it cost to file?",
        body: `Three ways to do it:\n\n1. DIY with IRS forms: $0 in fees, but the IRS estimates 6 hr 34 min per Form 5472 (3 hr 4 min learning about the form plus 3 hr 30 min preparing and sending it, before recordkeeping), and any mistake risks the $25,000 penalty. You also need a fax service ($2-$5).\n\n2. Hire a US CPA: $400-$800 typical. Most CPAs are unfamiliar with Form 5472 for foreign-owned disregarded entities, so expect them to either decline the work or take 1-3 weeks while they research it.\n\n3. Use Form5472 Prep: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — same filing on every plan. IRS fax delivery included. +${PRICE_ADDON} per additional past year.\n\nEvery package we prepare is reviewed by an accountant on our team before we fax it to the IRS. 100% money-back guarantee if we fail to submit.`,
      },
      {
        heading: "What happens after you file Form 5472?",
        body: "After you file Form 5472, the current instructions do not describe a routine acceptance acknowledgment for the faxed package. Keep the exact submitted package, destination, timestamp, page count, provider receipt and any IRS correspondence together because silence establishes neither delivery nor acceptance.\n\nDo not send a duplicate solely because you have heard nothing. If a notice arrives, follow its instructions and response deadline; a transmission record does not guarantee a penalty will be removed. See [receipt confirmation and next steps](/blog/form-5472-irs-receipt-confirmation-status).",
      },
      {
        heading: "Skip the work — file in 15 minutes",
        body: `Our online filer asks 12 simple questions about your LLC, owner, and year-end totals. We generate the entire package (cover letter, pro forma 1120, Form 5472, Part V supporting statement, reasonable cause statement if late). You sign once on screen — no printing or scanning. An accountant on our team reviews the package end-to-end. Then we fax it to the IRS Ogden PIN Unit and email you the timestamped fax transmission receipt as transmission evidence.\n\nPricing: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — same filing on every plan. IRS fax delivery included. +${PRICE_ADDON} per additional past year. 100% money-back guarantee if we fail to submit your filing.`,
      },
    ],
    faqs: [
      {
        q: "What's the deadline to file Form 5472?",
        a: "April 15 of the year following the tax year (e.g. April 15, 2026 for tax year 2025). You get an automatic 6-month extension to October 15 if you file Form 7004 by April 15. The extension shifts the Form 5472 deadline too, since 5472 is attached to the 1120.",
      },
      {
        q: "What happens if I file late?",
        a: "The IRS automatically assesses a $25,000 penalty per form, per year. If they send a notice and you still don't file within 90 days, another $25,000 is added every 30 days. You can request abatement under DIIRSP by attaching a Reasonable Cause Statement explaining why you missed the deadline.",
      },
      {
        q: "Can a US CPA file Form 5472 for me?",
        a: "Technically yes, but most US-based CPAs see this filing once or twice in their career and aren't comfortable with it. Expect $400-$800 and 1-2 weeks of back-and-forth while they research the requirements. Our service starts at $149, takes 15 minutes, and is accountant-reviewed.",
      },
      {
        q: "Do I need a US ITIN to file?",
        a: "No. Form 5472 accepts either a US ITIN or a foreign tax ID (FTIN). If you don't have a FTIN either (some jurisdictions don't issue them), you can use a self-assigned Reference ID. Our wizard auto-generates one for you if you leave the field blank.",
      },
      {
        q: "What if my LLC had no transactions at all?",
        a: `A truly inactive LLC — no bank account, no money in or out — may not have a reportable transaction. But the bar is low: a single capital contribution to open the bank account counts. If you're unsure, file anyway. A ${PRICE_STD} filing is cheaper than even a small percentage risk of the $25,000 penalty.`,
      },
      {
        q: "Do I file Form 5472 or Form 1120 — or both?",
        a: "Both, together, as one package. The pro forma 1120 acts as the cover document; Form 5472 is the attachment. Neither one alone is a valid filing for a foreign-owned single-member LLC.",
      },
      {
        q: "I own multiple LLCs. Do I file once for all of them?",
        a: "No. Each LLC files its own separate Form 5472 + pro forma 1120. If you own three foreign-owned LLCs, you'll prepare three separate packages and fax three separate filings to the IRS.",
      },
      {
        q: "What about state tax filings?",
        a: "Form 5472 is a federal filing only. State requirements vary: Wyoming has no state income tax and no annual income filing. Delaware charges a $400 franchise tax due June 1 (handled directly via Delaware's website). Florida and Nevada have similar simple franchise/license fees. We handle the federal Form 5472 + 1120; state filings are separate.",
      },
      {
        q: "Is IRS fax delivery included in the price?",
        a: "Yes. IRS fax delivery to +1-855-887-7737 is included with every filing. There is no separate fax fee. You will receive the timestamped fax transmission receipt as transmission evidence.",
      },
      {
        q: "Does someone actually review my filing before it goes to the IRS?",
        a: "Yes. Every package is reviewed by an accountant on our team before we fax it. Nothing goes to the IRS on autopilot. If anything looks off, we'll reach out before submitting.",
      },
    ],
    relatedSlugs: ["form-5472-penalty", "form-5472-instructions", "diirsp", "form-5472-deadline", "form-5472-fax-number"],
  },
  {
    slug: "form-5472-penalty",
    keyword: "form 5472 $25,000 penalty",
    title: "Form 5472 $25,000 Penalty — How to Avoid or Reduce It",
    metaDescription:
      "The Form 5472 penalty is $25,000 under IRC §6038A(d). How to ask the IRS to remove it, what counts as reasonable cause, whether first-time abatement applies, and how to appeal.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRM 20.1.9: International penalties", url: "https://www.irs.gov/irm/part20/irm_20-001-009" },
      { label: "IRM 20.1.1: Penalty relief (incl. 20.1.1.3.3.2.1 First Time Abate)", url: "https://www.irs.gov/irm/part20/irm_20-001-001r" },
      { label: "IRS: Penalty relief", url: "https://www.irs.gov/payments/penalty-relief" },
      { label: "IRS: Penalty relief for reasonable cause", url: "https://www.irs.gov/payments/penalty-relief-for-reasonable-cause" },
      { label: "IRS: Penalty appeal", url: "https://www.irs.gov/appeals/penalty-appeal" },
      { label: "Treas. Reg. §1.6038A-4 (penalties, reasonable cause)", url: "https://www.ecfr.gov/current/title-26/section-1.6038A-4" },
      { label: "IRC §6038A", url: "https://www.law.cornell.edu/uscode/text/26/6038A" },
    ],
    published: "2026-05-19",
    updated: "2026-10-07",
    h1: "The Form 5472 $25,000 Penalty Explained",
    intro:
      "Under IRC §6038A(d), the Form 5472 penalty is $25,000 for each required Form 5472 not filed on time or filed substantially incomplete, plus $25,000 per 30-day period if the failure continues 90 days after an IRS notice. This guide covers how relief works: reasonable cause, first-time abatement and appeals.",
    sections: [
      {
        heading: "What is the Form 5472 penalty?",
        body: "The Form 5472 penalty is $25,000 under IRC §6038A(d) for each failure to file a required Form 5472 when due and in the manner prescribed, or to keep the required records. The IRS instructions say a substantially incomplete Form 5472 counts as a failure to file.\n\nIf the failure continues for more than 90 days after the IRS mails a notice, an additional $25,000 applies for each 30-day period, or part of one, that it continues. The IRS manual says this continuation penalty has no maximum and that the initial penalty is asserted once per related party per tax year (IRM 20.1.9.5.4). For tax years beginning before January 1, 2018, both amounts were $10,000.\n\nThe penalty is for the missing information, not for unpaid tax, so it can apply to an LLC that owes no US income tax. Estimate your own exposure with the [Form 5472 penalty calculator](/form-5472-penalty-calculator).",
      },
      {
        heading: "How is the penalty calculated?",
        body: "$25,000 per Form 5472, per tax year. If you missed 3 years of filing for one LLC, that's $75,000 in initial penalties. If you own multiple LLCs and missed all of them, multiply accordingly: 2 LLCs × 3 missed years = 6 forms × $25,000 = $150,000.\n\nAn LLC with more than one related party files one Form 5472 per related party, and the IRS manual says the initial penalty applies per related party per tax year.",
        table: {
          caption: "Form 5472 penalty amounts and triggers",
          columns: ["Penalty", "Amount", "When it applies"],
          rows: [
            ["Initial penalty", "$25,000", "Per Form 5472, per tax year"],
            ["Continuation penalty", "$25,000", "Each 30-day period after IRS notice"],
            ["Incomplete return", "$25,000", "Incomplete filings treated like not filed"],
          ],
        },
      },
      {
        heading: "What is the continuation penalty?",
        body: "If you receive an IRS notice about a missed Form 5472 and fail to file within 90 days, an additional $25,000 penalty is assessed for each 30-day period (or fraction of) that passes. There is no statutory cap — penalties can stack indefinitely.\n\nExample timeline: Day 0, you miss the April 15 deadline. Day 270, the IRS assesses $25,000 (billed on a CP 215, Notice of Penalty Charge) and mails notice of the failure. Day 360, the 90-day period after that notice ends. From Day 361, each 30-day period or part of one adds $25,000. By Day 540 that is six periods: $25,000 + 6 × $25,000 = $175,000 for that single year if you keep ignoring the notices.\n\nThis is why catching up quickly under DIIRSP — even years late — is dramatically cheaper than waiting for an IRS notice and then dragging your feet.",
      },
      {
        heading: "How do you avoid the penalty entirely?",
        body: `1. File on time — by April 15 of the year following the tax year, or by October 15 if you filed Form 7004 for an extension by April 15.\n2. File completely — Parts I, II, III, IV, V, and VII of Form 5472, plus the pro forma Form 1120 with the \"Foreign-Owned U.S. DE\" stamp, plus the Part V supporting statement.\n3. File by the right method — fax to ${IRS_OGDEN_FAX} or mail to ${IRS_OGDEN_MAIL_ADDRESS}. The IRS instructions say a foreign-owned US DE cannot file Form 5472 electronically.\n4. Keep your fax transmission receipt — it records provider-reported transmission, not IRS acceptance. The current instructions do not describe a routine acceptance acknowledgment for this faxed package.\n5. Use a US address that can actually receive mail in case the IRS sends a notice.`,
      },
      {
        heading: "How do I ask the IRS to remove (abate) a Form 5472 penalty?",
        body: "Follow the instructions on the IRS penalty notice and send a written request showing reasonable cause. Treasury Regulation §1.6038A-4(b) requires an affirmative showing of all the facts in a written statement made under penalties of perjury. The IRS penalty relief page says relief can be requested in writing with Form 843.\n\nWhat the IRS sources say about the request:\n\n• File every missing return first. The IRS manual recommends that reasonable cause not be considered for any year until all delinquent returns have been filed (IRM 20.1.9.5.5).\n• Sign under penalties of perjury. The manual says requests to abate international penalties for reasonable cause should contain that declaration (IRM 20.1.9.1.5).\n• Treat the continuation penalty separately. The manual says the latest date reasonable cause can exist is 90 days after the IRS notice, so there is no reasonable cause exception for the continuation penalty (IRM 20.1.9.5.5).\n• Do not rely on relief for the Form 1120. The manual says relief granted on the related income tax return does not automatically relieve the failure to file the information return (IRM 20.1.9.1.5).\n\nOur [Form 5472 reasonable cause statement](/form-5472-reasonable-cause-statement) guide covers what to put in the statement. If the returns themselves are still missing, our [late Form 5472 filing service](/services/late-form-5472-filing-service) prepares them. No request is guaranteed to succeed.",
      },
      {
        heading: "What counts as reasonable cause?",
        body: "Reasonable cause means you acted in good faith and the failure happened despite ordinary business care and prudence; the IRS decides it case by case. For Form 5472, Treasury Regulation §1.6038A-4(b) says reasonable cause is applied liberally for a small corporation that meets specific conditions.\n\nUnder §1.6038A-4(b)(2)(ii), as summarised in IRM 20.1.9.5.5, that liberal approach applies to a small corporation that:\n\n• had no knowledge of the section 6038A requirements;\n• has limited presence in and contact with the United States;\n• promptly and fully complies with all IRS requests to file Form 5472; and\n• promptly and fully complies with all requests for books and records relevant to the reportable transaction.\n\nThe manual defines a small corporation as one with gross receipts of $20,000,000 or less for the tax year, and notes there is no small-corporation exception from filing Form 5472 itself.\n\nThe manual also lists reasons that are not enough on their own: that a foreign country would penalize disclosure, that a foreign trustee refused to provide information, or that you relied on another person to file the return (IRM 20.1.9.1.5). Whether your facts qualify is for the IRS to decide.",
      },
      {
        heading: "Does first-time abatement apply to Form 5472 penalties?",
        body: "Generally no. The IRS manual (IRM 20.1.1.3.3.2.1) lists Form 5472 among returns where first-time abatement does not apply, because it is an event-based filing. IRM 20.1.9.5.5 gives one narrow exception, tied to first-time abatement of the failure-to-file penalty on the related Form 1120.\n\nThe exception covers the initial penalty the IRS assesses systemically when a late Form 5472 is attached to a late-filed Form 1120. Under IRM 20.1.9.5.5, that penalty may also be abated under first-time abatement when the failure-to-file penalty on the related Form 1120 is abated that way, or would have been eligible but was not assessed because there was $0 tax due or the return was fully paid, and:\n\n• there were no similar Form 5472 penalties in the three prior periods; and\n• the related Form 1120 was not filed late in the three prior periods.\n\nThe manual does not say how this exception applies to a foreign-owned LLC's pro forma Form 1120, so treat it as a question to raise, not a promise. Where it does not apply, the manual says relief is still available if reasonable cause is shown.",
      },
      {
        heading: "How do I appeal a Form 5472 penalty?",
        body: "If the IRS denies your written request to remove the penalty, you may be able to request a conference with the IRS Independent Office of Appeals. The IRS says you generally have 30 days from the date of the rejection letter, and the letter gives the exact deadline.\n\nFor international information return penalties such as this one, the IRS manual says Appeals provides a prepayment, post-assessment appeal process, and an accelerated process for certain international penalties (IRM 20.1.9.1.5). IRS Publication 4576 gives an overview of the penalty appeals process.\n\nThe IRS says to send an explanation of the detailed facts and circumstances with your appeal request. Anyone other than you can discuss the penalty with the IRS only with an authorization such as Form 2848 or Form 8821 (IRM 20.1.9.1.5). An appeal is a review, not a guaranteed result.",
      },
      {
        heading: "How do you get the penalty abated under DIIRSP?",
        body: "If you've already missed filings, the IRS Delinquent International Information Return Submission Procedure (DIIRSP) lets you submit late returns with a Reasonable Cause Statement requesting penalty abatement. The statement must:\n\n• Explain specifically why the form wasn't filed on time.\n• Show that you acted in good faith and exercised ordinary business care and prudence.\n• Describe the circumstances honestly and specifically. The IRS manual says relying on another person to file is not, by itself, reasonable cause.\n• Confirm that you're now filing all delinquent returns concurrently and have taken steps to ensure future compliance.\n\nThe IRS does NOT guarantee abatement. The IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.",
      },
      {
        heading: "What triggers the penalty besides missing the filing deadline?",
        body: "Most foreign LLC owners assume the $25,000 penalty only applies to non-filers. It doesn't. The IRS treats these failures the same way:\n\n• Filing only Form 5472 without the pro forma Form 1120.\n• Filing Form 5472 without the Part V supporting statement when Part V has entries.\n• Filing with substantially incomplete information (e.g. Part IV blank when you took distributions).\n• Filing through a method the IRS doesn't accept (e-file attempts, email, wrong fax number).\n• Filing in the wrong tax year or with the wrong EIN.\n\nA careless DIY filing can trigger the same $25,000 penalty as not filing at all. This is the main reason we have an accountant review every filing on our service before it gets faxed.",
      },
      {
        heading: "What are real-world penalty scenarios?",
        body: "Scenario A — first-time owner, just missed: Carlos (Mexico) formed his Wyoming LLC in 2024 to run an Amazon FBA store. He learned about Form 5472 in May 2025, one month after the deadline. He files immediately under DIIRSP with a reasonable cause statement explaining first-time foreign owner unawareness. No outcome is guaranteed.\n\nScenario B — multi-year catch-up: Mei (Hong Kong) has had a Delaware LLC since 2022 and never filed. In 2026 she discovers the obligation. She files 2022, 2023, 2024, and 2025 together as a single DIIRSP package. No outcome is guaranteed: penalties may still be assessed during processing, and her documented statement is then the basis for responding.\n\nScenario C — ignored an IRS notice: Ahmed (UAE) received a CP 215 in July 2024 for missing tax year 2022 and didn't respond. By 2026 his single-year penalty has stacked to $100,000+ through the 30-day continuation rule. He still needs to file, plus negotiate the assessed penalty — much harder than scenarios A and B.\n\nThe takeaway: act fast. Even multi-year catch-ups are vastly cheaper than waiting for an IRS notice and then delaying.",
        table: {
          caption: "Penalty examples and response paths",
          columns: ["Scenario", "Exposure", "What to do"],
          rows: [
            ["One month late", "Penalty may still be assessed", "File immediately under DIIRSP"],
            ["Four missed years", "Four-year penalty exposure", "File all years together"],
            ["Ignored CP 215", "$100,000+ stacked penalty", "File and negotiate assessed penalty"],
          ],
        },
      },
      {
        heading: "How do you handle the penalty if you can't pay?",
        body: "If the IRS assesses a penalty and you don't qualify for full abatement, you have options:\n\n• Partial abatement: the IRS may waive part of the penalty based on partial reasonable cause.\n• Installment agreement: ask the IRS about paying over time.\n• Offer in Compromise: in cases of genuine financial hardship, the IRS may accept less than the full amount.\n• First-Time Abate (FTA): the IRS manual says it generally does not apply to Form 5472 penalties, apart from the narrow Form 1120-linked exception described above.\n\nNone of these are guaranteed and all are more complex than just filing on time. If you're already in penalty territory, talk to a tax professional or enrolled agent who handles international information returns.",
      },
      {
        heading: "Does the penalty apply to multi-member LLCs?",
        body: "Form 5472 also applies to US corporations that are 25%+ owned by a foreign person, but the filing is different and outside the scope of our service. The $25,000 penalty applies the same way for those filings under IRC § 6038A — but the actual forms include real income and tax calculations, not just a pro forma 1120.\n\nIf your LLC has more than one member, our wizard will flag you out at the pre-flight step. You'll need a CPA familiar with foreign-owned partnerships (Form 8865) or corporations (Form 5472 + full Form 1120). The good news: we handle the most common foreign-owned LLC case (single-member, foreign-owned, disregarded for tax) at flat rates.",
      },
    ],
    faqs: [
      {
        q: "Is the $25,000 penalty per LLC or per year?",
        a: "Both. It's $25,000 per Form 5472 you should have filed — and each LLC files one form per tax year. If you own 2 LLCs and missed 3 years on each, that's 6 forms × $25,000 = $150,000.",
      },
      {
        q: "Is there a deadline to appeal a Form 5472 penalty?",
        a: "The IRS says you generally have 30 days from the date of the letter rejecting your penalty relief request to ask for an Appeals conference. The rejection letter states the exact deadline, so check it as soon as it arrives.",
      },
      {
        q: "Will the IRS waive the penalty automatically?",
        a: "No. You must affirmatively request abatement with a Reasonable Cause Statement filed alongside the late return. The IRS doesn't apply waivers on its own.",
      },
      {
        q: "Has the IRS actually enforced this?",
        a: "Yes. The IRS manual says the penalty may be assessed systemically when a late Form 5472 is attached to a late-filed Form 1120, and examiners can also assert it (IRM 20.1.9.5.3). Treat it as a real exposure, not a paper-tiger penalty.",
      },
      {
        q: "If I file under DIIRSP, am I guaranteed the penalty is waived?",
        a: "No, DIIRSP is not a guarantee. The IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.",
      },
      {
        q: "What's a CP 15 or CP 215 notice?",
        a: "CP 15 is the IRS's Notice of Penalty Charge for penalties assessed on an individual's account. For a Form 5472 penalty assessed on the LLC's business account, the IRS manual (IRM 20.1.9.5.2) names CP 215, Notice of Penalty Charge, which shows the penalty and the tax year. Continuation penalties are tied to the IRS's notice of the failure: they apply if it continues more than 90 days after that notice is mailed. Don't ignore either.",
      },
      {
        q: "How is the penalty different from US income tax?",
        a: "Totally different. Most foreign-owned single-member LLCs owe $0 in US federal income tax (their income is foreign-source). The $25,000 is an information-return penalty under IRC § 6038A — not a tax bill. It's punishment for not filing the disclosure, regardless of whether tax is owed.",
      },
      {
        q: "If I file an extension, does that delay the penalty risk?",
        a: "Yes. Filing Form 7004 by April 15 extends both the 1120 and the attached Form 5472 to October 15. As long as you file by the extended deadline, no penalty. Miss October 15 and you're in the same penalty position as missing April 15 without an extension.",
      },
      {
        q: "Does the IRS apply the penalty to dormant LLCs?",
        a: "Yes, if you had at least one reportable transaction. A truly dormant LLC (no bank account, zero activity) may have an argument that no filing was required — but the bar is very low. Most LLCs with even one wire to fund operations cross it.",
      },
      {
        q: "Can I pay the penalty and skip the filing?",
        a: "No. Paying a CP 215 penalty does not satisfy the filing requirement. You still owe the Form 5472 — and continuation penalties continue to stack until you actually file.",
      },
    ],
    relatedSlugs: ["diirsp", "late-form-5472", "file-form-5472", "form-5472-reasonable-cause-statement", "form-5472-deadline"],
  },
  {
    slug: "diirsp",
    keyword: "DIIRSP filing",
    title: "DIIRSP Filing: Late Form 5472 + Reasonable-Cause Statement",
    metaDescription:
      "DIIRSP helps foreign-owned US LLCs submit late Form 5472 returns with a reasonable cause statement and request penalty relief. Learn the process.",
    sources: [
      { label: "IRS: Delinquent international information return procedures", url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures" },
      { label: "IRS: Penalty relief for reasonable cause", url: "https://www.irs.gov/payments/penalty-relief-for-reasonable-cause" },
      { label: "IRC §6038A", url: "https://www.law.cornell.edu/uscode/text/26/6038A" },
    ],
    published: "2026-05-19",
    updated: "2026-10-05",
    h1: "DIIRSP: How to File a Late Form 5472 with a Reasonable-Cause Statement",
    intro:
      "The IRS Delinquent International Information Return Submission Procedures (DIIRSP) are the IRS's published route for filing missed Form 5472 returns late. You file each late return with a reasonable-cause statement; the IRS may still assess the $25,000-per-form-per-year penalty during processing, and the statement is then the basis for your response.",
    howTo: {
      section: "How does DIIRSP work — step by step?",
      supplies: [
        "Missed tax years",
        "Complete filing package",
        "Reasonable Cause Statement",
      ],
    },
    sections: [
      {
        heading: "What is DIIRSP, really?",
        body: "DIIRSP is the IRS's published route for filing late international information returns such as Form 5472. You file the late returns with a reasonable-cause statement; the IRS may still assess the $25,000 penalty during processing, and you then respond with the reasonable-cause facts.\n\nIt is not amnesty and it is not a guaranteed waiver. The IRS's DIIRSP page tells eligible taxpayers to file the delinquent returns through normal filing procedures; only for Forms 3520 and 3520-A is the reasonable-cause statement considered before a penalty is assessed.\n\nThe IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.",
      },
      {
        heading: "Who qualifies for DIIRSP?",
        body: "DIIRSP is available to any taxpayer who:\n\n• Has not been contacted by the IRS about the specific delinquency yet (no CP 215 notice, no audit letter, no examination opened).\n• Has not been notified that they are under criminal investigation.\n• Is not currently under examination or audit for the tax year in question.\n\nIf the IRS has already sent you a CP 215 notice for the $25,000 penalty, you can still respond — but the path is penalty abatement appeal, not DIIRSP. DIIRSP is preventative; once a notice is issued you're in the formal appeal process.\n\nThe IRS's DIIRSP page lists only two conditions: not under civil examination or criminal investigation, and not already contacted by the IRS about the delinquent returns. Owners who find the missed filings themselves, before any IRS contact, generally meet both.",
      },
      {
        heading: "How does DIIRSP work — step by step?",
        body: "1. List every missed year. If you formed the LLC in 2022 and haven't filed, that's 2022, 2023, 2024.\n2. Prepare the complete filing package for each missed year separately: cover letter, pro forma Form 1120 (with \"Foreign-Owned U.S. DE\" stamp), Form 5472, Part V supporting statement.\n3. Write a single Reasonable Cause Statement that covers all missed years (or one per year if circumstances differ).\n4. Attach the statement to the front of the package.\n5. File all years together — fax the entire set to +1-855-887-7737 (IRS Ogden PIN Unit), or mail certified to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.\n6. Keep the fax transmission receipt. It records the provider’s transmission event and should be retained with the exact package; it does not establish acceptance of a reasonable cause request.\n7. Preserve the record and monitor correspondence. Silence does not establish processing, acceptance or penalty relief.",
        table: {
          caption: "DIIRSP filing requirements in the package",
          columns: ["Requirement", "What it means", "Where it goes"],
          rows: [
            ["Missed years", "Identify every unfiled tax year", "Separate package for each year"],
            ["Complete package", "Cover letter, 1120, 5472, statement", "Prepared for each missed year"],
            ["Reasonable cause", "One statement can cover all years", "Attach to the front"],
            ["Submit together", "File all missed years together", "Ogden PIN Unit fax or mail"],
            ["Receipt records", "Keep provider transmission evidence", "Retain with exact package"],
          ],
        },
      },
      {
        heading: "What makes a good Reasonable Cause Statement?",
        body: "The IRS evaluates whether you acted with \"ordinary business care and prudence.\" Strong statements include:\n\n• A clear timeline of when and how you became aware of the filing requirement.\n• Specific personal circumstances — first-time foreign LLC owner, language barrier, the LLC was formed as part of a Stripe Atlas / startup accelerator package and the filing wasn't part of the onboarding, etc.\n• If an adviser was involved, give the facts of that advice: what you asked, what information you gave them and what they told you. The IRS manual says relying on someone else to file is generally not reasonable cause, because the filing duty cannot be delegated (IRM 20.1.1.3.2.2.5), and reliance on a tax advisor's advice helps only in limited cases involving a technical or complicated substantive issue (IRM 20.1.1.3.3.4.3).\n• Evidence you took corrective action immediately upon learning (and how soon — \"I learned in March 2026 and am filing in April 2026\" is much stronger than \"I learned in 2024 and am filing now\").\n• Explicit confirmation that no US tax is owed and that this is purely an information-return delinquency.\n• A statement that you will comply going forward, ideally citing the system you've put in place (e.g. annual filing reminder, signed up for an annual filing service).\n• Concise — typically 1-2 pages.\n\nGeneric statements like \"I didn't know\" are weak. Specific, factual statements tied to your real circumstances work.\n\nFor a sample structure and what to include, see our [Form 5472 reasonable cause statement](/form-5472-reasonable-cause-statement) guide.",
      },
      {
        heading: "What weakens a Reasonable Cause Statement?",
        body: "Things that hurt your DIIRSP case:\n\n• Vague excuses (\"I was busy\", \"I forgot\", \"my CPA didn't tell me\" without further detail).\n• Statements that contradict facts visible on the form (e.g. claiming you didn't know about US filing obligations while reporting years of US-source revenue).\n• Boilerplate copied from forums or generic templates with no facts unique to your situation.\n• Aggressive language toward the IRS.\n• Implying tax avoidance was a motive.\n• Missing or contradictory dates in the timeline.\n• Claims of reliance on a professional without naming when you consulted them or what they advised.\n• Filing under DIIRSP when you have unpaid US tax (use Streamlined Filing Compliance Procedures or a different path instead).",
      },
      {
        heading: "How do you handle multi-year DIIRSP filings?",
        body: `If you've missed 2 or 3+ years, file them all at once, with a Reasonable Cause Statement attached to each late year's return. The IRS manual recommends that reasonable cause not be considered for any year until all delinquent returns have been filed, so one catch-up beats filings spaced out over time.\n\nOur flat-rate DIIRSP catch-up packages:\n\n• 2-year DIIRSP catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3-year DIIRSP catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\nThe per-year price is cheaper than filing separately, and each year's reasonable cause statement tells the same consistent story. Every package is reviewed by an accountant on our team before we fax it to the IRS.\n\nFor 4+ missed years, you'd run two packages back-to-back or message us to coordinate — the IRS still accepts the comprehensive catch-up approach but the multi-year package limit is 3 years per wizard session.`,
      },
      {
        heading: "How do DIIRSP, Streamlined, and Quiet Disclosure differ?",
        body: "Three commonly confused IRS catch-up paths:\n\n• DIIRSP — for delinquent international information returns such as Form 5472, when you are not under IRS examination or investigation and have not been contacted about the missing returns. A reasonable cause statement may be attached to each late return.\n\n• Streamlined Filing Compliance Procedures — for US persons (citizens, green-card holders) with delinquent FBAR or income-tax filings. Requires a Streamlined Certification and is more complex. Almost never the right path for a foreign-owned US LLC with $0 US tax.\n\n• Quiet disclosure — informal term for filing late without explanation. Strongly discouraged. The IRS often assesses penalties anyway and there's no documented good-faith effort to abate.\n\nFor a foreign-owned single-member LLC that the IRS has not yet contacted, DIIRSP is the usual route.",
      },
      {
        heading: "What happens after you file under DIIRSP?",
        body: "After a DIIRSP filing, the current Form 5472 instructions do not describe a routine acceptance acknowledgment for this faxed package. Keep the exact submitted package, destination, timestamp, page count, provider receipt and IRS correspondence because silence does not establish processing, acceptance or penalty relief.\n\nDo not send a duplicate solely because you have heard nothing. If a notice arrives, follow its instructions and response deadline; a transmission record does not guarantee a penalty will be removed. See receipt confirmation and next steps.",
      },
      {
        heading: "What should you NOT do under DIIRSP?",
        body: "• Do not pay any penalty before you file under DIIRSP — there's nothing to pay until the IRS assesses something.\n\n• Do not split missed years across multiple filings over months. File them all at once.\n\n• Do not submit only Form 5472 without the pro forma 1120 and supporting statement — incomplete filings can be treated as not filed and the DIIRSP request rejected.\n\n• Do not write a reasonable cause statement that admits negligence or implies tax avoidance. Frame the failure around specific facts: when and how you learned of the requirement, and what you did next.\n\n• Do not assume amending an existing late return will reset the DIIRSP clock — amendments don't qualify as initial DIIRSP submissions if you previously filed late without one.\n\n• Do not assume a signature platform establishes permission for this filing route. Form 5472 has no signature block; ink signing of the completed pro forma 1120 followed by scanning is a conservative workflow. Review signing authority separately.",
      },
      {
        heading: "Catch up with our accountant-reviewed DIIRSP filer",
        body: `Form5472 Prep automatically generates a Reasonable Cause Statement when you select 2 or 3 missed years in our wizard. The narrative is tailored to the most common DIIRSP scenario — first-time foreign LLC owner who was unaware of the Form 5472 obligation — and you can edit it to fit your specific circumstances.\n\nWe prepare the complete package for each year (cover letter, pro forma 1120, Form 5472, Part V supporting statement, reasonable cause statement). You sign once on screen — that signature embeds into every required signature box automatically. An accountant on our team reviews everything end-to-end. We fax to the IRS Ogden PIN Unit and email you the timestamped receipt for each year as transmission evidence.\n\n• 2-year DIIRSP catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3-year DIIRSP catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\n100% money-back guarantee if we fail to submit.`,
      },
    ],
    faqs: [
      {
        q: "Does DIIRSP guarantee my penalty is waived?",
        a: "No. DIIRSP is the IRS's published route for filing late international information returns, not a guaranteed waiver. The IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.",
      },
      {
        q: "How long after a DIIRSP filing will I hear back?",
        a: "No filing-specific response timetable was verified in the current official guidance. Silence does not show that reasonable cause was accepted or a penalty waived. Keep the complete package and transmission evidence, and act on any IRS correspondence.",
      },
      {
        q: "Can I do DIIRSP myself?",
        a: "Yes. The hardest part is writing a strong Reasonable Cause Statement tied to your specific facts. Our service auto-generates one based on the most common DIIRSP scenario, and you can edit it in the wizard.",
      },
      {
        q: "I missed 5 years — can I still file under DIIRSP?",
        a: "Yes. There's no statutory limit on how many years you can catch up under DIIRSP. Our wizard supports up to 3 years per session; for 4+ missed years run two packages back-to-back or message us and we'll coordinate.",
      },
      {
        q: "I already got a CP 215 notice — is DIIRSP still an option?",
        a: "Not for that specific year — once the IRS has assessed a penalty, you're past the DIIRSP eligibility window for that year. You'd respond to the notice with a penalty abatement request and appeal if denied. For any other unfiled years where you haven't been contacted, DIIRSP is still available.",
      },
      {
        q: "Do I need a lawyer for DIIRSP?",
        a: "Almost never. DIIRSP is a paperwork process: prepare the late returns, write a reasonable cause statement, send it in. A lawyer adds value only if you're facing collection action, criminal exposure, or unusual circumstances. For a standard first-time foreign LLC catch-up, the wizard handles it.",
      },
      {
        q: "What's the difference between DIIRSP and just filing late?",
        a: "DIIRSP is the IRS's published procedure for filing late international information returns, and it lets you attach a reasonable-cause statement to each late return. Filing late with no explanation (a quiet disclosure) leaves nothing on record. Either way, the IRS's DIIRSP page says penalties may be assessed during processing without considering the statement, and you then respond to the notice with your reasonable-cause facts.",
      },
      {
        q: "Can DIIRSP cover both Form 5472 and other international returns at the same time?",
        a: "Yes. DIIRSP covers all international information returns (5471, 5472, 8865, 8938). If your foreign-owned LLC has additional reporting obligations (rare for single-member disregarded entities), you'd include them in the same package.",
      },
      {
        q: "Does the IRS publish DIIRSP acceptance statistics?",
        a: "No. The IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.",
      },
      {
        q: "If accepted, do I still need to file in future years?",
        a: "Yes. DIIRSP only addresses past delinquencies. From the year of catch-up onward, you must file Form 5472 + pro forma 1120 every year by April 15. Most of our DIIRSP customers come back annually for their on-time filing.",
      },
    ],
    relatedSlugs: ["form-5472-penalty", "late-form-5472", "file-form-5472", "form-5472-reasonable-cause-statement", "form-5472-deadline"],
  },
  {
    slug: "form-5472-instructions",
    keyword: "form 5472 instructions",
    title: "Form 5472 Instructions (2026) — Plain-English Walkthrough",
    metaDescription:
      "Form 5472 instructions (Rev. December 2024) in plain English for foreign-owned US LLCs: what to enter in each part, common mistakes, and how to file the package.",
    sources: [
      { label: "IRS: Instructions for Form 5472 (Rev. December 2024)", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: About Form 5472 (current revision)", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "Treas. Reg. §1.6038A-2", url: "https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFRe4c8b1cb2ac9d43/section-1.6038A-2" },
    ],
    published: "2026-05-19",
    updated: "2026-10-07",
    h1: "Form 5472 Instructions: Plain-English Walkthrough",
    intro:
      "This guide walks through the IRS Instructions for Form 5472 (Rev. December 2024), the current revision on IRS.gov, in plain English. It explains what each part means for a foreign-owned US single-member LLC, what to enter, the mistakes that can trigger the $25,000 penalty, and how to assemble a complete filing package.",
    sections: [
      {
        heading: "Which Form 5472 instructions apply to tax year 2025?",
        body: "As of October 2026, IRS.gov lists the Instructions for Form 5472 (Rev. December 2024) as the current revision, for use with the December 2023 revision of Form 5472. Unless the IRS posts a newer revision, those are the versions for tax year 2025 returns filed in 2026.\n\nThe What's New section of the December 2024 revision has one change: the joint-return exception in the definition of foreign person now cites Code sections 6013(g) and (h). The rules a foreign-owned US disregarded entity relies on — the pro forma Form 1120, the dedicated fax and mailing route, and no e-filing — sit under When and Where To File.\n\nTo see the instructions applied to a filled-in return, look at our [Form 5472 example](/form-5472-example).",
      },
      {
        heading: "What's on this page?",
        body: "This walkthrough follows the IRS form from top to bottom, one part at a time, for a foreign-owned US single-member LLC.\n\n• [What to gather before you start](/form-5472-instructions#what-do-you-need-to-gather-before-you-start): EIN letter, NAICS code, FTIN or Reference ID.\n• [The top of the form](/form-5472-instructions#what-goes-at-the-top-of-form-5472): the tax year's beginning and ending dates.\n• [Part I](/form-5472-instructions#what-goes-in-part-i-of-form-5472): the reporting LLC.\n• [Part II](/form-5472-instructions#what-goes-in-part-ii-of-form-5472): the 25% foreign shareholder.\n• [Part III](/form-5472-instructions#what-goes-in-part-iii-of-form-5472): the related party.\n• [Part IV](/form-5472-instructions#what-goes-in-part-iv-of-form-5472): monetary transactions.\n• [Part V](/form-5472-instructions#what-goes-in-part-v-of-form-5472): contributions, distributions and other DE transactions.\n• [Part VII](/form-5472-instructions#what-goes-in-part-vii-of-form-5472): additional information.\n• [Signing the package](/form-5472-instructions#how-do-you-sign-the-form-5472-package): the Form 1120 signature block.\n• [Common mistakes](/form-5472-instructions#what-are-the-common-mistakes-that-trigger-penalties) that create penalty exposure.",
      },
      {
        heading: "What do you need to gather before you start?",
        body: "You need your LLC CP-575, formation details, NAICS code, year-end assets, reportable transactions, FTIN or Reference ID, address, citizenship, and tax-residence countries before you start.\n\n• Your LLC's CP-575 EIN confirmation letter from the IRS (gives you the legal name, EIN, and US address exactly as the IRS has them).\n• Your LLC's date of formation and state of formation.\n• A NAICS principal business activity code (look up at naics.com).\n• Total assets at year-end in USD.\n• A list of every reportable transaction during the year — capital contributions in, distributions out, payments to/from you, loans, anything between the LLC and you or any related party.\n• Your foreign tax ID (FTIN) from your country of residence, OR a self-assigned Reference ID if you don't have a FTIN.\n• Your residential address in your home country.\n• Country of citizenship and country of tax residence.\n\nIf you're missing the CP-575, look in your email — the IRS sends a digital copy with the EIN. If you applied via SS-4 fax, the CP-575 was the response document.",
      },
      {
        heading: "What goes at the top of Form 5472?",
        body: "The top of Form 5472 records only the reporting corporation's tax year, as beginning and ending dates, with a note to enter information in English and money in US dollars. The number of Forms 5472 and the payment totals are not above Part I; they are Part I lines 1f, 1g and 1h.\n\nAbove Part I:\n\n• Tax year — the year that ENDED, not the year you're filing in. A 2024 return is for calendar year 2024 even though you file it in 2025.\n• Calendar-year LLC: beginning January 1 and ending December 31 of that year. A foreign-owned DE uses its owner's US tax year or, if the owner has none, the calendar year.\n• Fiscal-year LLC: enter the actual beginning and ending dates.\n\nIn Part I, line 1f is the total of the payments reported on this Form 5472 (Parts IV and VI and, for a foreign-owned DE, Part V), line 1g is the number of Forms 5472 filed for the year, and line 1h is the total across all of them.\n\nWrite \"Foreign-owned U.S. DE\" across the top of the attached Form 1120, as the Form 5472 instructions direct.",
      },
      {
        heading: "What goes in Part I of Form 5472?",
        body: "Part I identifies the reporting LLC, its business activity, year-end assets, form count and reportable payment totals. Follow the labels on the current IRS form rather than copying field numbers from a different revision. Keep the LLC's information separate from the foreign owner's details in Part II.\n\nForm 5472 asks for total assets. The special pro forma Form 1120 instruction limits its required cover information to name, address and items B and E; that does not by itself settle the asset entry on Form 5472. Determine and document the LLC's year-end book assets, distinguishing this calculation from the limited cover-field rule.\n\nKeep the dollar amount reported on one Form 5472 separate from the combined amount across all Forms 5472 and from the number of forms. Reconcile reportable transactions with Parts IV, V and VI as applicable, without counting a transaction twice.",
        table: {
          caption: "Form 5472 parts for foreign-owned LLCs",
          columns: ["Part", "What it reports", "Foreign-owned single-member LLC entry"],
          rows: [
            ["Part I", "Reporting LLC, payment totals, FDE checkbox", "LLC details; check line 3"],
            ["Part II", "The 25% foreign shareholder", "You, the foreign owner"],
            ["Part III", "The related party", "Usually mirrors Part II"],
            ["Part IV", "Monetary transaction categories", "Often blank for small LLCs"],
            ["Part V", "Capital contributions and distributions", "Attach a supporting statement"],
            ["Part VII", "Additional information questions", "Answer each; skip lines 43a-43b"],
          ],
        },
      },
      {
        heading: "What goes in Part II of Form 5472?",
        body: "This is YOU — the foreign owner. For a single-member LLC owned by one individual, the foreign shareholder is yourself.\n\n• Line 4a: Your full legal name and your residential address abroad.\n• Line 4b(1): US identifying number if you have one (SSN or ITIN). Leave blank if you don't — most foreign owners don't.\n• Line 4b(2): Reference ID number — required only if line 4b(1) is blank. Self-assigned, alphanumeric with no spaces or special characters, at most 50 characters, and used consistently every year. Our wizard auto-generates one if you don't pick your own.\n• Line 4b(3): Foreign taxpayer identification number (FTIN) from your country of residence. A foreign-owned DE enters \"None\" or \"N/A\" if there is no FTIN.\n• Line 4c: Principal country or countries where you conduct business.\n• Line 4d: Country of citizenship (or, for an entity owner, organization or incorporation).\n• Line 4e: Country or countries where you file an income tax return as a resident.\n\nLines 5a to 7e cover a second direct owner and ultimate indirect owners; they stay blank when one individual owns the LLC directly.",
      },
      {
        heading: "What goes in Part III of Form 5472?",
        body: "Part III identifies WHO is on the other side of the transactions reported on Parts IV and V. For most single-member LLCs owned by one individual, Part III mirrors Part II — you're both the 25%+ shareholder AND the related party.\n\nFill it identically to Part II. If you have multiple related parties (e.g. you also own a foreign corporation that transacted with the LLC), you'd file a separate Form 5472 for each related party.",
      },
      {
        heading: "What goes in Part IV of Form 5472?",
        body: "Part IV reports dollar amounts of transactions between the LLC and the foreign related party (you). It splits them into amounts received and amounts paid.\n\n• Lines 9-21: amounts the LLC received from the related party, such as sales of inventory or other property, rents, royalties, intangible property, services, commissions, amounts borrowed (line 17) and interest.\n• Line 22: total received.\n• Lines 23-35: the same categories for amounts the LLC paid to the related party, including services (line 29), amounts loaned (line 31) and interest paid (line 32).\n• Line 36: total paid.\n\nFor most foreign-owned single-member LLCs, Part IV is blank or has just one or two lines filled in. Most owner-to-LLC money movement is capital contribution/distribution territory — which belongs on Part V, not Part IV.",
      },
      {
        heading: "What goes in Part V of Form 5472?",
        body: "This is THE critical section for foreign-owned single-member LLCs. It's where you report:\n\n• Capital contributions you made to the LLC during the year (money you wired in).\n• Distributions the LLC made to you during the year (money you took out).\n• Other amounts paid or received between you and the LLC that aren't already on Part IV.\n\nFor each transaction:\n\n• Type: Contribution / Distribution / Other.\n• Date: actual date the transaction occurred.\n• Amount: USD value.\n\nCheck the Part V box and attach a statement listing each transaction. Part I line 1f includes the Part V total along with any Part IV and Part VI amounts, and line 1h totals line 1f across all Forms 5472 filed for the year.\n\nThis is the box where the IRS is mostly looking. If you skip Part V or leave it blank when you had contributions or distributions, the filing is incomplete and triggers the $25,000 penalty.",
      },
      {
        heading: "What goes in Part VII of Form 5472?",
        body: "Part VII applies to every filer, so answer its yes-or-no questions rather than skipping them:\n\n• Line 37: does the LLC import goods from a foreign related party? Lines 38a-38c follow only if Yes.\n• Line 39: was the foreign parent corporation a participant in a cost sharing arrangement?\n• Lines 40a-40b: interest or royalties disallowed under section 267A.\n• Lines 41a-41d: any FDII deduction for transactions with the related party.\n• Lines 42a-42b: related-party loans under the safe-haven interest rate rules.\n• Lines 43a-43b: not completed by a foreign-owned U.S. DE.\n\nForeign-owned DE status is not a Part VII entry; it is the checkbox on Part I, line 3. If any answer is Yes (for example a related-party loan or cost sharing), get a tax professional involved.",
      },
      {
        heading: "How do you sign the Form 5472 package?",
        body: "Sign the Form 5472 package through the Form 1120 page 1 signature block, not on Form 5472 itself. That block has separate officer signature, date, title and paid-preparer fields, and a conservative workflow is ink signing the completed cover before faxing.\n\nThe special pro forma instruction does not separately address signatures. A conservative workflow is to have the authorized person sign the completed cover in ink, enter the actual signing date and capacity, and scan that signed page for fax. This is a recommendation, not a ruling that every digital-only signature invalidates a filing.\n\nIRS electronic-signature permission depends on the document and route. Corporate e-file authorization rules do not automatically cover this DE fax package. Ask the preparer to establish signing authority and the applicable method; the general Form 1120 instructions separately address paid preparers. See the current signature guide.",
      },
      {
        heading: "What are the common mistakes that trigger penalties?",
        body: "• Forgetting to attach pro forma Form 1120 — Form 5472 by itself isn't a valid filing.\n• Forgetting the Part V supporting statement when Part V has entries.\n• Mismatching Line 1f / 1h totals with the Part IV / Part V details.\n• Missing the April 15 deadline without filing Form 7004 for an extension.\n• Filing by email or trying to e-file — neither method is accepted by the IRS for these forms.\n• Sending to the wrong fax number — only +1-855-887-7737 (IRS Ogden PIN Unit) is correct.\n• Using a US address on Part I that can't receive mail (some virtual mailboxes return-to-sender IRS letters).\n• Filing in the wrong tax year (the form is for the tax year that ENDED, not the year you're sending it in).\n• Reporting amounts in your home currency instead of USD using a documented exchange rate.\n\nMaterial filing failures can create $25,000 penalty exposure under IRC § 6038A; not every imperfection automatically invalidates a filing.",
      },
    ],
    faqs: [
      {
        q: "Do I need a US address to file Form 5472?",
        a: "Your LLC needs a US address (your registered agent's address works fine). Your personal address goes in Part II as your foreign residential address. The US address on Part I is where the IRS will mail any notices, so make sure it can actually receive mail.",
      },
      {
        q: "What's an FTIN if my country doesn't issue tax IDs?",
        a: "Write 'NOT LEGALLY REQUIRED' in the FTIN box. The IRS accepts this for residents of countries without tax ID systems (some Gulf states, BVI, Cayman, etc.). You'd then provide a Reference ID instead.",
      },
      {
        q: "Do I need to attach financial statements?",
        a: "No. Only the Part V supporting statement listing each reportable transaction is required. The IRS doesn't ask for a balance sheet, P&L, or bank statements with Form 5472.",
      },
      {
        q: "What if I made a mistake on a prior year's Form 5472?",
        a: "Review the actual filed package and determine whether a correction is needed. Neither current Form 1120 nor Form 5472 has an amended-return checkbox. When a corrected package is appropriate, clearly identify it with an amended notation and an explanation linking it to the original filing; this is a preparer workflow, not a prescribed special IRS amendment procedure. A correction does not guarantee penalty relief.",
      },
      {
        q: "What NAICS code should I use?",
        a: "The code that best matches your LLC's primary business activity. Common ones: 454110 (e-commerce / online retail), 541510 (computer systems design / SaaS), 541613 (marketing consulting), 423990 (other wholesale). Look up specifics at naics.com.",
      },
      {
        q: "Can I use my own signature instead of printing and signing?",
        a: "Do not assume a generic e-signature tool is approved for this filing. The special DE package uses fax or mail, not ordinary corporate e-file. Signing the completed pro forma 1120 in ink and scanning it for fax is a conservative workflow; see signature methods and their limits.",
      },
      {
        q: "How do I report a loan from me to the LLC?",
        a: "Capital contributions and loans look similar on Form 5472. If you formally documented the transaction as a loan with repayment terms, report the balance on Part IV line 17 (amounts borrowed) and any interest the LLC pays you on line 32. If undocumented or informal, report as a Part V capital contribution.",
      },
      {
        q: "What if I'm not sure which transactions are reportable?",
        a: "Reportable is broad — capital in, distributions out, any payment between you and the LLC, any loan, any related-party transaction. Err on the side of including. Reporting an extra transaction has no penalty; missing one can.",
      },
      {
        q: "Do I report transactions in USD or my home currency?",
        a: "USD only. Convert each transaction at the prevailing exchange rate on the date of the transaction. For simplicity, many filers use the annual average rate published by the IRS for the tax year — also acceptable.",
      },
      {
        q: "Where can I get help filling in the form?",
        a: `Use our wizard — it asks 12 simple questions and generates the complete package (cover letter, pro forma 1120, Form 5472, Part V supporting statement). Every filing is reviewed by an accountant on our team before we fax it to the IRS Ogden PIN Unit. From ${PRICE_STD} (IRS fax delivery included).`,
      },
    ],
    relatedSlugs: ["file-form-5472", "pro-forma-1120", "form-5472-vs-1120", "irs-form-5472", "form-5472-fax-number"],
  },
  {
    slug: "foreign-owned-llc-tax",
    keyword: "foreign owned LLC tax filing",
    title: "Foreign-Owned US LLC Tax Filing Requirements (2026 Guide)",
    metaDescription: "Separate Form 5472 and pro forma Form 1120 from personal tax, state filings, FBAR, ITIN and sales tax duties for a foreign-owned U.S. LLC.",
    sources: [
      {
        label: "IRS: Instructions for Form 5472",
        url: "https://www.irs.gov/instructions/i5472"
      },
      {
        label: "IRS: Instructions for Form 1065 (LLC classification)",
        url: "https://www.irs.gov/instructions/i1065"
      },
      {
        label: "IRS: Nonresident aliens",
        url: "https://www.irs.gov/individuals/international-taxpayers/nonresident-aliens"
      },
      {
        label: "IRS: FBAR requirements",
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar"
      },
      {
        label: "IRS: Form 8938 and FBAR compared",
        url: "https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements"
      },
      {
        label: "IRS: Instructions for Form W-7",
        url: "https://www.irs.gov/instructions/iw7"
      },
      {
        label: "FinCEN: Beneficial ownership information",
        url: "https://www.fincen.gov/boi"
      }
    ],
    published: "2026-05-19",
    updated: "2026-10-07",
    h1: "Foreign-Owned US LLC Tax Filing Requirements",
    intro: "A foreign-owned U.S. single-member LLC treated as a disregarded entity generally files Form 5472 with pro forma Form 1120 when it has reportable related-party transactions. Zero revenue does not remove that test. Personal income tax, state obligations, foreign-account reporting and tax IDs need separate checks; one federal information return does not establish complete compliance.",
    sections: [
      {
        heading: "Does a non-resident's US LLC file a tax return?",
        body: "Usually yes, but not an ordinary income tax return. The IRS Form 5472 instructions say a foreign-owned US disregarded entity has no income tax return filing requirement, yet must file a pro forma Form 1120 with Form 5472 attached, by the Form 1120 due date including extensions, when it has reportable transactions.\n\nThat rule covers a US LLC wholly owned by one foreign person that has not elected corporate tax treatment. The Form 1065 instructions say a domestic LLC with at least two members that does not file Form 8832 is classified as a partnership, so a multi-member LLC follows partnership filing rules instead. An LLC that elected corporate treatment files its own Form 1120.\n\nWhether you, the owner, must also file a personal US return is a separate question that depends on the LLC's activity and income; see [does a foreign-owned LLC pay US tax](/blog/does-foreign-owned-llc-pay-us-tax)."
      },
      {
        heading: "What does a foreign-owned single-member LLC file each year?",
        body: "Each year it has a reportable transaction, a foreign-owned single-member LLC files Form 5472 attached to a pro forma Form 1120. The IRS requires only the LLC's name and address and items B and E on page 1 of the Form 1120, with “Foreign-owned U.S. DE” written across the top.\n\nThe IRS says a foreign-owned U.S. DE cannot file Form 5472 electronically, so the package goes by fax or mail to the dedicated IRS address; see [where to file Form 5472](/form-5472-fax-number). It is due by the Form 1120 due date, April 15 for a calendar-year LLC, or later with a timely Form 7004 extension. Check signing authority separately, and read the [filing checklist](/blog/foreign-owned-llc-filing-requirements-checklist) for the preparation sequence.\n\nDo not confuse the Form 7004 extension with the automatic FBAR extension. Form 5472 is one federal information return; the sections below cover the other obligations to check."
      },
      {
        heading: "Do you owe US federal income tax?",
        body: "Form 5472 does not decide whether you owe U.S. federal income tax because it reports transactions, not owner income. The answer depends on U.S. trade or business activity, income source, withholding, treaty provisions and other facts, including where services are performed.\n\nServices performed abroad may have a different result from services performed in the U.S. Royalties, inventory sales, real estate and employees require their own analysis. The customer's address, payment currency or U.S. LLC registration alone does not settle all of these questions.\n\nUse [the LLC income-tax guide](/blog/does-foreign-owned-llc-pay-us-tax) to identify the questions, and obtain qualified advice for an uncertain position. Do not assume Form 5472 is the only required filing because there is no tax shown on that form."
      },
      {
        heading: "What are the state tax filings by state?",
        body: "Check both where the LLC was formed and where it does business, holds property or creates other state connections. State registration reports, franchise or entity taxes, income taxes and sales taxes are different obligations. There is no universal rule that every state requires the same annual report.\n\nStart with the relevant guide, then verify the current requirement directly with the state:\n• [Wyoming](/blog/wyoming-llc-foreign-owner-tax-filing)\n• [Delaware](/blog/delaware-llc-foreign-owner-tax-filing)\n• [New Mexico](/blog/new-mexico-llc-foreign-owner-tax-filing)\n• [Florida](/blog/florida-llc-foreign-owner-tax-filing)\n• [Nevada](/blog/nevada-llc-foreign-owner-tax-filing)\n• [Texas](/blog/texas-llc-foreign-owner-tax-filing)\n• [California](/blog/california-llc-foreign-owner-tax-filing)\n\nA state with no individual income tax may still impose entity, filing or other obligations. State work is not included in our Form 5472 preparation package.",
        table: {
          caption: "State filing guides named on this page",
          columns: ["State", "Annual state filing", "Cost or due date"],
          rows: [
            ["Wyoming", "Relevant guide listed", "Verify directly with state"],
            ["Delaware", "Relevant guide listed", "Verify directly with state"],
            ["New Mexico", "Relevant guide listed", "Verify directly with state"],
            ["Florida", "Relevant guide listed", "Verify directly with state"],
            ["Nevada", "Relevant guide listed", "Verify directly with state"],
            ["Texas", "Relevant guide listed", "Verify directly with state"],
            ["California", "Relevant guide listed", "Verify directly with state"]
          ]
        }
      },
      {
        heading: "What are FBAR and FATCA, and do I need to file?",
        body: "Test the U.S. LLC separately from its foreign owner. A U.S.-organized LLC can have an FBAR obligation for foreign financial accounts even when its nonresident owner has no personal FBAR obligation. Disregarded income-tax treatment does not remove the entity's FBAR test.\n\nThe ordinary FBAR threshold is an aggregate foreign-account value exceeding $10,000 during the calendar year, with financial-interest or authority rules and exceptions also relevant. Establish account location from actual account arrangements—not a fintech brand, a USD balance or the owner's address.\n\nForm 8938 has different covered-person, asset and threshold rules. Neither report replaces the other. Use the [LLC FBAR account-evidence guide](/blog/foreign-owned-us-llc-fbar) and obtain qualified review where ownership, location or an exception is uncertain."
      },
      {
        heading: "Do you need a US ITIN?",
        body: "An ITIN is for an individual with a qualifying federal tax purpose who cannot obtain an SSN. LLC ownership, wanting to use the online EIN application, a bank's general request for a tax ID or an ordinary W-8BEN does not automatically establish eligibility.\n\nForm 5472 alone does not require the foreign owner to obtain an ITIN. An individual return or a documented W-7 exception can create a separate need. Read [when a nonresident actually needs an ITIN](/blog/when-nonresident-actually-needs-itin) before applying.\n\nWe offer a separate [ITIN application service](/itin) with eligibility review and CAA handling. It is not included in the Form 5472 price; uncertain tax-return or treaty positions require qualified advice."
      },
      {
        heading: "Do I need to file sales tax?",
        body: "Review where you have physical or economic nexus, whether the particular product or service is taxable, and whether a marketplace collects and remits on your behalf. Thresholds, measurement periods and filing duties vary by state; there is no single nationwide sales-tax threshold.\n\nA marketplace collecting tax does not by itself answer every registration or return question. Remote digital sales and physical inventory deserve separate checks. Our Form 5472 package does not include sales-tax registration, advice or returns; use the relevant state revenue authority or a qualified provider."
      },
      {
        heading: "What is BOI, and do I have to file it?",
        body: "FinCEN's current guidance exempts entities created in the United States from BOI reporting under the Corporate Transparency Act. Foreign ownership does not turn a U.S.-formed LLC into a foreign-formed entity for this purpose. Certain entities formed under foreign law and registered in the U.S. remain subject to the rules unless exempt.\n\nThis BOI exemption does not remove Form 5472 or FBAR obligations. Check [FinCEN's current BOI guidance](https://www.fincen.gov/boi) when the entity's formation or registration facts differ."
      },
      {
        heading: "What does our service cover, and what do you handle elsewhere?",
        body: "Our Form 5472 service prepares the supported foreign-owned disregarded-entity package, including pro forma Form 1120 and applicable supporting statements, for review, signature and IRS fax delivery. Late-year work may include a reasonable-cause statement based on the actual facts; penalty relief is not guaranteed. A provider transmission receipt is not IRS acceptance.\n\nSeparate [EIN](/ein) and [ITIN](/itin) application services are available. They are not automatically needed by every foreign LLC owner and are not bundled into the Form 5472 fee.\n\nThe Form 5472 package does not include state returns, personal income-tax returns, FBAR/Form 8938, sales tax or bookkeeping. Every filing is reviewed by a qualified accountant before it is submitted. We prepare and submit the forms from the information you give us; we do not provide personalised tax planning. Contact us before ordering if your situation involves multiple members, a corporate election or other unsupported complexity."
      },
      {
        heading: "What is your typical compliance profile by business type?",
        body: "Use the business model to identify questions, not to declare a universal tax result:\n\n• Ecommerce: review inventory location, sales-tax connections, marketplace records and owner transactions.\n• SaaS and digital products: distinguish services, licenses and other receipts; check related-company payments, account location and state rules.\n• Consulting and agencies: establish where services are performed and distinguish unrelated contractors from related parties.\n• Real estate: obtain specialist advice on individual returns, withholding, state duties and the entity's separate reporting.\n\nEach profile can involve Form 5472, but the complete filing list depends on actual ownership, classification, activity and accounts. The [recordkeeping guide](/blog/form-5472-recordkeeping-checklist) helps organize the evidence.",
        table: {
          caption: "Business profiles and extra compliance checks",
          columns: ["Business type", "Federal forms", "Extra filings"],
          rows: [
            ["Ecommerce", "Can involve Form 5472", "Inventory and sales-tax checks"],
            ["SaaS and digital products", "Can involve Form 5472", "Account location and state rules"],
            ["Consulting and agencies", "Can involve Form 5472", "Services location and related-party checks"],
            ["Real estate", "Can involve Form 5472", "Individual returns, withholding, state duties"]
          ]
        }
      },
      {
        heading: "File the federal piece in 15 minutes",
        body: "If your LLC fits the supported foreign-owned single-member disregarded-entity service, the guided intake helps organize the information needed for Form 5472 and pro forma Form 1120. Preparation and delivery take the turnaround stated in your selected plan, rather than the time spent completing the intake.\n\nReview [current pricing](/pricing), then [start your filing](/start). Resolve uncertain personal tax, state, FBAR or entity-classification questions separately so that ordering one service is not mistaken for completing every obligation."
      }
    ],
    faqs: [
      {
        q: "My LLC made zero revenue. Do I still file?",
        a: "Check reportable transactions, not revenue alone. Owner funding, distributions and owner-paid costs can trigger Form 5472 even with no sales. A truly transaction-free year requires a different review."
      },
      {
        q: "Do I owe US income tax on my LLC's profits?",
        a: "Form 5472 does not decide that. U.S. business activity, income source, withholding, treaties and the owner's circumstances affect the answer. Obtain qualified advice if the income-tax position is uncertain."
      },
      {
        q: "What if I have employees in the US?",
        a: "Employees can create payroll, state and income-tax questions beyond Form 5472. Obtain qualified guidance before treating the information-return package as a complete compliance solution."
      },
      {
        q: "I sell on Amazon FBA in the US. What changes?",
        a: "Review U.S. inventory, business activity, marketplace collection and state connections with a qualified adviser. Marketplace handling of sales tax does not necessarily settle every filing obligation."
      },
      {
        q: "Do I need a US bank account to file?",
        a: "No. Form 5472 focuses on the LLC and its reportable related-party transactions. Foreign accounts may separately require an LLC-level FBAR review; the owner's residence alone does not decide that."
      },
      {
        q: "I formed my LLC mid-year. Do I file for that year?",
        a: "Review reportable transactions from formation onward and determine the correct tax year. Formation costs paid by the owner can matter. Do not assume that having no customers means no initial-year filing."
      },
      {
        q: "Can I file Form 5472 retroactively if I never filed before?",
        a: "Past-year filings may need to be prepared. Review each missing year, any IRS notices and the appropriate submission procedure. A reasonable-cause explanation does not guarantee that a penalty will be waived."
      },
      {
        q: "What if I dissolved my LLC mid-year?",
        a: "Closing the LLC does not erase reporting duties. Review final transactions, the effective closing date and any short-year requirements with the preparer. Do not assume a full-year calendar deadline applies to every closure."
      },
      {
        q: "Do I need to file in the state where I live?",
        a: "State duties can arise outside the formation state based on business connections or residence. Home-country tax rules are a separate question. Determine the relevant jurisdictions from the facts, not the LLC's mailing address alone."
      },
      {
        q: "Does your service handle multi-member LLCs?",
        a: "No. This service is for supported foreign-owned single-member disregarded LLCs. A multi-member entity may have partnership or corporate filing obligations depending on its classification and facts; obtain advice from a qualified professional."
      }
    ],
    relatedSlugs: [
      "wyoming-llc-form-5472",
      "delaware-llc-form-5472",
      "form-5472-germany",
      "form-5472-uae",
      "single-member-llc-foreign-owner"
    ]
  },
  {
    slug: "late-form-5472",
    keyword: "late form 5472",
    title: "Late Form 5472 — How to File Late and Avoid the Penalty",
    metaDescription:
      "Late Form 5472 filers can use DIIRSP with a reasonable cause statement to catch up and request relief from the $25,000 penalty. Learn each step.",
    sources: [
      { label: "IRS: Delinquent international information return procedures", url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures" },
      { label: "IRS: Penalty relief for reasonable cause", url: "https://www.irs.gov/payments/penalty-relief-for-reasonable-cause" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
    ],
    published: "2026-05-19",
    updated: "2026-10-05",
    h1: "Filed Form 5472 Late? Here's What to Do Now",
    intro:
      "If you missed the April 15 deadline for Form 5472, file as soon as possible. DIIRSP lets you submit late filings with a Reasonable Cause Statement requesting waiver of the $25,000 penalty, before the risk of an automatic CP 215 penalty notice narrows your options.",
    howTo: {
      section: "What should you do if you've missed one year?",
      supplies: [
        "Cover letter",
        "Pro forma Form 1120",
        "Form 5472",
        "Part V supporting statement",
        "Reasonable Cause Statement",
      ],
    },
    sections: [
      {
        heading: "How late can you actually file?",
        body: "You can file Form 5472 late for any missed tax year, back to when your LLC was formed. There is no IRS cut-off for filing a late return, but the longer a return stays unfiled, the more likely an IRS penalty notice arrives first and DIIRSP no longer applies to that year.\n\nPractically:\n\n• Within a few months of the deadline: file now under DIIRSP with a reasonable-cause statement.\n• 1-2 years late: the same DIIRSP route, filing every missed year together.\n• 3+ years late: still file every missed year, but the IRS may have already issued a notice you didn't see, so check your mail first.\n• Already received a CP 215 notice: DIIRSP is no longer the right path for that year — you respond to the notice with an abatement request and appeal if denied.\n\nThe IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.",
      },
      {
        heading: "What happens if you miss the deadline entirely?",
        body: "Within 6-18 months of the missed deadline, the IRS automated system issues a CP 215 notice to the LLC's US address of record, assessing the $25,000 penalty. Once that notice arrives, your options narrow:\n\n• Pay the $25,000 (worst outcome for most owners).\n• Request abatement, for example with Form 843 and a written reasonable-cause statement, as the notice directs. The IRS does not publish outcome data, and a specific, documented statement is the strongest basis for that response.\n• Appeal through the IRS Office of Appeals (months of process).\n• Ignore the notice — the worst path. Continuation penalties accrue at $25,000 per 30-day period after the 90-day grace window. Collection action can begin against the LLC's US-banked funds.\n\nIf the LLC's US address can't receive mail (e.g. a virtual mailbox that bounces IRS mail), you might not even see the CP 215 — but the penalty is still assessed and accruing.",
      },
      {
        heading: "What should you do if you've missed one year?",
        body: "1. Check whether you have received a CP 215 notice. The IRS has not yet assessed the penalty if you haven't received one.\n2. Prepare the late return immediately. You need: cover letter, pro forma Form 1120, Form 5472, Part V supporting statement, AND a Reasonable Cause Statement at the front.\n3. Write the Reasonable Cause Statement (or use our service to generate one tailored to the most common first-time-foreign-owner scenario).\n4. File via DIIRSP — fax to +1-855-887-7737 (IRS Ogden PIN Unit), or mail certified to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.\n5. Set up an annual reminder so you file on time going forward (or sign up for an annual filing service).\n6. Keep the fax transmission receipt as your timestamped transmission evidence.",
      },
      {
        heading: "What should you do if you've missed multiple years?",
        body: `File ALL missed years in one DIIRSP package. Don't space them out. The IRS treats a comprehensive catch-up filing more favorably than serial late filings — one consistent reasonable cause narrative covering the whole period is stronger than separate filings each blaming the same circumstances.\n\nOur multi-year DIIRSP packages:\n\n• 2-year catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3-year catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\nThe wizard generates one cover letter, one Reasonable Cause Statement (covering all years), and a separate fully-completed Form 5472 + pro forma 1120 for each year. Everything assembled into one package, faxed once, with one timestamped receipt per year.\n\nFor 4+ missed years, run two back-to-back packages or message us and we'll coordinate.`,
      },
      {
        heading: "What should you include in your Reasonable Cause Statement?",
        body: "The IRS looks for evidence you acted with \"ordinary business care and prudence.\" Strong statements include:\n\n• A clear timeline of when and how you became aware of the Form 5472 obligation.\n• Specific personal circumstances — first-time foreign owner, language barrier, LLC was set up by an accelerator/Stripe Atlas package that didn't include annual compliance.\n• If an adviser was involved, give the facts of that advice: what you asked, what information you gave them and what they told you. The IRS manual says relying on someone else to file is generally not reasonable cause, because the filing duty cannot be delegated (IRM 20.1.1.3.2.2.5), and reliance on a tax advisor's advice helps only in limited cases involving a technical or complicated substantive issue (IRM 20.1.1.3.3.4.3).\n• Evidence of prompt corrective action upon learning of the failure.\n• Explicit statement that no US tax is owed (this is true for almost all foreign-owned single-member LLCs).\n• Confirmation that you've taken steps to ensure future compliance — annual reminder, calendar entry, filing service subscription.\n• Concise — 1-2 pages.\n\nAvoid vague excuses, contradictions with the form data, or aggressive language. Our auto-generated statement is tailored to the most common scenario and editable in the wizard if your facts are different.",
      },
      {
        heading: "What should you do if you've already received a CP 215 notice?",
        body: "DIIRSP is no longer the right path for that specific year — once the IRS has formally assessed a penalty, you're in the post-assessment abatement process. Steps:\n\n1. Respond within 30 days of the notice (the notice will state the deadline).\n2. File the late Form 5472 + pro forma 1120 separately if not already done.\n3. Submit Form 843 (Claim for Refund and Request for Abatement) with a strong reasonable cause explanation tied to your specific facts.\n4. If Form 843 is denied, appeal to the IRS Office of Appeals.\n5. Consider engaging a tax attorney or enrolled agent — post-assessment appeals are more complex than DIIRSP and a professional adds value.\n\nWe don't currently handle CP 215 abatement appeals — only preventative DIIRSP filings. If you have a CP 215 notice already, talk to a US tax professional who handles international information return penalties.\n\nFor any other unfiled years where you haven't been contacted yet, DIIRSP is still available — file those concurrently while you handle the CP 215 for the assessed year.",
      },
      {
        heading: "How long until you hear back from the IRS?",
        body: "After a late Form 5472 filing, the current instructions do not describe a routine acceptance acknowledgment for this faxed package. Keep the exact submitted package, destination, timestamp, page count, provider receipt and IRS correspondence because a transmission record does not guarantee penalty removal.\n\nDo not send a duplicate solely because you have heard nothing. If a notice arrives, follow its instructions and response deadline. See receipt confirmation and next steps.",
      },
      {
        heading: "What are real-world late-filing scenarios?",
        body: "Real-world late filings range from a just-missed return to multi-year DIIRSP catch-up or a CP 215 appeal problem. Carlos files one month after the 2024 return was due, Mei catches up several years together, and Ahmed faces $100,000+ continuation penalties by 2026.\n\nScenario B — three-year catch-up: Mei has had a Delaware LLC since 2022, never filed. Discovers obligation in 2026. Files 2022, 2023, 2024, and 2025 together in one DIIRSP package. (Our wizard supports 3 years, so 2022 would run as a separate filing.) No outcome is guaranteed: penalties may still be assessed during processing, and her documented statement is then the basis for responding.\n\nScenario C — ignored a CP 215: Ahmed received a CP 215 in July 2024 for tax year 2022. By 2026, continuation penalties have stacked to $100,000+. Needs both to file the actual return AND to engage a tax professional to handle the assessed penalty appeal. Much more expensive and stressful than scenarios A and B.\n\nThe takeaway: act fast. Even multi-year catch-up is vastly cheaper than waiting for an IRS notice and then delaying.",
        table: {
          caption: "Late filing examples and relief routes",
          columns: ["Years late", "What you file", "Relief route"],
          rows: [
            ["One month late", "Late return plus statement", "DIIRSP before CP 215"],
            ["Several years", "2022 through 2025 together", "One DIIRSP package"],
            ["CP 215 ignored", "Actual return plus appeal", "Post-assessment penalty appeal"],
          ],
        },
      },
      {
        heading: "Does the IRS notice if you do not file?",
        body: "Yes, the IRS can notice if you do not file, even though it may not catch every non-filer in year 1. EIN cross-references, payment processor reports, bank account activity and CP 215 routines all make silence a risky basis for ignoring Form 5472.\n\nHow the IRS finds you:\n\n• EIN database cross-reference — every EIN issued to a foreign-owned entity is flagged for expected annual returns.\n• Stripe Atlas / Mercury / formation services occasionally share aggregate data with the IRS for compliance purposes.\n• Bank account openings (foreign-owned US LLC accounts trigger reporting under various AML / KYC frameworks).\n• Customer 1099-K reports — if your LLC received payment processing volume from US-based processors (Stripe, PayPal, Square), the IRS sees the LLC's EIN reported on those forms.\n\nThe IRS doesn't usually catch every non-filer in year 1, but the longer you wait the more likely they catch up. CP 215 notices are routine for foreign-owned LLCs that miss Form 5472. Don't bet on silence.",
      },
      {
        heading: "Get caught up in 15 minutes",
        body: `Our DIIRSP-aware filer handles the entire late-filing package. The wizard asks 12 questions about your LLC, owner, and year-end totals for each missed year. We generate everything — cover letter, pro forma Form 1120, Form 5472, Part V supporting statement, AND the Reasonable Cause Statement.\n\nYou sign once on screen. An accountant on our team reviews the package. We fax to the IRS Ogden PIN Unit and email you the timestamped receipt for each year as transmission evidence.\n\n• 1 year: ${PRICE_STD} Standard / ${PRICE_EXP} Express / ${PRICE_24H} 24-Hour (fax included)\n• 2 years (DIIRSP): ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3 years (DIIRSP): ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\n100% money-back guarantee if we fail to submit your filing to the IRS.`,
      },
    ],
    faqs: [
      {
        q: "How late can I be before DIIRSP no longer works?",
        a: "There's no hard deadline — DIIRSP is available until the IRS contacts you about the specific delinquency. Once a CP 215 arrives for a tax year, you must use a different abatement appeal process for THAT year. DIIRSP remains available for any other unfiled years where you haven't been contacted.",
      },
      {
        q: "Is there a chance the IRS just won't notice?",
        a: "Unlikely. The IRS automated system cross-references EIN holders, foreign-owned DEs have been a focus area since 2017, and CP 215 notices for missed Form 5472 are routine. The longer you wait the more likely the catch-up turns into a defensive penalty appeal.",
      },
      {
        q: "Can I file under DIIRSP myself?",
        a: "Yes. The procedure is publicly documented. The hardest part is writing a strong Reasonable Cause Statement tied to your specific circumstances. Our service auto-generates one based on the most common scenario, and you can edit it.",
      },
      {
        q: "Will I owe back taxes too?",
        a: "Almost certainly not. Form 5472 is an informational filing — no tax liability is calculated on it. For most foreign-owned single-member LLCs, US federal income tax is $0 regardless of how late you file. DIIRSP is specifically for information-return delinquencies where no tax is owed.",
      },
      {
        q: "What if I only have records for some of the missed years?",
        a: "File for the years you have records. Reconstruct what you can — bank statements, Stripe / PayPal reports, contracts — for any year where records are incomplete. Then submit best-available data with a note in the reasonable cause statement explaining the partial records.",
      },
      {
        q: "How do I know the fax actually delivered to the IRS?",
        a: "Your fax service generates a transmission receipt with delivery confirmation and timestamp. That receipt is your fax-provider transmission evidence. If you use our service, we email you the receipt as a PDF, and a copy stays in your portal.",
      },
      {
        q: "Can I file under DIIRSP for years where the LLC was inactive?",
        a: "If the LLC had at least one reportable transaction during the year (even a single capital contribution), yes — file under DIIRSP. If truly inactive (no bank account, no money in or out, no contracts), you may not have had a reportable transaction at all and no filing was required. The bar is low — most owners file regardless.",
      },
      {
        q: "What if I get a CP 215 between filing under DIIRSP and the IRS responding?",
        a: "Unusual but it can happen if there's a processing delay. Respond to the CP 215 by referencing your DIIRSP submission (including the fax receipt date) and request the penalty be removed since you filed voluntarily under the procedure before the notice issued.",
      },
      {
        q: "Should I file under DIIRSP if I'm planning to dissolve the LLC?",
        a: "Yes. Dissolution doesn't erase past filing obligations. The IRS can still assess penalties for missed years after the LLC is dissolved — and it's much harder to defend a non-filing once the entity no longer exists. Catch up first, then dissolve.",
      },
      {
        q: "Does your service handle CP 215 abatement appeals?",
        a: "Not currently. We handle preventative DIIRSP filings only. If you've already received a CP 215, contact a tax attorney or enrolled agent who handles international information return penalty appeals.",
      },
    ],
    relatedSlugs: ["diirsp", "form-5472-penalty", "file-form-5472", "form-5472-reasonable-cause-statement", "form-5472-deadline"],
  },
  {
    slug: "form-5472-vs-1120",
    keyword: "form 5472 vs 1120",
    title: "Form 5472 vs Form 1120 — What's the Difference?",
    metaDescription:
      "Form 5472 reports related-party transactions, while Form 1120 is a corporate return. Foreign-owned disregarded LLCs submit both in one filing package.",
    sources: [
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
    ],
    published: "2026-05-19",
    updated: "2026-09-11",
    h1: "Form 5472 vs Form 1120 — What's the Difference?",
    intro:
      "Form 5472 and Form 1120 are separate IRS forms that foreign-owned US LLCs file together as one package. Form 1120 is the US corporate income tax return, while Form 5472 reports related-party transactions, and most single-member LLCs file the 1120 \"pro forma\" with most boxes blank.",
    sections: [
      {
        heading: "What is Form 1120?",
        body: "Form 1120 (U.S. Corporation Income Tax Return) is the standard tax return that domestic corporations use to report income, deductions, and calculate corporate income tax. For a real C-corporation operating in the US, it's a substantive 6-page tax calculation: revenue, cost of goods sold, deductions, taxable income, tax owed.\n\nFor a foreign-owned US single-member LLC, your LLC is treated as a disregarded entity for tax purposes — meaning the LLC itself doesn't pay corporate income tax. Profits flow through to you, the owner, taxable in your home country.\n\nBut the IRS still wants the 1120 as the procedural \"envelope\" for Form 5472. So you file the form \"pro forma\" with only the identification fields completed and \"Foreign-Owned U.S. DE\" written across the top. Income, deductions, tax calculation — all blank.",
      },
      {
        heading: "What is Form 5472?",
        body: "Form 5472 (Information Return of a 25% Foreign-Owned U.S. Corporation or a Foreign Corporation Engaged in a U.S. Trade or Business) is an information return — meaning it reports transactions but does NOT calculate any tax. It's specifically designed for cases where a foreign person owns 25% or more of a US corporation or disregarded entity.\n\nSince 2017, the IRS extended this requirement to single-member LLCs owned by non-US persons. Even though those LLCs are normally disregarded for US tax purposes, they are treated as corporations for §6038A reporting.\n\nForm 5472 reports related-party transactions: capital you contributed to the LLC, distributions you took out, payments to or from related parties, loans, rents, royalties — anything that moved value between the LLC and you (or any entity you also control).",
      },
      {
        heading: "Why both forms?",
        body: "Form 5472 by itself is not a valid IRS submission. The IRS requires it to be attached to a tax return. For foreign-owned disregarded entities, the IRS chose Form 1120 as the attachment vehicle — even though the LLC doesn't owe corporate income tax.\n\nThink of it like an envelope: the 1120 is the envelope, the 5472 is the letter inside. The IRS Ogden PIN Unit won't process the letter without the envelope.\n\nThis pairing exists because the IRS infrastructure for international information return processing is built around corporate-return filing channels. There's no standalone process for filing Form 5472 outside of a 1120.",
      },
      {
        heading: "What's the side-by-side comparison of Form 1120 and Form 5472?",
        body: "Form 1120 (pro forma version for foreign-owned DEs):\n• Purpose: corporate income tax return — used as procedural envelope here.\n• Pages: 6 standard, but most are blank for foreign-owned DEs.\n• What you fill in: name, address, item B (EIN), applicable item E boxes; signature workflow considered separately.\n• What's blank: income, deductions, COGS, tax calculation.\n• Special: \"Foreign-Owned U.S. DE\" stamped across the top of page 1.\n• Tax owed: $0 (because the LLC is disregarded).\n\nForm 5472:\n• Purpose: information return reporting related-party transactions.\n• Pages: 2 substantive pages.\n• What you fill in: Part I (reporting corporation = your LLC), Part II (25% foreign shareholder = you), Part III (related party = you again for single-member), Part IV (monetary transactions, usually blank), Part V (reportable transactions — capital in, distributions out), Part VII (additional-information questions).\n• Required attachments: Part V supporting statement listing each transaction.\n• Tax owed: $0 (informational only).\n\nFiled together as one package, faxed to +1-855-887-7737.",
        table: {
          caption: "Form 1120 and Form 5472 compared",
          columns: ["Item", "Pro forma Form 1120", "Form 5472"],
          rows: [
            ["Purpose", "Corporate return used as envelope", "Information return for related transactions"],
            ["What you complete", "Name, address, EIN, item E", "Parts I, II, III, IV, V, VII"],
            ["What stays blank", "Income, deductions, tax calculation", "Part IV usually blank"],
            ["Tax owed", "$0 because LLC is disregarded", "$0 because informational only"],
            ["Where it is filed", "One package faxed to Ogden", "One package faxed to Ogden"],
          ],
        },
      },
      {
        heading: "What is not involved?",
        body: "These forms come up in foreign-owner Google searches but are NOT what you file for a single-member, foreign-owned, disregarded LLC:\n\n• Form 1120-S — for S-corporations. LLCs can elect S-corp status but foreign persons cannot own S-corp stock, so this is not relevant.\n• Form 1120-F — for foreign corporations engaged in US trade or business. Your LLC is a US entity, not a foreign one, so 1120-F doesn't apply (unless your LLC is itself owned by a foreign corporation that needs to file).\n• Form 1065 — partnership return. Only applies if your LLC has 2+ members.\n• Form 1040-NR — personal return for non-resident individuals with US-source income. Only required if YOU personally have US-source income.\n• Form 8865 — for foreign partnerships. Not applicable to single-member LLCs.\n\nThe correct combo for the standard foreign-owned single-member LLC: pro forma Form 1120 + Form 5472 + Part V supporting statement + (if late) Reasonable Cause Statement.",
      },
      {
        heading: "Does this trigger US corporate income tax?",
        body: "No, filing pro forma Form 1120 does not make your LLC subject to U.S. corporate income tax. The LLC remains disregarded for tax purposes, and tax on LLC profits, if any, flows through to you personally rather than through the pro forma cover.\n\nYour LLC remains a disregarded entity for tax purposes. The 1120 is purely the procedural vehicle for filing Form 5472 — not a real income tax return for your LLC.\n\nTax on LLC profits (if any) flows through to you personally:\n• If your LLC has no US-source income that's effectively connected with a US trade or business: $0 US tax. Income is taxable in your home country only.\n• If your LLC has US-source effectively connected income: you'd file Form 1040-NR personally, separate from the pro forma 1120.\n\nMost foreign-owned single-member LLCs (ecommerce, SaaS, consulting, dropshipping with non-US customers) are in the first bucket. They file pro forma 1120 + Form 5472 as informational and owe no US tax.",
      },
      {
        heading: "What are common confusions about these forms?",
        body: "\"If I file Form 1120, am I now treated as a corporation?\" — No. The 1120 you file is \"pro forma\" — explicitly marked as Foreign-Owned U.S. DE. The IRS recognizes it as a procedural vehicle for Form 5472, not as a real corporate tax return. Your LLC stays a disregarded entity.\n\n\"My CPA said I need a full 1120, not pro forma.\" — Get a second opinion. Most US CPAs see this filing once or twice in their career. A full 1120 (with income, deductions, tax calculation) would actually be wrong for a disregarded entity.\n\n\"I only filled out Form 5472, not the 1120 — should be fine?\" — No. The IRS will reject the standalone 5472 (or treat it as not filed and assess the $25,000 penalty). The pro forma 1120 envelope is mandatory.\n\n\"I forgot to write 'Foreign-Owned U.S. DE' on the 1120 — is that fatal?\" — Not fatal, but it can cause processing delays and routing errors at Ogden. The stamp tells the Ogden PIN Unit how to process the return. Always include it.",
      },
      {
        heading: "How are these forms filed together?",
        body: "Physical / faxed order of the package:\n\n1. Cover letter (1 page)\n2. Pro forma Form 1120 (1-2 pages, stamped \"Foreign-Owned U.S. DE\")\n3. Form 5472 (2 pages)\n4. Part V supporting statement (1+ pages depending on transaction count)\n5. Reasonable Cause Statement (1-2 pages, only if filing late under DIIRSP)\n\nTotal package: typically 5-8 pages.\n\nFax destination: +1-855-887-7737 (IRS Ogden PIN Unit).\nOr mail: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.\n\nThe whole package is one filing. You fax it together, you get one transmission receipt covering the entire package as transmission evidence.",
      },
      {
        heading: "What does our service generate?",
        body: "When you complete our wizard, we generate the complete package automatically:\n\n• Cover letter introducing the filing.\n• Pro forma Form 1120 with the \"Foreign-Owned U.S. DE\" stamp and your entity info.\n• Form 5472 fully filled in (Parts I, II, III, IV, V, VII as needed).\n• Part V supporting statement listing each reportable transaction.\n• Reasonable Cause Statement (only if the filing is late).\n\nYou sign once on screen. An accountant on our team reviews it. We fax to the IRS Ogden PIN Unit and email you the timestamped receipt as transmission evidence.",
      },
      {
        heading: "Pricing",
        body: `Both forms together (cover letter, pro forma 1120, Form 5472, Part V supporting statement) for one year:\n\n• 1 tax year: ${PRICE_STD} Standard / ${PRICE_EXP} Express / ${PRICE_24H} 24-Hour (fax included)\n• 2 tax years (DIIRSP catch-up): ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3 tax years (DIIRSP catch-up): ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\n100% money-back guarantee if we fail to submit your filing to the IRS.`,
      },
    ],
    faqs: [
      {
        q: "If I don't owe corporate tax, why file Form 1120?",
        a: "Because Form 5472 by itself isn't a valid IRS submission. The IRS requires it to be attached to Form 1120 as a procedural envelope. The 1120 is pro forma — marked as Foreign-Owned U.S. DE with no income or tax filled in.",
      },
      {
        q: "Is Form 1120 the same as Form 1120-S?",
        a: "No. Form 1120-S is for S-corporations. You file pro forma 1120 (not 1120-S) for a foreign-owned disregarded LLC. Foreign persons cannot own S-corp stock, so 1120-S is never the right form here.",
      },
      {
        q: "Do I file Form 1040 too?",
        a: "Only if you personally have US-source income requiring you to file 1040-NR. Most foreign LLC owners with no US trade or business don't need 1040-NR.",
      },
      {
        q: "Do I file two separate envelopes — one for each form?",
        a: "No. Form 5472 is filed AS AN ATTACHMENT to the pro forma Form 1120. One package, one fax, one transmission receipt. The 1120 is the cover, the 5472 sits behind it.",
      },
      {
        q: "What if my LLC actually does owe corporate tax?",
        a: "Then it's no longer pro forma — you'd file a full Form 1120 with income, deductions, and tax calculation. This typically happens if your LLC has US-source effectively connected income (US warehouse, US employees, US fixed place of business). Our service is for the standard disregarded-entity case; if you owe corporate tax you need a CPA, not us.",
      },
      {
        q: "Does Form 5472 ask for income data?",
        a: "Form 5472 reports transactions in dollar amounts (capital contributions, distributions, related-party payments) but not income, expenses, or profit. The 1120 normally reports income but is left blank in the pro forma version.",
      },
      {
        q: "What's the deadline for both?",
        a: "April 15 of the year following the tax year. Form 7004 extension extends both to October 15. Same deadline because they're filed as one package.",
      },
      {
        q: "Where do I get blank copies of these forms?",
        a: "Form 1120 and Form 5472 are both downloadable as PDFs from irs.gov. Our wizard handles this for you — you don't need to download anything; we generate filled, signature-ready PDFs.",
      },
      {
        q: "Is the package the same for every year?",
        a: "Structurally yes — pro forma 1120 + Form 5472 + Part V supporting statement. Year-by-year the numbers change (capital contributions, distributions, total assets). Our wizard pre-fills from your prior year's filing if you come back.",
      },
      {
        q: "Can I file them at different times?",
        a: "No. Form 5472 must be filed with the 1120 it's attached to. You can't file the 1120 in March and the 5472 in October. They're submitted together as one package on or before April 15 (or the extended due date).",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "file-form-5472", "form-5472-instructions", "form-1120-foreign-owned-llc", "irs-form-5472"],
  },
  {
    slug: "wyoming-llc-form-5472",
    keyword: "Wyoming LLC form 5472",
    title: "Wyoming LLC Form 5472 — Foreign Owner Filing Guide",
    metaDescription:
      "Wyoming LLC Form 5472 rules require eligible foreign-owned single-member LLCs to submit the form with pro forma Form 1120. Learn federal and state duties.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: Single-member LLCs", url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" },
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
    ],
    published: "2026-05-19",
    updated: "2026-10-05",
    h1: "Wyoming LLC Form 5472 Filing Guide",
    intro:
      "Every foreign-owned Wyoming LLC must file IRS Form 5472 with pro forma Form 1120 by April 15 each year. Wyoming's low fees, no state income tax, privacy laws, and registered agent market do not remove the federal filing or the $25,000 penalty risk if missed.",
    howTo: {
      section: "How do you file Form 5472 for a Wyoming LLC?",
      supplies: [
        "LLC info",
        "Owner info",
        "Year-end financials",
        "Part V supporting statement",
        "Signed 1120 cover",
      ],
    },
    sections: [
      {
        heading: "Why do foreign LLC owners choose Wyoming?",
        body: "Foreign LLC owners choose Wyoming for no state income tax, no state-level franchise tax, cheap annual reports, owner privacy, registered agent options, online filing, and low-touch state government.\n\n• No state income tax — Wyoming taxes neither LLCs nor LLC members on income.\n• No state-level franchise tax on LLCs.\n• Cheap annual report ($60/year, due in the formation anniversary month).\n• Strong owner privacy — Wyoming doesn't require disclosing the owner in public state records.\n• Mature registered agent ecosystem with rates as low as $50-$100/year.\n• Online filing for state-level requirements.\n• English-language process, low-touch state government.\n\nThese benefits make Wyoming attractive — but they're STATE-level. Federal Form 5472 obligations apply regardless of which state you incorporated in. Choosing Wyoming saves you state tax; it does not exempt you from the federal disclosure return.",
      },
      {
        heading: "What is the Wyoming-specific tax timeline?",
        body: "The Wyoming-specific timeline has one federal Form 5472 package due April 15, or October 15 with Form 7004, plus a separate Wyoming Annual Report due in the LLC's formation anniversary month. Standard foreign-owned Wyoming LLCs have no BOI report, state income tax return or franchise tax.\n\nAnnual Wyoming state:\n• First day of the LLC's formation anniversary month — Wyoming Annual Report due ($60 minimum, can be higher based on assets located in Wyoming). Filed online with the Wyoming Secretary of State.\n\nBOI (FinCEN) — not required:\n• On March 26, 2025, FinCEN exempted all US-formed entities, including Wyoming LLCs, from Beneficial Ownership Information reporting under the Corporate Transparency Act. A Wyoming LLC owned by a foreign person does not need to file a BOI report.\n\nThat's it for the standard foreign-owned Wyoming LLC. No state income tax return, no state franchise tax, no state-level information return.\n\nOptional / situational:\n• Sales tax registrations in any state where you cross economic nexus thresholds (typically $100K in sales).\n• Personal Form 1040-NR only if you have US-source income personally (rare).",
        table: {
          caption: "Wyoming LLC filing timeline and costs",
          columns: ["Obligation", "Due", "Cost"],
          rows: [
            ["Federal Form 5472 package", "April 15", `${PRICE_STD} Standard service`],
            ["Extended federal package", "October 15", "Form 7004 required"],
            ["Wyoming Annual Report", "Formation anniversary month", "$60 minimum"],
            ["BOI report", "Not required", "US-formed entities exempt"],
          ],
        },
      },
      {
        heading: "How do you find your Wyoming LLC's filing info?",
        body: "You'll need this for Form 5472:\n\n• Legal name — exactly as shown on your CP-575 EIN confirmation letter. Wyoming sometimes has slight formatting differences vs. the IRS record; use the CP-575 version.\n• EIN — 9-digit number on your CP-575.\n• US address — typically your registered agent's address (Wyoming Registered Agent LLC, Northwest Registered Agent, IncFile, etc.). This is what the IRS will use for any correspondence.\n• State of incorporation — \"Wyoming\" or \"WY\".\n• Date of incorporation — on your Wyoming Articles of Organization.\n• NAICS principal business activity code — look up at naics.com (common ones for foreign-owned Wyoming LLCs: 454110 ecommerce, 541510 SaaS, 541613 marketing).\n• Total assets at year-end in USD — sum of bank balance, receivables, inventory, fixed assets.\n• Reportable transactions for the year — capital contributions in, distributions out, related-party payments.",
      },
      {
        heading: "What are common Wyoming LLC scenarios?",
        body: "1. Solo founder, no US activity (ecommerce, SaaS, consulting): file pro forma Form 1120 + Form 5472 only. LLC typically made no taxable US-source income. State filing: just the $60 annual report.\n\n2. Stripe Atlas LLC formed in Wyoming: same as above. Stripe Atlas's onboarding does NOT include annual Form 5472 filing — it's on you.\n\n3. Wyoming holding LLC with subsidiaries: file Form 5472 for each LLC where you're a 25%+ foreign owner. Each holding-subsidiary structure may have additional 5472 filings for inter-entity transactions.\n\n4. Wyoming LLC used for Amazon FBA: file Form 5472 + 1120. Additionally watch for state sales tax in every state where FBA stores your inventory — Amazon's reports show you the states. If you have inventory in the US you may also have US-source ECI triggering Form 1040-NR; consult a CPA.\n\n5. Wyoming LLC with US real estate: Form 5472 + 1120 plus Form 1040-NR personally for any rental income. US real estate income is always US-source — talk to a CPA.\n\n6. Dormant Wyoming LLC with no transactions: if truly $0 activity, no Form 5472 may be required, but most owners file anyway for safety since the bar is so low (one capital contribution triggers it).",
      },
      {
        heading: "How do you file Form 5472 for a Wyoming LLC?",
        body: `1. Gather the items in the previous section (LLC info, owner info, year-end financials).\n2. Fill in the pro forma Form 1120: name, address, item B (EIN) and applicable item E boxes; stamp \"Foreign-Owned U.S. DE\" across the top.\n3. Fill in Form 5472: Part I (your LLC), Part II (you as foreign shareholder), Part III (you again as related party), Part IV (usually blank for foreign-owned DEs), Part V (capital contributions + distributions, with supporting statement), Part VII (additional-information questions).\n4. Sign the completed 1120 cover in ink and scan that page for fax, for a conservative signing workflow.\n5. Fax the complete package (cover letter + 1120 + 5472 + Part V supporting statement) to +1-855-887-7737 (IRS Ogden PIN Unit).\n6. Save the fax transmission receipt as transmission evidence.\n\nOr use our service: Standard ${PRICE_STD} covers the entire package including IRS fax delivery, ready in 5-7 business days (Express is the same package within 3, for ${PRICE_EXP}; 24-Hour is ${PRICE_24H}, with the reviewed package ready for you to check and sign within 24 hours of your order), and every filing is reviewed by an accountant on our team before submission.`,
      },
      {
        heading: "What Wyoming registered agent address do you use?",
        body: "Use your Wyoming registered agent address in the Form 1120 name-and-address block and on Form 5472 Part I line 1a. That is usually the registered agent service's address, and it is where the IRS mails notices, including CP 215 penalty notices, if any.\n\nFor most foreign owners, this is the address of your registered agent service: Wyoming Registered Agent LLC, Northwest Registered Agent, IncFile, Cloud Peak Law, etc. The IRS will mail any notices (including CP 215 penalty notices, if any) to this address.\n\nImportant: confirm your registered agent actually forwards or scans IRS mail to you. Some cheap registered agents in Wyoming bounce IRS mail back as undeliverable, which means you might never see a notice — but the penalty is still assessed and accruing.\n\nIf you've changed registered agents since you got your EIN, you may need to update the IRS via Form 8822-B (Change of Address or Responsible Party). Otherwise the CP-575 address on file is what the IRS uses.",
      },
      {
        heading: "How does the Wyoming Annual Report differ from Form 5472?",
        body: "Don't confuse the Wyoming Annual Report (state filing) with Form 5472 (federal filing). They are completely separate:\n\n• Wyoming Annual Report: filed with Wyoming Secretary of State, due on the first day of your LLC's formation anniversary month, $60 minimum. Online at wyobiz.wyo.gov.\n• Form 5472 + pro forma 1120: filed with the IRS Ogden PIN Unit, due April 15. Faxed to +1-855-887-7737.\n\nMissing the Wyoming Annual Report can result in your LLC being administratively dissolved by Wyoming — not the $25,000 IRS penalty. Missing Form 5472 triggers the IRS penalty regardless of Wyoming compliance.\n\nMost foreign owners need to handle both. We handle the federal Form 5472 + 1120; the Wyoming Annual Report is a simple 10-minute online form you do directly with the state.",
      },
      {
        heading: "How do you handle multi-year catch-up for a Wyoming LLC?",
        body: `If you formed your Wyoming LLC in 2022 and just learned about Form 5472, you may have 2-3 unfiled years (2022, 2023, 2024). The IRS provides DIIRSP (Delinquent International Information Return Submission Procedure) as the standard catch-up path:\n\n• File all missed years together as one package.\n• Include a Reasonable Cause Statement covering the entire period.\n• Submit via fax to +1-855-887-7737.\n• If accepted, no penalty assessed.\n\nOur multi-year DIIRSP packages:\n• 2-year catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included).\n• 3-year catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included).\n\n${NOTE_24H}\n\nThe reasonable cause statement is auto-generated by our wizard, tailored to the first-time-foreign-owner scenario. Every package is reviewed by an accountant on our team before we fax it.`,
      },
      {
        heading: "What does our service do for Wyoming LLC owners?",
        body: `Our wizard is pre-tuned for the foreign-owned single-member LLC profile — which is overwhelmingly Wyoming and Delaware. Wyoming-specific touches:\n\n• Pre-populated state code (WY) on the 1120 entity info.\n• Default NAICS suggestions for the most common Wyoming foreign-owner business types (ecommerce, SaaS, consulting, marketing).\n• Validation that the address matches a recognized Wyoming registered agent pattern (helps catch typos).\n• No state-specific add-ons needed — Wyoming has no state filing we'd add to the package.\n\nPricing identical to any other state:\n• 1 year: ${PRICE_STD} Standard / ${PRICE_EXP} Express / ${PRICE_24H} 24-Hour (fax included)\n• 2 years: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3 years: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}`,
      },
      {
        heading: "What is the bottom line for Wyoming LLC owners?",
        body: "The bottom line for Wyoming LLC owners is that state advantages do not replace the federal Form 5472 package due every April 15. Wyoming's $60 annual report is minor beside the $25,000-per-year-per-form federal penalty, so Form 5472 is the filing to get right.\n\nThe $25,000-per-year-per-form federal penalty is the largest compliance risk for your LLC. Wyoming state filings are a minor annual $60 task; federal Form 5472 is the one you have to get right.\n\nOur service handles the federal piece in 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit. The state piece (Wyoming Annual Report) is a 10-minute self-serve task on the state website.",
      },
    ],
    faqs: [
      {
        q: "Does Wyoming notify the IRS about my LLC?",
        a: "Wyoming reports your LLC's existence to the IRS when you get your EIN (the EIN database links Wyoming-issued entity numbers to IRS records). After that, federal filings are your responsibility — Wyoming doesn't track Form 5472 compliance.",
      },
      {
        q: "Do I need a Wyoming registered agent address on Form 5472?",
        a: "Use the US address on your CP-575 EIN confirmation letter. For most Wyoming LLCs that's your registered agent's address. Confirm the agent forwards or scans IRS mail — otherwise you may miss notices.",
      },
      {
        q: "I dissolved my Wyoming LLC last year. Do I still file Form 5472?",
        a: "Yes. For the partial year the LLC was active before dissolution, you still need to file a final Form 5472 + 1120 covering that period. The deadline is generally the 15th day of the 4th month after the LLC's final month (the 3rd month if the final year ended in June and began before 2026).",
      },
      {
        q: "Wyoming has no state income tax — does that mean no IRS filing too?",
        a: "No. Wyoming's lack of state tax has nothing to do with federal IRS obligations. Every foreign-owned Wyoming LLC files Form 5472 + pro forma 1120 with the IRS regardless of state-level taxes.",
      },
      {
        q: "Can the IRS access my Wyoming LLC's owner info even with Wyoming privacy?",
        a: "Yes. Wyoming's privacy applies to public state records — not IRS filings. When you file Form 5472, you list yourself as the 25%+ foreign shareholder including your name and address. The IRS knows who you are.",
      },
      {
        q: "How do I file the Wyoming Annual Report?",
        a: "Online at wyobiz.wyo.gov. Takes about 10 minutes. Costs $60 for most foreign-owned single-member LLCs. Due the first day of your LLC's formation anniversary month. Completely separate from Form 5472.",
      },
      {
        q: "Do I need a Wyoming-based CPA?",
        a: "No. Form 5472 is a federal filing — any US CPA familiar with international information returns can prepare it. Better: most don't see it often. Our service is built specifically for this filing and reviewed by an accountant on our team.",
      },
      {
        q: "My Wyoming LLC made no money — do I still file?",
        a: "Yes, almost certainly. If you had even one capital contribution (e.g. wiring money in to fund the bank account), that's a reportable transaction. Most Wyoming LLCs file every year regardless of revenue.",
      },
      {
        q: "Can I use a Wyoming PO Box as my address?",
        a: "Generally no. The IRS expects a street address that can receive certified mail. Your registered agent's street address is the standard choice. A PO Box may cause processing issues.",
      },
      {
        q: "What if my Wyoming LLC has multiple foreign owners?",
        a: "Then it's a multi-member LLC and our service doesn't apply — multi-member LLCs file Form 1065 (partnership return) instead of Form 5472. You'd need a CPA familiar with foreign partnerships. Single-member, foreign-owned, disregarded LLCs are our specialty.",
      },
    ],
    relatedSlugs: ["foreign-owned-llc-tax", "delaware-llc-form-5472", "file-form-5472", "single-member-llc-foreign-owner", "form-5472-deadline"],
  },
  {
    slug: "delaware-llc-form-5472",
    keyword: "Delaware LLC form 5472",
    title: "Delaware LLC Form 5472 — Foreign Owner Filing Guide",
    metaDescription:
      "Delaware LLC Form 5472 rules require eligible foreign-owned single-member LLCs to file with pro forma Form 1120. Learn the federal and state obligations.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: Single-member LLCs", url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" },
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
    ],
    published: "2026-05-19",
    updated: "2026-09-11",
    h1: "Delaware LLC Form 5472 Filing Guide",
    intro:
      "Foreign-owned Delaware LLCs must file IRS Form 5472 with pro forma Form 1120 every year, even with zero revenue. Delaware is the #2 state after Wyoming for these LLCs, common for Stripe Atlas founders, and the annual filing sits alongside the $400 Delaware franchise tax.",
    howTo: {
      section: "How do you file Form 5472 for a Delaware LLC?",
      supplies: [
        "LLC legal name and EIN",
        "Owner passport details",
        "Year-end financials",
        "Part V supporting statement",
        "Signed 1120 cover",
      ],
    },
    sections: [
      {
        heading: "Why Delaware?",
        body: "Delaware's appeal:\n• Well-developed business law and the Court of Chancery for fast, judge-only business dispute resolution.\n• Brand recognition with US investors — most VC term sheets default to Delaware C-corps. (LLCs are similar enough to feel safe.)\n• Stripe Atlas chose Delaware as the default state for its incorporation product, so a huge share of foreign-founder LLCs are Delaware entities.\n• Mature registered agent ecosystem.\n• Online state filing portal.\n\nDownsides for solo foreign owners:\n• $400/year franchise tax for LLCs (higher than Wyoming's $60). Real money over time.\n• Slightly more disclosure than Wyoming (though still light on owner privacy).\n• Higher registered agent fees on average ($100-$150/year typical).\n\nNet: Delaware is excellent if you raised or plan to raise from US investors. For pure solo ecommerce / SaaS with no investor plans, Wyoming is cheaper. Either way, Form 5472 + pro forma Form 1120 federal filing is identical.",
      },
      {
        heading: "What is the Delaware-specific tax timeline?",
        body: "The Delaware-specific timeline has federal Form 5472 plus pro forma Form 1120 due April 15, or October 15 with Form 7004, and Delaware franchise tax due June 1. Most foreign-owned single-member LLCs owe a flat $400 state franchise tax annually.\n\nAnnual Delaware state:\n• June 1 — Delaware Annual LLC Franchise Tax due. $400/year flat for most foreign-owned single-member LLCs. Filed with the Delaware Division of Corporations at corp.delaware.gov.\n\nBOI (FinCEN) — not required:\n• On March 26, 2025, FinCEN exempted all US-formed entities, including Delaware LLCs, from Beneficial Ownership Information reporting under the Corporate Transparency Act. A Delaware LLC owned by a foreign person does not need to file a BOI report.\n\nDelaware has NO state income tax on LLCs that don't conduct business in Delaware itself. Almost all foreign-owned Delaware LLCs serve non-Delaware customers and qualify for the exemption — their state obligation is just the $400 franchise tax.",
        table: {
          caption: "Delaware LLC filing timeline and costs",
          columns: ["Obligation", "Due", "Cost"],
          rows: [
            ["Federal Form 5472 package", "April 15", `${PRICE_STD} Standard service`],
            ["Extended federal package", "October 15", "Form 7004 required"],
            ["Delaware franchise tax", "June 1", "$400 per year"],
            ["BOI report", "Not required", "US-formed entities exempt"],
          ],
        },
      },
      {
        heading: "How do Stripe Atlas LLCs interact with Form 5472?",
        body: `Stripe Atlas LLCs still need their own Form 5472 filings because Atlas forms the Delaware LLC, gets the EIN, helps with Mercury and provides templates, but does not cover annual federal tax filings. Most customers discover this in spring of year 2.\n\nWhat Stripe Atlas explicitly does NOT cover:\n• Annual federal tax filings including Form 5472.\n• Delaware franchise tax (they remind you but don't pay it).\n• Ongoing tax compliance.\n\nNote: BOI (Beneficial Ownership Information) reporting isn't on this list because it no longer applies to Stripe Atlas LLCs. Since March 26, 2025, FinCEN has exempted all US-formed entities, including Delaware LLCs, from BOI reporting.\n\nStripe's own documentation states Atlas is a formation product, not an ongoing tax service. The $5K-equivalent value at formation does not include any year-2-onward filing.\n\nWe handle the federal Form 5472 + pro forma 1120 specifically for foreign-owned Stripe Atlas LLCs. ${PRICE_STD} Standard (5-7 business days), ${PRICE_EXP} Express (3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order), IRS fax delivery included, same 15-minute filing process. Most Stripe Atlas customers come to us in spring of year 2 once they realize Form 5472 is on them.`,
      },
      {
        heading: "How do you file Form 5472 for a Delaware LLC?",
        body: "Identical to filing for any other state:\n\n1. Gather LLC info: legal name (exactly as on CP-575), EIN, Delaware registered agent address, date of formation, state (DE), NAICS code, total assets at year-end.\n2. Gather your owner info: full legal name as on passport, FTIN or self-assigned Reference ID, residential address in your home country, country of citizenship, country of tax residence.\n3. Add up year-end financials: capital contributions in, distributions out, any related-party payments.\n4. Fill in pro forma Form 1120: entity identification fields only, stamp \"Foreign-Owned U.S. DE\" across the top.\n5. Fill in Form 5472: Parts I, II, III, IV, V, VII.\n6. Build the Part V supporting statement listing each reportable transaction.\n7. Sign the completed 1120 cover in ink and scan that page for fax, for a conservative signing workflow.\n8. Fax the complete package to +1-855-887-7737 (IRS Ogden PIN Unit). Save the transmission receipt.\n\nDelaware doesn't change the federal process at all. Same forms, same fax number, same deadline.",
      },
      {
        heading: "How does Delaware franchise tax differ from Form 5472?",
        body: "The $400 annual Delaware franchise tax is paid to the Delaware Division of Corporations, not the IRS. It's completely separate from Form 5472.\n\n• Due date: June 1 each year.\n• Amount: $400 minimum for an LLC (the LLC franchise tax is a flat fee, unlike the corporate franchise tax which is value-based).\n• Filing: online at corp.delaware.gov. Takes about 10 minutes. Pay by credit card or ACH.\n• Late penalty: $200 + 1.5% monthly interest if missed. Not catastrophic but adds up.\n\nIf you miss the franchise tax for several years, Delaware will administratively dissolve your LLC and you'd need to file for reinstatement (with all back fees plus a reinstatement charge). The LLC's legal existence is at risk if you ignore Delaware franchise tax — distinct from the IRS penalty for missing Form 5472.\n\nWe handle Form 5472 + pro forma 1120 (the IRS filing). You handle the $400 franchise tax directly with Delaware (or your registered agent often offers to handle it for an extra fee).",
      },
      {
        heading: "What is the Stripe Atlas, Mercury, and Form 5472 stack?",
        body: `The Stripe Atlas, Mercury and Form 5472 stack is a common Delaware setup: Atlas forms the LLC, Mercury handles banking, Stripe handles payment processing, and Form 5472 plus pro forma 1120 remains an annual federal filing. Missing it carries the $25,000 penalty risk.\n\nWhat this triggers annually:\n• Federal Form 5472 + pro forma 1120 — yes, every year, $25,000 penalty if missed. Our service: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — same filing on every plan. IRS fax delivery included. +${PRICE_ADDON} per additional past year.\n• Delaware franchise tax — $400/year, due June 1. Self-serve at corp.delaware.gov.\n• Stripe Atlas annual fees — if you subscribed to Atlas's ongoing service ($100/month or similar), they handle some of this. The base $500 formation product does NOT include annual filing.\n• BOI report — one-time at formation (FinCEN). Free.\n• Sales tax — only if you cross economic nexus thresholds in specific states (typically not for SaaS or non-US-only ecommerce).\n\nAt the federal level, the largest penalty risk by far is Form 5472. The $400 franchise tax late penalty is small money; the $25,000 IRS penalty is real money.`,
      },
      {
        heading: "What are common Delaware LLC scenarios?",
        body: `1. Stripe Atlas SaaS founder, foreign, no US customers: file pro forma 1120 + Form 5472. No US tax. Delaware franchise tax $400. Annual total: ${PRICE_STD_PLUS_DE_TAX} (${PRICE_STD} for our federal Standard filing + Delaware's $400). IRS fax delivery included.\n\n2. Delaware LLC for ecommerce serving global customers: file Form 5472 + 1120. Sales tax only in states where economic nexus crossed. Total annual federal compliance: ${PRICE_STD} with us on Standard, ${PRICE_EXP} on Express, ${PRICE_24H} on 24-Hour.\n\n3. Delaware LLC with US-based contractors / freelancers: same federal filing, plus possible 1099-NEC for the contractors (separate filing). No US trade or business if contractors are independent and you have no fixed US place of business.\n\n4. Delaware LLC with US-based employees or US warehouse: significantly more complex — likely US trade or business, ECI income, payroll taxes. Consult a CPA, not our service.\n\n5. Multi-year catch-up: a Delaware LLC formed in 2022 with no Form 5472 filed: a 3-year DIIRSP catch-up is ${PRICE_STD_3Y} on Standard with fax delivery included, covering 2022, 2023, 2024.\n\n6. Delaware LLC dissolved last year: file a final Form 5472 + 1120 for the partial year ending at dissolution. Still required.`,
      },
      {
        heading: "How do you handle multi-year catch-up under DIIRSP?",
        body: `Many Stripe Atlas founders discover Form 5472 a year or two after forming their Delaware LLC. The IRS provides DIIRSP (Delinquent International Information Return Submission Procedure) as the standard catch-up:\n\n• File all missed years together as one package.\n• Include a Reasonable Cause Statement covering the entire period.\n• Submit via fax to +1-855-887-7737.\n• Most well-documented first-time foreign-owner catch-ups are accepted without penalty.\n\nOur multi-year DIIRSP packages:\n• 2-year catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included).\n• 3-year catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included).\n\n${NOTE_24H}\n\nThe Reasonable Cause Statement is auto-generated by our wizard, tailored to the first-time-foreign-owner / Stripe Atlas scenario. Every package is reviewed by an accountant on our team before we fax it.`,
      },
      {
        heading: "How do you switch from Delaware to Wyoming?",
        body: "Some foreign founders move their LLC from Delaware to Wyoming to save the $340/year difference in state fees ($400 Delaware vs $60 Wyoming). This is done via \"domestication\" — Delaware files a Certificate of Cessation, Wyoming files a Certificate of Domestication.\n\nProcess takes 2-4 weeks. Costs ~$200-$400 in filing fees plus your registered agent's time. The LLC keeps its EIN and continuity.\n\nBut: Form 5472 obligation is identical in both states. You're still a foreign-owned US LLC, still file Form 5472 + pro forma 1120, same federal penalty. Domestication only saves state fees.\n\nIf you raised from US investors who insisted on Delaware, you typically don't domesticate out — investors expect Delaware governing law. If you're a solo founder with no investor plans, Wyoming saves $340/year long-term.\n\nWe don't help with domestication — that's a registered agent or a Delaware/Wyoming business law firm task. We handle the federal Form 5472 in both states identically.",
      },
      {
        heading: "What is the bottom line for Delaware LLC owners?",
        body: `If you have a foreign-owned Delaware LLC:\n• File federal Form 5472 + pro forma 1120 every year by April 15. $25,000 penalty if missed.\n• Pay Delaware franchise tax $400 by June 1. State-level — separate from IRS.\n• No BOI report — since March 26, 2025, FinCEN has exempted US-formed entities (including Delaware LLCs) from Beneficial Ownership Information reporting.\n• Watch for state sales tax obligations as you scale.\n\nOur service handles the federal Form 5472 + 1120 from $149, with IRS fax delivery included. +${PRICE_ADDON} per additional past year. Every filing is reviewed by an accountant on our team. 100% money-back guarantee if we fail to submit.`,
      },
    ],
    faqs: [
      {
        q: "Does Delaware notify the IRS about my LLC?",
        a: "Delaware reports the LLC at formation when you got your EIN — that linked Delaware's entity number to your IRS records. Annual federal filings (including Form 5472) are your responsibility going forward; Delaware doesn't track them.",
      },
      {
        q: "Is the Delaware franchise tax separate from Form 5472?",
        a: "Yes. The $400 Delaware franchise tax (from tax year 2026) is paid to the Delaware Division of Corporations (state level). Form 5472 is filed with the IRS Ogden PIN Unit (federal level). They're completely separate; missing one doesn't affect the other.",
      },
      {
        q: "Can I move my LLC from Delaware to Wyoming to avoid the franchise tax?",
        a: "Yes, via domestication. Costs ~$200-$400 and takes 2-4 weeks. But Form 5472 obligation is identical in both states — domestication only saves state fees, not the federal filing requirement.",
      },
      {
        q: "I used Stripe Atlas — doesn't that include Form 5472?",
        a: "No. Stripe Atlas is a formation product. Their docs explicitly state they don't handle annual federal tax filings including Form 5472. Their optional ongoing services may include some help, but the standard Atlas formation product is one-time.",
      },
      {
        q: "What if I miss the Delaware franchise tax?",
        a: "Delaware imposes a $200 late penalty plus 1.5% monthly interest. After several missed years, Delaware can administratively dissolve your LLC. To reinstate you'd pay all back fees plus a reinstatement charge. Different from the IRS Form 5472 penalty, but still costly.",
      },
      {
        q: "Do I need a Delaware-based CPA?",
        a: "No. Form 5472 is a federal filing — any US CPA familiar with international information returns can prepare it. Most don't. Our service is built specifically for this filing and reviewed by an accountant on our team.",
      },
      {
        q: "Does Delaware have its own equivalent of Form 5472?",
        a: "No. Delaware doesn't impose a state-level analog of Form 5472. Your state filings are just the $400 franchise tax and any sales tax if you cross nexus thresholds.",
      },
      {
        q: "My Delaware LLC made no money in year 1 — do I still file Form 5472?",
        a: "Yes, almost certainly. If you had even one capital contribution (e.g. wiring money to fund the Mercury account or pay the Stripe Atlas fee), that's a reportable transaction. Most Delaware LLCs file every year regardless of revenue.",
      },
      {
        q: "Can I file Form 5472 before I file the Delaware franchise tax?",
        a: "Yes — they're independent. Form 5472 federal deadline is April 15; Delaware franchise tax deadline is June 1. File each on its own timeline.",
      },
      {
        q: "What's the cheapest year-1 federal compliance for a Stripe Atlas Delaware LLC?",
        a: `Federal: ${PRICE_STD} with our service on Standard (5-7 business days), ${PRICE_EXP} on Express (3 business days) or ${PRICE_24H} on 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order), fax delivery included. Add the $400 Delaware franchise tax = $599 total annual compliance on Standard. Add Stripe Atlas's one-time $500 formation cost (year 1 only) for full year-1 picture.`,
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "foreign-owned-llc-tax", "file-form-5472", "stripe-atlas-form-5472", "single-member-llc-foreign-owner"],
  },
  {
    slug: "form-5472-germany",
    keyword: "Form 5472 for German LLC owner",
    title: "Form 5472 for German Owners of US LLCs — Complete Guide",
    metaDescription:
      "Form 5472 for German owners of US LLCs covers the annual filing package, the FTIN field, common ownership scenarios, deadlines, and late-filing options.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
      { label: "IRC §6038A", url: "https://www.law.cornell.edu/uscode/text/26/6038A" },
    ],
    published: "2026-07-03",
    updated: "2026-09-11",
    h1: "Form 5472 for German-Resident Owners of US LLCs",
    intro:
      "German tax residents who own a single-member US LLC must file IRS Form 5472 with an attached pro forma Form 1120 every year, even if the LLC had zero US tax due. For the German tax ID field, use your Steuerliche Identifikationsnummer (Steuer-ID), not your Steuernummer or VAT ID.",
    howTo: {
      section: "How do you file Form 5472 as a German founder?",
      supplies: [
        "LLC legal name and EIN",
        "Owner passport details",
        "Steuer-ID",
        "Year-end financials",
        "Part V supporting statement",
      ],
    },
    sections: [
      {
        heading: "Why do German founders use US LLCs?",
        body: "German founders use US LLCs for faster formation, US-based payment processing, and platforms that prefer or require a US entity. A Wyoming or Delaware LLC can be set up in days for a few hundred dollars, unlike the slower GmbH path described later.\n\nCommon reasons German residents form a US LLC instead of (or alongside) a German GmbH or Einzelunternehmen:\n\n• Faster, cheaper formation — a Wyoming or Delaware LLC can be set up in days for a few hundred dollars, versus weeks and a notarized €25,000 minimum capital requirement for a GmbH.\n• US-based payment processing — Stripe, PayPal Business, and Mercury banking are simpler to access with a US entity for a US-focused or global customer base.\n• Platforms like Amazon.com or US-based SaaS marketplaces sometimes prefer or require a US entity for certain seller/vendor programs.\n\nThis is a business-structure choice, not a tax-avoidance one — the LLC is a disregarded entity for US federal tax purposes, and as a German tax resident you may still owe German tax on the LLC's income under German rules. Talk to a German Steuerberater about your German-side reporting; we handle the US federal Form 5472 side.",
      },
      {
        heading: "What is your FTIN as a German founder?",
        body: "Germany actually has three different numbers that get confused for each other:\n\n• Steuerliche Identifikationsnummer (Steuer-ID / IdNr) — an 11-digit personal number issued once, for life, by the Bundeszentralamt für Steuern (BZSt) when you register your address in Germany. This is your personal tax identifier and the one that best matches what Form 5472 Part II is asking for as your foreign tax identifying number (FTIN).\n• Steuernummer — a 10-11 digit number issued by your local Finanzamt, used for your German income tax filings. This is not the FTIN Form 5472 is asking about.\n• USt-IdNr (VAT ID) — a \"DE\" + 9-digit number for VAT purposes, tied to a business, not you personally. Also not the FTIN field.\n\nOn Form 5472 Part II, enter your Steuer-ID as the foreign tax identifying number. If you've never registered a German address (e.g., you're a German citizen living abroad), you may not have a Steuer-ID — in that case use a self-assigned reference ID or \"NA\", consistent with the IRS instructions for shareholders without a foreign tax ID.",
      },
      {
        heading: "What does the Germany-US tax treaty cover?",
        body: "The United States and Germany have an income tax treaty intended to prevent double taxation of the same income. Two things to keep separate:\n\n1. Form 5472 is an information return, not a tax return. It has nothing to do with treaty relief — you file it regardless of whether any US tax is actually owed, and the $25,000 penalty applies for a missing or incomplete filing even at $0 US tax liability.\n2. As a German tax resident, you may need to report your US LLC's income on your own German Einkommensteuererklärung (income tax return), potentially with a Foreign Tax Credit for any US tax paid. This is a German-side compliance question for a German tax professional — we don't advise on German tax law.\n\nWe handle the US federal Form 5472 + pro forma 1120 filing. The German reporting side is a separate, parallel obligation you'll want a Steuerberater to confirm.",
      },
      {
        heading: "What are common scenarios for German LLC owners?",
        body: "1. Amazon FBA seller with a Wyoming LLC: files Form 5472 + 1120 annually. Watch state sales tax nexus in states where Amazon stores inventory (Amazon's reports show you which states).\n\n2. SaaS founder with a Stripe Atlas Delaware LLC: files Form 5472 + 1120. Delaware also requires the separate $400/year franchise tax (state-level, unrelated to the IRS filing).\n\n3. Consultant or agency owner billing international clients through a US LLC: files Form 5472 + 1120. If you also have a German GmbH or sole proprietorship, that's a separate German filing — mention the US LLC relationship to your Steuerberater in case of related-party considerations.\n\n4. German owner who moved abroad and no longer has a German address: may not have a current Steuer-ID. Use a self-assigned reference ID on Form 5472 instead.\n\n5. Dormant US LLC with no transactions: if genuinely $0 activity all year, Form 5472 may not be required — but most owners file anyway since even a single capital contribution counts as a reportable transaction.",
      },
      {
        heading: "How do you file Form 5472 as a German founder?",
        body: "1. Gather your LLC info: legal name (exactly as on your CP-575 EIN letter), EIN, US registered agent address, state and date of formation, NAICS code.\n2. Gather your owner info: full legal name as on your passport, Steuer-ID (or self-assigned reference ID if you don't have one), German residential address, country of citizenship, country of tax residence (Germany).\n3. Add up year-end financials in USD: capital contributions in, distributions out, total assets at year-end, any related-party payments.\n4. Fill in pro forma Form 1120: entity identification only, stamp \"Foreign-Owned U.S. DE\" across the top.\n5. Fill in Form 5472: Parts I, II, III, IV, V, VII — your Steuer-ID goes in Part II's foreign tax ID field.\n6. Build the Part V supporting statement listing each reportable transaction.\n7. Sign in pen (or use our in-portal canvas signature, embedded into a printable PDF).\n8. Fax the complete package to +1-855-887-7737 (IRS Ogden PIN Unit). Keep the confirmation receipt as transmission evidence.",
      },
      {
        heading: "What does Form5472 Prep do for German owners?",
        body: `Our wizard accepts the German Steuer-ID format directly in the foreign tax ID field, and flags it clearly as separate from a Steuernummer or VAT ID so you don't enter the wrong one. Beyond that, the process is identical to any other country:\n\n• 12-question wizard, 15 minutes.\n• Full package generated: cover letter, pro forma 1120, Form 5472, Part V supporting statement, reasonable cause statement if filing late.\n• In-portal canvas signature — no printing, scanning, or uploading needed.\n• Accountant review before we fax to the IRS Ogden PIN Unit.\n• Timestamped fax confirmation receipt emailed back to you as transmission evidence.\n\nPricing: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — identical filing, IRS fax delivery included on every plan. +${PRICE_ADDON} per additional past year.`,
      },
      {
        heading: "How do you handle multi-year catch-up as a German owner?",
        body: `The DIIRSP catch-up path is to file all missed years together with one Reasonable Cause Statement covering the full period.\n\n• 2-year DIIRSP catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included).\n• 3-year DIIRSP catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included).\n\n${NOTE_24H}\n\nThe reasonable cause statement is auto-generated and tailored to the first-time foreign-owner scenario. An accountant on our team reviews every package before it's faxed to the IRS.`,
      },
      {
        heading: "What is the bottom line for German-resident LLC owners?",
        body: "German-resident LLC owners have two compliance tracks: the US federal Form 5472 + pro forma 1120 (our job), and German-side reporting of the LLC's income on their own tax return (your Steuerberater's job). Missing the US filing risks a $25,000 penalty per year, regardless of how much — or how little — US tax is actually owed.\n\nOur service handles the federal piece in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge.\n\nFor a longer walkthrough with German-specific examples, read [Form 5472 for Germany residents](/blog/form-5472-germany-residents-us-llc).",
      },
    ],
    faqs: [
      {
        q: "Which German tax number goes on Form 5472 — Steuer-ID, Steuernummer, or VAT ID?",
        a: "Use your Steuer-ID (Steuerliche Identifikationsnummer) — the 11-digit personal number from the Bundeszentralamt für Steuern. Your Steuernummer (local Finanzamt number) and USt-IdNr (VAT ID) serve different purposes and aren't the foreign tax ID Form 5472 is asking for.",
      },
      {
        q: "I don't have a Steuer-ID — what do I do?",
        a: "If you've never registered a German address (for example, you're a German citizen living abroad), you may not have one. In that case, use a self-assigned reference ID number on Form 5472, consistent with the IRS instructions for shareholders without a foreign tax ID.",
      },
      {
        q: "Does the Germany-US tax treaty mean I don't have to file Form 5472?",
        a: "No. Form 5472 is an information return, separate from income tax treaty relief. You file it regardless of whether any US tax is owed — the $25,000 penalty applies to a missing or incomplete filing even at $0 US tax liability.",
      },
      {
        q: "Do I need to report my US LLC's income on my German tax return too?",
        a: "Likely yes, as a German tax resident — but that's a German-side question for a Steuerberater, not something we advise on. We handle the US federal Form 5472 + pro forma 1120 filing only.",
      },
      {
        q: "My US LLC pays me in EUR to a German bank account — does that change the filing?",
        a: "No. All amounts on Form 5472 are reported in USD using the appropriate exchange rate for the transaction date, regardless of which currency or bank account the money actually moved through.",
      },
      {
        q: "I have both a German GmbH and a US LLC — does that complicate things?",
        a: "Potentially, if there are transactions between the two entities (related-party payments, shared services, etc.) — those need to be reported on Form 5472 Part IV. Mention the relationship to your accountant when filing so it's captured correctly.",
      },
      {
        q: "Can I file Form 5472 from Germany without a US address?",
        a: "Yes. The US address on the form is typically your registered agent's address, not a personal US address. You complete and fax the filing from anywhere, including Germany.",
      },
      {
        q: "My US LLC made no money last year — do I still need to file?",
        a: "Almost certainly yes. Even a single capital contribution (e.g., wiring money to fund the LLC's bank account) counts as a reportable transaction, which triggers the filing requirement regardless of revenue.",
      },
    ],
    relatedSlugs: ["foreign-owned-llc-tax", "single-member-llc-foreign-owner", "wyoming-llc-form-5472", "delaware-llc-form-5472", "diirsp"],
  },
  {
    slug: "form-5472-uae",
    keyword: "Form 5472 UAE resident US LLC",
    title: "Form 5472 for UAE Owners of US LLCs — Filing Guide",
    metaDescription:
      "Form 5472 for UAE owners of US LLCs covers the annual filing package, identification fields, common scenarios, deadlines, and multi-year catch-up filings.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
      { label: "IRC §6038A", url: "https://www.law.cornell.edu/uscode/text/26/6038A" },
    ],
    published: "2026-07-03",
    updated: "2026-09-11",
    h1: "Form 5472 for UAE Residents Who Own a US LLC",
    intro:
      "Dubai and Abu Dhabi-based founders who run a US LLC must file IRS Form 5472 with an attached pro forma Form 1120 every year. The UAE has no personal income tax and, for most individuals, no personal tax ID, so the filing needs the right substitute identification approach.",
    howTo: {
      section: "How do you file Form 5472 as a UAE founder?",
      supplies: [
        "LLC legal name and EIN",
        "Owner passport details",
        "UAE tax ID",
        "Year-end financials",
        "Part V supporting statement",
      ],
    },
    sections: [
      {
        heading: "Why do UAE-based founders use US LLCs?",
        body: "UAE-based founders use US LLCs for faster setup, US-based payment rails and banking, and customers or platforms that expect a US-based seller entity. A Wyoming or Delaware LLC can be formed in days for a few hundred dollars for an early-stage global business.\n\nCommon reasons UAE residents form a US LLC instead of, or alongside, a UAE mainland or free zone entity:\n\n• Faster, cheaper setup for an early-stage, US-focused or globally distributed business — a Wyoming or Delaware LLC can be formed in days for a few hundred dollars.\n• Easier access to US-based payment rails and banking — Stripe, Mercury, and PayPal Business are simpler to open with a US entity.\n• Customers or platforms (Amazon.com, US SaaS marketplaces) that expect or prefer a US-based seller entity.\n\nThis is a business-structure decision, not a way to avoid UAE obligations — if your UAE Corporate Tax or VAT registration status is affected by owning a foreign entity, that's a question for a UAE tax professional. We handle the US federal Form 5472 side.",
      },
      {
        heading: "What should you enter if you don't have a foreign tax ID?",
        body: "The UAE has no personal income tax, so most individuals never receive a personal tax identification number. The UAE Tax Registration Number (TRN), issued by the Federal Tax Authority (FTA), is for VAT and Corporate Tax and is tied to a registered business unless you personally cross the VAT (AED 375,000 turnover) or Corporate Tax (AED 1,000,000 turnover) registration thresholds.\n\nIf you don't have a TRN or any other UAE tax identifying number, Form 5472 Part II lets you enter a self-assigned reference ID number instead of a foreign tax ID — you don't need to apply to any government agency for this. Just reuse the same reference ID every year for consistency. Your Emirates ID is a residency/identity document, not a tax identifier, and doesn't go in this field.",
      },
      {
        heading: "How is UAE Corporate Tax separate from Form 5472?",
        body: "UAE Corporate Tax is separate from Form 5472. The UAE tax question depends on where the LLC's management and activity happen, whether you have a separate UAE business, and other jurisdiction-specific rules. Form 5472 is the US federal information return for the US LLC's activity.\n\nWhat we can say clearly: Form 5472 is a US federal information return, entirely separate from UAE Corporate Tax. You file it based on your US LLC's activity regardless of your UAE tax position. For the UAE side, talk to a UAE-licensed tax professional.",
      },
      {
        heading: "What are common scenarios for UAE-based owners?",
        body: "1. Dubai-based dropshipping or Amazon FBA store owner with a Wyoming LLC: files Form 5472 + 1120 annually. Watch US state sales tax nexus in states where inventory is stored.\n\n2. Abu Dhabi-based consultant or agency owner billing international clients through a Delaware LLC: files Form 5472 + 1120. Delaware also has a separate $400/year state franchise tax.\n\n3. UAE free zone company owner who also holds a separate US LLC: the US LLC filing is independent of the free zone company's UAE compliance, but mention the relationship to your accountant in case of related-party transactions between the two.\n\n4. SaaS founder with global (non-US) customers and a Stripe Atlas Delaware LLC: files Form 5472 + 1120 even though $0 US-source income is typical for this profile.\n\n5. Dormant US LLC with no activity all year: if truly zero transactions, filing may not be required — but most owners file anyway since a single capital contribution already counts.",
      },
      {
        heading: "How do you file Form 5472 as a UAE founder?",
        body: "1. Gather your LLC info: legal name (as on your CP-575 EIN letter), EIN, US registered agent address, state and date of formation, NAICS code.\n2. Gather your owner info: full legal name as on your passport, UAE tax ID if you have one (otherwise a self-assigned reference ID), UAE residential address, country of citizenship, country of tax residence.\n3. Add up year-end financials in USD: capital contributions in, distributions out, total assets at year-end, related-party payments.\n4. Fill in pro forma Form 1120: entity identification only, stamp \"Foreign-Owned U.S. DE\" across the top.\n5. Fill in Form 5472: Parts I, II, III, IV, V, VII.\n6. Build the Part V supporting statement listing each reportable transaction.\n7. Sign in pen, or use our in-portal canvas signature embedded into a printable PDF.\n8. Fax the complete package to +1-855-887-7737 (IRS Ogden PIN Unit). Keep the confirmation receipt as transmission evidence.",
      },
      {
        heading: "What does Form5472 Prep do for UAE owners?",
        body: `Our wizard handles the \"no foreign tax ID\" case cleanly — if you don't have a UAE TRN or other tax number, it walks you through the self-assigned reference ID option instead of leaving you stuck. Beyond that, the process is the same as anywhere else:\n\n• 12-question wizard, 15 minutes, accessible any time of day (no need to align with US business hours).\n• Full package generated: cover letter, pro forma 1120, Form 5472, Part V supporting statement, reasonable cause statement if filing late.\n• In-portal canvas signature — no printing, scanning, or uploading needed.\n• Accountant review before we fax to the IRS Ogden PIN Unit.\n• Email support is included on every filing — useful across the UAE's time zone gap with US business hours.\n\nPricing: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — identical filing, IRS fax delivery included on every plan. +${PRICE_ADDON} per additional past year.`,
      },
      {
        heading: "How do you handle multi-year catch-up as a UAE owner?",
        body: `The DIIRSP catch-up path is to file all missed years together with one Reasonable Cause Statement covering the full period.\n\n• 2-year DIIRSP catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included).\n• 3-year DIIRSP catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included).\n\n${NOTE_24H}\n\nThe reasonable cause statement is auto-generated and tailored to the first-time foreign-owner scenario. An accountant on our team reviews every package before it's faxed to the IRS.`,
      },
      {
        heading: "What is the bottom line for UAE-resident LLC owners?",
        body: "Owning a US LLC from the UAE means filing Form 5472 + pro forma 1120 every year regardless of the UAE's 0% personal income tax — the two systems don't offset each other. Most UAE-resident owners won't have a personal foreign tax ID to enter, and that's fine: a self-assigned reference ID is the correct, IRS-sanctioned workaround.\n\nOur service handles the federal filing in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge.\n\nFor a longer walkthrough with UAE-specific examples, read [Form 5472 for UAE residents](/blog/form-5472-uae-dubai-residents-us-llc).",
      },
    ],
    faqs: [
      {
        q: "I don't have a personal tax ID in the UAE — what do I put on Form 5472?",
        a: "Use a self-assigned reference ID number in place of a foreign tax ID. You don't need to apply anywhere for this — just pick a consistent identifier and reuse it every year. The IRS instructions specifically allow this when a shareholder has no foreign tax identifying number.",
      },
      {
        q: "Is my Emirates ID my tax ID for this form?",
        a: "No. Your Emirates ID is a national identity and residency document, not a tax identifier. It doesn't go in Form 5472's foreign tax ID field.",
      },
      {
        q: "Does the UAE's 0% personal income tax mean I owe nothing in the US either?",
        a: "Usually yes on actual tax owed, but that's separate from the filing requirement. Form 5472 is an information return — the $25,000 penalty applies for a missing or incomplete filing even when zero US tax is actually due.",
      },
      {
        q: "Does UAE Corporate Tax affect my Form 5472 filing?",
        a: "No — they're separate systems. Whether your US LLC creates any UAE Corporate Tax exposure is a UAE-side question for a licensed UAE tax professional. Form 5472 is a US federal filing you complete regardless of your UAE tax position.",
      },
      {
        q: "I have a UAE free zone company and a separate US LLC — does that complicate the filing?",
        a: "Only if there are transactions between the two entities, which would need to be reported on Form 5472 Part IV as related-party transactions. Mention the relationship when you file so it's captured correctly.",
      },
      {
        q: "Can I file Form 5472 from the UAE without being in the US?",
        a: "Yes. The US address on the form is typically your registered agent's address, not a personal US address. The whole process — including fax submission — is handled without you needing to be physically present in the US.",
      },
      {
        q: "My US LLC made no money last year — do I still need to file?",
        a: "Almost certainly yes. Even a single capital contribution, like wiring money to open the LLC's US bank account, counts as a reportable transaction and triggers the filing requirement.",
      },
      {
        q: "Is there a time-zone issue getting this filed from the UAE?",
        a: "No — our wizard, portal, and email support are available any time. Email support is included on every filing, and most UAE customers find written correspondence easier across the time difference than phone calls during US business hours.",
      },
    ],
    relatedSlugs: ["foreign-owned-llc-tax", "single-member-llc-foreign-owner", "wyoming-llc-form-5472", "delaware-llc-form-5472", "diirsp"],
  },
  {
    slug: "pro-forma-1120",
    keyword: "pro forma 1120",
    title: "Pro Forma Form 1120 — What It Is and How to Fill It Out",
    metaDescription:
      "Pro forma Form 1120 accompanies Form 5472 for foreign-owned US disregarded LLCs. Learn which identifying fields to complete, what stays blank, and how to file.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
      { label: "IRS: Instructions for Form 1120", url: "https://www.irs.gov/instructions/i1120" },
    ],
    published: "2026-05-19",
    updated: "2026-09-11",
    h1: "Pro Forma Form 1120 — Plain-English Guide",
    intro:
      "Foreign-owned US single-member LLCs file pro forma Form 1120 as the procedural envelope for Form 5472 in the full IRS package. In this context, \"pro forma\" means most of Form 1120 stays blank, with entity identification fields completed and \"Foreign-Owned U.S. DE\" stamped at the top.",
    sections: [
      {
        heading: "What does 'pro forma' mean here?",
        body: "Pro forma means filing Form 1120 for procedural compliance, not to calculate tax. For a foreign-owned disregarded LLC, the 1120 is mostly blank because income flows to the owner, not the entity. It serves as the attachment envelope the IRS requires for Form 5472.\n\nDo NOT fill in income, deductions, or tax calculations on a pro forma 1120. Doing so would incorrectly suggest your LLC is a real C-corporation owing US tax. The IRS specifically designed the pro forma format to keep your LLC's disregarded-entity status intact while still satisfying the §6038A reporting attachment requirement.",
      },
      {
        heading: "Which fields do you fill in on the pro forma 1120?",
        body: "You fill in the foreign-owned U.S. DE’s name, address, item B (EIN), and applicable item E boxes on Form 1120 page 1. Item E contains Initial return, Final return, Name change and Address change—not an amended-return box. Write \"Foreign-owned U.S. DE\" across the top.\n\nItems C and D and Schedule L are not required by that special pro forma instruction. Do not treat an omitted optional cover field as permission to leave Form 5472 line 1c blank. See [Form 5472 line 1c and total assets](/blog/form-5472-line-1c-total-assets).\n\nFor signing, identify the authorized signer. Signing the completed cover in ink, then scanning it for fax, is a conservative workflow; see [signature methods and submission routes](/blog/form-5472-pro-forma-1120-signature).",
      },
      {
        heading: "Which fields do you leave blank on the pro forma 1120?",
        body: "For this foreign-owned U.S. DE pro forma package, the special IRS required-fields instruction is limited to name, address, item B and item E. It does not require income, deduction or tax computations, or Schedules C, J, K, L, M-1 or M-2.\n\nLeave unrelated corporate-return computations and schedules blank rather than inventing entries. Items C and D are also outside the special required list. Form 5472 has its own requirements, including line 1c; see the total-assets guide.",
      },
      {
        heading: "What is the 'Foreign-Owned U.S. DE' stamp?",
        body: "The \"Foreign-Owned U.S. DE\" stamp is the visible notation the IRS instructions require at the top of Form 1120 page 1. It tells the IRS Ogden PIN Unit how to route the return, link the Form 5472 attachment, and avoid regular 1120 processing.\n\n\"Foreign-Owned U.S. DE\"\n\nThis tells the IRS Ogden PIN Unit how to route and process the return. Without this stamp:\n\n• The IRS may try to process it as a regular 1120 — triggering deficiency notices for missing income data.\n• The Form 5472 attachment may not be correctly linked to your LLC.\n• The return may be misrouted within the IRS, delaying processing.\n• Worst case: the filing is treated as incomplete, triggering the $25,000 §6038A penalty.\n\nYou can hand-write it, type it, or stamp it — any visible \"Foreign-Owned U.S. DE\" notation at the top margin works. Our wizard automatically adds this text when generating the PDF.",
      },
      {
        heading: "Why a 'pro forma' format and not a separate form?",
        body: "The IRS doesn't have a dedicated form for foreign-owned DE disclosure. Form 5472 was designed for 25%+ foreign-owned US corporations (where the corporation files a real Form 1120). When the IRS extended §6038A to foreign-owned single-member LLCs in 2017, they needed a way to receive Form 5472 attachments — but those LLCs aren't real corporations and don't owe corporate tax.\n\nThe pro forma 1120 solution: file the existing 1120 structure with only the procedural fields completed, marked \"Foreign-Owned U.S. DE\" to flag the special status. This avoided creating a brand-new form and integrated cleanly into the existing IRS Ogden processing channel.\n\nThe downside: it's confusing for foreign LLC owners who see \"file Form 1120\" and assume their LLC has become a corporation. It hasn't — your LLC stays a disregarded entity for all other tax purposes.",
      },
      {
        heading: "How do you file the complete package?",
        body: "Once your pro forma 1120 is filled and stamped, the full package order is:\n\n1. Cover letter (1 page) identifying the filing.\n2. Pro forma Form 1120 (1-2 pages, with the \"Foreign-Owned U.S. DE\" stamp).\n3. Form 5472 (2 pages).\n4. Part V supporting statement (1+ pages).\n5. Reasonable Cause Statement (only if filing late under DIIRSP).\n\nFor a conservative signing workflow, sign the completed 1120 cover in ink and scan that page for fax. Use the [1120 pro forma instructions](/1120-pro-forma-instructions) as a final field-by-field check, then fax the entire package to the IRS Ogden PIN Unit at +1-855-887-7737. Save the fax transmission receipt as transmission evidence.\n\nOur service generates the entire correctly-formatted package automatically. You sign one PDF on screen (the signature embeds into every required signature box), an accountant on our team reviews it, and we fax it to the IRS. IRS fax delivery is included in every plan — no separate fee.",
      },
      {
        heading: "What are common mistakes on pro forma 1120?",
        body: "• Filling in income/deductions/tax: turns it into a real corporate return, can trigger US tax liability and audits.\n• Writing \"0\" in blank fields instead of leaving empty: technically incorrect; the IRS instructions specify these fields stay empty.\n• Missing the \"Foreign-Owned U.S. DE\" stamp: causes routing/processing issues at Ogden.\n• Wrong tax year: form is for the tax year that ENDED, not the year you're filing in. 2024 return = tax year 2024 = filed by April 15, 2025.\n• Wrong EIN: must match your CP-575 exactly. A digit transposition can trigger rejection.\n• Unresolved signature method or authority: Form 5472 has no signature block. Signing the completed 1120 cover in ink is conservative practice, not a basis for declaring every other method invalid.\n• Filing only the 1120 without Form 5472 attached: the whole point is the 5472 attachment; missing it defeats the purpose.\n• Filing only Form 5472 without the pro forma 1120: also invalid; the IRS won't process a 5472 without its envelope.",
      },
      {
        heading: "What's the difference between pro forma 1120 and regular Form 1120?",
        body: "Pro forma 1120 is a procedural envelope for foreign-owned DEs, while regular Form 1120 is a real corporate income tax return. The pro forma version leaves most fields blank, owes no tax, carries the \"Foreign-Owned U.S. DE\" stamp, and supports Form 5472.\n\nRegular Form 1120 (for real US C-corporations):\n• Real corporate income tax return.\n• All income, deductions, and tax fields filled.\n• Tax owed at corporate rates (21% federal).\n• No special stamp.\n• Filed once a year by April 15 (calendar-year corps).\n\nIf your LLC was structured as a C-corp election (Form 8832 \"check the box\" election to be taxed as a corporation), you'd file a regular 1120, not pro forma. Most foreign-owned LLCs do NOT make this election and remain disregarded entities.",
        table: {
          caption: "Pro forma 1120 versus regular Form 1120",
          columns: ["Aspect", "Pro forma 1120", "Regular 1120"],
          rows: [
            ["Purpose", "Procedural envelope", "Real corporate income tax return"],
            ["Fields", "Most fields blank", "Income, deductions, tax fields filled"],
            ["Tax owed", "No tax", "21% federal corporate rate"],
            ["Stamp", "Foreign-Owned U.S. DE", "No special stamp"],
            ["Entity type", "Foreign-owned DEs", "Real US C-corporations"],
          ],
        },
      },
      {
        heading: "What about Form 1120-F or 1120-S?",
        body: "Form 1120-F: \"U.S. Income Tax Return of a Foreign Corporation.\" Filed by foreign corporations (not US-formed entities) that have US-source income or a US trade or business. Your foreign-owned US LLC is a domestic (US) entity, not a foreign corporation — so 1120-F doesn't apply to your LLC.\n\nForm 1120-S: filed by S-corporations. S-corps require all owners to be US persons, so foreign-owned LLCs can never elect S-corp status. 1120-S is never the right form for a foreign owner.\n\nForm 1120 (regular): filed by US C-corporations. Pro forma 1120 (same form, used differently) is the right answer for foreign-owned single-member LLCs.\n\nSummary: 1120 pro forma = right; 1120-F = wrong (you're not a foreign corp); 1120-S = wrong (foreign owners can't have S-corps); 1065 = wrong (single-member LLCs aren't partnerships).",
      },
      {
        heading: "Use our pre-filled pro forma 1120",
        body: `Our wizard generates a correctly-formatted pro forma Form 1120 with:\n\n• \"Foreign-Owned U.S. DE\" stamp at the top.\n• Entity name, EIN, US address pre-filled from your wizard answers.\n• Date of incorporation pre-filled.\n• Total assets at year-end pre-filled from your year-end total.\n• Signature line ready for your in-portal canvas signature.\n• All income/deduction/tax fields correctly left blank.\n• Any populated item C, item D or Schedule L fields are additional preparation practice, not requirements of the special pro forma instruction.\n\nNo manual form-filling. The signed PDF is ready to fax to +1-855-887-7737, and we handle that for you — IRS fax delivery is included in every plan.\n\nPricing: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — same filing on every plan. +${PRICE_ADDON} per additional past year. 100% money-back guarantee if we fail to submit.`,
      },
    ],
    faqs: [
      {
        q: "Do I need to fill in Schedule L (balance sheet)?",
        a: "No. Schedule L is outside the special pro forma required-fields instruction for foreign-owned U.S. DEs. The required cover information is the name, address, item B and applicable item E boxes. Form 5472 line 1c is a separate asset-reporting question.",
      },
      {
        q: "Can I e-file the pro forma 1120?",
        a: "No. Foreign-owned disregarded entities are explicitly excluded from e-filing for 1120 and 5472. The IRS Modernized e-File system can't process them. Fax (+1-855-887-7737) or paper mail (Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201) only.",
      },
      {
        q: "Do I need to attach Form 1125-A or 1125-E?",
        a: "No. Those schedules are for active C-corporations with cost of goods sold or executive compensation. Pro forma 1120 for foreign-owned DEs doesn't require them — leave them out entirely.",
      },
      {
        q: "What if my LLC has subsidiaries?",
        a: "If your foreign-owned LLC owns other entities, each subsidiary may need its own Form 5472 + pro forma 1120 depending on the structure. Get a CPA involved for multi-entity setups — our wizard supports single-entity filings only.",
      },
      {
        q: "Do I file pro forma 1120 if my LLC owes US tax?",
        a: "No. If your LLC actually has US-source effectively connected income and owes corporate tax, you'd file a full Form 1120 (not pro forma) with all income and tax calculations. This is rare for foreign-owned single-member LLCs but happens with US warehouse/employee setups. Consult a CPA.",
      },
      {
        q: "Should I fill in 'foreign-owned' on item A?",
        a: "Item A is for specific check-box situations (consolidated return, personal holding co, etc.) — not typically for foreign-owned DEs. The \"Foreign-Owned U.S. DE\" stamp at the top is what flags your status, not Item A.",
      },
      {
        q: "What goes in Item D — total assets?",
        a: "Item D is not among the fields required by the special foreign-owned U.S. DE pro forma instruction. That does not make Form 5472 line 1c optional or zero. If you choose to populate item D, use a supported figure consistent with the records and accounting basis.",
      },
      {
        q: "Do I sign the 1120 or the 5472?",
        a: "Form 1120 page 1 has the signature block; Form 5472 does not. Signing the completed cover in ink and scanning it for fax is a conservative workflow. The special pro forma instruction does not separately resolve signing, and electronic-signature approval depends on the document and route.",
      },
      {
        q: "Can I use last year's pro forma 1120 as a template?",
        a: "Yes. The structure is identical year over year — only the year, total assets, and dates change. Our wizard pre-fills from your prior year's filing if you're a return customer.",
      },
      {
        q: "What if I forget the 'Foreign-Owned U.S. DE' stamp?",
        a: "The filing may be misrouted or processed incorrectly. If you've already faxed without it, you can fax a corrected version with the stamp added. Better: catch the missing stamp before sending. Our wizard adds it automatically.",
      },
    ],
    relatedSlugs: ["form-5472-vs-1120", "file-form-5472", "form-5472-instructions", "form-1120-disregarded-entity", "form-1120-foreign-owned-llc"],
  },
  {
    slug: "form-1120-foreign-owned-llc",
    keyword: "form 1120 foreign owned LLC",
    title: "Form 1120 for Foreign-Owned LLC — Pro Forma Filing Guide",
    metaDescription:
      "Form 1120 for a foreign-owned LLC is filed pro forma with Form 5472. Learn what to complete, what to leave blank, and how to assemble and submit the package.",
    sources: [
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: Single-member LLCs", url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" },
    ],
    published: "2026-05-19",
    updated: "2026-09-11",
    h1: "Form 1120 for Foreign-Owned LLCs",
    intro:
      "Non-US owners of US single-member LLCs must file Form 1120 in a special \"pro forma\" version where almost every field stays blank. The 1120 acts as the envelope for Form 5472, and filing it does not by itself subject the LLC to US corporate income tax.",
    sections: [
      {
        heading: "Why does a foreign-owned LLC file 1120 at all?",
        body: "A foreign-owned LLC files Form 1120 because IRS regulations require Form 5472 to attach to a tax return. For foreign-owned disregarded entities, the IRS picked Form 1120 as the procedural vehicle, but the pro forma cover does not create corporate income tax.\n\nYou file a pro forma (mostly blank) 1120 as the cover sheet for your Form 5472. This does NOT make your LLC subject to US corporate tax. The pro forma 1120 is paperwork only — your LLC remains a disregarded entity for all other tax purposes.",
      },
      {
        heading: "What does 'pro forma' mean in this context?",
        body: "Pro forma means Form 1120 is filed for procedural compliance, not to calculate tax. A real Form 1120 has income, deduction and tax fields filled in, while a foreign-owned DE's pro forma 1120 has only entity identification fields filled in.\n\nA real Form 1120 (filed by US C-corporations) has all income/deduction/tax fields filled in. A pro forma 1120 (filed by foreign-owned DEs) has only the entity identification fields filled in.\n\nThe special signal that tells the IRS you're filing pro forma: the stamp \"Foreign-Owned U.S. DE\" at the top of page 1. Without that stamp, the IRS may attempt to process the return as a real corporate filing — triggering deficiency notices, tax bills, or refund offsets that are all incorrect for a disregarded entity.",
      },
      {
        heading: "What do you fill in on the pro forma 1120?",
        body: "The special IRS Form 5472 instructions require only the foreign-owned U.S. DE’s name, address, item B (EIN), and applicable item E boxes on Form 1120 page 1. Item E contains Initial return, Final return, Name change and Address change—not an amended-return box. Write \"Foreign-owned U.S. DE\" across the top.\n\nItems C and D and Schedule L are not required by that special pro forma instruction. Do not treat an omitted optional cover field as permission to leave Form 5472 line 1c blank. See Form 5472 line 1c and total assets.\n\nFor signing, identify the authorized signer. Signing the completed cover in ink, then scanning it for fax, is a conservative workflow; see signature methods and submission routes.",
      },
      {
        heading: "What do you leave blank on the pro forma 1120?",
        body: "For this foreign-owned U.S. DE pro forma package, the special IRS required-fields instruction is limited to name, address, item B and item E. It does not require income, deduction or tax computations, or Schedules C, J, K, L, M-1 or M-2.\n\nLeave unrelated corporate-return computations and schedules blank rather than inventing entries. Items C and D are also outside the special required list. Form 5472 has its own requirements, including line 1c; see the total-assets guide.",
      },
      {
        heading: "How do you sign the pro forma 1120?",
        body: "Sign the pro forma 1120 using the Form 1120 page 1 signature block because Form 5472 has no taxpayer signature block. The relevant fields are officer signature, date, title and paid-preparer details, with ink signing and scanning described as a conservative workflow.\n\nThe special pro forma instruction does not separately address signatures. A conservative workflow is to have the authorized person sign the completed cover in ink, enter the actual signing date and capacity, and scan that signed page for fax. This is a recommendation, not a ruling that every digital-only signature invalidates a filing.\n\nIRS electronic-signature permission depends on the document and route. Corporate e-file authorization rules do not automatically cover this DE fax package. Ask the preparer to establish signing authority and the applicable method; the general Form 1120 instructions separately address paid preparers. See the current signature guide.",
      },
      {
        heading: "How do you file the complete package?",
        body: "1. Cover letter (1 page) identifying the filing.\n2. Pro forma Form 1120 (signed, stamped \"Foreign-Owned U.S. DE\").\n3. Form 5472 attached behind the 1120.\n4. Part V supporting statement listing each reportable transaction.\n5. Reasonable Cause Statement (only if late under DIIRSP).\n\nUse the [1120 pro forma instructions](/1120-pro-forma-instructions) to check the page-one fields, then fax the complete package to the IRS Ogden PIN Unit at +1-855-887-7737. Save the transmission receipt as your transmission evidence.\n\nDo NOT mail or fax Form 1120 to the regular IRS processing center. The Ogden PIN Unit is the only correct destination for foreign-owned DE filings — sending it elsewhere will cause routing problems and may not satisfy your filing obligation.\n\nMail alternative: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201. Use certified mail with return receipt as transmission evidence.",
      },
      {
        heading: "What are common mistakes specific to pro forma 1120?",
        body: "• Filling in income or deductions: treats the LLC as a real C-corp and can trigger tax processing. Leave those lines empty.\n• Missing the \"Foreign-Owned U.S. DE\" stamp: causes routing issues at Ogden.\n• Assuming a generic e-signature tool is authorized for this specific document and filing route; resolve that question before sending.\n• Attaching Form 1125-A (Cost of Goods Sold) or 1125-E (Officer Comp): not needed and confuses processing.\n• Wrong tax year on the form header: must be the tax year that ENDED, not the year you're filing in.\n• Wrong EIN: must match CP-575 exactly.\n• Sending only the 1120 without Form 5472 attached: defeats the entire purpose.\n• Mailing to a regular IRS processing center instead of Ogden PIN Unit.\n• Filing electronically: not supported for foreign-owned DEs.",
      },
      {
        heading: "How are foreign-owned multi-member LLCs different?",
        body: "Foreign-owned multi-member LLCs are different because they are partnerships for tax purposes, not disregarded entities. They file Form 1065 instead of Form 1120, may need Form 8865 and Schedule K-1 for each partner, and require more complex international partnership compliance.\n\nWith foreign partners, the multi-member LLC may also need Form 8865 (Information Return of US Persons With Respect to Certain Foreign Partnerships) and Schedule K-1 for each partner. The compliance is significantly more complex than the single-member case.\n\nOur service is built specifically for single-member, foreign-owned, disregarded LLCs. Multi-member LLCs need a CPA familiar with international partnerships.",
        table: {
          caption: "Entity type and federal filing path",
          columns: ["Entity", "Federal return", "Form 5472?"],
          rows: [
            ["Single-member foreign-owned LLC", "Pro forma Form 1120", "Attached to the 1120"],
            ["Multi-member foreign-owned LLC", "Form 1065", "Not covered by our service"],
            ["Foreign partners", "May need Form 8865", "CPA review needed"],
          ],
        },
      },
      {
        heading: "What are the state 1120 filings?",
        body: "Some states require their own corporate income tax return separate from the federal 1120. Whether you owe a state 1120 depends on the state of formation and where you conduct business:\n\n• Wyoming: no state corporate income tax. No state 1120.\n• Delaware: no state corporate income tax on LLCs that don't conduct business in DE. Just the $400 franchise tax.\n• Florida: no state corporate income tax (LLCs taxed as DEs).\n• Nevada: no state corporate income tax.\n• Texas: franchise tax but $0 due for most small LLCs; report still required.\n• New Mexico: no state income tax on disregarded LLCs.\n• California, New York, others: state corporate income tax may apply if your LLC has any nexus with the state.\n\nFor the popular foreign-owner states (Wyoming, Delaware, NM, FL, NV), no state 1120 equivalent is required. Just the federal pro forma 1120.",
      },
      {
        heading: "Get it done in 15 minutes",
        body: `Our service generates a perfectly-formatted pro forma 1120 + Form 5472 package automatically. You answer 12 questions in a wizard, we generate the PDF, you sign one page on screen (the signature embeds into every required signature box), and an accountant on our team reviews everything before we fax it to the IRS.\n\nPricing: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — identical filing, IRS fax delivery included. +${PRICE_ADDON} per additional past year for multi-year DIIRSP catch-up. 100% money-back guarantee if we fail to submit your filing.`,
      },
    ],
    faqs: [
      {
        q: "Does filing pro forma 1120 mean my LLC owes US corporate income tax?",
        a: "No. The pro forma 1120 is procedural only. Your LLC remains a disregarded entity for tax purposes and doesn't pay US corporate income tax. The blank income/tax fields and \"Foreign-Owned U.S. DE\" stamp tell the IRS to treat this as a pro forma filing.",
      },
      {
        q: "Do I file a state Form 1120?",
        a: "Only if you formed in a state with corporate income tax (California, New York, etc.) or have nexus there. Wyoming, Delaware, Florida, Nevada, Texas, and New Mexico don't have state corporate income tax on LLCs.",
      },
      {
        q: "Can I file Form 1120 electronically (e-file)?",
        a: "No. Foreign-owned disregarded entities are explicitly excluded from e-filing for Form 1120 and Form 5472. Fax to +1-855-887-7737 or mail to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 only.",
      },
      {
        q: "Do I attach a Schedule C for cost of goods sold?",
        a: "No. Schedule C of Form 1120 is for dividends and special deductions (different from the Schedule C on Form 1040). For pro forma 1120, no Schedule C attachment is needed — your LLC is disregarded.",
      },
      {
        q: "What if I made a mistake on a prior year's pro forma 1120?",
        a: "Review the actual filed package and determine whether a correction is needed. Neither current Form 1120 nor Form 5472 has an amended-return checkbox. When a corrected package is appropriate, clearly identify it with an amended notation and an explanation linking it to the original filing; this is a preparer workflow, not a prescribed special IRS amendment procedure. A correction does not guarantee penalty relief.",
      },
      {
        q: "Can the 1120 signature be a digital signature?",
        a: "Do not assume a generic e-signature tool is approved for this filing. The special DE package uses fax or mail, not ordinary corporate e-file. Signing the completed pro forma 1120 in ink and scanning it for fax is a conservative workflow; see signature methods and their limits.",
      },
      {
        q: "Do I file pro forma 1120 if my LLC is dormant?",
        a: "If your LLC had any reportable transaction (even one capital contribution), yes. If truly $0 activity for the year, you may have an argument that no filing is required — but most owners file regardless to avoid the $25,000 penalty risk.",
      },
      {
        q: "What address do I put on the 1120?",
        a: "The US business address shown on your CP-575 EIN confirmation letter — typically your registered agent's address. The IRS will mail any notices here, so make sure it can actually receive mail.",
      },
      {
        q: "Does pro forma 1120 work for tax year 2025?",
        a: "Yes. The pro forma 1120 format applies to any tax year since the §6038A rule extension to foreign-owned DEs in 2017. The form's structure may change slightly year to year (always download the current year's blank form from irs.gov), but the pro forma approach is the same.",
      },
      {
        q: "What if I owe US tax — should I still file pro forma?",
        a: "No. If your LLC genuinely owes US corporate income tax (rare for foreign-owned single-member LLCs but possible with US warehouse/employees/real estate), file a full Form 1120 with income, deductions, and tax. Consult a CPA familiar with foreign owners — our service doesn't handle the full-1120 case.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-5472-vs-1120", "file-form-5472", "form-1120-disregarded-entity", "1120-pro-forma-instructions"],
  },
  {
    slug: "form-1120-disregarded-entity",
    keyword: "form 1120 disregarded entity",
    title: "Form 1120 for a Disregarded Entity — Foreign Owner Filing",
    metaDescription:
      "Form 1120 for a foreign-owned disregarded entity is a pro forma attachment to Form 5472. Learn why it is required and how to complete and submit it.",
    sources: [
      { label: "Reg. §301.7701-2", url: "https://www.ecfr.gov/current/title-26/section-301.7701-2" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
    ],
    published: "2026-05-19",
    updated: "2026-09-11",
    h1: "Form 1120 for a Disregarded Entity (Foreign Owner)",
    intro:
      "A US LLC owned by a single non-US person is a \"disregarded entity,\" but it still files Form 1120 because Form 5472 must attach to a tax return. Treasury Regulation § 1.6038A-1 uses pro forma Form 1120 as the IRS-specified attachment vehicle for that filing.",
    sections: [
      {
        heading: "What is a disregarded entity?",
        body: "A disregarded entity (DE) is a business entity (usually an LLC) that has just one owner and hasn't elected to be taxed as a corporation. The IRS \"disregards\" the entity for federal income tax purposes — meaning income and deductions flow through to the owner directly, as if the entity didn't exist.\n\nFor a US LLC owned by one non-US person, the LLC is automatically a disregarded entity unless you affirmatively elect C-corp or S-corp taxation by filing Form 8832 (most foreign owners shouldn't do this).\n\nThe disregarded-entity status means:\n• The LLC has no separate US income tax liability.\n• Income/losses flow to the owner's personal tax situation.\n• For a foreign owner with no US trade or business and no US-source income, this typically means $0 in US federal income tax.\n• The LLC still legally exists at the state level (Wyoming, Delaware, etc.) as a separate entity for liability protection.",
      },
      {
        heading: "Why does a disregarded entity file Form 1120?",
        body: "A disregarded entity files Form 1120 only when it is a foreign-owned single-member LLC using the pro forma cover for Form 5472. Since 2017, these entities are treated as separate domestic corporations solely for Form 5472 reporting, not full corporate taxation.\n\nThe exception is foreign-owned single-member LLCs treated as DEs. Since 2017, Treasury Regulation § 1.6038A-1 says these entities are treated as separate domestic corporations \"solely for purposes of\" Form 5472 reporting under IRC § 6038A. So they file Form 5472 — and the only way the IRS accepts Form 5472 is as an attachment to Form 1120.\n\nThe 1120 is filed \"pro forma\" — mostly empty — as a procedural cover sheet. Filling it in fully would incorrectly suggest your LLC is a real C-corp.\n\nThe procedural status (file 1120 as the envelope for 5472) does not change the substantive tax status (LLC remains disregarded, owes no corporate tax).",
      },
      {
        heading: "What is the regulatory history of Form 5472?",
        body: "Before 2017, foreign-owned single-member US LLCs weren't required to file Form 5472. The IRS treated them purely as disregarded entities with no federal filing obligation. As a result, foreign owners could form a US LLC, move large amounts of money through it, and never disclose anything to the US government.\n\nThis became a known transparency loophole — non-US persons could use US LLCs to obscure beneficial ownership for tax avoidance, money laundering, or sanctions evasion.\n\nIn December 2016, the IRS issued final regulations under § 1.6038A-1 extending §6038A reporting to foreign-owned domestic disregarded entities, effective for tax years beginning January 1, 2017. The regulation specifically created the \"pro forma 1120 as attachment vehicle\" approach because there was no existing form for disclosure-only filings.\n\nSince then, every foreign-owned single-member US LLC has had to file Form 5472 + pro forma 1120 annually. Penalty: $25,000 per missed form per year under IRC § 6038A(d).",
      },
      {
        heading: "What does the pro forma 1120 look like?",
        body: "The special IRS Form 5472 instructions require only the foreign-owned U.S. DE’s name, address, item B (EIN), and applicable item E boxes on Form 1120 page 1. Item E contains Initial return, Final return, Name change and Address change—not an amended-return box. Write \"Foreign-owned U.S. DE\" across the top.\n\nItems C and D and Schedule L are not required by that special pro forma instruction. Do not treat an omitted optional cover field as permission to leave Form 5472 line 1c blank. See [Form 5472 line 1c and total assets](/blog/form-5472-line-1c-total-assets).\n\nFor signing, identify the authorized signer. Signing the completed cover in ink, then scanning it for fax, is a conservative workflow; see [signature methods and submission routes](/blog/form-5472-pro-forma-1120-signature).",
      },
      {
        heading: "What does 'solely for purposes of' mean in practice?",
        body: "\"Solely for purposes of\" means the LLC is treated as a corporation only for Section 6038A reporting. It does not create U.S. corporate income tax, change disregarded status, require estimated payments, create employee withholding obligations, or trigger 1120-W estimated tax requirements.\n\nIt does NOT:\n• Make the LLC subject to US corporate income tax.\n• Change the LLC's disregarded status for other tax purposes.\n• Require the LLC to file estimated tax payments.\n• Create employee withholding obligations.\n• Require quarterly returns.\n• Make the LLC liable for accumulated earnings tax or personal holding company tax.\n• Trigger 1120-W estimated tax requirements.\n\nThe LLC is treated as a corporation ONLY to satisfy the procedural requirement that Form 5472 attach to a tax return. For everything else (income tax liability, owner's personal taxation, state tax treatment), the LLC stays a disregarded entity.",
      },
      {
        heading: "How do you file Form 5472 and pro forma 1120?",
        body: "Foreign-owned DE filings go ONLY to the IRS Ogden PIN Unit:\n\n• Fax: +1-855-887-7737 (preferred — fast, with a timestamped transmission receipt as transmission evidence).\n• Mail: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 (retain mailing and delivery evidence).\n\nDo NOT send to the regular Form 1120 processing addresses listed in the standard 1120 instructions. Those addresses are for real corporate returns and your pro forma filing will be misrouted or treated as a real corporate filing — which can trigger collection notices and tax liability for tax you don't actually owe.\n\nThe Ogden PIN Unit is the dedicated team within IRS Ogden that handles foreign-owned DE filings. The \"Foreign-Owned U.S. DE\" stamp on the 1120 is what tells them to route to this team.",
      },
      {
        heading: "What if you elect C-corp taxation?",
        body: "If you actively elect C-corp taxation by filing Form 8832 (Entity Classification Election), your LLC is no longer a disregarded entity. It becomes a real US corporation that owes corporate income tax (currently 21% federal flat rate) on its worldwide income — including all foreign-source revenue.\n\nFor most foreign owners, this is a bad idea:\n• You'd owe US tax on profits earned abroad selling to non-US customers.\n• You'd need to file full Form 1120 (not pro forma) with income, deductions, and tax calculation.\n• Distributions to you would be dividends — potentially subject to 30% US withholding (or treaty rate).\n• Your US tax bill could go from $0 to substantial.\n\nKeep the default disregarded entity classification unless you've consulted a US tax professional about a specific reason to elect C-corp status (e.g. you're optimizing for a future US sale of the entity).",
      },
      {
        heading: "What if you elect S-corp taxation?",
        body: "S-corp taxation is not available for a US LLC owned by a foreign person. S-corporations require all owners to be US persons, so a foreign-person owner disqualifies the election, and the IRS will reject it or unwind improper S-corp returns.\n\nIf you (a foreign person) try to elect S-corp status for your US LLC, the IRS will reject the election. If you somehow filed S-corp returns despite ineligibility, the IRS would unwind it and assess back taxes.\n\nIgnore S-corp paths entirely if you're a foreign owner. Disregarded entity (default) or C-corp election (Form 8832) are your only legitimate options.",
      },
      {
        heading: "What are common confusions about these forms?",
        body: "Common confusion starts with assuming disregarded means no filings, but foreign-owned DEs still file Form 5472 plus pro forma 1120 annually. The pro forma 1120 is only a procedural vehicle, and a full 1120 is wrong unless the LLC elected C-corp status.\n\n\"If I file Form 1120, am I a corporation now?\" — No. Pro forma 1120 is a procedural vehicle. Your LLC stays disregarded.\n\n\"My CPA says I need a real Form 1120 with income.\" — Get a second opinion. Most CPAs see foreign-owned DE filings once or twice in their career. A full 1120 is wrong unless you've elected C-corp via Form 8832.\n\n\"Can I just file Form 5472 by itself?\" — No. The IRS requires it to be attached to a tax return. Pro forma 1120 is that attachment.\n\n\"My LLC had no transactions — am I still disregarded?\" — Yes, the disregarded status is independent of activity. Whether you file Form 5472 depends on whether you had reportable transactions, but the entity classification doesn't change.",
      },
      {
        heading: "Skip the paperwork — 15-minute filing",
        body: `Form5472 Prep generates the complete disregarded entity filing package automatically:\n\n• Cover letter.\n• Pro forma Form 1120 with \"Foreign-Owned U.S. DE\" stamp, entity info, signature line.\n• Form 5472 (Parts I, II, III, IV, V, VII).\n• Part V supporting statement listing each reportable transaction.\n• Reasonable Cause Statement (if filing late under DIIRSP).\n\nYou answer 12 questions in the wizard, sign once on screen (the signature embeds into every required signature box), an accountant on our team reviews everything, and we fax to the IRS Ogden PIN Unit. You get the timestamped receipt as transmission evidence.\n\n• 1 year: ${PRICE_STD} Standard / ${PRICE_EXP} Express / ${PRICE_24H} 24-Hour (fax included)\n• 2 years (DIIRSP): ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3 years (DIIRSP): ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\n100% money-back guarantee if we fail to submit.`,
      },
    ],
    faqs: [
      {
        q: "How do I know if my LLC is a disregarded entity?",
        a: "If your LLC has one owner and you've never filed Form 8832 to elect C-corp or S-corp taxation, it's a disregarded entity by default. Check your IRS correspondence — none of it should reference 1120-S or formal C-corp status.",
      },
      {
        q: "What if my LLC has more than one owner?",
        a: "If a US LLC has multiple owners, it's a partnership by default — not a disregarded entity. Multi-member LLCs file Form 1065, not 1120, and the Form 5472 rules apply differently. Our service handles single-member only.",
      },
      {
        q: "Does the disregarded entity have to file a US tax return?",
        a: "The disregarded entity doesn't compute its own income tax (it's disregarded for tax computation), but it must file pro forma Form 1120 + Form 5472 as an information return if it had any reportable transactions. So yes, there's still a filing — just not a real tax-paying one.",
      },
      {
        q: "Does the §6038A regulation cover foreign owners or all owners?",
        a: "It covers any 25%+ foreign ownership of a US corporation OR foreign ownership of a US disregarded single-member LLC. US-owned single-member LLCs are NOT subject to §6038A reporting — only foreign-owned ones since 2017.",
      },
      {
        q: "Can I file Form 5472 without pro forma 1120 if I qualify some exception?",
        a: "No. There's no exception that allows standalone Form 5472 filing for foreign-owned DEs. The pro forma 1120 attachment is mandatory.",
      },
      {
        q: "What's the difference between a disregarded entity and a partnership?",
        a: "Disregarded entity = single-owner LLC, treated as if it doesn't exist for income tax. Partnership = multi-owner LLC, files Form 1065 to allocate income to partners. Adding a second member changes the classification.",
      },
      {
        q: "If I add a partner to my disregarded LLC, what happens?",
        a: "It becomes a partnership for tax purposes (no longer disregarded). You'd file Form 1065 instead of pro forma 1120 + Form 5472. The change is automatic — no election needed. Talk to a CPA before adding members; the tax implications are significant.",
      },
      {
        q: "Are LLCs the only disregarded entities?",
        a: "No. Other entities can be disregarded too (qualified subchapter S subsidiaries, certain grantor trusts), but for foreign-owner purposes the typical disregarded entity is a single-member LLC.",
      },
      {
        q: "Does my LLC need a separate EIN if it's disregarded?",
        a: "Yes. Even though it's disregarded for income tax, it still needs an EIN to open bank accounts, file Form 5472, hire contractors with 1099 reporting, etc. The EIN is required for the entity even when the entity is disregarded.",
      },
      {
        q: "If I'm disregarded, can I just put my LLC's income on my personal return?",
        a: "For US owners, yes — they'd file Schedule C on Form 1040. For non-US owners, the LLC's income flows to you, but you don't file a US personal return unless you have US-source income personally. Most foreign owners don't, and the only US filing they make is the pro forma 1120 + Form 5472 for the LLC.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-1120-foreign-owned-llc", "form-5472-vs-1120", "single-member-llc-foreign-owner", "foreign-owned-llc-tax"],
  },
  {
    slug: "1120-pro-forma-instructions",
    keyword: "1120 pro forma instructions",
    title: "1120 Pro Forma Instructions for Foreign-Owned LLCs",
    metaDescription:
      "1120 pro forma instructions show foreign-owned US LLCs what to complete, what to leave blank, how to sign, and how to assemble the Form 5472 filing package.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: Instructions for Form 1120", url: "https://www.irs.gov/instructions/i1120" },
      { label: "IRS: About Form 1120", url: "https://www.irs.gov/forms-pubs/about-form-1120" },
    ],
    published: "2026-05-19",
    updated: "2026-09-11",
    h1: "1120 Pro Forma Instructions (Foreign-Owned LLCs)",
    intro:
      "Filling out a pro forma Form 1120 is different from a real corporate tax return because you complete fewer than 10 fields total. The key task is knowing what to fill in, what to leave blank, which schedules to ignore, and how to sign without making it look like a real return.",
    sections: [
      {
        heading: "What do you need to gather before you start?",
        body: "Gather these before opening Form 1120:\n\n• Your LLC's CP-575 EIN confirmation letter from the IRS (gives the legal name, EIN, and US address exactly as the IRS has them on file).\n• Formation and year-end asset records for the attached Form 5472; these are not required item C/D entries on the special pro forma 1120.\n• A pen if following the conservative ink-sign-and-scan workflow.\n\nIf you're using the IRS's official PDF, download the current tax year's blank Form 1120 from irs.gov. Don't use a prior-year form for a current-year filing — the IRS rejects out-of-year forms.\n\nIf you're using our service, the wizard generates a pre-filled 1120 from your answers; you don't need to download anything.",
      },
      {
        heading: "What do you fill in on Page 1 header?",
        body: "The special IRS Form 5472 instructions require only the foreign-owned U.S. DE’s name, address, item B (EIN), and applicable item E boxes on Form 1120 page 1. Item E contains Initial return, Final return, Name change and Address change—not an amended-return box. Write \"Foreign-owned U.S. DE\" across the top.\n\nItems C and D and Schedule L are not required by that special pro forma instruction. Do not treat an omitted optional cover field as permission to leave Form 5472 line 1c blank. See [Form 5472 line 1c and total assets](/blog/form-5472-line-1c-total-assets).\n\nFor signing, identify the authorized signer. Signing the completed cover in ink, then scanning it for fax, is a conservative workflow; see [signature methods and submission routes](/blog/form-5472-pro-forma-1120-signature).",
      },
      {
        heading: "What income section details do you leave blank?",
        body: "Lines 1a through 11 cover:\n• 1a: Gross receipts or sales.\n• 1b: Returns and allowances.\n• 1c: Net (subtract 1b from 1a).\n• 2: Cost of goods sold.\n• 3: Gross profit.\n• 4: Dividends and inclusions.\n• 5: Interest.\n• 6: Gross rents.\n• 7: Gross royalties.\n• 8: Capital gain net income.\n• 9: Net gain or loss from Form 4797.\n• 10: Other income.\n• 11: Total income.\n\nALL of these lines stay blank on a pro forma filing. Don't write \"0\", don't write \"N/A\", don't write anything. Leave the line untouched.\n\nWhy: writing zeros could be interpreted as a complete (incorrect) income tax return rather than a pro forma information envelope. The IRS may then process it as a real corporate return, generate notices, request schedules, or assess tax. Empty fields signal \"pro forma — informational only\".",
      },
      {
        heading: "What deduction section details do you leave blank?",
        body: "Lines 12 through 29 cover:\n• 12: Compensation of officers.\n• 13: Salaries and wages.\n• 14: Repairs and maintenance.\n• 15: Bad debts.\n• 16: Rents.\n• 17: Taxes and licenses.\n• 18: Interest.\n• 19: Charitable contributions.\n• 20: Depreciation.\n• 21: Depletion.\n• 22: Advertising.\n• 23: Pension, profit-sharing, etc.\n• 24: Employee benefit programs.\n• 25: Reserved.\n• 26: Other deductions.\n• 27: Total deductions.\n• 28: Taxable income before NOL deduction and special deductions.\n• 29a: Net operating loss deduction.\n• 29b: Special deductions.\n• 29c: Total.\n\nALL blank on a pro forma filing. Same reasoning as the income section.",
      },
      {
        heading: "What tax and payment section details do you leave blank?",
        body: "Lines 30 through 37 in the pro forma 1120 tax and payment section stay blank. These fields cover taxable income, total tax, payments, penalties, amounts owed, overpayments, and refund choices, but the LLC is not computing tax, remitting a payment, or claiming a refund on this informational cover.\n\n• 30: Taxable income.\n• 31: Total tax.\n• 32: Reserved.\n• 33: Total payments and credits.\n• 34: Estimated tax penalty.\n• 35: Amount owed.\n• 36: Overpayment.\n• 37: Refunded vs. applied to estimated tax.\n\nAll blank. Your LLC isn't computing tax. The pro forma 1120 is informational only — there's no liability to calculate, no payment to remit, no refund to claim.",
      },
      {
        heading: "What do you do with schedules on pro forma 1120?",
        body: "For this foreign-owned U.S. DE pro forma package, the special IRS required-fields instruction is limited to name, address, item B and item E. It does not require income, deduction or tax computations, or Schedules C, J, K, L, M-1 or M-2.\n\nLeave unrelated corporate-return computations and schedules blank rather than inventing entries. Items C and D are also outside the special required list. Form 5472 has its own requirements, including line 1c; see the total-assets guide.",
      },
      {
        heading: "How do you complete the signature block?",
        body: "Complete the signature block on Form 1120 page 1, not on Form 5472. The section identifies separate officer signature, date, title, and paid-preparer fields, and recommends a conservative workflow: authorized person signs the completed cover in ink, adds the actual signing date and capacity, then scans it for fax.\n\nThe special pro forma instruction does not separately address signatures. A conservative workflow is to have the authorized person sign the completed cover in ink, enter the actual signing date and capacity, and scan that signed page for fax. This is a recommendation, not a ruling that every digital-only signature invalidates a filing.\n\nIRS electronic-signature permission depends on the document and route. Corporate e-file authorization rules do not automatically cover this DE fax package. Ask the preparer to establish signing authority and the applicable method; the general Form 1120 instructions separately address paid preparers. See the current signature guide.",
      },
      {
        heading: "What mistakes on pro forma 1120 trigger IRS notices?",
        body: "• Writing zeros in the income section — IRS may process it as a real (zero-income) tax return and ask follow-up questions about why income is zero.\n• Forgetting the \"Foreign-Owned U.S. DE\" stamp at the top of page 1 — the most common routing error.\n• Treating Schedule L as required: it is outside the special pro forma required-fields instruction.\n• Assuming electronic signing and IRS e-filing are the same; permission depends on the specific document and route.\n• Mailing to the wrong IRS address — must go to Ogden PIN Unit, not the regular 1120 processing center.\n• Forgetting to attach Form 5472 + Part V supporting statement (the whole point of the pro forma 1120).\n• Using a prior-year version of Form 1120 — always use the current tax year's blank form.\n• Wrong EIN (typo) — must match CP-575 exactly.\n• Wrong tax year on the form header — must be the tax year that ENDED, not the year you're filing in.\n• Reporting amounts in non-USD — always convert to USD.\n• Filing without an attached cover letter — not strictly required by the IRS instructions but recommended for clean routing.",
      },
      {
        heading: "What is the correct assembly order for the filing package?",
        body: "1. Cover letter (1 page) — identifies the filing, lists the LLC, EIN, tax year, and forms included.\n2. Pro forma Form 1120 (signed, stamped \"Foreign-Owned U.S. DE\") — the procedural envelope.\n3. Form 5472 (2 pages) — Parts I, II, III, IV, V, VII.\n4. Part V supporting statement (1+ pages) — list of reportable transactions.\n5. Reasonable Cause Statement (only if filing late under DIIRSP).\n\nFax destination: +1-855-887-7737 (IRS Ogden PIN Unit).\nMail destination: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 (certified mail recommended).\n\nKeep your fax transmission receipt as transmission evidence. Its timestamp records the provider’s transmission event; it does not alone establish IRS acceptance or the legal filing date.",
      },
      {
        heading: "Use our pre-filled pro forma 1120",
        body: `Our wizard generates a pre-filled, signature-ready pro forma 1120 for review alongside the special IRS required-fields instruction:\n\n• \"Foreign-Owned U.S. DE\" stamp at the top.\n• Header section pre-filled from your wizard answers.\n• Income, deductions, tax sections correctly empty.\n• Any additional asset fields populated by the preparation workflow are not required by the special pro forma 1120 instruction.\n• Signature line ready for your in-portal canvas signature.\n• Form 5472 + Part V supporting statement assembled behind it.\n\n${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — same filing on every plan. IRS fax delivery included on every plan. +${PRICE_ADDON} per additional past year. Every package is reviewed by an accountant on our team before submission. 100% money-back guarantee if we fail to submit.`,
      },
    ],
    faqs: [
      {
        q: "Should I write 'N/A' or 'None' in blank fields?",
        a: "No. Leave the fields completely untouched. The IRS instructions for pro forma filings specify the unused sections stay blank, not marked. Writing N/A or 0 can cause the return to be processed as a real corporate filing.",
      },
      {
        q: "What if I don't know my LLC's total assets at year-end?",
        a: "Reconstruct a supported year-end asset figure from the books; do not assume an empty bank account means zero assets. Item D is not required by the special pro forma 1120 instruction, but Form 5472 line 1c is separate. See the line 1c guide.",
      },
      {
        q: "Can I print a blank 1120 PDF and fill it by hand?",
        a: "Yes, the IRS accepts handwritten Form 1120. Use blue or black ink, write neatly, and stamp \"Foreign-Owned U.S. DE\" at the top. Our service generates a typed PDF you can sign — far fewer transcription errors than handwriting.",
      },
      {
        q: "Which tax-year version of Form 1120 do I use?",
        a: "The form for the tax year that ENDED. For tax year 2024 (filed by April 15, 2025), use the 2024 Form 1120. Always download the current year's blank form from irs.gov — last year's form may have field number changes that cause issues.",
      },
      {
        q: "Do I attach the IRS instructions to my filing?",
        a: "No. The IRS doesn't need the instructions back — those are reference for you. Only the forms themselves (1120, 5472, Part V supporting statement, cover letter, reasonable cause statement if applicable) go in the package.",
      },
      {
        q: "What if I made a mistake after filing?",
        a: "Review the actual filed package and determine whether a correction is needed. Neither current Form 1120 nor Form 5472 has an amended-return checkbox. When a corrected package is appropriate, clearly identify it with an amended notation and an explanation linking it to the original filing; this is a preparer workflow, not a prescribed special IRS amendment procedure. A correction does not guarantee penalty relief.",
      },
      {
        q: "Can I use a foreign address on the 1120?",
        a: "No. The 1120 expects a US address — typically your registered agent's address. Your personal foreign address goes on Form 5472 Part II as the owner address.",
      },
      {
        q: "Do I need to attach Form 4562 for depreciation?",
        a: "No. Form 4562 is for depreciation on a real corporate return. Pro forma 1120 has no depreciation deduction (the deductions section is blank), so 4562 doesn't apply.",
      },
      {
        q: "What if Schedule K asks about foreign accounts and my LLC has a non-US bank account?",
        a: "Most foreign-owned DEs bank with US-based services (Mercury, Wise USD, Relay). If your LLC has a non-US financial account, you may need to answer the Schedule K foreign-account questions and potentially file FBAR for the LLC. Talk to a tax professional if this applies — our wizard's standard package assumes US-based banking.",
      },
      {
        q: "Where can I see what a completed pro forma 1120 looks like?",
        a: "Run our wizard with sample data — at the PDF preview step you'll see exactly what gets faxed to the IRS. The pro forma 1120 page shows the \"Foreign-Owned U.S. DE\" stamp, filled header, empty body, and signature-ready format.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-1120-foreign-owned-llc", "form-1120-disregarded-entity", "form-5472-instructions", "file-form-5472"],
  },
  {
    slug: "irs-form-5472",
    keyword: "irs form 5472",
    title: "IRS Form 5472: What It Is, Who Files, and How (2026)",
    metaDescription:
      "IRS Form 5472 rules for foreign-owned US LLCs cover who must file, reportable transactions, the deadline, the $25,000 penalty, and submission methods.",
    sources: [
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "Treas. Reg. §1.6038A-2", url: "https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFRe4c8b1cb2ac9d43/section-1.6038A-2" },
      { label: "IRC §6038A", url: "https://www.law.cornell.edu/uscode/text/26/6038A" },
    ],
    published: "2026-05-22",
    updated: "2026-10-05",
    h1: "IRS Form 5472 — the complete guide for foreign-owned LLCs",
    intro:
      "IRS Form 5472 is the information return foreign-owned US single-member LLCs file every year with an attached pro forma Form 1120. Missing it can trigger a $25,000 penalty per year, per form, and our 15-minute workflow prepares the package before faxing it to the IRS Ogden PIN Unit.",
    howTo: {
      section: "How do you catch up with DIIRSP after missed years?",
      supplies: [
        "Late Form 5472",
        "Pro forma 1120",
        "Reasonable Cause Statement",
        "Missed year package",
      ],
    },
    sections: [
      {
        heading: "What is IRS Form 5472?",
        body: "IRS Form 5472 is the information return the IRS uses to track related-party transactions between foreign owners and the US entities they control. Its purpose is transparency, giving the IRS visibility into money flowing between non-US persons and controlled US entities even when no US tax is owed.\n\nIts purpose: transparency. The IRS wants visibility into money flowing between non-US persons and US entities they control, even when no US tax is actually owed. It's not a tax return — it's an information return.\n\nSince 2017, single-member LLCs owned by non-US persons are treated as corporations for the purpose of Section 6038A reporting under Treasury Regulation § 1.6038A-1. That means even a one-person Wyoming or Delaware LLC owned by someone abroad has to file Form 5472 every year, attached to a stripped-down (pro forma) Form 1120.\n\nThe regulation closed a transparency loophole: before 2017, foreign-owned single-member US LLCs were invisible to the IRS for disclosure purposes. After 2017, they must report every related-party transaction annually or face the $25,000-per-form-per-year penalty.",
      },
      {
        heading: "Who has to file Form 5472?",
        body: "You must file if all three are true:\n\n1. You own a single-member US LLC (any state — Wyoming, Delaware, Florida, New Mexico, Nevada, etc.).\n2. You are NOT a US person — not a US citizen, not a green card holder, not a US tax resident.\n3. The LLC had at least one reportable transaction in the year — capital contributions in, distributions out, payments to/from the owner, loans, or any related-party transaction.\n\nA reportable transaction is broad. The list of what counts:\n• Capital contributed to the LLC (e.g. wiring USD into the bank account).\n• Distributions taken from the LLC (e.g. paying yourself).\n• Loans from you to the LLC (or LLC to you).\n• Rent / royalties / interest paid to or from you.\n• Payments to or from any other foreign entity you control.\n• Sales of property between you and the LLC.\n\nEven moving money into the LLC to fund operations counts. So in practice almost every foreign-owned LLC needs to file Form 5472 every year, even with zero revenue. The exception is a truly dormant LLC with no bank account and no money in or out — rare.",
      },
      {
        heading: "What's the penalty for not filing?",
        body: "$25,000 per year, per form. Then another $25,000 for every 30-day period after IRS notice if you still don't file. The penalty is automatic — no warning notice required from the IRS before assessment — and it applies even if your LLC made no money and owes zero US tax.\n\nExample: own 2 foreign LLCs, missed 3 years on each. 6 forms × $25,000 = $150,000 in potential penalty exposure.\n\nThe penalty is for failure to file the disclosure return, NOT for unpaid tax. Most foreign-owned single-member LLCs owe $0 in US federal income tax — the penalty applies regardless.\n\nIf you've missed prior years, you can catch up under DIIRSP (Delinquent International Information Return Submission Procedure) by filing all missed years with a reasonable cause statement requesting penalty abatement. Most well-documented first-time catch-ups are accepted with no penalty assessed.",
      },
      {
        heading: "What is in the Form 5472 filing package?",
        body: "The complete Form 5472 filing package contains five parts.\n\n1. Cover letter (1 page) identifying the filing — LLC name, EIN, tax year, forms included.\n2. Pro forma Form 1120 (1-2 pages) — entity identification fields only, with \"Foreign-Owned U.S. DE\" stamped across the top. Income, deductions, and tax sections all blank.\n3. Form 5472 (2 pages) — Parts I (reporting corporation), II (25% foreign shareholder), III (related party), IV (monetary transactions, often blank), V (reportable transactions — capital contributions and distributions), VII (FDE confirmation).\n4. Part V supporting statement (1+ pages) — list of each reportable transaction with date, amount, and description.\n5. Reasonable Cause Statement (only if filing late under DIIRSP).\n\nTotal package: typically 5-8 pages. Faxed as one document to the IRS Ogden PIN Unit at +1-855-887-7737, or mailed certified to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.",
      },
      {
        heading: "When is Form 5472 due?",
        body: "For a calendar-year LLC, Form 5472 is due April 15 of the year following the tax year. A Form 7004 extension filed by April 15 moves the package to October 15, and fiscal-year LLCs follow the 15th day of the 4th month after fiscal year-end.\n\nExtensions: file Form 7004 by April 15 for an automatic 6-month extension to October 15. Since Form 5472 is attached to the 1120, the extension covers both forms.\n\nFiscal-year LLCs: 15th day of the 4th month after fiscal year-end.\n\nFiling evidence: retain the exact package and transmission or mailing records. A fax timestamp records the provider’s event, not an IRS acceptance or a statutory postmark. Send early and check the rules for your chosen mailing method; do not assume a deadline-day attempt alone establishes timely filing. See the receipt and follow-up guide.\n\nMissed the deadline? Don't panic. File under DIIRSP immediately with a reasonable cause statement — the longer you wait, the higher the risk of a CP 215 penalty notice.",
      },
      {
        heading: "How do you file IRS Form 5472?",
        body: "You file IRS Form 5472 by mail or fax to the Ogden PIN Unit. The IRS only accepts it by mail or fax to the Ogden PIN Unit. The fax route is faster and gives you a transmission receipt as transmission evidence.\n\n• Fax: +1-855-887-7737 (IRS Ogden PIN Unit).\n• Mail: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 (use certified mail with return receipt).\n\nOur 15-minute online filer handles the whole package — Form 5472, pro forma Form 1120, Part V supporting statement, cover letter, and reasonable cause statement (if late). Pricing starts at $149, we generate everything, you sign once on screen (the signature embeds into every required signature box), an accountant on our team reviews the package end-to-end, and we fax it to the IRS Ogden PIN Unit. IRS fax delivery is included in every plan. You get the timestamped fax transmission receipt as transmission evidence.",
      },
      {
        heading: "What is the difference between Form 5472 and Form 1120?",
        body: "Form 5472 reports related-party transactions; Form 1120 is the corporate income tax return. For a foreign-owned single-member LLC, the 1120 is only a pro forma procedural envelope with most fields blank, because Form 5472 must be attached to a tax return and filed as one package.\n\nFor a real US C-corporation, Form 1120 is a substantive tax filing — income, deductions, tax computation. For a foreign-owned single-member LLC, Form 1120 is pro forma — most fields blank, used only as a procedural envelope for Form 5472.\n\nForm 5472 by itself is not a valid IRS submission. The IRS requires it to be attached to a tax return. For foreign-owned disregarded entities, the IRS chose Form 1120 as that attachment.\n\nSo you file both, together, as one package: pro forma 1120 in front, Form 5472 + Part V supporting statement attached behind, faxed as one document. The 1120 is the envelope, the 5472 is the letter.",
        table: {
          caption: "Form 1120 versus Form 5472 on this page",
          columns: ["Item", "Pro forma Form 1120", "Form 5472"],
          rows: [
            ["Purpose", "Corporate income tax return", "Reports related-party transactions"],
            ["LLC role", "Pro forma procedural envelope", "Attached information return"],
            ["Placement", "Filed in front", "Attached behind with statement"],
            ["Fields", "Most fields blank", "Parts and transactions completed"],
          ],
        },
      },
      {
        heading: "How do you catch up with DIIRSP after missed years?",
        body: `You catch up with DIIRSP by filing late Form 5472 packages with a reasonable cause statement. Steps:\n\n1. File the late Form 5472 + pro forma 1120 for each missed year.\n2. Attach a Reasonable Cause Statement explaining why the filing was late.\n3. Submit all missed years together as one package.\n4. Fax to +1-855-887-7737 with the reasonable cause statement at the front.\n5. Keep the fax transmission receipt — it's your timestamped transmission evidence.\n\nThe IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.\n\nOur multi-year DIIRSP packages: 2 years ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour, 3 years ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included). ${NOTE_24H} The Reasonable Cause Statement is auto-generated by our wizard and editable to fit your specific facts.`,
      },
      {
        heading: "Pricing",
        body: `• 1 tax year: ${PRICE_STD} Standard / ${PRICE_EXP} Express / ${PRICE_24H} 24-Hour (fax included)\n• 2 tax years (DIIRSP catch-up): ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3 tax years (DIIRSP catch-up): ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\nIRS fax delivery to the Ogden PIN Unit at +1-855-887-7737 is included in every plan — no separate fee.\n\nEvery package is reviewed by an accountant on our team before we fax it to the IRS. 100% money-back guarantee if we fail to submit your filing.`,
      },
      {
        heading: "Why use Form5472 Prep instead of a CPA or DIY?",
        body: `Form5472 Prep is built for the standard foreign-owned single-member LLC filing workflow rather than a broad CPA engagement or blank IRS-form DIY process. The wizard pre-fills the package from simple questions, the generated PDFs follow current IRS instructions, an accountant reviews before fax submission, and IRS fax delivery is included.\n\nDIY with IRS forms ($0 fees; the IRS estimates 6 hr 34 min per Form 5472 to learn about and prepare it, before recordkeeping): you download blank 1120 and 5472 PDFs from irs.gov, fill them by hand, sign, and fax. Risk: any mistake (missing stamp, blank Part V, wrong signature method) can trigger the $25,000 penalty. Many DIY filings fail compliance review.\n\nUS CPA ($400-$800, 1-2 weeks): most CPAs see foreign-owned DE filings once or twice in their career. They'll typically research the requirements from scratch each time, which makes the turnaround long and the cost high. Some will decline the work entirely.\n\nForm5472 Prep (${PRICE_STD} Standard or ${PRICE_EXP} Express, plus ${PRICE_ADDON} per additional past year, 15 minutes): purpose-built for this exact filing. Wizard pre-fills everything based on 12 simple questions. Generated PDFs follow current IRS instructions. Every package is accountant-reviewed before fax submission. IRS fax delivery included. Money-back guarantee if we fail to submit. Reasonable cause statement auto-generated for late filings.\n\nFor the standard foreign-owned single-member LLC profile, our service is dramatically faster and lower-cost than CPA, and dramatically lower risk than DIY.`,
      },
    ],
    faqs: [
      {
        q: "Is IRS Form 5472 the same as Form 1120?",
        a: "No. Form 5472 is the information return that reports related-party transactions. Form 1120 is the corporate income tax return that Form 5472 attaches to. Foreign-owned single-member LLCs file a pro forma (stripped-down) 1120 just so the 5472 has somewhere to live.",
      },
      {
        q: "Do I need an EIN before I can file?",
        a: "Yes. Form 5472 requires the LLC's EIN. If you don't have one yet, apply via IRS Form SS-4 — international applicants can fax it to the IRS without a US-issued ID number. Most foreign owners get their EIN within 2-4 weeks.",
      },
      {
        q: "What if my LLC had no income?",
        a: "You still have to file. Form 5472 reports reportable transactions, and capital contributions or distributions count even when your LLC had zero revenue. Skipping the filing because your LLC was inactive triggers the same $25,000 penalty.",
      },
      {
        q: "Can someone review my Form 5472 before it's sent to the IRS?",
        a: "Yes — every order we process is reviewed by an accountant on our team before we fax it to the IRS. Nothing goes out on autopilot.",
      },
      {
        q: "Do I owe US tax just because I file Form 5472?",
        a: "No. Form 5472 is an information return, not a tax return. Most foreign-owned single-member LLCs owe $0 in US federal income tax regardless of whether they file Form 5472. The form is mandatory but doesn't itself create any tax liability.",
      },
      {
        q: "Can I e-file Form 5472?",
        a: "No. Foreign-owned disregarded entities are excluded from IRS e-filing for Form 5472 + pro forma 1120. Fax to +1-855-887-7737 or mail to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 only.",
      },
      {
        q: "How long has Form 5472 applied to single-member LLCs?",
        a: "Since tax year 2017, when Treasury Regulation § 1.6038A-1 was extended to foreign-owned domestic disregarded entities. Before that, single-member LLCs were exempt from §6038A reporting. After that, they're treated as corporations for §6038A purposes.",
      },
      {
        q: "What if I own multiple foreign-owned LLCs?",
        a: "Each LLC files its own separate Form 5472 + pro forma 1120 package. If you own 3 LLCs, that's 3 separate filings every year. You'd start 3 separate filings in our wizard.",
      },
      {
        q: "Does the IRS audit Form 5472 filings?",
        a: "The IRS can examine Form 5472 within the normal statute of limitations (6 years for incomplete returns). In practice, most filings are processed without examination. The bigger risk is the automatic $25,000 penalty for non-filing or incomplete filing — assessed without examination by the IRS computer system.",
      },
      {
        q: "Where can I see a sample completed Form 5472?",
        a: "Run our wizard with sample data — at the PDF preview step you'll see exactly what gets faxed. The Form 5472 page shows all parts filled in based on your wizard answers.",
      },
    ],
    relatedSlugs: ["file-form-5472", "form-5472-penalty", "diirsp", "form-5472-instructions", "form-5472-deadline", "form-5472-fax-number"],
  },
  {
    slug: "form-5472-deadline",
    keyword: "form 5472 deadline",
    title: "Form 5472 Deadline: When Is It Due in 2026?",
    metaDescription:
      "Form 5472 deadline rules cover the April 15 due date, the Form 7004 extension to October 15, late-filing penalties, and DIIRSP catch-up procedures.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: About Form 7004", url: "https://www.irs.gov/forms-pubs/about-form-7004" },
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
    ],
    published: "2026-05-22",
    updated: "2026-10-07",
    h1: "Form 5472 deadline — when it's due, and what to do if you've missed it",
    intro:
      "Form 5472 is due April 15 of the year following the tax year. Filing Form 7004 by April 15 gives an automatic 6-month extension to October 15, while missing the deadline can trigger a $25,000-per-form penalty that may still be addressed through DIIRSP catch-up filing.",
    howTo: {
      section: "How do you file before the deadline?",
      tools: ["Form5472 Prep online filer"],
      supplies: [
        "LLC info",
        "Foreign owner info",
        "Year-end totals",
        "Reportable transactions",
        "On-screen signature",
      ],
    },
    sections: [
      {
        heading: "What is the exact deadline for Form 5472?",
        body: "Form 5472 follows the corporate (Form 1120) calendar:\n\n• Calendar-year LLC (Jan 1 - Dec 31 tax year): Form 5472 + pro forma Form 1120 due April 15 of the next year. For tax year 2025, that's April 15, 2026.\n• Fiscal-year LLC: due the 15th day of the 4th month after fiscal year-end. Example: fiscal year ending June 30 → return due October 15.\n• Extension: file Form 7004 by the original due date for an automatic 6-month extension to October 15 (calendar-year LLC) or the equivalent for fiscal-year.\n\nThe extension shifts the filing deadline only — not any tax liability (most foreign-owned disregarded entities owe no US income tax, so this rarely matters).\n\nWeekend / holiday rule: if April 15 falls on a Saturday, Sunday, or federal holiday, the deadline moves to the next business day. (2026: April 15 is a Wednesday — normal deadline.)\n\nFor the 2026 dates explained in more detail, read our [Form 5472 deadline](/blog/form-5472-deadline-2026) guide. To work out the due date for your own tax year, extension and weekend rules included, use the [Form 5472 deadline calculator](/form-5472-deadline-calculator).",
        table: {
          caption: "Form 5472 due dates from the deadline guide",
          columns: ["Situation", "Due date", "Note"],
          rows: [
            ["Calendar-year LLC", "April 15 next year", "Tax year 2025 due April 15, 2026"],
            ["With Form 7004", "October 15", "File extension by original due date"],
            ["Weekend or holiday", "Next business day", "Saturday, Sunday, or federal holiday"],
            ["Fiscal-year LLC", "Fourth month, 15th day", "Measured after fiscal year-end"],
          ],
        },
      },
      {
        heading: "How do you file Form 7004 for an extension?",
        body: `File Form 7004 by the original due date to request the automatic 6-month extension for the Form 5472 package. For calendar-year LLCs, that means April 15; use Form 1120 code 12, the same LLC identification details, and $0 estimated tax for foreign-owned DEs with no tax liability.\n\nWhat to put on Form 7004:\n• Part I: select form code \"12\" (Form 1120).\n• Identification: LLC name, EIN, address — same as on the eventual 1120.\n• Estimated tax: $0 for foreign-owned DEs (no tax liability).\n\nSubmit Form 7004 by:\n• Fax to ${IRS_OGDEN_FAX} (the same IRS fax number as the return).\n• Mail to ${IRS_OGDEN_MAIL_ADDRESS}.\n\nThe extension is automatic — the IRS doesn't send a confirmation. Just keep transmission evidence of the 7004 (fax receipt or certified mail receipt). Your Form 5472 + pro forma 1120 is then due by October 15.\n\nDon't file Form 7004 if you're already past April 15 — at that point file the actual Form 5472 + 1120 directly with a DIIRSP reasonable cause statement.`,
      },
      {
        heading: "What counts as \"on time\"?",
        body: "A successful fax report is useful transmission evidence, but it is not an IRS acknowledgment or a statutory postmark. Send early and keep complete records so you can document the package, destination, timestamp, and route if timing is later questioned.\n\nSend early enough to resolve failures. For mail, check the applicable postal or IRS-designated private delivery-service rules; do not assume an international postmark or any courier shipment receives the same timely-mailing treatment.\n\nRetain the exact package, the complete report with destination and timestamp/timezone, and any mailing records or IRS correspondence. If a notice questions timeliness, respond using those records; a receipt does not guarantee penalty reversal. See what a fax receipt does and does not prove.",
      },
      {
        heading: "What happens if you do nothing after the deadline?",
        body: "If you do nothing after the deadline, the missed Form 5472 can move from no visible event to CP 215 assessment and continuation penalties.\n\n• Day 0 (April 15): you miss the deadline. Nothing visible happens.\n• Day 60-180: IRS internal processing identifies the missing return via EIN cross-reference.\n• Day 200-540: IRS computer system generates and mails a CP 215 \"Notice of Penalty Charge\" to your LLC's US address of record, assessing $25,000.\n• Day +90 from the IRS's notice of the failure: the 90-day period ends.\n• Day +91 to +120: the first continuation period. Another $25,000 added.\n• Day +150 from notice: another $25,000 (so now $75,000 for a single missed year).\n• Day +180 from notice: another $25,000 ($100,000).\n• ... and so on, indefinitely.\n\nThis is why catching up quickly under DIIRSP — even multiple years late — is critical. Once continuation penalties begin, the math escalates fast.\n\nIf the LLC's US address can't receive mail (some virtual mailboxes return-to-sender IRS notices), you might not even see the CP 215. The penalty is still assessed and continuation timer still runs.",
      },
      {
        heading: "How do you use DIIRSP after missing the deadline?",
        body: `You use DIIRSP after missing the deadline by filing late with a Reasonable Cause Statement requesting penalty abatement. The IRS provides a relief path called DIIRSP — Delinquent International Information Return Submission Procedure — that lets you file late with a Reasonable Cause Statement requesting penalty abatement.\n\nDIIRSP is available as long as:\n• The IRS has NOT yet contacted you about the specific delinquency.\n• You're not under IRS examination or criminal investigation.\n\nThose are the only two conditions on the IRS's DIIRSP page. Owners who find the missed filing themselves, before any IRS contact, generally meet both.\n\nThere's no guarantee the IRS will waive the penalty. The IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.\n\nOur DIIRSP-aware filer automatically attaches the Reasonable Cause Statement for late filings. Multi-year catch-up packages: 2 years ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour, 3 years ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour. ${NOTE_24H} Every package is reviewed by an accountant on our team before we fax it.`,
      },
      {
        heading: "What is the late-filing penalty in detail?",
        body: "The penalty for missing the Form 5472 deadline:\n\n• Base penalty: $25,000 per Form 5472 not filed, per tax year.\n• Continuation penalty: additional $25,000 for each 30-day period after IRS notice if not filed within 90 days.\n• No cap.\n\nIt's per form, per year — so missing 3 years on one LLC = $75,000 base. Missing 3 years on each of 2 LLCs = $150,000 base.\n\nThe penalty is automatic — assessed by the IRS computer system without human review. The CP 215 notice arrives without warning, often 6-18 months after the deadline.\n\nMost foreign-owned single-member LLCs owe zero US income tax even when they file the form. The $25,000 is purely an information-return penalty for failing to disclose, not a tax bill.\n\nIf you're already in penalty territory: file under DIIRSP (if not yet contacted) or respond to the CP 215 with a Form 843 abatement request (if already assessed). The earlier you act, the better.",
      },
      {
        heading: "What are real-world deadline scenarios?",
        body: "Scenario A — on-time filing: Carlos files his Wyoming LLC's tax year 2024 Form 5472 on April 10, 2025 via our wizard. We fax to the IRS Ogden PIN Unit. Fax receipt timestamps the filing at April 10 — well before April 15. No penalty risk.\n\nScenario B — extension: Mei is traveling in April and won't have her year-end financials ready until summer. On April 14, 2026 she faxes Form 7004 to +1-855-887-7737, requesting the 6-month extension. New deadline: October 15, 2026. She files Form 5472 + 1120 on September 30, 2026 — on time.\n\nScenario C — DIIRSP catch-up: Ahmed forgot about Form 5472 for tax year 2023. He learns about it in June 2025 (14 months late). He files under DIIRSP immediately with a reasonable cause statement explaining first-time foreign-owner unawareness. The IRS hasn't sent a CP 215 yet, so DIIRSP is the right path. No outcome is guaranteed: if a penalty is assessed during processing, his statement is the basis for responding.\n\nScenario D — CP 215 already received: Lin missed tax year 2022 and received a $25,000 CP 215 in November 2024. DIIRSP is no longer available for that year. She responds with a Form 843 abatement request plus the late return, a post-assessment path where her documented reasonable-cause statement is the basis for the response. She also files under DIIRSP for 2023 and 2024 (where she hasn't been contacted yet).\n\nTakeaway: act before the IRS contacts you. DIIRSP is dramatically easier than post-assessment appeal.",
      },
      {
        heading: "How do you file before the deadline?",
        body: `You file before the deadline by gathering the facts, generating the package, signing once, and saving the fax receipt.\n\n1. Gather your LLC info (EIN, address, formation date, NAICS code) and your foreign owner info (legal name, FTIN or self-assigned Reference ID, residential address, country of citizenship).\n2. Add up year-end totals: capital contributions in, distributions out, total assets at year-end in USD, list of any other reportable transactions.\n3. Use our 15-minute online filer to generate the full package: cover letter, pro forma 1120 with the \"Foreign-Owned U.S. DE\" stamp, Form 5472 (all parts), Part V supporting statement, Reasonable Cause Statement (only if late).\n4. Sign once on screen — the signature embeds into every required signature box automatically.\n5. Have an accountant on our team review the package end-to-end.\n6. Get the package faxed to the IRS Ogden PIN Unit at +1-855-887-7737 and get the timestamped receipt emailed to you as transmission evidence.\n\nPricing: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — identical filing, IRS fax delivery included. +${PRICE_ADDON} per additional past year. 100% money-back guarantee if we fail to submit.`,
      },
      {
        heading: "Should you file early?",
        body: "Yes, ideally. There's no penalty or downside for filing Form 5472 early. Benefits of filing in January-February rather than waiting until April:\n\n• Avoid last-minute scramble if you discover missing information.\n• Less stress.\n• Buffer against any wizard or fax delivery issues.\n• Faster IRS processing.\n• Get the obligation off your to-do list.\n\nOur returning customers typically file in January or February each year — pre-filled from their prior year's filing, takes 5-10 minutes total.\n\nFiling earlier than your tax year ends doesn't work — the IRS won't process a return for a tax year that hasn't completed yet. So January 1 is the earliest practical filing date for the prior calendar year.",
      },
      {
        heading: "What is the annual reminder system?",
        body: "If you file with us, we email you in the second week of January as a reminder that Form 5472 is due April 15, and again in early March if the filing is still outstanding. The reminders include:\n\n• Confirmation of your LLC name and tax year.\n• Link to start the new year's filing (pre-filled from prior year).\n• Estimated time: 5-10 minutes for returning customers.\n\nNo spam, no upselling — just the annual reminder so you don't forget. Unsubscribe link in every email.\n\nIf you're filing DIY without our service, set a calendar reminder for February 1 each year. Filing in February gives you 6+ weeks of buffer before the April 15 deadline.",
      },
    ],
    faqs: [
      {
        q: "Does the Form 7004 extension extend Form 5472?",
        a: "Yes. Form 5472 is attached to Form 1120, so a 7004 extension for the 1120 automatically extends the 5472 to October 15. File Form 7004 by April 15 to get the extension.",
      },
      {
        q: "Can I file Form 5472 early?",
        a: "Yes, any time after the tax year ends. There's no penalty for filing early, and it removes the obligation from your to-do list. Most of our returning customers file in January or February.",
      },
      {
        q: "What if I miss the extended October 15 deadline?",
        a: "Same as missing April 15 without an extension — you'll need to file under DIIRSP with a reasonable cause statement. The earlier you catch up, the better the chance of penalty abatement.",
      },
      {
        q: "I'm filing for last year — can I still use your service?",
        a: `Yes. The wizard auto-detects late filings and adds the DIIRSP Reasonable Cause Statement automatically. Pricing: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) for 1 year, fax included — same filing on every plan. Add ${PRICE_ADDON} per additional past year for multi-year catch-up.`,
      },
      {
        q: "What's the deadline for tax year 2024?",
        a: "April 15, 2025 (or October 15, 2025 with Form 7004 extension). If you missed it, file under DIIRSP immediately.",
      },
      {
        q: "What's the deadline for tax year 2025?",
        a: "April 15, 2026 (or October 15, 2026 with Form 7004 extension).",
      },
      {
        q: "If I file Form 7004 do I need to file the actual return?",
        a: "Yes — Form 7004 just extends the deadline. You still must file the actual Form 5472 + pro forma 1120 by the extended deadline (October 15 for calendar-year LLCs).",
      },
      {
        q: "Can I file Form 7004 after April 15?",
        a: "No. Form 7004 must be filed BY the original due date. If you missed April 15 without filing 7004, you're now in late territory — file the actual return under DIIRSP with a reasonable cause statement.",
      },
      {
        q: "Does the deadline change in a leap year?",
        a: "No. The April 15 deadline is the same in leap years. (Years where April 15 falls on a weekend or federal holiday shift to the next business day.)",
      },
      {
        q: "What if my fax fails on the deadline day?",
        a: "Check the provider error and retry promptly. If fax remains unavailable, assess an authorized mailing alternative that can meet the applicable deadline, using the dedicated Ogden PIN Unit address in the Form 5472 instructions. Do not assume a failed fax attempt extends the deadline; preserve the records and obtain advice if it passes.",
      },
    ],
    relatedSlugs: ["late-form-5472", "diirsp", "form-5472-penalty", "file-form-5472", "form-5472-reasonable-cause-statement"],
  },
  {
    slug: "form-5472-fax-number",
    keyword: "form 5472 fax number",
    title: "Where to File Form 5472: Fax Number and Mailing Address",
    metaDescription:
      `Where to file Form 5472: the IRS fax number (${IRS_OGDEN_FAX}) and Ogden mailing address for foreign-owned US LLCs, what to send, and which proof to keep.`,
    sources: [
      { label: "IRS: Instructions for Form 5472 (When and Where To File)", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
    ],
    published: "2026-05-22",
    updated: "2026-10-07",
    h1: "Where to File Form 5472: Fax Number and Mailing Address",
    intro:
      `Where to file Form 5472 depends on who files it. A foreign-owned US disregarded entity faxes Form 5472 and its pro forma Form 1120 to the IRS at ${IRS_OGDEN_FAX} or mails them to the IRS Ogden PIN Unit. The IRS says these filers cannot e-file and must not use the ordinary Form 1120 addresses.`,
    howTo: {
      section: "How do you actually send a fax in 2026?",
      tools: ["Fax service"],
      supplies: [
        "Signed PDF",
        "Destination fax number",
        "Optional cover sheet",
        "Confirmation email",
        "Transmission receipt PDF",
      ],
    },
    sections: [
      {
        heading: "Where do I file Form 5472?",
        body: `A foreign-owned US disregarded entity files Form 5472, attached to a pro forma Form 1120, with the IRS by fax or by mail, using the dedicated route in the Form 5472 instructions. The IRS fax number is ${IRS_OGDEN_FAX}. The IRS mailing address is ${IRS_OGDEN_MAIL_ADDRESS}.\n\nThe instructions say these filers must write "Foreign-owned U.S. DE" across the top of the Form 1120, fax at 300 DPI or higher, and not use the mailing addresses in the Form 1120 instructions. They also say a foreign-owned U.S. DE cannot file Form 5472 electronically. Other reporting corporations attach Form 5472 to their own income tax return and file it with that return.\n\nFor the step-by-step mechanics, read [how to fax Form 5472](/blog/how-to-fax-form-5472-irs). If you would rather not send it yourself, our [Form 5472 fax filing service](/services/form-5472-fax-filing-service) faxes the package for you and gives you the timestamped receipt.`,
      },
      {
        heading: "What is the fax number?",
        body: "Fax to: +1-855-887-7737 (IRS Ogden PIN Unit). Send the complete Form 5472 plus attached pro forma Form 1120 package to that number, because the Ogden Service Center processes these foreign-owned disregarded-entity filings and they cannot be e-filed. Do not use it for unrelated corporate, partnership, or personal returns.\n\nIt's a US toll-free number, so from outside the US you can call it via any international fax service that supports US destinations. Most online fax services charge $1-$5 per send.",
      },
      {
        heading: "What do you need to send to the IRS?",
        body: "The fax must contain, in this order:\n\n1. Cover sheet (1 page) — your name, the LLC name, EIN, tax year, page count, and \"Form 5472 + Pro Forma 1120 — Foreign-Owned U.S. DE\".\n2. Pro forma Form 1120 — entity identification fields filled in, signed in pen, with \"Foreign-Owned U.S. DE\" stamped across the top. Income, deductions, and tax sections blank.\n3. Form 5472 — fully filled in (Parts I, II, III, IV, V, VII at minimum).\n4. Part V supporting statement — lists every reportable transaction (capital contributions in, distributions out, etc.) with date, amount, and related party.\n5. Reasonable Cause Statement — only if you're filing late under DIIRSP.\n\nTotal pages: typically 5-8 depending on transaction count.\n\nForm 1120 page 1 has the taxpayer signature block; Form 5472 does not. Ink signing of the completed cover followed by scanning is a conservative workflow. This does not establish an absolute ban on other methods. See [signatures and submission routes](/blog/form-5472-pro-forma-1120-signature).",
      },
      {
        heading: "Which fax services work?",
        body: `Any fax service that can send to a US toll-free number works. Common choices:\n\n• eFax (~$17/month with several free outbound pages monthly).\n• MyFax (~$10/month).\n• FaxZero (free for up to 5 pages with ads, or paid tier for ad-free).\n• Pamfax (pay-per-page, no subscription).\n• HelloFax / Dropbox Sign (~$10/month).\n• Google Voice with Workspace + HelloFax integration.\n• A physical fax machine if you have access.\n• Our service (IRS fax delivery included in every plan — from ${PRICE_STD}).\n\nFor a one-time fax of a 5-8 page document, FaxZero (free) or Pamfax (pay-per-page) are low-cost DIY options if you prefer to self-file. For ongoing use, monthly subscriptions become economical.\n\nKeep the transmission receipt the service generates — it shows the fax was successfully delivered, with a timestamp. Retain that provider-reported transmission evidence with the exact package. Keep the exact submitted package and any IRS account information or correspondence as well; a provider receipt does not guarantee penalty relief.`,
      },
      {
        heading: "How do you actually send a fax in 2026?",
        body: "You send a fax in 2026 through an online fax service: upload the signed PDF, enter +1-855-887-7737, send, and save the receipt.\n\n1. Sign up for an online fax service (FaxZero is free for occasional use; eFax / MyFax for subscriptions).\n2. Upload your signed PDF as the document to fax.\n3. Enter the destination fax number: +18558877737 (some services accept hyphens or parentheses; +1-855-887-7737 also works).\n4. Add an optional cover sheet (most services let you skip this since your cover letter is page 1 of the PDF).\n5. Send the fax.\n6. Wait for the confirmation email. Most US fax transmissions to the IRS complete in 5-30 minutes.\n7. Save the confirmation email and the transmission receipt PDF.\n\nThere's no need for a fax machine, fax modem, landline, or any specialized hardware. Online fax services route through real fax protocols on the receiving side — the IRS Ogden line is a standard US fax line that accepts these transmissions transparently.",
      },
      {
        heading: "IRS fax delivery — included in every plan",
        body: "IRS fax delivery is included in every plan at no extra charge. We fax the signed package to +1-855-887-7737 for you. You get:\n\n• A timestamped IRS Fax Transmission Receipt PDF emailed back to you.\n• A copy of the receipt in your portal you can re-download anytime.\n• An email confirmation when the fax delivers.\n• Automatic retry if the first attempt fails.\n• A formatted transmission record to retain with your filed package; it does not guarantee the outcome of an IRS timing dispute.\n\nIf the first fax attempt fails, we automatically retry. If multiple attempts fail (rare but possible during IRS Ogden maintenance windows), we'll reach out before falling back to certified mail. 100% money-back guarantee if we fail to submit your filing to the IRS.",
      },
      {
        heading: "What if the fax fails?",
        body: `A failed or partial fax does not establish a completed filing, so check the provider status and retry promptly once the problem is resolved. If fax remains unavailable near the deadline, assess the dedicated Ogden PIN Unit mailing route and keep both failed and successful attempt records.\n\nIf the deadline is near and fax remains unavailable, assess an authorized mail alternative that can meet the applicable deadline. Use the dedicated destination: ${IRS_OGDEN_MAIL_ADDRESS}. Mailing timeliness depends on the applicable postmark and delivery-service rules; do not assume any international courier or a logged fax attempt preserves the deadline.\n\nKeep failed and successful attempt records. If the deadline passes, obtain advice on the late filing rather than assuming a next-day transmission was timely.`,
      },
      {
        heading: "What common fax mistakes should you avoid?",
        body: "Avoid faxing an incomplete package, using the wrong number, leaving signing questions unresolved, or failing to save the receipt.\n\n• Faxing only Form 5472 without the pro forma 1120 — the IRS will reject and treat as not filed. Always send the complete package.\n• Faxing to the wrong number — must be +1-855-887-7737 (Ogden PIN Unit). Other IRS fax numbers are for different filings.\n• Leaving signing questions unresolved — ink signing of the completed Form 1120 cover and scanning is a conservative workflow; verify who has authority to sign.\n• Confusing a cover letter with the pro forma 1120 signature block; review each actual form and any separately required declaration.\n• Faxing pages out of order — the IRS Ogden team handles thousands of these; well-ordered packages are processed faster.\n• Forgetting to save the transmission receipt — without it, you have no transmission evidence.\n• Leaving filing until the deadline — transmit early and do not assume an unverified local-time cutoff or failed attempt preserves timeliness.\n• Sending color or low-resolution scans — the IRS specifies 300 DPI or higher for this fax route.",
      },
      {
        heading: "What proof of filing should you save?",
        body: "Keep a durable filing record; retention depends on the applicable rules and circumstances, not a universal six-year cutoff for incomplete returns:\n\n• The signed PDF you faxed (full package).\n• The fax transmission receipt with timestamp.\n• The fax service's confirmation email.\n• If you used our service: the timestamped IRS Fax Transmission Receipt PDF we email and store in your portal.\n• If you filed by mail: the certified mail receipt (PS Form 3800) and return receipt (PS Form 3811).\n\nIf a penalty notice arrives, these records can support a response but do not guarantee reversal. Read the notice and obtain advice about its facts and response deadline.\n\nStore them somewhere durable: cloud storage (Google Drive, Dropbox), email folder, or paper file. Don't rely on your fax service's own retention — many services delete sent items after a year or two.",
      },
      {
        heading: "Which is better: mail or fax?",
        body: "Fax is the right default for most foreign LLC owners, while mail is a backup when a specific fax failure requires it. Fax can complete in minutes, gives an immediate provider transmission record, avoids physical postal transit, and usually costs less than international certified mail.\n\nFax (preferred):\n• Faster delivery — transmission completes in minutes.\n• Immediate provider transmission record — not an IRS acceptance.\n• Avoids physical postal transit, but a transmission record does not establish IRS processing.\n• Cheaper than international certified mail.\n• Works the same from anywhere in the world.\n\nMail (backup):\n• Slower — takes days to weeks for delivery, especially internationally.\n• Mailing evidence depends on applicable postmark and delivery-service rules.\n• Risk of physical misdelivery or loss.\n• More expensive for international senders ($20-$80 vs $0-$5 for fax).\n• Can be the only option if fax service fails.\n\nFor most foreign LLC owners, fax is the right default. Mail can be a fallback for a specific fax failure. Do not automatically fax and mail duplicates merely because the IRS is silent.",
        table: {
          caption: "Mail, fax, and service delivery evidence",
          columns: ["Method", "Send to", "Proof you keep"],
          rows: [
            ["Fax", "+1-855-887-7737", "Provider transmission record"],
            ["Certified mail", "Ogden PIN Unit address", "Certified mail and return receipt"],
            ["Form5472 Prep fax", "+1-855-887-7737", "Timestamped receipt in your portal"],
          ],
        },
      },
    ],
    faqs: [
      {
        q: "Is +1-855-887-7737 the right fax number for Form 5472 in 2026?",
        a: "Yes. The current IRS Instructions for Form 5472 (Rev. December 2024) give 855-887-7737 as the fax number for Form 5472 + pro forma 1120 filings by foreign-owned US disregarded entities.",
      },
      {
        q: "Can I email Form 5472 to the IRS instead?",
        a: "No. The IRS does not accept Form 5472 by email under any circumstances. Fax or paper mail only.",
      },
      {
        q: "Do I get a confirmation from the IRS that they received my fax?",
        a: "The current Form 5472 instructions do not describe a routine acceptance acknowledgment for this faxed package. A provider receipt is transmission evidence, not an IRS-issued acceptance. Silence does not establish receipt, processing or approval.",
      },
      {
        q: "How long does it take you to fax it?",
        a: "Once you sign your filing and our accountant reviews the package, we fax it the same business day. You'll get the IRS fax transmission receipt by email within a few hours.",
      },
      {
        q: "What's the IRS Ogden mailing address?",
        a: `The dedicated address is ${IRS_OGDEN_MAIL_ADDRESS}. Retain mailing and delivery evidence; timely-mailing treatment depends on the applicable postal or designated delivery-service rules.`,
      },
      {
        q: "Can I fax from outside the US?",
        a: "Yes. Any online fax service that supports US destinations works from any country. The fax routes through standard US fax protocols on the receiving side — no special arrangement needed.",
      },
      {
        q: "What if the IRS Ogden fax is down on the deadline day?",
        a: "Retry promptly after checking the provider error and assess an authorized mailing alternative that can meet the deadline. A logged failed attempt does not make a next-morning fax automatically timely. Preserve all records and obtain advice if the deadline passes.",
      },
      {
        q: "Does the fax need a cover sheet?",
        a: "Recommended but not strictly required. Your filing package's cover letter (page 1 of the PDF) serves as the practical cover sheet. Some fax services add their own cover sheet automatically — that's fine too.",
      },
      {
        q: "Can I send multiple LLCs' filings in one fax?",
        a: "No. Each LLC's filing is a separate fax — different EIN, different package. Combining them risks mis-routing and incomplete processing.",
      },
      {
        q: "How do I get the timestamped transmission receipt?",
        a: "IRS fax delivery is included in every plan. After we fax your package, we email you a polished IRS Fax Transmission Receipt PDF that's also stored in your portal for re-download at any time.",
      },
    ],
    relatedSlugs: ["file-form-5472", "form-5472-deadline", "form-5472-instructions", "irs-form-5472", "1120-pro-forma-instructions"],
  },
  {
    slug: "single-member-llc-foreign-owner",
    keyword: "single-member llc foreign owner",
    title: "Single-Member LLC With a Foreign Owner — Filing Guide",
    metaDescription:
      "Single-member LLC foreign-owner filing rules cover Form 5472, pro forma Form 1120, federal deadlines, the $25,000 penalty, state duties, and late filings.",
    sources: [
      { label: "IRS: Single-member LLCs", url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" },
      { label: "Reg. §301.7701-2", url: "https://www.ecfr.gov/current/title-26/section-301.7701-2" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRC §6038A", url: "https://www.law.cornell.edu/uscode/text/26/6038A" },
    ],
    published: "2026-05-22",
    updated: "2026-09-11",
    h1: "Single-member LLC with a foreign owner — what you actually have to file",
    intro:
      "Non-US owners of single-member US LLCs, whether in Wyoming, Delaware, New Mexico, Florida, Nevada, or any state, have one critical annual federal filing the IRS imposes: Form 5472 attached to pro forma Form 1120. Missing it can trigger a $25,000 penalty per year, per form.",
    sections: [
      {
        heading: "Why does the IRS single out foreign-owned LLCs?",
        body: "The IRS singles out foreign-owned single-member LLCs because the 2017 rule added annual related-party disclosure while preserving disregarded income-tax treatment. Before that change, those entities were also disregarded for reporting, leaving the IRS without visibility into related-party transactions, beneficial ownership, or fund flows involving non-US owners.\n\nSince 2017, Treasury Regulation § 1.6038A-1 reclassifies foreign-owned disregarded entities as corporations specifically for Section 6038A reporting. That triggers an annual obligation to file Form 5472 to track every related-party transaction between the foreign owner and the LLC. The substantive tax treatment didn't change — the LLC is still disregarded for income tax. Only the disclosure obligation was added.",
      },
      {
        heading: "Do you actually have to file?",
        body: "Almost certainly yes, if you meet all three:\n\n1. You own (100%) a single-member US LLC. Multi-member LLCs file Form 1065 instead and aren't covered by this guide.\n2. You are NOT a US person — not a US citizen, not a green card holder, not a US tax resident (substantial presence test, etc.).\n3. Your LLC had at least one reportable transaction in the year — capital contributions in, distributions out, loans, payments to or from you, or any related-party transaction.\n\nA reportable transaction is interpreted broadly. The list of things that count:\n• Wiring USD into the LLC's bank account to fund operations.\n• Paying yourself a distribution.\n• Loan from you to the LLC (or LLC to you).\n• Renting your home office to the LLC.\n• Payments between the LLC and any other entity you control (a foreign company, another US LLC).\n• Sales of property between you and the LLC.\n\nIn practice every active foreign-owned LLC files every year. The only realistic exception: an LLC that's truly dormant (no bank account opened, no money moved, no contracts) for the entire year.",
      },
      {
        heading: "What do you owe, and what do you file?",
        body: "You usually owe no tax on the Form 5472 package, but you file Form 5472 with a pro forma Form 1120 every year. The federal information return discloses related-party transactions, calculates no tax liability on those forms, carries a $25,000 missed-form penalty, and is due April 15 or October 15 with extension.\n\nForm 5472 + pro forma Form 1120 (always required):\n• Annual federal information return.\n• Discloses related-party transactions.\n• No tax liability calculated on these forms.\n• $25,000 penalty per missed form per year.\n• Due April 15 (October 15 with extension).\n\nUS federal income tax (usually $0):\n• Foreign-owned single-member LLCs are disregarded for tax.\n• If income is foreign-source and you have no US trade or business: $0 US federal income tax.\n• If income is US-source effectively connected with a US trade or business: file Form 1040-NR personally; may owe US tax.\n• Most ecommerce / SaaS / consulting LLCs serving non-US customers owe nothing.\n\nState tax (depends on state):\n• Wyoming, Delaware (out-of-state), Nevada, Florida, Texas, New Mexico: no state income tax on LLCs.\n• California, New York, others: state-level tax may apply.\n• Annual report fee: varies $60-$400/year by state.\n\nMost foreign-owned single-member LLCs that sell internationally owe $0 in US federal tax but still must file Form 5472 + pro forma 1120 every year just to stay compliant.",
        table: {
          caption: "Tax owed and filing required",
          columns: ["Item", "Do you owe it?", "Do you file it?"],
          rows: [
            ["Federal income tax", "Usually $0", "Form 1040-NR if US-source ECI"],
            ["Form 5472", "No tax calculated", "Yes, every year"],
            ["Pro forma Form 1120", "No tax calculated", "Filed with Form 5472"],
            ["State filings", "Depends on state", "Annual reports vary by state"],
          ],
        },
      },
      {
        heading: "What is the $25,000 penalty in detail?",
        body: "The IRS penalty for not filing Form 5472:\n• Base: $25,000 per form, per year. Per LLC.\n• Continuation: another $25,000 per 30-day period after IRS notice, if not filed within 90 days.\n• No statutory cap.\n• Assessed automatically by IRS computer system, no human review.\n\nMath examples:\n• 1 LLC, 1 missed year: $25,000.\n• 1 LLC, 3 missed years: $75,000.\n• 2 LLCs, 3 missed years each: $150,000.\n• 1 LLC, 1 missed year, still unfiled 12 months after the IRS notice: $25,000 + 10 × $25,000 = $275,000 (nothing extra for the first 90 days, then $25,000 for each 30-day period or part of one).\n\nThis is the single largest compliance risk most foreign LLC owners are unaware of. The penalty is for failing to FILE the disclosure return, not for failing to pay tax. Most foreign LLC owners owe zero US tax — the penalty applies anyway.\n\nIf you've missed prior years, file under DIIRSP (Delinquent International Information Return Submission Procedure) immediately. No outcome is guaranteed: the IRS may still assess a penalty during processing, and the reasonable-cause statement is then the basis for responding.",
      },
      {
        heading: "What are typical foreign-owner LLC profiles?",
        body: `Profile 1: SaaS founder.\n• Delaware LLC formed via Stripe Atlas.\n• Owner abroad (e.g. UK, Singapore, Hong Kong).\n• Selling SaaS via Stripe to global customers.\n• Revenue $50K-$2M.\n• US federal tax: $0 (no US trade or business, foreign-source services).\n• Required filings: Form 5472 + pro forma 1120 federal, Delaware franchise tax $400. No BOI report — US-formed LLCs have been exempt from FinCEN BOI reporting since March 26, 2025. Total federal compliance with us: ${PRICE_STD}/year.\n\nProfile 2: Ecommerce / dropshipping.\n• Wyoming LLC.\n• Owner in Vietnam, Mexico, etc.\n• Shopify store with worldwide customers (no US warehouse).\n• Revenue $20K-$500K.\n• US federal tax: $0 (no US-source income).\n• Required filings: Form 5472 + pro forma 1120 federal, Wyoming annual report $60, sales tax if nexus crossed. Total federal compliance with us: ${PRICE_STD}/year.\n\nProfile 3: Consulting / agency.\n• Wyoming or Delaware LLC.\n• Owner in EU, India, Brazil.\n• Consulting clients in US and abroad.\n• Revenue $30K-$300K.\n• US federal tax: $0 if consulting performed outside the US.\n• Required filings: Form 5472 + pro forma 1120 federal, state annual report. With us: ${PRICE_STD}/year.\n\nProfile 4: Stripe Atlas Delaware LLC, no revenue.\n• Just formed.\n• Funded $5K-$10K to open Mercury bank account.\n• No customers yet.\n• Required filings: Form 5472 + pro forma 1120 federal (the capital contribution counts as a reportable transaction). With us: ${PRICE_STD}/year.`,
      },
      {
        heading: "What is in the federal filing package?",
        body: "The complete federal filing package has five parts every year.\n\n1. Cover letter (1 page) identifying the filing.\n2. Pro forma Form 1120 with entity info and \"Foreign-Owned U.S. DE\" stamp.\n3. Form 5472 (Parts I, II, III, IV, V, VII).\n4. Part V supporting statement listing each reportable transaction.\n5. Reasonable Cause Statement (only if filing late under DIIRSP).\n\nTotal: 5-8 pages. Faxed as one package to the IRS Ogden PIN Unit at +1-855-887-7737.\n\nNo income tax calculation, no Schedule C / 1040, no payroll forms (unless you have US employees, which most foreign-owned LLCs don't).",
      },
      {
        heading: "When and how do you file?",
        body: `File by April 15, or by October 15 with Form 7004, and send the package by fax or mail to the IRS Ogden PIN Unit. The section lists fax as the preferred route for a timestamped transmission receipt, mail as backup, and e-file as unavailable for foreign-owned DE filings.\n\nWhen: April 15 of the year following the tax year. October 15 with Form 7004 extension.\n\nHow:\n• Fax to +1-855-887-7737 (IRS Ogden PIN Unit) — preferred. Get a timestamped transmission receipt as transmission evidence.\n• Mail to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 — backup. Use certified mail with return receipt.\n• E-file: NOT available for foreign-owned DE filings.\n\nWho:\n• Establish who is authorized to sign for the LLC. Ink signing the completed Form 1120 is a conservative workflow; Form 5472 has no separate signature block.\n\nWith us:\n• Wizard (12 questions) → generated PDF → sign once on screen → accountant review → fax to IRS → timestamped receipt. ~15 minutes total. ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — same filing on every plan. IRS fax delivery included. +${PRICE_ADDON} per additional past year.`,
      },
      {
        heading: "What do you do if you've missed prior years?",
        body: `Many foreign owners discover Form 5472 a year or more after forming their LLC. The IRS provides DIIRSP — Delinquent International Information Return Submission Procedure — as the standard catch-up:\n\n• File all missed years together as one package.\n• Include a Reasonable Cause Statement.\n• Fax to +1-855-887-7737.\n• Expect no guaranteed outcome: the IRS may still assess a penalty during processing, and the statement is then the basis for responding.\n\nOur DIIRSP packages:\n• 2-year catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included).\n• 3-year catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included).\n• ${NOTE_24H}\n• Reasonable cause statement auto-generated, accountant-reviewed.\n\nDon't wait. Once the IRS issues a CP 215 notice for a missed year, DIIRSP is no longer available for that year and you're stuck with a much harder post-assessment appeal.`,
      },
      {
        heading: "What common scenarios don't we cover?",
        body: "We do not cover cases outside single-member, foreign-owned, disregarded LLCs with no US tax liability — those need a CPA.\n\n• Multi-member LLCs (need Form 1065, not 1120).\n• LLCs that elected C-corp taxation via Form 8832 (need full Form 1120 with income/tax).\n• LLCs with US-source effectively connected income (need Form 1040-NR personally, possibly more complex 1120 filing).\n• LLCs with US employees (need payroll tax filings — Form 941, W-2, etc.).\n• LLCs that own US real estate generating rental income (need 1040-NR and 8288 withholding).\n• LLCs with Amazon FBA inventory in US warehouses (may be US trade or business; talk to a foreign-seller CPA).\n• LLCs with complex international structures (foreign parents, multiple jurisdictions, cost-sharing agreements).\n\nFor the standard profile — solo foreign founder, US LLC, customers worldwide, $0 US tax — our service is the right fit. Anything outside that: get a CPA familiar with foreign owners.",
      },
      {
        heading: "The fastest way to file",
        body: `Our 15-minute online filer handles everything for the standard foreign-owned single-member LLC case:\n\n• 12-question wizard pre-tuned for non-US founders.\n• Pre-fills the next year from your prior filing.\n• Generates the complete package: cover letter, pro forma Form 1120, Form 5472 (all parts), Part V supporting statement, Reasonable Cause Statement (if late).\n• In-portal canvas signature — no printing, scanning, or uploading needed.\n• Accountant review on every package before submission.\n• IRS fax delivery + timestamped receipt as transmission evidence.\n• 100% money-back guarantee if we fail to submit.\n\nPricing:\n• 1 tax year: ${PRICE_STD} Standard / ${PRICE_EXP} Express / ${PRICE_24H} 24-Hour (fax included)\n• 2 tax years (DIIRSP catch-up): ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3 tax years (DIIRSP catch-up): ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n• ${NOTE_24H}\n• +${PRICE_ADDON} per additional past year beyond the base package`,
      },
    ],
    faqs: [
      {
        q: "I just formed my LLC and haven't done anything with it yet. Do I file?",
        a: "If your LLC had ANY transactions in the year — including the capital contribution to fund the bank account — yes, file Form 5472. If it had genuinely zero activity (no bank account opened, no money in or out), you can argue no reportable transaction occurred. Most owners file anyway for safety.",
      },
      {
        q: "Can my US CPA file this for me?",
        a: `They can, but most US-based CPAs see this filing once or twice in their career and aren't comfortable with it. Expect $400-$800 and 1-2 weeks of back-and-forth. Our service from ${PRICE_STD} (IRS fax delivery included) takes 15 minutes and is reviewed by an accountant on our team.`,
      },
      {
        q: "What if I have multiple foreign-owned LLCs?",
        a: "Each one needs its own Form 5472 + pro forma 1120 — separate filing per LLC. You'd start a separate filing in our portal for each LLC.",
      },
      {
        q: "Do I need a US ITIN or just my foreign tax ID?",
        a: "You don't need a US ITIN. Form 5472 accepts your foreign tax ID (FTIN) or a self-assigned Reference ID. If you leave the Reference ID blank in our wizard, we generate one based on your name (e.g. SMITHJA7B2 — letters and numbers only, no special characters, per IRS rules).",
      },
      {
        q: "Does filing Form 5472 mean I owe US tax?",
        a: "No. Form 5472 is an information return — disclosure only. Most foreign-owned single-member LLCs owe $0 US federal income tax regardless of whether they file Form 5472. The form doesn't itself trigger any tax liability.",
      },
      {
        q: "What's the easiest US state for a foreign-owned LLC?",
        a: "Wyoming for cheapest ongoing fees ($60/year state, no state income tax). Delaware for investor-friendly governance (but $400/year franchise tax). New Mexico, Florida, Nevada also good. Avoid California and New York unless you have nexus there — they impose more state taxes.",
      },
      {
        q: "What if my LLC is dormant — no revenue all year?",
        a: "If you had even one capital contribution (e.g. wiring $1,000 to fund the bank account), that's a reportable transaction and you file. If truly dormant (no bank account, no activity), you may not have a filing obligation — but most owners file regardless to avoid the $25,000 penalty risk.",
      },
      {
        q: "How do I know if my LLC has US-source income?",
        a: "If your customers are outside the US and you have no fixed US place of business or US employees, your income is foreign-source. If you have a US warehouse (e.g. Amazon FBA), US employees, or US real estate, you may have US-source effectively connected income. Talk to a CPA for the borderline cases.",
      },
      {
        q: "Do I file BOI report too?",
        a: "No. Since March 26, 2025, FinCEN has exempted all US-formed entities, including single-member LLCs owned by non-US persons, from Beneficial Ownership Information (BOI) reporting under the Corporate Transparency Act. Only foreign-formed entities registering to do business in a US state still file BOI. This is separate from Form 5472, which remains fully required.",
      },
      {
        q: "What's the worst case if I just never file?",
        a: "The IRS eventually issues a CP 215 penalty notice ($25,000 per missed year per form). If you ignore it past the 90-day window, continuation penalties stack at $25,000 per 30 days. A single LLC with 1 missed year could become $100,000+ in penalties within 18 months of ignored notices. Don't let it get there — file under DIIRSP now while it's still available.",
      },
    ],
    relatedSlugs: ["form-5472-vs-1120", "foreign-owned-llc-tax", "form-5472-germany", "form-5472-uae", "wyoming-llc-form-5472", "delaware-llc-form-5472"],
  },
  {
    slug: "stripe-atlas-form-5472",
    keyword: "stripe atlas form 5472",
    title: "Stripe Atlas LLC + Form 5472 — What You Must File",
    metaDescription:
      "Stripe Atlas Form 5472 rules require eligible foreign-owned single-member LLCs to file annually. Learn what Atlas covers and how to submit the IRS package.",
    sources: [
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Single-member LLCs", url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" },
      { label: "IRS: Delinquent international information return procedures", url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures" },
      { label: "Stripe Atlas: Pricing and inclusions", url: "https://stripe.com/atlas" },
      { label: "Stripe Docs: Atlas business taxes", url: "https://docs.stripe.com/atlas/business-taxes" },
      { label: "Stripe: How to open an LLC in the USA as a nonresident", url: "https://stripe.com/resources/more/how-to-open-an-llc-in-the-usa-for-nonresidents" },
    ],
    published: "2026-05-22",
    updated: "2026-10-05",
    h1: "Stripe Atlas LLC owners — Form 5472 is on you, not Stripe",
    intro:
      "Stripe Atlas incorporates Delaware LLCs and C corps, but Atlas's published inclusions do not list the annual Form 5472 plus pro forma Form 1120 filing. For a foreign-owned single-member LLC that package stays with the owner, and missing it can trigger a $25,000 penalty per form, per year.",
    sections: [
      {
        heading: "What does Stripe Atlas cover and not cover?",
        body: "Stripe Atlas's pricing section (checked October 5, 2026) lists a US$500 one-time fee covering Delaware incorporation, a company tax ID, founder equity, an 83(b) election filing, document templates and the first year of registered agent service. Form 5472 is not on that list.\n\nListed in Atlas's US$500 setup fee:\n\n• Company incorporation in Delaware, including expedited processing and state filing fees.\n• Company tax ID (EIN).\n• Founder equity issuance and share purchase.\n• 83(b) election filing.\n• Document templates created with Cooley LLP.\n• First year of registered agent service (then US$100 a year).\n\nNot in Atlas's published inclusions (its business-taxes docs point founders to partner tax and accounting services):\n\n• Annual federal tax filings, including Form 5472.\n• Pro forma Form 1120 (the attachment to Form 5472).\n• Delaware annual LLC tax ($400/year, due June 1).\n• State annual reports outside Delaware.\n• Personal Form 1040-NR (if you have US-source income).\n• Sales tax registrations.\n• Bookkeeping or accounting.\n\nNote: BOI (Beneficial Ownership Information) reporting isn't on this list because it no longer applies. Since March 26, 2025, FinCEN has exempted US-formed entities like your Delaware LLC from BOI reporting entirely.\n\nIf you formed your LLC through Stripe Atlas and you're a non-US person, Form 5472 is yours to file — every year, by April 15. Atlas's published ongoing service is registered agent renewal, not the annual IRS filing.",

        table: {
          caption: "Stripe Atlas and Form5472 Prep task split",
          columns: ["Task", "Stripe Atlas", "Form5472 Prep"],
          rows: [
            ["LLC formation", "Forms Delaware LLCs", "Built for this profile"],
            ["Form 5472 package", "Not in published inclusions", `${PRICE_STD} Standard filing`],
            ["IRS fax filing", "Not in published inclusions", "Fax delivery included"],
            ["Catch-up for missed years", "Not in published inclusions", `+${PRICE_ADDON} per additional past year`],
          ],
        },
      },
      {
        heading: "Why does this catch Stripe Atlas founders off guard?",
        body: "This catches Stripe Atlas founders off guard because the IRS still requires Form 5472 even when the LLC owes zero US federal tax or only has startup funding. Their LLC has clear revenue, runs through Stripe and Mercury, and from their perspective the US side \"just works\".\n\nThe disconnect: the IRS requires Form 5472 even when:\n• Your LLC owes zero US federal tax (most do).\n• Your LLC's customers are 100% outside the US.\n• Your LLC's only activity is one wire from you to fund operations.\n\nThat wire is itself a reportable transaction. So almost every Stripe Atlas LLC owes Form 5472 every year.\n\nThe second disconnect: there's no IRS reminder. The IRS doesn't email you in March saying \"hey, Form 5472 is due in 30 days.\" You're expected to know. Most founders learn about Form 5472 from a Reddit thread, a Stripe Atlas community post, or — worst case — a CP 215 penalty notice in the mail two years after they should have filed.",
      },
      {
        heading: "What is the typical Stripe Atlas compliance stack?",
        body: `The typical Stripe Atlas compliance stack includes federal Form 5472, Delaware franchise tax, and situational filings. The federal piece is Form 5472 plus pro forma Form 1120 due April 15; Delaware's annual LLC franchise tax is separate and due June 1; personal, sales, or payroll filings depend on facts.\n\nFederal (us):\n• Form 5472 + pro forma Form 1120 due April 15. $25,000 penalty if missed. Our service: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — identical filing, IRS fax delivery included.\n• BOI report to FinCEN — NOT required. Since March 26, 2025, FinCEN has exempted US-formed entities, including Delaware LLCs, from BOI reporting under the Corporate Transparency Act.\n\nState (Delaware, self-serve):\n• Delaware Annual LLC Franchise Tax: $400, due June 1. Self-serve at corp.delaware.gov.\n\nSituational:\n• Personal Form 1040-NR — only if you have US-source income personally (rare for most Stripe Atlas LLCs).\n• Sales tax registrations — only if you cross economic nexus thresholds in specific states (rare for SaaS, more common for physical-goods ecommerce).\n• Payroll taxes — only if you have US employees (rare).\n\nBeyond formation:\n• Atlas's published ongoing service is registered agent renewal (US$100 a year after year one). Its business-taxes docs point founders to partner tax and accounting services that offer discounts to Atlas users.\n\nTotal annual federal compliance with us: Standard ${PRICE_STD} (fax delivery included). Plus $400 Delaware state. Total year 2+: ${PRICE_STD_PLUS_DE_TAX}/year.`,
      },
      {
        heading: "What do you actually file for Form 5472?",
        body: `You file a cover letter, pro forma Form 1120, Form 5472, Part V supporting statement, and reasonable cause statement when filing late.\n\n1. Cover letter identifying the filing.\n2. Pro forma Form 1120 — entity info only, stamped \"Foreign-Owned U.S. DE\" at the top. Income, deductions, tax sections all blank.\n3. Form 5472 — Parts I (your LLC), II (you as foreign shareholder), III (you again as related party), IV (monetary transactions, often blank), V (reportable transactions — capital contributions, distributions), VII (FDE confirmation).\n4. Part V supporting statement — list of each reportable transaction.\n5. Reasonable Cause Statement — only if filing late under DIIRSP.\n\nAll faxed to the IRS Ogden PIN Unit at +1-855-887-7737. The fax transmission receipt is your transmission evidence.\n\nTotal pages: 5-8. Total time to file with us: ~15 minutes. Total cost with us: Standard ${PRICE_STD} (IRS fax delivery included).`,
      },
      {
        heading: "What are common Stripe Atlas LLC scenarios?",
        body: `Common Stripe Atlas LLC scenarios include year-one funding, growing SaaS activity, late discovery, and multiple LLCs. The examples cover a no-revenue first year with a capital contribution, a second-year SaaS business with distributions, DIIRSP catch-up after missed years, and separate annual filings for separate LLCs.\n\nScenario A — Year 1, no revenue yet: Lucia formed her Stripe Atlas LLC in June 2024. By December 2024 the only activity was: $5K capital contribution to open Mercury account + $500 spent on Stripe Atlas formation fee. Required for tax year 2024: Form 5472 + pro forma 1120. Part V reports the $5K capital contribution. Files by April 15, 2025 with our service for Standard ${PRICE_STD} (fax included).\n\nScenario B — Year 2, growing SaaS: Mei has been running her Stripe Atlas Delaware LLC for 2 years selling SaaS to EU customers. Year 2 revenue: $180K, $0 US tax owed. She files Form 5472 + 1120 reporting capital contributions and distributions to/from her HK bank account. Standard ${PRICE_STD} (fax included) with our service.\n\nScenario C — Discovered Form 5472 late: Carlos formed his Stripe Atlas LLC in 2022. Three years later (2025) he discovers Form 5472 obligation. He files 2022, 2023, 2024 together under DIIRSP using our 3-year catch-up (Standard $347, fax included). Reasonable cause statement auto-generated for first-time foreign-owner unawareness. No outcome is guaranteed: if a penalty is assessed during processing, the statement is the basis for responding.\n\nScenario D — Multiple Stripe Atlas LLCs: Mei has 3 separate Stripe Atlas LLCs for 3 different product lines. Each one needs its own Form 5472 + pro forma 1120 every year — 3 separate filings, Standard ${PRICE_STD} each with us = ${PRICE_STD_X3}/year just for federal compliance.`,
      },
      {
        heading: "How do we handle Stripe Atlas Form 5472 filings?",
        body: `We handle Stripe Atlas Form 5472 filings with a wizard pre-tuned for the Stripe Atlas, Mercury, and non-US-founder profile. The wizard is set up for this exact case:\n\n• 12-question wizard. Pre-filled state (Delaware), common NAICS suggestions for SaaS / ecommerce / consulting.\n• In-portal canvas signature — no printing, scanning, or uploading needed.\n• Accountant review on every package before submission.\n• IRS fax delivery + timestamped receipt as transmission evidence.\n• Pre-fills the next year from your prior filing — year 2 onward takes 5 minutes.\n• Optional annual reminder emails so you don't miss the April 15 deadline.\n\nPricing:\n• 1 tax year: ${PRICE_STD} Standard / ${PRICE_EXP} Express / ${PRICE_24H} 24-Hour (fax included)\n• 2 tax years (DIIRSP catch-up): ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3 tax years (DIIRSP catch-up): ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n• ${NOTE_24H}\n• +${PRICE_ADDON} per additional past year\n\n100% money-back guarantee if we fail to submit your filing to the IRS.`,
      },
      {
        heading: "What do you do if you've missed prior years as a Stripe Atlas user?",
        body: `Many Stripe Atlas founders discover Form 5472 a year or two after forming their LLC. The IRS provides DIIRSP — Delinquent International Information Return Submission Procedure — as the standard catch-up:\n\n• File all missed years together as one package.\n• Include a Reasonable Cause Statement explaining first-time foreign-owner unawareness.\n• Fax to +1-855-887-7737 (IRS Ogden PIN Unit).\n• Expect no guaranteed outcome: the IRS may still assess a penalty during processing, and the statement is then the basis for responding.\n\nDIIRSP eligibility: you have not yet been contacted by the IRS about the specific year's delinquency. As long as no CP 215 notice has arrived for those years, DIIRSP is available.\n\nOur multi-year packages:\n• 2-year catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included).\n• 3-year catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included).\n\n${NOTE_24H}\n\nDon't wait. Once the IRS issues a CP 215, that year's DIIRSP eligibility ends and you're in the harder post-assessment appeal process.`,
      },
      {
        heading: "The Stripe Atlas + Mercury banking dimension",
        body: "If your Stripe Atlas LLC banks with Mercury, a US-based fintech, the LLC's main bank account is considered US — no FBAR (foreign bank account report) is required just for the Mercury account.\n\nIf you supplement Mercury with Wise USD, Brex, Relay, or other US-based business banking — also fine, no FBAR.\n\nFBAR enters the picture only if your LLC opens accounts OUTSIDE the US (e.g. Wise EUR account, Revolut Business EU). In those cases the LLC itself may need to file FBAR, separate from Form 5472. Talk to a tax professional if your LLC has non-US accounts.\n\nFor the standard Stripe Atlas + Mercury / Wise USD / Brex profile, Form 5472 + Delaware franchise tax is the complete compliance picture — BOI reporting doesn't apply since FinCEN exempted US-formed entities on March 26, 2025. No FBAR needed.",
      },
      {
        heading: "What are common Stripe Atlas + Form 5472 mistakes?",
        body: "Common mistakes include assuming Atlas handles annual filings, starting too late, following outdated BOI advice, and filing without the pro forma 1120.\n\n• Assuming Stripe Atlas \"handles everything\" — Atlas's published inclusions do not list Form 5472 or other annual federal filings.\n\n• Waiting until April 14 to start — gather records earlier. Year 1 you'll need: Mercury statements, Stripe payout reports, any wires you made to/from the LLC.\n\n• Believing you still owe a BOI report — outdated advice. Since March 26, 2025, FinCEN has exempted US-formed entities, including Delaware LLCs, from Beneficial Ownership Information reporting. Don't pay anyone to file one for you.\n\n• Forgetting Delaware franchise tax — $400/year due June 1. Different deadline from Form 5472. Pay directly at corp.delaware.gov.\n\n• Assuming your CPA back home (in your country) knows about Form 5472 — they almost certainly don't. This is US-specific.\n\n• Filing only Form 5472 without the pro forma 1120 — invalid filing, triggers $25,000 penalty.\n\n• Planning to e-file the package — the IRS Form 5472 instructions send a foreign-owned DE's Form 5472 and pro forma 1120 by fax or mail.",
      },
      {
        heading: "Bottom line for Stripe Atlas LLC owners",
        body: `Stripe Atlas got you the LLC, the tax ID, and the first year of registered agent service. Its published inclusions stop short of the annual IRS filing. From year 1 onward, Form 5472 + pro forma 1120 is on you, due April 15 each year, with a $25,000 penalty per year if missed.\n\nOur service is built for this profile — fixed pricing, accountant-reviewed, with a money-back guarantee if we fail to submit. ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — identical filing, IRS fax delivery included. Most of our customers come from Stripe Atlas, Mercury, and similar foreign-founder onboarding paths.\n\nFile early, file every year, keep the fax receipt for your records. The $25,000 penalty is the single largest compliance risk for your LLC — bigger than every other federal/state obligation combined.`,
      },
    ],
    faqs: [
      {
        q: "Does Stripe Atlas file Form 5472 for me?",
        a: "Not according to Atlas's published inclusions (checked October 5, 2026): the US$500 fee covers incorporation, tax ID, equity, 83(b) filing, templates and first-year registered agent. Atlas's business-taxes docs point to partner tax and accounting services. Plan to file Form 5472 yourself or through a filing service.",
      },
      {
        q: "I just got my Stripe Atlas LLC this year — do I file Form 5472 already?",
        a: "If your LLC had any reportable transaction in its first year (including the initial capital contribution to fund the Mercury account or pay the Stripe Atlas formation fee), yes. The filing is due April 15 of the following year.",
      },
      {
        q: "Do I also need Delaware franchise tax compliance?",
        a: "Yes — Delaware charges a $400 annual franchise tax for LLCs, due June 1. Completely separate from Form 5472. We don't handle Delaware state filings; pay it directly at corp.delaware.gov (10-minute self-serve form).",
      },
      {
        q: "What's the cheapest option if I have one year to file?",
        a: `Standard ${PRICE_STD} (fax delivery included). IRS fax delivery is included in every plan — no separate fee.`,
      },
      {
        q: "I have 3 Stripe Atlas LLCs — do I file 3 separate Form 5472s?",
        a: `Yes. Each LLC files its own Form 5472 + pro forma 1120 separately. Three LLCs = three filings = ${PRICE_STD_X3}/year at our Standard rate (3 × $149, fax included). Each gets its own fax receipt.`,
      },
      {
        q: "My Stripe Atlas LLC owes no US income tax — why file Form 5472?",
        a: "Owing no US income tax and filing Form 5472 are separate questions. Form 5472 + pro forma 1120 is an information return (disclosure, not tax), and the $25,000 penalty applies to non-filing whether or not tax is owed.",
      },
      {
        q: "Does Stripe send my info to the IRS automatically?",
        a: "Payment processors may file Form 1099-K when IRS reporting thresholds are met, but that report is not Form 5472 and does not satisfy it. Your LLC still files Form 5472 + pro forma 1120 itself whenever it had a reportable transaction.",
      },
      {
        q: "I formed my LLC through Atlas but moved it to Wyoming. Does that change anything?",
        a: "Federal Form 5472 obligation is identical in Wyoming and Delaware. State fees are lower in Wyoming ($60 vs $400). The federal piece — what we handle — is the same in both states.",
      },
      {
        q: "I missed Stripe's note about Form 5472. Is it really my responsibility?",
        a: "Yes. Once you formed a US LLC as a foreign person, the Form 5472 obligation is yours. If you missed prior years and the IRS has not contacted you, DIIRSP lets you file the late returns with a reasonable cause statement; no outcome is guaranteed.",
      },
      {
        q: "Does your service work for Stripe Atlas LLCs specifically?",
        a: "Yes — most of our customers are Stripe Atlas Delaware LLC owners. The wizard is pre-tuned for this profile (defaults to Delaware, common NAICS for SaaS / ecommerce / consulting, Mercury-style banking assumptions). 15 minutes for year 1, even faster for year 2+.",
      },
    ],
    relatedSlugs: ["delaware-llc-form-5472", "foreign-owned-llc-tax", "single-member-llc-foreign-owner", "form-5472-deadline", "irs-form-5472"],
  },
  {
    slug: "form-5472-reasonable-cause-statement",
    keyword: "form 5472 reasonable cause statement",
    title: "Form 5472 Reasonable Cause Statement (DIIRSP Template Guide)",
    metaDescription:
      "Form 5472 reasonable cause statements support late filings under DIIRSP. Learn the required elements, what weakens a request, and what happens after submission.",
    sources: [
      { label: "IRS: Delinquent international information return procedures", url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures" },
      { label: "IRS: Penalty relief for reasonable cause", url: "https://www.irs.gov/payments/penalty-relief-for-reasonable-cause" },
      { label: "IRC §6038A", url: "https://www.law.cornell.edu/uscode/text/26/6038A" },
    ],
    published: "2026-05-22",
    updated: "2026-10-05",
    h1: "Reasonable cause statement for Form 5472 — what to include",
    intro:
      "Late Form 5472 filings under DIIRSP need a Reasonable Cause Statement for each late return to request abatement of the $25,000-per-form-per-year penalty. Done well, it can prevent major penalties; done poorly or skipped, the penalty is assessed automatically, so the request needs careful structure before fax submission.",
    sections: [
      {
        heading: "What does the IRS expect?",
        body: "A reasonable cause statement is the IRS's standard mechanism for requesting penalty relief on a late international information return (Forms 5472, 5471, 8865, 8938). It must demonstrate that:\n\n1. You acted in good faith and exercised ordinary business care and prudence.\n2. Your failure to file on time was due to circumstances beyond your reasonable control or based on a reasonable misunderstanding of the law.\n3. You corrected the failure as soon as you became aware of it.\n\nThere's no automatic waiver. The IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement. A specific, documented statement is the strongest basis for responding if a penalty notice (such as CP 215) follows.\n\nThe \"ordinary business care and prudence\" standard is the same one the IRS uses across penalty abatement contexts. The question isn't whether you were perfect — it's whether a reasonable person in similar circumstances would have known to file.",
      },
      {
        heading: "What should you include in your Reasonable Cause Statement?",
        body: "A complete reasonable cause statement for Form 5472 includes:\n\n1. Taxpayer identification:\n• LLC legal name, EIN, US address.\n• Foreign owner name, FTIN or Reference ID, country of citizenship and tax residence.\n• Tax year(s) being filed late.\n\n2. Description of the failure:\n• Which years were not filed.\n• When and how you became aware of the Form 5472 obligation.\n• What triggered the discovery (Google search, advisor, online community, IRS reference materials).\n• Explicit acknowledgment that the form should have been filed timely.\n\n3. Reasonable cause narrative:\n• Specific circumstances that prevented timely filing.\n• Common bases: first-time foreign LLC owner unaware of US filing requirements; LLC formed via Stripe Atlas / formation service that didn't include annual compliance; language barrier; complex international circumstances.\n• If an adviser was involved, give the facts of that advice: what you asked, what information you gave them and what they told you. The IRS manual says relying on someone else to file is generally not reasonable cause, because the filing duty cannot be delegated (IRM 20.1.1.3.2.2.5), and reliance on a tax advisor's advice helps only in limited cases involving a technical or complicated substantive issue (IRM 20.1.1.3.3.4.3).\n• Concrete dates and facts, not vague generalizations.\n\n4. Corrective action:\n• Explicit statement that you are filing all delinquent returns concurrently in this DIIRSP submission.\n• Steps taken to ensure future compliance (annual reminder, calendar entry, filing service subscription, professional advisor relationship).\n• Confirmation that no US tax is owed for the years in question (most foreign-owned single-member LLCs owe $0 US tax).\n\n5. Request:\n• Clear request that penalties be abated under DIIRSP.\n• Reference to IRS published DIIRSP procedure.\n\nTotal length: 1-2 pages. Concise and factual is more persuasive than long and discursive.",
      },
      {
        heading: "What should you not put in it?",
        body: "You should not put red flags in it that hurt your reasonable cause argument.\n\n• \"I didn't think it applied to me\" without explanation of why you reasonably held that belief.\n• Excuses that suggest negligence: \"I forgot,\" \"I was too busy,\" \"my accountant never told me\" without further context.\n• Statements that contradict facts visible on the form itself (e.g. claiming unawareness while reporting years of revenue).\n• Boilerplate language copied verbatim from forums or generic templates with no facts specific to your situation.\n• Aggressive or accusatory language toward the IRS.\n• Vague timelines or contradictory dates.\n• Claims of reliance on a professional without naming when you consulted them or what they advised.\n• Implications that tax avoidance motivated the non-filing.\n• Statements that you'd file in the future only if penalties are waived.\n• Excessive length (over 3 pages) — the IRS examiner has limited time per case.\n• Lawyer-speak when the underlying situation is simple.\n• Filing under DIIRSP when you actually owe US tax (use Streamlined Filing Compliance Procedures or another path instead).\n\nThe statement should be factual, specific to your circumstances, and concise — typically 1-2 pages.",
      },
      {
        heading: "What is a sample structure for a Reasonable Cause Statement?",
        body: "A sample Reasonable Cause Statement structure starts with a header, opening paragraph, background, reasonable cause narrative, corrective action, and closing. The outline then fills in LLC identification, EIN, owner, tax years, DIIRSP request language, business background, specific late-filing facts, concurrent corrective filing, future compliance steps, and signature details.\n\nA well-structured reasonable cause statement follows this outline:\n\nHeader:\n• [LLC Legal Name]\n• EIN: [XX-XXXXXXX]\n• Foreign Owner: [Your Name]\n• Tax Year(s): [Year(s) being filed late]\n• Subject: Reasonable Cause Statement under DIIRSP\n\nOpening paragraph (1-2 sentences):\n• \"This statement is submitted under the Delinquent International Information Return Submission Procedure (DIIRSP) in support of the attached delinquent Form 5472 + pro forma Form 1120 for tax year(s) [year(s)]. We request that the IRC § 6038A penalties be abated based on reasonable cause as described below.\"\n\nBackground (3-5 sentences):\n• Describe the LLC, its formation date, the foreign owner, and the LLC's basic business activity.\n• Confirm the LLC owes no US federal income tax for the years in question (if true).\n\nReasonable cause narrative (1-3 paragraphs):\n• Specific facts about why the filing was missed.\n• Timeline of when and how you became aware.\n• Why your circumstances qualify as reasonable cause under the IRS's framework.\n\nCorrective action (1 paragraph):\n• Confirmation that all delinquent returns are being filed concurrently.\n• Steps taken to ensure future compliance.\n\nClosing:\n• \"Based on the foregoing, we respectfully request that the IRC § 6038A penalties for the tax year(s) be fully abated under DIIRSP.\"\n• Signature, date, printed name.\n\nThat's the entire structure. Roughly 1-2 pages depending on the depth of the narrative section.",
      },
      {
        heading: "What reasonable cause narratives work?",
        body: "Reasonable cause narratives work when they are supported by your actual facts.\n\n• First-time foreign LLC owner unaware of Form 5472: \"I formed [LLC] in [year] through [Stripe Atlas / IncFile / etc.] as my first US business entity. As a [country] resident with no prior US tax filing experience, I was unaware of the specific IRC § 6038A reporting requirement for foreign-owned single-member LLCs introduced in 2017. I learned of the obligation in [month/year] through [source] and immediately began preparing this catch-up filing.\"\n\n• Reliance on formation service: \"I formed [LLC] through [Stripe Atlas / similar], whose service materials emphasized that they did not provide ongoing tax services. As a foreign-resident first-time US LLC owner, I assumed the annual federal compliance obligations were communicated by the IRS directly if applicable. I learned of the Form 5472 obligation in [month/year] and am filing all missed returns concurrently.\"\n\n• Pre-2017 LLC owner: \"My LLC was formed in [year before 2017] and prior to the §6038A rule extension in 2017, no Form 5472 filing was required for foreign-owned single-member LLCs. I was unaware that the 2017 regulatory change applied retroactively to entities formed before its effective date. Upon learning of the obligation in [month/year], I am filing all post-2017 missed returns concurrently.\"\n\n• Prior adviser, stated as facts: \"For tax years [years], I retained [Name / Firm] in [country] for my international tax matters. I gave them [information provided] and asked [question]; they advised [advice given] and did not identify a Form 5472 requirement. I learned of the obligation in [month/year] from [source] and am now filing under DIIRSP.\" The IRS manual says relying on someone else to file is generally not reasonable cause on its own (IRM 20.1.1.3.2.2.5), so the adviser's involvement supports the facts rather than replacing them.\n\nIn all of these, the structure is: specific circumstances + how you discovered the obligation + prompt corrective action.",
      },
      {
        heading: "How does our filer handle this?",
        body: "Our 2-year and 3-year DIIRSP catch-up packages automatically include a Reasonable Cause Statement tailored to the most common foreign-LLC-owner scenario: first-time non-US owner who was unaware of the Form 5472 obligation until recently. The narrative is written to satisfy the standard IRS reasonable cause framework and follows the structure outlined above.\n\nAt the Reasonable Cause Statement step in the wizard, you can:\n• Use the default narrative as-is if it matches your situation.\n• Edit specific paragraphs to add personal context (when you became aware, what professional you relied on, etc.).\n• Replace the whole narrative if your circumstances are unique.\n\nAn accountant on our team reviews every late-filing package before we fax it to the IRS. If we see anything in the reasonable cause statement that's likely to be rejected (vague excuses, contradictions, missing dates), we'll reach out before submission.\n\nMost of our DIIRSP customers' first-time foreign-owner narratives are accepted by the IRS without follow-up.",
      },
      {
        heading: "What happens after you file Form 5472?",
        body: "After you file Form 5472, do not assume silence means either acceptance or rejection. The current instructions do not describe a routine acceptance acknowledgment for the faxed package, so keep the submitted package, destination, timestamp, page count, provider receipt, and any IRS correspondence together.\n\nKeep the exact submitted package, destination, timestamp, page count, provider receipt and any IRS correspondence together. Do not send a duplicate solely because you have heard nothing. If a notice arrives, follow its instructions and response deadline; a transmission record does not guarantee a penalty will be removed. See receipt confirmation and next steps.",
      },
      {
        heading: "Pricing for catch-up filings",
        body: `• 1-year late filing: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — same filing on every plan (fax included, reasonable cause statement included)\n• 2-year DIIRSP catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3-year DIIRSP catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\nFiling all missed years together with one comprehensive reasonable cause statement gives the strongest abatement argument. Don't space them out — the IRS treats a single concurrent catch-up far more favorably than serial late filings.\n\nFor 4+ missed years, run two back-to-back packages or message us and we'll coordinate.\n\n100% money-back guarantee if we fail to submit.`,
      },
      {
        heading: "When should you not use the template?",
        body: "You should not use the template when your history, facts, or tax position needs individualized help.\n\n• You've previously been audited or in IRS examination.\n• You've previously had penalties assessed for international information return failures.\n• Your circumstances are genuinely unusual (e.g. you actively decided not to file based on legal advice you now believe was wrong).\n• You're filing late as a result of an estate / inheritance / death-in-family situation that needs to be explained.\n• Your LLC has US-source income or any potential US tax liability.\n• You've received any prior IRS correspondence about the LLC.\n\nOur template is built for the most common case: first-time foreign owner who didn't know the rule existed. It's not designed for unusual circumstances. If your facts don't match the template, get individualized help.",
      },
      {
        heading: "Bottom line",
        body: `A Reasonable Cause Statement is the single most important document in a DIIRSP catch-up filing. Done well, it can save you tens of thousands of dollars in penalties. Done poorly, the IRS assesses $25,000 per form per year automatically.\n\nThe winning formula: specific facts, clear timeline, prompt corrective action, concise length, no vague excuses or boilerplate.\n\nOur DIIRSP packages include an auto-generated, accountant-reviewed Reasonable Cause Statement tailored to the most common foreign-owner scenario. Editable in the wizard if your facts differ.\n\n• 2-year DIIRSP catch-up: ${PRICE_STD_2Y} Standard / ${PRICE_EXP_2Y} Express / ${PRICE_24H_2Y} 24-Hour (fax included)\n• 3-year DIIRSP catch-up: ${PRICE_STD_3Y} Standard / ${PRICE_EXP_3Y} Express / ${PRICE_24H_3Y} 24-Hour (fax included)\n\n${NOTE_24H}\n\n100% money-back guarantee if we fail to submit your filing to the IRS.`,
      },
    ],
    faqs: [
      {
        q: "Does the IRS guarantee my penalty is waived if I submit a reasonable cause statement?",
        a: "No. DIIRSP is the IRS's stated process for requesting relief, but each request is evaluated on its facts. Most well-documented first-time late filings are accepted, but there's no formal guarantee.",
      },
      {
        q: "Can I write the statement myself instead of using a template?",
        a: "Yes — and if your circumstances are unusual you probably should. The statement just has to address the IRS's reasonable cause framework: good faith, circumstances beyond your control, prompt corrective action. Our filer's auto-generated narrative is editable in the wizard.",
      },
      {
        q: "Do I need a lawyer to write this?",
        a: "Almost never. A reasonable cause statement for a first-time late Form 5472 is a straightforward 1-2 page document. If you've been audited, are facing IRS collection action, or have complex circumstances, a lawyer or enrolled agent can help — but for a standard catch-up filing, the wizard handles it.",
      },
      {
        q: "What happens after I file?",
        a: "Silence does not establish processing, acceptance or penalty relief. Preserve your complete submitted package and fax-provider record. If the IRS sends a notice, follow its response instructions and deadline.",
      },
      {
        q: "How long should the reasonable cause statement be?",
        a: "1-2 pages. Concise and factual beats long and discursive. The IRS examiner has limited time per case — a tight, well-organized statement gets read in full.",
      },
      {
        q: "Should I include supporting documentation?",
        a: "Generally no for first-time foreign-owner cases. The statement itself is enough. If you reference specific events (e.g. you consulted a CPA on a specific date and they didn't flag the obligation), having those records on hand is wise but you don't attach them to the initial filing. If the IRS asks for documentation later, you can provide it then.",
      },
      {
        q: "Can I submit the same reasonable cause statement for multiple years?",
        a: "We prepare a reasonable cause statement for each late year and attach it to that year's return, with the same consistent facts across all of them, and submit every late year together. The IRS manual recommends that reasonable cause not be considered for any year until all delinquent returns have been filed.",
      },
      {
        q: "What if my reasonable cause is rejected?",
        a: "You'll receive a CP 215 notice with the assessed penalty. You have the right to appeal through the IRS Office of Appeals (different from DIIRSP — it's a formal appeal process). At that stage, consider engaging a tax attorney or enrolled agent who handles international information return penalty appeals.",
      },
      {
        q: "Does our service handle CP 215 abatement appeals?",
        a: "Not currently. We handle preventative DIIRSP filings only. If you've already received a CP 215, contact a tax attorney or enrolled agent who handles international information return penalty appeals.",
      },
      {
        q: "Can I sign the reasonable cause statement digitally?",
        a: "The reasonable cause statement is signed as part of the cover-letter / declaration portion of the DIIRSP package. The Form 1120's signature line (which gets the wet/ink signature) is what carries the legal signature for the package. The reasonable cause statement itself doesn't typically need a separate signature — your signature on the 1120 covers the whole submission.",
      },
    ],
    relatedSlugs: ["diirsp", "late-form-5472", "form-5472-penalty", "form-5472-deadline", "file-form-5472"],
  },
  // ────────────────────────────────────────────────────────────────────
  // PREMIUM (Google Ads) — noindex, premium pricing, premium positioning.
  // Slug is also registered in PREMIUM_SOURCES in src/lib/pricing.ts so the
  // pricing flows through wizard + checkout + Stripe end-to-end.
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "pro-form-5472",
    keyword: "form 5472 pro",
    title: `Form 5472 Filing Service — Accountant-Reviewed, From ${PRICE_STD}`,
    metaDescription:
      `Form 5472 filing service for foreign-owned US LLCs includes pro forma Form 1120, accountant review, IRS fax delivery, and a timestamped receipt from ${PRICE_STD}.`,
    sources: [
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRC §6038A", url: "https://www.law.cornell.edu/uscode/text/26/6038A" },
    ],
    published: "2026-05-22",
    updated: "2026-10-05",
    h1: "Form 5472, filed properly — from $149, everything included.",
    intro:
      `Answer 12 questions in about 15 minutes and get a Form 5472 plus pro forma Form 1120 package reviewed by an accountant before fax submission to the IRS Ogden PIN Unit. Standard is ${PRICE_STD} (5-7 business days), Express ${PRICE_EXP} (within 3) and 24-Hour ${PRICE_24H} (ready to check and sign within 24 hours).`,
    howTo: {
      section: "How does your filing reach the IRS?",
      tools: ["Form5472 Prep online filer"],
      supplies: [
        "Wizard answers",
        "Canvas signature",
        "Full package",
        "Signed package",
        "Fax transmission receipt",
      ],
      totalTime: "PT15M",
      cost: { currency: "USD", value: "149" },
    },
    noindex: true,
    pricingMode: "premium",
    sections: [
      {
        heading: "Who is this for?",
        body: "This is for non-US owners, catch-up filers, notice recipients, multiple-LLC owners, and advisors handling Form 5472. This service is built for:\n\n• Non-US owners of a US single-member LLC (Wyoming, Delaware, New Mexico, Florida — any state) who need this year's filing done correctly the first time.\n• Owners who only just discovered the requirement and are one, two, or three years behind.\n• Owners who have already received an IRS notice (CP 215 or a §6038A letter) and need a properly prepared late filing with a reasonable cause statement.\n• Owners of several LLCs who want every entity filed the same way, every year, without rebuilding the paperwork from scratch.\n• CPAs and tax attorneys filing for a foreign client who want the 5472 package prepared, reviewed, and faxed for them.\n\nIf your LLC had even one reportable transaction last year — including the wire you sent to open its US bank account — you are in scope, revenue or no revenue.",
      },
      {
        heading: "What is included on every plan?",
        body: "Every plan covers one tax year end to end — the filing, the review, the paperwork, fax delivery, receipt, support and annual reminder are identical, and only the turnaround differs.\n\n• Filled IRS Form 5472 + pro forma Form 1120 with the \"Foreign-Owned U.S. DE\" stamp and the Part V supporting statement.\n• Review by a qualified tax accountant on our team before anything leaves our hands — no autopilot.\n• Reasonable Cause Statement for late filings under DIIRSP, drafted around your facts.\n• Fax delivery to the IRS Ogden PIN Unit (+1-855-887-7737) included — no separate fax fee.\n• The timestamped fax-provider transmission receipt emailed to you and stored in your portal: your transmission evidence.\n• Filing confirmation and priority email support from start to receipt.\n• A reminder in the second week of January so the following year's deadline doesn't slip past you.\n• 100% money-back guarantee if we fail to submit.\n\nYou sign once on screen in your portal — no printing, no scanning, no mailing anything yourself.",
      },
      {
        heading: "Why should you get this $25,000 filing right?",
        body: "This filing matters because IRC § 6038A can assess $25,000 per form, per year when Form 5472 is late, incomplete, or missing. There is no small-LLC exception for no revenue, and an IRS notice can add another $25,000 for every 30-day period outstanding.\n\nThe three ways owners get caught:\n\n1. Never filed — the LLC exists, money moved in and out, and Form 5472 never came up at formation.\n2. Filed Form 5472 on its own — without the pro forma Form 1120 it attaches to, the IRS treats the return as never filed.\n3. Filed, but incomplete — a blank Part V, a missing supporting statement, or a missing owner identifier is scored the same as a missing return.\n\nEvery one of those is avoidable paperwork. That is exactly what the filing fee buys: a complete package, checked by an accountant who files these all year, delivered with dated fax-provider transmission evidence.",
      },
      {
        heading: "How does your filing reach the IRS?",
        body: "Your filing reaches the IRS by wizard completion, signature, accountant review, fax delivery, and receipt return.\n\n1. Complete the 12-question wizard — about 15 minutes the first year, about 5 minutes for returning customers.\n2. Sign once on screen. The canvas signature is embedded into every required signature box on the forms.\n3. Have a qualified tax accountant review the full package and email you if anything needs clarifying.\n4. Get the signed package faxed to the IRS Ogden PIN Unit at +1-855-887-7737 once review clears, within 5-7 business days of your signature on Standard, or within 3 on Express. On 24-Hour, the reviewed package is ready for you to check and sign within 24 hours of your order.\n5. Receive the timestamped IRS fax transmission receipt by email, with a copy kept in your portal.\n\nYou can't e-file Form 5472. The IRS only accepts it by mail or fax to Ogden, and fax is the route that produces a dated transmission receipt — which is why we use it. In the rare event the Ogden fax line is down for an extended period, we fall back to certified mail with return receipt and send you the tracking details.",
      },
      {
        heading: "Pricing",
        body: `• Standard — ${PRICE_STD} for one tax year, ready in 5-7 business days.\n• Express — ${PRICE_EXP} for one tax year, ready within 3 business days.\n• 24-Hour — ${PRICE_24H} for one tax year, ready for you to check and sign within 24 hours of your order, 7 days a week.\nSame filing, same review, same package on every plan — you are paying for speed only.\n• Each additional past tax year: +$99, on any plan.\n\nSo on Standard a two-year DIIRSP catch-up is ${PRICE_STD} + ${PRICE_ADDON} = ${PRICE_STD_2Y} and a three-year catch-up is ${PRICE_STD} + ${PRICE_ADDON_2Y} = ${PRICE_STD_3Y}. On Express the same catch-ups are ${PRICE_EXP_2Y} and ${PRICE_EXP_3Y}; on 24-Hour they are ${PRICE_24H_2Y} and ${PRICE_24H_3Y}. Accountant review, the reasonable cause letter, IRS fax delivery, and the transmission receipt are included at every year count — no separate fax fee, no setup fee, no subscription.\n\nYou pay once, per filing. If we fail to submit your filing to the IRS, you get all of it back.`,
      },
      {
        heading: "What happens if the IRS still assesses a penalty?",
        body: "DIIRSP (Delinquent International Information Return Submission Procedure) is the IRS-published path for catch-up filings with reasonable cause requests. There's no IRS guarantee: the IRS does not publish DIIRSP outcome data, and its DIIRSP page says penalties may be assessed during processing without considering the attached reasonable-cause statement.\n\nTwo different scenarios here. If the IRS assesses a penalty because of an error in our preparation — a mistake on our end — we handle the response with the IRS at no charge. If instead the IRS assesses a penalty despite a correctly prepared, complete DIIRSP submission (a discretionary IRS call on your specific facts, not something we got wrong), the accountant who reviewed your package will still help you respond and appeal; that follow-up work sits outside the filing fee and may carry an additional fee, though having the original preparer already familiar with your case speeds it up.\n\nOur 100% money-back guarantee covers failure-to-submit and, separately, any penalty caused by our own preparation error. No service can guarantee an IRS outcome on a correctly filed return — that discretion sits with the IRS.",
      },
      {
        heading: "How are confidentiality and data handled?",
        body: "Confidentiality and data are handled through encryption, limited document storage, receipt retention, and no marketing data sharing.\n\n• Your filing data is encrypted in transit (HTTPS) and at rest (database + storage).\n• Bank statements (if you upload any for transaction extraction) are processed in memory and never written to permanent storage.\n• Signed PDFs are held only long enough to fax to the IRS and deliver the receipt back, then deleted.\n• We retain the fax confirmation receipt + the basic entity/owner info needed to pre-fill next year's filing.\n• Email correspondence about your filing is kept only as long as it takes to deliver the service, and is never used for anything else.\n• We never share your data with third parties for marketing.\n• Standard data-retention policy applies — see Data Retention page.",
      },
      {
        heading: "Get started",
        body: "Click Start filing now. You'll answer the 12-question wizard (about 15 minutes) and sign once on screen — an accountant on our team takes it from there: package reviewed, faxed to the IRS Ogden PIN Unit, timestamped receipt back in your inbox.\n\nWant to talk your situation through before paying? Use the in-portal chat once you start, or email support@form5472prep.com. Email support is included on every filing.",
      },
    ],
    faqs: [
      {
        q: "What exactly do I get for the filing fee?",
        a: "One tax year filed end to end: Form 5472 + pro forma Form 1120 with the Part V supporting statement, review by a qualified tax accountant, a reasonable cause letter if you're filing late, fax delivery to the IRS Ogden PIN Unit, the timestamped transmission receipt as transmission evidence, and a reminder before next year's deadline. No add-ons, no separate fax fee.",
      },
      {
        q: "Is there a cheaper or more expensive version of this service?",
        a: `There are three, and they differ only by speed: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (ready within 3) and ${PRICE_24H} 24-Hour (ready for you to check and sign within 24 hours), plus ${PRICE_ADDON} for each additional past year you're catching up on. Every filing on any plan gets the same accountant review, the same IRS fax delivery, and the same timestamped receipt — the faster plans are not better filings, just faster ones.`,
      },
      {
        q: "How long does the whole thing take?",
        a: "About 15 minutes of your time in the wizard. On our side, a Standard filing is reviewed and faxed to the IRS Ogden PIN Unit within 5-7 business days of your signature; Express is the same package within 3 business days. On 24-Hour, the reviewed package is ready for you to check and sign within 24 hours of your order. On every plan the timestamped fax receipt comes back to you by email.",
      },
      {
        q: "Can you guarantee the IRS waives the penalty on my late filing?",
        a: "No service can guarantee an IRS outcome. What we can do is make the DIIRSP submission as strong as possible — complete forms, documented transactions, an accountant-reviewed reasonable cause statement, and dated transmission evidence. Most well-documented first-time late filings are accepted, but the decision is the IRS's.",
      },
      {
        q: "I have 5+ missed years — can you handle that?",
        a: `Yes. The wizard covers up to three years directly; beyond that we coordinate the extra DIIRSP years with you by email. Write to support@form5472prep.com with your entity details and the years involved and we'll scope it before you pay. Pricing follows the same rule: ${PRICE_STD} Standard, ${PRICE_EXP} Express or ${PRICE_24H} 24-Hour for the first year, +${PRICE_ADDON} per additional past year.`,
      },
      {
        q: "Can my CPA or tax attorney work with your accountant?",
        a: "Yes. A good share of filings come from advisors acting for a foreign client. Email support@form5472prep.com and we'll include your advisor in the correspondence on the filing.",
      },
      {
        q: "Do I sign, or does your accountant sign?",
        a: "You sign — the signature must come from you as the LLC owner. The portal's canvas signature is embedded into the required signature boxes. Our accountant reviews and signs off internally on the package before we fax it.",
      },
      {
        q: "Why fax instead of e-filing?",
        a: "Foreign-owned US disregarded entities can't e-file Form 5472 or the attached pro forma Form 1120 — the IRS only accepts them by mail or fax to the Ogden PIN Unit. Fax is faster than mail and produces a timestamped transmission receipt, which is the cleanest evidence of when you filed.",
      },
      {
        q: "What if I want to ask a question before paying?",
        a: "Email support@form5472prep.com and describe your situation. Once you start a filing, the in-portal chat connects you to the team, and email support is included on every filing.",
      },
      {
        q: "Money-back guarantee — what does it cover?",
        a: "If we fail to submit your filing to the IRS, you get a 100% refund. And if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge. It does not cover an IRS penalty assessed on a correctly filed return (no service can guarantee an IRS outcome) or change-of-mind cancellations after the package has been faxed.",
      },
    ],
    relatedSlugs: [],
  },
  {
    slug: "doola-form-5472",
    keyword: "doola form 5472",
    title: "doola Form 5472 — Bundle vs Flat-Fee Filing",
    metaDescription:
      "Formed an LLC with doola? See what doola's own pages say about Form 5472 price and coverage, and compare a flat-fee filing-only option.",
    sources: [
      { label: "doola: Pricing", url: "https://www.doola.com/pricing/" },
      { label: "doola Help Center: Subscription and add-on service pricing", url: "https://help.doola.com/subscription-and-add-on-service-pricing" },
      { label: "doola Help Center: Standalone Tax Filing-only service", url: "https://ask.doola.com/article/8a192242-doola-standalone-tax-filing-only-service-pricing-and-service-details" },
      { label: "doola Help Center: Does Tax and Compliance cover Form 5472?", url: "https://ask.doola.com/article/bcf02a47-does-tax-and-compliance-cover-form-5472-and-1120-pro-forma-for-foreign-owned-single-member-llcs" },
      { label: "doola Help Center: What is the Tax and Compliance plan?", url: "https://ask.doola.com/article/5fae8a5f-what-is-the-doola-tax-and-compliance-plan" },
      { label: "doola: Form 5472 for Foreign-Owned LLCs", url: "https://www.doola.com/blog/learn-how-to-file-form-5472-foreign-owned-llcs/" },
      { label: "doola: Wyoming or Delaware guide", url: "https://help.doola.com/should-i-form-in-wyoming-or-delaware-doola-help-center" },
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
    ],
    published: "2026-08-31",
    updated: "2026-10-05",
    startSrc: "doola-form-5472",
    h1: "Formed your LLC with doola? Check what is actually included.",
    intro:
      "doola forms US LLCs and C corps for founders worldwide and sells bookkeeping, analytics, banking help and tax plans. If doola formed your foreign-owned single-member LLC, check whether your plan covers the annual Form 5472 + pro forma Form 1120 filing; doola's own pages describe that coverage in more than one way.",
    sections: [
      {
        heading: "What does doola do for you?",
        body: "doola's home and pricing pages describe LLC or C corp formation, an EIN, a US business address, registered agent service, bookkeeping, e-commerce analytics, US bank account guidance and tax filing plans. Its pricing page lists Starter at $297/yr, Tax and Compliance at $1,999/yr and Business-in-a-Box at $2,999/yr, each plus state fees (checked October 5, 2026).\n\ndoola's help center says Wyoming is the most popular state for non-residents running online and e-commerce businesses, and recommends Delaware if you may later convert to a C corp to raise venture capital from US investors.",
      },
      {
        heading: "What does doola leave with you?",
        body: "Whoever formed the LLC, a foreign-owned single-member US LLC with reportable transactions owes the annual federal Form 5472 + pro forma Form 1120 filing. It is separate from state formation, registered agent service, state annual reports, bookkeeping and payment setup, so confirm which service, if any, covers it.\n\ndoola's help center says its $199 Annual State Filing service covers the state annual report only and does not include any federal tax filings.",
        table: {
          caption: "doola and Form5472 Prep task split",
          columns: ["Task", "doola", "Form5472 Prep"],
          rows: [
            ["LLC formation", "Forms LLCs and C corps", "Filing-only alternative"],
            ["Form 5472 package", "$1,500/yr Tax Filing-only service", `${PRICE_STD} Standard filing`],
            ["IRS filing method", "Help center: mail or fax", "Ogden fax delivery"],
            ["Catch-up for missed years", "Extra-year price not published", `+${PRICE_ADDON} per additional past year`],
          ],
        },
      },
      {
        heading: "What do doola's pages say about Form 5472 price and coverage?",
        body: `doola's help center (checked October 5, 2026) lists a standalone Tax Filing-only service at $1,500 per year covering federal filings \"including Form 5472 and the accompanying pro forma Form 1120 when they apply\". Its pricing page lists Tax and Compliance at $1,999/yr plus state fees: Starter plus federal and state tax filing and a 1:1 tax consultation.\n\ndoola's pages differ on whether Tax and Compliance always includes Form 5472. Its Form 5472 blog article and one help article say it does (the help article says \"in most cases\"), while another help article lists Form 5472 among optional add-ons that \"may carry an extra fee\". Check your plan dashboard or ask doola in writing.\n\nIf you only need the federal Form 5472 + pro forma 1120 package filed, Form5472 Prep is a flat-fee alternative: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — identical filing, IRS fax delivery included.`,
      },
      {
        heading: "What is your first-year filing timeline?",
        body: "Your first Form 5472 year starts with the LLC's formation month and runs through the end of that tax year. A formation-year filing is required if the LLC had any reportable transaction, including capital contributions, distributions, owner reimbursements, or related-party payments.\n\nThe initial funding wire into the LLC's bank account almost always counts as a reportable transaction. That is why most newly formed foreign-owned LLCs have a first-year filing even before meaningful revenue starts.",
      },
      {
        heading: "How do we file it?",
        body: "We file it by collecting the LLC, owner, and year-end facts, generating the package, reviewing it, and faxing it to the IRS Ogden PIN Unit. The package includes pro forma Form 1120, Form 5472, supporting statement, cover letter, and a reasonable cause statement if late, with a timestamped fax receipt returned as evidence.\n\nEvery package is reviewed by an accountant before submission. We fax the signed package to the IRS Ogden PIN Unit at +1-855-887-7737 and send you the timestamped fax receipt as transmission evidence. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "How do you catch up on multiple missed years?",
        body: "If your doola-formed LLC is more than one year old and prior Form 5472 filings were missed, the IRS DIIRSP process can be used to file late international information returns with a reasonable cause statement. The cleaner path is to file all missed years together before the IRS contacts you.\n\nForm5472 Prep is an independent service and is not affiliated with, endorsed by, or connected to doola.",
      },
    ],
    faqs: [
      {
        q: "Does doola's Tax and Compliance plan include Form 5472?",
        a: "doola's pages differ. Its blog and one help article say Tax and Compliance covers Form 5472 and pro forma 1120 (\"in most cases\"); another help article lists Form 5472 as an optional add-on that may cost extra. Check your plan dashboard or ask doola in writing.",
      },
      {
        q: "I used doola Starter or another formation-only package. Am I covered?",
        a: "Check your plan and invoice. doola's pricing page describes Starter as formation, an EIN and a US business address; federal tax filing is listed under Tax and Compliance, and doola's help center lists a $1,500/yr Tax Filing-only service separately.",
      },
      {
        q: "doola got my EIN. Does that change the Form 5472 deadline?",
        a: "No. EIN issuance is separate from the annual federal information return. If the foreign-owned single-member LLC had a reportable transaction during the year, it still files Form 5472 + pro forma Form 1120.",
      },
      {
        q: "Can doola's Form 5472 package be e-filed?",
        a: "doola's help center says these forms \"cannot be filed electronically\" and go by mail or fax, matching the IRS Form 5472 instructions for foreign-owned disregarded entities. One passage of doola's blog article mentions e-filing, so ask doola how your filing will be sent. We deliver by IRS fax.",
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "delaware-llc-form-5472"],
  },
  {
    slug: "firstbase-form-5472",
    keyword: "firstbase form 5472",
    title: "Firstbase Form 5472 — What the Bundle Covers",
    metaDescription:
      "Firstbase lists an $899/yr tax package for non-US-owned single-member LLCs that names Form 5472. See what it covers and when a filing-only service fits.",
    sources: [
      { label: "Firstbase: Pricing", url: "https://www.firstbase.io/pricing" },
      { label: "Firstbase: Tax filing", url: "https://www.firstbase.io/tax-software" },
      { label: "Firstbase: Firstbase One", url: "https://www.firstbase.io/one" },
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
    ],
    published: "2026-08-31",
    updated: "2026-10-05",
    startSrc: "firstbase-form-5472",
    h1: "Using Firstbase for your US company? Put Form 5472 in context.",
    intro:
      "Firstbase forms companies in Delaware or Wyoming and sells registered agent, mailroom, accounting and tax filing subscriptions. Its pricing page lists an $899-per-year Tax Filing package for non-US-owned single-member LLCs that names Form 5472 and a pro forma Form 1120, and the Firstbase One bundle includes Tax Filing.",
    sections: [
      {
        heading: "What does Firstbase do for you?",
        body: "Firstbase's pricing page lists Start, a one-time formation offer for companies in Delaware or Wyoming with EIN setup and banking-partner access, plus standalone Registered Agent, Mailroom Premium, Accounting and Tax Filing subscriptions. Firstbase One bundles those four subscriptions at $199 per month, billed yearly at $2,388 (checked October 5, 2026).\n\nThe Firstbase One page says its tax team covers federal, state and local forms, \"even the tricky ones like 5472 for foreign-owned companies\".",
      },
      {
        heading: "What does Firstbase leave with you?",
        body: "A foreign-owned single-member US LLC has a federal Form 5472 + pro forma Form 1120 filing obligation each year if it had a reportable transaction. The obligation does not disappear because a formation platform filed the state paperwork, acted as registered agent, or helped open operational services.\n\nForm 5472 is an IRS information return. It sits apart from state formation, state registered agent coverage, mailroom services, accounting subscriptions, and state annual reports.",
        table: {
          caption: "Firstbase and Form5472 Prep task split",
          columns: ["Task", "Firstbase", "Form5472 Prep"],
          rows: [
            ["LLC formation", "Delaware or Wyoming formation", "Filing-only alternative"],
            ["Registered agent", "Agent subscription or Firstbase One", "Not included; federal filing only"],
            ["Form 5472 package", "$899/yr Tax Filing package", `${PRICE_STD} Standard filing`],
            ["Catch-up for missed years", "Extra-year price not published", `+${PRICE_ADDON} per additional past year`],
          ],
        },
      },
      {
        heading: "What do Firstbase's pages say about Form 5472 price?",
        body: `Firstbase's pricing and tax pages list a Tax Filing package for single-member LLCs owned by a non-US citizen or resident at $899 annually per package. It names Forms 5472, a pro forma Form 1120, unlimited Forms 1099-NEC or 1099-MISC and an IRS extension if needed (checked October 5, 2026).\n\nFirstbase One includes that Tax Filing subscription alongside Registered Agent, Mailroom Premium and Accounting. Firstbase's tax page still shows 2025 deadline dates, and the pages checked do not publish an extra-year price, filing method or turnaround, so confirm current terms with Firstbase in writing.\n\nFor owners who do not need the package or the bundle, Form5472 Prep is a filing-only alternative: ${PRICE_STD} Standard (ready in 5-7 business days), ${PRICE_EXP} Express (within 3 business days) or ${PRICE_24H} 24-Hour (reviewed package ready for you to check and sign within 24 hours of your order) — identical filing, IRS fax delivery included.`,
      },
      {
        heading: "What is your first-year filing timeline?",
        body: "Your first-year filing timeline starts when the LLC is formed, even if that happens partway through the year. The first Form 5472 covers formation through year-end whenever there was a reportable transaction, and the first wire used to fund the LLC bank account is usually enough.\n\nCapital contributions, distributions, owner payments, and related-party reimbursements can all be reportable. The first wire used to fund the LLC's bank account is usually enough to create the first-year filing obligation.",
      },
      {
        heading: "How do we file it?",
        body: "Our wizard collects the filing facts in 12 questions: LLC details, foreign owner details, year-end assets, and related-party transactions. We prepare the pro forma Form 1120, Form 5472, the Part V supporting statement, and a reasonable cause statement when a late filing needs DIIRSP treatment.\n\nAn accountant reviews every package before we submit it. We deliver by fax to the IRS Ogden PIN Unit at +1-855-887-7737 and keep the timestamped fax receipt as transmission evidence. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "How do you catch up on multiple missed years?",
        body: "If your Firstbase-formed LLC predates your current tax-filing coverage, or you only discovered the 5472 rule after one or more missed years, DIIRSP is the standard catch-up path for late international information returns. The key is to file the complete missed-year packages together with a reasonable cause statement before an IRS notice arrives.\n\nForm5472 Prep is an independent service and is not affiliated with, endorsed by, or connected to Firstbase.",
      },
    ],
    faqs: [
      {
        q: "Does Firstbase One include Form 5472?",
        a: "Firstbase One includes Firstbase's Tax Filing subscription, and the Firstbase One page says its tax team handles \"5472 for foreign-owned companies\". The Tax Filing package for non-US-owned single-member LLCs lists Forms 5472 and a pro forma Form 1120. Confirm coverage for your tax year in writing.",
      },
      {
        q: "Can I buy only Firstbase Form 5472 filing at a published price?",
        a: "Yes, as part of a package. Firstbase's pricing page lists Tax Filing for single-member LLCs owned by a non-US citizen or resident at $899 annually per package, covering Forms 5472 and a pro forma Form 1120. Firstbase One ($2,388 per year) bundles Tax Filing with three other subscriptions.",
      },
      {
        q: "What if I only bought Firstbase Start or an older plan?",
        a: "Check your plan, invoice, or support history for Form 5472 + pro forma Form 1120 coverage. Firstbase's pricing page lists Start as formation, EIN setup and banking-partner access; tax filing is a separate subscription or part of Firstbase One.",
      },
      {
        q: "Does Firstbase forming in Delaware or Wyoming change the federal filing?",
        a: "No. The federal Form 5472 + pro forma Form 1120 obligation applies the same way to a foreign-owned single-member LLC formed in either state when there is a reportable transaction.",
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "delaware-llc-form-5472"],
  },
  {
    slug: "clemta-form-5472",
    keyword: "clemta form 5472",
    title: "Clemta Form 5472 — Confirm Your Plan Coverage",
    metaDescription:
      "Clemta lists Federal Tax Filing, but public pages do not clearly itemize Form 5472. Learn what to confirm and how to file if needed.",
    sources: [
      { label: "Clemta: Pricing", url: "https://clemta.com/pricing" },
      { label: "Clemta: Federal tax filing", url: "https://clemta.com/federal-tax-filing" },
      { label: "Clemta: What Is Form 5472?", url: "https://clemta.com/blog/what-is-form-5472" },
      { label: "Clemta: USA company registration", url: "https://clemta.com/usa-company-registration" },
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
    ],
    published: "2026-08-31",
    updated: "2026-10-05",
    startSrc: "clemta-form-5472",
    h1: "Clemta customer? Get written clarity on Form 5472.",
    intro:
      "Clemta sells annual plans for international founders that include company formation, an EIN, a registered agent and US business address, and financial tools. Its pricing page includes Federal Tax Filing in the Pro and Premium plans but does not name Form 5472, so confirm Form 5472 + pro forma Form 1120 coverage for your account.",
    sections: [
      {
        heading: "What does Clemta do for you?",
        body: "Clemta's pricing page lists three annual plans: Essentials at $349, Pro at $1,068 and Premium at $2,879, each plus state fee. Every plan includes company formation, an EIN, a registered agent, a business address with mail forwarding, bank account application support and invoicing tools (checked October 5, 2026).\n\nClemta's company registration page covers LLC and C corporation formation for international founders and compares Wyoming and Delaware, noting that other states may also fit.",
      },
      {
        heading: "What does Clemta leave with you?",
        body: "A foreign-owned single-member US LLC still has to file Form 5472 and a pro forma Form 1120 annually when it has reportable transactions. The rule applies no matter which company handled formation, EIN application, registered agent service, or business-address setup.\n\nThis is a federal IRS information return. It is different from formation work, state annual compliance, registered agent duties, bookkeeping, and generic business filings.",
        table: {
          caption: "Clemta and Form5472 Prep task split",
          columns: ["Task", "Clemta", "Form5472 Prep"],
          rows: [
            ["LLC formation", "LLC and C-corp formation", "Form 5472-specific service"],
            ["Registered agent", "Registered agent service", "Federal package only"],
            ["EIN", "EIN application", "Collects filing facts"],
            ["Form 5472 package", "Not named on pricing page", "Prepares IRS package"],
            ["Catch-up for missed years", "Extra-year terms not published", "DIIRSP reasonable cause"],
          ],
        },
      },
      {
        heading: "Do Clemta's public pages itemize the 5472 package?",
        body: "No. Clemta's pricing page lists \"Federal Tax Filing\" as included in the Pro and Premium plans and not included in Essentials, but neither it nor Clemta's federal tax filing page names Form 5472 or a pro forma Form 1120 (checked October 5, 2026).\n\nClemta's Form 5472 blog article says Clemta offers \"assistance with Form 5472 filings\" but gives no price or plan. That is not a confirmed no; it is a public-pages gap. Ask Clemta to confirm in writing whether your plan or invoice includes Form 5472 + pro forma Form 1120; if it is not itemized, a Form 5472-specific service closes that exact gap.",
      },
      {
        heading: "What is your first-year filing timeline?",
        body: "The first tax year begins in the LLC's formation month, even if the company only existed for part of the calendar year. If there was any reportable transaction before year-end, the first-year Form 5472 + pro forma Form 1120 package is due the following filing season.\n\nThe first owner funding wire to open a bank account or pay operating costs is usually reportable. That makes first-year filings common even for Clemta-formed LLCs with little or no revenue.",
      },
      {
        heading: "How do we file it?",
        body: "Form5472 Prep uses a 12-question wizard to capture the LLC, owner, formation-year, year-end asset, and related-party transaction facts. We prepare the IRS package, including pro forma Form 1120, Form 5472, the supporting statement, and a DIIRSP reasonable cause statement if needed.\n\nAn accountant reviews the filing before it leaves our system. We fax it to the IRS Ogden PIN Unit at +1-855-887-7737 and provide the timestamped fax receipt. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "How do you catch up on multiple missed years?",
        body: "If your Clemta-formed LLC is more than one year old and prior 5472 coverage is unclear, review each year separately. When filings were missed and the IRS has not contacted you, DIIRSP catch-up filing with a reasonable cause statement is the standard route.\n\nForm5472 Prep is an independent service and is not affiliated with, endorsed by, or connected to Clemta.",
      },
    ],
    faqs: [
      {
        q: "Does Clemta's Federal Tax Filing line definitely include Form 5472?",
        a: "Clemta does not say so publicly. Its pricing page includes Federal Tax Filing in the Pro and Premium plans, but neither the pricing page nor its federal tax filing page names Form 5472 or pro forma Form 1120. Ask Clemta in writing.",
      },
      {
        q: "Clemta's blog mentions Form 5472 assistance. Is that enough?",
        a: "Not by itself. Clemta's Form 5472 article says it offers \"assistance with Form 5472 filings\" but states no price and does not tie the filing to a specific plan. Get written confirmation for your plan and tax year.",
      },
      {
        q: "What should I ask Clemta before buying another filing service?",
        a: "Ask for written confirmation that your specific plan or invoice includes both Form 5472 and the attached pro forma Form 1120 for the relevant tax year. Generic Federal Tax Filing language is less precise.",
      },
      {
        q: "Does my Clemta EIN application satisfy anything with the IRS?",
        a: "It gets the LLC an EIN, but it does not file the annual information return. Form 5472 + pro forma Form 1120 remains a separate annual package when the LLC has reportable transactions.",
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "delaware-llc-form-5472"],
  },
  {
    slug: "startglobal-form-5472",
    keyword: "startglobal form 5472",
    title: "StartGlobal Form 5472 — Check the Filing Scope",
    metaDescription:
      "StartGlobal sells Federal Tax Filing, but its pricing and federal tax pages do not name Form 5472. See what to verify and how filing-only help works.",
    sources: [
      { label: "StartGlobal: Pricing", url: "https://startglobal.co/pricing/" },
      { label: "StartGlobal: Federal tax filing", url: "https://startglobal.co/llc-management/federal-tax-filing/" },
      { label: "StartGlobal: LLC formation", url: "https://startglobal.co/llc-formation/" },
      { label: "StartGlobal: Home", url: "https://startglobal.co/" },
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
    ],
    published: "2026-08-31",
    updated: "2026-10-05",
    startSrc: "startglobal-form-5472",
    h1: "StartGlobal formed the LLC. Now confirm the 5472 filing.",
    intro:
      "StartGlobal sells LLC formation, registered agent service, EIN/business tax number support, remote US bank account setup, virtual mailing address, US phone number, invoicing, bookkeeping, Federal Tax Filing, and state annual reports to non-US founders. If you used StartGlobal, the key next step is confirming whether its Federal Tax Filing line specifically covers Form 5472 + pro forma Form 1120.",
    sections: [
      {
        heading: "What does StartGlobal do for you?",
        body: "StartGlobal's public offering includes LLC formation with state fees included, registered agent service, EIN/business tax number support, remote US bank account setup, virtual US mailing address, US phone number, invoicing/payments, bookkeeping, Federal Tax Filing, and state annual reports. The services are sold a la carte or through a Managed LLC plan.\n\nStartGlobal's LLC formation page calls Wyoming or Delaware excellent choices for most international founders, with Delaware preferred for businesses planning to raise venture capital. Its pricing page lists formation at $399 one-time, state fees included, and the Managed LLC plan at $149 per month (checked October 5, 2026).",
      },
      {
        heading: "What does StartGlobal leave with you?",
        body: "Every foreign-owned single-member US LLC with a reportable transaction must file Form 5472 with a pro forma Form 1120 each year. That annual IRS information return is required regardless of who formed the LLC or provides registered agent, address, bank-account, phone, bookkeeping, or state-report support.\n\nThe federal filing is separate from state formation and state annual compliance. It is also separate from generic tax-filing language unless the provider confirms the specific forms covered.",
        table: {
          caption: "StartGlobal and Form5472 Prep task split",
          columns: ["Task", "StartGlobal", "Form5472 Prep"],
          rows: [
            ["LLC formation", "$399 formation, state fees included", "Complete Form 5472 package"],
            ["Registered agent", "Registered agent service", "Federal filing only"],
            ["EIN", "Business tax number support", "Collects owner information"],
            ["Form 5472 package", "Not named on pricing page", "Form 5472-specific service"],
            ["IRS fax filing", "Method for 5472 not published", "Ogden fax submission"],
            ["Catch-up for missed years", "Confirm each filed year", "DIIRSP reasonable cause"],
          ],
        },
      },
      {
        heading: "Does StartGlobal name Form 5472?",
        body: "Not as a service on the pages we checked. StartGlobal's pricing page prices Federal Tax Filing \"by your revenue\" a la carte and includes it in the $149-per-month Managed LLC plan; its federal tax filing page names Form 1065 and K-1s, not Form 5472 (checked October 5, 2026).\n\nStartGlobal's home page says it handles annual federal tax filing for single-member and multi-member LLCs, \"including the forms non-resident owners need\", without naming them. Ask StartGlobal to confirm in writing whether your plan includes Form 5472 + pro forma Form 1120; if it does not itemize those forms, a Form 5472-specific filing service fills the gap.",
      },
      {
        heading: "What is your first-year filing timeline?",
        body: "Your first-year filing timeline starts in the month the LLC is formed, and a short first year still counts if there was a reportable transaction before December 31. Initial funding sent to open the account, pay vendors, or reimburse owner-paid expenses is usually reportable, making first-year filing common.\n\nThe initial funding sent to open the LLC's account, pay vendors, or reimburse owner-paid expenses is usually reportable. For newly formed foreign-owned LLCs, that makes a first-year Form 5472 filing the normal outcome.",
      },
      {
        heading: "How do we file it?",
        body: "We file it by turning your formation details, owner information, year-end assets, and related-party transactions into a complete Form 5472 package. The 12-question wizard also prepares a DIIRSP reasonable cause statement for missed prior years, then an accountant reviews the package before Ogden PIN Unit fax submission.\n\nEvery package is accountant-reviewed before we fax it to the IRS Ogden PIN Unit at +1-855-887-7737. You receive the timestamped fax receipt as transmission evidence. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "How do you catch up on multiple missed years?",
        body: "If your StartGlobal LLC is older and you cannot confirm that Form 5472 + pro forma Form 1120 was filed for each year, identify the missed years before an IRS notice arrives. DIIRSP lets late international information returns be submitted with a reasonable cause statement requesting penalty relief.\n\nForm5472 Prep is an independent service and is not affiliated with, endorsed by, or connected to StartGlobal.",
      },
    ],
    faqs: [
      {
        q: "Does StartGlobal's Managed LLC plan clearly list Form 5472?",
        a: "No. StartGlobal's pricing page lists federal tax filing in the $149-per-month Managed LLC plan \"at any revenue\", but does not name Form 5472 or pro forma Form 1120. Ask StartGlobal for written confirmation tied to your plan and tax year.",
      },
      {
        q: "StartGlobal charges for Federal Tax Filing by revenue. Is that the same thing?",
        a: "Not necessarily. A la carte, StartGlobal prices Federal Tax Filing \"by your revenue\" without a published figure, and its federal tax filing page describes Form 1065 and K-1s. Confirm the specific forms, Form 5472 + pro forma 1120, not just the category name.",
      },
      {
        q: "Does StartGlobal's bank-account setup create the filing by itself?",
        a: "The bank account is not the filing. But the funding wire used to open or operate the account is often a reportable transaction, which can trigger the first-year Form 5472 obligation.",
      },
      {
        q: "If StartGlobal formed my Wyoming LLC, should I use Wyoming-related guidance?",
        a: "Yes for state annual-report context, but the federal Form 5472 filing works the same in Wyoming and Delaware. The federal package is what Form5472 Prep handles.",
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "delaware-llc-form-5472"],
  },
  {
    slug: "zenind-form-5472",
    keyword: "zenind form 5472",
    title: "Zenind Form 5472 — From Guide to Actual Filing",
    metaDescription:
      "Zenind publishes a Form 5472 guide, and its pricing page lists no Form 5472 filing. Learn the next step for foreign-owned LLCs.",
    sources: [
      { label: "Zenind: Form 5472 and pro forma 1120 guide", url: "https://www.zenind.com/en-US/help/post/how-to-file-form-5472-and-pro-forma-form-1120-for-a-foreign-owned-single-member-llc" },
      { label: "Zenind: Pricing", url: "https://www.zenind.com/en-US/pricing" },
      { label: "Zenind: Home", url: "https://www.zenind.com/en-US" },
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
    ],
    published: "2026-08-31",
    updated: "2026-10-05",
    startSrc: "zenind-form-5472",
    h1: "Zenind explains Form 5472. Filing it is the next step.",
    intro:
      "Zenind offers online US company formation, registered agent service in all 50 states and DC, EIN application preparation, compliance tracking and annual report filing, notary, foreign qualification and accounting services. Its Form 5472 guide explains the rule, but a foreign-owned single-member LLC still needs the annual IRS package prepared and filed.",
    sections: [
      {
        heading: "What does Zenind do for you?",
        body: "Zenind's home page lists company formation, registered agent service in 50 states and the District of Columbia, compliance tracking and annual report filing, EIN application preparation assistance, notary services, foreign qualification and accounting services. Its home page says it serves businesses of every scale, from solo entrepreneurs upward (checked October 5, 2026).",
      },
      {
        heading: "What does Zenind leave with you?",
        body: "The federal Form 5472 filing stays with you unless a provider confirms in writing that it prepares and files it. Formation, registered agent service, compliance reminders, EIN application preparation and annual report filing do not replace the IRS filing, which is separate from state compliance tracking and educational guidance.\n\nForm 5472 is a federal information return. It is separate from state compliance tracking and from educational guidance explaining what the form is.",
        table: {
          caption: "Zenind and Form5472 Prep task split",
          columns: ["Task", "Zenind", "Form5472 Prep"],
          rows: [
            ["LLC formation", "Online company formation", "Filing service"],
            ["Registered agent", "Registered agent service", "Federal package only"],
            ["EIN", "EIN application preparation", "Collects EIN and facts"],
            ["Form 5472 package", "No 5472 line on pricing page", "Produces 5472 and 1120"],
            ["IRS fax filing", "Not described on pages checked", "Ogden fax receipt"],
            ["Catch-up for missed years", "Guide after missed years", "DIIRSP reasonable cause"],
          ],
        },
      },
      {
        heading: "Does Zenind teach the process or file it?",
        body: "Zenind's Form 5472 guide teaches the process. Its \"How Zenind Can Help\" section describes formation and ongoing compliance workflows that keep filing deadlines visible, but it does not say Zenind prepares or files the Form 5472 + pro forma 1120 package, and the article carries a legal and tax advice disclaimer.\n\nZenind's pricing page lists no Form 5472 or pro forma Form 1120 line item (checked October 5, 2026). If you want Zenind to handle the filing, ask Zenind in writing; otherwise prepare the package yourself or use a Form 5472-specific filing service.",
      },
      {
        heading: "What is your first-year filing timeline?",
        body: "Your first-year filing timeline begins when the LLC is formed and ends with that tax year. If anything reportable happened in that first partial year, the package is due the following filing season; the owner's initial funding wire is the most common first reportable transaction.\n\nThe most common first reportable transaction is the owner's initial funding wire into the LLC bank account. Even without revenue, that transaction usually means the newly formed foreign-owned LLC files for year one.",
      },
      {
        heading: "How do we file it?",
        body: "Form5472 Prep turns the filing into a 12-question flow covering LLC identity, owner identity, year-end totals, and related-party transactions. We produce the pro forma Form 1120, Form 5472, Part V supporting statement, cover letter, and DIIRSP reasonable cause statement if late.\n\nAn accountant reviews every package. We fax it to the IRS Ogden PIN Unit at +1-855-887-7737 and return the timestamped fax receipt as transmission evidence. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "How do you catch up on multiple missed years?",
        body: "If you read Zenind's guide after missing one or more prior years, catch-up usually means preparing each missed Form 5472 + pro forma Form 1120 package and submitting them through DIIRSP with a reasonable cause statement. Filing before IRS contact keeps the catch-up path cleaner.\n\nForm5472 Prep is an independent service and is not affiliated with, endorsed by, or connected to Zenind.",
      },
    ],
    faqs: [
      {
        q: "Does Zenind file Form 5472 for customers?",
        a: "Zenind's pricing page lists no Form 5472 filing, and its Form 5472 guide does not say Zenind prepares or files the package; the guide carries a legal and tax advice disclaimer. If you want Zenind to handle it, ask Zenind in writing.",
      },
      {
        q: "Zenind prepared my EIN application. Does that cover federal tax filing?",
        a: "No. EIN application preparation is an identity step. Form 5472 + pro forma Form 1120 is a separate annual federal information return for foreign-owned single-member LLCs with reportable transactions.",
      },
      {
        q: "Does Zenind's compliance tracking mean the IRS received my return?",
        a: "No. Compliance tracking keeps deadlines visible; it is not proof of filing. Evidence that your Form 5472 package was sent is a fax transmission receipt or mailing record, and that shows transmission, not IRS acceptance.",
      },
      {
        q: "What should I do after reading Zenind's Form 5472 guide?",
        a: "Gather your EIN, formation date, owner details, year-end assets, and owner-to-LLC transactions. Then either prepare and fax the IRS package yourself or use a filing service that specifically handles Form 5472 + pro forma Form 1120.",
      },
    ],
    relatedSlugs: ["form-5472-instructions", "diirsp"],
  },
  {
    slug: "northwest-registered-agent-form-5472",
    keyword: "northwest registered agent form 5472",
    title: "Northwest Registered Agent Form 5472 — What to Check",
    metaDescription:
      "Used Northwest Registered Agent? Form 5472 is a separate federal filing. See what to confirm in writing and how to file the IRS package.",
    sources: [
      { label: "IRS: About Form 5472", url: "https://www.irs.gov/forms-pubs/about-form-5472" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: Delinquent international information return procedures", url: "https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures" },
    ],
    published: "2026-08-31",
    updated: "2026-10-05",
    startSrc: "northwest-registered-agent-form-5472",
    h1: "Used Northwest Registered Agent? Form 5472 is a separate federal filing.",
    intro:
      "A registered agent receives legal papers and official state notices for your LLC; it does not by itself file federal information returns. If Northwest Registered Agent formed or serves your foreign-owned single-member LLC, Form 5472 + pro forma Form 1120 is a separate annual IRS package, so confirm in writing whether any service you bought covers it.",
    sections: [
      {
        heading: "What does Northwest Registered Agent do for you?",
        body: "As its name says, Northwest Registered Agent is a registered agent company. A registered agent accepts service of process and official state notices for your LLC. Northwest's plans and prices are not summarized here; check Northwest's own site or your invoice for what your order includes, including any tax filing service.",
      },
      {
        heading: "What does Northwest Registered Agent leave with you?",
        body: "A foreign-owned single-member US LLC must file Form 5472 with a pro forma Form 1120 annually when it has reportable transactions. This is true even when a registered agent or formation company handled the state filing, EIN service, business address, or annual report.\n\nForm 5472 is federal tax information reporting. Registered-agent service and state compliance filings do not by themselves complete the federal IRS package.",
        table: {
          caption: "Northwest Registered Agent and Form5472 Prep task split",
          columns: ["Task", "Northwest Registered Agent", "Form5472 Prep"],
          rows: [
            ["Registered agent", "Registered agent service", "Not included; federal filing only"],
            ["Form 5472 package", "Confirm with Northwest in writing", "Generates federal package"],
            ["IRS fax filing", "Confirm with Northwest in writing", "Ogden fax receipt"],
            ["Catch-up for missed years", "Confirm with Northwest in writing", `+${PRICE_ADDON} per additional past year`],
          ],
        },
      },
      {
        heading: "How do you confirm whether Northwest covers Form 5472?",
        body: "Ask Northwest in writing whether any service on your account prepares and files Form 5472 with a pro forma Form 1120 for a specific tax year. Registered agent and state compliance work does not by itself complete the federal package, so a written answer tied to your invoice settles the question.\n\nIf the answer is no, or you cannot confirm coverage for past years, you can prepare and fax the package yourself or use a Form 5472-specific filing service.",
      },
      {
        heading: "What is your first-year filing timeline?",
        body: "The first filing year is the year the LLC was formed, even if formation happened late in the year. If the LLC had any reportable transaction during that partial year, Form 5472 + pro forma Form 1120 is due the next filing season.\n\nFor most foreign-owned LLCs, the owner-funded startup deposit into the LLC bank account is reportable. Revenue is not required for a first-year filing obligation to exist.",
      },
      {
        heading: "How do we file it?",
        body: "Our 12-question wizard collects the LLC facts, foreign-owner facts, year-end totals, and transactions between the LLC and related parties. We generate the complete federal package: pro forma Form 1120, Form 5472, supporting statement, cover letter, and reasonable cause statement if late.\n\nAn accountant reviews each package before submission. We fax the signed return to the IRS Ogden PIN Unit at +1-855-887-7737 and provide the timestamped fax receipt. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "How do you catch up on multiple missed years?",
        body: "If your LLC has been around for multiple years and the 5472 package was never filed, DIIRSP is the usual voluntary catch-up route when the IRS has not already contacted you. That means filing the missed-year packages together with a reasonable cause statement requesting penalty relief.\n\nForm5472 Prep is an independent service and is not affiliated with, endorsed by, or connected to Northwest Registered Agent.",
      },
    ],
    faqs: [
      {
        q: "Does Northwest Registered Agent prepare Form 5472?",
        a: "Check with Northwest directly. Registered agent and state filing services do not by themselves complete the federal Form 5472 + pro forma Form 1120 package. Ask Northwest in writing whether anything on your account covers it, for which tax years and at what price.",
      },
      {
        q: "Is a registered agent responsible for my federal Form 5472?",
        a: "No. Registered agent service receives legal and state correspondence; it does not automatically prepare federal information returns. The foreign-owned LLC owner remains responsible for Form 5472 when required.",
      },
      {
        q: "My registered agent got my EIN. Is that different from Form 5472?",
        a: "Yes. EIN service obtains the LLC's IRS identification number. Form 5472 + pro forma Form 1120 is the annual federal package that reports related-party transactions.",
      },
      {
        q: "Where does the Form 5472 package go if I file it myself?",
        a: "The IRS Form 5472 instructions direct a foreign-owned disregarded entity to send Form 5472 with a pro forma Form 1120 by fax to the Ogden PIN Unit at +1-855-887-7737 or by mail. Keep the fax receipt or mailing record as evidence of transmission.",
      },
    ],
    relatedSlugs: ["file-form-5472", "diirsp"],
  },
  // ── New pages from the Moz keyword gap (docs/seo/moz-full-report-2026-10-07.md §3.6, items 1, 4, 8, 18) ──
  {
    slug: "form-5472-example",
    keyword: "form 5472 example",
    title: "Form 5472 Example: Completed Sample With Pro Forma 1120",
    metaDescription:
      "A fictional, filled-in Form 5472 for a foreign-owned single-member LLC, line by line, with the pro forma 1120 header and a watermarked sample PDF.",
    sources: [
      { label: "IRS: Form 5472 (Rev. December 2023)", url: "https://www.irs.gov/pub/irs-pdf/f5472.pdf" },
      { label: "IRS: Instructions for Form 5472 (Rev. December 2024)", url: "https://www.irs.gov/instructions/i5472" },
      { label: "IRS: Form 1120 (2025)", url: "https://www.irs.gov/pub/irs-pdf/f1120.pdf" },
      { label: "IRS: Instructions for Form 1120 (business activity codes)", url: "https://www.irs.gov/instructions/i1120" },
    ],
    published: "2026-10-07",
    updated: "2026-10-07",
    h1: "Form 5472 Example: A Completed Sample With the Pro Forma 1120",
    intro:
      "This is a fictional, clearly labelled Form 5472 example for a foreign-owned single-member US LLC, filled in line by line, with the pro forma Form 1120 it is attached to. Every name, number and amount is invented. Use it to see what a completed package looks like, then check your own facts against the IRS instructions.",
    sections: [
      {
        heading: "What does a completed Form 5472 look like?",
        body: "A completed Form 5472 for a foreign-owned single-member LLC is the three-page IRS form plus a Part V statement, attached to a pro forma Form 1120. Most boxes stay blank. The sample below uses an invented Wyoming LLC, Sample Widget Studio LLC, owned by an invented UK resident, Alex Sample.\n\nDownload the [watermarked sample package (PDF)](/samples/form-5472-example-sample.pdf): cover letter, pro forma Form 1120, Form 5472 and the Part V statement, produced by the same generator that builds customer packages and stamped SAMPLE – NOT FOR FILING on every page. Identifying numbers are placeholders such as XX-XXXXXXX.",
        table: {
          caption: "The invented facts behind this Form 5472 example",
          columns: ["Fact", "Sample value"],
          rows: [
            ["Reporting LLC", "Sample Widget Studio LLC, Wyoming"],
            ["LLC EIN", "XX-XXXXXXX (placeholder)"],
            ["Date formed", "1 March 2024; first Form 5472 filed for 2024"],
            ["Sole owner", "Alex Sample, UK-resident individual, no SSN or ITIN"],
            ["Tax year", "Calendar year 2025"],
            ["Owner contribution", "$10,000 on 15 January 2025"],
            ["Distribution to owner", "$4,000 on 20 November 2025"],
            ["Total assets at year-end", "$15,000"],
          ],
        },
      },
      {
        heading: "What goes at the top of Form 5472?",
        body: "The top of Form 5472 records the reporting corporation's tax year. A foreign-owned US disregarded entity uses its owner's US tax year or, if the owner has none, the calendar year, so the sample enters 1 January 2025 to 31 December 2025. The form's note requires English entries and US-dollar amounts.",
        table: {
          caption: "Form 5472 header entries in the sample",
          columns: ["Entry", "Sample value"],
          rows: [
            ["Tax year beginning", "01/01, 2025"],
            ["Tax year ending", "12/31, 2025"],
            ["Language and currency", "English; every amount in US dollars"],
          ],
        },
      },
      {
        heading: "Which Part I lines identify the LLC in the example?",
        body: "Part I identifies the reporting corporation, which for a foreign-owned disregarded entity is the LLC itself, not its owner. Use the LLC's legal name, EIN and US address exactly as the IRS has them. The instructions tell domestic filers to take total assets from Form 1120, item D.\n\nLine 1o must list the actual countries where business is conducted; the instructions say not to enter \"worldwide\". The sample enters the United States on line 1n, as our package generator does for a US-formed LLC, and on line 1o because the invented LLC conducts its business there. Codes for line 1e come from the principal business activity list in the Form 1120 instructions.",
        table: {
          caption: "Form 5472 Part I identification lines, sample entries",
          columns: ["Line", "What it asks", "Sample entry"],
          rows: [
            ["1a", "LLC name and US address", "Sample Widget Studio LLC, Cheyenne, WY"],
            ["1b", "Employer identification number", "XX-XXXXXXX"],
            ["1c", "Total assets", "15000"],
            ["1d and 1e", "Principal business activity and code", "Custom computer programming services, 541511"],
            ["1l", "Country of incorporation", "United States"],
            ["1m", "Date of incorporation", "03/01/2024"],
            ["1n", "Countries where it files as a resident", "United States"],
            ["1o", "Principal countries where business is conducted", "United States (an invented fact)"],
          ],
        },
      },
      {
        heading: "Which Part I totals and checkboxes does the example complete?",
        body: "Line 1f totals the foreign related-party transactions on this form, and for a foreign-owned disregarded entity that total includes Part V. The sample's $10,000 contribution plus $4,000 distribution gives $14,000. Line 3 is the box that identifies the filer as a foreign-owned U.S. DE.\n\nWith one related party, one Form 5472 is filed, so lines 1f and 1h match. Line 1j stays unchecked because the invented LLC first filed for 2024. Line 2 is checked because a foreign person owns 100%. Line 1k is 0 because there is no cost sharing arrangement, so no Part VIII is attached.",
        table: {
          caption: "Form 5472 Part I totals and checkboxes, sample entries",
          columns: ["Line", "What it asks", "Sample entry"],
          rows: [
            ["1f", "Payments made or received on this form", "14000"],
            ["1g", "Number of Forms 5472 filed for the year", "1"],
            ["1h", "Payments on all Forms 5472 filed", "14000"],
            ["1i", "Consolidated filing", "Not checked"],
            ["1j", "Initial year of filing Form 5472", "Not checked"],
            ["1k", "Number of Parts VIII attached", "0"],
            ["2", "Foreign person owns at least 50%", "Checked"],
            ["3", "Foreign-owned U.S. DE", "Checked"],
          ],
        },
      },
      {
        heading: "What goes in Part II for a single foreign owner?",
        body: "Part II names the 25% foreign shareholder, and for a foreign-owned disregarded entity the instructions say to report the foreign owner there. A reference ID is required only when no US identifying number is entered, and a DE must enter the owner's FTIN, or \"None\" or \"N/A\" if there is none.\n\nReference IDs are self-assigned: alphanumeric, no spaces or special characters, at most 50 characters, and used consistently every year. The sample's SAMPLEOWNER01 follows those rules, and the FTIN is a placeholder. Lines 5a to 7e stay blank because there is one direct owner and no indirect owner.",
        table: {
          caption: "Form 5472 Part II for one foreign individual, sample entries",
          columns: ["Line", "What it asks", "Sample entry"],
          rows: [
            ["4a", "Name and address of direct 25% foreign shareholder", "Alex Sample, invented UK address"],
            ["4b(1)", "US identifying number, if any", "Blank: no SSN or ITIN"],
            ["4b(2)", "Reference ID number", "SAMPLEOWNER01"],
            ["4b(3)", "Foreign taxpayer identification number (FTIN)", "XXXXXXXXXX (placeholder)"],
            ["4c", "Principal countries where business is conducted", "United Kingdom"],
            ["4d", "Country of citizenship, organization, or incorporation", "United Kingdom"],
            ["4e", "Countries where the owner files as a tax resident", "United Kingdom"],
            ["5a to 7e", "Second direct and ultimate indirect shareholders", "Blank"],
          ],
        },
      },
      {
        heading: "What goes in Part III when the owner is the related party?",
        body: "All filers complete Part III, even when the related party is already listed in Part II. In the sample the related party is Alex Sample again, so line 8a repeats the owner's name and address, the foreign person box is checked, and line 8e marks the 25% foreign shareholder.\n\nA separate Form 5472 is filed for each related party with which the LLC had a reportable transaction, and line 1g counts those forms. If the owner's other company had also paid the LLC, that company would need its own Form 5472.",
        table: {
          caption: "Form 5472 Part III, sample entries",
          columns: ["Line", "What it asks", "Sample entry"],
          rows: [
            ["Heading", "Foreign person or U.S. person?", "Foreign person"],
            ["8a", "Name and address of related party", "Alex Sample, invented UK address"],
            ["8b(1) to 8b(3)", "US number, reference ID, FTIN", "Blank, SAMPLEOWNER01, XXXXXXXXXX"],
            ["8c and 8d", "Principal business activity and code", "Custom computer programming services, 541511"],
            ["8e", "Relationship", "25% foreign shareholder"],
            ["8f", "Principal countries where business is conducted", "United Kingdom"],
            ["8g", "Countries where it files as a tax resident", "United Kingdom"],
          ],
        },
      },
      {
        heading: "Why is Part IV mostly blank in this example?",
        body: "Part IV lists monetary transactions by category, such as sales, rents, royalties, services, loans and interest, and must be completed when the related party is a foreign person. The sample owner sold nothing to the LLC, lent nothing and charged no fees, so lines 22 and 36 show zero.\n\nIf the owner had lent money to the LLC, the balance would go on line 17 (amounts borrowed) and any interest on line 32. A payment by the LLC for the owner's services would go on line 29. Amounts are stated in US dollars with a schedule of the exchange rates used, and an amount of $50,000 or less may be reported as \"$50,000 or less\".",
      },
      {
        heading: "What goes in Part V and its attached statement?",
        body: "Part V is the part written for foreign-owned DEs. Check its box and attach a statement describing other transactions under Treas. Reg. §1.482-1(i)(7), including amounts paid or received on formation, dissolution, acquisition and disposition, and contributions to and distributions from the entity.\n\nThe sample statement lists each transaction with its date, description and US-dollar amount, and its total ties to line 1f. A longer worked version with more transaction types is in the [Part V statement example](/blog/form-5472-part-v-statement-example).",
        table: {
          caption: "Part V supporting statement in the sample",
          columns: ["Date", "Transaction", "Amount (USD)"],
          rows: [
            ["01/15/2025", "Capital contribution from Alex Sample", "10,000"],
            ["11/20/2025", "Distribution to Alex Sample", "4,000"],
            ["Total", "Part V transactions for tax year 2025", "14,000"],
          ],
        },
      },
      {
        heading: "Which parts of Form 5472 do not apply in this example, and why?",
        body: "Part VII applies to every filer, so the sample answers its questions rather than skipping them. Parts VI, VIII and IX describe transactions the sample LLC did not have, so they stay blank, and the instructions tell a foreign-owned DE not to complete lines 43a and 43b.",
        table: {
          caption: "Parts left blank or answered No in the sample",
          columns: ["Part or line", "Sample treatment"],
          rows: [
            ["Part VI", "Box not checked: no nonmonetary or less-than-full-consideration transactions"],
            ["Part VII, lines 37, 39, 40a, 41a, 42a, 42b", "Answered No"],
            ["Lines 38a to 38c", "Blank, because line 37 is No"],
            ["Lines 43a and 43b", "Blank: not completed by a foreign-owned U.S. DE"],
            ["Part VIII", "Not attached: no cost sharing arrangement"],
            ["Part IX", "Blank: no base erosion amounts in the sample"],
          ],
        },
      },
      {
        heading: "What goes on a pro forma 1120 for a foreign-owned LLC?",
        body: "Only the name and address of the foreign-owned DE and items B and E on page 1 are required, and \"Foreign-owned U.S. DE\" is written across the top. The income, deduction and tax lines stay blank because a foreign-owned DE has no income tax return filing requirement of its own.\n\nItem E has four boxes: initial return, final return, name change and address change. None applies to the sample year. Items C and D are not on the required list; our generator mirrors them from Form 5472 lines 1m and 1c so the two forms agree. Signing the page 1 block is covered in [how to sign the pro forma 1120](/blog/form-5472-pro-forma-1120-signature).",
        table: {
          caption: "Pro forma Form 1120 header in the sample",
          columns: ["Item", "Sample entry"],
          rows: [
            ["Top margin", "Foreign-owned U.S. DE"],
            ["Tax year", "Calendar year 2025"],
            ["Name and address", "Sample Widget Studio LLC, Cheyenne, WY"],
            ["Item B, employer identification number", "XX-XXXXXXX"],
            ["Item E checkboxes", "None checked"],
            ["Items C and D (optional mirror)", "03/01/2024 and 15000"],
            ["Lines 1 to 37 and schedules", "Blank"],
          ],
        },
      },
      {
        heading: "How is the example package assembled and sent?",
        body: "The package is assembled in a fixed order and sent by fax or mail, because a foreign-owned U.S. DE cannot file Form 5472 electronically.\n\n1. Put a short cover letter first that names the LLC, its EIN and the tax year (our packages include one; the IRS does not prescribe it).\n2. Place the pro forma Form 1120 next, with \"Foreign-owned U.S. DE\" across the top.\n3. Attach all three pages of Form 5472 behind the Form 1120.\n4. Attach the Part V statement, plus an exchange-rate schedule if Part IV amounts were converted.\n5. Fax at 300 DPI or higher to the IRS at 855-887-7737, or mail to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.\n6. Keep the complete package and the fax or mailing record together.",
      },
      {
        heading: "Can we prepare your real Form 5472 package?",
        body: "Yes. Form5472 Prep prepares the pro forma Form 1120, Form 5472 and Part V statement from your answers, then faxes the package to the IRS and sends you the transmission record. Every filing is reviewed by a qualified accountant before it is submitted. See the [Form 5472 filing service](/services/form-5472-filing-service).\n\nFor the line-by-line rules behind this sample, read the plain-English [Form 5472 instructions](/form-5472-instructions).",
      },
    ],
    faqs: [
      {
        q: "Is this Form 5472 example a real filing?",
        a: "No. Every name, address, identifying number and amount in this example is invented, and the sample PDF is stamped SAMPLE – NOT FOR FILING on every page. Use it to understand the layout, then prepare your own package from your LLC's records and the current IRS instructions.",
      },
      {
        q: "Do I have to fill in every line of Form 5472?",
        a: "No. A foreign-owned LLC completes Part I, Part II for its foreign owner, Part III, the Part IV totals when the related party is foreign, Part V when it had reportable transactions, and the Part VII questions. Parts VI, VIII and IX apply only when those transactions exist.",
      },
      {
        q: "Does an LLC with no transactions need a Form 5472 example?",
        a: "Not usually. The first exception in the IRS instructions excuses a foreign-owned DE with no reportable transactions of the types in Parts IV, V and VI. Money the owner puts in to form or fund the LLC is a Part V transaction, so a funded LLC normally has something to report.",
      },
      {
        q: "Can I use the sample PDF as a template?",
        a: "Only as a visual reference. It is watermarked, uses placeholder identifiers such as XX-XXXXXXX, and reflects one invented fact pattern. Download the current blank Form 5472 and Form 1120 from irs.gov and enter your own LLC's facts.",
      },
      {
        q: "Does a catch-up filing need one package per year?",
        a: "Yes. Each tax year gets its own pro forma Form 1120 with its own Form 5472 attached, built from that year's transactions. Late packages may also carry a reasonable-cause statement under the IRS delinquent international information return procedures.",
      },
    ],
    relatedSlugs: ["form-5472-instructions", "pro-forma-1120", "irs-form-5472", "file-form-5472"],
  },
  {
    slug: "can-a-foreigner-own-a-us-llc",
    keyword: "can a foreigner own a us llc",
    title: "Can a Foreigner Own a US LLC? Rules and Yearly Filings",
    metaDescription:
      "Yes. Non-residents and foreign companies can own a US LLC. What each ownership setup files with the IRS every year, and how to get an EIN without an SSN.",
    sources: [
      { label: "IRS: Limited Liability Company (LLC)", url: "https://www.irs.gov/businesses/small-businesses-self-employed/limited-liability-company-llc" },
      { label: "IRS: Single member limited liability companies", url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
      { label: "Treas. Reg. §301.7701-3 (default classification)", url: "https://www.ecfr.gov/current/title-26/section-301.7701-3" },
      { label: "IRS: Partnership withholding (section 1446)", url: "https://www.irs.gov/individuals/international-taxpayers/partnership-withholding" },
      { label: "IRS: Instructions for Form 1065", url: "https://www.irs.gov/instructions/i1065" },
      { label: "IRS: Instructions for Form SS-4", url: "https://www.irs.gov/instructions/iss4" },
      { label: "IRS: Instructions for Form 1120-F", url: "https://www.irs.gov/instructions/i1120f" },
    ],
    published: "2026-10-07",
    updated: "2026-10-07",
    h1: "Can a Foreigner Own a US LLC?",
    intro:
      "Yes. The IRS notes that most states do not restrict LLC ownership, so members may include individuals, corporations, other LLCs and foreign entities. What foreign ownership changes is the federal filing: one foreign owner means a pro forma Form 1120 with Form 5472 in reportable years, while two or more members default to partnership filing.",
    sections: [
      {
        heading: "Can a non-resident alien own a US LLC?",
        body: "Yes. The IRS notes that most states do not restrict LLC ownership, and the federal default classification rules turn on the number of members, not where they live. Formation is a state filing; the federal question for a non-resident owner is which return the LLC files each year.\n\nWith one non-resident owner and no election, the LLC is disregarded for income tax. Because that owner is a foreign person, Treas. Reg. §301.7701-2(c)(2)(vi) treats the LLC as a corporation for section 6038A reporting only, which is why it files [Form 5472](/blog/what-is-form-5472) in any year it has a reportable transaction with its owner.",
      },
      {
        heading: "Can a foreign company own a US LLC?",
        body: "Yes. A foreign corporation can be the sole member or one of several members. If it is the only member, the LLC is a foreign-owned disregarded entity, files Form 5472 with a pro forma Form 1120 in any year with a reportable transaction, and lists the foreign company in Part II.\n\nA disregarded LLC's activities are treated as those of its owner, so a foreign company whose LLC carries on a US trade or business may have its own return to file: the Form 1120-F instructions require one from a foreign corporation engaged in a US trade or business during the year. Ownership chains and ultimate owners are covered in [Form 5472 when a foreign company owns the LLC](/blog/form-5472-foreign-corporate-owner).",
      },
      {
        heading: "What if a US LLC has more than one foreign member?",
        body: "A domestic LLC with two or more members is classified as a partnership unless it elects to be taxed as a corporation. A partnership is not a disregarded entity, so the foreign-owned DE rule behind the pro forma Form 1120 does not apply; the LLC files Form 1065 instead.\n\nThe Form 1065 instructions require every domestic partnership to file unless it neither receives income nor incurs expenditures treated as deductions or credits. A partnership with income effectively connected with a US trade or business must also pay section 1446 withholding tax on the share allocable to foreign partners, reported on Forms 8804 and 8805. See [multi-member LLCs with foreign owners](/blog/multi-member-llc-form-5472-or-1065).\n\nIf the LLC elects to be taxed as a corporation, it files a regular Form 1120 instead, and Form 5472 can apply because a 25% foreign shareholder makes it a reporting corporation.",
      },
      {
        heading: "What does each foreign ownership setup file every year?",
        body: "The annual filing follows the LLC's federal classification, and the classification follows the number of members and any Form 8832 election. A single foreign owner files the pro forma package; a multi-member LLC files a partnership return; an LLC that elects corporate status files a regular Form 1120.\n\nThe table covers the LLC's own federal filings. Owners can have separate US returns of their own, for example when the LLC's income is effectively connected with a US trade or business, and state filings are separate again.",
        table: {
          caption: "Annual federal filings by foreign ownership setup",
          columns: ["Owner setup", "Default federal treatment", "Annual federal filing"],
          rows: [
            ["One non-resident individual", "Disregarded; a corporation for section 6038A only", "Pro forma Form 1120 with Form 5472"],
            ["One foreign company", "Disregarded; a corporation for section 6038A only", "Pro forma Form 1120 with Form 5472"],
            ["Two or more members, any of them foreign", "Partnership", "Form 1065; section 1446 forms if effectively connected income"],
            ["Any LLC that elects corporate status", "Corporation", "Form 1120, with Form 5472 if 25% foreign-owned"],
          ],
        },
      },
      {
        heading: "How does a foreign owner get an EIN without an SSN?",
        body: "Apply on Form SS-4 by fax or mail. The IRS online application requires the responsible party to have a valid SSN, ITIN or EIN, and international applicants with no US legal residence, principal place of business or office can apply by telephone at 267-941-1099 (not toll-free).\n\nForm 5472 line 1b asks for the LLC's EIN, so the number is needed before the first filing. Step by step: [EIN for a foreign-owned LLC without an SSN](/blog/ein-for-foreign-owned-llc-without-ssn).",
      },
      {
        heading: "What happens if a foreign-owned LLC skips Form 5472?",
        body: "The IRS instructions set a $25,000 penalty for failing to file Form 5472 when due and in the manner prescribed, and a substantially incomplete form counts as a failure to file. If the failure continues more than 90 days after IRS notice, a further $25,000 applies for each 30-day period.\n\nOwners who missed earlier years can start with the [late Form 5472 guide](/late-form-5472).",
      },
      {
        heading: "Can we handle the annual filing for a foreign-owned LLC?",
        body: "Yes. For a single-member LLC owned by a non-resident or a foreign company, Form5472 Prep prepares the pro forma Form 1120, Form 5472 and Part V statement, and faxes the package to the IRS. Every filing is reviewed by a qualified accountant before it is submitted. We do not prepare partnership returns.\n\nSee the [foreign-owned LLC tax filing service](/services/foreign-owned-llc-tax-filing-service) for what is and is not included.",
      },
    ],
    faqs: [
      {
        q: "Do I need to live in the US to own an LLC?",
        a: "No. The IRS notes that most states do not restrict LLC ownership, and its list of possible members includes foreign entities. Each formation state sets its own requirements for the formation filing itself, so check that state's business-filing office.",
      },
      {
        q: "Can an LLC have only foreign members?",
        a: "Yes. A single foreign member makes the LLC a foreign-owned disregarded entity, and two or more members make it a partnership by default under Treas. Reg. §301.7701-3(b)(1), whatever the members' nationality.",
      },
      {
        q: "Does a foreign-owned LLC pay US tax?",
        a: "Not automatically. A disregarded LLC's activities are treated as its owner's, so the question is whether the owner has US-taxable income, such as income effectively connected with a US trade or business. The Form 5472 filing applies either way when there is a reportable transaction.",
      },
      {
        q: "Does a foreign owner need an ITIN for Form 5472?",
        a: "No. Part II accepts a self-assigned reference ID when the owner has no US identifying number, and a foreign-owned DE enters the owner's FTIN or \"None\". An ITIN may still be needed for other purposes, such as the owner's own US tax return.",
      },
      {
        q: "Can a foreign company and an individual co-own one US LLC?",
        a: "Yes. With two members the LLC is a partnership by default and files Form 1065, not the pro forma Form 1120 package. If it elects corporate status instead, it files Form 1120, and Form 5472 can apply to its related-party transactions.",
      },
    ],
    relatedSlugs: ["single-member-llc-foreign-owner", "foreign-owned-llc-tax", "what-is-a-disregarded-entity", "form-5472-example"],
  },
  {
    slug: "what-is-a-disregarded-entity",
    keyword: "what is a disregarded entity",
    title: "What Is a Disregarded Entity? Definition and Form 5472",
    metaDescription:
      "A disregarded entity is a one-owner business the IRS ignores for income tax. Why a foreign-owned one is still a corporation for Form 5472 reporting.",
    sources: [
      { label: "Treas. Reg. §301.7701-2 (business entities)", url: "https://www.ecfr.gov/current/title-26/section-301.7701-2" },
      { label: "Treas. Reg. §301.7701-3 (classification elections)", url: "https://www.ecfr.gov/current/title-26/section-301.7701-3" },
      { label: "Treas. Reg. §1.6038A-1 (reporting corporation)", url: "https://www.ecfr.gov/current/title-26/section-1.6038A-1" },
      { label: "T.D. 9796 (Internal Revenue Bulletin 2017-3)", url: "https://www.irs.gov/irb/2017-03_IRB#TD-9796" },
      { label: "IRS: Single member limited liability companies", url: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" },
      { label: "IRS: Instructions for Form 5472", url: "https://www.irs.gov/instructions/i5472" },
    ],
    published: "2026-10-07",
    updated: "2026-10-07",
    h1: "What Is a Disregarded Entity?",
    intro:
      "A disregarded entity is a business entity with one owner that federal income tax treats as part of that owner, not as a separate taxpayer. Under Treas. Reg. §301.7701-3, a US single-member LLC is disregarded by default. If one foreign person owns it, it is still treated as a corporation for Form 5472 reporting.",
    sections: [
      {
        heading: "What is a disregarded entity under IRS rules?",
        body: "Treas. Reg. §301.7701-2(a) says a business entity with only one owner is classified as a corporation or is disregarded, and a disregarded entity's activities are treated like a sole proprietorship, branch or division of the owner. The entity still exists under state law.\n\nDisregarded means ignored for federal income tax, not dissolved. The IRS single-member LLC page notes that the LLC is still treated as a separate entity for employment tax and certain excise taxes.",
      },
      {
        heading: "When is an LLC a disregarded entity by default?",
        body: "A domestic eligible entity with a single owner is disregarded by default under Treas. Reg. §301.7701-3(b)(1), unless it elects otherwise. A domestic LLC with two or more members defaults to a partnership. Either can file Form 8832 to elect classification as a corporation.",
        table: {
          caption: "Default federal classification by entity type",
          columns: ["Entity", "Default classification"],
          rows: [
            ["US LLC with one member", "Disregarded entity"],
            ["US LLC with two or more members", "Partnership"],
            ["Eligible entity that files Form 8832", "Corporation, if it elects that"],
            ["Foreign eligible entity, one owner without limited liability", "Disregarded entity"],
            ["Foreign eligible entity, all members with limited liability", "Association, taxed as a corporation"],
            ["Corporation formed under a state corporation statute", "Corporation; cannot be disregarded"],
          ],
        },
      },
      {
        heading: "Why does a foreign-owned disregarded entity file Form 5472?",
        body: "Treas. Reg. §301.7701-2(c)(2)(vi) treats a domestic entity that is otherwise disregarded as a corporation for section 6038A if one foreign person has direct or indirect sole ownership. That makes it a 25% foreign-owned reporting corporation, which reports related-party transactions on Form 5472.\n\nThe rule came from T.D. 9796 (81 FR 89850, 13 December 2016) and applies to tax years beginning after 31 December 2016 and ending on or after 13 December 2017. Outside section 6038A, the entity keeps its disregarded status. The filing itself is explained in [what is Form 5472](/blog/what-is-form-5472).",
      },
      {
        heading: "What does a foreign-owned disregarded entity file each year?",
        body: "A foreign-owned US disregarded entity has no income tax return filing requirement of its own, but it must file a pro forma Form 1120 with Form 5472 attached by the 1120's due date, including extensions. Only the name, address and items B and E on page 1 are completed.\n\nIt cannot file Form 5472 electronically. The package goes by fax to the IRS at 855-887-7737 or by mail to the Ogden PIN Unit, and Form 7004 extends the deadline. The cover return is explained in the [pro forma 1120](/pro-forma-1120) guide, and a filled-in sample is in the [Form 5472 example](/form-5472-example).",
      },
      {
        heading: "Does a disregarded entity with no transactions file Form 5472?",
        body: "No, if it had no reportable transactions of the types listed in Parts IV, V and VI of Form 5472. That is the first exception in the instructions. Several other exceptions, including the Form 5471 exception and the exception for transactions between two non-US persons, expressly do not apply to foreign-owned DEs.\n\nOwner contributions and distributions are Part V transactions, so a year with any money moving between the owner and the LLC is normally a filing year. See [Form 5472 for a dormant LLC](/blog/form-5472-dormant-llc-no-income).",
      },
      {
        heading: "Is a disregarded entity the same as a sole proprietorship?",
        body: "Not legally. A disregarded LLC remains a separate legal entity under state law; the regulation only treats its activities for federal income tax in the same manner as a sole proprietorship, branch or division of its owner. For employment taxes and certain excise taxes it is treated as separate.\n\nFor a US individual owner, the IRS says the LLC's activities are generally reported on the owner's own return. For a foreign owner, the LLC still files Form 5472 under the section 6038A rule.",
      },
      {
        heading: "How does a disregarded entity change its classification?",
        body: "An eligible entity can elect to be classified as a corporation by filing Form 8832, and an LLC that adds a second member falls under the default rule for two or more members, which is a partnership. Either change replaces the pro forma Form 1120 package with a full corporate return or a partnership return.\n\nWhat changes when a second owner joins is covered in [single-member to multi-member LLC](/blog/single-member-to-multi-member-llc-what-changes).",
      },
      {
        heading: "Can Form5472 Prep file for a foreign-owned disregarded entity?",
        body: "Yes. We prepare the pro forma Form 1120, Form 5472 and Part V statement that a foreign-owned US disregarded entity files each year, and fax the package to the IRS Ogden PIN Unit. Every filing is reviewed by a qualified accountant before it is submitted. We do not prepare partnership or full corporate returns.",
      },
    ],
    faqs: [
      {
        q: "Is a foreign-owned disregarded entity a corporation?",
        a: "Only for section 6038A reporting. Treas. Reg. §1.6038A-1(c)(1) classifies it as a domestic corporation for that purpose, which brings Form 5472 and the related recordkeeping rules. For other income tax purposes it remains disregarded.",
      },
      {
        q: "Is a disregarded entity taxed?",
        a: "Not as a separate income taxpayer. Its activities are reflected on its owner's federal return. It can still owe employment taxes and certain excise taxes in its own name, and a foreign-owned one still files Form 5472.",
      },
      {
        q: "Does a disregarded entity need its own EIN?",
        a: "A foreign-owned one filing Form 5472 does, because line 1b asks for the reporting corporation's EIN. The IRS single-member LLC page says a disregarded LLC with no employees or excise tax liability does not otherwise need one, though it can get one for a bank account.",
      },
      {
        q: "Is a multi-member LLC a disregarded entity?",
        a: "No. A domestic LLC with two or more members is a partnership by default, or a corporation if it elects. Neither is a disregarded entity, so the pro forma Form 1120 rule for foreign-owned DEs does not apply.",
      },
      {
        q: "When did foreign-owned disregarded entities start filing Form 5472?",
        a: "For tax years beginning after 31 December 2016 and ending on or after 13 December 2017, under final regulations in T.D. 9796. Earlier years were not covered by the section 6038A rule for disregarded entities.",
      },
    ],
    relatedSlugs: ["form-1120-disregarded-entity", "pro-forma-1120", "can-a-foreigner-own-a-us-llc", "single-member-llc-foreign-owner"],
  },
];

export function getLandingPage(slug: string): LandingPage | null {
  return LANDING_PAGES.find((p) => p.slug === slug) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Topic clusters — drive the "Related guides" cross-linking block at the
// bottom of each landing page. Goals:
//   1. SEO: more internal links from topical neighbours pass authority sideways
//      between pages that already rank for related queries.
//   2. AEO / GEO: AI crawlers (and Google's site-quality signals) treat tight
//      topic clusters as evidence of expertise on a subject area.
//   3. UX: a reader on "form-5472-deadline" probably also wants "form-5472-fax-number"
//      and "diirsp"; surface them inline so they don't have to hunt.
//
// A page can belong to multiple clusters. Order within a cluster doesn't matter.
// noindex pages (e.g. /pro-form-5472) are intentionally excluded from being
// suggested — getRelatedSlugs() filters them out so paid-ad landing pages don't
// leak into organic neighbours.
const TOPIC_CLUSTERS: Record<string, string[]> = {
  // Step-by-step / instructional core
  'how-to': [
    "file-form-5472",
    "form-5472-instructions",
    "irs-form-5472",
    "1120-pro-forma-instructions",
  ],
  // Late filing & penalty mitigation
  'late-and-penalty': [
    "diirsp",
    "late-form-5472",
    "form-5472-penalty",
    "form-5472-reasonable-cause-statement",
  ],
  // Pro forma 1120 mechanics
  '1120': [
    "pro-forma-1120",
    "form-1120-foreign-owned-llc",
    "form-1120-disregarded-entity",
    "1120-pro-forma-instructions",
    "form-5472-vs-1120",
  ],
  // Operational / logistical
  logistics: [
    "form-5472-deadline",
    "form-5472-fax-number",
    "file-form-5472",
  ],
  // State-specific guides
  state: [
    "wyoming-llc-form-5472",
    "delaware-llc-form-5472",
  ],
  // Country-specific guides (owner's country of tax residence)
  country: [
    "form-5472-germany",
    "form-5472-uae",
  ],
  // Audience / persona
  audience: [
    "foreign-owned-llc-tax",
    "single-member-llc-foreign-owner",
    "stripe-atlas-form-5472",
  ],  // Worked examples of the filing itself
  examples: [
    "form-5472-example",
    "form-5472-instructions",
    "pro-forma-1120",
    "1120-pro-forma-instructions",
  ],
  // Ownership and entity classification
  ownership: [
    "can-a-foreigner-own-a-us-llc",
    "what-is-a-disregarded-entity",
    "single-member-llc-foreign-owner",
    "form-1120-disregarded-entity",
  ],
};

// Membership index: slug → list of cluster names it appears in.
const CLUSTER_MEMBERSHIP: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = {};
  for (const [cluster, slugs] of Object.entries(TOPIC_CLUSTERS)) {
    for (const slug of slugs) {
      (m[slug] ??= []).push(cluster);
    }
  }
  return m;
})();

// Returns up to N suggested slugs for the given page, preferring:
//   1. Anything explicitly set on the page's relatedSlugs[]
//   2. Cluster mates (same topic cluster)
//   3. Other indexable pages (random tie-break, deterministic per slug)
// Always excludes the page itself, noindex pages, and duplicates.
export function getRelatedSlugs(forSlug: string, limit = 4): string[] {
  const out: string[] = [];
  const seen = new Set<string>([forSlug]);
  const indexable = new Set(
    LANDING_PAGES.filter((p) => !p.noindex).map((p) => p.slug),
  );

  const add = (s: string) => {
    if (out.length >= limit) return;
    if (seen.has(s)) return;
    if (!indexable.has(s)) return;
    out.push(s);
    seen.add(s);
  };

  // 1) Explicit overrides
  const page = LANDING_PAGES.find((p) => p.slug === forSlug);
  for (const s of page?.relatedSlugs ?? []) add(s);

  // 2) Cluster mates
  for (const cluster of CLUSTER_MEMBERSHIP[forSlug] ?? []) {
    for (const s of TOPIC_CLUSTERS[cluster] ?? []) add(s);
  }

  // 3) Deterministic fallback: walk the rest of LANDING_PAGES in order
  for (const p of LANDING_PAGES) add(p.slug);

  return out;
}

// Pull just the title + meta description for a slug (used by the related-guides
// renderer so it can show "title + one-line teaser" without re-importing the
// whole page object at every call site).
export function getLandingTeaser(slug: string): { title: string; description: string } | null {
  const p = LANDING_PAGES.find((x) => x.slug === slug);
  if (!p) return null;
  return { title: p.h1, description: p.metaDescription };
}
