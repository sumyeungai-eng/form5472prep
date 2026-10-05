import { afterEach, describe, expect, it } from "vitest";
import { TRUSTPILOT_AFS_BCC_DEFAULT, trustpilotInvite } from "./email";

describe("trustpilotInvite", () => {
  afterEach(() => {
    delete process.env.TRUSTPILOT_AFS_BCC;
  });

  it("BCCs the Trustpilot AFS address with a structured snippet", () => {
    const invite = trustpilotInvite({ recipientEmail: "owner@example.test", recipientName: "Ana Silva", referenceId: "filing_1" });
    expect(invite?.bcc).toBe(TRUSTPILOT_AFS_BCC_DEFAULT);
    expect(invite?.snippet).toContain('type="application/json+trustpilot"');
    const json = invite!.snippet.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(json)).toEqual({ recipientEmail: "owner@example.test", recipientName: "Ana Silva", referenceId: "filing_1" });
  });

  it("never invites white-label partner clients", () => {
    expect(trustpilotInvite({ recipientEmail: "c@example.test", brand: { name: "Demo Partner" } })).toBeNull();
  });

  it("can be switched off with an empty env var", () => {
    process.env.TRUSTPILOT_AFS_BCC = "";
    expect(trustpilotInvite({ recipientEmail: "c@example.test" })).toBeNull();
  });

  it("cannot break out of the script tag", () => {
    const invite = trustpilotInvite({ recipientEmail: "c@example.test", recipientName: "</script><b>x" });
    expect(invite!.snippet.match(/<\/script>/g)).toHaveLength(1);
  });
});
