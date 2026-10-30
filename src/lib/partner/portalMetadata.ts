import type { Metadata } from "next";
import { portalOrigin } from "@/lib/partner/portalHost";

// Replaces every root-layout metadata field that names us (title template,
// description with our price, application/author/publisher, Open Graph,
// Twitter, RSS link, manifest, site verification) on partner portal pages.
// metadataBase moves to the portal origin so file-based URLs (og:image,
// icons) resolve there, where the host rewrite answers them with a 404.
export function portalMetadata(name: string): Metadata {
  const description = `Complete and sign your filing with ${name}.`;
  const origin = portalOrigin();
  return {
    ...(origin ? { metadataBase: new URL(origin) } : {}),
    title: { absolute: name },
    description,
    applicationName: name,
    authors: [{ name }],
    creator: name,
    publisher: name,
    openGraph: { type: "website", siteName: name, title: name, description },
    twitter: { card: "summary", title: name, description },
    alternates: {},
    manifest: null,
    verification: {},
    category: null,
    robots: { index: false, follow: false },
  };
}
