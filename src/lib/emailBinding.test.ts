import crypto from "node:crypto";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Review 2026-09-28, C2: typing an email into a draft (save-for-later, the
// Review step) links it to that email's account without proving the typist
// controls the inbox. These tests replay the attack end to end through the
// real entry points and pin the rule that defuses it:
//
//   A browser that attached an email it has not proven it owns can keep its
//   own draft, but (a) never receives anything belonging to that account and
//   (b) loses the draft the moment the proven owner (fs_user cookie) sees it
//   or opens it from elsewhere — so the owner never types into a filing it
//   can read, and no request authorised before that moment can change who the
//   filing belongs to or echo what the owner typed.
//
// Prisma is an in-memory fake that EVALUATES the `where` clauses the code
// sends (OR, AND, null, not, in, isEmpty, and undefined = "no filter" exactly
// as Prisma treats it), so these tests pin query behaviour, not query shape.
// One-shot hooks let a test land a concurrent write between two statements.

type Row = Record<string, unknown>;
type Hook = () => void | Promise<void>;

const db = vi.hoisted(() => {
  const state = {
    users: [] as Row[],
    filings: [] as Row[],
    partners: [] as Row[],
    messages: [] as Row[],
    changeLog: [] as Row[],
    emailLogs: [] as Row[],
    seq: 0,
  };
  // One-shot interleaving hooks, keyed "model.method", run BEFORE that call.
  const hooks: Record<string, Hook | undefined> = {};
  async function fire(key: string) {
    const hook = hooks[key];
    hooks[key] = undefined;
    if (hook) await hook();
  }

  function matches(row: Row, where: Row | undefined): boolean {
    if (!where) return true;
    return Object.entries(where).every(([key, cond]) => {
      if (cond === undefined) return true;
      if (key === "OR") return (cond as Row[]).some((w) => matches(row, w));
      if (key === "AND") return ([] as Row[]).concat(cond as Row).every((w) => matches(row, w));
      const value = row[key] ?? null;
      if (cond === null) return value === null;
      if (typeof cond === "object" && !(cond instanceof Date) && !Array.isArray(cond)) {
        return Object.entries(cond as Row).every(([op, arg]) => {
          if (arg === undefined) return true;
          switch (op) {
            case "equals":
              return value === arg;
            case "not":
              return value !== null && (arg === null || value !== arg);
            case "lte":
              return value !== null && (value as Date) <= (arg as Date);
            case "in":
              return (arg as unknown[]).includes(value);
            case "isEmpty":
              return ((value as unknown[] | null) ?? []).length === 0 === arg;
            default:
              throw new Error(`fake prisma: unsupported operator "${op}" on ${key}`);
          }
        });
      }
      return value === cond;
    });
  }

  function sorted(rows: Row[], orderBy?: Record<string, "asc" | "desc">): Row[] {
    if (!orderBy) return rows;
    const [[field, dir]] = Object.entries(orderBy);
    const t = (r: Row) => ((r[field] as Date | null)?.getTime() ?? -Infinity);
    return [...rows].sort((a, b) => (dir === "desc" ? t(b) - t(a) : t(a) - t(b)));
  }

  // Projections are ignored (full rows come back) EXCEPT relations, which are
  // attached when include/select asks for them.
  const project = (row: Row, args?: { include?: Row; select?: Row }) => {
    const out: Row = { ...row };
    if (args?.include?.user || args?.select?.user) out.user = state.users.find((u) => u.id === row.userId) ?? null;
    if (args?.include?.yearData || args?.select?.yearData) out.yearData = [];
    return out;
  };

  const tick = () => new Date(Date.UTC(2026, 8, 1) + ++state.seq * 1000);

  // Columns a real row always has; the routes read several of them.
  const filingDefaults = (): Row => ({
    sessionId: null,
    userId: null,
    partnerId: null,
    inviteExpiresAt: null,
    status: "DRAFT",
    tier: "standard",
    llcName: null, llcEin: null, llcAddress: null, llcCity: null, llcZip: null,
    llcBusinessActivity: null, ownerName: null, ownerAddress: null,
    amountPaid: 0,
    taxYears: [],
    extensionTaxYears: [],
    isDiirsp: false,
    isFinalReturn: false,
    dissolvedAt: null,
    llcDateIncorporated: null,
    extensionFiled: null,
    extensionTransmittedAt: null,
    extensionMethod: null,
    extensionDestination: null,
    extensionProofKey: null,
    marketingConsent: false,
    funnelSource: null,
  });

  const prisma = {
    rateLimit: { upsert: async () => ({ count: 1 }) },
    einApplication: { findMany: async () => [] },
    itinApplication: { findMany: async () => [] },
    emailLog: {
      updateMany: async ({ where, data }: { where: Row; data: Row }) => {
        const hits = state.emailLogs.filter((x) => matches(x, where));
        hits.forEach((x) => Object.assign(x, data));
        return { count: hits.length };
      },
    },
    user: {
      findUnique: async ({ where }: { where: Row }) => {
        const u = state.users.find((x) => matches(x, where));
        return u ? { ...u } : null;
      },
      upsert: async ({ where, create }: { where: Row; create: Row }) => {
        await fire("user.upsert");
        const found = state.users.find((x) => matches(x, where));
        if (found) return { ...found };
        const u = { id: `user_${++state.seq}`, createdAt: tick(), ...create };
        state.users.push(u);
        return { ...u };
      },
    },
    partner: {
      findUnique: async ({ where }: { where: Row }) => {
        const p = state.partners.find((x) => matches(x, where));
        return p ? { ...p } : null;
      },
    },
    filing: {
      count: async ({ where }: { where: Row }) => state.filings.filter((x) => matches(x, where)).length,
      findFirst: async (args: { where?: Row; orderBy?: Record<string, "asc" | "desc"> }) => {
        const hit = sorted(state.filings.filter((f) => matches(f, args.where)), args.orderBy)[0];
        return hit ? project(hit, args as Row) : null;
      },
      findUnique: async (args: { where: Row; include?: Row; select?: Row }) => {
        await fire("filing.findUnique");
        const hit = state.filings.find((f) => matches(f, args.where));
        return hit ? project(hit, args) : null;
      },
      findMany: async (args: { where?: Row; orderBy?: Record<string, "asc" | "desc">; include?: Row; select?: Row }) => {
        await fire("filing.findMany");
        return sorted(state.filings.filter((f) => matches(f, args.where)), args.orderBy).map((f) => project(f, args));
      },
      create: async ({ data }: { data: Row }) => {
        const now = tick();
        const f: Row = { id: `filing_${++state.seq}`, ...filingDefaults(), createdAt: now, updatedAt: now, ...data };
        state.filings.push(f);
        return { ...f };
      },
      update: async ({ where, data }: { where: Row; data: Row }) => {
        await fire("filing.update");
        const f = state.filings.find((x) => matches(x, where));
        if (!f) throw new Error("fake prisma: record to update not found");
        Object.assign(f, data, { updatedAt: tick() });
        return { ...f };
      },
      updateMany: async ({ where, data }: { where: Row; data: Row }) => {
        await fire("filing.updateMany");
        const hits = state.filings.filter((x) => matches(x, where));
        for (const f of hits) Object.assign(f, data, { updatedAt: tick() });
        return { count: hits.length };
      },
    },
    message: {
      create: async ({ data }: { data: Row }) => {
        const m = { id: `msg_${++state.seq}`, readAt: null, createdAt: tick(), ...data };
        state.messages.push(m);
        return { ...m };
      },
      findMany: async (args: { where?: Row; orderBy?: Record<string, "asc" | "desc"> }) =>
        sorted(state.messages.filter((m) => matches(m, args.where)), args.orderBy).map((m) => ({ ...m })),
      updateMany: async ({ where, data }: { where: Row; data: Row }) => {
        const hits = state.messages.filter((m) => matches(m, where));
        for (const m of hits) Object.assign(m, data);
        return { count: hits.length };
      },
      groupBy: async ({ where }: { where: Row }) => {
        const counts = new Map<unknown, number>();
        for (const m of state.messages.filter((x) => matches(x, where))) {
          counts.set(m.filingId, (counts.get(m.filingId) ?? 0) + 1);
        }
        return Array.from(counts).map(([filingId, n]) => ({ filingId, _count: { _all: n } }));
      },
    },
    filingChangeLog: {
      create: async ({ data }: { data: Row }) => {
        state.changeLog.push({ id: `log_${++state.seq}`, ...data });
        return {};
      },
    },
    $transaction: async (arg: unknown): Promise<unknown> =>
      typeof arg === "function" ? (arg as (tx: unknown) => Promise<unknown>)(prisma) : Promise.all(arg as unknown[]),
  };

  return { state, hooks, prisma };
});

const jar = vi.hoisted(() => new Map<string, string>());
const storage = vi.hoisted(() => ({ get: async (_key: string) => new Uint8Array([137, 80, 78, 71]) }));
const stripeCreate = vi.hoisted(() => vi.fn(async () => ({ id: "checkout_1", url: "http://localhost/pay" })));
vi.mock("@/lib/stripe", () => ({ stripe: () => ({ checkout: { sessions: { create: stripeCreate } } }) }));
// Completeness/payment providers are unrelated to authority; exercise the real
// checkout route and binding with all external services replaced.
vi.mock("@/lib/completeness", () => ({ filingCompletionIssues: () => [], requiresReasonableCause: () => false }));
const sendResumeEmail = vi.hoisted(() => vi.fn(async () => {}));
const google = vi.hoisted(() => ({ email: "" }));

vi.mock("@/lib/prisma", () => ({ prisma: db.prisma }));
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (opts: { name: string; value: string; maxAge?: number }) => {
      if (opts.maxAge === 0) jar.delete(opts.name);
      else jar.set(opts.name, opts.value);
    },
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
vi.mock("@/lib/storage", () => ({ get: (key: string) => storage.get(key), makeKey: () => "k", put: async () => "k" }));
vi.mock("@/app/(app)/filings/[id]/sign/SignClient", () => ({ SignClient: () => null }));
vi.mock("@/components/wizard-v3/FilingWizardV3", () => ({ FilingWizardV3: () => null }));
vi.mock("@/app/(app)/dashboard/DashboardRow", () => ({ DashboardRow: () => null }));
vi.mock("@/components/FilingLocked", () => ({ FilingLocked: () => null }));
vi.mock("@/lib/admin/auth", () => ({ isAdmin: async () => false }));
vi.mock("@/lib/email", () => ({ sendNewMessageToAdminEmail: async () => {}, sendResumeFilingEmail: sendResumeEmail }));
vi.mock("@/lib/messages", () => ({ FilingNotFoundError: class extends Error {}, postAdminMessage: async () => {} }));
vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    async verifyIdToken() {
      return { getPayload: () => ({ email: google.email }) };
    }
  },
}));

