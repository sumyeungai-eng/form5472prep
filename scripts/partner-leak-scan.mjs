#!/usr/bin/env node
// Partner white-label leak scan. Opens each partner invite link the way the
// client would, then checks every page and PDF the client can reach for any
// trace of us, plus the portal domain's neutral 404/robots.
//
//   node scripts/partner-leak-scan.mjs <invite-url> [<invite-url> ...]
//
// Exits 1 on any hit. Runtime network calls (ad/analytics tags) need a real
// browser; check those in the browser's network panel.
import { PDFDocument } from "pdf-lib";

const TERMS = [
  /form5472prep/i, /Form5472 Prep/i, /5472prep/i, /Horizons Furness/i, /East West Global/i,
  /\bAndrew\b/, /donotreply@/i, /support@form5472/i, /\/brand\//i, /banner\.png/i, /Telnyx/i,
];
const invites = process.argv.slice(2);
if (!invites.length) {
  console.error("usage: node scripts/partner-leak-scan.mjs <invite-url> [...]");
  process.exit(2);
}

const hits = [];
const scan = (where, text) => {
  for (const re of TERMS) {
    const m = text.match(re);
    if (m) hits.push(`${where}: "${text.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, " ")}"`);
  }
};

// Minimal cookie jar so the invite cookie follows us like a browser's would.
async function get(url, jar) {
  for (let hop = 0; hop < 6; hop++) {
    const res = await fetch(url, { redirect: "manual", headers: { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") } });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [kv] = c.split(";");
      const i = kv.indexOf("=");
      jar.set(kv.slice(0, i), kv.slice(i + 1));
      if (!/^fs_/.test(kv)) hits.push(`${url}: sets cookie ${kv.slice(0, i)}`);
    }
    if (res.status >= 300 && res.status < 400) {
      url = new URL(res.headers.get("location"), url).href;
      continue;
    }
    return { url, res };
  }
  throw new Error(`too many redirects from ${url}`);
}

async function checkPdf(label, buf) {
  const doc = await PDFDocument.load(buf, { updateMetadata: false, ignoreEncryption: true });
  const meta = { Title: doc.getTitle(), Author: doc.getAuthor(), Subject: doc.getSubject(), Creator: doc.getCreator(), Producer: doc.getProducer(), Keywords: doc.getKeywords() };
  scan(`${label} metadata`, JSON.stringify(meta));
  if (/pdf-lib/i.test(JSON.stringify(meta))) hits.push(`${label} metadata: pdf-lib default left in`);
  scan(`${label} bytes`, Buffer.from(buf).toString("latin1"));
}

for (const invite of invites) {
  const jar = new Map();
  const { url: landing, res } = await get(invite, jar);
  const html = await res.text();
  console.log(`${invite} -> ${res.status} ${landing}`);
  scan(`page ${new URL(landing).pathname}`, html);
  const disposition = [];

  const id = landing.match(/\/filings\/([^/]+)\//)?.[1];
  for (const kind of id ? ["pdf", "signed-pdf", "fax-receipt"] : []) {
    const r = await get(new URL(`/api/filings/${id}/${kind}`, landing).href, jar);
    if (r.res.status !== 200) continue;
    const cd = r.res.headers.get("content-disposition") ?? "";
    disposition.push(cd);
    scan(`${kind} file name`, cd);
    await checkPdf(kind, new Uint8Array(await r.res.arrayBuffer()));
  }
  if (disposition.length) console.log(`  files: ${disposition.join(" | ")}`);

  const origin = new URL(landing).origin;
  for (const path of ["/", "/pricing", "/robots.txt", "/sitemap.xml", "/feed.xml", "/llms.txt", "/admin", "/sign-in"]) {
    const r = await fetch(origin + path, { redirect: "manual" });
    const body = await r.text();
    scan(`portal ${path}`, body);
    if (path === "/robots.txt" ? !/Disallow: \/\s*$/m.test(body) : r.status !== 404) hits.push(`portal ${path}: status ${r.status}`);
  }
}

if (hits.length) {
  console.error(`\nLEAKS (${hits.length}):\n` + [...new Set(hits)].map((h) => `  - ${h}`).join("\n"));
  process.exit(1);
}
console.log("\nOK: no trace of us on any page, PDF, file name or portal path.");
