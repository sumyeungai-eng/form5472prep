import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const DEFAULT_BASE = "https://www.form5472prep.com";
const USER_AGENT = "form5472-howto-audit";
const TIMEOUT_MS = 30_000;

const ENTITY_MAP = {
  amp: "&",
  apos: "'",
  cent: "c",
  copy: "(c)",
  emsp: " ",
  ensp: " ",
  gt: ">",
  hellip: "...",
  laquo: "<<",
  ldquo: '"',
  lsaquo: "<",
  lsquo: "'",
  lt: "<",
  mdash: "-",
  ndash: "-",
  nbsp: " ",
  quot: '"',
  raquo: ">>",
  rdquo: '"',
  reg: "(r)",
  rsaquo: ">",
  rsquo: "'",
  shy: "",
  thinsp: " ",
  trade: "TM",
};

// keep in sync with src/lib/landing-howto.ts IMPERATIVE_VERBS
const VERBS = new Set(
  [
    "enter",
    "gather",
    "fill",
    "add",
    "build",
    "sign",
    "fax",
    "complete",
    "submit",
    "confirm",
    "review",
    "pay",
    "upload",
    "choose",
    "check",
    "send",
    "keep",
    "answer",
    "provide",
    "verify",
    "receive",
    "download",
    "attach",
    "prepare",
    "wait",
    "file",
    "request",
    "mail",
    "stamp",
    "calculate",
    "list",
    "report",
    "open",
    "collect",
    "select",
    "apply",
    "create",
    "scan",
    "print",
    "type",
    "write",
    "get",
    "make",
    "start",
    "finish",
    "record",
    "save",
    "note",
    "tell",
    "give",
    "run",
    "compare",
    "decide",
    "let",
    "track",
    "use",
    "approve",
    "authorize",
    "email",
    "phone",
    "call",
    "read",
    "pick",
    "store",
    "hold",
    "retain",
    "have",
    "preserve",
    "set",
    "monitor",
  ],
);

function decodeEntities(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const isHex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isFinite(code)) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      return match;
    }
    return Object.hasOwn(ENTITY_MAP, entity.toLowerCase()) ? ENTITY_MAP[entity.toLowerCase()] : match;
  });
}

function parseArgs(argv) {
  const args = {
    base: DEFAULT_BASE,
    json: null,
    pages: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--base") {
      args.base = argv[++i];
    } else if (arg === "--json") {
      args.json = argv[++i];
    } else if (arg === "--pages") {
      args.pages = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.base) throw new Error("--base requires a value");
  if (args.json === undefined) throw new Error("--json requires a value");
  if (args.pages === undefined) throw new Error("--pages requires a value");
  return args;
}

function printUsage() {
  console.log("Usage: node scripts/howto-audit.mjs --base https://www.form5472prep.com [--json out.json] [--pages file]");
}

function normalizeBase(base) {
  const url = new URL(base);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString().replace(/\/$/, "");
}

function pathFromUrl(value, base) {
  const baseUrl = new URL(base);
  const url = new URL(value, baseUrl);
  let path = url.pathname || "/";
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return `${path}${url.search}`;
}

function pageUrl(base, path) {
  return new URL(path, `${base}/`).toString();
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function readPages(file, base) {
  const text = await readFile(file, "utf8");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("http://") || line.startsWith("https://") ? pathFromUrl(line, base) : normalizePath(line)));
}

async function pagesFromSitemap(base) {
  const sitemap = await fetchText(`${base}/sitemap.xml`);
  const locs = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => decodeEntities(match[1].trim()));
  const paths = locs.map((loc) => pathFromUrl(loc, base));
  const nonBlogPosts = [];
  const blogPosts = [];

  for (const path of paths) {
    if (path.startsWith("/blog/topics/")) continue;
    if (/^\/blog\/[^/]+$/.test(path)) {
      blogPosts.push(path);
    } else {
      nonBlogPosts.push(path);
    }
  }

  return [...nonBlogPosts.sort(), ...blogPosts.slice(0, 5)];
}

function normalizePath(path) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path;
}

function findHowTos(html) {
  const out = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) {
    let data;
    try {
      data = JSON.parse(decodeEntities(match[1]));
    } catch {
      continue;
    }

    const stack = [data];
    while (stack.length) {
      const value = stack.pop();
      if (Array.isArray(value)) {
        stack.push(...value);
      } else if (value && typeof value === "object") {
        if (value["@type"] === "HowTo") out.push(value);
        stack.push(...Object.values(value));
      }
    }
  }
  return out;
}