import {
  bindFilingToEmail,
  FilingAccessLostError,
  getFilingAccess,
  getOwnedFiling,
  makeUserToken,
} from "@/lib/session";
import { consumeFilingInvite, inviteCookieValue, INVITE_COOKIE } from "@/lib/filingInvite";
import { POST as checkout } from "@/app/api/checkout/route";
import { makePartnerSessionToken } from "@/lib/partner/auth";
import { findOrCreateDraftFiling } from "@/lib/findOrCreateDraft";
import { GET as listFilings, POST as createFiling } from "@/app/api/filings/route";
import { GET as getFiling, PATCH as patchFiling } from "@/app/api/filings/[id]/route";
import { GET as createPartnerDraft } from "@/app/partner/filings/new/route";
import { POST as clientLink } from "@/app/api/partner/filings/[id]/client-link/route";
import { POST as saveForLater } from "@/app/api/filings/[id]/save-for-later/route";
import { POST as bindEmail } from "@/app/api/filings/[id]/bind-email/route";
import { GET as getMessages } from "@/app/api/filings/[id]/messages/route";
import { POST as googleSignIn } from "@/app/api/auth/google/route";
import { POST as resendWebhook } from "@/app/api/resend-webhook/route";
import SignFilingPage from "@/app/(app)/filings/[id]/sign/page";
import EditFilingPage from "@/app/(app)/filings/[id]/edit/page";
import DashboardPage from "@/app/(app)/dashboard/page";

const VICTIM_EMAIL = "victim@example.com";
const VICTIM_ID = "user_victim";
const ATTACKER_BROWSER = "sess_attacker";
const VICTIM_BROWSER = "sess_victim";

