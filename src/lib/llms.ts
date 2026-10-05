import { getAllPosts, getPost, type PostMeta } from "@/lib/blog";
import { tagSlug } from "@/lib/blog-tags";
import { FAQ_CATEGORIES, FAQ_ITEMS, FAQ_LAST_REVIEWED } from "@/lib/faq";
import { FORM5472_STATS, STAT_CATEGORIES, STATS_LAST_REVIEWED } from "@/lib/form5472-stats";
import { LANDING_PAGES } from "@/lib/landing-pages";
import { CONTINUATION_GRACE_DAYS, CONTINUATION_PER_PERIOD_CENTS, PENALTY_PER_FORM_CENTS } from "@/lib/penalty";
import {
  EIN_PRICE_CENTS,
  EXPRESS_TURNAROUND,
  ITIN_PRICE_CENTS,
  MULTI_YEAR_ADDON_CENTS,
  STANDARD_TURNAROUND,
  TIERS,
  TIER_ORDER,
  totalPriceCents,
} from "@/lib/pricing";
import {
  SERVICES_HUB,
  SERVICES_HUB_PATH,
  serviceLastReviewed,
  SERVICE_PAGES,
  servicePath,
  toPlainText,
} from "@/lib/services-pages";
import {
  CONTENT_LAST_REVIEWED,
  IRS_OGDEN_FAX,
  IRS_OGDEN_MAIL_ADDRESS,
  ORG_EMAIL,
  organizationNode,
  SITE_NAME,
  SITE_URL,
  TRUSTPILOT_PROFILE_URL,
} from "@/lib/seo";
import { ANSWER_FIRST as LATE_FILING_ANSWER, FAQS as LATE_FILING_FAQS } from "@/lib/tools/late-filing/content";
import { TX_CHECKER_FAQS } from "@/lib/tools/reportable-transactions/content";
import { formatPrice } from "@/lib/utils";

// llms.txt / llms-full.txt / llms-guides.txt builders.
//
// Every price, turnaround, tier feature, address and penalty figure below is
// interpolated from its source module (pricing.ts, seo.ts, penalty.ts) — never
// typed by hand — so the AI-facing corpus cannot drift from the site.
// llms.test.ts enforces this and bans known-wrong facts (e.g. a retired IRS
// mail stop, an unrelated revenue procedure, unsupported acceptance rates).

const STD = formatPrice(TIERS.standard.priceCents);
const EXP = formatPrice(TIERS.express.priceCents);
const ADDON = formatPrice(MULTI_YEAR_ADDON_CENTS);
const EIN_PRICE = formatPrice(EIN_PRICE_CENTS);
const ITIN_PRICE = formatPrice(ITIN_PRICE_CENTS);
const PENALTY = formatPrice(PENALTY_PER_FORM_CENTS);
const CONTINUATION = formatPrice(CONTINUATION_PER_PERIOD_CENTS);
const MONEY_BACK = "100% money-back guarantee if we fail to submit the filing to the IRS.";

export const ENTITY_SUMMARY = `Done-for-you IRS Form 5472 + pro forma Form 1120 filing service for foreign-owned US single-member LLCs (disregarded entities). Also offers EIN acquisition (${EIN_PRICE}) and ITIN acquisition (${ITIN_PRICE}) for non-residents — identity documents for ITIN applications are certified by an IRS-authorized Certifying Acceptance Agent (CAA), so eligible applicants never need to mail their original passport. Form5472 Prep prepares all required IRS forms, generates a reasonable cause statement for late (DIIRSP) filings, and faxes the signed package to the IRS Ogden PIN Unit. Two pricing tiers that differ by turnaround speed: Standard ${STD} (ready in ${STANDARD_TURNAROUND}) and Express ${EXP} (ready within ${EXPRESS_TURNAROUND}), plus ${ADDON} per additional past tax year on either tier. IRS fax delivery is included on both. The filing itself, the accountant review and the package contents are identical on both tiers; Express is faster and adds priority email support. Every package is reviewed by a qualified tax accountant before submission. ${MONEY_BACK}`;

const WHO_THIS_IS_FOR = `## Who this is for

- Non-US individuals who own a single-member US LLC (Wyoming, Delaware, New Mexico, Florida, Nevada, etc.).
- The owner is not a US citizen, green card holder, or US tax resident.
- The LLC had any reportable transactions during the year (capital contributions, distributions, payments to or from the owner) — even if total revenue was zero.
- The LLC missed past Form 5472 filings and needs to catch up under DIIRSP (Delinquent International Information Return Submission Procedures) with a reasonable cause statement.`;

