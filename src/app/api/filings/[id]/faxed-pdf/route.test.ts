import { beforeEach, describe, expect, it, vi } from "vitest";

// Who may download the frozen faxed PDF: exactly who may open /filings/[id].
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

const FILING = "filing_faxed";

function browser({ user, partner, session }: { user?: string; partner?: string; session?: string }) {
  jar.clear();
  if (user) jar.set("fs_user", makeUserToken(user));
  if (partner) jar.set("fs_partner", makePartnerSessionToken(partner));
  if (session) jar.set("fs_session", session);
}

const download = () =>
  GET(new Request(`http://localhost/api/filings/${FILING}/faxed-pdf`), { params: { id: FILING } });

describe("GET /api/filings/[id]/faxed-pdf — same viewers as the filing page", () => {
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
        taxYears: [2025],
        faxedAt: new Date("2026-11-20T10:00:00Z"),
        faxedPdfKey: `${FILING}_frozen.pdf`,
        signedPdfKey: `${FILING}_signed.pdf`,
      },
    ];
  });

  it("the filing's owner gets the exact faxed PDF, not the current signed copy", async () => {
    browser({ user: "user_owner" });
    const res = await download();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="Acme Holdings LLC - filed Form 5472 package - 2025.pdf"');
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(storage.getPdf).toHaveBeenCalledWith(`${FILING}_frozen.pdf`);
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([37, 80, 68, 70]));
  });

  it("the partner firm that owns the filing gets the faxed PDF", async () => {
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

  it("the owner gets 404 before faxing even with a signed and released package", async () => {
    db.state.filings[0].faxedAt = null;
    db.state.filings[0].reviewApprovedAt = new Date();
    browser({ user: "user_owner" });
    expect((await download()).status).toBe(404);
    expect(storage.getPdf).not.toHaveBeenCalled();
  });
  it("falls back to the signed PDF for faxed legacy orders without a snapshot", async () => {
    db.state.filings[0].faxedPdfKey = null;
    browser({ user: "user_owner" });
    expect((await download()).status).toBe(200);
    expect(storage.getPdf).toHaveBeenCalledWith(`${FILING}_signed.pdf`);
  });

  it("does not allow the legacy fallback before faxedAt", async () => {
    Object.assign(db.state.filings[0], { faxedPdfKey: null, faxedAt: null });
    browser({ user: "user_owner" });
    expect((await download()).status).toBe(404);
    expect(storage.getPdf).not.toHaveBeenCalled();
  });

  it("returns 404 when neither PDF exists", async () => {
    Object.assign(db.state.filings[0], { faxedPdfKey: null, signedPdfKey: null });
    browser({ user: "user_owner" });
    const res = await download();
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Filed PDF not available yet" });
    expect(storage.getPdf).not.toHaveBeenCalled();
  });

  it("sanitises the LLC name and includes all tax years in the download filename", async () => {
    Object.assign(db.state.filings[0], { llcName: 'Café A&B_/";\\\r\nLLC.pdf', taxYears: [2024, 2025] });
    browser({ user: "user_owner" });
    const res = await download();
    expect(res.headers.get("content-disposition")).toBe(
      'attachment; filename="Cafe A B_ LLC.pdf - filed Form 5472 package - 2024, 2025.pdf"',
    );
  });

  it("uses LLC for a missing company name", async () => {
    db.state.filings[0].llcName = null;
    browser({ user: "user_owner" });
    const res = await download();
    expect(res.headers.get("content-disposition")).toContain('filename="LLC - filed Form 5472 package - 2025.pdf"');
  });
});
