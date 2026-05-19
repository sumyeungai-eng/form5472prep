import { NextResponse } from "next/server";
import { Products, CountryCode } from "plaid";
import { getOwnedFiling } from "@/lib/session";
import { plaid, plaidConfigured } from "@/lib/plaid";

export const runtime = "nodejs";

// Mints a short-lived link_token the browser uses to open Plaid Link.
// The token is scoped to a specific filing so we can re-associate the
// resulting access_token on exchange.
export async function POST(req: Request) {
  if (!plaidConfigured()) {
    return NextResponse.json(
      { error: "Plaid isn't configured on this server. Set PLAID_CLIENT_ID + PLAID_SECRET." },
      { status: 503 },
    );
  }

  const { filingId } = await req.json();
  const filing = await getOwnedFiling(filingId);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const res = await plaid().linkTokenCreate({
    user: { client_user_id: filing.id },
    client_name: "Form5472 Prep",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return NextResponse.json({ linkToken: res.data.link_token });
}
