// Form 7004 extension orders: admin-triggered IRS fax and its outcome.
//
// One fax module (lib/fax.ts submitFax), one Telnyx connection, one webhook
// and one hourly poll — the Filing pipeline is untouched; the webhook and the
// poll fall through to this file only for fax jobs that belong to an
// ExtensionApplication. Differences from filings, on purpose:
//   - no automatic retry: a failed 7004 fax goes back to IN_REVIEW and staff
//     send it again from the admin page;
//   - the customer is emailed only on delivery (receipt + faxed form);
//     a failure alerts the admin only.
// The duplicate guard mirrors refaxDecision in lib/admin/filingActions.ts.

import type { Prisma } from "@prisma/client";
import { IRS_FAX_NUMBER } from "@/config/filingPackage";
import { env } from "@/lib/env";
import {
  sendExtensionFaxDeliveredAdminEmail,
  sendExtensionFaxedEmail,
  sendExtensionFaxFailedAdminEmail,
} from "@/lib/email";
import { submitFax, TelnyxSubmitRejectedError } from "@/lib/fax";
import { POLL_LOOKBACK_DAYS, POLL_MAX_ROWS, RETRY_CLAIM_GRACE_MS } from "@/lib/fax/pollCandidates";
import {
  deliveryFactsFromTelnyx,
  fetchTelnyxFax,
  isSandboxFaxId,
  isTelnyxFailedStatus,
  isTerminalFaxStatus,
  TELNYX_DELIVERED_STATUS,
  type FaxDeliveryFacts,
} from "@/lib/fax/telnyxStatus";
import { extensionDueDateUtc, formatExtensionDate } from "@/lib/form7004";
import { generateFaxReceiptPdf } from "@/lib/pdf/faxReceipt";
import { formatEin } from "@/lib/pdf/form7004";
import { prisma } from "@/lib/prisma";
import { get as getStorageObject, publicUrl, putPdf } from "@/lib/storage";
import { sendAdminTelegram } from "@/lib/telegram";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Held while a send is between "decided" and "recorded". After an ambiguous
// Telnyx answer it stays, so nothing sends again without a human.
export const EXTENSION_FAX_CLAIM = "submitting";
export const MIN_EXTENSION_REFAX_REASON_CHARS = 10;

export const extensionFormKey = (id: string) => `${id}_7004.pdf`;
export const extensionFaxedKey = (id: string) => `${id}_7004_faxed.pdf`;
export const extensionReceiptKey = (id: string) => `${id}_7004_fax_receipt.pdf`;

// Fields printed on the form. Changing any of them clears the generated PDF.
export const EXTENSION_FORM_FIELDS = ["llcName", "ein", "llcStreet", "llcCity", "llcState", "llcZip", "taxYear"] as const;

export const EXTENSION_FAX_SELECT = {
  id: true,
  status: true,
  fullName: true,
  email: true,
  llcName: true,
  ein: true,
  llcStreet: true,
  llcCity: true,
  llcState: true,
  llcZip: true,
  taxYear: true,
  adminNotes: true,
  generatedPdfKey: true,
  faxJobId: true,
  faxStatus: true,
  faxSentAt: true,
  faxDeliveredAt: true,
  updatedAt: true,
} satisfies Prisma.ExtensionApplicationSelect;

export type ExtensionFaxRow = Prisma.ExtensionApplicationGetPayload<{ select: typeof EXTENSION_FAX_SELECT }>;

export function auditLine(now: Date, text: string): string {
  return `[${now.toISOString().slice(0, 16).replace("T", " ")} UTC] ${text.replace(/[\r\n]+/g, " ")}`;
}

export function appendNote(notes: string | null | undefined, line: string): string {
  return (notes?.trim() ? `${notes.trim()}\n${line}` : line).slice(-5000);
}

// A fax job is "live" when it may still reach (or has reached) the IRS.
export function extensionFaxInFlight(app: Pick<ExtensionFaxRow, "faxJobId" | "faxStatus" | "faxDeliveredAt">): boolean {
  if (app.faxStatus === EXTENSION_FAX_CLAIM) return true;
  return !!app.faxJobId && !app.faxDeliveredAt && !isTerminalFaxStatus(app.faxStatus);
}