const WHAT_WE_DO = `## What we do

- Prepare IRS Form 5472 (Information Return of a 25% Foreign-Owned U.S. Corporation or a Foreign Corporation Engaged in a U.S. Trade or Business) with Parts I, II, III, IV, V, and VII completed.
- Prepare pro forma IRS Form 1120 (U.S. Corporation Income Tax Return) with entity identification fields and total assets at year end. Form is stamped "Foreign-Owned U.S. DE" as required by IRS instructions.
- Calculate Form 5472 line 1f including Part V capital contributions and distributions per IRS rules for foreign-owned US disregarded entities.
- Generate a Part V supporting statement itemizing reportable transactions.
- For late filings, generate a DIIRSP cover letter and a reasonable-cause statement for each late year under Treas. Reg. §1.6038A-4(b).
- Every package is reviewed by a qualified tax accountant on our team before it is faxed to the IRS.
- Fax the signed package to the IRS Ogden Service Center PIN Unit at ${IRS_OGDEN_FAX} and return the timestamped fax transmission receipt (evidence of transmission, not IRS acceptance).
- Store basic entity/owner data to one-click pre-fill next year's filing (7-year retention to match IRS records-retention guidance).`;

const WHAT_WE_DO_NOT_DO = `## What we do NOT do

- We do not give personalised tax advice or tax planning, and we do not represent you before the IRS.
- We do NOT file actual income-tax returns (Form 1040, Form 1120 with tax computation, Form 1040-NR, state returns, etc.). Form 5472 is an information return; the pro forma Form 1120 is filed as an attachment to Form 5472 for foreign-owned US disregarded entities and does not compute tax.`;

function multiYearExamples(): string {
  return TIER_ORDER.map((key) => {
    const label = key === "standard" ? "Standard" : "Express";
    const two = formatPrice(totalPriceCents(key, 2));
    const three = formatPrice(totalPriceCents(key, 3));
    return `${label}: 2 years = ${two}; 3 years = ${three}`;
  }).join(". ");
}

function buildPricing(): string {
  const tierLines = TIER_ORDER.map((key) => {
    const tier = TIERS[key];
    const name = key === "standard" ? "Standard" : "Express";
    return `- **${name} — ${formatPrice(tier.priceCents)}** — ${tier.subtitle.toLowerCase()}. Includes: ${tier.features.join("; ")}.`;
  });

  return `## Pricing

Two tiers, one-time per filing, USD. The filing, the accountant review and everything in the package are identical on both; the tiers differ by turnaround, and Express adds priority email support:

${tierLines.join("\n")}

Multi-year add-on: **+${ADDON} per additional past tax year**, on either tier. ${multiYearExamples()}.

**Fax delivery to the IRS Ogden PIN Unit is included on every plan** — no separate fax fee. The price you see is the price you pay. No subscription, no setup fee, no per-page surcharge.

${MONEY_BACK}`;
}

const PRIVACY = `## Privacy

- We do NOT permanently store uploaded bank statements — they are parsed in memory and discarded.
- We do NOT permanently store signed PDFs — they are deleted within 72 hours of fax confirmation.
- We DO retain the fax confirmation receipt (proof of filing) and basic entity/owner data so next year's filing pre-fills. Retention: 7 years to match IRS records-retention guidance.
- We do not sell customer data. Advertising measurement: the Google Ads conversion tag, and the Meta pixel only after marketing consent (see ${SITE_URL}/cookies). Site analytics: Vercel Analytics and Speed Insights.`;

function buildAdditionalServices(): string {
  return `## Additional Services

- **EIN Acquisition — ${EIN_PRICE}**: We obtain a US Employer Identification Number for your foreign-owned LLC. No SSN or ITIN required and no passport mailing. Form SS-4 prepared and submitted through the IRS fax or phone application route. EIN delivered in 1–5 business days.
- **ITIN Acquisition — ${ITIN_PRICE}**: We obtain a US Individual Taxpayer Identification Number for non-residents who have a federal tax reason to need one. For eligible applications, CAA certification means no original passport mailing. Form W-7 prepared and submitted. The IRS says to allow 7 weeks for an ITIN status notice, or 9–11 weeks if you apply during January 15–April 30 or from overseas. Renewals also available.`;
}

