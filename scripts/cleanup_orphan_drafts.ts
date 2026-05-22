// Deletes empty DRAFT rows that have no taxYears, no llcName, and were
// last touched more than 1 hour ago — typically the "Unnamed filing" rows
// produced by the old auto-create-on-google-signin behaviour. Safe to run
// repeatedly; never touches PAID/CONFIRMED/etc. or recent in-progress drafts.
import { prisma } from "../src/lib/prisma";

async function main() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const candidates = await prisma.filing.findMany({
    where: {
      status: "DRAFT",
      llcName: null,
      taxYears: { isEmpty: true },
      updatedAt: { lt: oneHourAgo },
    },
    select: { id: true, userId: true, sessionId: true, createdAt: true },
  });
  console.log(`found ${candidates.length} orphan empty DRAFT(s) to delete`);
  for (const c of candidates) {
    console.log(`  delete ${c.id}  created=${c.createdAt.toISOString()}  user=${c.userId ?? "-"}  session=${c.sessionId?.slice(0, 10) ?? "-"}`);
  }
  if (candidates.length > 0) {
    const r = await prisma.filing.deleteMany({
      where: { id: { in: candidates.map((c) => c.id) } },
    });
    console.log(`deleted ${r.count} row(s)`);
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