export type ExtensionFaxDecision =
  | { kind: "allowed" }
  | { kind: "needs_reason"; state: "stale_claim" | "delivered" | "in_flight" | "marked_completed" | "marked_faxing"; message: string }
  | { kind: "refused"; code: string; message: string };

const REASON_HINT = `To send anyway, give a reason (at least ${MIN_EXTENSION_REFAX_REASON_CHARS} characters).`;

export function extensionFaxDecision(
  app: Pick<ExtensionFaxRow, "status" | "llcName" | "ein" | "taxYear" | "generatedPdfKey" | "faxJobId" | "faxStatus" | "faxDeliveredAt" | "updatedAt">,
  now: Date,
): ExtensionFaxDecision {
  if (app.status === "CANCELLED" || app.status === "PAYMENT_PENDING") {
    return { kind: "refused", code: "order_not_active", message: `This order is ${app.status === "CANCELLED" ? "cancelled" : "not paid"} — nothing was faxed.` };
  }
  if (!app.generatedPdfKey) {
    return { kind: "refused", code: "no_generated_pdf", message: "Generate Form 7004 first (editing the order clears the old form) and check it before faxing." };
  }
  if (!app.llcName?.trim()) return { kind: "refused", code: "missing_llc_name", message: "The LLC name is missing. Add it, regenerate the form, then fax." };
  if (!formatEin(app.ein)) return { kind: "refused", code: "missing_ein", message: "The EIN is missing or not 9 digits. Fix it, regenerate the form, then fax." };
  if (!app.taxYear) return { kind: "refused", code: "missing_tax_year", message: "The tax year is missing. Add it, regenerate the form, then fax." };
  if (now.getTime() < Date.UTC(app.taxYear + 1, 0, 1)) {
    return {
      kind: "refused",
      code: "tax_year_not_ended",
      message: `Tax year ${app.taxYear} has not ended. We fax Form 7004 after the year ends — from 1 January ${app.taxYear + 1}.`,
    };
  }
  const due = extensionDueDateUtc(app.taxYear);
  // Timely through the whole due day (same convention as openExtensionTaxYears).
  if (now.getTime() >= due + ONE_DAY_MS) {
    return {
      kind: "refused",
      code: "due_date_passed",
      message: `The Form 7004 due date for tax year ${app.taxYear} (${formatExtensionDate(due)}) has passed. A late Form 7004 extends nothing — do not fax it; contact the client.`,
    };
  }

  if (app.faxStatus === EXTENSION_FAX_CLAIM) {
    const ageMs = now.getTime() - app.updatedAt.getTime();
    if (ageMs < RETRY_CLAIM_GRACE_MS) {
      return {
        kind: "refused",
        code: "fax_in_progress",
        message: "A fax for this order is being sent right now. Sending another could give the IRS a duplicate, so this is refused even with a reason. Refresh in a few minutes.",
      };
    }
    return {
      kind: "needs_reason",
      state: "stale_claim",
      message: `A fax for this order started ${Math.floor(ageMs / 60_000)} min ago and never recorded its result — it may or may not have reached Telnyx. Check Telnyx for an outbound fax to the IRS first. ${REASON_HINT}`,
    };
  }
  if (app.faxStatus === "delivered" || app.faxDeliveredAt) {
    return {
      kind: "needs_reason",
      state: "delivered",
      message: `Form 7004 for this order was already delivered to the IRS${app.faxJobId ? ` (fax ${app.faxJobId})` : ""}. Faxing again sends the IRS a second copy. ${REASON_HINT}`,
    };
  }
  if (app.faxJobId && !isTerminalFaxStatus(app.faxStatus)) {
    return {
      kind: "needs_reason",
      state: "in_flight",
      message: `Fax ${app.faxJobId} for this order has not reported an outcome yet (fax status ${app.faxStatus ?? "unknown"}). It may still reach the IRS — check Telnyx first. ${REASON_HINT}`,
    };
  }
  if (app.status === "COMPLETED") {
    return { kind: "needs_reason", state: "marked_completed", message: `This order is marked Completed — it may already have been faxed by hand. ${REASON_HINT}` };
  }
  if (app.status === "PROCESSING") {
    return { kind: "needs_reason", state: "marked_faxing", message: `This order is marked Faxing — someone may be faxing it by hand. ${REASON_HINT}` };
  }
  return { kind: "allowed" };
}

