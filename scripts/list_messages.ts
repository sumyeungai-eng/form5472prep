import { prisma } from "../src/lib/prisma";

async function main() {
  const msgs = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { filing: { select: { id: true, llcName: true, user: { select: { email: true } } } } },
  });
  for (const m of msgs) {
    console.log(
      `${m.createdAt.toISOString()}  filing=${m.filingId.slice(0,8)}.. fromAdmin=${m.fromAdmin}  body="${m.body.slice(0,60)}${m.body.length>60?"…":""}"`,
    );
  }
  if (msgs.length === 0) console.log("(no messages in DB)");
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
