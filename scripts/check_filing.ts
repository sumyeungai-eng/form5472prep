import { prisma } from "../src/lib/prisma";

async function main() {
  const f = await prisma.filing.findUnique({
    where: { id: "cmpenzypg0001ky04wz21hfr7" },
    select: {
      id: true,
      status: true,
      faxJobId: true,
      faxStatus: true,
      faxService: true,
      signedPdfKey: true,
      generatedPdfKey: true,
      llcName: true,
      taxYears: true,
      updatedAt: true,
      createdAt: true,
      userId: true,
    },
  });
  console.log(JSON.stringify(f, null, 2));
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
