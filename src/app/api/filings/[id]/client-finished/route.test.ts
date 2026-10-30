import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  getOwnedFiling: vi.fn(),
  partnerFind: vi.fn(),
  userFind: vi.fn(),
  sendEmail: vi.fn(async (_a: Record<string, unknown>) => ({})),
}));
vi.mock("@/lib/session", () => ({ getOwnedFiling: m.getOwnedFiling }));
vi.mock("@/lib/prisma", () => ({
  prisma: { partner: { findUnique: m.partnerFind }, user: { findUnique: m.userFind } },
}));
vi.mock("@/lib/env", () => ({ env: { appUrl: "https://app.test" } }));
vi.mock("@/lib/email", () => ({
  sendEmail: m.sendEmail,
  customerShell: (a: { heading: string }) => `<html>${a.heading}</html>`,
}));

import { POST } from "./route";

const call = () => POST(new Request("http://x", { method: "POST" }), { params: { id: "f1" } });

describe("POST /api/filings/[id]/client-finished", () => {
  beforeEach(() => vi.clearAllMocks());

  it("emails the partner with kind partner_client_finished", async () => {
    m.getOwnedFiling.mockResolvedValue({ id: "f1", partnerId: "p1", userId: "u1", llcName: "Acme LLC", inviteEmail: null });
    m.partnerFind.mockResolvedValue({ email: "partner@example.test", name: "Pat" });
    m.userFind.mockResolvedValue({ email: "client@example.test" });
    const res = await call();
    expect(res.status).toBe(204);
    expect(m.getOwnedFiling).toHaveBeenCalledWith("f1", "edit");
    expect(m.sendEmail).toHaveBeenCalledTimes(1);
    const arg = m.sendEmail.mock.calls[0][0] as { to: string; subject: string; text: string; log: unknown };
    expect(arg.to).toBe("partner@example.test");
    expect(arg.subject).toBe("Your client finished the intake for Acme LLC");
    expect(arg.text).toContain("https://app.test/filings/f1");
    expect(arg.log).toEqual({ kind: "partner_client_finished", filingId: "f1" });
  });

  it("404s for a retail filing and sends nothing", async () => {
    m.getOwnedFiling.mockResolvedValue({ id: "f1", partnerId: null });
    expect((await call()).status).toBe(404);
    expect(m.sendEmail).not.toHaveBeenCalled();
  });

  it("404s without access", async () => {
    m.getOwnedFiling.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });
});
