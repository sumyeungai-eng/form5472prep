import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import "./globals.css";

// Absolute URLs for social cards. Set NEXT_PUBLIC_SITE_URL at build time to the
// deployed origin (e.g. https://example.com); the fallback keeps builds working
// anywhere without configuration.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hktax.example.com";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "HK Tax Assistant 香港報稅助手",
  description:
    "香港個人稅務教育及估算工具，支援繁體中文及英文。A bilingual educational Hong Kong personal tax assistant.",
  openGraph: {
    title: "HK Tax Assistant 香港報稅助手",
    description:
      "輕鬆整理薪俸稅、物業稅、利得稅及個人入息課稅。Calculate Hong Kong taxes with a bilingual assistant.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HK Tax Assistant 香港報稅助手"
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-Hant-HK" className={inter.variable}>
      <body>
        <I18nProvider>
          <DisclaimerBanner />
          <Header />
          <main>{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
