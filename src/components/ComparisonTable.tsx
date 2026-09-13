import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

export type ComparisonTableProps = {
  caption: string;
  columns: string[];
  rows: string[][];
  className?: string;
};

export const FILING_COMPARISON: ComparisonTableProps = {
  caption: "",
  columns: ["", "Form5472 Prep", "CPA", "DIY"],
  rows: [
    ["Setup time", "15 minutes", "1–2 weeks back-and-forth", "1–4 hours of confusion"],
    ["Knows Form 5472", "Built only for this", "Hit or miss", "Up to you"],
    ["Reasonable cause statement (DIIRSP)", "Included", "Usually extra", "DIY"],
    ["Files with the IRS", "We fax to Ogden", "By mail or fax", "Your problem"],
    ["Stores filing proof", "Yes, automatic", "Sometimes", "Your problem"],
    ["Cost", `From ${formatPrice(TIERS.standard.priceCents)}`, "$400 – $800", "Free (until $25k)"],
  ],
};

export function ComparisonTable({
  caption,
  columns,
  rows,
  className = "",
}: ComparisonTableProps): JSX.Element {
  const wrapperClassName = ["overflow-x-auto rounded-lg border border-slate-200", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      <table className="min-w-[28rem] w-full text-sm text-left">
        <caption
          className={
            caption
              ? "caption-top px-4 py-2 text-left text-xs font-medium text-slate-500"
              : "sr-only"
          }
        >
          {caption}
        </caption>
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`${column}-${index}`}
                scope="col"
                className={[
                  "py-3 px-3 sm:px-4 font-medium",
                  index === 1 ? "text-accent" : "text-slate-600",
                ].join(" ")}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.join("|")} className="transition-colors hover:bg-slate-50/70">
              {row.map((cell, index) =>
                index === 0 ? (
                  <th
                    key={cell}
                    scope="row"
                    className="py-3 px-3 sm:px-4 font-medium text-slate-900"
                  >
                    {cell}
                  </th>
                ) : (
                  <td
                    key={`${row[0]}-${index}`}
                    className={[
                      "py-3 px-3 sm:px-4",
                      index === 1
                        ? "text-slate-900 font-medium bg-accent-50 transition-colors hover:bg-accent-100"
                        : "text-slate-600",
                    ].join(" ")}
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