// Which cookies the next request carries. `user` is the fs_user cookie the
// magic-link / Google sign-in issues — i.e. proven control of the inbox.
function browser({ session, user, partner }: { session?: string; user?: string; partner?: string }) {
  jar.clear();
  if (session) jar.set("fs_session", session);
  if (user) jar.set("fs_user", makeUserToken(user));
  if (partner) jar.set("fs_partner", makePartnerSessionToken(partner));
}

function row(id: string): Row {
  const f = db.state.filings.find((x) => x.id === id);
  if (!f) throw new Error(`no filing ${id}`);
  return f;
}

const userIdFor = (email: string) => db.state.users.find((u) => u.email === email)?.id as string;

const jsonRequest = (url: string, method: string, payload: unknown) =>
  new Request(url, { method, body: JSON.stringify(payload) });

// A request whose body arrives only when the test says so — a client that
// trickles its body in after the route has started.
function slowRequest(url: string, method: string, payload: unknown) {
  let push!: () => void;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      push = () => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(payload)));
        controller.close();
      };
    },
  });
  const req = new Request(url, { method, body, duplex: "half" } as RequestInit);
  return { req, release: () => push() };
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 25));

async function startDraftViaApi(): Promise<string> {
  const res = await createFiling(jsonRequest("http://localhost/api/filings", "POST", {}));
  expect(res.status).toBe(200);
  return ((await res.json()) as { id: string }).id;
}

async function bindViaApi(filingId: string, email: string) {
  return bindEmail(jsonRequest(`http://localhost/api/filings/${filingId}/bind-email`, "POST", { email }), {
    params: { id: filingId },
  });
}

// The attack: an anonymous browser starts a draft and types the victim's
// email at the save-for-later step. No inbox access needed.
async function plantDraftOnVictim(): Promise<string> {
  browser({ session: ATTACKER_BROWSER });
  const id = await startDraftViaApi();
  expect((await bindViaApi(id, VICTIM_EMAIL)).status).toBe(200);
  expect(row(id)).toMatchObject({ userId: VICTIM_ID, sessionId: ATTACKER_BROWSER });
  return id;
}

// The victim, signed in from their own browser, opens the filing and types.
async function victimTakesOverAndTypes(id: string) {
  browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
  expect((await getFilingAccess(id)).kind).toBe("owned");
  Object.assign(row(id), { llcEin: "98-7654321", ownerFtin: "VICTIM-FTIN-001" });
}

async function renderSignPage(id: string) {
  return (await SignFilingPage({ params: { id } })) as unknown as {
    props: { priorSignatureDataUrl?: string | null };
  };
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID = "test-client";
  process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
});

beforeEach(() => {
  vi.restoreAllMocks();
  stripeCreate.mockClear();
  sendResumeEmail.mockClear();
  jar.clear();
  for (const k of Object.keys(db.hooks)) db.hooks[k] = undefined;
  db.state.users.length = 0;
  db.state.filings.length = 0;
  db.state.partners.length = 0;
  db.state.messages.length = 0;
  db.state.changeLog.length = 0;
  db.state.emailLogs.length = 0;
  db.state.seq = 0;
  // A real, returning customer: one completed filing, signed in-portal.
  db.state.users.push({ id: VICTIM_ID, email: VICTIM_EMAIL, createdAt: new Date("2025-03-01") });
  db.state.filings.push({
    id: "filing_victim_2024",
    userId: VICTIM_ID,
    sessionId: null,
    status: "CONFIRMED",
    tier: "standard",
    taxYears: [2024],
    llcName: "Victim Holdings LLC",
    llcEin: "98-7654321",
    ownerName: "Vic Tim",
    ownerFtin: "VICTIM-FTIN-001",
    ownerItin: "900-70-1234",
    ownerAddress: "42 Victim Street",
    signaturePngKey: "signatures/victim.png",
    signedAt: new Date("2025-04-01"),
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-04-02"),
  });
});

