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

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
