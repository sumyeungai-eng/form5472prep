import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {}, push: () => {} }) }));

import { SignClient } from "./SignClient";

describe("SignClient — Why some lines are blank (PR 7)", () => {
  const html = renderToStaticMarkup(
    <SignClient
      filingId="filing_1"
      llcName="Example Test LLC"
      taxYears={[2025]}
      priorSignatureDataUrl={null}
      pdfKey="filings/filing_1/unsigned-1.pdf"
      showFilingLink
    />,
  );

  it("renders the panel after the PDF preview", () => {
    expect(html).toContain("Why some lines are blank");
    expect(html.indexOf("Why some lines are blank")).toBeGreaterThan(html.indexOf("<iframe"));
  });

  it("covers the 1120, 43a–43b, Part IV/V and Parts VIII–IX without a 'doesn't apply' claim", () => {
    expect(html).toContain("item E");
    expect(html).toContain("43a–43b");
    expect(html).toContain("Part V");
    expect(html).toContain("cost sharing arrangements and base erosion payments");
    expect(html).toContain("nothing was reported");
    expect(html).not.toMatch(/(do not|don.t|does not|doesn.t) apply/i);
  });
});
