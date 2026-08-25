import { z } from "zod";
import { fail, withAdminAuth } from "@/lib/admin/api";
import { prisma } from "@/lib/prisma";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const kindSchema = z.enum(["generated", "signed", "faxed"]).default("generated");

export const GET = withAdminAuth(async (req, { params }) => {
  const url = new URL(req.url);
  const parsed = kindSchema.safeParse(url.searchParams.get("kind") ?? undefined);
  if (!parsed.success) {
    return fail(
      400,
      "invalid_request",
      "kind must be generated, signed, or faxed",
    );
  }

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: {
      generatedPdfKey: true,
      signedPdfKey: true,
      faxedPdfKey: true,
    },
  });
  if (!filing) {
    return fail(404, "not_found", "Filing not found");
  }

  const kind = parsed.data;
  const key = kind === "generated"
    ? filing.generatedPdfKey
    : kind === "signed"
      ? filing.signedPdfKey
      : filing.faxedPdfKey;
  if (!key) {
    return fail(
      404,
      "pdf_not_found",
      `No ${kind} PDF on file for this filing`,
    );
  }

  const bytes = await getPdf(key);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${params.id}-${kind}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
});
