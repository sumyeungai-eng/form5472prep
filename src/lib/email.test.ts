import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { sendOrderConfirmationEmail } from "@/lib/email";

let PREVIEW_DIR = "";

const LATE_SENTENCE =
  "This return is being filed after its due date. We include a reasonable-cause statement explaining why.";
const EXTENSION_UNCLEAR_SENTENCE =
  "We are checking whether an extension was filed for this year. We will confirm before anything is sent.";

function slugifySubject(subject: string) {
  return subject
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "email";
}

async function usePreviewDir() {
  PREVIEW_DIR = await mkdtemp(join(tmpdir(), "order-confirmation-email-previews-"));
  process.env.EMAIL_PREVIEW_DIR = PREVIEW_DIR;
}

async function readRenderedOrderEmail(result: unknown) {
  const subject = "Order confirmed - Form5472 Prep filing (2024)";
  const slug = slugifySubject(subject);
  const expectedHtmlPath = join(PREVIEW_DIR, `${slug}.html`);
  const expectedTextPath = join(PREVIEW_DIR, `${slug}.txt`);
  expect(result).toMatchObject({
    preview: true,
    htmlPath: expectedHtmlPath,
    textPath: expectedTextPath,
  });

  return {
    html: await readFile(expectedHtmlPath, "utf8"),
    text: await readFile(expectedTextPath, "utf8"),
  };
}

function minimalOrderArgs() {
  return {
    email: "alex@example.com",
    llcName: "Example Holdings LLC",
    taxYears: [2024],
    tier: "standard" as const,
    amountPaidCents: 14900,
    faxService: true,
    portalLink: "https://form5472prep.com/portal/sample",
  };
}

describe("order confirmation email", () => {
  afterEach(async () => {
    delete process.env.EMAIL_PREVIEW_DIR;
    if (PREVIEW_DIR) await rm(PREVIEW_DIR, { recursive: true, force: true });
    PREVIEW_DIR = "";
  });

  it("renders the reasonable-cause sentence when required", async () => {
    await usePreviewDir();

    const rendered = await readRenderedOrderEmail(
      await sendOrderConfirmationEmail({
        ...minimalOrderArgs(),
        requiresReasonableCause: true,
      }),
    );

    expect(rendered.html).toContain(LATE_SENTENCE);
    expect(rendered.text).toContain(LATE_SENTENCE);
  });

  it("omits late-filing wording when reasonable cause is not required", async () => {
    await usePreviewDir();

    const rendered = await readRenderedOrderEmail(
      await sendOrderConfirmationEmail({
        ...minimalOrderArgs(),
        requiresReasonableCause: false,
      }),
    );

    expect(rendered.html).not.toContain(LATE_SENTENCE);
    expect(rendered.text).not.toContain(LATE_SENTENCE);
    expect(rendered.html).not.toMatch(/diirsp|delinquent/i);
    expect(rendered.text).not.toMatch(/diirsp|delinquent/i);
  });

  it("renders the extension-unclear sentence when extension status needs review", async () => {
    await usePreviewDir();

    const rendered = await readRenderedOrderEmail(
      await sendOrderConfirmationEmail({
        ...minimalOrderArgs(),
        extensionUnclear: true,
      }),
    );

    expect(rendered.html).toContain(EXTENSION_UNCLEAR_SENTENCE);
    expect(rendered.text).toContain(EXTENSION_UNCLEAR_SENTENCE);
  });

  it("keeps the existing output clean when neither optional flag is set", async () => {
    await usePreviewDir();

    const existingCallerShape = await readRenderedOrderEmail(
      await sendOrderConfirmationEmail(minimalOrderArgs()),
    );

    const withoutNoticeShape = await readRenderedOrderEmail(
      await sendOrderConfirmationEmail({
        ...minimalOrderArgs(),
        requiresReasonableCause: false,
        extensionUnclear: false,
      }),
    );

    expect(existingCallerShape).toEqual(withoutNoticeShape);
    expect(existingCallerShape.html).not.toContain(LATE_SENTENCE);
    expect(existingCallerShape.text).not.toContain(LATE_SENTENCE);
    expect(existingCallerShape.html).not.toContain(EXTENSION_UNCLEAR_SENTENCE);
    expect(existingCallerShape.text).not.toContain(EXTENSION_UNCLEAR_SENTENCE);
    expect(existingCallerShape.html).not.toMatch(/<p[^>]*>\s*<\/p>/i);
  });

  it("promises a ready-to-sign package within 24 hours on 24-Hour orders, never 'filed within 24 hours'", async () => {
    await usePreviewDir();
    const priority = await readRenderedOrderEmail(
      await sendOrderConfirmationEmail({ ...minimalOrderArgs(), tier: "priority" }),
    );
    expect(priority.html).toContain("24-Hour order:");
    expect(priority.html).toContain("ready for you to check and sign within 24 hours of your order");
    expect(priority.text).toContain("ready for you to check and sign within 24 hours of your order");
    expect(priority.html).not.toMatch(/filed within 24 hours|faxed within 24 hours/i);
    expect(priority.html).not.toContain("one business day");
    expect(priority.html).toContain("$299");
  });

  it("promises a one-business-day review on express orders only", async () => {
    await usePreviewDir();
    const express = await readRenderedOrderEmail(
      await sendOrderConfirmationEmail({ ...minimalOrderArgs(), tier: "express" }),
    );
    expect(express.html).toContain("a qualified accountant will review your filing within one business day.");
    expect(express.html).toContain("reviews the package within one business day");
    expect(express.text).toContain("Express order: a qualified accountant will review your filing within one business day.");
    expect(express.text).toContain("reviews the package within one business day");

    const standard = await readRenderedOrderEmail(
      await sendOrderConfirmationEmail(minimalOrderArgs()),
    );
    expect(standard.html).not.toContain("one business day");
    expect(standard.text).not.toContain("one business day");
  });
});

describe("sendWebsiteQuestionReplyEmail", () => {
  let dir: string | null = null;
  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
    dir = null;
    delete process.env.EMAIL_PREVIEW_DIR;
  });

  it("greets by first name, escapes the reply and quotes the original question", async () => {
    dir = await mkdtemp(join(tmpdir(), "question-reply-"));
    process.env.EMAIL_PREVIEW_DIR = dir;
    const { sendWebsiteQuestionReplyEmail } = await import("@/lib/email");
    const result = (await sendWebsiteQuestionReplyEmail({
      to: "visitor@example.test",
      name: "Ana Lopez",
      reply: "Yes, you need to file.\n\nSee <our guide> & pricing.",
      originalMessage: "Do I need to file Form 5472?",
      askedAt: new Date("2026-10-01T10:00:00Z"),
    })) as { htmlPath: string; textPath: string };
    const html = await readFile(result.htmlPath, "utf8");
    const text = await readFile(result.textPath, "utf8");

    expect(html).toContain("Hello Ana,");
    expect(html).toContain("See &lt;our guide&gt; &amp; pricing.");
    expect(html).not.toContain("<our guide>");
    expect(html).toContain("Do I need to file Form 5472?");
    expect(html).toContain("October 1, 2026");
    expect(text).toContain("Hello Ana,");
    expect(text).toContain("> Do I need to file Form 5472?");
  });
});
