import { prisma } from "@/lib/prisma";

export type EmailBrand = { name: string; replyTo?: string };

// Resolves admin-enabled partner email branding for a filing.
export async function brandForFiling(filingId: string): Promise<EmailBrand | null> {
  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    select: {
      partner: {
        select: {
          whiteLabelEnabled: true,
          brandName: true,
          brandReplyTo: true,
        },
      },
    },
  });

  const partner = filing?.partner;
  const name = partner?.brandName?.trim();
  if (!partner?.whiteLabelEnabled || !name) return null;

  const replyTo = partner.brandReplyTo?.trim();
  return replyTo && replyTo.includes("@") ? { name, replyTo } : { name };
}
