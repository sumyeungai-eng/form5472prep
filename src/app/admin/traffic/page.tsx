import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { StatusBadge } from "../filings/StatusBadge";
import { CountryFlag } from "./CountryFlag";
import { isAdmin } from "@/lib/admin/auth";
import { formatAttribution } from "@/lib/attribution";
import { env } from "@/lib/env";
import { getTrafficOverview, percentChange, type RangeKey } from "@/lib/admin/trafficStats";
import { LineChart } from "@/components/admin/charts/LineChart";
import { StackedBarChart } from "@/components/admin/charts/StackedBarChart";
import { BarList } from "@/components/admin/charts/BarList";
import {
  getIpGroups,
  getIpVisitorCounts,
  getRecentViews,
  getTrafficFilterOptions,
  getTrafficSummary,
  type IpGroupRow,
  type LinkedOrder,
  type TrafficFilters,
} from "@/lib/admin/traffic";

export const dynamic = "force-dynamic";
export const metadata = { title: "Traffic · Admin" };

type SearchParams = {
  range?: string;
  from?: string;
  to?: string;
  country?: string;
  source?: string;
  customersOnly?: string;
  includeBots?: string;
  q?: string;
  page?: string;
  view?: string;
};

const PAGE_SIZE = 50;
const IP_GROUPING_CAVEAT =
  "Grouping is approximate: people behind office networks, mobile carriers or VPNs can share an IP, and one person's IP can change between visits.";

