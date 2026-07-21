import { prisma } from "@/lib/prisma";
import { DEFAULT_TIER, totalPriceCents, type Tier } from "@/lib/pricing";
import type { Filing, FilingStatus } from "@prisma/client";

const PAID_STATUSES = [
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
] as const satisfies readonly FilingStatus[];

// "Untouched" = the customer hasn't *advanced* in the wizard yet. Selecting
// tax years is the first wizard-only action (entity/owner can be auto-prefilled
// from a previous paid filing, so they're not reliable markers). If the draft
// has no tax years and no per-year financial data, it's safe to reuse for
// repeat /start submissions, refreshes, multi-tab opens, etc.
function isUntouchedDraft(f: Filing): boolean {
  return f.status === "DRAFT" && (!f.taxYears || f.taxYears.length === 0);
}

type FindOrCreateArgs = {
  sessionId: string | undefined;
  userId: string | null;
  tier?: Tier;
  funnelSource?: string | null;
  marketingConsent?: boolean;
  prefill?: Partial<Filing>;
};

// Returns an existing untouched DRAFT belonging to this session or user,
// or creates a fresh one when none exists. Centralised so every filing-creation
// entry point shares the same reuse rule.
//
// Reuse priority: user-owned untouched DRAFT (most recent) > session-owned
// untouched DRAFT. Once a customer signs in, any prior anonymous draft they
// matched on session sticks to them via `userId`, so the user-scoped lookup
// catches both cases on subsequent visits.
export async function findOrCreateDraftFiling(args: FindOrCreateArgs): Promise<{ filing: Filing; reused: boolean }> {
  const {
    sessionId,
    userId,
    tier = DEFAULT_TIER,
    funnelSource = null,
    marketingConsent = false,
    prefill = {},
  } = args;

  const existing = await prisma.filing.findFirst({
    where: {
      status: "DRAFT",
      taxYears: { isEmpty: true },
      OR: [
        userId ? { userId } : { id: "__never__" },
        sessionId ? { sessionId } : { id: "__never__" },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing && isUntouchedDraft(existing)) {
    return { filing: existing, reused: true };
  }

  const filing = await prisma.filing.create({
    data: {
      sessionId: sessionId ?? null,
      userId: userId ?? null,
      status: "DRAFT",
      tier,
      // Initial amountPaid = base tier price (no extra years yet — taxYears
      // is empty until the customer hits the wizard's YearsStep). The PATCH
      // endpoint recalculates this with totalPriceCents() once years exist.
      amountPaid: totalPriceCents(tier, 0),
      taxYears: [],
      funnelSource,
      marketingConsent,
      // Cast: prefill is `Partial<Filing>` which includes nullable Json
      // fields that Prisma's CreateInput refuses literally (needs Prisma.JsonNull).
      // At runtime our prefill only ever contains scalar entity/owner fields,
      // never Json columns, so the cast is safe.
      ...(prefill as Record<string, unknown>),
    },
  });
  return { filing, reused: false };
}

export { PAID_STATUSES };
