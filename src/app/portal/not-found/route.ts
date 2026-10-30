import { portalPage } from "@/lib/partner/portalPage";

// Every path on the partner portal domain except invite/intake/sign lands
// here via the host rewrite in next.config.mjs.
export function GET() {
  return portalPage(
    "Page not found",
    "This page doesn't exist. If you were sent a link to complete or sign a filing, open that link again.",
    404,
  );
}
