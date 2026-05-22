#!/usr/bin/env python3
"""One-off: re-submit the IRS fax for filing cmpenzypg0001ky04wz21hfr7
using the previous Telnyx job's still-valid R2 presigned URL. Avoids
needing R2 creds locally."""
import json
import os
import sys
import urllib.request

API_KEY = os.environ["TELNYX_API_KEY"]
CONN_ID = "2964262237646095877"
DEST = "+18558877737"
FROM = "+19804901874"
PRIOR_JOB = "bcd21ea7-6141-434c-b11f-82a92aadb4a1"


def telnyx(method, path, body=None):
    req = urllib.request.Request(
        f"https://api.telnyx.com/v2{path}",
        method=method,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        data=json.dumps(body).encode() if body else None,
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


prior = telnyx("GET", f"/faxes/{PRIOR_JOB}")["data"]
media_url = prior["media_url"]
print(f"reusing media_url (len={len(media_url)})", file=sys.stderr)

resp = telnyx("POST", "/faxes", {
    "connection_id": CONN_ID,
    "media_url": media_url,
    "to": DEST,
    "from": FROM,
    "quality": "high",
    "monochrome": True,
    "store_media": True,
})
print(json.dumps(resp.get("data", resp), indent=2))