function fieldCount(value) {
  return Array.isArray(value) ? value.length : 0;
}

function auditHowTo(ht, box) {
  const steps = Array.isArray(ht.step) ? ht.step : [];
  const names = steps.map((step) => (step?.name ? String(step.name) : ""));
  const verb = names.filter((name) => {
    if (!name) return false;
    const first = name.split(/\s+/)[0]?.toLowerCase().replace(/[:,]+$/, "");
    return first ? VERBS.has(first) : false;
  }).length;
  const last = names.length ? names.at(-1) : "";
  const lastText = steps.length && steps.at(-1)?.text ? String(steps.at(-1).text) : "";
  const verifyLastPattern = /keep|receipt|confirm|verify|check|record|preserve|done/i;
  const verifyLast = verifyLastPattern.test(last) || verifyLastPattern.test(lastText) ? "y" : "n";

  return {
    steps: steps.length,
    names,
    verb,
    url: steps.filter((step) => step?.url).length,
    tt: ht.totalTime || "-",
    desc: ht.description ? "y" : "n",
    tool: fieldCount(ht.tool),
    supply: fieldCount(ht.supply),
    cost: ht.estimatedCost ? "y" : "n",
    last,
    verifyLast,
    box: box ? "y" : "n",
  };
}

function auditHtml(path, html) {
  const howTos = findHowTos(html);
  const box = html.includes("Before you start");
  return {
    path,
    box: box ? "y" : "n",
    howTos: howTos.map((howTo) => auditHowTo(howTo, box)),
  };
}

async function auditPage(base, path) {
  const html = await fetchText(pageUrl(base, path));
  return auditHtml(path, html);
}

function jsonRow(row) {
  return {
    path: row.path,
    hasHowTo: row.howTos.length > 0,
    howToCount: row.howTos.length,
    box: row.box,
    howTos: row.howTos.map((howTo) => ({
      steps: howTo.steps,
      names: howTo.names,
      verb: howTo.verb,
      url: howTo.url,
      totalTime: howTo.tt,
      description: howTo.desc,
      tool: howTo.tool,
      supply: howTo.supply,
      estimatedCost: howTo.cost,
      verifyLast: howTo.verifyLast,
      box: howTo.box,
      last: howTo.last,
    })),
  };
}

function tableOutput(rows) {
  const lines = [];
  const pathWidth = Math.max(44, "path".length, ...rows.map((row) => row.path.length));

  lines.push(
    `${"path".padEnd(pathWidth)} steps verb  url tt     desc tool supply cost verifyLast box last`,
  );
  for (const row of rows) {
    if (!row.howTos.length) {
      lines.push(`${row.path.padEnd(pathWidth)} -`);
      continue;
    }

    for (const howTo of row.howTos) {
      lines.push(
        `${row.path.padEnd(pathWidth)} steps=${String(howTo.steps).padStart(2)} verb=${howTo.verb}/${howTo.names.length} url=${howTo.url} tt=${String(howTo.tt).padEnd(6)} desc=${howTo.desc} tool=${howTo.tool} supply=${howTo.supply} cost=${howTo.cost} verifyLast=${howTo.verifyLast} box=${howTo.box} last='${howTo.last.slice(0, 38)}'`,
      );
    }
  }

  const pagesWithHowTo = rows.filter((row) => row.howTos.length > 0);
  const verbFirstAll = pagesWithHowTo.filter((row) => row.howTos.every((howTo) => howTo.verb === howTo.steps)).length;
  const verifyLast = rows.reduce((sum, row) => sum + row.howTos.filter((howTo) => howTo.verifyLast === "y").length, 0);
  const box = rows.filter((row) => row.box === "y").length;
  lines.push(`TOTAL howto=${pagesWithHowTo.length} pages verbFirstAll=${verbFirstAll} verifyLast=${verifyLast} box=${box}`);
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const base = normalizeBase(args.base);
  const pages = args.pages ? await readPages(args.pages, base) : await pagesFromSitemap(base);
  const rows = [];

  for (const path of pages) {
    try {
      rows.push(await auditPage(base, path));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: skipped ${path}: ${message}`);
    }
  }

  if (args.json) {
    await writeFile(args.json, `${JSON.stringify(rows.map(jsonRow), null, 2)}\n`);
  }

  console.log(tableOutput(rows));
}

export { auditHtml, tableOutput };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
