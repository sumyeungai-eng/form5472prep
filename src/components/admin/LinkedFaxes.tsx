import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatFaxNumber } from "@/lib/inboundFax";
import { prisma } from "@/lib/prisma";

type LinkedFaxesWhere =
  | { filingId: string }
  | { einApplicationId: string }
  | { itinApplicationId: string };

export async function LinkedFaxes({ where }: { where: LinkedFaxesWhere }) {
  const faxes = await prisma.receivedFax.findMany({
    where,
    orderBy: { receivedAt: "desc" },
  });

  if (faxes.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Received faxes</h2>
      <div className="divide-y divide-slate-100">
        {faxes.map((fax) => (
          <div key={fax.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{formatFaxNumber(fax.fromNumber)}</p>
              <p className="text-xs text-slate-500">
                {fax.receivedAt.toLocaleString("en-US")} - {fax.pageCount == null ? "Unknown pages" : `${fax.pageCount} page${fax.pageCount === 1 ? "" : "s"}`}
              </p>
            </div>
            <Link href={`/admin/faxes/${fax.id}`} className="inline-flex flex-none items-center gap-1 text-sm text-accent hover:underline">
              View <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
