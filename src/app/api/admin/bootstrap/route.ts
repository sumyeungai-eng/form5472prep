import { z } from "zod";
import { fail, ok } from "@/lib/admin/api";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { decideBootstrap } from "./decide";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1)
      .refine((value) => value.includes("@"))
      .transform((value) => value.toLowerCase()),
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
  const parsed = requestSchema.safeParse(
    await req.json().catch(() => undefined),
  );
  if (!parsed.success) {
    return fail(400, "invalid_request", "A valid email is required.");
  }

  const rateLimitResult = await rateLimit(
    "admin-bootstrap",
    "global",
    10,
    3600,
  );
  if (!rateLimitResult.ok) {
    const response = fail(
      429,
      "rate_limited",
      "Too many bootstrap requests. Please try again later.",
    );
    response.headers.set(
      "Retry-After",
      String(rateLimitResult.retryAfterSec),
    );
    return response;
  }

  const adminCount = await prisma.admin.count();
  const decision = decideBootstrap({
    email: parsed.data.email,
    adminCount,
    configuredEmail: process.env.ADMIN_EMAIL,
  });
  if (decision.kind === "deny") {
    return fail(decision.status, decision.code, decision.message);
  }

  try {
    const admin = await prisma.admin.create({
      data: { email: decision.email },
      select: { id: true, email: true },
    });
    console.warn("[admin/bootstrap] first admin created");
    return ok(admin);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fail(
        403,
        "already_bootstrapped",
        "An admin account already exists.",
      );
    }
    throw error;
  }
}
