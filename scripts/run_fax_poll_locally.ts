// Mirrors the cron's query so we can smoke-test that the candidate set is
// sane against real DB + Telnyx without needing CRON_SECRET. Read-only:
// does NOT mutate DB or send emails. Just prints what the cron would do.
import { prisma } from "../src/lib/prisma";

const IN_FLIGHT = ["queued", "sending"];

async function main() {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) throw new Error("TELNYX_API_KEY missing");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const candidates = await prisma.filing.findMany({
    where: {
      status: "FAXED",
      faxJobId: { not: null },
      updatedAt: { gte: sevenDaysAgo },
    },
    select: { id: true, faxJobId: true, faxStatus: true, llcName: true, updatedAt: true },
  });

  const inFlight = candidates.filter(
    (f) => f.faxStatus && (IN_FLIGHT.includes(f.faxStatus) || f.faxStatus.startsWith("retry_")),
  );

  console.log(`[poll] candidates=${candidates.length} in-flight=${inFlight.length}`);
  for (const f of inFlight) {
    const r = await fetch(`https://api.telnyx.com/v2/faxes/${f.faxJobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const tx = ((await r.json()) as { data: { status: string; failure_reason?: string | null } }).data;
    const action =
      tx.status === "delivered"
        ? "→ would mark CONFIRMED + send emails"
        : tx.status === "failed" || tx.status === "sending.failed"
          ? `→ would mark FAILED (${tx.failure_reason}) + send emails`
          : "→ leave (still in-flight)";
    console.log(`  ${f.id} [${f.llcName ?? "?"}] db=${f.faxStatus} telnyx=${tx.status} ${action}`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
