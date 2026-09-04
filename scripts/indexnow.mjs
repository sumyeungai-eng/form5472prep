import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.form5472prep.com";
const HOST = "www.form5472prep.com";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10_000;

// The key file must be live and publicly reachable at keyLocation
// (https://www.form5472prep.com/<key>.txt) before real submissions work.
// Recommended first run locally: --dry-run. Submit for real only after deploy.

const STATUS_MEANINGS = new Map([
  [200, "OK — URLs submitted successfully"],
  [202, "Accepted — key validation pending"],
  [400, "Bad request — invalid format"],
  [403, "Forbidden — key not valid or key file not reachable at keyLocation"],
  [
    422,
    "Unprocessable — URLs don't belong to host or key does not match the schema in the file",
  ],
  [429, "Too Many Requests — rate limited"],
]);

function parseArgs(argv) {
  const args = {
    dryRun: false,
    urls: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (arg === "--urls") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--urls requires a comma-separated value");
      }
      args.urls = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function uniqueUrls(urls) {
  return [...new Set(urls.map((url) => url.trim()).filter(Boolean))];
}

async function getSitemapUrls() {
  const response = await fetch(`${SITE}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: HTTP ${response.status}`);
  }

  const xml = await response.text();
  return uniqueUrls([...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]));
}

async function getIndexNowKey() {
  if (process.env.INDEXNOW_KEY) {
    return process.env.INDEXNOW_KEY;
  }

  const publicDir = path.join(process.cwd(), "public");
  const keyFiles = (await readdir(publicDir)).filter((file) =>
    /^[a-f0-9]{32}\.txt$/.test(file),
  );

  if (keyFiles.length !== 1) {
    throw new Error(
      `Expected exactly one 32-character lowercase hex key file in public/, found ${keyFiles.length}`,
    );
  }

  const keyFile = keyFiles[0];
  const key = keyFile.slice(0, -".txt".length);
  const keyBody = await readFile(path.join(publicDir, keyFile), "utf8");

  if (keyBody !== key) {
    console.warn(
      `Warning: public/${keyFile} content does not equal filename stem; proceeding with filename stem as key`,
    );
  }

  return key;
}

function statusMeaning(status) {
  return STATUS_MEANINGS.get(status) ?? "Unexpected response";
}

async function submitBatch(key, urlList, batchNumber, batchCount) {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `${SITE}/${key}.txt`,
      urlList,
    }),
  });

  const body = await response.text();
  const meaning = statusMeaning(response.status);
  console.log(`Batch ${batchNumber}/${batchCount}: HTTP ${response.status} — ${meaning}`);

  if (!STATUS_MEANINGS.has(response.status) && body) {
    console.log(body);
  }

  return response.status;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const urls = args.urls
    ? uniqueUrls(args.urls.split(","))
    : await getSitemapUrls();

  if (args.dryRun) {
    console.log(`${urls.length} URLs`);
    urls.slice(0, 5).forEach((url) => console.log(url));
    return;
  }

  const key = await getIndexNowKey();
  const batches = [];
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches.push(urls.slice(i, i + BATCH_SIZE));
  }

  let failed = false;
  for (let i = 0; i < batches.length; i += 1) {
    const status = await submitBatch(key, batches[i], i + 1, batches.length);
    if (status >= 400) {
      failed = true;
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