export class ExtensionFaxError extends Error {
  readonly status: number;
  readonly code: string;
  readonly needsReason: boolean;
  constructor(status: number, code: string, message: string, needsReason = false) {
    super(message);
    this.name = "ExtensionFaxError";
    this.status = status;
    this.code = code;
    this.needsReason = needsReason;
  }
}

// Sends the STORED generated Form 7004 (snapshotted first, so the faxed bytes
// and the copy emailed on delivery are identical) to the IRS fax line.
export async function faxExtensionToIrs(
  id: string,
  opts: { reason?: string | null; actor: string; now?: Date },
): Promise<{ faxJobId: string; sandbox: boolean }> {
  const app = await prisma.extensionApplication.findUnique({ where: { id }, select: EXTENSION_FAX_SELECT });
  if (!app) throw new ExtensionFaxError(404, "not_found", "Order not found.");
  const now = opts.now ?? new Date();

  const decision = extensionFaxDecision(app, now);
  if (decision.kind === "refused") throw new ExtensionFaxError(409, decision.code, decision.message);
  const reason = (opts.reason ?? "").trim().slice(0, 500);
  if (decision.kind === "needs_reason" && reason.replace(/\s/g, "").length < MIN_EXTENSION_REFAX_REASON_CHARS) {
    throw new ExtensionFaxError(409, "reason_required", decision.message, true);
  }
  // The reason is on file in the same write that claims the send.
  let notes = app.adminNotes;
  if (decision.kind === "needs_reason") {
    notes = appendNote(notes, auditLine(now, `Re-fax override (${decision.state}) by ${opts.actor}: ${reason}`));
  }

  // Claim pinned on the exact state judged above: of two racing sends only one
  // proceeds, and an edit that cleared the generated form in between wins.
  const claim = await prisma.extensionApplication.updateMany({
    where: { id, status: app.status, faxJobId: app.faxJobId, faxStatus: app.faxStatus, generatedPdfKey: app.generatedPdfKey },
    data: { faxStatus: EXTENSION_FAX_CLAIM, adminNotes: notes },
  });
  if (claim.count !== 1) {
    throw new ExtensionFaxError(409, "fax_state_changed", "This order changed while you were sending. Nothing was sent — refresh the page and check it before trying again.");
  }
  const release = async () => {
    try {
      await prisma.extensionApplication.updateMany({
        where: { id, faxJobId: app.faxJobId, faxStatus: EXTENSION_FAX_CLAIM },
        data: { faxStatus: app.faxStatus },
      });
    } catch (err) {
      console.error(`[extension-fax] ${id} could not release the send claim`, err);
    }
  };

  const faxedKey = extensionFaxedKey(id);
  let mediaUrl: string;
  try {
    await putPdf(faxedKey, await getStorageObject(app.generatedPdfKey!));
    mediaUrl = await publicUrl(faxedKey);
  } catch (err) {
    console.error(`[extension-fax] ${id} snapshot of the generated form failed`, err);
    await release();
    throw new ExtensionFaxError(500, "fax_snapshot_failed", "Could not copy the generated Form 7004 for the fax record, so nothing was sent. Try again.");
  }

  let job: Awaited<ReturnType<typeof submitFax>>;
  try {
    job = await submitFax({ mediaUrl, to: env.telnyx.destination });
    if (typeof job?.id !== "string" || job.id.trim() === "") throw new Error("Telnyx accepted the fax but returned no fax id");
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    if (err instanceof TelnyxSubmitRejectedError) {
      await release();
      throw new ExtensionFaxError(502, "fax_submit_rejected", `Telnyx refused the fax, so nothing was sent: ${detail}`);
    }
    console.error(`[extension-fax] AMBIGUOUS_FAX_SUBMIT order=${id} — outcome unknown; check Telnyx before re-faxing`, err);
    throw new ExtensionFaxError(
      502,
      "fax_submit_ambiguous",
      `We could not tell whether Telnyx accepted the fax (${detail}). The order is held at fax status "${EXTENSION_FAX_CLAIM}" so nothing sends it again for now. Check Telnyx for an outbound fax to the IRS for this order before sending again.`,
    );
  }

  try {
    await prisma.extensionApplication.update({
      where: { id },
      data: {
        faxJobId: job.id,
        faxStatus: "queued",
        status: "PROCESSING",
        faxSentAt: now,
        faxDeliveredAt: null,
        faxConfirmationKey: null,
        faxAttempts: { increment: 1 },
        adminNotes: appendNote(notes, auditLine(now, `Form 7004 faxed to the IRS (${IRS_FAX_NUMBER}) by ${opts.actor} — Telnyx fax ${job.id}`)),
      },
      select: { id: true },
    });
  } catch (err) {
    console.error(`[extension-fax] UNTRACKED_FAX_JOB order=${id} faxId=${job.id}`, err);
    throw new ExtensionFaxError(
      500,
      "fax_record_failed",
      `Telnyx accepted fax ${job.id}, but it could not be recorded on this order. Do NOT send again: set faxJobId to ${job.id}, faxStatus to queued and status to PROCESSING by hand.`,
    );
  }
  return { faxJobId: job.id, sandbox: isSandboxFaxId(job.id) };
}

