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
//
// Telnyx signs webhooks; in production you should verify the signature
// (telnyx-signature-ed25519-signature, telnyx-signature-ed25519-timestamp,
// against the public key from the Telnyx portal). Skipped in this scaffold.

const MAX_RETRIES = 3;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
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
    const retryCount = Number(body?.data?.payload?.delivery_attempts ?? 0);
    if (retryCount < MAX_RETRIES && filing.signedPdfKey) {
      // Re-submit with a fresh job; persist the new id.
      const mediaUrl = await publicUrl(filing.signedPdfKey);
      const retry = await submitFax({ mediaUrl, to: env.telnyx.destination });
      await prisma.filing.update({
        where: { id: filing.id },
        data: { faxJobId: retry.id, faxStatus: `retry_${retryCount + 1}` },
      });
      return NextResponse.json({ ok: true, retried: true });
    }
    const failureReason = (body?.data?.payload?.failure_reason as string | undefined) ?? null;
    const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;
    await prisma.filing.update({
      where: { id: filing.id },
      data: {
        faxStatus: failureReason ? `failed:${failureReason}` : "failed",
        status: "FAILED",
      },
    });
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
