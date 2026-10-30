import { portalPage } from "@/lib/partner/portalPage";

// Partner portal stand-in for /sign-in?invite=expired (which is our brand).
export function GET() {
  return portalPage(
    "This link has expired",
    "This link has expired or has already been used. Ask the provider who sent it to you for a new link.",
    410,
  );
}
