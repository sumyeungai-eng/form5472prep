// Server-side IndexNow submit (Bing, Yandex, Seznam, Naver… share one
// endpoint). The key is public by design: IndexNow verifies ownership by
// fetching https://www.form5472prep.com/<key>.txt, which ships in public/.
// scripts/indexnow.mjs is the manual bulk version of the same call.

export const INDEXNOW_SITE = "https://www.form5472prep.com";
const INDEXNOW_HOST = "www.form5472prep.com";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "93ddcc589b3e2a572c208e3628e1e545";

export type IndexNowResult = { ok: boolean; status: number | null; submitted: number; error?: string };

export async function submitToIndexNow(
  urls: string[],
  opts: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<IndexNowResult> {
  const urlList = Array.from(new Set(urls)).filter((u) => u.startsWith(`${INDEXNOW_SITE}/`) || u === INDEXNOW_SITE);
  if (urlList.length === 0) return { ok: true, status: null, submitted: 0 };
  try {
    const res = await (opts.fetchImpl ?? fetch)(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: INDEXNOW_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${INDEXNOW_SITE}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000),
    });
    // 200 = accepted, 202 = accepted while the key is being validated.
    return { ok: res.status === 200 || res.status === 202, status: res.status, submitted: urlList.length };
  } catch (err) {
    return { ok: false, status: null, submitted: 0, error: err instanceof Error ? err.message : String(err) };
  }
}
