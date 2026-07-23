import { z } from "zod";
import { fail } from "@/lib/admin/api";
import { makeAdminLoginLink } from "@/lib/admin/identity";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1)
      .refine((value) => value.includes("@")),
  })
  .strict();

export async function POST(req: Request): Promise<Response> {
  const parsed = requestSchema.safeParse(
    await req.json().catch(() => undefined),
  );
  if (!parsed.success) {
    return fail(400, "invalid_request", "A valid email is required");
  }

  const email = parsed.data.email.trim().toLowerCase();
  const rateLimitResult = await rateLimit(
    "admin-v1-request-link",
    email,
    5,
    3600,
  );
  if (!rateLimitResult.ok) {
    // This limit is keyed only by the submitted email, so a 429 reveals no
    // account-existence information while still protecting admin inboxes.
    const response = fail(
      429,
      "rate_limited",
      "Too many login-link requests. Please try again later",
    );
    response.headers.set(
      "Retry-After",
      String(rateLimitResult.retryAfterSec),
    );
    return response;
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true, active: true },
    });

    if (admin?.active) {
      const link = await makeAdminLoginLink(admin.id);
      const token = link.slice(link.lastIndexOf("/") + 1);
      const appLink = `form5472admin://auth/${token}`;
      await sendEmail({
        to: email,
        subject: "Your Form5472 Prep admin sign-in link",
        html: `<p>Use this secure link to sign in to Form5472 Prep:</p><p><a href="${link}">Sign in on the web</a></p><p><a href="${appLink}">Sign in on the iPhone app</a></p><p>This link expires in 15 minutes and can only be used once. Using either link consumes it, so pick the surface you actually want to use.</p>`,
        text: `Use this secure link to sign in to Form5472 Prep:\n\nSign in on the web:\n${link}\n\nSign in on the iPhone app:\n${appLink}\n\nThis link expires in 15 minutes and can only be used once. Using either link consumes it, so pick the surface you actually want to use.`,
      });
    }
  } catch (err) {
    // Account lookup, token creation, and email delivery are deliberately
    // indistinguishable to the caller to prevent admin-email enumeration.
    console.error("[admin/v1/auth/request-link] delivery failed", err);
  }

  return new Response(null, { status: 204 });
}
