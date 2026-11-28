import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { makeUserToken } from "@/lib/session";
import { alertServerError } from "@/lib/errorAlert";
import { renderFailureReason } from "./renderFailure";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STATUSES = [
  "PDF_GENERATED", "SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAXED", "CONFIRMED", "FAILED",
] as const;

// Next 14.2.35 has no onRequestError hook. This daily check is the server
// render backstop until Next supports request-error instrumentation.
export async function GET(req: Request) {
  // Same fail-closed authentication as /api/cron/support-mail-sync.
  const secret = process.env.CRON_SECRET;
  if (!secret || (req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await Promise.all(STATUSES.map(async (status) => {
    let path = "/api/cron/portal-smoke";
    let checked = 0;
    async function fail(reason: string) {
      // Fixed diagnostic text only: never forward response bodies, cookies,
      // thrown fetch/Prisma errors, names or email addresses to Telegram.
      await alertServerError({ path, message: `Portal smoke ${status}: ${reason}` });
      return { checked, failure: { status, reason } };
    }
    try {
      const filing = await prisma.filing.findFirst({
        where: { status, partnerId: null },
        orderBy: { updatedAt: "desc" },
        select: { id: true, userId: true, sessionId: true },
      });
      // A status without any real filings has no page to exercise.
      if (!filing) return { checked, failure: null };
      path = `/filings/${encodeURIComponent(filing.id)}`;
      if (!filing.userId) return fail("No customer account available for authentication");
      if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
        return fail("SESSION_SECRET is not configured");
      }

      const target = new URL(env.appUrl);
      if (target.username || target.password ||
          (target.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && target.protocol === "http:"))) {
        return fail("App URL must use HTTPS in production and contain no credentials");
      }
      // Identical HMAC-signed fs_user session to /auth/[token]; no new bypass,
      // login link, outgoing email, cookie on the cron response, or DB token.
      const cookie = [`fs_user=${encodeURIComponent(makeUserToken(filing.userId))}`];
      // getOwnedFiling otherwise clears a different anonymous browser's hold.
      // Present the existing hold too so this read does not take it over.
      if (filing.sessionId) cookie.push(`fs_session=${encodeURIComponent(filing.sessionId)}`);
      checked = 1;
      const response = await fetch(new URL(path, target.origin), {
        headers: { Cookie: cookie.join("; "), Accept: "text/html" },
        redirect: "manual", // Never send a customer session through a redirect.
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      if (response.status !== 200) {
        await response.body?.cancel();
        return fail(`HTTP ${response.status}`);
      }
      // A streamed App Router render can fail AFTER sending HTTP 200. Consume
      // the full stream and reject its error markers or a locked-account page.
      const html = await response.text();
      const reason = renderFailureReason(html);
      if (reason) {
        console.warn(`[portal-smoke] ${status}: ${reason}`);
        return fail(`Customer page did not finish rendering successfully (marker: ${reason})`);
      }
      return { checked, failure: null };
    } catch {
      return fail("Status lookup or page request failed");
    }
  }));

  const failures = results.flatMap((result) => result.failure ? [result.failure] : []);
  return NextResponse.json({
    checked: results.reduce((sum, result) => sum + result.checked, 0),
    failures,
  }, { status: failures.length ? 500 : 200 });
}
