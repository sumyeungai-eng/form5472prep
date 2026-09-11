import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  sendEinApplicationConfirmationEmail,
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
});
