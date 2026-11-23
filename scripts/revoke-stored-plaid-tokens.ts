/**
 * Revoke legacy stored Plaid tokens and clear them only after disconnection.
 * AFTER deploying the migration, from the repo root with a shell-compatible
 * .env.production.local containing the intended database and Plaid credentials:
 * Dry run: set -a; source .env.production.local; set +a; npx tsx scripts/revoke-stored-plaid-tokens.ts
 * Apply:   set -a; source .env.production.local; set +a; npx tsx scripts/revoke-stored-plaid-tokens.ts --apply
 * tsx does not load Next.js env files; export them explicitly as above.
 */
import { pathToFileURL } from "node:url";
import { prisma } from "../src/lib/prisma";
import { plaid, plaidEnvName } from "../src/lib/plaid";

type Dependencies = {
  prisma: {
    plaidConnection: {
      findMany(args: {
        where: { accessToken: { not: null } };
        select: { id: true; itemId: true; accessToken: true };
      }): Promise<{ id: string; itemId: string; accessToken?: string | null }[]>;
      update(args: {
        where: { id: string };
        data: { accessToken: null; revokedAt: Date };
      }): Promise<unknown>;
    };
  };
  plaid: () => {
    itemRemove(args: { access_token: string }): Promise<unknown>;
  };
  plaidEnvName?: typeof plaidEnvName;
  databaseUrl?: string;
  log?: (message: string) => void;
};

export async function revokeStoredPlaidTokens(
  {
    prisma, plaid, plaidEnvName: envName = plaidEnvName,
    databaseUrl = process.env.DATABASE_URL, log = console.log,
  }: Dependencies,
  apply = false,
) {
  const connections = await prisma.plaidConnection.findMany({
    where: { accessToken: { not: null } },
    select: { id: true, itemId: true, accessToken: true },
  });
  const environment = envName();
  const prefix = (token: string | null | undefined) =>
    token?.match(/^access-(sandbox|development|production)-/)?.[1] ?? "unknown";
  let databaseHost = "missing";
  if (databaseUrl) {
    try { databaseHost = new URL(databaseUrl).host || "invalid"; }
    catch { databaseHost = "invalid"; }
  }
  log(`PLAID_ENV: ${environment}`);
  log(`Database host: ${databaseHost}`);
  const counts = { sandbox: 0, development: 0, production: 0, unknown: 0 };
  for (const connection of connections) counts[prefix(connection.accessToken) as keyof typeof counts]++;
  log(`Token prefixes: sandbox=${counts.sandbox}, development=${counts.development}, production=${counts.production}, unknown=${counts.unknown}`);
  log(`${apply ? "APPLY" : "DRY RUN"}: ${connections.length} stored Plaid token(s)`);
  for (const { itemId } of connections) log(itemId);
  // Preflight the ENTIRE batch before any Plaid call or write. A wrong
  // environment can return INVALID_ACCESS_TOKEN for a perfectly live item.
  if (apply && connections.some(({ accessToken }) => prefix(accessToken) !== environment)) {
    log(`ABORT: stored token prefixes do not all match PLAID_ENV=${environment}; no Plaid calls or writes; all rows unchanged`);
    return { found: connections.length, cleared: 0, failed: connections.length };
  }
  let cleared = 0;
  let failed = 0;
  for (const connection of connections) {
    const { id, itemId, accessToken } = connection;
    if (!apply) continue;
    if (accessToken == null) {
      failed++;
      log(`${itemId}: token unavailable; row unchanged`);
      continue;
    }
    try {
      await plaid().itemRemove({ access_token: accessToken });
    } catch (error) {
      const code = (error as { response?: { data?: { error_code?: unknown } } } | null)
        ?.response?.data?.error_code;
      const alreadyGone = (code === "ITEM_NOT_FOUND" || code === "INVALID_ACCESS_TOKEN") &&
        accessToken.startsWith(`access-${environment}-`);
      if (!alreadyGone) {
        failed++;
        // Raw Plaid errors include request config; report only a redacted code.
        const reason = typeof code === "string"
          ? code.split(accessToken).join("[redacted]") : "Item removal failed";
        log(`${itemId}: ${reason}; row unchanged`);
        continue;
      }
    }
    try {
      await prisma.plaidConnection.update({
        where: { id },
        data: { accessToken: null, revokedAt: new Date() },
      });
      cleared++;
      log(`${itemId}: revoked; stored token cleared`);
    } catch {
      failed++;
      log(`${itemId}: database update failed; retry this script`);
    }
  }
  return { found: connections.length, cleared, failed };
}

async function main() {
  try {
    const result = await revokeStoredPlaidTokens({ prisma, plaid }, process.argv.includes("--apply"));
    if (result.failed) process.exitCode = 1;
  } catch {
    // Never print a raw database or Plaid error that might contain a token.
    console.error("Plaid token cleanup failed.");
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun = typeof require !== "undefined" && typeof module !== "undefined"
  ? require.main === module
  : !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  void main();
}
