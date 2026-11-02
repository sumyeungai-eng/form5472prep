import { prisma } from "@/lib/prisma";

// Storage keys of the unsigned filing package (release gate, PR 1 of
// docs/reviews/2026-10-30-system-update-plan.md).
//
// Every generation writes a NEW versioned key, so the bytes staff released to
// the client (Filing.reviewApprovedPdfKey) can never change under them. Before
// 2026-10-31 every generation overwrote `${id}_unsigned.pdf`; legacy rows may
// still point at that key.

export function newUnsignedPdfKey(filingId: string): string {
  return `${filingId}_unsigned_${Date.now()}.pdf`;
}

// The reviewed upload is the client version while generatedPdfKey points at it.
export function isReviewedPdfKey(key: string | null | undefined): boolean {
  return !!key && key.includes("_reviewed_");
}

// The only package key a client (customer or partner) may ever see: the one
// staff released. Null until released.
export function releasedPdfKey(filing: {
  reviewApprovedAt?: Date | string | null;
  reviewApprovedPdfKey?: string | null;
}): string | null {
  return filing.reviewApprovedAt && filing.reviewApprovedPdfKey ? filing.reviewApprovedPdfKey : null;
}

// Admin "Download latest generated draft": the newest GENERATED package, even
// while a reviewed upload is the client version. Newest-first over the "pdf"
// change-log rows: a draft-only regenerate records `after.draftKey`; a
// reviewed upload records the key it replaced in `before.generatedPdfKey`.
export async function latestGeneratedDraftKey(
  filingId: string,
  generatedPdfKey: string | null,
): Promise<string> {
  if (generatedPdfKey && !isReviewedPdfKey(generatedPdfKey)) return generatedPdfKey;
  const rows = await prisma.filingChangeLog.findMany({
    where: { filingId, field: "pdf" },
    orderBy: { changedAt: "desc" },
    take: 50,
    select: { beforeJson: true, afterJson: true },
  });
  for (const row of rows) {
    const draft = (row.afterJson as { draftKey?: unknown } | null)?.draftKey;
    if (typeof draft === "string") return draft;
    const prev = (row.beforeJson as { generatedPdfKey?: unknown } | null)?.generatedPdfKey;
    if (typeof prev === "string" && !isReviewedPdfKey(prev)) return prev;
  }
  return `${filingId}_unsigned.pdf`; // pre-versioning generations
}
