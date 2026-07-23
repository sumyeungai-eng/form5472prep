import crypto from "node:crypto";
import http2 from "node:http2";
import { prisma } from "@/lib/prisma";

export type AdminPush = {
  title: string;
  body: string;
  threadId?: string;
  payload?: Record<string, string | number>;
};

let loggedMissingConfiguration = false;

export function apnsConfigured(): boolean {
  return [
    process.env.APNS_KEY_ID,
    process.env.APNS_TEAM_ID,
    process.env.APNS_P8,
    process.env.APNS_BUNDLE_ID,
  ].every(Boolean);
}

export function buildApnsJWT(now: number): string {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKey = process.env.APNS_P8;
  if (!keyId || !teamId || !privateKey) {
    throw new Error("APNs signing configuration is incomplete");
  }

  const header = Buffer.from(
    JSON.stringify({ alg: "ES256", kid: keyId }),
  ).toString("base64url");
  const claims = Buffer.from(
    JSON.stringify({ iss: teamId, iat: now }),
  ).toString("base64url");
  const signingInput = `${header}.${claims}`;
  const signature = crypto.sign(null, Buffer.from(signingInput), {
    key: privateKey.replace(/\\n/g, "\n"),
    dsaEncoding: "ieee-p1363",
  });

  return `${signingInput}.${signature.toString("base64url")}`;
}

export function buildApsPayload(push: AdminPush): Record<string, unknown> {
  return {
    aps: {
      alert: {
        title: push.title,
        body: push.body,
      },
      sound: "default",
      "thread-id": push.threadId,
    },
    ...push.payload,
  };
}

type ApnsResponse = {
  status: number;
  reason?: string;
};

function postToApns(
  host: string,
  deviceToken: string,
  jwt: string,
  body: string,
): Promise<ApnsResponse> {
  return new Promise((resolve, reject) => {
    const client = http2.connect(`https://${host}`);
    let settled = false;

    const finish = (
      callback: () => void,
    ) => {
      if (settled) return;
      settled = true;
      client.close();
      callback();
    };

    client.once("error", (error) => finish(() => reject(error)));

    const request = client.request({
      [http2.constants.HTTP2_HEADER_METHOD]: "POST",
      [http2.constants.HTTP2_HEADER_PATH]: `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": process.env.APNS_BUNDLE_ID!,
      "apns-push-type": "alert",
      "content-type": "application/json",
    });

    let status = 0;
    let responseBody = "";
    request.setEncoding("utf8");
    request.on("response", (headers) => {
      status = Number(headers[http2.constants.HTTP2_HEADER_STATUS] ?? 0);
    });
    request.on("data", (chunk: string) => {
      responseBody += chunk;
    });
    request.once("error", (error) => finish(() => reject(error)));
    request.once("end", () => {
      let reason: string | undefined;
      if (responseBody) {
        try {
          const parsed = JSON.parse(responseBody) as { reason?: unknown };
          if (typeof parsed.reason === "string") reason = parsed.reason;
        } catch {
          // APNs normally returns JSON errors. Keep the status if it does not.
        }
      }
      finish(() => resolve({ status, reason }));
    });
    request.end(body);
  });
}

export async function sendAdminPush(
  push: AdminPush,
): Promise<{ sent: number; skipped: boolean }> {
  if (!apnsConfigured()) {
    if (!loggedMissingConfiguration) {
      loggedMissingConfiguration = true;
      console.log("[apns] APNs is not configured; admin pushes are disabled");
    }
    return { sent: 0, skipped: true };
  }

  try {
    const now = new Date();
    const devices = await prisma.adminDeviceToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: now },
        apnsToken: { not: null },
        admin: { active: true },
      },
      select: {
        id: true,
        apnsToken: true,
        apnsEnvironment: true,
      },
    });
    const jwt = buildApnsJWT(Math.floor(now.getTime() / 1000));
    const body = JSON.stringify(buildApsPayload(push));
    let sent = 0;

    for (const device of devices) {
      if (!device.apnsToken) continue;
      try {
        const host =
          device.apnsEnvironment === "sandbox"
            ? "api.sandbox.push.apple.com"
            : "api.push.apple.com";
        const response = await postToApns(
          host,
          device.apnsToken,
          jwt,
          body,
        );

        if (response.status === 200) {
          sent += 1;
          continue;
        }

        if (response.status === 410 || response.reason === "BadDeviceToken") {
          await prisma.adminDeviceToken.update({
            where: { id: device.id },
            data: { apnsToken: null },
          });
        }
        console.error(
          `[apns] push failed for device ${device.id}: ${response.status} ${response.reason ?? "unknown"}`,
        );
      } catch (error) {
        console.error(`[apns] push failed for device ${device.id}`, error);
      }
    }

    return { sent, skipped: false };
  } catch (error) {
    console.error("[apns] unable to send admin push", error);
    return { sent: 0, skipped: false };
  }
}
