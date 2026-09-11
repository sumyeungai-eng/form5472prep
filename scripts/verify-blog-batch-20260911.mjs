import fs from "node:fs";
import assert from "node:assert/strict";
import matter from "gray-matter";

// Read-only HTTP checks. Pass a local preview or production origin.
const base = process.argv[2] || "http://localhost:3000";
const canonicalOrigin = base.startsWith("http://localhost:") ? base : "https://www.form5472prep.com";
const slugs = process.argv.length > 3 ? process.argv.slice(3) : [
  "form-5472-crypto-owner-transfers",
  "form-5472-llc-pays-personal-expenses",
  "ein-address-change-form-8822-b",
  "itin-name-change-marriage-passport",
  "itin-without-passport-alternative-documents",
];
const links = new Set();
const decode = (s) => s.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
async function get(route) {
  const r = await fetch(base + route, { signal: AbortSignal.timeout(60000) });
  assert.equal(r.status, 200, `${route}: HTTP ${r.status}`);
  return r;
}
for (const slug of slugs) {
  const {data,content} = matter(fs.readFileSync(`content/blog/${slug}.md`, "utf8"));
  assert.equal(data.draft, false);
  assert.equal(new Date(data.date).toISOString().slice(0,10), "2026-09-11");
  assert(!/<!--|GEO\/AEO brief|\bTODO\b/.test(content), "Editorial artifact in article");
  assert(!/utm_/.test(content), "Internal campaign attribution must stay clean");
  for(const m of content.matchAll(/\]\((\/[^)#?]+)[^)]*\)/g)) links.add(m[1]);
  const r = await get(`/blog/${slug}`);
  const html = await r.text();
  assert(!/noindex/i.test(r.headers.get("x-robots-tag") || ""));
  assert(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html));
  assert(html.includes(`rel="canonical" href="${canonicalOrigin}/blog/${slug}"`), "Canonical missing");
  assert.equal((html.match(/<h1[ >]/g)||[]).length, 1);
  assert(decode(html).includes(data.title), "Title mismatch");
  assert(html.includes("September 11, 2026"), "Visible publication date missing");
  assert(html.includes("<table"), "Decision table missing");
  assert(!/GEO\/AEO brief|&lt;!--/.test(html), "Leaked editorial comment");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const nodes = blocks.flatMap(b=>b["@graph"]||[b]);
  const article = nodes.find(n=>n["@type"]==="BlogPosting" || n["@type"]==="Article");
  assert(article, "Article structured data missing");
  assert.equal(article.datePublished.slice(0,10), "2026-09-11");
  assert.equal(article.dateModified.slice(0,10), "2026-09-11");
  const faq = nodes.find(n=>n["@type"]==="FAQPage");
  assert.equal(faq?.mainEntity?.length, 3, "FAQ extraction mismatch");
  const img = await get(`/blog/${slug}.webp`);
  assert(img.headers.get("content-type")?.includes("image/webp"));
  assert((await img.arrayBuffer()).byteLength > 10000);
  console.log(`PASS ${slug}: HTTP, title/date, canonical, robots, table, article/FAQ schema, image`);
}
for(const route of links) { await get(route); console.log(`PASS link ${route}`); }
for(const route of ["/blog", "/sitemap.xml", "/feed.xml"]) {
  const body = await (await get(route)).text();
  for(const slug of slugs) assert(body.includes(`/blog/${slug}`), `${slug} missing from ${route}`);
  console.log(`PASS all five discoverable in ${route}`);
}
const robots = await (await get("/robots.txt")).text();
assert(!/^Disallow:\s*\/(?:blog\/?|\s*)$/m.test(robots), "Blog crawler block");
console.log(`PASS batch checks: ${base} at ${new Date().toISOString()}`);
