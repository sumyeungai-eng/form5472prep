import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  apnsConfigured,
  buildApnsJWT,
  buildApsPayload,
} from "./apns";

const APNS_ENV_KEYS = [
  "APNS_KEY_ID",
  "APNS_TEAM_ID",
  "APNS_P8",
  "APNS_BUNDLE_ID",
] as const;

const originalEnv = Object.fromEntries(
  APNS_ENV_KEYS.map((key) => [key, process.env[key]]),
);

afterEach(() => {
  for (const key of APNS_ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("buildApnsJWT", () => {
  it("creates a verifiable ES256 provider token", () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "P-256",
    });
    process.env.APNS_KEY_ID = "KEY123";
    process.env.APNS_TEAM_ID = "TEAM456";
    process.env.APNS_P8 = privateKey
      .export({ format: "pem", type: "pkcs8" })
      .toString()
      .replace(/\n/g, "\\n");

    const now = 1_785_000_000;
    const jwt = buildApnsJWT(now);
    const segments = jwt.split(".");

    expect(segments).toHaveLength(3);
    expect(
      JSON.parse(Buffer.from(segments[0], "base64url").toString("utf8")),
    ).toEqual({ alg: "ES256", kid: "KEY123" });
    expect(
      JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8")),
    ).toEqual({ iss: "TEAM456", iat: now });
    expect(
      crypto.verify(
        null,
        Buffer.from(`${segments[0]}.${segments[1]}`),
        { key: publicKey, dsaEncoding: "ieee-p1363" },
        Buffer.from(segments[2], "base64url"),
      ),
    ).toBe(true);
  });
});

describe("buildApsPayload", () => {
  it("places alert fields under aps and merges custom payload at the top level", () => {
    expect(
      buildApsPayload({
        title: "Fax delivered",
        body: "Acme LLC was delivered",
        threadId: "filing_123",
        payload: { filingId: "filing_123", attempts: 2 },
      }),
    ).toEqual({
      aps: {
        alert: {
          title: "Fax delivered",
          body: "Acme LLC was delivered",
        },
        sound: "default",
        "thread-id": "filing_123",
      },
      filingId: "filing_123",
      attempts: 2,
    });
  });
});

describe("apnsConfigured", () => {
  it.each(APNS_ENV_KEYS)("is false when %s is missing", (missingKey) => {
    for (const key of APNS_ENV_KEYS) process.env[key] = `${key}-value`;
    delete process.env[missingKey];

    expect(apnsConfigured()).toBe(false);
  });
});
