import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  sendEinApplicationConfirmationEmail,
  sendExtensionApplicationAdminEmail,
  sendExtensionApplicationConfirmationEmail,
  sendItinApplicationConfirmationEmail,
} from "@/lib/email";

let PREVIEW_DIR = "";

function slugifySubject(subject: string) {
  return subject
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "email";
}

async function readRenderedEmail(result: unknown, subject: string) {
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
    htmlPath: expectedHtmlPath,
    textPath: expectedTextPath,
  };
}

describe("application confirmation emails", () => {
  afterEach(async () => {
    delete process.env.EMAIL_PREVIEW_DIR;
    if (PREVIEW_DIR) await rm(PREVIEW_DIR, { recursive: true, force: true });
  });

  it("renders the paid EIN and ITIN customer confirmation emails", async () => {
    PREVIEW_DIR = await mkdtemp(join(tmpdir(), "application-email-previews-"));
    process.env.EMAIL_PREVIEW_DIR = PREVIEW_DIR;

    const einPortalLink = "https://form5472prep.com/portal/ein-sample";
    const itinPortalLink = "https://form5472prep.com/portal/itin-sample";
    const einSubject = "EIN application received — Acme Holdings LLC";
    const itinSubject = "ITIN application received — Alex Chen";

    const ein = await readRenderedEmail(
      await sendEinApplicationConfirmationEmail({
        email: "alex@example.com",
        fullName: "Alex Chen",
        llcName: "Acme Holdings LLC",
        amountPaidCents: 14900,
        portalLink: einPortalLink,
      }),
      einSubject,
    );
    const itin = await readRenderedEmail(
      await sendItinApplicationConfirmationEmail({
        email: "alex@example.com",
        fullName: "Alex Chen",
        amountPaidCents: 34900,
        portalLink: itinPortalLink,
      }),
      itinSubject,
    );

    expect(ein.text).toContain("$149.00");
    expect(ein.text).toContain("you will not receive a separate payment request");
    expect(ein.text).toContain("Form SS-4");
    expect(ein.text.toLowerCase()).not.toContain("payment link");
    expect(ein.html.toLowerCase()).not.toContain("payment link");
    expect(ein.html).toContain(`href="${einPortalLink}"`);

    expect(itin.text).toContain("$349.00");
    expect(itin.text).toContain("you will not receive a separate payment request");
    expect(itin.text).toContain("Certifying Acceptance Agent");
    expect(itin.text).toContain("6–11 weeks");
    expect(itin.text.toLowerCase()).not.toContain("payment link");
    expect(itin.html.toLowerCase()).not.toContain("payment link");
    expect(itin.html).toContain(`href="${itinPortalLink}"`);
  });

  it("renders the paid Form 7004 confirmation without overclaiming", async () => {
    PREVIEW_DIR = await mkdtemp(join(tmpdir(), "application-email-previews-"));
    process.env.EMAIL_PREVIEW_DIR = PREVIEW_DIR;

    const ext = await readRenderedEmail(
      await sendExtensionApplicationConfirmationEmail({
        email: "alex@example.com",
        fullName: "Alex Chen",
        llcName: "Acme Holdings LLC",
        taxYear: 2026,
        amountPaidCents: 7900,
      }),
      "Form 7004 extension order received — Acme Holdings LLC",
    );
    expect(ext.text).toContain("$79.00");
    expect(ext.text).toContain("you will not receive a separate payment request");
    expect(ext.text).toContain("Foreign-owned U.S. DE");
    expect(ext.text).toContain("Form 1120 code 12");
    expect(ext.text).toContain("Ogden PIN Unit");
    expect(ext.text).toContain("must be filed by April 15, 2027");
    expect(ext.text).toContain("to October 15, 2027");
    expect(ext.text).toContain("It is not an IRS acceptance of the extension.");
    for (const body of [ext.text.toLowerCase(), ext.html.toLowerCase()]) {
      expect(body).not.toContain("guarantee");
      expect(body).not.toContain("payment link");
      expect(body).not.toContain("approved");
    }
  });

  it("asks for the tax year when the customer left it blank", async () => {
    PREVIEW_DIR = await mkdtemp(join(tmpdir(), "application-email-previews-"));
    process.env.EMAIL_PREVIEW_DIR = PREVIEW_DIR;

    const ext = await readRenderedEmail(
      await sendExtensionApplicationConfirmationEmail({ email: "alex@example.com", fullName: "", amountPaidCents: 7900 }),
      "Form 7004 extension order received — your LLC",
    );
    expect(ext.text).toMatch(/^Hello there,/);
    expect(ext.text).toContain("Reply with the tax year");
  });

  it("gives staff the order, deadline and admin link in the Form 7004 admin email", async () => {
    PREVIEW_DIR = await mkdtemp(join(tmpdir(), "application-email-previews-"));
    process.env.EMAIL_PREVIEW_DIR = PREVIEW_DIR;

    const admin = await readRenderedEmail(
      await sendExtensionApplicationAdminEmail({
        id: "ext1",
        adminEmail: "support@example.com",
        fullName: "Alex Chen",
        email: "alex@example.com",
        llcName: "Acme Holdings LLC",
        ein: "12-3456789",
        llcStreet: "1 Example St",
        llcCity: "Sheridan",
        llcState: "WY",
        llcZip: "82801",
        taxYear: 2026,
        amountPaidCents: 7900,
      }),
      "[Paid] [Form 7004] Acme Holdings LLC — tax year 2026",
    );
    expect(admin.text).toContain("Payment: $79.00 received");
    expect(admin.text).toContain("IRS due date (fax by): April 15, 2027");
    expect(admin.text).toContain("LLC US address: 1 Example St, Sheridan, WY, 82801");
    expect(admin.text).toContain("/admin/applications/extension/ext1");
  });
});
