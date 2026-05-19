import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: "Form5472 Prep — File IRS Form 5472 and pro forma 1120 in 15 minutes",
    template: "%s · Form5472 Prep",
  },
  description:
    "Self-service IRS Form 5472 and pro forma Form 1120 filing for foreign-owned US single-member LLCs. Generated, signed, and faxed to the IRS Ogden PIN Unit. $169 plus a flat $29 IRS fax delivery. 100% money-back guarantee.",
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
      "For foreign-owned US LLCs. We prepare, you sign, we fax to the IRS Ogden PIN Unit. $169 plus a flat $29 IRS fax delivery. 100% money-back guarantee.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "File IRS Form 5472 and pro forma 1120 in 15 minutes",
    description:
      "Self-service filing for foreign-owned US LLCs. $169 plus a flat $29 IRS fax delivery. 100% money-back guarantee.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  category: "Tax services",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
