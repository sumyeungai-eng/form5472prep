// The ONE finalize path for an outbound IRS fax, shared by the Telnyx webhook
// (/api/telnyx-webhook) and its hourly backstop (/api/cron/fax-status-poll).
//
// Exactly-once contract: each function starts with an atomic claim
// (updateMany with a status guard). Postgres serialises the UPDATEs, so when
// the webhook and the poll race on the same fax only ONE caller sees
// count === 1; only that caller generates the receipt and sends email. The
// loser returns { claimed: false } and does nothing else.
//
// Callers must only invoke these after Telnyx's own API has confirmed the
// outcome (see lib/fax/telnyxStatus.ts) — never on an unverified payload.

import type { FilingStatus } from "@prisma/client";
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
} from "@/lib/email";
import { apnsConfigured, sendAdminPush } from "@/lib/apns";
import { brandForFiling } from "@/lib/partnerBrand";
import { logFilingChange } from "@/lib/admin/mutations";
import { faxProofFromFacts, type FaxDeliveryFacts } from "@/lib/fax/telnyxStatus";

export type FaxDetectionSource = "webhook" | "poll";

// The filing columns finalize needs. Both callers load the row with
// `include: { user: true }`, which satisfies this shape.
export type FaxFinalizeFiling = {
  id: string;
  status: FilingStatus;
  faxJobId: string | null;
  faxStatus: string | null;
  signedPdfKey: string | null;
  llcName: string | null;
  llcEin: string | null;
  ownerName: string | null;
  taxYears: number[];
  isFinalReturn: boolean;
  dissolvedAt: Date | null;
  userId: string | null;
  user: { id: string; email: string } | null;
};

export type FinalizeDeliveredResult = {
  claimed: boolean;
  receiptStored: boolean;
  customerEmailed: boolean;
  adminEmailed: boolean;
};

export type FinalizeFailedResult = {
  claimed: boolean;
  customerEmailed: boolean;
  adminEmailed: boolean;
};

// Same key the customer portal and admin page read the receipt from.
export function faxReceiptKey(filingId: string): string {
  return `${filingId}_fax_receipt.pdf`;
}

async function safeChangeLog(
  tag: string,
  entry: { filingId: string; field: string; before: unknown; after: unknown; reason: string },
): Promise<void> {
  try {
    await logFilingChange({ ...entry, adminId: null, source: "system" });
  } catch (err) {
    console.error(`[${tag}] change-log write for ${entry.filingId} failed`, err);
  }
}

async function safeBrand(tag: string, filingId: string) {
  try {
    return (await brandForFiling(filingId)) ?? undefined;
  } catch (err) {
    console.error(`[${tag}] brand lookup for ${filingId} failed`, err);
    return undefined;
  }
}

