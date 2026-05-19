import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitFax } from "@/lib/fax";
import { publicUrl } from "@/lib/storage";
import { env } from "@/lib/env";
import { sendFaxDeliveredEmail, sendFaxFailedEmail } from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Telnyx fax webhook. Configure your fax connection's webhook URL to
// {NEXT_PUBLIC_APP_URL}/api/telnyx-webhook. Events we care about:
//   fax.delivered, fax.failed, fax.sending.failed, fax.delivery.delayed
//
// Telnyx signs webhooks; in production you should verify the signature
// (telnyx-signature-ed25519-signature, telnyx-signature-ed25519-timestamp,
// against the public key from the Telnyx portal). Skipped in this scaffold.

const MAX_RETRIES = 3;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const evt = body?.data?.event_type as string | undefined;
  const faxId = body?.data?.payload?.fax_id as string | undefined;
  if (!faxId) return NextResponse.json({ ok: true });

  const filing = await prisma.filing.findFirst({
    where: { faxJobId: faxId },
    include: { user: true },
  });
  if (!filing) return NextResponse.json({ ok: true });

  if (evt === "fax.delivered") {
    await prisma.filing.update({
      where: { id: filing.id },
      data: { faxStatus: "delivered", status: "CONFIRMED" },
    });
    if (filing.user) {
      try {
        await sendFaxDeliveredEmail({
          email: filing.user.email,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
        });
      } catch (err) {
        console.error("[telnyx-webhook] fax delivered email failed", err);
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (evt === "fax.failed" || evt === "fax.sending.failed") {
    const retryCount = Number(body?.data?.payload?.delivery_attempts ?? 0);
    if (retryCount < MAX_RETRIES && filing.signedPdfKey) {
      // Re-submit with a fresh job; persist the new id.
      const mediaUrl = await publicUrl(filing.signedPdfKey);
      const retry = await submitFax({ mediaUrl, to: env.telnyx.destination });
      await prisma.filing.update({
        where: { id: filing.id },
        data: { faxJobId: retry.id, faxStatus: `retry_${retryCount + 1}` },
      });
      return NextResponse.json({ ok: true, retried: true });
    }
    await prisma.filing.update({
      where: { id: filing.id },
      data: { faxStatus: "failed", status: "FAILED" },
    });
    if (filing.user) {
      try {
        await sendFaxFailedEmail({
          email: filing.user.email,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
        });
      } catch (err) {
        console.error("[telnyx-webhook] fax failed email failed", err);
      }
    }
    return NextResponse.json({ ok: true, gaveUp: true });
  }

  // Other event types — just record latest status.
  if (evt) {
    await prisma.filing.update({
      where: { id: filing.id },
      data: { faxStatus: evt.replace(/^fax\./, "") },
    });
  }
  return NextResponse.json({ ok: true });
}
