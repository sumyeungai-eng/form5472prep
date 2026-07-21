import { createHash } from "crypto";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN ?? "";
const META_GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v25.0";
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE ?? "";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendMetaPurchase(opts: {
  email: string;
  eventId: string;
  amountCents: number;
  sourceUrl: string;
}): Promise<{ sent: boolean }> {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN || opts.amountCents <= 0) {
    return { sent: false };
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId,
        action_source: "website",
        event_source_url: opts.sourceUrl,
        user_data: { em: [sha256(opts.email)] },
        custom_data: {
          currency: "USD",
          value: opts.amountCents / 100,
        },
      },
    ],
  };
  if (META_TEST_EVENT_CODE) payload.test_event_code = META_TEST_EVENT_CODE;

  const response = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Meta Conversions API failed (${response.status}): ${message.slice(0, 300)}`);
  }
  return { sent: true };
}
