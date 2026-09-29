import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitFax } from "@/lib/fax";
import { publicUrl } from "@/lib/storage";
import { env } from "@/lib/env";
import { parseInboundFaxEvent, inboundFaxAllowed, ingestInboundFax } from "@/lib/inboundFax";
import { finalizeFaxDelivered, finalizeFaxFailed } from "@/lib/fax/finalize";
import {
  deliveryFactsFromTelnyx,
  fetchTelnyxFax,
  isRetryLabel,
  isTelnyxFailedStatus,
  isTerminalFaxStatus,
  TELNYX_DELIVERED_STATUS,
  type TelnyxFaxLookup,
} from "@/lib/fax/telnyxStatus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Inbound faxes are downloaded inside this request (20 s fetch timeout + R2 write + email).
export const maxDuration = 60;

// Telnyx fax webhook. Configure your fax connection's webhook URL to
// {NEXT_PUBLIC_APP_URL}/api/telnyx-webhook. Events we care about:
//   fax.delivered, fax.failed, fax.sending.failed (terminal — confirmed with
//   the Telnyx API, then finalized via lib/fax/finalize.ts, the same path the
//   fax-status-poll cron uses) and in-progress events (display only).

const MAX_RETRIES = 3;
const TERMINAL_EVENTS: ReadonlySet<string> = new Set(["fax.delivered", "fax.failed", "fax.sending.failed"]);
// Reject events whose timestamp is older than this — blocks replay of a
// previously-captured valid webhook.
const MAX_TIMESTAMP_SKEW_SECS = 60 * 5;

