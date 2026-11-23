import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { plaid, plaidConfigured } from "@/lib/plaid";
import { categorizeAll } from "@/lib/bank/categorize";
import type { ParsedTransaction } from "@/lib/bank/types";

export const runtime = "nodejs";

// Called from the client after Plaid Link succeeds. Exchanges the public_token
// for a request-only access_token, fetches the tax-year's transactions, and
// disconnects the item before returning them categorized — same shape the
// CSV/PDF upload route returns so the wizard can plug them in.
export async function POST(req: Request) {
  if (!plaidConfigured()) {
    return NextResponse.json({ error: "Plaid not configured" }, { status: 503 });
  }

  const { filingId, publicToken, taxYear } = await req.json();
  const filing = await getOwnedFiling(filingId);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!publicToken || !taxYear)
    return NextResponse.json({ error: "publicToken + taxYear required" }, { status: 400 });

  // 1. Exchange the public_token for an access_token + item_id.
  const ex = await plaid().itemPublicTokenExchange({ public_token: publicToken });
  const accessToken = ex.data.access_token;
  const itemId = ex.data.item_id;

  // 2. Fetch the institution name so the UI can show "Connected to Mercury".
  let institutionName: string | null = null;
  try {
    const item = await plaid().itemGet({ access_token: accessToken });
    const instId = item.data.item.institution_id;
    if (instId) {
      const inst = await plaid().institutionsGetById({
        institution_id: instId,
        country_codes: ["US"] as never[],
      });
      institutionName = inst.data.institution.name;
    }
  } catch {
    // Non-fatal — we still have the access token.
  }

  // 3. Pull transactions once; always attempt to disconnect, even on failure.
  const startDate = `${taxYear}-01-01`;
  const endDate = `${taxYear}-12-31`;
  let tx;
  let revokedAt: Date | undefined;
  try {
    tx = await plaid().transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: { count: 500 }, // good enough for a small-LLC year; paginate if needed
    });
  } catch {
    // Do not propagate a Plaid/Axios error containing the request's token.
    return NextResponse.json({ error: "Could not import transactions from Plaid" }, { status: 502 });
  } finally {
    try {
      await plaid().itemRemove({ access_token: accessToken });
      revokedAt = new Date();
    } catch (error) {
      const code = (error as { response?: { data?: { error_code?: unknown } } } | null)
        ?.response?.data?.error_code;
      // Never log the raw error: its request config can contain the token.
      console.warn("Plaid item removal failed", {
        itemId,
        error: typeof code === "string" ? code.split(accessToken).join("[redacted]") : "Item removal failed",
      });
    }
  }

  // 4. Keep import metadata only, never the access token.
  await prisma.plaidConnection.create({
    data: {
      filingId: filing.id,
      itemId,
      institutionName,
      ...(revokedAt ? { revokedAt } : {}),
    },
  });

  const parsed: ParsedTransaction[] = tx.data.transactions.map((t) => ({
    date: t.date,
    description: t.name,
    counterparty: t.merchant_name ?? t.name,
    // Plaid convention: positive = money OUT of the account. Flip to ours
    // where positive = money IN.
    amountCents: -Math.round(t.amount * 100),
    bankRef: t.transaction_id,
  }));

  const categorized = categorizeAll(parsed, {
    fullName: filing.ownerName ?? "",
    aliases: [],
  });

  return NextResponse.json({
    institutionName,
    transactionCount: categorized.length,
    transactions: categorized,
  });
}
