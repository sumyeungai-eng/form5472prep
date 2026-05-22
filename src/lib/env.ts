// Server-side env access with friendly errors. Keep the surface small —
// add a getter when you actually need a new var.

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

// Normalize the app URL: apex (form5472prep.com) is configured to 307 to www
// on Vercel's edge, but that redirect drops the Authorization header on
// cross-hostname per the fetch spec — breaking internal POST calls (admin
// → /api/internal/validate-filing). Always emit the www form so internal
// callers never traverse the redirect.
function normalizedAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return raw === "https://form5472prep.com" ? "https://www.form5472prep.com" : raw;
}

export const env = {
  appUrl: normalizedAppUrl(),
  adminEmail: process.env.ADMIN_EMAIL || "orders@form5472prep.com",
  // Where customer→admin portal-message notifications go. Kept distinct
  // from adminEmail so order/fax notifications (orders@) and customer
  // support replies (support@) can be triaged separately.
  supportEmail: process.env.SUPPORT_EMAIL || "support@form5472prep.com",
  stripe: {
    get secretKey() { return required("STRIPE_SECRET_KEY"); },
    get webhookSecret() { return required("STRIPE_WEBHOOK_SECRET"); },
  },
  telnyx: {
    apiKey: optional("TELNYX_API_KEY"),
    connectionId: optional("TELNYX_CONNECTION_ID"),
    faxNumber: optional("TELNYX_FAX_NUMBER"),
    destination: process.env.FAX_DESTINATION || "+18558877737",
  },
  r2: {
    accountId: optional("R2_ACCOUNT_ID"),
    accessKeyId: optional("R2_ACCESS_KEY_ID"),
    secretAccessKey: optional("R2_SECRET_ACCESS_KEY"),
    bucket: process.env.R2_BUCKET || "form5472",
    publicBaseUrl: optional("R2_PUBLIC_BASE_URL"),
  },
};
