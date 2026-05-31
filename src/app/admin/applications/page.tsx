import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EIN_STATUS_COLORS: Record<string, string> = {
  RECEIVED:        "bg-slate-100 text-slate-700",
  IN_REVIEW:       "bg-amber-100 text-amber-800",
  DOCS_REQUESTED:  "bg-amber-100 text-amber-800",
  PAYMENT_PENDING: "bg-amber-100 text-amber-800",
  PROCESSING:      "bg-blue-100 text-blue-800",
  COMPLETED:       "bg-emerald-100 text-emerald-800",
  CANCELLED:       "bg-red-100 text-red-800",
};

const ITIN_STATUS_COLORS: Record<string, string> = {
  RECEIVED:        "bg-slate-100 text-slate-700",
  IN_REVIEW:       "bg-amber-100 text-amber-800",
  DOCS_REQUESTED:  "bg-amber-100 text-amber-800",
  PAYMENT_PENDING: "bg-amber-100 text-amber-800",
  CAA_SCHEDULED:   "bg-blue-100 text-blue-800",
  W7_SUBMITTED:    "bg-blue-100 text-blue-800",
  COMPLETED:       "bg-emerald-100 text-emerald-800",
  CANCELLED:       "bg-red-100 text-red-800",
};

function formatStatus(s: string) {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { type?: string; q?: string };
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const type = searchParams.type === "itin" ? "itin" : "ein";
  const q = (searchParams.q ?? "").trim();

  const einWhere = q
    ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { llcName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const itinWhere = q
    ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [einApps, itinApps] = await Promise.all([
    prisma.einApplication.findMany({ where: einWhere, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.itinApplication.findMany({ where: itinWhere, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">Applications</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {(["ein", "itin"] as const).map((t) => (
          <Link
            key={t}
            href={`/admin/applications?type=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`px-4 py-2 text-sm font-medium rounded-t-md -mb-px border-b-2 transition-colors ${
              type === t
                ? "border-accent text-accent"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.toUpperCase()} Applications
            <span className="ml-1.5 text-xs text-slate-400">
              ({t === "ein" ? einApps.length : itinApps.length})
            </span>
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="get" className="mb-6">
        <input type="hidden" name="type" value={type} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, LLC…"
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </form>

      {type === "ein" ? (
        einApps.length === 0 ? (
          <p className="text-slate-500 text-sm">No EIN applications yet.</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {einApps.map((app) => (
              <Link
                key={app.id}
                href={`/admin/applications/ein/${app.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{app.llcName}</p>
                  <p className="text-sm text-slate-500">
                    {app.fullName} &middot; {app.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${EIN_STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {formatStatus(app.status)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : itinApps.length === 0 ? (
        <p className="text-slate-500 text-sm">No ITIN applications yet.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {itinApps.map((app) => (
            <Link
              key={app.id}
              href={`/admin/applications/itin/${app.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-900">{app.fullName}</p>
                <p className="text-sm text-slate-500">{app.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ITIN_STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-700"}`}
                >
                  {formatStatus(app.status)}
                </span>
                <span className="text-xs text-slate-400">
                  {app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
