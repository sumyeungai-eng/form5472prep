import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OwnerSsnBox } from "./OwnerSsnBox";

const base = {
  filingId: "filing_1",
  last4: null as string | null,
  submittedAt: null as string | null,
  requested: false,
  locked: false,
  configured: true,
};

describe("OwnerSsnBox (client order page)", () => {
  it("renders the #ssn anchor with two masked, non-autofilled numeric inputs and no prefill", () => {
    const html = renderToStaticMarkup(<OwnerSsnBox {...base} />);
    expect(html).toContain('id="ssn"');
    expect(html).toContain("U.S. Social Security Number — only if you have one");
    expect(html).toContain("encrypted");
    // Masked text inputs (never type="password", so no "save password" prompt).
    expect(html).not.toContain('type="password"');
    expect(html.match(/-webkit-text-security:disc/g)).toHaveLength(2);
    expect(html.match(/data-1p-ignore/g)).toHaveLength(2);
    expect(html.match(/data-lpignore="true"/g)).toHaveLength(2);
    expect(html.match(/autoComplete="off"|autocomplete="off"/gi)?.length).toBeGreaterThanOrEqual(2);
    expect(html.match(/inputMode="numeric"|inputmode="numeric"/gi)).toHaveLength(2);
    expect(html).not.toMatch(/value="[^"]+"/);
  });

  it("shows only the last four and the date once on file, with a Replace option", () => {
    const html = renderToStaticMarkup(<OwnerSsnBox {...base} last4="6789" submittedAt="2026-10-15T12:00:00.000Z" />);
    expect(html).toContain("SSN on file ending <span class=\"font-mono\">6789</span> — added Oct 15, 2026");
    expect(html).toContain("Replace");
    expect(html).not.toContain("-webkit-text-security");
  });

  it("highlights the box when the team asked and nothing is on file", () => {
    expect(renderToStaticMarkup(<OwnerSsnBox {...base} requested />)).toContain("We asked for this");
    expect(renderToStaticMarkup(<OwnerSsnBox {...base} requested last4="6789" submittedAt="2026-10-15T12:00:00.000Z" />)).not.toContain(
      "We asked for this",
    );
  });

  it("shows the friendly unavailable message when the key is missing", () => {
    const html = renderToStaticMarkup(<OwnerSsnBox {...base} configured={false} />);
    expect(html).toContain("Secure entry is temporarily unavailable — please contact support.");
    expect(html).not.toContain("-webkit-text-security");
  });

  it("is read-only after the fax", () => {
    const html = renderToStaticMarkup(<OwnerSsnBox {...base} locked last4="6789" submittedAt="2026-10-15T12:00:00.000Z" />);
    expect(html).toContain("already been sent to the IRS");
    expect(html).not.toContain("Replace");
  });
});
