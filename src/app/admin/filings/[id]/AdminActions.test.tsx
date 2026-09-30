import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));

import { AdminActions, parseActionError, refaxReasonIsValid } from "./AdminActions";

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
