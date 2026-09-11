import { describe, expect, it } from "vitest";
import {
  clientIpFromHeaders,
  deviceFromUserAgent,
  externalReferrerHost,
  geoFromHeaders,
  hashIp,
  isBotUserAgent,
  isTrackablePath,
} from "./traffic";

const chromeUa =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
const safariUa =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const iphoneUa =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const ipadUa =
  "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("isBotUserAgent", () => {
  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "OAI-SearchBot/1.0",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/142.0.0.0 Safari/537.36",
  ])("classifies bot UA %s as bot", (ua) => {
    expect(isBotUserAgent(ua)).toBe(true);
  });

  it.each([chromeUa, safariUa])("keeps normal browser UA %s human", (ua) => {
    expect(isBotUserAgent(ua)).toBe(false);
  });
});

describe("deviceFromUserAgent", () => {
  it("classifies an iPhone as mobile", () => {
    expect(deviceFromUserAgent(iphoneUa)).toBe("mobile");
  });

  it("classifies an iPad as tablet", () => {
    expect(deviceFromUserAgent(ipadUa)).toBe("tablet");
  });

  it("classifies a desktop browser as desktop", () => {
    expect(deviceFromUserAgent(chromeUa)).toBe("desktop");
  });
});

describe("isTrackablePath", () => {
  it.each(["/admin", "/admin/x", "/api/x", "/_next/x", "/favicon.ico", "x"])(
    "rejects %s",
    (path) => {
      expect(isTrackablePath(path)).toBe(false);
    },
  );

  it.each(["/", "/pricing", "/blog/what-is-form-5472"])("accepts %s", (path) => {
    expect(isTrackablePath(path)).toBe(true);
  });
});

describe("traffic header helpers", () => {
  it("takes the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.10, 198.51.100.20" });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.10");
  });

  it("decodes a percent-encoded city", () => {
    const headers = new Headers({ "x-vercel-ip-city": "San%20Francisco" });
    expect(geoFromHeaders(headers).city).toBe("San Francisco");
  });
});

describe("externalReferrerHost", () => {
  it("strips own host and returns null for same-site referrers", () => {
    expect(externalReferrerHost("https://form5472prep.com/pricing", "www.form5472prep.com")).toBe(
      null,
    );
  });

  it("returns the normalized external host", () => {
    expect(externalReferrerHost("https://Example.com/some/page?x=1", "www.form5472prep.com")).toBe(
      "example.com",
    );
  });
});

describe("hashIp", () => {
  it("returns null without a salt", () => {
    expect(hashIp("203.0.113.10", undefined)).toBe(null);
  });

  it("returns a SHA-256 hex digest with a salt", () => {
    expect(hashIp("203.0.113.10", "secret")).toMatch(/^[0-9a-f]{64}$/);
  });
});
