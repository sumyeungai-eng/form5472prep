import { z } from "zod";
import { fail, ok } from "@/lib/admin/api";
import {
  issueDeviceToken,
  verifyAdminLoginToken,
} from "@/lib/admin/identity";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const exchangeSchema = z
  .object({
    token: z.string().trim().min(1),
    deviceName: z.string().trim().max(100).optional(),
  })
  .strict();

export async function POST(req: Request): Promise<Response> {
  try {
    const parsed = exchangeSchema.safeParse(
      await req.json().catch(() => undefined),
    );
    if (!parsed.success) {
      return fail(
        400,
        "invalid_request",
        "A login token and valid device name are required",
      );
    }

    const adminId = await verifyAdminLoginToken(parsed.data.token);
    if (!adminId) {
      return fail(
        401,
        "invalid_token",
        "Login link is invalid or has expired",
      );
    }

    const { token: deviceToken, expiresAt } = await issueDeviceToken(
      adminId,
      parsed.data.deviceName,
    );
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });
    if (!admin) throw new Error("Admin disappeared during token exchange");

    return ok({
      deviceToken,
      expiresAt: expiresAt.toISOString(),
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (err) {
    console.error("[admin/v1/auth/exchange] handler error", err);
    return fail(500, "internal_error", "Something went wrong");
  }
}
