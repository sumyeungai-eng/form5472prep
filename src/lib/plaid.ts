import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

// Plaid client factory. Reads PLAID_CLIENT_ID / PLAID_SECRET / PLAID_ENV
// from env at first call. Throws clear error if unset so route handlers
// can return a usable message to the UI.

let _client: PlaidApi | null = null;

export function plaidConfigured(): boolean {
  return !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
}

export function plaidEnvName(): "sandbox" | "development" | "production" {
  const v = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  if (v === "production") return "production";
  if (v === "development") return "development";
  return "sandbox";
}

export function plaid(): PlaidApi {
  if (_client) return _client;
  if (!plaidConfigured()) {
    throw new Error(
      "Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in your environment.",
    );
  }
  const config = new Configuration({
    basePath: PlaidEnvironments[plaidEnvName()],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET": process.env.PLAID_SECRET!,
      },
    },
  });
  _client = new PlaidApi(config);
  return _client;
}
