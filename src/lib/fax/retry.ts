// What happens after Telnyx's API has CONFIRMED that an outbound IRS fax job
// failed: automatically re-fax the same bytes (up to MAX_FAX_RETRIES), or give
// up and mark the filing FAILED. Shared by /api/telnyx-webhook and the hourly
// /api/cron/fax-status-poll, so a transient webhook problem can never turn an
// automatic retry into a customer-facing failure.
//
// DUPLICATE IRS FAXES MUST BE IMPOSSIBLE. Guarantees:
// 1. Claim before submit. The resubmission is claimed with one atomic
//    updateMany pinned on the failed job (faxJobId) AND the exact faxStatus the
//    caller observed, which must not be a "retrying_N" claim. Postgres
//    serialises the UPDATEs, so of any number of racing callers (webhook,
//    redelivered webhook, poll) exactly one gets count === 1 and submits.
// 2. A "retrying_N" claim is only released when the fax provably did NOT go
//    out (media URL failed, or Telnyx answered with an HTTP error). After an
//    ambiguous failure (network error/timeout mid-submit) the claim is KEPT and
//    an operator is alerted; nothing automatic will re-fax that filing.
// 3. If Telnyx accepted the new fax but we could not record its id, the claim
//    is also kept and the new fax id is logged/alerted (UNTRACKED_FAX_JOB).

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { submitFax, TelnyxSubmitRejectedError } from "@/lib/fax";
import { publicUrl } from "@/lib/storage";
import { sendFaxAttentionAdminEmail } from "@/lib/email";
import {
  finalizeFaxFailed,
  safeChangeLog,
  type FaxDetectionSource,
  type FaxFinalizeFiling,
} from "@/lib/fax/finalize";

export const MAX_FAX_RETRIES = 3;

export type FaxRetryFiling = FaxFinalizeFiling & {
  faxedPdfKey: string | null;
  preflightStatus: string | null;
  preflightOverrideBy: string | null;
};

export type ConfirmedFailureResult =
  | { outcome: "retried"; newFaxId: string; attempt: number }
  | { outcome: "retried_untracked"; newFaxId: string; attempt: number }
  | { outcome: "held_preflight" }
  | { outcome: "not_claimed" }
  | { outcome: "submit_rejected"; error: string }
  | { outcome: "submit_ambiguous"; error: string }
  | { outcome: "gave_up"; attempts: number; claimed: boolean };

// Attempts so far: our own "retry_N" label is authoritative (each retry is a
// brand-new Telnyx job whose own delivery_attempts restarts at 0);
// reportedAttempts (from Telnyx's API, or a signature-verified webhook) is a
// belt-and-braces cap on top.
export function faxAttemptsSoFar(faxStatus: string | null, reportedAttempts?: number | null): number {
  const label = faxStatus?.match(/^retry_(\d+)$/);
  const fromLabel = label ? Number(label[1]) : 0;
  const reported = typeof reportedAttempts === "number" && Number.isFinite(reportedAttempts) ? reportedAttempts : 0;
  return Math.max(fromLabel, reported);
}

