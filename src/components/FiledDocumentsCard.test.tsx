import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FiledDocumentsCard } from "./FiledDocumentsCard";

const base = {
  filingId: "filing_1",
  isFiled: true,
  hasFiledForms: true,
  hasFaxedPdf: true,
  hasFaxReceipt: true,
  hasDistinctSignedCopy: true,
};

describe("FiledDocumentsCard", () => {
  it("offers the faxed snapshot, receipt and distinct signed copy at #documents", () => {
    const html = renderToStaticMarkup(<FiledDocumentsCard {...base} />);
    expect(html).toContain('id="documents"');
    expect(html).toContain("Your filed documents");
    expect(html).toContain("Forms faxed to the IRS (PDF)");
    expect(html).toContain("Fax transmission receipt (proof of filing)");
    expect(html).toContain("Signed copy (PDF)");
    for (const route of ["faxed-pdf", "fax-receipt", "signed-pdf"]) {
      expect(html).toContain(`href="/api/filings/filing_1/${route}"`);
    }
    expect(html).toContain("Keep these with your company records.");
    expect(html).toContain("the fax receipt is your proof of filing.");
    expect(html).not.toMatch(/@|\.s3\.|\.pdf"/);
  });

  it("labels the legacy signed fallback accurately and omits a duplicate signed row", () => {
    const html = renderToStaticMarkup(<FiledDocumentsCard {...base} hasFaxedPdf={false} hasDistinctSignedCopy={false} />);
    expect(html).toContain("Signed forms (PDF)");
    expect(html).toContain('href="/api/filings/filing_1/faxed-pdf"');
    expect(html).not.toContain("The exact package");
    expect(html).not.toContain('href="/api/filings/filing_1/signed-pdf"');
  });

  it("omits the signed row when the signed copy matches the faxed snapshot", () => {
    const html = renderToStaticMarkup(<FiledDocumentsCard {...base} hasDistinctSignedCopy={false} />);
    expect(html).not.toContain("Signed copy (PDF)");
  });

  it("explains a pending receipt without offering its download", () => {
    const html = renderToStaticMarkup(<FiledDocumentsCard {...base} hasFaxReceipt={false} />);
    expect(html).toContain("Your fax receipt will appear here once the IRS fax line confirms delivery.");
    expect(html).not.toContain("/fax-receipt");
    expect(html).toContain("/faxed-pdf");
  });

  it("omits forms that are not available", () => {
    const html = renderToStaticMarkup(<FiledDocumentsCard {...base} hasFiledForms={false} hasDistinctSignedCopy={false} />);
    expect(html).not.toContain("/faxed-pdf");
    expect(html).not.toContain("/signed-pdf");
  });

  it("renders nothing before the filing reaches FAXED or CONFIRMED", () => {
    expect(renderToStaticMarkup(<FiledDocumentsCard {...base} isFiled={false} />)).toBe("");
  });
});