export async function findExtensionByFaxJob(faxId: string): Promise<ExtensionFaxRow | null> {
  return prisma.extensionApplication.findUnique({ where: { faxJobId: faxId }, select: EXTENSION_FAX_SELECT });
}

// Display-only progress label from a non-terminal webhook event. Never over a
// claim or a recorded outcome, and only for the job the event is about.
export async function recordExtensionFaxProgress(app: ExtensionFaxRow, faxId: string, evt: string): Promise<void> {
  if (app.faxStatus === EXTENSION_FAX_CLAIM || app.faxDeliveredAt || isTerminalFaxStatus(app.faxStatus)) return;
  await prisma.extensionApplication.updateMany({
    where: { id: app.id, faxJobId: faxId, faxStatus: app.faxStatus, faxDeliveredAt: null },
    data: { faxStatus: evt.replace(/^fax\./, "").slice(0, 60) },
  });
}

type FaxSource = "webhook" | "poll";

// Exactly-once like lib/fax/finalize.ts: the claim is pinned to the fax job
// and to "not yet delivered", so a redelivered webhook or a poll racing it
// sends no second email or receipt.
export async function finalizeExtensionFaxDelivered(
  app: ExtensionFaxRow,
  facts: FaxDeliveryFacts,
  opts: { source: FaxSource },
): Promise<{ claimed: boolean; receiptStored: boolean; customerEmailed: boolean; adminEmailed: boolean }> {
  const tag = `extension-fax:${opts.source}`;
  const result = { claimed: false, receiptStored: false, customerEmailed: false, adminEmailed: false };
  const parsed = new Date(facts.deliveredAtIso);
  const deliveredAt = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const claim = await prisma.extensionApplication.updateMany({
    where: { id: app.id, faxJobId: facts.faxId, faxDeliveredAt: null },
    data: {
      faxStatus: "delivered",
      status: "COMPLETED",
      faxDeliveredAt: deliveredAt,
      adminNotes: appendNote(app.adminNotes, auditLine(new Date(), `Fax ${facts.faxId} delivered to the IRS (confirmed by ${opts.source}); order Completed.`)),
    },
  });
  if (claim.count !== 1) {
    console.log(`[${tag}] ${app.id} already delivered or no longer on fax ${facts.faxId} — skipping`);
    return result;
  }
  result.claimed = true;
  const ein = formatEin(app.ein) ?? app.ein;
  const llc = app.llcName || "(unnamed LLC)";
  const to = facts.to ?? env.telnyx.destination;
  const deliveredUtc = deliveredAt.toISOString().replace("T", " ").slice(0, 19);

  let receiptPdfBytes: Uint8Array | undefined;
  try {
    receiptPdfBytes = await generateFaxReceiptPdf({
      filingId: app.id,
      llcName: app.llcName,
      llcEin: ein,
      taxYears: app.taxYear ? [app.taxYear] : [],
      ownerName: app.fullName || null,
      ownerLabel: "Contact",
      telnyxFaxId: facts.faxId,
      fromFax: facts.from,
      toFax: to,
      submittedAtIso: facts.submittedAtIso,
      deliveredAtIso: facts.deliveredAtIso,
      pageCount: facts.pageCount,
      formsTransmitted: "Form 7004 (Foreign-owned U.S. DE, Form 1120 code 12)",
      legalParagraphs: [
        `This receipt confirms that IRS Form 7004 for ${llc}, EIN: ${ein ?? "(EIN not provided)"}, Tax Year ` +
          `${app.taxYear ?? "(not provided)"} was successfully transmitted to the Internal Revenue Service (IRS) at ${to} on ${deliveredUtc} UTC.`,
        "This timestamped transmission receipt is evidence of when the form reached the IRS fax line. It is not an IRS " +
          "acceptance or approval of the extension.",
      ],
    });
    const receiptKey = extensionReceiptKey(app.id);
    await putPdf(receiptKey, receiptPdfBytes);
    await prisma.extensionApplication.update({
      where: { id: app.id },
      data: { faxConfirmationKey: receiptKey },
      select: { id: true },
    });
    result.receiptStored = true;
  } catch (err) {
    console.error(`[${tag}] receipt for ${app.id} failed`, err);
  }

  let formPdfBytes: Uint8Array | undefined;
  try {
    formPdfBytes = await getStorageObject(extensionFaxedKey(app.id));
  } catch (err) {
    console.error(`[${tag}] could not read the faxed Form 7004 for ${app.id}`, err);
  }

  try {
    await sendExtensionFaxedEmail({
      email: app.email,
      fullName: app.fullName,
      llcName: app.llcName,
      taxYear: app.taxYear,
      deliveredAtIso: deliveredAt.toISOString(),
      receiptPdfBytes,
      formPdfBytes,
    });
    result.customerEmailed = true;
  } catch (err) {
    console.error(`[${tag}] customer email for ${app.id} failed`, err);
  }

  try {
    await sendExtensionFaxDeliveredAdminEmail({
      adminEmail: env.adminEmail,
      id: app.id,
      llcName: app.llcName,
      taxYear: app.taxYear,
      customerEmail: app.email,
      faxId: facts.faxId,
      deliveredAtIso: deliveredAt.toISOString(),
      pageCount: facts.pageCount,
      customerEmailStatus: result.customerEmailed ? "sent" : "failed",
      receiptPdfBytes,
      formPdfBytes,
    });
    result.adminEmailed = true;
  } catch (err) {
    console.error(`[${tag}] admin email for ${app.id} failed`, err);
  }

  await sendAdminTelegram([
    result.customerEmailed ? "Form 7004 fax delivered to the IRS" : "Form 7004 fax delivered — customer email FAILED",
    `LLC: ${llc}${app.taxYear ? ` (tax year ${app.taxYear})` : ""}`,
    `${env.appUrl}/admin/applications/extension/${app.id}`,
  ]);
  return result;
}

