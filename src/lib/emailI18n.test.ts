import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as mail from "./email";
import * as i18n from "@/i18n/server";
import englishHashes from "./__fixtures__/email-english-sha256.json";

vi.mock("@/lib/prisma", () => ({ prisma: {
  emailLog: { create: vi.fn(async () => ({ id: "log" })) },
  filing: { findUnique: async () => null, findFirst: async () => null, count: async () => 0 },
} }));

const common = {
  email: "alex@example.com", recipientName: "Alex Test", fullName: "Alex Test",
  llcName: "Example LLC", taxYears: [2024, 2025], filingId: "filing-1",
  portalLink: "https://form5472prep.com/auth/token", brand: { name: "Partner & Co", replyTo: "partner@example.com" },
};
const proof = { faxId: "fax-1", deliveredAt: "2026-03-12T14:32:00.000Z", pageCount: 8, durationSecs: 94, from: "+12345", to: "+18558877737" };
// Baseline hashes were captured from the original English renderer before localization.
// Include the optional sections and both attachment paths, not only the default copy.
function cases(locale?: string) {
  const a = { ...common, locale };
  const order = { ...a, tier: "express" as const, amountPaidCents: 39800, faxService: true, receiptUrl: "https://stripe.com/receipt", dueDateText: "April 15, 2026", isFinalReturn: true, requiresReasonableCause: true };
  const fax = { ...a, proof, signedPdfBytes: new Uint8Array([1]), receiptPdfBytes: new Uint8Array([2]) };
  const reminder = { email: a.email, locale, taxYearToFile: 2025, previousLlcNames: ["Example LLC", "Other LLC"], startLink: a.portalLink, unsubscribeUrl: "https://form5472prep.com/unsubscribe/token" };
  const draft = { ...a, resumeLink: a.portalLink, unsubscribeUrl: reminder.unsubscribeUrl };
  return {
    magic: () => mail.sendMagicLinkEmail(a.email, a.portalLink, a.llcName, a.brand, a.filingId, locale),
    order: () => mail.sendOrderConfirmationEmail(order),
    orderPdf: () => mail.sendOrderConfirmationEmail({ ...order, pdfBytes: new Uint8Array([1]), requiresReasonableCause: false, extensionUnclear: true }),
    orderStandard: () => mail.sendOrderConfirmationEmail({ ...order, tier: "standard", llcName: null, isFinalReturn: false, requiresReasonableCause: false }),
    ready: () => mail.sendReadyToSignEmail(a),
    resign: () => mail.sendReadyToSignEmail({ ...a, resign: true }),
    signReminder: () => mail.sendReadyToSignEmail({ ...a, reminder: true }),
    ssn: () => mail.sendOwnerSsnRequestEmail(a),
    fax: () => mail.sendFaxDeliveredEmail(fax),
    faxFinal: () => mail.sendFaxDeliveredEmail({ ...fax, isFinalReturn: true, ownerSsnLast4: "1234", attachReceipt: false }),
    message: () => mail.sendNewMessageToCustomerEmail({ ...a, bodyExcerpt: "Please confirm <this>." }),
    applicationMessage: () => mail.sendNewApplicationMessageCustomerEmail({ ...a, kind: "EIN", subjectLabel: a.llcName, bodyExcerpt: "Please confirm <this>." }),
    january: () => mail.sendJanuaryReminderEmail(reminder),
    march: () => mail.sendMarchReminderEmail(reminder),
    draft: () => mail.sendAbandonedDraftReminderEmail(draft),
    draftFinal: () => mail.sendAbandonedDraftReminderEmail({ ...draft, variant: "final" }),
    ein: () => mail.sendEinApplicationConfirmationEmail({ ...a, amountPaidCents: 14900 }),
    itin: () => mail.sendItinApplicationConfirmationEmail({ ...a, amountPaidCents: 34900 }),
    extension: () => mail.sendExtensionApplicationConfirmationEmail({ ...a, amountPaidCents: 1900, taxYear: 2025 }),
    extensionUnknown: () => mail.sendExtensionApplicationConfirmationEmail({ ...a, amountPaidCents: 1900 }),
    extensionFax: () => mail.sendExtensionFaxedEmail({ ...a, taxYear: 2025, deliveredAtIso: proof.deliveredAt, formPdfBytes: new Uint8Array([1]), receiptPdfBytes: new Uint8Array([2]) }),
    signature: () => mail.sendApplicationSignatureRequestEmail({ ...a, type: "ein", signLink: a.portalLink }),
    reply: () => mail.sendWebsiteQuestionReplyEmail({ locale, to: a.email, name: a.fullName, reply: "Our reply\n\nDetails.", originalMessage: "My question\nMore details.", askedAt: new Date(proof.deliveredAt) }),
    intake: () => mail.sendClientIntakeEmail(a.email, a.portalLink, a.llcName, "Preparer Name", a.brand, locale),
    resume: () => mail.sendResumeFilingEmail(a.email, a.portalLink, a.llcName, a.brand, locale),
  };
}

