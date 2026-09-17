import Link from "next/link";
import { Plus, FolderOpen, Search } from "lucide-react";
import { requirePartner } from "@/lib/partner/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getTiersForSource } from "@/lib/pricing";
import { timeAgo } from "@/lib/admin/filingPresence";
import { PartnerFilingRow } from "./PartnerFilingRow";
import { PARTNER_PAGE_SIZE, pageCount, parsePartnerQuery, partnerFilingWhere } from "@/lib/partner/filingList";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "slate" | "amber" | "blue" | "emerald" | "red" }> = {
  DRAFT: { label: "Draft — not paid", tone: "slate" },
  PAID: { label: "Paid — ready to generate", tone: "amber" },
  PDF_GENERATED: { label: "Ready to sign", tone: "amber" },
  SIGNATURE_PENDING: { label: "Awaiting signature", tone: "amber" },
  SIGNED_UPLOADED: { label: "Ready to fax", tone: "blue" },
  FAXED: { label: "Faxed", tone: "blue" },
  CONFIRMED: { label: "Confirmed", tone: "emerald" },
  FAILED: { label: "Failed", tone: "red" },
};

function buildHref(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/partner?${qs}` : "/partner";
}

export default async function PartnerDashboard({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const partner = await requirePartner();
  const query = parsePartnerQuery(searchParams);
  const where = partnerFilingWhere(partner.id, query);

  const [total, filings, statusGroups] = await Promise.all([
    prisma.filing.count({ where }),
    prisma.filing.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (query.page - 1) * PARTNER_PAGE_SIZE,
      take: PARTNER_PAGE_SIZE,
      include: { user: true },
    }),
    prisma.filing.groupBy({
      by: ["status"],
      where: { partnerId: partner.id, partnerHidden: false },
      _count: true,
    }),
  ]);

  // Header counts describe the partner's WHOLE (non-archived) book, not the
  // current page — computed from the groupBy above, not per-status queries.
  const wholeBookTotal = statusGroups.reduce((sum, g) => sum + g._count, 0);
  const doneCount = statusGroups.find((g) => g.status === "CONFIRMED")?._count ?? 0;
  const activeCount = statusGroups
    .filter((g) => g.status !== "CONFIRMED" && g.status !== "FAILED")
    .reduce((sum, g) => sum + g._count, 0);

  const hasAnyFilings = wholeBookTotal > 0 || query.archived;
  const hasFilters = query.q.length > 0 || !!query.status || query.archived;
  const pages = pageCount(total);

  const baseParams: Record<string, string | undefined> = {
    q: query.q || undefined,
    status: query.status ?? undefined,
    archived: query.archived ? "1" : undefined,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Client filings</h1>
          <p className="text-sm text-slate-500 mt-1">
            {partner.company || partner.name} · {wholeBookTotal} total · {activeCount} in progress · {doneCount} confirmed
          </p>
        </div>
        <Link href="/partner/filings/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New client filing
          </Button>
        </Link>
      </div>

      {hasAnyFilings && (
        <form method="get" className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={query.q}
              placeholder="Search LLC or client email"
              className="w-full text-sm pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="text-sm px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS).map(([value, s]) => (
              <option key={value} value={value}>
                {s.label}
              </option>
            ))}
          </select>
          {query.archived && <input type="hidden" name="archived" value="1" />}
          <button
            type="submit"
            className="text-sm font-medium px-3 py-2 rounded-md bg-accent text-white hover:opacity-90"
          >
            Search
          </button>
          <Link
            href={buildHref(baseParams, { archived: query.archived ? undefined : "1", page: undefined })}
            className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
          >
            {query.archived ? "Back to active" : "View archived"}
          </Link>
        </form>
      )}

      {filings.length === 0 ? (
        hasFilters ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900">No filings match this search</p>
            <Link href="/partner" className="inline-block mt-4 text-sm text-accent hover:underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <FolderOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900">No filings yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Start your first client filing. You prepare it; your client signs with a link you send them.
            </p>
            <Link href="/partner/filings/new" className="inline-block mt-4">
              <Button>Start a client filing</Button>
            </Link>
          </div>
        )
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {filings.map((f) => {
              const s = STATUS[f.status] ?? { label: f.status, tone: "slate" as const };
              return (
                <PartnerFilingRow
                  key={f.id}
                  id={f.id}
                  llcName={f.llcName}
                  clientEmail={f.user?.email ?? null}
                  taxYears={f.taxYears}
                  tierLabel={
                    getTiersForSource(f.funnelSource)[
                      f.tier as "single_year" | "two_year_diirsp" | "multi_year_diirsp"
                    ]?.label ?? f.tier
                  }
                  updatedAt={f.updatedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  statusLabel={s.label}
                  statusTone={s.tone}
                  status={f.status}
                  hasSignature={!!f.signaturePngKey || !!f.signedPdfKey}
                  archived={f.partnerHidden}
                  clientInvitedAgo={f.clientInviteSentAt ? timeAgo(f.clientInviteSentAt) : null}
                />
              );
            })}
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <Link
                href={buildHref(baseParams, { page: query.page > 1 ? String(query.page - 1) : undefined })}
                aria-disabled={query.page <= 1}
                className={
                  query.page <= 1
                    ? "pointer-events-none text-slate-300"
                    : "hover:text-slate-900 hover:underline"
                }
              >
                Previous
              </Link>
              <span>
                Page {query.page} of {pages}
              </span>
              <Link
                href={buildHref(baseParams, { page: query.page < pages ? String(query.page + 1) : undefined })}
                aria-disabled={query.page >= pages}
                className={
                  query.page >= pages
                    ? "pointer-events-none text-slate-300"
                    : "hover:text-slate-900 hover:underline"
                }
              >
                Next
              </Link>
            </div>
          )}
        </>
      )}

      <p className="mt-6 text-xs text-slate-500 leading-relaxed">
        Each filing is paid for individually at checkout and signed by your client. Need volume
        pricing or invoicing? Email{" "}
        <a href="mailto:support@form5472prep.com" className="text-accent hover:underline">
          support@form5472prep.com
        </a>
        .
      </p>
    </div>
  );
}
