import fs from "node:fs";
import assert from "node:assert/strict";
import matter from "gray-matter";
import sharp from "sharp";

// Read-only content/HTTP checks. Optional first argument is preview/production origin.
export const slugs = [
  "lisbon-digital-nomad-us-llc-accountant-handoff",
  "bangkok-digital-nomad-llc-transfer-remittance-records",
  "mexico-city-digital-nomad-us-llc-work-location-log",
  "tbilisi-digital-nomad-georgian-ie-us-llc-records",
  "chiang-mai-digital-nomad-llc-coworking-owner-paid-costs",
  "buenos-aires-digital-nomad-llc-usd-ars-reconciliation",
  "dubai-digital-nomad-us-llc-corporate-tax-review-pack",
  "kuala-lumpur-digital-nomad-cross-year-tax-records",
  "medellin-digital-nomad-rolling-365-day-tax-log",
  "barcelona-digital-nomad-visa-us-llc-tax-election",
];
const base = process.argv[2]?.replace(/\/$/, "");
const canonicalOrigin = process.env.VERIFY_CANONICAL_ORIGIN || base;
const titles = new Set();
const links = new Set();
const hub = fs.readFileSync("content/blog/form-5472-digital-nomad-us-llc.md", "utf8");
const alts = fs.readFileSync("src/lib/blog.ts", "utf8");
const decode = s => s.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
async function get(route) {
  const r = await fetch(base + route, { signal: AbortSignal.timeout(60000) });
  assert.equal(r.status, 200, `${route}: HTTP ${r.status}`);
  return r;
}
for (const slug of slugs) {
  const { data, content } = matter(fs.readFileSync(`content/blog/${slug}.md`, "utf8"));
  assert(/^[a-z0-9-]{1,80}$/.test(slug));
  assert.equal(data.date, "2026-09-22");
  assert.equal(data.draft, false);
  assert(!data.publishAt, "No unintended scheduled publication");
  assert(!titles.has(data.title), "Duplicate title");
  titles.add(data.title);
  assert(data.description && data.tags.includes("digital-nomad"));
  assert(!/^# |<!--|GEO\/AEO brief|\bTODO\b|utm_/m.test(content));
  assert(content.includes("](/start)"));
  assert(content.includes("](/blog/form-5472-digital-nomad-us-llc)"));
  assert(hub.includes(`/blog/${slug}`));
  assert(alts.includes(`"${slug}":`));
  assert(content.includes("https://www.irs.gov/"));
  assert(content.includes("| --- |"), "Practical table missing");
  const faqSection = content.split("## Frequently asked questions\n")[1]?.split(/\n## /)[0];
  assert.equal((faqSection?.match(/^### /gm) || []).length, 2);
  const meta = await sharp(`public/blog/${slug}.webp`).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 1280);
  assert.equal(meta.height, 720);
  for (const m of content.matchAll(/\]\((\/[^)#?]+)[^)]*\)/g)) {
    links.add(m[1]);
    if (m[1].startsWith("/blog/")) assert(fs.existsSync(`content${m[1]}.md`), `Missing internal article ${m[1]}`);
  }
  console.log(`PASS source ${slug}: ${content.split(/\s+/).length} words, metadata, table, links, art, 2 FAQs`);
  if (!base) continue;
  const r = await get(`/blog/${slug}`);
  const html = await r.text();
  assert(!/noindex/i.test(r.headers.get("x-robots-tag") || ""));
  assert(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html));
  assert(html.includes(`rel="canonical" href="${canonicalOrigin}/blog/${slug}"`), "Canonical mismatch");
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert(decode(html).includes(data.title), "Rendered title mismatch");
  assert(html.includes("September 22, 2026"), "Visible date missing");
  assert(html.includes("<table"));
  assert(!/GEO\/AEO brief|&lt;!--/.test(html));
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const nodes = blocks.flatMap(b => b["@graph"] || [b]);
  const article = nodes.find(n => n["@type"] === "BlogPosting");
  assert(article);
  assert.equal(article.datePublished.slice(0, 10), "2026-09-22");
  assert.equal(article.dateModified.slice(0, 10), "2026-09-22");
  assert.equal(article.image, `${canonicalOrigin}/blog/${slug}.webp`);
  const faq = nodes.find(n => n["@type"] === "FAQPage");
  assert.equal(faq?.mainEntity?.length, 2);
  for (const q of faq.mainEntity) {
    assert(q.acceptedAnswer.text.length > 20);
    assert(!/start Form|Educational information|\[|\]\(/.test(q.acceptedAnswer.text), "FAQ answer bleed");
  }
  const img = await get(`/blog/${slug}.webp`);
  assert(img.headers.get("content-type")?.includes("image/webp"));
  assert((await img.arrayBuffer()).byteLength > 1000);
  const og = html.match(/<meta property="og:image" content="([^"]+)"/);
  assert(og, "Social preview missing");
  const ogResponse = await fetch(decode(og[1]), { signal: AbortSignal.timeout(60000) });
  assert.equal(ogResponse.status, 200, "Social preview broken");
  assert(ogResponse.headers.get("content-type")?.startsWith("image/"));
  console.log(`PASS HTTP ${slug}: text/date, canonical, robots, media, social preview, Article/FAQ schema`);
}
const inclusiveDays = (start, end) => (Date.parse(end) - Date.parse(start)) / 86400000 + 1;
assert.equal(inclusiveDays("2025-11-01", "2025-12-31"), 61);
assert.equal(inclusiveDays("2026-01-01", "2026-07-01"), 182);
assert.equal(inclusiveDays("2025-10-01", "2026-04-02"), 184);
assert.equal(2000 - 60 - 1000, 940);
console.log("PASS all hypothetical arithmetic");
if (base) {
  for (const route of links) { await get(route); console.log(`PASS internal link ${route}`); }
  for (const route of ["/blog", "/sitemap.xml", "/feed.xml", "/blog/form-5472-digital-nomad-us-llc"]) {
    const html = await (await get(route)).text();
    for (const slug of slugs) assert(html.includes(`/blog/${slug}`), `${slug} absent from ${route}`);
    console.log(`PASS all ten discoverable in ${route}`);
  }
  const robots = await (await get("/robots.txt")).text();
  assert(!/^Disallow:\s*\/(?:blog\/?|\s*)$/m.test(robots));
}
console.log(`PASS nomad blog batch ${base || "source checks"} at ${new Date().toISOString()}`);
