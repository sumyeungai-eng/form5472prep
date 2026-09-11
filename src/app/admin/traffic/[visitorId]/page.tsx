import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { StatusBadge } from "../../filings/StatusBadge";
import { CountryFlag } from "../CountryFlag";
import { isAdmin } from "@/lib/admin/auth";
import { formatAttribution } from "@/lib/attribution";
import { getIpGroupDetail, getVisitorDetail } from "@/lib/admin/traffic";

export const dynamic = "force-dynamic";
const IP_GROUPING_CAVEAT =
  "Grouping is approximate: people behind office networks, mobile carriers or VPNs can share an IP, and one person's IP can change between visits.";

export async function generateMetadata({ params }: { params: { visitorId: string } }): Promise<Metadata> {
  return { title: `Visitor ${params.visitorId.slice(0, 8)} · Traffic · Admin` };
}

export default async function AdminTrafficVisitorPage({
  params,
}: {
  params: { visitorId: string };
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const detail = await getVisitorDetail(params.visitorId);
  if (!detail) notFound();

  const { visitor, views, filings, applications } = detail;
  const ipDetail = visitor.ip ? await getIpGroupDetail(visitor.ip) : null;
  const siblingBrowsers = ipDetail?.visitors.filter((ipVisitor) => ipVisitor.id !== visitor.id) ?? [];
  const attribution = formatAttribution({
    source: visitor.attrSource,
    medium: visitor.attrMedium,
    campaign: visitor.attrCampaign,
    referrer: visitor.attrReferrer,
    landing: visitor.attrLanding,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <AdminPageHeader
        title={`Visitor ${visitor.id.slice(0, 8)}`}
        breadcrumb={[
          { label: "Traffic", href: "/admin/traffic" },
          { label: "Visitor", href: `/admin/traffic/${visitor.id}` },
        ]}
      />

      <div className="mb-6 rounded-lg border border-slate-200 bg-white">
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="First seen" value={formatFullDate(visitor.firstSeenAt)} />
          <Fact label="Last seen" value={formatFullDate(visitor.lastSeenAt)} />
          <Fact label="Page views" value={visitor.pageViews.toString()} />
          <Fact
            label="Location"
            value={
              <span className="inline-flex items-center gap-1.5">
                <CountryFlag country={visitor.country} />
                <span>{[visitor.country, visitor.city].filter(Boolean).join(" · ") || "—"}</span>
              </span>
            }
          />
          <Fact
            label="IP"
            value={
              <>
                <span className="font-mono">{visitor.ip ?? "—"}</span>
                <span className="ml-2 text-xs text-slate-400">{visitor.ipHash ? "hash stored" : "no hash"}</span>
              </>
            }
          />
          <Fact label="Device / UA" value={<DeviceValue device={latestDevice(views)} userAgent={visitor.userAgent} />} />
          <Fact label="First-touch attribution" value={attribution} />
          <Fact label="User ID" value={visitor.userId ? <span className="font-mono">{visitor.userId}</span> : "—"} />
          <Fact label="Last session" value={visitor.lastSessionId ? <span className="font-mono">{visitor.lastSessionId}</span> : "—"} />
        </div>
      </div>

      {visitor.ip && siblingBrowsers.length > 0 ? (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Other browsers on this IP</h2>
            <p className="mt-1 text-xs text-slate-500">{IP_GROUPING_CAVEAT}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Visitor</th>
                  <th className="px-4 py-3 text-left font-semibold">First seen</th>
                  <th className="px-4 py-3 text-left font-semibold">Last seen</th>
                  <th className="px-4 py-3 text-left font-semibold">Page views</th>
                  <th className="px-4 py-3 text-left font-semibold">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {siblingBrowsers.map((sibling) => (
                  <tr key={sibling.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/traffic/${sibling.id}`} className="font-mono text-xs text-accent hover:underline">
                        {shortId(sibling.id)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatFullDate(sibling.firstSeenAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatFullDate(sibling.lastSeenAt)}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">{sibling.pageViews}</td>
                    <td className="px-4 py-3 text-slate-600">{sibling.device ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-5 py-4">
            <Link href={ipHref(visitor.ip)} className="text-sm font-medium text-accent hover:underline">
              View all activity on this IP →
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mb-6 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Orders</h2>
        </div>
        {filings.length === 0 && applications.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No linked orders for this visitor.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filings.map((filing) => (
              <OrderRow
                key={`filing-${filing.id}`}
                href={`/admin/filings/${filing.id}`}
                label={filing.llcName || "Filing"}
                eyebrow="Filing"
                status={filing.status}
                meta={formatFullDate(filing.updatedAt)}
              />
            ))}
            {applications.map((app) => (
              <OrderRow
                key={`${app.kind}-${app.id}`}
                href={`/admin/applications/${app.kind}/${app.id}`}
                label={app.label}
                eyebrow={app.kind.toUpperCase()}
                status={app.status}
              />
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Time</th>
              <th className="px-4 py-3 text-left font-semibold">Path</th>
              <th className="px-4 py-3 text-left font-semibold">Referrer</th>
              <th className="px-4 py-3 text-left font-semibold">IP</th>
              <th className="px-4 py-3 text-left font-semibold">City</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {views.map((view) => (
              <tr key={view.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatFullDate(view.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className="block max-w-[300px] truncate text-slate-900" title={view.path}>
                    {view.path}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="block max-w-[260px] truncate text-slate-500" title={view.referrer ?? undefined}>
                    {view.referrer ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{view.ip ?? "IP expired"}</td>
                <td className="px-4 py-3 text-slate-600">{view.city ?? "—"}</td>
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

function DeviceValue({ device, userAgent }: { device: string | null; userAgent: string | null }) {
  return (
    <>
      <span>{device ?? "—"}</span>
      {userAgent ? (
        <span className="mt-1 block max-w-full truncate text-xs text-slate-400" title={userAgent}>
          {userAgent}
        </span>
      ) : null}
    </>
  );
}

function OrderRow({
  href,
  label,
  eyebrow,
  status,
  meta,
}: {
  href: string;
  label: string;
  eyebrow: string;
  status: string;
  meta?: string;
}) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{eyebrow}</p>
        <p className="truncate font-medium text-slate-900">{label}</p>
        {meta ? <p className="mt-0.5 text-xs text-slate-400">{meta}</p> : null}
      </div>
      <StatusBadge status={status} />
    </Link>
  );
}

function latestDevice(views: { device: string | null }[]): string | null {
  return views.find((view) => view.device)?.device ?? null;
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
