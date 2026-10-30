import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// sendEmail() routes mail for a partner filing's client to the partner (or
// drops it). Prisma and fetch are mocked — nothing talks to Resend or a DB.
const db = vi.hoisted(() => ({
  create: vi.fn(async (_args: unknown) => ({ id: "log_1" })),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  count: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailLog: { create: db.create },
    filing: { findUnique: db.findUnique, findFirst: db.findFirst, count: db.count },
  },
}));

import { sendEmail } from "@/lib/email";

const PARTNER_FILING = { id: "f_partner", llcName: "Acme LLC", partner: { email: "desk@partner.test" } };
const RETAIL_FILING = { id: "f_retail", llcName: "Solo LLC", partner: null };
const BASE = {
  to: "client@example.test",
  subject: "Your IRS fax was delivered",
  html: '<html><body><p>Open <a href="https://form5472prep.com/auth/u1%3A99.sig?next=%2Ffilings%2Ff1">your portal</a></p></body></html>',
  text: "Open https://form5472prep.com/auth/u1%3A99.sig?next=%2Ffilings%2Ff1",
};

function sentBody(fetchMock: ReturnType<typeof vi.fn>) {
  const init = fetchMock.mock.calls[0][1] as { body: string };
  return JSON.parse(init.body) as Record<string, unknown>;
}

describe("sendEmail partner-client guard", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    delete process.env.EMAIL_PREVIEW_DIR;
    process.env.RESEND_API_KEY = "re_test_key";
    db.create.mockReset().mockResolvedValue({ id: "log_1" });
    db.findUnique.mockReset().mockResolvedValue(null);
    db.findFirst.mockReset().mockResolvedValue(null);
    db.count.mockReset().mockResolvedValue(0);
    fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "resend-abc" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    vi.unstubAllGlobals();
  });

  it("leaves retail mail unchanged", async () => {
    db.findUnique.mockResolvedValue(RETAIL_FILING);
    await sendEmail({ ...BASE, bcc: "invite@trustpilot.test", log: { kind: "fax_delivered", filingId: "f_retail" } });
    const body = sentBody(fetchMock);
    expect(body.to).toBe("client@example.test");
    expect(body.subject).toBe(BASE.subject);
    expect(body.bcc).toBe("invite@trustpilot.test");
  });

  it("redirects a partner client's transactional mail to the partner, with a note and no client login link", async () => {
    db.findUnique.mockResolvedValue(PARTNER_FILING);
    await sendEmail({
      ...BASE,
      bcc: "invite@trustpilot.test",
      fromName: "Acme Formations",
      replyTo: "help@partner.test",
      log: { kind: "fax_delivered", filingId: "f_partner" },
    });
    const body = sentBody(fetchMock);
    expect(body.to).toBe("desk@partner.test");
    expect(body.subject).toBe("[Your client: Acme LLC] Your IRS fax was delivered");
    expect(body.bcc).toBeUndefined();
    expect(body.reply_to).toBe("support@form5472prep.com");
    expect(String(body.from)).not.toContain("Acme Formations");
    expect(String(body.html)).toContain("addressed to your client client@example.test");
    expect(String(body.html)).not.toContain("/auth/");
    expect(String(body.html)).toContain('href="https://form5472prep.com/partner"');
    expect(String(body.text)).not.toContain("/auth/");
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ to: "desk@partner.test", status: "sent", filingId: "f_partner" }),
    }));
  });

  it.each(["magic_link", "january_reminder", "march_reminder", "abandoned_draft_reminder", "client_intake", "resume_filing"])(
    "drops %s for a partner client",
    async (kind) => {
      db.findFirst.mockResolvedValue(PARTNER_FILING);
      const result = await sendEmail({ ...BASE, log: { kind } });
      expect(result).toEqual({ dropped: true });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ kind, to: "client@example.test", status: "dropped" }),
      }));
    },
  );

  it("matches the recipient by email case-insensitively when no filing is tagged", async () => {
    db.findFirst.mockResolvedValue(PARTNER_FILING);
    await sendEmail({ ...BASE, to: "Client@Example.test", log: { kind: "new_message_customer" } });
    expect(db.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { partnerId: { not: null }, user: { email: { equals: "Client@Example.test", mode: "insensitive" } } },
    }));
    expect(sentBody(fetchMock).to).toBe("desk@partner.test");
  });

  it("uses the tagged filing over the email lookup: a retail filing stays retail", async () => {
    db.findUnique.mockResolvedValue(RETAIL_FILING);
    db.findFirst.mockResolvedValue(PARTNER_FILING);
    await sendEmail({ ...BASE, log: { kind: "order_confirmation", filingId: "f_retail" } });
    expect(db.findFirst).not.toHaveBeenCalled();
    expect(sentBody(fetchMock).to).toBe("client@example.test");
  });

  it("does not redirect mail already addressed to the partner", async () => {
    db.findUnique.mockResolvedValue(PARTNER_FILING);
    await sendEmail({ ...BASE, to: "Desk@Partner.test", log: { kind: "order_confirmation", filingId: "f_partner" } });
    expect(sentBody(fetchMock).to).toBe("Desk@Partner.test");
  });

  it.each(["admin_new_order", "partner_login", "ein_application_confirmation", "website_question_reply"])(
    "never touches %s",
    async (kind) => {
      db.findFirst.mockResolvedValue(PARTNER_FILING);
      await sendEmail({ ...BASE, log: { kind } });
      expect(db.findFirst).not.toHaveBeenCalled();
      expect(sentBody(fetchMock).to).toBe("client@example.test");
    },
  );

  it("fails closed: a lookup error sends nothing, logs a failure and throws", async () => {
    db.findUnique.mockRejectedValue(new Error("db down"));
    await expect(sendEmail({ ...BASE, log: { kind: "fax_delivered", filingId: "f_partner" } })).rejects.toThrow(
      "partner-client lookup failed: db down",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ to: "client@example.test", status: "failed" }),
    }));
  });

  it("leaves untagged mail alone for someone who is also our direct customer", async () => {
    db.findFirst.mockResolvedValue(PARTNER_FILING);
    db.count.mockResolvedValue(1);
    await sendEmail({ ...BASE, log: { kind: "magic_link" } });
    expect(sentBody(fetchMock).to).toBe("client@example.test");
  });
});