// Verify Telnyx's Ed25519 webhook signature. Telnyx signs the string
// `${timestamp}|${rawBody}` with their private key; we verify against the
// public key from the Telnyx portal (TELNYX_PUBLIC_KEY, base64-encoded).
//
// SECURITY: when the public key is configured we FAIL CLOSED — an invalid or
// missing signature is rejected. If the key is NOT set we skip verification,
// but a forged fax.delivered / fax.failed still can't move a filing: terminal
// events are only acted on once Telnyx's own API confirms the status (see
// confirmWithTelnyx below). Setting TELNYX_PUBLIC_KEY in production is still
// recommended — it also gates inbound faxes and blocks forged display updates.
function verifyTelnyxSignature(rawBody: string, req: Request): boolean {
  const publicKeyB64 = process.env.TELNYX_PUBLIC_KEY;
  if (!publicKeyB64) {
    // No key configured — sandbox/local. Don't block, but make it loud.
    console.error("[telnyx-webhook] SIGNATURE VERIFICATION DISABLED — TELNYX_PUBLIC_KEY not set");
    return true;
  }
  const signatureB64 = req.headers.get("telnyx-signature-ed25519");
  const timestamp = req.headers.get("telnyx-timestamp");
  if (!signatureB64 || !timestamp) {
    console.error("[telnyx-webhook] missing signature headers");
    return false;
  }
  // Replay guard.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > MAX_TIMESTAMP_SKEW_SECS) {
    console.error("[telnyx-webhook] signature timestamp outside allowed skew");
    return false;
  }
  try {
    const signedPayload = `${timestamp}|${rawBody}`;
    const publicKey = crypto.createPublicKey({
      key: Buffer.concat([
        // DER prefix for an Ed25519 SubjectPublicKeyInfo wrapping the 32-byte key.
        Buffer.from("302a300506032b6570032100", "hex"),
        Buffer.from(publicKeyB64, "base64"),
      ]),
      format: "der",
      type: "spki",
    });
    const verified = crypto.verify(
      null,
      Buffer.from(signedPayload),
      publicKey,
      Buffer.from(signatureB64, "base64"),
    );
    if (!verified) {
      console.error("[telnyx-webhook] invalid signature");
    }
    return verified;
  } catch (err) {
    console.error("[telnyx-webhook] signature verification error", err);
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifyTelnyxSignature(rawBody, req)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let body: Record<string, unknown> & { data?: { event_type?: string; payload?: Record<string, unknown> } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = {};
  }
  const inboundEvt = parseInboundFaxEvent(body);
  if (inboundEvt) {
    if (!inboundFaxAllowed({ publicKeySet: !!process.env.TELNYX_PUBLIC_KEY, nodeEnv: process.env.NODE_ENV })) {
      console.error("[telnyx-webhook] inbound fax ignored - TELNYX_PUBLIC_KEY is not set (required in production for inbound faxes)");
      return NextResponse.json({ ok: true, ignored: "inbound fax requires TELNYX_PUBLIC_KEY" });
    }
    const result = await ingestInboundFax(inboundEvt);
    if (result.status === "failed") {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status: result.status });
  }
  // Other inbound-direction events that are not fax.received (e.g. fax.receiving.started/failed)
  // must not touch any Filing.
  if (body?.data?.payload?.direction === "inbound") {
    return NextResponse.json({ ok: true });
  }
  const rawEvt = body?.data?.event_type;
  const evt = typeof rawEvt === "string" ? rawEvt : undefined;
  const rawFaxId = body?.data?.payload?.fax_id;
  const faxId = typeof rawFaxId === "string" ? rawFaxId : undefined;
  if (!faxId) return NextResponse.json({ ok: true });

  const filing = await prisma.filing.findFirst({
    where: { faxJobId: faxId },
    include: { user: true },
  });
  if (!filing) return NextResponse.json({ ok: true });

  // ── Terminal events: confirm with Telnyx's API before acting ──
  // The payload is only a hint. Without a verified signature (and even with
  // one) a delivered/failed outcome moves the filing ONLY when Telnyx's own
  // authenticated API reports the same status for this fax id. If Telnyx
  // can't be reached we do nothing and answer 200 (so Telnyx doesn't storm
  // retries): the hourly fax-status-poll re-checks every non-terminal fax.
  if (evt && TERMINAL_EVENTS.has(evt)) {
    const payload = (body?.data?.payload ?? {}) as Record<string, unknown>;
    const confirmation = await confirmWithTelnyx(faxId, evt, payload);
    if (!confirmation.ok) {
      console.warn(
        `[telnyx-webhook] ${filing.id}: could not confirm ${evt} with the Telnyx API (${confirmation.error}) — leaving it for fax-status-poll`,
      );
      return NextResponse.json({ ok: true, deferred: "telnyx_unconfirmed" });
    }
    const tx = confirmation.fax;

    if (evt === "fax.delivered") {
      if (tx.status !== TELNYX_DELIVERED_STATUS) {
        console.warn(
          `[telnyx-webhook] ${filing.id}: fax.delivered received but Telnyx reports "${tx.status}" for ${faxId} — not acting; fax-status-poll reconciles from the API`,
        );
        return NextResponse.json({ ok: true, ignored: "status_mismatch" });
      }
      const result = await finalizeFaxDelivered(filing, deliveryFactsFromTelnyx(tx, payload), {
        source: "webhook",
      });
      if (!result.claimed) return NextResponse.json({ ok: true, deduplicated: true });
      return NextResponse.json({ ok: true });
    }

    // fax.failed / fax.sending.failed
    if (!isTelnyxFailedStatus(tx.status)) {
      console.warn(
        `[telnyx-webhook] ${filing.id}: ${evt} received but Telnyx reports "${tx.status}" for ${faxId} — not acting; fax-status-poll reconciles from the API`,
      );
      return NextResponse.json({ ok: true, ignored: "status_mismatch" });
    }
    // The attempt ceiling must be driven by OUR own retry label, not Telnyx's
    // delivery_attempts: each retry calls submitFax() which creates a brand-new
    // fax job whose delivery_attempts resets to 0, so trusting the payload alone
    // would let us re-fax the IRS indefinitely. Derive from our "retry_N" label
    // and take the max of the two as a belt-and-braces cap.
    const labelMatch = filing.faxStatus?.match(/^retry_(\d+)$/);
    const appAttempts = labelMatch ? Number(labelMatch[1]) : 0;
    const retryCount = Math.max(appAttempts, Number(payload.delivery_attempts ?? 0) || 0);
    // Re-fax the SAME bytes originally transmitted — the immutable snapshot
    // (faxedPdfKey) when present, falling back to signedPdfKey.
    const faxSource = filing.faxedPdfKey ?? filing.signedPdfKey;
    if (retryCount < MAX_RETRIES && faxSource) {
      if (filing.preflightStatus === "failed" && !filing.preflightOverrideBy) {
        console.error(
          `[telnyx-webhook] ${filing.id} fax retry held: Fax held: this package failed pre-flight checks. An admin must review it.`,
        );
        return NextResponse.json({ ok: true, held: "preflight_failed" });
      }
      // Atomic retry claim — race-safe against a duplicate/overlapping
      // fax.failed redelivery. Pin the CURRENT faxJobId AND faxStatus so two
      // concurrent events can't both pass and both re-fax the IRS: Postgres
      // serializes the UPDATEs, and the loser's WHERE (stale faxStatus) matches
      // 0 rows. Only the winner submits.
      const nextLabel = `retry_${retryCount + 1}`;
      const claim = await prisma.filing.updateMany({
        where: {
          id: filing.id,
          faxJobId: filing.faxJobId,
          faxStatus: filing.faxStatus,
          status: { notIn: ["CONFIRMED", "FAILED"] },
        },
        data: { faxStatus: `retrying_${retryCount + 1}` },
      });
      if (claim.count === 0) {
        return NextResponse.json({ ok: true, deduplicated: true });
      }
      const mediaUrl = await publicUrl(faxSource);
      let retry: Awaited<ReturnType<typeof submitFax>>;
      try {
        retry = await submitFax({ mediaUrl, to: env.telnyx.destination });
      } catch (err) {
        // submitFax threw after we claimed — release the claim so a later
        // event can retry instead of leaving the filing stuck at retrying_N.
        await prisma.filing
          .updateMany({
            where: { id: filing.id, faxStatus: `retrying_${retryCount + 1}` },
            data: { faxStatus: filing.faxStatus },
          })
          .catch(() => {});
        throw err;
      }
      await prisma.filing.update({
        where: { id: filing.id },
        data: { faxJobId: retry.id, faxStatus: nextLabel },
      });
      return NextResponse.json({ ok: true, retried: true });
    }
    // Retries exhausted (or nothing to re-send): the shared give-up path.
    // Its atomic claim only moves an in-flight filing to FAILED, so a late or
    // duplicate failure never regresses CONFIRMED or double-sends the emails.
    const failureReason =
      (typeof tx.failure_reason === "string" && tx.failure_reason) ||
      (typeof payload.failure_reason === "string" && payload.failure_reason) ||
      null;
    const result = await finalizeFaxFailed(
      filing,
      { faxId, failureReason, deliveryAttempts: retryCount },
      { source: "webhook" },
    );
    if (!result.claimed) return NextResponse.json({ ok: true, deduplicated: true });
    return NextResponse.json({ ok: true, gaveUp: true });
  }

  // ── In-progress events (queued, media.processed, sending.started, ...) ──
  // Display only: record the latest status so the admin page shows progress.
  // Never on a filing that already reached CONFIRMED/FAILED (a late event
  // must not overwrite "delivered"), and never over a retry_N / retrying_N
  // label — the failed path's attempt ceiling is derived from that label, so
  // clobbering it would let a failing fax be re-sent to the IRS indefinitely.
  // Whatever is stored here stays non-terminal, so fax-status-poll keeps
  // checking the fax until Telnyx reports an outcome.
  if (
    evt &&
    filing.status !== "CONFIRMED" &&
    filing.status !== "FAILED" &&
    !isRetryLabel(filing.faxStatus) &&
    !isTerminalFaxStatus(filing.faxStatus)
  ) {
    await prisma.filing.updateMany({
      where: {
        id: filing.id,
        faxJobId: faxId,
        faxStatus: filing.faxStatus,
        status: { notIn: ["CONFIRMED", "FAILED"] },
      },
      data: { faxStatus: evt.replace(/^fax\./, "") },
    });
  }
  return NextResponse.json({ ok: true });
}

// Ask Telnyx what actually happened to this fax. Local/sandbox only (no
// TELNYX_API_KEY outside production, where lib/fax.ts fakes submissions with
// sandbox_ ids Telnyx has never heard of): trust the payload so dev flows
// keep working. In production a missing key means we cannot confirm → defer.
async function confirmWithTelnyx(
  faxId: string,
  evt: string,
  payload: Record<string, unknown>,
): Promise<TelnyxFaxLookup> {
  if (!process.env.TELNYX_API_KEY && process.env.NODE_ENV !== "production") {
    console.error("[telnyx-webhook] TELNYX_API_KEY not set — trusting the payload (non-production only)");
    return {
      ok: true,
      fax: {
        id: faxId,
        status: evt === "fax.delivered" ? TELNYX_DELIVERED_STATUS : "failed",
        failure_reason: typeof payload.failure_reason === "string" ? payload.failure_reason : null,
      },
    };
  }
  return fetchTelnyxFax(faxId);
}
