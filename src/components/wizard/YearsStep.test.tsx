import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { YearsStep } from "./FilingWizard";

type StepFiling = Parameters<typeof YearsStep>[0]["filing"];

// Synthetic draft — only the fields the Tax years step reads.
function draft(overrides: Partial<StepFiling>): StepFiling {
  return {
    id: "filing_test",
    taxYears: [],
    isFinalReturn: false,
    dissolvedAt: null,
    dissolutionCertKey: null,
    extensionFiled: null,
    extensionTransmittedAt: null,
    extensionMethod: null,
    extensionDestination: null,
    extensionProofKey: null,
    llcDateIncorporated: null,
    tier: null,
    faxService: true,
    yearData: [],
    ...overrides,
  } as StepFiling;
}

function render(filing: StepFiling) {
  return renderToStaticMarkup(
    <YearsStep filing={filing} onSubmit={async () => {}} onBack={() => {}} onEditFormationDate={() => {}} saving={false} />,
  );
}

describe("YearsStep year picker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("explains why there is nothing to pick for an LLC formed this year (customer report 2026-10-07)", () => {
    const html = render(
      draft({
        llcDateIncorporated: "2026-04-10T00:00:00.000Z",
        // A 7004 answer saved earlier must not show the extension block for an unfilable year.
        extensionFiled: "yes",
        extensionTransmittedAt: "2026-04-13T00:00:00.000Z",
      }),
    );
    expect(html).toContain("no tax year to file yet");
    expect(html).toContain("April 10, 2026");
    expect(html).toContain("covers 2026");
    expect(html).toContain("January 2027");
    expect(html).toContain("Fix the formation date");
    expect(html).not.toContain("Did you file Form 7004");
    expect(html).not.toContain("timely filing");
    // The final-return route stays available for an LLC closed this year.
    expect(html).toContain("this is its final return");
  });

  it("shows the year buttons and no notice for an LLC formed in an earlier year", () => {
    const html = render(draft({ llcDateIncorporated: "2024-06-01T00:00:00.000Z" }));
    expect(html).not.toContain("no tax year to file yet");
    expect(html).toContain(">2024<");
    expect(html).toContain(">2025<");
    expect(html).not.toContain(">2026<");
  });

  it("unlocks the current year for a final return even when formed this year", () => {
    const html = render(draft({ llcDateIncorporated: "2026-04-10T00:00:00.000Z", isFinalReturn: true }));
    expect(html).not.toContain("no tax year to file yet");
    expect(html).toContain(">2026<");
  });
});