export async function handleConfirmedFaxFailure(
  filing: FaxRetryFiling,
  failure: { faxId: string; failureReason: string | null; reportedAttempts?: number | null },
  opts: { source: FaxDetectionSource },
): Promise<ConfirmedFailureResult> {
  const tag = `fax-retry:${opts.source}`;

  // Only the filing's CURRENT job can drive a retry, and never while another
  // resubmission holds (or abandoned) a retrying_N claim: its fax may already
  // be with Telnyx.
  if (filing.faxJobId !== failure.faxId) return { outcome: "not_claimed" };
  if (filing.faxStatus?.startsWith("retrying_")) return { outcome: "not_claimed" };
  if (filing.status === "CONFIRMED" || filing.status === "FAILED") return { outcome: "not_claimed" };

  const attempts = faxAttemptsSoFar(filing.faxStatus, failure.reportedAttempts);
  // Re-fax the SAME bytes originally transmitted — the immutable snapshot
  // (faxedPdfKey) when present, falling back to signedPdfKey.
  const faxSource = filing.faxedPdfKey ?? filing.signedPdfKey;

  if (attempts >= MAX_FAX_RETRIES || !faxSource) {
    const failed = await finalizeFaxFailed(
      filing,
      { faxId: failure.faxId, failureReason: failure.failureReason, deliveryAttempts: attempts },
      opts,
    );
    return { outcome: "gave_up", attempts, claimed: failed.claimed };
  }

  if (filing.preflightStatus === "failed" && !filing.preflightOverrideBy) {
    console.error(
      `[${tag}] ${filing.id} fax retry held: Fax held: this package failed pre-flight checks. An admin must review it.`,
    );
    return { outcome: "held_preflight" };
  }

  const attempt = attempts + 1;
  const claimLabel = `retrying_${attempt}`;
  const claim = await prisma.filing.updateMany({
    where: {
      id: filing.id,
      faxJobId: failure.faxId,
      // Exact observed value — never a retrying_N (checked above), so the
      // loser of a race (who saw the same value) now matches 0 rows.
      faxStatus: filing.faxStatus,
      status: { notIn: ["CONFIRMED", "FAILED"] },
    },
    data: { faxStatus: claimLabel },
  });
  if (claim.count !== 1) return { outcome: "not_claimed" };

  const release = () =>
    prisma.filing
      .updateMany({
        where: { id: filing.id, faxJobId: failure.faxId, faxStatus: claimLabel },
        data: { faxStatus: filing.faxStatus },
      })
      .catch((err: unknown) => console.error(`[${tag}] ${filing.id} could not release ${claimLabel}`, err));

  let mediaUrl: string;
  try {
    mediaUrl = await publicUrl(faxSource);
  } catch (err) {
    // Nothing was sent: safe to release so a later pass can retry.
    await release();
    return { outcome: "submit_rejected", error: errorMessage(err) };
  }

  let job: Awaited<ReturnType<typeof submitFax>>;
  try {
    job = await submitFax({ mediaUrl, to: env.telnyx.destination });
    // Belt and braces over submitFax's own check: without a string id we
    // would record nothing yet set retry_N, leaving the OLD job armed.
    if (typeof job?.id !== "string" || job.id.trim() === "") {
      throw new Error("Telnyx accepted the fax but returned no fax id — it may be in flight");
    }
  } catch (err) {
    if (err instanceof TelnyxSubmitRejectedError) {
      // Telnyx refused it — no fax job exists. Release; webhook redelivery or
      // the next hourly poll will try again.
      await release();
      return { outcome: "submit_rejected", error: err.message };
    }
    // Unknown whether Telnyx queued the fax. Keep the claim so nothing
    // automatic re-faxes; a human checks Telnyx first.
    console.error(
      `[fax-retry] AMBIGUOUS_FAX_SUBMIT filing=${filing.id} failedFaxId=${failure.faxId} claim=${claimLabel} — ` +
        `resubmission outcome unknown; check Telnyx before re-faxing`,
      err,
    );
    await alertAdmin(filing, "Automatic fax retry: the resubmission outcome is unknown", [
      ["Failed fax id", failure.faxId],
      ["Retry attempt", String(attempt)],
      ["Error", errorMessage(err)],
      ["What to do", `Check Telnyx for a new outbound fax to the IRS for this filing before using "Retry fax". The filing stays at ${claimLabel} until someone does.`],
    ]);
    return { outcome: "submit_ambiguous", error: errorMessage(err) };
  }

  const nextLabel = `retry_${attempt}`;
  const recorded = await recordNewJob(filing.id, job.id, nextLabel);
  if (!recorded) {
    console.error(
      `[fax-retry] UNTRACKED_FAX_JOB filing=${filing.id} newFaxId=${job.id} failedFaxId=${failure.faxId} — ` +
        `Telnyx accepted the retry but the DB still points at the old job (faxStatus ${claimLabel}). ` +
        `Set faxJobId=${job.id}, faxStatus=${nextLabel} by hand.`,
    );
    await alertAdmin(filing, "Automatic fax retry was sent but could not be recorded", [
      ["New Telnyx fax id", job.id],
      ["Failed fax id", failure.faxId],
      ["Retry attempt", String(attempt)],
      ["What to do", `Set faxJobId to ${job.id} and faxStatus to ${nextLabel} on this filing. Do NOT press "Retry fax" — the IRS already has this fax in flight.`],
    ]);
    return { outcome: "retried_untracked", newFaxId: job.id, attempt };
  }

  await safeChangeLog(tag, {
    filingId: filing.id,
    field: "fax",
    before: { faxJobId: failure.faxId, faxStatus: filing.faxStatus },
    after: { faxJobId: job.id, faxStatus: nextLabel },
    reason: `Automatic fax retry ${attempt}/${MAX_FAX_RETRIES} after Telnyx confirmed failure (${failure.failureReason ?? "no reason given"}), detected by ${opts.source}`,
  });
  return { outcome: "retried", newFaxId: job.id, attempt };
}

