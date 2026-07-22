import { NextResponse } from "next/server";
import {
  getAdminPrincipal,
  type AdminPrincipal,
} from "@/lib/admin/auth";

export function ok<T>(data: T, init?: ResponseInit): Response {
  return NextResponse.json({ data }, init);
}

export function fail(status: number, code: string, message: string): Response {
  return NextResponse.json({ error: { code, message } }, { status });
}

export type AdminRouteHandler = (
  req: Request,
  ctx: { principal: AdminPrincipal; params: Record<string, string> },
) => Promise<Response>;

export function withAdminAuth(
  handler: AdminRouteHandler,
): (
  req: Request,
  ctx: { params: Record<string, string> },
) => Promise<Response> {
  return async (req, { params }) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return fail(401, "unauthorized", "Admin authentication required");
      }

      return await handler(req, { principal, params });
    } catch (err) {
      console.error("[admin/v1] handler error", err);
      return fail(500, "internal_error", "Something went wrong");
    }
  };
}
