import { apnsConfigured, sendAdminPush } from "@/lib/apns";
import { sendFaxReceivedAdminEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { put } from "@/lib/storage";

export const FAX_PDF_MAX_BYTES = 25 * 1024 * 1024;

export type InboundFaxEvent = {
  faxId: string;
  fromNumber: string | null;
  toNumber: string | null;
  pageCount: number | null;
  mediaUrl: string | null;
  receivedAt: Date;
};

type TelnyxWebhookBody = {
  data?: {
    event_type?: unknown;
    occurred_at?: unknown;
    payload?: {
      fax_id?: unknown;
      from?: unknown;
      to?: unknown;
      page_count?: unknown;
      media_url?: unknown;
      updated_at?: unknown;
      created_at?: unknown;
    };
  };
};

export function parseInboundFaxEvent(body: unknown): InboundFaxEvent | null {
  if (!isRecord(body) || Array.isArray(body)) return null;
  const data = isRecord(body.data) ? body.data : null;
  if (!data || data.event_type !== "fax.received") return null;
  const payload = isRecord(data.payload) ? data.payload : null;
  if (!payload) return null;

  const faxId = typeof payload.fax_id === "string" ? payload.fax_id.trim() : "";
  if (!faxId) return null;

  return {
    faxId,
    fromNumber: typeof payload.from === "string" ? payload.from : null,
    toNumber: typeof payload.to === "string" ? payload.to : null,
    pageCount: typeof payload.page_count === "number" ? payload.page_count : null,
    mediaUrl: typeof payload.media_url === "string" ? payload.media_url : null,
    receivedAt: firstValidDate(
      payload.updated_at,
      payload.created_at,
      (body as TelnyxWebhookBody).data?.occurred_at,
    ),
  };
}

export function inboundFaxAllowed(envLike: { publicKeySet: boolean; nodeEnv: string | undefined }): boolean {
  return !(envLike.nodeEnv === "production" && !envLike.publicKeySet);
}

export function validateFaxPdf(bytes: Uint8Array): { ok: true } | { ok: false; error: string } {
  if (bytes.length === 0) return { ok: false, error: "PDF is empty" };
  if (bytes.length > FAX_PDF_MAX_BYTES) return { ok: false, error: "PDF is too large" };
  const header = [0x25, 0x50, 0x44, 0x46, 0x2d];
  for (let i = 0; i < header.length; i += 1) {
    if (bytes[i] !== header[i]) return { ok: false, error: "File is not a PDF" };
  }
  return { ok: true };
}

export function faxStorageKey(id: string): string {
  return `faxes/inbound/${id}.pdf`;
}

export function formatFaxNumber(n: string | null): string {
  if (n === null) return "Unknown sender";
  const trimmed = n.trim();
  const match = trimmed.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (!match) return trimmed;
  return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
}

export type FaxLinkTarget = { type: "ein" | "itin" | "filing"; id: string } | null;

export function linkData(target: FaxLinkTarget): {
  filingId: string | null;
  einApplicationId: string | null;
  itinApplicationId: string | null;
} {
  return {
    filingId: target?.type === "filing" ? target.id : null,
    einApplicationId: target?.type === "ein" ? target.id : null,
    itinApplicationId: target?.type === "itin" ? target.id : null,
  };
}

export async function downloadFaxPdf(url: string, fetchImpl: typeof fetch = fetch): Promise<Uint8Array> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error("Fax media URL must use https");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Fax media download failed with status ${response.status}`);

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      const size = Number(contentLength);
      if (Number.isFinite(size) && size > FAX_PDF_MAX_BYTES) {
        throw new Error("Fax PDF exceeds the 25 MB limit");
      }
    }

    if (!response.body) {
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length > FAX_PDF_MAX_BYTES) throw new Error("Fax PDF exceeds the 25 MB limit");
      return bytes;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.length;
      if (total > FAX_PDF_MAX_BYTES) {
        controller.abort();
        throw new Error("Fax PDF exceeds the 25 MB limit");
      }
      chunks.push(value);
    }

    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    return out;
  } finally {
    clearTimeout(timeout);
  }
}

export async function ingestInboundFax(evt: InboundFaxEvent): Promise<{
  status: "stored" | "duplicate" | "failed";
  id: string;
  error?: string;
}> {
  const updateData: {
    fromNumber?: string;
    toNumber?: string;
    pageCount?: number;
  } = {};
  if (evt.fromNumber !== null) updateData.fromNumber = evt.fromNumber;
  if (evt.toNumber !== null) updateData.toNumber = evt.toNumber;
  if (evt.pageCount !== null) updateData.pageCount = evt.pageCount;

  const row = await prisma.receivedFax.upsert({
    where: { telnyxFaxId: evt.faxId },
    create: {
      telnyxFaxId: evt.faxId,
      fromNumber: evt.fromNumber,
      toNumber: evt.toNumber,
      pageCount: evt.pageCount,
      receivedAt: evt.receivedAt,
    },
    update: updateData,
  });

  if (row.pdfKey) return { status: "duplicate", id: row.id };

  if (!evt.mediaUrl) {
    const error = "Telnyx sent no file link";
    await prisma.receivedFax.update({ where: { id: row.id }, data: { downloadError: error } });
    return { status: "failed", id: row.id, error };
  }

  let bytes: Uint8Array;
  try {
    bytes = await downloadFaxPdf(evt.mediaUrl);
    const validation = validateFaxPdf(bytes);
    if (!validation.ok) throw new Error(validation.error);
  } catch (error) {
    const message = truncateError(error);
    await prisma.receivedFax.update({ where: { id: row.id }, data: { downloadError: message } });
    return { status: "failed", id: row.id, error: message };
  }

  const pdfKey = faxStorageKey(row.id);
  await put(pdfKey, bytes, "application/pdf");
  const stored = await prisma.receivedFax.updateMany({
    where: { id: row.id, pdfKey: null },
    data: { pdfKey, pdfBytes: bytes.length, downloadError: null },
  });

  if (stored.count === 1) {
    try {
      await sendFaxReceivedAdminEmail({
        fromNumber: row.fromNumber ?? "unknown",
        pageCount: row.pageCount,
        receivedAt: row.receivedAt,
        adminLink: `${env.appUrl}/admin/faxes/${row.id}`,
      });
    } catch {}
    if (apnsConfigured()) {
      try {
        await sendAdminPush({
          title: "Fax received",
          body: `${formatFaxNumber(row.fromNumber)} received`,
          threadId: row.id,
        });
      } catch {}
    }
  }

  return { status: "stored", id: row.id };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function firstValidDate(...values: unknown[]): Date {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

function truncateError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 300);
}
