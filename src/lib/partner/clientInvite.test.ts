import { describe, expect, it } from "vitest";
import { checkClientInvite } from "./clientInvite";

const PARTNER_ID = "partner_1";

function filing(overrides: Partial<{ partnerId: string | null; status: string; signedPdfKey: string | null }> = {}) {
  return {
    partnerId: PARTNER_ID,
    status: "DRAFT",
    signedPdfKey: null,
    ...overrides,
  };
}

describe("checkClientInvite", () => {
  it("returns 404 when the filing belongs to a different partner", () => {
    const result = checkClientInvite(filing({ partnerId: "someone_else" }), PARTNER_ID);
    expect(result).toEqual({ ok: false, status: 404, error: "Not found" });
  });

  it("returns 404 when the filing has no partner at all", () => {
    const result = checkClientInvite(filing({ partnerId: null }), PARTNER_ID);
    expect(result).toEqual({ ok: false, status: 404, error: "Not found" });
  });

  it("is ok for a DRAFT filing owned by the right partner", () => {
    const result = checkClientInvite(filing(), PARTNER_ID);
    expect(result).toEqual({ ok: true });
  });

  it("returns 409 once the filing has moved past DRAFT (e.g. PAID)", () => {
    const result = checkClientInvite(filing({ status: "PAID" }), PARTNER_ID);
    expect(result).toEqual({
      ok: false,
      status: 409,
      error: "The client intake link only works before payment. Use the sign link instead.",
    });
  });

  it("returns 409 when the filing is DRAFT but already has a signed PDF", () => {
    const result = checkClientInvite(filing({ signedPdfKey: "r2/key.pdf" }), PARTNER_ID);
    expect(result).toEqual({
      ok: false,
      status: 409,
      error: "The client intake link only works before payment. Use the sign link instead.",
    });
  });
});
