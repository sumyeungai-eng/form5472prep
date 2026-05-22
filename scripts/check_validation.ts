import { prisma } from "../src/lib/prisma";

async function main() {
  const f = await prisma.filing.findUnique({
    where: { id: "cmpenzypg0001ky04wz21hfr7" },
    select: {
      id: true,
      validationStatus: true,
      validationCheckedAt: true,
      validationIssuesJson: true,
    },
  });
  console.log("status:", f?.validationStatus);
  console.log("checkedAt:", f?.validationCheckedAt?.toISOString());
  const j = f?.validationIssuesJson as { status?: string; summary?: string; customer_questions?: string[]; issues?: Array<{ severity: string; location: string; needs_customer_input: boolean; customer_question?: string | null }>; errorMessage?: string } | null;
  console.log("ai.status:", j?.status);
  console.log("ai.summary:", j?.summary);
  console.log("ai.customer_questions:", JSON.stringify(j?.customer_questions, null, 2));
  console.log("ai.issues count:", j?.issues?.length);
  if (j?.errorMessage) console.log("ai.errorMessage:", j.errorMessage);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
