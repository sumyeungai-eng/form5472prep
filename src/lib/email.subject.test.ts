import { afterEach, describe, expect, it, vi } from "vitest";
import { sendWebsiteQuestionAdminEmail, singleLineSubject } from "@/lib/email";

vi.mock("@/lib/prisma", () => ({
  prisma: { emailLog: { create: vi.fn(async () => ({ id: "synthetic-log" })) } },
}));

describe("singleLineSubject", () => {
  it("removes line breaks and tabs and collapses spaces", () => {
    expect(singleLineSubject("Hello\nthere\r\n  friend\tok")).toBe("Hello there friend ok");
  });

  it("leaves a normal subject unchanged", () => {
    expect(singleLineSubject("[Website question] Pricing — Alex Example — Do I need to file?")).toBe(
      "[Website question] Pricing — Alex Example — Do I need to file?",
    );
  });

  it("caps very long subjects", () => {
    const out = singleLineSubject("x".repeat(400));
    expect(out.length).toBeLessThanOrEqual(250);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("website question alert subject (Resend rejects newlines)", () => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalPreview = process.env.EMAIL_PREVIEW_DIR;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalPreview === undefined) delete process.env.EMAIL_PREVIEW_DIR;
    else process.env.EMAIL_PREVIEW_DIR = originalPreview;
  });

  it("sends a single-line subject when the visitor's message has line breaks", async () => {
    process.env.RESEND_API_KEY = "re_synthetic_test_key";
    delete process.env.EMAIL_PREVIEW_DIR;
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "synthetic-id" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendWebsiteQuestionAdminEmail({
      adminEmail: "support@example.com",
      name: "Alex Example",
      email: "alex@example.com",
      message: "Hi,\nI formed my LLC last year.\n\nDo I need to file Form 5472?",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calls = fetchMock.mock.calls as unknown as Array<[string, { body: string }]>;
    const body = JSON.parse(calls[0][1].body) as { subject: string };
    expect(body.subject).not.toMatch(/[\r\n]/);
    expect(body.subject).toContain("Hi, I formed my LLC last year.");
  });
});
