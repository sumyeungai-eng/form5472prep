import { env } from "./env";

// Phase 1: sandbox stub that returns a fake job ID.
// Phase 4 swaps in real Telnyx API calls (see spec § Fax Integration).

export type FaxJob = { id: string; status: "queued" | "delivered" | "failed" };

// Telnyx answered the submission with a 4xx, so no fax job was created
// (TelnyxSubmitRejectedError). Anything else submitFax() throws (5xx, network
// error, timeout, bad JSON, missing id) is AMBIGUOUS: the fax may or may not
// have been queued. The automatic retry path (lib/fax/retry.ts) and the admin
// retryFax action only release their claim after a rejection, never after an
// ambiguous error — a second IRS fax must never be sent by accident.

// Telnyx answered 2xx but without a usable fax id: the fax may well be
// queued, yet we cannot track it. Deliberately NOT a TelnyxSubmitRejectedError
// — callers must treat it as ambiguous (never auto-resubmit).
export class TelnyxSubmitMissingIdError extends Error {
  constructor(httpStatus: number) {
    super(
      `Telnyx accepted the fax (HTTP ${httpStatus}) but returned no fax id — it may be in flight; check Telnyx before re-sending`,
    );
    this.name = "TelnyxSubmitMissingIdError";
  }
}

// Only a 4xx is a definite "no fax job was created" (bad request, auth,
// validation, rate limit): Telnyx itself looked at the request and said no.
export class TelnyxSubmitRejectedError extends Error {
  readonly httpStatus: number;
  constructor(httpStatus: number, body: string) {
    super(`Telnyx fax failed: ${httpStatus} ${body}`);
    this.name = "TelnyxSubmitRejectedError";
    this.httpStatus = httpStatus;
  }
}

// A 5xx (or any other non-2xx, non-4xx answer) may come from a gateway or load
// balancer in front of Telnyx — a 502/504 can arrive AFTER Telnyx queued the
// fax. Deliberately NOT a TelnyxSubmitRejectedError: callers must treat it as
// ambiguous (keep their claim, alert a human, never auto-resubmit).
export class TelnyxSubmitAmbiguousError extends Error {
  readonly httpStatus: number;
  constructor(httpStatus: number, body: string) {
    super(
      `Telnyx answered HTTP ${httpStatus} to the fax submission — the fax may or may not have been queued; check Telnyx before re-sending${body ? ` (${body.slice(0, 200)})` : ""}`,
    );
    this.name = "TelnyxSubmitAmbiguousError";
    this.httpStatus = httpStatus;
  }
}

export async function submitFax(opts: {
  mediaUrl: string;
  to?: string;
}): Promise<FaxJob> {
  const to = opts.to ?? env.telnyx.destination;

  if (!env.telnyx.apiKey) {
    // Sandbox mode — pretend the fax went through.
    return { id: `sandbox_${Date.now()}`, status: "queued" };
  }

  const res = await fetch("https://api.telnyx.com/v2/faxes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.telnyx.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connection_id: env.telnyx.connectionId,
      media_url: opts.mediaUrl,
      to,
      from: env.telnyx.faxNumber,
      quality: "high",
      monochrome: true,
      store_media: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status >= 400 && res.status < 500) throw new TelnyxSubmitRejectedError(res.status, body);
    throw new TelnyxSubmitAmbiguousError(res.status, body);
  }
  const json = (await res.json().catch(() => null)) as { data?: { id?: unknown; status?: unknown } } | null;
  const id = json?.data?.id;
  if (typeof id !== "string" || id.trim() === "") throw new TelnyxSubmitMissingIdError(res.status);
  const status = json?.data?.status;
  return { id, status: (typeof status === "string" ? status : "queued") as FaxJob["status"] };
}