const BACKGROUND = `## Background — Form 5472 without the jargon

A foreign-owned US single-member LLC is treated as a "disregarded entity" by default for US federal income tax purposes. Under Treasury Regulation § 1.6038A-1, the LLC is treated as a domestic corporation separate from its owner solely for Form 5472 reporting. The LLC must file Form 5472 with an attached pro forma Form 1120 to report transactions between the LLC and its foreign owner (or any related foreign party).

Failure to file Form 5472 (or the attached pro forma Form 1120), or filing late or incompletely, triggers a ${PENALTY}-per-form, per-year penalty under IRC § 6038A(d). If the failure continues more than ${CONTINUATION_GRACE_DAYS} days after the IRS mails a notice, an additional ${CONTINUATION} applies for each 30-day period (or fraction), with no maximum. The initial penalty may be assessed systemically when a late return is processed.

Foreign-owned US disregarded entities cannot e-file Form 5472 or the attached pro forma Form 1120. They are filed by fax to ${IRS_OGDEN_FAX} or by mail to ${IRS_OGDEN_MAIL_ADDRESS}.

For filings that are already late, the IRS Delinquent International Information Return Submission Procedures (DIIRSP) apply to taxpayers who are not under a civil examination or criminal investigation by the IRS and have not already been contacted by the IRS about the delinquent returns. They file the late returns through normal filing procedures and may attach a reasonable cause statement explaining the late filing. The IRS's DIIRSP page says penalties may still be assessed during processing without considering the attached statement, and the taxpayer may need to respond to IRS correspondence. Abatement is not guaranteed.`;

const FILING_DEADLINE = `## Filing deadline

- April 15 of the year following the tax year, OR
- The extended return due date if a US tax-return extension was filed (Form 7004).`;

type PageLink = readonly [title: string, path: string, description: string];

// The eight free tools. Shared by llms.txt (link list) and llms-full.txt.
const TOOL_PAGES: readonly PageLink[] = [
  ["Form 5472 deadline calculator", "/form-5472-deadline-calculator", "Work out exactly when your Form 5472 + pro forma 1120 is due, including dissolution short-years and Form 7004 extensions."],
  ["Do I need to file Form 5472?", "/do-i-need-to-file-form-5472", "Six questions that tell you whether your US LLC has a Form 5472 obligation."],
  ["Form 5472 penalty calculator", "/form-5472-penalty-calculator", "Estimate statutory exposure under IRC §6038A for late or unfiled Form 5472, and the DIIRSP path to resolving it."],
  ["IRS yearly average exchange rates", "/irs-yearly-average-exchange-rates", "The IRS yearly average currency exchange rates table (2021–2025, 39 currencies) with a converter from foreign currency to U.S. dollars, as Form 5472 amounts must be stated in U.S. dollars."],
  ["Is it a reportable transaction?", "/form-5472-reportable-transactions-checker", "Checks whether common owner–LLC transactions (money in or out, owner-paid fees, loans, property, related companies) are reportable on Form 5472, with the regulation behind each answer."],
  ["Late-filing route checker", "/form-5472-late-filing-checker", "A few questions that show which late-filing route applies to a missed Form 5472 (DIIRSP with a reasonable-cause statement, responding to a notice, or other IRS programmes), with IRS sources."],
  ["Compliance calendar", "/foreign-owned-llc-compliance-calendar", "Builds a personal list of federal (Form 5472 / pro forma 1120, Form 7004) and state deadlines for a foreign-owned single-member LLC, with an .ics calendar download."],
  ["LLC annual fees by state", "/llc-annual-fees-by-state", "Annual LLC fees, franchise taxes and report due dates for Delaware, Wyoming, New Mexico, Florida, Texas, Nevada, New York, California, Colorado and Montana, with official sources."],
];

