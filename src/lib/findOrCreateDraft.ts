import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TIER, totalPriceCents, type Tier } from "@/lib/pricing";
import type { Attribution } from "@/lib/attribution";
import type { Filing, FilingStatus, Prisma } from "@prisma/client";

// Matches VISITOR_COOKIE in src/app/api/session/ping/route.ts. Not exported
// from there, so the name is duplicated here rather than imported.
const VISITOR_COOKIE = "fs_visitor";

// Every caller of findOrCreateDraftFiling is a route handler (request
// context), same as src/lib/session.ts reading its own cookies directly —
// so cookies() is safe to call here without threading a param through.
// Never throws: a missing/unavailable cookie, or no matching Visitor row yet
// (the beacon may not have fired before the draft is created), just means
// "no visitor link" — it must never block filing creation.
//
// The cookie holds Visitor.visitorKey (a random UUID minted by the ping
// route), not Visitor.id, so this resolves the row to get the id that
// Filing.visitorId actually stores and that admin lookups join on.
async function currentVisitorId(): Promise<string | null> {
  try {
    const visitorKey = cookies().get(VISITOR_COOKIE)?.value;
    if (!visitorKey) return null;
    const visitor = await prisma.visitor.findUnique({
      where: { visitorKey },
      select: { id: true },
    });
    return visitor?.id ?? null;
  } catch {
    return null;
  }
}

const PAID_STATUSES = [
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
] as const satisfies readonly FilingStatus[];

