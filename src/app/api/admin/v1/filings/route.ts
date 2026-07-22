import { FilingStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, ok, withAdminAuth } from "@/lib/admin/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  status: z.enum(FilingStatus).optional(),
  q: z.string().trim().optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .default(25)
    .transform((value) => Math.min(100, Math.max(1, value))),
});

const cursorSchema = z
  .object({
    updatedAt: z.iso.datetime(),
    id: z.string().min(1),
  })
  .strict();

type FilingCursor = z.infer<typeof cursorSchema>;

function encodeCursor(cursor: FilingCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): FilingCursor | null {
  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );
    const parsed = cursorSchema.safeParse(decoded);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const GET = withAdminAuth(async (req) => {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return fail(
      400,
      "invalid_request",
      "Invalid filings query parameters",
    );
  }

  const cursor = parsed.data.cursor
    ? decodeCursor(parsed.data.cursor)
    : null;
  if (parsed.data.cursor && !cursor) {
    return fail(400, "invalid_request", "Invalid filings cursor");
  }

  const filters: Prisma.FilingWhereInput[] = [];
  if (parsed.data.status) filters.push({ status: parsed.data.status });
  if (parsed.data.q) {
    filters.push({
      OR: [
        { llcName: { contains: parsed.data.q, mode: "insensitive" } },
        {
          user: {
            is: {
              email: { contains: parsed.data.q, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }
  if (cursor) {
    const cursorDate = new Date(cursor.updatedAt);
    filters.push({
      OR: [
        { updatedAt: { lt: cursorDate } },
        { updatedAt: cursorDate, id: { lt: cursor.id } },
      ],
    });
  }

  const rows = await prisma.filing.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    select: {
      id: true,
      llcName: true,
      status: true,
      taxYears: true,
      amountPaid: true,
      updatedAt: true,
      user: { select: { email: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: parsed.data.limit + 1,
  });

  const hasNextPage = rows.length > parsed.data.limit;
  const pageRows = hasNextPage ? rows.slice(0, parsed.data.limit) : rows;
  const lastRow = pageRows.at(-1);
  const nextCursor =
    hasNextPage && lastRow
      ? encodeCursor({
          updatedAt: lastRow.updatedAt.toISOString(),
          id: lastRow.id,
        })
      : null;

  const items = pageRows.map((row) => ({
    id: row.id,
    llcName: row.llcName,
    status: row.status,
    taxYears: row.taxYears,
    amountPaid: row.amountPaid,
    updatedAt: row.updatedAt.toISOString(),
    customerEmail: row.user?.email ?? null,
  }));

  return ok({ items, nextCursor });
});
