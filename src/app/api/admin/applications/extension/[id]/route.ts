import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { appendNote, auditLine, EXTENSION_FORM_FIELDS, extensionFaxInFlight } from "@/lib/fax/extension";
import { isExtensionStatus } from "@/lib/form7004";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Order details staff may correct after payment (customers can pay with
// missing or wrong data — never block payment). Max lengths only.
const TEXT_FIELDS = {
  llcName: 200,
  ein: 20,
  llcStreet: 200,
  llcCity: 100,
  llcState: 50,
  llcZip: 20,
  fullName: 200,
} as const;
type TextField = keyof typeof TEXT_FIELDS;
type DetailValue = string | number | null;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { status, adminNotes } = body as { status?: unknown; adminNotes?: unknown };
  if (status !== undefined && !isExtensionStatus(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (adminNotes !== undefined && typeof adminNotes !== "string") {
    return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
  }

  const details = parseDetails(body as Record<string, unknown>);
  if ("error" in details) return NextResponse.json({ error: details.error }, { status: 400 });

  const data: Record<string, unknown> = {
    ...(status ? { status } : {}),
    ...(adminNotes !== undefined ? { adminNotes: adminNotes.trim().slice(0, 5000) || null } : {}),
  };

  // Idle-fax snapshot a printed-field edit is conditioned on (see below).
  let printedEditFrom: { faxJobId: string | null; faxStatus: string | null; status: string } | null = null;
  if (Object.keys(details.values).length > 0) {
    const current = await prisma.extensionApplication.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const changes = Object.entries(details.values).filter(
      ([key, value]) => (current as Record<string, unknown>)[key] !== value,
    );
    const formChanged = changes.some(([key]) => (EXTENSION_FORM_FIELDS as readonly string[]).includes(key));
    if (formChanged && extensionFaxInFlight(current)) {
      return NextResponse.json(
        { error: "A Form 7004 fax for this order is in flight. Wait for its outcome before changing what is printed on the form." },
        { status: 409 },
      );
    }
    if (changes.length > 0) {
      Object.assign(data, Object.fromEntries(changes));
      // A stale form must never be faxed: any change to a printed field clears it.
      if (formChanged) {
        Object.assign(data, { generatedPdfKey: null, generatedAt: null });
        printedEditFrom = current;
      }
      const summary = changes.map(([key, value]) => `${key}: "${(current as Record<string, unknown>)[key] ?? ""}" → "${value ?? ""}"`).join("; ");
      const base = adminNotes !== undefined ? adminNotes.trim() : current.adminNotes;
      data.adminNotes = appendNote(
        base,
        auditLine(new Date(), `Order details edited by admin — ${summary}${formChanged ? " (generated Form 7004 cleared)" : ""}`),
      );
    }
  }

  if (printedEditFrom) {
    // A printed field changes: commit only if no send claimed the order (and no
    // fax job moved) since the idle snapshot checked above.
    const saved = await prisma.extensionApplication.updateMany({
      where: { id: params.id, faxJobId: printedEditFrom.faxJobId, faxStatus: printedEditFrom.faxStatus },
      data,
    });
    if (saved.count !== 1) {
      return NextResponse.json(
        { error: "A Form 7004 fax started while you were saving. Nothing was changed — refresh and check the order before editing it." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, status: (data.status as string | undefined) ?? printedEditFrom.status });
  }

  const app = await prisma.extensionApplication.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, status: app.status });
}

function parseDetails(body: Record<string, unknown>): { values: Record<string, DetailValue> } | { error: string } {
  const values: Record<string, DetailValue> = {};
  for (const key of Object.keys(TEXT_FIELDS) as TextField[]) {
    const raw = body[key];
    if (raw === undefined) continue;
    if (raw !== null && typeof raw !== "string") return { error: `Invalid ${key}` };
    const value = (raw ?? "").replace(/\s+/g, " ").trim();
    if (value.length > TEXT_FIELDS[key]) return { error: `${key} is too long` };
    values[key] = key === "fullName" ? value : value || null;
  }
  if (body.email !== undefined) {
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email" };
    values.email = email;
  }
  if (body.taxYear !== undefined) {
    const year = body.taxYear === null || body.taxYear === "" ? null : Number(body.taxYear);
    const maxYear = new Date().getUTCFullYear() + 1;
    if (year !== null && (!Number.isInteger(year) || year < 2000 || year > maxYear)) return { error: "Invalid tax year" };
    values.taxYear = year;
  }
  return { values };
}
