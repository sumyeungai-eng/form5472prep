import Link from "next/link";
import { FolderOpen, Search } from "lucide-react";
import { requirePartner } from "@/lib/partner/auth";
import { prisma } from "@/lib/prisma";
import { getTiersForSource } from "@/lib/pricing";
import { timeAgo } from "@/lib/admin/filingPresence";
import { PartnerHero } from "./PartnerHero";
import { PartnerStatCards } from "./PartnerStatCards";
import { PartnerFilingRow } from "./PartnerFilingRow";
import { PARTNER_PAGE_SIZE, pageCount, parsePartnerQuery, partnerFilingWhere } from "@/lib/partner/filingList";
import { responsibilityFor, type Court } from "@/lib/partner/responsibility";

export const dynamic = "force-dynamic";

// Calendar-year 2026 Form 5472 filings (due with the pro forma 1120) are due
// April 15, 2027 — a plain constant, not derived from any per-filing data.
const NEXT_DEADLINE = "April 15, 2027";

const STATUS: Record<string, { label: string }> = {
  DRAFT: { label: "Draft — not paid" },
  PAID: { label: "Paid — ready to generate" },
  PDF_GENERATED: { label: "Ready to sign" },
  SIGNATURE_PENDING: { label: "Awaiting signature" },
  SIGNED_UPLOADED: { label: "Ready to fax" },
  FAXED: { label: "Faxed" },
  CONFIRMED: { label: "Confirmed" },
  FAILED: { label: "Failed" },
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

  const [total, filings, statusGroups, draftInvitedCount] = await Promise.all([
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
    // Single extra count (not one query per card) to split DRAFT between
    // "you" (not yet invited) and "client" (invited, filling in details).
    prisma.filing.count({
      where: {
        partnerId: partner.id,
        partnerHidden: false,
        status: "DRAFT",
        clientInviteSentAt: { not: null },
      },
    }),
  ]);

  // Whole-book counts (not just the current page), computed from the two
  // queries above rather than one query per stat card.
  const statusCount = (status: string) =>
    statusGroups.find((g) => g.status === status)?._count ?? 0;
  const draftTotal = statusCount("DRAFT");
  const draftAwaitingYou = Math.max(0, draftTotal - draftInvitedCount);

  const courtCounts: Record<Court, number> = {
    you: draftAwaitingYou + statusCount("PAID") + statusCount("PDF_GENERATED") + statusCount("FAILED"),
    client: draftInvitedCount + statusCount("SIGNATURE_PENDING"),
    irs: statusCount("SIGNED_UPLOADED") + statusCount("FAXED"),
    done: statusCount("CONFIRMED"),
  };
  const wholeBookTotal = statusGroups.reduce((sum, g) => sum + g._count, 0);

  const hasAnyFilings = wholeBookTotal > 0 || query.archived;
  const hasFilters = query.q.length > 0 || !!query.status || !!query.court || query.archived;
  const pages = pageCount(total);

  const baseParams: Record<string, string | undefined> = {
    q: query.q || undefined,
    status: query.status ?? undefined,
    court: query.court ?? undefined,
    archived: query.archived ? "1" : undefined,
  };

  const hrefFor = (court: Court | null) =>
    buildHref(baseParams, { court: court ?? undefined, status: undefined, page: undefined });

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <PartnerHero
        company={partner.company || partner.name}
        partnerName={partner.name}
        total={wholeBookTotal}
        needsYou={courtCounts.you}
        nextDeadline={NEXT_DEADLINE}
      />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {hasAnyFilings && (
          <div className="mb-6">
            <PartnerStatCards counts={courtCounts} activeCourt={query.court} hrefFor={hrefFor} />
          </div>
        )}

        {hasAnyFilings && (
          <form
            method="get"
            className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
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
            {/* Submitting this form (search/status) is a distinct filter mode from
                the court stat cards above, so it intentionally does not carry
                `court` forward — picking a status here always starts fresh. */}
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
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
              <p className="mt-4 font-medium text-slate-900">No filings match these filters.</p>
              <Link href="/partner" className="inline-block mt-4 text-sm text-accent hover:underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
              <FolderOpen className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
              <p className="mt-4 font-serif text-xl text-ink">No filings yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Start your first client filing. You prepare it; your client signs with a link you send them.
              </p>
              <Link
                href="/partner/filings/new"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent-700"
              >
                Start a client filing
              </Link>
            </div>
          )
        ) : (
          <>
            {/* Not `divide-y divide-slate-100`: Tailwind's `divide-*-color`
                utility sets the `border-color` SHORTHAND on every row but the
                first (via `:not([hidden]) ~ :not([hidden])`), which — because
                that compound selector outranks a plain `.border-l-{color}`
                class — silently overwrote each row's own court-colored left
                edge. `border-b-slate-100` only touches border-bottom-color,
                so it can't collide with border-left-color. */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-b-slate-100">
              {filings.map((f) => {
                const responsibility = responsibilityFor({
                  status: f.status,
                  clientInviteSentAt: f.clientInviteSentAt,
                  signedPdfKey: f.signedPdfKey,
                });
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
                    court={responsibility.court}
                    responsibilityLabel={responsibility.label}
                    responsibilityHint={responsibility.hint}
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
    </div>
  );
}
