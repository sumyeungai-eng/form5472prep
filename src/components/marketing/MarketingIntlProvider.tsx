"use client";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
export function MarketingIntlProvider({ locale, messages, children }: { locale: string; messages: AbstractIntlMessages; children: React.ReactNode }) {
  return <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC" now={new Date(0)} onError={() => {}}>{children}</NextIntlClientProvider>;
}
