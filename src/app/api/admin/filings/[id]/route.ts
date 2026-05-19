import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { tierForYearCount } from "@/lib/pricing";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { submitFax } from "@/lib/fax";
import { publicUrl } from "@/lib/storage";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set([
  "DRAFT",
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
]);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as string | undefined;
  if (!action) return NextResponse.json({ error: "missing action" }, { status: 400 });

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  switch (action) {
    case "setStatus": {
      const next = String(body?.status ?? "").toUpperCase();
      if (!VALID_STATUSES.has(next)) {
        return NextResponse.json({ error: "invalid status" }, { status: 400 });
      }
      // Cast to satisfy Prisma's enum type. We validated against the same set.
      await prisma.filing.update({
        where: { id: filing.id },
        data: { status: next as never },
      });
      return NextResponse.json({ ok: true });
    }

    case "resendOrderConfirmation": {
      if (!filing.user) return NextResponse.json({ error: "no customer email" }, { status: 400 });
      await sendOrderConfirmationEmail({
        email: filing.user.email,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        tier: tierForYearCount(filing.taxYears.length),
        amountPaidCents: filing.amountPaid,
        portalLink: makeMagicLink(filing.user.id),
        receiptUrl: null,
      });
      return NextResponse.json({ ok: true });
    }

    case "resendMagicLink": {
      if (!filing.user) return NextResponse.json({ error: "no customer email" }, { status: 400 });
      const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
      await sendMagicLinkEmail(filing.user.email, makeMagicLink(filing.user.id), label);
      return NextResponse.json({ ok: true });
    }

    case "retryFax": {
      if (!filing.signedPdfKey) {
        return NextResponse.json({ error: "no signed PDF on file" }, { status: 400 });
      }
      const mediaUrl = await publicUrl(filing.signedPdfKey);
      const job = await submitFax({ mediaUrl, to: env.telnyx.destination });
      await prisma.filing.update({
        where: { id: filing.id },
        data: { faxJobId: job.id, faxStatus: "queued", status: "FAXED" },
      });
      return NextResponse.json({ ok: true, faxJobId: job.id });
    }

    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
}
