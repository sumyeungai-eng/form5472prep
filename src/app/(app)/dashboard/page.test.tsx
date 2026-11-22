import { NextIntlClientProvider, createTranslator, createFormatter } from "next-intl";
import type { ReactNode } from "react";
import common from "../../../../messages/en/common.json";
import domain from "../../../../messages/en/domain.json";
import portal from "../../../../messages/en/portal.json";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup as renderMarkup } from "react-dom/server";
import DashboardPage from "./page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/session", () => ({
  requireUser: async () => ({ id: "u1", email: "owner@example.test" }),
  claimAccountFilings: async () => ({ userId: "u1" }),
}));
vi.mock("@/lib/reminders", () => ({ taxYearForSend: () => 2026 }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: { findMany: async () => ["PDF_GENERATED", "SIGNED_UPLOADED", "FAXED", "CONFIRMED", "FAILED"].map((status) => ({
      id: status, status, llcName: `${status} LLC`, taxYears: [2025], tier: "standard", funnelSource: null,
      updatedAt: new Date("2026-11-20"), amountPaid: 14900, linkedToFilingId: null,
      // Both eligible filings must offer documents even without a receipt.
      faxConfirmationKey: null,
    })) },
    einApplication: { findMany: async () => [] },
    itinApplication: { findMany: async () => [] },
    message: { groupBy: async () => [] },
  },
}));

describe("dashboard filed documents", () => {
  it("offers the documents card only on FAXED and CONFIRMED rows, without waiting for a receipt", async () => {
    const html = renderToStaticMarkup(await DashboardPage());
    expect(html.match(/#documents/g)).toHaveLength(2);
    expect(html).toContain('href="/filings/FAXED#documents"');
    expect(html).toContain('href="/filings/CONFIRMED#documents"');
    expect(html).not.toContain("/fax-receipt");
  });
});

function renderToStaticMarkup(node: ReactNode) {
  return renderMarkup(<NextIntlClientProvider locale="en" messages={{ common, domain, portal }} timeZone="UTC">{node}</NextIntlClientProvider>);
}

vi.mock("next-intl/server", () => ({
  getTranslations: async () => createTranslator({ locale: "en", messages: { common, domain, portal } }),
  getLocale: async () => "en",
  getFormatter: async () => createFormatter({ locale: "en", timeZone: "UTC" }),
}));