export function normalizeOwnerNameForReferenceId(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function ownerNamesMatchForReferenceId(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = normalizeOwnerNameForReferenceId(a);
  const right = normalizeOwnerNameForReferenceId(b);
  return left.length > 0 && left === right;
}

type OwnerReferenceRow = {
  ownerName: string | null;
  ownerReferenceId: string | null;
  ownerFtin?: string | null;
  ownerAddress?: string | null;
  ownerAddressStreet?: string | null;
  ownerAddressPostal?: string | null;
};

type OwnerReferenceIdentity = {
  ownerFtin?: string | null;
  ownerAddress?: string | null;
  ownerAddressStreet?: string | null;
  ownerAddressPostal?: string | null;
};

export function selectOwnerReferenceIdForOwnerName(
  rows: OwnerReferenceRow[],
  ownerName: string | null | undefined,
  ownerIdentity: OwnerReferenceIdentity = {},
): string | null {
  const match = rows.find((row) =>
    ownerNamesMatchForReferenceId(row.ownerName, ownerName) &&
    ownerIdentityMatchesForReferenceId(row, ownerIdentity),
  );
  return match?.ownerReferenceId?.trim() || null;
}

export async function findLatestPaidOwnerReferenceId(
  userId: string,
  ownerName: string | null | undefined,
  ownerIdentity: OwnerReferenceIdentity = {},
): Promise<string | null> {
  if (!normalizeOwnerNameForReferenceId(ownerName)) return null;
  const rows = await prisma.filing.findMany({
    where: {
      userId,
      status: { in: [...PAID_STATUSES] },
      ownerName: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      ownerName: true,
      ownerReferenceId: true,
      ownerFtin: true,
      ownerAddress: true,
      ownerAddressStreet: true,
      ownerAddressPostal: true,
    },
  });
  return selectOwnerReferenceIdForOwnerName(rows, ownerName, ownerIdentity);
}

function ownerIdentityMatchesForReferenceId(
  row: OwnerReferenceRow,
  ownerIdentity: OwnerReferenceIdentity,
): boolean {
  const rowFtin = normalizedIdentityToken(row.ownerFtin);
  const ownerFtin = normalizedIdentityToken(ownerIdentity.ownerFtin);
  if (rowFtin || ownerFtin) return rowFtin.length > 0 && rowFtin === ownerFtin;

  const rowAddress = comparableOwnerAddress(row);
  const ownerAddress = comparableOwnerAddress(ownerIdentity);
  return Boolean(
    rowAddress.street &&
    rowAddress.postal &&
    rowAddress.street === ownerAddress.street &&
    rowAddress.postal === ownerAddress.postal,
  );
}

function comparableOwnerAddress(value: OwnerReferenceIdentity): { street: string; postal: string } {
  const legacyParts = legacyAddressParts(value.ownerAddress);
  return {
    street: normalizedIdentityToken(value.ownerAddressStreet) || legacyParts.street,
    postal: normalizedIdentityToken(value.ownerAddressPostal) || legacyParts.postal,
  };
}

function legacyAddressParts(value: string | null | undefined): { street: string; postal: string } {
  const normalized = normalizedIdentityToken(value);
  if (!normalized) return { street: "", postal: "" };
  const parts = normalized.split(/[,|\n]/).map((part) => part.trim()).filter(Boolean);
  return {
    street: parts[0] ?? normalized,
    postal: normalized,
  };
}

function normalizedIdentityToken(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

// "Untouched" = the customer hasn't *advanced* in the wizard yet. Selecting
// tax years is the first wizard-only action (entity/owner can be auto-prefilled
// from a previous paid filing, so they're not reliable markers). If the draft
// has no tax years and no per-year financial data, it's safe to reuse for
// repeat /start submissions, refreshes, multi-tab opens, etc.
// An untouched draft is one the customer has typed NOTHING into, so reusing it
// cannot lose work or hijack another company. Tax years alone are not enough:
// the wizard asks for the LLC first ("entity" step) and for years two steps
// later, so a draft naming company A has empty taxYears. Reusing that when the
// customer starts a filing for company B dropped them back into company A.
export function isUntouchedDraft(f: Filing): boolean {
  if (f.status !== "DRAFT") return false;
  if (f.taxYears && f.taxYears.length > 0) return false;
  const entered = [
    f.llcName,
    f.llcEin,
    f.llcAddress,
    f.llcCity,
    f.llcZip,
    f.llcBusinessActivity,
    f.ownerName,
    f.ownerAddress,
  ];
  return entered.every((value) => value === null || value === "");
}

type FindOrCreateArgs = {
  sessionId: string | undefined;
  userId: string | null;
  tier?: Tier;
  funnelSource?: string | null;
  marketingConsent?: boolean;
  prefill?: Partial<Filing>;
  // First-touch traffic attribution read from the `f5472_attr` cookie by the
  // caller (see lib/attribution.ts). Only ever written on CREATE — see below.
  attribution?: Partial<Attribution> | null;
};

// Returns an existing untouched DRAFT belonging to this session or user,
// or creates a fresh one when none exists. Centralised so every filing-creation
// entry point shares the same reuse rule.
//
// Reuse priority: user-owned untouched DRAFT (most recent) > session-owned
// untouched DRAFT. Once a customer signs in, any prior anonymous draft they
// matched on session sticks to them via `userId`, so the user-scoped lookup
// catches both cases on subsequent visits.
// SECURITY (review 2026-09-28, C2): an email reaches a draft without proof of
// inbox control (save-for-later, Review step), so a draft linked to this
// account may have been planted by whoever holds it in another browser. A
// reused draft is then written into by the account owner — POST /api/filings
// copies their prior EIN/FTIN onto it before they even see it — so reuse only
// a draft no other browser or account can read:
//   - account match: the draft must not be held by a different browser
//     (sessionId null, or this browser's own session);
//   - session match while signed in: the draft must not be linked to a
//     different account (shared computer, or a mistyped email).
// Partner and unexpired invite grants can also read the row, independently
// of browser/account ownership. Never reuse those drafts for account prefill.
// A draft skipped here stays where it is; the owner simply gets a new one.
function reuseScope(userId: string | null, sessionId: string | undefined): Prisma.FilingWhereInput[] {
  const scopes: Prisma.FilingWhereInput[] = [];
  if (userId) {
    scopes.push({
      partnerId: null,
      userId,
      OR: sessionId ? [{ sessionId: null }, { sessionId }] : [{ sessionId: null }],
    });
  }
  if (sessionId) {
    scopes.push(userId ? { partnerId: null, sessionId, OR: [{ userId: null }, { userId }] } : { partnerId: null, sessionId });
  }
  return scopes.length > 0 ? scopes : [{ id: "__never__" }];
}

// Same rule as reuseScope, checked again on the row the query returned.
function isReusableBy(f: Filing, userId: string | null, sessionId: string | undefined, now: Date): boolean {
  if (f.partnerId !== null || (f.inviteExpiresAt !== null && f.inviteExpiresAt > now)) return false;
  const heldByThisBrowser = !!sessionId && f.sessionId === sessionId;
  if (userId && f.userId === userId) return f.sessionId === null || heldByThisBrowser;
  if (heldByThisBrowser) return !userId || f.userId === null;
  return false;
}

export async function findOrCreateDraftFiling(args: FindOrCreateArgs): Promise<{ filing: Filing; reused: boolean }> {
  const {
    sessionId,
    userId,
    tier = DEFAULT_TIER,
    funnelSource = null,
    marketingConsent = false,
    prefill = {},
    attribution = null,
  } = args;

  const now = new Date();
  const existing = await prisma.filing.findFirst({
    where: {
      status: "DRAFT",
      taxYears: { isEmpty: true },
      // Match isUntouchedDraft in the query too, so an older genuinely empty
      // draft is found instead of stopping at a newer one that names a company.
      llcName: null,
      llcEin: null,
      llcAddress: null,
      llcCity: null,
      llcZip: null,
      llcBusinessActivity: null,
      ownerName: null,
      ownerAddress: null,
      OR: reuseScope(userId, sessionId),
      AND: [{ OR: [{ inviteExpiresAt: null }, { inviteExpiresAt: { lte: now } }] }],
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing && isUntouchedDraft(existing) && isReusableBy(existing, userId, sessionId, now)) {
    // Deliberately NOT touching the attr* columns here. The row already carries
    // the attribution captured when it was created; a reused draft means the
    // visitor came back (often through a different channel), and re-stamping it
    // would turn first-touch into last-touch and mis-credit the acquisition.
    return { filing: existing, reused: true };
  }

  const visitorId = await currentVisitorId();

  const filing = await prisma.filing.create({
    data: {
      sessionId: sessionId ?? null,
      userId: userId ?? null,
      visitorId,
      status: "DRAFT",
      tier,
      // Initial amountPaid = base tier price (no extra years yet — taxYears
      // is empty until the customer hits the wizard's YearsStep). The PATCH
      // endpoint recalculates this with totalPriceCents() once years exist.
      amountPaid: totalPriceCents(tier, 0),
      taxYears: [],
      funnelSource,
      marketingConsent,
      // Where the visitor came FROM (channel), as opposed to funnelSource,
      // which records which landing PAGE they entered through. Nulls are fine:
      // attribution is best-effort and must never block filing creation.
      attrSource: attribution?.source ?? null,
      attrMedium: attribution?.medium ?? null,
      attrCampaign: attribution?.campaign ?? null,
      attrReferrer: attribution?.referrer ?? null,
      attrLanding: attribution?.landing ?? null,
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
