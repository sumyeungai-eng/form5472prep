import type { FilingStatus } from "@prisma/client";

// Which filings the admin may archive (hide from the main list; nothing is
// deleted, they stay under Archive). Owner decision 2026-10-08: unfinished
// drafts and FINISHED orders only — anything still in progress (paid, in
// review, awaiting signature, signed, fax pending) stays visible so work
// can't drop out of sight or out of the sidebar badges.
export const ARCHIVABLE_STATUSES = ["DRAFT", "CONFIRMED", "FAILED"] as const satisfies readonly FilingStatus[];

export function isArchivableStatus(status: string): boolean {
  return (ARCHIVABLE_STATUSES as readonly string[]).includes(status);
}

export const MAX_BULK_ARCHIVE = 200;
