import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { env } from "@/lib/env";
import { Analytics } from "@vercel/analytics/react";
import { ChatWidget } from "@/components/ChatWidget";
import { GOOGLE_ADS_TAG_ID } from "@/lib/analytics/googleAds";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: "Form5472 Prep — File IRS Form 5472 and pro forma 1120 in 15 minutes",
    template: "%s · Form5472 Prep",
  },
  description:
    "Done-for-you IRS Form 5472 and pro forma Form 1120 filing for foreign-owned US single-member LLCs. We prepare, you sign, we fax to the IRS Ogden PIN Unit. Flat-rate plans from $199 — fax delivery included on every plan. 100% money-back guarantee.",
  applicationName: "Form5472 Prep",
  keywords: [
    "Form 5472",
    "IRS Form 5472",
    "pro forma 1120",
    "Form 1120",
    "foreign-owned LLC",
    "foreign-owned disregarded entity",
    "single-member LLC tax filing",
    "DIIRSP",
    "delinquent international information return",
    "$25,000 penalty",
    "IRS Ogden PIN Unit",
    "Wyoming LLC foreign owner",
    "Delaware LLC foreign owner",
    "non-resident LLC owner taxes",
  ],
  authors: [{ name: "Form5472 Prep" }],
  creator: "Form5472 Prep",
  publisher: "Form5472 Prep",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: env.appUrl,
    siteName: "Form5472 Prep",
    title: "File IRS Form 5472 and pro forma 1120 in 15 minutes — Form5472 Prep",
    description:
      "For foreign-owned US LLCs. We prepare, you sign, we fax to the IRS Ogden PIN Unit. Flat-rate plans from $199 — fax delivery included on every plan. 100% money-back guarantee.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "File IRS Form 5472 and pro forma 1120 in 15 minutes",
    description:
      "Done-for-you Form 5472 filing for foreign-owned US LLCs. Flat-rate plans from $199 — fax delivery included on every plan. 100% money-back guarantee.",
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-slate-900 font-sans antialiased">
        {/* Google Ads conversion tag (loader). Loads on every page so the
            "Form 5472 Lead" conversion can fire from the /start success
            handler without a per-page boilerplate. strategy="afterInteractive"
            keeps it out of the critical render path. The conversion event
            itself is dispatched from src/lib/analytics/googleAds.ts. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_TAG_ID}');
          `}
        </Script>
        {children}
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  );
}
