import { buildLlmsTxt } from "@/lib/llms";

export const dynamic = "force-static";
export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET() {
  const body = await buildLlmsTxt();

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
