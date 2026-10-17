import { get as getStorageObject } from "@/lib/storage";

export const MAX_FAX_COPY_BYTES = 20 * 1024 * 1024;

// Never fall back after a read error: a newer signed PDF may differ from
// the frozen snapshot. Only legacy filings without a snapshot use signedPdfKey.
export async function loadFaxClientCopy(filing: {
  faxedPdfKey?: string | null;
  signedPdfKey?: string | null;
  ownerSsnLast4?: string | null;
  ownerSsnCiphertext?: string | null;
}, requested: boolean): Promise<Uint8Array | undefined> {
  if (!requested || filing.ownerSsnLast4 || filing.ownerSsnCiphertext) return undefined;
  const key = filing.faxedPdfKey || filing.signedPdfKey;
  if (!key) return undefined;
  try {
    const bytes = await getStorageObject(key);
    return bytes.byteLength > 0 && bytes.byteLength <= MAX_FAX_COPY_BYTES ? bytes : undefined;
  } catch (err) {
    // Storage errors may include credentials, keys or personal data in messages.
    console.error("[fax-client-copy] storage read failed", err instanceof Error ? err.name : "UnknownError");
    return undefined;
  }
}
