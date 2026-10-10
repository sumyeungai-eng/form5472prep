import type { Metadata } from "next";
import { Inter, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import { env } from "@/lib/env";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ChatWidget } from "@/components/ChatWidget";
import { MetaPixel } from "@/components/MetaPixel";
import { VisitPing } from "@/components/VisitPing";
import { GOOGLE_ADS_TAG_ID } from "@/lib/analytics/googleAds";
import { EXPRESS_TURNAROUND, STANDARD_TURNAROUND, TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Display serif — institutional, financial-report gravitas for headlines.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
});

// "Artifact" monospace — echoes the actual IRS documents/fax receipts. Used for
// prices, fax numbers, timestamps, EINs, and eyebrow labels so the marketing UI
// visually references the real proof-of-filing document customers receive.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: "Form5472 Prep — File IRS Form 5472 and pro forma 1120 in 15 minutes",
    template: "%s · Form5472 Prep",
  },
  // <= 160 chars: inherited by any page that sets no description of its own
  // (e.g. /partner/sign-in rendered this at 279 chars in the 2026-10-01 crawl).
  description: `Form 5472 + pro forma 1120 filing for foreign-owned US LLCs. We prepare, you sign, we fax it to the IRS. From ${formatPrice(TIERS.standard.priceCents)}; money-back guarantee if we fail to submit.`,
  applicationName: "Form5472 Prep",
  authors: [{ name: "Form5472 Prep" }],
  creator: "Form5472 Prep",
  publisher: "Form5472 Prep",
  // No root canonical: a layout-level `canonical: "/"` is inherited by every
  // page that sets no `alternates`, silently canonicalising it to the homepage
  // (crawl 2026-10-01: /partner/sign-in). Indexable pages set their own
  // self-canonical via pageMeta() in src/lib/seo.ts.
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    url: env.appUrl,
    siteName: "Form5472 Prep",
    title: "File IRS Form 5472 and pro forma 1120 in 15 minutes — Form5472 Prep",
    description: `For foreign-owned US LLCs. We prepare, you sign, we fax to the IRS Ogden PIN Unit. From ${formatPrice(TIERS.standard.priceCents)} in ${STANDARD_TURNAROUND}, or ${formatPrice(TIERS.express.priceCents)} for express within ${EXPRESS_TURNAROUND} — fax delivery included on both. 100% money-back guarantee if we fail to submit.`,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "File IRS Form 5472 and pro forma 1120 in 15 minutes",
    description: `Done-for-you Form 5472 filing for foreign-owned US LLCs. From ${formatPrice(TIERS.standard.priceCents)}, or ${formatPrice(TIERS.express.priceCents)} for express filing within ${EXPRESS_TURNAROUND} — IRS fax delivery included on both.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  category: "Tax services",
  // Search-engine ownership verification. Set the codes in Vercel env so
  // each tool's verifier finds its own meta tag on first crawl. Optional —
  // search engines also accept other verification methods (HTML file upload,
  // DNS TXT record). Meta tag is the simplest because it just needs an env.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  // Favicon set. Next.js App Router auto-links files dropped at
  // src/app/icon.svg, src/app/apple-icon.png, and src/app/favicon.ico via
  // the file conventions — so the only icons that need explicit metadata
  // entries here are the legacy 16/32 PNG sizes (some old browsers + the
  // Google search-result icon crawler prefer explicit sizes) and the PWA
  // manifest. The Android 192/512 icons are referenced from the manifest.
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen bg-white text-slate-900 font-sans antialiased">
        {/* Warm the connection to the tag host ahead of the deferred loader. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* Google Ads conversion tag. The external gtag.js loads lazily (on idle,
            after the page is interactive) to keep it off the critical path and
            out of Total Blocking Time — conversion events queue in `dataLayer`
            via the inline init below and flush once the script loads, so nothing
            is lost. The conversion event itself is dispatched from
            src/lib/analytics/googleAds.ts. */}
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            // Embeddable tools run inside third-party pages: no ad tag there.
            if (!location.pathname.startsWith('/embed/')) gtag('config', '${GOOGLE_ADS_TAG_ID}');
          `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG_ID}`}
          strategy="lazyOnload"
        />
        {children}
        <MetaPixel />
        <ChatWidget />
        {/* Deliberately not behind the Meta consent gate: site-security and
            first-party analytics run under legitimate interest with short
            retention, and gating this would blind the log exactly for the
            visitors most worth logging. */}
        <VisitPing />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
