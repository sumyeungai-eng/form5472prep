import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finalizeFaxDelivered, finalizeFaxFailed } from "@/lib/fax/finalize";
import { isPollable, pollCandidatesWhere, POLL_MAX_ROWS } from "@/lib/fax/pollCandidates";
import {
  deliveryFactsFromTelnyx,
  fetchTelnyxFax,
  isTelnyxFailedStatus,
  TELNYX_DELIVERED_STATUS,
} from "@/lib/fax/telnyxStatus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Backstop for /api/telnyx-webhook. Runs HOURLY via Vercel Cron (vercel.json
// — not more often: the DB is Neon with scale-to-zero, and every run wakes
// it). For every filing whose fax outcome is still unknown it asks Telnyx's
// API directly and, on a delivered/failed answer, calls the SAME finalize
// functions the webhook uses (lib/fax/finalize.ts). Their atomic claim makes
// a webhook/poll race produce exactly one customer email and one receipt.
//
// "Outcome unknown" = has a faxJobId, status is not CONFIRMED, and faxStatus
// is not terminal (see isTerminalFaxStatus). That includes every in-progress
// label the webhook stores (queued, media.processed, sending.started, ...),
// our retry_N labels, and null — the old poll only matched queued/sending/
// retry_*, so a fax whose last webhook said "sending.started" was never
// reconciled if the fax.delivered webhook then went missing.
//
// Bounded to faxes sent/updated in the last 14 days: Telnyx settles a fax in
// minutes-to-hours, so anything older that is still non-terminal needs a
// human, not another API call every hour.

// Stop starting new Telnyx lookups with headroom before maxDuration.
const TIME_BUDGET_MS = 45 * 1000;
// A failure only minutes old belongs to the webhook, which may still re-fax
// it (the poll never retries). Give it this long before the poll gives up.
const FAILURE_GRACE_MS = 10 * 60 * 1000;

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ skipped: "TELNYX_API_KEY not set" });
  }

  const startedAt = Date.now();
  const now = new Date(startedAt);
  const candidates = await prisma.filing.findMany({
    where: pollCandidatesWhere(now),
    include: { user: true },
    // Oldest first so the most-overdue faxes are reconciled first under the cap.
    orderBy: { updatedAt: "asc" },
    take: POLL_MAX_ROWS,
  });
  const pollable = candidates.filter((f) => isPollable(f, now));

  const result = {
    candidates: candidates.length,
    inFlight: pollable.length,
    reconciled: 0,
    delivered: 0,
    failed: 0,
    alreadyFinalized: 0,
    stillSending: 0,
    recentFailureLeftForWebhook: 0,
    deferred: 0,
    errors: [] as string[],
  };

  let processed = 0;
  for (const filing of pollable) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      // Out of time — the rest are picked up by the next hourly run.
      result.deferred = pollable.length - processed;
      break;
    }
    processed++;
    try {
      const lookup = await fetchTelnyxFax(filing.faxJobId!, { apiKey });
      if (!lookup.ok) {
        result.errors.push(`${filing.id}: ${lookup.error}`);
        continue;
      }
      const tx = lookup.fax;

      if (tx.status === TELNYX_DELIVERED_STATUS) {
        const outcome = await finalizeFaxDelivered(filing, deliveryFactsFromTelnyx(tx), { source: "poll" });
        if (outcome.claimed) {
          result.delivered++;
          result.reconciled++;
        } else {
          result.alreadyFinalized++;
        }
      } else if (isTelnyxFailedStatus(tx.status)) {
        // The poll never re-faxes; retries are the webhook's job. This is the
        // same give-up path the webhook takes once retries are exhausted.
        const failedAt = tx.updated_at ? Date.parse(tx.updated_at) : NaN;
        if (Number.isFinite(failedAt) && startedAt - failedAt < FAILURE_GRACE_MS) {
          result.recentFailureLeftForWebhook++;
          continue;
        }
        const outcome = await finalizeFaxFailed(
          filing,
          { faxId: filing.faxJobId!, failureReason: tx.failure_reason ?? null, deliveryAttempts: 0 },
          { source: "poll" },
        );
        if (outcome.claimed) {
          result.failed++;
          result.reconciled++;
        } else {
          result.alreadyFinalized++;
        }
      } else {
        // Still queued/sending — leave the row as-is; the next pass re-checks.
        result.stillSending++;
      }
    } catch (err) {
      result.errors.push(`${filing.id}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json(result);
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev fallback (matches other crons)
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}
