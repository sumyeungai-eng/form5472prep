import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const DEFAULT_BASE = "https://www.form5472prep.com";
const USER_AGENT = "form5472-snippet-audit";
const TIMEOUT_MS = 30_000;

const H = new Set(["h1", "h2", "h3", "h4"]);
const SKIP = new Set(["nav", "header", "footer", "script", "style", "noscript", "svg"]);
const VOID = new Set([
  "br",
  "img",
  "input",
  "meta",
  "link",
  "hr",
  "source",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "use",
  "area",
  "base",
  "col",
  "embed",
  "track",
  "wbr",
]);

const BLOCK_TAGS = new Set(["p", "li", "td", "dd", "div"]);
const QUESTION_LEVELS = new Set(["h2", "h3", "dt", "summary"]);

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

function words(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
}

function squish(parts) {
  return parts.join("").split(/\s+/).join(" ").trim();
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
  console.log("Usage: node scripts/snippet-audit.mjs --base https://www.form5472prep.com [--json out.json] [--pages file]");
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

  return [...nonBlogPosts.sort(), ...blogPosts.slice(0, 3)];
}

function normalizePath(path) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path;
}

function parseTag(raw) {
  if (/^<!--/.test(raw) || /^<!\[CDATA\[/i.test(raw) || /^<!/.test(raw) || /^<\?/.test(raw)) {
    return null;
  }

  const end = raw.match(/^<\s*\/\s*([^\s>]+)[^>]*>$/);
  if (end) {
    return { type: "end", tag: end[1].toLowerCase() };
  }

  const start = raw.match(/^<\s*([^\s/>]+)([\s\S]*?)>$/);
  if (!start) return null;

  const tag = start[1].toLowerCase();
  let rest = start[2] || "";
  const selfClosing = /\/\s*$/.test(rest);
  if (selfClosing) rest = rest.replace(/\/\s*$/, "");

  const attrs = {};
  const attrRe = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attrRe.exec(rest)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[name] = decodeEntities(value);
  }

  return { type: "start", tag, attrs, selfClosing };
}

class SnippetParser {
  constructor() {
    this.skip = 0;
    this.inmain = false;
    this.hasmain = false;
    this.heads = [];
    this.cur = null;
    this.pend = null;
    this.lists = [];
    this.lstack = [];
    this.tables = [];
    this.tstack = null;
    this.blocks = [];
    this.gap = [];
    this.stack = [];
  }

  ok() {
    return this.skip === 0 && (this.inmain || !this.hasmain);
  }

  start(tag, attrs) {
    if (VOID.has(tag)) return;

    const sk = SKIP.has(tag) || attrs["aria-hidden"] === "true";
    this.stack.push([tag, sk]);
    if (sk) {
      this.skip += 1;
      return;
    }
    if (this.skip) return;

    if (tag === "main") {
      this.inmain = true;
      this.hasmain = true;
    }
    if (H.has(tag)) {
      this.useFallback();
      this.cur = { lvl: tag, txt: [], ina: 0 };
      return;
    }
    if (this.cur !== null) {
      if (tag === "a") this.cur.ina += 1;
      return;
    }
    if (tag === "ol" || tag === "ul") {
      this.lstack.push({ tag, n: 0, li: [] });
    }
    if (tag === "li" && this.lstack.length) {
      const list = this.lstack[this.lstack.length - 1];
      list.n += 1;
      list.li.push([]);
    }
    if (tag === "table") {
      this.tstack = { thead: 0, tbody: 0, tr: 0, th: [] };
    }
    if (this.tstack !== null) {
      if (tag === "thead") this.tstack.thead = 1;
      if (tag === "tbody") this.tstack.tbody = 1;
      if (tag === "tr") this.tstack.tr += 1;
      if (tag === "th") {
        this.blocks.push({ tag: "th", txt: [] });
        return;
      }
    }
    if (tag === "dt" || tag === "summary") {
      this.useFallback();
      this.cur = { lvl: tag, txt: [], ina: 0 };
      return;
    }
    const currentBlock = this.blocks[this.blocks.length - 1];
    if (BLOCK_TAGS.has(tag) && (!currentBlock || currentBlock.tag === "div")) {
      this.blocks.push({ tag, txt: [] });
    }
  }

  end(tag) {
    if (VOID.has(tag)) return;

    while (this.stack.length) {
      const [tt, sk] = this.stack.pop();
      if (sk) this.skip = Math.max(0, this.skip - 1);
      if (tt === tag) break;
    }
    if (this.skip) return;

    if (tag === "main") this.inmain = false;
    if (this.cur !== null && tag === "a") {
      this.cur.ina = Math.max(0, this.cur.ina - 1);
      return;
    }
    if (H.has(tag) || tag === "dt" || tag === "summary") {
      if (this.cur) {
        const txt = squish(this.cur.txt);
        this.pend = { lvl: tag, q: txt, ans: null, tag: null, gap: 0, fallback: null };
        this.heads.push(this.pend);
        this.cur = null;
        this.gap = [];
      }
      return;
    }
    if ((tag === "ol" || tag === "ul") && this.lstack.length) {
      const list = this.lstack.pop();
      if (this.ok()) {
        this.lists.push({
          tag: list.tag,
          n: list.n,
          first: list.li.slice(0, 2).map((item) => squish(item).slice(0, 60)),
        });
      }
    }
    if (tag === "table" && this.tstack !== null) {
      if (this.ok()) this.tables.push(this.tstack);
      this.tstack = null;
    }
    if (this.blocks.length && tag === this.blocks[this.blocks.length - 1].tag) {
      this.finishBlock(this.blocks.pop());
    }
  }

  data(raw) {
    if (this.skip) return;
    const text = decodeEntities(raw);
    if (this.cur !== null) {
      if (!this.cur.ina) this.cur.txt.push(text);
      return;
    }
    if (this.blocks.length) {
      this.blocks[this.blocks.length - 1].txt.push(text);
    } else if (this.pend && this.pend.ans === null && text.trim()) {
      this.gap.push(text);
    }
    if (this.lstack.length && this.lstack[this.lstack.length - 1].li.length) {
      this.lstack[this.lstack.length - 1].li.at(-1).push(text);
    }
  }

  feed(html) {
    let pos = 0;
    while (pos < html.length) {
      const lt = html.indexOf("<", pos);
      if (lt === -1) {
        this.data(html.slice(pos));
        break;
      }
      if (lt > pos) this.data(html.slice(pos, lt));

      if (html.startsWith("<!--", lt)) {
        const end = html.indexOf("-->", lt + 4);
        pos = end === -1 ? html.length : end + 3;
        continue;
      }

      const gt = html.indexOf(">", lt + 1);
      if (gt === -1) {
        this.data(html.slice(lt));
        break;
      }

      const raw = html.slice(lt, gt + 1);
      const token = parseTag(raw);
      if (token?.type === "start") {
        this.start(token.tag, token.attrs);
        if (token.selfClosing && !VOID.has(token.tag)) this.end(token.tag);

        if ((token.tag === "script" || token.tag === "style") && !token.selfClosing) {
          const closeRe = new RegExp(`</\\s*${token.tag}\\s*>`, "ig");
          closeRe.lastIndex = gt + 1;
          const close = closeRe.exec(html);
          if (close) {
            this.data(html.slice(gt + 1, close.index));
            this.end(token.tag);
            pos = close.index + close[0].length;
            continue;
          }
        }
      } else if (token?.type === "end") {
        this.end(token.tag);
      }
      pos = gt + 1;
    }
    this.useFallback();
  }

  finishBlock(block) {
    const txt = squish(block.txt);
    if (block.tag === "th") {
      if (this.tstack !== null) this.tstack.th.push(txt.slice(0, 30));
      return;
    }

    if (!this.pend || this.pend.ans !== null || !txt) return;

    const answer = {
      ans: words(txt),
      tag: block.tag,
      gap: words(this.gap.join(" ")),
      lead: txt.slice(0, 90),
    };

    if (block.tag === "div") {
      if (this.pend.fallback === null) this.pend.fallback = answer;
      return;
    }

    this.pend.ans = answer.ans;
    this.pend.tag = answer.tag;
    this.pend.gap = answer.gap;
    this.pend.lead = answer.lead;
    this.pend.fallback = null;
  }

  useFallback() {
    if (!this.pend || this.pend.ans !== null || this.pend.fallback === null) return;
    this.pend.ans = this.pend.fallback.ans;
    this.pend.tag = this.pend.fallback.tag;
    this.pend.gap = this.pend.fallback.gap;
    this.pend.lead = this.pend.fallback.lead;
    this.pend.fallback = null;
  }
}

function auditHtml(path, html) {
  const parser = new SnippetParser();
  parser.feed(html);

  const qs = parser.heads.filter((head) => QUESTION_LEVELS.has(head.lvl) && head.q.trimEnd().endsWith("?"));
  const ok40_60 = qs.filter((head) => head.ans && head.ans >= 40 && head.ans <= 60).length;
  const ok35_70 = qs.filter((head) => head.ans && head.ans >= 35 && head.ans <= 70).length;
  const short = qs.filter((head) => head.ans !== null && head.ans < 35).length;
  const long = qs.filter((head) => head.ans && head.ans > 80).length;
  const noans = qs.filter((head) => head.ans === null).length;
  const bigLists = parser.lists.filter((list) => list.n >= 4);

  return {
    path,
    h23: parser.heads.filter((head) => head.lvl === "h2" || head.lvl === "h3").length,
    q: qs.length,
    ok40_60,
    ok35_70,
    short,
    long,
    noans,
    ol4: bigLists.filter((list) => list.tag === "ol").length,
    ul4: bigLists.filter((list) => list.tag === "ul").length,
    tables: parser.tables.length,
    thead: parser.tables.filter((table) => table.thead && table.tbody).length,
    heads: qs,
    lists: bigLists,
    tableDetails: parser.tables,
  };
}

async function auditPage(base, path) {
  const html = await fetchText(pageUrl(base, path));
  return auditHtml(path, html);
}

function jsonRow(row) {
  return {
    path: row.path,
    heads: row.heads.map((head) => ({
      lvl: head.lvl,
      q: head.q,
      ans: head.ans,
      tag: head.tag,
    })),
    lists: row.lists.map((list) => ({
      tag: list.tag,
      n: list.n,
    })),
    tables: row.tableDetails.map((table) => ({
      thead: Boolean(table.thead),
      tbody: Boolean(table.tbody),
      tr: table.tr,
    })),
  };
}

function tableOutput(rows) {
  const lines = [];
  lines.push(`${"path".padEnd(44)} h23  q  40-60 35-70 <35 >80 noP ol4 ul4 tbl thead`);
  for (const row of rows) {
    lines.push(
      `${row.path.padEnd(44)} ${String(row.h23).padStart(3)} ${String(row.q).padStart(3)} ${String(row.ok40_60).padStart(5)} ${String(row.ok35_70).padStart(5)} ${String(row.short).padStart(3)} ${String(row.long).padStart(3)} ${String(row.noans).padStart(3)} ${String(row.ol4).padStart(3)} ${String(row.ul4).padStart(3)} ${String(row.tables).padStart(3)} ${String(row.thead).padStart(3)}`,
    );
  }
  lines.push(
    `TOTAL q=${rows.reduce((sum, row) => sum + row.q, 0)} 40-60=${rows.reduce((sum, row) => sum + row.ok40_60, 0)} 35-70=${rows.reduce((sum, row) => sum + row.ok35_70, 0)} tables=${rows.reduce((sum, row) => sum + row.tables, 0)} thead=${rows.reduce((sum, row) => sum + row.thead, 0)}`,
  );
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
