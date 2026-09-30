import { beforeEach, describe, expect, it, vi } from "vitest";

// Who may download the IRS fax receipt: exactly who may open /filings/[id].
// Runs the REAL session/partner-auth code against a small in-memory Prisma
// that evaluates the `where` clauses it is sent (OR, null, equality), so the
// test pins access behaviour, not query shape.

type Row = Record<string, unknown>;

const db = vi.hoisted(() => {
  const state = { users: [] as Row[], partners: [] as Row[], filings: [] as Row[] };
  function matches(row: Row, where: Row | undefined): boolean {
    if (!where) return true;
    return Object.entries(where).every(([key, cond]) => {
      if (cond === undefined) return true;
      if (key === "OR") return (cond as Row[]).some((w) => matches(row, w));
      if (key === "AND") return ([] as Row[]).concat(cond as Row).every((w) => matches(row, w));
      const value = row[key] ?? null;
      if (cond === null) return value === null;
      if (typeof cond === "object" && !(cond instanceof Date)) {
        throw new Error(`fake prisma: unsupported filter on ${key}`);
      }
      return value === cond;
    });
  }
  const prisma = {
    user: { findUnique: async ({ where }: { where: Row }) => state.users.find((u) => matches(u, where)) ?? null },
    partner: {
      findUnique: async ({ where }: { where: Row }) => state.partners.find((p) => matches(p, where)) ?? null,
    },
    filing: {
      findFirst: async ({ where }: { where: Row }) => {
        const hit = state.filings.find((f) => matches(f, where));
        return hit ? { ...hit, yearData: [] } : null;
      },
      findUnique: async ({ where }: { where: Row }) => {
        const hit = state.filings.find((f) => matches(f, where));
        return hit ? { ...hit, user: state.users.find((u) => u.id === hit.userId) ?? null } : null;
      },
      updateMany: async ({ where, data }: { where: Row; data: Row }) => {
        const hits = state.filings.filter((f) => matches(f, where));
        hits.forEach((f) => Object.assign(f, data));
        return { count: hits.length };
      },
    },
  };
  return { state, prisma };
});
const jar = vi.hoisted(() => new Map<string, string>());
const storage = vi.hoisted(() => ({ getPdf: vi.fn(async (_key: string) => new Uint8Array([37, 80, 68, 70])) }));

vi.mock("@/lib/prisma", () => ({ prisma: db.prisma }));
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: () => {},
  }),
}));
vi.mock("@/lib/storage", () => ({ getPdf: storage.getPdf }));

import { GET } from "./route";
import { makeUserToken } from "@/lib/session";
import { makePartnerSessionToken } from "@/lib/partner/auth";
import { INVITE_COOKIE, inviteCookieValue } from "@/lib/filingInvite";

const FILING = "filing_receipt";

function browser({ user, partner, session }: { user?: string; partner?: string; session?: string }) {
  jar.clear();
  if (user) jar.set("fs_user", makeUserToken(user));
  if (partner) jar.set("fs_partner", makePartnerSessionToken(partner));
  if (session) jar.set("fs_session", session);
}

const download = () =>
  GET(new Request(`http://localhost/api/filings/${FILING}/fax-receipt`), { params: { id: FILING } });

describe("GET /api/filings/[id]/fax-receipt — same viewers as the filing page", () => {
  beforeEach(() => {
    jar.clear();
    storage.getPdf.mockClear();
    db.state.users = [
      { id: "user_owner", email: "owner@x.test" },
      { id: "user_other", email: "other@x.test" },
    ];
    db.state.partners = [
      { id: "partner_owner", active: true, name: "Owning CPA", company: null },
      { id: "partner_other", active: true, name: "Other CPA", company: null },
    ];
    db.state.filings = [
      {
        id: FILING,
        userId: "user_owner",
        partnerId: "partner_owner",
        sessionId: null,
        status: "CONFIRMED",
        llcName: "Acme Holdings LLC",
        faxConfirmationKey: `${FILING}_fax_receipt.pdf`,
      },
    ];
  });

  it("the filing's owner gets the receipt PDF", async () => {
    browser({ user: "user_owner" });
    const res = await download();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain("IRS-fax-receipt-Acme_Holdings_LLC.pdf");
    expect(storage.getPdf).toHaveBeenCalledWith(`${FILING}_fax_receipt.pdf`);
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([37, 80, 68, 70]));
  });

  it("the partner firm that owns the filing gets the receipt", async () => {
    browser({ partner: "partner_owner" });
    const res = await download();
    expect(res.status).toBe(200);
    expect(storage.getPdf).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["another partner", { partner: "partner_other" }],
    ["another signed-in user", { user: "user_other" }],
    ["an anonymous visitor", {}],
    ["an anonymous browser with an unrelated session", { session: "sess_stranger" }],
  ])("%s gets 404 and nothing is read from storage", async (_label, cookies) => {
    browser(cookies);
    const res = await download();
    expect(res.status).toBe(404);
    expect(storage.getPdf).not.toHaveBeenCalled();
  });

  it("an invite link holder gets 404, as on the filing page (no wider)", async () => {
    browser({});
    jar.set(INVITE_COOKIE, inviteCookieValue(FILING, "sign", new Date(Date.now() + 60_000)));
    const res = await download();
    expect(res.status).toBe(404);
    expect(storage.getPdf).not.toHaveBeenCalled();
  });

  it("a deactivated owning partner gets 404", async () => {
    db.state.partners[0].active = false;
    browser({ partner: "partner_owner" });
    expect((await download()).status).toBe(404);
  });

  it("the owner gets 404 while no receipt has been generated", async () => {
    db.state.filings[0].faxConfirmationKey = null;
    browser({ user: "user_owner" });
    expect((await download()).status).toBe(404);
    expect(storage.getPdf).not.toHaveBeenCalled();
  });
});
