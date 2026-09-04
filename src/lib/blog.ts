import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Post as PostRow } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Hybrid blog: markdown files on disk + a Postgres `Post` table.
//
// Files — drop a .md file in /content/blog/ with frontmatter:
//
//   ---
//   title: "Your post title"
//   description: "1–2 sentence summary used as meta description + index card"
//   date: 2026-05-19
//   publishAt: "2026-05-19T09:00:00-04:00"
//   author: "form5472 team"
//   tags: ["form-5472", "diirsp"]
//   draft: false
//   ---
//
//   # Heading
//   Markdown body here.
//
// File name (without .md) becomes the URL slug.
//
// Database — everything published from /admin/posts lands in the `Post` table,
// because Vercel's runtime filesystem is read-only (writing a .md there throws
// EROFS). For any given slug a non-deleted DB row WINS over the file, and a row
// with `deleted: true` is a tombstone that hides the file. The reads below fall
// back to files-only if the database is unreachable, so a DB blip can never
// take the public blog down.

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  // Optional ISO-8601 instant used for timed publishing. `date` remains the
  // human-facing publication date.
  publishAt?: string;
  // Optional last-updated date (YYYY-MM-DD). Feeds Article `dateModified` and a
  // visible "Last updated" line — bump it whenever a post is refreshed. Falls
  // back to `date` when absent.
  updated?: string;
  author?: string;
  tags?: string[];
  draft?: boolean;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  readingMinutes: number;
  image: string;
  imageAlt: string;
};

export type Post = PostMeta & {
  body: string;
};

async function listFiles(): Promise<string[]> {
  try {
    const all = await fs.readdir(BLOG_DIR);
    return all.filter((f) => f.endsWith(".md"));
  } catch (err) {
    // Folder doesn't exist yet — return empty list rather than crashing.
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function readFile(slug: string): Promise<Post | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
  const parsed = matter(raw);
  // gray-matter parses an unquoted YAML `date:` into a JS Date, not a string —
  // so type that one field as `unknown` and normalise it below. The rest of the
  // frontmatter keeps its declared string/array types for the checks here.
  const fm = parsed.data as Partial<Omit<PostFrontmatter, "date" | "publishAt" | "updated">> & {
    date?: unknown;
    publishAt?: unknown;
    updated?: unknown;
  };
  if (!fm.title || !fm.date || !fm.description) {
    throw new Error(`Post ${slug}.md missing required frontmatter (title/date/description)`);
  }
  // gray-matter parses YAML dates as JS Date objects; normalise to YYYY-MM-DD.
  const normDate = (v: unknown): string =>
    v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10);
  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: normDate(fm.date),
    publishAt: fm.publishAt
      ? fm.publishAt instanceof Date
        ? fm.publishAt.toISOString()
        : String(fm.publishAt)
      : undefined,
    updated: fm.updated ? normDate(fm.updated) : undefined,
    author: fm.author,
    tags: fm.tags ?? [],
    draft: fm.draft ?? false,
    readingMinutes: Math.max(1, Math.round(readingTime(parsed.content).minutes)),
    image: `/blog/${slug}.webp`,
    imageAlt: artworkAlt(slug, fm.title),
    body: parsed.content,
  };
}

