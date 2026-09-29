import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finalizeFaxDelivered } from "@/lib/fax/finalize";
import { handleConfirmedFaxFailure } from "@/lib/fax/retry";
import { isPollable, pollCandidatesWhere, POLL_MAX_ROWS, staleRetryClaim } from "@/lib/fax/pollCandidates";
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
// API directly and, on a delivered/failed answer, calls the SAME shared code
// the webhook uses: lib/fax/finalize.ts for delivered, lib/fax/retry.ts for
// failed (automatic re-fax while retries remain, FAILED only once they are
// exhausted). Their atomic claims make a webhook/poll race produce exactly
// one customer email, one receipt, and at most one resubmission.
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
  const pollable = candidates.filter((f) => isPollable(f));
  // A retrying_N claim that outlived its grace period means a resubmission
  // crashed mid-flight: its fax may or may not be with Telnyx, so nothing
  // automatic may touch it. Flag it every run until a human resolves it.
  const stuckRetryClaims = candidates.filter((f) => staleRetryClaim(f, now)).map((f) => f.id);
  for (const id of stuckRetryClaims) {
    const f = candidates.find((c) => c.id === id)!;
    console.error(
      `[fax-status-poll] STUCK_RETRY_CLAIM filing=${id} faxStatus=${f.faxStatus} faxJobId=${f.faxJobId} since ${f.updatedAt.toISOString()} — check Telnyx for a resubmitted fax before re-faxing`,
    );
  }
  const result = {
    candidates: candidates.length,
    inFlight: pollable.length,
    reconciled: 0,
    delivered: 0,
    failed: 0,
    retried: 0,
    alreadyFinalized: 0,
    stillSending: 0,
    heldPreflight: 0,
    deferred: 0,
    stuckRetryClaims,
    attention: [] as string[],
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
        // Same retry-or-give-up code the webhook runs: re-fax while retries
        // remain, FAILED + customer email only once they are exhausted.
        const outcome = await handleConfirmedFaxFailure(
          filing,
          {
            faxId: filing.faxJobId!,
            failureReason: tx.failure_reason ?? null,
            reportedAttempts: typeof tx.delivery_attempts === "number" ? tx.delivery_attempts : null,
          },
          { source: "poll" },
        );
        switch (outcome.outcome) {
          case "retried":
            result.retried++;
            result.reconciled++;
            break;
          case "retried_untracked":
            result.retried++;
            result.attention.push(`${filing.id}: untracked retry fax ${outcome.newFaxId}`);
            break;
          case "submit_ambiguous":
            result.attention.push(`${filing.id}: ambiguous resubmission — ${outcome.error}`);
            break;
          case "submit_rejected":
            result.errors.push(`${filing.id}: resubmission rejected — ${outcome.error}`);
            break;
          case "held_preflight":
            result.heldPreflight++;
            break;
          case "gave_up":
            if (outcome.claimed) {
              result.failed++;
              result.reconciled++;
            } else {
              result.alreadyFinalized++;
            }
            break;
          case "not_claimed":
            result.alreadyFinalized++;
            break;
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
