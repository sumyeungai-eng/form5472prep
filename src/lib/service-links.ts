// Contextual links from content (landing pages, blog posts) into the eight
// bottom-of-funnel /services/* pages (src/lib/services-pages.ts). Those pages
// were orphaned except for the footer and the hub; every content page now
// points at the ONE service page that best matches its topic.
//
// The maps are explicit on purpose: a keyword heuristic would silently send a
// penalty article to the wrong money page. service-links.test.ts fails when a
// new landing slug is added without a mapping, or when a target slug stops
// existing in SERVICE_PAGES.

export type ServiceSlug =
  | "form-5472-filing-service"
  | "pro-forma-1120-filing-service"
  | "late-form-5472-filing-service"
  | "form-5472-fax-filing-service"
  | "foreign-owned-llc-tax-filing-service"
  | "form-5472-filing-for-dormant-llc"
  | "final-form-5472-for-dissolved-llc"
  | "white-label-form-5472-filing";

const ANNUAL: ServiceSlug = "form-5472-filing-service";
const PRO_FORMA: ServiceSlug = "pro-forma-1120-filing-service";
const LATE: ServiceSlug = "late-form-5472-filing-service";
const FAX: ServiceSlug = "form-5472-fax-filing-service";
const TAX: ServiceSlug = "foreign-owned-llc-tax-filing-service";
const DORMANT: ServiceSlug = "form-5472-filing-for-dormant-llc";
const FINAL: ServiceSlug = "final-form-5472-for-dissolved-llc";
const PARTNER: ServiceSlug = "white-label-form-5472-filing";

/** Landing-page slug -> service page slug (src/lib/landing-pages.ts). */
export const LANDING_SERVICE_MAP: Record<string, ServiceSlug> = {
  // How-to / instructions / deadline: the annual filing.
  "file-form-5472": ANNUAL,
  "form-5472-instructions": ANNUAL,
  "irs-form-5472": ANNUAL,
  "form-5472-deadline": ANNUAL,
  // Late, penalty, DIIRSP, reasonable cause.
  "form-5472-penalty": LATE,
  diirsp: LATE,
  "late-form-5472": LATE,
  "form-5472-reasonable-cause-statement": LATE,
  // The pro forma 1120 that travels with Form 5472.
  "form-5472-vs-1120": PRO_FORMA,
  "pro-forma-1120": PRO_FORMA,
  "form-1120-foreign-owned-llc": PRO_FORMA,
  "form-1120-disregarded-entity": PRO_FORMA,
  "1120-pro-forma-instructions": PRO_FORMA,
  "pro-form-5472": PRO_FORMA,
  // Fax delivery.
  "form-5472-fax-number": FAX,
  // Whole-picture foreign-owner tax questions.
  "foreign-owned-llc-tax": TAX,
  "single-member-llc-foreign-owner": TAX,
  // State / country / formation-provider pages: the annual filing is the
  // action a reader of these pages actually needs.
  "wyoming-llc-form-5472": ANNUAL,
  "delaware-llc-form-5472": ANNUAL,
  "form-5472-germany": ANNUAL,
  "form-5472-uae": ANNUAL,
  "stripe-atlas-form-5472": ANNUAL,
  "doola-form-5472": ANNUAL,
  "firstbase-form-5472": ANNUAL,
  "clemta-form-5472": ANNUAL,
  "startglobal-form-5472": ANNUAL,
  "zenind-form-5472": ANNUAL,
  "northwest-registered-agent-form-5472": ANNUAL,
};

export function serviceForLanding(slug: string): ServiceSlug | null {
  return LANDING_SERVICE_MAP[slug] ?? null;
}

// Blog tags, matched EXACTLY (never by substring: "partnership" and
// "taking-on-a-partner" are about co-owners, not our partner program). Rules
// are checked in priority order, so a post tagged both `late-filing` and
// `administrative-dissolution` goes to the late-filing service.
const BLOG_TAG_RULES: Array<{ service: ServiceSlug; tags: string[] }> = [
  { service: LATE, tags: ["late-filing", "penalty", "penalty-abatement", "reasonable-cause", "diirsp", "delinquent"] },
  { service: FINAL, tags: ["llc-dissolution", "final-return", "dissolved-llc"] },
  { service: DORMANT, tags: ["dormant-llc", "inactive-llc"] },
  { service: FAX, tags: ["fax", "irs-ogden"] },
  { service: PRO_FORMA, tags: ["pro-forma-1120", "form-1120", "form-1120-f"] },
  {
    service: PARTNER,
    tags: ["partner-program", "white-label", "accounting-firms", "company-formation-agents", "registered-agents"],
  },
  { service: TAX, tags: ["us-tax", "tax-residency", "withholding", "form-1040-nr", "eci"] },
];

// Posts about getting an EIN/ITIN/FTIN are not about filing Form 5472; unless
// they are also tagged `form-5472` they get no service card.
const ID_NUMBER_TAGS = new Set(["itin", "ein", "ftin", "form-w-7", "form-ss-4", "caa"]);

export function serviceForBlogTags(tags: string[] | undefined): ServiceSlug | null {
  const set = new Set((tags ?? []).map((t) => t.trim().toLowerCase()));
  for (const rule of BLOG_TAG_RULES) {
    if (rule.tags.some((t) => set.has(t))) return rule.service;
  }
  if (set.has("form-5472")) return ANNUAL;
  if (Array.from(set).some((t) => ID_NUMBER_TAGS.has(t))) return null;
  if (set.has("foreign-owned-llc")) return ANNUAL;
  return null;
}