const ARTWORK_ALTS: Record<string, string> = {
  "form-5472-cost": "Form 5472 paperwork, a calculator, and an approval marker on a tidy desk",
  "form-5472-extension": "A calendar, clock, and document envelope illustrating a filing extension",
  "amazon-fba-foreign-sellers-form-5472": "An ecommerce workspace with parcels, a laptop, and U.S. business paperwork",
  "form-5472-canada-residents-us-llc": "Canadian and U.S. business paperwork connected across a professional desk",
  "form-5472-diy-vs-preparer": "A side-by-side comparison of DIY tax paperwork and a professionally reviewed file",
  "form-5472-dormant-llc-no-income": "A quiet business ledger and tax file for a dormant LLC",
  "form-5472-filed-late-never-filed": "Late paperwork being organized into a complete filing folder",
  "form-5472-india-residents-us-llc": "India-based owner paperwork connected to a U.S. LLC filing",
  "form-5472-uk-residents-us-llc": "UK and U.S. business documents arranged for a Form 5472 filing",
  "what-is-form-5472": "A Form 5472 document linking a U.S. company with its foreign owner",
  "form-5472-reportable-transactions-examples": "A foreign-owned LLC ledger separating related-party transactions from ordinary business activity",
  "stripe-paypal-wise-form-5472": "Payment cards, a phone, and a transaction ledger representing Stripe, PayPal, and Wise activity",
  "form-5472-saas-founders": "A SaaS founder reviewing U.S. LLC tax records beside a laptop with an analytics dashboard",
  "first-year-form-5472-new-llc": "A newly formed U.S. LLC filing folder with a calendar and startup records",
  "form-5472-owner-loans-contributions-reimbursements": "Owner funding and reimbursement records organized around a U.S. LLC ledger",
  "itin-required-form-5472": "Foreign owner identification documents beside Form 5472 and an EIN confirmation",
  "form-5472-recordkeeping-checklist": "An organized Form 5472 recordkeeping system with statements, receipts, and a checklist",
  "form-5472-ftin-reference-id-foreign-address": "Foreign tax identification and address details being entered into U.S. filing paperwork",
  "multiple-related-parties-form-5472": "Multiple related-party folders connected to one U.S. reporting entity",
  "final-form-5472-closing-foreign-owned-llc": "A final Form 5472 file beside LLC closure documents and a completed calendar",
  "form-5472-penalty-notice-what-to-do": "An IRS civil penalty notice on a desk beside a reasonable cause response letter and filing records",
  "foreign-owned-llc-filing-requirements-checklist": "A compliance checklist of the federal and state filings a foreign-owned U.S. LLC completes each year",
  "does-foreign-owned-llc-pay-us-tax": "A non-resident owner reviewing U.S. tax rules for a foreign-owned LLC beside an income analysis",
  "how-to-fill-out-form-5472": "A blank Form 5472 and pro forma Form 1120 being completed part by part on a tidy desk",
  "form-5472-deadline-2026": "A wall calendar marking the April and October Form 5472 filing deadlines beside a filing package",
  "wyoming-llc-foreign-owner-tax-filing": "Wyoming LLC state paperwork arranged beside a federal Form 5472 filing folder",
  "ein-for-foreign-owned-llc-without-ssn": "A completed Form SS-4 and EIN confirmation letter for a foreign-owned U.S. LLC",
  "multi-member-llc-form-5472-or-1065": "Two partner files beside a Form 1065 partnership return and a Form 5472, showing which return applies",
  "form-5472-uae-dubai-residents-us-llc": "United Arab Emirates and U.S. business documents arranged for a Form 5472 filing",
  "amended-form-5472-correcting-errors": "A corrected Form 5472 package with an amended cover sheet and an explanation statement",
  "form-5472-us-real-estate-foreign-investor": "U.S. rental property documents and a Form 5472 filing folder arranged for a foreign investor",
  "form-5472-vs-form-5471": "Two IRS information returns side by side, showing which one a foreign-owned LLC files",
  "form-5472-statute-of-limitations": "A calendar and clock beside unfiled Form 5472 years, illustrating an open assessment window",
  "new-mexico-llc-foreign-owner-tax-filing": "New Mexico LLC state paperwork beside a federal Form 5472 filing folder",
  "nevada-llc-foreign-owner-tax-filing": "Nevada LLC annual list and business licence paperwork beside a Form 5472 filing folder",
  "form-5472-hong-kong-residents-us-llc": "Hong Kong and U.S. business documents arranged for a Form 5472 filing",
  "form-5472-pakistan-residents-us-llc": "Pakistan and U.S. business documents arranged for a Form 5472 filing",
  "form-5472-mexico-residents-us-llc": "Mexico and U.S. business documents arranged for a Form 5472 filing",
  "form-5472-part-v-statement-example": "An annotated Part V supporting statement attached to Form 5472 on a tidy desk",
  "form-5472-shopify-dropshipping-foreign-owner": "An ecommerce storefront dashboard beside a payout ledger and Form 5472 paperwork",
  "form-5472-china-residents-us-llc": "China and U.S. business documents arranged for a Form 5472 filing",
  "form-5472-brazil-residents-us-llc": "Brazil and U.S. business documents arranged for a Form 5472 filing",
  "form-5472-nigeria-residents-us-llc": "Nigeria and U.S. business documents arranged for a Form 5472 filing",
  "llc-vs-c-corp-non-resident-founders": "Two entity structures compared side by side for a non-resident founder",
  "us-bank-account-foreign-owned-llc": "A U.S. business bank card and EIN letter beside LLC formation paperwork",
  "w8ben-vs-w9-foreign-owned-llc": "Two IRS withholding certificates compared, showing which one a foreign owner signs",
  "form-5472-youtube-creators-influencers": "A creator's studio desk with a revenue dashboard beside Form 5472 paperwork",
  "form-5472-etsy-print-on-demand-sellers": "A print-on-demand seller's order ledger beside U.S. LLC filing paperwork",
  "form-8832-election-foreign-owned-llc": "An entity classification election form beside a corporate tax return and LLC records",
  "form-5472-airbnb-short-term-rental-host": "A short-term rental host's booking calendar beside payout records and Form 5472 paperwork",
  "ein-application-rejected-reference-number-101": "A stopped EIN application notice beside a Form SS-4 being corrected for resubmission",
  "lost-ein-147c-letter-replacement": "An IRS EIN verification letter replacing a lost CP 575 confirmation notice",
  "how-to-fill-out-form-ss-4-foreign-owned-llc": "A Form SS-4 being completed line by line for a foreign-owned U.S. LLC",
  "ein-for-stripe-amazon-paypal-seller-account": "A payment-platform onboarding screen beside an EIN confirmation letter and LLC paperwork",
  "ein-third-party-designee-apply-on-your-behalf": "A Form SS-4 third-party designee authorisation beside an EIN confirmation letter",
  "how-to-fill-out-form-w-7-nonresident-llc-owner": "A Form W-7 ITIN application being completed line by line beside a passport and a U.S. tax return",
  "itin-renewal-expired-itin-what-to-do": "A calendar marking a three-year gap beside an ITIN renewal application and identity documents",
  "itin-application-rejected-cp567-cp566": "An IRS ITIN rejection notice beside a corrected Form W-7 and certified identity documents",
  "when-nonresident-actually-needs-itin": "Two paths compared, showing when a non-resident needs an ITIN and when a foreign tax ID suffices",
  "itin-refund-30-percent-withholding-1042-s": "A Form 1042-S withholding statement beside a Form 1040-NR refund claim and an ITIN application",
  "form-5472-australia-residents-us-llc": "An Australian owner reviewing U.S. LLC tax records in an international workspace",
  "form-5472-germany-residents-us-llc": "A German owner organizing U.S. LLC filing records and cross-border transactions",
  "form-5472-france-residents-us-llc": "A French owner preparing U.S. LLC tax paperwork beside euro and dollar records",
  "form-5472-singapore-residents-us-llc": "A Singapore owner reviewing a U.S. LLC filing package in a modern office",
  "form-5472-netherlands-residents-us-llc": "A Dutch owner organizing cross-border U.S. LLC filing records",
  "delaware-llc-foreign-owner-tax-filing": "A Delaware LLC compliance file with an annual-tax calendar and U.S. filing records",
  "california-llc-foreign-owner-tax-filing": "California LLC state and federal filing records arranged on a professional desk",
  "florida-llc-foreign-owner-tax-filing": "A Florida LLC annual-report calendar beside a federal tax filing folder",
  "texas-llc-foreign-owner-tax-filing": "A Texas LLC public-information report and federal compliance records",
  "form-5472-reasonable-cause-letter": "A detailed reasonable cause letter organized with a timeline and supporting exhibits",
  "how-to-fax-form-5472-irs": "A complete Form 5472 package moving through a secure fax workflow",
  "pro-forma-form-1120-foreign-owned-llc": "A pro forma Form 1120 and Form 5472 assembled as one filing package",
  "form-5472-currency-conversion-exchange-rates": "A foreign-currency ledger being converted into documented U.S. dollar totals",
  "form-5472-foreign-corporate-owner": "A foreign parent-company folder connected to its U.S. LLC filing records",
  "form-5472-change-of-ownership": "Two owners documenting the transfer of a U.S. LLC interest",
  "form-5472-spain-residents-us-llc": "A Spain-based owner organizing U.S. LLC tax records and euro-to-dollar transactions",
  "form-5472-italy-residents-us-llc": "An Italy-based owner reviewing U.S. LLC filing records in a refined international workspace",
  "form-5472-switzerland-residents-us-llc": "A Swiss owner checking a U.S. LLC filing package and cross-border transaction ledger",
  "form-5472-japan-residents-us-llc": "A Japan-based founder preparing U.S. LLC tax records and yen-to-dollar transactions",
  "form-5472-new-zealand-residents-us-llc": "A New Zealand owner reviewing a U.S. LLC filing package in an Auckland workspace",
  "form-5472-formation-costs-registered-agent-fees": "Formation receipts and registered-agent fees organized into a Form 5472 workpaper",
  "form-5472-customer-payments-foreign-source-income": "Separate customer and foreign-owner ledgers showing which transactions belong on Form 5472",
  "form-5472-no-us-bank-account": "Foreign-account records and owner-paid LLC costs arranged for a Form 5472 filing",
  "form-5472-lines-1f-1g-1h-total-value": "Three related-party ledgers reconciled to Form 5472 gross transaction totals",
  "form-5472-business-address-owner-address": "An LLC filing package routed between principal-office and foreign-owner address records",
  "form-5472-vs-1040-nr": "Two separate tax filing folders and an international decision path comparing entity reporting with owner income tax",
  "form-5472-vs-1120-f": "A streamlined information-return file and a larger foreign-corporation return binder at a filing decision point",
  "form-5472-multiple-llcs-one-owner": "Three separate LLC filing workstations connected to one foreign owner",
  "form-5472-short-tax-year": "A new LLC filing folder beside a short year-end calendar and clock",
  "form-5472-related-party-services-management-fees": "Two related-party business files connected by a cross-border service-payment workflow",
  "form-5472-noncash-property-transfers": "Business equipment and property moving into a foreign-owned LLC filing folder",
  "form-5472-royalties-license-fees-intellectual-property": "Intellectual-property drawings and licensing files connected between related-party ledgers",
  "form-5472-reasonable-estimates-small-amounts": "A calculator, receipts, and ledger organized to support Form 5472 estimates",
  "washington-llc-foreign-owner-tax-filing": "Washington State compliance folders beside a Seattle and evergreen landscape",
  "oregon-llc-foreign-owner-tax-filing": "Oregon compliance folders beside the coast, forests, and state silhouette",
};

