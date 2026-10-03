// Drip-schedule blog posts: every content/blog/*.md whose frontmatter says
// `publishAt: auto` gets the next free daily slot (09:00 London, weekends
// included) and its `date` set to that day. Commit the rewritten files and
// push — each post then goes live on its own day with no further deploys.
//
//   npm run blog:schedule              # assign slots and rewrite the files
//   npm run blog:schedule -- --dry-run # show the plan, write nothing
//   npm run blog:schedule -- --list    # show the upcoming queue
//
// Queue order: frontmatter `date`, then file name. Slots are computed from the
// file posts only (posts scheduled in /admin/posts live in the database and
// are not visible here); two posts landing on one day is harmless.

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AUTO_PUBLISH,
  formatLondon,
  londonYmd,
  nextFreeSlots,
  parsePublishAt,
} from "../src/lib/blogSchedule";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

type FilePost = { file: string; slug: string; raw: string; fm: string; publishAt?: string; date?: string };

function field(fm: string, key: string): string | undefined {
  const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!m) return undefined;
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function setField(fm: string, key: string, value: string): string {
  const line = `${key}: ${value}`;
  const re = new RegExp(`^${key}:.*$`, "m");
  return re.test(fm) ? fm.replace(re, line) : `${fm}\n${line}`;
}

async function loadPosts(): Promise<FilePost[]> {
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".md")).sort();
  const posts: FilePost[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(BLOG_DIR, file), "utf8");
    const fm = raw.match(FRONTMATTER)?.[1];
    if (fm === undefined) continue;
    posts.push({
      file,
      slug: file.replace(/\.md$/, ""),
      raw,
      fm,
      publishAt: field(fm, "publishAt"),
      date: field(fm, "date"),
    });
  }
  return posts;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const now = new Date();
  const posts = await loadPosts();

  if (args.has("--list")) {
    const upcoming = posts
      .map((p) => ({ p, at: parsePublishAt(p.publishAt) }))
      .filter((x) => x.at && x.at.getTime() > now.getTime())
      .sort((a, b) => a.at!.getTime() - b.at!.getTime());
    const auto = posts.filter((p) => p.publishAt === AUTO_PUBLISH);
    console.log(`${upcoming.length} scheduled, ${auto.length} waiting for a slot (publishAt: auto)\n`);
    for (const { p } of upcoming) console.log(`  ${formatLondon(p.publishAt!)}  ${p.slug}`);
    for (const p of auto) console.log(`  (auto — not scheduled yet)  ${p.slug}`);
    return;
  }

  const queued = posts
    .filter((p) => p.publishAt === AUTO_PUBLISH)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "") || a.file.localeCompare(b.file));
  if (queued.length === 0) {
    console.log("No posts with `publishAt: auto` — nothing to schedule.");
    return;
  }

  const slots = nextFreeSlots(posts.map((p) => p.publishAt), queued.length, now);
  for (let i = 0; i < queued.length; i++) {
    const post = queued[i];
    const slot = slots[i];
    const ymd = londonYmd(parsePublishAt(slot)!);
    console.log(`${formatLondon(slot)}  ${post.slug}`);
    if (dryRun) continue;
    let fm = setField(post.fm, "publishAt", `"${slot}"`);
    fm = setField(fm, "date", ymd);
    await writeFile(path.join(BLOG_DIR, post.file), post.raw.replace(post.fm, () => fm), "utf8");
  }
  console.log(
    dryRun
      ? `\nDry run: ${queued.length} post(s) would be scheduled. Nothing written.`
      : `\nScheduled ${queued.length} post(s). Commit content/blog and push to main.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