let directory = "";
afterEach(async () => {
  delete process.env.EMAIL_PREVIEW_DIR;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe("customer email languages", () => {
  it.each([undefined, "en", "junk-locale", "zh-junk"])("preserves every English byte for %s", async (locale) => {
    directory = await mkdtemp(join(tmpdir(), "email-i18n-"));
    process.env.EMAIL_PREVIEW_DIR = directory;
    const hashes: Record<string, string> = {};
    for (const [name, send] of Object.entries(cases(locale))) {
      const result = await send() as { htmlPath: string; textPath: string };
      const html = await readFile(result.htmlPath, "utf8");
      const text = await readFile(result.textPath, "utf8");
      hashes[name] = createHash("sha256").update(html + "\0" + text).digest("hex");
    }
    expect(hashes).toEqual(englishHashes);
  });

  it.each(["zh-Hans", "zh-Hant", "de", "fr", "es"])("renders all customer variants in %s without formatting errors", async (locale) => {
    directory = await mkdtemp(join(tmpdir(), "email-i18n-"));
    process.env.EMAIL_PREVIEW_DIR = directory;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const send of Object.values(cases(locale))) {
      const result = await send() as { htmlPath: string; textPath: string };
      const html = await readFile(result.htmlPath, "utf8");
      expect(html).toContain(`<html lang="${locale}">`);
      expect(html).not.toMatch(/\{(?:v\d+|tag\d+|name)\}|Hello |Thank you,|Check &amp; sign my forms/);
      expect(html).not.toContain("Please confirm <this>.");
    }
    expect(warn).not.toHaveBeenCalled();
  });

  it("sends zh-Hans subjects for three different templates", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ id: "sent" }) } as Response);
    await cases("zh-Hans").magic();
    await cases("zh-Hans").ready();
    await cases("zh-Hans").ein();
    const payloads = fetcher.mock.calls.map(([, options]) => JSON.parse(options!.body as string));
    expect(payloads.map((p) => p.subject)).toEqual([
      "您的 Partner & Co 申报 — 访问链接", "请检查并签署您的表格", "EIN 申请已收到 — Example LLC",
    ]);
    for (const payload of payloads) expect(payload.subject).not.toMatch(/[\r\n]/);
  });

  it.each(["factory", "message"])("still attempts an English send when the translator %s throws", async (failure) => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ id: "sent" }) } as Response);
    vi.spyOn(i18n, "getEmailTranslator").mockImplementation(() => {
      if (failure === "factory") throw new Error("translation unavailable");
      return () => { throw new Error("formatting unavailable"); };
    });
    await expect(cases("zh-Hans").magic()).resolves.toEqual({ id: "sent" });
    expect(fetcher).toHaveBeenCalledOnce();
    const payload = JSON.parse(fetcher.mock.calls[0][1]!.body as string);
    expect(payload.subject).toBe("Your Partner & Co filing — access link");
    expect(payload.text).toContain("Use this secure link to open your filing");
    expect(payload.html).toContain("Open your filing");
  });
});
