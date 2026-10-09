// Checks the committed schedule now; checks full pages after each release.
// Local editorial preview: temporarily omit publishAt, run with --preview,
// restore the committed dates before building or publishing.
// node scripts/verify-company-car-blogs-20261009.mjs https://www.form5472prep.com
import assert from "node:assert/strict";
import fs from "node:fs";
import matter from "gray-matter";
import sharp from "sharp";

const slugs = [
  "company-car-deductions-foreign-owned-us-llc",
  "business-car-mileage-vs-actual-expenses-2026",
  "electric-company-car-us-llc-tax-credits-2026",
  "uk-company-car-vat-buy-lease-electric",
];
const base = process.argv[2]?.replace(/\/$/, "");
const preview = process.argv.includes("--preview");
const decode = s => s.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const posts = slugs.map((slug, index) => ({slug, expectedPublishAt: `2026-10-${16 + index}T09:00:00+01:00`, ...matter(fs.readFileSync(`content/blog/${slug}.md`, "utf8"))}));
const siblingPaths = new Set(slugs.map(s => `/blog/${s}`));
const internal = new Set();
const external = new Set();
const get = path => fetch(new URL(path, base), {signal: AbortSignal.timeout(30000)});
for (const {slug, expectedPublishAt, data, content} of posts) {
  assert.equal(data.draft, false);
  assert(data.description.length <= 160);
  assert(!/<!--|utm_|TODO|GEO\/AEO brief/.test(content));
  assert(content.includes("(/start)"));
  assert(content.includes("|---|"));
  if (!preview) {
    assert.equal(data.publishAt, expectedPublishAt);
    assert(Number.isFinite(Date.parse(data.publishAt)));
    assert.equal(new Date(data.publishAt).toISOString().slice(11, 16), "08:00");
  }
  const image = await sharp(`public/blog/${slug}.webp`).metadata();
  assert.equal(image.width, 1280); assert.equal(image.height, 720);
  for (const link of content.matchAll(/\]\(([^)]+)\)/g)) {
    if (link[1].startsWith("/")) internal.add(link[1]);
    if (link[1].startsWith("https://")) external.add(link[1]);
  }
  if (!base) continue;
  const released = preview || Date.now() >= Date.parse(data.publishAt);
  const response = await get(`/blog/${slug}`);
  assert.equal(response.status, released ? 200 : 404, slug);
  const cover = await get(`/blog/${slug}.webp`);
  assert.equal(cover.status, 200);
  assert(Buffer.from(await cover.arrayBuffer()).equals(fs.readFileSync(`public/blog/${slug}.webp`)), `${slug} cover bytes`);
  if (released) {
    const html = await response.text();
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
    assert(html.includes("<table"));
    assert(html.includes("/start"));
    assert(html.includes(`rel="canonical" href="${base}/blog/${slug}"`));
    assert(!/<meta name="robots" content="[^"]*noindex/.test(html));
    assert(!response.headers.get("x-robots-tag")?.includes("noindex"));
    const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap(m => {const json=JSON.parse(m[1]); return json["@graph"] || [json];});
    const article = nodes.find(n => n["@type"] === "BlogPosting");
    assert.equal(article?.headline, data.title);
    assert.equal(nodes.find(n => n["@type"] === "FAQPage")?.mainEntity.length, 2);
    const og = html.match(/<meta property="og:image" content="([^"]+)"/);
    assert(og); assert.equal((await get(decode(og[1]))).status, 200);
  }
  console.log(`PASS ${slug}: ${released ? "rendered page, schema and social image" : "scheduled 404"}; cover 200`);
}
assert.equal(4000 * 0.725 + 6000 * 0.76 + 180, 7640);
assert.equal(9000 * (10000 / 16000) + 180, 5805);
assert.equal(7640 - 5805, 1835);
assert.equal(40000 - 18000 + 5000, 27000);
assert.equal(32000 - 14000 + 11000, 29000);
assert.equal(500 + 100 - 100 * 0.5, 550);
if (base) {
  for (const route of ["/blog", "/sitemap.xml", "/feed.xml"]) {
    const r = await get(route); assert.equal(r.status, 200);
    const body = await r.text();
    for (const {slug, data} of posts) {
      const released = preview || Date.now() >= Date.parse(data.publishAt);
      assert.equal(body.includes(`/blog/${slug}`), released, `${route} discovery ${slug}`);
    }
    console.log(`PASS discovery ${route}`);
  }
  for (const path of internal) {
    if (siblingPaths.has(path)) continue; // Article statuses already checked.
    assert.equal((await get(path)).status, 200, path);
  }
  console.log(`PASS ${internal.size} internal destinations (including checked siblings)`);
}
if (base && process.argv.includes("--production-markers")) {
  // The empty request is rejected before database access or Stripe creation.
  const checkout = await fetch(new URL("/api/applications/ein/checkout", base), {
    method: "POST", headers: {"Content-Type": "application/json"}, body: "{}",
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(checkout.status, 400);
  const application = await get("/ein/apply");
  assert.equal(application.status, 200);
  assert((await application.text()).includes("Owner date of birth"));
  assert.equal((await get("/form-5472-penalty-calculator")).status, 200);
  console.log("PASS production markers: checkout validation, EIN form and penalty tool");
}
if (process.argv.includes("--sources")) {
  const statuses = await Promise.all([...external].map(async url => [url, (await fetch(url, {signal: AbortSignal.timeout(30000)})).status]));
  for (const [url, status] of statuses) { assert.equal(status, 200, url); console.log(`PASS citation HTTP ${url}`); }
}
console.log(`PASS metadata, illustration dimensions and example arithmetic — ${new Date().toISOString()}`);