export async function finalizeFaxDelivered(
  filing: FaxFinalizeFiling,
  facts: FaxDeliveryFacts,
  opts: { source: FaxDetectionSource },
): Promise<FinalizeDeliveredResult> {
  const tag = `fax-finalize:${opts.source}`;
  const result: FinalizeDeliveredResult = {
    claimed: false,
    receiptStored: false,
    customerEmailed: false,
    adminEmailed: false,
  };

  // Atomic claim. count === 0 means the other path (or a redelivered event)
  // already confirmed this filing — do NOTHING else, or the customer and the
  // operator get duplicate emails and a second receipt.
  const claim = await prisma.filing.updateMany({
    where: { id: filing.id, status: { not: "CONFIRMED" } },
    data: { faxStatus: "delivered", status: "CONFIRMED" },
  });
  if (claim.count !== 1) {
    console.log(`[${tag}] ${filing.id} already CONFIRMED — skipping duplicate delivery`);
    return result;
  }
  result.claimed = true;

  await safeChangeLog(tag, {
    filingId: filing.id,
    field: "status",
    before: { status: filing.status, faxStatus: filing.faxStatus },
    after: { status: "CONFIRMED", faxStatus: "delivered", faxId: facts.faxId },
    reason: `Fax delivery confirmed via the Telnyx API (detected by ${opts.source})`,
  });

  const proof = faxProofFromFacts(facts);
  const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;

  // The exact PDF that was faxed, for the ADMIN copy only (customer email
  // stays small — the package is in their portal). Missing key isn't fatal.
  let signedPdfBytes: Uint8Array | undefined;
  if (filing.signedPdfKey) {
    try {
      signedPdfBytes = await getStorageObject(filing.signedPdfKey);
    } catch (err) {
      console.error(`[${tag}] could not read signed PDF for ${filing.id}`, err);
    }
  }

  // Timestamped IRS Fax Transmission Receipt → faxConfirmationKey. Failure
  // doesn't block the emails; their body carries the same proof as text.
  let receiptPdfBytes: Uint8Array | undefined;
  try {
    receiptPdfBytes = await generateFaxReceiptPdf({
      filingId: filing.id,
      llcName: filing.llcName,
      llcEin: filing.llcEin,
      taxYears: filing.taxYears,
      ownerName: filing.ownerName,
      telnyxFaxId: facts.faxId,
      fromFax: proof.from ?? null,
      toFax: proof.to ?? null,
      submittedAtIso: facts.submittedAtIso,
      deliveredAtIso: facts.deliveredAtIso,
      pageCount: proof.pageCount ?? null,
    });
    const receiptKey = faxReceiptKey(filing.id);
    await putPdf(receiptKey, receiptPdfBytes);
    await prisma.filing.update({
      where: { id: filing.id },
      data: { faxConfirmationKey: receiptKey },
      select: { id: true },
    });
    result.receiptStored = true;
  } catch (err) {
    console.error(`[${tag}] receipt PDF generation/store for ${filing.id} failed`, err);
  }

  const customerUserId = filing.user?.id ?? filing.userId;
  if (filing.user && customerUserId) {
    const brand = await safeBrand(tag, filing.id);
    try {
      await sendFaxDeliveredEmail({
        email: filing.user.email,
        recipientName: filing.ownerName,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        portalLink: makeMagicLink(customerUserId),
        proof,
        receiptPdfBytes,
        isFinalReturn: filing.isFinalReturn,
        dissolvedAt: filing.dissolvedAt,
        brand,
        filingId: filing.id,
        logKind: "fax_delivered",
      });
      result.customerEmailed = true;
    } catch (err) {
      console.error(`[${tag}] customer delivered email for ${filing.id} failed`, err);
    }
  }

  try {
    // Admin: receipt + frozen signed package, both attached.
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
    result.adminEmailed = true;
  } catch (err) {
    console.error(`[${tag}] admin delivered email for ${filing.id} failed`, err);
  }

  if (apnsConfigured()) {
    try {
      await sendAdminPush({
        title: "Fax delivered",
        body: `${filing.llcName ?? filing.id} — delivered to IRS`,
        threadId: filing.id,
      });
    } catch {}
  }
  return result;
}

// Give-up path for a fax Telnyx has confirmed failed and that will NOT be
// retried (the webhook decides retries before calling this; the poll never
// retries). Only moves to FAILED from a still-in-flight status, so a late or
// duplicate failure can never regress a CONFIRMED filing or double-email.
export async function finalizeFaxFailed(
  filing: FaxFinalizeFiling,
  failure: { faxId: string; failureReason: string | null; deliveryAttempts: number },
  opts: { source: FaxDetectionSource },
): Promise<FinalizeFailedResult> {
  const tag = `fax-finalize:${opts.source}`;
  const result: FinalizeFailedResult = { claimed: false, customerEmailed: false, adminEmailed: false };
  const faxStatus = failure.failureReason ? `failed:${failure.failureReason}` : "failed";

  const claim = await prisma.filing.updateMany({
    where: { id: filing.id, status: { notIn: ["CONFIRMED", "FAILED"] } },
    data: { faxStatus, status: "FAILED" },
  });
  if (claim.count !== 1) {
    console.log(`[${tag}] ${filing.id} already CONFIRMED/FAILED — skipping duplicate failure`);
    return result;
  }
  result.claimed = true;

  await safeChangeLog(tag, {
    filingId: filing.id,
    field: "status",
    before: { status: filing.status, faxStatus: filing.faxStatus },
    after: { status: "FAILED", faxStatus, faxId: failure.faxId },
    reason: `Fax failure confirmed via the Telnyx API (detected by ${opts.source})`,
  });

  const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;
  const customerUserId = filing.user?.id ?? filing.userId;
  if (filing.user && customerUserId) {
    const brand = await safeBrand(tag, filing.id);
    try {
      await sendFaxFailedEmail({
        email: filing.user.email,
        recipientName: filing.ownerName,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        portalLink: makeMagicLink(customerUserId),
        brand,
        filingId: filing.id,
      });
      result.customerEmailed = true;
    } catch (err) {
      console.error(`[${tag}] customer failed email for ${filing.id} failed`, err);
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
      faxId: failure.faxId,
      failureReason: failure.failureReason,
      deliveryAttempts: failure.deliveryAttempts,
    });
    result.adminEmailed = true;
  } catch (err) {
    console.error(`[${tag}] admin failed email for ${filing.id} failed`, err);
  }
  if (apnsConfigured()) {
    try {
      await sendAdminPush({
        title: "Fax failed",
        body: `${filing.llcName ?? filing.id} — ${failure.failureReason ?? "unknown error"}`,
        threadId: filing.id,
      });
    } catch {}
  }
  return result;
}
