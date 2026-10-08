import type { Prisma } from "@prisma/client";
import { logFilingChange } from "@/lib/admin/mutations";
import { prisma } from "@/lib/prisma";

// "Add another return to this order": one paid order that needs two (or more)
// separate returns, each faxed on its own. The extra return is a normal
// Filing linked to the original (linkedToFilingId), so it reuses the whole
// review → client check & sign → fax → receipt pipeline unchanged. It copies
// ONLY the client / LLC identity — never the payment, PDFs, signature, fax,
// pre-flight or per-year answers (Form 7004, final return, figures) of the
// original — and is excluded from sales/revenue reports.

export class LinkedReturnError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// Identity fields copied from the original order. Explicit allowlist: a new
// Filing column is NOT copied unless it is added here deliberately.
export const LINKED_RETURN_COPY_FIELDS = [
  "userId",
  "partnerId",
  "tier",
  "faxService",
  "marketingConsent",
  "llcName",
  "llcEin",
  "llcAddress",
  "llcCity",
  "llcState",
  "llcZip",
  "llcCountry",
  "llcCountryBusiness",
  "llcDateIncorporated",
  "llcBusinessActivity",
  "llcBusinessCode",
  "llcMemberCount",
  "llcAddressIsRegisteredAgentOnly",
  "ownerName",
  "ownerAddress",
  "ownerAddressStreet",
  "ownerAddressCity",
  "ownerAddressState",
  "ownerAddressPostal",
  "ownerAddressCountry",
  "ownerCountryCitizenship",
  "ownerCountryTaxResidence",
  "ownerCountryBusiness",
  "ownerFtin",
  "ownerItin",
  "ownerReferenceId",
  "ownerHasFtin",
  "ownerNoPostalCode",
] as const;
// Deliberately NOT copied (they can differ per tax year / return):
// priorForm5472Filed, hasUsSourceIncome, usTaxWithheld, every Form 7004 /
// final-return / reasonable-cause answer and all figures.

export function parseLinkedTaxYears(input: unknown, now = new Date()): number[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 5) return null;
  const maxYear = now.getUTCFullYear();
  const years = Array.from(new Set(input.map((y) => Number(y))));
  if (years.some((y) => !Number.isInteger(y) || y < 2018 || y > maxYear)) return null;
  return years.sort((a, b) => a - b);
}

export async function createLinkedReturn(args: {
  sourceFilingId: string;
  taxYears: number[];
  adminId: string | null;
}): Promise<{ id: string; rootId: string }> {
  const source = await prisma.filing.findUnique({ where: { id: args.sourceFilingId } });
  if (!source) throw new LinkedReturnError(404, "Order not found.");
  if (source.status === "DRAFT") {
    throw new LinkedReturnError(409, "Only a paid order can get another return. This one is still a draft.");
  }
  if (source.supersededAt) throw new LinkedReturnError(409, "This order was superseded. Open the current one.");

  // Always hang extra returns off the ORIGINAL order, even when started from
  // a linked return, so the order has one root and a flat list of returns.
  const rootId = source.linkedToFilingId ?? source.id;
  const root =
    rootId === source.id ? source : await prisma.filing.findUnique({ where: { id: rootId } });
  if (!root) throw new LinkedReturnError(404, "The original order could not be found.");

  const copied: Record<string, unknown> = {};
  for (const field of LINKED_RETURN_COPY_FIELDS) copied[field] = root[field];

  const created = await prisma.filing.create({
    data: {
      ...(copied as Prisma.FilingUncheckedCreateInput),
      linkedToFilingId: root.id,
      status: "PAID",
      amountPaid: 0,
      taxYears: args.taxYears,
      inReview: true,
      reviewStartedAt: new Date(),
    },
    select: { id: true },
  });

  await logFilingChange({
    filingId: created.id,
    adminId: args.adminId,
    source: "admin",
    field: "linkedReturn",
    before: null,
    after: { linkedToFilingId: root.id, taxYears: args.taxYears },
    reason: "Added as another return on an existing paid order",
  }).catch((err) => console.error("[linkedReturn] change log (new) failed", err));
  await logFilingChange({
    filingId: root.id,
    adminId: args.adminId,
    source: "admin",
    field: "linkedReturn",
    before: null,
    after: { addedReturnId: created.id, taxYears: args.taxYears },
    reason: "Another return added to this order",
  }).catch((err) => console.error("[linkedReturn] change log (root) failed", err));

  return { id: created.id, rootId: root.id };
}
