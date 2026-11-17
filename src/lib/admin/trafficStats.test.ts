import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ queryRaw: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: db.queryRaw } }));

import { aiEngine, CHANNEL_GROUPS, channelGroup, getTrafficOverview, percentChange } from "./trafficStats";
import { PAID_FILING_STATUSES } from "./traffic";

describe("traffic attribution", () => {
  it.each([
    ["google-organic", "Google search"], ["bing-organic", "Other search"], ["brave-organic", "Other search"],
    ["chatgpt-ai", "AI engines"], ["unknown-ai", "AI engines"], ["google-ads", "Paid ads"],
    ["microsoft-ads", "Paid ads"], ["meta-ads", "Paid ads"], ["meta-social", "Social"],
    ["referral", "Referral"], ["direct", "Direct"], [null, "Direct"], ["newsletter", "Other"], ["", "Other"],
  ])("groups %s as %s", (source, expected) => expect(channelGroup(source)).toBe(expected));

  it.each([
    ["chatgpt-ai", "ChatGPT"], ["perplexity-ai", "Perplexity"], ["gemini-ai", "Gemini"],
    ["copilot-ai", "Copilot"], ["claude-ai", "Claude"], ["grok-ai", "Grok"],
    ["metaai-ai", "Meta AI"], ["you-ai", "You.com"], ["unknown-ai", "Other AI"],
    [null, null], ["google-organic", null],
  ])("names %s as %s", (source, expected) => expect(aiEngine(source)).toBe(expected));
});

describe("percentage changes", () => {
  it.each([[0, 0, null], [5, 0, Infinity], [0, 5, -100], [15, 10, 50], [5, 10, -50], [10, 10, 0]])(
    "%s vs %s is %s (Infinity means New)", (current, previous, expected) => expect(percentChange(current, previous)).toBe(expected),
  );
});

