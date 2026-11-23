/**
 * Revoke legacy stored Plaid tokens and clear them only after disconnection.
 * The owner must run this with production environment variables AFTER deploying
 * the migration: npx tsx scripts/revoke-stored-plaid-tokens.ts (dry run), then
 * npx tsx scripts/revoke-stored-plaid-tokens.ts --apply to revoke and clear.
 */
import { pathToFileURL } from "node:url";
import { prisma } from "../src/lib/prisma";
import { plaid } from "../src/lib/plaid";

type Dependencies = {
  prisma: {
    plaidConnection: {
      findMany(args: {
        where: { accessToken: { not: null } };
        select: { id: true; itemId: true; accessToken: boolean };
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
  log?: (message: string) => void;
};

export async function revokeStoredPlaidTokens(
  { prisma, plaid, log = console.log }: Dependencies,
  apply = false,
) {
  const connections = await prisma.plaidConnection.findMany({
    where: { accessToken: { not: null } },
    select: { id: true, itemId: true, accessToken: apply },
  });
  log(`${apply ? "APPLY" : "DRY RUN"}: ${connections.length} stored Plaid token(s)`);
  let cleared = 0;
  let failed = 0;
  for (const connection of connections) {
    const { id, itemId, accessToken } = connection;
    if (!apply) {
      log(itemId);
      continue;
    }
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
      if (code !== "ITEM_NOT_FOUND" && code !== "INVALID_ACCESS_TOKEN") {
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
