import { z } from "zod";
import { fail, ok, withAdminAuth } from "@/lib/admin/api";
import {
  FILING_ACTION_NAMES,
  FilingActionError,
  runFilingAction,
  SIDE_EFFECTING_ACTIONS,
} from "@/lib/admin/filingActions";
import {
  IdempotencyConflictError,
  TransitionError,
  withIdempotency,
} from "@/lib/admin/mutations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const actionSchema = z.enum(FILING_ACTION_NAMES);
const requestSchema = z.object({
  action: actionSchema,
  payload: z.unknown().optional(),
  idempotencyKey: z.string().optional(),
  force: z.boolean().optional(),
  reason: z.string().optional(),
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
  const actionCandidate = z.object({ action: z.unknown() }).safeParse(body);
  if (!actionCandidate.success || !actionSchema.safeParse(actionCandidate.data.action).success) {
    return fail(400, "invalid_action", "Action must be one of the supported filing actions");
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "invalid_request", "The filing action request is invalid");
  }

  const { action, payload, idempotencyKey, force, reason } = parsed.data;
  if (SIDE_EFFECTING_ACTIONS.has(action) && (!idempotencyKey || idempotencyKey.trim() === "")) {
    return fail(
      400,
      "idempotency_key_required",
      "An idempotency key is required for this side-effecting action",
    );
  }

  const adminId = principal.adminId;
  try {
    const { result, replayed } = await withIdempotency({
      key: idempotencyKey ?? null,
      scope: `filing:${params.id}:${action}`,
      adminId,
      run: () => runFilingAction(params.id, action, payload, {
        adminId,
        force: !!force,
        reason,
      }),
    });
    return ok({ ...result, replayed });
  } catch (error) {
    if (error instanceof IdempotencyConflictError) {
      return fail(
        409,
        "operation_in_progress",
        "An operation with this idempotency key is already in progress",
      );
    }
    if (error instanceof TransitionError) {
      return fail(
        409,
        "illegal_transition",
        `Illegal filing status transition from ${error.from} to ${error.to}`,
      );
    }
    if (error instanceof FilingActionError) {
      return fail(error.status, error.code, error.message);
    }
    throw error;
  }
});
