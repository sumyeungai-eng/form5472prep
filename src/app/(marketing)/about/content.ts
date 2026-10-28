// Copy for /about — the site's trust page. Kept as data (not JSX) so
// content.test.ts can police it.
//
// Rules (owner, 2026-10-16):
//   - Only facts already established elsewhere in the repo: /security,
//     /data-retention, /privacy, /terms, /editorial-policy, /press,
//     src/lib/services-pages.ts (PROCESS_STEPS, scope), src/lib/llms.ts,
//     src/lib/seo.ts. No invented people, names, credentials, client counts,
//     ratings or awards.
//   - Prices and turnarounds only from src/lib/pricing.ts.
//   - No "licensed", "IRS-approved" or CPA claims about us; no promised
//     outcomes; no tax advice. The trust line is TRUST_LINE, verbatim.
//   - Every section heading is a question; its first paragraph (`answer`) is
//     a standalone answer of at most 60 words.
//   - +1-855-887-7737 (IRS_OGDEN_FAX) is the IRS's fax line, never ours.
// Bump ABOUT_LAST_REVIEWED whenever this copy changes; the page shows it and
// emits it as dateModified.
import {
  EIN_PRICE_CENTS,
  EXTENSION_PRICE_CENTS,
  EXPRESS_TURNAROUND,
  ITIN_PRICE_CENTS,
  MULTI_YEAR_ADDON_CENTS,
  STANDARD_TURNAROUND,
  TIERS,
} from "@/lib/pricing";
import { BRAND_CAPSULES } from "@/lib/faq";
import { IRS_OGDEN_FAX, ORG_EMAIL, organizationNode, SITE_NAME, TRUSTPILOT_PROFILE_URL } from "@/lib/seo";
import { getServicePage, servicePath } from "@/lib/services-pages";
import { formatPrice } from "@/lib/utils";

export const ABOUT_LAST_REVIEWED = "2026-10-26";
export const ABOUT_LAST_REVIEWED_LABEL = "26 October 2026";

export const TRUST_LINE = "Every filing is reviewed by a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN) before it is submitted.";
export const SECURITY_EMAIL = "security@form5472prep.com";
export const FOUNDED = String(organizationNode().foundingDate);

const STD = formatPrice(TIERS.standard.priceCents);
const EXP = formatPrice(TIERS.express.priceCents);
const ADDON = formatPrice(MULTI_YEAR_ADDON_CENTS);
const EIN = formatPrice(EIN_PRICE_CENTS);
const EXT = formatPrice(EXTENSION_PRICE_CENTS);
const ITIN = formatPrice(ITIN_PRICE_CENTS);

export type AboutLink = { label: string; href: string; external?: boolean };

export type AboutSection = {
  id: string;
  question: string;
  answer: string; // <= 60 words, standalone
  points?: string[];
  links?: AboutLink[];
};

// Resolve a /services/* link from services-pages.ts so a renamed slug fails the
// build instead of shipping a 404.
function serviceLink(slug: string, label?: string): AboutLink {
  const page = getServicePage(slug);
  if (!page) throw new Error(`about/content.ts: unknown service slug ${slug}`);
  return { label: label ?? page.h1, href: servicePath(slug) };
}

export const LEAD = `${SITE_NAME} prepares and files IRS Form 5472 with the pro forma Form 1120 for foreign-owned US single-member LLCs. ${TRUST_LINE}`;

export const KEY_FACTS: Array<{ term: string; detail: string }> = [
  { term: "What we file", detail: "IRS Form 5472 with the pro forma Form 1120, for foreign-owned US single-member LLCs (disregarded entities)" },
  { term: "Who it is for", detail: "Non-US owners of US single-member LLCs, plus formation agents, registered agents and accounting firms that file for client LLCs" },
  { term: "Review", detail: TRUST_LINE },
  { term: "Delivery", detail: "Fax to the IRS Ogden PIN Unit, with a timestamped transmission receipt" },
  { term: "Prices", detail: `Standard ${STD}, Express ${EXP}, +${ADDON} per additional past tax year` },
  { term: "Founded", detail: FOUNDED },
  { term: "Contact", detail: ORG_EMAIL },
];

