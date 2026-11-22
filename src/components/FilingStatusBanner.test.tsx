import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import common from "../../messages/en/common.json";
import domain from "../../messages/en/domain.json";
import portal from "../../messages/en/portal.json";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup as renderMarkup } from "react-dom/server";
import { FilingStatusBanner } from "./FilingStatusBanner";

describe("FilingStatusBanner filed documents action", () => {
  it.each(["FAXED", "CONFIRMED"])("%s links to all filed documents", (status) => {
    const html = renderToStaticMarkup(<FilingStatusBanner filingId="f1" status={status} updatedAt={new Date()} released />);
    expect(html).toContain("Download your filed documents");
    expect(html).toContain('href="/filings/f1#documents"');
  });

  it.each(["DRAFT", "PAID", "PDF_GENERATED", "SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAILED"])("%s offers no filed documents", (status) => {
    const html = renderToStaticMarkup(<FilingStatusBanner filingId="f1" status={status} updatedAt={new Date()} released={false} />);
    expect(html).not.toContain("#documents");
  });
});

function renderToStaticMarkup(node: ReactNode) {
  return renderMarkup(<NextIntlClientProvider locale="en" messages={{ common, domain, portal }} timeZone="UTC">{node}</NextIntlClientProvider>);
}
