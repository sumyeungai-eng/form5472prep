import { z } from "zod";
import { fail, ok, withAdminAuth } from "@/lib/admin/api";
import {
  FilingNotFoundError,
  postAdminMessage,
} from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const POST = withAdminAuth(async (req, { principal, params }) => {
  if (principal.adminId === null) {
    return fail(
      403,
      "identity_required",
      "This action requires a personal admin account. Sign in with a magic link.",
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      400,
      "invalid_request",
      "body is required and must be 1-5000 characters",
    );
  }

  try {
    const { message } = await postAdminMessage(params.id, parsed.data.body);
    return ok({
      message: {
        id: message.id,
        fromAdmin: message.fromAdmin,
        body: message.body,
        readAt: message.readAt?.toISOString() ?? null,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof FilingNotFoundError) {
      return fail(404, "not_found", "Filing not found");
    }
    throw error;
  }
});
