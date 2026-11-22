import { alertServerError } from "@/lib/errorAlert";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2 * 1024;
const HOUR_MS = 60 * 60 * 1000;
let windowStartedAt = Date.now();
let alertsInWindow = 0;

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength !== null && Number(contentLength) > MAX_BODY_BYTES) {
      return new Response(null, { status: 204 });
    }
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES || new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
      return new Response(null, { status: 204 });
    }
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response(null, { status: 204 });
    }
    const { path, digest } = body as { path?: unknown; digest?: unknown };
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.length > 200) {
      return new Response(null, { status: 204 });
    }

    const now = Date.now();
    if (now - windowStartedAt >= HOUR_MS) {
      windowStartedAt = now;
      alertsInWindow = 0;
    }
    if (alertsInWindow >= 20) return new Response(null, { status: 204 });
    // Claim before awaiting so concurrent requests share the same cap.
    alertsInWindow += 1;
    await alertServerError({
      path: path.split(/[?#]/, 1)[0],
      digest: typeof digest === "string" && digest.length <= 64 && /^[A-Za-z0-9_-]+$/.test(digest)
        ? digest : undefined,
      message: "client error boundary shown",
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA,
    });
  } catch {
    // Invalid reports and monitoring failures must never cause another error.
  }
  return new Response(null, { status: 204 });
}
