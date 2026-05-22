import { prisma } from "../src/lib/prisma";

async function main() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const drafts = await prisma.filing.findMany({
    where: { status: "DRAFT", createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      llcName: true,
      taxYears: true,
      userId: true,
      sessionId: true,
      funnelSource: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { email: true } },
    },
  });
  console.log(`${drafts.length} DRAFT rows in last 24h`);
  for (const d of drafts) {
    console.log(
      `${d.createdAt.toISOString()}  id=${d.id}  llc="${d.llcName ?? ""}"  yrs=[${d.taxYears.join(",")}]  user=${d.user?.email ?? "(anon)"}  session=${d.sessionId ? d.sessionId.slice(0, 10) + "…" : "-"}  funnel=${d.funnelSource ?? "-"}`,
    );
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
