// Returns the URL only if it is a plain http(s) link; anything else
// (javascript:, data:, relative junk) → null. Use before rendering
// visitor-supplied URLs as href.
export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
