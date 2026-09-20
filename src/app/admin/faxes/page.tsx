import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { inboundFaxAllowed, formatFaxNumber } from "@/lib/inboundFax";
import { isAdmin } from "@/lib/admin/auth";
import { env } from "@/lib/env";
import { timeAgo } from "@/lib/admin/filingPresence";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Received faxes - Admin" };

type SearchParams = {
  view?: string;
  page?: string;
};

const PAGE_SIZE = 50;

export default async function AdminFaxesPage({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const view = searchParams.view === "all" || searchParams.view === "archived" ? searchParams.view : "unread";
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const where: Prisma.ReceivedFaxWhereInput =
    view === "archived"
      ? { archivedAt: { not: null } }
      : view === "unread"
        ? { readAt: null, archivedAt: null }
        : {};

  const [faxes, total] = await Promise.all([
    prisma.receivedFax.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        filing: { select: { id: true, llcName: true } },
        einApplication: { select: { id: true, llcName: true } },
        itinApplication: { select: { id: true, fullName: true } },
      },
    }),
    prisma.receivedFax.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const faxNumber = env.telnyx.faxNumber;
  const inboundEnabled = inboundFaxAllowed({
    publicKeySet: !!process.env.TELNYX_PUBLIC_KEY,
    nodeEnv: process.env.NODE_ENV,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <AdminPageHeader
        title="Received faxes"
        description="Inbound Telnyx faxes stored for admin review."
      />

      <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Our fax number</div>
        {faxNumber ? (
          <>
            <div className="mt-1 font-mono text-lg text-slate-900 select-all">{formatFaxNumber(faxNumber)}</div>
            <p className="mt-1 text-sm text-slate-600">
              Faxes sent to this number arrive here. It is also the number we send from, so the IRS
              replies to it.
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-600">
            No number configured. Set TELNYX_FAX_NUMBER in Vercel.
          </p>
        )}
      </div>

      {!inboundEnabled ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Incoming faxes are switched off until TELNYX_PUBLIC_KEY is set in Vercel. Add the public key from the Telnyx portal, then redeploy.
        </div>
      ) : null}

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {(["unread", "all", "archived"] as const).map((tab) => (
          <Link
            key={tab}
            href={tab === "unread" ? "/admin/faxes" : `/admin/faxes?view=${tab}`}
            className={`px-4 py-2 text-sm font-medium rounded-t-md -mb-px border-b-2 transition-colors ${
              view === tab
                ? "border-accent text-accent"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "unread" ? "Unread" : tab === "all" ? "All" : "Archived"}
          </Link>
        ))}
      </div>

      {faxes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500">
          No faxes yet. Faxes sent to your Telnyx number appear here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {faxes.map((fax) => {
              const unread = !fax.readAt;
              return (
                <Link
                  key={fax.id}
                  href={`/admin/faxes/${fax.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {unread ? <span className="h-2 w-2 rounded-full bg-accent" /> : null}
                      <p className={`truncate text-sm ${unread ? "font-semibold text-slate-950" : "font-medium text-slate-800"}`}>
                        {formatFaxNumber(fax.fromNumber)}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <time title={fax.receivedAt.toLocaleString("en-US")}>{timeAgo(fax.receivedAt)}</time>
                      <span>{fax.pageCount == null ? "Unknown pages" : `${fax.pageCount} page${fax.pageCount === 1 ? "" : "s"}`}</span>
                      <LinkedChip fax={fax} />
                      {fax.downloadError && !fax.pdfKey ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">
                          Download failed
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{fax.receivedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm">
          <PaginationLink view={view} page={page - 1} disabled={page <= 1}>
            Previous
          </PaginationLink>
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          <PaginationLink view={view} page={page + 1} disabled={page >= totalPages}>
            Next
          </PaginationLink>
        </div>
      ) : null}
    </div>
  );
}

type FaxWithLinks = Prisma.ReceivedFaxGetPayload<{
  include: {
    filing: { select: { id: true; llcName: true } };
    einApplication: { select: { id: true; llcName: true } };
    itinApplication: { select: { id: true; fullName: true } };
  };
}>;

function LinkedChip({ fax }: { fax: FaxWithLinks }) {
  if (fax.einApplication) {
    return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">EIN - {fax.einApplication.llcName}</span>;
  }
  if (fax.itinApplication) {
    return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">ITIN - {fax.itinApplication.fullName}</span>;
  }
  if (fax.filing) {
    return (
      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
        Form 5472 - {fax.filing.llcName ?? fax.filing.id}
      </span>
    );
  }
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Not linked</span>;
}

function PaginationLink({
  view,
  page,
  disabled,
  children,
}: {
  view: string;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (view !== "unread") params.set("view", view);
  if (page > 1) params.set("page", String(page));
  const href = params.toString() ? `/admin/faxes?${params.toString()}` : "/admin/faxes";

  if (disabled) {
    return <span className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-300">{children}</span>;
  }
  return (
    <Link href={href} className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
      {children}
    </Link>
  );
}
