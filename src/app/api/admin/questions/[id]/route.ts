import { NextResponse } from "next/server";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { sendWebsiteQuestionReplyEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin actions on a stored website question (/admin/questions/[id]).
// POST  { reply }   — email the answer to the visitor and record it.
// PATCH { action }  — read / unread / answered / unanswered / archive / unarchive.

const MAX_REPLY = 10_000;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { reply?: unknown } | null;
  const reply = typeof body?.reply === "string" ? body.reply.trim() : "";
  if (!reply) return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
  if (reply.length > MAX_REPLY) return NextResponse.json({ error: "Reply is too long." }, { status: 400 });

  const question = await prisma.websiteQuestion.findUnique({ where: { id: params.id } });
  if (!question) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    await sendWebsiteQuestionReplyEmail({
      to: question.email,
      name: question.name,
      reply,
      originalMessage: question.message,
      askedAt: question.createdAt,
    });
  } catch (err) {
    console.error("[admin/questions] reply email failed", err);
    return NextResponse.json({ error: "The email could not be sent. Nothing was saved; try again." }, { status: 502 });
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.websiteQuestionReply.create({
      data: { questionId: question.id, body: reply, sentBy: principal.email ?? null },
    }),
    prisma.websiteQuestion.update({
      where: { id: question.id },
      data: { repliedAt: now, readAt: question.readAt ?? now },
    }),
  ]);
  return NextResponse.json({ ok: true });
}

const ACTIONS = {
  read: () => ({ readAt: new Date() }),
  unread: () => ({ readAt: null }),
  answered: () => ({ repliedAt: new Date() }),
  unanswered: () => ({ repliedAt: null }),
  archive: () => ({ archivedAt: new Date() }),
  unarchive: () => ({ archivedAt: null }),
} as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { action?: unknown } | null;
  const action = typeof body?.action === "string" ? body.action : "";
  if (!Object.prototype.hasOwnProperty.call(ACTIONS, action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const exists = await prisma.websiteQuestion.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  await prisma.websiteQuestion.update({
    where: { id: params.id },
    data: ACTIONS[action as keyof typeof ACTIONS](),
  });
  return NextResponse.json({ ok: true });
}
