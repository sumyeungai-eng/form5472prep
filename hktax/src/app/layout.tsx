import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HK Tax Assistant 香港報稅助手",
  description:
    "香港個人稅務教育及估算工具，支援繁體中文及英文。A bilingual educational Hong Kong personal tax assistant.",
  openGraph: {
    title: "HK Tax Assistant 香港報稅助手",
    description:
      "輕鬆整理薪俸稅、物業稅、利得稅及個人入息課稅。Calculate Hong Kong taxes with a bilingual assistant.",
    images: [
      {
        url: "/images/og-image.png",
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
    <html lang="zh-Hant-HK">
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