function artworkAlt(slug: string, title: string): string {
  return ARTWORK_ALTS[slug] ?? `Editorial illustration for ${title}`;
}

// ---- Database-backed posts ----

// Shape a DB row like a file-backed post. Derived fields (readingMinutes,
// image, imageAlt) go through the exact same helpers `readFile` uses so a
// DB post and a file post are indistinguishable downstream.
function fromRow(row: PostRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.date,
    publishAt: row.publishAt ?? undefined,
    updated: row.updated ?? undefined,
    author: row.author ?? undefined,
    tags: row.tags,
    draft: row.draft,
    readingMinutes: Math.max(1, Math.round(readingTime(row.body).minutes)),
    image: `/blog/${row.slug}.webp`,
    imageAlt: artworkAlt(row.slug, row.title),
    body: row.body,
  };
}

// Every DB row, tombstones included — callers need the `deleted` flag to know
// which file-backed slugs to hide. Returns null (not []) when the database is
// unreachable, so callers can tell "no rows" apart from "no database" and
// degrade to files only instead of silently dropping published posts.
async function listRows(): Promise<PostRow[] | null> {
  try {
    return await prisma.post.findMany();
  } catch (err) {
    console.error("[blog] database unavailable, falling back to files only:", err);
    return null;
  }
}

