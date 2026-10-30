// Bare HTML for the partner portal's own responses (404, expired link): no
// layout, scripts, icons or brand, so nothing on the portal domain names us.
export function portalPage(title: string, message: string, status: number): Response {
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="robots" content="noindex,nofollow"><title>${title}</title></head>` +
    `<body style="font-family:system-ui,-apple-system,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;color:#0f172a">` +
    `<h1 style="font-size:1.25rem">${title}</h1><p style="color:#475569;line-height:1.5">${message}</p></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}
