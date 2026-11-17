export function BarList({ title, rows }: { title: string; rows: { label: string; value: number; detail?: string }[] }) {
  const max = Math.max(0, ...rows.map(row => row.value));
  return <div className="rounded-lg border border-slate-200 bg-white p-4">
    <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
    {max === 0 ? <p className="text-sm text-slate-500">No data in this period.</p> : <ul className="space-y-3">{rows.map(row => <li key={row.label}>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs text-slate-600"><span className="truncate" title={row.label}>{row.label}</span><span className="shrink-0 tabular-nums">{row.value.toLocaleString("en-US")}{row.detail ? ` · ${row.detail}` : ""}</span></div>
      <svg viewBox="0 0 100 4" preserveAspectRatio="none" role="img" aria-label={`${row.label}: ${row.value}`} className="h-1.5 w-full rounded bg-slate-100">
        <title>{row.label}: {row.value}</title><rect width={row.value / max * 100} height="4" fill="#2563eb" />
      </svg>
    </li>)}</ul>}
  </div>;
}