async function readRow(slug: string): Promise<PostRow | null | undefined> {
  try {
    return await prisma.post.findUnique({ where: { slug } });
  } catch (err) {
    console.error(`[blog] database unavailable reading "${slug}", falling back to file:`, err);
    // `undefined` = couldn't ask; `null` = asked, no such row.
    return undefined;
  }
}

export async function getAllPosts(opts?: { includeDrafts?: boolean }): Promise<PostMeta[]> {
  const files = await listFiles();
  const [filePosts, rows] = await Promise.all([
    Promise.all(files.map((f) => readFile(f.replace(/\.md$/, "")))),
    listRows(),
  ]);

  // Files first, then let the DB overwrite (published) or remove (tombstoned)
  // matching slugs. A Map keyed by slug gives the dedupe for free.
  const bySlug = new Map<string, Post>();
  for (const post of filePosts) {
    if (post) bySlug.set(post.slug, post);
  }
  for (const row of rows ?? []) {
    if (row.deleted) bySlug.delete(row.slug);
    else bySlug.set(row.slug, fromRow(row));
  }

  return Array.from(bySlug.values())
    .filter((p) => opts?.includeDrafts || isPubliclyAvailable(p))
    .map(({ body: _body, ...meta }) => meta)
    .sort(
      (a, b) =>
        new Date(b.publishAt ?? b.date).getTime() -
        new Date(a.publishAt ?? a.date).getTime(),
    );
}

