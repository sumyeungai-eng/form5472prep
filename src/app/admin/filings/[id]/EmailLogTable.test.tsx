import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EmailLogTable } from "./EmailLogTable";

describe("EmailLogTable (admin filing page › Emails card)", () => {
  it("lists each email with time, kind, recipient, subject, status and error", () => {
    const html = renderToStaticMarkup(
      <EmailLogTable
        rows={[
          {
            id: "e2",
            createdAt: new Date("2026-09-29T09:15:00.000Z"),
            kind: "fax_delivered_resend",
            to: "owner@example.test",
            subject: "Confirmation of IRS filing — Form 5472, Acme LLC, tax year 2025",
            status: "delivered",
            error: null,
            lastEventAt: new Date("2026-09-29T09:15:04.000Z"),
          },
          {
            id: "e1",
            createdAt: new Date("2026-09-20T10:04:00.000Z"),
            kind: "fax_delivered",
            to: "owner@example.test",
            subject: "Confirmation of IRS filing — Form 5472, Acme LLC, tax year 2025",
            status: "bounced",
            error: "Permanent — General — Mailbox does not exist",
            lastEventAt: null,
          },
        ]}
      />,
    );

    expect(html).toContain("2026-09-29 09:15 UTC");
    expect(html).toContain("fax_delivered_resend");
    expect(html).toContain("owner@example.test");
    expect(html).toContain("Confirmation of IRS filing");
    expect(html).toContain("delivered");
    expect(html).toContain("bounced");
    expect(html).toContain("Mailbox does not exist");
    // Rows render in the order given (page.tsx queries newest first).
    expect(html.indexOf("fax_delivered_resend")).toBeLessThan(html.indexOf(">fax_delivered<"));
  });

  it("explains an empty log and a failed query instead of rendering an empty table", () => {
    expect(renderToStaticMarkup(<EmailLogTable rows={[]} />)).toContain("No emails recorded for this filing");
    expect(renderToStaticMarkup(<EmailLogTable rows={null} />)).toContain("Could not load the email log");
  });
});
