import { beforeEach, describe, expect, it, vi } from "vitest";

// The web admin route hands every workflow action a blanket
// { force: true, reason: "legacy admin override" } for its legacy gates. These
// tests pin that retryFax's re-fax confirmation is NOT that blanket flag but
// only what the admin sent with this request, and that refusals reach the UI
// with their code.

const auth = vi.hoisted(() => ({
  getAdminPrincipal: vi.fn(async (_req?: Request): Promise<unknown> => ({ adminId: "admin_1", email: "a@x.test", via: "cookie" })),
  isAdmin: vi.fn(async () => true),
}));
const actions = vi.hoisted(() => {
  class FilingActionError extends Error {
    constructor(
      readonly status: number,
      readonly code: string,
      message: string,
    ) {
      super(message);
    }
  }
  return { FilingActionError, runFilingAction: vi.fn(async (..._args: unknown[]): Promise<unknown> => ({ ok: true })) };
});

vi.mock("@/lib/admin/auth", () => ({
  SHARED_ADMIN_LABEL: "Form5472 Prep team (shared admin login)",
  getAdminPrincipal: auth.getAdminPrincipal,
  isAdmin: auth.isAdmin,
}));
vi.mock("@/lib/admin/filingActions", () => ({
  FilingActionError: actions.FilingActionError,
  runFilingAction: actions.runFilingAction,
}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/email", () => ({ sendAbandonedDraftReminderEmail: vi.fn() }));
vi.mock("@/lib/magicLink", () => ({ makeMagicLink: () => "https://x.test/magic" }));
vi.mock("@/lib/unsubscribeToken", () => ({ makeUnsubscribeLink: () => "https://x.test/unsub" }));

import { POST } from "./route";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/admin/filings/filing_1", { method: "POST", body: JSON.stringify(body) }), {
    params: { id: "filing_1" },
  });
const ctxOfLastCall = () => actions.runFilingAction.mock.calls.at(-1)?.[3] as Record<string, unknown>;

describe("POST /api/admin/filings/[id] — retryFax confirmation plumbing", () => {
  beforeEach(() => {
    actions.runFilingAction.mockReset();
    actions.runFilingAction.mockResolvedValue({ ok: true });
    auth.getAdminPrincipal.mockResolvedValue({ adminId: "admin_1", email: "a@x.test", via: "cookie" });
    auth.isAdmin.mockResolvedValue(true);
  });

  it("a plain retryFax carries no re-fax confirmation, even though the legacy force stays on", async () => {
    const res = await post({ action: "retryFax" });
    expect(res.status).toBe(200);
    expect(ctxOfLastCall()).toMatchObject({
      force: true,
      reason: "legacy admin override",
      refax: { force: false, reason: null },
    });
  });

  it("passes the admin's force + reason from the request body as the re-fax confirmation", async () => {
    await post({ action: "retryFax", force: true, reason: "IRS asked for a second copy" });
    expect(ctxOfLastCall()).toMatchObject({ refax: { force: true, reason: "IRS asked for a second copy" } });
  });

  it("only a literal boolean true counts as force", async () => {
    await post({ action: "retryFax", force: "true", reason: "IRS asked for a second copy" });
    expect(ctxOfLastCall()).toMatchObject({ refax: { force: false } });
  });

  it("other actions get no refax field", async () => {
    await post({ action: "setStatus", status: "PAID" });
    expect(ctxOfLastCall()).not.toHaveProperty("refax");
  });

  it("records shared-password actions as the team, never the sign-in email", async () => {
    auth.getAdminPrincipal.mockResolvedValue(null);
    await post({ action: "retryFax", force: true, reason: "IRS asked for a second copy" });
    expect(ctxOfLastCall()).toMatchObject({ adminId: null, approver: "Form5472 Prep team (shared admin login)" });
  });

  it("returns a refusal as { error, code } with its HTTP status", async () => {
    actions.runFilingAction.mockRejectedValue(
      new actions.FilingActionError(409, "refax_reason_required", "This filing was already delivered to the IRS."),
    );
    const res = await post({ action: "retryFax" });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: "This filing was already delivered to the IRS.",
      code: "refax_reason_required",
    });
  });

  it("rejects callers that are not admins", async () => {
    auth.getAdminPrincipal.mockResolvedValue(null);
    auth.isAdmin.mockResolvedValue(false);
    const res = await post({ action: "retryFax", force: true, reason: "IRS asked for a second copy" });
    expect(res.status).toBe(401);
    expect(actions.runFilingAction).not.toHaveBeenCalled();
  });
});
