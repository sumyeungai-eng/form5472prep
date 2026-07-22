import { EinStatus, ItinStatus } from "@prisma/client";
import { z } from "zod";
import { fail, ok, withAdminAuth } from "@/lib/admin/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  type: z.enum(["ein", "itin"]),
  status: z.string().trim().min(1).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .default(25)
    .transform((value) => Math.min(100, Math.max(1, value))),
});

export const GET = withAdminAuth(async (req) => {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    type: url.searchParams.get("type") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return fail(
      400,
      "invalid_request",
      "type must be ein or itin and all query parameters must be valid",
    );
  }

  if (parsed.data.type === "ein") {
    const status = parsed.data.status
      ? z.enum(EinStatus).safeParse(parsed.data.status)
      : null;
    if (status && !status.success) {
      return fail(400, "invalid_request", "Invalid EIN application status");
    }

    const rows = await prisma.einApplication.findMany({
      where: status?.success ? { status: status.data } : undefined,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        fullName: true,
        email: true,
        llcName: true,
        status: true,
        ein: true,
        phone: true,
        llcState: true,
      },
      orderBy: { id: "desc" },
      cursor: parsed.data.cursor ? { id: parsed.data.cursor } : undefined,
      skip: parsed.data.cursor ? 1 : undefined,
      take: parsed.data.limit + 1,
    });

    const hasNextPage = rows.length > parsed.data.limit;
    const pageRows = hasNextPage ? rows.slice(0, parsed.data.limit) : rows;
    const nextCursor = hasNextPage ? pageRows.at(-1)?.id ?? null : null;
    const items = pageRows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      fullName: row.fullName,
      email: row.email,
      llcName: row.llcName,
      status: row.status,
      ein: row.ein,
      phone: row.phone,
      llcState: row.llcState,
    }));

    return ok({ items, nextCursor });
  }

  const status = parsed.data.status
    ? z.enum(ItinStatus).safeParse(parsed.data.status)
    : null;
  if (status && !status.success) {
    return fail(400, "invalid_request", "Invalid ITIN application status");
  }

  const rows = await prisma.itinApplication.findMany({
    where: status?.success ? { status: status.data } : undefined,
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      fullName: true,
      email: true,
      phone: true,
      itinReason: true,
      status: true,
      itin: true,
    },
    orderBy: { id: "desc" },
    cursor: parsed.data.cursor ? { id: parsed.data.cursor } : undefined,
    skip: parsed.data.cursor ? 1 : undefined,
    take: parsed.data.limit + 1,
  });

  const hasNextPage = rows.length > parsed.data.limit;
  const pageRows = hasNextPage ? rows.slice(0, parsed.data.limit) : rows;
  const nextCursor = hasNextPage ? pageRows.at(-1)?.id ?? null : null;
  const items = pageRows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    itinReason: row.itinReason,
    status: row.status,
    itin: row.itin,
  }));

  return ok({ items, nextCursor });
});
