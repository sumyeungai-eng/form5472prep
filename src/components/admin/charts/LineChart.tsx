type Point = { day: string; visitors: number; views: number };

export function LineChart({ data, label = "Daily visitors and page views" }: { data: Point[]; label?: string }) {
  if (!data.some(point => point.visitors > 0 || point.views > 0)) return <p className="py-16 text-center text-sm text-slate-500">No traffic in this period.</p>;
  const width = 720, height = 260, left = 52, right = 18, top = 16, bottom = 38;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const max = Math.max(4, Math.ceil(Math.max(...data.map(point => Math.max(point.visitors, point.views))) / 4) * 4);
  const x = (i: number) => left + (data.length === 1 ? plotWidth / 2 : i / (data.length - 1) * plotWidth);
  const y = (value: number) => top + plotHeight * (1 - value / max);
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="w-full">
        <title>{label}</title>
        {[0, 1, 2, 3, 4].map(tick => <g key={tick}>
          <line x1={left} x2={width - right} y1={y(tick * max / 4)} y2={y(tick * max / 4)} stroke="#e2e8f0" />
          <text x={left - 8} y={y(tick * max / 4) + 4} textAnchor="end" fontSize="11" fill="#64748b">{tick * max / 4}</text>
        </g>)}
        {(["visitors", "views"] as const).map((key, series) => <g key={key}>
          <polyline points={data.map((point, i) => `${x(i)},${y(point[key])}`).join(" ")} fill="none" stroke={series ? "#7c3aed" : "#2563eb"} strokeWidth="2.5" strokeDasharray={series ? "6 3" : undefined} />
          {data.map((point, i) => <circle key={point.day} cx={x(i)} cy={y(point[key])} r="3" fill={series ? "#7c3aed" : "#2563eb"}>
            <title>{point.day}: {point[key]} {key}</title>
          </circle>)}
        </g>)}
        {data.map((point, i) => i % Math.max(1, Math.ceil(data.length / 6)) === 0 || i === data.length - 1
          ? <text key={point.day} x={x(i)} y={height - 12} textAnchor="middle" fontSize="11" fill="#64748b">{point.day.slice(5)}</text> : null)}
      </svg>
      <div className="flex justify-center gap-5 text-xs text-slate-600"><span>● <span className="text-blue-600">Visitors (solid)</span></span><span>● <span className="text-violet-600">Page views (dashed)</span></span></div>
    </div>
  );
}
