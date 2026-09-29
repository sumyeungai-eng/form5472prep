import { env } from "./env";

// Phase 1: sandbox stub that returns a fake job ID.
// Phase 4 swaps in real Telnyx API calls (see spec § Fax Integration).

export type FaxJob = { id: string; status: "queued" | "delivered" | "failed" };

// Telnyx answered the submission with an HTTP error, so no fax job was
// created. Anything else submitFax() throws (network error, timeout, bad
// JSON) is AMBIGUOUS: the fax may or may not have been queued. The automatic
// retry path (lib/fax/retry.ts) only re-arms itself after this error, never
// after an ambiguous one — a second IRS fax must never be sent by accident.
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

export class TelnyxSubmitRejectedError extends Error {
  readonly httpStatus: number;
  constructor(httpStatus: number, body: string) {
    super(`Telnyx fax failed: ${httpStatus} ${body}`);
    this.name = "TelnyxSubmitRejectedError";
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
  if (!res.ok) throw new TelnyxSubmitRejectedError(res.status, await res.text());
  const json = (await res.json().catch(() => null)) as { data?: { id?: unknown; status?: unknown } } | null;
  const id = json?.data?.id;
  if (typeof id !== "string" || id.trim() === "") throw new TelnyxSubmitMissingIdError(res.status);
  const status = json?.data?.status;
  return { id, status: (typeof status === "string" ? status : "queued") as FaxJob["status"] };
}
