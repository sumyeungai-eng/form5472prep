import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardRow } from "./DashboardRow";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const base = {
  id: "f1", href: "/filings/f1", llcName: "Example LLC", taxYears: [2025],
  tierLabel: "Standard", updatedAt: "Nov 23, 2026", amountPaid: 14900,
  statusLabel: "Faxed", statusTone: "blue" as const, canDelete: false,
};

describe("DashboardRow filed documents", () => {
  it("links to the card even when a receipt has not arrived", () => {
    const html = renderToStaticMarkup(<DashboardRow {...base} hasFiledDocuments />);
    expect(html).toContain('href="/filings/f1#documents"');
    expect(html).toContain("Filed documents");
    expect(html).not.toContain("/fax-receipt");
  });

  it("offers no filed documents for an ineligible row", () => {
    expect(renderToStaticMarkup(<DashboardRow {...base} />)).not.toContain("#documents");
  });
});
