import { prisma } from "@/lib/prisma";
import { PAID_STATUSES } from "@/lib/admin/reporting";

// Links website questions to orders by email. Checked when an admin page
// renders (not stored), so an order placed after the question shows up
// without any backfill. Matching is case-insensitive on the account email.

export type OrderSummary = { paidOrders: number; drafts: number };

export async function orderSummaryByEmail(emails: string[]): Promise<Map<string, OrderSummary>> {
  const unique = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)));
  const result = new Map<string, OrderSummary>();
  if (unique.length === 0) return result;

  const filings = await prisma.filing.findMany({
    where: {
      supersededAt: null,
      // An extra return on an existing order is the same order, not another.
      linkedToFilingId: null,
      user: { email: { in: unique, mode: "insensitive" } },
    },
    select: { status: true, user: { select: { email: true } } },
  });
  for (const f of filings) {
    const key = f.user?.email.toLowerCase();
    if (!key) continue;
    const entry = result.get(key) ?? { paidOrders: 0, drafts: 0 };
    if (PAID_STATUSES.has(f.status)) entry.paidOrders += 1;
    else if (f.status === "DRAFT") entry.drafts += 1;
    result.set(key, entry);
  }
  return result;
}

export function questionsForEmail(email: string, take = 10) {
  return prisma.websiteQuestion.findMany({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, createdAt: true, message: true, repliedAt: true },
  });
}

export function isPaidStatus(status: Parameters<typeof PAID_STATUSES.has>[0]): boolean {
  return PAID_STATUSES.has(status);
}
