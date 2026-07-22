import { z } from "zod";
import { fail, ok, withAdminAuth } from "@/lib/admin/api";
import {
  getPartnerPerformance,
  getRevenueSeries,
  getSourceAttribution,
  type Bucket,
  type DateRange,
} from "@/lib/admin/reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "12m", "all"]).default("30d"),
  bucket: z.enum(["day", "week", "month"]).default("day"),
});

export const GET = withAdminAuth(async (req) => {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    range: url.searchParams.get("range") ?? undefined,
    bucket: url.searchParams.get("bucket") ?? undefined,
  });
  if (!parsed.success) {
    return fail(
      400,
      "invalid_request",
      "range and bucket must use supported values",
    );
  }

  const [revenueSeries, sourceAttribution, partnerPerformance] =
    await Promise.all([
      getRevenueSeries(
        parsed.data.range as DateRange,
        parsed.data.bucket as Bucket,
      ),
      getSourceAttribution(parsed.data.range as DateRange),
      getPartnerPerformance(parsed.data.range as DateRange),
    ]);

  return ok({ revenueSeries, sourceAttribution, partnerPerformance });
});
