import { z } from "zod";
import { fail, ok, withAdminAuth } from "@/lib/admin/api";
import {
  getDashboardSummary,
  type DateRange,
} from "@/lib/admin/reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "12m", "all"]).default("30d"),
});

export const GET = withAdminAuth(async (req) => {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    range: url.searchParams.get("range") ?? undefined,
  });
  if (!parsed.success) {
    return fail(
      400,
      "invalid_request",
      "range must be one of 7d, 30d, 90d, 12m, or all",
    );
  }

  const summary = await getDashboardSummary(parsed.data.range as DateRange);
  return ok(summary);
});
