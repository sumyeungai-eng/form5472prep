import { NO_ACTIVITY_CODE } from "./index";

// Common principal business activities for foreign-owned single-member LLCs,
// with IRS Form 1120 Principal Business Activity codes.
export const BUSINESS_ACTIVITIES: { activity: string; code: string }[] = [
  // ── Software & tech services ────────────────────────────────
  { activity: "Software / SaaS / app development", code: "541512" },
  { activity: "Software publishing (commercial software products)", code: "513210" },
  { activity: "IT services / computer systems design", code: "541512" },
  { activity: "Web design / web development", code: "541511" },

  // ── Consulting & professional services ──────────────────────
  { activity: "Management consulting", code: "541600" },
  { activity: "Marketing / advertising consulting", code: "541800" },
  { activity: "Advertising agency / digital marketing services", code: "541800" },
  { activity: "Graphic / industrial design services", code: "541400" },
  { activity: "Financial / accounting / bookkeeping services", code: "541219" },
  { activity: "Legal services", code: "541110" },
  { activity: "Engineering / architectural services", code: "541330" },

  // ── Publishing & content ────────────────────────────────────
  // Common foreign-founder content businesses. The split between
  // book publishers, other publishers, web content, independent creators,
  // and music-rights publishing is the one most likely to be mis-coded; keep them
  // all explicitly listed so the picker doesn't force a default.
  { activity: "Book publishing (ebooks, print books)", code: "513130" },
  { activity: "Newspaper / periodical / magazine publishing", code: "513120" },
  { activity: "Other publishing (greeting cards, calendars, etc.)", code: "513190" },
  { activity: "Music publishing / music rights", code: "513190" },
  { activity: "Internet content / blog / newsletter / Substack", code: "516210" },
  { activity: "Affiliate marketing / content monetization", code: "541800" },
  { activity: "Writing / content creation / translation", code: "711510" },
  { activity: "Independent artist / performer / influencer", code: "711510" },
  { activity: "Photography / video production", code: "541920" },
  { activity: "Online education / courses / coaching", code: "611000" },

  // ── E-commerce & retail ─────────────────────────────────────
  { activity: "Online / e-commerce retail (physical products)", code: "455210" },
  { activity: "Dropshipping / Amazon FBA seller", code: "455210" },
  { activity: "Print-on-demand (books, apparel, prints)", code: "323100" },
  { activity: "Wholesale distribution / import-export", code: "424990" },

  // ── Finance, investment, real estate ────────────────────────
  { activity: "Investment activities / holding company", code: "523900" },
  { activity: "Cryptocurrency / digital asset trading", code: "523900" },
  { activity: "Real estate - rental property", code: "531190" },
  { activity: "Real estate - other (flipping, syndication, etc.)", code: "531390" },

  // ── Goods, services, ops ────────────────────────────────────
  { activity: "Restaurants / food service", code: "722511" },
  { activity: "Construction / contractor", code: "238900" },
  { activity: "Manufacturing", code: "339900" },
  { activity: "Transportation / logistics / freight", code: "488510" },
  { activity: "Trucking / delivery", code: "484110" },
  { activity: "Personal services (cleaning, beauty, etc.)", code: "812990" },
  { activity: "Healthcare / wellness services", code: "621399" },

  // Fallback. Lives here at the bottom so it's the last option.
  { activity: "Other (unable to classify)", code: NO_ACTIVITY_CODE },
];
