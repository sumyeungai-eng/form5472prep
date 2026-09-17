import { FilingStatus, Prisma } from "@prisma/client";
import { COURT_STATUSES, type Court } from "./responsibility";

export const PARTNER_PAGE_SIZE = 25;

export type PartnerFilingQuery = {
  q?: string;
  status?: string;
  page?: number;
  archived?: boolean;
  court?: Court | null;
};

const VALID_STATUSES = new Set<string>(Object.values(FilingStatus));
const VALID_COURTS = new Set<Court>(["you", "client", "irs", "done"]);

function isFilingStatus(value: string): value is FilingStatus {
  return VALID_STATUSES.has(value);
}

function isCourt(value: string): value is Court {
  return VALID_COURTS.has(value as Court);
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

// Parses the partner dashboard's GET search params into a normalized query.
// Invalid/garbage input is clamped rather than rejected: an unknown status
// is treated as "no filter", a non-positive/non-numeric page falls back to 1.
export function parsePartnerQuery(
  searchParams: Record<string, string | string[] | undefined>,
): Required<Pick<PartnerFilingQuery, "page" | "archived">> & {
  q: string;
  status: string | null;
  court: Court | null;
} {
  const qRaw = firstValue(searchParams.q)?.trim() ?? "";
  const statusRaw = firstValue(searchParams.status)?.trim() ?? "";
  const status = statusRaw && isFilingStatus(statusRaw) ? statusRaw : null;
  const archivedRaw = firstValue(searchParams.archived);
  const archived = archivedRaw === "1" || archivedRaw === "true";
  const page = parsePage(firstValue(searchParams.page));
  const courtRaw = firstValue(searchParams.court)?.trim() ?? "";
  const court = courtRaw && isCourt(courtRaw) ? courtRaw : null;

  return { q: qRaw, status, page, archived, court };
}

// Builds the Prisma `where` for one partner's filing list. Always scoped to
// partnerId — never trust an id/filter from the client without this.
export function partnerFilingWhere(
  partnerId: string,
  query: ReturnType<typeof parsePartnerQuery>,
): Prisma.FilingWhereInput {
  const where: Prisma.FilingWhereInput = {
    partnerId,
    partnerHidden: query.archived ? true : false,
  };

  // A stat-card click (court) takes over from the plain status dropdown —
  // they're two views onto the same list, never combined in the UI.
  if (query.court) {
    const statuses = COURT_STATUSES[query.court] as FilingStatus[];
    const otherStatuses = statuses.filter((s) => s !== "DRAFT");

    // "you" and "client" both fold DRAFT in, split by whether the client has
    // been invited. Scope that split to DRAFT rows only (via OR), rather
    // than a flat top-level `clientInviteSentAt` filter — that field is set
    // once and never cleared, so a PAID/PDF_GENERATED/FAILED filing that
    // went through the client-intake flow while it was still a DRAFT still
    // has it set, and a flat filter would wrongly hide (or wrongly keep) it.
    if (query.court === "you") {
      where.OR = [
        ...(otherStatuses.length > 0 ? [{ status: { in: otherStatuses } }] : []),
        { status: "DRAFT", clientInviteSentAt: null },
      ];
    } else if (query.court === "client") {
      where.OR = [
        ...(otherStatuses.length > 0 ? [{ status: { in: otherStatuses } }] : []),
        { status: "DRAFT", clientInviteSentAt: { not: null } },
      ];
    } else {
      where.status = { in: statuses };
    }
  } else if (query.status && isFilingStatus(query.status)) {
    where.status = query.status;
  }

  const q = query.q.trim();
  if (q.length >= 2) {
    const searchOr: Prisma.FilingWhereInput[] = [
      { llcName: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
    // A court filter may already occupy `where.OR` above — combine both
    // conditions with AND rather than clobbering one.
    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchOr }];
      delete where.OR;
    } else {
      where.OR = searchOr;
    }
  }

  return where;
}

export function pageCount(total: number, pageSize: number = PARTNER_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
