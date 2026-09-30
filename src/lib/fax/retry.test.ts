import { beforeEach, describe, expect, it, vi } from "vitest";

// The automatic re-fax (lib/fax/retry.ts) wired to the REAL submitFax
// (lib/fax.ts) with only Telnyx's HTTP answer stubbed: a 4xx means Telnyx
// created no fax, so the retrying_N claim is released; a 5xx may come from a
// gateway after Telnyx queued the fax, so the claim is KEPT and a human is
// alerted — a second IRS fax is never sent on a guess. (faxFlow.test.ts covers
// the rest of the retry flow with submitFax mocked.)

type Row = Record<string, unknown>;

const state = vi.hoisted(() => ({ row: null as Record<string, unknown> | null }));
const db = vi.hoisted(() => ({
  updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const row = state.row;
    if (!row) return { count: 0 };
    for (const [key, cond] of Object.entries(where)) {
      if (cond && typeof cond === "object") {
        const notIn = (cond as { notIn?: unknown[] }).notIn;
        if (notIn?.includes(row[key])) return { count: 0 };
      } else if (row[key] !== cond) {
        return { count: 0 };
      }
    }
    Object.assign(row, data);
    return { count: 1 };
  }),
  update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    Object.assign(state.row!, data);
    return { id: state.row!.id };
  }),
}));
const email = vi.hoisted(() => ({ sendFaxAttentionAdminEmail: vi.fn(async (_args: unknown) => ({ id: "re_1" })) }));

vi.mock("@/lib/prisma", () => ({ prisma: { filing: { updateMany: db.updateMany, update: db.update } } }));
vi.mock("@/lib/email", () => email);
vi.mock("@/lib/storage", () => ({ publicUrl: async (key: string) => `https://storage.example.test/${key}` }));
vi.mock("@/lib/fax/finalize", () => ({
  finalizeFaxFailed: vi.fn(async () => ({ claimed: true, customerEmailed: false, adminEmailed: false })),
  safeChangeLog: vi.fn(async () => {}),
}));
vi.mock("@/lib/env", () => ({
  env: {
    appUrl: "https://example.test",
    adminEmail: "support@example.test",
    telnyx: { apiKey: "test-telnyx-key", connectionId: "conn", faxNumber: "+15550001111", destination: "+18558877737" },
  },
}));

import { handleConfirmedFaxFailure } from "@/lib/fax/retry";

const OLD_FAX = "fax-old";

function seed(): Row {
  state.row = {
    id: "filing_1",
    status: "FAXED",
    faxJobId: OLD_FAX,
    faxStatus: "queued",
    faxedPdfKey: "filing_1_faxed.pdf",
    signedPdfKey: "filing_1_signed.pdf",
    preflightStatus: "passed",
    preflightOverrideBy: null,
    llcName: "Acme LLC",
    llcEin: "12-3456789",
    ownerName: "Owner One",
    taxYears: [2025],
    isFinalReturn: false,
    dissolvedAt: null,
    userId: "user_1",
    user: { id: "user_1", email: "owner@example.test" },
  };
  return { ...state.row };
}

function telnyxAnswers(status: number, body = "") {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url !== "https://api.telnyx.com/v2/faxes" || init?.method !== "POST") throw new Error(`unexpected fetch ${url}`);
    return new Response(body, { status });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const retry = (filing: Row) =>
  handleConfirmedFaxFailure(filing as never, { faxId: OLD_FAX, failureReason: "busy" }, { source: "poll" });

describe("automatic re-fax: Telnyx 4xx vs 5xx on the resubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it.each([400, 422])("HTTP %i: rejected — nothing was sent, so the claim is released and nobody is paged", async (status) => {
    const filing = seed();
    const fetchMock = telnyxAnswers(status, "invalid media");

    const outcome = await retry(filing);

    expect(outcome).toMatchObject({ outcome: "submit_rejected" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(state.row).toMatchObject({ faxJobId: OLD_FAX, faxStatus: "queued" });
    expect(email.sendFaxAttentionAdminEmail).not.toHaveBeenCalled();
  });

  it.each([502, 504, 500])("HTTP %i: ambiguous — the claim is kept and the operator is alerted", async (status) => {
    const filing = seed();
    telnyxAnswers(status, "Bad Gateway");

    const outcome = await retry(filing);

    expect(outcome).toMatchObject({ outcome: "submit_ambiguous", error: expect.stringContaining(`HTTP ${status}`) });
    expect(state.row).toMatchObject({ faxJobId: OLD_FAX, faxStatus: "retrying_1" });
    expect(db.update).not.toHaveBeenCalled();
    expect(email.sendFaxAttentionAdminEmail).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("AMBIGUOUS_FAX_SUBMIT filing=filing_1"), expect.anything());

    // A second pass for the same failure cannot resubmit from that claim.
    const again = await retry({ ...filing, faxStatus: "retrying_1" });
    expect(again).toEqual({ outcome: "not_claimed" });
  });

  it("a network error on submit is ambiguous too", async () => {
    const filing = seed();
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("fetch failed");
    }));

    expect(await retry(filing)).toMatchObject({ outcome: "submit_ambiguous" });
    expect(state.row).toMatchObject({ faxStatus: "retrying_1" });
  });
});
