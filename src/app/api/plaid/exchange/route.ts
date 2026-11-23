import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { plaid, plaidConfigured } from "@/lib/plaid";
import { alertServerError } from "@/lib/errorAlert";
import { categorizeAll } from "@/lib/bank/categorize";
import type { ParsedTransaction } from "@/lib/bank/types";

export const runtime = "nodejs";

function errorCode(error: unknown, ...secrets: string[]): string | undefined {
  const code = (error as { response?: { data?: { error_code?: unknown } } } | null)
    ?.response?.data?.error_code;
  if (typeof code !== "string") return undefined;
  // Never pass raw errors (including Axios request config) to logs or alerts.
  return [...secrets, process.env.PLAID_SECRET ?? ""].filter(Boolean)
    .reduce((safe, secret) => safe.split(secret).join("[redacted]"), code);
}

// One-time import: the access token exists only for this request. Always ask
// Plaid to remove the item before returning, including when import work fails.
export async function POST(req: Request) {
  if (!plaidConfigured()) {
    return NextResponse.json({ error: "Plaid not configured" }, { status: 503 });
  }

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { filingId, publicToken, taxYear } = input as Record<string, unknown>;
  const year = typeof taxYear === "number" || typeof taxYear === "string"
    ? (/^\d{4}$/.test(String(taxYear)) ? Number(taxYear) : NaN) : NaN;
  if (typeof filingId !== "string" || !filingId.trim() ||
      typeof publicToken !== "string" || !publicToken.trim() ||
      !Number.isInteger(year) || year < 2000 || year > new Date().getUTCFullYear() + 1) {
    return NextResponse.json({ error: "Invalid filingId, publicToken or taxYear" }, { status: 400 });
  }
  const filing = await getOwnedFiling(filingId);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let ex;
  try {
    ex = await plaid().itemPublicTokenExchange({ public_token: publicToken });
  } catch (error) {
    console.warn("Plaid token exchange failed", { error_code: errorCode(error, publicToken) });
    return NextResponse.json({ error: "Could not import transactions from Plaid" }, { status: 502 });
  }
  const accessToken = ex.data.access_token;
  const itemId = ex.data.item_id;
  let institutionName: string | null = null;
  let revokedAt: Date | undefined;
  let response: NextResponse;
  try {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
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
      institutionName = null;
    }
    const tx = await plaid().transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: { count: 500 }, // good enough for a small-LLC year; paginate if needed
    });
    const parsed: ParsedTransaction[] = tx.data.transactions.map((t) => ({
      date: t.date,
      description: t.name,
      counterparty: t.merchant_name ?? t.name,
      // Plaid positive = money OUT; ours positive = money IN.
      amountCents: -Math.round(t.amount * 100),
      bankRef: t.transaction_id,
    }));
    const categorized = categorizeAll(parsed, {
      fullName: filing.ownerName ?? "",
      aliases: [],
    });
    response = NextResponse.json({
      institutionName,
      transactionCount: categorized.length,
      transactions: categorized,
    });
  } catch (error) {
    console.warn("Plaid import failed", { itemId, error_code: errorCode(error, accessToken, publicToken) });
    return NextResponse.json({ error: "Could not import transactions from Plaid" }, { status: 502 });
  } finally {
    try {
      await plaid().itemRemove({ access_token: accessToken });
      revokedAt = new Date();
    } catch (error) {
      const code = errorCode(error, accessToken, publicToken);
      console.warn("Plaid item removal failed", { itemId, error_code: code });
      await alertServerError({
        path: "/api/plaid/exchange",
        digest: "plaid-item-remove-failed",
        message: `Plaid item removal failed: itemId=${itemId}, error_code=${code ?? "unknown"}`,
      }).catch(() => {});
    }
  }

  // Persist metadata after the revoke attempt. Losing metadata must not lose an import.
  try {
    await prisma.plaidConnection.create({
      data: {
        filingId: filing.id,
        itemId,
        institutionName,
        ...(revokedAt ? { revokedAt } : {}),
      },
    });
  } catch {
    await alertServerError({
      path: "/api/plaid/exchange",
      digest: "plaid-connection-persist-failed",
      message: `Plaid import metadata save failed: filingId=${filing.id}, itemId=${itemId}`,
    }).catch(() => {});
  }
  return response;
}
