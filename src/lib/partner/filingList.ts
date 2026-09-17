import { FilingStatus, Prisma } from "@prisma/client";

export const PARTNER_PAGE_SIZE = 25;

export type PartnerFilingQuery = {
  q?: string;
  status?: string;
  page?: number;
  archived?: boolean;
};

const VALID_STATUSES = new Set<string>(Object.values(FilingStatus));

function isFilingStatus(value: string): value is FilingStatus {
  return VALID_STATUSES.has(value);
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
): Required<Pick<PartnerFilingQuery, "page" | "archived">> & { q: string; status: string | null } {
  const qRaw = firstValue(searchParams.q)?.trim() ?? "";
  const statusRaw = firstValue(searchParams.status)?.trim() ?? "";
  const status = statusRaw && isFilingStatus(statusRaw) ? statusRaw : null;
  const archivedRaw = firstValue(searchParams.archived);
  const archived = archivedRaw === "1" || archivedRaw === "true";
  const page = parsePage(firstValue(searchParams.page));

  return { q: qRaw, status, page, archived };
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

  if (query.status && isFilingStatus(query.status)) {
    where.status = query.status;
  }

  const q = query.q.trim();
  if (q.length >= 2) {
    where.OR = [
      { llcName: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export function pageCount(total: number, pageSize: number = PARTNER_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
