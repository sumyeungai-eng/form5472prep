// Partner terms: the partner is the end client's sole point of contact. Every
// email addressed to a partner filing's client goes to the partner instead,
// or nowhere for marketing, login and self-serve link mail. Enforced once, in
// sendEmail(), so no template or new caller can leak by forgetting a check.

// Never touched: staff and partner mail, and standalone products (EIN, ITIN,
// 7004 extension, website questions) the person bought or asked for directly.
const EXEMPT_PREFIXES = ["admin_", "partner_"];
const EXEMPT_KINDS = new Set([
  "ein_application_confirmation",
  "itin_application_confirmation",
  "extension_application_confirmation",
  "application_signature_request",
  "application_message_customer",
  "website_question_reply",
]);

// Dropped rather than redirected: marketing, login links and links the client
// would have asked for themselves. Any other kind (including future ones) is
// redirected, so the default never reaches the client.
const DROP_KINDS = new Set([
  "magic_link",
  "january_reminder",
  "march_reminder",
  "abandoned_draft_reminder",
  "client_intake",
  "resume_filing",
]);

export type PartnerClientRoute = {
  action: "redirect" | "drop";
  partnerEmail: string;
  filingId: string;
  llcName: string | null;
};

export async function partnerClientRoute(
  to: string,
  log?: { kind: string; filingId?: string | null },
): Promise<PartnerClientRoute | null> {
  const kind = log?.kind ?? "other";
  if (EXEMPT_KINDS.has(kind) || EXEMPT_PREFIXES.some((p) => kind.startsWith(p))) return null;

  // Lazy, like recordEmailLog: render-only callers never load a DB client.
  const { prisma } = await import("@/lib/prisma");
  const select = { id: true, llcName: true, partner: { select: { email: true } } } as const;
  const filing = log?.filingId
    ? await prisma.filing.findUnique({ where: { id: log.filingId }, select })
    : // shortcut: a partner client stays flagged forever; add the 12-month
      // post-partnership window once Partner records an end date.
      await prisma.filing.findFirst({
        where: { partnerId: { not: null }, user: { email: { equals: to.trim(), mode: "insensitive" } } },
        orderBy: { createdAt: "desc" },
        select,
      });

  const partnerEmail = filing?.partner?.email;
  if (!filing || !partnerEmail) return null;
  // The partner bound their own address as the filing's user: already theirs.
  if (partnerEmail.trim().toLowerCase() === to.trim().toLowerCase()) return null;

  return {
    action: DROP_KINDS.has(kind) ? "drop" : "redirect",
    partnerEmail,
    filingId: filing.id,
    llcName: filing.llcName,
  };
}

// Client magic links (…/auth/<token>[?next=…]) would sign the partner in as
// their client; point them at the partner dashboard instead.
const MAGIC_LINK = /https?:\/\/[^\s"'<>]+\/auth\/[^\s"'<>?#]+(\?[^\s"'<>]*)?/g;

export function redirectForPartner(
  mail: { to: string; subject: string; html: string; text: string },
  route: PartnerClientRoute,
  appUrl: string,
  escapeHtml: (s: string) => string,
) {
  const dashboard = `${appUrl.replace(/\/$/, "")}/partner`;
  const who = route.llcName || mail.to;
  const note = `This was addressed to your client ${mail.to}. We sent it to you instead; your client received nothing.`;
  const noteHtml =
    `<div style="padding:12px 16px;margin:0 0 12px;background:#fef3c7;border:1px solid #fcd34d;` +
    `border-radius:8px;font-family:Arial,sans-serif;font-size:14px;color:#78350f">${escapeHtml(note)}</div>`;
  const html = mail.html.replace(MAGIC_LINK, dashboard);
  return {
    to: route.partnerEmail,
    subject: `[Your client: ${who}] ${mail.subject}`,
    html: /<body[^>]*>/i.test(html) ? html.replace(/<body[^>]*>/i, (m) => m + noteHtml) : noteHtml + html,
    text: `${note}\n\n${mail.text.replace(MAGIC_LINK, dashboard)}`,
  };
}
