// Telnyx fax status: the single place that (a) asks Telnyx's own API what
// happened to an outbound fax and (b) decides which of OUR stored faxStatus
// values are terminal. Shared by /api/telnyx-webhook and the
// /api/cron/fax-status-poll backstop so the two can never disagree.
//
// Why the webhook asks the API at all: TELNYX_PUBLIC_KEY is not set in
// production, so webhook signatures are not verified and anyone could POST a
// fake "fax.delivered". Telnyx's authenticated REST API is the source of
// truth — a terminal event only moves a filing when the API agrees.

import { env } from "@/lib/env";
import type { FaxProof } from "@/lib/email";

// Shape of GET https://api.telnyx.com/v2/faxes/{id} → data (fields we read).
export type TelnyxFax = {
  id: string;
  status: string; // queued | media.processed | sending | delivered | failed | ...
  failure_reason?: string | null;
  page_count?: number | null;
  call_duration_secs?: number | null;
  from?: string | null;
  to?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type TelnyxFaxLookup =
  | { ok: true; fax: TelnyxFax }
  | { ok: false; error: string; httpStatus?: number };

const DEFAULT_TIMEOUT_MS = 10_000;

export const TELNYX_DELIVERED_STATUS = "delivered";
const TELNYX_FAILED_STATUSES: ReadonlySet<string> = new Set(["failed", "sending.failed"]);

export function isTelnyxFailedStatus(status: string | null | undefined): boolean {
  return !!status && TELNYX_FAILED_STATUSES.has(status);
}

// Our Filing.faxStatus is terminal once a delivered/failed outcome has been
// recorded: "delivered" (CONFIRMED) or "failed" / "failed:<reason>" (FAILED).
// Everything else — "queued", "sending", "media.processed",
// "sending.started", "retry_N", "retrying_N", null — is still in flight.
export function isTerminalFaxStatus(faxStatus: string | null | undefined): boolean {
  if (!faxStatus) return false;
  return faxStatus === "delivered" || faxStatus === "failed" || faxStatus.startsWith("failed:");
}

// "retry_N" = the webhook re-submitted the fax (N = our attempt counter);
// "retrying_N" = the webhook's short-lived claim while it re-submits. The
// failed-path attempt ceiling is derived from these labels, so they must
// never be overwritten by an in-progress status event.
export function isRetryLabel(faxStatus: string | null | undefined): boolean {
  return !!faxStatus && /^retr(?:y|ying)_\d+$/.test(faxStatus);
}

// Sandbox fax ids (lib/fax.ts with no TELNYX_API_KEY) never exist at Telnyx.
export function isSandboxFaxId(faxId: string | null | undefined): boolean {
  return !!faxId && faxId.startsWith("sandbox_");
}

export async function fetchTelnyxFax(
  faxId: string,
  opts: { apiKey?: string; timeoutMs?: number } = {},
): Promise<TelnyxFaxLookup> {
  const apiKey = opts.apiKey ?? process.env.TELNYX_API_KEY;
  if (!apiKey) return { ok: false, error: "TELNYX_API_KEY not set" };
  if (!faxId || isSandboxFaxId(faxId)) return { ok: false, error: "not a Telnyx fax id" };
  try {
    const res = await fetch(`https://api.telnyx.com/v2/faxes/${encodeURIComponent(faxId)}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, error: `Telnyx GET ${res.status}`, httpStatus: res.status };
    const json = (await res.json()) as { data?: Partial<TelnyxFax> } | null;
    const data = json?.data;
    if (!data || typeof data.status !== "string") {
      return { ok: false, error: "Telnyx response missing data.status" };
    }
    if (typeof data.id === "string" && data.id !== faxId) {
      return { ok: false, error: "Telnyx returned a different fax id" };
    }
    return { ok: true, fax: { ...data, id: faxId, status: data.status } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Facts that go on the customer's proof-of-filing (email + receipt PDF).
export type FaxDeliveryFacts = {
  faxId: string;
  submittedAtIso: string;
  deliveredAtIso: string;
  pageCount: number | null;
  durationSecs: number | null;
  from: string | null;
  to: string | null;
};

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}
function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// Telnyx's API record wins; the (possibly unsigned) webhook payload only
// fills fields the API response left out (e.g. page_count / call_duration_secs,
// which the webhook payload always carries).
export function deliveryFactsFromTelnyx(
  fax: TelnyxFax,
  fallback: Record<string, unknown> | null | undefined = null,
): FaxDeliveryFacts {
  const nowIso = new Date().toISOString();
  return {
    faxId: fax.id,
    submittedAtIso: str(fax.created_at) ?? str(fallback?.created_at) ?? nowIso,
    deliveredAtIso: str(fax.updated_at) ?? str(fallback?.updated_at) ?? nowIso,
    pageCount: num(fax.page_count) ?? num(fallback?.page_count),
    durationSecs: num(fax.call_duration_secs) ?? num(fallback?.call_duration_secs),
    from: str(fax.from) ?? str(fallback?.from),
    to: str(fax.to) ?? str(fallback?.to) ?? env.telnyx.destination,
  };
}

// The proof block shown in the customer/admin "fax delivered" emails.
export function faxProofFromFacts(facts: FaxDeliveryFacts): FaxProof {
  return {
    faxId: facts.faxId,
    deliveredAt: facts.deliveredAtIso,
    pageCount: facts.pageCount,
    durationSecs: facts.durationSecs,
    from: facts.from,
    to: facts.to ?? env.telnyx.destination,
  };
}
