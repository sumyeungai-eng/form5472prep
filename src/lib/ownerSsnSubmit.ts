import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rateLimit";
import { sendOwnerSsnAddedAdminEmail } from "@/lib/email";
import { rerunPreflightAfterOwnerSsnChange } from "@/lib/admin/filingActions";
import { OWNER_SSN_CHANGE_FIELD, OwnerSsnError, saveOwnerSsn } from "@/lib/ownerSsn";

// The client's own SSN entry (POST /api/filings/[id]/ssn), after the route has
// checked the caller owns the filing. Spec docs/reviews/2026-10-15-ssn-capture-spec.md
// S4/S5: validate + encrypt + store + masked change log, then tell the admin
// (without the number) and re-run pre-flight. Neither follow-up can fail the
// save. The response body is ONLY { ok, last4, submittedAt } or { error }.

export type ClientSsnResponse =
  | { status: 200; body: { ok: true; last4: string; submittedAt: string } }
  | { status: number; body: { error: string } };

const SUBMIT_LIMIT = 10;
const SUBMIT_WINDOW_SEC = 60 * 60;
// One admin email per filing per window; later saves in the window are still
// stored and change-logged (the admin page shows the latest).
const ADMIN_EMAIL_THROTTLE_MS = 10 * 60 * 1000;

export async function submitClientOwnerSsn(filingId: string, payload: unknown): Promise<ClientSsnResponse> {
  const limited = await rateLimit("ssn-submit", filingId, SUBMIT_LIMIT, SUBMIT_WINDOW_SEC);
  if (!limited.ok) {
    return { status: 429, body: { error: "Too many attempts. Please wait a while and try again, or contact support." } };
  }

  const body = (payload && typeof payload === "object" ? payload : {}) as { ssn?: unknown; confirm?: unknown };
  let saved: Awaited<ReturnType<typeof saveOwnerSsn>>;
  try {
    saved = await saveOwnerSsn({
      filingId,
      ssn: body.ssn,
      confirm: body.confirm,
      submittedBy: "client",
      adminId: null,
      source: "customer",
    });
  } catch (err) {
    if (err instanceof OwnerSsnError) return { status: err.status, body: { error: err.message } };
    // Never log the error object: a database error can echo the arguments
    // (the ciphertext). The name is enough to find it.
    console.error(`[ssn] client save for ${filingId} failed (${err instanceof Error ? err.name : "unknown"})`);
    return { status: 500, body: { error: "We couldn't save your SSN. Please try again, or contact support." } };
  }

  await notifyAdmin(filingId, saved.replaced);
  await rerunPreflightAfterOwnerSsnChange(filingId, { adminId: null, changeSource: "customer" });

  return {
    status: 200,
    body: { ok: true, last4: saved.last4, submittedAt: saved.submittedAt.toISOString() },
  };
}

async function notifyAdmin(filingId: string, replaced: boolean): Promise<void> {
  try {
    const recent = await prisma.filingChangeLog.count({
      where: {
        filingId,
        field: OWNER_SSN_CHANGE_FIELD,
        source: "customer",
        changedAt: { gte: new Date(Date.now() - ADMIN_EMAIL_THROTTLE_MS) },
      },
    });
    // The save just wrote one row; more than that means an email already went
    // out for this filing in the window.
    if (recent > 1) return;
    const filing = await prisma.filing.findUnique({
      where: { id: filingId },
      select: { llcName: true, taxYears: true },
    });
    await sendOwnerSsnAddedAdminEmail({
      adminEmail: env.adminEmail,
      llcName: filing?.llcName ?? null,
      taxYears: filing?.taxYears ?? [],
      filingId,
      adminFilingUrl: `${env.appUrl}/admin/filings/${filingId}`,
      replaced,
    });
  } catch (err) {
    // The SSN is saved either way; the admin page shows it on file.
    console.error(`[ssn] admin notification for ${filingId} failed`, err instanceof Error ? err.message : err);
  }
}
