import { getAllPosts, getPost, type PostMeta } from "@/lib/blog";
import { LANDING_PAGES } from "@/lib/landing-pages";
import {
  CONTENT_LAST_REVIEWED,
  IRS_OGDEN_FAX,
  ORG_EMAIL,
  SITE_NAME,
  SITE_URL,
  TRUSTPILOT_PROFILE_URL,
} from "@/lib/seo";

export const ENTITY_SUMMARY =
  "Done-for-you IRS Form 5472 + pro forma Form 1120 filing service for foreign-owned US single-member LLCs (disregarded entities). Also offers EIN acquisition ($149) and ITIN acquisition ($349) for non-residents — as an IRS-authorized Certifying Acceptance Agent (CAA), we certify identity documents so applicants never need to mail their original passport. Form5472 Prep prepares all required IRS forms, generates a reasonable cause statement for late (DIIRSP) filings, and faxes the signed package to the IRS Ogden PIN Unit. Two pricing tiers that differ only by turnaround speed: Standard $149 (ready in 5-7 business days) and Express $199 (ready within 3 business days), plus $99 per additional past tax year on either tier. IRS fax delivery is included on both. The filing itself, the accountant review and the package contents are identical on both tiers — only the speed differs. Every package is reviewed by a qualified tax accountant before submission. 100% money-back guarantee if we fail to submit.";

const WHO_THIS_IS_FOR = `## Who this is for

- Non-US individuals who own a single-member US LLC (Wyoming, Delaware, New Mexico, Florida, Nevada, etc.).
- The owner is not a US citizen, green card holder, or US tax resident.
- The LLC had any reportable transactions during the year (capital contributions, distributions, payments to or from the owner) — even if total revenue was zero.
- The LLC missed past Form 5472 filings and needs to catch up under DIIRSP (Delinquent International Information Return Submission Procedure) with a reasonable cause statement.`;

const WHAT_WE_DO = `## What we do

- Prepare IRS Form 5472 (Information Return of a 25% Foreign-Owned U.S. Corporation or a Foreign Corporation Engaged in a U.S. Trade or Business) with Parts I, II, III, IV, V, and VII completed.
- Prepare pro forma IRS Form 1120 (U.S. Corporation Income Tax Return) with entity identification fields and total assets at year end. Form is stamped "Foreign-Owned U.S. DE" as required by IRS instructions.
- Calculate Form 5472 line 1f including Part V capital contributions and distributions per IRS rules for foreign-owned US disregarded entities.
- Generate a Part V supporting statement itemizing reportable transactions.
- For late filings (DIIRSP), generate a cover letter and reasonable cause statement requesting penalty abatement under Rev. Proc. 2020-29.
- Every package is reviewed by a qualified tax accountant on our team before it is faxed to the IRS.
- Fax the signed package to the IRS Ogden Service Center PIN Unit at ${IRS_OGDEN_FAX} and return the fax confirmation receipt as proof of timely filing.
- Store basic entity/owner data to one-click pre-fill next year's filing (7-year retention to match IRS records-retention guidance).`;

const WHAT_WE_DO_NOT_DO = `## What we do NOT do

- We are NOT a CPA firm and do NOT provide tax advice. We prepare and submit your information return as you provide it; we don't render opinions on your specific tax situation.
- We do NOT file actual income-tax returns (Form 1040, Form 1120 with tax computation, Form 1040-NR, state returns, etc.). Form 5472 is an information return; the pro forma Form 1120 is filed as an attachment to Form 5472 for foreign-owned US disregarded entities and does not compute tax.`;

const PRICING = `## Pricing

Two tiers, one-time per filing, USD. They differ **only** by turnaround speed — the filing, the accountant review and everything in the package are identical on both:

- **Standard — $149** — ready in 5-7 business days.
- **Express — $199** — ready within 3 business days.

Both tiers include: Form 5472 + pro forma Form 1120 prepared, reviewed by a qualified tax accountant, IRS fax delivery, filing confirmation, reasonable-cause letter for late / DIIRSP filings, priority email support, and a March email reminder for next year's filing.

Multi-year add-on: **+$99 per additional past tax year**, on either tier. For example, on Standard: filing with 2 past years = $149 + $99 = $248; filing with 3 past years = $149 + $198 = $347. On Express: 2 past years = $199 + $99 = $298; 3 past years = $199 + $198 = $397.

**Fax delivery to the IRS Ogden PIN Unit is included on every plan** — no separate $19/$29 fax fee. The price you see is the price you pay. No subscription, no setup fee, no per-page surcharge.

100% money-back guarantee if we fail to submit the filing to the IRS.`;

const PRIVACY = `## Privacy

- We do NOT permanently store uploaded bank statements — they are parsed in memory and discarded.
- We do NOT permanently store signed PDFs — they are deleted within 72 hours of fax confirmation.
- We DO retain the fax confirmation receipt (proof of filing) and basic entity/owner data so next year's filing pre-fills. Retention: 7 years to match IRS records-retention guidance.
- We do NOT sell or share customer data. We do not run third-party tracking pixels beyond first-party analytics and Google Ads conversion measurement.`;

