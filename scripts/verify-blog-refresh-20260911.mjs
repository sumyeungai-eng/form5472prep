import assert from "node:assert/strict";

// Read-only checks for the refreshed public surfaces. Does not submit customer forms.
const base = process.argv[2] || "http://localhost:3127";
const canonical = process.env.VERIFY_CANONICAL_ORIGIN || "https://www.form5472prep.com";
async function page(path) {
  const r = await fetch(base + path, { signal: AbortSignal.timeout(60000) });
  assert.equal(r.status, 200, `${path}: ${r.status}`);
  return r.text();
}
const checks = new Map([
  ["/blog/foreign-owned-llc-filing-requirements-checklist", "Check the LLC separately from its owner"],
  ["/blog/form-5472-diy-vs-preparer", "mail"],
  ["/blog/form-5472-cost", "live pricing"],
  ["/blog/form-5472-recordkeeping-checklist", "/downloads/form-5472-example-ledger.csv"],
  ["/blog/new-ein-llc-ownership-structure-change", "name"],
  ["/itin", "paid checkout before team review"],
  ["/foreign-owned-llc-tax", "/blog/foreign-owned-us-llc-fbar"],
  ["/partners", "white-label"],
  ["/about", "signing authority"],
  ["/faq", "CAA"],
  ["/", "transmission"],
]);
for (const [path, marker] of checks) {
  const html = await page(path);
  assert(html.includes(marker), `${path}: refresh marker missing (${marker})`);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${path}: h1 count`);
  assert(html.includes(`rel="canonical" href="${canonical}${path === "/" ? "" : path}"`), `${path}: canonical`);
  if (path.startsWith("/blog/")) {
    assert(html.includes('"dateModified":"2026-09-11'), `${path}: modified date`);
    assert(!/GEO\/AEO brief|&lt;!--/.test(html), `${path}: editorial artifact`);
  }
  console.log(`PASS refreshed ${path}`);
}
const contractor = await page("/blog/us-llc-paying-foreign-contractors-tax-forms");
assert(contractor.includes('aria-label="Scrollable data table"'), "Table wrapper missing");
const ledger = await page("/downloads/form-5472-example-ledger.csv");
assert.equal(ledger.trim().split(/\r?\n/).length, 6, "Expected header and five invented ledger entries");
assert(ledger.includes("EX-002A") && /hypothetical/i.test(ledger));
console.log("PASS table wrapper and hypothetical ledger download");
const scheduled = ["multiple-related-parties-form-5472", "final-form-5472-closing-foreign-owned-llc"];
const sitemap = await page("/sitemap.xml");
const blog = await page("/blog");
for (const slug of scheduled) {
  const r = await fetch(base + "/blog/" + slug, { signal: AbortSignal.timeout(60000) });
  assert.equal(r.status, 404, `${slug}: scheduled article exposed early`);
  assert(!sitemap.includes(`/blog/${slug}`) && !blog.includes(`/blog/${slug}`));
}
const sibling = await page("/blog/form-5472-multiple-llcs-one-owner");
assert(!sibling.includes('href="/blog/multiple-related-parties-form-5472"'));
console.log(`PASS scheduled posts remain hidden; refresh checks ${base} at ${new Date().toISOString()}`);
