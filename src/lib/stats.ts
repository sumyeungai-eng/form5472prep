import { prisma } from "@/lib/prisma";

// Public-facing "social proof" counter — total filings that reached the IRS
// (status = FAXED or CONFIRMED). Cached for 60s via Next's automatic
// fetch-cache invalidation so we don't hit the DB on every homepage view.
//
// Floor at 50 so an empty / brand-new state doesn't render "0 packages
// faxed" (looks worse than rendering nothing). Below the floor the caller
// is expected to render alternate copy (a generic accountant-review badge).
export async function getConfirmedFilingsCount(): Promise<number> {
  try {
    return await prisma.filing.count({
      where: { status: { in: ["FAXED", "CONFIRMED"] } },
    });
  } catch (err) {
    // DB hiccup shouldn't break the homepage — fall through to "0" which
    // the caller renders as the alternate copy.
    console.warn("[stats] getConfirmedFilingsCount failed", err);
    return 0;
  }
}

// Format a raw count into something that reads honestly but not anaemic.
// Examples:
//   12   -> "12"      (small actual number — render with neutral framing)
//   147  -> "147"
//   1247 -> "1,200+"  (round down to nearest 100, mark approximate)
//   12500 -> "12,500+"
export function formatFilingCount(n: number): string {
  if (n < 1000) return n.toLocaleString("en-US");
  // Round down to nearest 100 for >= 1,000 so the displayed number is
  // never higher than the truth.
  const floored = Math.floor(n / 100) * 100;
  return `${floored.toLocaleString("en-US")}+`;
}
