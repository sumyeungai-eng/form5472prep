import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));

import { OwnerSsnCard } from "./OwnerSsnCard";

const base = {
  filingId: "filing_1",
  last4: null as string | null,
  submittedAt: null as string | null,
  submittedBy: null as "client" | "admin" | null,
  requestedAt: null as string | null,
  configured: true,
  entryState: "open" as const,
  customerEmail: "client@example.test",
};

describe("OwnerSsnCard (admin)", () => {
  it("says not on file and offers Ask client / Enter SSN", () => {
    const html = renderToStaticMarkup(<OwnerSsnCard {...base} />);
    expect(html).toContain("SSN: not on file");
    expect(html).toContain("Ask client for SSN");
    expect(html).toContain("Enter SSN");
    expect(html).not.toContain("Reveal");
  });

  it("shows only the masked number with who/when, plus Reveal", () => {
    const html = renderToStaticMarkup(
      <OwnerSsnCard {...base} last4="6789" submittedAt="2026-10-15T12:00:00.000Z" submittedBy="client" />,
    );
    expect(html).toContain("•••-••-6789");
    expect(html).toContain("added by client Oct 15, 2026");
    expect(html).toContain("Reveal");
    expect(html).not.toMatch(/\d{3}-\d{2}-\d{4}/);
  });

  it("shows the config-missing state and hides entry/reveal when the key is absent", () => {
    const html = renderToStaticMarkup(<OwnerSsnCard {...base} last4="6789" submittedAt="2026-10-15T12:00:00.000Z" configured={false} />);
    expect(html).toContain("PII_ENCRYPTION_KEY is not set");
    expect(html).not.toContain("Reveal");
    expect(html).not.toContain("Ask client for SSN");
  });

  it("locks entry after the fax", () => {
    const html = renderToStaticMarkup(<OwnerSsnCard {...base} entryState="locked" />);
    expect(html).toContain("Faxed to the IRS");
    expect(html).not.toContain("Ask client for SSN");
    expect(html).not.toContain("Enter SSN");
  });

  it("warns when the SSN was added after the package was reviewed/signed", () => {
    const html = renderToStaticMarkup(
      <OwnerSsnCard {...base} last4="6789" submittedAt="2026-10-15T12:00:00.000Z" addedAfterPackage />,
    );
    expect(html).toContain("added after this package was reviewed/signed");
  });
});
