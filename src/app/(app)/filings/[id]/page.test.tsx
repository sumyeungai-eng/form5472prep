import { NextIntlClientProvider, createTranslator, createFormatter } from "next-intl";
import type { ReactNode } from "react";
import common from "../../../../../messages/en/common.json";
import domain from "../../../../../messages/en/domain.json";
import portal from "../../../../../messages/en/portal.json";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup as renderMarkup } from "react-dom/server";
import FilingDetailPage from "./page";

const state = vi.hoisted(() => ({ filing: {} as Record<string, unknown> }));
vi.mock("@/lib/session", () => ({
  getFilingAccess: async () => ({ kind: "owned", filing: { id: "f1" } }),
  getCurrentUser: async () => ({ id: "u1" }),
  partnerOwnsFiling: async () => null,
}));
vi.mock("@/lib/prisma", () => ({ prisma: {
  filing: { findUnique: async () => state.filing },
  message: { count: async () => 0 },
} }));
vi.mock("@/lib/stripe", () => ({ stripe: vi.fn() }));
vi.mock("@/lib/supersedeDrafts", () => ({ supersedeDraftsFor: vi.fn() }));
vi.mock("@/lib/paidAt", () => ({ stampPaidAt: vi.fn() }));
vi.mock("@/lib/crypto/pii", () => ({ isPiiCryptoConfigured: () => false }));
vi.mock("@/components/wizard/FilingActions", () => ({ FilingActions: () => null }));
vi.mock("@/components/FilingLocked", () => ({ FilingLocked: () => null }));
vi.mock("@/components/PartnerFilingBar", () => ({ PartnerFilingBar: () => null }));
vi.mock("@/components/MessagesPanel", () => ({ MessagesPanel: () => null }));
vi.mock("@/components/DocumentsUploader", () => ({ DocumentsUploader: () => null }));
vi.mock("./PurchaseConversionPing", () => ({ PurchaseConversionPing: () => null }));
vi.mock("@/components/TrustpilotWidget", () => ({ TrustpilotWidget: () => null }));
vi.mock("@/components/OwnerSsnBox", () => ({ OwnerSsnBox: () => null }));
vi.mock("@/components/FilingReviewSummary", () => ({ FilingReviewSummary: () => null }));
vi.mock("@/components/SendCorrection", () => ({ SendCorrection: () => null }));

const render = async () => renderToStaticMarkup(await FilingDetailPage({ params: { id: "f1" }, searchParams: {} }));

describe("filing detail filed documents", () => {
  beforeEach(() => {
    state.filing = {
      id: "f1", status: "CONFIRMED", llcName: "Example LLC", tier: "standard", taxYears: [2025],
      updatedAt: new Date(), faxedAt: new Date(), faxedPdfKey: "private-frozen-key",
      signedPdfKey: "private-signed-key", faxConfirmationKey: "private-receipt-key",
    };
  });

  it.each(["FAXED", "CONFIRMED"])("%s shows all final document downloads without exposing storage keys", async (status) => {
    state.filing.status = status;
    const html = await render();
    expect(html).toContain('id="documents"');
    for (const route of ["faxed-pdf", "fax-receipt", "signed-pdf"]) expect(html).toContain(`/api/filings/f1/${route}`);
    expect(html).not.toContain("private-");
  });

  it.each(["PAID", "PDF_GENERATED", "SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAILED"])("%s shows no final documents card", async (status) => {
    state.filing.status = status;
    const html = await render();
    expect(html).not.toContain('id="documents"');
    expect(html).not.toContain("/faxed-pdf");
  });

  it("labels legacy forms, waits for the receipt, and omits an unavailable signed copy", async () => {
    Object.assign(state.filing, { faxedPdfKey: null, faxConfirmationKey: null });
    const html = await render();
    expect(html).toContain("Signed forms (PDF)");
    expect(html).toContain("Your fax receipt will appear here");
    expect(html).not.toContain("/signed-pdf");
    expect(html).not.toContain("/fax-receipt");
  });

  it("offers no PDF downloads when faxedAt is missing", async () => {
    state.filing.faxedAt = null;
    const html = await render();
    for (const route of ["faxed-pdf", "fax-receipt", "signed-pdf"]) expect(html).not.toContain(`/api/filings/f1/${route}`);
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