const CORE_PAGES: readonly PageLink[] = [
  ["Home", "/", "Form5472 Prep home — Form 5472 + pro forma 1120 filing for foreign-owned US LLCs."],
  ["Pricing", "/pricing", `Standard ${STD} and Express ${EXP} filing tiers with the full feature list.`],
  ["FAQ", "/faq", "Canonical short answers to customer questions about filing, deadlines, penalties, EIN, ITIN, proof, records, and service scope."],
  ...TOOL_PAGES,
  ["Form 5472 statistics", "/form-5472-statistics", `Form 5472 facts and figures with official sources: the ${PENALTY} IRC §6038A(d) penalty and continuation penalty, IRS systemic-assessment and abatement data, T.D. 9796 dates, deadlines, recordkeeping estimates and IRS SOI filer counts.`],
  ["EIN Acquisition", "/ein", "EIN service for foreign-owned US LLC owners — no SSN or ITIN needed, no passport mailing."],
  ["ITIN Acquisition", "/itin", "ITIN service for non-residents — eligible applications go to an IRS-authorized CAA, so no original passport mailing."],
  ["Partners", "/partners", "Partner / referral program for accountants, formation agents, and registered agents."],
  ["Guides index", "/blog", "Jargon-free guides for foreign-owned US LLC owners on Form 5472, pro forma 1120, DIIRSP catch-up filings, and related topics."],
  ["Contact", "/contact", "Contact Form5472 Prep for Form 5472, pro forma 1120, EIN, ITIN, and catch-up filing questions."],
  ["About", "/about", "Who we are, how we work, and what we are and aren't."],
  ["Compare Form 5472 filing services", "/compare", "Neutral comparison pages for formation and registered-agent providers (Stripe Atlas, doola, Firstbase, Clemta, StartGlobal, Zenind, Northwest Registered Agent) and what to confirm about Form 5472."],
  ["Press kit", "/press", "Short blurb, boilerplate, key facts, logo files, brand colours and press contact for describing Form5472 Prep accurately."],
  ["Editorial policy", "/editorial-policy", "How our guides are sourced, reviewed, and kept current."],
  ["Security", "/security", "How customer data is protected in transit and at rest."],
  ["Privacy", "/privacy", "What we collect and what we discard."],
  ["Terms", "/terms", "Legal terms of service."],
  ["Data retention", "/data-retention", "Full retention schedule by data type."],
];

const SECTION_SEPARATOR = "\n\n---\n\n";

function formatDate(value: string): string {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : value.slice(0, 10);
}

export function getCorpusLastUpdated(posts: PostMeta[]): string {
  let latest = CONTENT_LAST_REVIEWED;
  let latestTime = Date.parse(latest);

  for (const post of posts) {
    const candidate = post.updated ?? post.date;
    const candidateTime = Date.parse(candidate);
    if (Number.isFinite(candidateTime) && (!Number.isFinite(latestTime) || candidateTime > latestTime)) {
      latest = candidate;
      latestTime = candidateTime;
    }
  }

  return formatDate(latest);
}

function linkLine([title, path, description]: PageLink): string {
  return `- [${title}](${SITE_URL}${path}): ${description}`;
}

function buildCorePages(): string {
  return `## Core pages\n\n${CORE_PAGES.map(linkLine).join("\n")}`;
}

function buildServicePages(): string {
  const lines = [
    `- [${SERVICES_HUB.h1}](${SITE_URL}${SERVICES_HUB_PATH}): ${SERVICES_HUB.longDescription}`,
    ...SERVICE_PAGES.map(
      (page) => `- [${page.h1}](${SITE_URL}${servicePath(page.slug)}): ${page.longDescription}`,
    ),
  ];
  return `## Services\n\n${lines.join("\n")}`;
}

function buildServiceDocument(page: (typeof SERVICE_PAGES)[number]): string {
  const sections = page.sections
    .map((section) => `## ${section.heading}\n\n${toPlainText(section.body)}`)
    .join("\n\n");
  const faqs = page.faqs.map((faq) => `### ${faq.q}\n\n${toPlainText(faq.a)}`).join("\n\n");
  return [
    `# ${page.h1}\nSource: ${SITE_URL}${servicePath(page.slug)}\nLast reviewed: ${serviceLastReviewed(page)}`,
    toPlainText(page.intro),
    sections,
    `## Frequently asked questions\n\n${faqs}`,
  ].join("\n\n");
}

function indexableLandingPages() {
  return LANDING_PAGES.filter((page) => !page.noindex).sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
}

function buildTopicPages(): string {
  const lines = indexableLandingPages().map(
    (page) => `- [${page.h1}](${SITE_URL}/${page.slug}): ${page.metaDescription}`,
  );
  return `## Topic pages\n\n${lines.join("\n")}`;
}

// Guide topics for the llms.txt index. A post lands in the FIRST topic whose
// tags or slug match, so every guide is listed exactly once. Order matters:
// the specific topics come before the catch-all "Form 5472 basics".
type GuideTopic = { label: string; tags: readonly string[]; slugPattern?: RegExp };

