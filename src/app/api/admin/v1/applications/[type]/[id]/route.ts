import { EinStatus, ItinStatus } from "@prisma/client";
import { z } from "zod";
import { fail, ok, withAdminAuth } from "@/lib/admin/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const typeSchema = z.enum(["ein", "itin"]);
const bodySchema = z.object({
  status: z.string().optional(),
  adminNotes: z.string().optional(),
  ein: z.string().optional(),
  itin: z.string().optional(),
}).strict();

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

export const PATCH = withAdminAuth(async (req, { principal, params }) => {
  if (principal.adminId === null) {
    return fail(
      403,
      "identity_required",
      "This action requires a personal admin account. Sign in with a magic link.",
    );
  }

  const parsedType = typeSchema.safeParse(params.type);
  if (!parsedType.success) {
    return fail(400, "invalid_type", "Application type must be ein or itin");
  }

  const body = await req.json().catch(() => null);
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return fail(400, "invalid_request", "The application update request is invalid");
  }

  if (parsedType.data === "ein") {
    if ("itin" in parsedBody.data) {
      return fail(400, "invalid_request", "itin is not valid for an EIN application");
    }
    const parsedStatus = parsedBody.data.status === undefined
      ? null
      : z.enum(EinStatus).safeParse(parsedBody.data.status);
    if (parsedStatus && !parsedStatus.success) {
      return fail(400, "invalid_status", "Invalid EIN application status");
    }

    try {
      const application = await prisma.einApplication.update({
        where: { id: params.id },
        data: {
          ...(parsedStatus?.success ? { status: parsedStatus.data } : {}),
          ...(parsedBody.data.adminNotes !== undefined
            ? { adminNotes: parsedBody.data.adminNotes || null }
            : {}),
          ...(parsedBody.data.ein !== undefined
            ? { ein: parsedBody.data.ein || null }
            : {}),
        },
        select: {
          id: true,
          status: true,
          adminNotes: true,
          ein: true,
        },
      });
      return ok(application);
    } catch (error) {
      if (isNotFoundError(error)) {
        return fail(404, "not_found", "EIN application not found");
      }
      throw error;
    }
  }

  if ("ein" in parsedBody.data) {
    return fail(400, "invalid_request", "ein is not valid for an ITIN application");
  }
  const parsedStatus = parsedBody.data.status === undefined
    ? null
    : z.enum(ItinStatus).safeParse(parsedBody.data.status);
  if (parsedStatus && !parsedStatus.success) {
    return fail(400, "invalid_status", "Invalid ITIN application status");
  }

  try {
    const application = await prisma.itinApplication.update({
      where: { id: params.id },
      data: {
        ...(parsedStatus?.success ? { status: parsedStatus.data } : {}),
        ...(parsedBody.data.adminNotes !== undefined
          ? { adminNotes: parsedBody.data.adminNotes || null }
          : {}),
        ...(parsedBody.data.itin !== undefined
          ? { itin: parsedBody.data.itin || null }
          : {}),
      },
      select: {
        id: true,
        status: true,
        adminNotes: true,
        itin: true,
      },
    });
    return ok(application);
  } catch (error) {
    if (isNotFoundError(error)) {
      return fail(404, "not_found", "ITIN application not found");
    }
    throw error;
  }
});
