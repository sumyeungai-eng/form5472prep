import { z } from "zod";
import { fail, ok } from "@/lib/admin/api";
import { verifyPassword } from "@/lib/admin/auth";
import { issueDeviceToken } from "@/lib/admin/identity";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { decideLogin, type LoginDecision } from "./logic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1)
      .refine((value) => value.includes("@"))
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1),
    deviceName: z.string().trim().max(100).optional(),
  })
  .strict();

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(req: Request): Promise<Response> {
  try {
    const parsed = loginSchema.safeParse(
      await req.json().catch(() => undefined),
    );
    if (!parsed.success) {
      return fail(
        400,
        "invalid_request",
        "A valid email and password are required.",
      );
    }

    const { email, password, deviceName } = parsed.data;
    const rateLimitResult = await rateLimit(
      "admin-v1-login",
      email,
      10,
      3600,
    );
    if (!rateLimitResult.ok) {
      const response = fail(
        429,
        "rate_limited",
        "Too many login attempts. Please try again later.",
      );
      response.headers.set(
        "Retry-After",
        String(rateLimitResult.retryAfterSec),
      );
      return response;
    }

    const passwordOk = verifyPassword(password);
    if (!passwordOk) {
      return fail(
        401,
        "invalid_credentials",
        "Email or password is incorrect.",
      );
    }

    let admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, active: true },
    });
    const adminCount = admin ? 0 : await prisma.admin.count();
    const decision: LoginDecision = decideLogin({
      adminExists: admin !== null,
      adminActive: admin?.active ?? null,
      adminCount,
      passwordOk,
    });

    if (decision.kind === "bootstrap") {
      try {
        admin = await prisma.admin.create({
          data: { email },
          select: { id: true, email: true, name: true, active: true },
        });
        console.warn("[admin/v1/auth/login] first admin created");
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error;
        }

        admin = await prisma.admin.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, active: true },
        });
      }
    }

    if (
      decision.kind === "deny" ||
      !admin ||
      !admin.active
    ) {
      return fail(
        401,
        "invalid_credentials",
        "Email or password is incorrect.",
      );
    }

    admin = await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
      select: { id: true, email: true, name: true, active: true },
    });
    const { token: deviceToken, expiresAt } = await issueDeviceToken(
      admin.id,
      deviceName,
    );

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
    console.error("[admin/v1/auth/login] handler error", err);
    return fail(500, "internal_error", "Something went wrong");
  }
}
