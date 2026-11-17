export const CHANNEL_COLORS = {
  "Google search": "#2563eb", "Other search": "#0891b2", "AI engines": "#7c3aed", "Paid ads": "#d97706",
  Social: "#db2777", Referral: "#059669", Direct: "#64748b", Other: "#92400e",
} as const;
type Group = keyof typeof CHANNEL_COLORS;
type Point = { day: string } & Record<Group, number>;
const groups = Object.keys(CHANNEL_COLORS) as Group[];

export function StackedBarChart({ data, label = "Daily visitors by channel" }: { data: Point[]; label?: string }) {
  const totals = data.map(point => groups.reduce((sum, group) => sum + point[group], 0));
  if (!totals.some(total => total > 0)) return <p className="py-16 text-center text-sm text-slate-500">No traffic in this period.</p>;
  const width = 720, height = 260, left = 52, top = 16, plotHeight = 206, plotWidth = 650;
  const max = Math.max(4, Math.ceil(Math.max(...totals) / 4) * 4);
  const step = plotWidth / data.length;
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="w-full">
        <title>{label}</title>
        {[0, 1, 2, 3, 4].map(tick => <g key={tick}>
          <line x1={left} x2={left + plotWidth} y1={top + plotHeight * (1 - tick / 4)} y2={top + plotHeight * (1 - tick / 4)} stroke="#e2e8f0" />
          <text x={left - 8} y={top + plotHeight * (1 - tick / 4) + 4} textAnchor="end" fontSize="11" fill="#64748b">{tick * max / 4}</text>
        </g>)}
        {data.map((point, i) => {
          let offset = 0;
          return <g key={point.day}>{groups.map(group => {
            const value = point[group];
            offset += value;
            return <rect key={group} x={left + i * step + step * 0.12} y={top + plotHeight * (1 - offset / max)} width={step * 0.76} height={plotHeight * value / max} fill={CHANNEL_COLORS[group]}>
              <title>{point.day}: {group}, {value} visitors</title>
            </rect>;
          })}
          {i % Math.max(1, Math.ceil(data.length / 6)) === 0 || i === data.length - 1
            ? <text x={left + (i + 0.5) * step} y={height - 12} textAnchor="middle" fontSize="11" fill="#64748b">{point.day.slice(5)}</text> : null}
          </g>;
        })}
      </svg>
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-600">{groups.map(group => <li key={group} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CHANNEL_COLORS[group] }} />{group}</li>)}</ul>
    </div>
  );
}
