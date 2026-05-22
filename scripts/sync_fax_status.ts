import { prisma } from "../src/lib/prisma";

const FILING_ID = "cmpenzypg0001ky04wz21hfr7";

async function main() {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) throw new Error("TELNYX_API_KEY missing");

  const f = await prisma.filing.findUnique({ where: { id: FILING_ID } });
  if (!f?.faxJobId) throw new Error("no faxJobId on filing");

  const res = await fetch(`https://api.telnyx.com/v2/faxes/${f.faxJobId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const json = (await res.json()) as { data?: { status?: string; failure_reason?: string | null } };
  const status = json.data?.status ?? "unknown";
  const reason = json.data?.failure_reason ?? null;
  const faxStatus = reason ? `${status}:${reason}` : status;

  const filingStatus = status === "failed" || status === "sending.failed" ? "FAILED" : f.status;

  await prisma.filing.update({
    where: { id: FILING_ID },
    data: { faxStatus, status: filingStatus },
  });
  console.log(`[sync] filing ${FILING_ID} → status=${filingStatus} faxStatus=${faxStatus}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
