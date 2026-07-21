import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitFax } from "@/lib/fax";
import { publicUrl, get as getStorageObject, putPdf } from "@/lib/storage";
import { env } from "@/lib/env";
import {
  sendFaxDeliveredEmail,
  sendFaxFailedEmail,
  sendFaxDeliveredAdminEmail,
  sendFaxFailedAdminEmail,
  type FaxProof,
} from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";
import { generateFaxReceiptPdf } from "@/lib/pdf/faxReceipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Telnyx fax webhook. Configure your fax connection's webhook URL to
// {NEXT_PUBLIC_APP_URL}/api/telnyx-webhook. Events we care about:
//   fax.delivered, fax.failed, fax.sending.failed, fax.delivery.delayed

const MAX_RETRIES = 3;
// Reject events whose timestamp is older than this — blocks replay of a
// previously-captured valid webhook.
const MAX_TIMESTAMP_SKEW_SECS = 60 * 5;

// Verify Telnyx's Ed25519 webhook signature. Telnyx signs the string
// `${timestamp}|${rawBody}` with their private key; we verify against the
// public key from the Telnyx portal (TELNYX_PUBLIC_KEY, base64-encoded).
//
// SECURITY: when the public key is configured we FAIL CLOSED — an invalid or
// missing signature is rejected. If the key is NOT set (local/sandbox), we
// skip verification so dev flows keep working. Set TELNYX_PUBLIC_KEY in
// production so forged fax.delivered / fax.failed events can't move filings.
function verifyTelnyxSignature(rawBody: string, req: Request): boolean {
  const publicKeyB64 = process.env.TELNYX_PUBLIC_KEY;
  if (!publicKeyB64) {
    // No key configured — sandbox/local. Don't block, but make it loud.
    console.warn("[telnyx-webhook] TELNYX_PUBLIC_KEY not set — skipping signature verification");
    return true;
  }
  const signatureB64 = req.headers.get("telnyx-signature-ed25519-signature");
  const timestamp = req.headers.get("telnyx-signature-ed25519-timestamp");
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
    return crypto.verify(
      null,
      Buffer.from(signedPayload),
      publicKey,
      Buffer.from(signatureB64, "base64"),
    );
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
  const evt = body?.data?.event_type as string | undefined;
  const faxId = body?.data?.payload?.fax_id as string | undefined;
  if (!faxId) return NextResponse.json({ ok: true });

  const filing = await prisma.filing.findFirst({
    where: { faxJobId: faxId },
    include: { user: true },
  });
  if (!filing) return NextResponse.json({ ok: true });

  if (evt === "fax.delivered") {
    const submittedAtIso = (body?.data?.payload?.created_at as string) ?? new Date().toISOString();
    const deliveredAtIso = (body?.data?.payload?.updated_at as string) ?? new Date().toISOString();

    // Atomic claim — race-safe against the fax-status-poll cron firing for
    // the same fax in its 5-min window. updateMany returns the number of
    // rows actually matched; if it's 0, the cron (or a re-delivery of the
    // webhook) already flipped this filing to CONFIRMED, and we MUST skip
    // the rest of this handler so the operator doesn't get duplicate
    // "Fax delivered" admin emails + duplicate fax-receipt PDFs.
    const claim = await prisma.filing.updateMany({
      where: { id: filing.id, status: { not: "CONFIRMED" } },
      data: { faxStatus: "delivered", status: "CONFIRMED" },
    });
    if (claim.count === 0) {
      console.log(`[telnyx-webhook] ${filing.id} already CONFIRMED — skipping duplicate fax.delivered`);
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    const proof: FaxProof = {
      faxId,
      deliveredAt: deliveredAtIso,
      pageCount: (body?.data?.payload?.page_count as number | undefined) ?? null,
      durationSecs: (body?.data?.payload?.call_duration_secs as number | undefined) ?? null,
      from: (body?.data?.payload?.from as string | undefined) ?? null,
      to: (body?.data?.payload?.to as string | undefined) ?? env.telnyx.destination,
    };
    const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;

    // Pull the exact PDF that was faxed and attach it to the customer's
    // proof email. Missing key isn't fatal — we still send the email body.
    let signedPdfBytes: Uint8Array | undefined;
    if (filing.signedPdfKey) {
      try {
        signedPdfBytes = await getStorageObject(filing.signedPdfKey);
      } catch (err) {
        console.error("[telnyx-webhook] could not read signed PDF for proof attachment", err);
      }
    }

    // Generate the timestamped IRS Fax Transmission Receipt PDF and store
    // it as `faxConfirmationKey`. Customer can re-download it from the
    // portal, and we also attach it to the delivery email. Failure here
    // doesn't block the rest of the flow — the email body still includes
    // the same proof in human-readable form.
    let receiptPdfBytes: Uint8Array | undefined;
    try {
      receiptPdfBytes = await generateFaxReceiptPdf({
        filingId: filing.id,
        llcName: filing.llcName,
        llcEin: filing.llcEin,
        taxYears: filing.taxYears,
        ownerName: filing.ownerName,
        telnyxFaxId: faxId,
        fromFax: proof.from ?? null,
        toFax: proof.to ?? null,
        submittedAtIso,
        deliveredAtIso,
        pageCount: proof.pageCount ?? null,
      });
      const receiptKey = `${filing.id}_fax_receipt.pdf`;
      await putPdf(receiptKey, receiptPdfBytes);
      await prisma.filing.update({
        where: { id: filing.id },
        data: { faxConfirmationKey: receiptKey },
      });
    } catch (err) {
      console.error("[telnyx-webhook] receipt PDF generation/store failed", err);
    }

    if (filing.user) {
      try {
        // Customer email: only the fax-transmission receipt. The signed
        // package itself is already downloadable from their portal, so we
        // don't re-send the full PDF every time — keeps the attachment
        // small and avoids re-delivering taxpayer-identifying data over
        // email when not needed.
        await sendFaxDeliveredEmail({
          email: filing.user.email,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
          proof,
          receiptPdfBytes,
        });
      } catch (err) {
        console.error("[telnyx-webhook] fax delivered email failed", err);
      }
    }
    try {
      // Admin email: BOTH the receipt AND the frozen copy of the signed
      // package that was actually faxed. Saves the operator from having to
      // log into admin + download two files just to file the audit trail.
      await sendFaxDeliveredAdminEmail({
        adminEmail: env.adminEmail,
        customerEmail: filing.user?.email ?? null,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        filingId: filing.id,
        adminFilingUrl,
        proof,
        receiptPdfBytes,
        signedPdfBytes,
      });
    } catch (err) {
      console.error("[telnyx-webhook] admin fax delivered email failed", err);
    }
    return NextResponse.json({ ok: true });
  }

  if (evt === "fax.failed" || evt === "fax.sending.failed") {
    // The attempt ceiling must be driven by OUR own retry label, not Telnyx's
    // delivery_attempts: each retry calls submitFax() which creates a brand-new
    // fax job whose delivery_attempts resets to 0, so trusting the payload alone
    // would let us re-fax the IRS indefinitely. Derive from our "retry_N" label
    // and take the max of the two as a belt-and-braces cap.
    const labelMatch = filing.faxStatus?.match(/^retry_(\d+)$/);
    const appAttempts = labelMatch ? Number(labelMatch[1]) : 0;
    const retryCount = Math.max(appAttempts, Number(body?.data?.payload?.delivery_attempts ?? 0));
    // Re-fax the SAME bytes originally transmitted — the immutable snapshot
    // (faxedPdfKey) when present, falling back to signedPdfKey.
    const faxSource = filing.faxedPdfKey ?? filing.signedPdfKey;
    if (retryCount < MAX_RETRIES && faxSource) {
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
    const failureReason = (body?.data?.payload?.failure_reason as string | undefined) ?? null;
    const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;
    // Atomic claim — mirror the fax.delivered dedup. Only move to FAILED from a
    // still-in-flight state. Without this, a duplicate or out-of-order
    // fax.failed (e.g. an earlier retry attempt's event arriving after the fax
    // ultimately delivered) would regress CONFIRMED -> FAILED and send the
    // customer a false "your fax failed" email after they were already told it
    // delivered; two failure events would also double-send the failed emails.
    const claim = await prisma.filing.updateMany({
      where: { id: filing.id, status: { notIn: ["CONFIRMED", "FAILED"] } },
      data: {
        faxStatus: failureReason ? `failed:${failureReason}` : "failed",
        status: "FAILED",
      },
    });
    if (claim.count === 0) {
      console.log(`[telnyx-webhook] ${filing.id} already CONFIRMED/FAILED — skipping duplicate fax.failed`);
      return NextResponse.json({ ok: true, deduplicated: true });
    }
    if (filing.user) {
      try {
        await sendFaxFailedEmail({
          email: filing.user.email,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
        });
      } catch (err) {
        console.error("[telnyx-webhook] fax failed email failed", err);
      }
    }
    try {
      await sendFaxFailedAdminEmail({
        adminEmail: env.adminEmail,
        customerEmail: filing.user?.email ?? null,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        filingId: filing.id,
        adminFilingUrl,
        faxId,
        failureReason,
        deliveryAttempts: retryCount,
      });
    } catch (err) {
      console.error("[telnyx-webhook] admin fax failed email failed", err);
    }
    return NextResponse.json({ ok: true, gaveUp: true });
  }

  // Other event types — just record latest status.
  if (evt) {
    await prisma.filing.update({
      where: { id: filing.id },
      data: { faxStatus: evt.replace(/^fax\./, "") },
    });
  }
  return NextResponse.json({ ok: true });
}
