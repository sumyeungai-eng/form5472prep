import type { FilingStatus } from "@prisma/client";
import { PAID_STATUSES } from "@/lib/findOrCreateDraft";
import { prisma } from "@/lib/prisma";

const SUPERSEDING_STATUSES = new Set<FilingStatus>(
  PAID_STATUSES.filter((status) => status !== "FAILED"),
);

type CandidateDraft = {
  id: string;
  userId: string | null;
  sessionId: string | null;
  partnerId: string | null;
  llcName: string | null;
  taxYears: number[] | null;
};

function normalizedName(value: string | null): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function sameCompanyOrNameless(draftName: string | null, paidName: string | null): boolean {
  const normalizedDraft = normalizedName(draftName);
  if (!normalizedDraft) return true;
  return normalizedDraft === normalizedName(paidName);
}

function yearsCoveredByPaid(draftYears: number[] | null, paidYears: number[] | null): boolean {
  if (!Array.isArray(draftYears) || !Array.isArray(paidYears)) return false;
  if (draftYears.length === 0) return true;
  const paid = new Set(paidYears);
  return draftYears.every((year) => paid.has(year));
}

// A session match is only meaningful for an anonymous customer in one browser.
// Partner-created filings all share the PARTNER's browser session while
// belonging to different clients, so a session match there would archive one
// client's fresh draft the moment another client's filing is paid. Partner
// rows are matched on userId only.
function sameOwner(draft: CandidateDraft, paid: CandidateDraft): boolean {
  if (draft.userId !== null && draft.userId === paid.userId) return true;
  if (draft.partnerId !== null || paid.partnerId !== null) return false;
  return draft.userId === null && draft.sessionId !== null && draft.sessionId === paid.sessionId;
}

export async function supersedeDraftsFor(paidFilingId: string): Promise<number> {
  const paid = await prisma.filing.findUnique({
    where: { id: paidFilingId },
    select: {
      id: true,
      status: true,
      userId: true,
      sessionId: true,
      partnerId: true,
      llcName: true,
      taxYears: true,
    },
  });

  if (!paid || !SUPERSEDING_STATUSES.has(paid.status)) return 0;
  if (!paid.userId && !paid.sessionId) return 0;

  const ownerClauses = [
    paid.userId ? { userId: paid.userId } : null,
    paid.sessionId && !paid.partnerId ? { userId: null, sessionId: paid.sessionId, partnerId: null } : null,
  ].filter(
    (clause): clause is { userId: string } | { userId: null; sessionId: string; partnerId: null } => clause !== null,
  );

  if (ownerClauses.length === 0) return 0;

  const candidates = await prisma.filing.findMany({
    where: {
      status: "DRAFT",
      supersededAt: null,
      id: { not: paid.id },
      OR: ownerClauses,
    },
    select: {
      id: true,
      userId: true,
      sessionId: true,
      partnerId: true,
      llcName: true,
      taxYears: true,
    },
  });

  const supersededIds = candidates
    .filter((draft) => sameOwner(draft, paid))
    .filter((draft) => sameCompanyOrNameless(draft.llcName, paid.llcName))
    .filter((draft) => yearsCoveredByPaid(draft.taxYears, paid.taxYears))
    .map((draft) => draft.id);

  if (supersededIds.length === 0) return 0;

  const result = await prisma.filing.updateMany({
    where: {
      id: { in: supersededIds },
      status: "DRAFT",
      supersededAt: null,
    },
    data: {
      supersededAt: new Date(),
      supersededById: paid.id,
    },
  });

  return result.count;
}