export function isPubliclyAvailable(
  post: Pick<PostFrontmatter, "draft" | "publishAt">,
  now = new Date(),
): boolean {
  if (post.draft) return false;
  if (!post.publishAt) return true;
  const release = new Date(post.publishAt).getTime();
  return Number.isFinite(release) && release <= now.getTime();
}

export function blogSlugFromHref(href: string | undefined): string | null {
  if (!href) return null;
  return href.match(/^\/blog\/([a-z0-9-]+)\/?(?:[?#].*)?$/)?.[1] ?? null;
}

// Merged single-post read: DB row wins, tombstone hides the file, and an
// unreachable database falls through to the file.
async function readMerged(slug: string): Promise<Post | null> {
  const row = await readRow(slug);
  if (row === undefined) return readFile(slug); // DB down — file is all we have
  if (row === null) return readFile(slug); // no DB row — file-backed or missing
  if (row.deleted) return null; // tombstoned: the .md file is shadowed
  return fromRow(row);
}

export async function getPost(slug: string): Promise<Post | null> {
  const post = await readMerged(slug);
  if (!post || !isPubliclyAvailable(post)) return null;
  return post;
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Strip the markdown that would be noise inside JSON-LD plain text: links →
// their text, bold/italic markers, inline code backticks.
function stripMarkdown(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract Q&A pairs from a post's "## Frequently asked questions" section so
// they can be emitted as FAQPage JSON-LD. Recognizes both question formats used
// across the blog: `### question` headings and standalone bold lines
// (`**question?**`). Returns [] if the post has no recognizable FAQ section.
export function extractFaqs(body: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  let inFaq = false;
  let q: string | null = null;
  let ans: string[] = [];
  let started = false;
  let done = false;
  const flush = () => {
    const a = stripMarkdown(ans.join(" "));
    if (q && a) out.push({ q: stripMarkdown(q), a });
    q = null;
    ans = [];
    started = false;
    done = false;
  };
  for (const line of body.split("\n")) {
    const t = line.trim();
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) {
      flush();
      inFaq = /frequently asked|faq|common questions/i.test(h2[1]);
      continue;
    }
    if (!inFaq) continue;
    // After H2 handling, a horizontal rule closes FAQ extraction before bold-marker parsing.
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
      flush();
      inFaq = false;
      continue;
    }
    const h3 = line.match(/^###\s+(.*)/);
    const bold = t.match(/^\*\*(.+?)\*\*$/); // a whole-line bold question
    if (h3) {
      flush();
      q = h3[1];
    } else if (bold) {
      flush();
      q = bold[1];
    } else if (q && !done) {
      // Intentional trade-off: JSON-LD truncates two-paragraph answers or following bullet lists; rendered content is unaffected.
      if (t === "") {
        if (started) done = true;
      } else {
        started = true;
        ans.push(line);
      }
    }
  }
  flush();
  return out;
}

// Pull the first substantial numbered process from a question-form "How..."
// section. This lets process guides expose matching HowTo schema without
// duplicating step copy in frontmatter or page code.
export function extractHowTo(
  body: string,
): { name: string; steps: { name: string; text: string }[] } | null {
  let name: string | null = null;
  let steps: { name: string; text: string }[] = [];

  const finish = () => (name && steps.length >= 2 ? { name, steps } : null);
  for (const line of body.split("\n")) {
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      const ready = finish();
      if (ready) return ready;
      name = /^How\b/i.test(h2[1]) ? stripMarkdown(h2[1]) : null;
      steps = [];
      continue;
    }
    if (!name) continue;
    const item = line.match(/^\d+\.\s+(.+)/);
    if (!item) continue;
    const text = stripMarkdown(item[1]);
    const firstSentence = text.match(/^(.+?[.!?])(?:\s|$)/)?.[1] ?? text;
    steps.push({ name: firstSentence.replace(/[.!?]$/, ""), text });
  }
  return finish();
}

// ---- Admin write APIs ----

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function assertValidSlug(slug: string) {
  if (!SLUG_RE.test(slug) || slug.length > 80) {
    throw new Error(
      "Invalid slug. Use lowercase letters, numbers, and hyphens only (1–80 chars).",
    );
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getPostIncludingDraft(slug: string): Promise<Post | null> {
  return readMerged(slug);
}

// Does content/blog/<slug>.md exist in this deployment? Decides whether a
// delete needs a tombstone row (file present, can't be unlinked at runtime) or
// can just drop the DB row outright.
async function fileExists(slug: string): Promise<boolean> {
  try {
    await fs.access(path.join(BLOG_DIR, `${slug}.md`));
    return true;
  } catch {
    return false;
  }
}

// Frontmatter dates arrive as either "2026-05-19" or a full ISO timestamp;
// store the YYYY-MM-DD form so DB and file posts sort and render identically.
function normDateString(v: string): string {
  return String(v).slice(0, 10);
}

// Publishes to the database, never to disk — the runtime filesystem is
// read-only on Vercel. Upsert by slug, and clear any tombstone so re-creating
// a previously deleted slug works.
export async function writePost(
  slug: string,
  fm: PostFrontmatter,
  body: string,
): Promise<void> {
  assertValidSlug(slug);
  if (!fm.title || !fm.description || !fm.date) {
    throw new Error("title, description, and date are required");
  }
  const data = {
    title: fm.title,
    description: fm.description,
    date: normDateString(fm.date),
    publishAt: fm.publishAt || null,
    updated: fm.updated ? normDateString(fm.updated) : null,
    author: fm.author || null,
    tags: fm.tags ?? [],
    draft: !!fm.draft,
    body: body.trim(),
    deleted: false,
  };
  await prisma.post.upsert({
    where: { slug },
    create: { slug, ...data },
    update: data,
  });
}

export async function deletePost(slug: string): Promise<void> {
  assertValidSlug(slug);
  if (await fileExists(slug)) {
    // The .md file ships with the deployment and can't be removed at runtime,
    // so shadow it with a tombstone row instead.
    const tombstone = await readFile(slug);
    await prisma.post.upsert({
      where: { slug },
      create: {
        slug,
        title: tombstone?.title ?? slug,
        description: tombstone?.description ?? "",
        date: tombstone?.date ?? new Date().toISOString().slice(0, 10),
        body: tombstone?.body ?? "",
        deleted: true,
      },
      update: { deleted: true },
    });
    return;
  }
  // DB-only post: nothing on disk to shadow, so drop the row.
  await prisma.post.delete({ where: { slug } });
}

export async function renamePost(oldSlug: string, newSlug: string): Promise<void> {
  assertValidSlug(oldSlug);
  assertValidSlug(newSlug);
  if (oldSlug === newSlug) return;
  const current = await readMerged(oldSlug);
  if (!current) throw new Error(`Post "${oldSlug}" not found`);
  // Copy the merged content to the new slug, then retire the old one — a real
  // filesystem move isn't available (and wouldn't reach the DB row anyway).
  await writePost(
    newSlug,
    {
      title: current.title,
      description: current.description,
      date: current.date,
      publishAt: current.publishAt,
      updated: current.updated,
      author: current.author,
      tags: current.tags ?? [],
      draft: current.draft,
    },
    current.body,
  );
  await deletePost(oldSlug);
}
