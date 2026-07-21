import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

// File-based blog. Drop a .md file in /content/blog/ with frontmatter:
//
//   ---
//   title: "Your post title"
//   description: "1–2 sentence summary used as meta description + index card"
//   date: 2026-05-19
//   author: "form5472 team"
//   tags: ["form-5472", "diirsp"]
//   draft: false
//   ---
//
//   # Heading
//   Markdown body here.
//
// File name (without .md) becomes the URL slug.

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
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
  const fm = parsed.data as Partial<Omit<PostFrontmatter, "date" | "updated">> & {
    date?: unknown;
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
};

function artworkAlt(slug: string, title: string): string {
  return ARTWORK_ALTS[slug] ?? `Editorial illustration for ${title}`;
}

export async function getAllPosts(opts?: { includeDrafts?: boolean }): Promise<PostMeta[]> {
  const files = await listFiles();
  const posts = await Promise.all(
    files.map(async (f) => {
      const slug = f.replace(/\.md$/, "");
      return readFile(slug);
    }),
  );
  return posts
    .filter((p): p is Post => p !== null)
    .filter((p) => opts?.includeDrafts || !p.draft)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPost(slug: string): Promise<Post | null> {
  const post = await readFile(slug);
  if (!post || post.draft) return null;
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
  const flush = () => {
    const a = stripMarkdown(ans.join(" "));
    if (q && a) out.push({ q: stripMarkdown(q), a });
    q = null;
    ans = [];
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
    const h3 = line.match(/^###\s+(.*)/);
    const bold = t.match(/^\*\*(.+?)\*\*$/); // a whole-line bold question
    if (h3) {
      flush();
      q = h3[1];
    } else if (bold) {
      flush();
      q = bold[1];
    } else if (q) {
      ans.push(line);
    }
  }
  flush();
  return out;
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
  return readFile(slug);
}

export async function writePost(
  slug: string,
  fm: PostFrontmatter,
  body: string,
): Promise<void> {
  assertValidSlug(slug);
  if (!fm.title || !fm.description || !fm.date) {
    throw new Error("title, description, and date are required");
  }
  await fs.mkdir(BLOG_DIR, { recursive: true });
  const dateString = String(fm.date).slice(0, 10);
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(fm.title)}`,
    `description: ${JSON.stringify(fm.description)}`,
    `date: ${dateString}`,
    fm.author ? `author: ${JSON.stringify(fm.author)}` : null,
    fm.tags && fm.tags.length > 0
      ? `tags: [${fm.tags.map((t) => JSON.stringify(t)).join(", ")}]`
      : null,
    `draft: ${fm.draft ? "true" : "false"}`,
    "---",
    "",
    body.trim(),
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  await fs.writeFile(filePath, frontmatter, "utf8");
}

export async function deletePost(slug: string): Promise<void> {
  assertValidSlug(slug);
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  await fs.unlink(filePath);
}

export async function renamePost(oldSlug: string, newSlug: string): Promise<void> {
  assertValidSlug(oldSlug);
  assertValidSlug(newSlug);
  if (oldSlug === newSlug) return;
  const from = path.join(BLOG_DIR, `${oldSlug}.md`);
  const to = path.join(BLOG_DIR, `${newSlug}.md`);
  await fs.rename(from, to);
}