export default async function AdminTrafficPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const parsed = parseSearchParams(searchParams);
  const isIpView = parsed.values.view === "ips";
  const trafficPromise = isIpView
    ? getIpGroups(parsed.filters, parsed.page, PAGE_SIZE)
    : getRecentViews(parsed.filters, parsed.page, PAGE_SIZE);
  const [summary, options, traffic] = await Promise.all([
    getTrafficSummary(parsed.filters),
    getTrafficFilterOptions(parsed.filters),
    trafficPromise,
  ]);
  const ipGroups = isIpView ? traffic as Awaited<ReturnType<typeof getIpGroups>> : null;
  const recent = isIpView ? null : traffic as Awaited<ReturnType<typeof getRecentViews>>;
  const ipVisitorCounts = recent
    ? await getIpVisitorCounts(parsed.filters, recent.rows.map((row) => row.ip).filter((ip): ip is string => Boolean(ip)))
    : new Map<string, number>();
  const total = ipGroups?.total ?? recent?.total ?? 0;
  const rowCount = ipGroups?.rows.length ?? recent?.rows.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <AdminPageHeader
        title="Traffic"
        description="Every page view by a real browser — who came from where, and which visits became orders."
      />

      <TrafficOverviewSection range={parsed.values.range} searchParams={searchParams} />

      <ViewToggle values={parsed.values} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Visitors today" value={summary.visitorsToday.toString()} />
        <StatCard label="Visitors 7d" value={summary.visitors7d.toString()} />
        <StatCard label="Page views 7d" value={summary.views7d.toString()} />
        <StatCard label="Became customers 7d" value={summary.customers7d.toString()} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3 mb-6">
        <TopList title="Top countries" rows={summary.topCountries.map((row) => ({
          label: row.country,
          prefix: <CountryFlag country={row.country} />,
          count: row.count,
        }))} />
        <TopList title="Top pages" rows={summary.topPages.map((row) => ({ label: row.path, count: row.count }))} />
        <TopList
          title="Top sources"
          rows={summary.topSources.map((row) => ({
            label: formatAttribution({ source: row.source }),
            count: row.count,
          }))}
        />
      </div>

      <form method="get" className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <input type="hidden" name="range" value={parsed.values.range} />
        {parsed.values.view === "ips" ? <input type="hidden" name="view" value="ips" /> : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Field label="From">
            <input
              type="date"
              name="from"
              defaultValue={parsed.values.from}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              name="to"
              defaultValue={parsed.values.to}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </Field>
          <Field label="Country">
            <select
              name="country"
              defaultValue={parsed.values.country}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All countries</option>
              {options.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select
              name="source"
              defaultValue={parsed.values.source}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All sources</option>
              {options.sources.map((source) => (
                <option key={source} value={source}>
                  {formatAttribution({ source })}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Search">
            <input
              type="text"
              name="q"
              defaultValue={parsed.values.q}
              placeholder="IP or path"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Filter
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="customersOnly"
              value="1"
              defaultChecked={parsed.filters.customersOnly}
              className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            customers only
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="includeBots"
              value="1"
              defaultChecked={parsed.filters.includeBots}
              className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            include bots
          </label>
        </div>
      </form>

      {isIpView ? (
        <IpGroupsTable groups={ipGroups!.rows} ungroupedViews={ipGroups!.ungroupedViews} />
      ) : recent!.rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No traffic matches your filters</p>
          <p className="mt-1 text-sm text-slate-500">Try a wider date range or clear the search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">Location</th>
                <th className="px-4 py-3 text-left font-semibold">IP</th>
                <th className="px-4 py-3 text-left font-semibold">Page</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
                <th className="px-4 py-3 text-left font-semibold">Device</th>
                <th className="px-4 py-3 text-left font-semibold">Visitor</th>
                <th className="px-4 py-3 text-left font-semibold">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recent!.rows.map((row) => {
                const sourceLabel = formatAttribution({ source: row.source, medium: row.medium });
                const ipVisitors = row.ip ? ipVisitorCounts.get(row.ip) ?? 0 : 0;
                const otherBrowsers = Math.max(0, ipVisitors - 1);
                return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <CountryFlag country={row.country} />
                        <span>{row.country ?? "—"}</span>
                      </div>
                      <div className="text-xs text-slate-400">{row.city ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {row.ip ? (
                        <Link href={ipHref(row.ip)} className="hover:text-accent hover:underline">
                          {row.ip}
                        </Link>
                      ) : (
                        "IP expired"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={publicHref(row.path)}
                        className="block max-w-[260px] truncate text-slate-900 hover:text-accent hover:underline"
                      >
                        {row.path}
                      </a>
                      {row.referrer ? (
                        <div className="max-w-[260px] truncate text-xs text-slate-400" title={row.referrer}>
                          from {row.referrer}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[150px] truncate text-xs text-slate-600" title={sourceLabel}>
                        {sourceLabel}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.device ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/traffic/${row.visitorId}`} className="font-mono text-xs text-accent hover:underline">
                        {shortId(row.visitorId)}
                      </Link>
                      {otherBrowsers > 0 ? (
                        <span
                          className="ml-1 text-[11px] text-slate-400"
                          title={`${otherBrowsers} other browsers on this IP`}
                          aria-label={`${otherBrowsers} other browsers on this IP`}
                        >
                          +{otherBrowsers}
                        </span>
                      ) : null}
                      {row.isBot ? <div className="text-[11px] text-slate-400">bot</div> : null}
                    </td>
                    <td className="px-4 py-3">
                      <OrderLink linked={row.linked} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {rowCount === 0 ? 0 : (parsed.page - 1) * PAGE_SIZE + 1}
          {"–"}
          {Math.min(parsed.page * PAGE_SIZE, total)} of {total}
        </span>
        <div className="flex gap-2">
          <PageLink page={parsed.page - 1} disabled={parsed.page <= 1} values={parsed.values}>
            Previous
          </PageLink>
          <PageLink page={parsed.page + 1} disabled={parsed.page >= totalPages} values={parsed.values}>
            Next
          </PageLink>
        </div>
      </div>
    </div>
  );
}

async function TrafficOverviewSection({ range, searchParams }: { range: RangeKey; searchParams: SearchParams }) {
  try {
    const overview = await getTrafficOverview(range);
    return <TrafficOverview overview={overview} range={range} searchParams={searchParams} />;
  } catch (error) {
    console.error("Traffic overview unavailable", error);
    const message = (error instanceof Error ? error.message : String(error)).split(/\r?\n/)[0].slice(0, 120) || "Unknown error";
    return <div role="status" className="mb-6 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">Overview unavailable: {message}</div>;
  }
}

function TrafficOverview({ overview, range, searchParams }: {
  overview: Awaited<ReturnType<typeof getTrafficOverview>>;
  range: RangeKey;
  searchParams: SearchParams;
}) {
  const { totals } = overview;
  const count = (value: number) => value.toLocaleString("en-US");
  const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
  const cards = [
    { label: "Visitors", metric: totals.visitors, value: count(totals.visitors.current) },
    { label: "Page views", metric: totals.views, value: count(totals.views.current) },
    { label: "Started filings", metric: totals.startedFilings, value: count(totals.startedFilings.current) },
    { label: "Paid filings", metric: totals.paidFilings, value: count(totals.paidFilings.current) },
    { label: "Revenue (USD)", metric: totals.revenueCents, value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totals.revenueCents.current / 100) },
    { label: "Visit → paid conversion", metric: totals.conversion, value: pct(totals.conversion.current) },
  ];
  const rangeHref = (next: RangeKey) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) if (value !== undefined) params.set(key, value);
    params.set("range", next);
    return `/admin/traffic?${params.toString()}`;
  };
  return <section aria-labelledby="traffic-overview" className="mb-10 space-y-5 border-b border-slate-200 pb-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="traffic-overview" className="text-xl font-semibold text-slate-900">Overview</h2>
      <nav aria-label="Overview date range" className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
        {(["7d", "28d", "90d"] as const).map(key => <Link key={key} href={rangeHref(key)} aria-current={range === key ? "page" : undefined} className={`rounded px-3 py-1.5 text-sm ${range === key ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}>{key.slice(0, -1)} days</Link>)}
      </nav>
    </div>
    <p className="text-xs text-slate-500">Overview uses the selected range, independently of the filters below. Includes today up to now; compares with the preceding {range.slice(0, -1)} UTC days.</p>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(card => <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-xs text-slate-500">{card.label}</h3>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{card.value}</p>
        <div className="mt-2 text-xs"><OverviewChange value={card.metric.change} /><span className="text-slate-400"> vs previous</span></div>
        {card.label === "Paid filings" ? <div className="mt-2 text-xs text-slate-500">+ {count(totals.paidEinItin.current)} EIN/ITIN paid · <OverviewChange value={totals.paidEinItin.change} /></div> : null}
      </div>)}
    </div>
    <p className="text-xs text-slate-500">Funnel: visitors → filings started → filings paid in this period; these are activity counts, not a matched visitor cohort. Conversion = paid filings ÷ visitors. Revenue includes filing, EIN and ITIN payments, derived from cents.</p>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="mb-4 text-sm font-semibold text-slate-900">Traffic trend</h3><LineChart data={overview.daily} /></div>
      <div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="mb-4 text-sm font-semibold text-slate-900">Visitors by channel</h3><StackedBarChart data={overview.dailyByGroup} /></div>
    </div>
    <p className="text-xs text-slate-500">Times in UTC. Visits are kept 90 days. Bots excluded.</p>
    <p className="text-xs text-slate-500">Previous-period traffic may be incomplete due to retention, especially for 90 days. Sources use first-touch attribution. Orders with no retained visitor remain included; EIN/ITIN orders have no bot flag.</p>
    <OverviewTable title="Sources" columns={["Group", "Visitors", "Share", "Change", "Started", "Paid", "Conversion"]}>
      {overview.byGroup.some(row => row.visitors || row.prevVisitors || row.startedFilings || row.paidFilings) ? overview.byGroup.map(row => <tr key={row.group}>
        <th scope="row" className="px-4 py-3 text-left font-medium">{row.group}</th><td className="px-4 py-3">{count(row.visitors)}</td><td className="px-4 py-3">{pct(totals.visitors.current ? row.visitors / totals.visitors.current : 0)}</td><td className="px-4 py-3"><OverviewChange value={percentChange(row.visitors, row.prevVisitors)} /></td><td className="px-4 py-3">{count(row.startedFilings)}</td><td className="px-4 py-3">{count(row.paidFilings)}</td><td className="px-4 py-3">{pct(row.conv)}</td>
      </tr>) : <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No source data in this period.</td></tr>}
    </OverviewTable>
    <OverviewTable title="AI engines" columns={["Engine", "Visitors", "Change", "Started", "Paid"]}>
      {overview.aiEngines.length ? overview.aiEngines.map(row => <tr key={row.engine}>
        <th scope="row" className="px-4 py-3 text-left font-medium">{row.engine}</th><td className="px-4 py-3">{count(row.visitors)}</td><td className="px-4 py-3"><OverviewChange value={percentChange(row.visitors, row.prevVisitors)} /></td><td className="px-4 py-3">{count(row.startedFilings)}</td><td className="px-4 py-3">{count(row.paidFilings)}</td>
      </tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No AI engine data in this period.</td></tr>}
    </OverviewTable>
    <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
      <BarList title="Top landing pages · new visitors" rows={overview.topLanding.map(row => ({ label: row.path, value: row.visitors }))} />
      <BarList title="Top pages · views" rows={overview.topPages.map(row => ({ label: row.path, value: row.views, detail: `${row.prevViews} previous` }))} />
      <BarList title="Countries · visitors" rows={overview.countries.map(row => ({ label: row.country, value: row.visitors }))} />
      <BarList title="Devices · views" rows={overview.devices.map(row => ({ label: row.device, value: row.views }))} />
    </div>
  </section>;
}

function OverviewChange({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-400">—</span>;
  if (!Number.isFinite(value)) return <span className="text-emerald-700">↑ New</span>;
  return <span className={value > 0 ? "text-emerald-700" : value < 0 ? "text-rose-700" : "text-slate-500"}>{value > 0 ? "↑" : value < 0 ? "↓" : "→"} {Math.abs(value).toFixed(1)}%</span>;
}

function OverviewTable({ title, columns, children }: { title: string; columns: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table className="w-full whitespace-nowrap text-left text-sm tabular-nums text-slate-700">
      <caption className="px-4 py-3 text-left text-sm font-semibold text-slate-900">{title}</caption>
      <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{columns.map(column => <th key={column} scope="col" className="px-4 py-3 font-semibold">{column}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-200">{children}</tbody>
    </table>
  </div>;
}

function parseSearchParams(searchParams: SearchParams): {
  filters: TrafficFilters;
  page: number;
  values: Required<Pick<SearchParams, "from" | "to" | "country" | "source" | "q">> & {
    customersOnly: string;
    includeBots: string;
    view: "views" | "ips";
    range: RangeKey;
  };
} {
  const now = new Date();
  const fallbackFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const parsedFrom = parseDateInput(searchParams.from, "start");
  const parsedTo = parseDateInput(searchParams.to, "end");
  const validRange = parsedFrom && parsedTo && parsedFrom <= parsedTo;
  const from = validRange ? parsedFrom : startOfDay(fallbackFrom);
  const to = validRange ? parsedTo : endOfDay(now);
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const view = searchParams.view === "ips" ? "ips" : "views";

  return {
    filters: {
      from,
      to,
      country: clean(searchParams.country),
      source: clean(searchParams.source),
      customersOnly: searchParams.customersOnly === "1",
      includeBots: searchParams.includeBots === "1",
      q: clean(searchParams.q),
    },
    page,
    values: {
      range: searchParams.range === "7d" || searchParams.range === "90d" ? searchParams.range : "28d",
      from: formatDateInput(from),
      to: formatDateInput(to),
      country: clean(searchParams.country) ?? "",
      source: clean(searchParams.source) ?? "",
      q: clean(searchParams.q) ?? "",
      customersOnly: searchParams.customersOnly === "1" ? "1" : "",
      includeBots: searchParams.includeBots === "1" ? "1" : "",
      view,
    },
  };
}

function ViewToggle({ values }: { values: ReturnType<typeof parseSearchParams>["values"] }) {
  return (
    <div className="mb-4 inline-flex rounded-md border border-slate-200 bg-white p-0.5">
      <Link
        href={viewHref("views", values)}
        className={`rounded px-3 py-1.5 text-sm ${
          values.view === "views"
            ? "bg-slate-100 font-medium text-slate-900"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Page views
      </Link>
      <Link
        href={viewHref("ips", values)}
        className={`rounded px-3 py-1.5 text-sm ${
          values.view === "ips"
            ? "bg-slate-100 font-medium text-slate-900"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Visitors by IP
      </Link>
    </div>
  );
}

function IpGroupsTable({ groups, ungroupedViews }: { groups: IpGroupRow[]; ungroupedViews: number }) {
  return (
    <>
      <p className="mb-3 text-sm text-slate-500">{IP_GROUPING_CAVEAT}</p>
      {groups.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No traffic matches your filters</p>
          <p className="mt-1 text-sm text-slate-500">Try a wider date range or clear the search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">IP</th>
                <th className="px-4 py-3 text-left font-semibold">Location</th>
                <th className="px-4 py-3 text-left font-semibold">Visitors</th>
                <th className="px-4 py-3 text-left font-semibold">Page views</th>
                <th className="px-4 py-3 text-left font-semibold">Sources</th>
                <th className="px-4 py-3 text-left font-semibold">Devices</th>
                <th className="px-4 py-3 text-left font-semibold">First seen</th>
                <th className="px-4 py-3 text-left font-semibold">Last seen</th>
                <th className="px-4 py-3 text-left font-semibold">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {groups.map((group) => (
                <tr key={group.ip} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    <Link href={ipHref(group.ip)} className="hover:text-accent hover:underline">
                      {group.ip}
                    </Link>
                    {group.isBot ? <div className="text-[11px] text-slate-400">bot</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CountryFlag country={group.country} />
                      <span>{group.country ?? "—"}</span>
                    </div>
                    <div className="text-xs text-slate-400">{group.city ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <span className="tabular-nums">{group.visitors}</span>
                    {group.visitors > 1 ? (
                      <span className="ml-2 rounded-full bg-amber-50 px-1.5 text-[11px] text-amber-700">
                        {group.visitors} browsers
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{group.views}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {group.sources.length > 0
                      ? group.sources.map((source) => formatAttribution({ source })).join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{group.devices.join(", ") || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDateTime(group.firstSeen)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDateTime(group.lastSeen)}</td>
                  <td className="px-4 py-3">
                    <OrderLink linked={group.linked} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {ungroupedViews > 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          {ungroupedViews} older page views are not grouped — IP addresses are deleted after 30 days.
        </p>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function TopList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number; prefix?: React.ReactNode }[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">—</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-1.5 text-slate-700">
                {row.prefix}
                <span className="truncate">{row.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-slate-400">{row.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderLink({ linked }: { linked: LinkedOrder | null }) {
  if (!linked) return <span className="text-slate-400">—</span>;
  const href =
    linked.kind === "filing"
      ? `/admin/filings/${linked.id}`
      : `/admin/applications/${linked.kind}/${linked.id}`;

  return (
    <Link href={href} className="inline-flex max-w-[180px] items-center gap-2 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200">
      <span className="truncate text-xs font-medium text-slate-700">{linked.label}</span>
      <StatusBadge status={linked.status} />
    </Link>
  );
}

function PageLink({
  page,
  disabled,
  values,
  children,
}: {
  page: number;
  disabled: boolean;
  values: ReturnType<typeof parseSearchParams>["values"];
  children: React.ReactNode;
}) {
  const href = pageHref(page, values);
  if (disabled) {
    return (
      <span className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-300">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
      {children}
    </Link>
  );
}

function pageHref(page: number, values: ReturnType<typeof parseSearchParams>["values"]): string {
  const params = new URLSearchParams();
  params.set("range", values.range);
  params.set("from", values.from);
  params.set("to", values.to);
  if (values.view === "ips") params.set("view", values.view);
  if (values.country) params.set("country", values.country);
  if (values.source) params.set("source", values.source);
  if (values.q) params.set("q", values.q);
  if (values.customersOnly) params.set("customersOnly", values.customersOnly);
  if (values.includeBots) params.set("includeBots", values.includeBots);
  if (page > 1) params.set("page", page.toString());
  const qs = params.toString();
  return qs ? `/admin/traffic?${qs}` : "/admin/traffic";
}

function viewHref(view: "views" | "ips", values: ReturnType<typeof parseSearchParams>["values"]): string {
  const params = new URLSearchParams();
  params.set("range", values.range);
  params.set("from", values.from);
  params.set("to", values.to);
  if (view === "ips") params.set("view", view);
  if (values.country) params.set("country", values.country);
  if (values.source) params.set("source", values.source);
  if (values.q) params.set("q", values.q);
  if (values.customersOnly) params.set("customersOnly", values.customersOnly);
  if (values.includeBots) params.set("includeBots", values.includeBots);
  const qs = params.toString();
  return qs ? `/admin/traffic?${qs}` : "/admin/traffic";
}

function ipHref(ip: string): string {
  return `/admin/traffic/ip/${encodeURIComponent(ip)}`;
}

function parseDateInput(value: string | undefined, edge: "start" | "end"): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return edge === "start" ? startOfDay(date) : endOfDay(date);
}

function startOfDay(date: Date): Date {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  return out;
}

function endOfDay(date: Date): Date {
  const out = new Date(date);
  out.setHours(23, 59, 59, 999);
  return out;
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function formatDateInput(date: Date): string {
  // Local calendar date, not toISOString(): the filter range is built with local
  // setHours(), so a UTC slice drifts by a day on either side of Greenwich.
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function publicHref(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.appUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
