import { describe, expect, it } from "vitest";
import { pickLatest, timeAgo } from "./filingPresence";

describe("pickLatest", () => {
  it("returns null for an empty candidate list", () => {
    expect(pickLatest([])).toBeNull();
  });

  it("picks the candidate with the max lastSeenAt", () => {
    const older = {
      visitorId: "v-older",
      lastSeenAt: new Date("2026-09-01T00:00:00Z"),
      ip: "1.1.1.1",
      city: "Lisbon",
      country: "PT",
    };
    const newer = {
      visitorId: "v-newer",
      lastSeenAt: new Date("2026-09-10T00:00:00Z"),
      ip: "2.2.2.2",
      city: "Seoul",
      country: "KR",
    };

    const result = pickLatest([older, newer]);

    expect(result).not.toBeNull();
    expect(result?.visitorId).toBe("v-newer");
    expect(result?.lastSeenAt).toEqual(newer.lastSeenAt);
    expect(result?.city).toBe("Seoul");
    expect(result?.country).toBe("KR");
    expect(result?.lastPath).toBeNull();
  });

  it("keeps ip null when the latest candidate's ip has expired", () => {
    const withIp = {
      visitorId: "v-old",
      lastSeenAt: new Date("2026-08-01T00:00:00Z"),
      ip: "3.3.3.3",
      city: null,
      country: null,
    };
    const expiredIp = {
      visitorId: "v-recent",
      lastSeenAt: new Date("2026-09-15T00:00:00Z"),
      ip: null,
      city: "Bangkok",
      country: "TH",
    };

    const result = pickLatest([withIp, expiredIp]);

    expect(result?.visitorId).toBe("v-recent");
    expect(result?.ip).toBeNull();
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-09-16T12:00:00Z");

  it("reports under a minute as 'just now'", () => {
    const date = new Date(now.getTime() - 30 * 1000);
    expect(timeAgo(date, now)).toBe("just now");
  });

  it("reports minutes as 'Nm ago'", () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000);
    expect(timeAgo(date, now)).toBe("5m ago");
  });

  it("reports hours as 'Nh ago'", () => {
    const date = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(timeAgo(date, now)).toBe("2h ago");
  });

  it("reports days under 30 as 'Nd ago'", () => {
    const date = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(date, now)).toBe("3d ago");
  });

  it("reports 30+ days as an absolute YYYY-MM-DD date", () => {
    const date = new Date("2026-08-01T00:00:00Z");
    expect(timeAgo(date, now)).toBe("2026-08-01");
  });
});
