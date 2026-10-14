import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));

import {
  AdminActions,
  parseActionError,
  REVIEWED_PDF_REGENERATE_CONFIRM,
  refaxReasonIsValid,
  RerunPreflightButton,
} from "./AdminActions";

const baseProps = {
  filingId: "filing_1",
  currentStatus: "SIGNED_UPLOADED",
  userEmail: "owner@example.test",
  hasFaxService: true,
  hasSignedPdf: true,
  hasGeneratedPdf: true,
  hasCustomerSignature: true,
  hasFaxedPdf: false,
  hasFaxReceipt: false,
  canResendFaxConfirmation: false,
  preflightStatus: "passed",
  preflightOverrideBy: null,
  reviewApprovedAt: null,
  reviewApprovedBy: null,
  faxedAt: null,
};

describe("AdminActions › fax submission", () => {
  it("offers a plain first send for a signed filing", () => {
    const html = renderToStaticMarkup(<AdminActions {...baseProps} />);
    expect(html).toContain("Send fax to IRS");
    expect(html).not.toContain("Fax again");
  });

  it.each(["FAXED", "CONFIRMED"])(
    "%s: shows “Fax again…” and keeps the reason form closed until it is clicked",
    (status) => {
      const html = renderToStaticMarkup(
        <AdminActions {...baseProps} currentStatus={status} hasFaxedPdf faxedAt="2026-09-29T10:00:00.000Z" />,
      );
      expect(html).toContain("Fax again…");
      expect(html).not.toContain("Why send this fax again?");
      expect(html).not.toContain("Send to the IRS again");
    },
  );

  it("labels a retry after a failed fax", () => {
    expect(renderToStaticMarkup(<AdminActions {...baseProps} currentStatus="FAILED" />)).toContain("Retry fax");
  });
});

describe("refaxReasonIsValid", () => {
  it.each([
    ["IRS asked for a second copy", true],
    ["0123456789", true],
    ["  a b c d e f g h i j  ", true],
    ["a b c d e f g h i", false],
    ["          ", false],
    ["", false],
  ])("%j → %s", (reason, expected) => {
    expect(refaxReasonIsValid(reason)).toBe(expected);
  });
});

describe("parseActionError", () => {
  it("reads the route's { error, code } body", () => {
    expect(parseActionError(JSON.stringify({ error: "Already delivered.", code: "refax_reason_required" }), 409)).toEqual({
      message: "Already delivered.",
      code: "refax_reason_required",
    });
  });

  it("falls back to short plain text, then to the HTTP status", () => {
    expect(parseActionError("Bad gateway", 502)).toEqual({ message: "Bad gateway" });
    expect(parseActionError("", 500)).toEqual({ message: "HTTP 500" });
    expect(parseActionError(`<html>${"x".repeat(600)}</html>`, 500)).toEqual({ message: "HTTP 500" });
  });
});

describe("AdminActions › pre-flight gate on the reviewed-PDF upload (spec item 1)", () => {
  const blockedReason =
    "Pre-flight failed (checked 2026-10-10 12:14 UTC) and no override is recorded, so the reviewed PDF can't be uploaded yet. Failing checks: A32.";
  const reviewProps = { ...baseProps, currentStatus: "PDF_GENERATED", hasSignedPdf: false, hasCustomerSignature: false };

  it("explains why the override button is disabled until a reason is typed", () => {
    const html = renderToStaticMarkup(
      <AdminActions {...reviewProps} preflightStatus="failed" preflightBlockedReason={blockedReason} />,
    );
    expect(html).toContain("Type a reason above to enable this button (10 more characters needed).");
  });

  it("shows the upload visibly disabled, with the reason inline and a link to the override form", () => {
    const html = renderToStaticMarkup(
      <AdminActions {...reviewProps} preflightStatus="failed" preflightBlockedReason={blockedReason} />,
    );
    expect(html).toContain("Upload reviewed PDF (blocked by pre-flight)");
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain("Upload reviewed PDF &amp; send to client…");
    expect(html).toContain("Failing checks: A32.");
    expect(html).toContain('href="#preflight-override"');
    expect(html).toContain('id="preflight-override"');
    expect(html).toContain("Approve despite pre-flight failures");
  });

  it("enables the upload once an override is recorded (or pre-flight passes)", () => {
    for (const props of [
      { preflightStatus: "failed", preflightOverrideBy: "admin_2" },
      { preflightStatus: "passed", preflightOverrideBy: null },
    ]) {
      const html = renderToStaticMarkup(<AdminActions {...reviewProps} {...props} preflightBlockedReason={null} />);
      expect(html).toContain("Upload reviewed PDF &amp; send to client…");
      expect(html).not.toContain("blocked by pre-flight");
    }
  });
});

describe("AdminActions › reviewed PDF is the client version (spec item 12)", () => {
  it("offers the latest generated draft and explains which file the client signs and which is faxed", () => {
    const html = renderToStaticMarkup(<AdminActions {...baseProps} currentStatus="SIGNATURE_PENDING" hasReviewedPdf />);
    expect(html).toContain("Download latest generated draft");
    expect(html).toContain("/api/admin/filings/filing_1/pdf?variant=draft&amp;download=1");
    expect(html).toContain("current client version");
    expect(html).toContain("Regenerate only writes a draft and never replaces the reviewed upload.");
    expect(html).toContain("The fax sends the");
  });

  it("does not offer a draft download when no reviewed PDF is current", () => {
    expect(renderToStaticMarkup(<AdminActions {...baseProps} />)).not.toContain("Download latest generated draft");
  });

  it("uses the spec's confirmation text", () => {
    expect(REVIEWED_PDF_REGENERATE_CONFIRM).toBe(
      "A reviewed PDF is the current client version. Regenerating will not replace it unless you upload again.",
    );
  });
});

describe("RerunPreflightButton", () => {
  it("renders the Re-run pre-flight control", () => {
    expect(renderToStaticMarkup(<RerunPreflightButton filingId="filing_1" />)).toContain("Re-run pre-flight");
  });
});

describe("AdminActions › SSN fax hold (SSN capture)", () => {
  it("explains the hold and the confirm-with-reason path next to the fax button", () => {
    const html = renderToStaticMarkup(<AdminActions {...baseProps} ssnFaxHold />);
    expect(html).toContain("Fax held: the owner&#x27;s SSN was added after this package was built");
    expect(html).toContain("confirm with a reason that the package shows the SSN");
    expect(html).toContain("Send fax to IRS");
  });

  it("shows nothing about SSNs when there is no hold", () => {
    const html = renderToStaticMarkup(<AdminActions {...baseProps} />);
    expect(html).not.toContain("Fax held: the owner");
  });
});
