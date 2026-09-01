import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import {
  sendNewApplicationMessageAdminEmail,
  sendNewApplicationMessageCustomerEmail,
} from "@/lib/email";
import { env } from "@/lib/env";
import { makeMagicLink } from "@/lib/magicLink";
import { prisma } from "@/lib/prisma";
import { getOwnedEinApplication, getOwnedItinApplication } from "@/lib/session";
import { makeKey, put } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BODY_LEN = 5000;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

type ApplicationType = "ein" | "itin";

type MessageAttachment = {
  key: string;
  name: string;
  type: string;
};

type ApplicationRecord = {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  llcName?: string;
  status: string;
};

async function resolveCaller(
  type: ApplicationType,
  id: string,
  requestedAs: "admin" | "customer" | null,
): Promise<
  | { role: "admin"; application: ApplicationRecord }
  | { role: "customer"; application: ApplicationRecord }
  | { role: "denied" }
> {
  const tryAdmin = requestedAs === null || requestedAs === "admin";
  const tryCustomer = requestedAs === null || requestedAs === "customer";

  if (tryAdmin && (await isAdmin())) {
    const application = await findApplication(type, id);
    if (!application) return { role: "denied" };
    return { role: "admin", application };
  }
  if (tryCustomer) {
    const owned =
      type === "ein"
        ? await getOwnedEinApplication(id)
        : await getOwnedItinApplication(id);
    if (!owned) return { role: "denied" };
    return { role: "customer", application: owned };
  }
  return { role: "denied" };
}

async function findApplication(type: ApplicationType, id: string): Promise<ApplicationRecord | null> {
  if (type === "ein") {
    const application = await prisma.einApplication.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        llcName: true,
        status: true,
      },
    });
    return application;
  }

  const application = await prisma.itinApplication.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      fullName: true,
      email: true,
      status: true,
    },
  });
  return application;
}

function parseType(value: string): ApplicationType | null {
  return value === "ein" || value === "itin" ? value : null;
}

function parseAs(req: Request): "admin" | "customer" | null {
  const v = new URL(req.url).searchParams.get("as");
  return v === "admin" || v === "customer" ? v : null;
}

function messageWhere(type: ApplicationType, id: string) {
  return type === "ein" ? { einApplicationId: id } : { itinApplicationId: id };
}

function messageLink(type: ApplicationType, id: string) {
  return type === "ein" ? { einApplicationId: id } : { itinApplicationId: id };
}

function applicationKind(type: ApplicationType): "EIN" | "ITIN" {
  return type === "ein" ? "EIN" : "ITIN";
}

function subjectLabel(type: ApplicationType, application: ApplicationRecord): string {
  return type === "ein" ? application.llcName ?? application.fullName : application.fullName;
}

function normalizeAttachmentName(value: unknown): string {
  const name = typeof value === "string" ? value.trim().slice(0, 200) : "";
  return name || "file";
}

function stripDataUrlPrefix(value: string): string {
  const marker = ";base64,";
  if (!value.startsWith("data:")) return value;
  const markerIndex = value.indexOf(marker);
  return markerIndex === -1 ? value : value.slice(markerIndex + marker.length);
}

function detectAttachmentType(bytes: Buffer): string | null {
  if (bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) return "application/pdf";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return null;
}

async function storeAttachment(
  type: ApplicationType,
  id: string,
  rawBase64: string,
  rawName: unknown,
): Promise<MessageAttachment | NextResponse> {
  const name = normalizeAttachmentName(rawName);
  const bytes = Buffer.from(stripDataUrlPrefix(rawBase64.trim()), "base64");
  if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
    return NextResponse.json({ error: "Attachment too large (max 10MB)" }, { status: 400 });
  }
  const attachmentType = detectAttachmentType(bytes);
  if (!attachmentType) {
    return NextResponse.json({ error: "Only PDF, PNG or JPG attachments are accepted." }, { status: 400 });
  }

  const key = await put(makeKey(["chat", type, id, `${Date.now()}_${name}`]), bytes, attachmentType);
  return { key, name, type: attachmentType };
}

export async function GET(req: Request, { params }: { params: { type: string; id: string } }) {
  const type = parseType(params.type);
  if (!type) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const caller = await resolveCaller(type, params.id, parseAs(req));
  if (caller.role === "denied") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: messageWhere(type, params.id),
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fromAdmin: true,
      body: true,
      attachmentKey: true,
      attachmentName: true,
      attachmentType: true,
      readAt: true,
      createdAt: true,
    },
  });

  const otherDirection = caller.role === "admin" ? false : true;
  const unreadIds = messages.filter((m) => m.fromAdmin === otherDirection && m.readAt === null).map((m) => m.id);
  if (unreadIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { readAt: new Date() },
    });
    for (const m of messages) if (unreadIds.includes(m.id)) m.readAt = new Date();
  }

  return NextResponse.json({ messages, role: caller.role });
}

export async function POST(req: Request, { params }: { params: { type: string; id: string } }) {
  const type = parseType(params.type);
  if (!type) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const caller = await resolveCaller(type, params.id, parseAs(req));
  if (caller.role === "denied") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { body: rawBody, attachmentBase64, attachmentName } = (await req.json().catch(() => ({}))) as {
    body?: unknown;
    attachmentBase64?: unknown;
    attachmentName?: unknown;
  };
  const body = typeof rawBody === "string" ? rawBody.trim() : "";
  const hasAttachment = typeof attachmentBase64 === "string" && attachmentBase64.trim().length > 0;
  if (!body && !hasAttachment) return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  if (body.length > MAX_BODY_LEN) {
    return NextResponse.json({ error: `Message too long (max ${MAX_BODY_LEN} characters)` }, { status: 400 });
  }

  const attachmentResult = hasAttachment ? await storeAttachment(type, params.id, attachmentBase64, attachmentName) : undefined;
  if (attachmentResult instanceof NextResponse) return attachmentResult;
  const attachment = attachmentResult;

  const priorUnreadFromSender = await prisma.message.count({
    where: { ...messageWhere(type, params.id), fromAdmin: caller.role === "admin", readAt: null },
  });

  const message = await prisma.message.create({
    data: {
      ...messageLink(type, params.id),
      fromAdmin: caller.role === "admin",
      body,
      attachmentKey: attachment?.key,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
    },
    select: {
      id: true,
      fromAdmin: true,
      body: true,
      attachmentKey: true,
      attachmentName: true,
      attachmentType: true,
      readAt: true,
      createdAt: true,
    },
  });

  if (priorUnreadFromSender === 0) {
    const bodyExcerpt = body.length > 500 ? body.slice(0, 500) + "..." : body;
    const kind = applicationKind(type);
    const label = subjectLabel(type, caller.application);
    try {
      if (caller.role === "admin") {
        if (caller.application.userId) {
          await sendNewApplicationMessageCustomerEmail({
            email: caller.application.email,
            recipientName: caller.application.fullName,
            kind,
            subjectLabel: label,
            bodyExcerpt,
            portalLink: makeMagicLink(caller.application.userId),
          });
        }
      } else {
        await sendNewApplicationMessageAdminEmail({
          adminEmail: env.supportEmail,
          customerEmail: caller.application.email,
          kind,
          subjectLabel: label,
          applicationId: caller.application.id,
          adminUrl: `${env.appUrl}/admin/applications/${type}/${caller.application.id}`,
          bodyExcerpt,
        });
      }
    } catch (err) {
      console.error("[application messages POST] notification email failed", err);
    }
  }

  return NextResponse.json({ message });
}
