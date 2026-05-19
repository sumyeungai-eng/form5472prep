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
  author?: string;
  tags?: string[];
  draft?: boolean;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  readingMinutes: number;
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
  const fm = parsed.data as Partial<PostFrontmatter>;
  if (!fm.title || !fm.date || !fm.description) {
    throw new Error(`Post ${slug}.md missing required frontmatter (title/date/description)`);
  }
  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: String(fm.date),
    author: fm.author,
    tags: fm.tags ?? [],
    draft: fm.draft ?? false,
    readingMinutes: Math.max(1, Math.round(readingTime(parsed.content).minutes)),
    body: parsed.content,
  };
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
    .sort((a, b) => (a.date < b.date ? 1 : -1));
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
