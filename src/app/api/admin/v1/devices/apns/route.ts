import crypto from "node:crypto";
import { z } from "zod";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { fail } from "@/lib/admin/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registrationSchema = z
  .object({
    apnsToken: z.string().regex(/^[0-9a-fA-F]{64,}$/),
    environment: z.enum(["sandbox", "production"]),
  })
  .strict();

function bearerToken(req: Request): string | null {
  const match = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  return match?.[1].trim() || null;
}

function hashDeviceToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

async function authenticatedDevice(req: Request): Promise<{
  tokenHash: string;
} | null> {
  const token = bearerToken(req);
  if (!token) return null;

  const principal = await getAdminPrincipal(req);
  if (
    !principal ||
    principal.via !== "bearer" ||
    !principal.adminId
  ) {
    return null;
  }

  return { tokenHash: hashDeviceToken(token) };
}

export async function POST(req: Request): Promise<Response> {
  try {
    const device = await authenticatedDevice(req);
    if (!device) {
      return fail(401, "unauthorized", "Admin authentication required");
    }

    const parsed = registrationSchema.safeParse(
      await req.json().catch(() => undefined),
    );
    if (!parsed.success) {
      return fail(400, "invalid_request", "Invalid APNs registration");
    }

    await prisma.adminDeviceToken.update({
      where: { tokenHash: device.tokenHash },
      data: {
        apnsToken: parsed.data.apnsToken,
        apnsEnvironment: parsed.data.environment,
        apnsUpdatedAt: new Date(),
      },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[admin/v1/devices/apns] registration failed", error);
    return fail(500, "internal_error", "Something went wrong");
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const device = await authenticatedDevice(req);
    if (!device) {
      return fail(401, "unauthorized", "Admin authentication required");
    }

    await prisma.adminDeviceToken.update({
      where: { tokenHash: device.tokenHash },
      data: {
        apnsToken: null,
        apnsEnvironment: null,
        apnsUpdatedAt: null,
      },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[admin/v1/devices/apns] deregistration failed", error);
    return fail(500, "internal_error", "Something went wrong");
  }
}