// The six-step flow, as src/lib/services-pages.ts PROCESS_STEPS describes it,
// with the signing step as services-pages.ts states it: the client (or another
// person authorized for the LLC) checks and signs; staff never sign for them.
export const STEPS: Array<{ title: string; body: string }> = [
  {
    title: "Questionnaire",
    body: "You answer guided questions about the LLC, the foreign owner and the year's money movements. It takes about 15 minutes.",
  },
  {
    title: "Package prepared",
    body: "After payment we generate the cover letter, pro forma Form 1120, Form 5472 and Part V supporting statement as one PDF, plus a reasonable cause statement for a late (DIIRSP) filing.",
  },
  {
    title: "Accountant review",
    body: "A PTIN-holding tax accountant checks the package against your answers. If something needs clarifying, we message you on your filing page.",
  },
  {
    title: "You check and sign",
    body: "Signing opens only after the review is approved. You check the reviewed package, then sign it or ask us for a change. The return is the LLC's own, so you or another person authorized for the LLC signs it; our staff never sign for you.",
  },
  {
    title: "Fax to the IRS",
    body: "We fax the signed package to the IRS Ogden PIN Unit. Nothing is sent to the IRS until you have signed.",
  },
  {
    title: "Timestamped receipt",
    body: "You get the timestamped transmission receipt on your filing page. It is proof of what was sent and when, not an IRS acceptance notice.",
  },
];

