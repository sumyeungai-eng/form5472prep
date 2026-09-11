import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "../../../_components/AdminPageHeader";
import { StatusBadge } from "../../../filings/StatusBadge";
import { CountryFlag } from "../../CountryFlag";
import { isAdmin } from "@/lib/admin/auth";
import { formatAttribution } from "@/lib/attribution";
import { getIpGroupDetail, type LinkedOrder } from "@/lib/admin/traffic";

export const dynamic = "force-dynamic";

const IP_GROUPING_CAVEAT =
  "Grouping is approximate: people behind office networks, mobile carriers or VPNs can share an IP, and one person's IP can change between visits.";

export async function generateMetadata({ params }: { params: { ip: string } }): Promise<Metadata> {
  const ip = decodeURIComponent(params.ip);
  return { title: `IP ${ip} · Traffic · Admin` };
}

export default async function AdminTrafficIpPage({
  params,
}: {
  params: { ip: string };
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const ip = decodeURIComponent(params.ip);
  const detail = await getIpGroupDetail(ip);
  if (!detail) notFound();

  const firstSeen = detail.visitors.reduce<Date | null>(
    (earliest, visitor) => (!earliest || visitor.firstSeenAt < earliest ? visitor.firstSeenAt : earliest),
    null,
  );
  const lastSeen = detail.visitors.reduce<Date | null>(
    (latest, visitor) => (!latest || visitor.lastSeenAt > latest ? visitor.lastSeenAt : latest),
    null,
  );
  const totalViews = detail.visitors.reduce((sum, visitor) => sum + visitor.pageViews, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <AdminPageHeader
        title={`IP ${ip}`}
        description={IP_GROUPING_CAVEAT}
        breadcrumb={[
          { label: "Traffic", href: "/admin/traffic" },
          { label: "IP", href: ipHref(ip) },
        ]}
      />

      <div className="mb-6 rounded-lg border border-slate-200 bg-white">
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
          <Fact
            label="Location"
            value={
              <span className="inline-flex items-center gap-1.5">
                <CountryFlag country={detail.country} />
                <span>{[detail.country, detail.city].filter(Boolean).join(" · ") || "—"}</span>
              </span>
            }
          />
          <Fact label="Visitors" value={detail.visitors.length.toString()} />
          <Fact label="Total views" value={totalViews.toString()} />
          <Fact label="First seen" value={firstSeen ? formatFullDate(firstSeen) : "—"} />
          <Fact label="Last seen" value={lastSeen ? formatFullDate(lastSeen) : "—"} />
        </div>
      </div>

      <div className="mb-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Browsers on this IP</h2>
        </div>
        <table className="w-full min-w-[920px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Visitor</th>
              <th className="px-4 py-3 text-left font-semibold">First seen</th>
              <th className="px-4 py-3 text-left font-semibold">Last seen</th>
              <th className="px-4 py-3 text-left font-semibold">Page views</th>
              <th className="px-4 py-3 text-left font-semibold">Device</th>
              <th className="px-4 py-3 text-left font-semibold">Source</th>
              <th className="px-4 py-3 text-left font-semibold">Bot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {detail.visitors.map((visitor) => (
              <tr key={visitor.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/traffic/${visitor.id}`} className="font-mono text-xs text-accent hover:underline">
                    {shortId(visitor.id)}
                  </Link>
                  {visitor.userId ? <div className="font-mono text-[11px] text-slate-400">{visitor.userId}</div> : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatFullDate(visitor.firstSeenAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatFullDate(visitor.lastSeenAt)}</td>
                <td className="px-4 py-3 tabular-nums text-slate-700">{visitor.pageViews}</td>
                <td className="px-4 py-3 text-slate-600">
                  {visitor.device ?? "—"}
                  {visitor.userAgent ? (
                    <div className="max-w-[220px] truncate text-[11px] text-slate-400" title={visitor.userAgent}>
                      {visitor.userAgent}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {formatAttribution({ source: visitor.source, medium: visitor.medium })}
                </td>
                <td className="px-4 py-3">
                  {visitor.isBot ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">bot</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Orders</h2>
        </div>
        {detail.orders.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No linked orders</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {detail.orders.map((order) => (
              <OrderRow key={`${order.kind}-${order.id}`} order={order} />
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">View timeline</h2>
        </div>
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Time</th>
              <th className="px-4 py-3 text-left font-semibold">Path</th>
              <th className="px-4 py-3 text-left font-semibold">Referrer</th>
              <th className="px-4 py-3 text-left font-semibold">Visitor</th>
              <th className="px-4 py-3 text-left font-semibold">Device</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {detail.views.map((view) => (
              <tr key={view.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatFullDate(view.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className="block max-w-[320px] truncate text-slate-900" title={view.path}>
                    {view.path}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="block max-w-[280px] truncate text-slate-500" title={view.referrer ?? undefined}>
                    {view.referrer ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/traffic/${view.visitorId}`} className="font-mono text-xs text-accent hover:underline">
                    {shortId(view.visitorId)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{view.device ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 min-w-0 break-words text-sm text-slate-900">{value}</div>
    </div>
  );
}

function OrderRow({ order }: { order: LinkedOrder }) {
  const href =
    order.kind === "filing"
      ? `/admin/filings/${order.id}`
      : `/admin/applications/${order.kind}/${order.id}`;

  return (
    <Link href={href} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{order.kind.toUpperCase()}</p>
        <p className="truncate font-medium text-slate-900">{order.label}</p>
      </div>
      <StatusBadge status={order.status} />
    </Link>
  );
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function ipHref(ip: string): string {
  return `/admin/traffic/ip/${encodeURIComponent(ip)}`;
}

function formatFullDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
