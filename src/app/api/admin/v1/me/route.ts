import { ok, withAdminAuth } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAdminAuth(async (_req, { principal }) => {
  return ok({
    adminId: principal.adminId,
    email: principal.email,
    via: principal.via,
  });
});
