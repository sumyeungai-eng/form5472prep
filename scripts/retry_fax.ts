import { prisma } from "../src/lib/prisma";
import { submitFax } from "../src/lib/fax";
import { publicUrl } from "../src/lib/storage";
import { env } from "../src/lib/env";

const FILING_ID = "cmpenzypg0001ky04wz21hfr7";

async function main() {
  const filing = await prisma.filing.findUnique({ where: { id: FILING_ID } });
  if (!filing) throw new Error("filing not found");
  if (!filing.signedPdfKey) throw new Error("no signedPdfKey on filing");

  console.log("[retry_fax] filing:", filing.id, "signedPdfKey:", filing.signedPdfKey);
  const mediaUrl = await publicUrl(filing.signedPdfKey);
  console.log("[retry_fax] media URL ready (length=" + mediaUrl.length + ")");

  const job = await submitFax({ mediaUrl, to: env.telnyx.destination });
  console.log("[retry_fax] telnyx job:", job);

  await prisma.filing.update({
    where: { id: filing.id },
    data: { faxJobId: job.id, faxStatus: job.status, status: "FAXED" },
  });
  console.log("[retry_fax] DB updated");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