describe("C2 (a): the sign page never serves another account's saved signature", () => {
  async function plantPaidFiling(): Promise<string> {
    const id = await plantDraftOnVictim();
    // The attacker pays for their own planted filing; the package is generated.
    Object.assign(row(id), { status: "PDF_GENERATED", reviewApprovedAt: new Date(), generatedPdfKey: `pdf/${id}.pdf`, taxYears: [2025] });
    return id;
  }

  it("does not return the prior signature to the anonymous browser holding the filing", async () => {
    const id = await plantPaidFiling();
    const spy = vi.spyOn(storage, "get");

    browser({ session: ATTACKER_BROWSER });
    const page = await renderSignPage(id);

    expect(page.props.priorSignatureDataUrl).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("does not return it to a browser signed in as a DIFFERENT account either", async () => {
    const id = await plantPaidFiling();
    db.state.users.push({ id: "user_attacker", email: "attacker@example.com", createdAt: new Date() });
    const spy = vi.spyOn(storage, "get");

    browser({ session: ATTACKER_BROWSER, user: "user_attacker" });
    const page = await renderSignPage(id);

    expect(page.props.priorSignatureDataUrl).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("still pre-fills it for the signed-in account owner (returning-customer convenience)", async () => {
    const id = await plantPaidFiling();

    browser({ user: VICTIM_ID });
    const page = await renderSignPage(id);

    expect(page.props.priorSignatureDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(row(id).sessionId).toBeNull();
  });
});

describe("C2 (b): a planted draft is never handed back to the account owner", () => {
  it("findOrCreateDraftFiling does not reuse a draft another browser still holds", async () => {
    const planted = await plantDraftOnVictim();

    const { filing, reused } = await findOrCreateDraftFiling({ sessionId: VICTIM_BROWSER, userId: VICTIM_ID });

    expect(reused).toBe(false);
    expect(filing.id).not.toBe(planted);
  });

  it("POST /api/filings does not copy the owner's EIN/FTIN into the planted draft", async () => {
    const planted = await plantDraftOnVictim();

    // Victim, signed in, starts a new filing (/start, file-again reminder).
    browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
    const created = await startDraftViaApi();

    // The attacker reads their planted draft: none of the victim's tax IDs.
    browser({ session: ATTACKER_BROWSER });
    const seen = await getOwnedFiling(planted);
    expect(seen?.id).toBe(planted);
    expect({ ownerFtin: seen?.ownerFtin ?? null, ownerItin: seen?.ownerItin ?? null, llcEin: seen?.llcEin ?? null }).toEqual({
      ownerFtin: null,
      ownerItin: null,
      llcEin: null,
    });

    // Returning-customer prefill still works — on a draft only they can read.
    expect(created).not.toBe(planted);
    expect(row(created)).toMatchObject({ llcEin: "98-7654321", ownerFtin: "VICTIM-FTIN-001", ownerItin: "900-70-1234" });
  });

  it("a signed-in visitor never reuses a same-browser draft linked to a different account", async () => {
    // Shared computer: someone else's saved draft is still in this browser.
    browser({ session: VICTIM_BROWSER });
    const theirs = await startDraftViaApi();
    await bindViaApi(theirs, "someone.else@example.com");

    const { filing, reused } = await findOrCreateDraftFiling({ sessionId: VICTIM_BROWSER, userId: VICTIM_ID });

    expect(reused).toBe(false);
    expect(filing.id).not.toBe(theirs);
  });

  it("still reuses the owner's own untouched drafts (no dashboard pile-up)", async () => {
    browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
    const first = await findOrCreateDraftFiling({ sessionId: VICTIM_BROWSER, userId: VICTIM_ID });
    const again = await findOrCreateDraftFiling({ sessionId: VICTIM_BROWSER, userId: VICTIM_ID });
    expect(first.reused).toBe(false);
    expect(again).toMatchObject({ reused: true, filing: { id: first.filing.id } });

    // Same account, other device, draft no browser holds any more → reused.
    row(first.filing.id).sessionId = null;
    const elsewhere = await findOrCreateDraftFiling({ sessionId: "sess_laptop", userId: VICTIM_ID });
    expect(elsewhere).toMatchObject({ reused: true, filing: { id: first.filing.id } });

    // The same account match ceases to be safe if a different browser holds it.
    row(first.filing.id).sessionId = ATTACKER_BROWSER;
    expect((await findOrCreateDraftFiling({ sessionId: VICTIM_BROWSER, userId: VICTIM_ID })).reused).toBe(false);
  });

  it("Google sign-in (start) does not drop the owner into the planted draft or write their consent onto it", async () => {
    const planted = await plantDraftOnVictim();

    browser({ session: VICTIM_BROWSER });
    google.email = VICTIM_EMAIL;
    const res = await googleSignIn(
      jsonRequest("http://localhost/api/auth/google", "POST", {
        credential: "google-jwt",
        intent: "start",
        marketingConsent: true,
      }),
    );
    const { filingId } = (await res.json()) as { filingId: string };

    expect(filingId).not.toBe(planted);
    expect(row(planted).marketingConsent).toBe(false);
    // This app sends returning customers without a safe draft to their list.
    expect(filingId).toBeNull();
  });

  it("Google sign-in (start) still reuses the owner's own untouched draft", async () => {
    browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
    const own = await startDraftViaApi();

    google.email = VICTIM_EMAIL;
    const res = await googleSignIn(
      jsonRequest("http://localhost/api/auth/google", "POST", { credential: "google-jwt", intent: "start" }),
    );
    expect(((await res.json()) as { filingId: string }).filingId).toBe(own);
    const opened = await getFiling(new Request("http://localhost/api/filings/" + own), { params: { id: own } });
    expect(opened.status).toBe(200);
    expect(await opened.text()).not.toContain("sessionId");
  });
});

describe("C2 (b): the proven owner opening a filing locks out the browser that typed the email", () => {
  it("the anonymous holder can read the planted draft only until the owner opens it", async () => {
    const planted = await plantDraftOnVictim();

    browser({ session: ATTACKER_BROWSER });
    expect((await getOwnedFiling(planted))?.id).toBe(planted);

    await victimTakesOverAndTypes(planted);

    browser({ session: ATTACKER_BROWSER });
    expect(await getOwnedFiling(planted)).toBeNull();
    expect(await getFilingAccess(planted)).toMatchObject({ kind: "locked" });
  });

  it("the owner's first API call (not just a page view) also evicts the holder", async () => {
    const planted = await plantDraftOnVictim();

    browser({ user: VICTIM_ID }); // no fs_session cookie at all
    const owned = await getOwnedFiling(planted);
    expect(owned?.sessionId).toBeNull();
    expect(row(planted).sessionId).toBeNull();
  });

  it("the owner's dashboard takes over every linked filing before listing them", async () => {
    const planted = await plantDraftOnVictim();

    browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
    await DashboardPage();

    browser({ session: ATTACKER_BROWSER });
    expect(await getOwnedFiling(planted)).toBeNull();
  });

  it("the owner's GET /api/filings list takes over every linked filing before returning them", async () => {
    const planted = await plantDraftOnVictim();

    browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
    const res = await listFilings();
    expect(((await res.json()) as Row[]).map((f) => f.id)).toContain(planted);

    browser({ session: ATTACKER_BROWSER });
    expect(await getOwnedFiling(planted)).toBeNull();
  });
});

describe("C2 follow-up: nothing authorised before the takeover outlives it", () => {
  it("an eviction that changed no row is never reported as a takeover", async () => {
    const planted = await plantDraftOnVictim();
    // Between the owner's read and the owner's eviction write, the holder's
    // re-bind to one of its own accounts lands.
    db.hooks["filing.updateMany"] = () => {
      row(planted).userId = "user_attacker_alt";
    };

    browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
    expect(await getOwnedFiling(planted)).toBeNull();
    expect(row(planted)).toMatchObject({ userId: "user_attacker_alt", sessionId: ATTACKER_BROWSER });
  });

  it("two concurrent owner requests both get the filing (one evicts, the other re-reads)", async () => {
    const planted = await plantDraftOnVictim();
    db.hooks["filing.updateMany"] = () => {
      row(planted).sessionId = null; // the owner's other tab evicted first
    };

    browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
    expect(await getOwnedFiling(planted)).toMatchObject({ id: planted, sessionId: null });
  });

  it("bind-email: a request still sending its body when the owner takes over cannot re-link the filing", async () => {
    const planted = await plantDraftOnVictim();

    browser({ session: ATTACKER_BROWSER });
    const slow = slowRequest(`http://localhost/api/filings/${planted}/bind-email`, "POST", {
      email: "attacker@example.com",
    });
    const pending = bindEmail(slow.req, { params: { id: planted } });
    await settle();

    await victimTakesOverAndTypes(planted);

    browser({ session: ATTACKER_BROWSER });
    slow.release();
    expect((await pending).status).toBe(404);
    expect(row(planted).userId).toBe(VICTIM_ID);

    // The attacker signing in to its own account still cannot read it.
    const attackerAccount = userIdFor("attacker@example.com");
    if (attackerAccount) {
      browser({ session: ATTACKER_BROWSER, user: attackerAccount });
      expect(await getOwnedFiling(planted)).toBeNull();
    }
  });

  it("bindFilingToEmail re-checks the caller's hold at write time (PATCH/checkout path)", async () => {
    const planted = await plantDraftOnVictim();
    // Authorised a moment ago; the owner's takeover lands before the write.
    db.hooks["user.upsert"] = () => {
      row(planted).sessionId = null;
    };

    browser({ session: ATTACKER_BROWSER });
    await expect(bindFilingToEmail(planted, "attacker@example.com")).rejects.toBeInstanceOf(FilingAccessLostError);
    expect(row(planted).userId).toBe(VICTIM_ID);
  });

  it("PATCH: a save still sending its body when the owner takes over does not echo the owner's data", async () => {
    const planted = await plantDraftOnVictim();

    browser({ session: ATTACKER_BROWSER });
    const slow = slowRequest(`http://localhost/api/filings/${planted}`, "PATCH", { llcName: "Attacker Co" });
    const pending = patchFiling(slow.req, { params: { id: planted } });
    await settle();

    await victimTakesOverAndTypes(planted);

    browser({ session: ATTACKER_BROWSER });
    slow.release();
    const res = await pending;
    const text = await res.text();
    expect(text).not.toContain("VICTIM-FTIN-001");
    expect(text).not.toContain("98-7654321");
    expect(res.status).toBe(404);
  });

  it("partner route binding still works for the partner that owns the filing — and only for it", async () => {
    db.state.partners.push({ id: "partner_1", active: true });
    db.state.filings.push({
      id: "filing_partner",
      partnerId: "partner_1",
      userId: null,
      sessionId: null,
      status: "PDF_GENERATED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    browser({ partner: "partner_1" });
    const client = await bindFilingToEmail("filing_partner", "client@example.com");
    expect(row("filing_partner").userId).toBe(client.id);

    browser({ session: ATTACKER_BROWSER });
    await expect(bindFilingToEmail("filing_partner", "attacker@example.com")).rejects.toBeInstanceOf(
      FilingAccessLostError,
    );
  });
});

describe("C2 follow-up: the anonymous session credential never reaches a browser", () => {
  const leaks = (value: unknown) => {
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.includes(ATTACKER_BROWSER) || text.includes('"sessionId"');
  };

  it("GET /api/filings (the owner's list) omits sessionId", async () => {
    await plantDraftOnVictim();
    // Make the list include a filing whose hold survives: the owner's own
    // same-browser draft.
    browser({ session: VICTIM_BROWSER, user: VICTIM_ID });
    await startDraftViaApi();

    const text = await (await listFilings()).text();
    expect(text.includes(VICTIM_BROWSER) || text.includes('"sessionId"')).toBe(false);
    expect(leaks(text)).toBe(false);
  });

  it("GET /api/filings/[id] omits sessionId", async () => {
    const id = await plantDraftOnVictim();
    browser({ session: ATTACKER_BROWSER });
    const res = await getFiling(new Request(`http://localhost/api/filings/${id}`), { params: { id } });
    expect(res.status).toBe(200);
    expect(leaks(await res.text())).toBe(false);
  });

  it("PATCH /api/filings/[id] response omits sessionId", async () => {
    const id = await plantDraftOnVictim();
    browser({ session: ATTACKER_BROWSER });
    const res = await patchFiling(jsonRequest(`http://localhost/api/filings/${id}`, "PATCH", { llcName: "Acme LLC" }), {
      params: { id },
    });
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).toContain("Acme LLC");
    expect(leaks(text)).toBe(false);
  });

  it("the edit page does not put sessionId in the wizard's client props", async () => {
    const id = await plantDraftOnVictim();
    Object.assign(db.state.users.find((u) => u.id === VICTIM_ID)!, { emailMarketingOptOut: true });
    Object.assign(row(id), {
      inviteEmail: "invitee@example.com", inviteTokenHash: "private-invite-hash", stripeSessionId: "private-stripe-session",
    });
    browser({ session: ATTACKER_BROWSER });
    const page = (await EditFilingPage({ params: { id } })) as unknown as { props: Row };
    const props = (page.props.children as Array<{ props: Row }>)[1].props;
    expect((props.filing as Row).id).toBe(id);
    expect(props.defaultEmail).toBe(VICTIM_EMAIL);
    expect((props.filing as Row).email).toBe(VICTIM_EMAIL);
    expect(leaks(page.props)).toBe(false);
    for (const field of ["user", "createdAt", "emailMarketingOptOut", "inviteEmail", "inviteTokenHash", "stripeSessionId"]) {
      expect(JSON.stringify(props)).not.toContain(`"${field}":`);
    }
  });
});

describe("C2 follow-up: account-wide email events stay out of customer-readable messages", () => {
  it("a bounce for the victim's address is admin-log only; the holder of a planted filing never sees it", async () => {
    const planted = await plantDraftOnVictim();

    db.state.emailLogs.push({ id: "log_1", resendId: "em_1", filingId: "filing_victim_2024", status: "sent" });
    const body = JSON.stringify({
      type: "email.bounced", created_at: "2026-09-29T00:00:00Z",
      data: { email_id: "em_1", to: [VICTIM_EMAIL], bounce: { type: "Permanent" } },
    });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = crypto.createHmac("sha256", Buffer.from("test", "base64"))
      .update(`event_1.${timestamp}.${body}`).digest("base64");
    const res = await resendWebhook(new Request("http://localhost/api/resend-webhook", {
      method: "POST", body, headers: {
        "svix-id": "event_1", "svix-timestamp": timestamp, "svix-signature": `v1,${signature}`,
      },
    }));
    expect(res.status).toBe(200);

    browser({ session: ATTACKER_BROWSER });
    const msgs = await getMessages(new Request(`http://localhost/api/filings/${planted}/messages?as=customer`), {
      params: { id: planted },
    });
    expect(msgs.status).toBe(200);
    const text = await msgs.text();
    expect(text).not.toContain("bounced");
    expect(text).not.toContain(VICTIM_EMAIL);

    // The newer webhook already keeps this in the admin-only EmailLog,
    // linked to the actual sent email, not every filing with that address.
    expect(db.state.messages).toHaveLength(0);
    expect(db.state.emailLogs[0]).toMatchObject({ status: "bounced", error: "Permanent" });
  });
});

describe("legitimate flows keep working", () => {
  it("save-for-later → same browser continues through Review → checkout", async () => {
    browser({ session: "sess_customer" });
    const id = await startDraftViaApi();
    expect((await bindViaApi(id, " Customer@Example.com ")).status).toBe(200);

    // Every later wizard / checkout request authorises through getOwnedFiling.
    expect((await getOwnedFiling(id))?.id).toBe(id);
    // Review step re-sends the (already bound) email, then saves a field.
    expect((await bindViaApi(id, "customer@example.com")).status).toBe(200);
    const res = await patchFiling(
      jsonRequest(`http://localhost/api/filings/${id}`, "PATCH", { email: "customer@example.com", llcName: "Acme LLC" }),
      { params: { id } },
    );
    expect(res.status).toBe(200);
    expect(await res.text()).not.toContain("sessionId");
    expect((await getFilingAccess(id)).kind).toBe("owned");
    expect((await checkout(jsonRequest("http://localhost/api/checkout", "POST", {
      filingId: id, email: "customer@example.com",
    }))).status).toBe(200);
    expect(stripeCreate).toHaveBeenCalledOnce();
  });

  it("save-for-later → emailed link → resume, in the same browser", async () => {
    browser({ session: "sess_customer" });
    const id = await startDraftViaApi();
    await bindViaApi(id, "customer@example.com");
    const customer = userIdFor("customer@example.com");

    // Link clicked in the browser that started: nothing changes, even after
    // the dashboard (where the reminder link lands) lists it.
    browser({ session: "sess_customer", user: customer });
    await DashboardPage();
    expect((await getFilingAccess(id)).kind).toBe("owned");
    expect(row(id).sessionId).toBe("sess_customer");
    expect(await (await listFilings()).text()).not.toContain("sessionId");

    browser({ session: "sess_customer" }); // fs_user expired/cleared later
    expect((await getFilingAccess(id)).kind).toBe("owned");
  });

  it("save-for-later → emailed link → resume on another device; the first browser must sign in", async () => {
    browser({ session: "sess_desktop" });
    const id = await startDraftViaApi();
    await bindViaApi(id, "customer@example.com");
    const customer = userIdFor("customer@example.com");

    // Reminder email's magic link opened on the phone → /dashboard → filing.
    browser({ session: "sess_phone", user: customer });
    await DashboardPage();
    expect((await getFilingAccess(id)).kind).toBe("owned");
    expect(await findOrCreateDraftFiling({ sessionId: "sess_phone", userId: customer })).toMatchObject({
      reused: true,
      filing: { id },
    });

    // BEHAVIOUR CHANGE: back on the desktop without signing in → "Sign in to
    // continue your filing" (FilingLocked); signing in there restores it.
    browser({ session: "sess_desktop" });
    expect((await getFilingAccess(id)).kind).toBe("locked");
    browser({ session: "sess_desktop", user: customer });
    expect((await getFilingAccess(id)).kind).toBe("owned");
  });
});


describe("form5472prep independent partner and invite grants", () => {
  function invite(id: string, scope: "edit" | "sign", expired = false) {
    jar.set(INVITE_COOKIE, inviteCookieValue(id, scope, new Date(Date.now() + (expired ? -1 : 60_000))));
  }

  it("owner takeover drops only the anonymous cookie; the owning partner can still edit and bind", async () => {
    const id = await plantDraftOnVictim();
    db.state.partners.push({ id: "partner_1", active: true, name: "Advisor" });
    row(id).partnerId = "partner_1";
    await victimTakesOverAndTypes(id);
    expect(row(id).sessionId).toBeNull();
    browser({ partner: "partner_1", session: ATTACKER_BROWSER });
    const res = await patchFiling(jsonRequest("http://localhost/api/filings/" + id, "PATCH", {
      email: VICTIM_EMAIL, llcName: "Partner edit",
    }), { params: { id } });
    expect(res.status).toBe(200);
    expect(await res.text()).not.toContain("sessionId");
    browser({ partner: "unrelated_partner" });
    expect(await getOwnedFiling(id)).toBeNull();
  });

  it("an owning partner arriving from another browser evicts an unverified holder before returning data", async () => {
    const id = await plantDraftOnVictim();
    db.state.partners.push({ id: "partner_1", active: true });
    row(id).partnerId = "partner_1";
    browser({ partner: "partner_1" });
    expect(await getOwnedFiling(id)).toMatchObject({ id, sessionId: null });
    browser({ session: ATTACKER_BROWSER });
    expect(await getOwnedFiling(id)).toBeNull();
  });

  it("a valid edit invite survives owner takeover, including PATCH email binding and its response recheck", async () => {
    const id = await plantDraftOnVictim();
    await victimTakesOverAndTypes(id);
    expect(row(id).sessionId).toBeNull();
    browser({});
    invite(id, "edit");
    expect((await getFilingAccess(id, "edit")).kind).toBe("owned");
    const res = await patchFiling(jsonRequest("http://localhost/api/filings/" + id, "PATCH", {
      email: VICTIM_EMAIL, llcName: "Invited edit",
    }), { params: { id } });
    expect(res.status).toBe(200);
    expect(await res.text()).not.toContain("sessionId");
    // Sign-only, expired, wrong-filing and unscoped requests gain no edit grant.
    for (const [target, scope, expired] of [
      [id, "sign", false], [id, "edit", true], ["another_filing", "edit", false],
    ] as const) {
      invite(target, scope, expired);
      expect(await getOwnedFiling(id, "edit")).toBeNull();
      await expect(bindFilingToEmail(id, "attacker@example.com", "edit")).rejects.toBeInstanceOf(FilingAccessLostError);
    }
    invite(id, "edit");
    expect(await getOwnedFiling(id)).toBeNull();
    expect((await bindViaApi(id, VICTIM_EMAIL)).status).toBe(404);
  });

  it("a valid edit invite evicts a foreign anonymous hold before allowing edits", async () => {
    const id = await plantDraftOnVictim();
    browser({});
    invite(id, "edit");
    expect(await getOwnedFiling(id, "edit")).toMatchObject({ id, sessionId: null });
    browser({ session: ATTACKER_BROWSER });
    expect(await getOwnedFiling(id)).toBeNull();
  });

  it("a sign invite survives owner takeover without exposing a prior account signature or granting edits", async () => {
    const id = await plantDraftOnVictim();
    Object.assign(row(id), { status: "PDF_GENERATED", generatedPdfKey: "pdf/test", reviewApprovedAt: new Date() });
    await victimTakesOverAndTypes(id);
    expect(row(id).sessionId).toBeNull();
    browser({});
    invite(id, "sign");
    const page = await renderSignPage(id);
    expect(page.props.priorSignatureDataUrl).toBeNull();
    expect(await getOwnedFiling(id, "edit")).toBeNull();
    expect((await getFilingAccess(id, "sign")).kind).toBe("owned");
  });

  it("an expired edit invite at bind time cannot rebind the account", async () => {
    const id = await plantDraftOnVictim();
    browser({});
    invite(id, "edit");
    expect(await getOwnedFiling(id, "edit")).not.toBeNull();
    db.hooks["user.upsert"] = () => invite(id, "edit", true);
    await expect(bindFilingToEmail(id, "attacker@example.com", "edit")).rejects.toBeInstanceOf(FilingAccessLostError);
    expect(row(id).userId).toBe(VICTIM_ID);
  });
});

describe("additional response races", () => {
  it("the edit page does not serialize a row fetched after takeover", async () => {
    const id = await plantDraftOnVictim();
    db.hooks["filing.findUnique"] = () => {
      Object.assign(row(id), { sessionId: null, ownerFtin: "VICTIM-FTIN-001" });
    };
    const page = await EditFilingPage({ params: { id } });
    expect(JSON.stringify(page)).not.toContain("VICTIM-FTIN-001");
    expect(JSON.stringify(page)).not.toContain('"filing":');
  });

  it("single GET does not echo a row fetched after takeover", async () => {
    const id = await plantDraftOnVictim();
    db.hooks["filing.findUnique"] = () => {
      Object.assign(row(id), { sessionId: null, ownerFtin: "VICTIM-FTIN-001" });
    };
    const res = await getFiling(new Request("http://localhost/api/filings/" + id), { params: { id } });
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain("VICTIM-FTIN-001");
  });

  it("a filing rebound onto the account between takeover and listing is excluded", async () => {
    const id = await plantDraftOnVictim();
    row(id).userId = null;
    browser({ user: VICTIM_ID, session: VICTIM_BROWSER });
    db.hooks["filing.findMany"] = () => { row(id).userId = VICTIM_ID; };
    const res = await listFilings();
    expect((await res.json() as Row[]).map((f) => f.id)).not.toContain(id);
    expect(row(id).sessionId).toBe(ATTACKER_BROWSER);
  });

  it("bind-email maps a hold lost during upsert to 404", async () => {
    const id = await plantDraftOnVictim();
    db.hooks["user.upsert"] = () => { row(id).sessionId = null; };
    expect((await bindViaApi(id, "attacker@example.com")).status).toBe(404);
    expect(row(id).userId).toBe(VICTIM_ID);
  });

  it("PATCH maps a hold lost during email binding to 404 without echoing or rebinding", async () => {
    const id = await plantDraftOnVictim();
    db.hooks["user.upsert"] = () => { row(id).sessionId = null; };
    const res = await patchFiling(jsonRequest("http://localhost/api/filings/" + id, "PATCH", {
      email: "attacker@example.com",
    }), { params: { id } });
    expect(res.status).toBe(404);
    expect(row(id).userId).toBe(VICTIM_ID);
  });
});


describe("review follow-up: real partner-created drafts never receive account prefill", () => {
  async function partnerBlankDraft() {
    db.state.partners.push({ id: "partner_1", active: true, name: "Advisor" });
    browser({ partner: "partner_1" });
    const response = await createPartnerDraft();
    expect(response.status).toBe(307);
    const id = new URL(response.headers.get("location")!).pathname.split("/")[2];
    expect(row(id)).toMatchObject({ partnerId: "partner_1", userId: null, sessionId: null, llcEin: null, taxYears: [] });
    return id;
  }

  async function link(id: string, email: string) {
    const response = await clientLink(jsonRequest("http://localhost/client-link", "POST", { email }), { params: { id } });
    expect(response.status).toBe(200);
    const { url } = await response.json();
    const grant = await consumeFilingInvite(decodeURIComponent(new URL(url).pathname.split("/").pop()!));
    expect(grant).toEqual({ filingId: id, scope: "edit" });
    return inviteCookieValue(id, "edit", row(id).inviteExpiresAt as Date);
  }

  it.each(["partner client-link", "edit-invitee PATCH"])("%s cannot plant a blank draft for the victim's next POST", async (path) => {
    const id = await partnerBlankDraft();
    const inviteCookie = await link(id, path === "partner client-link" ? VICTIM_EMAIL : "invitee@example.com");
    if (path === "edit-invitee PATCH") {
      browser({});
      jar.set(INVITE_COOKIE, inviteCookie);
      const patched = await patchFiling(jsonRequest("http://localhost/filing", "PATCH", { email: VICTIM_EMAIL }), { params: { id } });
      expect(patched.status).toBe(200);
    }
    expect(row(id)).toMatchObject({ userId: VICTIM_ID, sessionId: null, partnerId: "partner_1" });
    expect(sendResumeEmail).not.toHaveBeenCalled();

    browser({ user: VICTIM_ID, session: VICTIM_BROWSER });
    const response = await createFiling(jsonRequest("http://localhost/api/filings", "POST", {}));
    expect(response.status).toBe(200);
    const created = await response.json();
    expect(created.reused).toBe(false);
    expect(created.id).not.toBe(id);
    expect(row(created.id)).toMatchObject({
      llcEin: "98-7654321", ownerFtin: "VICTIM-FTIN-001", ownerItin: "900-70-1234", ownerAddress: "42 Victim Street",
    });

    browser({ partner: "partner_1" });
    const seen = await getFiling(new Request("http://localhost/filing"), { params: { id } });
    expect(seen.status).toBe(200);
    const text = await seen.text();
    for (const secret of ["98-7654321", "VICTIM-FTIN-001", "900-70-1234", "42 Victim Street"]) {
      expect(text).not.toContain(secret);
    }
    expect(await getOwnedFiling(created.id)).toBeNull();
    browser({});
    jar.set(INVITE_COOKIE, inviteCookie);
    expect(await getOwnedFiling(created.id, "edit")).toBeNull();
    const invited = await getOwnedFiling(id, "edit");
    expect(invited?.id).toBe(id);
    expect(invited?.llcEin).toBeNull();
  });
});

describe("review follow-up: reuse predicates and row guard", () => {
  const grants = [
    { name: "partner", partnerId: "partner_1", inviteExpiresAt: null },
    { name: "live invite", partnerId: null, inviteExpiresAt: new Date("2099-01-01") },
  ];
  const scopes = [
    { name: "account", userId: VICTIM_ID, sessionId: undefined, rowUserId: VICTIM_ID },
    { name: "anonymous session", userId: null, sessionId: VICTIM_BROWSER, rowUserId: null },
    { name: "signed-in session", userId: VICTIM_ID, sessionId: VICTIM_BROWSER, rowUserId: null },
  ];
  for (const grant of grants) {
    it.each(scopes)(`excludes ${grant.name} in the $name query so an older safe draft is reused`, async (scope) => {
      const safe = await db.prisma.filing.create({ data: { userId: scope.rowUserId, sessionId: scope.sessionId ?? null } });
      await db.prisma.filing.create({ data: {
        userId: scope.rowUserId, sessionId: scope.sessionId ?? null,
        partnerId: grant.partnerId, inviteExpiresAt: grant.inviteExpiresAt,
      } });
      expect(await findOrCreateDraftFiling(scope)).toMatchObject({ reused: true, filing: { id: safe.id } });
    });

    it(`rejects a ${grant.name} row even if returned by the query`, async () => {
      const held = await db.prisma.filing.create({ data: { userId: VICTIM_ID, partnerId: grant.partnerId, inviteExpiresAt: grant.inviteExpiresAt } });
      vi.spyOn(db.prisma.filing, "findFirst").mockResolvedValueOnce(held);
      const result = await findOrCreateDraftFiling({ userId: VICTIM_ID, sessionId: VICTIM_BROWSER });
      expect(result.reused).toBe(false);
      expect(result.filing.id).not.toBe(held.id);
    });

    it.each(["start", "signin"])(`Google %s skips a ${grant.name} draft and leaves consent alone`, async (intent) => {
      const held = await db.prisma.filing.create({ data: { userId: VICTIM_ID, partnerId: grant.partnerId, inviteExpiresAt: grant.inviteExpiresAt } });
      browser({ session: VICTIM_BROWSER });
      google.email = VICTIM_EMAIL;
      const response = await googleSignIn(jsonRequest("http://localhost/api/auth/google", "POST", {
        credential: "google-jwt", intent, marketingConsent: true,
      }));
      expect(await response.json()).toMatchObject({ filingId: null, outcome: "go-to-filings" });
      expect(row(held.id as string).marketingConsent).toBe(false);
    });
  }

  it.each([null, new Date("2020-01-01"), new Date("2026-09-30T12:00:00Z")])("allows a missing or expired invite (%s), including expiry exactly now", async (inviteExpiresAt) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
    try {
      const own = await db.prisma.filing.create({ data: { userId: VICTIM_ID, inviteExpiresAt } });
      expect(await findOrCreateDraftFiling({ userId: VICTIM_ID, sessionId: undefined })).toMatchObject({ reused: true, filing: { id: own.id } });
      google.email = VICTIM_EMAIL;
      const response = await googleSignIn(jsonRequest("http://localhost/google", "POST", { credential: "google-jwt", intent: "start" }));
      expect(await response.json()).toMatchObject({ filingId: own.id });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("review follow-up: save-for-later", () => {
  it("maps access lost during binding to 404 without sending or rebinding", async () => {
    const id = await plantDraftOnVictim();
    db.hooks["user.upsert"] = () => { row(id).sessionId = null; };
    const response = await saveForLater(jsonRequest("http://localhost/save-for-later", "POST", { email: "attacker@example.com" }), { params: { id } });
    expect(response.status).toBe(404);
    expect(row(id).userId).toBe(VICTIM_ID);
    expect(sendResumeEmail).not.toHaveBeenCalled();
  });

  it("reads the entire body before checking access and rejects a takeover during upload", async () => {
    const id = await plantDraftOnVictim();
    const reads = vi.spyOn(db.prisma.filing, "findFirst");
    const slow = slowRequest("http://localhost/save-for-later", "POST", { email: "attacker@example.com" });
    const pending = saveForLater(slow.req, { params: { id } });
    await settle();
    const readsBeforeBody = reads.mock.calls.length;
    await victimTakesOverAndTypes(id);
    browser({ session: ATTACKER_BROWSER });
    slow.release();
    // Attach rejection handling before asserting order so the pre-fix route's
    // access-loss rejection is consumed as well.
    const response = await pending.catch((error: unknown) => error);
    expect(readsBeforeBody).toBe(0);
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(404);
    expect(row(id).userId).toBe(VICTIM_ID);
    expect(sendResumeEmail).not.toHaveBeenCalled();
  });

  it("still binds and sends the resume link for an authorized customer", async () => {
    browser({ session: "sess_customer" });
    const id = await startDraftViaApi();
    const response = await saveForLater(jsonRequest("http://localhost/save-for-later", "POST", { email: " Customer@Example.com " }), { params: { id } });
    expect(response.status).toBe(200);
    expect(row(id).userId).toBe(userIdFor("customer@example.com"));
    expect(sendResumeEmail).toHaveBeenCalledWith("customer@example.com", expect.stringContaining(encodeURIComponent(`/filings/${id}/edit`)), expect.any(String), undefined);
  });
});

describe("review follow-up: Prisma fake NULL semantics", () => {
  it("not a scalar excludes NULL, while not null matches non-null values", async () => {
    const empty = await db.prisma.filing.create({ data: {} });
    const same = await db.prisma.filing.create({ data: { sessionId: "same" } });
    const other = await db.prisma.filing.create({ data: { sessionId: "other" } });
    const notSame = await db.prisma.filing.findMany({ where: { sessionId: { not: "same" } } });
    expect(notSame.map((f) => f.id)).toEqual([other.id]);
    const notNull = await db.prisma.filing.findMany({ where: { sessionId: { not: null } } });
    expect(notNull.map((f) => f.id)).toEqual([same.id, other.id]);
    expect(notNull.map((f) => f.id)).not.toContain(empty.id);
  });
});
