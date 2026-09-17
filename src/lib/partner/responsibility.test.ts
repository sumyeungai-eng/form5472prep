import { describe, expect, it } from "vitest";
import { COURT_STATUSES, responsibilityFor } from "./responsibility";

const base = { clientInviteSentAt: null, signedPdfKey: null };

describe("responsibilityFor", () => {
  it("DRAFT with no invite is needs-you", () => {
    expect(responsibilityFor({ ...base, status: "DRAFT" })).toEqual({
      court: "you",
      label: "Needs you",
      hint: "Finish the details",
    });
  });

  it("DRAFT with clientInviteSentAt set is with-your-client", () => {
    expect(
      responsibilityFor({ ...base, status: "DRAFT", clientInviteSentAt: new Date("2026-01-01") }),
    ).toEqual({
      court: "client",
      label: "With your client",
      hint: "Filling in their details",
    });
  });

  it("PAID is needs-you", () => {
    expect(responsibilityFor({ ...base, status: "PAID" })).toEqual({
      court: "you",
      label: "Needs you",
      hint: "Send the sign link",
    });
  });

  it("PDF_GENERATED is needs-you", () => {
    expect(responsibilityFor({ ...base, status: "PDF_GENERATED" })).toEqual({
      court: "you",
      label: "Needs you",
      hint: "Send the sign link",
    });
  });

  it("SIGNATURE_PENDING is with-your-client", () => {
    expect(responsibilityFor({ ...base, status: "SIGNATURE_PENDING" })).toEqual({
      court: "client",
      label: "With your client",
      hint: "Waiting for their signature",
    });
  });

  it("SIGNED_UPLOADED is filing-with-the-IRS, ready to fax", () => {
    expect(responsibilityFor({ ...base, status: "SIGNED_UPLOADED" })).toEqual({
      court: "irs",
      label: "Filing with the IRS",
      hint: "Ready to fax",
    });
  });

  it("FAXED is filing-with-the-IRS, waiting on confirmation", () => {
    expect(responsibilityFor({ ...base, status: "FAXED" })).toEqual({
      court: "irs",
      label: "Filing with the IRS",
      hint: "Faxed, waiting on confirmation",
    });
  });

  it("CONFIRMED is done", () => {
    expect(responsibilityFor({ ...base, status: "CONFIRMED" })).toEqual({
      court: "done",
      label: "Confirmed",
      hint: "Filed and confirmed",
    });
  });

  it("FAILED is needs-you, flagged for attention", () => {
    expect(responsibilityFor({ ...base, status: "FAILED" })).toEqual({
      court: "you",
      label: "Needs you",
      hint: "Filing failed, needs attention",
    });
  });

  it("an unknown status falls back to needs-you", () => {
    expect(responsibilityFor({ ...base, status: "SOMETHING_NEW" })).toEqual({
      court: "you",
      label: "Needs you",
      hint: "Check this filing",
    });
  });

  it("DRAFT with a set-but-falsy-looking invite date is still with-your-client", () => {
    // Guards against a `!!clientInviteSentAt` implementation that would be
    // correct anyway, but pins the intent: any non-null Date counts.
    expect(
      responsibilityFor({ ...base, status: "DRAFT", clientInviteSentAt: new Date(0) }).court,
    ).toBe("client");
  });
});

describe("COURT_STATUSES", () => {
  it("covers you/client/irs/done with the statuses used in responsibilityFor", () => {
    expect(COURT_STATUSES.you).toEqual(["DRAFT", "PAID", "PDF_GENERATED", "FAILED"]);
    expect(COURT_STATUSES.client).toEqual(["DRAFT", "SIGNATURE_PENDING"]);
    expect(COURT_STATUSES.irs).toEqual(["SIGNED_UPLOADED", "FAXED"]);
    expect(COURT_STATUSES.done).toEqual(["CONFIRMED"]);
  });
});
