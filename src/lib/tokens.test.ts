import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "token-regression-test-secret";
const NOW = new Date("2026-09-29T12:00:00Z");
const NOW_SECONDS = Math.floor(NOW.getTime() / 1000);
const DAY = 24 * 60 * 60;
const USER_ID = "user_token_test";

function signedToken(expiresAt: number, purpose = "", secret = SECRET): string {
  const payload = `${USER_ID}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", secret).update(`${purpose}${payload}`).digest("base64url");
  return `${payload}.${signature}`;
}

function loginToken(link: string): string {
  return decodeURIComponent(new URL(link).pathname.slice("/auth/".length));
}

function unsubscribeToken(link: string): string {
  return new URL(link).searchParams.get("t")!;
}

async function modules() {
  const login = await import("./magicLink");
  const unsubscribe = await import("./unsubscribeToken");
  return { ...login, ...unsubscribe };
}

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("MAGIC_LINK_SECRET", SECRET);
  vi.stubEnv("SESSION_SECRET", "unused-session-secret");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("token purpose separation and legacy transition", () => {
  it("rejects a new unsubscribe token as a login", async () => {
    const tokens = await modules();
    expect(tokens.verifyMagicLinkToken(unsubscribeToken(tokens.makeUnsubscribeLink(USER_ID)))).toBeNull();
    // Purpose separation still holds when an unsubscribe link nears expiry.
    expect(tokens.verifyMagicLinkToken(signedToken(NOW_SECONDS + DAY, "unsub:"))).toBeNull();
  });

  it("rejects a legacy year-long unsubscribe token as a login", async () => {
    const tokens = await modules();
    expect(tokens.verifyMagicLinkToken(signedToken(NOW_SECONDS + 365 * DAY))).toBeNull();
  });

  it.each([1, 7 * DAY, 7 * DAY + 60 * 60])("accepts a legacy login with %i seconds left", async (remaining) => {
    const tokens = await modules();
    expect(tokens.verifyMagicLinkToken(signedToken(NOW_SECONDS + remaining))).toBe(USER_ID);
  });

  it("rejects legacy login expiry one second beyond the transition window", async () => {
    const tokens = await modules();
    expect(tokens.verifyMagicLinkToken(signedToken(NOW_SECONDS + 7 * DAY + 60 * 60 + 1))).toBeNull();
  });

  it("signs new links with their own purpose and preserves their TTLs", async () => {
    const tokens = await modules();
    const login = loginToken(tokens.makeMagicLink(USER_ID));
    const unsub = unsubscribeToken(tokens.makeUnsubscribeLink(USER_ID));
    expect(login).toBe(signedToken(NOW_SECONDS + 7 * DAY, "login:"));
    expect(unsub).toBe(signedToken(NOW_SECONDS + 365 * DAY, "unsub:"));
    expect(tokens.verifyMagicLinkToken(login)).toBe(USER_ID);
    expect(tokens.verifyUnsubscribeToken(login)).toBeNull();
    expect(tokens.verifyUnsubscribeToken(unsub)).toBe(USER_ID);
  });

  it("still accepts legacy unsubscribe links", async () => {
    const tokens = await modules();
    expect(tokens.verifyUnsubscribeToken(signedToken(NOW_SECONDS + 365 * DAY))).toBe(USER_ID);
  });

  it.each([`${USER_ID}:Infinity`, `${USER_ID}:${NOW_SECONDS + 0.5}`, `${USER_ID}:${NOW_SECONDS + DAY}:extra`])("rejects malformed legacy payload %s", async (payload) => {
    const tokens = await modules();
    const token = `${payload}.${crypto.createHmac("sha256", SECRET).update(payload).digest("base64url")}`;
    expect(tokens.verifyMagicLinkToken(token)).toBeNull();
    expect(tokens.verifyUnsubscribeToken(token)).toBeNull();
  });

  it.each(["login:", "unsub:", ""])("rejects tampered signatures and payloads (%s)", async (purpose) => {
    const tokens = await modules();
    const token = signedToken(NOW_SECONDS + DAY, purpose);
    const dot = token.lastIndexOf(".");
    const changedSignature = token.slice(0, dot + 1) + (token[dot + 1] === "A" ? "B" : "A") + token.slice(dot + 2);
    for (const bad of [changedSignature, token.replace(USER_ID, "other_user"), token.slice(0, -1)]) {
      expect(tokens.verifyMagicLinkToken(bad)).toBeNull();
      expect(tokens.verifyUnsubscribeToken(bad)).toBeNull();
    }
  });

  it.each(["login:", "unsub:", ""])("rejects expired tokens, including at the expiry second (%s)", async (purpose) => {
    const tokens = await modules();
    for (const expiry of [NOW_SECONDS - 1, NOW_SECONDS]) {
      expect(tokens.verifyMagicLinkToken(signedToken(expiry, purpose))).toBeNull();
      expect(tokens.verifyUnsubscribeToken(signedToken(expiry, purpose))).toBeNull();
    }
  });
});

describe("token secret configuration", () => {
  it.each(["magicLink", "unsubscribeToken"])("refuses production initialization without a secret (%s)", async (module) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MAGIC_LINK_SECRET", "");
    vi.stubEnv("SESSION_SECRET", "");
    const imported = module === "magicLink" ? import("./magicLink") : import("./unsubscribeToken");
    await expect(imported).rejects.toThrow(/require MAGIC_LINK_SECRET or SESSION_SECRET in production/);
  });

  it.each(["MAGIC_LINK_SECRET", "SESSION_SECRET"])("uses %s in production", async (variable) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MAGIC_LINK_SECRET", variable === "MAGIC_LINK_SECRET" ? SECRET : "");
    vi.stubEnv("SESSION_SECRET", variable === "SESSION_SECRET" ? SECRET : "different-session-secret");
    const tokens = await modules();
    const login = loginToken(tokens.makeMagicLink(USER_ID));
    const unsub = unsubscribeToken(tokens.makeUnsubscribeLink(USER_ID));
    expect(login).toBe(signedToken(NOW_SECONDS + 7 * DAY, "login:"));
    expect(unsub).toBe(signedToken(NOW_SECONDS + 365 * DAY, "unsub:"));
    expect(tokens.verifyMagicLinkToken(login)).toBe(USER_ID);
    expect(tokens.verifyUnsubscribeToken(unsub)).toBe(USER_ID);
  });

  it("retains the development fallback outside production", async () => {
    vi.stubEnv("MAGIC_LINK_SECRET", "");
    vi.stubEnv("SESSION_SECRET", "");
    const tokens = await modules();
    expect(tokens.verifyMagicLinkToken(loginToken(tokens.makeMagicLink(USER_ID)))).toBe(USER_ID);
    expect(tokens.verifyUnsubscribeToken(unsubscribeToken(tokens.makeUnsubscribeLink(USER_ID)))).toBe(USER_ID);
  });
});
