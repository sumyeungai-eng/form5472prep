import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminOverview } from "@/lib/admin/overview";
import { StatusBadge } from "./filings/StatusBadge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview · Admin" };

export default async function AdminIndex() {
  if (!(await isAdmin())) redirect("/admin/login");
  const overview = await getAdminOverview();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <AdminPageHeader title="Overview" description="What needs attention today." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CounterCard
          href="/admin/filings?review=1"
          label="Awaiting review"
          value={overview.counters.filingsInReview}
        />
        <CounterCard
          href="/admin/filings?status=DRAFT"
          label="Unfinished drafts"
          value={overview.counters.unfinishedDrafts}
        />
        <CounterCard
          href="/admin/applications"
          label="Applications to start"
          value={overview.counters.applicationsAwaiting}
        />
        <CounterCard href="#unread-messages" label="Unread messages" value={overview.counters.unreadMessages} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Recent filings</h2>
          </div>
          {overview.recentFilings.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No filings yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Filing</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {overview.recentFilings.map((filing) => (
                  <tr key={filing.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/filings/${filing.id}`} className="block">
                        <div className="font-medium text-slate-900">
                          {filing.llcName || <span className="text-slate-400">(no LLC name)</span>}
                        </div>
                        <div className="text-xs text-slate-500">
                          {filing.userEmail ?? <span className="text-slate-400">no email</span>}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={filing.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(filing.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section id="unread-messages" className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Unread messages</h2>
          </div>
          {overview.unreadThreads.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No unread customer messages.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {overview.unreadThreads.map((thread) => (
                <li key={thread.href}>
                  <Link href={thread.href} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{thread.label}</p>
                      <p className="text-xs text-slate-500">{formatDate(thread.updatedAt)}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {thread.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Recent applications</h2>
        </div>
        {overview.recentApplications.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No applications yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Application</th>
                <th className="px-4 py-2.5 font-semibold">Type</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {overview.recentApplications.map((app) => (
                <tr key={`${app.type}:${app.id}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/applications/${app.type}/${app.id}`} className="font-medium text-slate-900">
                      {app.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium uppercase text-slate-500">{app.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatStatus(app.status)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(app.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function CounterCard({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-accent hover:shadow-sm">
      <div className="text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </Link>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