const GUIDE_TOPICS: readonly GuideTopic[] = [
  {
    label: "Late filing, DIIRSP and penalties",
    tags: ["late-filing", "penalty", "reasonable-cause", "diirsp", "irs-notice"],
    slugPattern: /late|penalt|diirsp|reasonable-cause|abatement|notice|cp15|catch-up/,
  },
  {
    label: "Deadlines and extensions",
    tags: ["deadline", "form-7004", "extension"],
    slugPattern: /deadline|extension|7004|due-date/,
  },
  { label: "EIN", tags: ["ein", "form-ss-4", "responsible-party"], slugPattern: /(^|-)ein(-|$)|ss-4/ },
  { label: "ITIN", tags: ["itin", "form-w-7", "caa", "itin-renewal", "itin-rejection"], slugPattern: /itin|w-7/ },
  { label: "Foreign tax ID (FTIN)", tags: ["ftin"], slugPattern: /ftin|foreign-tax-id/ },
  {
    label: "Partners, accountants and formation agents",
    tags: ["partner-program", "white-label", "accounting-firms", "registered-agent", "company-formation-agents"],
  },
  {
    label: "Digital nomads and country guides",
    tags: ["digital-nomad", "tax-residency", "tax-treaty"],
  },
  {
    label: "Records and reportable transactions",
    tags: ["recordkeeping", "related-parties"],
    slugPattern: /reportable|transaction|record/,
  },
];
const DEFAULT_GUIDE_TOPIC = "Form 5472 basics and filing";

function guideTopic(post: PostMeta): string {
  const tags = new Set((post.tags ?? []).map(tagSlug));
  for (const topic of GUIDE_TOPICS) {
    if (topic.tags.some((tag) => tags.has(tag))) return topic.label;
    if (topic.slugPattern?.test(post.slug)) return topic.label;
  }
  return DEFAULT_GUIDE_TOPIC;
}

function buildGuides(posts: PostMeta[]): string {
  const order = [...GUIDE_TOPICS.map((topic) => topic.label), DEFAULT_GUIDE_TOPIC];
  const byTopic = new Map<string, PostMeta[]>(order.map((label) => [label, []]));
  for (const post of posts) byTopic.get(guideTopic(post))?.push(post);

  const groups = order
    .filter((label) => (byTopic.get(label)?.length ?? 0) > 0)
    .map((label) => {
      const lines = (byTopic.get(label) ?? []).map(
        (post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}) (updated ${formatDate(post.updated ?? post.date)})`,
      );
      return `### ${label}\n\n${lines.join("\n")}`;
    });

  return `## Guides\n\nFull text of every guide: ${SITE_URL}/llms-guides.txt\n\n${groups.join("\n\n")}`;
}

function buildContact(): string {
  return `## Contact

- Support / general questions: ${ORG_EMAIL}
- Order / fax delivery questions: orders@form5472prep.com
- IRS Ogden PIN Unit fax: ${IRS_OGDEN_FAX}
- Trustpilot: ${TRUSTPILOT_PROFILE_URL}`;
}