// Telnyx confirmed the fax failed. No automatic retry: back to IN_REVIEW so
// staff fax it again; the customer is not emailed.
export async function finalizeExtensionFaxFailed(
  app: ExtensionFaxRow,
  failure: { faxId: string; failureReason: string | null },
  opts: { source: FaxSource },
): Promise<{ claimed: boolean; adminEmailed: boolean }> {
  const tag = `extension-fax:${opts.source}`;
  const result = { claimed: false, adminEmailed: false };
  if (app.faxDeliveredAt || isTerminalFaxStatus(app.faxStatus)) return result;
  const reason = failure.failureReason?.slice(0, 100) ?? null;
  const claim = await prisma.extensionApplication.updateMany({
    where: { id: app.id, faxJobId: failure.faxId, faxStatus: app.faxStatus, faxDeliveredAt: null },
    data: {
      faxStatus: reason ? `failed:${reason}` : "failed",
      status: "IN_REVIEW",
      adminNotes: appendNote(app.adminNotes, auditLine(new Date(), `Fax ${failure.faxId} FAILED (${reason ?? "no reason given"}; confirmed by ${opts.source}); order back to In review.`)),
    },
  });
  if (claim.count !== 1) {
    console.log(`[${tag}] ${app.id} failure already recorded or fax ${failure.faxId} replaced — skipping`);
    return result;
  }
  result.claimed = true;
  try {
    await sendExtensionFaxFailedAdminEmail({
      adminEmail: env.adminEmail,
      id: app.id,
      llcName: app.llcName,
      taxYear: app.taxYear,
      customerEmail: app.email,
      faxId: failure.faxId,
      failureReason: reason,
    });
    result.adminEmailed = true;
  } catch (err) {
    console.error(`[${tag}] admin failure email for ${app.id} failed`, err);
  }
  await sendAdminTelegram([
    "Form 7004 fax FAILED — fax it again from the admin page",
    `LLC: ${app.llcName || "(unnamed LLC)"}${app.taxYear ? ` (tax year ${app.taxYear})` : ""}`,
    `Reason: ${reason ?? "not given"}`,
    `${env.appUrl}/admin/applications/extension/${app.id}`,
  ]);
  return result;
}

