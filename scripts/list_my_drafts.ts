import { prisma } from "../src/lib/prisma";

const EMAIL = "hkdcec@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) { console.log("no user"); return; }
  const all = await prisma.filing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, status: true, llcName: true, taxYears: true,
      sessionId: true, funnelSource: true, createdAt: true, updatedAt: true,
    },
  });
  console.log(`user ${EMAIL} has ${all.length} filings:`);
  for (const f of all) {
    console.log(`  ${f.createdAt.toISOString()}  ${f.status.padEnd(10)}  id=${f.id.slice(0,10)}…  llc="${f.llcName ?? ""}"  yrs=[${f.taxYears.join(",")}]  session=${f.sessionId ? f.sessionId.slice(0,10)+"…" : "-"}  funnel=${f.funnelSource ?? "-"}`);
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