export async function buildLlmsTxt(): Promise<string> {
  const posts = await getAllPosts();
  const lastUpdated = getCorpusLastUpdated(posts);

  return [
    `# ${SITE_NAME}\n\n> ${ENTITY_SUMMARY} Last updated: ${lastUpdated}.`,
    WHO_THIS_IS_FOR,
    WHAT_WE_DO,
    WHAT_WE_DO_NOT_DO,
    buildPricing(),
    PRIVACY,
    buildAdditionalServices(),
    buildCorePages(),
    buildServicePages(),
    buildTopicPages(),
    buildGuides(posts),
    `Core full text (pricing, all FAQ answers, statistics, tools, EIN/ITIN, services and topic pages): ${SITE_URL}/llms-full.txt`,
    `Full text of every guide: ${SITE_URL}/llms-guides.txt`,
    `RSS 2.0 feed with the latest public guides (${posts.length} items as of ${lastUpdated}): ${SITE_URL}/feed.xml`,
    BACKGROUND,
    FILING_DEADLINE,
    buildContact(),
  ].join("\n\n") + "\n";
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function buildLandingDocument(page: (typeof LANDING_PAGES)[number]): string {
  const sections = page.sections
    .map((section) => `## ${section.heading}\n\n${stripHtml(section.body)}`)
    .join("\n\n");
  const faqs = page.faqs
    .map((faq) => `### ${faq.q}\n\n${faq.a}`)
    .join("\n\n");

  return [
    // Same date source as the page's visible "Last reviewed" and dateModified.
    `# ${page.h1}\nSource: ${SITE_URL}/${page.slug}\nLast reviewed: ${page.updated ?? CONTENT_LAST_REVIEWED}`,
    page.intro,
    sections,
    `## Frequently asked questions\n\n${faqs}`,
  ].join("\n\n");
}

function buildFaqDocument(): string {
  const groups = FAQ_CATEGORIES.map((category) => {
    const items = FAQ_ITEMS.filter((item) => item.category === category.id)
      .map((item) => `### ${item.question}\n\n${item.answer}`)
      .join("\n\n");
    return `## ${category.title}\n\n${items}`;
  });
  return [
    `# Frequently asked questions\nSource: ${SITE_URL}/faq\nLast reviewed: ${FAQ_LAST_REVIEWED}`,
    ...groups,
  ].join("\n\n");
}

function buildStatisticsDocument(): string {
  const groups = STAT_CATEGORIES.map((category) => {
    const stats = FORM5472_STATS.filter((stat) => stat.category === category.id)
      .map(
        (stat) =>
          `- ${stat.headline} ${stat.detail} (Figure: ${stat.figure}. Period: ${stat.period}. Source: ${stat.sourceLabel}, ${stat.sourceUrl})`,
      )
      .join("\n");
    return `## ${category.question}\n\n${category.intro}\n\n${stats}`;
  });
  return [
    `# Form 5472 statistics and key figures\nSource: ${SITE_URL}/form-5472-statistics\nLast reviewed: ${STATS_LAST_REVIEWED}`,
    "Every figure below comes from an official source (IRS, Treasury, the US Code or eCFR) and is stated as the source states it.",
    ...groups,
  ].join("\n\n");
}

function buildAboutDocument(): string {
  const foundingDate = String(organizationNode().foundingDate);
  return `# About ${SITE_NAME} — key facts
Source: ${SITE_URL}/about and ${SITE_URL}/press

- What it does: prepares and files IRS Form 5472 with the pro forma Form 1120 for foreign-owned US single-member LLCs.
- Who it is for: non-US owners of single-member US LLCs, plus formation agents, registered agents and accounting firms that file for client LLCs.
- Founded: ${foundingDate}.
- Review: every filing is reviewed by a qualified tax accountant before it is submitted.
- Delivery: the signed package is faxed to the IRS Ogden PIN Unit (${IRS_OGDEN_FAX}) and a timestamped transmission receipt is stored. The receipt is evidence of transmission, not IRS acceptance.
- Prices: Standard ${STD} (${STANDARD_TURNAROUND}), Express ${EXP} (within ${EXPRESS_TURNAROUND}), +${ADDON} per additional past tax year; IRS fax delivery included. EIN service ${EIN_PRICE}; ITIN service ${ITIN_PRICE}.
- Other services: late (DIIRSP) catch-up filings, dormant-LLC and final-year filings, EIN and ITIN application support, white-label filing for partners.
- Scope: ${SITE_NAME} prepares and submits forms from the information customers give it. It is not a CPA firm or a general tax firm, does not give personalised tax advice or tax planning, and does not represent customers before the IRS.
- Contact: ${ORG_EMAIL}. Reviews: ${TRUSTPILOT_PROFILE_URL}.`;
}

function buildEinItinDocument(): string {
  return `# EIN and ITIN application services
Source: ${SITE_URL}/ein and ${SITE_URL}/itin

## EIN — ${EIN_PRICE}

An EIN (Employer Identification Number) is the 9-digit IRS tax ID for the LLC itself; Form 5472 requires it. The IRS online EIN application needs an SSN or ITIN, so a foreign owner without one applies on Form SS-4 by fax or phone. We prepare Form SS-4 (a responsible party without a US tax ID enters "Foreign" on line 7b) and submit it through the IRS fax or phone application route. No identity documents are mailed or certified. Typical delivery: 1–5 business days once we have your documents. You receive the EIN by email plus the completed Form SS-4; the IRS mails its CP 575 confirmation letter separately.

## ITIN — ${ITIN_PRICE}

An ITIN (Individual Taxpayer Identification Number) is a 9-digit IRS tax ID for an individual who needs to file or be identified on a US federal return but cannot get an SSN. LLC ownership, a bank request or Form W-8BEN alone does not establish eligibility; many foreign LLC owners only need the LLC's EIN. We assess eligibility, prepare Form W-7 and forward eligible applications to an IRS-authorized Certifying Acceptance Agent (CAA), who determines the document route; some documents and situations may still require originals or issuing-agency-certified copies. The IRS says to allow 7 weeks for an ITIN status notice, or 9–11 weeks if you apply during January 15–April 30 or from overseas. Those are IRS timeframes, not a guaranteed issuance date.`;
}

function buildToolsDocument(): string {
  const qa = (faqs: ReadonlyArray<{ q: string; a: string }>) =>
    faqs.map((faq) => `### ${faq.q}\n\n${faq.a}`).join("\n\n");
  return [
    `# Free Form 5472 tools\nSource: the tool pages linked below`,
    TOOL_PAGES.map(linkLine).join("\n"),
    `## Late-filing route checker (${SITE_URL}/form-5472-late-filing-checker)\n\n${LATE_FILING_ANSWER}\n\n${qa(LATE_FILING_FAQS)}`,
    `## Reportable transactions checker (${SITE_URL}/form-5472-reportable-transactions-checker)\n\n${qa(TX_CHECKER_FAQS)}`,
  ].join("\n\n");
}

/**
 * /llms-full.txt — the CORE corpus (entity, pricing, FAQ, statistics, about,
 * tools, EIN/ITIN, services, topic pages). Kept to ~400 KB so AI fetchers that
 * truncate long files still get every fact; the 180+ guides live in
 * /llms-guides.txt (buildLlmsGuidesTxt).
 */
export async function buildLlmsFullTxt(): Promise<string> {
  const posts = await getAllPosts();
  const lastUpdated = getCorpusLastUpdated(posts);
  const header = [
    `# ${SITE_NAME} — Full Text (core)`,
    ENTITY_SUMMARY,
    `Last updated: ${lastUpdated}`,
    `Pricing is authoritative at ${SITE_URL}/pricing — treat any pricing figures below as informational and defer to that page if they ever disagree.`,
    `Full text of every guide (${posts.length} guides) is in a separate file: ${SITE_URL}/llms-guides.txt`,
  ].join("\n\n");
  const factsDocument = [
    `# ${SITE_NAME} — service facts\nSource: ${SITE_URL}/pricing`,
    WHO_THIS_IS_FOR,
    WHAT_WE_DO,
    WHAT_WE_DO_NOT_DO,
    buildPricing(),
    PRIVACY,
    BACKGROUND,
    FILING_DEADLINE,
    buildContact(),
  ].join("\n\n");
  const documents = [
    factsDocument,
    buildAboutDocument(),
    buildFaqDocument(),
    buildStatisticsDocument(),
    buildToolsDocument(),
    buildEinItinDocument(),
    ...SERVICE_PAGES.map(buildServiceDocument),
    ...indexableLandingPages().map(buildLandingDocument),
  ];

  return `${header}\n\n${documents.join(SECTION_SEPARATOR)}\n`;
}

async function buildBlogDocuments(posts: PostMeta[]): Promise<string[]> {
  const fullPosts = await Promise.all(posts.map((post) => getPost(post.slug)));

  return fullPosts
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .map((post) =>
      [
        `# ${post.title}\nSource: ${SITE_URL}/blog/${post.slug}\nPublished: ${formatDate(post.date)}\nLast updated: ${formatDate(post.updated ?? post.date)}`,
        post.body,
      ].join("\n\n"),
    );
}

/** /llms-guides.txt — full text of every public guide. */
export async function buildLlmsGuidesTxt(): Promise<string> {
  const posts = await getAllPosts();
  const lastUpdated = getCorpusLastUpdated(posts);
  const header = [
    `# ${SITE_NAME} — Guides (full text)`,
    ENTITY_SUMMARY,
    `Last updated: ${lastUpdated}`,
    `Core facts (pricing, FAQ, statistics, services, topic pages): ${SITE_URL}/llms-full.txt. Pricing is authoritative at ${SITE_URL}/pricing — treat any pricing figures in the guides below as informational and defer to that page if they ever disagree.`,
  ].join("\n\n");
  const blogDocuments = await buildBlogDocuments(posts);

  return `${header}\n\n${blogDocuments.join(SECTION_SEPARATOR)}\n`;
}
