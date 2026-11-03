import { prisma } from "@/lib/prisma";

// PR 8: record when payment was first recognised. Idempotent (only writes while
// paidAt is null, so the first path to see the payment wins and nothing ever
// overwrites it) and NEVER throws — it runs inside pay paths, and a failed
// stamp must not stop fulfilment (owner rule: never block payment). A skipped
// stamp only costs the review-queue due chip ("—").
export async function stampPaidAt(filingId: string, at: Date = new Date()): Promise<boolean> {
  try {
    const res = await prisma.filing.updateMany({ where: { id: filingId, paidAt: null }, data: { paidAt: at } });
    return res.count > 0;
  } catch (err) {
    console.error("[paidAt] stamp failed (payment unaffected)", filingId, err);
    return false;
  }
}
