import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { StatusBadge } from "../filings/StatusBadge";
import { CountryFlag } from "./CountryFlag";
import { isAdmin } from "@/lib/admin/auth";
import { formatAttribution } from "@/lib/attribution";
import { env } from "@/lib/env";
import {
  getRecentViews,
  getTrafficFilterOptions,
  getTrafficSummary,
  type LinkedOrder,
  type TrafficFilters,
} from "@/lib/admin/traffic";

export const dynamic = "force-dynamic";
export const metadata = { title: "Traffic · Admin" };

type SearchParams = {
  from?: string;
  to?: string;
  country?: string;
  source?: string;
  customersOnly?: string;
  includeBots?: string;
  q?: string;
  page?: string;
};

const PAGE_SIZE = 50;

export default async function AdminTrafficPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const parsed = parseSearchParams(searchParams);
  const [summary, options, recent] = await Promise.all([
    getTrafficSummary(parsed.filters),
    getTrafficFilterOptions(parsed.filters),
    getRecentViews(parsed.filters, parsed.page, PAGE_SIZE),
  ]);
  const totalPages = Math.max(1, Math.ceil(recent.total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <AdminPageHeader
        title="Traffic"
        description="Every page view by a real browser — who came from where, and which visits became orders."
      />

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

      {recent.rows.length === 0 ? (
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
              {recent.rows.map((row) => {
                const sourceLabel = formatAttribution({ source: row.source, medium: row.medium });
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
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.ip ?? "—"}</td>
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
          Showing {recent.rows.length === 0 ? 0 : (parsed.page - 1) * PAGE_SIZE + 1}
          {"–"}
          {Math.min(parsed.page * PAGE_SIZE, recent.total)} of {recent.total}
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

function parseSearchParams(searchParams: SearchParams): {
  filters: TrafficFilters;
  page: number;
  values: Required<Pick<SearchParams, "from" | "to" | "country" | "source" | "q">> & {
    customersOnly: string;
    includeBots: string;
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
      from: formatDateInput(from),
      to: formatDateInput(to),
      country: clean(searchParams.country) ?? "",
      source: clean(searchParams.source) ?? "",
      q: clean(searchParams.q) ?? "",
      customersOnly: searchParams.customersOnly === "1" ? "1" : "",
      includeBots: searchParams.includeBots === "1" ? "1" : "",
    },
  };
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
  params.set("from", values.from);
  params.set("to", values.to);
  if (values.country) params.set("country", values.country);
  if (values.source) params.set("source", values.source);
  if (values.q) params.set("q", values.q);
  if (values.customersOnly) params.set("customersOnly", values.customersOnly);
  if (values.includeBots) params.set("includeBots", values.includeBots);
  if (page > 1) params.set("page", page.toString());
  const qs = params.toString();
  return qs ? `/admin/traffic?${qs}` : "/admin/traffic";
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