// Hourly backstop (called by /api/cron/fax-status-poll after the filings):
// extension faxes sent in the last 14 days whose outcome is still unknown.
export function extensionPollWhere(now: Date): Prisma.ExtensionApplicationWhereInput {
  return {
    faxJobId: { not: null },
    faxDeliveredAt: null,
    faxSentAt: { gte: new Date(now.getTime() - POLL_LOOKBACK_DAYS * ONE_DAY_MS) },
    AND: [
      { OR: [{ faxStatus: null }, { faxStatus: { not: "delivered" } }] },
      { OR: [{ faxStatus: null }, { NOT: { faxStatus: { startsWith: "failed" } } }] },
    ],
  };
}

export function isExtensionPollable(app: Pick<ExtensionFaxRow, "faxJobId" | "faxStatus" | "faxDeliveredAt">): boolean {
  return extensionFaxInFlight(app) && app.faxStatus !== EXTENSION_FAX_CLAIM && !isSandboxFaxId(app.faxJobId);
}

export type ExtensionPollSummary = {
  candidates: number;
  delivered: number;
  failed: number;
  alreadyFinalized: number;
  stillSending: number;
  deferred: number;
  errors: string[];
};

export async function pollExtensionFaxes(opts: { apiKey: string; now: Date; deadlineMs: number }): Promise<ExtensionPollSummary> {
  const rows = await prisma.extensionApplication.findMany({
    where: extensionPollWhere(opts.now),
    select: EXTENSION_FAX_SELECT,
    orderBy: { updatedAt: "asc" },
    take: POLL_MAX_ROWS,
  });
  const pollable = rows.filter(isExtensionPollable);
  const summary: ExtensionPollSummary = { candidates: pollable.length, delivered: 0, failed: 0, alreadyFinalized: 0, stillSending: 0, deferred: 0, errors: [] };
  for (let i = 0; i < pollable.length; i++) {
    const app = pollable[i];
    if (Date.now() > opts.deadlineMs) {
      summary.deferred = pollable.length - i;
      break;
    }
    try {
      const lookup = await fetchTelnyxFax(app.faxJobId!, { apiKey: opts.apiKey });
      if (!lookup.ok) {
        summary.errors.push(`extension:${app.id}: ${lookup.error}`);
        continue;
      }
      if (lookup.fax.status === TELNYX_DELIVERED_STATUS) {
        const r = await finalizeExtensionFaxDelivered(app, deliveryFactsFromTelnyx(lookup.fax), { source: "poll" });
        if (r.claimed) summary.delivered++;
        else summary.alreadyFinalized++;
      } else if (isTelnyxFailedStatus(lookup.fax.status)) {
        const r = await finalizeExtensionFaxFailed(app, { faxId: app.faxJobId!, failureReason: lookup.fax.failure_reason ?? null }, { source: "poll" });
        if (r.claimed) summary.failed++;
        else summary.alreadyFinalized++;
      } else {
        summary.stillSending++;
      }
    } catch (err) {
      summary.errors.push(`extension:${app.id}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }
  return summary;
}