// A stale "retrying_N" claim (a resubmission crashed between claim and
// record) needs a human. The poll flags it every hour in the logs; this emails
// the operator at most once per filing per 24h, using a FilingChangeLog
// marker (field STUCK_ALERT_FIELD) as the "already told" record.
export const STUCK_ALERT_FIELD = "faxStuckRetryAlert";
const STUCK_ALERT_EVERY_MS = 24 * 60 * 60 * 1000;

export async function alertStuckRetryClaim(
  filing: Pick<FaxRetryFiling, "id" | "llcName" | "faxJobId" | "faxStatus"> & { updatedAt: Date },
  now: Date,
): Promise<"alerted" | "recently_alerted" | "failed"> {
  try {
    const recent = await prisma.filingChangeLog.findFirst({
      where: {
        filingId: filing.id,
        field: STUCK_ALERT_FIELD,
        changedAt: { gte: new Date(now.getTime() - STUCK_ALERT_EVERY_MS) },
      },
      select: { id: true },
    });
    if (recent) return "recently_alerted";
    await sendFaxAttentionAdminEmail({
      adminEmail: env.adminEmail,
      filingId: filing.id,
      llcName: filing.llcName,
      adminFilingUrl: `${env.appUrl}/admin/filings/${filing.id}`,
      headline: "Automatic fax retry is stuck mid-resubmission",
      details: [
        ["faxStatus", filing.faxStatus ?? "(none)"],
        ["Fax id on record", filing.faxJobId ?? "(none)"],
        ["Stuck since", filing.updatedAt.toISOString()],
        ["What to do", `A resubmission may or may not have reached Telnyx. Check Telnyx for a newer outbound fax to the IRS for this filing; if there is one, set faxJobId to it and faxStatus to retry_N by hand. Only press "Retry fax" if Telnyx shows none.`],
      ],
    });
    // Marker written only after a successful send, so a failed email is
    // retried on the next hourly run.
    await safeChangeLog("fax-status-poll", {
      filingId: filing.id,
      field: STUCK_ALERT_FIELD,
      before: null,
      after: { faxStatus: filing.faxStatus, faxJobId: filing.faxJobId },
      reason: "Admin alerted: stale retrying_N claim",
    });
    return "alerted";
  } catch (err) {
    console.error(`[fax-status-poll] stuck-claim alert for ${filing.id} failed`, err);
    return "failed";
  }
}

// Record the new job id. One immediate retry covers a transient DB blip.
async function recordNewJob(filingId: string, newFaxId: string, label: string): Promise<boolean> {
  for (let i = 0; i < 2; i++) {
    try {
      await prisma.filing.update({
        where: { id: filingId },
        data: { faxJobId: newFaxId, faxStatus: label },
        select: { id: true },
      });
      return true;
    } catch (err) {
      console.error(`[fax-retry] recording new fax job ${newFaxId} for ${filingId} failed (try ${i + 1}/2)`, err);
    }
  }
  return false;
}

async function alertAdmin(
  filing: FaxRetryFiling,
  headline: string,
  details: Array<[string, string]>,
): Promise<void> {
  try {
    await sendFaxAttentionAdminEmail({
      adminEmail: env.adminEmail,
      filingId: filing.id,
      llcName: filing.llcName,
      adminFilingUrl: `${env.appUrl}/admin/filings/${filing.id}`,
      headline,
      details,
    });
  } catch (err) {
    console.error(`[fax-retry] attention email for ${filing.id} failed`, err);
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