describe("getTrafficOverview", () => {
  beforeEach(() => { db.queryRaw.mockReset().mockResolvedValue([]); });

  it.each([["7d", 7, "2026-11-11"], ["28d", 28, "2026-10-21"], ["90d", 90, "2026-08-20"]] as const)(
    "zero-fills every UTC day for %s including today", async (range, length, first) => {
      const result = await getTrafficOverview(range, new Date("2026-11-17T15:30:00Z"));
      expect(result.daily).toHaveLength(length);
      expect(result.daily[0]).toEqual({ day: first, visitors: 0, views: 0 });
      expect(result.daily.at(-1)).toEqual({ day: "2026-11-17", visitors: 0, views: 0 });
      expect(result.dailyByGroup).toEqual(result.daily.map(({ day }) => ({ day, ...Object.fromEntries(CHANNEL_GROUPS.map(group => [group, 0])) })));
      expect(result.totals.visitors).toEqual({ current: 0, previous: 0, change: null });
      expect(result.totals.conversion).toEqual({ current: 0, previous: 0, change: null });
      expect(result.byGroup).toHaveLength(8);
      expect(result.aiEngines).toEqual([]);
    },
  );

  it("uses UTC boundaries across a month/year boundary, regardless of input offset", async () => {
    await getTrafficOverview("7d", new Date("2027-01-01T01:00:00+08:00"));
    const dailyCall = db.queryRaw.mock.calls[0];
    expect(dailyCall.slice(1)).toEqual([new Date("2026-12-25T00:00:00Z"), new Date("2026-12-31T17:00:00Z")]);
    expect(db.queryRaw.mock.calls[1].slice(1)).toEqual([
      new Date("2026-12-25T00:00:00Z"), new Date("2026-12-18T00:00:00Z"), new Date("2026-12-31T17:00:00Z"),
    ]);
  });

  it("combines aggregate sources, keeps period distinct counts separate from daily counts, and sums paid cents", async () => {
    db.queryRaw
      .mockResolvedValueOnce([
        { day: "2026-11-11", source: "chatgpt-ai", visitors: 3, views: 5 },
        { day: "2026-11-11", source: "perplexity-ai", visitors: 2, views: 3 },
        { day: "2026-11-12", source: "chatgpt-ai", visitors: 3, views: 6 },
      ])
      .mockResolvedValueOnce([
        { source: "chatgpt-ai", current: true, visitors: 4, views: 11 },
        { source: "perplexity-ai", current: true, visitors: 2, views: 3 },
        { source: "google-organic", current: true, visitors: 10, views: 12 },
        { source: "chatgpt-ai", current: false, visitors: 2, views: 4 },
      ])
      .mockResolvedValueOnce([
        { source: "chatgpt-ai", current: true, started: 3, paid: 2, revenue: 15900 },
        { source: "chatgpt-ai", current: false, started: 1, paid: 1, revenue: 4900 },
        { source: "claude-ai", current: true, started: 1, paid: 1, revenue: 4900 },
      ])
      .mockResolvedValueOnce([{ current: true, paid: 2, revenue: 25000 }, { current: false, paid: 1, revenue: 10000 }])
      .mockResolvedValueOnce([{ path: "/pricing", visitors: 3 }])
      .mockResolvedValueOnce([{ path: "/", views: 12, prevViews: 4 }])
      .mockResolvedValueOnce([{ country: "US", visitors: 5 }])
      .mockResolvedValueOnce([{ device: "desktop", views: 12 }]);
    const result = await getTrafficOverview("7d", new Date("2026-11-17T15:30:00Z"));
    expect(result.daily[0]).toEqual({ day: "2026-11-11", visitors: 5, views: 8 });
    expect(result.daily[2].visitors).toBe(0);
    expect(result.dailyByGroup[0]["AI engines"]).toBe(5);
    expect(result.totals.visitors).toEqual({ current: 16, previous: 2, change: 700 });
    expect(result.totals.views.current).toBe(26);
    expect(result.totals.startedFilings.current).toBe(4);
    expect(result.totals.paidFilings.current).toBe(3);
    expect(result.totals.paidEinItin).toEqual({ current: 2, previous: 1, change: 100 });
    expect(result.totals.revenueCents.current).toBe(45800);
    expect(result.totals.revenueCents.previous).toBe(14900);
    expect(result.totals.conversion.current).toBe(3 / 16);
    expect(result.byGroup[0].group).toBe("Google search");
    expect(result.byGroup.find(row => row.group === "AI engines")).toEqual({ group: "AI engines", visitors: 6, prevVisitors: 2, startedFilings: 4, paidFilings: 3, conv: 0.5 });
    expect(result.aiEngines[0]).toEqual({ engine: "ChatGPT", visitors: 4, prevVisitors: 2, startedFilings: 3, paidFilings: 2 });
    expect(result.aiEngines.find(row => row.engine === "Claude")).toMatchObject({ visitors: 0, paidFilings: 1 });
    expect(result.topLanding).toEqual([{ path: "/pricing", visitors: 3 }]);
    expect(result.topPages[0].prevViews).toBe(4);
    expect(result.countries[0].country).toBe("US");
    expect(result.devices[0].device).toBe("desktop");
  });

  it.each([
    ["bigint", (value: number) => BigInt(value)],
    ["Decimal-like", (value: number) => ({ toString: () => String(value), valueOf: () => String(value) })],
    ["toString-only Decimal-like", (value: number) => ({ toString: () => String(value) })],
  ] as const)("maps %s aggregates from all eight queries to plain numbers", async (_, raw) => {
    db.queryRaw
      .mockResolvedValueOnce([{ day: "2026-11-11", source: "chatgpt-ai", visitors: raw(2), views: raw(5) }])
      .mockResolvedValueOnce([
        { source: "chatgpt-ai", current: true, visitors: raw(2), views: raw(5) },
        { source: "chatgpt-ai", current: false, visitors: raw(1), views: raw(3) },
      ])
      .mockResolvedValueOnce([
        { source: "chatgpt-ai", current: true, started: raw(3), paid: raw(1), revenue: raw(4900) },
        { source: "chatgpt-ai", current: false, started: raw(2), paid: raw(1), revenue: raw(1900) },
      ])
      .mockResolvedValueOnce([
        { current: true, paid: raw(2), revenue: raw(10000) },
        { current: false, paid: raw(1), revenue: raw(5000) },
      ])
      .mockResolvedValueOnce([{ path: "/pricing", visitors: raw(2) }])
      .mockResolvedValueOnce([{ path: "/", views: raw(5), prevViews: raw(3) }])
      .mockResolvedValueOnce([{ country: "US", visitors: raw(2) }])
      .mockResolvedValueOnce([{ device: "desktop", views: raw(5) }]);

    const result = await getTrafficOverview("7d", new Date("2026-11-17T15:30:00Z"));
    expect(result.daily[0]).toEqual({ day: "2026-11-11", visitors: 2, views: 5 });
    expect(result.dailyByGroup[0]["AI engines"]).toBe(2);
    for (const [key, values] of Object.entries({
      visitors: [2, 1], views: [5, 3], startedFilings: [3, 2], paidFilings: [1, 1],
      paidEinItin: [2, 1], revenueCents: [14900, 6900], conversion: [0.5, 1],
    })) {
      expect(result.totals[key as keyof typeof result.totals]).toMatchObject({ current: values[0], previous: values[1] });
    }
    expect(result.byGroup.find(row => row.group === "AI engines")).toEqual({ group: "AI engines", visitors: 2, prevVisitors: 1, startedFilings: 3, paidFilings: 1, conv: 0.5 });
    expect(result.aiEngines[0]).toEqual({ engine: "ChatGPT", visitors: 2, prevVisitors: 1, startedFilings: 3, paidFilings: 1 });
    expect(result.topLanding).toEqual([{ path: "/pricing", visitors: 2 }]);
    expect(result.topPages).toEqual([{ path: "/", views: 5, prevViews: 3 }]);
    expect(result.countries).toEqual([{ country: "US", visitors: 2 }]);
    expect(result.devices).toEqual([{ device: "desktop", views: 5 }]);
    // Recursively reject bigint, strings and Decimal-like objects in numeric fields.
    const checkNumbers = (value: unknown, key = "") => {
      if (["day", "source", "path", "country", "device", "group", "engine"].includes(key) || value === null) return;
      if (Array.isArray(value)) value.forEach(item => checkNumbers(item));
      else if (typeof value === "object") Object.entries(value!).forEach(([field, item]) => checkNumbers(item, field));
      else expect(typeof value).toBe("number");
    };
    checkNumbers(result);
  });

  it("issues eight bounded, parameterized aggregate queries with bot and payment safeguards", async () => {
    await getTrafficOverview("28d", new Date("2026-11-17T12:00:00Z"));
    expect(db.queryRaw).toHaveBeenCalledTimes(8);
    const sql = db.queryRaw.mock.calls.map(call => (call[0] as TemplateStringsArray).join("?"));
    for (const query of sql) {
      expect(query).toContain(">= ?");
      expect(query).toContain("< ?");
      expect(query).toContain("::int");
    }
    for (const i of [0, 1, 5, 6, 7]) {
      expect(sql[i]).toContain('p."isBot" = false AND v."isBot" = false');
    }
    expect(sql[0]).toContain('COUNT(DISTINCT p."visitorId")');
    expect(sql[0]).toContain(`date_trunc('day', p."createdAt" AT TIME ZONE 'UTC')`);
    expect(sql[2].match(/f\."linkedToFilingId" IS NULL/g)).toHaveLength(2);
    expect(sql[2]).toContain('f."paidAt" >= ?');
    expect(sql[2]).toContain('v.id IS NULL OR v."isBot" = false');
    expect(sql[2]).toContain("f.status::text IN (?)");
    const statusParameter = db.queryRaw.mock.calls[2].at(-1);
    expect(statusParameter.values).toEqual([...PAID_FILING_STATUSES]);
    expect(sql[3]).toContain('FROM "EinApplication" WHERE "paidAt" >= ?');
    expect(sql[3]).toContain('FROM "ItinApplication" WHERE "paidAt" >= ?');
    expect(sql[4]).toContain(`split_part("attrLanding", '?', 1)`);
    expect(sql[4]).toContain('"firstSeenAt" >= ?');
    for (const i of [4, 5, 6]) expect(sql[i]).toContain("LIMIT 10");
  });
});
