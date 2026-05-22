import crypto from "node:crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET;
const FILING_ID = "cmpenzypg0001ky04wz21hfr7";
const BASE = "https://www.form5472prep.com";

if (!SECRET) {
  console.error("ADMIN_SESSION_SECRET missing in env");
  process.exit(1);
}

function makeSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
  const payload = `admin:${expiresAt}`;
  const sig = crypto
    .createHmac("sha256", SECRET!)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

async function main() {
  const token = makeSessionToken();
  const res = await fetch(`${BASE}/api/admin/filings/${FILING_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `form5472_admin=${token}`,
    },
    body: JSON.stringify({ action: "retryFax" }),
  });
  const text = await res.text();
  console.log("status:", res.status);
  console.log("body:", text);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
