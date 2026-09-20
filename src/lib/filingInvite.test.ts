import { describe, expect, it } from "vitest";
import {
  hashInviteToken,
  inviteCookieValue,
  isInviteScope,
  parseInviteCookie,
} from "./filingInvite";

describe("hashInviteToken", () => {
  it("is stable for the same input", () => {
    expect(hashInviteToken("same-token")).toBe(hashInviteToken("same-token"));
  });
});

describe("inviteCookieValue and parseInviteCookie", () => {
  it("round trips a valid invite cookie", () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const raw = inviteCookieValue("filing_123", "edit", expiresAt);

    expect(parseInviteCookie(raw, new Date("2029-12-31T00:00:00.000Z"))).toEqual({
      filingId: "filing_123",
      scope: "edit",
    });
  });

  it("rejects a tampered signature", () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const raw = inviteCookieValue("filing_123", "edit", expiresAt);
    const tampered = `${raw.slice(0, -1)}x`;

    expect(parseInviteCookie(tampered, new Date("2029-12-31T00:00:00.000Z"))).toBeNull();
  });

  it("rejects an expired cookie", () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const raw = inviteCookieValue("filing_123", "sign", expiresAt);

    expect(parseInviteCookie(raw, new Date("2030-01-01T00:00:00.000Z"))).toBeNull();
  });

  it("rejects a wrong scope value", () => {
    expect(isInviteScope("view")).toBe(false);

    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const raw = inviteCookieValue("filing_123", "edit", expiresAt);
    const parts = raw.split(".");
    parts[1] = "view";

    expect(parseInviteCookie(parts.join("."), new Date("2029-12-31T00:00:00.000Z"))).toBeNull();
  });

  it("returns null for malformed input without throwing", () => {
    expect(parseInviteCookie(undefined)).toBeNull();
    expect(parseInviteCookie("garbage")).toBeNull();
    expect(parseInviteCookie("filing_123.edit.1893456000000")).toBeNull();
  });
});
