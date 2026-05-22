// One-off: fire the new "fax delivered" admin notification for the
// pre-existing delivered fax. Old webhook code handled the delivery
// before the new flow shipped, so admin never got the alert.
import { prisma } from "../src/lib/prisma";
import { sendFaxDeliveredAdminEmail, type FaxProof } from "../src/lib/email";
import { env } from "../src/lib/env";

const FILING_ID = "cmpenzypg0001ky04wz21hfr7";

async function main() {
  const apiKey = process.env.TELNYX_API_KEY!;
  const filing = await prisma.filing.findUnique({
    where: { id: FILING_ID },
    include: { user: true },
  });
  if (!filing?.faxJobId) throw new Error("no faxJobId on filing");

  const r = await fetch(`https://api.telnyx.com/v2/faxes/${filing.faxJobId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const tx = (await r.json()) as { data: Record<string, unknown> };

  const proof: FaxProof = {
    faxId: filing.faxJobId,
    deliveredAt: (tx.data.updated_at as string) ?? new Date().toISOString(),
    pageCount: (tx.data.page_count as number | null) ?? null,
    durationSecs: (tx.data.call_duration_secs as number | null) ?? null,
    from: (tx.data.from as string | null) ?? null,
    to: (tx.data.to as string | null) ?? null,
  };

  await sendFaxDeliveredAdminEmail({
    adminEmail: env.adminEmail,
    customerEmail: filing.user?.email ?? null,
    llcName: filing.llcName,
    taxYears: filing.taxYears,
    filingId: filing.id,
    adminFilingUrl: `${env.appUrl}/admin/filings/${filing.id}`,
    proof,
  });
  console.log(`[backfill] admin email sent → ${env.adminEmail}`);
  console.log("proof:", JSON.stringify(proof, null, 2));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
