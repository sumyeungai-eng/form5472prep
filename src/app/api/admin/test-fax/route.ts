import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { env } from "@/lib/env";
import { submitFax } from "@/lib/fax";
import { makeKey, publicUrl, putPdf } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ops check of the outbound fax line: faxes a one-page sheet with NO customer
// data to a number the admin types. Not linked to any filing, so the Telnyx
// webhook ignores its status events.
export async function POST(req: Request) {
  const admin = await getAdminPrincipal(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { to?: unknown } | null;
  const to = typeof body?.to === "string" ? body.to.replace(/[\s()-]/g, "") : "";
  if (!/^\+[1-9]\d{7,14}$/.test(to)) {
    return NextResponse.json({ error: "to must be an E.164 number, e.g. +81455222373" }, { status: 400 });
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText("Form5472 Prep - FAX TRANSMISSION TEST", { x: 72, y: 700, size: 20, font: bold });
  [`Sent: ${new Date().toUTCString()}`, `To: ${to}`, "Purpose: outbound fax line check. No customer data.", "Page 1 of 1"]
    .forEach((t, i) => page.drawText(t, { x: 72, y: 650 - i * 28, size: 14, font }));

  const key = makeKey(["ops", "test-fax", `${Date.now()}.pdf`]);
  await putPdf(key, await doc.save());
  const job = await submitFax({ mediaUrl: await publicUrl(key), to });
  return NextResponse.json({ ok: true, faxId: job.id, status: job.status });
}

// Live Telnyx status for a test fax id.
export async function GET(req: Request) {
  const admin = await getAdminPrincipal(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const res = await fetch(`https://api.telnyx.com/v2/faxes/${id}`, {
    headers: { Authorization: `Bearer ${env.telnyx.apiKey}` },
  });
  const json = (await res.json().catch(() => null)) as { data?: Record<string, unknown> } | null;
  const d = json?.data ?? {};
  return NextResponse.json({ httpStatus: res.status, status: d.status, to: d.to, page_count: d.page_count, failure_reason: d.failure_reason, updated_at: d.updated_at });
}
