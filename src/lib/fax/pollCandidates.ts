// Which filings the hourly fax-status-poll cron re-checks with Telnyx.
// Kept out of the route file (Next.js route modules may only export route
// fields) so it can be unit-tested directly.

import type { Prisma } from "@prisma/client";
import { isRetryLabel, isSandboxFaxId, isTerminalFaxStatus } from "@/lib/fax/telnyxStatus";

// Telnyx settles a fax in minutes-to-hours; anything still unknown after two
// weeks needs a human, not another API call every hour.
export const POLL_LOOKBACK_DAYS = 14;
export const POLL_MAX_ROWS = 100;
// A webhook retry holds "retrying_N" only for the seconds it takes to
// re-submit. Leave such rows alone unless the claim looks abandoned.
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

// Final in-process filter (belt and braces over the SQL, plus the rules SQL
// can't express: sandbox ids and a webhook retry that is mid-flight).
export function isPollable(
  filing: { faxJobId: string | null; faxStatus: string | null; status: string; updatedAt: Date },
  now: Date,
): boolean {
  if (!filing.faxJobId || isSandboxFaxId(filing.faxJobId)) return false;
  if (filing.status === "CONFIRMED") return false;
  if (isTerminalFaxStatus(filing.faxStatus)) return false;
  if (
    filing.faxStatus?.startsWith("retrying_") &&
    isRetryLabel(filing.faxStatus) &&
    now.getTime() - filing.updatedAt.getTime() < RETRY_CLAIM_GRACE_MS
  ) {
    return false;
  }
  return true;
}
