import { NextIntlClientProvider, createTranslator, createFormatter } from "next-intl";
import type { ReactNode } from "react";
import common from "../../../../../../messages/en/common.json";
import domain from "../../../../../../messages/en/domain.json";
import portal from "../../../../../../messages/en/portal.json";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup as renderMarkup } from "react-dom/server";
import FilingConfirmationPage from "./page";

const state = vi.hoisted(() => ({ filing: {} as Record<string, unknown> }));
vi.mock("@/lib/session", () => ({
  getOwnedFiling: async () => ({ id: "f1" }),
  partnerOwnsFiling: async () => null,
}));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findUnique: async () => state.filing } } }));
vi.mock("@/lib/completeness", () => ({ requiresReasonableCause: () => false }));
vi.mock("@/components/PartnerFilingBar", () => ({ PartnerFilingBar: () => null }));

const render = async () => renderToStaticMarkup(await FilingConfirmationPage({ params: { id: "f1" } }));

describe("confirmation filed documents", () => {
  beforeEach(() => {
    state.filing = {
      id: "f1", status: "CONFIRMED", taxYears: [2025], updatedAt: new Date(), faxedAt: new Date(),
      faxedPdfKey: "private-frozen-key", signedPdfKey: "private-signed-key", faxConfirmationKey: "private-receipt-key",
    };
  });

  it.each(["FAXED", "CONFIRMED"])("%s shows forms and proof of filing", async (status) => {
    state.filing.status = status;
    const html = await render();
    expect(html).toContain('id="documents"');
    for (const route of ["faxed-pdf", "fax-receipt", "signed-pdf"]) expect(html).toContain(`/api/filings/f1/${route}`);
    expect(html).not.toContain("private-");
  });

  it("does not show final documents for a filing awaiting fax", async () => {
    state.filing.status = "SIGNED_UPLOADED";
    const html = await render();
    expect(html).not.toContain('id="documents"');
    expect(html).not.toContain("/faxed-pdf");
  });

  it("omits a duplicate signed copy when it matches the faxed snapshot", async () => {
    state.filing.signedPdfKey = state.filing.faxedPdfKey;
    const html = await render();
    expect(html).toContain("/faxed-pdf");
    expect(html).not.toContain("/signed-pdf");
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
