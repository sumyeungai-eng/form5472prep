import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LineChart } from "./LineChart";
import { CHANNEL_COLORS, StackedBarChart } from "./StackedBarChart";
import { BarList } from "./BarList";

describe("server-rendered SVG charts", () => {
  it("renders a line chart with accessible labels, both series, axes and point tooltips", () => {
    const html = renderToStaticMarkup(<LineChart data={[{ day: "2026-11-17", visitors: 3, views: 7 }]} />);
    expect(html).toContain('<svg');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Daily visitors and page views"');
    expect(html.match(/<polyline/g)).toHaveLength(2);
    expect(html).toContain("2026-11-17: 3 visitors");
    expect(html).toContain("2026-11-17: 7 views");
    expect(html).toContain("11-17");
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it("renders stacked channel bars with fixed colors, legend and tooltips", () => {
    const point = { day: "2026-11-17", "Google search": 3, "Other search": 0, "AI engines": 2, "Paid ads": 1, Social: 0, Referral: 0, Direct: 1, Other: 0 };
    const html = renderToStaticMarkup(<StackedBarChart data={[point]} />);
    expect(html).toContain('<svg');
    expect(html).toContain('aria-label="Daily visitors by channel"');
    expect(html.match(/<rect/g)).toHaveLength(8);
    expect(html).toContain(CHANNEL_COLORS["AI engines"]);
    expect(html).toContain("2026-11-17: AI engines, 2 visitors");
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it("renders horizontal SVG bars and escapes labels", () => {
    const html = renderToStaticMarkup(<BarList title="Top pages" rows={[{ label: "/<script>", value: 5, detail: "2 previous" }]} />);
    expect(html).toContain('<svg');
    expect(html).toContain('<rect width="100"');
    expect(html).toContain("/&lt;script&gt;");
    expect(html).toContain("2 previous");
  });

  it("renders empty states for empty arrays and zero-filled periods", () => {
    for (const component of [<LineChart key="line" data={[]} />, <StackedBarChart key="stack" data={[]} />, <BarList key="bars" title="Devices" rows={[]} />, <LineChart key="zero" data={[{ day: "2026-11-17", visitors: 0, views: 0 }]} />]) {
      const html = renderToStaticMarkup(component);
      expect(html).toMatch(/No (traffic|data) in this period/);
      expect(html).not.toContain("<svg");
    }
  });
});
