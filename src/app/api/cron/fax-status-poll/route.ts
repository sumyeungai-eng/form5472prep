import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { makeMagicLink } from "@/lib/magicLink";
import { get as getStorageObject, putPdf } from "@/lib/storage";
import { generateFaxReceiptPdf } from "@/lib/pdf/faxReceipt";
import {
  sendFaxDeliveredEmail,
  sendFaxDeliveredAdminEmail,
  sendFaxFailedEmail,
  sendFaxFailedAdminEmail,
  type FaxProof,
} from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Reconciles fax delivery status against Telnyx for any filing whose webhook
// might have been missed. Runs every few minutes via Vercel Cron. Idempotent:
// we only act on filings still in an in-flight faxStatus (queued, sending,
// retry_*), so once the webhook OR a prior cron pass moves the row to
// CONFIRMED/FAILED it won't be re-processed.
//
// Rationale: Telnyx will hit /api/telnyx-webhook on every status change, but
// network blips or transient 5xx from us mean the webhook can silently fail.
// Without this poller, a stuck "queued" can sit forever and the customer
// never gets their proof-of-fax email.

const IN_FLIGHT = ["queued", "sending"];
const STALE_AFTER_DAYS = 7;

type TelnyxFax = {
  id: string;
  status: string; // queued | sending | delivered | failed | sending.failed
  failure_reason?: string | null;
  page_count?: number | null;
  call_duration_secs?: number | null;
  from?: string | null;
  to?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ skipped: "TELNYX_API_KEY not set" });
  }

  const sevenDaysAgo = new Date(Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000);

  // In-flight: faxStatus literally "queued" / "sending", OR one of our retry
  // labels ("retry_1", "retry_2", ...). Plain prisma 'in' can't easily express
  // both, so pull a slightly wider window and filter in JS.
  const candidates = await prisma.filing.findMany({
    where: {
      status: "FAXED",
      faxJobId: { not: null },
      updatedAt: { gte: sevenDaysAgo },
    },
    include: { user: true },
    take: 100,
  });

  const inFlight = candidates.filter(
    (f) => f.faxStatus && (IN_FLIGHT.includes(f.faxStatus) || f.faxStatus.startsWith("retry_")),
  );

  const result = {
    candidates: candidates.length,
    inFlight: inFlight.length,
    reconciled: 0,
    delivered: 0,
    failed: 0,
    stillSending: 0,
    errors: [] as string[],
  };

  for (const filing of inFlight) {
    try {
      const res = await fetch(`https://api.telnyx.com/v2/faxes/${filing.faxJobId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        result.errors.push(`${filing.id}: Telnyx GET ${res.status}`);
        continue;
      }
      const tx = ((await res.json()) as { data: TelnyxFax }).data;

      if (tx.status === "delivered") {
        await handleDelivered(filing, tx);
        result.delivered++;
        result.reconciled++;
      } else if (tx.status === "failed" || tx.status === "sending.failed") {
        await handleFailed(filing, tx);
        result.failed++;
        result.reconciled++;
      } else {
        // Still queued/sending — leave DB as-is so the next pass re-checks.
        result.stillSending++;
      }
    } catch (err) {
      result.errors.push(`${filing.id}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json(result);
}

async function handleDelivered(
  filing: { id: string; faxJobId: string | null; signedPdfKey: string | null; llcName: string | null; llcEin: string | null; ownerName: string | null; taxYears: number[]; userId: string | null; user: { email: string } | null },
  tx: TelnyxFax,
) {
  const submittedAtIso = tx.created_at ?? new Date().toISOString();
  const deliveredAtIso = tx.updated_at ?? new Date().toISOString();

  // Atomic claim — race-safe against the telnyx-webhook firing for the same
  // fax. updateMany returns the number of rows actually matched; if it's 0,
  // another path already flipped the filing to CONFIRMED and we MUST skip
  // the rest of this handler so the operator doesn't receive duplicate
  // "Fax delivered" admin emails + duplicate fax-receipt PDFs.
  const claim = await prisma.filing.updateMany({
    where: { id: filing.id, status: { not: "CONFIRMED" } },
    data: { faxStatus: "delivered", status: "CONFIRMED" },
  });
  if (claim.count === 0) {
    console.log(`[fax-status-poll] ${filing.id} already CONFIRMED — webhook beat us, skipping`);
    return;
  }

  const proof: FaxProof = {
    faxId: filing.faxJobId ?? tx.id,
    deliveredAt: deliveredAtIso,
    pageCount: tx.page_count ?? null,
    durationSecs: tx.call_duration_secs ?? null,
    from: tx.from ?? null,
    to: tx.to ?? env.telnyx.destination,
  };
  const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;

  let signedPdfBytes: Uint8Array | undefined;
  if (filing.signedPdfKey) {
    try {
      signedPdfBytes = await getStorageObject(filing.signedPdfKey);
    } catch (err) {
      console.error(`[fax-status-poll] read signed PDF for ${filing.id} failed`, err);
    }
  }

  // Generate + persist the IRS Fax Transmission Receipt PDF. Same generator
  // and storage key the telnyx-webhook uses, so the customer always ends up
  // with one receipt regardless of which path detected the delivery.
  let receiptPdfBytes: Uint8Array | undefined;
  try {
    receiptPdfBytes = await generateFaxReceiptPdf({
      filingId: filing.id,
      llcName: filing.llcName,
      llcEin: filing.llcEin,
      taxYears: filing.taxYears,
      ownerName: filing.ownerName,
      telnyxFaxId: filing.faxJobId ?? tx.id,
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
    console.error(`[fax-status-poll] receipt PDF for ${filing.id} failed`, err);
  }

  if (filing.user && filing.userId) {
    try {
      // Customer: receipt only (signed package stays in portal).
      await sendFaxDeliveredEmail({
        email: filing.user.email,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        portalLink: makeMagicLink(filing.userId),
        proof,
        receiptPdfBytes,
      });
    } catch (err) {
      console.error(`[fax-status-poll] customer delivered email for ${filing.id} failed`, err);
    }
  }
  try {
    // Admin: receipt + frozen signed PDF, both in one email.
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
    console.error(`[fax-status-poll] admin delivered email for ${filing.id} failed`, err);
  }
}

async function handleFailed(
  filing: { id: string; faxJobId: string | null; llcName: string | null; taxYears: number[]; userId: string | null; user: { email: string } | null },
  tx: TelnyxFax,
) {
  const failureReason = tx.failure_reason ?? null;
  await prisma.filing.update({
    where: { id: filing.id },
    data: {
      faxStatus: failureReason ? `failed:${failureReason}` : "failed",
      status: "FAILED",
    },
  });

  const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;
  if (filing.user && filing.userId) {
    try {
      await sendFaxFailedEmail({
        email: filing.user.email,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        portalLink: makeMagicLink(filing.userId),
      });
    } catch (err) {
      console.error(`[fax-status-poll] customer failed email for ${filing.id} failed`, err);
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
      faxId: filing.faxJobId ?? tx.id,
      failureReason,
      deliveryAttempts: 0, // not known here; webhook path tracks attempts
    });
  } catch (err) {
    console.error(`[fax-status-poll] admin failed email for ${filing.id} failed`, err);
  }
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev fallback (matches other crons)
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}
