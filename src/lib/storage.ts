import fs from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

// Storage adapter. Uses Cloudflare R2 when all four R2_* env vars are set;
// otherwise falls back to ./tmp-pdfs/ on local disk. Same interface either way.

const LOCAL_ROOT = path.join(process.cwd(), "tmp-pdfs");

function r2Enabled(): boolean {
  return !!(env.r2.accountId && env.r2.accessKeyId && env.r2.secretAccessKey);
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2.accessKeyId!,
      secretAccessKey: env.r2.secretAccessKey!,
    },
  });
  return _client;
}

export function makeKey(parts: string): string {
  return parts
    .replace(/[^a-zA-Z0-9._/-]/g, "_")
    // Collapse ".." and strip leading slashes so a user-controlled filename
    // can't traverse out of the intended directory in local-disk mode.
    .replace(/\.{2,}/g, "_")
    .replace(/^\/+/, "");
}

export async function put(key: string, bytes: Uint8Array, contentType = "application/pdf"): Promise<string> {
  if (r2Enabled()) {
    await client().send(
      new PutObjectCommand({
        Bucket: env.r2.bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );
    return key;
  }
  await fs.mkdir(LOCAL_ROOT, { recursive: true });
  const filePath = path.join(LOCAL_ROOT, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, bytes);
  return key;
}

export async function get(key: string): Promise<Uint8Array> {
  if (r2Enabled()) {
    const res = await client().send(new GetObjectCommand({ Bucket: env.r2.bucket, Key: key }));
    const buf = await res.Body!.transformToByteArray();
    return buf;
  }
  return fs.readFile(path.join(LOCAL_ROOT, key));
}

export async function exists(key: string): Promise<boolean> {
  if (r2Enabled()) {
    try {
      await client().send(new HeadObjectCommand({ Bucket: env.r2.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
  try {
    await fs.access(path.join(LOCAL_ROOT, key));
    return true;
  } catch {
    return false;
  }
}

// Get a URL that Telnyx can fetch the signed PDF from.
// In R2 mode this is a pre-signed S3 URL (15 min expiry).
// In local mode it's the in-app route — only works for sandbox/test.
export async function publicUrl(key: string, opts?: { expiresInSeconds?: number }): Promise<string> {
  if (r2Enabled()) {
    if (env.r2.publicBaseUrl) return `${env.r2.publicBaseUrl}/${key}`;
    return getSignedUrl(
      client(),
      new GetObjectCommand({ Bucket: env.r2.bucket, Key: key }),
      { expiresIn: opts?.expiresInSeconds ?? 900 },
    );
  }
  // Local mode has no public URL. Telnyx live mode requires R2 — set the
  // R2_* env vars to enable.
  throw new Error(
    "publicUrl() is only available in R2 mode. Set R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY.",
  );
}

// Back-compat aliases used by earlier code.
export const putPdf = (key: string, bytes: Uint8Array) => put(key, bytes, "application/pdf");
export const getPdf = (key: string) => get(key);
