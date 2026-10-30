import { afterEach, describe, expect, it, vi } from "vitest";

// portalHost reads NEXT_PUBLIC_PARTNER_PORTAL_HOST at import, so each case
// stubs the env and re-imports the modules under test.
const db = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { update: db.update } } }));

async function load(host: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_PARTNER_PORTAL_HOST", host);
  return {
    portal: await import("@/lib/partner/portalHost"),
    ads: await import("@/lib/analytics/googleAdsLoader"),
    invite: await import("@/lib/filingInvite"),
    meta: await import("@/lib/partner/portalMetadata"),
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  db.update.mockReset();
});

describe("partner portal host", () => {
  it("is off when unset: nothing matches, no origin, ads bootstrap unchanged", async () => {
    const { portal, ads } = await load("");
    expect(portal.isPortalHost("anything.test")).toBe(false);
    expect(portal.portalOrigin()).toBeNull();
    expect(ads.googleAdsBootstrapScript("AW-1")).toContain("if (true) {");
  });

  it("matches the configured host with or without a port, case-insensitively", async () => {
    const { portal } = await load("Sign.Example.com");
    expect(portal.isPortalHost("sign.example.com")).toBe(true);
    expect(portal.isPortalHost("SIGN.example.com:443")).toBe(true);
    expect(portal.isPortalHost("www.form5472prep.com")).toBe(false);
    expect(portal.portalOrigin()).toBe("https://sign.example.com");
  });

  it("uses http for a .localhost dev host and keeps its port", async () => {
    const { portal } = await load("portal.localhost:3000");
    expect(portal.portalOrigin()).toBe("http://portal.localhost:3000");
  });

  it("never loads the ad tag on the portal hostname", async () => {
    const { ads } = await load("sign.example.com");
    expect(ads.googleAdsBootstrapScript("AW-1")).toContain('if (location.hostname !== "sign.example.com") {');
  });

  it("builds a partner filing's invite link on the portal, a retail one on the main site", async () => {
    const { invite } = await load("sign.example.com");
    db.update.mockResolvedValueOnce({ partnerId: "p1" });
    const partner = await invite.createFilingInvite("f1", "sign", "c@example.test");
    expect(partner.url.startsWith("https://sign.example.com/invite/")).toBe(true);
    db.update.mockResolvedValueOnce({ partnerId: null });
    const retail = await invite.createFilingInvite("f2", "sign", "c@example.test");
    expect(retail.url.startsWith("https://sign.example.com")).toBe(false);
  });

  it("portal metadata carries only the partner's name", async () => {
    const { meta } = await load("sign.example.com");
    const m = meta.portalMetadata("Acme Formations");
    expect(JSON.stringify(m)).not.toMatch(/form5472|Form5472/i);
    expect(m.title).toEqual({ absolute: "Acme Formations" });
    expect(m.robots).toEqual({ index: false, follow: false });
    expect(String(m.metadataBase)).toBe("https://sign.example.com/");
  });
});