export const SECTIONS: AboutSection[] = [
  {
    id: "what-we-do",
    question: `What does ${SITE_NAME} do?`,
    answer: `${SITE_NAME} prepares and files IRS Form 5472 with the pro forma Form 1120 for foreign-owned US single-member LLCs. We prepare the package from your answers, a PTIN-holding tax accountant reviews it, you sign it, and we fax it to the IRS Ogden PIN Unit with a timestamped transmission receipt.`,
    points: [
      `Current-year and past-year filings, at ${ADDON} for each additional past tax year.`,
      "Late (DIIRSP) catch-up filings, with a reasonable cause statement.",
      "Filings for dormant LLCs and final-year filings for dissolved LLCs.",
      `EIN application support (${EIN}) and ITIN application support (${ITIN}) when those numbers are genuinely needed.`,
      `Form 7004 extension filing (${EXT} per LLC per tax year) for foreign-owned US LLCs, faxed to the IRS Ogden PIN Unit.`,
      "White-label filing for formation agents, registered agents and accounting firms through our partner program.",
    ],
    links: [
      { label: "Services by situation", href: "/services" },
      serviceLink("late-form-5472-filing-service"),
      { label: "EIN service", href: "/ein" },
      { label: "ITIN service", href: "/itin" },
      { label: "Form 7004 extension service", href: "/form-7004-extension" },
      { label: "Partner program", href: "/partners" },
    ],
  },
  {
    id: "what-we-do-not-do",
    question: `What does ${SITE_NAME} not do?`,
    answer: "We are not a CPA firm or a general tax firm. We prepare and submit forms from the information you give us. We do not give personalised tax advice, tax planning or legal advice, and we do not represent you before the IRS.",
    points: [
      "We do not prepare Form 1065, a full Form 1120 for an LLC taxed as a corporation, Form 1040-NR or state returns.",
      "We do not keep books. Form 7004 extension filing is a separate paid service, and it must be ordered before the return's original due date.",
      "We are not affiliated with the IRS or any government agency.",
      "We do not guarantee that the IRS will accept a filing, or that a reasonable cause statement will avoid or reduce a penalty.",
      "The accuracy of the information you submit stays with you.",
    ],
    links: [{ label: "Terms of service", href: "/terms" }],
  },
  {
    id: "how-a-filing-works",
    question: "How does a filing work, step by step?",
    answer: "A filing moves through six steps. You answer a guided questionnaire, we prepare the package, a tax accountant reviews it, you check and sign it, we fax it to the IRS Ogden PIN Unit, and you receive the timestamped transmission receipt. Nothing is sent to the IRS until you have signed.",
  },
  {
    id: "who-reviews",
    question: "Who reviews each filing?",
    answer: `${TRUST_LINE} The accountant checks the prepared package against your answers, and signing opens only after that review is approved. The same tax accountant who reviews customer packages informs the accuracy of the guides we publish.`,
  },
  // Brand capsules (src/lib/faq.ts): the same words as /, /pricing and /faq.
  {
    id: "automated",
    question: BRAND_CAPSULES.automated.question,
    answer: BRAND_CAPSULES.automated.answer,
  },
  {
    id: "legit",
    question: BRAND_CAPSULES.legit.question,
    answer: BRAND_CAPSULES.legit.answer,
    links: [
      { label: "Trustpilot reviews", href: TRUSTPILOT_PROFILE_URL, external: true },
      { label: "Security", href: "/security" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
  {
    id: "pricing",
    question: BRAND_CAPSULES.cost.question,
    answer: BRAND_CAPSULES.cost.answer,
    points: [
      `EIN application service: ${EIN}.`,
      `ITIN application service: ${ITIN}.`,
    ],
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Form 5472 filing services compared", href: "/compare/form-5472-filing-services" },
    ],
  },
  {
    id: "express",
    question: BRAND_CAPSULES.express.question,
    answer: BRAND_CAPSULES.express.answer,
  },
  {
    id: "data-protection",
    question: "How is my data protected?",
    answer: "Data is encrypted in transit with TLS 1.2 or higher, and encrypted at rest in our managed database and file storage. Card details are entered with Stripe and never reach our servers. Production systems and data are accessible only to authorized personnel.",
    points: [
      "Bank statement files are processed in memory and not stored, and we never store banking credentials.",
      "An owner's SSN is encrypted as soon as it is saved. We never ask for an SSN, ITIN or bank details by email.",
      "Vendor consoles require two-factor authentication.",
      "Fax receipts and signature records are kept for 7 years from the filing date as proof of filing.",
      "Deletion requests are processed within 30 days.",
      "If a data breach is confirmed, affected customers are notified by email within 72 hours.",
    ],
    links: [
      { label: "Security", href: "/security" },
      { label: "Data retention schedule", href: "/data-retention" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
  {
    id: "editorial-policy",
    question: "How are your guides sourced and reviewed?",
    answer: "Our guides are built on primary sources: the IRS Instructions for Form 5472, the IRS Form 5472 page, the Internal Revenue Code (chiefly IRC § 6038A) and other official IRS and Treasury publications. We do not publish statistics, studies or quotes we cannot verify.",
    points: [
      "Guides on filing mechanics are reviewed against current IRS guidance before publication.",
      "Cornerstone guides are reviewed at least every few months, and immediately when a relevant IRS rule changes.",
      "Each guide shows a visible Last updated date, also recorded in its structured data.",
      `Report an error to ${ORG_EMAIL}. We verify it against the primary source and correct confirmed errors promptly.`,
      "Guides are educational and do not constitute tax or legal advice.",
    ],
    links: [
      { label: "Editorial policy", href: "/editorial-policy" },
      { label: "Guides", href: "/blog" },
      { label: "IRS Instructions for Form 5472", href: "https://www.irs.gov/instructions/i5472", external: true },
    ],
  },
  {
    id: "founded",
    question: `When was ${SITE_NAME} founded?`,
    answer: `${SITE_NAME} was founded in ${FOUNDED}. It focuses on one filing profile: the Form 5472 and pro forma Form 1120 package for a foreign-owned US single-member LLC, which uses the IRS's special fax or mail instructions rather than ordinary corporate e-file.`,
  },
  {
    id: "contact",
    question: `How can I contact ${SITE_NAME}?`,
    answer: `Email ${ORG_EMAIL} with questions about a filing, pricing or our service, or use the contact form. Report a suspected security issue to ${SECURITY_EMAIL}. The fax number ${IRS_OGDEN_FAX} on our pages belongs to the IRS Ogden PIN Unit; it is not our phone number.`,
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    id: "reviews-and-press",
    question: "Where can I find reviews and press information?",
    answer: "Customer reviews are on our Trustpilot profile. The press kit has a short blurb, boilerplate, key facts, logo files and brand colours. Our sourced price comparison shows how other Form 5472 services price the same filing, with each competitor price copied from its own page.",
    links: [
      { label: "Trustpilot reviews", href: TRUSTPILOT_PROFILE_URL, external: true },
      { label: "Press kit", href: "/press" },
      { label: "Compare providers", href: "/compare" },
      { label: "2026 price comparison", href: "/compare/form-5472-filing-services" },
    ],
  },
];

export const CTA_TEXT = `${STD} ready in ${STANDARD_TURNAROUND}, or ${EXP} ready to sign within ${EXPRESS_TURNAROUND}. Same filing either way: accountant-reviewed, and faxed to the IRS with a timestamped receipt once you sign.`;
