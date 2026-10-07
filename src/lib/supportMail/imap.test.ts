import { describe, expect, it } from "vitest";
import { folderKind } from "./imap";

describe("folderKind (shared by the full sync and the 10-minute probe)", () => {
  it.each([
    [{ name: "INBOX", specialUse: "\\Inbox" }, "mail"],
    [{ name: "Sent", specialUse: "\\Sent" }, "sent"],
    [{ name: "Sent Items" }, "sent"],
    [{ name: "Archive", specialUse: "\\Archive" }, "mail"],
    [{ name: "Clients" }, "mail"],
    [{ name: "Trash", specialUse: "\\Trash" }, null],
    [{ name: "Junk" }, null],
    [{ name: "Drafts" }, null],
    [{ name: "All Mail", specialUse: "\\All" }, null],
    [{ name: "INBOX", flags: new Set(["\\Noselect"]) }, null],
  ])("%o → %s", (box, kind) => {
    expect(folderKind(box)).toBe(kind);
  });
});
