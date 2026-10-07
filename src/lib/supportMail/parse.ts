// Pure helpers for the support@ mailbox sync: read the "[Website question]"
// notification we send ourselves (sendWebsiteQuestionAdminEmail), and turn
// an email reply into just the newly written text.

export const QUESTION_SUBJECT_TAG = "[Website question]";

export type ParsedQuestionNotification = {
  name: string | null;
  email: string;
  topic: string | null;
  pageUrl: string | null;
  message: string;
  // /admin/questions/<id> link, present on notifications sent after the
  // Questions page shipped (2026-10-07).
  questionId: string | null;
};

const EMAIL_RE = /^[^\s@,;<>()]+@[^\s@,;<>()]+\.[a-z]{2,}$/i;

function field(text: string, label: string): string | null {
  const m = text.match(new RegExp(`^${label}:[ \\t]*(.*)$`, "mi"));
  const value = m?.[1]?.trim();
  return value ? value : null;
}

// Format (stable since 2026-06-06, a21f1db / b4d4fad):
//   New question from the website
//   Name: X | (not provided)
//   Email: x@y.z
//   Topic: … (optional)   Page: … (optional)
//   Message:
//   <message, may be multi-line>
//   Reply directly to this email to answer the visitor.
//   Or answer it in admin: https://…/admin/questions/<id>   (optional)
export function parseQuestionNotification(
  text: string,
  fallbackEmail?: string | null,
): ParsedQuestionNotification | null {
  const normalized = text.replace(/\r\n?/g, "\n");
  const rawName = field(normalized, "Name");
  const email = (field(normalized, "Email") ?? fallbackEmail ?? "").trim();
  if (!EMAIL_RE.test(email)) return null;

  const start = normalized.search(/^Message:[ \t]*$/m);
  if (start < 0) return null;
  const afterLabel = normalized.slice(start).replace(/^Message:[ \t]*\n/, "");
  const end = afterLabel.search(/^Reply directly to this email/m);
  const message = (end >= 0 ? afterLabel.slice(0, end) : afterLabel).trim();
  if (!message) return null;

  const link = normalized.match(/\/admin\/questions\/([a-z0-9]{10,40})\b/i);
  return {
    name: rawName && rawName !== "(not provided)" ? rawName : null,
    email,
    topic: field(normalized, "Topic"),
    pageUrl: field(normalized, "Page"),
    message,
    questionId: link?.[1] ?? null,
  };
}

// Lines that start the quoted original in common clients: Gmail/Apple
// ("On … wrote:"), Roundcube/Hostinger webmail ("On 2026-10-05 10:00, X
// wrote:"), Outlook ("-----Original Message-----" / "From: …" header block).
const QUOTE_HEADER_RES = [
  /^On .{0,300}wrote:\s*$/im,
  /^-{2,}\s*Original Message\s*-{2,}\s*$/im,
  /^_{10,}\s*$/m,
  /^From:\s.+\n(?:.*\n){0,3}?(?:Sent|Date):\s.+$/im,
];

export function stripQuotedReply(text: string): string {
  let body = text.replace(/\r\n?/g, "\n");
  let cut = body.length;
  for (const re of QUOTE_HEADER_RES) {
    const m = re.exec(body);
    if (m && m.index < cut) cut = m.index;
  }
  body = body.slice(0, cut);
  // Drop any remaining "> quoted" lines and trailing blank lines.
  body = body
    .split("\n")
    .filter((line) => !/^\s*>/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return body || text.trim();
}

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    // Quoted originals in HTML replies.
    .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeEmail(address: string | null | undefined): string {
  return (address ?? "").trim().toLowerCase();
}
