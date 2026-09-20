import { describe, expect, it } from "vitest";
import { inviteCookieValue, parseInviteCookie, type InviteScope } from "./filingInvite";

function cookieGrantsAccess(raw: string, filingId: string, scope: InviteScope, now: Date): boolean {
  const invite = parseInviteCookie(raw, now);
  return invite?.filingId === filingId && invite.scope === scope;
}

describe("filing invite access semantics", () => {
  it("rejects a matching filing with the wrong scope", () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const now = new Date("2029-12-31T00:00:00.000Z");
    const raw = inviteCookieValue("A", "edit", expiresAt);

    expect(parseInviteCookie(raw, now)).toEqual({ filingId: "A", scope: "edit" });
    expect(cookieGrantsAccess(raw, "A", "sign", now)).toBe(false);
  });

  it("rejects a matching scope for the wrong filing", () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const now = new Date("2029-12-31T00:00:00.000Z");
    const raw = inviteCookieValue("A", "sign", expiresAt);

    expect(parseInviteCookie(raw, now)).toEqual({ filingId: "A", scope: "sign" });
    expect(cookieGrantsAccess(raw, "B", "sign", now)).toBe(false);
  });

  it("rejects expired cookies for every filing and scope check", () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const now = new Date("2030-01-01T00:00:00.000Z");
    const raw = inviteCookieValue("A", "edit", expiresAt);

    expect(parseInviteCookie(raw, now)).toBeNull();
    expect(cookieGrantsAccess(raw, "A", "edit", now)).toBe(false);
  });

  it("rejects tampered cookies for every filing and scope check", () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const now = new Date("2029-12-31T00:00:00.000Z");
    const raw = inviteCookieValue("A", "edit", expiresAt);
    const tampered = `${raw.slice(0, -1)}x`;

    expect(parseInviteCookie(tampered, now)).toBeNull();
    expect(cookieGrantsAccess(tampered, "A", "edit", now)).toBe(false);
  });
});
