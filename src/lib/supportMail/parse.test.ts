import { describe, expect, it } from "vitest";
import { htmlToText, parseQuestionNotification, stripQuotedReply } from "./parse";

const current = [
  "New question from the website",
  "",
  "Name: Ana Lopez",
  "Email: ana@example.test",
  "Topic: Pre-sales question",
  "Page: https://www.form5472prep.com/pricing",
  "",
  "Message:",
  "Do I need to file?",
  "",
  "My LLC had no income.",
  "",
  "Reply directly to this email to answer the visitor.",
  "Or answer it in admin: https://www.form5472prep.com/admin/questions/cmabc123def456ghi",
].join("\n");

describe("parseQuestionNotification", () => {
  it("reads the current notification format, including the admin link", () => {
    expect(parseQuestionNotification(current)).toEqual({
      name: "Ana Lopez",
      email: "ana@example.test",
      topic: "Pre-sales question",
      pageUrl: "https://www.form5472prep.com/pricing",
      message: "Do I need to file?\n\nMy LLC had no income.",
      questionId: "cmabc123def456ghi",
    });
  });

  it("reads the original June format (double-spaced labels, no topic, no name)", () => {
    const june = "New question from the website\r\n\r\nName:  (not provided)\r\nEmail: li@example.test\r\nPage:  https://x.test/\r\n\r\nMessage:\r\nRefund?\r\n\r\nReply directly to this email to answer the visitor.";
    expect(parseQuestionNotification(june)).toMatchObject({
      name: null,
      email: "li@example.test",
      topic: null,
      pageUrl: "https://x.test/",
      message: "Refund?",
      questionId: null,
    });
  });

  it("falls back to the Reply-To address and rejects unusable notifications", () => {
    const noEmail = "Name: X\nEmail: \n\nMessage:\nHello\n";
    expect(parseQuestionNotification(noEmail, "x@example.test")?.email).toBe("x@example.test");
    expect(parseQuestionNotification(noEmail)).toBeNull();
    expect(parseQuestionNotification("Name: X\nEmail: x@example.test\n")).toBeNull();
    expect(parseQuestionNotification("Email: x@example.test\nMessage:\n\nReply directly to this email")).toBeNull();
  });
});

describe("stripQuotedReply", () => {
  it.each([
    ["Gmail / Apple", "Yes, you need to file.\n\nOn Mon, Oct 6, 2026 at 9:00 AM Form5472 Prep <donotreply@form5472prep.com> wrote:\n> New question"],
    ["Roundcube (Hostinger webmail)", "Yes, you need to file.\n\nOn 2026-10-06 09:00, ana@example.test wrote:\n> Do I need to file?"],
    ["Outlook", "Yes, you need to file.\n\n-----Original Message-----\nFrom: Ana\nSent: Monday\nDo I need to file?"],
    ["Outlook header block", "Yes, you need to file.\n\nFrom: Ana Lopez <ana@example.test>\nSent: Monday, October 6, 2026\nTo: support@form5472prep.com\nSubject: question"],
  ])("keeps only the new text (%s)", (_label, text) => {
    expect(stripQuotedReply(text)).toBe("Yes, you need to file.");
  });

  it("drops stray quoted lines and keeps the original when nothing is left", () => {
    expect(stripQuotedReply("Thanks!\n> old line\n>> older")).toBe("Thanks!");
    expect(stripQuotedReply("> only quoted")).toBe("> only quoted");
  });
});

describe("htmlToText", () => {
  it("converts simple HTML and drops quoted blockquotes", () => {
    expect(htmlToText("<div>Hi Ana,<br>Yes &amp; no.</div><blockquote><p>old</p></blockquote><p>Thanks</p>")).toBe(
      "Hi Ana,\nYes & no.\nThanks",
    );
  });
});
