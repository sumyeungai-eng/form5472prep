// Which filings the hourly fax-status-poll cron re-checks with Telnyx.
// Kept out of the route file (Next.js route modules may only export route
// fields) so it can be unit-tested directly.

import type { Prisma } from "@prisma/client";
import { isRetryLabel, isSandboxFaxId, isTerminalFaxStatus } from "@/lib/fax/telnyxStatus";

// Telnyx settles a fax in minutes-to-hours; anything still unknown after two
// weeks needs a human, not another API call every hour.
export const POLL_LOOKBACK_DAYS = 14;
export const POLL_MAX_ROWS = 100;
// A resubmission holds "retrying_N" only for the seconds it takes to call
// Telnyx. One older than this was abandoned mid-flight (crash, ambiguous
// submit, or a new job id that could not be recorded).
export const RETRY_CLAIM_GRACE_MS = 15 * 60 * 1000;

// "Outcome unknown": has a Telnyx job, not CONFIRMED, faxStatus non-terminal,
// and faxed or touched within the lookback window.
export function pollCandidatesWhere(now: Date): Prisma.FilingWhereInput {
  const cutoff = new Date(now.getTime() - POLL_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  return {
    faxJobId: { not: null },
    status: { not: "CONFIRMED" },
    OR: [{ faxedAt: { gte: cutoff } }, { updatedAt: { gte: cutoff } }],
    // Non-terminal faxStatus, with explicit null branches: SQL comparisons
    // against a NULL faxStatus yield NULL and would silently drop the row.
    AND: [
      { OR: [{ faxStatus: null }, { faxStatus: { not: "delivered" } }] },
      { OR: [{ faxStatus: null }, { NOT: { faxStatus: { startsWith: "failed" } } }] },
    ],
  };
}

type PollRow = { faxJobId: string | null; faxStatus: string | null; status: string; updatedAt: Date };

function isRetryClaim(faxStatus: string | null): boolean {
  return !!faxStatus && faxStatus.startsWith("retrying_") && isRetryLabel(faxStatus);
}

// Final in-process filter (belt and braces over the SQL, plus the rules SQL
// can't express). Never polls a row under a "retrying_N" claim, fresh or
// stale: a resubmission may already be with Telnyx, and acting on the OLD
// job's failure again could send the IRS a second fax.
export function isPollable(filing: PollRow): boolean {
  if (!filing.faxJobId || isSandboxFaxId(filing.faxJobId)) return false;
  if (filing.status === "CONFIRMED") return false;
  if (isTerminalFaxStatus(filing.faxStatus)) return false;
  if (isRetryClaim(filing.faxStatus)) return false;
  return true;
}

// A "retrying_N" claim older than the grace period: needs a human.
export function staleRetryClaim(filing: PollRow, now: Date): boolean {
  return (
    isRetryClaim(filing.faxStatus) &&
    filing.status !== "CONFIRMED" &&
    now.getTime() - filing.updatedAt.getTime() >= RETRY_CLAIM_GRACE_MS
  );
}