const ADDITIONAL_SERVICES = `## Additional Services

- **EIN Acquisition — $149**: We obtain a US Employer Identification Number for your foreign-owned LLC. As a CAA we certify your identity — no passport mailing required. Form SS-4 prepared and IRS called on your behalf. EIN delivered in 1–5 business days.
- **ITIN Acquisition — $349**: We obtain a US Individual Taxpayer Identification Number for non-residents who need a US personal tax ID. CAA certification means no original passport mailing. Form W-7 prepared and submitted. Issued in 6–11 weeks. Renewals also available.`;

const BACKGROUND = `## Background — Form 5472 without the jargon

A foreign-owned US single-member LLC is treated as a "disregarded entity" by default for US federal income tax purposes. Under Treasury Regulation § 1.6038A-1, the LLC is treated as a domestic corporation separate from its owner solely for Form 5472 reporting. The LLC must file Form 5472 with an attached pro forma Form 1120 to report transactions between the LLC and its foreign owner (or any related foreign party).

Failure to file Form 5472 (or the attached pro forma Form 1120), or filing late or incompletely, triggers a $25,000-per-form, per-year penalty under IRC § 6038A(d). The penalty is automatically assessed by the IRS. Continued failure after IRS notice adds another $25,000 per 30-day period.

Foreign-owned US disregarded entities cannot e-file Form 5472 or the attached pro forma Form 1120. They are filed by mail or fax to the IRS Ogden Service Center, PIN Unit, Stop 6273, Ogden, UT 84201. The fax number is ${IRS_OGDEN_FAX}.

For filings that are already late, the IRS Delinquent International Information Return Submission Procedure (DIIRSP) — see Rev. Proc. 2020-29 — allows taxpayers to submit late returns with a reasonable cause statement explaining the late filing. If the IRS accepts the reasonable cause, the penalty may be abated. There is no guarantee of abatement, but DIIRSP is the IRS's stated process for delinquent international information returns.`;

const FILING_DEADLINE = `## Filing deadline

- April 15 of the year following the tax year, OR
- The extended return due date if a US tax-return extension was filed (Form 7004).`;

const CORE_PAGES = [
  ["Home", "/", "Form5472 Prep home — Form 5472 + pro forma 1120 filing for foreign-owned US LLCs."],
  ["Pricing", "/pricing", "Standard $149 and Express $199 filing tiers with the full feature list."],
  ["EIN Acquisition", "/ein", "EIN service for foreign-owned US LLC owners — CAA certification, no passport mailing."],
  ["ITIN Acquisition", "/itin", "ITIN service for non-residents — CAA certification, no passport mailing."],
  ["Partners", "/partners", "Partner / referral program for accountants, formation agents, and registered agents."],
  ["Guides index", "/blog", "Jargon-free guides for foreign-owned US LLC owners on Form 5472, pro forma 1120, DIIRSP catch-up filings, and related topics."],
  ["Contact", "/contact", "Contact Form5472 Prep for Form 5472, pro forma 1120, EIN, ITIN, and catch-up filing questions."],
  ["About", "/about", "Who we are, how we work, and what we are and aren't."],
  ["Editorial policy", "/editorial-policy", "How our guides are sourced, reviewed, and kept current."],
  ["Security", "/security", "How customer data is protected in transit and at rest."],
  ["Privacy", "/privacy", "What we collect and what we discard."],
  ["Terms", "/terms", "Legal terms of service."],
  ["Data retention", "/data-retention", "Full retention schedule by data type."],
] as const;

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

function buildCorePages(): string {
  return `## Core pages\n\n${CORE_PAGES.map(
    ([title, path, description]) => `- [${title}](${SITE_URL}${path}): ${description}`,
  ).join("\n")}`;
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

function buildGuides(posts: PostMeta[]): string {
  const lines = posts.map(
    (post) =>
      `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description} (updated ${formatDate(post.updated ?? post.date)})`,
  );
  return `## Guides\n\n${lines.join("\n")}`;
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
    PRICING,
    PRIVACY,
    ADDITIONAL_SERVICES,
    buildCorePages(),
    buildTopicPages(),
    buildGuides(posts),
    `Full text of every guide and topic page: ${SITE_URL}/llms-full.txt`,
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
    `# ${page.h1}\nSource: ${SITE_URL}/${page.slug}\nLast reviewed: ${CONTENT_LAST_REVIEWED}`,
    page.intro,
    sections,
    `## Frequently asked questions\n\n${faqs}`,
  ].join("\n\n");
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

export async function buildLlmsFullTxt(): Promise<string> {
  const posts = await getAllPosts();
  const lastUpdated = getCorpusLastUpdated(posts);
  const header = [
    `# ${SITE_NAME} — Full Text`,
    ENTITY_SUMMARY,
    `Last updated: ${lastUpdated}`,
    `Pricing is authoritative at ${SITE_URL}/pricing — treat any pricing figures below as informational and defer to that page if they ever disagree.`,
  ].join("\n\n");
  const landingDocuments = indexableLandingPages().map(buildLandingDocument);
  const blogDocuments = await buildBlogDocuments(posts);

  return `${header}\n\n${[...landingDocuments, ...blogDocuments].join(SECTION_SEPARATOR)}\n`;
}
