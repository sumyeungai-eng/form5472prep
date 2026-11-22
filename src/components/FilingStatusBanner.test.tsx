import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
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
