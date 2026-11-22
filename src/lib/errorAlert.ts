import { sendAdminTelegram } from "@/lib/telegram";

const HOUR_MS = 60 * 60 * 1000;
// shortcut: per-instance dedupe; use a DB row if alerts get noisy
const lastAlerts = new Map<string, number>();

function safeText(value: string): string {
  // Decode escaped email addresses before masking, including URL path segments.
  try { value = decodeURIComponent(value); } catch { /* Keep malformed escapes. */ }
  return value
    .replace(/((?:https?:\/\/|\/)[^\s?#]*)\?[^\s]*/gi, "$1")
    .replace(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/[\r\n\t]/g, " ")
    .slice(0, 250);
}

export async function alertServerError({ path, digest, message, deploymentId }: {
  path: string;
  digest?: string;
  message: string;
  deploymentId?: string;
}): Promise<void> {
  try {
    const pathname = safeText(new URL(path, "https://internal.invalid").pathname);
    const safeMessage = safeText(message);
    const key = digest ? `digest:${digest}` : `path:${pathname}:${safeMessage.slice(0, 80)}`;
    const now = Date.now();
    lastAlerts.forEach((sentAt, oldKey) => {
      if (now - sentAt >= HOUR_MS) lastAlerts.delete(oldKey);
    });
    if (lastAlerts.has(key)) return;
    // Claim before awaiting so simultaneous errors cannot flood Telegram.
    lastAlerts.set(key, now);
    const deployment = deploymentId ?? process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA;
    await sendAdminTelegram([
      "Server error — Form5472 Prep",
      `Path: ${pathname}`,
      ...(digest ? [`Reference: ${safeText(digest)}`] : []),
      `Message: ${safeMessage}`,
      ...(deployment ? [`Deployment: ${safeText(deployment)}`] : []),
    ]);
  } catch {
    // Monitoring must never turn an application error into another failure.
  }
}
